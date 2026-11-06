import os
from PIL import Image, ImageDraw

project_dir = r"C:\Users\denbi\yandex_music_mobile"
logo_path = r"d:\Яндекс Музыка мод\assets\logo.png"
base_img = Image.open(logo_path).convert("RGBA")

# 1. Standard density mipmaps
densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

for folder, size in densities.items():
    d = os.path.join(project_dir, "res", folder)
    os.makedirs(d, exist_ok=True)
    # square / rounded
    resized = base_img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(os.path.join(d, "ic_launcher.png"))

    # circular mask for round icon
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    round_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    round_img.paste(resized, (0, 0), mask)
    round_img.save(os.path.join(d, "ic_launcher_round.png"))

# 2. Adaptive icon background
bg_xml = """<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#0f0f13" />
</shape>"""

os.makedirs(os.path.join(project_dir, "res", "drawable"), exist_ok=True)
with open(os.path.join(project_dir, "res", "drawable", "ic_launcher_background.xml"), "w", encoding="utf-8") as f:
    f.write(bg_xml)

# 3. Adaptive icon foreground
fg_dir = os.path.join(project_dir, "res", "drawable-xxxhdpi")
os.makedirs(fg_dir, exist_ok=True)
canvas = Image.new("RGBA", (432, 432), (0, 0, 0, 0))
offset = ((432 - 256) // 2, (432 - 256) // 2)
canvas.paste(base_img, offset)
canvas.save(os.path.join(fg_dir, "ic_launcher_foreground.png"))
canvas.save(os.path.join(project_dir, "res", "drawable", "ic_launcher_foreground.png"))

# 4. Adaptive icon XMLs
anydpi_dir = os.path.join(project_dir, "res", "mipmap-anydpi-v26")
os.makedirs(anydpi_dir, exist_ok=True)

adapt_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>"""

with open(os.path.join(anydpi_dir, "ic_launcher.xml"), "w", encoding="utf-8") as f:
    f.write(adapt_xml)
with open(os.path.join(anydpi_dir, "ic_launcher_round.xml"), "w", encoding="utf-8") as f:
    f.write(adapt_xml)

print("All mipmaps and adaptive icons generated successfully!")
