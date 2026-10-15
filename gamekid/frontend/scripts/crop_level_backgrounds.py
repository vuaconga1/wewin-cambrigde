"""Remove backdrop and normalize level cards to a shared wider portrait canvas."""
from PIL import Image
from collections import deque
import os

LEVELS_DIR = r"E:\Wewin\WeWinGame\Wewin-Education-main\frontend\public\assets\levels"
DARK = 28
LIGHT = 245
# Slightly wider than classic 3:4 (~4:5)
TARGET_W, TARGET_H = 860, 1024
TARGET_ART_H = int(TARGET_H * 0.98)
MAX_ART_W = int(TARGET_W * 0.98)


def is_backdrop(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return False
    if r <= DARK and g <= DARK and b <= DARK:
        return True
    if r >= LIGHT and g >= LIGHT and b >= LIGHT:
        return True
    if min(r, g, b) >= 230 and max(r, g, b) - min(r, g, b) <= 12:
        return True
    return False


def remove_backdrop(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def try_push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not visited[y][x] and is_backdrop(px[x, y]):
            visited[y][x] = True
            q.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            try_push(nx, ny)

    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def normalize_canvas(im: Image.Image) -> Image.Image:
    scale = TARGET_ART_H / im.height
    if im.width * scale > MAX_ART_W:
        scale = MAX_ART_W / im.width
    new_w = max(1, int(im.width * scale))
    new_h = max(1, int(im.height * scale))
    resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    x = (TARGET_W - new_w) // 2
    y = (TARGET_H - new_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def process(level: str) -> None:
    bak = os.path.join(LEVELS_DIR, f"{level}.original.png")
    path = os.path.join(LEVELS_DIR, f"{level}.png")
    src = bak if os.path.exists(bak) else path
    im = Image.open(src)
    print(f"{level}: {im.size} from {os.path.basename(src)}")
    out = normalize_canvas(remove_backdrop(im))
    out.save(path, optimize=True)
    print(f"  saved {out.size} -> {path}\n")


if __name__ == "__main__":
    for level in ["kids", "starters", "movers", "flyers"]:
        process(level)
