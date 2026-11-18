#!/usr/bin/env bash
# Render the use-case diagram from a deterministic orthogonal layout and open it.
# Actors are aligned in one column; all connectors are right-angled.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${1:-/tmp/use-case-diagram.svg}"

nix run nixpkgs#nodejs -- "$DIR/gen-usecase-svg.mjs" "$OUT"
echo "Wrote $OUT"
xdg-open "$OUT" >/dev/null 2>&1 || true