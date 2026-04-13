import os
import re
from collections import defaultdict

ROOT_DIR = r"c:\Users\V_Shyschen\CodeBuddy\20260410162015\extracted_gifts"

IMAGE_EXTENSIONS = (".png",)
GENERIC_SLOT_RE = re.compile(r"^(\d+_s\d+_r\d+c\d+)\.png$", re.IGNORECASE)
CLASSIC_PREFIX_RE = re.compile(r"^(\d+_s\d+_r\d+c\d+)(?:_.*)?\.png$", re.IGNORECASE)
METADATA_PREFIX_RE = re.compile(r"^(\d+)_s(\d+)_r(\d)c(\d)(?:_.*)?\.png$", re.IGNORECASE)

CLASSIC_SPECIAL_CASES = {

    45: ("Crystal Diamond", "1999"),
    129: ("Island", "169999"),
    130: ("Aerobatic Flight", "169999"),
    131: ("Meteor Shower", "199999"),
    132: ("Castle", "199999"),
    133: ("Gift Box", "Select gift"),
}

CLASSIC_GOLD_SLOTS = {1, 16}
CLASSIC_GOLD_LABEL = "Gold"
CLASSIC_DIAMOND_LABEL = "Diamond"

FOLDER_CURRENCY_LABELS = {
    "activity": CLASSIC_DIAMOND_LABEL,
    "member": CLASSIC_DIAMOND_LABEL,
    "royal": CLASSIC_DIAMOND_LABEL,
}

FOLDER_METADATA = {



    "activity": [
        [
            ("Delicious Iftar", "1999"),
            ("Little Sunflower", "3"),
            ("Birthday", "199"),
            ("Happy Birthday", "9"),
            ("Birthday Party", "5999"),
            None,
            None,
            None,
        ]
    ],
    "member": [
        [
            ("Nice", "9"),
            ("Starlight Bottle", "19"),
            ("Fiery Heart", "29"),
            ("Fruit Basket", "399"),
            ("Hawk Necklace", "699"),
            ("Hawk", "2999"),
            ("Firebird", "4999"),
            ("Train", "5999"),
        ],
        [
            ("Hawk Necklace", "699"),
            ("Hawk", "2999"),
            ("Firebird", "4999"),
            ("Train", "5999"),
            ("Love Match", "5999"),
            ("Fountain of Love", "5999"),
            None,
            None,
        ],
    ],
    "royal": [
        [
            ("Night Race Car", "5999"),
            ("Chess", "19"),
            ("Saxophone", "399"),
            ("Premium Cake", "7999"),
            ("Green Heaven", "6999"),
            ("Blue Diamond", "5999"),
            ("Shining Heart", "29"),
            ("Hourglass", "29"),
        ],
        [
            ("Horse Bracelet", "199"),
            ("Violin", "399"),
            ("Crown", "999"),
            ("Sword of Glory", "1999"),
            ("Rose Beauty", "2999"),
            None,
            None,
            None,
        ],
    ],
}

GUESSED_NAMES = {
    "activity": ["Delicious Iftar", "Little Sunflower", "Happy Birthday", "Birthday Party"],
    "member": ["Starlight Bottle", "Fountain of Love"],
    "royal": ["Night Race Car", "Premium Cake", "Green Heaven", "Blue Diamond", "Horse Bracelet", "Sword of Glory"],
}


def sanitize(text: str) -> str:
    return (
        text.replace(" ", "_")
        .replace("/", "_")
        .replace("!", "")
        .replace("&", "and")
        .replace(",", "")
        .replace("'", "")
        .replace("..", "")
    )



def rename_file(folder_path, old_name, new_name):
    old_path = os.path.join(folder_path, old_name)
    new_path = os.path.join(folder_path, new_name)
    if old_name == new_name:
        return False
    if not os.path.exists(old_path):
        return False
    if os.path.exists(new_path):
        raise FileExistsError(f"目标文件已存在: {new_name}")
    os.rename(old_path, new_path)
    return True



def get_classic_currency(slot: int) -> str:
    return CLASSIC_GOLD_LABEL if slot in CLASSIC_GOLD_SLOTS else CLASSIC_DIAMOND_LABEL



def strip_classic_currency_marker(suffix_stem: str) -> str:
    if suffix_stem.endswith("_badge"):
        base_stem = suffix_stem[:-6]
        parts = base_stem.split("_")
        if parts and parts[-1] in (CLASSIC_GOLD_LABEL, CLASSIC_DIAMOND_LABEL):
            base_stem = "_".join(parts[:-1])
        return f"{base_stem}_badge"

    parts = suffix_stem.split("_")
    if parts and parts[-1] in (CLASSIC_GOLD_LABEL, CLASSIC_DIAMOND_LABEL):
        return "_".join(parts[:-1])
    if len(parts) >= 2 and parts[-2] in (CLASSIC_GOLD_LABEL, CLASSIC_DIAMOND_LABEL):
        return "_".join(parts[:-2] + [parts[-1]])
    return suffix_stem



def build_classic_currency_name(prefix: str, slot: int, suffix_stem: str) -> str:
    currency = sanitize(get_classic_currency(slot))
    normalized_stem = strip_classic_currency_marker(suffix_stem)
    if normalized_stem.endswith("_badge"):
        base_stem = normalized_stem[:-6]
        return f"{prefix}_{base_stem}_{currency}_badge.png"
    return f"{prefix}_{normalized_stem}_{currency}.png"



def build_classic_target_name(file_name):
    match = CLASSIC_PREFIX_RE.match(file_name)
    if not match:
        return None

    prefix = match.group(1)
    slot = int(prefix.split("_", 1)[0])
    row_col = prefix.split("_")[-1]

    if slot in CLASSIC_SPECIAL_CASES:
        name, price = CLASSIC_SPECIAL_CASES[slot]
        currency = sanitize(get_classic_currency(slot))
        return f"{prefix}_{sanitize(name)}_{sanitize(str(price))}_{currency}.png"


    if GENERIC_SLOT_RE.match(file_name):
        return f"{prefix}_Empty_Slot_{row_col}.png"

    suffix_stem = os.path.splitext(file_name)[0][len(prefix) + 1:]
    return build_classic_currency_name(prefix, slot, suffix_stem)





def rename_classic_folder(folder_path):
    rename_records = []
    for file_name in sorted(os.listdir(folder_path)):
        if not file_name.lower().endswith(IMAGE_EXTENSIONS):
            continue
        if file_name == "preview_first_screen.png":
            continue

        new_name = build_classic_target_name(file_name)
        if not new_name:
            continue

        changed = rename_file(folder_path, file_name, new_name)
        rename_records.append((file_name, new_name, changed))
    return rename_records




def build_target_name(prefix, meta, currency_label=None):
    if meta is None:
        row_col = prefix.split("_")[-1]
        return f"{prefix}_Empty_Slot_{row_col}.png"

    name, price = meta
    base_name = f"{prefix}_{sanitize(name)}_{sanitize(str(price))}"
    if currency_label:
        return f"{base_name}_{sanitize(currency_label)}.png"
    return f"{base_name}.png"



def rename_folder_by_metadata(folder_name, folder_path, metadata):
    rename_records = []
    by_screen = defaultdict(dict)
    currency_label = FOLDER_CURRENCY_LABELS.get(folder_name)

    for file_name in os.listdir(folder_path):
        if not file_name.lower().endswith(IMAGE_EXTENSIONS):
            continue
        if file_name == "preview_first_screen.png":
            continue

        match = METADATA_PREFIX_RE.match(file_name)
        if not match:
            continue

        prefix = f"{match.group(1)}_s{match.group(2)}_r{match.group(3)}c{match.group(4)}"
        slot = int(match.group(1))
        screen = int(match.group(2))
        by_screen[screen][slot] = (file_name, prefix)

    for screen_idx, screen_meta in enumerate(metadata, start=1):
        screen_files = by_screen.get(screen_idx, {})
        for slot_idx in range(1, 9):
            entry = screen_files.get(slot_idx)
            if not entry:
                continue

            old_name, prefix = entry
            meta = screen_meta[slot_idx - 1]
            new_name = build_target_name(prefix, meta, currency_label)
            changed = rename_file(folder_path, old_name, new_name)
            rename_records.append((old_name, new_name, changed))

    return rename_records




def write_folder_summary(folder_path, folder_name, records):
    summary_path = os.path.join(folder_path, "rename_list.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(f"文件夹: {folder_name}\n")
        f.write("=" * 60 + "\n")
        f.write(f"重命名数量: {sum(1 for _, _, changed in records if changed)}\n")
        f.write(f"保持不变: {sum(1 for _, _, changed in records if not changed)}\n\n")
        for old_name, new_name, changed in records:
            status = "已重命名" if changed else "未改动"
            f.write(f"[{status}] {old_name} -> {new_name}\n")
    return summary_path



def write_root_summary(summary_map):
    summary_path = os.path.join(ROOT_DIR, "rename_summary.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write("礼物分割图重命名结果\n")
        f.write("=" * 60 + "\n\n")
        for folder_name, info in summary_map.items():
            f.write(f"[{folder_name}]\n")
            f.write(f"- 处理记录数: {len(info['records'])}\n")
            f.write(f"- 实际重命名: {sum(1 for _, _, changed in info['records'] if changed)}\n")
            f.write(f"- 目录清单: {info['summary_path']}\n")
            guessed = GUESSED_NAMES.get(folder_name)
            if guessed:
                f.write(f"- 含推断补全名称: {', '.join(guessed)}\n")
            f.write("\n")
    return summary_path



def main():
    summary_map = {}

    classic_path = os.path.join(ROOT_DIR, "classic")
    classic_records = rename_classic_folder(classic_path)
    summary_map["classic"] = {
        "records": classic_records,
        "summary_path": write_folder_summary(classic_path, "classic", classic_records),
    }

    for folder_name, metadata in FOLDER_METADATA.items():
        folder_path = os.path.join(ROOT_DIR, folder_name)
        records = rename_folder_by_metadata(folder_name, folder_path, metadata)
        summary_map[folder_name] = {
            "records": records,
            "summary_path": write_folder_summary(folder_path, folder_name, records),
        }

    root_summary = write_root_summary(summary_map)
    print(root_summary)


if __name__ == "__main__":
    main()
