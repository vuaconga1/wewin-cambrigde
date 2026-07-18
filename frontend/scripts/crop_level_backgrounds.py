"""Remove solid black backdrop from level card PNGs (keep artwork intact)."""
from PIL import Image
from collections import deque
import os

LEVELS_DIR = r"E:\Wewin\WeWinGame\Wewin-Education-main\frontend\public\assets\levels"
THRESHOLD = 28  # treat near-black as backdrop


def is_black(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    return a > 0 and r <= THRESHOLD and g <= THRESHOLD and b <= THRESHOLD


def remove_black_background(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def try_push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not visited[y][x] and is_black(px[x, y]):
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


def process(level: str) -> None:
    bak = os.path.join(LEVELS_DIR, f"{level}.original.png")
    path = os.path.join(LEVELS_DIR, f"{level}.png")
    src = bak if os.path.exists(bak) else path
    im = Image.open(src)
    print(f"{level}: {im.size} from {os.path.basename(src)}")
    out = remove_black_background(im)
    out.save(path, optimize=True)
    print(f"  saved {out.size} -> {path}\n")


if __name__ == "__main__":
    for level in ["kids", "starters", "movers", "flyers"]:
        process(level)
