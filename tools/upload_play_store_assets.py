#!/usr/bin/env python3
"""Upload generated Google Play listing images through Android Publisher API."""

from __future__ import annotations

import argparse
import base64
import json
import time
import urllib.parse
from pathlib import Path

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "play-store-assets"
SERVICE_ACCOUNT = ROOT / ".secrets" / "play-games-service-account.json"
PACKAGE_NAME = "invert_the_matrix.myapp"
LOCALES = ("en-US", "es-ES", "fr-FR")
SCOPE = "https://www.googleapis.com/auth/androidpublisher"
TOKEN_URL = "https://oauth2.googleapis.com/token"
API = "https://androidpublisher.googleapis.com/androidpublisher/v3"
UPLOAD_API = "https://androidpublisher.googleapis.com/upload/androidpublisher/v3"


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def segment(value: str) -> str:
    return urllib.parse.quote(value, safe="")


def access_token(service_account_path: Path) -> str:
    data = json.loads(service_account_path.read_text(encoding="utf-8"))
    now = int(time.time())
    header = {"alg": "RS256", "typ": "JWT"}
    claims = {
        "iss": data["client_email"],
        "scope": SCOPE,
        "aud": TOKEN_URL,
        "iat": now,
        "exp": now + 3600,
    }
    signing_input = (
        f"{b64url(json.dumps(header, separators=(',', ':')).encode())}."
        f"{b64url(json.dumps(claims, separators=(',', ':')).encode())}"
    ).encode("ascii")
    key = serialization.load_pem_private_key(data["private_key"].encode("utf-8"), password=None)
    signature = key.sign(signing_input, padding.PKCS1v15(), hashes.SHA256())
    assertion = signing_input.decode("ascii") + "." + b64url(signature)
    response = requests.post(
        TOKEN_URL,
        data={"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": assertion},
        timeout=30,
    )
    if not response.ok:
        raise RuntimeError(f"OAuth token request failed: {response.status_code} {response.text}")
    return response.json()["access_token"]


class PlayApi:
    def __init__(self, package_name: str, token: str) -> None:
        self.package_name = package_name
        self.headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    def request(self, method: str, url: str, **kwargs: object) -> dict:
        response = requests.request(method, url, headers=self.headers, timeout=60, **kwargs)
        if not response.ok:
            raise RuntimeError(f"{method} {url} failed: {response.status_code} {response.text}")
        return response.json() if response.text else {}

    def insert_edit(self) -> str:
        url = f"{API}/applications/{segment(self.package_name)}/edits"
        return self.request("POST", url, json={})["id"]

    def delete_edit(self, edit_id: str) -> None:
        url = f"{API}/applications/{segment(self.package_name)}/edits/{segment(edit_id)}"
        requests.delete(url, headers=self.headers, timeout=30)

    def validate_edit(self, edit_id: str) -> None:
        url = f"{API}/applications/{segment(self.package_name)}/edits/{segment(edit_id)}:validate"
        self.request("POST", url)

    def commit_edit(self, edit_id: str) -> None:
        url = f"{API}/applications/{segment(self.package_name)}/edits/{segment(edit_id)}:commit"
        self.request("POST", url)

    def delete_images(self, edit_id: str, language: str, image_type: str) -> None:
        url = (
            f"{API}/applications/{segment(self.package_name)}/edits/{segment(edit_id)}"
            f"/listings/{segment(language)}/{segment(image_type)}"
        )
        self.request("DELETE", url)

    def upload_image(self, edit_id: str, language: str, image_type: str, path: Path) -> None:
        url = (
            f"{UPLOAD_API}/applications/{segment(self.package_name)}/edits/{segment(edit_id)}"
            f"/listings/{segment(language)}/{segment(image_type)}?uploadType=media"
        )
        headers = {**self.headers, "Content-Type": "image/png"}
        with path.open("rb") as image:
            response = requests.post(url, headers=headers, data=image, timeout=120)
        if not response.ok:
            raise RuntimeError(f"Upload failed for {path}: {response.status_code} {response.text}")


def image_manifest(locale: str) -> dict[str, list[Path]]:
    localized = OUT / "localized" / locale
    return {
        "icon": [OUT / "icon" / "play-store-icon-512.png"],
        "featureGraphic": [localized / "feature-graphic" / "feature-graphic-1024x500.png"],
        "phoneScreenshots": sorted((localized / "screenshots" / "phone").glob("*.png")),
        "sevenInchScreenshots": sorted((localized / "screenshots" / "tablet-7-inch").glob("*.png")),
        "tenInchScreenshots": sorted((localized / "screenshots" / "tablet-10-inch").glob("*.png")),
    }


def validate_manifest(locales: tuple[str, ...]) -> None:
    for locale in locales:
        manifest = image_manifest(locale)
        for image_type, paths in manifest.items():
            if not paths:
                raise RuntimeError(f"Missing {image_type} images for {locale}")
            for path in paths:
                if not path.exists():
                    raise RuntimeError(f"Missing asset: {path}")


def upload_assets(api: PlayApi, edit_id: str, locales: tuple[str, ...]) -> None:
    for locale in locales:
        print(f"{locale}")
        for image_type, paths in image_manifest(locale).items():
            print(f"  {image_type}: replacing {len(paths)} image(s)")
            api.delete_images(edit_id, locale, image_type)
            for path in paths:
                api.upload_image(edit_id, locale, image_type, path)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", default=PACKAGE_NAME, help="Android package name.")
    parser.add_argument("--service-account", type=Path, default=SERVICE_ACCOUNT, help="Service account JSON path.")
    parser.add_argument("--locales", nargs="+", default=list(LOCALES), help="Listing locales to update.")
    parser.add_argument("--commit", action="store_true", help="Commit the Play edit. Without this, the edit is validated then deleted.")
    args = parser.parse_args()

    locales = tuple(args.locales)
    validate_manifest(locales)
    token = access_token(args.service_account)
    api = PlayApi(args.package, token)
    edit_id = api.insert_edit()
    committed = False
    try:
        print(f"Created edit {edit_id}")
        upload_assets(api, edit_id, locales)
        api.validate_edit(edit_id)
        print("Validated edit")
        if args.commit:
            api.commit_edit(edit_id)
            committed = True
            print("Committed edit")
        else:
            print("Dry run complete. Re-run with --commit to publish the edit.")
    finally:
        if not committed:
            api.delete_edit(edit_id)


if __name__ == "__main__":
    main()
