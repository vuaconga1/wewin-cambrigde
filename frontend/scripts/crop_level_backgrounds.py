"""Apply consistent crop + rounded alpha mask to remove outdoor scenery."""
from PIL import Image, ImageDraw
import os

LEVELS_DIR = r"E:\Wewin\WeWinGame\Wewin-Education-main\frontend\public\assets\levels"

# Fractions of original 819x1024 that keep the board + characters/icons
# Tuned from kids frame detection (yellow board ~ x=45..772, y=45..)
CROP = {
    # left, top, right, bottom as fractions of width/height
    "kids": (0.045, 0.022, 0.950, 0.999),
    "starters": (0.045, 0.015, 0.955, 0.999),
    "movers": (0.045, 0.010, 0.955, 0.999),
    "flyers": (0.040, 0.015, 0.955, 0.999),
}


def process(level: str):
    bak = os.path.join(LEVELS_DIR, f"{level}.original.png")
    path = os.path.join(LEVELS_DIR, f"{level}.png")
    im = Image.open(bak if os.path.exists(bak) else path).convert("RGBA")
    w, h = im.size
    print(f"{level}: {w}x{h}")

    l, t, r, b = CROP[level]
    left, top = int(w * l), int(h * t)
    right, bottom = int(w * r) - 1, int(h * b) - 1
    print(f"  box=({left}, {top}, {right}, {bottom})")

    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    radius = int(min(right - left, bottom - top) * 0.10)
    draw.rounded_rectangle([left, top, right, bottom], radius=radius, fill=255)

    # Extra bottom coverage for characters
    char_y = int(top + (bottom - top) * 0.68)
    draw.rounded_rectangle(
        [left + 16, char_y, right - 16, bottom],
        radius=max(6, radius // 3),
        fill=255,
    )

    out = im.copy()
    out.putalpha(mask)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    print(f"  final={out.size}")
    out.save(path, optimize=True)
    print("  saved\n")


if __name__ == "__main__":
    for level in ["kids", "starters", "movers", "flyers"]:
        process(level)
