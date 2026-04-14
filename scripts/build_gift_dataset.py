import colorsys
import json
import os
import re
import shutil
from collections import Counter
from statistics import median

from PIL import Image, ImageChops, ImageStat

WORK_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.join(WORK_DIR, "extracted_gifts")
CONFIG_DIR = os.path.join(WORK_DIR, "gift_analysis_config")
WEB_PUBLIC_DIR = os.path.join(WORK_DIR, "gift_analysis_web", "public")
WEB_DATA_DIR = os.path.join(WEB_PUBLIC_DIR, "data")
WEB_GIFTS_DIR = os.path.join(WEB_PUBLIC_DIR, "gifts")
BADGE_SAMPLE_FILE = os.path.join(ROOT_DIR, "角标映射示例.txt")
BADGE_RULE_FILE = os.path.join(ROOT_DIR, "角标规则说明.txt")
MANUAL_REVIEW_FILE = os.path.join(CONFIG_DIR, "manual_badge_reviews.json")
WEB_MANUAL_REVIEW_FILE = os.path.join(WEB_DATA_DIR, "manual_badge_reviews.json")

VALID_FOLDERS = ("classic", "activity", "member", "royal")
EXTENSION = ".png"
IMAGE_SIZE = (64, 64)
FILENAME_RE = re.compile(r"^(\d+)_s(\d+)_r(\d)c(\d)_(.+)$", re.IGNORECASE)
PRICE_RE = re.compile(r"^(.*)_(\d+|Select_gift)$")
RULE_HEADER_RE = re.compile(r"^\d+\.\s+([A-Za-z-]+)\s+\(")

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

FOLDER_LABELS = {
    "classic": "经典礼物",
    "activity": "活动礼物",
    "member": "会员礼物",
    "royal": "贵族礼物",
}

PRICE_TIERS = [
    (0, 99, "低价"),
    (100, 999, "中价"),
    (1000, 5999, "高价"),
    (6000, 19999, "超高价"),
    (20000, 999999999, "收藏级"),
]

LUDO_OPEN_QUESTIONS = [
    "当前 Facebook Ludo 是否存在局内礼物动效层与结算页弹层资源位，需要产品与前端进一步确认。",
    "是否已有好友关系、战队或赛季通行证体系可承接礼物排行榜，需要与现有社交系统对齐。",
    "Facebook 支付、广告变现与虚拟币体系的最终组合策略尚未给定，需结合发行区域与风控要求定案。",
]


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def write_json(path: str, payload: object) -> None:
    with open(path, "w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)


def humanize_slug(text: str) -> str:
    return text.replace("-", " ").replace("_", " ").title()


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


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
            if not file_name.lower().endswith(EXTENSION) or file_name == "preview_first_screen.png":
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


def load_badge_rules() -> dict[str, str]:
    if not os.path.isfile(BADGE_RULE_FILE):
        return {}
    rules: dict[str, list[str]] = {}
    current_code = None
    with open(BADGE_RULE_FILE, "r", encoding="utf-8") as file:
        for raw_line in file:
            line = raw_line.strip()
            if not line:
                continue
            header_match = RULE_HEADER_RE.match(line)
            if header_match:
                current_code = slugify(header_match.group(1))
                rules.setdefault(current_code, [])
                continue
            if not current_code:
                continue
            normalized_line = line.replace("规则描述：", "", 1).strip()
            rules[current_code].append(normalized_line)
    return {code: "\n".join(lines) for code, lines in rules.items() if lines}


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
        return {**predicted_result, "confidence": 1.0, "source": "manual-confirmed"}
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
            record = stem_index.get(stem)
            if not record:
                continue
            image = Image.open(record["imagePath"])
            bbox = locate_badge_bbox(image, None)
            if not bbox:
                continue
            crop = normalize_crop(image, bbox)
            templates.append({"badgeType": badge_code, "fileStem": stem, "bbox": bbox, "image": crop})
            widths.append(bbox[2] - bbox[0])
            heights.append(bbox[3] - bbox[1])
    if not templates:
        return [], {"minWidth": 18, "maxWidth": 64, "minHeight": 18, "maxHeight": 64, "medianWidth": 24, "medianHeight": 24}
    return templates, {
        "minWidth": max(18, int(min(widths) * 0.75)),
        "maxWidth": int(max(widths) * 1.35),
        "minHeight": max(18, int(min(heights) * 0.75)),
        "maxHeight": int(max(heights) * 1.35),
        "medianWidth": int(median(widths)),
        "medianHeight": int(median(heights)),
    }


def classify_badge(record: dict, sample_lookup: dict[str, str], templates: list[dict], profile: dict) -> dict:
    if record["fileStem"] in sample_lookup:
        return {"hasBadge": True, "badgeType": sample_lookup[record["fileStem"]], "confidence": 1.0, "bestScore": 0.0, "bbox": None, "source": "sample-seed"}
    image = Image.open(record["imagePath"])
    bbox = locate_badge_bbox(image, profile)
    if not bbox or not templates:
        return {"hasBadge": False, "badgeType": None, "confidence": 0.0, "bestScore": None, "bbox": None, "source": "detector-none"}
    crop = normalize_crop(image, bbox)
    scored = [(mean_abs_diff(crop, template["image"]), template["badgeType"]) for template in templates]
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


def build_badge_definitions(sample_map: dict[str, list[str]], badge_rules: dict[str, str]) -> list[dict]:
    definitions = []
    for badge_code in list(sample_map.keys()) + ["unknown-badge"]:
        code = badge_code.lower()
        definitions.append({
            "code": code,
            "label": BADGE_LABELS.get(code, humanize_slug(code)),
            "gameplay": BADGE_LABELS.get(code, humanize_slug(code)),
            "description": badge_rules.get(code, "识别到角标但暂未可靠归类" if code == "unknown-badge" else "待补充玩法说明"),
            "color": BADGE_COLORS.get(code, "#94A3B8"),
            "sampleCount": len(sample_map.get(code, [])),
        })
    return definitions


def build_gift_system_analysis(gift_records: list[dict], badge_definitions: list[dict]) -> dict:
    priced_gifts = [gift for gift in gift_records if isinstance(gift.get("price"), int)]
    badge_gifts = [gift for gift in gift_records if gift.get("hasBadge")]
    priced_values = [gift["price"] for gift in priced_gifts]
    folder_counts = Counter(gift["folder"] for gift in gift_records)
    currency_counts = Counter((gift.get("currency") or "未标注") for gift in gift_records)
    price_tier_counts = Counter(gift["priceTier"] for gift in gift_records)
    badge_counts = Counter(gift["badgeType"] for gift in badge_gifts if gift.get("badgeType"))
    badge_map = {badge["code"]: badge for badge in badge_definitions}
    gameplay_breakdown = []
    for badge_code, count in badge_counts.most_common():
        matched = [gift for gift in gift_records if gift.get("badgeType") == badge_code]
        matched_prices = [gift["price"] for gift in matched if isinstance(gift.get("price"), int)]
        folders = Counter(gift["folder"] for gift in matched)
        top_folder = folders.most_common(1)[0] if folders else None
        gameplay_breakdown.append({
            "code": badge_code,
            "label": badge_map.get(badge_code, {}).get("label", get_badge_label(badge_code)),
            "description": badge_map.get(badge_code, {}).get("description", ""),
            "count": count,
            "coverage": round(count / len(gift_records), 4) if gift_records else 0,
            "averagePrice": round(sum(matched_prices) / len(matched_prices), 2) if matched_prices else 0,
            "maxPrice": max(matched_prices) if matched_prices else 0,
            "dominantFolder": FOLDER_LABELS.get(top_folder[0], top_folder[0]) if top_folder else "未知",
            "sampleNames": [gift["name"] for gift in matched[:4]],
        })
    top_gifts = sorted(priced_gifts, key=lambda gift: gift["price"], reverse=True)[:8]
    folder_badge_coverage = []
    for folder in VALID_FOLDERS:
        folder_gifts = [gift for gift in gift_records if gift["folder"] == folder]
        folder_badges = [gift for gift in folder_gifts if gift.get("hasBadge")]
        folder_badge_coverage.append({
            "folder": folder,
            "label": FOLDER_LABELS.get(folder, folder),
            "count": len(folder_gifts),
            "badgeCount": len(folder_badges),
            "badgeRate": round(len(folder_badges) / len(folder_gifts), 4) if folder_gifts else 0,
        })
    return {
        "summary": {
            "giftCount": len(gift_records),
            "badgeGiftCount": len(badge_gifts),
            "badgeCoverage": round(len(badge_gifts) / len(gift_records), 4) if gift_records else 0,
            "pricedGiftCount": len(priced_gifts),
            "averagePrice": round(sum(priced_values) / len(priced_values), 2) if priced_values else 0,
            "medianPrice": median(priced_values) if priced_values else 0,
            "maxPrice": max(priced_values) if priced_values else 0,
        },
        "priceTierDistribution": [{"name": name, "value": value} for name, value in sorted(price_tier_counts.items(), key=lambda item: item[1], reverse=True)],
        "folderDistribution": [{"name": FOLDER_LABELS.get(name, name), "value": value} for name, value in sorted(folder_counts.items(), key=lambda item: item[1], reverse=True)],
        "currencyDistribution": [{"name": name, "value": value} for name, value in sorted(currency_counts.items(), key=lambda item: item[1], reverse=True)],
        "folderBadgeCoverage": folder_badge_coverage,
        "gameplayBreakdown": gameplay_breakdown,
        "topPricedGifts": [{
            "name": gift["name"],
            "price": gift["price"],
            "folder": FOLDER_LABELS.get(gift["folder"], gift["folder"]),
            "badgeType": gift.get("badgeType"),
            "badgeLabel": get_badge_label(gift.get("badgeType")),
        } for gift in top_gifts],
        "keyFindings": [
            {
                "title": "礼物池规模偏向经典库，适合做基础消费漏斗",
                "detail": f"当前 {folder_counts.get('classic', 0)} 个经典礼物占全部礼物的 {round(folder_counts.get('classic', 0) / len(gift_records) * 100, 1) if gift_records else 0}% ，说明现有系统以常驻礼物池作为付费底座。",
            },
            {
                "title": "角标玩法已成为高价值礼物的主要差异化承载层",
                "detail": f"带角标礼物共 {len(badge_gifts)} 个，覆盖率 {round(len(badge_gifts) / len(gift_records) * 100, 1) if gift_records else 0}%；其中 {gameplay_breakdown[0]['label'] if gameplay_breakdown else '角标玩法'} 是当前数量最多的玩法。",
            },
            {
                "title": "高价锚点集中在广播与展示型玩法",
                "detail": f"最高价达到 {max(priced_values) if priced_values else 0}，当前最贵样本主要由全服广播、名片展示等强曝光玩法承载，说明价格溢价来自展示范围与社交可见度。",
            },
            {
                "title": "虚拟货币结构高度统一，便于做二次包装",
                "detail": f"{currency_counts.get('Diamond', 0)} 个礼物使用 Diamond，仅 {currency_counts.get('Gold', 0)} 个礼物使用 Gold，适合在同一虚拟币体系下叠加活动包、赛季包和排行榜驱动。",
            },
        ],
        "systemTraits": [
            "当前送礼系统不是单纯的礼物商城，而是把礼物作为曝光、榜单、身份展示与局内反馈的复合载体。",
            "玩法按“展示范围、榜单周期、音视频反馈、解锁机制”四条轴线分层，利于组合出不同价位与不同目标的商品矩阵。",
            "高价值礼物的核心卖点不是图本身，而是全房间、全服、名片绑定、音效等可传播的附加权益。",
        ],
    }


def build_facebook_ludo_plan(analysis: dict, badge_definitions: list[dict]) -> dict:
    badge_map = {badge["code"]: badge for badge in badge_definitions}
    mappings = [
        {
            "badgeCode": "profile-display",
            "badgeLabel": badge_map.get("profile-display", {}).get("label", "名片展示"),
            "currentMechanic": "礼物动效期间展示收礼人名片信息",
            "ludoAdaptation": "改为对局结算页 MVP 高亮、棋盘侧边荣誉卡和好友观战浮层展示，强化赢家与被赠方身份露出。",
            "priority": "P0",
            "fit": "高",
        },
        {
            "badgeCode": "show-all-rooms",
            "badgeLabel": badge_map.get("show-all-rooms", {}).get("label", "全服广播"),
            "currentMechanic": "送礼后触发跨房间播报",
            "ludoAdaptation": "改为大厅、赛事页、好友动态流的全局播报，避免依赖聊天室，同时保留稀缺礼物的公共曝光。",
            "priority": "P0",
            "fit": "高",
        },
        {
            "badgeCode": "weekly-gifts",
            "badgeLabel": badge_map.get("weekly-gifts", {}).get("label", "周礼物"),
            "currentMechanic": "礼物累计积分进入周榜",
            "ludoAdaptation": "映射为每周主题礼物赛季任务，与玩家、好友圈或战队榜结合，推动周活与回流。",
            "priority": "P1",
            "fit": "高",
        },
        {
            "badgeCode": "monthly-gifts",
            "badgeLabel": badge_map.get("monthly-gifts", {}).get("label", "月礼物"),
            "currentMechanic": "按房间累计月礼物并结算排行",
            "ludoAdaptation": "改为按棋桌、俱乐部、战队或赛季房间做月榜，适合承接长期荣誉与超级曝光位。",
            "priority": "P1",
            "fit": "中高",
        },
        {
            "badgeCode": "mystery-gifts-box",
            "badgeLabel": badge_map.get("mystery-gifts-box", {}).get("label", "盲盒礼物"),
            "currentMechanic": "支付固定价格随机掉落礼物",
            "ludoAdaptation": "接入 Lucky Dice / Surprise Crate，放在开局前、结算后和活动页，适合做高频抽奖消耗。",
            "priority": "P0",
            "fit": "高",
        },
        {
            "badgeCode": "upgrade-gift",
            "badgeLabel": badge_map.get("upgrade-gift", {}).get("label", "升级礼物"),
            "currentMechanic": "累计赠送解锁更高阶礼物",
            "ludoAdaptation": "改为赛季成长礼物链，结合月度通行证、连胜任务和好友互赠进度条。",
            "priority": "P1",
            "fit": "中高",
        },
        {
            "badgeCode": "cumulative-gift",
            "badgeLabel": badge_map.get("cumulative-gift", {}).get("label", "累计礼物"),
            "currentMechanic": "限时内累计达到阈值触发进阶特效",
            "ludoAdaptation": "改为多人观赛/战队众筹礼物，或在淘汰赛阶段触发团队冲刺奖池，强化协作与冲榜。",
            "priority": "P2",
            "fit": "中",
        },
        {
            "badgeCode": "on-mic-effect",
            "badgeLabel": badge_map.get("on-mic-effect", {}).get("label", "上麦特效"),
            "currentMechanic": "礼物轨迹飞向麦位头像",
            "ludoAdaptation": "改为棋盘飞线到玩家头像或棋子终点，强化局内送礼反馈，不依赖麦位与聊天室。",
            "priority": "P1",
            "fit": "中高",
        },
        {
            "badgeCode": "sound-effect",
            "badgeLabel": badge_map.get("sound-effect", {}).get("label", "音效礼物"),
            "currentMechanic": "礼物附带全房间可听音效",
            "ludoAdaptation": "改为局内短音效和结算音簇，默认弱打扰并允许一键静音，提升送礼即时爽感。",
            "priority": "P1",
            "fit": "中",
        },
        {
            "badgeCode": "color-customized",
            "badgeLabel": badge_map.get("color-customized", {}).get("label", "颜色定制"),
            "currentMechanic": "赠送前选择礼物颜色",
            "ludoAdaptation": "改为阵营色、骰子色或节庆色主题皮肤，提高复购与收藏属性。",
            "priority": "P2",
            "fit": "中",
        },
    ]
    return {
        "scenario": "无聊天室 Facebook Ludo 接入送礼系统",
        "positioning": "以棋局内反馈、结算荣誉和大厅曝光替代聊天室公屏，把送礼系统重构为“轻社交炫耀 + 赛季留存 + 高光消费”的混合增长模块。",
        "analysisContext": {
            "giftCount": analysis["summary"]["giftCount"],
            "badgeCoverage": analysis["summary"]["badgeCoverage"],
            "highestPrice": analysis["summary"]["maxPrice"],
            "dominantGameplay": analysis["gameplayBreakdown"][0]["label"] if analysis["gameplayBreakdown"] else "无",
        },
        "designPrinciples": [
            "优先占据开局前、掷骰瞬间、吃子、冲线、结算、赛季页等高情绪节点，而不是依赖聊天室对话流。",
            "把高价礼物绑定到更大范围的可见度，例如好友动态、赛事大厅、俱乐部主页和周月榜曝光位。",
            "基础礼物负责高频表达，稀有礼物负责广播与身份权益，确保消费梯度与用户分层清晰。",
        ],
        "triggerScenes": [
            {"name": "开局前赠礼", "placement": "房间准备页 / 对手确认页", "goal": "促进首单与破冰社交", "detail": "在确认入局与好友开黑时展示快捷礼物条，支持一键送 Lucky Dice 或开门红礼物。"},
            {"name": "局内高光赠礼", "placement": "掷出 6 点、吃子、连续回合、终点冲线", "goal": "强化爽点反馈", "detail": "当玩家完成高光操作时弹出轻量礼物入口，采用飞线到头像/棋子的方式表达。"},
            {"name": "结算页赠礼", "placement": "MVP 卡片、胜者页、好友复盘页", "goal": "提高高价礼物转化", "detail": "在结算页提供更完整的礼物橱窗，结合胜者名片、最佳操作和连胜信息展示。"},
            {"name": "赛季与活动页赠礼", "placement": "周赛、月赛、活动大厅", "goal": "承接榜单与长期留存", "detail": "把周礼物、月礼物、升级礼物映射到赛季活动页，形成长期消费目标。"},
        ],
        "gameplayMappings": mappings,
        "featureModules": [
            {
                "name": "轻量送礼入口",
                "summary": "在局前、局中、结算三类场景提供低打扰快捷入口。",
                "items": ["底部礼物快捷条", "高光事件触发弹层", "结算页推荐礼物卡"]
            },
            {
                "name": "曝光与排行系统",
                "summary": "用好友流、大厅位、战队榜替代聊天室广播。",
                "items": ["全局横幅播报", "好友动态卡片", "周榜/月榜/战队榜"]
            },
            {
                "name": "成长与抽奖系统",
                "summary": "通过盲盒、升级、累计机制形成复购链路。",
                "items": ["Lucky Dice 盲盒", "赛季成长礼物链", "多人众筹进度条"]
            },
        ],
        "economyLoop": [
            {"stage": "首单转化", "detail": "低价局前礼物与新手任务结合，降低第一次付费门槛。"},
            {"stage": "高光刺激", "detail": "在赢面扩大、关键掷骰和结算时推荐中高价礼物，提高情绪驱动消费。"},
            {"stage": "排行榜沉淀", "detail": "周榜、月榜和赛季成长奖励驱动持续消费与回流。"},
            {"stage": "稀缺炫耀", "detail": "把广播位、专属边框、主页荣誉卡绑定高价礼物，形成身份溢价。"},
        ],
        "riskControls": [
            {"title": "局内打扰度", "level": "高", "detail": "飞线、音效与弹层都必须做弱打扰、可跳过与静音控制，避免影响核心对局。"},
            {"title": "社交关系不足", "level": "中", "detail": "若缺少聊天室和强好友关系，需优先依赖结算页、观战流和活动大厅承接送礼曝光。"},
            {"title": "付费与概率披露", "level": "高", "detail": "盲盒与排行榜奖励必须明确概率、公示规则和结算时间，符合 Facebook 发行区合规要求。"},
        ],
        "rolloutPhases": [
            {"phase": "Phase 1", "goal": "验证送礼意愿与不打扰体验", "capabilities": ["开局前礼物", "结算页礼物", "基础飞线动效"], "metrics": ["首单转化率", "结算页送礼渗透率", "对局完成率"]},
            {"phase": "Phase 2", "goal": "引入榜单与抽奖，扩大复购", "capabilities": ["周礼物赛季榜", "Lucky Dice 盲盒", "大厅播报"], "metrics": ["周付费率", "复购率", "榜单参与人数"]},
            {"phase": "Phase 3", "goal": "做强高价值炫耀体系", "capabilities": ["月榜超级曝光", "成长礼物链", "战队众筹特效"], "metrics": ["高价礼物占比", "ARPPU", "赛季留存"]},
        ],
        "openQuestions": LUDO_OPEN_QUESTIONS,
    }


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
    badge_rules = load_badge_rules()
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
        gift_record = {**record, "hasBadge": badge_result["hasBadge"], "badgeType": badge_result["badgeType"], "gameplayType": gameplay_type, "badgeConfidence": badge_result["confidence"]}
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
    badge_definitions = build_badge_definitions(sample_map, badge_rules)
    gift_system_analysis = build_gift_system_analysis(gift_records, badge_definitions)
    ludo_plan = build_facebook_ludo_plan(gift_system_analysis, badge_definitions)

    export_images(records)
    write_json(os.path.join(CONFIG_DIR, "badge_definitions.json"), badge_definitions)
    write_json(os.path.join(CONFIG_DIR, "gift_badge_bindings.json"), bindings)
    write_json(os.path.join(CONFIG_DIR, "gift_system_analysis.json"), gift_system_analysis)
    write_json(os.path.join(CONFIG_DIR, "facebook_ludo_nochat_plan.json"), ludo_plan)
    write_json(MANUAL_REVIEW_FILE, review_queue)
    write_json(os.path.join(WEB_DATA_DIR, "gifts.json"), gift_records)
    write_json(os.path.join(WEB_DATA_DIR, "badge_definitions.json"), badge_definitions)
    write_json(os.path.join(WEB_DATA_DIR, "gift_system_analysis.json"), gift_system_analysis)
    write_json(os.path.join(WEB_DATA_DIR, "facebook_ludo_nochat_plan.json"), ludo_plan)
    write_json(WEB_MANUAL_REVIEW_FILE, review_queue)
    write_json(os.path.join(WEB_DATA_DIR, "badge_recognition_report.json"), {
        "giftCount": len(gift_records),
        "templateCount": len(templates),
        "detectionProfile": profile,
        "reviewQueueCount": len(review_queue),
        "pendingReviewCount": pending_review_count,
        "reviewedCount": reviewed_count,
        "lowConfidence": [item for item in review_queue if item["predictedHasBadge"] and item["predictedConfidence"] < 0.6],
    })

    print(json.dumps({
        "giftCount": len(gift_records),
        "templateCount": len(templates),
        "reviewQueueCount": len(review_queue),
        "pendingReviewCount": pending_review_count,
        "reviewedCount": reviewed_count,
        "output": {
            "gifts": os.path.join(WEB_DATA_DIR, "gifts.json"),
            "bindings": os.path.join(CONFIG_DIR, "gift_badge_bindings.json"),
            "analysis": os.path.join(WEB_DATA_DIR, "gift_system_analysis.json"),
            "ludoPlan": os.path.join(WEB_DATA_DIR, "facebook_ludo_nochat_plan.json"),
            "manualReviews": MANUAL_REVIEW_FILE,
        },
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
