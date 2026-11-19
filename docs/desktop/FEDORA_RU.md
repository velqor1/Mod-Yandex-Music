# Fedora x86_64

Выпуск 0.3.0 использует Яндекс Музыку 5.128.0 для Linux. Доступны оформление, шрифты, масштаб настроек и игровой HUD. Вход, права аккаунта и воспроизведение обрабатывает штатный клиент.

## Установка

Скачайте один из файлов в [релизе Fedora 0.3.0](https://github.com/velqor1/Mod-Yandex-Music/releases/tag/fedora-v0.3.0).

- **RPM.** Выполните `sudo dnf install ./yandex-music-mod-0.3.0-1.fc45.x86_64.rpm`. Откройте «Яндекс Музыка Mod» из списка приложений или запустите `yandex-music-mod`. Обновление сохраняет профиль RPM в `~/.config/yandex-music-mod` при стандартных настройках XDG.
- **Портативный архив.** Распакуйте TAR.GZ и запустите `./launch.sh` из папки `YandexMusic-Mod-Fedora`. Для запуска нужны системные библиотеки Electron. При обновлении распакуйте новый архив поверх этой папки, чтобы продолжить пользоваться профилем `.profile`. Старая распакованная копия клиента в `.client` больше не используется.

## Игровой HUD

Откройте настройки красной кнопкой или сочетанием `Ctrl + Shift + S`. Выберите **Игровой HUD → Открыть оверлей**. В мини-плеере есть компактный режим, крупная обложка и панель текстов.

| Действие | X11 | Wayland |
| --- | --- | --- |
| Открыть или скрыть HUD | Глобально по `Ctrl + Shift + O` или через меню | По `Ctrl + Shift + O` в окне приложения или через меню |
| Сквозные клики | `Ctrl + Shift + G` или переключатель в настройках | Доступны при запуске через XWayland |
| Настроить положение и порядок окон | Учитываются правила оконного менеджера и режим игры | Определяются композитором |

Для запуска через XWayland передайте `--ozone-platform=x11` лаунчеру RPM или портативной версии.

## Сборка

Скачайте `Yandex_Music_amd64_5.128.0.deb`. Сборщик проверит SHA-512 и подготовит оба формата. [Страница загрузки Яндекс Музыки](https://music.yandex.ru/download/)

```bash
python3 tools/build_fedora.py /path/to/Yandex_Music_amd64_5.128.0.deb \
  --portable dist/fedora/YandexMusic-Mod-Fedora-0.3.0-x64.tar.gz
sudo dnf install rpm-build desktop-file-utils
rpmbuild -bb --define "_topdir $PWD/build/fedora-rpm" \
  --define '_binary_payload w5.zstdio' \
  "$PWD/build/fedora-rpm/SPECS/yandex-music-mod.spec"
```

RPM появится в `build/fedora-rpm/RPMS/x86_64/`. Подготовку можно выполнить на Windows с Python 3.10+, затем перенести `build/fedora-rpm` на Fedora для запуска `rpmbuild`.
