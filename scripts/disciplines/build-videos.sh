#!/usr/bin/env bash
# Re-build Disciplines MP4s. Run from repo root.
# Requires: yt-dlp, ffmpeg.
#
# Source parts share codec/resolution (h264 1728x1080 + aac 48kHz mono), so
# we use ffmpeg's concat demuxer with -c copy for a fast, lossless stitch.
# If Loom ever re-encodes one of the parts differently, swap in the
# filter_complex re-encode shown in the plan.
set -euo pipefail

WORK=/tmp/disciplines-work
OUT="$(cd "$(dirname "$0")/../.." && pwd)/public/disciplines"
mkdir -p "$WORK" "$OUT"

# --- B-Roll (Saskia) ---
yt-dlp -f 'best[ext=mp4]/best' -o "$WORK/saskia-part1.%(ext)s" \
  'https://www.loom.com/share/f4aea0b3c2a440e0905f8b404821f415'
yt-dlp -f 'best[ext=mp4]/best' -o "$WORK/saskia-part2.%(ext)s" \
  'https://www.loom.com/share/1967c04b603c43948a92bda5a7517678'

cat > "$WORK/concat.txt" <<EOF
file '$WORK/saskia-part1.mp4'
file '$WORK/saskia-part2.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i "$WORK/concat.txt" \
  -c copy -movflags +faststart \
  "$OUT/b-roll.mp4"

echo "Built $OUT/b-roll.mp4"
# Podcast (Nico) is sourced manually from a Google Drive folder — see plan Task 4.
