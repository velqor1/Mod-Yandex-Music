import os
import sys
import shutil
import subprocess

BASE_DIR = r"d:\Яндекс Музыка мод"
TEMP_BUILT = os.path.join(BASE_DIR, "dist", "temp_built.apk")
TEMP_ALIGNED = os.path.join(BASE_DIR, "dist", "temp_aligned.apk")
TARGET_NAME = "Yndex-Music-Mod-MOBILE.apk"
FINAL_APK = os.path.join(BASE_DIR, "dist", TARGET_NAME)
ROOT_APK = os.path.join(BASE_DIR, TARGET_NAME)
DOWNLOADS_DIR = os.path.expanduser(r"~\Downloads")
DOWNLOADS_APK1 = os.path.join(DOWNLOADS_DIR, TARGET_NAME)
DOWNLOADS_APK2 = os.path.join(DOWNLOADS_DIR, "Yandex-Music-Mod-MOBILE.apk")

ZIPALIGN = r"C:\Users\denbi\AppData\Local\Android\Sdk\build-tools\35.0.0\zipalign.exe"
APKSIGNER = r"C:\Users\denbi\AppData\Local\Android\Sdk\build-tools\35.0.0\apksigner.bat"
KEYSTORE = r"C:\Users\denbi\.android\debug.keystore"

print("[1] Aligning APK with zipalign...")
if os.path.exists(TEMP_ALIGNED):
    os.remove(TEMP_ALIGNED)

align_cmd = [ZIPALIGN, "-p", "-f", "4", TEMP_BUILT, TEMP_ALIGNED]
res = subprocess.run(align_cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("zipalign failed:", res.stderr)
    sys.exit(1)
print("  -> Aligned successfully!")

print("[2] Signing APK with apksigner...")
sign_cmd = [
    APKSIGNER, "sign",
    "--ks", KEYSTORE,
    "--ks-pass", "pass:android",
    "--ks-key-alias", "androiddebugkey",
    "--key-pass", "pass:android",
    TEMP_ALIGNED
]
res = subprocess.run(sign_cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("apksigner failed:", res.stderr)
    sys.exit(1)
print("  -> Signed successfully!")

print("[3] Verifying signature...")
verify_cmd = [APKSIGNER, "verify", "-v", TEMP_ALIGNED]
res = subprocess.run(verify_cmd, capture_output=True, text=True)
print(res.stdout)
if "Verified using v1 scheme (JAR signing): true" not in res.stdout and "Verified using v2 scheme (APK Signature Scheme v2): true" not in res.stdout:
    print("Signature verification failed!")
    sys.exit(1)

print("[4] Deploying to target paths...")
if os.path.exists(FINAL_APK):
    os.remove(FINAL_APK)
os.rename(TEMP_ALIGNED, FINAL_APK)

shutil.copy2(FINAL_APK, ROOT_APK)
shutil.copy2(FINAL_APK, DOWNLOADS_APK1)
shutil.copy2(FINAL_APK, DOWNLOADS_APK2)

print(f"[+] Deployed successfully to:")
print(f"  - {FINAL_APK}")
print(f"  - {ROOT_APK}")
print(f"  - {DOWNLOADS_APK1}")
print(f"  - {DOWNLOADS_APK2}")
print(f"Size: {os.path.getsize(FINAL_APK) / (1024*1024):.2f} MB")
