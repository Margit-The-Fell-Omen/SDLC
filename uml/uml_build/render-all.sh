#!/usr/bin/env bash
# Regenerate the four Character Exchange diagrams as committed SVG files in uml/.
# These SVGs are what GitHub displays (embedded in the Markdown), so they always
# match the curated layouts exactly. Re-run after editing a .mmd / generator.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "== sequence =="
tmp="$(mktemp --suffix=.svg)"
nix run nixpkgs#mermaid-cli -- -i sequence-diagram.mmd -o "$tmp" -b white >/dev/null
nix run nixpkgs#nodejs -- fix-sequence-svg.mjs "$tmp" sequence-diagram.svg
rm -f "$tmp"

echo "== activity =="
nix run nixpkgs#nodejs -- gen-activity-svg.mjs activity-diagram.svg

echo "== state =="
nix run nixpkgs#nodejs -- gen-state-svg.mjs state-diagram.svg

echo "== use-case =="
nix run nixpkgs#nodejs -- gen-usecase-svg.mjs use-case-diagram.svg

echo "== class =="
nix run nixpkgs#nodejs -- gen-class-svg.mjs class-diagram.svg

echo "== component =="
nix run nixpkgs#nodejs -- gen-component-svg.mjs component-diagram.svg

echo "== deployment =="
nix run nixpkgs#nodejs -- gen-deployment-svg.mjs deployment-diagram.svg

echo "Done. Generated SVGs in $DIR:"
ls -1 ./*.svg