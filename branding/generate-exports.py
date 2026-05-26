"""
Generate production logo exports for NXA-Coin.

Takes the original logo, center-crops to square, then resizes to all
the canonical sizes wallets and exchanges expect.

Sizes:
  1024 - HD / marketing
   512 - canonical (Solana token registry, CoinGecko, CMC)
   256 - exchange listings
   128 - mobile wallet (high-DPI)
    64 - desktop wallet thumbnail
    32 - favicon
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
SRC = ROOT / "nxa-logo-original.png"

SIZES = [1024, 512, 256, 128, 64, 32]


def center_crop_square(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def main():
    if not SRC.exists():
        raise SystemExit(f"Source not found: {SRC}")

    img = Image.open(SRC).convert("RGBA")
    print(f"Source: {img.size[0]}x{img.size[1]}px, mode={img.mode}")

    square = center_crop_square(img)
    print(f"Cropped to square: {square.size[0]}x{square.size[1]}px")

    for size in SIZES:
        out = square.resize((size, size), Image.LANCZOS)
        path = ROOT / f"nxa-logo-{size}.png"
        out.save(path, "PNG", optimize=True)
        kb = path.stat().st_size / 1024
        print(f"  wrote {path.name}  ({kb:.1f} KB)")

    # Also save the canonical 512 with a clean alias
    canonical = ROOT / "nxa-logo.png"
    square.resize((512, 512), Image.LANCZOS).save(canonical, "PNG", optimize=True)
    print(f"  wrote {canonical.name}  (alias for 512)")

    print("\nDone. Branding/ is ready.")


if __name__ == "__main__":
    main()
