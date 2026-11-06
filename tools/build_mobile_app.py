import os
import sys
import subprocess
import shutil
import zipfile
import hashlib
from PIL import Image, ImageDraw

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def run_cmd(cmd, step_name):
    print(f"[*] Running: {step_name}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[ERROR] {step_name} failed with code {res.returncode}")
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        sys.exit(1)
    if res.stdout.strip():
        print("   ", res.stdout.strip())
    print(f"[OK] {step_name}")

def generate_icons(project_dir, logo_path):
    print("[*] Generating all mipmaps and adaptive icons...")
    base_img = Image.open(logo_path).convert("RGBA")

    # 1. Densities for mipmap
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
        resized = base_img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(d, "ic_launcher.png"))

        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        round_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        round_img.paste(resized, (0, 0), mask)
        round_img.save(os.path.join(d, "ic_launcher_round.png"))

    # 2. Adaptive icon background shape
    bg_xml = """<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#0f0f13" />
</shape>"""
    os.makedirs(os.path.join(project_dir, "res", "drawable"), exist_ok=True)
    with open(os.path.join(project_dir, "res", "drawable", "ic_launcher_background.xml"), "w", encoding="utf-8") as f:
        f.write(bg_xml)

    # 3. Adaptive icon foreground 432x432
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

    print("[OK] Generated icons")

def main():
    SDK = r"C:\Users\denbi\AppData\Local\Android\Sdk"
    BUILD_TOOLS = os.path.join(SDK, "build-tools", "35.0.0")
    AAPT2 = os.path.join(BUILD_TOOLS, "aapt2.exe")
    D8 = os.path.join(BUILD_TOOLS, "d8.bat")
    ZIPALIGN = os.path.join(BUILD_TOOLS, "zipalign.exe")
    APKSIGNER = os.path.join(BUILD_TOOLS, "apksigner.bat")
    ANDROID_JAR = os.path.join(SDK, "platforms", "android-34", "android.jar")
    JAVAC = r"C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot\bin\javac.EXE"
    KEYSTORE = r"C:\Users\denbi\.android\debug.keystore"

    PROJECT_DIR = r"C:\Users\denbi\yandex_music_mobile"
    LOGO_PATH = r"d:\Яндекс Музыка мод\assets\logo.png"
    BUILD_DIR = os.path.join(PROJECT_DIR, "build")

    generate_icons(PROJECT_DIR, LOGO_PATH)

    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)

    GEN_DIR = os.path.join(BUILD_DIR, "gen")
    OBJ_DIR = os.path.join(BUILD_DIR, "obj")
    DEX_DIR = os.path.join(BUILD_DIR, "dex")
    os.makedirs(GEN_DIR, exist_ok=True)
    os.makedirs(OBJ_DIR, exist_ok=True)
    os.makedirs(DEX_DIR, exist_ok=True)

    # 1. Compile Resources
    res_zip = os.path.join(BUILD_DIR, "res.zip")
    run_cmd([
        AAPT2, "compile",
        "--dir", os.path.join(PROJECT_DIR, "res"),
        "-o", res_zip
    ], "AAPT2 Compile Resources")

    # 2. Link Resources & Package Assets with proper min/target SDK and versions
    base_apk = os.path.join(BUILD_DIR, "base.apk")
    run_cmd([
        AAPT2, "link",
        "-I", ANDROID_JAR,
        res_zip,
        "-A", os.path.join(PROJECT_DIR, "assets"),
        "--manifest", os.path.join(PROJECT_DIR, "AndroidManifest.xml"),
        "--min-sdk-version", "26",
        "--target-sdk-version", "34",
        "--version-code", "20261104",
        "--version-name", "1.3.13-MOBILE",
        "-o", base_apk,
        "--java", GEN_DIR
    ], "AAPT2 Link & Package Assets")

    # 3. Compile Java Sources
    java_files = []
    for root, _, files in os.walk(os.path.join(PROJECT_DIR, "src")):
        for f in files:
            if f.endswith(".java"):
                java_files.append(os.path.join(root, f))
    for root, _, files in os.walk(GEN_DIR):
        for f in files:
            if f.endswith(".java"):
                java_files.append(os.path.join(root, f))

    run_cmd([
        JAVAC,
        "-source", "8",
        "-target", "8",
        "-cp", ANDROID_JAR,
        "-d", OBJ_DIR
    ] + java_files, f"Javac ({len(java_files)} files)")

    # 4. D8 Dexing
    class_files = []
    for root, _, files in os.walk(OBJ_DIR):
        for f in files:
            if f.endswith(".class"):
                class_files.append(os.path.join(root, f))

    run_cmd([
        D8,
        "--lib", ANDROID_JAR,
        "--output", DEX_DIR
    ] + class_files, f"D8 Dexing ({len(class_files)} classes)")

    # 5. Pack classes.dex into base.apk
    print("[*] Packing classes.dex into APK...")
    dex_path = os.path.join(DEX_DIR, "classes.dex")
    with zipfile.ZipFile(base_apk, 'a') as z:
        z.write(dex_path, "classes.dex")
    print("[OK] Packed classes.dex")

    # 6. Zipalign
    aligned_apk = os.path.join(BUILD_DIR, "aligned.apk")
    run_cmd([
        ZIPALIGN,
        "-p", "-f", "4",
        base_apk,
        aligned_apk
    ], "Zipalign")

    # 7. Apksigner with v1, v2, v3
    final_apk = os.path.join(BUILD_DIR, "Yndex-Music-Mod-MOBILE.apk")
    shutil.copy2(aligned_apk, final_apk)
    run_cmd([
        APKSIGNER, "sign",
        "--ks", KEYSTORE,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--ks-key-alias", "androiddebugkey",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        "--v3-signing-enabled", "true",
        final_apk
    ], "Apksigner Sign (v1+v2+v3)")

    # Verify signature
    run_cmd([
        APKSIGNER, "verify",
        "-v",
        final_apk
    ], "Apksigner Verify")

    apk_size = os.path.getsize(final_apk)
    apk_hash = sha256_file(final_apk)
    print(f"\n[SUCCESS] APK built successfully!")
    print(f"Path: {final_apk}")
    print(f"Size: {apk_size:,} bytes ({apk_size / (1024*1024):.2f} MB)")
    print(f"SHA-256: {apk_hash}")

    # 8. Deploy to target destinations
    destinations = [
        r"d:\Яндекс Музыка мод\Yndex-Music-Mod-MOBILE.apk",
        r"d:\Яндекс Музыка мод\dist\Yndex-Music-Mod-MOBILE.apk",
        r"C:\Users\denbi\Downloads\Yndex-Music-Mod-MOBILE.apk",
        r"C:\Users\denbi\Downloads\Yandex-Music-Mod-MOBILE.apk"
    ]

    print("\n[*] Deploying APK to destination directories:")
    for dest in destinations:
        dest_dir = os.path.dirname(dest)
        os.makedirs(dest_dir, exist_ok=True)
        shutil.copy2(final_apk, dest)
        print(f"  -> {dest} ({os.path.getsize(dest):,} bytes)")

if __name__ == "__main__":
    main()
