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
from datetime import date
from pathlib import Path

import websocket
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
WEB_ROOT = ROOT / "web-app"
WEB_APP = WEB_ROOT / "index.html"
CAMPAIGN_LEVELS = WEB_ROOT / "campaign-levels.json"
BRANDING_ICON = ROOT / "branding" / "play-store-icon-512.png"
OUT = ROOT / "play-store-assets"

STORAGE_KEY = "resonance-grid-progress-v1"
CAMPAIGN_VERSION = 5

SCREEN_SETS = [
    ("phone", 1080, 1920, True),
    ("tablet-7-inch", 1080, 1920, False),
    ("tablet-10-inch", 1440, 2560, False),
]

NATIVE_PHONE_SOURCE = OUT / "source-screenshots" / "android-phone"

SCREENS = [
    {
        "name": "01-main-menu",
        "target": "main",
        "headline": "Tap tiles. Bend the board.",
        "body": "A colorful puzzle where one move changes a whole pattern.",
        "alt": "Main menu with the Invert the Matrix title and puzzle modes.",
    },
    {
        "name": "02-campaign-map",
        "target": "campaign",
        "headline": "Campaign groups, stars, unlocks.",
        "body": "Master handcrafted levels and open new regions of the matrix.",
        "alt": "Campaign group map with stars, locked groups, and level nodes.",
    },
    {
        "name": "03-gameplay-level",
        "target": "gameplay",
        "headline": "Solve levels with clean taps.",
        "body": "Every board is modular logic in motion.",
        "alt": "A campaign puzzle board with move counter, pattern card, and colorful three-state tiles.",
    },
    {
        "name": "04-completion-stars",
        "target": "completion",
        "headline": "Earn stars. Unlock achievements.",
        "body": "Clear groups or master them with perfect scores.",
        "alt": "Level complete screen with a three-star result.",
    },
    {
        "name": "05-daily-challenge",
        "target": "daily",
        "headline": "Daily puzzles in three tiers.",
        "body": "Easy, Medium, and Hard challenges keep the logic fresh.",
        "alt": "Daily challenge screen with three daily puzzle cards and leaderboard rows.",
    },
    {
        "name": "06-custom-builder",
        "target": "custom",
        "headline": "Build custom puzzles.",
        "body": "Choose states, patterns, lock icons, holes, and difficulty.",
        "alt": "Custom puzzle builder with grid size, states, pattern, difficulty, and extras.",
    },
    {
        "name": "07-playground",
        "target": "playground",
        "headline": "Create and share playground boards.",
        "body": "Puzzle codes make experiments portable.",
        "alt": "Playground editor with tools, puzzle code controls, and a custom board.",
    },
    {
        "name": "08-hints-and-patterns",
        "target": "hint",
        "headline": "Use hints when the proof fights back.",
        "body": "Undo, reset, and solver hints keep hard boards approachable.",
        "alt": "Gameplay screen showing a solver hint and highlighted affected tiles.",
    },
]

LOCALES = {
    "en-US": {
        "language": "en",
        "feature": {
            "title": "Invert the Matrix",
            "tagline": "Tiny taps. Sneaky algebra.",
            "body": "Campaign levels, daily puzzles, custom boards, and Play Games achievements.",
            "pills": ["225 levels", "Daily tiers", "Achievements"],
        },
        "screens": {},
        "listing": {
            "short": "A tile-tapping puzzle where linear algebra tries to look innocent.",
            "full": [
                "Invert the Matrix is a colorful logic puzzle about one small tap causing a very official-looking mathematical situation.",
                "Turn every tile white through campaign levels, daily challenges, custom boards, and playground experiments.",
                "Earn stars for efficient solves and unlock Play Games achievements as you clear or master campaign groups.",
            ],
        },
    },
    "es-ES": {
        "language": "es",
        "feature": {
            "title": "Invert the Matrix",
            "tagline": "Toques pequeños. Álgebra traviesa.",
            "body": "Niveles de campaña, retos diarios, tableros propios y logros de Play Games.",
            "pills": ["225 niveles", "Retos diarios", "Logros"],
        },
        "screens": {
            "Tap tiles. Bend the board.": "Toca casillas. Dobla el tablero.",
            "A colorful puzzle where one move changes a whole pattern.": "Un rompecabezas colorido donde un toque cambia todo un patrón.",
            "Campaign groups, stars, unlocks.": "Grupos de campaña, estrellas y desbloqueos.",
            "Master handcrafted levels and open new regions of the matrix.": "Domina niveles creados a mano y abre nuevas zonas de la matriz.",
            "Solve levels with clean taps.": "Resuelve niveles con toques precisos.",
            "Every board is modular logic in motion.": "Cada tablero es lógica modular en movimiento.",
            "Earn stars. Unlock achievements.": "Gana estrellas. Desbloquea logros.",
            "Clear groups or master them with perfect scores.": "Completa grupos o domínalos con puntuaciones perfectas.",
            "Daily puzzles in three tiers.": "Retos diarios en tres niveles.",
            "Easy, Medium, and Hard challenges keep the logic fresh.": "Los retos fácil, medio y difícil mantienen viva la lógica.",
            "Build custom puzzles.": "Crea rompecabezas propios.",
            "Choose states, patterns, lock icons, holes, and difficulty.": "Elige estados, patrones, candados, huecos y dificultad.",
            "Create and share playground boards.": "Crea y comparte tableros de zona de pruebas.",
            "Puzzle codes make experiments portable.": "Los códigos de rompecabezas hacen portátiles tus experimentos.",
            "Use hints when the proof fights back.": "Usa pistas cuando la prueba se resista.",
            "Undo, reset, and solver hints keep hard boards approachable.": "Deshacer, reiniciar y las pistas del solucionador ayudan con tableros difíciles.",
        },
        "listing": {
            "short": "Un rompecabezas de casillas donde el álgebra lineal parece inocente.",
            "full": [
                "Invert the Matrix es un rompecabezas de lógica con casillas de colores y toques que cambian patrones completos.",
                "Deja cada casilla blanca en la campaña, los retos diarios, los tableros propios y la zona de pruebas.",
                "Gana estrellas por soluciones eficientes y desbloquea logros de Play Games al completar o dominar grupos de campaña.",
            ],
        },
    },
    "fr-FR": {
        "language": "fr",
        "feature": {
            "title": "Invert the Matrix",
            "tagline": "Petits touchers. Algèbre maligne.",
            "body": "Niveaux de campagne, défis quotidiens, plateaux personnalisés et succès Play Games.",
            "pills": ["225 niveaux", "Défis quotidiens", "Succès"],
        },
        "screens": {
            "Tap tiles. Bend the board.": "Touche les tuiles. Plie le plateau.",
            "A colorful puzzle where one move changes a whole pattern.": "Un casse-tête coloré où chaque toucher change tout un motif.",
            "Campaign groups, stars, unlocks.": "Groupes, étoiles et déblocages.",
            "Master handcrafted levels and open new regions of the matrix.": "Maîtrise des niveaux faits main et ouvre de nouvelles zones.",
            "Solve levels with clean taps.": "Résous les niveaux avec des touchers nets.",
            "Every board is modular logic in motion.": "Chaque plateau est une logique modulaire en mouvement.",
            "Earn stars. Unlock achievements.": "Gagne des étoiles. Débloque des succès.",
            "Clear groups or master them with perfect scores.": "Termine les groupes ou maîtrise-les avec des scores parfaits.",
            "Daily puzzles in three tiers.": "Défis quotidiens en trois niveaux.",
            "Easy, Medium, and Hard challenges keep the logic fresh.": "Les défis facile, moyen et difficile renouvellent la logique.",
            "Build custom puzzles.": "Crée tes casse-têtes.",
            "Choose states, patterns, lock icons, holes, and difficulty.": "Choisis états, motifs, cadenas, trous et difficulté.",
            "Create and share playground boards.": "Crée et partage des plateaux bac à sable.",
            "Puzzle codes make experiments portable.": "Les codes de casse-tête rendent les essais faciles à partager.",
            "Use hints when the proof fights back.": "Utilise les indices quand la preuve résiste.",
            "Undo, reset, and solver hints keep hard boards approachable.": "Annuler, réinitialiser et les indices aident sur les plateaux difficiles.",
        },
        "listing": {
            "short": "Un casse-tête de tuiles où l'algèbre linéaire semble innocente.",
            "full": [
                "Invert the Matrix est un casse-tête logique et coloré où un seul toucher change tout un motif.",
                "Rends chaque tuile blanche dans la campagne, les défis quotidiens, les plateaux personnalisés et le bac à sable.",
                "Gagne des étoiles avec des solutions efficaces et débloque des succès Play Games en terminant ou maîtrisant les groupes de campagne.",
            ],
        },
    },
}


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
                "--allow-file-access-from-files",
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
                self.ws = websocket.create_connection(info["webSocketDebuggerUrl"], timeout=30)
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
        self.evaluate("new Promise(resolve => setTimeout(resolve, 900))", await_promise=True)

    def activate(self, screen: str | None) -> None:
        if screen in (None, "main"):
            return
        self.evaluate(screen_action(screen), await_promise=True)

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
        image.save(path, "PNG", optimize=True, compress_level=9)


def clear_pngs(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)
    for item in path.glob("*.png"):
        item.unlink()


def copy_png(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    convert_png(target)


def text_size(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont) -> tuple[int, int]:
    if not text:
        return 0, 0
    bbox = draw.textbbox((0, 0), text, font=face)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def wrap_lines(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if not current or text_size(draw, candidate, face)[0] <= max_width:
            current = candidate
            continue
        lines.append(current)
        current = word
    if current:
        lines.append(current)
    return lines


def fit_lines(
    draw: ImageDraw.ImageDraw,
    text: str,
    max_width: int,
    max_lines: int,
    start_size: int,
    min_size: int,
    bold: bool,
) -> tuple[ImageFont.FreeTypeFont, list[str]]:
    for size in range(start_size, min_size - 1, -2):
        face = font(size, bold=bold)
        lines = wrap_lines(draw, text, face, max_width)
        if len(lines) <= max_lines and all(text_size(draw, line, face)[0] <= max_width for line in lines):
            return face, lines
    face = font(min_size, bold=bold)
    lines = wrap_lines(draw, text, face, max_width)[:max_lines]
    if lines:
        while text_size(draw, lines[-1], face)[0] > max_width and len(lines[-1]) > 4:
            lines[-1] = lines[-1][:-2].rstrip() + "."
    return face, lines


def draw_lines(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    lines: list[str],
    face: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    leading: int,
) -> int:
    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=face, fill=fill)
        y += face.size + leading
    return y


def gradient_background(width: int, height: int) -> Image.Image:
    image = Image.new("RGB", (width, height), (7, 10, 17))
    draw = ImageDraw.Draw(image)
    for y in range(height):
        t = y / max(1, height - 1)
        r = int(7 + 13 * t)
        g = int(10 + 12 * t)
        b = int(17 + 21 * t)
        draw.line((0, y, width, y), fill=(r, g, b))
    for x in range(-width, width * 2, max(70, width // 7)):
        draw.line((x, height, x + width // 2, 0), fill=(27, 86, 105), width=max(2, width // 220))
        draw.line((x + width // 16, height, x + width // 2 + width // 16, 0), fill=(33, 100, 70), width=max(1, width // 320))
    grid = max(48, width // 12)
    for x in range(0, width, grid):
        draw.line((x, 0, x, height), fill=(28, 35, 48), width=1)
    for y in range(0, height, grid):
        draw.line((0, y, width, y), fill=(28, 35, 48), width=1)
    return image


def draw_tile_board(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], states: list[int]) -> None:
    x0, y0, x1, y1 = box
    width = x1 - x0
    radius = max(16, width // 22)
    draw.rounded_rectangle((x0, y0, x1, y1), radius=radius, fill=(19, 25, 37), outline=(86, 101, 129), width=3)
    pad = max(16, width // 20)
    gap = max(8, width // 56)
    size = (width - pad * 2 - gap * 4) // 5
    colors = {
        0: (244, 246, 242),
        1: (49, 184, 229),
        2: (94, 222, 160),
        3: (251, 178, 86),
        4: (165, 122, 237),
        5: (24, 30, 42),
    }
    for index, state in enumerate(states):
        col = index % 5
        row = index // 5
        x = x0 + pad + col * (size + gap)
        y = y0 + pad + row * (size + gap)
        if state == 5:
            draw.rounded_rectangle((x, y, x + size, y + size), radius=max(6, size // 8), fill=(8, 12, 20), outline=(45, 52, 66), width=2)
            continue
        fill = colors[state]
        draw.rounded_rectangle((x, y, x + size, y + size), radius=max(8, size // 7), fill=fill, outline=(236, 246, 255), width=1)
        draw.rounded_rectangle((x + 7, y + 7, x + size - 7, y + max(9, size // 5)), radius=max(6, size // 10), fill=(255, 255, 255, 75))


def make_icon() -> None:
    out_dir = OUT / "icon"
    out_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(BRANDING_ICON) as icon:
        icon = icon.convert("RGBA").resize((512, 512), Image.Resampling.LANCZOS)
        icon.save(out_dir / "play-store-icon-512.png", "PNG", optimize=True, compress_level=9)


def make_feature_graphic(locale_code: str, locale: dict, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    width, height = 1024, 500
    image = gradient_background(width, height)
    draw = ImageDraw.Draw(image)

    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((560, -80, 1110, 570), fill=(38, 200, 190, 44))
    glow_draw.ellipse((740, 80, 1120, 560), fill=(255, 178, 86, 36))
    image = Image.alpha_composite(image.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(image)

    feature = locale["feature"]
    title_face, title_lines = fit_lines(draw, feature["title"], 480, 2, 70, 48, True)
    tagline_face, tagline_lines = fit_lines(draw, feature["tagline"], 500, 2, 32, 24, True)
    body_face, body_lines = fit_lines(draw, feature["body"], 500, 2, 22, 17, False)

    y = 70
    y = draw_lines(draw, (64, y), title_lines, title_face, (255, 249, 239), 2)
    y += 18
    y = draw_lines(draw, (68, y), tagline_lines, tagline_face, (95, 225, 170), 4)
    y += 16
    draw_lines(draw, (70, y), body_lines, body_face, (210, 219, 232), 6)

    pill_face = font(17, bold=True)
    pill_y = 402
    pill_x = 68
    for pill in feature["pills"]:
        tw, th = text_size(draw, pill, pill_face)
        draw.rounded_rectangle((pill_x, pill_y, pill_x + tw + 26, pill_y + 38), radius=12, fill=(22, 29, 41), outline=(82, 97, 124), width=1)
        draw.text((pill_x + 13, pill_y + 9), pill, font=pill_face, fill=(255, 249, 239))
        pill_x += tw + 40

    board_states = [
        0, 1, 3, 4, 1,
        2, 0, 1, 2, 5,
        3, 1, 0, 4, 2,
        4, 2, 3, 0, 1,
        1, 5, 2, 3, 0,
    ]
    draw_tile_board(draw, (610, 66, 952, 408), board_states)
    draw.arc((580, 36, 982, 438), 192, 308, fill=(95, 225, 170), width=5)
    draw.arc((588, 44, 974, 430), 28, 138, fill=(251, 178, 86), width=4)
    image.save(out_dir / "feature-graphic-1024x500.png", "PNG", optimize=True, compress_level=9)


def load_campaign_levels() -> list[dict]:
    return json.loads(CAMPAIGN_LEVELS.read_text(encoding="utf-8"))["levels"]


def seeded_progress(language: str) -> dict:
    levels = load_campaign_levels()
    progress = {
        "campaignVersion": CAMPAIGN_VERSION,
        "stars": {},
        "completed": {},
        "hintUsed": {},
        "bestMoves": {},
        "daily": {},
        "settings": {
            "sound": False,
            "hideNumbers": True,
            "guideTextSize": "small",
            "language": language,
        },
        "freePrefs": {
            "size": "6x6",
            "customWidth": 6,
            "customHeight": 6,
            "states": 4,
            "pattern": "randomMixed",
            "difficulty": "Hard",
            "locked": True,
            "irregular": True,
            "unique": True,
        },
        "playgroundPrefs": {
            "width": 5,
            "height": 5,
            "states": 4,
            "pattern": "knight",
            "tool": "tap",
            "board": [
                0, 1, 2, 3, 0,
                1, 2, 3, 0, 1,
                2, 0, 1, 2, 3,
                3, 1, 0, 3, 2,
                0, 2, 1, 0, 3,
            ],
            "locked": [6, 18],
            "disabled": [0, 24],
        },
    }
    mastered_groups = {0, 1, 2, 7, 11, 12}
    for level in levels:
        group = level["campaignIndex"] // 9
        if group not in mastered_groups:
            continue
        progress["stars"][level["levelId"]] = 3
        progress["completed"][level["levelId"]] = True
        progress["hintUsed"][level["levelId"]] = False
        progress["bestMoves"][level["levelId"]] = level.get("minimumMoves", 3)

    today = date.today().isoformat()
    progress["daily"] = {
        f"{today}-easy": {"completed": True, "moves": 4, "time": 18, "stars": 3, "hintUsed": False},
        f"{today}-medium": {"completed": True, "moves": 11, "time": 64, "stars": 2, "hintUsed": False},
        f"{today}-hard": {"completed": True, "moves": 15, "time": 97, "stars": 2, "hintUsed": False},
    }
    return progress


def prepare_capture_root(root: Path, locale: dict) -> Path:
    shutil.copy2(WEB_ROOT / "styles.css", root / "styles.css")
    shutil.copy2(WEB_ROOT / "app.js", root / "app.js")
    shutil.copy2(CAMPAIGN_LEVELS, root / "campaign-levels.json")
    assets_source = WEB_ROOT / "assets"
    if assets_source.exists():
        shutil.copytree(assets_source, root / "assets", dirs_exist_ok=True)

    progress = seeded_progress(locale["language"])
    seed = "\n".join([
        "    <script>",
        "      try {",
        f"        localStorage.setItem({json.dumps(STORAGE_KEY)}, {json.dumps(json.dumps(progress))});",
        "      } catch (error) {}",
        "    </script>",
    ])
    html = WEB_APP.read_text(encoding="utf-8")
    html = html.replace('    <script src="app.js"></script>', seed + '\n    <script src="app.js"></script>')
    (root / "index.html").write_text(html, encoding="utf-8")
    return root / "index.html"


def screen_action(screen: str) -> str:
    helper = """
      const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
      const waitFor = async (selector, timeout = 5000) => {
        const started = Date.now();
        while (Date.now() - started < timeout) {
          const node = document.querySelector(selector);
          if (node) return node;
          await wait(80);
        }
        return null;
      };
      const click = node => {
        if (!node) return false;
        node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 }));
        return true;
      };
      const action = name => document.querySelector(`[data-action="${name}"]`);
    """
    bodies = {
        "campaign": """
          click(action('show-campaign'));
          await waitFor('[data-campaign-group="12"]');
          click(document.querySelector('[data-campaign-group="12"]'));
          await wait(550);
        """,
        "gameplay": """
          click(action('show-campaign'));
          await waitFor('[data-campaign-group="12"]');
          click(document.querySelector('[data-campaign-group="12"]'));
          await waitFor('[data-level-id="c13-1"]');
          click(document.querySelector('[data-level-id="c13-1"]'));
          await waitFor('#board [data-index]');
          await wait(650);
        """,
        "completion": """
          click(action('show-campaign'));
          await waitFor('[data-level-id="c1-1"]');
          click(document.querySelector('[data-level-id="c1-1"]'));
          await waitFor('#board [data-index="1"]');
          for (const idx of [1, 2, 6]) {
            click(document.querySelector(`#board [data-index="${idx}"]`));
            await wait(440);
          }
          await waitFor('#modal:not([hidden])', 3000);
          await wait(500);
        """,
        "daily": """
          click(action('show-daily'));
          await wait(600);
        """,
        "custom": """
          click(action('show-freeplay'));
          await wait(600);
        """,
        "playground": """
          click(action('show-playground'));
          await wait(700);
        """,
        "hint": """
          click(action('show-campaign'));
          await waitFor('[data-campaign-group="12"]');
          click(document.querySelector('[data-campaign-group="12"]'));
          await waitFor('[data-level-id="c13-1"]');
          click(document.querySelector('[data-level-id="c13-1"]'));
          await waitFor('#board [data-index]');
          await wait(400);
          click(action('hint'));
          await wait(800);
        """,
    }
    if screen not in bodies:
        raise ValueError(f"Unknown screen target: {screen}")
    return f"""
    (async () => {{
      {helper}
      {bodies[screen]}
      return true;
    }})()
    """


def localized_screen_text(locale: dict, text: str) -> str:
    return locale.get("screens", {}).get(text, text)


def make_promo_screenshot(raw_path: Path, out_path: Path, spec: dict, locale_code: str, locale: dict) -> None:
    with Image.open(raw_path) as raw:
        raw = raw.convert("RGB")
        width, height = raw.size
        top_h = int(height * 0.18)
        canvas = raw.filter(ImageFilter.GaussianBlur(radius=12)).resize(raw.size)
        shade = Image.new("RGBA", raw.size, (3, 7, 14, 145))
        canvas = Image.alpha_composite(canvas.convert("RGBA"), shade).convert("RGB")

        app_part = Image.new("RGB", raw.size, (7, 10, 17))
        crop_ratios = {
            "main": 0.11,
            "campaign": 0.03,
            "completion": 0.18,
            "daily": 0.05,
            "custom": 0.03,
            "playground": 0.05,
        }
        crop_top = int(height * crop_ratios.get(spec["target"], 0.0))
        app_part.paste(raw, (0, top_h - crop_top))
        canvas.paste(app_part.crop((0, top_h, width, height)), (0, top_h))

    draw = ImageDraw.Draw(canvas)
    header = gradient_background(width, top_h)
    canvas.paste(header, (0, 0))
    draw = ImageDraw.Draw(canvas)

    icon_size = max(64, width // 13)
    left = max(46, width // 22)
    with Image.open(BRANDING_ICON) as icon:
        icon = icon.convert("RGBA").resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        canvas.paste(icon, (left, 38), icon)

    brand_face = font(max(28, width // 33), bold=True)
    draw.text((left + icon_size + 20, 58), "Invert the Matrix", font=brand_face, fill=(255, 249, 239))

    headline = localized_screen_text(locale, spec["headline"])
    body = localized_screen_text(locale, spec["body"])
    max_text_width = width - left * 2
    headline_face, headline_lines = fit_lines(draw, headline, max_text_width, 2, max(52, width // 17), max(36, width // 28), True)
    body_face, body_lines = fit_lines(draw, body, max_text_width, 2, max(30, width // 34), max(22, width // 48), False)

    y = 142
    y = draw_lines(draw, (left, y), headline_lines, headline_face, (255, 249, 239), 4)
    draw_lines(draw, (left + 2, y + 8), body_lines, body_face, (204, 216, 232), 5)

    draw.line((0, top_h - 2, width, top_h - 2), fill=(95, 225, 170), width=3)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG", optimize=True, compress_level=9)
    convert_png(out_path)


def make_screenshots() -> None:
    with tempfile.TemporaryDirectory(prefix="itm-web-capture-", ignore_cleanup_errors=True) as tmp:
        capture_base = Path(tmp)
        for locale_code, locale in LOCALES.items():
            locale_root = capture_base / locale_code
            locale_root.mkdir(parents=True, exist_ok=True)
            html_path = prepare_capture_root(locale_root, locale)
            file_url = html_path.as_uri()
            for device, width, height, promo in SCREEN_SETS:
                raw_dir = OUT / "source-screenshots" / locale_code / device
                final_dir = OUT / "localized" / locale_code / "screenshots" / device
                clear_pngs(raw_dir)
                clear_pngs(final_dir)
                with Chrome(width, height) as chrome:
                    for spec in SCREENS:
                        name = f"{spec['name']}-{width}x{height}.png"
                        raw_path = raw_dir / name
                        final_path = final_dir / name
                        chrome.navigate(file_url)
                        chrome.activate(spec["target"])
                        chrome.screenshot(raw_path)
                        if promo:
                            make_promo_screenshot(raw_path, final_path, spec, locale_code, locale)
                        else:
                            copy_png(raw_path, final_path)

    # Keep the legacy top-level paths as the English Play Console defaults.
    english_root = OUT / "localized" / "en-US"
    for device, width, height, _promo in SCREEN_SETS:
        out_dir = OUT / "screenshots" / device
        clear_pngs(out_dir)
        for source in sorted((english_root / "screenshots" / device).glob("*.png")):
            copy_png(source, out_dir / source.name)
    install_native_phone_defaults()


def install_native_phone_defaults() -> None:
    """Prefer true Android phone captures when they are available."""
    if not NATIVE_PHONE_SOURCE.exists():
        return

    expected_names = [f"{spec['name']}-1080x1920.png" for spec in SCREENS]
    if any(not (NATIVE_PHONE_SOURCE / name).exists() for name in expected_names):
        return

    targets = [
        OUT / "screenshots" / "phone",
    ]
    targets.extend(OUT / "localized" / locale_code / "screenshots" / "phone" for locale_code in LOCALES)
    for target in targets:
        clear_pngs(target)
        for name in expected_names:
            copy_png(NATIVE_PHONE_SOURCE / name, target / name)


def make_feature_graphics() -> None:
    for locale_code, locale in LOCALES.items():
        make_feature_graphic(locale_code, locale, OUT / "localized" / locale_code / "feature-graphic")
    copy_png(
        OUT / "localized" / "en-US" / "feature-graphic" / "feature-graphic-1024x500.png",
        OUT / "feature-graphic" / "feature-graphic-1024x500.png",
    )


def write_listing_text() -> None:
    lines = [
        "# Google Play Listing Copy",
        "",
        "Generated assets are localized for English, Spanish, and French.",
        "",
    ]
    for locale_code, locale in LOCALES.items():
        lines.extend([
            f"## {locale_code}",
            "",
            "### Short Description",
            "",
            locale["listing"]["short"],
            "",
            "### Full Description",
            "",
            *locale["listing"]["full"],
            "",
            "### Feature Graphic Copy",
            "",
            f"- Title: {locale['feature']['title']}",
            f"- Tagline: {locale['feature']['tagline']}",
            f"- Body: {locale['feature']['body']}",
            f"- Pills: {', '.join(locale['feature']['pills'])}",
            "",
            "### Screenshot Overlay Copy",
            "",
        ])
        for spec in SCREENS:
            lines.append(f"- {spec['name']}: {localized_screen_text(locale, spec['headline'])} {localized_screen_text(locale, spec['body'])}")
        lines.extend(["", "### Asset Alt Text", ""])
        lines.append("- Feature graphic: Invert the Matrix title beside a colorful modular tile board.")
        for device, width, height, promo in SCREEN_SETS:
            if device == "phone":
                kind = "native Android"
            else:
                kind = "raw" if not promo else "promotional"
            lines.append(f"- {device} screenshots: {width}x{height} {kind} captures of menu, campaign, gameplay, daily, custom, playground, and hint flows.")
        lines.append("")
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
        "- Screenshots: PNG with no alpha. Phone screenshots use native Android captures so the app keeps real phone scale. Tablet assets are raw app captures.",
        "",
        "Default English files:",
        "",
        "- `icon/play-store-icon-512.png`",
        "- `feature-graphic/feature-graphic-1024x500.png`",
        "- `screenshots/phone/*.png`",
        "- `screenshots/tablet-7-inch/*.png`",
        "- `screenshots/tablet-10-inch/*.png`",
        "",
        "Localized files:",
        "",
        "- `localized/en-US/feature-graphic/feature-graphic-1024x500.png`",
        "- `localized/en-US/screenshots/**`",
        "- `localized/es-ES/feature-graphic/feature-graphic-1024x500.png`",
        "- `localized/es-ES/screenshots/**`",
        "- `localized/fr-FR/feature-graphic/feature-graphic-1024x500.png`",
        "- `localized/fr-FR/screenshots/**`",
        "",
        "Raw capture sources are kept under `source-screenshots/` for review. Native Android phone captures live under `source-screenshots/android-phone/` and are preserved by the generator.",
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
    if not CAMPAIGN_LEVELS.exists():
        raise RuntimeError(f"Missing {CAMPAIGN_LEVELS}")
    if not BRANDING_ICON.exists():
        raise RuntimeError(f"Missing {BRANDING_ICON}")

    OUT.mkdir(parents=True, exist_ok=True)
    make_icon()
    make_screenshots()
    make_feature_graphics()
    write_listing_text()
    write_readme()
    print(f"Generated Play Store assets in {OUT}")


if __name__ == "__main__":
    main()
