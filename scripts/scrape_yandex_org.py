#!/usr/bin/env python3
"""Scrape a single Yandex Maps organization into data/*.json."""

from __future__ import annotations

import argparse
import json
import re
import ssl
import urllib.request
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from typing import Any

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

PRICE_RE = re.compile(r"^(\d[\d\s]*)\s*₽$")


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9"})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def extract_balanced_json(text: str, start: int) -> str | None:
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


def strip_to_lines(html: str) -> list[str]:
    text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.S | re.I)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", "\n", text)
    text = unescape(text)
    return [ln.strip() for ln in text.splitlines() if ln.strip()]


def parse_org_oid(url: str) -> str:
    m = re.search(r"/org/[^/]+/(\d+)", url)
    if not m:
        raise SystemExit(f"Cannot parse org id from URL: {url}")
    return m.group(1)


def normalize_org_url(url: str) -> str:
    url = url.strip().rstrip("/")
    url = re.sub(r"\?.*$", "", url)
    for suffix in ("/prices", "/reviews", "/gallery", "/features"):
        if url.endswith(suffix):
            url = url[: -len(suffix)]
    return url


def category_desc(name: str) -> str:
    hints = {
        "лазер": "Зоны и комплексы",
        "массаж": "Классический и специализированный массаж",
        "косметолог": "Уход и процедуры",
        "педикюр": "Педикюр и уход",
        "маникюр": "Маникюр и покрытие",
        "бров": "Оформление бровей",
        "ресниц": "Наращивание и уход",
        "перманент": "Перманентный макияж",
        "стриж": "Стрижки и укладки",
        "акци": "Специальные предложения",
        "окраш": "Окрашивание и уход",
        "макияж": "Макияж и прически",
        "мужск": "Мужской зал",
    }
    low = name.lower()
    for key, desc in hints.items():
        if key in low:
            return desc
    return name


def parse_prices(html: str, source: str) -> dict[str, Any]:
    cats = re.findall(
        r'business-related-items-rubricator__category"[^>]*title="([^"]+)"',
        html,
    )
    if not cats:
        cats = re.findall(r'title="([^"]+)"[^>]*role="listitem"', html)
    cat_set = set(cats)
    lines = strip_to_lines(html)

    start = None
    for i, ln in enumerate(lines):
        if ln in cat_set and i + 1 < len(lines) and lines[i + 1] not in cat_set:
            start = i
            break
    if start is None:
        raise SystemExit("Could not find price list content start in Yandex HTML")

    categories: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    i = start
    while i < len(lines):
        ln = lines[i]
        if ln in cat_set:
            current = {
                "id": f"{len(categories) + 1:02d}",
                "name": ln,
                "desc": category_desc(ln),
                "items": [],
            }
            categories.append(current)
            i += 1
            continue
        if current is None:
            i += 1
            continue

        price_m = PRICE_RE.match(ln)
        if price_m:
            i += 1
            continue

        # name + price
        if i + 1 < len(lines) and PRICE_RE.match(lines[i + 1]):
            price = int(PRICE_RE.match(lines[i + 1]).group(1).replace(" ", ""))
            current["items"].append({"name": ln, "description": None, "price": price})
            i += 2
            continue

        # name + description + price
        if i + 2 < len(lines) and PRICE_RE.match(lines[i + 2]):
            price = int(PRICE_RE.match(lines[i + 2]).group(1).replace(" ", ""))
            desc = lines[i + 1]
            if desc not in cat_set and not PRICE_RE.match(desc):
                current["items"].append(
                    {"name": ln, "description": desc, "price": price}
                )
                i += 3
                continue

        i += 1

    items_count = sum(len(c["items"]) for c in categories)
    if items_count == 0 or not categories:
        raise SystemExit("Parsed empty price list — aborting")

    return {
        "source": source,
        "currency": "RUB",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "categories_count": len(categories),
        "items_count": items_count,
        "categories": categories,
    }


def find_org_blob(html: str, oid: str) -> dict[str, Any] | None:
    """Find the rich org card object by walking back from shortTitle/id markers."""
    anchors: list[int] = []
    for pat in (
        f'"id":"{oid}"',
        f"ymapsbm1://org?oid={oid}",
        '"shortTitle":"',
    ):
        idx = html.find(pat)
        if idx >= 0:
            anchors.append(idx)
    if not anchors:
        return None

    # Prefer the shortTitle closest to the oid mention
    oid_pos = html.find(oid)
    title_pos = html.find('"shortTitle":"', max(0, oid_pos - 5000) if oid_pos >= 0 else 0)
    center = title_pos if title_pos >= 0 else min(anchors)

    for back in range(center, max(0, center - 40000), -1):
        if html[back] != "{":
            continue
        obj_s = extract_balanced_json(html, back)
        if not obj_s or len(obj_s) < 400:
            continue
        if oid not in obj_s:
            continue
        if "shortTitle" not in obj_s and "phones" not in obj_s:
            continue
        try:
            data = json.loads(obj_s)
        except json.JSONDecodeError:
            continue
        if data.get("shortTitle") or data.get("title") or data.get("phones"):
            return data
    return None


def phones_from_org(org: dict[str, Any]) -> tuple[str | None, str | None]:
    phones = org.get("phones") or []
    if isinstance(phones, list) and phones:
        p0 = phones[0]
        if isinstance(p0, dict):
            label = p0.get("number") or p0.get("formatted")
            e164 = p0.get("value") or p0.get("e164")
            if e164 and not str(e164).startswith("+"):
                digits = re.sub(r"\D", "", str(e164))
                e164 = f"+{digits}" if digits else e164
            return label, e164
        if isinstance(p0, str):
            digits = re.sub(r"\D", "", p0)
            e164 = f"+{digits}" if digits else None
            return p0, e164
    # Fallback regex on serialized org
    blob = json.dumps(org, ensure_ascii=False)
    m = re.search(r"\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}", blob)
    label = m.group(0) if m else None
    m2 = re.search(r'"value":"(\+?\d{11,15})"', blob)
    e164 = m2.group(1) if m2 else None
    return label, e164


def socials_from_org(org: dict[str, Any]) -> dict[str, str | None]:
    out: dict[str, str | None] = {"telegram": None, "whatsapp": None, "booking": None}
    links = org.get("socialLinks") or org.get("links") or []
    if isinstance(links, list):
        for link in links:
            if not isinstance(link, dict):
                continue
            href = link.get("url") or link.get("href") or link.get("link") or ""
            typ = (link.get("type") or link.get("name") or "").lower()
            if "t.me" in href or "telegram" in typ:
                out["telegram"] = href
            if "wa.me" in href or "whatsapp" in typ or "whatsapp" in href:
                out["whatsapp"] = href
            if "yclients" in href or "booking" in typ:
                out["booking"] = href
    # deep search
    blob = json.dumps(org, ensure_ascii=False)
    if not out["telegram"]:
        m = re.search(r"https://t\.me/[A-Za-z0-9_]+", blob)
        if m:
            out["telegram"] = m.group(0)
    if not out["whatsapp"]:
        m = re.search(r"https://wa\.me/\d+", blob)
        if m:
            out["whatsapp"] = m.group(0)
    if not out["booking"]:
        m = re.search(r"https://[a-z0-9]+\.yclients\.com[^\"]*", blob)
        if m:
            out["booking"] = m.group(0).rstrip("\\")
    return out


def schedule_from_org(org: dict[str, Any]) -> str | None:
    for key in ("workingTimeText", "hours", "schedule"):
        val = org.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    # Sometimes nested
    meta = org.get("businessProperties") or {}
    if isinstance(meta, dict):
        for key in ("workingTimeText", "hours"):
            val = meta.get(key)
            if isinstance(val, str) and val.strip():
                return val.strip()
    wt = org.get("workingTime")
    if isinstance(wt, list) and wt:
        return "ежедневно (см. Яндекс Карты)"
    return None


def enrich_from_html(html: str, summary: dict[str, Any], socials: dict[str, str | None]) -> None:
    """Fill gaps with regex over full HTML."""
    if not summary.get("phone"):
        m = re.search(r"\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}", html)
        if m:
            summary["phone"] = m.group(0)
    if not summary.get("phone_e164"):
        m = re.search(r"\+?7\d{10}", html)
        if m:
            digits = re.sub(r"\D", "", m.group(0))
            summary["phone_e164"] = f"+{digits}"
    if not socials.get("telegram"):
        m = re.search(r"https://t\.me/[A-Za-z0-9_]+", html)
        if m:
            socials["telegram"] = m.group(0)
            summary["telegram"] = m.group(0)
    if not socials.get("whatsapp"):
        m = re.search(r"https://wa\.me/\d+", html)
        if m:
            socials["whatsapp"] = m.group(0)
            summary["whatsapp"] = m.group(0)
    if not socials.get("booking"):
        m = re.search(r"https://[a-z0-9.-]+\.yclients\.com/?", html)
        if m:
            socials["booking"] = m.group(0)
            summary["booking"] = m.group(0)
    if not summary.get("name") or summary.get("name") == "Organization":
        m = re.search(r'"shortTitle":"([^"]+)"', html)
        if m:
            summary["name"] = m.group(1)
    if not summary.get("address"):
        m = re.search(r'"fullAddress":"([^"]+)"', html)
        if not m:
            m = re.search(r'"address":"([^"]+)"', html)
        if m:
            summary["address"] = m.group(1)


def parse_gallery(html: str, source: str) -> dict[str, Any]:
    templates = re.findall(
        r"https://avatars\.mds\.yandex\.net/get-altay/[^\"'\\s]+/%s",
        html,
    )
    # also without %s placeholder
    bases = []
    seen = set()
    for t in templates:
        if t in seen:
            continue
        seen.add(t)
        bases.append(t)
    # urlTemplate style in JSON
    for m in re.findall(
        r'"urlTemplate":"(https://avatars\.mds\.yandex\.net/get-altay/[^"]+)"',
        html,
    ):
        t = m.replace("\\/", "/")
        if t not in seen:
            seen.add(t)
            bases.append(t)

    items = []
    for t in bases:
        if "%s" not in t:
            # assume ends without size — append /%s pattern from known form
            t = t.rstrip("/") + "/%s" if not t.endswith("%s") else t
        items.append(
            {
                "urlTemplate": t,
                "urls": {
                    size: t.replace("%s", size)
                    for size in ("S", "M", "L", "XL", "XXL", "XXXL", "orig")
                },
            }
        )
    return {
        "source": source,
        "count": len(items),
        "items_on_page": items,
        "all_photo_bases": [i["urlTemplate"] for i in items],
    }


def parse_reviews(html: str, source: str) -> dict[str, Any]:
    reviews = []
    m = re.search(r'"reviewResults"\s*:\s*', html)
    if m:
        obj_s = extract_balanced_json(html, m.end())
        if obj_s:
            try:
                rr = json.loads(obj_s)
                items = rr.get("reviews") or rr.get("items") or []
                if isinstance(items, list):
                    for it in items[:50]:
                        if not isinstance(it, dict):
                            continue
                        reviews.append(
                            {
                                "author": (it.get("author") or {}).get("name")
                                if isinstance(it.get("author"), dict)
                                else it.get("authorName"),
                                "text": it.get("text") or it.get("reviewText"),
                                "rating": it.get("rating"),
                            }
                        )
            except json.JSONDecodeError:
                pass
    return {
        "source": source,
        "count_on_page": len(reviews),
        "reviews": reviews,
    }


def validate_against_previous(out: Path, prices: dict[str, Any]) -> None:
    prev_path = out / "prices.json"
    if not prev_path.exists():
        return
    prev = json.loads(prev_path.read_text(encoding="utf-8"))
    prev_items = int(prev.get("items_count") or 0)
    new_items = int(prices.get("items_count") or 0)
    if prev_items > 0 and new_items == 0:
        raise SystemExit("Refusing to save empty prices over non-empty previous file")
    if prev_items > 0 and new_items < prev_items * 0.5:
        raise SystemExit(
            f"Refusing to save prices: items dropped {prev_items} → {new_items} (>50%)"
        )


def write_json(path: Path, data: Any) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--url", required=True, help="Yandex Maps org URL")
    ap.add_argument("--out", required=True, help="Output data directory")
    args = ap.parse_args()

    base = normalize_org_url(args.url)
    oid = parse_org_oid(base)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    print(f"Fetching org {oid} …")
    org_html = fetch(base + "/")
    prices_html = fetch(base + "/prices/")
    gallery_html = fetch(base + "/gallery/")
    reviews_html = fetch(base + "/reviews/")

    prices = parse_prices(prices_html, base + "/prices/")
    validate_against_previous(out, prices)

    org = find_org_blob(org_html, oid) or {}
    phone, phone_e164 = phones_from_org(org)
    socials = socials_from_org(org)
    name = org.get("shortTitle") or org.get("title") or org.get("name") or "Organization"
    address = org.get("fullAddress") or org.get("address")
    rating = None
    ratings_count = None
    reviews_count = None
    for key in ("rating", "businessRating"):
        val = org.get(key)
        if isinstance(val, (int, float)):
            rating = float(val)
        elif isinstance(val, dict) and "value" in val:
            rating = float(val["value"])
            ratings_count = val.get("count") or ratings_count
    reviews_count = org.get("reviewCount") or reviews_count

    categories = []
    for c in org.get("categories") or []:
        if isinstance(c, dict):
            categories.append(c.get("name") or c.get("title"))
        elif isinstance(c, str):
            categories.append(c)
    categories = [c for c in categories if c]

    coords = org.get("coordinates") or {}
    summary = {
        "name": name,
        "categories": categories,
        "address": address,
        "coordinates": coords,
        "phone": phone,
        "phone_e164": phone_e164,
        "telegram": socials["telegram"],
        "whatsapp": socials["whatsapp"],
        "booking": socials["booking"],
        "schedule": schedule_from_org(org),
        "rating": rating,
        "ratings_count": ratings_count,
        "reviews_count": reviews_count,
        "yandex_maps": base + "/",
        "prices_categories": prices["categories_count"],
        "prices_items": prices["items_count"],
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    enrich_from_html(org_html, summary, socials)
    # keep socials in sync after enrich
    summary["telegram"] = socials.get("telegram") or summary.get("telegram")
    summary["whatsapp"] = socials.get("whatsapp") or summary.get("whatsapp")
    summary["booking"] = socials.get("booking") or summary.get("booking")

    contacts = {
        "phone": summary.get("phone"),
        "phone_e164": summary.get("phone_e164"),
        "telegram": summary.get("telegram"),
        "whatsapp": summary.get("whatsapp"),
        "booking": summary.get("booking"),
        "address": summary.get("address"),
        "schedule": summary.get("schedule"),
        "yandex_maps": base + "/",
        "yandex_reviews": base + "/reviews/",
    }

    gallery = parse_gallery(gallery_html, base + "/gallery/")
    reviews = parse_reviews(reviews_html, base + "/reviews/")
    reviews["rating"] = rating
    reviews["reviews_count"] = reviews_count

    write_json(out / "prices.json", prices)
    write_json(out / "summary.json", summary)
    write_json(out / "contacts.json", contacts)
    write_json(out / "gallery.json", gallery)
    write_json(out / "reviews.json", reviews)
    write_json(out / "organization_raw.json", org)
    write_json(
        out / "source.json",
        {"yandex_maps": base + "/", "oid": oid, "scraped_at": summary["updated_at"]},
    )

    print(
        f"OK: {name} · prices {prices['categories_count']} cats / {prices['items_count']} items · "
        f"gallery {gallery['count']} · reviews page {reviews['count_on_page']}"
    )


if __name__ == "__main__":
    main()
