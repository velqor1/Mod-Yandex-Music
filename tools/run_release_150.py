import os
import sys
import json
import re
import subprocess
import urllib.request
import urllib.error

def get_auth_token():
    try:
        url = subprocess.check_output(["git", "remote", "get-url", "origin"]).decode().strip()
        m = re.search(r"https://[^:]+:([^@]+)@", url)
        if m:
            return m.group(1)
    except Exception:
        pass
    return os.environ.get("GITHUB_TOKEN", "")

TOKEN = get_auth_token()
REPO = "velqor1/Mod-Yandex-Music"
TAG = "v1.5.0"
NAME = "Яндекс Музыка Mod v1.5.0"

BODY = """### Основные возможности мода:
- **Полноэкранный режим в стиле Apple Music**: двухколоночный плеер во весь экран с живым градиентным фоном Aurora, элементами управления из жидкого стекла (Liquid Glass) и адаптацией под любые мониторы (1080p, 2K/4K, Ultrawide и ноутбуки).
- **Синхронизированные тексты песен**: караоке со скроллом, мягкой подсветкой активной строки и быстрой перемоткой трека по клику на текст.
- **Компактный игровой HUD-оверлей**: окно плеера поверх всех окон и игр с текстом и управлением.
- **Discord Rich Presence**: отображение трека, исполнителя, альбома, обложки и прогресса в профиле Discord.
- **Живые обои**: поддержка фонового видео и пакетов `.pkg` из Wallpaper Engine.
- **Без рекламы и ограничений**: разблокированы функции Плюса, удалены баннеры, доступны темы оформления и кастомные шрифты.

---

### Новое в v1.5.0 (по сравнению с v1.4.0):
- **Apple Music Fullscreen**: полноценный полноэкранный плеер с адаптивной сценой под любые разрешения и мониторы.
- **Обновлённый движок текстов**: кинетический плавный скролл и подсветка текста песен 1-в-1 как в Apple Music.
- **Интеграция с Discord RPC**: исправлена синхронизация обложек и метаданных треков из плейлистов и альбомов, обновлена ссылка.
- **Стабильность**: оптимизирована синхронизация состояния трека и элементов управления.
"""

EXE_PATH = os.path.abspath(r"dist\Yandex_Music_x64_5.124.1_Mod.exe")

def main():
    if not TOKEN:
        print("[-] GitHub token not found!")
        sys.exit(1)
        
    if not os.path.exists(EXE_PATH):
        print(f"[-] Executable not found at {EXE_PATH}")
        sys.exit(1)

    file_size = os.path.getsize(EXE_PATH)
    file_name = os.path.basename(EXE_PATH)
    print(f"[+] Found {file_name} ({file_size / (1024*1024):.2f} MB)")

    # 1. Git commit and push tag
    print("[+] Git adding changes...")
    subprocess.run(["git", "add", "README.md", "src/", "tools/native_installer.nsi"], check=True)
    
    status = subprocess.check_output(["git", "status", "--porcelain"]).decode()
    if "M  README.md" in status or "M  src/" in status or "M  tools/native_installer.nsi" in status:
        print("[+] Committing v1.5.0 changes...")
        subprocess.run(["git", "commit", "-m", "Release v1.5.0: responsive fullscreen redesign, artwork sync & lyrics polish"], check=True)
    else:
        print("[*] No staged changes to commit.")

    print(f"[+] Creating git tag {TAG}...")
    subprocess.run(["git", "tag", "-d", TAG], stderr=subprocess.DEVNULL)
    subprocess.run(["git", "tag", "-a", TAG, "-m", f"Release {TAG}"], check=True)

    print("[+] Pushing branch and tag to origin...")
    subprocess.run(["git", "push", "origin", "main"], check=True)
    subprocess.run(["git", "push", "origin", TAG, "--force"], check=True)

    # 2. Create GitHub Release
    print(f"[+] Creating GitHub Release {TAG} on {REPO}...")
    url = f"https://api.github.com/repos/{REPO}/releases"
    payload = {
        "tag_name": TAG,
        "target_commitish": "main",
        "name": NAME,
        "body": BODY.strip(),
        "draft": False,
        "prerelease": False
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"token {TOKEN}",
        "User-Agent": "YandexMusicMod-Deployer",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    })

    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            print(f"[+] Release created successfully! ID: {res['id']}")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[-] Response: {e.code} {err_msg}")
        if e.code == 422: # already exists
            print("[*] Release exists, fetching release info...")
            get_req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}", headers={
                "Authorization": f"token {TOKEN}",
                "User-Agent": "YandexMusicMod-Deployer"
            })
            with urllib.request.urlopen(get_req) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                print(f"[+] Found existing release ID: {res['id']}")
                
                # Update body if needed
                patch_req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/{res['id']}", data=data, headers={
                    "Authorization": f"token {TOKEN}",
                    "User-Agent": "YandexMusicMod-Deployer",
                    "Accept": "application/vnd.github.v3+json",
                    "Content-Type": "application/json"
                }, method="PATCH")
                with urllib.request.urlopen(patch_req) as p_resp:
                    res = json.loads(p_resp.read().decode("utf-8"))
                    print("[+] Updated release description.")
        else:
            sys.exit(1)

    # 3. Check and delete existing asset if needed
    for asset in res.get("assets", []):
        if asset["name"] == file_name:
            print(f"[*] Deleting existing asset {asset['name']} (ID {asset['id']})...")
            del_req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/assets/{asset['id']}", headers={
                "Authorization": f"token {TOKEN}",
                "User-Agent": "YandexMusicMod-Deployer"
            }, method="DELETE")
            urllib.request.urlopen(del_req)
            print("[+] Deleted old asset.")

    # 4. Upload binary
    print(f"[+] Uploading {file_name} ({file_size / (1024*1024):.2f} MB)...")
    upload_url = res["upload_url"].split("{")[0] + f"?name={file_name}"

    with open(EXE_PATH, "rb") as f:
        file_bytes = f.read()

    req = urllib.request.Request(upload_url, data=file_bytes, headers={
        "Authorization": f"token {TOKEN}",
        "User-Agent": "YandexMusicMod-Deployer",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/octet-stream",
        "Content-Length": str(file_size)
    })

    with urllib.request.urlopen(req) as resp:
        asset_info = json.loads(resp.read().decode("utf-8"))
        print("[+] Upload completed successfully!")
        print(f"[+] Browser Download URL: {asset_info['browser_download_url']}")
        print(f"[+] Release URL: {res['html_url']}")

if __name__ == "__main__":
    main()
