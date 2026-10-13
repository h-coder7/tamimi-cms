#!/usr/bin/env sh
# Build static export + pack for cPanel (document root of FE subdomain).
set -e
cd "$(dirname "$0")/.."

ENV_FILE=".env.cpanel"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

# Load NEXT_PUBLIC_* for `next build` (output: export → out/)
set -a
# shellcheck disable=SC1090
. "./$ENV_FILE"
set +a

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  echo "NEXT_PUBLIC_API_URL empty in $ENV_FILE"
  exit 1
fi

echo "Building with NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
npm run build

if [ ! -d out ] || [ ! -f out/index.html ]; then
  echo "out/ missing after build"
  exit 1
fi

OUT="tamimi-fe-deploy.tar.gz"
# Include .htaccess for Apache directory / SPA-ish routing on cPanel
cp scripts/htaccess.deploy out/.htaccess
tar -czf "$OUT" -C out .

echo "OK → $OUT"
echo "Extract into the FE subdomain document root (e.g. public_html for tamimidash)"
