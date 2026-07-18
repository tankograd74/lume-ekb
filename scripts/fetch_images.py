#!/usr/bin/env python3
"""Download gallery / hero / about / visit images from gallery.json."""

from __future__ import annotations

import argparse
import json
import ssl
import urllib.request
from pathlib import Path

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def fetch_to(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
        dest.write_bytes(resp.read())


def pick_url(item: dict, size: str = "XXXL") -> str | None:
    urls = item.get("urls") or {}
    for key in (size, "XXL", "XL", "orig", "L"):
        if urls.get(key):
            return urls[key]
    tmpl = item.get("urlTemplate")
    if tmpl and "%s" in tmpl:
        return tmpl.replace("%s", size)
    return None


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--gallery", required=True, help="Path to gallery.json")
    ap.add_argument("--out", required=True, help="public/images directory")
    ap.add_argument("--limit", type=int, default=24, help="Max gallery files")
    ap.add_argument("--size", default="XXXL", help="Yandex size token")
    args = ap.parse_args()

    data = json.loads(Path(args.gallery).read_text(encoding="utf-8"))
    items = data.get("items_on_page") or []
    out = Path(args.out)
    gallery_dir = out / "gallery"
    gallery_dir.mkdir(parents=True, exist_ok=True)

    saved = 0
    for i, item in enumerate(items[: args.limit], 1):
        url = pick_url(item, args.size)
        if not url:
            continue
        dest = gallery_dir / f"{i:02d}.jpg"
        try:
            fetch_to(url, dest)
            saved += 1
            print(f"gallery/{dest.name}")
        except Exception as e:
            print(f"skip {i}: {e}")

    # Role defaults from first photos if missing
    roles = {
        "hero.jpg": 1,
        "about.jpg": min(2, len(items)),
        "visit.jpg": min(3, len(items)),
    }
    for name, idx in roles.items():
        if idx <= 0 or idx > len(items):
            continue
        dest = out / name
        if dest.exists():
            continue
        url = pick_url(items[idx - 1], args.size)
        if not url:
            continue
        try:
            fetch_to(url, dest)
            print(name)
        except Exception as e:
            print(f"skip {name}: {e}")

    print(f"Done: {saved} gallery images → {gallery_dir}")


if __name__ == "__main__":
    main()
