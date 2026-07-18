#!/usr/bin/env python3
"""Generate site/src/data/prices.ts from data/prices.json."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


HEADER = '''export type PriceItem = {
  name: string;
  description: string | null;
  price: number;
};

export type ServiceCategory = {
  id: string;
  name: string;
  desc: string;
  items: PriceItem[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = '''

FOOTER = '''

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}
'''


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--prices", required=True, help="Path to prices.json")
    ap.add_argument("--out", required=True, help="Output prices.ts path")
    args = ap.parse_args()

    data = json.loads(Path(args.prices).read_text(encoding="utf-8"))
    categories = data.get("categories") or []
    if not categories:
        raise SystemExit("prices.json has no categories")

    # Ensure desc field exists
    normalized = []
    for i, cat in enumerate(categories, 1):
        normalized.append(
            {
                "id": cat.get("id") or f"{i:02d}",
                "name": cat["name"],
                "desc": cat.get("desc") or cat["name"],
                "items": [
                    {
                        "name": it["name"],
                        "description": it.get("description"),
                        "price": int(it["price"]),
                    }
                    for it in cat.get("items") or []
                ],
            }
        )

    body = json.dumps(normalized, ensure_ascii=False, indent=2)
    # JSON uses double quotes — valid TS for this literal
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(HEADER + body + ";" + FOOTER, encoding="utf-8")
    items = sum(len(c["items"]) for c in normalized)
    print(f"Wrote {out} ({len(normalized)} categories, {items} items)")


if __name__ == "__main__":
    main()
