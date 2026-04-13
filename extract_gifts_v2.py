"""
Yalla 礼物批量分割工具 V5
=========================
将多个目录中的礼物截图按 2 行 4 列均分，
并按源文件夹分别输出到 extracted_gifts/<folder_name>/。
"""

from PIL import Image
import os


SOURCE_FOLDERS = {
    "activity": r"D:\礼物截图\activity",
    "member": r"D:\礼物截图\member",
    "royal": r"D:\礼物截图\royal",
}

GRID_COLS = 4
GRID_ROWS = 2
SLOTS_PER_SCREEN = GRID_COLS * GRID_ROWS
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png")

WORK_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_ROOT = os.path.join(WORK_DIR, "extracted_gifts")
os.makedirs(OUTPUT_ROOT, exist_ok=True)


def get_image_files(folder_path):
    return sorted(
        [f for f in os.listdir(folder_path) if f.lower().endswith(IMAGE_EXTENSIONS)]
    )


def get_crop_box(img_width, img_height, col, row):
    cell_width = img_width / GRID_COLS
    cell_height = img_height / GRID_ROWS

    x1 = round(col * cell_width)
    x2 = round((col + 1) * cell_width)
    y1 = round(row * cell_height)
    y2 = round((row + 1) * cell_height)

    x1 = max(0, min(x1, img_width - 1))
    x2 = max(x1 + 1, min(x2, img_width))
    y1 = max(0, min(y1, img_height - 1))
    y2 = max(y1 + 1, min(y2, img_height))
    return x1, y1, x2, y2


def split_one_image(img_path, output_dir, screen_index):
    img = Image.open(img_path)
    results = []

    for row in range(GRID_ROWS):
        for col in range(GRID_COLS):
            slot_index = row * GRID_COLS + col + 1
            file_name = f"{slot_index:02d}_s{screen_index:02d}_r{row + 1}c{col + 1}.png"
            output_path = os.path.join(output_dir, file_name)
            crop = img.crop(get_crop_box(*img.size, col, row))
            crop.save(output_path)
            results.append(output_path)

    return results


def clear_output_dir(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for name in os.listdir(output_dir):
        if name.lower().endswith((".png", ".txt")):
            os.remove(os.path.join(output_dir, name))


def build_preview_sheet(image_paths, output_path):
    images = [Image.open(path) for path in image_paths]
    if not images:
        return

    max_width = max(img.width for img in images)
    max_height = max(img.height for img in images)
    padding = 16
    canvas_width = GRID_COLS * max_width + (GRID_COLS + 1) * padding
    canvas_height = GRID_ROWS * max_height + (GRID_ROWS + 1) * padding
    canvas = Image.new("RGB", (canvas_width, canvas_height), (6, 18, 34))

    for idx, img in enumerate(images):
        row = idx // GRID_COLS
        col = idx % GRID_COLS
        x = padding + col * (max_width + padding) + (max_width - img.width) // 2
        y = padding + row * (max_height + padding) + (max_height - img.height) // 2
        canvas.paste(img.convert("RGB"), (x, y))

    canvas.save(output_path)


def write_folder_summary(folder_name, output_dir, image_files, generated_files):
    summary_path = os.path.join(output_dir, "split_list.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(f"文件夹: {folder_name}\n")
        f.write("=" * 60 + "\n")
        f.write(f"源目录: {SOURCE_FOLDERS[folder_name]}\n")
        f.write(f"截图数量: {len(image_files)}\n")
        f.write(f"导出数量: {len(generated_files)}\n\n")

        idx = 0
        for screen_idx, image_name in enumerate(image_files, start=1):
            f.write(f"[{screen_idx:02d}] {image_name}\n")
            for row in range(1, GRID_ROWS + 1):
                for col in range(1, GRID_COLS + 1):
                    idx += 1
                    file_name = os.path.basename(generated_files[idx - 1])
                    f.write(f"  - r{row}c{col} -> {file_name}\n")
            f.write("\n")

    return summary_path


def process_folder(folder_name, folder_path):
    image_files = get_image_files(folder_path)
    output_dir = os.path.join(OUTPUT_ROOT, folder_name)
    clear_output_dir(output_dir)

    if not image_files:
        print(f"[{folder_name}] 未找到截图，已跳过")
        return {
            "folder_name": folder_name,
            "image_count": 0,
            "export_count": 0,
            "output_dir": output_dir,
            "summary_path": None,
            "preview_path": None,
        }

    print(f"\n=== 处理目录: {folder_name} ===")
    print(f"源目录: {folder_path}")
    print(f"输出目录: {output_dir}")

    all_generated = []
    preview_files = []

    for screen_idx, image_name in enumerate(image_files, start=1):
        img_path = os.path.join(folder_path, image_name)
        print(f"  [{screen_idx:02d}] {image_name}")
        generated_files = split_one_image(img_path, output_dir, screen_idx)
        all_generated.extend(generated_files)
        if screen_idx == 1:
            preview_files.extend(generated_files)

    preview_path = os.path.join(output_dir, "preview_first_screen.png")
    build_preview_sheet(preview_files, preview_path)
    summary_path = write_folder_summary(folder_name, output_dir, image_files, all_generated)

    print(f"  完成: {len(image_files)} 张截图 -> {len(all_generated)} 张分割图")
    return {
        "folder_name": folder_name,
        "image_count": len(image_files),
        "export_count": len(all_generated),
        "output_dir": output_dir,
        "summary_path": summary_path,
        "preview_path": preview_path,
    }


def write_batch_summary(results):
    summary_path = os.path.join(OUTPUT_ROOT, "batch_summary.txt")
    total_images = sum(item["image_count"] for item in results)
    total_exports = sum(item["export_count"] for item in results)

    with open(summary_path, "w", encoding="utf-8") as f:
        f.write("Yalla 多目录礼物分割结果\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"处理目录数: {len(results)}\n")
        f.write(f"截图总数: {total_images}\n")
        f.write(f"导出总数: {total_exports}\n\n")

        for item in results:
            f.write(f"[{item['folder_name']}]\n")
            f.write(f"- 截图数量: {item['image_count']}\n")
            f.write(f"- 导出数量: {item['export_count']}\n")
            f.write(f"- 输出目录: {item['output_dir']}\n")
            if item["summary_path"]:
                f.write(f"- 清单文件: {item['summary_path']}\n")
            if item["preview_path"]:
                f.write(f"- 预览文件: {item['preview_path']}\n")
            f.write("\n")

    return summary_path


def main():
    print("=" * 65)
    print("   Yalla 礼物批量分割工具 V5")
    print("=" * 65)
    print("说明: 按目录读取截图，按两行四列均分，并分目录保存")
    print(f"输出根目录: {OUTPUT_ROOT}")
    print("-" * 65)

    results = []
    for folder_name, folder_path in SOURCE_FOLDERS.items():
        if not os.path.isdir(folder_path):
            print(f"[!] 目录不存在，跳过: {folder_path}")
            continue
        results.append(process_folder(folder_name, folder_path))

    batch_summary = write_batch_summary(results)
    print("\n" + "=" * 65)
    print("全部完成")
    print(f"批量清单: {batch_summary}")
    print("=" * 65)


if __name__ == "__main__":
    main()
