#!/usr/bin/env python3
"""Compose the gta6-meme-x-01 meme: AI-made Vice City scene + official make.fun
ghost mark as the passenger + bold top/bottom captions. Output: meme.png."""
from PIL import Image, ImageDraw, ImageFont

BASE = "assets/media-generation-gta6-vice-city-scene-0-4f26180f-018a-40a2-b616-78c77bfd4f73.png"
GHOST = "assets/mark-1024.png"
OUT = "meme.png"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

img = Image.open(BASE).convert("RGB")
W, H = img.size  # 1536x1024

# --- ghost mark as the passenger, bottom-left on the car seat/door ---
ghost = Image.open(GHOST).convert("RGBA")
gs = 300
ghost = ghost.resize((gs, gs), Image.LANCZOS)
# soft drop shadow for separation from the pink car body
shadow = Image.new("RGBA", (gs + 16, gs + 16), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.ellipse([8, 8, gs + 8, gs + 8], fill=(0, 0, 0, 140))
img.paste(shadow, (52, 668), shadow)
img.paste(ghost, (60, 676), ghost)

# --- captions ---
draw = ImageDraw.Draw(img)

def fit_font(text, max_w, start):
    size = start
    while size > 20:
        f = ImageFont.truetype(FONT, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 2
    return ImageFont.truetype(FONT, 20)

def caption(text, y, size_start):
    f = fit_font(text, W - 120, size_start)
    tw = draw.textlength(text, font=f)
    draw.text(((W - tw) / 2, y), text, font=f, fill="white",
              stroke_width=8, stroke_fill="black")

caption("WAITED 13 YEARS FOR GTA 6", 36, 96)
caption("CALLED IN SICK ON LAUNCH DAY", H - 150, 88)

img.save(OUT, "PNG")
print("saved", OUT, img.size)
