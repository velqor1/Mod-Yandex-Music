"""Pinned Compose material integration. Adds no references to the full classes3 DEX."""
from pathlib import Path
import shutil
import re


def apply(work: Path, report: dict):
    module = Path(__file__).parent
    target = work / "smali/ru/yandex/music/mod/ModGlassBrush.smali"
    target.parent.mkdir(parents=True, exist_ok=True)
    content = (module / "smali/ModGlassBrush.smali").read_text(encoding="utf-8")
    if not target.exists() or target.read_text(encoding="utf-8") != content:
        target.write_text(content, encoding="utf-8")
    element = work / "smali/androidx/compose/foundation/BackgroundElement.smali"
    data = element.read_text(encoding="utf-8")
    old = ("    invoke-direct {p0}, Ljava/lang/Object;-><init>()V\n\n"
           "    iput-wide p1, p0, Landroidx/compose/foundation/BackgroundElement;->a:J")
    new = ("    invoke-direct {p0}, Ljava/lang/Object;-><init>()V\n\n"
           "    invoke-static {p1, p2, p3, p4}, Lru/yandex/music/mod/ModGlassBrush;->choose(JLd44;Lgcs;)Ld44;\n\n"
           "    move-result-object p3\n\n"
           "    instance-of v0, p3, Lru/yandex/music/mod/ModGlassBrush;\n\n"
           "    if-eqz v0, :mod_glass_native_color\n\n"
           "    sget-wide p1, Lpx5;->n:J\n\n"
           "    :mod_glass_native_color\n"
           "    iput-wide p1, p0, Landroidx/compose/foundation/BackgroundElement;->a:J")
    if new not in data:
        if data.count(old) != 1:
            raise RuntimeError("Pinned Compose BackgroundElement constructor changed")
        element.write_text(data.replace(old, new), encoding="utf-8")
    canvas = work / "smali/xj0.smali"
    data = canvas.read_text(encoding="utf-8")
    original_draw = "    invoke-virtual/range {p0 .. p7}, Landroid/graphics/Canvas;->drawRoundRect(FFFFFFLandroid/graphics/Paint;)V"
    shared_draw = "    invoke-static/range {p0 .. p7}, Lru/yandex/music/mod/ModGlass;->drawRoundRect(Landroid/graphics/Canvas;FFFFFFLandroid/graphics/Paint;)V"
    if shared_draw not in data:
        if data.count(original_draw) != 1:
            raise RuntimeError("Pinned Compose AndroidCanvas round-rectangle path changed")
        canvas.write_text(data.replace(original_draw, shared_draw), encoding="utf-8")
    data = canvas.read_text(encoding="utf-8")
    original_rect = "    invoke-virtual/range {p0 .. p5}, Landroid/graphics/Canvas;->drawRect(FFFFLandroid/graphics/Paint;)V"
    shared_rect = "    invoke-static/range {p0 .. p5}, Lru/yandex/music/mod/ModGlass;->drawRect(Landroid/graphics/Canvas;FFFFLandroid/graphics/Paint;)V"
    # A generic rectangle also represents header masks and off-screen snapshots.
    # Keep it native; material belongs on actual controls, not arbitrary wide rectangles.
    if shared_rect in data:
        canvas.write_text(data.replace(shared_rect, original_rect), encoding="utf-8")
    # AppCompat dialog buttons are a separate window and bypass Activity view traversal.
    # Move this one definition to classes.dex, which has room; classes3 is exactly full.
    original_button = work / "smali_classes3/androidx/appcompat/widget/AppCompatButton.smali"
    new_button = work / "smali/androidx/appcompat/widget/AppCompatButton.smali"
    if original_button.exists():
        if new_button.exists():
            raise RuntimeError("Duplicate AppCompatButton definition")
        new_button.parent.mkdir(parents=True, exist_ok=True)
        original_button.rename(new_button)
    button = new_button.read_text(encoding="utf-8")
    if "ModRuntime;->styleNativeButton" not in button:
        if "onDraw(Landroid/graphics/Canvas;)V" in button:
            raise RuntimeError("Original AppCompatButton now overrides onDraw")
        button += """
.method protected onDraw(Landroid/graphics/Canvas;)V
    .locals 0
    invoke-static {p0}, Lru/yandex/music/mod/ModRuntime;->styleNativeButton(Landroid/view/View;)V
    invoke-super {p0, p1}, Landroid/widget/Button;->onDraw(Landroid/graphics/Canvas;)V
    return-void
.end method
"""
        new_button.write_text(button, encoding="utf-8")

    yml = work / "apktool.yml"
    data = yml.read_text(encoding="utf-8")
    data = re.sub(r"(?m)^  versionCode: .+$", "  versionCode: 24026565", data)
    data = re.sub(r"(?m)^  versionName: .+$", '  versionName: "2026.11.1 #171rur Mod 0.4"', data)
    yml.write_text(data, encoding="utf-8")
    report["modVersion"] = "0.4.0-alpha.1"
    description = "Shared glass material for original rounded Compose surfaces, native buttons and mod dialogs"
    if description not in report["patches"]:
        report["patches"].append(description)
    from patches_v05 import apply as apply_v05
    apply_v05(work, report)
