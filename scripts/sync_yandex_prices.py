#!/usr/bin/env python3
"""Fetch service prices from Yandex Maps and write site/src/data/prices.json."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "src" / "data" / "prices.json"
PUBLIC_COPY = ROOT / "public" / "data" / "prices.json"
ARCHIVE_PATH = ROOT.parent / "data" / "prices.json"

DEFAULT_URL = "https://yandex.ru/maps/org/lum_/83014772904/prices/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

# Prefer previous site order; unknown categories append alphabetically.
PREFERRED_ORDER = [
    "Лазерная эпиляция",
    "Массаж",
    "Косметология",
    "Педикюр",
    "Маникюр",
    "Оформление бровей",
    "Наращивание ресниц",
    "Перманентный макияж",
    "Стрижки и укладки",
    "Акции",
    "Окрашивание/Уход волос",
    "Макияж и прически",
    "Мужской зал",
]

CATEGORY_DESCS: dict[str, str] = {
    "Лазерная эпиляция": "Диодный лазер — зоны и комплексы",
    "Массаж": "Классический, антицеллюлитный, лимфодренаж, лицо",
    "Космеология": "Чистки, пилинги, мезотерапия, уходы",
    "Педикюр": "Экспресс, smart и полный — с покрытием и без",
    "Маникюр": "Классика, гель-лак, укрепление, дизайн",
    "Оформление бровей": "Коррекция, окрашивание, долговременная укладка",
    "Наращивание ресниц": "Классика, 1.5D–3D, ламинирование, LED",
    "Перманентный макияж": "Брови, губы, межресничка и коррекция",
    "Стрижки и укладки": "Женские, мужские, детские, укладки",
    "Акции": "Специальные предложения салона",
    "Окрашивание/Уход волос": "Окрашивание, уходы Lebel и Davines",
    "Макияж и прически": "Локоны и прически",
    "Мужской зал": "Мужской маникюр и услуги зала",
}


def fetch_html(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_object(text: str, start: int) -> str | None:
    if start >= len(text) or text[start] != "{":
        return None
    depth = 0
    in_str = False
    esc = False
    for j, c in enumerate(text[start:], start):
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
            continue
        if c == '"':
            in_str = True
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[start : j + 1]
    return None


def parse_categories(html: str) -> list[dict[str, Any]]:
    scripts = re.findall(r"<script[^>]*>(.*?)</script>", html, re.S)
    payload = next(
        (s for s in scripts if '"categoryName":' in s and '"categoryItems":' in s),
        None,
    )
    if not payload:
        raise RuntimeError("Yandex prices payload not found in page HTML")

    cats: list[dict[str, Any]] = []
    for m in re.finditer(r'\{"categoryName":"', payload):
        raw = extract_object(payload, m.start())
        if not raw:
            continue
        obj = json.loads(raw)
        name = obj.get("categoryName")
        items = obj.get("categoryItems")
        if not isinstance(name, str) or not isinstance(items, list):
            continue
        if name == "popular":
            continue
        cats.append(obj)

    if not cats:
        raise RuntimeError("No price categories parsed from Yandex page")
    return cats


def parse_price(value: Any) -> int | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    text = str(value).replace("\xa0", " ").replace(" ", "")
    m = re.search(r"(\d+)", text)
    return int(m.group(1)) if m else None


def load_existing_descs() -> dict[str, str]:
    descs = dict(CATEGORY_DESCS)
    if OUT_PATH.exists():
        try:
            data = json.loads(OUT_PATH.read_text(encoding="utf-8"))
            for cat in data.get("categories", []):
                name = cat.get("name")
                desc = cat.get("desc")
                if name and desc:
                    descs[name] = desc
        except (json.JSONDecodeError, OSError):
            pass
    return descs


def preferred_sort_key(name: str) -> tuple[int, str]:
    try:
        return (PREFERRED_ORDER.index(name), name)
    except ValueError:
        return (len(PREFERRED_ORDER), name)


def build_payload(url: str, raw_cats: list[dict[str, Any]]) -> dict[str, Any]:
    descs = load_existing_descs()
    categories: list[dict[str, Any]] = []

    for raw in sorted(raw_cats, key=lambda c: preferred_sort_key(c["categoryName"])):
        name = raw["categoryName"]
        items = []
        for it in raw.get("categoryItems", []):
            price = parse_price(it.get("price"))
            title = (it.get("title") or "").strip()
            if not title or price is None:
                continue
            desc = it.get("description")
            if isinstance(desc, str):
                desc = desc.strip() or None
            else:
                desc = None
            items.append({"name": title, "description": desc, "price": price})

        if not items:
            continue

        categories.append(
            {
                "id": f"{len(categories) + 1:02d}",
                "name": name,
                "desc": descs.get(name) or f"Услуги: {name}",
                "items": items,
            }
        )

    return {
        "source": url,
        "currency": "RUB",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "categories_count": len(categories),
        "items_count": sum(len(c["items"]) for c in categories),
        "categories": categories,
    }


def write_json(path: Path, data: dict[str, Any]) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    new_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    old_text = path.read_text(encoding="utf-8") if path.exists() else None

    # Compare without updated_at so unchanged prices do not force a commit.
    def strip_ts(text: str | None) -> str | None:
        if text is None:
            return None
        try:
            obj = json.loads(text)
            obj.pop("updated_at", None)
            return json.dumps(obj, ensure_ascii=False, sort_keys=True)
        except json.JSONDecodeError:
            return text

    changed = strip_ts(old_text) != strip_ts(new_text)
    if changed or old_text is None:
        path.write_text(new_text, encoding="utf-8")
    return changed


def main() -> int:
    url = os.environ.get("YANDEX_PRICES_URL", DEFAULT_URL).strip() or DEFAULT_URL
    print(f"Fetching {url}")
    html = fetch_html(url)
    raw_cats = parse_categories(html)
    payload = build_payload(url, raw_cats)
    print(
        f"Parsed {payload['categories_count']} categories, "
        f"{payload['items_count']} items"
    )

    changed = write_json(OUT_PATH, payload)
    if changed or not PUBLIC_COPY.exists():
        PUBLIC_COPY.parent.mkdir(parents=True, exist_ok=True)
        PUBLIC_COPY.write_text(
            OUT_PATH.read_text(encoding="utf-8"), encoding="utf-8"
        )
    if ARCHIVE_PATH.parent.is_dir():
        # Keep workspace archive in sync when present (local monorepo).
        write_json(ARCHIVE_PATH, payload)

    if changed:
        print(f"Updated {OUT_PATH}")
    else:
        print("No price changes")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001 — surface clear CI failure
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
