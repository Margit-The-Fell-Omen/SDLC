#!/usr/bin/env bash
# Render the state diagram from a deterministic orthogonal layout and open it.
# All connectors are right-angled; composite-border crossings are aligned;
# no pseudo-state dots (Start/Exit are real states).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${1:-/tmp/state-diagram.svg}"

nix run nixpkgs#nodejs -- "$DIR/gen-state-svg.mjs" "$OUT"
echo "Wrote $OUT"
xdg-open "$OUT" >/dev/null 2>&1 || true