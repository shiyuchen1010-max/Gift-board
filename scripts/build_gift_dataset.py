import colorsys
import json
import os
import re
import shutil
from statistics import median

from PIL import Image, ImageChops, ImageStat

WORK_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.join(WORK_DIR, "extracted_gifts")
CONFIG_DIR = os.path.join(WORK_DIR, "gift_analysis_config")
WEB_PUBLIC_DIR = os.path.join(WORK_DIR, "gift_analysis_web", "public")
WEB_DATA_DIR = os.path.join(WEB_PUBLIC_DIR, "data")
WEB_GIFTS_DIR = os.path.join(WEB_PUBLIC_DIR, "gifts")
BADGE_SAMPLE_FILE = os.path.join(ROOT_DIR, "角标映射示例.txt")
MANUAL_REVIEW_FILE = os.path.join(CONFIG_DIR, "manual_badge_reviews.json")
WEB_MANUAL_REVIEW_FILE = os.path.join(WEB_DATA_DIR, "manual_badge_reviews.json")

VALID_FOLDERS = ("classic", "activity", "member", "royal")
EXTENSION = ".png"
IMAGE_SIZE = (64, 64)
FILENAME_RE = re.compile(r"^(\d+)_s(\d+)_r(\d)c(\d)_(.+)$", re.IGNORECASE)
PRICE_RE = re.compile(r"^(.*)_(\d+|Select_gift)$")


BADGE_LABELS = {
    "color-customized": "颜色定制",
    "weekly-gifts": "周礼物",
    "monthly-gifts": "月礼物",
    "mystery-gifts-box": "盲盒礼物",
    "on-mic-effect": "上麦特效",
    "cumulative-gift": "累计礼物",
    "profile-display": "主页展示",
    "upgrade-gift": "升级礼物",
    "sound-effect": "音效礼物",
    "show-all-rooms": "全房间展示",
    "unknown-badge": "待确认角标",
}

BADGE_COLORS = {
    "color-customized": "#60A5FA",
    "weekly-gifts": "#A855F7",
    "monthly-gifts": "#D946EF",
    "mystery-gifts-box": "#F59E0B",
    "on-mic-effect": "#3B82F6",
    "cumulative-gift": "#22C55E",
    "profile-display": "#8B5CF6",
    "upgrade-gift": "#EC4899",
    "sound-effect": "#06B6D4",
    "show-all-rooms": "#F97316",
    "unknown-badge": "#94A3B8",
}

PRICE_TIERS = [
    (0, 99, "低价"),
    (100, 999, "中价"),
    (1000, 5999, "高价"),
    (6000, 19999, "超高价"),
    (20000, 999999999, "收藏级"),
]


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def humanize_slug(text: str) -> str:
    return text.replace("-", " ").replace("_", " ").title()


def make_gift_id(record: dict) -> str:
    return f"{record['folder']}::{record['slotRaw']}_s{record['screen']:02d}_r{record['row']}c{record['col']}"


def get_price_tier(price: int | None) -> str:
    if price is None:
        return "未定价"
    for min_price, max_price, label in PRICE_TIERS:
        if min_price <= price <= max_price:
            return label
    return "未定价"


def parse_filename(folder: str, file_name: str) -> dict | None:
    stem = os.path.splitext(file_name)[0]
    has_badge_suffix = stem.endswith("_badge")
    stem_without_badge = stem[:-6] if has_badge_suffix else stem

    currency = None
    for label in ("_Gold", "_Diamond"):
        if stem_without_badge.endswith(label):
            currency = label[1:]
            stem_without_badge = stem_without_badge[: -len(label)]
            break

    match = FILENAME_RE.match(stem_without_badge)
    if not match:
        return None

    slot_raw, screen, row, col, name_and_price = match.groups()
    price_match = PRICE_RE.match(name_and_price)
    gift_name_stem = name_and_price
    price_label = ""
    if price_match:
        gift_name_stem = price_match.group(1)
        price_label = price_match.group(2)

    price_value = int(price_label) if price_label.isdigit() else None
    record = {
        "folder": folder,
        "fileName": file_name,
        "fileStem": stem,
        "imagePath": os.path.join(ROOT_DIR, folder, file_name),
        "relativeImagePath": f"gifts/{folder}/{file_name}",
        "slotRaw": slot_raw,
        "slot": int(slot_raw),
        "screen": int(screen),
        "row": int(row),
        "col": int(col),
        "name": gift_name_stem.replace("_", " "),
        "nameStem": gift_name_stem,
        "priceLabel": price_label,
        "price": price_value,
        "currency": currency,
        "hasFilenameBadgeSuffix": has_badge_suffix,
    }
    record["id"] = make_gift_id(record)
    record["priceTier"] = get_price_tier(price_value)
    return record


def collect_gift_records() -> list[dict]:
    records = []
    for folder in VALID_FOLDERS:
        folder_path = os.path.join(ROOT_DIR, folder)
        for file_name in sorted(os.listdir(folder_path)):
            if not file_name.lower().endswith(EXTENSION):
                continue
            if file_name == "preview_first_screen.png":
                continue
            parsed = parse_filename(folder, file_name)
            if parsed:
                records.append(parsed)
    return records


def load_badge_samples() -> dict[str, list[str]]:
    mapping: dict[str, list[str]] = {}
    current_code = None
    with open(BADGE_SAMPLE_FILE, "r", encoding="utf-8") as file:
        for raw_line in file:
            line = raw_line.strip()
            if not line:
                continue
            if line.startswith("#"):
                current_code = line[1:].strip().lower()
                mapping.setdefault(current_code, [])
                continue
            if current_code:
                sample_stem = line.removesuffix(EXTENSION)
                if sample_stem not in mapping[current_code]:
                    mapping[current_code].append(sample_stem)
    return mapping


def build_stem_index(records: list[dict]) -> dict[str, dict]:
    return {record["fileStem"]: record for record in records}


def load_manual_reviews() -> dict[str, dict]:
    if not os.path.isfile(MANUAL_REVIEW_FILE):
        return {}
    with open(MANUAL_REVIEW_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)
    if not isinstance(data, list):
        return {}

    review_map = {}
    for item in data:
        if not isinstance(item, dict) or not item.get("giftId"):
            continue
        review_map[item["giftId"]] = {
            "reviewStatus": item.get("reviewStatus", "pending"),
            "reviewHasBadge": item.get("reviewHasBadge"),
            "reviewBadgeType": item.get("reviewBadgeType"),
            "notes": item.get("notes", ""),
        }
    return review_map


def get_badge_label(badge_type: str | None) -> str:
    if not badge_type:
        return "无角标"
    return BADGE_LABELS.get(badge_type, humanize_slug(badge_type))


def apply_manual_review(predicted_result: dict, review_entry: dict | None) -> dict:
    if not review_entry:
        return predicted_result

    review_status = review_entry.get("reviewStatus", "pending")
    if review_status == "confirmed":
        return {
            **predicted_result,
            "confidence": 1.0,
            "source": "manual-confirmed",
        }

    if review_status == "corrected":
        has_badge = bool(review_entry.get("reviewHasBadge"))
        badge_type = review_entry.get("reviewBadgeType")
        if has_badge and not badge_type:
            badge_type = predicted_result.get("badgeType") or "unknown-badge"
        if not has_badge:
            badge_type = None
        return {
            "hasBadge": has_badge,
            "badgeType": badge_type,
            "confidence": 1.0,
            "bestScore": predicted_result.get("bestScore"),
            "bbox": predicted_result.get("bbox"),
            "source": "manual-corrected",
        }

    return predicted_result


def build_manual_review_entry(record: dict, predicted_result: dict, final_result: dict, review_entry: dict | None) -> dict:
    review_status = review_entry.get("reviewStatus", "pending") if review_entry else "pending"
    review_has_badge = review_entry.get("reviewHasBadge") if review_entry else None
    review_badge_type = review_entry.get("reviewBadgeType") if review_entry else None
    notes = review_entry.get("notes", "") if review_entry else ""
    return {
        "giftId": record["id"],
        "folder": record["folder"],
        "fileName": record["fileName"],
        "relativeImagePath": record["relativeImagePath"],
        "name": record["name"],
        "predictedHasBadge": predicted_result["hasBadge"],
        "predictedBadgeType": predicted_result["badgeType"],
        "predictedBadgeLabel": get_badge_label(predicted_result["badgeType"]),
        "predictedConfidence": predicted_result["confidence"],
        "predictedSource": predicted_result["source"],
        "finalHasBadge": final_result["hasBadge"],
        "finalBadgeType": final_result["badgeType"],
        "finalBadgeLabel": get_badge_label(final_result["badgeType"]),
        "reviewStatus": review_status,
        "reviewHasBadge": review_has_badge,
        "reviewBadgeType": review_badge_type,
        "reviewBadgeLabel": get_badge_label(review_badge_type),
        "notes": notes,
        "bbox": predicted_result.get("bbox"),
        "bestScore": predicted_result.get("bestScore"),
    }


def get_search_box(image: Image.Image) -> tuple[int, int, int, int]:

    width, height = image.size
    return (int(width * 0.55), 0, width, int(height * 0.30))


def is_hot_pixel(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    return v >= 0.38 and (s >= 0.2 or v >= 0.8) and h <= 0.96


def locate_badge_bbox(image: Image.Image, profile: dict | None = None) -> tuple[int, int, int, int] | None:
    left, top, right, bottom = get_search_box(image)
    search = image.crop((left, top, right, bottom)).convert("RGB")
    width, height = search.size
    active = [False] * (width * height)

    for y in range(height):
        for x in range(width):
            if x < int(width * 0.32) or y > int(height * 0.78):
                continue
            index = y * width + x
            active[index] = is_hot_pixel(search.getpixel((x, y)))


    visited = [False] * len(active)
    best = None
    best_score = -1.0
    min_width = profile["minWidth"] if profile else 18
    min_height = profile["minHeight"] if profile else 18
    max_width = profile["maxWidth"] if profile else width
    max_height = profile["maxHeight"] if profile else height

    for index, flag in enumerate(active):
        if not flag or visited[index]:
            continue
        stack = [index]
        visited[index] = True
        area = 0
        min_x = width
        max_x = 0
        min_y = height
        max_y = 0

        while stack:
            current = stack.pop()
            x = current % width
            y = current // width
            area += 1
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)
            for neighbor in (current - 1, current + 1, current - width, current + width):
                if neighbor < 0 or neighbor >= len(active) or visited[neighbor] or not active[neighbor]:
                    continue
                nx = neighbor % width
                ny = neighbor // width
                if abs(nx - x) + abs(ny - y) != 1:
                    continue
                visited[neighbor] = True
                stack.append(neighbor)

        box_width = max_x - min_x + 1
        box_height = max_y - min_y + 1
        touches_corner = max_x >= int(width * 0.72) and min_y <= int(height * 0.28)
        in_size_range = min_width <= box_width <= max_width and min_height <= box_height <= max_height
        if area < 70 or not touches_corner or not in_size_range:
            continue

        score = area + box_width * 1.4 + box_height * 1.1 + max_x * 0.25 - min_y * 0.4
        if score > best_score:
            best_score = score
            padding = 5
            best = (
                max(left + min_x - padding, left),
                max(top + min_y - padding, top),
                min(left + max_x + 1 + padding, right),
                min(top + max_y + 1 + padding, bottom),
            )
    return best


def normalize_crop(image: Image.Image, bbox: tuple[int, int, int, int]) -> Image.Image:
    return image.crop(bbox).convert("RGB").resize(IMAGE_SIZE)


def mean_abs_diff(image_a: Image.Image, image_b: Image.Image) -> float:
    diff = ImageChops.difference(image_a, image_b)
    stats = ImageStat.Stat(diff)
    return sum(stats.mean) / len(stats.mean)


def build_template_library(sample_map: dict[str, list[str]], stem_index: dict[str, dict]) -> tuple[list[dict], dict]:
    templates = []
    widths = []
    heights = []
    for badge_code, stems in sample_map.items():
        for stem in stems:
            record = stem_index[stem]
            image = Image.open(record["imagePath"])
            bbox = locate_badge_bbox(image, None)
            if not bbox:
                continue
            crop = normalize_crop(image, bbox)
            templates.append({
                "badgeType": badge_code,
                "fileStem": stem,
                "bbox": bbox,
                "image": crop,
            })
            widths.append(bbox[2] - bbox[0])
            heights.append(bbox[3] - bbox[1])
    profile = {
        "minWidth": max(18, int(min(widths) * 0.75)),
        "maxWidth": int(max(widths) * 1.35),
        "minHeight": max(18, int(min(heights) * 0.75)),
        "maxHeight": int(max(heights) * 1.35),
        "medianWidth": int(median(widths)),
        "medianHeight": int(median(heights)),
    }
    return templates, profile


def classify_badge(record: dict, sample_lookup: dict[str, str], templates: list[dict], profile: dict) -> dict:
    if record["fileStem"] in sample_lookup:
        return {
            "hasBadge": True,
            "badgeType": sample_lookup[record["fileStem"]],
            "confidence": 1.0,
            "bestScore": 0.0,
            "bbox": None,
            "source": "sample-seed",
        }

    image = Image.open(record["imagePath"])
    bbox = locate_badge_bbox(image, profile)
    if not bbox:
        return {
            "hasBadge": False,
            "badgeType": None,
            "confidence": 0.0,
            "bestScore": None,
            "bbox": None,
            "source": "detector-none",
        }

    crop = normalize_crop(image, bbox)
    scored = []
    for template in templates:
        score = mean_abs_diff(crop, template["image"])
        scored.append((score, template["badgeType"]))
    scored.sort(key=lambda item: item[0])
    best_score, best_type = scored[0]
    second_score = scored[1][0] if len(scored) > 1 else best_score + 20
    confidence = max(0.0, min(1.0, ((second_score - best_score) + (55 - best_score)) / 70))
    badge_type = best_type if best_score <= 38 else "unknown-badge"
    has_badge = best_score <= 52
    return {
        "hasBadge": has_badge,
        "badgeType": badge_type if has_badge else None,
        "confidence": round(confidence, 3) if has_badge else 0.0,
        "bestScore": round(best_score, 3),
        "bbox": list(bbox),
        "source": "template-match" if has_badge else "detector-low-score",
    }


def build_badge_definitions(sample_map: dict[str, list[str]]) -> list[dict]:
    definitions = []
    for badge_code in list(sample_map.keys()) + ["unknown-badge"]:
        code = badge_code.lower()
        definitions.append({
            "code": code,
            "label": BADGE_LABELS.get(code, humanize_slug(code)),
            "gameplay": BADGE_LABELS.get(code, humanize_slug(code)),
            "description": "待补充玩法说明" if code != "unknown-badge" else "识别到角标但暂未可靠归类",
            "color": BADGE_COLORS.get(code, "#94A3B8"),
            "sampleCount": len(sample_map.get(code, [])),
        })
    return definitions


def export_images(records: list[dict]) -> None:
    if os.path.isdir(WEB_GIFTS_DIR):
        shutil.rmtree(WEB_GIFTS_DIR)
    for record in records:
        target_dir = os.path.join(WEB_GIFTS_DIR, record["folder"])
        ensure_dir(target_dir)
        shutil.copy2(record["imagePath"], os.path.join(target_dir, record["fileName"]))


def main() -> None:
    ensure_dir(CONFIG_DIR)
    ensure_dir(WEB_DATA_DIR)
    records = collect_gift_records()
    sample_map = load_badge_samples()
    stem_index = build_stem_index(records)
    sample_lookup = {stem: badge for badge, stems in sample_map.items() for stem in stems}
    templates, profile = build_template_library(sample_map, stem_index)
    manual_review_map = load_manual_reviews()

    gift_records = []
    bindings = []
    review_queue = []
    for record in records:
        predicted_result = classify_badge(record, sample_lookup, templates, profile)
        review_entry = manual_review_map.get(record["id"])
        badge_result = apply_manual_review(predicted_result, review_entry)
        gameplay_type = badge_result["badgeType"] if badge_result["badgeType"] not in (None, "unknown-badge") else None
        gift_record = {
            **record,
            "hasBadge": badge_result["hasBadge"],
            "badgeType": badge_result["badgeType"],
            "gameplayType": gameplay_type,
            "badgeConfidence": badge_result["confidence"],
        }
        gift_records.append(gift_record)
        bindings.append({
            "giftId": record["id"],
            "folder": record["folder"],
            "fileName": record["fileName"],
            "badgeType": badge_result["badgeType"],
            "hasBadge": badge_result["hasBadge"],
            "confidence": badge_result["confidence"],
            "source": badge_result["source"],
            "bbox": badge_result["bbox"],
            "bestScore": badge_result["bestScore"],
            "reviewRequired": predicted_result["confidence"] < 1.0,
            "reviewStatus": review_entry.get("reviewStatus", "pending") if review_entry else "pending",
        })
        if predicted_result["confidence"] < 1.0:
            review_queue.append(build_manual_review_entry(record, predicted_result, badge_result, review_entry))

    review_queue.sort(key=lambda item: (item["reviewStatus"] != "pending", item["predictedConfidence"], item["folder"], item["giftId"]))
    pending_review_count = sum(1 for item in review_queue if item["reviewStatus"] == "pending")
    reviewed_count = len(review_queue) - pending_review_count

    badge_definitions = build_badge_definitions(sample_map)
    export_images(records)

    with open(os.path.join(CONFIG_DIR, "badge_definitions.json"), "w", encoding="utf-8") as file:
        json.dump(badge_definitions, file, ensure_ascii=False, indent=2)
    with open(os.path.join(CONFIG_DIR, "gift_badge_bindings.json"), "w", encoding="utf-8") as file:
        json.dump(bindings, file, ensure_ascii=False, indent=2)
    with open(MANUAL_REVIEW_FILE, "w", encoding="utf-8") as file:
        json.dump(review_queue, file, ensure_ascii=False, indent=2)
    with open(os.path.join(WEB_DATA_DIR, "gifts.json"), "w", encoding="utf-8") as file:
        json.dump(gift_records, file, ensure_ascii=False, indent=2)
    with open(os.path.join(WEB_DATA_DIR, "badge_definitions.json"), "w", encoding="utf-8") as file:
        json.dump(badge_definitions, file, ensure_ascii=False, indent=2)
    with open(WEB_MANUAL_REVIEW_FILE, "w", encoding="utf-8") as file:
        json.dump(review_queue, file, ensure_ascii=False, indent=2)
    with open(os.path.join(WEB_DATA_DIR, "badge_recognition_report.json"), "w", encoding="utf-8") as file:
        json.dump({
            "giftCount": len(gift_records),
            "templateCount": len(templates),
            "detectionProfile": profile,
            "reviewQueueCount": len(review_queue),
            "pendingReviewCount": pending_review_count,
            "reviewedCount": reviewed_count,
            "lowConfidence": [item for item in review_queue if item["predictedHasBadge"] and item["predictedConfidence"] < 0.6],
        }, file, ensure_ascii=False, indent=2)

    print(json.dumps({
        "giftCount": len(gift_records),
        "templateCount": len(templates),
        "reviewQueueCount": len(review_queue),
        "pendingReviewCount": pending_review_count,
        "reviewedCount": reviewed_count,
        "output": {
            "gifts": os.path.join(WEB_DATA_DIR, "gifts.json"),
            "bindings": os.path.join(CONFIG_DIR, "gift_badge_bindings.json"),
            "manualReviews": MANUAL_REVIEW_FILE,
        },
    }, ensure_ascii=False, indent=2))



if __name__ == "__main__":
    main()
