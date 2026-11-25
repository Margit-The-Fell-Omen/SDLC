#!/usr/bin/env bash
# Render the Character Exchange sequence diagram and open it in the browser.
# Removes Mermaid's mirrored bottom actor boxes and draws an X (cross) at
# the end of every lifeline instead.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$DIR/sequence-diagram.mmd"
OUT="${1:-/tmp/sequence-diagram.svg}"
TMP="$(mktemp --suffix=.svg)"

nix run nixpkgs#mermaid-cli -- -i "$SRC" -o "$TMP" -b white >/dev/null
nix run nixpkgs#nodejs -- "$DIR/fix-sequence-svg.mjs" "$TMP" "$OUT"
rm -f "$TMP"

echo "Wrote $OUT"
xdg-open "$OUT" >/dev/null 2>&1 || true