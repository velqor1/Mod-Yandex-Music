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
TAG = "v1.4.0"
NAME = "Яндекс Музыка Mod v1.4.0 — Глобальное обновление (Wallpaper Engine PKG, Apple Music HUD & Fixes)"

BODY = """## 🌟 Яндекс Музыка Mod v1.4.0 — Глобальное обновление!

В этом масштабном релизе мы собрали ключевые доработки, долгожданную поддержку пакетов Wallpaper Engine и полностью переработали интерактивный Apple Music Gaming HUD.

---

### 🎨 Поддержка Wallpaper Engine (.pkg)
- **Импорт обоев PKG:** Добавлена встроенная поддержка и автоматическая распаковка пакетов `.pkg` из Wallpaper Engine при перетаскивании или выборе в галерее.
- **Изоляция видеопотока:** Видео живых обоев полностью изолировано от хуков аудиоплеера — таймкоды текста и караоке теперь привязаны строго к аудиодорожке трека.

---

### 🎮 Apple Music HUD & Оверлей
- **Исправлена кнопка Лайка:** Устранена критическая ошибка селектора, из-за которой нажатие «Лайк» в HUD ошибочно нажимало «Не нравится» и переключало трек. Теперь статус лайка/дизлайка работает идеально и синхронно с десктопным плеером.
- **Плавный регулятор громкости:** Ползунок громкости переведён на `Pointer Events` с `setPointerCapture`. Громкость меняется плавно, не срывается при быстром движении мыши и напрямую управляет движком Sonata.
- **Автоскрытие и стабильность:** Исправлено поведение оверлея при переключении треков и разворачивании полноэкранного текста.

---

### 🛠 Стабильность и архитектура
- **Окно каталога тем:** Закрытие окна тем и настроек больше не закрывает само приложение Яндекс Музыки (исправлен флаг вспомогательного окна).
- **Синхронизация стилей и автообновления:** Полная совместимость со свежими обновлениями клиента Яндекс Музыки `5.124.1`.
- **Чистка рекламы:** Полное удаление баннеров и промо-блоков.

---

### 📥 Установка
1. Скачайте инсталлятор **`Yandex_Music_x64_5.124.1_Mod.exe`** ниже.
2. Запустите и завершите установку.
3. Наслаждайтесь обновлённой Яндекс Музыкой!
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

    # 1. Create or check release
    print(f"[+] Creating release {TAG} on {REPO}...")
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
        print(f"[-] Failed to create release: {e.code} {err_msg}")
        if e.code == 422: # already exists
            print("[*] Release might already exist, fetching existing release...")
            get_req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}", headers={
                "Authorization": f"token {TOKEN}",
                "User-Agent": "YandexMusicMod-Deployer"
            })
            with urllib.request.urlopen(get_req) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                print(f"[+] Found existing release ID: {res['id']}")
        else:
            sys.exit(1)

    # 2. Check if asset already exists in release
    for asset in res.get("assets", []):
        if asset["name"] == file_name:
            print(f"[*] Deleting existing asset {asset['name']} (ID {asset['id']})...")
            del_req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/assets/{asset['id']}", headers={
                "Authorization": f"token {TOKEN}",
                "User-Agent": "YandexMusicMod-Deployer"
            }, method="DELETE")
            urllib.request.urlopen(del_req)
            print("[+] Deleted old asset.")

    # 3. Upload binary
    print(f"[+] Uploading {file_name}...")
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
        print(f"[+] Upload completed successfully!")
        print(f"[+] Browser Download URL: {asset_info['browser_download_url']}")
        print(f"[+] Release URL: {res['html_url']}")

if __name__ == "__main__":
    main()
