#!/bin/bash
set -eu
umask 077

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
app=/opt/yandex-music-mod
config_home=${XDG_CONFIG_HOME:-"$HOME/.config"}
cache_home=${XDG_CACHE_HOME:-"$HOME/.cache"}
profile=${YMMOD_PROFILE_DIR:-}

if [[ -x "$root/client/yandexmusic" ]]; then
    app="$root/client"
    profile=${profile:-"$root/.profile"}
fi

if [[ -n $profile ]]; then
    if [[ $profile != /* ]]; then
        echo 'Укажите абсолютный путь к профилю в YMMOD_PROFILE_DIR.' >&2
        exit 1
    fi
    export XDG_CONFIG_HOME="$profile"
    export XDG_CACHE_HOME="$profile/cache"
else
    export XDG_CONFIG_HOME="$config_home/yandex-music-mod"
    export XDG_CACHE_HOME="$cache_home/yandex-music-mod"
fi

mkdir -p -- "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME"
export CHROME_DESKTOP=yandex-music-mod.desktop
exec "$app/yandexmusic" "$@"
