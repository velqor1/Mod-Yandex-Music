"""Strict, version-pinned native hooks for the 0.2 feature update."""
from pathlib import Path
import re


def apply(work: Path, report: dict):
    def replace(relative, old, new):
        path = work / relative
        data = path.read_text(encoding="utf-8")
        if new in data:
            return
        if data.count(old) != 1:
            raise RuntimeError(f"Expected unique v0.2 patch target: {relative}: {old[:80]}")
        path.write_text(data.replace(old, new), encoding="utf-8")

    # The original free-tier flag blocks the native lyrics mode and its click handler.
    # Preserve the experiment's calculation and all authentication/subscription records.
    path = work / "smali/m7e.smali"
    data = path.read_text(encoding="utf-8")
    method = re.search(r"\.method public final a\(\)Z\n.*?\.end method", data, re.S)
    if not method:
        raise RuntimeError("Native free-tier accessor not found")
    if "ModRuntime;->restricted" not in method[0]:
        if method[0].count("    return p0") != 2:
            raise RuntimeError("Native free-tier accessor changed")
        patched = method[0].replace("    return p0", "    invoke-static {p0}, Lru/yandex/music/mod/ModRuntime;->restricted(Z)Z\n\n    move-result p0\n\n    return p0")
        path.write_text(data[:method.start()] + patched + data[method.end():], encoding="utf-8")

    # Keep the native plaque and its layout, changing only the header button after binding.
    relative = "smali_classes6/com/yandex/plus/plaquesdk/plaque/adapter/j.smali"
    old = ("    invoke-virtual {p0, p1}, Lcom/yandex/plus/plaquesdk/plaque/adapter/j;->b(Lcom/yandex/plus/plaquesdk/plaque/api/models/x;)V\n\n    return-void")
    new = old.replace("\n\n    return-void", "\n\n    invoke-virtual {p0}, Lcom/yandex/plus/plaquesdk/plaque/adapter/j;->d()Landroid/view/View;\n\n    move-result-object v0\n\n    invoke-static {v0}, Lru/yandex/music/mod/ModRuntime;->decoratePlus(Landroid/view/View;)V\n\n    return-void")
    replace(relative, old, new)

    # Capture only tokens belonging to sessions constructed by this very APK.
    for relative in ["smali_classes3/xcj.smali", "smali_classes3/ycj.smali", "smali_classes3/vo3.smali"]:
        path = work / relative
        data = path.read_text(encoding="utf-8")
        if "ModPlayback;->capture" in data:
            continue
        pattern = re.compile(r"(    invoke-direct \{(v\d+|p\d+), (v\d+|p\d+),[^\n]+\}, Landroid/media/session/MediaSession;-><init>\([^\n]+\)V)")
        def hook(m):
            return m[0] + f"\n\n    invoke-static {{{m[2]}, {m[3]}}}, Lru/yandex/music/mod/ModPlayback;->capture(Landroid/media/session/MediaSession;Landroid/content/Context;)V"
        patched, count = pattern.subn(hook, data)
        expected = 2 if relative.endswith("vo3.smali") else 1
        if count != expected:
            raise RuntimeError(f"Native media session targets changed: {relative}: {count}")
        path.write_text(patched, encoding="utf-8")

    service = ('        <service android:name="ru.yandex.music.mod.ModTimerService" android:exported="false" '
               'android:foregroundServiceType="mediaPlayback"/>\n')
    replace("AndroidManifest.xml", "    </application>", service + "    </application>")

    import shutil
    assets = work / "assets/music-mod"
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(Path(__file__).parent / "assets/desktop-logo.png", assets / "desktop-logo.png")
    icon = work / "res/drawable/ic_launcher_foreground.xml"
    data = icon.read_text(encoding="utf-8")
    if 'android:fillColor="#fe0"' not in data and 'android:fillColor="#ff2d3c"' not in data:
        raise RuntimeError("Original launcher icon vector changed")
    updated = data.replace('android:fillColor="#fe0"', 'android:fillColor="#ff2d3c"')
    if updated != data:
        icon.write_text(updated, encoding="utf-8")

    path = work / "apktool.yml"
    data = path.read_text(encoding="utf-8")
    data = re.sub(r"(?m)^  versionCode: .+$", "  versionCode: 24026564", data)
    data = re.sub(r"(?m)^  versionName: .+$", '  versionName: "2026.11.1 #171rur Mod 0.3"', data)
    path.write_text(data, encoding="utf-8")
    report["modVersion"] = "0.3.0-alpha.1"
    report["patches"] = [item for item in report["patches"] if item not in {
        "Native settings redesign: two tabs and shared vector controls",
        "Native free-tier restrictions follow without-Plus mode, including synchronized lyrics"}]
    for item in ["Local free-tier flag hook; native lyrics entitlement remains unresolved",
                 "Native Plus header button opens mod settings", "Desktop red logo, quick panel, glass-style settings, themes and appearance profiles", "Own native media-session hooks and foreground sleep timer"]:
        if item not in report["patches"]:
            report["patches"].append(item)

    from patches_v04 import apply as apply_v04
    apply_v04(work, report)
