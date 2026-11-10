# Яндекс Музыка Mod (v1.5.0)

Модифицированный клиент Яндекс Музыки для Windows с интерфейсом в стиле Apple Music, караоке-текстами, игровым HUD-оверлеем, Discord RPC и поддержкой живых обоев.

<p align="center">
  <img src="assets/banner.png" alt="Яндекс Музыка Мод" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/velqor1/Mod-Yandex-Music/releases/latest">
    <img src="https://img.shields.io/badge/Скачать%20EXE-Установщик%20v1.5.0-8b5cf6?style=for-the-badge&logo=windows&logoColor=white" alt="Скачать">
  </a>
  <img src="https://img.shields.io/badge/Версия-v1.5.0-ff2d3c?style=for-the-badge" alt="Версия v1.5.0">
  <img src="https://img.shields.io/badge/Яндекс%20Музыка-5.124.1-007acc?style=for-the-badge" alt="Клиент 5.124.1">
  <img src="https://img.shields.io/badge/Discord%20RPC-Поддерживается-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord RPC">
</p>

---

## Возможности

- **Полноэкранный плеер Apple Music**: двухколоночный режим во весь экран с анимированным градиентным фоном Aurora, элементами управления из жидкого стекла (Liquid Glass) и адаптацией под любые мониторы (1080p, 2K, 4K, Ultrawide 21:9 и ноутбуки).
- **Синхронизированные тексты (Караоке)**: построчный текст с мягкой подсветкой активной строки, плавным кинетическим скроллом и быстрой перемоткой трека по клику на строчку.
- **Игровой HUD-оверлей**: компактный плеер поверх любых окон и игр (`Ctrl + Shift + O`) со сквозным режимом кликов Ghost Mode (`Ctrl + Shift + G`).
- **Discord Rich Presence**: статус воспроизведения, обложки треков, альбомы и таймкоды в профиле Discord.
- **Живые обои**: поддержка видео и файлов `.pkg` из Wallpaper Engine.
- **Чистый интерфейс**: вырезаны рекламные баннеры и промо-вставки, матовый стеклянный дизайн (Glassmorphism), выбор тем и кастомных шрифтов.

---

## Скриншоты

<p align="center">
  <img src="assets/karaoke-full.png" alt="Полноэкранный плеер" width="48%" />
  <img src="assets/hud-overlay.png" alt="Игровой оверлей" width="48%" />
</p>

<p align="center">
  <img src="assets/frosted-menu.png" alt="Настройки" width="48%" />
  <img src="assets/fonts-menu.png" alt="Выбор шрифтов" width="48%" />
</p>

---

## Установка

### Готовый установщик (рекомендуется)
1. Скачайте **[Yandex_Music_x64_5.124.1_Mod.exe](https://github.com/velqor1/Mod-Yandex-Music/releases/latest)**.
2. Запустите файл и завершите установку.
3. Мод автоматически установится и создаст ярлыки в меню Пуск и на рабочем столе.

### Установка из исходного кода
```powershell
git clone https://github.com/velqor1/Mod-Yandex-Music.git
cd Mod-Yandex-Music
python tools/inject.py
```

---

## Горячие клавиши

| Сочетание | Действие |
| :--- | :--- |
| **`Ctrl + Shift + O`** | Открыть / свернуть игровой HUD-оверлей |
| **`Ctrl + Shift + G`** | Сквозной режим кликов для оверлея (Ghost Mode) |
| **`Ctrl + Shift + L`** | Открыть / скрыть плавающее караоке |
| **`F12`** / **`Ctrl + Shift + I`** | Инструменты разработчика (DevTools) |

---

## Отказ от ответственности

Проект создан в ознакомительных и исследовательских целях. Все права на торговую марку «Яндекс Музыка» принадлежат ООО «Яндекс».
