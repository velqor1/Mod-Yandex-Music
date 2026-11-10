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

NEW_BODY = """### Основные возможности мода:
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

def main():
    if not TOKEN:
        print("[-] GitHub token not found!")
        sys.exit(1)

    print(f"[+] Fetching release {TAG} on {REPO}...")
    get_req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}", headers={
        "Authorization": f"token {TOKEN}",
        "User-Agent": "YandexMusicMod-Deployer"
    })
    
    with urllib.request.urlopen(get_req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        release_id = res["id"]
        print(f"[+] Found release ID: {release_id}")

    print(f"[+] Updating release description...")
    payload = {
        "name": NAME,
        "body": NEW_BODY.strip()
    }
    data = json.dumps(payload).encode("utf-8")
    patch_req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/{release_id}", data=data, headers={
        "Authorization": f"token {TOKEN}",
        "User-Agent": "YandexMusicMod-Deployer",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }, method="PATCH")

    with urllib.request.urlopen(patch_req) as p_resp:
        updated = json.loads(p_resp.read().decode("utf-8"))
        print("[+] Release description updated successfully!")
        print(f"[+] Release URL: {updated['html_url']}")

if __name__ == "__main__":
    main()
