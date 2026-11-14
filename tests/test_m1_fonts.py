import os
import re
import base64
import sys

PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CSS_PATH = os.path.join(PROJECT_DIR, "src", "renderer", "mod-renderer.css")
FONTS_DIR = os.path.join(PROJECT_DIR, "src", "fonts")
JS_PATH = os.path.join(PROJECT_DIR, "src", "renderer", "mod-renderer.js")

def test_fonts():
    print("=" * 60)
    print("TESTING MILESTONE 1: FONT PACK & BASE64 INLINING")
    print("=" * 60)

    # 1. Check font files in src/fonts
    print("\n[Step 1] Verifying all 6 font binaries in src/fonts/...")
    required_font_files = [
        "Andy-Bold.woff2",
        "Minecraft.woff2",
        "JetBrainsMono-Regular.woff2",
        "PressStart2P.woff2",
        "VT323.woff2",
        "UncutSans-Regular.woff2"
    ]
    for fname in required_font_files:
        fpath = os.path.join(FONTS_DIR, fname)
        assert os.path.exists(fpath), f"Missing font binary: {fname}"
        with open(fpath, "rb") as f:
            header = f.read(4)
        assert header == b"wOF2", f"Invalid WOFF2 signature in {fname}: {header}"
        size = os.path.getsize(fpath)
        print(f"  [+] {fname} ({size} bytes, signature: wOF2)")
    print("-> Step 1 PASSED!")

    # 2. Check CSS @font-face rules & Base64 data URIs
    print("\n[Step 2] Verifying Base64 inlining & dual-alias in mod-renderer.css...")
    with open(CSS_PATH, "r", encoding="utf-8") as f:
        css = f.read()

    font_families = [
        "JetBrains Mono",
        "Minecraft",
        "Andy Bold",
        "Terraria",
        "Press Start 2P",
        "Marck Script",
        "Ruslan Display",
        "Rubik Glitch",
        "Kelly Slab"
    ]
    for fam in font_families:
        pattern = r'@font-face\s*\{[^}]*font-family:\s*"' + re.escape(fam) + r'"[^}]*\}'
        matches = re.findall(pattern, css, re.DOTALL)
        assert len(matches) > 0, f"Missing @font-face for {fam}"
        for m in matches:
            embedded = re.findall(r'url\("data:font/(woff2?);base64,([^"]+)"\)', m)
            assert embedded, f"Missing embedded font in @font-face for {fam}"
            for fmt, encoded in embedded:
                decoded = base64.b64decode(encoded, validate=True)
                assert decoded[:4] == (b"wOF2" if fmt == "woff2" else b"wOFF"), f"Corrupt {fmt} data for {fam}"
        print(f"  [+] \"{fam}\": {len(matches)} embedded font rule(s) verified")
    print("-> Step 2 PASSED!")

    # 3. Check applyFont() and scale adjustments in mod-renderer.js
    print("\n[Step 3] Verifying applyFont() implementation in mod-renderer.js...")
    with open(JS_PATH, "r", encoding="utf-8") as f:
        js = f.read()

    assert "function applyFont(fontName, enabled = true)" in js, "Missing applyFont definition"
    select = re.search(r'id="opt-font-family"[^>]*>(.*?)</select>', js, re.DOTALL).group(1)
    choices = set(re.findall(r'<option value="([^"]+)"', select))
    assert choices == {"Terraria", "Minecraft", "NewYear", "Halloween", "Cyberpunk", "Arcade", "KellySlab", "JetBrains", "Original"}
    # Actual enable/disable, family, effects and both scales are exercised by
    # desktop-settings/behavior.js; obsolete font-size-adjust strings are not a contract.
    assert 'font-changer/sizeScale' in js and 'font-changer/modalSizeScale' in js
    print("  [+] Current font choices and independent scale keys retained")
    print("-> Step 3 PASSED!")

    print("\n" + "=" * 60)
    print("ALL MILESTONE 1 VERIFICATION CHECKS PASSED (3/3)")
    print("=" * 60)

if __name__ == "__main__":
    test_fonts()
