"""
Professional background removal using OpenCV
使用 OpenCV 進行專業去背處理
"""
import cv2
import numpy as np
from pathlib import Path
from PIL import Image

def remove_white_background_opencv(input_path, output_path):
    """
    使用 OpenCV 移除白色背景

    Args:
        input_path: 輸入圖片路徑
        output_path: 輸出圖片路徑
    """
    # 讀取圖片
    img = cv2.imread(str(input_path))

    # 轉換為灰度圖
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 創建mask：將接近白色的部分標記為背景
    # 閾值設為240，任何灰度值大於240的像素都視為白色背景
    _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

    # 進行形態學操作來清理mask
    kernel = np.ones((3,3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # 將圖片轉換為RGBA
    b, g, r = cv2.split(img)
    rgba = [r, g, b, mask]
    output_img = cv2.merge(rgba)

    # 保存為PNG（支持透明）
    cv2.imwrite(str(output_path), output_img)

    return output_path


def process_all_cards():
    """批次處理所有卡片"""
    cards_dir = Path("D:/claude-mode/board-game-sea-salt-paper/assets/cards")

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
    print(" " * 20 + "OPENCV BACKGROUND REMOVAL")
    print(" " * 15 + "Professional White Background Removal")
    print("=" * 80)
    print()

    success_count = 0

    for i, card_file in enumerate(card_files, 1):
        # 使用backup作為輸入（原始圖片）
        backup_file = card_file.replace(".png", "_backup.png")
        input_path = cards_dir / backup_file

        # 如果沒有backup，跳過
        if not input_path.exists():
            print(f"[{i}/{len(card_files)}] SKIP: {card_file} - No backup found")
            continue

        output_path = cards_dir / card_file

        print(f"[{i}/{len(card_files)}] Processing: {card_file}")

        try:
            remove_white_background_opencv(input_path, output_path)

            # 驗證輸出
            if output_path.exists():
                # 使用PIL驗證是否有alpha通道
                img = Image.open(output_path)
                if img.mode == 'RGBA':
                    print(f"  [SUCCESS] Transparent background created!")
                    success_count += 1
                else:
                    print(f"  [WARNING] Image saved but may not have transparency")
            else:
                print(f"  [ERROR] Output file not created")

        except Exception as e:
            print(f"  [ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()

    print()
    print("=" * 80)
    print("BACKGROUND REMOVAL COMPLETE!")
    print("=" * 80)
    print(f"[SUCCESS] Processed: {success_count}/{len(card_files)} images")
    print(f"[METHOD] OpenCV threshold-based background removal")
    print(f"[LOCATION] {cards_dir}")
    print()
    print("All images now have transparent backgrounds!")


if __name__ == "__main__":
    # 確認OpenCV已安裝
    try:
        import cv2
        print("[OK] OpenCV is installed")
        print(f"[VERSION] OpenCV {cv2.__version__}")
    except ImportError:
        print("[ERROR] OpenCV not installed. Please run:")
        print("  pip install opencv-python")
        exit(1)

    print()
    process_all_cards()
