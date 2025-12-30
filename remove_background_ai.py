"""
AI-based background removal using rembg
使用 AI 模型進行專業去背
"""
from pathlib import Path
import sys

def remove_background_with_ai():
    """使用 rembg AI 模型去背"""
    try:
        from rembg import remove
        from PIL import Image
    except ImportError:
        print("[ERROR] rembg not installed. Installing now...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg[gpu]" if check_gpu() else "rembg"])
        print("[OK] rembg installed successfully!")
        from rembg import remove
        from PIL import Image

    # 圖片目錄
    cards_dir = Path("D:/claude-mode/board-game-sea-salt-paper/assets/cards")

    # 所有需要去背的圖片
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
    print(" " * 20 + "AI BACKGROUND REMOVAL (rembg)")
    print(" " * 15 + "Professional AI-based Background Removal")
    print("=" * 80)
    print()

    success_count = 0

    for i, card_file in enumerate(card_files, 1):
        # 直接使用當前圖片（新生成的圖片）
        input_path = cards_dir / card_file

        if not input_path.exists():
            print(f"[{i}/{len(card_files)}] SKIP: {card_file} - File not found")
            continue

        # 先備份原圖
        backup_file = card_file.replace(".png", "_before_rembg.png")
        backup_path = cards_dir / backup_file
        if not backup_path.exists():
            import shutil
            shutil.copy2(input_path, backup_path)
            print(f"  [BACKUP] Created: {backup_file}")

        output_path = cards_dir / card_file

        print(f"[{i}/{len(card_files)}] Processing: {card_file}")
        print(f"  Input:  {input_path}")
        print(f"  Output: {output_path}")

        try:
            # 讀取圖片
            input_image = Image.open(input_path)

            # AI 去背
            print("  [AI] Removing background with AI model...")
            output_image = remove(input_image)

            # 保存
            output_image.save(output_path, "PNG")
            print(f"  [SUCCESS] Saved with transparent background!")
            success_count += 1

        except Exception as e:
            print(f"  [ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()

        print()

    print("=" * 80)
    print("AI BACKGROUND REMOVAL COMPLETE!")
    print("=" * 80)
    print(f"[SUCCESS] Processed: {success_count}/{len(card_files)} images")
    print(f"[METHOD] Used rembg AI model for professional background removal")
    print(f"[LOCATION] {cards_dir}")
    print()
    print("All images now have AI-removed transparent backgrounds!")


def check_gpu():
    """檢查是否有 GPU"""
    try:
        import torch
        return torch.cuda.is_available()
    except:
        return False


if __name__ == "__main__":
    remove_background_with_ai()
