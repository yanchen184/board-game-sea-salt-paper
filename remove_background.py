"""
Remove white background from origami card images
將origami卡片圖片的白色背景移除，改為透明
"""
from PIL import Image
import os
from pathlib import Path

def remove_white_background(image_path, output_path, threshold=240):
    """
    Remove white background from an image and make it transparent

    Args:
        image_path: 輸入圖片路徑
        output_path: 輸出圖片路徑
        threshold: 白色閾值（0-255），高於此值的像素會變透明
    """
    print(f"Processing: {image_path}")

    # 打開圖片並轉換為RGBA模式
    img = Image.open(image_path)
    img = img.convert("RGBA")

    # 獲取圖片數據
    datas = img.getdata()

    new_data = []
    for item in datas:
        # item是(R, G, B, A)
        # 如果RGB都很接近白色，則設為透明
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            # 將白色變為完全透明
            new_data.append((255, 255, 255, 0))
        else:
            # 保持原色
            new_data.append(item)

    # 更新圖片數據
    img.putdata(new_data)

    # 保存為PNG（支持透明）
    img.save(output_path, "PNG")
    print(f"Saved: {output_path}")


def process_all_cards():
    """批次處理所有卡片圖片"""
    # 圖片目錄
    cards_dir = Path("D:/claude-mode/board-game-sea-salt-paper/assets/cards")

    # 所有origami圖片
    card_files = [
        "fish_origami.png",
        "crab_origami.png",
        "shell_origami.png",
        "starfish_origami.png",
        "sailboat_origami.png",
        "shark_origami.png",
        "swimmer_origami.png",
        "octopus_origami.png",
        "penguin_origami.png",
        "seagull_origami.png",
        "mermaid_origami.png"
    ]

    print("=" * 80)
    print(" " * 25 + "BACKGROUND REMOVAL")
    print(" " * 20 + "Origami Cards - Remove White BG")
    print("=" * 80)
    print()

    success_count = 0

    for card_file in card_files:
        input_path = cards_dir / card_file

        if not input_path.exists():
            print(f"[SKIP] File not found: {card_file}")
            continue

        # 輸出路徑（覆蓋原檔案）
        output_path = input_path

        # 也可以先備份原檔案
        backup_filename = card_file.replace(".png", "_backup.png")
        backup_path = cards_dir / backup_filename
        if not backup_path.exists():
            print(f"[BACKUP] Creating backup: {backup_path}")
            img_backup = Image.open(input_path)
            img_backup.save(backup_path, "PNG")

        try:
            remove_white_background(input_path, output_path, threshold=240)
            success_count += 1
        except Exception as e:
            print(f"[ERROR] Failed to process {card_file}: {e}")

    print()
    print("=" * 80)
    print("PROCESSING COMPLETE!")
    print("=" * 80)
    print(f"[SUCCESS] Processed: {success_count}/{len(card_files)} images")
    print(f"[BACKUP] Original files saved with _backup.png extension")
    print(f"[LOCATION] {cards_dir}")
    print()
    print("All images now have transparent backgrounds!")


if __name__ == "__main__":
    # 確認Pillow已安裝
    try:
        from PIL import Image
        print("[OK] Pillow is installed")
    except ImportError:
        print("[ERROR] Pillow not installed. Please run:")
        print("  pip install Pillow")
        exit(1)

    process_all_cards()
