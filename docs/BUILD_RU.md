# Сборка и локальная разработка

## Windows

Нужны Windows x64, Python 3, Node.js, .NET Framework C# compiler и NSIS. Базовый клиент зафиксирован на 5.124.1.

1. Установите актуальный мод из Releases. Сборщик использует его папку как совместимую основу и не скачивает другой клиент.
2. Изменяйте `src/renderer/`, `src/main/`, `src/preload/`. Единый источник версии — `src/mod-version.json`.
3. `python -X utf8 tests/desktop-settings/fixture.py`, затем `python -X utf8 tests/desktop-settings/browser_check.py` — реальный renderer на изолированном стенде Chrome, без пользовательского профиля.
4. `node --test tests/desktop-settings/updater.cjs tests/desktop-settings/updater-ipc.cjs` и `node tests/desktop-settings/storage_check.cjs`.
5. `python -X utf8 tools/build_native_installer.py` — локальный EXE и `dist/windows-update.json`. NSIS ожидается в `tools/nsis/`; используется .NET Framework compiler из Windows.
6. `python -X utf8 tests/desktop-settings/installer_check.py` и `python -X utf8 tests/desktop-settings/nsis_check.py` проверяют установку в отдельной тестовой папке.

Для точечного применения к собственной установке: `python -X utf8 tools/deploy_desktop_local.py`. Скрипт закрывает только процессы этой установки, сохраняет резервную копию и заменяет принадлежащие моду файлы. Это команда установки, а не проверки. После неё клиент открывается обычным способом.

Python-проверкам нужны `psutil` и `websocket-client`, браузерному стенду — установленный Chrome. Сборка не публикует файлы автоматически. Старые разовые скрипты в `tools/` не являются текущим способом установки.

## Android

Рабочая модификация оригинального APK находится в `mobile/apkmod/`. Каталог `mobile/android/` — отклонённый отдельный эксперимент, он не входит в релиз и не используется.

Требуются JDK 21, Android SDK 36 / build-tools 36.0.0, Python 3, APKTool 3.0.3. Положите исходный APK 2026.11.1 #171rur в `build/apk-source/yandex-music-2026.11.1.apk`, APKTool — в `tools/apktool_3.0.3.jar`. Сборщик проверяет закреплённые SHA-256. Локальные SDK-пути можно задать через `ANDROID_HOME` и `JAVA_HOME`.

Сборка: `python -X utf8 mobile/apkmod/build.py`. Вспомогательный ASCII SUBST-диск на Windows используется для AAPT2; рабочие файлы остаются в `build/apkmod/`, результат — в `dist/android-apkmod/`. Ключи подписи и пользовательские данные не входят в репозиторий. Для обновления существующего мода нужен тот же ключ подписи; собственная пересборка другим ключом несовместима с обновлением поверх опубликованного APK.

Чистые Java-тесты: `NavMotionTest`, `NavRequestsTest`, `ListeningClockTest`, `TrackIdentityTest` вместе с одноимёнными классами из `mobile/apkmod/src/ru/yandex/music/mod/`. SQL-проверки: `python -m unittest discover -s mobile/apkmod/tests -p "test_*.py"`.

Для установки поверх предыдущего мода используйте штатную установку APK без удаления приложения и без очистки данных. Сборщик сам не входит в аккаунт и не переносит чужие сессии.
