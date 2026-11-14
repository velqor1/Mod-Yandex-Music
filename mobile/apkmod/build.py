"""Build a version-pinned modification of the original Yandex Music APK.

Requires Python 3, JDK 21, Android SDK 36 and tools/apktool_3.0.3.jar.
Run from any directory: python -X utf8 mobile/apkmod/build.py
Generated files stay in build/apkmod; the official APK is never overwritten.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import zipfile
import zlib
import struct

ROOT = Path(__file__).resolve().parents[2]
MODULE = ROOT / "mobile/apkmod"
BASE = ROOT / "build/apk-source/yandex-music-2026.11.1.apk"
BASE_SHA = "5c6eacb12957ef9b25dd8e9ba1fd33876f8cff55a2894d00ba62511649d5ba4f"
APKTOOL = ROOT / "tools/apktool_3.0.3.jar"
APKTOOL_SHA = "dbf930b076c6b9be08d57c449cacefc3bdd6b71ebd59b3066fc0e1f5b14f9423"
BUILD = ROOT / "build/apkmod"
UPSTREAM = BUILD / "upstream"
WORK = BUILD / "work"
OUT = ROOT / "dist/android-apkmod"
JAVA_HOME = Path(os.environ.get("JAVA_HOME", r"C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"))
SDK = Path(os.environ.get("ANDROID_HOME", str(Path.home() / "AppData/Local/Android/Sdk")))
HELPER = "Lru/yandex/music/mod/ModRuntime;"


def digest(path: Path) -> str:
    return hashlib.file_digest(path.open("rb"), "sha256").hexdigest()


def replace_once(path: Path, old: str, new: str) -> None:
    original = path.read_text(encoding="utf-8")
    if original.count(old) != 1:
        raise RuntimeError(f"Expected exactly one patch target: {path.relative_to(ROOT)} / {old[:100]}")
    path.write_text(original.replace(old, new), encoding="utf-8")


def reset_generated(path: Path) -> None:
    resolved = path.resolve()
    # Only these three generated directories may ever be recursively removed.
    allowed = {WORK.resolve(), (BUILD / "classes").resolve(), (BUILD / "dex").resolve()}
    if resolved not in allowed or not resolved.is_relative_to(BUILD.resolve()):
        raise RuntimeError(f"Unsafe cleanup path: {resolved}")
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True)


def prepare() -> dict:
    if digest(BASE) != BASE_SHA:
        raise RuntimeError("Official base APK hash mismatch")
    if digest(APKTOOL) != APKTOOL_SHA:
        raise RuntimeError("APKTool hash mismatch")
    reset_generated(WORK)
    shutil.copytree(UPSTREAM, WORK, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns("build", "dist"))
    report = {"baseSha256": BASE_SHA, "baseVersion": "2026.11.1 #171rur",
              "modVersion": "0.1.0-alpha.1", "package": "ru.yandex.music", "patches": []}

    application = WORK / "smali/ru/yandex/music/YMApplication.smali"
    target = "    invoke-super {v1}, Landroid/app/Application;->onCreate()V"
    replace_once(application, target, target + f"\n\n    invoke-static {{v1}}, {HELPER}->init(Landroid/app/Application;)V")
    report["patches"].append("Application bootstrap; original startup logic retained")

    dto = WORK / "smali_classes4/com/yandex/music/shared/dto/account/AccountAboutDto.smali"
    for field in ("hasPlus", "hasMusicSubscription"):
        target = (f"    iget-object p0, p0, Lcom/yandex/music/shared/dto/account/AccountAboutDto;->{field}:Ljava/lang/Boolean;"
                  "\n\n    return-object p0")
        replacement = target.replace("\n\n    return-object p0", f"\n\n    invoke-static {{p0}}, {HELPER}->subscription(Ljava/lang/Boolean;)Ljava/lang/Boolean;\n\n    move-result-object p0\n\n    return-object p0")
        replace_once(dto, target, replacement)
    report["patches"].append("Music-account capability getters; original values retained when mode is off")

    base_activity = WORK / "smali/bcn.smali"
    original = base_activity.read_text(encoding="utf-8")
    if "attachBaseContext(" in original or ".super Lt73;" not in original:
        raise RuntimeError("Native activity hierarchy changed")
    original += f"""
.method protected attachBaseContext(Landroid/content/Context;)V
    .locals 0
    invoke-static {{p1}}, {HELPER}->wrap(Landroid/content/Context;)Landroid/content/Context;
    move-result-object p1
    invoke-super {{p0, p1}}, Lt73;->attachBaseContext(Landroid/content/Context;)V
    return-void
.end method
"""
    base_activity.write_text(original, encoding="utf-8")
    report["patches"].append("Native base activity text scaling")

    manifest = WORK / "AndroidManifest.xml"
    # Shared signature permission already belongs to official Yandex apps on the phone.
    # The re-signed music APK must not redeclare it under a different certificate.
    replace_once(manifest,
                 '    <permission android:icon="@drawable/passport_icon_yandex_big" android:label="@string/passport_permission_read_credentials" android:name="com.yandex.permission.READ_CREDENTIALS" android:protectionLevel="signature"/>\n',
                 '')
    report["patches"].append("Do not redeclare the shared Yandex signature permission; keep native sign-in")
    new_activity = ('        <activity android:name="ru.yandex.music.mod.ModSettingsActivity" '
                    'android:exported="true" android:label="Настройки мода" '
                    'android:theme="@android:style/Theme.Material.NoActionBar"/>\n')
    replace_once(manifest, "    </application>", new_activity + "    </application>")
    strings = WORK / "res/values/strings.xml"
    account_type = "com.yandex.passport.wl.musicmod"
    replace_once(strings,
                 '<string name="passport_account_type">com.yandex.passport</string>',
                 f'<string name="passport_account_type">{account_type}</string>')
    replace_once(WORK / "smali/com/yandex/plus/core/locale/b.smali",
                 '.field public static b:Ljava/lang/String; = "com.yandex.passport"',
                 f'.field public static b:Ljava/lang/String; = "{account_type}"')
    report["accountType"] = account_type
    report["patches"].append("Native Passport white-label account namespace; original SDK signature and account-type validation retained")
    for key in ("app_name_full", "app_name_short"):
        data = strings.read_text(encoding="utf-8")
        data, count = re.subn(r'(<string name="' + key + r'">)[^<]*(</string>)',
                             r'\g<1>Яндекс Музыка Mod\2', data)
        if count != 1:
            raise RuntimeError(f"App label resource missing: {key}")
        strings.write_text(data, encoding="utf-8")
    yml = WORK / "apktool.yml"
    data = yml.read_text(encoding="utf-8")
    data, count = re.subn(r"(?m)^  versionName: .+$", '  versionName: "2026.11.1 #171rur Mod 0.1"', data)
    if count != 1:
        raise RuntimeError("Version metadata missing")
    yml.write_text(data, encoding="utf-8")
    assets = WORK / "assets/music-mod"
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(MODULE / "assets/Manrope.ttf", assets / "Manrope.ttf")
    shutil.copyfile(MODULE / "assets/FONT-LICENSE.txt", assets / "FONT-LICENSE.txt")

    # Keep every argument register and its live range intact. /range handles high registers.
    # Only immediate return-value sites are hooked, never arbitrary constants or bitmaps.
    color_call = re.compile(
        r"(    invoke-[^\n]+ L(?:android/content/res/Resources|android/content/Context);->getColor\([^\n]*\)I\n\s*move-result ([vp]\d+))")
    font_call = re.compile(
        r"(    invoke-[^\n]+ L(?:android/content/res/Resources|android/graphics/Typeface(?:\$Builder)?);->(?:getFont|createFromAsset|build)\([^\n]*\)Landroid/graphics/Typeface;\n\s*move-result-object ([vp]\d+))")
    counts = {"color": 0, "font": 0}
    modified = []
    account_consumers = []
    for directory in sorted(WORK.glob("smali*")):
        for file in directory.rglob("*.smali"):
            source = file.read_text(encoding="utf-8")
            if "Lcom/yandex/music/shared/dto/account/AccountAboutDto;->d()" in source:
                account_consumers.append(str(file.relative_to(WORK)))
            if "com/yandex/passport" in file.as_posix():
                continue
            def hook(match, kind, signature, result):
                counts[kind] += 1
                register = match[2]
                return match[1] + f"\n\n    invoke-static/range {{{register} .. {register}}}, {HELPER}->{signature}\n\n    {result} {register}"
            patched = color_call.sub(lambda m: hook(m, "color", "color(I)I", "move-result"), source)
            patched = font_call.sub(lambda m: hook(m, "font", "font(Landroid/graphics/Typeface;)Landroid/graphics/Typeface;", "move-result-object"), patched)
            if patched != source:
                file.write_text(patched, encoding="utf-8")
                modified.append(str(file.relative_to(WORK)))
    if counts["color"] == 0 or counts["font"] == 0:
        raise RuntimeError(f"Native styling targets not found: {counts}")
    report["stylingHooks"] = counts
    report["stylingFiles"] = modified
    report["musicCapabilityConsumers"] = account_consumers
    from patches_v02 import apply as apply_v02
    apply_v02(WORK, report)
    (BUILD / "patch-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Prepared original APK: {counts}, {len(modified)} styling files", flush=True)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reuse-work", action="store_true", help="Recompile prepared work after helper-only edits")
    args = parser.parse_args()
    if not args.reuse_work:
        report = prepare()
    else:
        report = json.loads((BUILD / "patch-report.json").read_text(encoding="utf-8"))
        if report["baseSha256"] != digest(BASE):
            raise RuntimeError("Prepared build base mismatch")
        from patches_v02 import apply as apply_v02
        apply_v02(WORK, report)
        (BUILD / "patch-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    # AAPT2 cannot reliably handle Cyrillic paths on Windows. Use a temporary ASCII drive.
    mapped = None
    if os.name == "nt":
        for letter in "WVUTSR":
            if not Path(letter + ":/").exists():
                subprocess.run(["subst", letter + ":", str(ROOT)], check=True)
                mapped = letter + ":/"
                break
        if mapped is None:
            raise RuntimeError("No free temporary drive letter")
    def native(path: Path) -> str:
        if mapped and path.is_relative_to(ROOT):
            return mapped + path.relative_to(ROOT).as_posix()
        return str(path)
    def run(arguments):
        subprocess.run([str(x) for x in arguments], cwd=mapped or ROOT, check=True)

    try:
        classes = BUILD / "classes"
        dex = BUILD / "dex"
        reset_generated(classes)
        reset_generated(dex)
        android_jar = SDK / "platforms/android-36/android.jar"
        certificate = subprocess.run([str(JAVA_HOME / "bin/keytool.exe"), "-exportcert", "-keystore",
                                      str(Path.home() / ".android/debug.keystore"), "-alias", "androiddebugkey",
                                      "-storepass", "android"], capture_output=True, check=True).stdout
        certificate_sha = hashlib.sha256(certificate).hexdigest()
        report["signingCertificateSha256"] = certificate_sha
        sources = sorted((MODULE / "src").rglob("*.java"))
        run([JAVA_HOME / "bin/javac.exe", "-encoding", "UTF-8", "--release", "8", "-cp", android_jar,
             "-d", native(classes), *[native(p) for p in sources]])
        helper_jar = BUILD / "music-mod.jar"
        run([JAVA_HOME / "bin/jar.exe", "cf", native(helper_jar), "-C", native(classes), "."])
        run([JAVA_HOME / "bin/java.exe", "-cp", SDK / "build-tools/36.0.0/lib/d8.jar",
             "com.android.tools.r8.D8", "--min-api", "24", "--lib", android_jar,
             "--output", native(dex), native(helper_jar)])
        assembled = BUILD / "original-with-mod-unsigned.apk"
        try:
            run([JAVA_HOME / "bin/java.exe", "-Xmx3G", "-jar", native(APKTOOL), "b", native(WORK),
                 "-o", native(assembled), "-j", "4"])
        except subprocess.CalledProcessError:
            cache = (WORK / "build/apk").resolve()
            if not cache.is_relative_to(WORK.resolve()):
                raise RuntimeError("Unsafe APKTool cache path")
            for partial in cache.glob("classes*.dex"):
                partial.unlink()
            raise
        combined = BUILD / "original-with-mod-combined.apk"
        with zipfile.ZipFile(assembled) as source, zipfile.ZipFile(combined, "w") as dest:
            dex_entries = [n for n in source.namelist() if re.fullmatch(r"classes\d*\.dex", n)]
            if len(dex_entries) != 7:
                raise RuntimeError(f"Expected 7 native DEX files, found {len(dex_entries)}")
            for entry in source.infolist():
                if entry.filename.upper().startswith("META-INF/") and entry.filename.upper().endswith((".SF", ".RSA", ".DSA", ".EC", "MANIFEST.MF")):
                    continue
                contents = source.read(entry.filename)
                if entry.filename in dex_entries:
                    if (not contents.startswith(b"dex\n") or len(contents) < 112
                        or struct.unpack_from("<I", contents, 32)[0] != len(contents)
                        or struct.unpack_from("<I", contents, 8)[0] != zlib.adler32(contents[12:])
                        or contents[12:32] != hashlib.sha1(contents[32:]).digest()):
                        raise RuntimeError(f"Invalid DEX emitted by APKTool: {entry.filename}")
                dest.writestr(entry, contents)
            dest.write(dex / "classes.dex", "classes8.dex", compress_type=zipfile.ZIP_DEFLATED)
        aligned = BUILD / "original-with-mod-aligned.apk"
        run([SDK / "build-tools/36.0.0/zipalign.exe", "-P", "16", "-f", "4", native(combined), native(aligned)])
        OUT.mkdir(parents=True, exist_ok=True)
        output = OUT / ("YandexMusic-2026.11.1-Mod-" + report["modVersion"] + ".apk")
        run([JAVA_HOME / "bin/java.exe", "-jar", SDK / "build-tools/36.0.0/lib/apksigner.jar", "sign",
             "--ks", Path.home() / ".android/debug.keystore", "--ks-key-alias", "androiddebugkey",
             "--ks-pass", "pass:android", "--key-pass", "pass:android", "--out", native(output), native(aligned)])
        run([JAVA_HOME / "bin/java.exe", "-jar", SDK / "build-tools/36.0.0/lib/apksigner.jar", "verify", native(output)])
        run([SDK / "build-tools/36.0.0/zipalign.exe", "-c", "-P", "16", "4", native(output)])
        report.update({"apkSha256": digest(output), "apkBytes": output.stat().st_size,
                       "signing": "Local Android debug key; not the original Yandex signature"})
        (OUT / "build-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print("Built:", output, "SHA256:", report["apkSha256"], flush=True)
    finally:
        if mapped:
            subprocess.run(["subst", mapped[:2], "/D"], check=True)


if __name__ == "__main__":
    main()
