#!/usr/bin/env bash
# Refresh prices from Yandex Maps into this site repo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

URL="${YANDEX_ORG_URL:-}"
if [[ -z "$URL" && -f data/source.json ]]; then
  URL="$(python3 -c "import json; print(json.load(open('data/source.json'))['yandex_maps'])")"
fi
if [[ -z "$URL" ]]; then
  echo "Set YANDEX_ORG_URL or create data/source.json" >&2
  exit 1
fi

mkdir -p data src/data public/data

python3 scripts/scrape_yandex_org.py --url "$URL" --out data
python3 scripts/generate_prices_ts.py --prices data/prices.json --out src/data/prices.ts
cp data/prices.json src/data/prices.json
cp data/prices.json public/data/prices.json

echo "Prices updated from $URL"
