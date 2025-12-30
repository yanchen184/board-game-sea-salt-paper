"""
Generate missing origami-style card images for Sea Salt & Paper game
生成缺失的卡片圖片
"""
import asyncio
import sys
import time
import shutil
from pathlib import Path

# Add spec-kit backend to path
sys.path.insert(0, str(Path("D:/spec-kit/backend/src")))

from integrations.comfyui.client import ComfyUIClient
from integrations.comfyui.workflow_builder import WorkflowBuilder
from integrations.comfyui.queue_poller import QueuePoller


# Missing card definitions
MISSING_CARDS = [
    {
        "name": "Sailor",
        "emoji": "👨‍✈️",
        "color": "Navy Blue",
        "prompt": "Navy blue origami paper sailor figure, sailor uniform with cap, paper craft art style, detailed paper folds, transparent background, isolated on transparent, high quality, professional studio photography, 8k resolution, centered composition, PNG with alpha channel"
    },
    {
        "name": "Lighthouse",
        "emoji": "🏠",
        "color": "Red & White",
        "prompt": "Red and white striped origami paper lighthouse, tall tower with light on top, paper craft art style, detailed paper folds, transparent background, isolated on transparent, high quality, professional studio photography, 8k resolution, centered composition, PNG with alpha channel"
    },
    {
        "name": "FishSchool",
        "emoji": "🐟🐟🐟",
        "color": "Silver Blue",
        "prompt": "Silver blue origami paper fish school, multiple small fish swimming together in formation, paper craft art style, detailed paper folds, transparent background, isolated on transparent, high quality, professional studio photography, 8k resolution, centered composition, PNG with alpha channel"
    },
    {
        "name": "PenguinColony",
        "emoji": "🐧🐧🐧",
        "color": "Black & White",
        "prompt": "Black and white origami paper penguin colony, group of three penguins standing together, paper craft art style, detailed paper folds, transparent background, isolated on transparent, high quality, professional studio photography, 8k resolution, centered composition, PNG with alpha channel"
    },
    {
        "name": "Captain",
        "emoji": "🧑‍✈️",
        "color": "Gold & Navy",
        "prompt": "Gold and navy origami paper captain figure, naval captain with hat and uniform, paper craft art style, detailed paper folds, transparent background, isolated on transparent, high quality, professional studio photography, 8k resolution, centered composition, PNG with alpha channel"
    }
]


async def generate_card_image(client, workflow_builder, queue_poller, card_info, index, total, game_assets):
    """Generate a single card image and copy to game assets"""
    card_name = card_info["name"]
    prompt = card_info["prompt"]

    print(f"\n{'='*80}")
    print(f"[{index}/{total}] Generating: {card_name} ({card_info['color']})")
    print("="*80)
    print(f"[PROMPT] {prompt[:100]}...")

    try:
        # Check ComfyUI status
        print("[CHECK] Checking ComfyUI status...")
        status = await client.check_status()
        if status == "offline":
            print("[ERROR] ComfyUI is offline. Please start ComfyUI first.")
            return None
        print("[OK] ComfyUI is online")

        # Wait for idle
        print("[WAIT] Waiting for ComfyUI to be idle...")
        await queue_poller.ensure_idle()
        print("[OK] ComfyUI is idle")

        # Load workflow
        print("[LOAD] Loading Flux workflow...")
        workflow = workflow_builder.load_and_prepare_image_workflow(
            filename="flux-text-to-image-shorts.json",
            prompt=prompt,
            width=720,
            height=1280
        )
        print("[OK] Workflow prepared")

        # Submit
        print("[SUBMIT] Submitting to ComfyUI...")
        prompt_id = await client.submit_workflow(workflow)
        print(f"[OK] Workflow submitted! Prompt ID: {prompt_id}")

        # Wait for completion
        print("[GENERATE] Generating image (this may take 30-90 seconds)...")
        start_time = time.time()

        while True:
            history = await client.get_history(prompt_id)
            if prompt_id in history:
                status_data = history[prompt_id].get("status", {})
                if status_data.get("completed", False):
                    elapsed = time.time() - start_time
                    print(f"[SUCCESS] Image generation completed in {elapsed:.1f}s!")

                    # Extract output filename
                    outputs = history[prompt_id].get("outputs", {})
                    for node_output in outputs.values():
                        if "images" in node_output:
                            for img_info in node_output["images"]:
                                filename = img_info.get("filename")
                                if filename:
                                    # Source path
                                    source_path = Path("D:/ComfyUI/output") / filename
                                    print(f"[FOUND] ComfyUI output: {source_path}")

                                    # Target path
                                    target_filename = f"{card_name.lower()}_origami.png"
                                    target_path = game_assets / target_filename

                                    if source_path.exists():
                                        shutil.copy2(source_path, target_path)
                                        print(f"[COPIED] -> {target_path}")
                                        return {
                                            "card": card_name,
                                            "source": str(source_path),
                                            "target": str(target_path),
                                            "filename": target_filename,
                                            "time": elapsed
                                        }
                                    else:
                                        print(f"[WARNING] Source file not found: {source_path}")
                    break

            elapsed = time.time() - start_time
            if elapsed > 300:  # 5 minute timeout
                print(f"[TIMEOUT] Image generation took too long (>{elapsed:.0f}s)")
                return None

            # Progress update
            if int(elapsed) % 10 == 0 and elapsed > 0:
                print(f"  ... still generating ({elapsed:.0f}s elapsed)")

            await asyncio.sleep(3)

    except Exception as e:
        print(f"[ERROR] Error generating {card_name}: {e}")
        import traceback
        traceback.print_exc()
        return None


async def main():
    """Generate all missing card images"""
    print("="*80)
    print(" "*20 + "SEA SALT & PAPER")
    print(" "*15 + "Missing Cards Image Generator")
    print("="*80 + "\n")

    # Directories
    comfyui_output = Path("D:/ComfyUI/output")
    game_assets = Path("D:/claude-mode/board-game-sea-salt-paper/assets/cards")
    game_assets.mkdir(parents=True, exist_ok=True)

    print(f"[OUTPUT] ComfyUI output: {comfyui_output}")
    print(f"[TARGET] Game assets: {game_assets}")
    print(f"[CARDS] Total cards to generate: {len(MISSING_CARDS)}")
    print(f"[TIME] Estimated time: {len(MISSING_CARDS) * 1} - {len(MISSING_CARDS) * 1.5} minutes")
    print("\n[START] Starting generation...")
    print()

    # Initialize clients
    print("\n[INIT] Initializing ComfyUI clients...")
    client = ComfyUIClient("http://127.0.0.1:8188")
    workflow_builder = WorkflowBuilder(Path("D:/spec-kit/backend/workflows"))
    queue_poller = QueuePoller(client, poll_interval=3)
    print("[OK] Clients initialized")

    # Generate images
    results = []
    total = len(MISSING_CARDS)

    for index, card in enumerate(MISSING_CARDS, 1):
        result = await generate_card_image(
            client, workflow_builder, queue_poller,
            card, index, total, game_assets
        )
        if result:
            results.append(result)

        # Wait between generations
        if index < total:
            print(f"\n[WAIT] Waiting 5 seconds before next generation...")
            await asyncio.sleep(5)

    # Summary
    print("\n" + "="*80)
    print("GENERATION COMPLETE!")
    print("="*80)
    print(f"\n[SUCCESS] Successfully generated: {len(results)}/{total} images")
    print(f"[FAILED] Failed: {total - len(results)} images")

    if results:
        print("\n[RESULTS] Generated images:")
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result['card']:15s} -> {result['filename']} ({result['time']:.1f}s)")

        print(f"\n[LOCATION] All images saved to: {game_assets}")
        print("\n[DONE] Images are ready to use!")
    else:
        print("\n[ERROR] No images were generated. Please check:")
        print("  - ComfyUI is running (http://127.0.0.1:8188)")
        print("  - Flux workflow exists at D:\\spec-kit\\backend\\workflows\\flux-text-to-image-shorts.json")


if __name__ == "__main__":
    asyncio.run(main())
