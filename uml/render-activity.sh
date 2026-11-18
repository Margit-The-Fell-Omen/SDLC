#!/usr/bin/env bash
# Render the activity diagram from a deterministic planar layout and open it.
# Every edge is straight with at most one right-angle bend; branches are
# stacked in separate vertical bands so no edges cross.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${1:-/tmp/activity-diagram.svg}"

nix run nixpkgs#nodejs -- "$DIR/gen-activity-svg.mjs" "$OUT"
echo "Wrote $OUT"
xdg-open "$OUT" >/dev/null 2>&1 || true