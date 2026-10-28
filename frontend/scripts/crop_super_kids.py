"""
Cắt hình từ vựng trong phần LOOK & SAY của sách WeWIN Super Kids.

Mỗi thẻ từ vựng có viền vàng bo góc. Script tìm viền này (thành phần liên thông
màu vàng), cắt phần bên trong viền, bỏ dòng chữ tên từ ở dưới và xuất PNG vuông
nền trắng vào frontend/public/assets/super-kids/<week>/<id>.png.

Chạy: python frontend/scripts/crop_super_kids.py
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from pathlib import Path

import fitz
import numpy as np
from PIL import Image
from scipy import ndimage

REPO_ROOT = Path(__file__).resolve().parents[2]
PDF_DIR = REPO_ROOT / "docs" / "WeWIN_Super_Kids_Split"
OUT_ROOT = REPO_ROOT / "frontend" / "public" / "assets" / "super-kids"

OUTPUT_SIZE = 512
CONTENT_PADDING = 0.06
INSET_FROM_OUTLINE = 4
LABEL_GAP_ROWS = 3


@dataclass
class LessonPage:
    pdf: str
    page_index: int
    week: str
    words: list[str]


LESSONS = [
    # Week 1
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=2,
        week="week-1",
        words=["america", "england", "italy", "france", "canada", "russia"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=3,
        week="week-1",
        words=["japan", "vietnam", "china", "korea", "india"],
    ),
    # Week 3
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=8,
        week="week-3",
        words=["sun", "moon", "mercury", "venus", "earth"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=9,
        week="week-3",
        words=["mars", "jupiter", "saturn", "uranus", "neptune"],
    ),
    # Week 5
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=14,
        week="week-5",
        words=["sofa", "tv", "radio", "clock", "pillow"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=15,
        week="week-5",
        words=["bed", "door", "lamp", "window", "telephone"],
    ),
    # Week 7
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=20,
        week="week-7",
        words=["soap", "towel", "shampoo", "mirror", "toothbrush"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=21,
        week="week-7",
        words=["toothpaste", "toilet", "sink", "shower", "bath"],
    ),
    # Week 9
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=26,
        week="week-9",
        words=["happy", "sad", "angry", "sleepy", "tired"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=27,
        week="week-9",
        words=["scared", "silly", "nervous", "surprised", "excited"],
    ),
    # Week 11
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=32,
        week="week-11",
        words=["soccer", "badminton", "basketball", "tennis"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=33,
        week="week-11",
        words=["boxing", "running", "cycling", "skiing"],
    ),
    # Week 13
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=38,
        week="week-13",
        words=["swimming", "surfing", "windsurfing", "sailing"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_1_(Trang_1-40).pdf",
        page_index=39,
        week="week-13",
        words=["fishing", "snorkeling", "kayaking", "diving"],
    ),
    # Week 15
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=4,
        week="week-15",
        words=["fast", "slow", "big", "small", "long", "short"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=5,
        week="week-15",
        words=["hot", "cold", "dry", "wet", "old", "young"],
    ),
    # Week 17
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=10,
        week="week-17",
        words=["santa", "elf", "present", "christmas-tree", "reindeer"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=11,
        week="week-17",
        words=["snowman", "jingle-bell", "candy-cane", "snowball", "stocking"],
    ),
    # Week 19
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=16,
        week="week-19",
        words=["teacher", "doctor", "pilot", "police-officer", "firefighter"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=17,
        week="week-19",
        words=["school", "hospital", "airport", "police-station", "fire-station"],
    ),
    # Week 21
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=22,
        week="week-21",
        words=["stand-up", "sit-down", "open", "close"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=23,
        week="week-21",
        words=["sleep", "laugh", "cry", "cut"],
    ),
    # Week 23
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=28,
        week="week-23",
        words=["in", "on", "under", "next-to", "behind"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=29,
        week="week-23",
        words=["in-front-of", "between", "above", "below"],
    ),
    # Week 25
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=34,
        week="week-25",
        words=["rat", "dragon", "goat", "rooster", "snake", "horse"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_2_(Trang_41-80).pdf",
        page_index=35,
        week="week-25",
        words=["tiger", "ox", "monkey", "pig", "cat", "dog"],
    ),
    # Week 27
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=0,
        week="week-27",
        words=["mushroom", "carrot", "bean", "potato"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=1,
        week="week-27",
        words=["cabbage", "tomato", "corn", "broccoli"],
    ),
    # Week 29
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=6,
        week="week-29",
        words=["cucumber", "onion", "eggplant", "garlic", "ginger"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=7,
        week="week-29",
        words=["bell-pepper", "beetroot", "lettuce", "green-onion", "celery"],
    ),
    # Week 31
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=12,
        week="week-31",
        words=["cherry", "melon", "plum", "peach", "grapefruit"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=13,
        week="week-31",
        words=["star-apple", "avocado", "passion-fruit", "strawberry", "blueberry"],
    ),
    # Week 33
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=18,
        week="week-33",
        words=["rambutan", "guava", "longan", "lychee", "dragon-fruit"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=19,
        week="week-33",
        words=["durian", "star-fruit", "jackfruit", "mandarin", "mangosteen"],
    ),
    # Week 35
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=24,
        week="week-35",
        words=["milk", "water", "cola", "tea", "coffee"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=25,
        week="week-35",
        words=["juice", "milkshake", "lemonade", "iced-tea", "hot-chocolate"],
    ),
    # Week 37
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=30,
        week="week-37",
        words=["rice", "noodles", "bread", "soup"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=31,
        week="week-37",
        words=["chicken", "fish", "egg", "meat"],
    ),
    # Week 39
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=36,
        week="week-39",
        words=["fever", "cough", "cold", "headache"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_3_(Trang_81-120).pdf",
        page_index=37,
        week="week-39",
        words=["stomachache", "sore-throat", "flu", "toothache"],
    ),
    # Week 41
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=2,
        week="week-41",
        words=["phone", "laptop", "tablet", "computer"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=3,
        week="week-41",
        words=["tv", "smartwatch", "headphones", "camera"],
    ),
    # Week 43
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=8,
        week="week-43",
        words=["earthquake", "flood", "storm", "typhoon", "tornado"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=9,
        week="week-43",
        words=["tsunami", "drought", "wildfire", "landslide"],
    ),
    # Week 45
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=14,
        week="week-45",
        words=["clap", "wave", "point", "touch"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=15,
        week="week-45",
        words=["eat", "drink", "sleep", "wash"],
    ),
    # Week 47
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=20,
        week="week-47",
        words=["brain", "heart", "lungs", "stomach"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=21,
        week="week-47",
        words=["liver", "kidneys", "bones", "intestine"],
    ),
    # Week 49
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=26,
        week="week-49",
        words=["puppet", "clown", "balloon", "pinwheel", "yo-yo", "drum", "dice", "duck"],
    ),
    LessonPage(
        pdf="WeWIN_Super_Kids_v1.0_Part_4_(Trang_121-153).pdf",
        page_index=27,
        week="week-49",
        words=["music-box", "ufo", "marbles", "rocking-horse", "scooter", "tricycle", "skipping-rope", "dinosaur"],
    ),
]


def is_full_page_image(page: fitz.Page, xref: int) -> bool:
    rects = page.get_image_rects(xref)
    if len(rects) != 1:
        return False
    r = rects[0]
    return abs(r.x0) <= 2 and abs(r.y0) <= 2 and r.width >= page.rect.width * 0.98 and r.height >= page.rect.height * 0.98


def load_page_raster(pdf_path: Path, page_index: int) -> np.ndarray:
    doc = fitz.open(pdf_path)
    page = doc[page_index]
    imgs = page.get_images(full=True)
    full_bg = [im for im in imgs if is_full_page_image(page, im[0])]
    if full_bg:
        pix = fitz.Pixmap(doc, full_bg[0][0])
    else:
        pix = page.get_pixmap(dpi=150)
    if pix.alpha or pix.n != 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    return np.asarray(img).copy()


def yellow_mask(rgb: np.ndarray) -> np.ndarray:
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    return (r > 225) & (g > 150) & (g < 242) & (b < 180) & (r - b > 70) & (g - b > 50)


def cut_pill_necks(mask: np.ndarray, h: int, w: int) -> np.ndarray:
    """Tách cổ nối hẹp (<50px) giữa huy hiệu tròn '1 LOOK & SAY' và viền thẻ."""
    mask = mask.copy()
    for y in range(150, min(h, 350)):
        row = mask[y, :int(w * 0.4)]
        count = row.sum()
        if 5 <= count <= 50:
            above_counts = [mask[y - d, :int(w * 0.4)].sum() for d in range(1, 12) if y - d >= 0]
            below_counts = [mask[y + d, :int(w * 0.4)].sum() for d in range(1, 12) if y + d < h]
            if any(c > 150 for c in above_counts) and any(c > 150 for c in below_counts):
                mask[y, :int(w * 0.4)] = False
    return mask


def find_cards(rgb: np.ndarray) -> list[tuple[np.ndarray, tuple[int, int, int, int]]]:
    """Trả về [(mask viền, (y0, x0, y1, x1))] cho các thẻ trong vùng LOOK & SAY."""
    h, w = rgb.shape[:2]
    mask = yellow_mask(rgb)
    mask = cut_pill_necks(mask, h, w)
    mask = ndimage.binary_closing(mask, structure=np.ones((3, 3)))
    labels, _ = ndimage.label(mask, structure=np.ones((3, 3)))
    cards = []
    for idx, sl in enumerate(ndimage.find_objects(labels), start=1):
        if sl is None:
            continue
        y0, y1 = sl[0].start, sl[0].stop
        x0, x1 = sl[1].start, sl[1].stop
        bw, bh = x1 - x0, y1 - y0
        if bw < w * 0.18 or bw > w * 0.5 or bh < h * 0.08 or bh > h * 0.25:
            continue
        comp = labels[sl] == idx
        if comp.mean() > 0.35:
            continue
        cards.append((labels == idx, (y0, x0, y1, x1)))

    if not cards:
        return cards
    cards.sort(key=lambda c: c[1][0])
    rows: list[list] = []
    for card in cards:
        if rows and abs(card[1][0] - rows[-1][0][1][0]) < h * 0.03:
            rows[-1].append(card)
        else:
            rows.append([card])
    return [c for row in rows for c in sorted(row, key=lambda c: c[1][1])]


def inner_box(outline: np.ndarray, box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    """Hộp lớn nhất bên trong viền, không chứa pixel nào của viền."""
    y0, x0, y1, x1 = box
    cy, cx = (y0 + y1) // 2, (x0 + x1) // 2

    # Giới hạn kiểm tra viền trong phạm vi 15px từ mép ngoài của box
    # (tránh nhận nhầm hình minh họa màu vàng bên trong thẻ như Mặt Trời là viền)
    border = np.zeros_like(outline)
    border[y0:y0+15, x0:x1] = outline[y0:y0+15, x0:x1]
    border[y1-15:y1, x0:x1] = outline[y1-15:y1, x0:x1]
    border[y0:y1, x0:x0+15] = outline[y0:y1, x0:x0+15]
    border[y0:y1, x1-15:x1] = outline[y0:y1, x1-15:x1]

    top_candidates = [y for y in range(y0, cy) if border[y, cx]]
    top = (max(top_candidates) + 1) if top_candidates else (y0 + 4)

    bottom_candidates = [y for y in range(cy, y1) if border[y, cx]]
    bottom = min(bottom_candidates) if bottom_candidates else (y1 - 4)

    left_candidates = [x for x in range(x0, cx) if border[cy, x]]
    left = (max(left_candidates) + 1) if left_candidates else (x0 + 4)

    right_candidates = [x for x in range(cx, x1) if border[cy, x]]
    right = min(right_candidates) if right_candidates else (x1 - 4)

    top, bottom = top + INSET_FROM_OUTLINE, bottom - INSET_FROM_OUTLINE
    left, right = left + INSET_FROM_OUTLINE, right - INSET_FROM_OUTLINE

    while (border[top, left:right].any() or border[bottom-1, left:right].any() or
           border[top:bottom, left].any() or border[top:bottom, right-1].any()):
        top, bottom, left, right = top + 1, bottom - 1, left + 1, right - 1
    return top, left, bottom, right


def navy_mask(rgb: np.ndarray) -> np.ndarray:
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    return (r < 90) & (g < 100) & (b > 60) & (b - r > 25)


def strip_label(card: np.ndarray) -> np.ndarray:
    """Bỏ khối chữ màu navy ở dưới cùng của thẻ (tên từ và chú thích nếu có)."""
    h = card.shape[0]
    counts = navy_mask(card).sum(axis=1)

    search_start = int(h * 0.65)
    lower = counts[search_start:]
    if lower.max() == 0:
        return card

    core_rel = np.where(lower >= lower.max() * 0.4)[0]
    if len(core_rel) == 0:
        return card
    y = search_start + int(core_rel.max())

    gap = 0
    while y > search_start and gap <= 2:
        gap = 0 if counts[y] > 0 else gap + 1
        y -= 1
    y += gap
    cut = max(int(h * 0.60), y - LABEL_GAP_ROWS + 1)
    return card[:cut]


def to_square(content: np.ndarray) -> Image.Image:
    non_white = content.astype(int).sum(axis=2) < 720
    ys, xs = np.where(non_white)
    if len(ys) == 0 or len(xs) == 0:
        return Image.new("RGB", (OUTPUT_SIZE, OUTPUT_SIZE), "white")
    content = content[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
    ch, cw = content.shape[:2]
    side = int(max(ch, cw) * (1 + 2 * CONTENT_PADDING))
    canvas = Image.new("RGB", (side, side), "white")
    canvas.paste(Image.fromarray(content), ((side - cw) // 2, (side - ch) // 2))
    return canvas.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.LANCZOS)


def process(lesson: LessonPage) -> list[tuple[str, Image.Image]]:
    rgb = load_page_raster(PDF_DIR / lesson.pdf, lesson.page_index)
    # Các khung vàng khác (bong bóng hội thoại...) nằm dưới phần LOOK & SAY.
    cards = find_cards(rgb)[: len(lesson.words)]
    inners = [inner_box(outline, box) for outline, box in cards]
    heights = [b[2] - b[0] for b in inners]
    if len(cards) != len(lesson.words) or max(heights) > min(heights) * 1.15:
        raise SystemExit(
            f"Trang {lesson.page_index + 1}: tìm thấy {len(cards)} thẻ, cần {len(lesson.words)}"
        )
    results = []
    for word, (outline, _), (top, left, bottom, right) in zip(lesson.words, cards, inners):
        picture = strip_label(rgb[top:bottom, left:right])
        results.append((word, to_square(picture)))
    return results


def contact_sheet(items: list[tuple[str, Image.Image]], path: Path) -> None:
    thumb = 150
    cols = 8
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (thumb + 10) + 10, rows * (thumb + 10) + 10), (200, 200, 200))
    for i, (_, img) in enumerate(items):
        r, c = divmod(i, cols)
        sheet.paste(img.resize((thumb, thumb)), (10 + c * (thumb + 10), 10 + r * (thumb + 10)))
    sheet.save(path)


def main() -> None:
    all_items = []
    for lesson in LESSONS:
        out_dir = OUT_ROOT / lesson.week
        out_dir.mkdir(parents=True, exist_ok=True)
        for word, img in process(lesson):
            img.save(out_dir / f"{word}.png", optimize=True)
            all_items.append((word, img))
            print(f"saved {lesson.week}/{word}.png")
    sheet_path = Path(os.environ.get("TEMP", "/tmp")) / "super_kids_contact_sheet.png"
    contact_sheet(all_items, sheet_path)
    print(f"contact sheet: {sheet_path}")


if __name__ == "__main__":
    sys.exit(main())
