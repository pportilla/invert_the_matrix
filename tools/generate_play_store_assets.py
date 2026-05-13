#!/usr/bin/env python3
"""Generate Google Play store listing assets for Invert the Matrix."""

from __future__ import annotations

import base64
import json
import os
import signal
import shutil
import socket
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

import websocket
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
WEB_APP = ROOT / "web-app" / "index.html"
BRANDING_ICON = ROOT / "branding" / "play-store-icon-512.png"
OUT = ROOT / "play-store-assets"

SCREEN_SETS = [
    ("phone", 1080, 1920),
    ("tablet-7-inch", 1200, 1920),
    ("tablet-10-inch", 1600, 2560),
]

SCREENS = [
    ("01-main-menu", None, "Main menu with colorful matrix board and game modes."),
    ("02-daily-challenge", "daily", "Daily challenge tiers and leaderboard buttons."),
    ("03-gameplay", "gameplay", "A daily puzzle board with moves, timer, and pattern preview."),
    ("04-custom-level", "custom", "Custom puzzle builder with grid, state, pattern, and difficulty controls."),
]


class Chrome:
    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height
        self.tmp = Path(tempfile.mkdtemp(prefix="itm-chrome-"))
        self.port = self._free_port()
        self.proc: subprocess.Popen[str] | None = None
        self.ws: websocket.WebSocket | None = None
        self.next_id = 1
        self.session_id: str | None = None

    def __enter__(self) -> "Chrome":
        chromium = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")
        if not chromium:
            raise RuntimeError("Could not find chromium, chromium-browser, or google-chrome.")

        self.proc = subprocess.Popen(
            [
                chromium,
                "--headless=new",
                "--no-sandbox",
                "--disable-gpu",
                "--hide-scrollbars",
                "--mute-audio",
                "--remote-allow-origins=*",
                f"--remote-debugging-port={self.port}",
                f"--user-data-dir={self.tmp}",
                "about:blank",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            text=True,
            start_new_session=True,
        )
        version_url = f"http://127.0.0.1:{self.port}/json/version"
        deadline = time.time() + 15
        while time.time() < deadline:
            try:
                with urllib.request.urlopen(version_url, timeout=0.5) as response:
                    info = json.loads(response.read().decode("utf-8"))
                self.ws = websocket.create_connection(info["webSocketDebuggerUrl"], timeout=5)
                break
            except Exception:
                time.sleep(0.1)
        if not self.ws:
            raise RuntimeError("Chrome did not expose a debugging endpoint.")

        target = self.call("Target.createTarget", {"url": "about:blank"})["targetId"]
        attached = self.call("Target.attachToTarget", {"targetId": target, "flatten": True})
        self.session_id = attached["sessionId"]
        self.call("Page.enable", session=True)
        self.call("Runtime.enable", session=True)
        self.call(
            "Emulation.setDeviceMetricsOverride",
            {
                "width": self.width,
                "height": self.height,
                "deviceScaleFactor": 1,
                "mobile": True,
                "screenWidth": self.width,
                "screenHeight": self.height,
            },
            session=True,
        )
        return self

    def __exit__(self, *_: object) -> None:
        if self.proc:
            try:
                os.killpg(os.getpgid(self.proc.pid), signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(os.getpgid(self.proc.pid), signal.SIGKILL)
                except ProcessLookupError:
                    pass
                self.proc.wait(timeout=5)
        self.ws = None
        shutil.rmtree(self.tmp, ignore_errors=True)

    @staticmethod
    def _free_port() -> int:
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            return int(sock.getsockname()[1])

    def call(self, method: str, params: dict | None = None, session: bool = False) -> dict:
        if not self.ws:
            raise RuntimeError("Chrome websocket is not connected.")
        msg_id = self.next_id
        self.next_id += 1
        payload = {"id": msg_id, "method": method}
        if params is not None:
            payload["params"] = params
        if session:
            payload["sessionId"] = self.session_id
        self.ws.send(json.dumps(payload))
        while True:
            response = json.loads(self.ws.recv())
            if response.get("id") == msg_id:
                if "error" in response:
                    raise RuntimeError(f"CDP {method} failed: {response['error']}")
                return response.get("result", {})

    def evaluate(self, expression: str, await_promise: bool = False) -> dict:
        return self.call(
            "Runtime.evaluate",
            {
                "expression": expression,
                "awaitPromise": await_promise,
                "returnByValue": True,
            },
            session=True,
        )

    def navigate(self, url: str) -> None:
        self.call("Page.navigate", {"url": url}, session=True)
        self.evaluate(
            """
            new Promise(resolve => {
              if (document.readyState !== 'loading') resolve(true);
              else document.addEventListener('DOMContentLoaded', () => resolve(true), { once: true });
            })
            """,
            await_promise=True,
        )
        self.evaluate("new Promise(resolve => setTimeout(resolve, 700))", await_promise=True)

    def activate(self, screen: str | None) -> None:
        if screen is None:
            return
        actions = {
            "daily": """
                document.querySelector('[data-action="show-daily"]').click();
            """,
            "custom": """
                document.querySelector('[data-action="show-freeplay"]').click();
            """,
            "gameplay": """
                document.querySelector('[data-action="show-daily"]').click();
                setTimeout(() => {
                  document.querySelector('[data-action="start-daily"][data-daily-tier="easy"]').click();
                }, 120);
            """,
        }
        self.evaluate(actions[screen])
        self.evaluate("new Promise(resolve => setTimeout(resolve, 900))", await_promise=True)

    def screenshot(self, path: Path) -> None:
        data = self.call(
            "Page.captureScreenshot",
            {"format": "png", "fromSurface": True, "captureBeyondViewport": False},
            session=True,
        )["data"]
        path.write_bytes(base64.b64decode(data))
        convert_png(path)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    names = [
        "/usr/share/fonts/adobe-source-sans/SourceSans3-Bold.otf" if bold else "/usr/share/fonts/adobe-source-sans/SourceSans3-Regular.otf",
        "/usr/share/fonts/adobe-source-sans/SourceSansPro-Bold.otf" if bold else "/usr/share/fonts/adobe-source-sans/SourceSansPro-Regular.otf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for name in names:
        if Path(name).exists():
            return ImageFont.truetype(name, size=size)
    return ImageFont.load_default()


def convert_png(path: Path, mode: str = "RGB") -> None:
    with Image.open(path) as image:
        if image.mode != mode:
            image = image.convert(mode)
        image.save(path, "PNG", compress_level=6)


def rounded_paste(base: Image.Image, image: Image.Image, box: tuple[int, int], radius: int) -> None:
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, image.width, image.height), radius=radius, fill=255)
    base.paste(image, box, mask)


def make_icon() -> None:
    out_dir = OUT / "icon"
    out_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(BRANDING_ICON) as icon:
        icon = icon.convert("RGBA").resize((512, 512), Image.Resampling.LANCZOS)
        icon.save(out_dir / "play-store-icon-512.png", "PNG", optimize=True, compress_level=9)


def make_feature_graphic(gameplay_path: Path) -> None:
    out_dir = OUT / "feature-graphic"
    out_dir.mkdir(parents=True, exist_ok=True)
    width, height = 1024, 500
    image = Image.new("RGB", (width, height), (9, 11, 18))
    draw = ImageDraw.Draw(image)

    for y in range(height):
        r = 9 + int(9 * y / height)
        g = 11 + int(9 * y / height)
        b = 18 + int(18 * y / height)
        draw.line((0, y, width, y), fill=(r, g, b))

    for x in range(-200, width + 300, 170):
        draw.line((x, height, x + 420, 0), fill=(22, 74, 90), width=5)
        draw.line((x + 58, height, x + 478, 0), fill=(34, 74, 52), width=3)
    for x in range(0, width, 82):
        draw.line((x, 0, x, height), fill=(28, 35, 48), width=1)
    for y in range(0, height, 82):
        draw.line((0, y, width, y), fill=(28, 35, 48), width=1)

    title_font = font(82, bold=True)
    title_font_small = font(78, bold=True)
    tagline_font = font(34, bold=True)
    body_font = font(24)
    label_font = font(18, bold=True)

    draw.text((70, 86), "Invert the", fill=(255, 248, 239), font=title_font)
    draw.text((70, 166), "Matrix", fill=(255, 248, 239), font=title_font_small)
    draw.text((74, 278), "Tiny taps. Sneaky algebra.", fill=(95, 225, 170), font=tagline_font)
    draw.text((76, 332), "Every move changes the whole board.", fill=(208, 217, 229), font=body_font)

    tags = ["Daily puzzles", "Custom boards", "Actual math, allegedly"]
    tx = 78
    for tag in tags:
        bbox = draw.textbbox((0, 0), tag, font=label_font)
        tw = bbox[2] - bbox[0]
        draw.rounded_rectangle((tx, 392, tx + tw + 30, 432), radius=12, fill=(22, 29, 41), outline=(74, 88, 110), width=1)
        draw.text((tx + 15, 402), tag, fill=(255, 248, 239), font=label_font)
        tx += tw + 46

    panel = Image.new("RGB", (360, 360), (22, 29, 41))
    panel_draw = ImageDraw.Draw(panel)
    panel_draw.rounded_rectangle((0, 0, panel.width - 1, panel.height - 1), radius=48, fill=(22, 29, 41), outline=(74, 88, 110), width=3)
    with Image.open(BRANDING_ICON) as icon:
        icon = icon.convert("RGBA").resize((300, 300), Image.Resampling.LANCZOS)
        panel.paste(icon, (30, 30), icon)
    rounded_paste(image, panel, (600, 70), 48)

    image.save(out_dir / "feature-graphic-1024x500.png", "PNG", optimize=True, compress_level=9)


def make_screenshots() -> None:
    with tempfile.TemporaryDirectory(prefix="itm-web-capture-", ignore_cleanup_errors=True) as tmp:
        capture_root = Path(tmp)
        html = WEB_APP.read_text(encoding="utf-8")
        html = html.replace(
            '    <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>\n',
            "",
        )
        (capture_root / "index.html").write_text(html, encoding="utf-8")
        shutil.copy2(ROOT / "web-app" / "styles.css", capture_root / "styles.css")
        shutil.copy2(ROOT / "web-app" / "app.js", capture_root / "app.js")
        file_url = (capture_root / "index.html").as_uri()

        for device, width, height in SCREEN_SETS:
            out_dir = OUT / "screenshots" / device
            out_dir.mkdir(parents=True, exist_ok=True)
            with Chrome(width, height) as chrome:
                for name, target, _alt in SCREENS:
                    chrome.navigate(file_url)
                    chrome.activate(target)
                    chrome.screenshot(out_dir / f"{name}-{width}x{height}.png")


def write_listing_text() -> None:
    lines = [
        "# Google Play Listing Copy",
        "",
        "## Short Description",
        "",
        "A tile-tapping puzzle where linear algebra tries to look innocent.",
        "",
        "## Full Description",
        "",
        "Invert the Matrix is a colorful logic puzzle about one small tap causing a very official-looking mathematical situation.",
        "",
        "Your goal is simple: turn the board into the target state. The board disagrees. Every tile you press changes a pattern of nearby tiles, so a neat little move can become a tiny algebra argument wearing party colors.",
        "",
        "Work through a campaign of handcrafted puzzles, build custom boards, or face the daily challenge in Easy, Medium, and Hard tiers. The rules stay clean, but the consequences get delightfully suspicious.",
        "",
        "Features:",
        "",
        "- Campaign puzzles that introduce the logic step by step",
        "- Daily challenges with Easy, Medium, Hard, and Global leaderboards",
        "- Custom puzzle generator with sizes, states, patterns, locks, and gaps",
        "- Hint and undo tools for when your brain says it had another appointment",
        "- Optional math explanations for players who want to see the machinery",
        "",
        "No linear algebra degree required. If you have one, please do not intimidate the tiles.",
        "",
        "## Asset Alt Text",
        "",
        "- Feature graphic: Invert the Matrix title beside a colorful tile puzzle board.",
    ]
    for device, width, height in SCREEN_SETS:
        lines.append(f"- {device} screenshots: {width}x{height} captures of menu, daily challenge, gameplay, and custom level setup.")
    (OUT / "listing-description.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_readme() -> None:
    lines = [
        "# Play Store Assets",
        "",
        "Generated assets for the Google Play listing.",
        "",
        "Official requirements checked against Play Console Help:",
        "",
        "- App icon: 512x512 PNG.",
        "- Feature graphic: 1024x500 PNG with no alpha.",
        "- Screenshots: PNG with no alpha; phone, 7-inch tablet, and 10-inch tablet sets included.",
        "",
        "Files:",
        "",
        "- `icon/play-store-icon-512.png`",
        "- `feature-graphic/feature-graphic-1024x500.png`",
        "- `screenshots/phone/*.png`",
        "- `screenshots/tablet-7-inch/*.png`",
        "- `screenshots/tablet-10-inch/*.png`",
        "- `listing-description.md`",
        "",
        "Regenerate from the repo root with:",
        "",
        "```sh",
        "python3 tools/generate_play_store_assets.py",
        "```",
    ]
    (OUT / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    if not WEB_APP.exists():
        raise RuntimeError(f"Missing {WEB_APP}")
    if not BRANDING_ICON.exists():
        raise RuntimeError(f"Missing {BRANDING_ICON}")

    OUT.mkdir(parents=True, exist_ok=True)
    make_icon()
    make_screenshots()
    make_feature_graphic(OUT / "screenshots" / "phone" / "03-gameplay-1080x1920.png")
    write_listing_text()
    write_readme()
    print(f"Generated Play Store assets in {OUT}")


if __name__ == "__main__":
    main()
