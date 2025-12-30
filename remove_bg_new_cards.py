"""
AI-based background removal for new cards using rembg
"""
from pathlib import Path
from rembg import remove
from PIL import Image

def remove_background_with_ai():
    """使用 rembg AI 模型去背新卡片"""
    cards_dir = Path("D:/claude-mode/board-game-sea-salt-paper/assets/cards")

    # 新生成的卡片
    new_card_files = [
        "sailor_origami.png",
        "captain_origami.png"
    ]

    print("="*80)
    print(" "*20 + "AI BACKGROUND REMOVAL (rembg)")
    print(" "*15 + "Processing New Cards")
    print("="*80)
    print()

    success_count = 0

    for i, card_file in enumerate(new_card_files, 1):
        input_path = cards_dir / card_file

        if not input_path.exists():
            print(f"[{i}/{len(new_card_files)}] SKIP: {card_file} - File not found")
            continue

        # 備份原圖
        backup_file = card_file.replace(".png", "_before_rembg.png")
        backup_path = cards_dir / backup_file
        if not backup_path.exists():
            import shutil
            shutil.copy2(input_path, backup_path)
            print(f"  [BACKUP] Created: {backup_file}")

        output_path = cards_dir / card_file

        print(f"[{i}/{len(new_card_files)}] Processing: {card_file}")
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

    print("="*80)
    print("AI BACKGROUND REMOVAL COMPLETE!")
    print("="*80)
    print(f"[SUCCESS] Processed: {success_count}/{len(new_card_files)} images")
    print(f"[METHOD] Used rembg AI model for professional background removal")
    print(f"[LOCATION] {cards_dir}")
    print()
    print("New cards now have AI-removed transparent backgrounds!")


if __name__ == "__main__":
    remove_background_with_ai()
