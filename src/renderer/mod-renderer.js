const BUILTIN_SYNCED_LYRICS = {
  "чувство собственной важности": `[00:00.60]Делаем бабки, но не сегодня
[00:03.70]На мне большие тряпки, это значит, что я в форме
[00:06.80]В твоём рэпе нет правды, и ты это помнишь
[00:09.90]Но на деньги от мамки он делает себе промо (Промо)
[00:13.00]Звонит мама (Мама) и такая, типо: «Как дела?» (Алё)
[00:16.10]Вру, что всё нормально, правда слёзы на глазах
[00:19.20]Наверно, я мог бы умереть ещё тогда
[00:22.30]Мгновенно, стал бы выше, чем облака
[00:25.40]Новые взгляды ща на мне, от этого не по себе
[00:28.50]Хотя об этом я мечтал (У-у-у, е-ха)
[00:31.60]И я считаю все купюры (Фью), но не сказать, что счастлив
[00:34.70]Почерк навсегда в культуре, сорок три, блять, труппа в туре (Сюда)
[00:37.80]Помню, ты клялась, что навсегда
[00:40.90]Но теперь плачешь под мой трек, когда дома одна (Ты одна)
[00:44.00]Я больше не поверю ей, да, ей, на венах вижу раны
[00:47.10]Ну, давай, проверь, почему у меня шрамы
[00:50.20]Я не езжу в метро
[00:53.30]Чувство собственной важности щас во мне проросло
[00:56.40]Но так давно уже не чувствую тепло
[01:02.60]Делаем бабки, но не сегодня
[01:05.70]На мне большие тряпки, это значит, что я в форме
[01:08.80]В твоём рэпе нет правды, и ты это помнишь
[01:11.90]Но на деньги от мамки он делает себе промо (Промо)
[01:15.00]Ну, давай, проверь, ну, давай, проверь
[01:18.10]Почему у меня шрамы
[01:21.20]Ну, давай, проверь
[01:24.30]Почему у меня— (О-о, а)`,

  "универ": `[00:02.50]У-у-у
[00:05.70]У-у-у
[00:08.90]У-у
[00:12.10]У-у-у-у-у
[00:15.30]У-у-у-у-у (Ей-ей-ей, я)
[00:18.50]У-у-у-у-у
[00:20.50]Я не знаю твоё имя, но ты в моей голове
[00:23.70]Я-я-я хожу по универу: они смотрят на мой свэг
[00:26.90]Ваши-Ваши правила ничто, и я курю на этаже (Я, я)
[00:30.10]Мне плевать (Мне пох) на твоё мнение — я теперь живу в Москве (А-а)
[00:33.30]Я не знаю твоё имя, но ты в моей голове (А-а)
[00:36.50]Я-Я хожу по универу: они смотрят на мой свэг (Е-ей)
[00:39.70]Ваши правила ничто, и я курю на этаже (Я)
[00:42.90]Мне плевать (Мне —) на твоё мнение — я теперь живу в Москве (Мяу, мне пох!)
[00:46.10]Покидаю свой город, он родной, 1-6-4, ай
[00:49.30]Вариантов так много — беру всё, ты можешь и не взять
[00:52.50]Ты злишься много, посмотри, ты уже синий
[00:55.70]Ведь я крутая, но обвинения слиты
[00:58.90]Люблю финики, нахожусь в клинике
[01:02.10]Тебя тянет ко мне так, что противоречит законам физики
[01:05.30]Я на сцене — упали критики
[01:08.50]И все кадры уже на ширике
[01:11.70]Как вести себя на интервью, ведь я как Билли Миллиган?
[01:14.90]Да-да-да, это легко — брать всех за дураков
[01:18.10]Как твоё имя? Скажи — я запомню
[01:21.30]Ладно, молчи, я же над тобой рофлю-ю-ю-ю
[01:24.50]У-у, у, у (О, о)
[01:27.70]У-у, у, у-у
[01:30.90]У-у, у, у-у
[01:34.10]Я не знаю твоё имя, но ты в моей голове
[01:37.30]Я-я-я хожу по универу: они смотрят на мой свэг
[01:40.50]Ваши-Ваши правила ничто, и я курю на этаже (Мне пох!)
[01:43.70]Мне плевать на твоё мнение — я теперь живу в Москве (А-а)
[01:46.90]Я не знаю твоё имя, но ты в моей голове (А-а)
[01:50.10]Я-Я хожу по универу: они смотрят на мой свэг (Е-ей)
[01:53.30]Ваши правила ничто, и я курю на этаже (Я)
[01:56.50]Мне плевать (Мне —) на твоё мнение — я теперь живу в Москве (Мне пох!)`
};

(function () {

// ==========================================
// 0. AUDIO ELEMENT CAPTURE (v1.3.13)
// Intercepts detached <audio> elements created by Yandex Music Yasp player
// STRICTLY EXCLUDES <video> (e.g. animated live wallpapers)
// ==========================================
(function setupAudioCapture() {
  if (window.__ymAudioHookInstalled) return;
  window.__ymAudioHookInstalled = true;
  window.__ymActiveAudio = null;
  window.__ymKnownAudios = new Set();

  const isRealAudio = (el) => {
    if (!el) return false;
    if (el.id === "ym-live-wallpaper-video") return false;
    if (el.tagName && el.tagName.toLowerCase() === "video") return false;
    if (typeof HTMLVideoElement !== "undefined" && el instanceof HTMLVideoElement) return false;
    if (typeof HTMLAudioElement !== "undefined" && el instanceof HTMLAudioElement) return true;
    return el.tagName && el.tagName.toLowerCase() === "audio";
  };

  function registerAudio(audio) {
    if (!audio || !isRealAudio(audio)) return;
    window.__ymKnownAudios.add(audio);
    window.__ymActiveAudio = audio;

    if (typeof window.__ymCurrentVolume === "number") {
      try { audio.volume = window.__ymCurrentVolume; } catch (e) {}
    }

    if (!audio.__ymTrackingAttached) {
      audio.__ymTrackingAttached = true;
      const onTick = () => {
        if (!isRealAudio(audio)) return;
        window.__ymActiveAudio = audio;
        if (typeof window.__ymOnAudioTimeUpdate === "function") {
          window.__ymOnAudioTimeUpdate(audio.currentTime, audio.duration, !audio.paused);
        }
      };
      audio.addEventListener("timeupdate", onTick);
      audio.addEventListener("play", () => {
        if (typeof window.__ymCurrentVolume === "number") {
          try { audio.volume = window.__ymCurrentVolume; } catch (e) {}
        }
        onTick();
      });
      audio.addEventListener("pause", onTick);
      audio.addEventListener("seeking", onTick);
      audio.addEventListener("seeked", onTick);
      audio.addEventListener("durationchange", onTick);
      audio.addEventListener("loadedmetadata", onTick);
    }
  }

  window.__ymGetActiveAudio = function() {
    if (window.__ymActiveAudio && !window.__ymActiveAudio.error && isRealAudio(window.__ymActiveAudio)) {
      return window.__ymActiveAudio;
    }
    if (window.__ymKnownAudios && window.__ymKnownAudios.size > 0) {
      for (const a of window.__ymKnownAudios) {
        if (isRealAudio(a) && (!a.paused || a.currentTime > 0)) return a;
      }
      for (const a of window.__ymKnownAudios) {
        if (isRealAudio(a)) return a;
      }
    }
    try {
      const domAudios = Array.from(document.querySelectorAll("audio")).filter(isRealAudio);
      return domAudios.find((a) => !a.paused) || domAudios[0] || null;
    } catch(e) {
      return null;
    }
  };

  try {
    const origCreateElement = document.createElement.bind(document);
    document.createElement = function (tagName, options) {
      const el = origCreateElement(tagName, options);
      if (typeof tagName === "string" && tagName.toLowerCase() === "audio") {
        registerAudio(el);
      }
      return el;
    };
  } catch (e) {}

  try {
    const origAudio = window.Audio;
    if (origAudio) {
      const PatchedAudio = function (...args) {
        const el = new origAudio(...args);
        registerAudio(el);
        return el;
      };
      PatchedAudio.prototype = origAudio.prototype;
      window.Audio = PatchedAudio;
    }
  } catch (e) {}

  try {
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      if (isRealAudio(this)) {
        registerAudio(this);
      }
      return origPlay.apply(this, args);
    };
  } catch (e) {}
})();




// ==========================================

// 0. IMMEDIATE SPLASH SCREEN KILLER (ZERO BLACK SCREEN)

// ==========================================

(function killSplashScreen() {

  const hideElement = (node) => {

    if (!node || !node.style) return;

    try {

      node.style.setProperty("display", "none", "important");

      node.style.setProperty("opacity", "0", "important");

      node.style.setProperty("visibility", "hidden", "important");

      node.style.setProperty("pointer-events", "none", "important");

      node.style.setProperty("z-index", "-9999", "important");

    } catch (e) {}

  };



  const nuke = () => {

    try {

      const splashes = document.querySelectorAll('div[class*="SplashScreen_root"], .SplashScreen_root__3jzFk, div[class*="WithTopBanner_banner"], #ym-osd-toast, .ym-osd-toast');

      splashes.forEach(hideElement);

      const osd = document.getElementById("ym-osd-toast");

      if (osd) osd.remove();

      const topRoots = document.querySelectorAll('div[class*="WithTopBanner_root"]');

      topRoots.forEach(node => {

        node.style.setProperty("display", "flex", "important");

        node.style.setProperty("flex-direction", "column", "important");

        node.style.setProperty("height", "100vh", "important");

      });

    } catch (e) {}

  };



  nuke();

  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", nuke);

  }

  window.addEventListener("load", nuke);

  try {

    const splashObs = new MutationObserver((mutations) => {

      for (const m of mutations) {

        for (const node of m.addedNodes) {

          if (node.nodeType === 1) {

            if (node.className && typeof node.className === "string" && node.className.includes("SplashScreen_root")) {

              hideElement(node);

            } else if (node.querySelector) {

              const nested = node.querySelector('div[class*="SplashScreen_root"], .SplashScreen_root__3jzFk');

              if (nested) hideElement(nested);

            }

          }

        }

      }

    });

    if (document.documentElement) {

      splashObs.observe(document.documentElement, { childList: true, subtree: true });

    }

    setTimeout(() => splashObs.disconnect(), 6000);

  } catch (e) {}

})();



  // Idempotency guard - prevent double execution if injected both via preload and HTML

  if (window.__ymModInitialized) {

    return;

  }

  window.__ymModInitialized = true;



  console.log("[YandexMusicMod] Initializing mod renderer v5.124.1...");

  window.__ymLastErrors = [];

  window.addEventListener("error", (e) => {

    window.__ymLastErrors.push({

      type: "error",

      message: e.message,

      filename: e.filename,

      lineno: e.lineno,

      colno: e.colno,

      stack: e.error ? e.error.stack : null

    });

    console.error("[YM-UNCAUGHT-ERROR]", e.message, e.filename, e.lineno, e.error);

  });

  window.addEventListener("unhandledrejection", (e) => {

    window.__ymLastErrors.push({

      type: "unhandledrejection",

      reason: String(e.reason),

      stack: e.reason && e.reason.stack ? e.reason.stack : null

    });

    console.error("[YM-UNHANDLED-REJECTION]", e.reason);

  });





  
  // Global Toast Notification & Safe HTML Escaping (v1.3.2)
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showNotification(message, type = "info") {
    showToast(message, type === "info" || type === "success");
  }

  function showToast(message, isInfo = false) {
    try {
      const existing = document.getElementById("ym-mod-toast-notification");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.id = "ym-mod-toast-notification";
      toast.style.cssText = "position:fixed!important;bottom:32px!important;left:50%!important;transform:translateX(-50%)!important;background:rgba(20,22,28,0.94)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;color:#fff!important;border:1px solid rgba(255,45,60,0.45)!important;box-shadow:0 12px 36px rgba(0,0,0,0.7),0 0 24px rgba(255,45,60,0.3)!important;padding:10px 22px!important;border-radius:24px!important;font-size:13px!important;font-weight:600!important;z-index:100000000!important;display:flex!important;align-items:center!important;gap:8px!important;pointer-events:none!important;animation:ymFadeInUp 0.25s ease-out!important;";
      toast.innerHTML = `<span>${escapeHtml(String(message))}</span>`;
      document.body.appendChild(toast);

      setTimeout(() => {
        if (toast && toast.parentNode) {
          toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
          toast.style.opacity = "0";
          toast.style.transform = "translateX(-50%) translateY(10px)";
          setTimeout(() => toast.remove(), 400);
        }
      }, 2500);
    } catch (e) {
      console.log("[YandexMusicMod Toast]", message);
    }
  }

  const MOD_LOGO_ICON_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAARCElEQVR42u1be3BU13n/feece3e1ej+QeJoIjJ6gBwsByY/FtfOy09ieZJ10kjQPd/Kc1BO3aV5tFrmdOhln6nTcOMl06jqepknYFJK0SUziMWyCDTIWxsYgAQLzkjEIhN77uOecr3/sXVlgHsJIJE58ZnY0c3d0z/l+5/e9vwXeXG+uN9cfymKAGFH5RyRQTHD08gVigP7IbjYmcBGhGJAA0LtkxQcO1ITv9Z+Jq3G2mdiECEBs4cJgf/2q9f31qz9F6LAMIHah/SIRAgBXcsU8N/jAhoXNJQD4ajBhJgBgG43KjsOHU8T8ZEUw9J2BxtXfJEB0APa8KlFZyQCQL53nAk5AtOe7HyaAEYnICzBG+Kz6A6Z9LHvAUw2rHuAVb+OhxrZf/eqaujkAwJGIOlcgAHjimoYG3XSDTTW2HYgtXBj0GUBvXIuevW0x3LB6I4dv4bHGtgPdi1vaJ4FAk43eb69tmeUtbT/DLWv4SN2KD5wLVo49vUvCtx6vXdkxyb5cPRWIAYIjEXUpw0YAr43HmQHelRr/cDI9fijkBhctCuU/2Vf/1rspkdB8jrF7qDczlGI+BSKuEM49AAQSa+zEK+PZM8913YcCQl4PAIju+f0yJAsGLghG7tb2LG5tSy+7PsVNNxhuvpFPN6z+Fnzrvyn7DgKAZGPbVm6OsG26gXtqWm/OvSP3niM14bs5fAufrFv1wPnUacYYkLPge5eEV51oXH1f1+JlYQBEiYQmwBLA5wOD4nHDkYhqOPDc1pNe+nMgIWBtqswN3jPs24WbEgmNd77TBYA088tZVyIwWwU+P3GA+Dr7+PyGsio3eB+s5QJJZ66qF1gbjRIAhIjaKp3gPywvLH92rLFtx4n6VWtfqG1dwRcGA5RIaI5E1IKe7f9+Op36LqQThPZShU7gbZGi8qe6F7e00+OPpxkxkWF+GUSA0Tpfqne+UN3ahHjcEohbCwq+5ipnLqym4553BgA2n4dxl+M+pwwAxeOGAVqw79lv7R4dbBzWmfUhJ9BSmVcQq3dCnSONbTtONKz+x/OAkaVpopI5GpXv7en83LCX2gLlBK32MnlSVVeHCja9XLfiE4QOG4A47Gu8VlLJeUH3XgJ4x5KW5lLH/TSM1gABhH4AWOO7UI5GJfnnJICnLNfrsO6CAAsAB2tXvqNSqVi+E2jLfWuMQZrN86PG/mxQ2w21+7fvPMs1bt4snjjaP/f6UGlnUMrZ1mgtSCpIiYH0+D8eTCe7w4Vl/01GawghPWuTP+o/Xn17edV3i9zAndDagxBOkr1IaNfW33FD1MGeuJcT+kh92x1Jndpbu/+5bs4GZTytAEz47VgM1NFhAcjD9Ss/US6dL+VL5xqwzb5WCGjjIWVt1xjbnw159n8ng7F/cXhNdX5okwQYbLOsFVKMepmjISnni+zZGEQ0qL3OQilbJcgBQB4z70gOr1x9YFdX7n19davvLFHy8yHl3nBobPi26v1dv2REJSFuph2AV4GISoG4YQDr59aVtxcVf7FUqc+6SoWgjQdiCaEEiF4Fw9ifnfS8XzYd2NF1tGbFh+YGQ98XbHOek0FSZEGctI0QBGuRAyRtTTrW1131jTNnho/Vr4yWSueekJDtUC6GUqOPlOzpvJujUUnxiwuP6YqyNkUi6qZEQgNA5+LmxmuDoViZVFGQAIzx/J0cCAkQQWsPKeauM9r7fkjQ+8vdvOtgjQUgLMDiNediC5DIAaCtHTiu018rk85H8x13BZgBhk5b7+Unhkdbbjuya2gtgA5fVWccgIloLhoVOdQP14XfVirdjkLltoEZsEb7UjCI1KtgZLQicVm+3AIshMye3WoDkIEQbl86+efze7b/31RvHzMRZ59jH0Rf3cqPlyj3qyHlvAXWwFprBJGwYBYMBtHrLICwAUBgMJQrB9Pj3y/t7vwoRyKKfDb+XgAAQJxNcSUqK5nicbOppqZimSr9QpFUf+0oNwijs8nuNCSeEFJkjDm835rljVgw2pV3kMNdXXqqrpCmLFAuHECUolFg88mTtOacdDYbsFx445/PqaloLytbWyjUX7pAwTRcgrUkqDc59sHa/V0/PDfAMZGI2gxgcyJhL2QP6II0jkYJ8QYWfjHjMpbcUlsbSo0Fi7xApmRVoKh0SOsKjzB7vhMInda6LI/oL8qdwKKs+7syFlqAPct9KZh9SWO2jRv79EtJvfOWY8/3TRsDNlY1hYpCtqDfZkqX5xWXSlDZoPYqK53ALEVUPmpMVakSFQQqSzOX5pEoI1C+IQ4FhaSsAUfWBBIAY3COq7tCpROAEBNakTZmJMN2j2fMtiTZrQM6vb1p/66XfLT5ggCsi0blXfG42V8Tvr3KDX46D5w/zrbUhShWRAWaOS8gRIDEJIHOog5P+sv+VmwBZn9b9otmcprtD4PZgKDBUJBSQSr/fITT48NPV3R3XseICULHWcif5X6iEw9pRVCICKwNFqnAhAtWlI1VJgS0BmDmrEUmm6UkA0wkwGQBEgQCSPjizlTuThBCQSoFo5HU+pTneS+mrX4mDe48btI7s7XKDjtVFRDfmzMnGBL5ZU3B4spigTkaPG+eG5h7xuj5JVLN1UCVA6qSoBIQ8h3pXyrROYzwAcuxgf2H08cCBhFGjX5lxPJ9TPzi4wOn9979Sm//jLvBx6qq8kud2SWVeZi1WAYq+7U3b44bnJ+0Zm6BEPMliVkadnYeyVIDLgoIlQWIKMeeaQo9wB6QGTaZ+yv2PHMfAHA47KCggFFZyWvjcb4sL5CL7NYC1Oi7PZw8SZNdnozHzVTMWAQI/vOipqIMMpXLAiWzT7M3qxBiTpl0/y4gRaUPAl1xPAASUC6GM6knnx4Z+NC7jvQcn0pQRFca/q7NfoBolF4TG1wgLhhoWP1wkXT+SoLltJTmhQSsYYDTkE5wXHsHDqVHPti4/4VOHwSDC8QndDWqw7sbGpyle/ZkdlY31SwKFfyo0A20Qns8Hfsb5kyKbW++UA2QMqtaIKStGevXqc8s6Ol6LFvA7eDzXcZMA0AciUhKJHRPTevNbwmE/isgndnQngaROg+NL7MPwMaSRE9q5GNgsa/SdT+UD7otT8pqSAUwoz+d+kZl97Yv5S7jonHAdK4YINaCmUB8rHblpyrdwEMOCQVrzDkJEIPZQiqZCxmmHAQyM6SS4zqzL3/31loA+JuqqvzPlM5fU0rO+0JSvT0QCMwdTY1veV6n3n/d3udeAXAWE2akvbQOUdkBWALRQEPbg/OCoe84IAlr7CThGcwaJAjKkSNe5oW0Mcf8mIPPY+nPcX1CgEjAaBNyAjXHa1d+jhET33zllfHFPV2/KOve9rEfD5xq6hsf+oAl4VUwmgiwiEbFzKbDvuX9wZyaitvKyh8rdoLvgsmYXFjGAJjZCCEkhETKeCfGtL3/K6+cePRf5lQ9l+841dniCInz+Tsigmdt8rTObJwdyLsDxnoQQqWtPpboH61/+4k7k4hsFrlM9Ko2R3PCP79o2bLby2dtKXYC74LOaMAPepgNARDKkRnmkUEv9fWdo0PNFd1b//WLlaXX5ElZDWuZX00eYJjHXsokvw1QNo5nax2p8gY974GBTPpBOI4Da9IB5S5oLgneQ+iwOeEZoE2RiMr1KWcMgFwfkBIJfaRu5Z01oeIt+VLV5oydZbYALJQjPcAOeOlHd4+Nhkt3b/ty+0svnuBoVLokW4WQyIEEZgMpOcVm24P9L30lbc0QSBCYDIhQoOSy8u7Oe8+kk7+BcoIwWpc66t7fzK0rRzxuY9nqNd+USGi/ODMzAHA2D2OKx82JulVfmucG1weFKILRxhJJMBshlYAQYtBL/+qlVLK9fPfWjy0/uHM/RyLKhsMOxeMmCCw/K4zOgkBnPP3oQwMDwxk2v4UQDGIDAEXKqSYA2zKn3jfupXdASOUqp7y1uOhvCeA1kYiY8fmAbNkZ9muA21+/6tHKYN79gtnCGgMAQmQN3JjxOo+lU+8u3b311tr9XZ0cjcoYICiR0Oh6twGAoJAtvq0jABZSypT2Dm89M/5TADTEZh2YJ9xkxvI1DNBtvb3Dz6RHbx83+jBAKJTys08vaZ63JpEwU5kyEVek74ib3y1quOYLS9ufrAiGPgKtPTBbCCmhHJk0prcvPX53wYtPty/oeeYXjJhgQFA8bjoAy36G9tPy2kJFVO8/EWC2IIEhox+5q3/PKAG8y9MbM9obAoQLZhQKNR8A23DYual317GjmfH3ZEzmjOvkFV6r3C8TwPDbedMNAE0YuyXLblyRX7olX7nXWS+TBpED5ai0Nf2nM6mv/Pr4qeXzu595hACbZUuHpbOSkhgBQG1Jfo0jxCywzZZJhJCe9sa6R5KPAICNRNStvTv7k2w3QQoCW3iwc2KAoq4u79lw2Knb99wLvanxuzLGy5Q5wY//trqpBvG4vdT8gLj8MbYYUSKhj9WFP1IbLP5NkMQCaE8L5QQy4OSAl37w2aFTLRV7tt1/x+m9I36zEuft0EQ2CwAocVWLlIrAbASzgZA0YvX6m/p2Hcu1xRmgQa3/J5v7MYIkZt18bUspAIS7ujRHIqpx/84njqfHPi6Vm9eUF/r7LAsuPj8gLmfSiwAmdNhTjau/Ps/NfzQASJCAJaEGM5kfPT82/Nby3Vvvvf7o3pf97jBNxRcHSSyfNGIljDF8ytPfnniWSBgCeI/VG9PaGwIRLLgoZOXsif9KJDSHw85b9u74wYmxoa8Wu8EPH6pd0U7xuFl3pbOHuRd8r3RR8WBD23puiTA3R5ibb+ThxvYnDtatiLye9jSDCQBGG9q2cHOEedn1aW6O8HDDqqcmzxlNHrQYbFi9gVvWMDfdwH21K98x+bvJAxP99au+d2SJP2ZzkVlFNRXaE+Jmx6KWJdfmhX5cGAi2whiMG71zUGfum9ezfUPOIwBxnmpHJvte4g0LF5Yoojq/1CYAYMDYhwEAmzcL+DZj88mTxAAdNeYnxcx3gATSxAtz300QKDt6I6i785OTW/uvSwXW+cj11ISvXxoq2FkYyGsdT6cO9qVTn1354lOr5vVs38CIiXV+F5am0Is71wA2OuV1jpDlYGMgpEp5maMbh49t8GcMJg6+xleDF43367TxBiAkyoVaAABrXpvi2qmy8KIARONxJoBTwjvpwR46NT7yT78e7QvP7+l8uBvIZIcSOuxdmNqtn88AFjiyVUgJAB6EwDDb//zk8ePj/owgTx664mhU3tq7sz9t7SYWAkm2C85qzJwzpDWVY6hLlIssALT0vLAPQBMAMzGNEY/bqdL9EgYw7O/mZLSX3JfW/+Ebvtey6VU1WF/E/N4inwGIN0xLcfGSw8uXO38zNQO4+hluvpG5JcID9W/94cWMVm7vn8+pqfCWXpccbWg7GAUkXcGAtZhi6ZhzLu1y5m8uZQB/PqemQpKoATOMNXjZmG/Tpc4Rjcr3HN93KmXNk3lCLLh14cJCvhpTYtMheG7FkS1K1BYU1LtCFIMEJ43uXLqv6ykbi4mLqpavBuPgnwip1LWqZN6V1DZ+LwPH0UjWbRUrsVwICQA0kPEeBsC+67vgWptIWAL4mMlsTGpveHkwFJoowr1RVk7Hz9SvepRb/8wmG9sPPVbVlJ8Ntad2k+sAuXlhYz3wBh2kBkCjDW3befnNfKLeH3y+wrHXN4QK5Co1T1QvrQyQqDdeKtWbHH3kgq7vUuM4bzQA1iKboy90g4uV6+aNGPPT6w51H/YnPe3ltYRh33AAIGcASdwCIcQJ7f3bH92PpKYSVHUuXtrWs3j5XfhTX4Q/3R9Jvq7fFL653lxvrmld/w8d4ldjDXh49QAAAABJRU5ErkJggg==";

  const UI_CLEANER_STYLESHEET_ID = "ym-mod-ui-cleaner-style";

  const SCALE_STYLESHEET_ID = "ym-mod-scale-style";

  const THEME_STYLESHEET_ID = "ym-mod-custom-theme-style";

  const FONT_STYLESHEET_ID = "ym-mod-custom-font-style";



  // ==========================================

  // 1. AD & TELEMETRY BLOCKER (SAFE)

  // ==========================================

  try {

    navigator.sendBeacon = () => true;

  } catch (e) {}



  // ==========================================

  // 2. PLUS UNLOCKER & FETCH INTERCEPTOR

  // ==========================================

  const originalFetch = window.fetch;

  let modSettings = {};

  const SECRET_KEY = "kzqU4XhfCaY6B6JTHODeq5";



  // ==========================================
  // v1.3.5: BLOCK OFFICIAL YANDEX MUSIC APP UPDATES
  // ==========================================
  function removeOfficialUpdateBanners() {
    if (modSettings && modSettings["system/blockAppUpdates"] === false) return;
    const bannerSelectors = [
      'div[class*="NotificationUpdate"]',
      'div[class*="WithTopBanner_banner"]',
      'div[class*="UpdateNotification"]',
      'div[class*="AppUpdate"]',
      'button[data-test-id*="APP_UPDATE"]',
      '[data-test-id="APP_UPDATE_NOTIFICATION_BUTTON"]',
      '[data-test-id*="UPDATE_NOTIFICATION"]'
    ];
    for (const sel of bannerSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        try {
          const root = el.closest('div[class*="NotificationUpdate_root"]') || el.closest('div[class*="WithTopBanner_banner"]') || el;
          root.remove();
        } catch (e) {
          el.style.display = "none";
        }
      }
    }

    const allButtons = document.querySelectorAll('header button, div[class*="Top"] button, div[class*="Banner"] button, div[class*="Header"] button');
    for (const btn of allButtons) {
      const txt = (btn.textContent || "").trim().toUpperCase();
      if (txt === "ОБНОВИТЬ" || txt.includes("ДОСТУПНА ВЕРСИЯ")) {
        const parent = btn.closest('div[class*="Banner"], div[class*="Notification"], div[class*="banner"]') || btn.parentElement;
        if (parent) {
          try { parent.remove(); } catch (e) { parent.style.display = "none"; }
        } else {
          try { btn.remove(); } catch (e) { btn.style.display = "none"; }
        }
      }
    }
  }

  // Intercept window.musicDesktop if exposed
  try {
    if (window.musicDesktop && window.musicDesktop.app) {
      window.musicDesktop.app.onUpdateAvailable = () => {};
      window.musicDesktop.app.installUpdate = () => {
        showToast("🛡️ Обновление заблокировано: мод защищён от слетания");
      };
    }
  } catch (e) {}

  removeOfficialUpdateBanners();
  setInterval(removeOfficialUpdateBanners, 1500);

  async function loadSettings() {

    if (window.yandexMusicMod && window.yandexMusicMod.getAllSettings) {

      try {

        modSettings = (await window.yandexMusicMod.getAllSettings()) || {};

      } catch (e) {

        modSettings = {};

      }

    }

  }



  // HMAC-SHA256 signature generator for Yandex Music track URLs

  async function getSign(secretKey, data) {

    try {

      const encoder = new TextEncoder();

      const keyData = encoder.encode(secretKey);

      const cryptoKey = await window.crypto.subtle.importKey(

        "raw",

        keyData,

        { name: "HMAC", hash: { name: "SHA-256" } },

        false,

        ["sign"]

      );

      const messageData = encoder.encode(data);

      const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, messageData);

      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature))).slice(0, -1);

      return base64Signature;

    } catch (e) {

      console.error("[PlusUnlocker] HMAC signature generation failed:", e);

      return null;

    }

  }



  // Re-request direct audio stream without ads or preview restrictions

  async function fetchCleanTrackInfo(trackId, quality = "lossless") {

    try {

      const ts = Math.floor(Date.now() / 1000);

      const audioCodecs = ["flac", "aac", "he-aac", "mp3", "flac-mp4", "aac-mp4", "he-aac-mp4"];

      const transports = "encraw";

      const sign = await getSign(SECRET_KEY, `${ts}${trackId}${quality}${audioCodecs.join("")}${transports}`);

      if (!sign) return null;



      let oauthToken = null;

      try {

        if (window.localStorage && window.localStorage.oauth) {

          const parsed = JSON.parse(window.localStorage.oauth);

          if (parsed && parsed.value) {

            oauthToken = "OAuth " + parsed.value;

          }

        }

      } catch (e) {}



      const headers = {

        "X-Yandex-Music-Client": "YandexMusicDesktopAppWindows/5.124.1",

        "X-Yandex-Music-Frontend": "new",

        "X-Yandex-Music-Without-Invocation-Info": "1",

      };

      if (oauthToken) {

        headers["Authorization"] = oauthToken;

      }



      const directUrl = `https://api.music.yandex.net/get-file-info?ts=${ts}&trackId=${trackId}&quality=${quality}&codecs=${encodeURIComponent(audioCodecs.join(","))}&transports=${transports}&sign=${encodeURIComponent(sign)}`;



      const res = await originalFetch(directUrl, { headers });

      if (res.ok) {

        const data = await res.json();

        if (data && data.downloadInfo && String(data.downloadInfo.trackId) === String(trackId)) {

          return data;

        }

      }

    } catch (err) {

      console.warn("[PlusUnlocker] Error fetching clean track info:", err);

    }

    return null;

  }



  window.fetch = async function (...args) {

    const request = args[0];

    const url = typeof request === "string" ? request : request && request.url ? request.url : "";



    // 0. Only intercept telemetry and api.music.yandex.net requests.

    // Internal Next.js requests (_next, chunks, pages, media) MUST pass through untouched!

    const isYandexApi = url.includes("api.music.yandex.net");

    const isTelemetry = url.includes("log.strm.yandex.ru") || url.includes("dynamic-pages/trigger/polling");

    const isPromo = url.includes("/editorial-promotion") || url.includes("/proxy/plus-red-alert/v1/alerts") || url.includes("/donation");



    if (!isYandexApi && !isTelemetry && !isPromo) {

      return originalFetch.apply(this, args);

    }



    // Bypassed synchronized lyrics sign using Android HMAC secret key (Vzlomhik2005 / Stephanzion standard)
    if (url.includes("/lyrics?") || url.includes("/lyrics")) {
      try {
        let reqUrl = new URL(url);
        let pathSegments = reqUrl.pathname.split("/");
        let trackId = pathSegments[2];
        let timestamp = reqUrl.searchParams.get("timeStamp") || Math.floor(Date.now() / 1000);
        let sign = await getLyricsSign(`${trackId}${timestamp}`);
        reqUrl.searchParams.set("sign", sign);
        reqUrl.searchParams.set("timeStamp", timestamp);

        let newHeaders = new Headers(args[1] && args[1].headers ? args[1].headers : (request && request.headers ? request.headers : {}));
        newHeaders.set("x-yandex-music-client", "YandexMusicAndroid/24023621");

        const newInit = Object.assign({}, args[1] || {}, { headers: newHeaders });
        return originalFetch.call(this, reqUrl.toString(), newInit);
      } catch (e) {
        console.warn("[Lyrics HMAC] bypass error:", e);
      }
    }

    // Block telemetry & tracking polling

    if (isTelemetry) {

      return new Response(JSON.stringify({ status: "ok" }), {

        status: 200,

        headers: { "Content-Type": "application/json" },

      });

    }



    // Suppress subscription paywalls, red alerts, promo banners, and donations

    if (url.includes("/editorial-promotion")) {

      return new Response(JSON.stringify({ promotions: [], result: { promotions: [] } }), {

        status: 200,

        headers: { "Content-Type": "application/json" },

      });

    }

    if (url.includes("/proxy/plus-red-alert/v1/alerts")) {

      return new Response(JSON.stringify({ alerts: [], result: { alerts: [] } }), {

        status: 200,

        headers: { "Content-Type": "application/json" },

      });

    }

    if (url.includes("/donation")) {

      return new Response(JSON.stringify({ donations: [], result: { donations: [] } }), {

        status: 200,

        headers: { "Content-Type": "application/json" },

      });

    }



    // 1. Account Info & hasPlus Unlock (Plus + Free Web User blocker)

    if (url.includes("/account/about") || url.includes("/account/status")) {

      try {

        const res = await originalFetch.apply(this, args);

        if (res.ok) {

          const data = await res.json();

          data.hasPlus = true;

          data.isFreeWebUser = false;

          data.freeAccess = false;

          if (data.result) {

            data.result.hasPlus = true;

            data.result.isFreeWebUser = false;

            data.result.freeAccess = false;

            if (data.result.plus) data.result.plus.hasPlus = true;

          }

          console.log("[PlusUnlocker] Injected hasPlus = true and suppressed free web flags");

          return new Response(JSON.stringify(data), {

            status: 200,

            headers: { "Content-Type": "application/json" },

          });

        }

      } catch (err) {

        console.error("[PlusUnlocker] Error in account interceptor:", err);

      }

    }



    // 2. Rotor sessions - filter out audio ads and promo items

    if (url.includes("/rotor/session/")) {

      try {

        const res = await originalFetch.apply(this, args);

        if (res.ok) {

          const data = await res.json();

          if (!url.includes("feedback")) {

            const filterAds = (tracks) => {

              if (!Array.isArray(tracks)) return tracks;

              return tracks.filter((item) => {

                const t = item.track || item;

                if (!t) return false;

                if (t.type === "ad" || t.ad) return false;

                const title = t.title || "";

                if (title.includes("Upgrade") || title.includes("Промокод")) return false;

                if (t.type === "promo" || t.isPromo) return false;

                return true;

              });

            };



            if (data.sequence) {

              data.sequence = filterAds(data.sequence);

            }

            if (data.result && data.result.sequence) {

              data.result.sequence = filterAds(data.result.sequence);

            }

          }

          return new Response(JSON.stringify(data), {

            status: 200,

            headers: { "Content-Type": "application/json" },

          });

        }

      } catch (err) {

        console.error("[PlusUnlocker] Error in rotor interceptor:", err);

      }

    }



    // 3. get-file-info - remove track restrictions, audio ads and track preview limits

    if (url.includes("/get-file-info")) {

      try {

        const res = await originalFetch.apply(this, args);

        if (res.ok) {

          const data = await res.json();

          let requestedTrackId = null;

          try {

            const urlObj = new URL(url.startsWith("http") ? url : "https://api.music.yandex.net" + url);

            requestedTrackId = urlObj.searchParams.get("trackId");

          } catch (e) {}



          const returnedTrackId = data && data.downloadInfo ? String(data.downloadInfo.trackId) : null;

          const isAdCodec = data && data.downloadInfo && (data.downloadInfo.codec === "ad" || data.downloadInfo.title === "Upgrade");



          if (requestedTrackId && (returnedTrackId !== String(requestedTrackId) || isAdCodec)) {

            console.log(`[PlusUnlocker] Ad detected in get-file-info for track ${requestedTrackId}, bypassing...`);

            const cleanInfo = await fetchCleanTrackInfo(requestedTrackId);

            if (cleanInfo) {

              return new Response(JSON.stringify(cleanInfo), {

                status: 200,

                headers: { "Content-Type": "application/json" },

              });

            }

          }



          return new Response(JSON.stringify(data), {

            status: 200,

            headers: { "Content-Type": "application/json" },

          });

        }

      } catch (err) {

        console.error("[PlusUnlocker] Error in get-file-info interceptor:", err);

      }

    }



    // 4. Experiments details (Pass-through with user overrides only)

    if (url.includes("/account/experiments/details")) {

      try {

        const res = await originalFetch.apply(this, args);

        if (res.ok) {

          const data = await res.json();

          const customOverrides = modSettings["settings/accountExperimentsOverride"] || [];

          if (Array.isArray(customOverrides) && customOverrides.length > 0) {

            const modified = { ...data };

            for (const item of customOverrides) {

              if (item && item.id) {

                modified[item.id] = item.value;

              }

            }

            return new Response(JSON.stringify(modified), {

              status: res.status,

              headers: { "Content-Type": "application/json" },

            });

          }

          return new Response(JSON.stringify(data), {

            status: res.status,

            headers: { "Content-Type": "application/json" },

          });

        }

      } catch (err) {

        console.error("[YandexMusicMod] Error in experiments interceptor:", err);

      }

    }



    return originalFetch.apply(this, args);

  };



  

  // ==========================================

  // 3.1 EQUALIZER & WEBAUDIO SOUND FX

  // ==========================================

  let audioCtx = null;

  let audioSource = null;

  let eqFilters = [];

  const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  const EQ_PRESETS = {

    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    bassBoost: [9, 8, 6, 3, 1, 0, 0, 1, 2, 3],

    vocal: [-2, -2, -1, 3, 6, 6, 4, 2, 0, -1],

    club: [6, 5, 3, 0, 0, 2, 4, 5, 5, 0],

    rock: [5, 4, 2, -1, -2, 1, 3, 5, 6, 6],

  };



  function initAudioEqualizer() {

    if (audioSource) return;

    const audioEl = document.querySelector("audio");

    if (!audioEl) return;



    try {

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      audioCtx = new AudioContextClass();

      audioSource = audioCtx.createMediaElementSource(audioEl);



      eqFilters = EQ_FREQUENCIES.map((freq, idx) => {

        const filter = audioCtx.createBiquadFilter();

        if (idx === 0) {

          filter.type = "lowshelf";

        } else if (idx === EQ_FREQUENCIES.length - 1) {

          filter.type = "highshelf";

        } else {

          filter.type = "peaking";

          filter.Q.value = 1.4;

        }

        filter.frequency.value = freq;

        filter.gain.value = 0;

        return filter;

      });



      let prev = audioSource;

      for (const filter of eqFilters) {

        prev.connect(filter);

        prev = filter;

      }

      prev.connect(audioCtx.destination);



      const savedPreset = modSettings["equalizer/preset"] || "flat";

      applyEqualizerPreset(savedPreset);

    } catch (e) {

      console.warn("[Equalizer] WebAudio init:", e);

    }

  }



  function applyEqualizerPreset(presetName) {

    const gains = EQ_PRESETS[presetName] || EQ_PRESETS.flat;

    if (eqFilters.length > 0) {

      eqFilters.forEach((f, i) => {

        if (f.gain) f.gain.value = gains[i] || 0;

      });

    }

    if (audioCtx && audioCtx.state === "suspended") {

      audioCtx.resume();

    }

  }



  // ==========================================

  // 3.2 GRANULAR UI CLEANER

  // ==========================================

  function applyUiCleaner() {

    const existing = document.getElementById(UI_CLEANER_STYLESHEET_ID);

    if (existing) existing.remove();



    let css = "";

    

    // Sidebar Navigation items

    if (modSettings["cleaner/hideConcerts"] || modSettings["custom-themes/hideConcerts"]) {

      css += `

        aside[data-test-id="NAVBAR"] li:has([data-test-id="NAVBAR_NAVIGATION_ITEM_CONCERTS"]),

        aside [data-test-id="NAVBAR_NAVIGATION_ITEM_CONCERTS"],

        aside li:has(a[href*="/concerts"]),

        aside a[href*="/concerts"],

        aside a[href*="/concert"] { display: none !important; }

      `;

    }

    if (modSettings["cleaner/hideKids"] || modSettings["custom-themes/hideKids"]) {

      css += `

        aside[data-test-id="NAVBAR"] li:has([data-test-id="NAVBAR_NAVIGATION_ITEM_KIDS"]),

        aside [data-test-id="NAVBAR_NAVIGATION_ITEM_KIDS"],

        aside li:has(a[href*="/kids"]),

        aside a[href*="/kids"],

        [data-test-id="SETTINGS_KIDS_BUTTON"] { display: none !important; }

      `;

    }

    if (modSettings["cleaner/hidePodcasts"]) {

      css += `

        aside[data-test-id="NAVBAR"] li:has([data-test-id="NAVBAR_NAVIGATION_ITEM_NON_MUSIC"]),

        aside [data-test-id="NAVBAR_NAVIGATION_ITEM_NON_MUSIC"],

        aside li:has(a[href*="/non-music"]),

        aside a[href*="/non-music"],

        aside li:has(a[href*="/podcasts"]),

        aside a[href*="/podcasts"],

        aside a[href*="/books"] { display: none !important; }

      `;

    }

    if (modSettings["cleaner/hideTrends"]) {

      css += `aside li:has([data-test-id="NAVBAR_NAVIGATION_ITEM_FOR_YOU_AND_TRENDS"]), aside a[href*="/landing"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideRadio"]) {

      css += `aside a[href*="/radio"] { display: none !important; }

`;

    }



    // Ads, Promos & Banners

    if (modSettings["cleaner/hideBanners"] !== false) {

      css += `

        div[class*="Paywall"], div[class*="Subscription"], div[data-test-id*="PROMO"], 

        div[data-test-id*="PAYWALL"], div[class*="paywall"], div[class*="WithTopBanner_banner_"], 

        div[class*="PromoBanner_"], div[class*="PaywallBanner_"], div[class*="SubscriptionBanner_"], 

        div[data-test-id="NAVBAR_NAVIGATION_ITEM_PLUS"] { display: none !important; }

      `;

    }

    if (modSettings["cleaner/hideMobileApp"] !== false) {

      css += `div[class*="InstallApp"], div[class*="MobileApp"], div[class*="QrCode"], a[href*="desktop#mobile"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideDonates"]) {

      css += `div[class*="Donate"], button[data-test-id*="DONATE"], div[class*="TipsBlock"], a[href*="/support"], div[class*="ArtistSupport_"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideTickets"]) {

      css += `div[class*="Ticket"], a[href*="afisha.yandex.ru"], button[data-test-id*="TICKET"], div[class*="ConcertWidget"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideTrailers"]) {

      css += `aside a[href*="/trailers"], [data-test-id*="TRAILER"], div[class*="VideoBlock"] { display: none !important; }

`;

    }



    // Player Bar items

    if (modSettings["cleaner/hideDislike"]) {

      css += `button[data-test-id="DISLIKE_BUTTON"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideQueue"]) {

      css += `button[data-test-id="PLAYERBAR_DESKTOP_PLAY_QUEUE_BUTTON"], button[data-test-id="QUEUE_BUTTON"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideFullscreen"]) {

      css += `button[data-test-id="FULLSCREEN_PLAYER_BUTTON"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideQuality"]) {

      css += `button[data-test-id="SOUND_QUALITY_BUTTON"], button[data-test-id="CONTEXT_MENU_AUDIO_QUALITY_ITEM"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hidePrev"]) {

      css += `button[data-test-id="PREVIOUS_TRACK_BUTTON"], button[data-test-id="sonata.PREVIOUS_TRACK_BUTTON"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideLyrics"]) {

      css += `button[data-test-id="PLAYERBAR_DESKTOP_SYNC_LYRICS_BUTTON"], button[data-test-id*="LYRICS"] { display: none !important; }

`;

    }

    if (modSettings["cleaner/hideVolume"]) {

      css += `div[data-test-id="VOLUME_CONTROL_CONTAINER"], div[class*="Volume"] { display: none !important; }

`;

    }



    if (css.trim()) {

      const style = document.createElement("style");

      style.id = UI_CLEANER_STYLESHEET_ID;

      style.textContent = css;

      (document.head || document.documentElement).appendChild(style);

    }

  }



  // ==========================================

  // 3.3 1-CLICK DOWNLOADER & OSD TOAST

  // ==========================================

  async function downloadCurrentTrack() {

    try {

      showToast("⏳ Получение ссылки для скачивания...");

      const player = document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]');

      let trackId = null;

      let title = "track";

      let artist = "artist";



      const fiberMeta = searchFiberProperty(player, "entityMeta");

      if (fiberMeta && fiberMeta.entityMeta) {

        trackId = fiberMeta.entityMeta.id;

        title = fiberMeta.entityMeta.title;

        artist = Array.isArray(fiberMeta.entityMeta.artists)

          ? fiberMeta.entityMeta.artists.map((a) => (typeof a === "object" ? a.name : a)).join(", ")

          : fiberMeta.entityMeta.artists || "";

      } else {

        const link = player ? player.querySelector('a[href*="/track/"]') : null;

        if (link) {

          const m = link.href.match(/track\/(\d+)/);

          if (m) trackId = m[1];

        }

        title = player?.querySelector('[class*="Track_title"]')?.textContent || "track";

        artist = player?.querySelector('[class*="Track_artists"]')?.textContent || "artist";

      }



      if (!trackId) {

        showToast("❌ Не удалось определить ID трека");

        return;

      }



      const cleanInfo = await fetchCleanTrackInfo(trackId, "lossless");

      if (!cleanInfo || !cleanInfo.downloadInfo || !cleanInfo.downloadInfo.downloadUrl) {

        showToast("❌ Ошибка получения потока трека");

        return;

      }



      const downloadUrl = cleanInfo.downloadInfo.downloadUrl;

      const safeFilename = `${artist} - ${title}.mp3`.replace(/[\\/:*?"<>|]/g, "_");



      const a = document.createElement("a");

      a.href = downloadUrl;

      a.download = safeFilename;

      a.target = "_blank";

      document.body.appendChild(a);

      a.click();

      a.remove();

      showToast(`⬇️ Скачивание: ${safeFilename}`);

    } catch (e) {

      showToast("❌ Ошибка при скачивании");

    }

  }



  function showOsdTrackToast(title, artist, coverUrl) {

    // Disabled inside main window to permanently prevent layout shifts or unwanted top banners

    const existing = document.getElementById("ym-osd-toast");

    if (existing) existing.remove();

  }



  function injectPlayerDownloadButton() {

    if (document.getElementById("ym-btn-player-download")) return;

    const player = document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]');

    if (!player) return;

    const likeBtn = player.querySelector('button[data-test-id="LIKE_BUTTON"]');

    if (!likeBtn || !likeBtn.parentNode) return;



    const btn = document.createElement("button");

    btn.id = "ym-btn-player-download";

    btn.className = "ym-player-download-btn";

    btn.title = "Скачать трек (Yandex Music Mod)";

    btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`;

    btn.addEventListener("click", (e) => {

      e.stopPropagation();

      downloadCurrentTrack();

    });

    likeBtn.parentNode.insertBefore(btn, likeBtn.nextSibling);

  }



  // ==========================================

  // 3. GUARANTEED FONTS APPLICATOR

  // ==========================================

  function ensureBaseStylesheet() {

    if (!document.getElementById("ym-mod-renderer-style")) {

      const link = document.createElement("link");

      link.id = "ym-mod-renderer-style";

      link.rel = "stylesheet";

      link.href = "/yandexMusicMod/renderer.css";

      (document.head || document.documentElement).appendChild(link);

    }

  }



  

  function applyTheme(accent = "#8b5cf6", enabled = true) {

    try {

      const existing = document.getElementById(THEME_STYLESHEET_ID);

      if (existing) existing.remove();



      if (!enabled || !accent) return;



      const glassBlur = modSettings["design/glassBlur"] || "medium";

      const cardHover = modSettings["design/cardHoverFx"] !== false;

      const playerGlow = modSettings["design/playerGlow"] !== false;

      const glowProgress = modSettings["design/glowProgress"] !== false;

      const smoothTransitions = modSettings["design/smoothTransitions"] !== false;



      let blurCss = "backdrop-filter: blur(28px) saturate(180%) !important; -webkit-backdrop-filter: blur(28px) saturate(180%) !important;";

      if (glassBlur === "off") {

        blurCss = "backdrop-filter: none !important; -webkit-backdrop-filter: none !important;";

      } else if (glassBlur === "light") {

        blurCss = "backdrop-filter: blur(14px) saturate(140%) !important; -webkit-backdrop-filter: blur(14px) saturate(140%) !important;";

      } else if (glassBlur === "ultra") {

        blurCss = "backdrop-filter: blur(44px) saturate(220%) !important; -webkit-backdrop-filter: blur(44px) saturate(220%) !important;";

      }



      let extra = "";

      if (cardHover) {

        extra += `

          /* Catalog and collection cards hover effect */

          div[data-test-id="PLAYLIST_CARD"],

          div[data-test-id="ALBUM_CARD"],

          div[data-test-id="ARTIST_CARD"],

          div[data-test-id="MIX_CARD"],

          div[data-test-id="NEW_RELEASE_CARD"],

          div[data-test-id="HORIZONTAL_ALBUM_CARD"],

          div[data-test-id="HORIZONTAL_PLAYLIST_CARD"],

          div[data-test-id="HORIZONTAL_ARTIST_CARD"],

          div[data-test-id="HORIZONTAL_CLIP_CARD"],

          div[data-test-id="EDITORIAL_PROMOTIONS_CARD"],

          div[data-test-id="UPCOMING_ALBUM_CARD"],

          div[data-test-id="MIX_CARD_ITEM"],

          div[class*="EntityCard_root"]:not([class*="Words"]):not([class*="Modal"]):not([class*="Popover"]),

          div[class*="ItemCard_root"]:not([class*="Words"]):not([class*="Modal"]):not([class*="Popover"]) {

            transition: transform 0.22s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.22s cubic-bezier(0.2, 0, 0, 1) !important;

          }

          div[data-test-id="PLAYLIST_CARD"]:hover,

          div[data-test-id="ALBUM_CARD"]:hover,

          div[data-test-id="ARTIST_CARD"]:hover,

          div[data-test-id="MIX_CARD"]:hover,

          div[data-test-id="NEW_RELEASE_CARD"]:hover,

          div[data-test-id="HORIZONTAL_ALBUM_CARD"]:hover,

          div[data-test-id="HORIZONTAL_PLAYLIST_CARD"]:hover,

          div[data-test-id="HORIZONTAL_ARTIST_CARD"]:hover,

          div[data-test-id="HORIZONTAL_CLIP_CARD"]:hover,

          div[data-test-id="EDITORIAL_PROMOTIONS_CARD"]:hover,

          div[data-test-id="UPCOMING_ALBUM_CARD"]:hover,

          div[data-test-id="MIX_CARD_ITEM"]:hover,

          div[class*="EntityCard_root"]:not([class*="Words"]):not([class*="Modal"]):not([class*="Popover"]):hover,

          div[class*="ItemCard_root"]:not([class*="Words"]):not([class*="Modal"]):not([class*="Popover"]):hover {

            transform: translateY(-4px) scale(1.02) !important;

            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5), 0 0 16px ${accent}44 !important;

          }

        `;

      }

      if (playerGlow) {

        extra += `

          div[class*="PlayerBarDesktop_root"], footer[class*="PlayerBar_root"] {

            box-shadow: 0 -4px 30px ${accent}33 !important;

            border-top: 1px solid rgba(255, 255, 255, 0.12) !important;

          }

        `;

      }

      if (glowProgress) {

        extra += `

          div[class*="ProgressBar_sliderThumb"] {

            background-color: ${accent} !important;

            box-shadow: 0 0 10px ${accent} !important;

          }

          div[class*="ProgressBar_progress_"] {

            background-color: ${accent} !important;

            box-shadow: 0 0 8px ${accent}88 !important;

          }

        `;

      }

      if (smoothTransitions) {

        extra += `

          main, div[class*="DefaultLayout_content"] {

            animation: ymPageFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;

          }

          @keyframes ymPageFadeIn {

            from { opacity: 0.85; transform: translateY(4px); }

            to { opacity: 1; transform: translateY(0); }

          }

        `;

      }



      const style = document.createElement("style");

      style.id = THEME_STYLESHEET_ID;

      style.textContent = `

        :root {

          --yandexMusicModAccent: ${accent} !important;

          --accent: ${accent} !important;

          --accent-glow: ${accent}55 !important;

          --ym-accent: ${accent} !important;

        }

        .ym-mod-btn-icon, .ym-float-icon {

          color: ${accent} !important;

        }

        .ym-mod-modal, div[class*="NavbarDesktop_root"], div[class*="PlayerBarDesktop_root"] {

          ${blurCss}

        }

        ${extra}

      `;

      (document.head || document.documentElement).appendChild(style);

    } catch (e) {

      console.error("[YandexMusicMod] Error applying theme:", e);

    }

  }



  
  // ==========================================
  // v1.3.2: DYNAMIC SNOWFALL PARTICLE SYSTEM
  // ==========================================
  let snowAnimationId = null;
  let snowCanvas = null;

  function startSnowfall() {
    if (document.getElementById("ym-snow-canvas")) return;
    snowCanvas = document.createElement("canvas");
    snowCanvas.id = "ym-snow-canvas";
    document.body.appendChild(snowCanvas);

    const ctx = snowCanvas.getContext("2d");
    let width = (snowCanvas.width = window.innerWidth);
    let height = (snowCanvas.height = window.innerHeight);

    const onResize = () => {
      if (!snowCanvas) return;
      width = snowCanvas.width = window.innerWidth;
      height = snowCanvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const FLAKES_COUNT = 60;
    const flakes = [];
    for (let i = 0; i < FLAKES_COUNT; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3.5 + 1.2,
        d: Math.random() * FLAKES_COUNT,
        speed: Math.random() * 1.4 + 0.6,
        opacity: Math.random() * 0.75 + 0.25,
      });
    }

    let angle = 0;
    function drawSnow() {
      if (!snowCanvas) return;
      ctx.clearRect(0, 0, width, height);
      angle += 0.012;

      for (let i = 0; i < FLAKES_COUNT; i++) {
        const p = flakes[i];
        p.y += p.speed;
        p.x += Math.sin(angle + p.d) * 0.75;

        if (p.y > height) {
          flakes[i] = {
            x: Math.random() * width,
            y: -10,
            r: p.r,
            d: p.d,
            speed: p.speed,
            opacity: p.opacity,
          };
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        ctx.fill();
      }
      snowAnimationId = requestAnimationFrame(drawSnow);
    }
    snowAnimationId = requestAnimationFrame(drawSnow);
  }

  function stopSnowfall() {
    if (snowAnimationId) {
      cancelAnimationFrame(snowAnimationId);
      snowAnimationId = null;
    }
    const canvas = document.getElementById("ym-snow-canvas");
    if (canvas) canvas.remove();
    snowCanvas = null;
  }

  // ==========================================
  // v1.3.5: APPLE MUSIC GLASSMORPHIC MINI-PLAYER & SYNCED LYRICS (PIXEL-PERFECT)
  // ==========================================
  let fsLyricsVisible = false;
  let miniPlayerMode = "lyrics"; // "lyrics" | "compact" | "artwork"
  let currentParsedLyrics = [];
  let currentTrackTitle = "";
  let currentTrackArtist = "";
  let currentTrackAlbum = "";
  let currentTrackCover = "";
  let currentTrackLyricsId = null;
  let isFetchingLyrics = false;
  let lastActiveLyricIdx = -1;
  let isUserScrolling = false;
  let userScrollTimeout = null;

  function calculateLineWeight(text) {
    const clean = (text || "").replace(/\[[^\]]*\]/g, "").trim();
    const vowels = (clean.match(/[аеёиоуыэюяaeiouy]/gi) || []).length;
    const words = clean.split(/\s+/).filter(Boolean).length;
    let weight = vowels * 1.0 + words * 0.35;
    if (/[,!?;:—\-]/.test(clean)) weight += 0.8;
    return Math.max(1.8, weight);
  }

  function isSectionHeader(text) {
    const trimmed = (text || "").trim();
    if (/^\[(интро|припев|куплет|бридж|аутро|скит|текст песни|intro|chorus|verse|bridge|outro|hook|drop|pre-chorus|post-chorus)[^\]]*\]$/i.test(trimmed)) return true;
    if (/^\[[^\]]+\]$/.test(trimmed)) return true;
    return false;
  }

  function parseLrcToLines(lrc, duration = 0) {
    if (!lrc) return [];
    if (Array.isArray(lrc)) return lrc;
    if (typeof lrc !== "string") return [];

    const lines = [];
    const rawLines = lrc.split("\n");
    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
    let hasAnyTime = false;

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;
      // Skip LRC metadata tags like [ar:The Weeknd], [ti:Sacrifice], etc.
      if (/^\[(ar|ti|al|by|offset|length|re|ve|hash):/i.test(trimmed)) {
        continue;
      }

      timeRegex.lastIndex = 0;
      let match;
      let text = trimmed.replace(timeRegex, "").trim();
      timeRegex.lastIndex = 0;

      // Clean HTML tags and ignore leaked containers/attributes
      text = text.replace(/<[^>]+>/g, "").trim();
      if (!text) continue;
      if (/^<[a-z0-9_-]+/i.test(text) || /^<[a-z0-9_-]+/i.test(trimmed)) continue;
      if (/^(class|id|data-[a-z0-9_-]+)\s*=/i.test(text) || /^(class|id|data-[a-z0-9_-]+)\s*=/i.test(trimmed)) continue;
      if (text.includes("Lyrics__Container") || trimmed.includes("Lyrics__Container")) continue;
      if (text.includes("data-lyrics-container") || trimmed.includes("data-lyrics-container")) continue;
      if (/^<\/?(div|p|span)>/i.test(trimmed) || trimmed === "<div" || trimmed === ">" || trimmed === "<") continue;

      let foundTime = false;
      while ((match = timeRegex.exec(trimmed)) !== null) {
        hasAnyTime = true;
        foundTime = true;
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, "0").slice(0, 3), 10) : 0;
        const time = min * 60 + sec + ms / 1000;
        lines.push({ time, text: text || "♪" });
      }
      if (!foundTime && text) {
        lines.push({ time: -1, text: text });
      }
    }

    if (hasAnyTime) {
      // Keep only timed lines or clean text, sorted by timestamp
      const timed = lines.filter((l) => l.time >= 0 && l.text && !/^\[[^\]]+\]$/.test(l.text.trim())).sort((a, b) => a.time - b.time);
      return timed.length > 0 ? timed : lines;
    }

    // Filter out bracket headers & metadata for plain lyrics
    const cleanLines = lines.filter((l) => {
      const txt = (l.text || "").trim();
      if (!txt) return false;
      const lower = txt.toLowerCase();
      if (lower.startsWith("[текст песни") || lower.startsWith("[lyrics of")) return false;
      if (lower.includes("contributors") || lower.includes("translations") || lower.includes("romanization") || lower.includes("you might also like")) return false;
      if (lower.includes("lyrics__container") || lower.includes("data-lyrics-container")) return false;
      if (/^<[a-z0-9_-]+/i.test(txt) || /^(class|id|data-)\s*=/i.test(txt)) return false;
      if (txt === "♫ текст этой песни недоступен." || txt === "текст этой песни недоступен.") return false;
      if (isSectionHeader(txt)) return false;
      return true;
    });

    if (cleanLines.length > 0) {
      const activeAudio = typeof window.__ymGetActiveAudio === "function" ? window.__ymGetActiveAudio() : null;
      const dur = duration > 0 ? duration : (activeAudio && activeAudio.duration ? activeAudio.duration : 180);
      const title = (currentTrackTitle || "").toLowerCase();
      const isSpeedUp = /speed\s*up|sped\s*up|nightcore|fast/i.test(title);
      const isSlowed = /slowed|reverb/i.test(title);

      let introOffset = isSpeedUp ? 1.8 : 2.4;
      if (isSlowed) introOffset = 4.2;
      if (dur < 75) introOffset = Math.min(introOffset, dur * 0.04);

      let outroTail = isSpeedUp ? 2.5 : 3.5;
      if (isSlowed) outroTail = 5.0;
      if (dur < 75) outroTail = Math.min(outroTail, dur * 0.04);

      const availableTime = Math.max(10, dur - introOffset - outroTail);
      const weights = cleanLines.map((l) => calculateLineWeight(l.text));
      const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1;

      let currentTime = introOffset;
      cleanLines.forEach((l, idx) => {
        const lineDur = (weights[idx] / totalWeight) * availableTime;
        l.time = +(currentTime).toFixed(2);
        l.duration = +(lineDur).toFixed(2);
        l.isSyntheticTime = true;
        currentTime += lineDur;
      });

      return cleanLines;
    }

    return lines;
  }

  async function loadLyricsForTrack(title, artist, trackId, coverUrl, album = "") {
    const cleanTitleLower = (title || "").trim().toLowerCase();
    if (BUILTIN_SYNCED_LYRICS[cleanTitleLower]) {
      currentTrackTitle = (title || "").trim();
      currentTrackArtist = (typeof artist === "string" ? artist : "").trim();
      currentTrackAlbum = album || "";
      currentTrackCover = coverUrl || "";
      currentTrackLyricsId = trackId || `${currentTrackTitle}-${currentTrackArtist}`;
      isFetchingLyrics = false;
      currentParsedLyrics = parseLrcToLines(BUILTIN_SYNCED_LYRICS[cleanTitleLower]);
      renderLyricsBodyUI();
      if (window.yandexMusicMod && window.yandexMusicMod.updateLyrics) {
        window.yandexMusicMod.updateLyrics({
          track: currentTrackTitle,
          artist: currentTrackArtist,
          trackId: trackId,
          coverUrl: currentTrackCover,
          lrc: BUILTIN_SYNCED_LYRICS[cleanTitleLower],
          lines: currentParsedLyrics,
        });
      }
      return;
    }
    const cleanTitle = (title || "").trim();
    let cleanArtist = "";
    if (Array.isArray(artist)) {
      cleanArtist = artist.map((a) => (typeof a === "object" ? (a.name || "") : String(a))).join(", ");
    } else {
      cleanArtist = String(artist || "").trim();
    }
    if (!cleanTitle) return;

    currentTrackTitle = cleanTitle;
    currentTrackArtist = cleanArtist;
    currentTrackAlbum = album || "";
    currentTrackCover = coverUrl || "";
    currentTrackLyricsId = trackId || `${cleanTitle}-${cleanArtist}`;
    lastActiveLyricIdx = -1;

    updateLyricsHeaderUI();

    const bodyEl = document.getElementById("ym-am-lyrics-body");
    if (bodyEl && fsLyricsVisible && miniPlayerMode === "lyrics") {
      bodyEl.innerHTML = `
        <div style="text-align:center;color:rgba(255,255,255,0.65);margin:auto;font-size:14px;display:flex;flex-direction:column;align-items:center;gap:12px;padding:30px 10px;">
          <div class="ym-spinner" style="width:28px;height:28px;border:3px solid rgba(255,255,255,0.25);border-top-color:#ffffff;border-radius:50%;animation:ymSpin 0.8s linear infinite;"></div>
          <span>Поиск текста песни...</span>
        </div>
      `;
    }

    isFetchingLyrics = true;
    let lrc = null;
    let plainYmFallback = null;

    try {
      let oauthToken = "";
      try {
        const rawOauth = window.localStorage.getItem("oauth");
        if (rawOauth) {
          const parsed = JSON.parse(rawOauth);
          if (parsed && parsed.value) oauthToken = "OAuth " + parsed.value;
        }
      } catch (e) {}

      // 1. Direct renderer fetch from Yandex Music API if trackId exists and user has token
      if (trackId && String(trackId).match(/^\d+$/)) {
        try {
          const resp = await fetch(`https://api.music.yandex.net/tracks/${trackId}/supplement`, {
            headers: {
              Authorization: oauthToken,
              "X-Yandex-Music-Client": "YandexMusicDesktopAppWindows/5.124.1",
              "X-Yandex-Music-Frontend": "new",
            },
          });
          if (resp.ok) {
            const data = await resp.json();
            const res = data.result || data;
            if (res && res.lyrics) {
              if (Array.isArray(res.lyrics.syncLyrics) && res.lyrics.syncLyrics.length > 0) {
                const lrcLines = res.lyrics.syncLyrics.map((item) => {
                  const totalSec = (item.timestamp || item.offset || 0) / 1000;
                  const m = Math.floor(totalSec / 60);
                  const s = Math.floor(totalSec % 60);
                  const cs = Math.floor((totalSec % 1) * 100);
                  return `[${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}.${cs < 10 ? "0" : ""}${cs}] ${item.line || item.text || ""}`;
                });
                lrc = lrcLines.join("\n");
              } else if (res.lyrics.fullLyrics) {
                plainYmFallback = res.lyrics.fullLyrics;
              }
            }
          }
        } catch (e) {}
      }

      // 2. Fallback to main process fetchLyrics (checks LRCLib, built-in, and Genius)
      if (!lrc && window.yandexMusicMod && window.yandexMusicMod.fetchLyrics) {
        lrc = await window.yandexMusicMod.fetchLyrics(cleanTitle, cleanArtist, trackId, oauthToken);
      }
      if (!lrc && plainYmFallback) {
        lrc = plainYmFallback;
      }
    } catch (e) {
      console.error("[Mod] Lyrics fetch error:", e);
    }
    isFetchingLyrics = false;

    if (lrc) {
      currentParsedLyrics = parseLrcToLines(lrc);
    } else {
      currentParsedLyrics = [];
    }

    renderLyricsBodyUI();

    // Broadcast to Karaoke window and Overlay (v1.3.13: include parsed lines, trackId, and cover)
    if (window.yandexMusicMod && window.yandexMusicMod.updateLyrics) {
      window.yandexMusicMod.updateLyrics({
        track: cleanTitle,
        artist: cleanArtist,
        trackId: trackId,
        coverUrl: currentTrackCover,
        lrc: lrc || `[00:00.00] ${cleanTitle} - ${cleanArtist}\n[00:03.00] ♫ Текст этой песни недоступен.`,
        lines: currentParsedLyrics,
      });
    }
  }

  function updateLyricsHeaderUI() {
    const titleEl = document.getElementById("ym-am-title");
    const artistEl = document.getElementById("ym-am-artist");
    const coverEl = document.getElementById("ym-am-cover");
    const backdropEl = document.getElementById("ym-am-art-backdrop");

    if (titleEl) titleEl.textContent = currentTrackTitle || "Трек не выбран";
    if (artistEl) {
      const art = currentTrackArtist || "Яндекс Музыка";
      artistEl.textContent = currentTrackAlbum ? `${art} — ${currentTrackAlbum}` : art;
    }
    if (coverEl) {
      coverEl.src = currentTrackCover || "https://music.yandex.ru/favicon.ico";
    }
    if (backdropEl && currentTrackCover) {
      backdropEl.style.backgroundImage = `url("${currentTrackCover}")`;
    }
  }

  function renderLyricsBodyUI() {
    const bodyEl = document.getElementById("ym-am-lyrics-body");
    if (!bodyEl) return;

    if (miniPlayerMode === "artwork") {
      // Apple Music Large Artwork View (Image 4)
      bodyEl.innerHTML = `
        <div class="ym-am-artwork-view">
          <div class="ym-am-pip-btn" id="ym-am-pip-btn" title="Свернуть в мини-плеер">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>
            </svg>
          </div>
          <div class="ym-am-art-card">
            <img src="${currentTrackCover || 'https://music.yandex.ru/favicon.ico'}" alt="Artwork" class="ym-am-large-art">
          </div>
          <div class="ym-am-art-meta">
            <div class="ym-am-art-title">${escapeHtml(currentTrackTitle || "Трек не выбран")}</div>
            <div class="ym-am-art-artist">${escapeHtml(currentTrackArtist || "Яндекс Музыка")}${currentTrackAlbum ? " — " + escapeHtml(currentTrackAlbum) : ""}</div>
            <div class="ym-am-badge-row" style="justify-content:center;margin-top:6px;">
              <div class="ym-am-badge">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.3">
                  <path d="M1 5c1-3 2-3 3 0s2 3 3 0 2-3 3 0 2 3 3 0"/>
                </svg>
                <span>Lossless</span>
              </div>
            </div>
          </div>
        </div>
      `;
      document.getElementById("ym-am-pip-btn")?.addEventListener("click", () => setMiniPlayerMode("compact"));
      return;
    }

    if (currentParsedLyrics && currentParsedLyrics.length > 0) {
      bodyEl.innerHTML = currentParsedLyrics
        .map((l, idx) => `<div class="ym-am-lrc-line ym-am-lrc-future" data-idx="${idx}" data-time="${l.time}">${escapeHtml(l.text || "♪")}</div>`)
        .join("");

      bodyEl.querySelectorAll(".ym-am-lrc-line").forEach((el) => {
        el.addEventListener("click", () => {
          const t = parseFloat(el.getAttribute("data-time"));
          if (!isNaN(t) && t >= 0) {
            seekAudioTo(t);
            updateFullscreenLyricsActiveLine(t);
          }
        });
      });
    } else {
      // Apple Music Empty State (Image 3)
      bodyEl.innerHTML = `
        <div class="ym-am-empty-lyrics">
          Текст этой песни недоступен.
        </div>
      `;
    }
  }

  function updateAppleMusicProgress(position, duration, isPlaying) {
    if (!fsLyricsVisible) return;
    const curEl = document.getElementById("ym-am-time-cur");
    const remEl = document.getElementById("ym-am-time-rem");
    const fillEl = document.getElementById("ym-am-trackbar-fill");
    const thumbEl = document.getElementById("ym-am-trackbar-thumb");
    const playBtn = document.getElementById("ym-am-btn-play");

    const pos = Math.max(0, Math.floor(position || 0));
    let dur = Math.max(0, Math.floor(duration || 0));
    if (dur <= 0 && window.__lastPlayerState && window.__lastPlayerState.progress && window.__lastPlayerState.progress.duration > 0) {
      dur = Math.floor(window.__lastPlayerState.progress.duration);
    }
    const rem = Math.max(0, dur - pos);

    const fmt = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    if (curEl) curEl.textContent = fmt(pos);
    if (remEl) remEl.textContent = `-${fmt(rem)}`;

    const pct = dur > 0 ? Math.min(100, Math.max(0, (position / dur) * 100)) : 0;
    if (fillEl) {
      fillEl.style.setProperty("width", `${pct}%`, "important");
    }
    if (thumbEl) {
      thumbEl.style.setProperty("left", `${pct}%`, "important");
    }

    if (playBtn) {
      playBtn.innerHTML = isPlaying
        ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
        : `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    }
  }

  function setMiniPlayerMode(mode) {
    miniPlayerMode = mode;
    const container = document.getElementById("ym-mod-fullscreen-lyrics");
    if (!container) return;

    container.classList.remove("ym-am-compact", "ym-am-mode-artwork");
    const lyricsBtn = document.getElementById("ym-am-btn-lyrics");

    if (mode === "compact") {
      container.classList.add("ym-am-compact");
      lyricsBtn?.classList.remove("active");
    } else if (mode === "artwork") {
      container.classList.add("ym-am-mode-artwork");
      lyricsBtn?.classList.remove("active");
      renderLyricsBodyUI();
    } else {
      // lyrics mode
      lyricsBtn?.classList.add("active");
      renderLyricsBodyUI();
      if (lastActiveLyricIdx !== -1) {
        setTimeout(() => {
          const body = document.getElementById("ym-am-lyrics-body");
          const activeEl = body?.querySelector(`[data-idx="${lastActiveLyricIdx}"]`);
          activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      }
    }
  }

  function makeMiniPlayerDraggable(headerEl, containerEl) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    headerEl.addEventListener("mousedown", (e) => {
      if (e.target.closest("button") || e.target.closest(".ym-am-badge") || e.target.closest("a")) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = containerEl.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;

      containerEl.classList.remove("ym-fs-lyrics-docked");
      containerEl.style.left = `${startLeft}px`;
      containerEl.style.top = `${startTop}px`;
      containerEl.style.right = "auto";
      containerEl.style.bottom = "auto";

      const onMouseMove = (ev) => {
        if (!isDragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const newLeft = Math.max(10, Math.min(window.innerWidth - containerEl.offsetWidth - 10, startLeft + dx));
        const newTop = Math.max(10, Math.min(window.innerHeight - 90, startTop + dy));
        containerEl.style.left = `${newLeft}px`;
        containerEl.style.top = `${newTop}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        try {
          localStorage.setItem("ym_mod_miniplayer_pos", JSON.stringify({
            left: containerEl.style.left,
            top: containerEl.style.top,
          }));
        } catch (e) {}
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  function toggleFullscreenLyrics(force) {
    fsLyricsVisible = typeof force === "boolean" ? force : !fsLyricsVisible;
    let container = document.getElementById("ym-mod-fullscreen-lyrics");

    if (!fsLyricsVisible) {
      if (container) container.remove();
      return;
    }

    if (!container) {
      container = document.createElement("div");
      container.id = "ym-mod-fullscreen-lyrics";
      container.className = "ym-fs-lyrics-docked";
      document.body.appendChild(container);

      // Restore saved drag position if available
      try {
        const savedPos = JSON.parse(localStorage.getItem("ym_mod_miniplayer_pos") || "null");
        if (savedPos && savedPos.left && savedPos.top) {
          container.classList.remove("ym-fs-lyrics-docked");
          container.style.left = savedPos.left;
          container.style.top = savedPos.top;
          container.style.right = "auto";
          container.style.bottom = "auto";
        }
      } catch (e) {}
    }

    // Refresh track metadata from live player state
    const curState = scrapeCurrentPlayerState() || window.__lastPlayerState;
    if (curState && curState.track && curState.track.title) {
      currentTrackTitle = curState.track.title;
      let art = curState.track.artists || "";
      if (Array.isArray(art)) {
        art = art.map((a) => (typeof a === "object" ? (a.name || "") : String(a))).join(", ");
      }
      currentTrackArtist = art;
      currentTrackAlbum = (curState.track.rawMeta && curState.track.rawMeta.albums && curState.track.rawMeta.albums[0]?.title) || "";
      currentTrackCover = curState.track.coverUrl || "";
    }

    container.innerHTML = `
      <div class="ym-am-art-backdrop" id="ym-am-art-backdrop" style="background-image: url('${currentTrackCover || ''}');"></div>
      
      <!-- Apple Music Header -->
      <div class="ym-am-header" id="ym-am-header">
        <div class="ym-am-track-info">
          <img id="ym-am-cover" class="ym-am-cover" src="${currentTrackCover || 'https://music.yandex.ru/favicon.ico'}" alt="Cover" title="Нажмите для просмотра обложки">
          <div class="ym-am-meta">
            <div id="ym-am-title" class="ym-am-title">${escapeHtml(currentTrackTitle || "Трек не выбран")}</div>
            <div id="ym-am-artist" class="ym-am-artist">${escapeHtml(currentTrackArtist || "Яндекс Музыка")}${currentTrackAlbum ? " — " + escapeHtml(currentTrackAlbum) : ""}</div>
            <div class="ym-am-badge-row">
              <div class="ym-am-badge">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.3">
                  <path d="M1 5c1-3 2-3 3 0s2 3 3 0 2-3 3 0 2 3 3 0"/>
                </svg>
                <span>Lossless</span>
              </div>
            </div>
          </div>
        </div>
        <div class="ym-am-window-controls">
          <button class="ym-am-btn-tool" id="ym-am-btn-min" title="Свернуть в мини-плеер">—</button>
          <button class="ym-am-btn-tool" id="ym-am-btn-expand" title="Развернуть / Свернуть">⤢</button>
          <button class="ym-am-btn-tool ym-am-btn-close" id="ym-am-btn-close" title="Закрыть">✕</button>
        </div>
      </div>

      <!-- Scrolling Lyrics Body -->
      <div class="ym-am-lyrics-body" id="ym-am-lyrics-body">
      </div>

      <!-- Bottom Player Controls Bar -->
      <div class="ym-am-controls-bar">
        <div class="ym-am-progress-section">
          <span class="ym-am-time" id="ym-am-time-cur">0:00</span>
          <div class="ym-am-trackbar" id="ym-am-trackbar">
            <div class="ym-am-trackbar-fill" id="ym-am-trackbar-fill"></div>
            <div class="ym-am-trackbar-thumb" id="ym-am-trackbar-thumb"></div>
          </div>
          <span class="ym-am-time ym-am-time-right" id="ym-am-time-rem">-0:00</span>
        </div>
        <div class="ym-am-buttons-row">
          <div class="ym-am-volume-wrap" style="position:relative;">
            <button class="ym-am-btn" id="ym-am-btn-vol" title="Громкость">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            </button>
            <div class="ym-am-volume-popup" id="ym-am-volume-popup" style="display:none;">
              <div class="ym-am-volume-slider-wrap" id="ym-am-volume-slider-wrap">
                <div class="ym-am-volume-fill" id="ym-am-volume-fill"></div>
                <div class="ym-am-volume-thumb" id="ym-am-volume-thumb"></div>
              </div>
              <div class="ym-am-volume-text" id="ym-am-volume-text">100%</div>
            </div>
          </div>
          <button class="ym-am-btn ym-am-btn-like" id="ym-am-btn-like" title="Нравится">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="ym-am-btn ym-am-btn-dislike" id="ym-am-btn-dislike" title="Не нравится">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" stroke-width="2.5" />
            </svg>
          </button>
          <button class="ym-am-btn" id="ym-am-btn-prev" title="Предыдущий трек">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="ym-am-btn ym-am-btn-play" id="ym-am-btn-play" title="Воспроизведение / Пауза">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="ym-am-btn" id="ym-am-btn-next" title="Следующий трек">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
          <button class="ym-am-btn ym-am-btn-lyrics active" id="ym-am-btn-lyrics" title="Текст песни (Apple Music)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6.5 9c-.83 0-1.5-.67-1.5-1.5S12.67 8 13.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5 0C7.67 11 7 10.33 7 9.5S7.67 8 8.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </button>
          <button class="ym-am-btn" id="ym-am-btn-queue" title="Очередь">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
          </button>
        </div>
      </div>
    `;

    const header = document.getElementById("ym-am-header");
    if (header) {
      makeMiniPlayerDraggable(header, container);
    }

    // User scrolling detection to avoid jittery auto-centering
    const lyricsBodyEl = document.getElementById("ym-am-lyrics-body");
    if (lyricsBodyEl) {
      const handleUserScroll = () => {
        isUserScrolling = true;
        if (userScrollTimeout) clearTimeout(userScrollTimeout);
        userScrollTimeout = setTimeout(() => {
          isUserScrolling = false;
          if (lastActiveLyricIdx !== -1) {
            const activeEl = lyricsBodyEl.querySelector(`[data-idx="${lastActiveLyricIdx}"]`);
            activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 4000);
      };
      lyricsBodyEl.addEventListener("wheel", handleUserScroll, { passive: true });
      lyricsBodyEl.addEventListener("touchmove", handleUserScroll, { passive: true });
    }

    // Window controls
    document.getElementById("ym-am-btn-close")?.addEventListener("click", () => toggleFullscreenLyrics(false));
    document.getElementById("ym-am-btn-min")?.addEventListener("click", () => setMiniPlayerMode("compact"));
    document.getElementById("ym-am-btn-expand")?.addEventListener("click", () => {
      setMiniPlayerMode(miniPlayerMode === "compact" ? "lyrics" : "compact");
    });

    // Clicking small cover opens large artwork mode
    document.getElementById("ym-am-cover")?.addEventListener("click", () => {
      setMiniPlayerMode(miniPlayerMode === "artwork" ? "lyrics" : "artwork");
    });

    // Lyrics button toggles lyrics / compact
    document.getElementById("ym-am-btn-lyrics")?.addEventListener("click", () => {
      setMiniPlayerMode(miniPlayerMode === "lyrics" ? "compact" : "lyrics");
    });

    // Interactive Trackbar Scrubber
    const trackbar = document.getElementById("ym-am-trackbar");
    trackbar?.addEventListener("click", (e) => {
      const rect = trackbar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const cur = scrapeCurrentPlayerState() || window.__lastPlayerState;
      const dur = (cur?.progress?.duration) || 0;
      if (dur > 0) {
        seekAudioTo(ratio * dur);
      }
    });

    // Player controls
    document.getElementById("ym-am-btn-play")?.addEventListener("click", () => handlePlayerAction("playPause"));
    document.getElementById("ym-am-btn-prev")?.addEventListener("click", () => handlePlayerAction("prev"));
    document.getElementById("ym-am-btn-next")?.addEventListener("click", () => handlePlayerAction("next"));

    // Volume popup & smooth vertical dragging
    const volBtn = document.getElementById("ym-am-btn-vol");
    const volPopup = document.getElementById("ym-am-volume-popup");
    const volWrap = document.getElementById("ym-am-volume-slider-wrap");
    const volFill = document.getElementById("ym-am-volume-fill");
    const volThumb = document.getElementById("ym-am-volume-thumb");
    const volText = document.getElementById("ym-am-volume-text");

    let isDraggingVol = false;

    const updateVolUI = (vol01) => {
      const v = Math.max(0, Math.min(1, vol01));
      const pct = Math.round(v * 100);
      if (volFill) volFill.style.height = `${pct}%`;
      if (volThumb) volThumb.style.bottom = `${pct}%`;
      if (volText) volText.textContent = `${pct}%`;
    };

    let curV = typeof window.__ymCurrentVolume === "number" ? window.__ymCurrentVolume : 1;
    updateVolUI(curV);

    let volHideTimer = null;
    const showVolPopup = () => {
      if (volPopup) volPopup.classList.add("open");
      if (volHideTimer) clearTimeout(volHideTimer);
      volHideTimer = setTimeout(() => {
        if (!isDraggingVol) {
          if (volPopup) volPopup.classList.remove("open");
        }
      }, 2200);
    };

    const hideVolPopup = () => {
      if (volHideTimer) clearTimeout(volHideTimer);
      if (volPopup) volPopup.classList.remove("open");
    };

    if (volBtn && volPopup) {
      volBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (volPopup.classList.contains("open")) {
          hideVolPopup();
        } else {
          showVolPopup();
          const v = typeof window.__ymCurrentVolume === "number" ? window.__ymCurrentVolume : 1;
          updateVolUI(v);
        }
      });

      const volumeEls = [volBtn, volWrap, volPopup].filter(Boolean);
      volumeEls.forEach((el) => {
        el.addEventListener("wheel", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const delta = e.deltaY < 0 ? 0.05 : -0.05;
          const cur = typeof window.__ymCurrentVolume === "number" ? window.__ymCurrentVolume : 1;
          const targetV = Math.max(0, Math.min(1, Math.round((cur + delta) * 100) / 100));
          updateVolUI(targetV);
          window.__ymCurrentVolume = targetV;
          try { localStorage.setItem("ym_mod_volume", String(targetV)); } catch (err) {}
          const audio = getActiveAudioElement();
          if (audio) audio.volume = targetV;
          handlePlayerAction("setVolume", { volume: targetV });
          showVolPopup();
        }, { passive: false });
      });
    }

    const setVolumeFromMouseY = (clientY) => {
      if (!volWrap) return;
      const rect = volWrap.getBoundingClientRect();
      const bottom = rect.bottom;
      const height = rect.height;
      const diff = bottom - clientY;
      const ratio = Math.max(0, Math.min(1, diff / height));
      updateVolUI(ratio);
      window.__ymCurrentVolume = ratio;
      try { localStorage.setItem("ym_mod_volume", String(ratio)); } catch (e) {}

      const audio = getActiveAudioElement();
      if (audio) {
        audio.volume = ratio;
      }
      handlePlayerAction("setVolume", { volume: ratio });
      showVolPopup();
    };

    if (volWrap) {
      volWrap.addEventListener("mousedown", (e) => {
        isDraggingVol = true;
        showVolPopup();
        setVolumeFromMouseY(e.clientY);
      });
    }

    window.addEventListener("mousemove", (e) => {
      if (isDraggingVol) {
        setVolumeFromMouseY(e.clientY);
      }
    });

    window.addEventListener("mouseup", () => {
      if (isDraggingVol) {
        isDraggingVol = false;
        showVolPopup();
      }
    });

    document.addEventListener("click", (e) => {
      if (volPopup && volPopup.classList.contains("open")) {
        if (!volPopup.contains(e.target) && e.target !== volBtn && !volBtn?.contains(e.target)) {
          hideVolPopup();
        }
      }
    });

    // Like button
    const likeBtn = document.getElementById("ym-am-btn-like");
    if (likeBtn) {
      likeBtn.addEventListener("click", () => {
        const actualLike = document.querySelector('button[data-test-id="LIKE_BUTTON"], [data-test-id="PLAYERBAR_LIKE_BUTTON"]');
        if (actualLike) actualLike.click();
        else handlePlayerAction("like");
        setTimeout(syncLikeStatusUI, 120);
      });
    }

    // Dislike button
    const dislikeBtn = document.getElementById("ym-am-btn-dislike");
    if (dislikeBtn) {
      dislikeBtn.addEventListener("click", () => {
        const actualDislike = document.querySelector('button[data-test-id="DISLIKE_BUTTON"], [data-test-id="PLAYERBAR_DISLIKE_BUTTON"]');
        if (actualDislike) actualDislike.click();
        else handlePlayerAction("dislike");
      });
    }

    document.getElementById("ym-am-btn-queue")?.addEventListener("click", () => {
      const qBtn = document.querySelector('button[data-test-id="PLAYERBAR_DESKTOP_PLAY_QUEUE_BUTTON"], button[data-test-id="QUEUE_BUTTON"]');
      if (qBtn) qBtn.click();
    });

    setMiniPlayerMode(miniPlayerMode);

    const curId = curState?.track?.id || `${currentTrackTitle}-${currentTrackArtist}`;
    if (currentParsedLyrics.length > 0 && currentTrackLyricsId === curId) {
      renderLyricsBodyUI();
    } else if (curState && curState.track && curState.track.title) {
      loadLyricsForTrack(curState.track.title, curState.track.artists, curState.track.id, curState.track.coverUrl, currentTrackAlbum);
    } else {
      renderLyricsBodyUI();
    }

    if (curState && curState.progress) {
      updateAppleMusicProgress(curState.progress.position, curState.progress.duration, curState.isPlaying);
    }

    // Attach direct audio listener for 60fps lyrics sync
    hookDirectAudioElement();
    startFullscreenLyricsProgressLoop();
    syncLikeStatusUI();
  }

  
  function getActiveAudioElement() {
    const isRealAudio = (el) => {
      if (!el) return false;
      if (el.id === "ym-live-wallpaper-video") return false;
      if (el.tagName && el.tagName.toLowerCase() === "video") return false;
      return true;
    };
    if (typeof window.__ymGetActiveAudio === "function") {
      const a = window.__ymGetActiveAudio();
      if (a && isRealAudio(a)) return a;
    }
    try {
      const audios = Array.from(document.querySelectorAll("audio")).filter(isRealAudio);
      return audios.find((a) => !a.paused) || audios[0] || null;
    } catch(e) {
      return null;
    }
  }

  function syncLikeStatusUI() {
    const likeBtn = document.getElementById("ym-am-btn-like");
    if (!likeBtn) return;
    const actualLike = document.querySelector('button[data-test-id="LIKE_BUTTON"], [data-test-id="PLAYERBAR_LIKE_BUTTON"]');
    let isLiked = false;
    if (actualLike) {
      isLiked = actualLike.getAttribute("aria-pressed") === "true" ||
                actualLike.className.includes("active") ||
                actualLike.className.includes("Like_active") ||
                !!actualLike.querySelector('svg[fill="#ef4444"], svg[fill="#fc3f1d"], svg[fill="red"]');
    } else if (window.__lastPlayerState && window.__lastPlayerState.track) {
      isLiked = !!window.__lastPlayerState.track.isLiked;
    }
    likeBtn.classList.toggle("active", !!isLiked);
  }

  let fsLyricsProgressTimer = null;
  function startFullscreenLyricsProgressLoop() {
    if (fsLyricsProgressTimer) clearInterval(fsLyricsProgressTimer);
    fsLyricsProgressTimer = setInterval(() => {
      if (!fsLyricsVisible) {
        clearInterval(fsLyricsProgressTimer);
        fsLyricsProgressTimer = null;
        return;
      }
      const audio = getActiveAudioElement();
      if (audio && audio.duration) {
        updateAppleMusicProgress(audio.currentTime, audio.duration, !audio.paused);
        updateFullscreenLyricsActiveLine(audio.currentTime);
      }
      syncLikeStatusUI();
    }, 100);
  }

  function seekAudioTo(targetSeconds) {
    try {
      const audio = getActiveAudioElement();
      if (audio && typeof window.__ymCurrentVolume === "number" && Math.abs(audio.volume - window.__ymCurrentVolume) > 0.01) {
        audio.volume = window.__ymCurrentVolume;
      }
      if (audio) {
        audio.currentTime = targetSeconds;
      }
    } catch (e) {}
  }

  function hookDirectAudioElement() {
    try {
      window.__ymOnAudioTimeUpdate = (currentTime, duration, isPlaying) => {
        if (fsLyricsVisible) {
          updateFullscreenLyricsActiveLine(currentTime);
          updateAppleMusicProgress(currentTime, duration || 0, isPlaying);
        }
      };
      const audio = getActiveAudioElement();
      if (audio && !audio.__ymAmLyricsHooked) {
        audio.__ymAmLyricsHooked = true;
        audio.addEventListener("timeupdate", () => {
          if (fsLyricsVisible) {
            updateFullscreenLyricsActiveLine(audio.currentTime);
            updateAppleMusicProgress(audio.currentTime, audio.duration || 0, !audio.paused);
          }
        });
      }
    } catch (e) {}
  }

  let lastActiveLyricTime = 0;
  function updateFullscreenLyricsActiveLine(currentTime) {
    if (!fsLyricsVisible || miniPlayerMode !== "lyrics") return;
    const body = document.getElementById("ym-am-lyrics-body");
    if (!body || !currentParsedLyrics.length) return;

    // Detect manual user seek (large jump in time)
    const isSeek = Math.abs(currentTime - lastActiveLyricTime) > 2.0;
    lastActiveLyricTime = currentTime;

    let activeIdx = -1;
    for (let i = 0; i < currentParsedLyrics.length; i++) {
      const line = currentParsedLyrics[i];
      if (line.time >= 0 && line.time <= (currentTime + 0.25)) {
        activeIdx = i;
      } else if (line.time > (currentTime + 0.25)) {
        break;
      }
    }

    // Monotonic stability: prevent oscillating backward due to small interval drift unless user actually seeked
    if (!isSeek && lastActiveLyricIdx >= 0 && activeIdx < lastActiveLyricIdx && (lastActiveLyricIdx - activeIdx) <= 2) {
      activeIdx = lastActiveLyricIdx;
    }

    if (activeIdx !== -1 && activeIdx !== lastActiveLyricIdx) {
      const prevEl = body.querySelector(`.ym-am-lrc-line[data-idx="${lastActiveLyricIdx}"]`);
      if (prevEl) {
        prevEl.className = "ym-am-lrc-line ym-am-lrc-past";
      }

      lastActiveLyricIdx = activeIdx;
      const activeEl = body.querySelector(`.ym-am-lrc-line[data-idx="${activeIdx}"]`);
      if (activeEl) {
        activeEl.className = "ym-am-lrc-line ym-am-lrc-active";
        if (!isUserScrolling) {
          const containerHeight = body.clientHeight;
          const targetTop = activeEl.offsetTop - (containerHeight / 2) + (activeEl.clientHeight / 2);
          body.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
          });
        }
      }
    }
  }

  // Intercept all lyrics buttons to toggle in-app Apple Music lyrics
  document.addEventListener("click", (e) => {
    const btn = e.target.closest('button[data-test-id*="SYNC_LYRICS_BUTTON"], button[data-test-id*="LYRICS"], button[aria-label*="текст"], button[aria-label*="Текст"]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      toggleFullscreenLyrics();
    }
  }, true);

  // Global hotkey: Ctrl+Shift+M or Ctrl+L to toggle Apple Music Mini-Player
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey && e.shiftKey && (e.key === "M" || e.key === "m")) || (e.ctrlKey && (e.key === "L" || e.key === "l") && !e.shiftKey && !e.altKey)) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      e.preventDefault();
      toggleFullscreenLyrics();
    }
  });

  // Inject Dedicated Mini-Player Button into Yandex Music Playerbar
  function injectPlayerMiniPlayerButton() {
    if (document.getElementById("ym-btn-player-miniplayer")) return;
    const player = document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]');
    if (!player) return;
    const likeBtn = player.querySelector('button[data-test-id="LIKE_BUTTON"]');
    if (!likeBtn || !likeBtn.parentNode) return;

    const btn = document.createElement("button");
    btn.id = "ym-btn-player-miniplayer";
    btn.className = "ym-player-download-btn ym-player-miniplayer-btn";
    btn.title = "Мини-плеер Apple Music с текстом песни (Ctrl+Shift+M)";
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6.5 9c-.83 0-1.5-.67-1.5-1.5S12.67 8 13.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5 0C7.67 11 7 10.33 7 9.5S7.67 8 8.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFullscreenLyrics();
    });

    likeBtn.parentNode.insertBefore(btn, likeBtn.nextSibling);
  }

  // ==========================================
  // v1.3.2: AUTO-UPDATER & COMMUNITY STATS
  // ==========================================
  const CURRENT_MOD_VERSION = "v1.4.0";

  async function checkModUpdates() {
    try {
      const res = await fetch("https://api.github.com/repos/velqor1/Mod-Yandex-Music/releases/latest", {
        headers: { "Accept": "application/vnd.github.v3+json" }
      });
      if (!res.ok) return;
      const release = await res.json();
      const latestTag = release.tag_name || "";
      if (latestTag && latestTag !== CURRENT_MOD_VERSION && isNewerVersion(latestTag, CURRENT_MOD_VERSION)) {
        showUpdateBanner(latestTag, release.html_url);
      }
    } catch (e) {}
  }

  function isNewerVersion(remote, local) {
    const parse = (v) => v.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
    const [rMaj, rMin, rPat] = parse(remote);
    const [lMaj, lMin, lPat] = parse(local);
    if (rMaj !== lMaj) return rMaj > lMaj;
    if (rMin !== lMin) return rMin > lMin;
    return rPat > lPat;
  }

  function showUpdateBanner(newVersion, downloadUrl) {
    if (document.getElementById("ym-mod-update-banner")) return;
    const banner = document.createElement("div");
    banner.id = "ym-mod-update-banner";
    banner.innerHTML = `
      <span class="ym-update-badge">NEW</span>
      <span class="ym-update-text">Доступно обновление мода <b>${escapeHtml(newVersion)}</b>!</span>
      <a href="${downloadUrl}" target="_blank" class="ym-update-btn">Скачать</a>
      <button class="ym-update-close" id="ym-mod-update-close">&times;</button>
    `;
    document.body.appendChild(banner);
    document.getElementById("ym-mod-update-close")?.addEventListener("click", () => banner.remove());
  }

  // ==========================================
  // v1.3.2: CREATOR ADMIN & USER PROPOSALS
  // ==========================================
  function isCurrentUserAdmin() {
    try {
      if (localStorage.getItem("ym_mod_is_admin") === "true") return true;
      if (window.__IS_MOD_ADMIN__) return true;

      // Check currentAccountStatus if present
      if (typeof currentAccountStatus !== "undefined" && currentAccountStatus) {
        const s = JSON.stringify(currentAccountStatus).toLowerCase();
        if (s.includes("alex.bibikov") || s.includes("бибиков") || s.includes("alexis0eu") || s.includes("velqor1")) {
          localStorage.setItem("ym_mod_is_admin", "true");
          return true;
        }
      }

      // Check user profile container or page text for Alex
      const bodyText = (document.body ? document.body.innerText.slice(0, 10000) : "").toLowerCase();
      if (bodyText.includes("алексей бибиков") || bodyText.includes("alex.bibikov") || bodyText.includes("alexis0eu") || bodyText.includes("velqor1") || bodyText.includes("бибиков")) {
        localStorage.setItem("ym_mod_is_admin", "true");
        return true;
      }
    } catch (e) {}
    return false;
  }

  function injectCreatorBadge() {
    if (!isCurrentUserAdmin()) return;
    const userContainer = document.querySelector('div[class*="NavbarDesktopUserWidget_userProfileContainer"], aside [data-test-id="USER_PROFILE"]');
    if (!userContainer) return;

    // Remove old yellow badge if present
    const oldBadge = userContainer.querySelector(".ym-creator-badge");
    if (oldBadge) oldBadge.remove();

    const nameElem = userContainer.querySelector('div[class*="NavbarDesktopUserWidget_userName"], span[class*="userName"], div[class*="userProfile"] span') || userContainer;
    if (nameElem && !nameElem.querySelector(".ym-creator-crown") && !userContainer.querySelector(".ym-creator-crown")) {
      const crown = document.createElement("span");
      crown.className = "ym-creator-crown";
      crown.title = "Создатель мода";
      crown.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="#ff2d3c" style="filter:drop-shadow(0 0 6px rgba(255,45,60,0.9));margin-left:6px;vertical-align:middle;display:inline-block;"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`;
      nameElem.appendChild(crown);
    }
  }
  setInterval(injectCreatorBadge, 3000);

    function openProposalModal() {
    if (document.getElementById("ym-proposal-modal")) return;
    const modal = document.createElement("div");
    modal.id = "ym-proposal-modal";
    modal.className = "ym-mod-modal-backdrop open";
    modal.style.cssText = "position:fixed!important;inset:0!important;background:rgba(0,0,0,0.75)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:99999999!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;";
    
    modal.innerHTML = `
      <div class="ym-mod-modal" style="width:520px;max-width:92vw;border:1px solid rgba(255,45,60,0.35);box-shadow:0 20px 50px rgba(0,0,0,0.8),0 0 30px rgba(255,45,60,0.25);pointer-events:auto!important;-webkit-app-region:no-drag!important;user-select:auto!important;">
        <div class="ym-modal-header" style="-webkit-app-region:no-drag!important;">
          <div class="ym-modal-header-left">
            <div class="ym-modal-title" style="display:flex;align-items:center;gap:8px;">
              <span>💡</span>
              <span>Предложить идею создателю мода</span>
            </div>
          </div>
          <button class="ym-modal-close" id="ym-prop-close" style="cursor:pointer;pointer-events:auto!important;">&times;</button>
        </div>
        <div style="padding:22px;display:flex;flex-direction:column;gap:14px;pointer-events:auto!important;-webkit-app-region:no-drag!important;">
          <div>
            <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);display:block;margin-bottom:6px;">Заголовок идеи *</label>
            <input type="text" id="ym-prop-title" class="ym-input" placeholder="Например: Добавить эквалайзер с пресетами" style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.15);pointer-events:auto!important;-webkit-app-region:no-drag!important;user-select:text!important;-webkit-user-select:text!important;cursor:text!important;">
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);display:block;margin-bottom:6px;">Подробное описание идеи *</label>
            <textarea id="ym-prop-desc" class="ym-input" rows="4" placeholder="Опиши, как это должно работать и почему это круто..." style="width:100%;box-sizing:border-box;resize:vertical;padding:10px;border-radius:8px;background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.15);pointer-events:auto!important;-webkit-app-region:no-drag!important;user-select:text!important;-webkit-user-select:text!important;cursor:text!important;"></textarea>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);display:block;margin-bottom:6px;">Твой контакт (Telegram / Discord) — по желанию</label>
            <input type="text" id="ym-prop-contact" class="ym-input" placeholder="@username" style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.15);pointer-events:auto!important;-webkit-app-region:no-drag!important;user-select:text!important;-webkit-user-select:text!important;cursor:text!important;">
          </div>
          <button id="ym-prop-submit" class="ym-btn-action" style="background:#ff2d3c;color:#fff;font-weight:700;margin-top:6px;padding:12px;font-size:14px;border-radius:10px;cursor:pointer;pointer-events:auto!important;">🚀 Отправить создателю</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const titleInput = document.getElementById("ym-prop-title");
    const descInput = document.getElementById("ym-prop-desc");
    const contactInput = document.getElementById("ym-prop-contact");

    [titleInput, descInput, contactInput].forEach((inp) => {
      if (!inp) return;
      inp.addEventListener("mousedown", (e) => e.stopPropagation());
      inp.addEventListener("click", (e) => {
        e.stopPropagation();
        inp.focus();
      });
    });

    document.getElementById("ym-prop-close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      modal.remove();
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

    document.getElementById("ym-prop-submit")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const title = titleInput?.value.trim();
      const desc = descInput?.value.trim();
      const contact = contactInput?.value.trim();

      if (!title) {
        if (titleInput) {
          titleInput.style.border = "1px solid #ff2d3c";
          titleInput.focus();
        }
        showToast("⚠️ Укажите заголовок идеи");
        return;
      }
      if (!desc) {
        if (descInput) {
          descInput.style.border = "1px solid #ff2d3c";
          descInput.focus();
        }
        showToast("⚠️ Опишите вашу идею");
        return;
      }

      // Save locally to localStorage AND mod storage
      try {
        const localList = JSON.parse(localStorage.getItem("ym_user_proposals") || "[]");
        localList.unshift({
          title,
          body: desc + (contact ? "\n\nКонтакт: " + contact : ""),
          user: { login: contact || "Пользователь мода" },
          created_at: new Date().toISOString(),
          state: "open",
          isLocal: true,
        });
        localStorage.setItem("ym_user_proposals", JSON.stringify(localList.slice(0, 50)));
        if (window.yandexMusicMod && window.yandexMusicMod.setStorageValue) {
          window.yandexMusicMod.setStorageValue("user_proposals", localList.slice(0, 50));
        }
      } catch (e) {}

      // Refresh admin tab if visible
      loadAdminProposals();

      const bodyText = `${desc}\n\n---\n**Контакт автора:** ${contact || "Не указан"}\n**Версия мода:** v1.4.0`;
      const issueUrl = `https://github.com/velqor1/Mod-Yandex-Music/issues/new?title=${encodeURIComponent("[Идея] " + title)}&body=${encodeURIComponent(bodyText)}&labels=suggestion`;

      try {
        if (window.yandexMusicMod && typeof window.yandexMusicMod.openExternal === "function") {
          window.yandexMusicMod.openExternal(issueUrl);
        } else {
          window.open(issueUrl, "_blank");
        }
      } catch (e) {}

      modal.remove();
      showToast("🎉 Ваша идея успешно отправлена создателю!");
    });
  }

    async function loadAdminProposals() {
    const container = document.getElementById("ym-admin-proposals-container");
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:20px;">Загрузка предложений...</div>';

    let localProposals = [];
    try {
      localProposals = JSON.parse(localStorage.getItem("ym_user_proposals") || "[]");
    } catch (e) {}

    let githubIssues = [];
    try {
      const res = await fetch("https://api.github.com/repos/velqor1/Mod-Yandex-Music/issues?labels=suggestion&state=all&per_page=30");
      if (res.ok) githubIssues = await res.json();
    } catch (e) {}

    const allProposals = [...localProposals, ...githubIssues];
    if (allProposals.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.5);padding:30px;">Пока нет входящих предложений от пользователей.</div>';
      return;
    }

    container.innerHTML = allProposals.map((iss) => `
      <div class="ym-proposal-card" style="margin-bottom:12px;background:rgba(255,255,255,0.04);border:1px solid ${iss.isLocal ? 'rgba(255,45,60,0.35)' : 'rgba(255,255,255,0.08)'};padding:14px;border-radius:12px;">
        <div class="ym-proposal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="ym-proposal-title" style="font-weight:700;font-size:14px;color:#fff;">${escapeHtml(iss.title)}</span>
          <span class="ym-badge" style="background:${iss.isLocal ? '#ff2d3c' : (iss.state === 'open' ? '#22c55e' : '#ef4444')};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${iss.isLocal ? 'Новое' : iss.state}</span>
        </div>
        <div class="ym-proposal-body" style="font-size:13px;color:rgba(255,255,255,0.8);line-height:1.5;white-space:pre-wrap;">${escapeHtml(iss.body ? iss.body.slice(0, 300) : "Без описания")}${iss.body && iss.body.length > 300 ? "..." : ""}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:11px;color:rgba(255,255,255,0.45);">От: <b>${escapeHtml(iss.user?.login || "Пользователь")}</b> • ${new Date(iss.created_at || Date.now()).toLocaleDateString()}</span>
          ${iss.html_url ? `<a href="${iss.html_url}" target="_blank" style="font-size:12px;color:#ff2d3c;text-decoration:none;font-weight:700;">Открыть на GitHub &rarr;</a>` : '<span style="font-size:11px;color:#22c55e;">Сохранено в моде</span>'}
        </div>
      </div>
    `).join("");
  }


  
  // ==========================================
  // v1.3.2: HALLOWEEN DECORATIONS & FLYING PUMPKINS
  // ==========================================
  let halloweenObserverInterval = null;

  function isMyWaveActive() {
    return !!(
      document.querySelector('div[data-test-id="VIBE_BLOCK"], div[data-test-id="FULLSCREEN_PLAYER_MODAL"], [data-test-id="VIBE_PAGE"], canvas[class*="vibe"], div[class*="Vibe"], [class*="VibeLayout"]') ||
      window.location.href.toLowerCase().includes("vibe") ||
      window.location.hash.toLowerCase().includes("vibe") ||
      window.location.pathname === "/" ||
      window.location.pathname === ""
    );
  }

  function startHalloweenDecorations() {
    if (document.getElementById("ym-halloween-decorations")) return;
    const container = document.createElement("div");
    container.id = "ym-halloween-decorations";
    container.style.cssText = "position:fixed!important;inset:0!important;pointer-events:none!important;z-index:900!important;overflow:hidden!important;";
    container.innerHTML = `
      <!-- Gothic Spiderwebs Container (Visible on My Wave) -->
      <div id="ym-halloween-cobwebs" class="ym-halloween-cobweb-container">
        <!-- Top Right Intricate Cobweb with Hanging Animated Spider -->
        <div class="ym-cobweb-top-right">
          <svg viewBox="0 0 200 200" style="width:100%;height:100%;stroke:rgba(255,255,255,0.72);stroke-width:1.2;fill:none;filter:drop-shadow(0 0 4px rgba(255,255,255,0.35));">
            <line x1="200" y1="0" x2="0" y2="0" />
            <line x1="200" y1="0" x2="20" y2="40" />
            <line x1="200" y1="0" x2="50" y2="90" />
            <line x1="200" y1="0" x2="90" y2="140" />
            <line x1="200" y1="0" x2="140" y2="180" />
            <line x1="200" y1="0" x2="200" y2="200" />
            <!-- Curved organic silk strands -->
            <path d="M 170,0 Q 174,25 186,30 Q 192,18 200,16" />
            <path d="M 140,0 Q 146,45 165,65 Q 182,75 200,45" />
            <path d="M 105,0 Q 115,70 138,98 Q 166,115 200,80" />
            <path d="M 70,0 Q 85,98 112,130 Q 150,152 200,120" />
            <path d="M 35,0 Q 55,125 85,160 Q 130,188 200,160" />
            <path d="M 0,0 Q 25,150 60,188 Q 110,215 200,198" />
          </svg>
          <div class="ym-spider-thread">
            <div class="ym-spider">🕷️</div>
          </div>
        </div>

        <!-- Top Left Corner Gothic Web -->
        <div class="ym-cobweb-top-left">
          <svg viewBox="0 0 160 160" style="width:100%;height:100%;stroke:rgba(255,255,255,0.65);stroke-width:1.1;fill:none;filter:drop-shadow(0 0 3px rgba(255,255,255,0.25));">
            <line x1="0" y1="0" x2="160" y2="0" />
            <line x1="0" y1="0" x2="140" y2="30" />
            <line x1="0" y1="0" x2="110" y2="70" />
            <line x1="0" y1="0" x2="70" y2="110" />
            <line x1="0" y1="0" x2="30" y2="140" />
            <line x1="0" y1="0" x2="0" y2="160" />
            <path d="M 0,20 Q 20,18 26,0" />
            <path d="M 0,50 Q 42,42 55,0" />
            <path d="M 0,85 Q 70,72 90,0" />
            <path d="M 0,120 Q 100,105 125,0" />
            <path d="M 0,155 Q 130,135 158,0" />
          </svg>
        </div>
      </div>

      <!-- Giant Jack-o'-Lantern Pumpkins spread along the bottom -->
      <div id="ym-halloween-pumpkins">
        <div class="ym-halloween-pumpkin ym-pumpkin-b1" style="bottom:85px;left:235px;font-size:68px;transform:rotate(-4deg);">🎃</div>
        <div class="ym-halloween-pumpkin ym-pumpkin-b2" style="bottom:82px;left:42%;font-size:48px;animation-delay:0.8s;">🎃</div>
        <div class="ym-halloween-pumpkin ym-pumpkin-b3" style="bottom:82px;right:36%;font-size:54px;animation-delay:1.4s;transform:rotate(5deg);">🎃</div>
        <div class="ym-halloween-pumpkin ym-pumpkin-b4" style="bottom:86px;right:140px;font-size:50px;animation-delay:0.5s;">🎃</div>
        <div class="ym-halloween-pumpkin ym-pumpkin-b5" style="bottom:90px;right:30px;font-size:74px;animation-delay:1.8s;transform:rotate(-3deg);">🎃</div>
      </div>
    `;
    document.body.appendChild(container);

    if (halloweenObserverInterval) clearInterval(halloweenObserverInterval);
    halloweenObserverInterval = setInterval(() => {
      const cobwebs = document.getElementById("ym-halloween-cobwebs");
      if (cobwebs) {
        const waveActive = isMyWaveActive();
        cobwebs.style.opacity = waveActive ? "1" : "0";
        cobwebs.style.visibility = waveActive ? "visible" : "hidden";
      }
    }, 500);
  }

  function stopHalloweenDecorations() {
    if (halloweenObserverInterval) {
      clearInterval(halloweenObserverInterval);
      halloweenObserverInterval = null;
    }
    const el = document.getElementById("ym-halloween-decorations");
    if (el) el.remove();
  }

    function applyFont(fontName, enabled = true) {
    ensureBaseStylesheet();

    const existing = document.getElementById(FONT_STYLESHEET_ID);
    if (existing) existing.remove();

    const fLower = String(fontName || "").toLowerCase();
    const isNewYear = fLower.includes("newyear") || fLower.includes("новогод") || fLower.includes("marck");
    const isHalloween = fLower.includes("halloween") || fLower.includes("хэллоу") || fLower.includes("ruslan");
    const isCyberpunk = fLower.includes("cyberpunk") || fLower.includes("кибер") || fLower.includes("rubik");
    const isArcade = fLower.includes("arcade") || fLower.includes("press start");

    const fontEffectsEnabled = modSettings["typography/fontEffects"] !== false;

    // Manage snowflake canvas
    if (enabled && isNewYear && fontEffectsEnabled) {
      startSnowfall();
    } else {
      stopSnowfall();
    }

    // Manage Halloween decorations
    if (enabled && isHalloween && fontEffectsEnabled) {
      startHalloweenDecorations();
    } else {
      stopHalloweenDecorations();
    }

    const fontEffectTag = (enabled && fontEffectsEnabled) ? (
      isNewYear ? "Новогодний" :
      isHalloween ? "Хэллоуин" :
      isCyberpunk ? "Киберпанк" :
      isArcade ? "Arcade 8-Bit" : fontName
    ) : "";

    document.body.setAttribute("data-ym-font", fontEffectTag);

    if (!enabled) return;

    let fontFamily = "Terraria";
    let extraCss = "";

    if (fLower.includes("terraria") || fLower.includes("andy")) {
      fontFamily = "Terraria";
    } else if (fLower.includes("minecraft")) {
      fontFamily = "Minecraft";
      if (fontEffectsEnabled) {
        extraCss = "*:not(.UserID-Avatar-Image):not(img) { border-radius: 0 !important; }";
      }
    } else if (isNewYear) {
      fontFamily = "Marck Script";
    } else if (isHalloween) {
      fontFamily = "Ruslan Display";
    } else if (isCyberpunk) {
      fontFamily = "Rubik Glitch";
    } else if (isArcade) {
      fontFamily = "Press Start 2P";
      if (fontEffectsEnabled) {
        extraCss = "*:not(.UserID-Avatar-Image):not(img) { border-radius: 2px !important; }";
      }
    } else if (fLower.includes("kelly")) {
      fontFamily = "Kelly Slab";
    } else if (fLower.includes("jetbrains")) {
      fontFamily = "JetBrains Mono";
    } else if (fLower.includes("original") || fLower.includes("yandex sans")) {
      fontFamily = "Yandex Sans (Original)";
    } else {
      fontFamily = fontName || "Terraria";
    }

    fontFamily = String(fontFamily).replace(/["'{}<>;\\]/g, "").trim() || "JetBrains Mono";

    const rawSizeScale = parseFloat(modSettings["font-changer/sizeScale"]);
    let fontSizeScale = (!isNaN(rawSizeScale) && isFinite(rawSizeScale)) ? Math.max(0.7, Math.min(1.5, rawSizeScale)) : 1.0;

    const rawModalScale = parseFloat(modSettings["font-changer/modalSizeScale"]);
    let modalSizeScale = (!isNaN(rawModalScale) && isFinite(rawModalScale)) ? Math.max(0.7, Math.min(1.5, rawModalScale)) : 1.0;

    const fontWeight = modSettings["font-changer/weight"] || "normal";
    const letterSpacing = modSettings["font-changer/letterSpacing"] || "normal";

    const fontRule = (fontName && fontName !== "Yandex Sans (Original)") 
      ? `font-family: "${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;` 
      : "";

    const sizeRule = fontSizeScale !== 1.0 ? `font-size: calc(1em * ${fontSizeScale}) !important;` : "";
    const weightRule = fontWeight !== "normal" ? `font-weight: ${fontWeight} !important;` : "";
    const spacingRule = letterSpacing !== "normal" ? `letter-spacing: ${letterSpacing} !important;` : "";

    const style = document.createElement("style");
    style.id = FONT_STYLESHEET_ID;
    style.textContent = `
      * {
        ${fontRule}
        ${sizeRule}
        ${weightRule}
        ${spacingRule}
      }
      *, *::before, *::after,
      html, body,
      button, input, select, textarea,
      [class*="Typography_"],
      [class*="Font_"],
      [class*="Text_"],
      [class*="title"],
      [class*="artist"],
      div, span, p, a, h1, h2, h3, h4, h5, h6 {
        ${fontRule}
      }
      /* Prevent modal and lyrics distortion from global font scaling (v1.3.13) */
      #ym-mod-settings-modal, #ym-proposal-modal, #ym-mod-fullscreen-lyrics, .ym-mod-modal {
        font-size: ${Math.round(14 * modalSizeScale)}px !important;
      }
      /* STRICT ISOLATION: Keep Apple Music views with pure Apple SF Pro / Inter typography */
      #ym-am-lyrics-modal,
      #ym-am-lyrics-modal *,
      .ym-am-lyrics-modal,
      .ym-am-lyrics-modal *,
      #ym-am-lyrics-body,
      #ym-am-lyrics-body *,
      .ym-am-lrc-line,
      .ym-am-lrc-line *,
      .ym-am-title,
      .ym-am-artist,
      .ym-am-time,
      .overlay-card,
      .overlay-card *,
      .karaoke-banner,
      .karaoke-banner * {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, sans-serif !important;
        letter-spacing: normal !important;
        text-transform: none !important;
      }
      ${extraCss}
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function applyHiddenMenuItems() {

    const existing = document.getElementById("ym-mod-hidden-menu-items");

    if (existing) existing.remove();



    const hideConcerts = modSettings["custom-themes/hideConcerts"] === true;

    const hideKids = modSettings["custom-themes/hideKids"] === true;



    if (!hideConcerts && !hideKids) return;



    const style = document.createElement("style");

    style.id = "ym-mod-hidden-menu-items";

    let css = "";

    if (hideConcerts) {

      css += `

        aside[data-test-id="NAVBAR"] li:has(a[href*="/concerts"]),

        aside[data-test-id="NAVBAR"] a[href*="/concerts"],

        aside a[href*="/concerts"],

        li:has(a[href*="/concerts"]) {

          display: none !important;

        }

      `;

    }

    if (hideKids) {

      css += `

        aside[data-test-id="NAVBAR"] li:has(a[href*="/kids"]),

        aside[data-test-id="NAVBAR"] a[href*="/kids"],

        aside a[href*="/kids"],

        li:has(a[href*="/kids"]) {

          display: none !important;

        }

      `;

    }

    style.textContent = css;

    (document.head || document.documentElement).appendChild(style);

  }



  function applyScale(scale) {

    const existing = document.getElementById(SCALE_STYLESHEET_ID);

    if (existing) existing.remove();



    const numericScale = parseFloat(scale) || 1.0;

    if (numericScale === 1.0) return;



    const style = document.createElement("style");

    style.id = SCALE_STYLESHEET_ID;

    style.textContent = `

      div[class*="DefaultLayout_root_"],

      div[class*="RootLayout_root_"],

      div[class*="layout_root_"],

      main {

        zoom: ${numericScale} !important;

      }

    `;

    (document.head || document.documentElement).appendChild(style);

  }



  function applyAutoQuality() {

    if (modSettings["autoQuality/enabled"] !== false) {

      try {

        if (window.localStorage && window.localStorage.ymPlayerQuality) {

          const data = JSON.parse(window.localStorage.ymPlayerQuality);

          if (data && data.value !== "high_quality") {

            data.value = "high_quality";

            data.expires = "2077-01-01T11:29:20.427Z";

            window.localStorage.setItem("ymPlayerQuality", JSON.stringify(data));

          }

        }

      } catch (e) {}

    }

  }



  // ==========================================

  // 5. REACT FIBER TRAVERSAL HELPERS (STEPHANZION ENGINE)

  // ==========================================

  function findFiberNode(element) {

    if (!element) return null;

    const fiberKey = Object.keys(element).find((key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"));

    return fiberKey ? element[fiberKey] : null;

  }



  function getRootFiber(fiber) {

    let current = fiber;

    while (current && current.return) {

      current = current.return;

    }

    return current || null;

  }



  function traverseFiber(fiber, isFoundCallback, depth = 0) {

    if (!fiber || depth > 250) return null;

    const result = isFoundCallback(fiber, depth);

    if (result !== null && result !== undefined) return result;



    if (fiber.child) {

      const childResult = traverseFiber(fiber.child, isFoundCallback, depth + 1);

      if (childResult !== null && childResult !== undefined) return childResult;

    }

    if (fiber.sibling) {

      const siblingResult = traverseFiber(fiber.sibling, isFoundCallback, depth);

      if (siblingResult !== null && siblingResult !== undefined) return siblingResult;

    }

    return null;

  }



  function searchFiberProperty(element, property) {

    if (!element) return null;

    try {

      const fiberNode = findFiberNode(element);

      if (!fiberNode) return null;

      const root = getRootFiber(fiberNode);

      return traverseFiber(root, (fiber) => {

        if (fiber.memoizedProps && Object.prototype.hasOwnProperty.call(fiber.memoizedProps, property)) {

          return fiber.memoizedProps;

        }

        return null;

      });

    } catch (e) {

      return null;

    }

  }



  function extractSonataStateFromFiber(element) {

    if (!element) return null;

    try {

      // 1. Direct search from root fiber for entityMeta or track
      const entityMetaProps = searchFiberProperty(element, "entityMeta");
      if (entityMetaProps && entityMetaProps.entityMeta) {
        const timecodeProps = searchFiberProperty(element, "timecodeClassName") || searchFiberProperty(element, "currentTimecodeClassName");
        return {
          entityMeta: entityMetaProps.entityMeta,
          isPlaying: entityMetaProps.isPlaying,
          position: timecodeProps && timecodeProps.position !== undefined ? timecodeProps.position : entityMetaProps.position,
          duration: timecodeProps && timecodeProps.duration !== undefined ? timecodeProps.duration : entityMetaProps.duration
        };
      }

      const trackProps = searchFiberProperty(element, "track");
      if (trackProps && trackProps.track && (trackProps.track.title || trackProps.track.id)) {
        const timecodeProps = searchFiberProperty(element, "timecodeClassName") || searchFiberProperty(element, "currentTimecodeClassName");
        return {
          entityMeta: trackProps.track,
          isPlaying: trackProps.isPlaying !== undefined ? trackProps.isPlaying : trackProps.playing,
          position: timecodeProps && timecodeProps.position !== undefined ? timecodeProps.position : trackProps.position,
          duration: timecodeProps && timecodeProps.duration !== undefined ? timecodeProps.duration : trackProps.duration
        };
      }



      // 2. Queue-based local search fallback

      const fiberNode = findFiberNode(element);

      if (!fiberNode) return null;



      const visited = new Set();

      const queue = [fiberNode];

      let steps = 0;



      while (queue.length > 0 && steps < 150) {

        steps++;

        const curr = queue.shift();

        if (!curr || visited.has(curr)) continue;

        visited.add(curr);



        if (curr.memoizedProps) {

          if (curr.memoizedProps.sonataState && curr.memoizedProps.sonataState.entityMeta) {

            return curr.memoizedProps.sonataState;

          }

          if (curr.memoizedProps.entityMeta && (curr.memoizedProps.entityMeta.title || curr.memoizedProps.entityMeta.id)) {
            return {
              entityMeta: curr.memoizedProps.entityMeta,
              isPlaying: curr.memoizedProps.isPlaying,
              position: curr.memoizedProps.position,
              duration: curr.memoizedProps.duration
            };
          }
          if (curr.memoizedProps.track && (curr.memoizedProps.track.title || curr.memoizedProps.track.id)) {
            return {
              entityMeta: curr.memoizedProps.track,
              isPlaying: curr.memoizedProps.isPlaying !== undefined ? curr.memoizedProps.isPlaying : curr.memoizedProps.playing,
              position: curr.memoizedProps.position,
              duration: curr.memoizedProps.duration
            };
          }

          if (curr.memoizedProps.track && (curr.memoizedProps.track.title || curr.memoizedProps.track.id)) {

            return {

              entityMeta: curr.memoizedProps.track,

              isPlaying: curr.memoizedProps.isPlaying,

              position: curr.memoizedProps.position,

              duration: curr.memoizedProps.duration

            };

          }

        }



        if (curr.child) queue.push(curr.child);

        if (curr.sibling) queue.push(curr.sibling);

        if (curr.return && steps < 40) queue.push(curr.return);

      }

      return null;

    } catch (e) {

      return null;

    }

  }



  function searchFiberProperty(element, property) {

    if (!element) return null;

    try {

      const fiberNode = findFiberNode(element);

      if (!fiberNode) return null;



      // 1. Direct check

      if (fiberNode.memoizedProps && fiberNode.memoizedProps[property] !== undefined) {

        return fiberNode.memoizedProps;

      }



      // 2. Breadth-first traversal down subtree (up to depth 150)

      const queue = [];

      if (fiberNode.child) queue.push(fiberNode.child);

      if (fiberNode.sibling) queue.push(fiberNode.sibling);



      let steps = 0;

      while (queue.length > 0 && steps < 150) {

        steps++;

        const curr = queue.shift();

        if (!curr) continue;

        if (curr.memoizedProps && curr.memoizedProps[property] !== undefined) {

          return curr.memoizedProps;

        }

        if (curr.child) queue.push(curr.child);

        if (curr.sibling) queue.push(curr.sibling);

      }



      // 3. Check parents up to 8 levels

      let parent = fiberNode.return;

      let pCount = 0;

      while (parent && pCount < 8) {

        if (parent.memoizedProps && parent.memoizedProps[property] !== undefined) {

          return parent.memoizedProps;

        }

        parent = parent.return;

        pCount++;

      }

      return null;

    } catch (e) {

      return null;

    }

  }



  // ==========================================
  // 5.5. NATIVE YANDEX SYNCHRONIZED LYRICS HMAC (Vzlomhik2005 standard)
  // ==========================================
  async function getLyricsSign(a) {
    try {
      const t = "p93jhgh689SBReK6ghtw62"; // Android App Secret Key
      const n = new TextEncoder();
      const i = n.encode(t);
      const key = await crypto.subtle.importKey(
        "raw",
        i,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign", "verify"]
      );
      const textBytes = n.encode(a);
      const signature = await crypto.subtle.sign("HMAC", key, textBytes);
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    } catch (err) {
      console.error("[Lyrics HMAC] Sign failed:", err);
      return "";
    }
  }

  // ==========================================
  // 5.6. LIVE WALLPAPER ENGINE & WORKSHOP (Мастерская обоев)
  // ==========================================
  let liveWallpaperAnimFrame = null;

  let cachedMediaServerPort = 0;
  if (window.yandexMusicMod && window.yandexMusicMod.getMediaServerPort) {
    window.yandexMusicMod.getMediaServerPort().then((p) => {
      cachedMediaServerPort = p;
      window.__ymMediaServerPort = p;
      if (modSettings["wallpaper/enabled"]) {
        applyLiveWallpaperSettings();
      }
      renderWallpaperGrid();
    }).catch((err) => {
      console.warn("[YandexMusicMod] Error getting media server port:", err);
    });
  }

  function toMediaUrl(filePath) {
    if (!filePath) return "";
    if (filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("data:") || filePath.startsWith("blob:")) {
      return filePath;
    }
    const port = cachedMediaServerPort || window.__ymMediaServerPort;
    if (port) {
      return `http://127.0.0.1:${port}/stream?file=${encodeURIComponent(filePath)}`;
    }
    return "";
  }


  function ensureLiveWallpaperContainer() {
    let container = document.getElementById("ym-live-wallpaper-container");
    if (!container && document.body) {
      container = document.createElement("div");
      container.id = "ym-live-wallpaper-container";
      container.innerHTML = `
        <video id="ym-live-wallpaper-video" loop muted playsinline autoplay style="display:none;"></video>
        <canvas id="ym-live-wallpaper-canvas" style="display:none;"></canvas>
        <img id="ym-live-wallpaper-image" style="display:none;" />
        <div id="ym-live-wallpaper-overlay"></div>
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  function initLiveWallpaper() {
    ensureLiveWallpaperContainer();

    // Download listeners from VSThemes window
    if (window.yandexMusicMod && window.yandexMusicMod.onWallpaperDownloadStarted) {
      window.yandexMusicMod.onWallpaperDownloadStarted((filename) => {
        showNotification(`Загрузка обоев «${filename}» началась...`, "info");
      });
    }

    if (window.yandexMusicMod && window.yandexMusicMod.onWallpaperDownloadProgress) {
      let lastNotifiedProgress = 0;
      window.yandexMusicMod.onWallpaperDownloadProgress((data) => {
        if (data && data.percent && data.percent - lastNotifiedProgress >= 35) {
          lastNotifiedProgress = data.percent;
          showNotification(`Скачивание обоев: ${data.percent}%`, "info");
        }
      });
    }

    if (window.yandexMusicMod && window.yandexMusicMod.onWallpaperDownloaded) {
      window.yandexMusicMod.onWallpaperDownloaded((filePath, filename) => {
        saveSetting("wallpaper/enabled", true);
        saveSetting("wallpaper/source", filePath);
        saveSetting("wallpaper/type", /\.(mp4|webm)$/i.test(filePath) ? "video" : "image");
        saveSetting("wallpaper/url", filePath);

        const enableSwitch = document.getElementById("opt-wallpaper-enable");
        if (enableSwitch) enableSwitch.checked = true;

        applyLiveWallpaperSettings();
        showNotification(`Живые обои «${filename}» успешно скачаны и применены!`, "success");
        renderWallpaperGrid();
      });
    }

    // Drag and drop video/gif onto app window
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    window.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const fPath = file.path;
        if (fPath && /\.(mp4|webm|gif|png|jpe?g)$/i.test(fPath)) {
          const isVid = /\.(mp4|webm)$/i.test(fPath);
          saveSetting("wallpaper/enabled", true);
          saveSetting("wallpaper/source", fPath);
          saveSetting("wallpaper/type", isVid ? "video" : "image");
          saveSetting("wallpaper/url", fPath);

          const enableSwitch = document.getElementById("opt-wallpaper-enable");
          if (enableSwitch) enableSwitch.checked = true;

          applyLiveWallpaperSettings();
          showNotification(`Живые обои установлены: ${file.name}`, "success");
          renderWallpaperGrid("downloaded");
        }
      }
    });

    // Auto-pause listener on blur / minimize for extreme energy & GPU efficiency
    window.addEventListener("blur", () => {
      const pauseOnBlur = modSettings["wallpaper/pauseOnBlur"] !== false;
      if (!pauseOnBlur) return;
      const vid = document.getElementById("ym-live-wallpaper-video");
      if (vid && !vid.paused) {
        try { vid.pause(); } catch (e) {}
      }
    });

    window.addEventListener("focus", () => {
      const isEnabled = !!modSettings["wallpaper/enabled"];
      if (!isEnabled) return;
      const vid = document.getElementById("ym-live-wallpaper-video");
      if (vid && vid.style.display !== "none" && vid.paused) {
        try { vid.play().catch(() => {}); } catch (e) {}
      }
    });

    // Fallback click listener so user interaction instantly resumes video if blocked
    window.addEventListener("click", () => {
      const vid = document.getElementById("ym-live-wallpaper-video");
      if (vid && vid.paused && modSettings["wallpaper/enabled"] && vid.src) {
        vid.play().catch(() => {});
      }
    }, { passive: true });

    // Periodic guard to ensure ym-has-live-wallpaper class persists
    setInterval(() => {
      if (modSettings["wallpaper/enabled"] && (modSettings["wallpaper/url"] || modSettings["wallpaper/source"])) {
        if (document.body && !document.body.classList.contains("ym-has-live-wallpaper")) {
          document.body.classList.add("ym-has-live-wallpaper");
        }
        if (document.documentElement && !document.documentElement.classList.contains("ym-has-live-wallpaper")) {
          document.documentElement.classList.add("ym-has-live-wallpaper");
        }
      }
    }, 600);

    applyLiveWallpaperSettings();
  }

  function applyLiveWallpaperSettings() {
    const container = ensureLiveWallpaperContainer();
    if (!container) return;

    const isEnabled = !!modSettings["wallpaper/enabled"];
    const opacity = modSettings["wallpaper/opacity"] !== undefined ? modSettings["wallpaper/opacity"] : 45;
    const blur = modSettings["wallpaper/blur"] !== undefined ? modSettings["wallpaper/blur"] : 0;
    const activeUrl = modSettings["wallpaper/url"] || modSettings["wallpaper/source"] || "";
    let activeType = modSettings["wallpaper/type"] || "video";

    if (activeUrl.startsWith("canvas:")) {
      activeType = "canvas";
    } else if (/\.(gif|png|jpe?g|webp)($|\?)/i.test(activeUrl)) {
      activeType = "image";
    } else if (/\.(mp4|webm|m4v)($|\?)/i.test(activeUrl) || !activeType) {
      activeType = "video";
    }

    container.style.setProperty("--ym-wallpaper-opacity", (opacity / 100).toFixed(2));
    container.style.setProperty("--ym-wallpaper-blur", `${blur}px`);

    let forceStyle = document.getElementById("ym-wallpaper-force-transparency");

    if (!isEnabled || !activeUrl) {
      document.documentElement.classList.remove("ym-has-live-wallpaper");
      document.body.classList.remove("ym-has-live-wallpaper");
      container.classList.remove("ym-active");
      container.style.display = "none";
      if (forceStyle) forceStyle.remove();
      stopCanvasWallpaper();
      const vid = document.getElementById("ym-live-wallpaper-video");
      if (vid) {
        vid.pause();
        vid.style.display = "none";
        vid.src = "";
      }
      const img = document.getElementById("ym-live-wallpaper-image");
      if (img) img.style.display = "none";
      const cvs = document.getElementById("ym-live-wallpaper-canvas");
      if (cvs) cvs.style.display = "none";
      return;
    }

    // Active
    document.documentElement.classList.add("ym-has-live-wallpaper");
    document.body.classList.add("ym-has-live-wallpaper");
    container.classList.add("ym-active");
    container.style.display = "block";
    container.style.opacity = "1";

    if (!forceStyle) {
      forceStyle = document.createElement("style");
      forceStyle.id = "ym-wallpaper-force-transparency";
      forceStyle.textContent = `
        html, body, #root, #__next {
          background: transparent !important;
          background-color: transparent !important;
        }
        /* Completely transparent left sidebar */
        aside, [data-test-id="NAVBAR"], [class*="DefaultLayout_navbar"], [class*="Navbar_root"], [class*="NavbarDesktop_root"], [class*="SideNavigation_root"], [class*="Navigation_root"], nav, .ym-mod-sidebar-container {
          background: transparent !important;
          background-color: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
          box-shadow: none !important;
        }
        aside::before, aside::after, [data-test-id="NAVBAR"]::before, [data-test-id="NAVBAR"]::after, [class*="DefaultLayout_navbar"]::before, [class*="DefaultLayout_navbar"]::after {
          display: none !important;
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
        aside *, [data-test-id="NAVBAR"] *, [class*="Navbar_root"] *, [class*="DefaultLayout_navbar"] *, [class*="NavbarDesktop_root"] *, [class*="NavbarDesktop_"] *, nav * {
          background: transparent !important;
          background-color: transparent !important;
          box-shadow: none !important;
        }
        /* Completely hide glowing Vibe animation blob */
        [class*="VibePage_vibeAnimation"],
        [class*="VibeBlock_vibeAnimation"],
        [class*="vibeAnimation"],
        [class*="VibeAnimation_"],
        [class*="VibeAnimation_"] *,
        [class*="VibeAnimation_"] canvas,
        [class*="VibeWidgetAnimation_"],
        [class*="VibeWidgetAnimation_"] *,
        [class*="VibeWidgetAnimation_"] canvas,
        [class*="vibeAnimation"] canvas,
        [class*="VibePage_bigCardPanelBackground"],
        [class*="VibePage_bigCardPanelBackground"]::before,
        [class*="VibePage_bigCardPanelBackground"]::after {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        :root, html, body {
          --ym-background-color-primary-enabled-basic: transparent !important;
          --ym-background-color-primary-enabled-content: transparent !important;
          --ym-layout-background-color: transparent !important;
          --vibe-gradient-stop-0: transparent !important;
          --vibe-gradient-stop-1: transparent !important;
          --vibe-gradient-stop-2: transparent !important;
          --vibe-gradient-stop-3: transparent !important;
          --vibe-gradient-stop-4: transparent !important;
          --vibe-gradient-stop-5: transparent !important;
          --vibe-gradient-stop-6: transparent !important;
          --vibe-gradient-stop-7: transparent !important;
          --vibe-gradient-stop-8: transparent !important;
          --vibe-gradient-stop-9: transparent !important;
          --vibe-gradient-stop-10: transparent !important;
          --vibe-gradient-stop-11: transparent !important;
          --vibe-gradient-stop-12: transparent !important;
          --vibe-gradient-stop-13: transparent !important;
          --vibe-gradient-stop-14: transparent !important;
          --vibe-gradient-stop-15: transparent !important;
        }
        [class*="CommonLayout_root"],
        [class*="MainLayout_root"],
        [class*="DefaultLayout_root"],
        [class*="DefaultLayout_rootNewVibe"],
        [class*="Page_root"],
        [class*="MainPage_root"],
        [class*="Content_root"],
        [class*="Content_main"],
        [class*="Desktop_root"],
        [class*="ApplicationDesktop_root"],
        [class*="WithTopBanner_root"],
        [class*="WithTopBanner_content"],
        [class*="RootLayout_root"],
        [class*="layout_root"],
        main,
        section[class*="MainLayout_content"],
        [class*="CollectionPage_"],
        [class*="ArtistPage_"],
        [class*="AlbumPage_"],
        [class*="PlaylistPage_"],
        [class*="SearchPage_"],
        [class*="ScrollContainer_"],
        [class*="VibePage_"],
        [class*="VibePage_"]::before,
        [class*="VibePage_"]::after,
        [class*="Vibe_"],
        [class*="Vibe_"]::before,
        [class*="Vibe_"]::after,
        [class*="WheelDesktop_"],
        [class*="WheelDesktop_"]::before,
        [class*="WheelDesktop_"]::after,
        [class*="VibeLayout"],
        [class*="VibeLayout"]::before,
        [class*="VibeLayout"]::after,
        [class*="bigCardPanelBackground"],
        [class*="bigCardPanelBackground"]::before,
        [class*="bigCardPanelBackground"]::after,
        [class*="VibeAnimation_root"],
        [class*="VibeAnimation_root"]::before,
        [class*="VibeAnimation_root"]::after,
        [class*="VibeAnimation_root"] div,
        [class*="VibeAnimation_root"] div::before,
        div[data-test-id="VIBE_PAGE"],
        div[data-test-id="VIBE_BLOCK"],
        div[data-test-id="FULLSCREEN_PLAYER_MODAL"] {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(forceStyle);
    }

    const vid = document.getElementById("ym-live-wallpaper-video");
    const img = document.getElementById("ym-live-wallpaper-image");
    const cvs = document.getElementById("ym-live-wallpaper-canvas");

    if (activeType === "canvas") {
      if (vid) { vid.pause(); vid.style.display = "none"; }
      if (img) img.style.display = "none";
      if (cvs) {
        cvs.style.display = "block";
        const mode = activeUrl.replace("canvas:", "") || "matrix";
        startCanvasWallpaper(cvs, mode);
      }
    } else if (activeType === "image") {
      stopCanvasWallpaper();
      if (vid) { vid.pause(); vid.style.display = "none"; }
      if (cvs) cvs.style.display = "none";
      if (img) {
        img.style.display = "block";
        const imgUrl = toMediaUrl(activeUrl);
        if (imgUrl && img.src !== imgUrl) img.src = imgUrl;
      }
    } else {
      // Video
      stopCanvasWallpaper();
      if (cvs) cvs.style.display = "none";
      if (img) img.style.display = "none";
      if (vid) {
        vid.style.display = "block";
        vid.muted = true;
        vid.defaultMuted = true;
        vid.autoplay = true;
        vid.loop = true;
        vid.playsInline = true;
        vid.setAttribute("muted", "");
        vid.setAttribute("autoplay", "");
        vid.setAttribute("playsinline", "");
        vid.setAttribute("loop", "");

        const streamUrl = toMediaUrl(activeUrl);
        if (streamUrl) {
          if (vid.src !== streamUrl) {
            vid.src = streamUrl;
            vid.load();
          }
          const p = vid.play();
          if (p && typeof p.then === "function") {
            p.catch((err) => {
              console.warn("[Wallpaper Video] Play error:", err);
              vid.muted = true;
              vid.play().catch(() => {});
            });
          }
        } else {
          if (window.yandexMusicMod && window.yandexMusicMod.getMediaServerPort) {
            window.yandexMusicMod.getMediaServerPort().then((p) => {
              if (p) {
                cachedMediaServerPort = p;
                window.__ymMediaServerPort = p;
                applyLiveWallpaperSettings();
              }
            }).catch(() => {});
          }
        }
      }
    }
  }

  function stopCanvasWallpaper() {
    if (liveWallpaperAnimFrame) {
      cancelAnimationFrame(liveWallpaperAnimFrame);
      liveWallpaperAnimFrame = null;
    }
  }

  function startCanvasWallpaper(canvas, mode) {
    stopCanvasWallpaper();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { once: true });

    if (mode === "matrix") {
      const chars = "0123456789ABCDEFЯНДЕКСМУЗЫКАモド";
      const fontSize = 16;
      let columns = Math.floor(canvas.width / fontSize);
      let drops = new Array(columns).fill(1);

      function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff66";
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        liveWallpaperAnimFrame = requestAnimationFrame(drawMatrix);
      }
      drawMatrix();
    } else if (mode === "starfield") {
      const stars = [];
      const numStars = 400;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: (Math.random() - 0.5) * canvas.width * 2,
          y: (Math.random() - 0.5) * canvas.height * 2,
          z: Math.random() * canvas.width,
        });
      }

      function drawStarfield() {
        ctx.fillStyle = "rgba(5, 5, 12, 0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          star.z -= 4;
          if (star.z <= 0) {
            star.z = canvas.width;
            star.x = (Math.random() - 0.5) * canvas.width * 2;
            star.y = (Math.random() - 0.5) * canvas.height * 2;
          }

          const k = 250 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
            const size = Math.max(1, (1 - star.z / canvas.width) * 3);
            const shade = Math.floor((1 - star.z / canvas.width) * 255);
            ctx.fillStyle = `rgb(${shade}, ${shade}, 255)`;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        liveWallpaperAnimFrame = requestAnimationFrame(drawStarfield);
      }
      drawStarfield();
    } else {
      // waves
      let step = 0;
      function drawWaves() {
        ctx.fillStyle = "rgba(8, 8, 16, 0.12)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        step += 0.02;
        const numLines = 5;
        for (let j = 0; j < numLines; j++) {
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          const hue = (step * 25 + j * 45) % 360;
          ctx.strokeStyle = `hsla(${hue}, 85%, 60%, 0.65)`;

          for (let x = 0; x < canvas.width; x += 10) {
            const y =
              canvas.height / 2 +
              Math.sin(x * 0.005 + step + j * 0.8) * 80 +
              Math.cos(x * 0.01 - step) * 35;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        liveWallpaperAnimFrame = requestAnimationFrame(drawWaves);
      }
      drawWaves();
    }
  }

  async function renderWallpaperGrid() {
    const grid = document.getElementById("ym-wallpaper-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const activeUrl = modSettings["wallpaper/url"] || "";
    const isWpEnabled = !!modSettings["wallpaper/enabled"];

    let downloaded = [];
    try {
      if (window.yandexMusicMod && window.yandexMusicMod.getDownloadedWallpapers) {
        downloaded = await window.yandexMusicMod.getDownloadedWallpapers();
      }
    } catch (e) {}

    if (!downloaded || downloaded.length === 0) {
      grid.innerHTML = `
        <div class="ym-wp-empty-state">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <div class="ym-wp-empty-title">У вас пока нет скачанных обоев</div>
          <div class="ym-wp-empty-desc">Откройте <b>«Каталог VSThemes.org»</b> выше и нажмите «Скачать» на любых понравившихся обоях, либо нажмите <b>«С диска»</b> или перетащите видеофайл прямо в окно Яндекс Музыки!</div>
        </div>
      `;
      return;
    }

    downloaded.forEach((item) => {
      const isSelected = isWpEnabled && activeUrl === item.path;
      const card = document.createElement("div");
      card.className = `ym-wallpaper-card ${isSelected ? "active" : ""}`;
      const isVideo = /\.(mp4|webm)$/i.test(item.filename);
      const cleanName = item.filename.replace(/^(\d+_)/, "").replace(/[\-_]/g, " ");
      const sizeMb = (item.size / (1024 * 1024)).toFixed(1);

      card.innerHTML = `
        <div class="ym-wallpaper-preview">
          ${isVideo 
            ? `<video src="${toMediaUrl(item.path)}" loop muted playsinline preload="metadata" onmouseenter="try{this.play()}catch(e){}" onmouseleave="try{this.pause()}catch(e){}"></video>` 
            : `<img src="${toMediaUrl(item.path)}" alt="" />`
          }
          <span class="ym-wallpaper-badge" style="background:rgba(139,92,246,0.35);color:#e9d5ff;">${isVideo ? "MP4 Видео" : "Анимация"}</span>
          <button class="ym-wp-del-btn" title="Удалить эти обои с диска" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="ym-wallpaper-title" title="${item.filename}">${cleanName}</div>
        <div class="ym-wallpaper-desc">${sizeMb} MB • Локальные обои</div>
        <button class="ym-btn-action ${isSelected ? "ym-active" : ""}">${isSelected ? "✓ Активно" : "Выбрать"}</button>
      `;

      card.addEventListener("click", () => {
        saveSetting("wallpaper/enabled", true);
        saveSetting("wallpaper/source", item.path);
        saveSetting("wallpaper/type", isVideo ? "video" : "image");
        saveSetting("wallpaper/url", item.path);

        const enableSwitch = document.getElementById("opt-wallpaper-enable");
        if (enableSwitch) enableSwitch.checked = true;

        applyLiveWallpaperSettings();
        renderWallpaperGrid();
      });

      const delBtn = card.querySelector(".ym-wp-del-btn");
      if (delBtn) {
        delBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (confirm(`Удалить обои «${cleanName}» с компьютера?`)) {
            if (window.yandexMusicMod && window.yandexMusicMod.deleteDownloadedWallpaper) {
              await window.yandexMusicMod.deleteDownloadedWallpaper(item.path);
              if (activeUrl === item.path) {
                saveSetting("wallpaper/enabled", false);
                saveSetting("wallpaper/url", "");
                applyLiveWallpaperSettings();
              }
              showNotification("Обои удалены", "info");
              renderWallpaperGrid();
            }
          }
        });
      }

      grid.appendChild(card);
    });
  }

  // ==========================================
  // 5.7. CUSTOM NEON TOP TRACKBAR (TikTok / Image 3)
  // ==========================================
  let topTrackbarElem = null;
  let topTrackbarFill = null;
  let topTrackbarThumb = null;
  let isSeekingTopTrackbar = false;

  function initTopTrackbar() {
    ensureTopTrackbar();
    applyTrackbarStyle();
  }

  function ensureTopTrackbar() {
    const playerBar =
      document.querySelector('[class*="PlayerBarDesktop_root"]') ||
      document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]');

    if (!playerBar) return;

    if (!topTrackbarElem || !playerBar.contains(topTrackbarElem)) {
      if (topTrackbarElem) {
        try { topTrackbarElem.remove(); } catch (e) {}
      }

      const bar = document.createElement("div");
      bar.className = "ym-top-trackbar";
      bar.id = "ym-top-trackbar";
      bar.innerHTML = `
        <div class="ym-top-trackbar-fill" id="ym-top-trackbar-fill">
          <div class="ym-top-trackbar-thumb" id="ym-top-trackbar-thumb"></div>
        </div>
      `;

      function handleSeek(e) {
        const rect = bar.getBoundingClientRect();
        if (rect.width <= 0) return;
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        let ratio = (clientX - rect.left) / rect.width;
        ratio = Math.max(0, Math.min(1, ratio));

        if (topTrackbarFill) {
          topTrackbarFill.style.width = `${(ratio * 100).toFixed(2)}%`;
        }

        // Seek via React Player / Native ProgressBar click
        const defaultProgressBar =
          document.querySelector('div[class*="ProgressBar_sliderThumb"]') ||
          document.querySelector('div[data-test-id="PROGRESS_BAR"]') ||
          document.querySelector('[class*="ProgressBar_sliderRoot"]');

        if (defaultProgressBar) {
          const pbRect = defaultProgressBar.getBoundingClientRect();
          const targetX = pbRect.left + pbRect.width * ratio;
          const targetY = pbRect.top + pbRect.height / 2;

          const mDown = new MouseEvent("mousedown", { clientX: targetX, clientY: targetY, bubbles: true });
          const mUp = new MouseEvent("mouseup", { clientX: targetX, clientY: targetY, bubbles: true });
          defaultProgressBar.dispatchEvent(mDown);
          defaultProgressBar.dispatchEvent(mUp);
        }
      }

      bar.addEventListener("mousedown", (e) => {
        isSeekingTopTrackbar = true;
        handleSeek(e);

        const onMouseMove = (me) => {
          if (isSeekingTopTrackbar) handleSeek(me);
        };
        const onMouseUp = () => {
          isSeekingTopTrackbar = false;
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      });

      playerBar.style.position = "relative";
      playerBar.prepend(bar);

      topTrackbarElem = bar;
      topTrackbarFill = bar.querySelector("#ym-top-trackbar-fill");
      topTrackbarThumb = bar.querySelector("#ym-top-trackbar-thumb");
    }
  }

  function applyTrackbarStyle() {
    const isEnabled = modSettings["trackbar/topBarEnabled"] !== false;
    const color = modSettings["trackbar/color"] || "#ffe600";
    const thickness = modSettings["trackbar/thickness"] || "3px";
    const hideDefault = !!modSettings["trackbar/hideDefaultSlider"];

    if (hideDefault) {
      document.body.classList.add("ym-hide-default-slider");
    } else {
      document.body.classList.remove("ym-hide-default-slider");
    }

    if (!topTrackbarElem) ensureTopTrackbar();
    if (!topTrackbarElem) return;

    if (!isEnabled) {
      topTrackbarElem.style.display = "none";
      return;
    }

    topTrackbarElem.style.display = "block";
    topTrackbarElem.style.setProperty("--ym-trackbar-color", color);
    topTrackbarElem.style.setProperty("--ym-trackbar-height", thickness);
  }

  function updateTopTrackbar(position, duration) {
    if (isSeekingTopTrackbar) return;
    if (!topTrackbarElem || !topTrackbarFill) {
      ensureTopTrackbar();
    }
    if (!topTrackbarFill) return;

    if (duration > 0 && position >= 0) {
      const pct = Math.min(100, Math.max(0, (position / duration) * 100));
      topTrackbarFill.style.width = `${pct.toFixed(2)}%`;
    } else {
      topTrackbarFill.style.width = "0%";
    }
  }


    // ==========================================

  // 6. MOD SETTINGS MODAL UI

  // ==========================================

  function injectModUI() {

    if (document.getElementById("ym-mod-modal-backdrop")) return;



    // 1. Create Modal Backdrop

    const backdrop = document.createElement("div");

    backdrop.id = "ym-mod-modal-backdrop";

    backdrop.className = "ym-mod-modal-backdrop";



    backdrop.innerHTML = `

      <div class="ym-mod-modal" id="ym-mod-modal">

        <!-- Header -->

        <div class="ym-modal-header">

          <div class="ym-modal-title-wrap">

            <div class="ym-modal-logo">

              <img src="${MOD_LOGO_ICON_B64}" width="26" height="26" class="ym-header-logo-img" alt="Logo"/>

            </div>

            <div class="ym-modal-title">Настройки Мода</div>

            <div class="ym-modal-version">v1.4.0 (YM 5.124.1)</div>

          </div>

          <button class="ym-modal-close" id="ym-mod-close-btn" title="Закрыть (Esc)">

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">

              <line x1="18" y1="6" x2="6" y2="18"></line>

              <line x1="6" y1="6" x2="18" y2="18"></line>

            </svg>

          </button>

        </div>



        <!-- Body -->

        <div class="ym-modal-body">

          <!-- Sidebar Tabs -->

          <div class="ym-modal-tabs">

            <button class="ym-tab-btn active" data-tab="tab-plus">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>

              </svg>

              <span>Основные</span>

            </button>

            <button class="ym-tab-btn" data-tab="tab-appearance">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>

                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>

                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>

                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>

                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path>

              </svg>

              <span>Внешний вид</span>

            </button>

            <button class="ym-tab-btn" data-tab="tab-wallpapers">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>Мастерская обоев</span>
            </button>

            <button class="ym-tab-btn" data-tab="tab-cleaner">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>

                <line x1="1" y1="1" x2="23" y2="23"></line>

              </svg>

              <span>Очистка UI</span>

            </button>

            <button class="ym-tab-btn" data-tab="tab-fonts">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                <polyline points="4 7 4 4 20 4 20 7"></polyline>

                <line x1="9" y1="20" x2="15" y2="20"></line>

                <line x1="12" y1="4" x2="12" y2="20"></line>

              </svg>

              <span>Шрифты</span>

            </button>

            <button class="ym-tab-btn" data-tab="tab-overlay">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                <rect x="2" y="6" width="20" height="12" rx="2"></rect>

                <line x1="6" y1="12" x2="10" y2="12"></line>

                <line x1="8" y1="10" x2="8" y2="14"></line>

                <circle cx="15" cy="13" r="1"></circle>

                <circle cx="18" cy="11" r="1"></circle>

              </svg>

              <span>Игровой HUD</span>

            </button>

            <button class="ym-tab-btn" data-tab="tab-karaoke">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>

                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>

                <line x1="12" y1="19" x2="12" y2="23"></line>

                <line x1="8" y1="23" x2="16" y2="23"></line>

              </svg>

              <span>Караоке</span>

            </button>

            <button class="ym-tab-btn" data-tab="tab-tweaks">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                <circle cx="12" cy="12" r="3"></circle>

                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>

              </svg>

              <span>Discord и твики</span>

            </button>

            <button class="ym-tab-btn" data-tab="tab-about">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

                <circle cx="12" cy="12" r="10"></circle>

                <line x1="12" y1="16" x2="12" y2="12"></line>

                <line x1="12" y1="8" x2="12.01" y2="8"></line>

              </svg>

              <span>О моде</span>

            </button>

          </div>



          <!-- Content Panels -->

          <div class="ym-modal-content">

            <!-- TAB 0: PLUS UNLOCKER -->

            <div class="ym-tab-pane active" id="tab-plus">

              <div class="ym-card">

                <div class="ym-card-title">Яндекс Плюс</div>

                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Статус подписки</span>

                    <span class="ym-desc" style="color:#10b981;font-weight:600;">Активен (hasPlus: true)</span>

                  </div>

                  <button class="ym-btn-action ym-btn-primary" id="btn-reload-plus">

                    Перезагрузить приложение

                  </button>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Снятие 30-секундного лимита</span>

                    <span class="ym-desc">Воспроизведение полных аудиотреков в высоком битрейте</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-plus-enabled" checked disabled>

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Неограниченные пропуски</span>

                    <span class="ym-desc">Снятие ограничений на пропуск треков в Моей Волне</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-plus-skips" checked disabled>

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Блокировка рекламы</span>

                    <span class="ym-desc">Подавление баннеров подписки и рекламных аудиовставок</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-plus-ads" checked disabled>

                    <span class="ym-slider"></span>

                  </label>

                </div>

              </div>

            </div>



            <!-- TAB 1: APPEARANCE -->

            <div class="ym-tab-pane" id="tab-appearance">

              <div class="ym-card">

                <div class="ym-card-title">Стиль и акцентные цвета</div>

                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Режим оформления</span>

                    <span class="ym-desc">Переключение визуальной структуры плеера</span>

                  </div>

                  <select class="ym-select" id="opt-design-mode">

                    <option value="modern">Modern Glass (Матовое стекло)</option>

                    <option value="classic">Классический темный</option>

                    <option value="compact">Компактный (Минимализм)</option>

                  </select>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Акцентный цвет</span>

                    <span class="ym-desc">Цвет выделения, кнопок, свечения и ползунков</span>

                  </div>

                  <div class="ym-palette-wrap">

                    <div class="ym-color-swatch" data-color="#8b5cf6" style="background:#8b5cf6;" title="Киберпанк Фиолетовый"></div>

                    <div class="ym-color-swatch" data-color="#007acc" style="background:#007acc;" title="Неоновый Синий"></div>

                    <div class="ym-color-swatch" data-color="#fed42b" style="background:#fed42b;" title="Яндекс Жёлтый"></div>

                    <div class="ym-color-swatch" data-color="#10b981" style="background:#10b981;" title="Изумрудный Неон"></div>

                    <div class="ym-color-swatch" data-color="#ff7b00" style="background:#ff7b00;" title="Закатный Оранжевый"></div>

                    <div class="ym-color-swatch" data-color="#ff3347" style="background:#ff3347;" title="Рубиновый Красный"></div>

                    <div class="ym-color-swatch" data-color="#f43f5e" style="background:#f43f5e;" title="Неоновый Розовый"></div>

                    <div class="ym-color-swatch" data-color="#e2e8f0" style="background:#e2e8f0;" title="Серебряный Монохром"></div>

                    <input type="color" class="ym-color-picker" id="opt-custom-color" value="#8b5cf6" title="Свой цвет">

                  </div>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Размытие стекла (Glassmorphism)</span>

                    <span class="ym-desc">Интенсивность матового эффекта фона</span>

                  </div>

                  <select class="ym-select" id="opt-glass-blur">

                    <option value="medium">Премиум стекло (28px)</option>

                    <option value="light">Мягкое стекло (14px)</option>

                    <option value="ultra">Глубокое матовое (44px)</option>

                    <option value="off">Без размытия (Выкл)</option>

                  </select>

                </div>

              </div>



              <div class="ym-card">

                <div class="ym-card-title">Эффекты и плавные анимации</div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Плавные анимации карточек (Hover FX)</span>

                    <span class="ym-desc">Мягкий подъем и неоновое свечение треков и альбомов при наведении</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-card-hover">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Неоновая подсветка плеера (Ambient Glow)</span>

                    <span class="ym-desc">Мягкое свечение нижней панели плеера под цвет акцента</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-player-glow">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Светящийся прогресс-бар</span>

                    <span class="ym-desc">Неоновое свечение линии воспроизведения трека</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-glow-progress">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Плавные переходы страниц</span>

                    <span class="ym-desc">60fps анимации переходов между альбомами и плейлистами</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-smooth-transitions">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Отключить 3D-анимацию «Моя Волна»</span>

                    <span class="ym-desc">Снижает нагрузку на видеокарту и экономит ресурсы</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-disable-vibe">

                    <span class="ym-slider"></span>

                  </label>

                </div>

              </div>

              <!-- Custom TikTok Neon Player Trackbar -->
              <div class="ym-card">
                <div class="ym-card-title">Кастомный трекбар плеера (Стиль TikTok)</div>
                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Неоновая полоска сверху плеера</span>
                    <span class="ym-desc">Светящийся прогресс-бар по верхнему краю панели с точкой воспроизведения</span>
                  </div>
                  <label class="ym-switch">
                    <input type="checkbox" id="opt-trackbar-top" checked>
                    <span class="ym-slider"></span>
                  </label>
                </div>
                <div class="ym-row" id="row-trackbar-color">
                  <div class="ym-col-info">
                    <span class="ym-label">Цвет неоновой полоски</span>
                    <span class="ym-desc">Цвет линии и светящейся точки трека</span>
                  </div>
                  <div class="ym-palette-wrap" id="trackbar-palette">
                    <div class="ym-color-swatch active" data-color="#ffe600" style="background:#ffe600;" title="Ярко-желтый (TikTok)"></div>
                    <div class="ym-color-swatch" data-color="#ff2d55" style="background:#ff2d55;" title="Киберпанк Розовый"></div>
                    <div class="ym-color-swatch" data-color="#00f0ff" style="background:#00f0ff;" title="Неоновый Бирюзовый"></div>
                    <div class="ym-color-swatch" data-color="#00ff66" style="background:#00ff66;" title="Токсично-зеленый"></div>
                    <div class="ym-color-swatch" data-color="#a855f7" style="background:#a855f7;" title="Электрический Фиолетовый"></div>
                    <div class="ym-color-swatch" data-color="#ffffff" style="background:#ffffff;" title="Минималистичный Белый"></div>
                    <input type="color" class="ym-color-picker" id="opt-trackbar-custom-color" value="#ffe600" title="Свой цвет">
                  </div>
                </div>
                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Толщина линии</span>
                    <span class="ym-desc">Высота полоски над плеером</span>
                  </div>
                  <select class="ym-select" id="opt-trackbar-thickness">
                    <option value="2px">Тонкая (2px)</option>
                    <option value="3px" selected>Стандартная (3px — как на видео)</option>
                    <option value="5px">Выразительная (5px)</option>
                  </select>
                </div>
                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Скрыть стандартный ползунок плеера</span>
                    <span class="ym-desc">Оставить только верхний неоновый бар для чистого минимализма</span>
                  </div>
                  <label class="ym-switch">
                    <input type="checkbox" id="opt-trackbar-hide-default">
                    <span class="ym-slider"></span>
                  </label>
                </div>
              </div>

            </div>

            <!-- TAB 1.5: WALLPAPER WORKSHOP -->
            <div class="ym-tab-pane" id="tab-wallpapers">
              <!-- VSThemes In-App Catalog Banner (Compact & Non-overflowing) -->
              <div class="ym-vsthemes-banner">
                <div class="ym-vsthemes-header">
                  <div class="ym-vsthemes-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    <span>Каталог анимированных обоев VSThemes.org</span>
                    <span class="ym-badge" style="background:rgba(139,92,246,0.3);color:#e9d5ff;border-color:rgba(139,92,246,0.5);">Скачивание в 1 клик</span>
                  </div>
                  <div class="ym-vsthemes-desc">
                    Открывает галерею живых обоев прямо в приложении. Нажмите «Скачать» на любых обоях — мод автоматически загрузит, распакует и установит их на фон!
                  </div>
                </div>
                <div class="ym-vsthemes-actions">
                  <button class="ym-btn-vsthemes" id="btn-open-vsthemes" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    <span>Открыть каталог VSThemes</span>
                  </button>
                  <button class="ym-btn-upload" id="btn-upload-local-wp" type="button" title="Выбрать видео или GIF файл с компьютера">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>С диска (MP4 / GIF)</span>
                  </button>
                </div>
              </div>

              <div class="ym-card">
                <div class="ym-card-title">Управление живыми обоями</div>
                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Включить анимированные обои</span>
                    <span class="ym-desc">Плавный зацикленный видео-фон поверх интерфейса</span>
                  </div>
                  <label class="ym-switch">
                    <input type="checkbox" id="opt-wallpaper-enable">
                    <span class="ym-slider"></span>
                  </label>
                </div>
                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Затемнение фона (Dimming)</span>
                    <span class="ym-desc">Регулирует яркость для идеальной читаемости названий треков</span>
                  </div>
                  <div class="ym-range-wrap">
                    <input type="range" class="ym-range" id="opt-wallpaper-opacity" min="10" max="90" value="55">
                    <span class="ym-range-val" id="val-wallpaper-opacity">55%</span>
                  </div>
                </div>
                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Размытие фона (Backdrop Blur)</span>
                    <span class="ym-desc">Мягкое размытие движения для концентрации на музыке</span>
                  </div>
                  <div class="ym-range-wrap">
                    <input type="range" class="ym-range" id="opt-wallpaper-blur" min="0" max="24" value="0">
                    <span class="ym-range-val" id="val-wallpaper-blur">0px</span>
                  </div>
                </div>
                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Энергосбережение (Пауза при сворачивании)</span>
                    <span class="ym-desc">Останавливать анимацию и видео, когда окно скрыто, для экономии GPU и батареи</span>
                  </div>
                  <label class="ym-switch">
                    <input type="checkbox" id="opt-wallpaper-pause" checked>
                    <span class="ym-slider"></span>
                  </label>
                </div>
              </div>

              <div class="ym-card">
                <div class="ym-card-header-row">
                  <div class="ym-card-title">Ваши живые обои</div>
                  <button class="ym-btn-action" id="btn-refresh-wallpapers" title="Обновить список обоев">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    <span>Обновить</span>
                  </button>
                </div>

                <div class="ym-wallpaper-grid" id="ym-wallpaper-grid"></div>
              </div>

              <div class="ym-card">
                <div class="ym-card-title">Свои обои (URL / Файл)</div>
                <div class="ym-row ym-row-block">
                  <span class="ym-desc" style="margin-bottom: 8px;">Вставьте прямую ссылку на видео (.mp4 / .webm) или анимированный GIF / изображение:</span>
                  <div class="ym-input-group">
                    <input type="text" class="ym-input" id="opt-wallpaper-custom-url" placeholder="https://example.com/video.mp4 или gif...">
                    <button class="ym-btn-primary" id="btn-apply-custom-wallpaper">Применить</button>
                  </div>
                </div>
                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Сбросить фон на стандартный</span>
                    <span class="ym-desc">Возвращает исходный темный фон Яндекс Музыки</span>
                  </div>
                  <button class="ym-btn-secondary" id="btn-reset-wallpaper">Сбросить</button>
                </div>
              </div>
            </div>

            <!-- TAB 2: CLEANER -->

            <div class="ym-tab-pane" id="tab-cleaner">

              <div class="ym-card">

                <div class="ym-card-title">Боковое меню навигации</div>

                

                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть раздел «Концерты»</span>

                    <span class="ym-desc">Убирает пункт афиши концертов из панели навигации</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-concerts">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть раздел «Детям»</span>

                    <span class="ym-desc">Убирает детский раздел из левой панели</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-kids">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть раздел «Подкасты и книги»</span>

                    <span class="ym-desc">Убирает подкасты, аудиокниги и лекции</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-podcasts">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть раздел «Тренды и рекомендации»</span>

                    <span class="ym-desc">Убирает блок трендов и промо-чартов</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-trends">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть раздел «Радио»</span>

                    <span class="ym-desc">Убирает радиостанции из бокового меню</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-radio">

                    <span class="ym-slider"></span>

                  </label>

                </div>

              </div>



              <div class="ym-card">

                <div class="ym-card-title">Реклама, баннеры и промо-блоки</div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть рекламные баннеры и Плюс</span>

                    <span class="ym-desc">Убирает все промо-баннеры и предложения оформить подписку</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-banners">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть блок «Установить на телефон»</span>

                    <span class="ym-desc">Убирает QR-коды и баннеры мобильного приложения</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-mobile">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть «Донаты артисту» (чаевые)</span>

                    <span class="ym-desc">Убирает кнопки донатов на страницах исполнителей</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-donates">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть «Купить билет на концерт»</span>

                    <span class="ym-desc">Убирает афиши и виджеты покупки билетов у артистов</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-tickets">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть видеоклипы и трейлеры</span>

                    <span class="ym-desc">Убирает блоки видеороликов на страницах треков</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-trailers">

                    <span class="ym-slider"></span>

                  </label>

                </div>

              </div>



              <div class="ym-card">

                <div class="ym-card-title">Элементы плеера (Нижняя панель)</div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть кнопку «Дизлайк» (Не нравится)</span>

                    <span class="ym-desc">Убирает кнопку дизлайка из панели воспроизведения</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-dislike">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть кнопку «Очередь воспроизведения»</span>

                    <span class="ym-desc">Убирает список следующих треков из нижнего бара</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-queue">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть кнопку «Полноэкранный режим»</span>

                    <span class="ym-desc">Убирает иконку перехода на полный экран</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-fullscreen">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть кнопку «Качество звука»</span>

                    <span class="ym-desc">Убирает значок HQ / Lossless из плеера</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-quality">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть кнопку «Предыдущий трек»</span>

                    <span class="ym-desc">Оставляет только кнопки воспроизведения и перехода вперёд</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-prev">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Скрыть кнопку «Текст песни»</span>

                    <span class="ym-desc">Убирает штатную кнопку караоке из нижнего плеера</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-cleaner-lyrics">

                    <span class="ym-slider"></span>

                  </label>

                </div>

              </div>

            </div>



            <!-- TAB 3: FONTS -->

            <div class="ym-tab-pane" id="tab-fonts">

              <div class="ym-card">

                <div class="ym-card-title">Кастомная типографика</div>

                

                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Включить замену шрифта</span>

                    <span class="ym-desc">Применять выбранный шрифт ко всему интерфейсу приложения</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-font-enabled">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Семейство шрифтов</span>

                    <span class="ym-desc">Встроенные игровые, ретро и современные шрифты с поддержкой кириллицы</span>

                  </div>

                  <select class="ym-select" id="opt-font-family">
                    <option value="Terraria">Terraria / Andy Bold (Любимый)</option>
                    <option value="Minecraft">Minecraft (Квадратный мир)</option>
                    <option value="NewYear">Новогодний (Снегопад и уют)</option>
                    <option value="Halloween">Хэллоуин (Готика и мистика)</option>
                    <option value="Cyberpunk">Киберпанк (Неон и глитч)</option>
                    <option value="Arcade">Arcade 8-Bit (Ретро-гейминг)</option>
                    <option value="KellySlab">Kelly Slab (Футуризм)</option>
                    <option value="JetBrains">JetBrains Mono (Моноширинный)</option>
                    <option value="Original">Оригинал (Yandex Sans)</option>
                  </select>

                </div>

                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Эффекты шрифта и анимации</span>
                    <span class="ym-desc">Снегопад, тыквы на Хэллоуин, неоновый глитч и кубический стиль</span>
                  </div>
                  <label class="ym-switch">
                    <input type="checkbox" id="opt-font-effects" checked />
                    <span class="ym-slider"></span>
                  </label>
                </div>

                <div class="ym-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                  <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                    <div class="ym-col-info">
                      <span class="ym-label">Размер шрифта приложения</span>
                      <span class="ym-desc">Масштабирование текста по всему интерфейсу</span>
                    </div>
                    <span id="ym-font-size-val" style="font-size:12px;font-weight:700;color:#ff2d3c;background:rgba(255,45,60,0.12);padding:2px 8px;border-radius:8px;">100%</span>
                  </div>
                  <input type="range" class="ym-range" id="opt-font-size" min="80" max="140" step="5" value="100" style="width:100%;" />
                </div>

                <div class="ym-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                  <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                    <div class="ym-col-info">
                      <span class="ym-label">Размер шрифта настроек мода</span>
                      <span class="ym-desc">Масштаб текста внутри этого окна настроек</span>
                    </div>
                    <span id="ym-modal-font-size-val" style="font-size:12px;font-weight:700;color:#ff2d3c;background:rgba(255,45,60,0.12);padding:2px 8px;border-radius:8px;">100%</span>
                  </div>
                  <input type="range" class="ym-range" id="opt-modal-font-size" min="80" max="140" step="5" value="100" style="width:100%;" />

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Пользовательский шрифт</span>

                    <span class="ym-desc">Имя любого системного шрифта Windows (Arial, Segoe UI, Comic Sans...)</span>

                  </div>

                  <input type="text" class="ym-input" id="opt-font-custom" placeholder="Например: Segoe UI" />

                </div>

              </div>



              <!-- Live Font Preview -->

              <div class="ym-card ym-font-preview-card">

                <div class="ym-card-title">Предпросмотр шрифта</div>

                <div class="ym-font-preview-box" id="font-preview-box">

                  <div class="ym-preview-title">Яндекс Музыка</div>

                  <div class="ym-preview-body">Съешь же ещё этих мягких французских булок, да выпей чаю.</div>

                  <div class="ym-preview-sub">The quick brown fox jumps over the lazy dog • 0123456789 • ♫ ♪ ♬</div>

                </div>

              </div>

            </div>



            <!-- TAB 4: OVERLAY -->

            <div class="ym-tab-pane" id="tab-overlay">

              <div class="ym-card">

                <div class="ym-card-title">Игровой HUD Оверлей</div>

                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Включить оверлей</span>

                    <span class="ym-desc">Плавающий прозрачный HUD поверх всех игр и полноэкранных окон</span>

                  </div>

                  <button class="ym-btn-action ym-btn-primary" id="btn-open-overlay">

                    Открыть оверлей

                  </button>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Режим сквозного клика (Ghost Mode)</span>

                    <span class="ym-desc">Клики проходят сквозь оверлей прямо в окно игры</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-overlay-ghost">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Без цветного ореола (Чистая тень)</span>

                    <span class="ym-desc">Убирает красные и цветные блики вокруг окна HUD</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-hud-pure-shadow">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Строка караоке в HUD</span>

                    <span class="ym-desc">Отображать бегущую строку текста песни внизу HUD</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-hud-show-lyrics">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Горячая клавиша скрытия</span>

                    <span class="ym-desc">Быстро скрыть или показать HUD в игре</span>

                  </div>

                  <span class="ym-badge">Ctrl + Shift + O</span>

                </div>

              </div>

            </div>



            <!-- TAB 5: KARAOKE -->

            <div class="ym-tab-pane" id="tab-karaoke">

              <div class="ym-card">

                <div class="ym-card-title">Плавающее Караоке</div>

                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Синхронный караоке-текст</span>

                    <span class="ym-desc">Отображать бегущую строку текста текущей песни поверх окон</span>

                  </div>

                  <button class="ym-btn-action ym-btn-primary" id="btn-open-karaoke">

                    Открыть караоке

                  </button>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Горячая клавиша</span>

                    <span class="ym-desc">Включение и выключение караоке виджета</span>

                  </div>

                  <span class="ym-badge">Ctrl + Shift + K</span>

                </div>

              </div>

            </div>



            <!-- TAB 6: TWEAKS -->

            <div class="ym-tab-pane" id="tab-tweaks">

              <div class="ym-card">

                <div class="ym-card-title">Discord и твики</div>

                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Discord Rich Presence (RPC)</span>

                    <span class="ym-desc">Отображение текущего трека, обложки и времени в вашем Discord статусе</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-discord-rpc">

                    <span class="ym-slider"></span>

                  </label>

                </div>

                <div class="ym-row" id="row-discord-app-title">
                  <div class="ym-col-info">
                    <span class="ym-label">Название активности в Discord</span>
                    <span class="ym-desc">Выберите имя приложения в статусе Discord</span>
                  </div>
                  <select class="ym-select" id="opt-discord-app-title">
                    <option value="ru">🇷🇺 Яндекс Музыка (Слушает Яндекс Музыка)</option>
                    <option value="ru_alt">🇷🇺 Яндекс Музыку (Слушает / Играет в Яндекс Музыку)</option>
                    <option value="en">🇬🇧 Yandex Music</option>
                  </select>
                </div>

                <div class="ym-row" id="row-discord-activity-type">
                  <div class="ym-col-info">
                    <span class="ym-label">Тип активности Discord</span>
                    <span class="ym-desc">Отображать «Слушает» вместо «Играет в»</span>
                  </div>
                  <select class="ym-select" id="opt-discord-activity-type">
                    <option value="listening" selected>🎧 Слушает (Listening)</option>
                    <option value="playing">🎮 Играет в (Playing)</option>
                  </select>
                </div>

                <div class="ym-row" id="row-discord-time-format">
                  <div class="ym-col-info">
                    <span class="ym-label">Формат времени в статусе</span>
                    <span class="ym-desc">Показывать прогресс трека (01:34 ── 02:54) вместо обратного отсчета</span>
                  </div>
                  <select class="ym-select" id="opt-discord-time-format">
                    <option value="progress" selected>🎵 Прогресс трека (01:34 ── 02:54)</option>
                    <option value="elapsed">⏱️ Прошло времени от начала</option>
                    <option value="remaining">⏳ Обратный отсчет до конца</option>
                  </select>
                </div>

                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">Кнопка мода в Discord</span>
                    <span class="ym-desc">Отображать вторую кнопку со ссылкой на Yandex Music Mod</span>
                  </div>
                  <label class="ym-switch">
                    <input type="checkbox" id="opt-discord-mod-button" checked>
                    <span class="ym-slider"></span>
                  </label>
                </div>



                <div class="ym-row">
                  <div class="ym-col-info">
                    <span class="ym-label">🛡️ Блокировать обновления приложения</span>
                    <span class="ym-desc">Отключает уведомления и автозагрузку обновлений Яндекс Музыки для защиты мода от слетания</span>
                  </div>
                  <label class="ym-switch">
                    <input type="checkbox" id="opt-block-app-updates" checked>
                    <span class="ym-slider"></span>
                  </label>
                </div>

                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Авто-выбор максимального качества</span>

                    <span class="ym-desc">Принудительно запрашивать максимальный доступный аудиобитрейт</span>

                  </div>

                  <label class="ym-switch">

                    <input type="checkbox" id="opt-auto-quality">

                    <span class="ym-slider"></span>

                  </label>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Масштаб интерфейса</span>

                    <span class="ym-desc">Регулировка масштабирования элементов окна</span>

                  </div>

                  <select class="ym-select" id="opt-ui-scale">

                    <option value="0.8">80%</option>

                    <option value="0.9">90%</option>

                    <option value="1.0">100% (По умолчанию)</option>

                    <option value="1.1">110%</option>

                    <option value="1.25">125%</option>

                  </select>

                </div>



                <div class="ym-row">

                  <div class="ym-col-info">

                    <span class="ym-label">Консоль отладки</span>

                    <span class="ym-desc">Открыть Chrome Developer Tools для инспекции элементов</span>

                  </div>

                  <button class="ym-btn-action ym-btn-secondary" id="btn-open-devtools">

                    Открыть DevTools

                  </button>

                </div>

              </div>

            </div>



            <!-- TAB 7: ABOUT -->

            <div class="ym-tab-pane" id="tab-about">

              <div class="ym-card">

                <div class="ym-card-title">О моде</div>

                <p style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin:0 0 12px 0;">

                  Модификация для официального настольного клиента Яндекс Музыки (версия 5.124.1).<br>

                  Включает разблокировку Яндекс Плюс, кастомные шрифты с поддержкой кириллицы, игровой оверлей, плавающее караоке с каскадным поиском текстов и синхронизацию Discord RPC.

                </p>

                <div class="ym-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">

                  <span class="ym-label">Горячие клавиши настроек</span>

                  <span class="ym-badge">Ctrl + Shift + S</span>

                </div>

                <div class="ym-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:14px;margin-top:12px;">
                  <div class="ym-col-info">
                    <span class="ym-label">💡 Есть идея или пожелание?</span>
                    <span class="ym-desc">Предложите новую функцию или улучшение создателю мода</span>
                  </div>
                  <button class="ym-btn-action" id="ym-btn-open-proposal" style="background:#ff2d3c;color:#fff;font-weight:700;">
                    Предложить идею
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    `;



    // v1.3.2: Admin creator tab injection
    if (isCurrentUserAdmin()) {
      const tabsContainer = backdrop.querySelector(".ym-modal-tabs");
      const contentContainer = backdrop.querySelector(".ym-modal-content");
      if (tabsContainer && contentContainer) {
        const adminBtn = document.createElement("button");
        adminBtn.className = "ym-tab-btn";
        adminBtn.setAttribute("data-tab", "tab-admin");
        adminBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#ff2d3c" style="filter:drop-shadow(0 0 6px rgba(255,45,60,0.8));vertical-align:middle;margin-right:6px;"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
          <span>Панель Создателя</span>
        `;
        tabsContainer.appendChild(adminBtn);

        const adminPane = document.createElement("div");
        adminPane.className = "ym-tab-pane";
        adminPane.id = "tab-admin";
        adminPane.innerHTML = `
          <div class="ym-card">
            <div class="ym-card-title" style="color:#ff2d3c;display:flex;align-items:center;gap:8px;"><svg viewBox="0 0 24 24" width="20" height="20" fill="#ff2d3c" style="filter:drop-shadow(0 0 8px rgba(255,45,60,0.8));"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg><span>Панель Создателя мода</span></div>
            <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:0 0 14px 0;">
              Привет, Алексей! Здесь отображаются предложения и идеи пользователей твоего мода.
            </p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span style="font-size:12px;color:rgba(255,255,255,0.6);">Входящие предложения (GitHub Issues):</span>
              <button class="ym-btn-action ym-btn-secondary" id="ym-btn-refresh-proposals" style="padding:4px 10px;font-size:12px;">🔄 Обновить</button>
            </div>
            <div id="ym-admin-proposals-container" style="max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;">
              <div style="text-align:center;color:rgba(255,255,255,0.4);padding:20px;">Загрузка предложений...</div>
            </div>
          </div>
        `;
        contentContainer.appendChild(adminPane);

        adminBtn.addEventListener("click", () => {
          loadAdminProposals();
        });

        setTimeout(() => {
          const btnRefresh = document.getElementById("ym-btn-refresh-proposals");
          if (btnRefresh) btnRefresh.addEventListener("click", loadAdminProposals);
        }, 100);
      }
    }

    // 5-click easter egg on mod logo in header to toggle Admin Mode
    let logoClicks = 0;
    let logoTimer = null;
    const modalLogo = backdrop.querySelector(".ym-modal-logo");
    if (modalLogo) {
      modalLogo.style.cursor = "pointer";
      modalLogo.title = "Версия v1.4.0";
      modalLogo.addEventListener("click", () => {
        logoClicks++;
        clearTimeout(logoTimer);
        logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);
        if (logoClicks >= 5) {
          logoClicks = 0;
          const cur = localStorage.getItem("ym_mod_is_admin") === "true";
          localStorage.setItem("ym_mod_is_admin", cur ? "false" : "true");
          showToast(cur ? "🔒 Режим создателя отключен" : "👑 Режим создателя активирован!");
          closeModSettings();
          setTimeout(showModSettingsModal, 300);
        }
      });
    }

    document.body.appendChild(backdrop);



    // Tab Switching

    const tabBtns = backdrop.querySelectorAll(".ym-tab-btn");

    const tabPanes = backdrop.querySelectorAll(".ym-tab-pane");



    tabBtns.forEach((btn) => {

      btn.addEventListener("click", () => {

        tabBtns.forEach((b) => b.classList.remove("active"));

        tabPanes.forEach((p) => p.classList.remove("active"));

        btn.classList.add("active");

        const targetId = btn.getAttribute("data-tab");

        const targetPane = document.getElementById(targetId);

        if (targetPane) targetPane.classList.add("active");

      });

    });



    // Close handlers

    const closeBtn = document.getElementById("ym-mod-close-btn");

    if (closeBtn) closeBtn.addEventListener("click", closeModSettings);



    backdrop.addEventListener("click", (e) => {

      if (e.target === backdrop) closeModSettings();

    });



    // Option Binds

    const optDesignMode = document.getElementById("opt-design-mode");

    const optGlassBlur = document.getElementById("opt-glass-blur");

    const optCardHover = document.getElementById("opt-card-hover");

    const optPlayerGlow = document.getElementById("opt-player-glow");

    const optGlowProgress = document.getElementById("opt-glow-progress");

    const optSmoothTransitions = document.getElementById("opt-smooth-transitions");

    const optDisableVibe = document.getElementById("opt-disable-vibe");

    

    const optFontEnabled = document.getElementById("opt-font-enabled");

    const optFontEffects = document.getElementById("opt-font-effects");
    if (optFontEffects) {
      optFontEffects.checked = modSettings["typography/fontEffects"] !== false;
      optFontEffects.addEventListener("change", () => {
        saveSetting("typography/fontEffects", optFontEffects.checked);
        applyFont(optFontFamily ? optFontFamily.value : "Terraria", optFontEnabled ? optFontEnabled.checked : true);
        showToast(optFontEffects.checked ? "Эффекты шрифта включены" : "Эффекты шрифта отключены");
      });
    }

    const optFontSize = document.getElementById("opt-font-size");
    const valFontSize = document.getElementById("ym-font-size-val");
    if (optFontSize) {
      const curSize = Math.round((parseFloat(modSettings["font-changer/sizeScale"]) || 1.0) * 100);
      optFontSize.value = curSize;
      if (valFontSize) valFontSize.textContent = `${curSize}%`;
      optFontSize.addEventListener("input", () => {
        const v = parseInt(optFontSize.value, 10) / 100;
        if (valFontSize) valFontSize.textContent = `${optFontSize.value}%`;
        saveSetting("font-changer/sizeScale", v);
        applyFont(optFontFamily ? optFontFamily.value : "Terraria", optFontEnabled ? optFontEnabled.checked : true);
      });
    }

    const optModalFontSize = document.getElementById("opt-modal-font-size");
    const valModalFontSize = document.getElementById("ym-modal-font-size-val");
    if (optModalFontSize) {
      const curModalSize = Math.round((parseFloat(modSettings["font-changer/modalSizeScale"]) || 1.0) * 100);
      optModalFontSize.value = curModalSize;
      if (valModalFontSize) valModalFontSize.textContent = `${curModalSize}%`;
      optModalFontSize.addEventListener("input", () => {
        const v = parseInt(optModalFontSize.value, 10) / 100;
        if (valModalFontSize) valModalFontSize.textContent = `${optModalFontSize.value}%`;
        saveSetting("font-changer/modalSizeScale", v);
        applyFont(optFontFamily ? optFontFamily.value : "Terraria", optFontEnabled ? optFontEnabled.checked : true);
      });
    }

    const optFontFamily = document.getElementById("opt-font-family");

    const optFontCustom = document.getElementById("opt-font-custom");

    const previewBox = document.getElementById("font-preview-box");



    const optOverlayGhost = document.getElementById("opt-overlay-ghost");

    const optHudPureShadow = document.getElementById("opt-hud-pure-shadow");

    const optHudShowLyrics = document.getElementById("opt-hud-show-lyrics");



    const optDiscordRpc = document.getElementById("opt-discord-rpc");
    const optDiscordAppTitle = document.getElementById("opt-discord-app-title");
    const optDiscordActivityType = document.getElementById("opt-discord-activity-type");
    const optDiscordTimeFormat = document.getElementById("opt-discord-time-format");
    const optDiscordModButton = document.getElementById("opt-discord-mod-button");

    if (optDiscordActivityType) {
      optDiscordActivityType.value = modSettings["discordRPC/activityType"] || "listening";
      optDiscordActivityType.addEventListener("change", () => {
        saveSetting("discordRPC/activityType", optDiscordActivityType.value);
      });
    }

    if (optDiscordTimeFormat) {
      optDiscordTimeFormat.value = modSettings["discordRPC/timeFormat"] || "progress";
      optDiscordTimeFormat.addEventListener("change", () => {
        saveSetting("discordRPC/timeFormat", optDiscordTimeFormat.value);
      });
    }

    if (optDiscordModButton) {
      optDiscordModButton.checked = modSettings["discordRPC/showModButton"] !== false;
      optDiscordModButton.addEventListener("change", () => {
        saveSetting("discordRPC/showModButton", optDiscordModButton.checked);
      });
    }

    // Live Wallpaper Workshop Binds
    try {
      const optWpEnable = document.getElementById("opt-wallpaper-enable");
      const optWpOpacity = document.getElementById("opt-wallpaper-opacity");
      const valWpOpacity = document.getElementById("val-wallpaper-opacity");
      const optWpBlur = document.getElementById("opt-wallpaper-blur");
      const valWpBlur = document.getElementById("val-wallpaper-blur");
      const optWpPause = document.getElementById("opt-wallpaper-pause");
      const optWpCustomUrl = document.getElementById("opt-wallpaper-custom-url");
      const btnApplyCustom = document.getElementById("btn-apply-custom-wallpaper");
      const btnResetWp = document.getElementById("btn-reset-wallpaper");
      const btnRefreshWp = document.getElementById("btn-refresh-wallpapers");

      if (optWpEnable) {
        optWpEnable.checked = !!modSettings["wallpaper/enabled"];
        optWpEnable.addEventListener("change", () => {
          saveSetting("wallpaper/enabled", optWpEnable.checked);
          applyLiveWallpaperSettings();
        });
      }

      if (optWpOpacity && valWpOpacity) {
        optWpOpacity.value = modSettings["wallpaper/opacity"] !== undefined ? modSettings["wallpaper/opacity"] : 55;
        valWpOpacity.textContent = `${optWpOpacity.value}%`;
        optWpOpacity.addEventListener("input", () => {
          valWpOpacity.textContent = `${optWpOpacity.value}%`;
          saveSetting("wallpaper/opacity", parseInt(optWpOpacity.value, 10));
          applyLiveWallpaperSettings();
        });
      }

      if (optWpBlur && valWpBlur) {
        optWpBlur.value = modSettings["wallpaper/blur"] !== undefined ? modSettings["wallpaper/blur"] : 0;
        valWpBlur.textContent = `${optWpBlur.value}px`;
        optWpBlur.addEventListener("input", () => {
          valWpBlur.textContent = `${optWpBlur.value}px`;
          saveSetting("wallpaper/blur", parseInt(optWpBlur.value, 10));
          applyLiveWallpaperSettings();
        });
      }

      if (optWpPause) {
        optWpPause.checked = modSettings["wallpaper/pauseOnBlur"] !== false;
        optWpPause.addEventListener("change", () => {
          saveSetting("wallpaper/pauseOnBlur", optWpPause.checked);
          applyLiveWallpaperSettings();
        });
      }

      if (btnApplyCustom && optWpCustomUrl) {
        btnApplyCustom.addEventListener("click", () => {
          const rawUrl = optWpCustomUrl.value.trim();
          if (!rawUrl) return;
          const isVid = /\.(mp4|webm|m4v)($|\?)/i.test(rawUrl);
          saveSetting("wallpaper/enabled", true);
          saveSetting("wallpaper/source", "custom");
          saveSetting("wallpaper/type", isVid ? "video" : "image");
          saveSetting("wallpaper/url", rawUrl);
          if (optWpEnable) optWpEnable.checked = true;
          applyLiveWallpaperSettings();
          renderWallpaperGrid();
        });
      }

      if (btnResetWp) {
        btnResetWp.addEventListener("click", () => {
          saveSetting("wallpaper/enabled", false);
          saveSetting("wallpaper/source", "synthwave");
          saveSetting("wallpaper/type", "video");
          saveSetting("wallpaper/url", "");
          if (optWpEnable) optWpEnable.checked = false;
          applyLiveWallpaperSettings();
          renderWallpaperGrid();
        });
      }

      if (btnRefreshWp) {
        btnRefreshWp.addEventListener("click", () => {
          renderWallpaperGrid();
        });
      }

      const btnOpenVSThemes = document.getElementById("btn-open-vsthemes");
      if (btnOpenVSThemes) {
        btnOpenVSThemes.addEventListener("click", () => {
          if (window.yandexMusicMod && window.yandexMusicMod.openVSThemes) {
            window.yandexMusicMod.openVSThemes();
          }
        });
      }

      const btnUploadLocalWp = document.getElementById("btn-upload-local-wp");
      if (btnUploadLocalWp) {
        btnUploadLocalWp.addEventListener("click", async () => {
          if (window.yandexMusicMod && window.yandexMusicMod.selectWallpaperFile) {
            const filePath = await window.yandexMusicMod.selectWallpaperFile();
            if (filePath) {
              const isVid = /\.(mp4|webm)$/i.test(filePath);
              saveSetting("wallpaper/enabled", true);
              saveSetting("wallpaper/source", filePath);
              saveSetting("wallpaper/type", isVid ? "video" : "image");
              saveSetting("wallpaper/url", filePath);

              const enableSwitch = document.getElementById("opt-wallpaper-enable");
              if (enableSwitch) enableSwitch.checked = true;

              applyLiveWallpaperSettings();
              showNotification(`Живые обои установлены с диска!`, "success");
              renderWallpaperGrid("downloaded");
            }
          }
        });
      }

      renderWallpaperGrid();

    // Wallpaper Drag & Drop Support
    if (!window.__ymWallpaperDndInstalled) {
      window.__ymWallpaperDndInstalled = true;
      document.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      document.addEventListener("drop", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        const fileName = file.name || "";
        const filePath = file.path;
        if (filePath && /\.(mp4|webm|gif|zip)$/i.test(fileName)) {
          if (window.yandexMusicMod && window.yandexMusicMod.importWallpaperFile) {
            const importedPath = await window.yandexMusicMod.importWallpaperFile(filePath);
            if (importedPath) {
              const isVid = /\.(mp4|webm)$/i.test(importedPath);
              saveSetting("wallpaper/enabled", true);
              saveSetting("wallpaper/source", importedPath);
              saveSetting("wallpaper/type", isVid ? "video" : "image");
              saveSetting("wallpaper/url", importedPath);

              const enableSwitch = document.getElementById("opt-wallpaper-enable");
              if (enableSwitch) enableSwitch.checked = true;

              applyLiveWallpaperSettings();
              showNotification(`Живые обои «${fileName}» добавлены и применены!`, "success");
              renderWallpaperGrid();
            }
          }
        }
      });
    }
    } catch (errWp) {
      console.error("[Mod Settings] Error binding wallpaper controls:", errWp);
    }

    // Custom Neon Top Trackbar Binds
    try {
      const optTbTop = document.getElementById("opt-trackbar-top");
      const optTbThickness = document.getElementById("opt-trackbar-thickness");
      const optTbHideDef = document.getElementById("opt-trackbar-hide-default");
      const optTbColorPick = document.getElementById("opt-trackbar-custom-color");
      const paletteWrap = document.getElementById("trackbar-palette");

      if (optTbTop) {
        optTbTop.checked = modSettings["trackbar/topBarEnabled"] !== false;
        optTbTop.addEventListener("change", () => {
          saveSetting("trackbar/topBarEnabled", optTbTop.checked);
          applyTrackbarStyle();
        });
      }

      if (optTbThickness) {
        optTbThickness.value = modSettings["trackbar/thickness"] || "3px";
        optTbThickness.addEventListener("change", () => {
          saveSetting("trackbar/thickness", optTbThickness.value);
          applyTrackbarStyle();
        });
      }

      if (optTbHideDef) {
        optTbHideDef.checked = !!modSettings["trackbar/hideDefaultSlider"];
        optTbHideDef.addEventListener("change", () => {
          saveSetting("trackbar/hideDefaultSlider", optTbHideDef.checked);
          applyTrackbarStyle();
        });
      }

      const curTbColor = modSettings["trackbar/color"] || "#ffe600";
      if (optTbColorPick) {
        optTbColorPick.value = curTbColor;
        optTbColorPick.addEventListener("input", () => {
          saveSetting("trackbar/color", optTbColorPick.value);
          applyTrackbarStyle();
          if (paletteWrap) {
            paletteWrap.querySelectorAll(".ym-color-swatch").forEach(s => s.classList.remove("active"));
          }
        });
      }

      if (paletteWrap) {
        paletteWrap.querySelectorAll(".ym-color-swatch").forEach(swatch => {
          const swatchCol = swatch.getAttribute("data-color");
          if (swatchCol === curTbColor) swatch.classList.add("active");
          else swatch.classList.remove("active");

          swatch.addEventListener("click", () => {
            paletteWrap.querySelectorAll(".ym-color-swatch").forEach(s => s.classList.remove("active"));
            swatch.classList.add("active");
            saveSetting("trackbar/color", swatchCol);
            if (optTbColorPick) optTbColorPick.value = swatchCol;
            applyTrackbarStyle();
          });
        });
      }
    } catch (errTb) {
      console.error("[Mod Settings] Error binding trackbar controls:", errTb);
    }
    if (optDiscordAppTitle) {
      optDiscordAppTitle.value = modSettings["discordRPC/appTitle"] || "ru";
      optDiscordAppTitle.addEventListener("change", () => {
        saveSetting("discordRPC/appTitle", optDiscordAppTitle.value);
        showToast("Discord RPC: " + (optDiscordAppTitle.value === "en" ? "Yandex Music" : "Яндекс Музыка"));
      });
    }

    const btnOpenProposal = document.getElementById("ym-btn-open-proposal");
    if (btnOpenProposal) {
      btnOpenProposal.addEventListener("click", openProposalModal);
    }

    const optBlockAppUpdates = document.getElementById("opt-block-app-updates");
    const optAutoQuality = document.getElementById("opt-auto-quality");

    const optUiScale = document.getElementById("opt-ui-scale");



    // Cleaner binds

    const optCleanerConcerts = document.getElementById("opt-cleaner-concerts");

    const optCleanerKids = document.getElementById("opt-cleaner-kids");

    const optCleanerPodcasts = document.getElementById("opt-cleaner-podcasts");

    const optCleanerTrends = document.getElementById("opt-cleaner-trends");

    const optCleanerRadio = document.getElementById("opt-cleaner-radio");

    const optCleanerBanners = document.getElementById("opt-cleaner-banners");

    const optCleanerMobile = document.getElementById("opt-cleaner-mobile");

    const optCleanerDonates = document.getElementById("opt-cleaner-donates");

    const optCleanerTickets = document.getElementById("opt-cleaner-tickets");

    const optCleanerTrailers = document.getElementById("opt-cleaner-trailers");

    const optCleanerDislike = document.getElementById("opt-cleaner-dislike");

    const optCleanerQueue = document.getElementById("opt-cleaner-queue");

    const optCleanerFullscreen = document.getElementById("opt-cleaner-fullscreen");

    const optCleanerQuality = document.getElementById("opt-cleaner-quality");

    const optCleanerPrev = document.getElementById("opt-cleaner-prev");

    const optCleanerLyrics = document.getElementById("opt-cleaner-lyrics");



    // Populate initial values safely

    if (optDesignMode) optDesignMode.value = modSettings["design/mode"] || "modern";

    if (optGlassBlur) optGlassBlur.value = modSettings["design/glassBlur"] || "medium";

    if (optCardHover) optCardHover.checked = modSettings["design/cardHoverFx"] !== false;

    if (optPlayerGlow) optPlayerGlow.checked = modSettings["design/playerGlow"] !== false;

    if (optGlowProgress) optGlowProgress.checked = modSettings["design/glowProgress"] !== false;

    if (optSmoothTransitions) optSmoothTransitions.checked = modSettings["design/smoothTransitions"] !== false;

    if (optDisableVibe) optDisableVibe.checked = !!modSettings["custom-themes/disableVibeAnimation"];



    if (optFontEnabled) optFontEnabled.checked = modSettings["font-changer/enabled"] !== false;

    if (optFontFamily) {

      optFontFamily.value = modSettings["font-changer/savedFont"] || "Terraria";

      if (previewBox) {

        previewBox.style.fontFamily = `"${optFontFamily.value}", sans-serif`;

      }

    }



    if (optOverlayGhost) optOverlayGhost.checked = !!modSettings["overlay/clickThrough"];

    if (optHudPureShadow) optHudPureShadow.checked = modSettings["overlay/pureShadow"] !== false;

    if (optHudShowLyrics) optHudShowLyrics.checked = modSettings["overlay/showLyrics"] !== false;



    if (optDiscordRpc) optDiscordRpc.checked = modSettings["discordRPC/enabled"] !== false;

    if (optBlockAppUpdates) optBlockAppUpdates.checked = modSettings["system/blockAppUpdates"] !== false;
    if (optAutoQuality) optAutoQuality.checked = modSettings["autoQuality/enabled"] !== false;

    if (optUiScale) optUiScale.value = String(modSettings["scale-changer/savedScale"] || "1.0");



    // Cleaner values

    if (optCleanerConcerts) optCleanerConcerts.checked = !!modSettings["cleaner/hideConcerts"];

    if (optCleanerKids) optCleanerKids.checked = !!modSettings["cleaner/hideKids"];

    if (optCleanerPodcasts) optCleanerPodcasts.checked = !!modSettings["cleaner/hidePodcasts"];

    if (optCleanerTrends) optCleanerTrends.checked = !!modSettings["cleaner/hideTrends"];

    if (optCleanerRadio) optCleanerRadio.checked = !!modSettings["cleaner/hideRadio"];

    if (optCleanerBanners) optCleanerBanners.checked = modSettings["cleaner/hideBanners"] !== false;

    if (optCleanerMobile) optCleanerMobile.checked = modSettings["cleaner/hideMobileApp"] !== false;

    if (optCleanerDonates) optCleanerDonates.checked = !!modSettings["cleaner/hideDonates"];

    if (optCleanerTickets) optCleanerTickets.checked = !!modSettings["cleaner/hideTickets"];

    if (optCleanerTrailers) optCleanerTrailers.checked = !!modSettings["cleaner/hideTrailers"];

    if (optCleanerDislike) optCleanerDislike.checked = !!modSettings["cleaner/hideDislike"];

    if (optCleanerQueue) optCleanerQueue.checked = !!modSettings["cleaner/hideQueue"];

    if (optCleanerFullscreen) optCleanerFullscreen.checked = !!modSettings["cleaner/hideFullscreen"];

    if (optCleanerQuality) optCleanerQuality.checked = !!modSettings["cleaner/hideQuality"];

    if (optCleanerPrev) optCleanerPrev.checked = !!modSettings["cleaner/hidePrev"];

    if (optCleanerLyrics) optCleanerLyrics.checked = !!modSettings["cleaner/hideLyrics"];



    // Palette swatches

    const swatches = document.querySelectorAll(".ym-color-swatch");

    const customColor = document.getElementById("opt-custom-color");

    const currentAccent = modSettings["custom-themes/accent"] || "#007acc";



    swatches.forEach((s) => {

      if (s.getAttribute("data-color") === currentAccent) s.classList.add("active");

      s.addEventListener("click", () => {

        swatches.forEach((sw) => sw.classList.remove("active"));

        s.classList.add("active");

        const color = s.getAttribute("data-color");

        saveSetting("custom-themes/accent", color);

        applyTheme(color, true);

        showToast(`Акцент: ${color}`);

      });

    });



    if (customColor) {

      customColor.value = currentAccent;

      customColor.addEventListener("change", () => {

        swatches.forEach((sw) => sw.classList.remove("active"));

        saveSetting("custom-themes/accent", customColor.value);

        applyTheme(customColor.value, true);

        showToast(`Цвет: ${customColor.value}`);

      });

    }



    // Change listeners safely

    if (optDesignMode) {

      optDesignMode.addEventListener("change", () => {

        saveSetting("design/mode", optDesignMode.value);

        showToast("Стиль оформления обновлен", true);

      });

    }



    if (optDisableVibe) {

      optDisableVibe.addEventListener("change", () => {

        saveSetting("custom-themes/disableVibeAnimation", optDisableVibe.checked);

        applyTheme(modSettings["custom-themes/accent"] || "#007acc", true);

      });

    }



    if (optGlassBlur) {

      optGlassBlur.addEventListener("change", () => {

        saveSetting("design/glassBlur", optGlassBlur.value);

        applyTheme(modSettings["custom-themes/accent"] || "#8b5cf6", true);

        showToast("Интенсивность матового стекла обновлена");

      });

    }



    if (optCardHover) {

      optCardHover.addEventListener("change", () => {

        saveSetting("design/cardHoverFx", optCardHover.checked);

        applyTheme(modSettings["custom-themes/accent"] || "#8b5cf6", true);

      });

    }



    if (optPlayerGlow) {

      optPlayerGlow.addEventListener("change", () => {

        saveSetting("design/playerGlow", optPlayerGlow.checked);

        applyTheme(modSettings["custom-themes/accent"] || "#8b5cf6", true);

      });

    }



    if (optGlowProgress) {

      optGlowProgress.addEventListener("change", () => {

        saveSetting("design/glowProgress", optGlowProgress.checked);

        applyTheme(modSettings["custom-themes/accent"] || "#8b5cf6", true);

      });

    }



    if (optSmoothTransitions) {

      optSmoothTransitions.addEventListener("change", () => {

        saveSetting("design/smoothTransitions", optSmoothTransitions.checked);

        applyTheme(modSettings["custom-themes/accent"] || "#8b5cf6", true);

      });

    }



    if (optHudPureShadow) {

      optHudPureShadow.addEventListener("change", () => {

        saveSetting("overlay/pureShadow", optHudPureShadow.checked);

        showToast(optHudPureShadow.checked ? "Чистые тени HUD включены" : "Чистые тени HUD выключены");

      });

    }



    if (optHudShowLyrics) {

      optHudShowLyrics.addEventListener("change", () => {

        saveSetting("overlay/showLyrics", optHudShowLyrics.checked);

      });

    }



    // UI Cleaner listeners

    const cleanerBinds = [

      { el: optCleanerConcerts, key: "cleaner/hideConcerts" },

      { el: optCleanerKids, key: "cleaner/hideKids" },

      { el: optCleanerPodcasts, key: "cleaner/hidePodcasts" },

      { el: optCleanerTrends, key: "cleaner/hideTrends" },

      { el: optCleanerRadio, key: "cleaner/hideRadio" },

      { el: optCleanerBanners, key: "cleaner/hideBanners" },

      { el: optCleanerMobile, key: "cleaner/hideMobileApp" },

      { el: optCleanerDonates, key: "cleaner/hideDonates" },

      { el: optCleanerTickets, key: "cleaner/hideTickets" },

      { el: optCleanerTrailers, key: "cleaner/hideTrailers" },

      { el: optCleanerDislike, key: "cleaner/hideDislike" },

      { el: optCleanerQueue, key: "cleaner/hideQueue" },

      { el: optCleanerFullscreen, key: "cleaner/hideFullscreen" },

      { el: optCleanerQuality, key: "cleaner/hideQuality" },

      { el: optCleanerPrev, key: "cleaner/hidePrev" },

      { el: optCleanerLyrics, key: "cleaner/hideLyrics" }

    ];



    cleanerBinds.forEach(({ el, key }) => {

      if (el) {

        el.addEventListener("change", () => {

          saveSetting(key, el.checked);

          applyUiCleaner();

        });

      }

    });



    if (optFontEnabled) {

      optFontEnabled.addEventListener("change", () => {

        saveSetting("font-changer/enabled", optFontEnabled.checked);

        const curFont = optFontFamily ? optFontFamily.value : "Terraria";

        applyFont(curFont, optFontEnabled.checked);

      });

    }



    if (optFontFamily) {

      optFontFamily.addEventListener("change", () => {

        saveSetting("font-changer/savedFont", optFontFamily.value);

        applyFont(optFontFamily.value, optFontEnabled ? optFontEnabled.checked : true);

        if (previewBox) {

          previewBox.style.fontFamily = `"${optFontFamily.value}", sans-serif`;

        }

        showToast(`Шрифт: ${optFontFamily.value}`);

      });

    }



    if (optFontCustom) {

      optFontCustom.addEventListener("change", () => {

        const sanitizedFont = optFontCustom.value.replace(/["'{}<>;\\]/g, "").trim();

        if (sanitizedFont) {

          saveSetting("font-changer/savedFont", sanitizedFont);

          applyFont(sanitizedFont, true);

          if (previewBox) {

            previewBox.style.fontFamily = `"${sanitizedFont}", sans-serif`;

          }

          showToast(`Шрифт: ${sanitizedFont}`);

        }

      });

    }



    if (optOverlayGhost) {

      optOverlayGhost.addEventListener("change", () => {

        saveSetting("overlay/clickThrough", optOverlayGhost.checked);

        if (window.yandexMusicMod && window.yandexMusicMod.setOverlayClickThrough) {

          window.yandexMusicMod.setOverlayClickThrough(optOverlayGhost.checked);

        }

      });

    }



    if (optDiscordRpc) {

      optDiscordRpc.addEventListener("change", () => {

        saveSetting("discordRPC/enabled", optDiscordRpc.checked);

      });

    }



    if (optBlockAppUpdates) {
      optBlockAppUpdates.addEventListener("change", () => {
        saveSetting("system/blockAppUpdates", optBlockAppUpdates.checked);
        if (optBlockAppUpdates.checked) {
          removeOfficialUpdateBanners();
          showToast("🛡️ Защита от обновлений включена");
        } else {
          showToast("⚠️ Защита от обновлений отключена");
        }
      });
    }

    if (optAutoQuality) {

      optAutoQuality.addEventListener("change", () => {

        saveSetting("autoQuality/enabled", optAutoQuality.checked);

        applyAutoQuality();

        showToast(optAutoQuality.checked ? "Авто-качество включено" : "Авто-качество выключено");

      });

    }



    if (optUiScale) {

      optUiScale.addEventListener("change", () => {

        const scaleVal = parseFloat(optUiScale.value) || 1.0;

        saveSetting("scale-changer/savedScale", scaleVal);

        applyScale(scaleVal);

        showToast(`Масштаб: ${Math.round(scaleVal * 100)}%`);

      });

    }



    // Action Buttons

    document.getElementById("btn-reload-plus")?.addEventListener("click", () => {

      window.location.reload();

    });



    document.getElementById("btn-open-overlay")?.addEventListener("click", () => {

      if (window.yandexMusicMod) window.yandexMusicMod.toggleOverlay();

    });



    document.getElementById("btn-open-karaoke")?.addEventListener("click", () => {

      if (window.yandexMusicMod) window.yandexMusicMod.toggleKaraoke();

    });



    document.getElementById("btn-open-devtools")?.addEventListener("click", () => {

      if (window.yandexMusicMod) window.yandexMusicMod.openDevTools();

    });

  }



  function saveSetting(key, value) {

    modSettings[key] = value;

    if (window.yandexMusicMod && window.yandexMusicMod.setStorageValue) {

      window.yandexMusicMod.setStorageValue(key, value);

    }

  }



  // ==========================================

  // SIDEBAR BUTTON & HOTKEYS

  // ==========================================

  // ==========================================

  // SIDEBAR BUTTON & FLOATING BADGE & HOTKEYS

  // ==========================================

  function openModSettings() {
    let backdrop = document.getElementById("ym-mod-modal-backdrop");
    if (!backdrop) {
      try { injectModUI(); } catch (e) {}
      backdrop = document.getElementById("ym-mod-modal-backdrop");
    }
    if (backdrop) {
      backdrop.classList.add("open");
      const optWpEnable = document.getElementById("opt-wallpaper-enable");
      if (optWpEnable) optWpEnable.checked = !!modSettings["wallpaper/enabled"];
    }
  }

  function closeModSettings() {
    const backdrop = document.getElementById("ym-mod-modal-backdrop");
    if (backdrop) {
      backdrop.classList.remove("open");
    }
  }

  function toggleModSettings() {
    let backdrop = document.getElementById("ym-mod-modal-backdrop");
    if (!backdrop) {
      try { injectModUI(); } catch (e) {}
      backdrop = document.getElementById("ym-mod-modal-backdrop");
    }
    if (backdrop) {
      if (backdrop.classList.contains("open")) {
        closeModSettings();
      } else {
        openModSettings();
      }
    }
  }

  function injectFloatingBadge() {

    if (document.getElementById("ym-mod-floating-trigger")) return;



    const floatBtn = document.createElement("button");

    floatBtn.id = "ym-mod-floating-trigger";

    floatBtn.className = "ym-mod-floating-trigger";

    floatBtn.setAttribute("title", "Настройки мода (Ctrl+Shift+S / Ctrl+, / F10)");

    floatBtn.innerHTML = `

      <img src="${MOD_LOGO_ICON_B64}" class="ym-float-icon-img" width="22" height="22" alt="Logo"/>

      <span class="ym-float-text">Настройки Мода</span>

    `;



    floatBtn.addEventListener("click", (e) => {

      e.preventDefault();

      e.stopPropagation();

      toggleModSettings();

    });



    document.body.appendChild(floatBtn);

  }



  function injectSidebarButton() {

    injectFloatingBadge();



    const containerId = "ym-mod-sidebar-container";

    let container = document.getElementById(containerId);



    const targetSelector = 'div[class*="NavbarDesktopUserWidget_userProfileContainer"], aside [data-test-id="USER_PROFILE"], aside [data-test-id="USER_PROFILE_AVATAR_CONTAINER"]';

    const targetElement = document.querySelector(targetSelector);



    if (targetElement && targetElement.parentNode) {

      if (!container) {

        container = document.createElement("div");

        container.id = containerId;

        container.className = "ym-mod-sidebar-container";



        const btn = document.createElement("button");

        btn.id = "ym-mod-menu-btn";

        btn.className = "ym-mod-menu-btn";

        btn.setAttribute("title", "Настройки мода (Ctrl+Shift+S / F10)");

        btn.innerHTML = `

          <div class="ym-mod-icon-wrapper">

            <img src="${MOD_LOGO_ICON_B64}" class="ym-mod-custom-logo" width="28" height="28" alt="Logo"/>

          </div>

          <span class="ym-mod-btn-text">Настройки Мода</span>

          <span class="ym-mod-ver-tag">v1.4.0</span>

        `;

        btn.addEventListener("click", (e) => {

          e.preventDefault();

          e.stopPropagation();

          toggleModSettings();

        });



        container.appendChild(btn);

        targetElement.parentNode.insertBefore(container, targetElement);



        // Sidebar collapse observer

        const aside = targetElement.closest("aside") || document.querySelector("aside");

        if (aside && typeof ResizeObserver !== "undefined") {

          const checkCollapsed = () => {

            if (aside.offsetWidth < 120) {

              container.classList.add("ym-sidebar-collapsed");

            } else {

              container.classList.remove("ym-sidebar-collapsed");

            }

          };

          const ro = new ResizeObserver(checkCollapsed);

          ro.observe(aside);

          checkCollapsed();

        }

      }

      const floatBtn = document.getElementById("ym-mod-floating-trigger");

      if (floatBtn) floatBtn.style.display = "none";

    } else {

      // Fallback: Navbar list item

      const navItem = document.querySelector('[data-test-id="NAVBAR_NAVIGATION_ITEM_COLLECTION"]') ||

                      document.querySelector('[data-test-id="NAVBAR_NAVIGATION_ITEM_HOME"]');

      if (navItem && !document.getElementById("ym-mod-menu-btn")) {

        const parentLi = navItem.closest("li");

        if (parentLi && parentLi.parentNode) {

          const li = document.createElement("li");

          li.id = "ym-mod-nav-item";

          li.className = parentLi.className || "";

          li.style.cssText = "list-style: none; margin: 4px 12px; padding: 0;";



          const btn = document.createElement("button");

          btn.id = "ym-mod-menu-btn";

          btn.className = "ym-mod-menu-btn";

          btn.innerHTML = `

            <span class="ym-mod-btn-icon">⚡</span>

            <span class="ym-mod-btn-text">Мод</span>

            <span class="ym-mod-badge">Menu</span>

          `;

          btn.addEventListener("click", (e) => {

            e.preventDefault();

            e.stopPropagation();

            toggleModSettings();

          });



          li.appendChild(btn);

          parentLi.parentNode.insertBefore(li, parentLi.nextSibling);

        }

      }

    }

  }



  // Global Hotkeys for opening settings: Ctrl+Shift+S, Ctrl+, F10 and Escape

  window.addEventListener("keydown", (e) => {

    const isCtrlShiftS = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "S" || e.key === "s" || e.code === "KeyS");

    const isCtrlComma = (e.ctrlKey || e.metaKey) && (e.key === "," || e.code === "Comma");

    const isF10 = e.key === "F10" || e.code === "F10";

    if (isCtrlShiftS || isCtrlComma || isF10) {

      e.preventDefault();

      toggleModSettings();

    }

    if (e.key === "Escape") {

      closeModSettings();

    }

  });



  // Listen for openModSettings IPC from main process

  if (window.yandexMusicMod && window.yandexMusicMod.onOpenSettings) {

    window.yandexMusicMod.onOpenSettings(() => openModSettings());

  }





  // ==========================================

  // 7. PLAYER OBSERVATION & REMOTE CONTROL

  // ==========================================

  let lastTrackId = null;



  function parseTimecode(text) {

    if (!text || typeof text !== "string") return 0;

    const parts = text.trim().split(":").map((p) => parseInt(p, 10));

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {

      return parts[0] * 60 + parts[1];

    }

    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {

      return parts[0] * 3600 + parts[1] * 60 + parts[2];

    }

    return 0;

  }



  // v1.3.7: Bulletproof cover URL normalizer (handles custom protocols, avatars, sizes)
  function normalizeCoverUrl(url) {
    if (!url || typeof url !== "string") return "";
    let clean = url.trim();
    if (!clean) return "";
    clean = clean.replace(/^music-application:\/\/?/i, "");
    clean = clean.replace(/^(?:https?:\/\/)+/i, "");
    clean = clean.replace(/^\/\//, "");
    clean = clean.replace("%%", "400x400");
    clean = clean.replace(/\/(?:50x50|100x100|200x200)\b/, "/400x400");
    return "https://" + clean;
  }

  function scrapeCurrentPlayerState() {

    let title = "";

    let artists = "";

    let coverUrl = "";

    let trackId = "";

    let duration = 0;

    let position = 0;

    let liked = false;
    let disliked = false;

    let isPlaying = false;

    let rawMeta = null;



    // 1. MediaSession API (Authoritative source across all views)

    if (navigator.mediaSession) {

      if (navigator.mediaSession.metadata) {

        const m = navigator.mediaSession.metadata;

        if (m.title) title = String(m.title).trim();

        if (m.artist) artists = String(m.artist).trim();

        if (m.artwork && m.artwork.length > 0) {

          coverUrl = normalizeCoverUrl(m.artwork[m.artwork.length - 1].src);

        }

      }

      if (navigator.mediaSession.playbackState) {

        if (navigator.mediaSession.playbackState === "playing") isPlaying = true;

        else if (navigator.mediaSession.playbackState === "paused") isPlaying = false;

      }

    }



    // 2. Audio Elements (Precise position, duration, and playing state)
    let activeAudio = null;
    const isRealAudio = (el) => {
      if (!el) return false;
      if (el.id === "ym-live-wallpaper-video") return false;
      if (el.tagName && el.tagName.toLowerCase() === "video") return false;
      return true;
    };
    if (typeof window.__ymGetActiveAudio === "function") {
      const a = window.__ymGetActiveAudio();
      if (a && isRealAudio(a)) activeAudio = a;
    }
    if (!activeAudio) {
      try {
        const audios = Array.from(document.querySelectorAll("audio")).filter(isRealAudio);
        activeAudio = audios.find((a) => !a.paused) || audios[0];
      } catch(e) {}
    }
    if (activeAudio) {
      if (!isPlaying) isPlaying = !activeAudio.paused;
      if (activeAudio.currentTime !== undefined && !isNaN(activeAudio.currentTime)) {
        position = activeAudio.currentTime; // sub-second float precision for 60fps lyrics
      }
      if (activeAudio.duration && !isNaN(activeAudio.duration) && activeAudio.duration > 0) {
        duration = activeAudio.duration;
      }
    }



    // 3. React Fiber Inspection on all candidate containers

    const containers = [

      document.querySelector('div[data-test-id="FULLSCREEN_PLAYER_MODAL"]'),

      document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]'),

      document.querySelector('div[data-test-id="VIBE_BLOCK"]'),

      document.querySelector('[data-test-id="VIBE_PLAYERBAR"]'),

      document.querySelector('[data-test-id="VIBE_PLAYERBAR_TRACK_NAME"]'),

      document.querySelector('[data-test-id="TRACK_TITLE"]'),

      document.querySelector('[data-test-id="VIBE_ALBUM_COVER"]'),

      document.querySelector('[data-test-id="PLAYERBAR_DESKTOP_COVER_CONTAINER"]'),

      window.sonataState ? { memoizedProps: { sonataState: window.sonataState } } : null

    ];



    for (const el of containers) {

      if (!el) continue;

      const sonata = extractSonataStateFromFiber(el);

      if (sonata && sonata.entityMeta) {

        rawMeta = sonata.entityMeta;

        if (!title && rawMeta.title) title = String(rawMeta.title).trim();

        if (!artists) {

          if (Array.isArray(rawMeta.artists)) {

            artists = rawMeta.artists.map((a) => (typeof a === "object" ? a.name : a)).join(", ");

          } else if (rawMeta.artists) {

            artists = String(rawMeta.artists).trim();

          }

        }

        if (!coverUrl) {

          if (rawMeta.coverUri) coverUrl = normalizeCoverUrl(rawMeta.coverUri);

          else if (rawMeta.ogImage) coverUrl = normalizeCoverUrl(rawMeta.ogImage);

        }

        if (rawMeta.id) trackId = String(rawMeta.id);

        if ((!duration || duration === 0) && rawMeta.durationMs) {

          duration = Math.floor(rawMeta.durationMs / 1000);

        }

        if ((!position || position === 0) && sonata.position !== undefined && typeof sonata.position === "number") {
          position = sonata.position;
        }

        if (sonata.duration !== undefined && typeof sonata.duration === "number" && (!duration || duration === 0)) {

          duration = Math.floor(sonata.duration);

        }

        if (sonata.isPlaying !== undefined) isPlaying = !!sonata.isPlaying;
        if (sonata.isLiked !== undefined) liked = !!sonata.isLiked;
        if (sonata.isGenerativeLiked !== undefined) liked = !!sonata.isGenerativeLiked;
        if (sonata.isDisliked !== undefined) disliked = !!sonata.isDisliked;
        if (sonata.isGenerativeDisliked !== undefined) disliked = !!sonata.isGenerativeDisliked;

        break;

      }

    }



    // 4. Vibe Mode DOM Fallbacks (Fullscreen Player Modal)

    const fullscreenModal = document.querySelector('div[data-test-id="FULLSCREEN_PLAYER_MODAL"], div[data-test-id="VIBE_BLOCK"]');

    if (fullscreenModal) {

      if (!title) {

        // Track title in vibe mode is often inside a centered pill button or prominent heading

        const titleCandidates = fullscreenModal.querySelectorAll('button[class*="SonataTrackInfo"] span, button[class*="TrackInfo"] span, [class*="TrackTitle"], [class*="title"], h2');

        for (const tc of titleCandidates) {

          const tText = (tc.textContent || "").trim();

          if (tText && !tText.includes("Моя волна") && !tText.includes("Очередь")) {

            title = tText;

            break;

          }

        }

      }

      if (!artists) {

        const artistCandidates = fullscreenModal.querySelectorAll('h1, [class*="Artist"], [class*="artist"], a[href*="/artist/"]');

        for (const ac of artistCandidates) {

          const aText = (ac.textContent || "").trim();

          if (aText && aText !== title && !aText.includes("Моя волна")) {

            artists = aText;

            break;

          }

        }

      }

      if (!coverUrl) {

        const coverImg = fullscreenModal.querySelector('img[src*="avatars.yandex.net"], [data-test-id="VIBE_ALBUM_COVER"] img, img');

        if (coverImg) {

          coverUrl = normalizeCoverUrl(coverImg.getAttribute("src") || coverImg.currentSrc || coverImg.src);

        }

      }

    }



    // 5. Desktop Playerbar DOM Fallbacks

    const desktopPlayer = document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]');

    if (desktopPlayer) {

      if (!title) {

        const titleEl = desktopPlayer.querySelector('[data-test-id="TRACK_TITLE"]');

        if (titleEl) title = (titleEl.getAttribute("title") || titleEl.textContent || "").trim();

      }

      if (!artists) {

        const artistEls = desktopPlayer.querySelectorAll('a[href*="/artist/"], [class*="description"] a');

        if (artistEls.length > 0) {

          artists = Array.from(artistEls).map((el) => el.textContent.trim()).filter(Boolean).join(", ");

        }

      }

      if (!coverUrl) {

        const candidateImgs = desktopPlayer.querySelectorAll(
          '[data-test-id="ENTITY_COVER_IMAGE"], [data-test-id="PLAYERBAR_DESKTOP_COVER_CONTAINER"] img, img[data-test-id*="COVER" i], img[class*="cover" i], img[class*="Cover" i], img[class*="avatar" i], img[src*="avatars.yandex.net"], img'
        );

        for (const img of candidateImgs) {
          const rawSrc = img.getAttribute("src") || img.currentSrc || img.src || "";
          const normalized = normalizeCoverUrl(rawSrc);
          if (normalized && (normalized.includes("avatars.yandex.net") || normalized.includes("music-content") || normalized.includes("get-music"))) {
            coverUrl = normalized;
            break;
          }
          if (!coverUrl && normalized && !normalized.includes("data:image") && !normalized.includes("favicon")) {
            coverUrl = normalized;
          }
        }

        if (!coverUrl) {
          const bgEls = desktopPlayer.querySelectorAll('[style*="background-image"]');
          for (const bgEl of bgEls) {
            const bgMatch = (bgEl.style.backgroundImage || "").match(/url\(["']?([^"']+)["']?\)/);
            if (bgMatch && bgMatch[1]) {
              coverUrl = normalizeCoverUrl(bgMatch[1]);
              break;
            }
          }
        }

      }

      // 5b. Page Global Cover Art Fallback
      if (!coverUrl) {
        const globalImg = document.querySelector('img[data-test-id="ENTITY_COVER_IMAGE"], img[src*="avatars.yandex.net/get-music-content"]');
        if (globalImg) {
          coverUrl = normalizeCoverUrl(globalImg.getAttribute("src") || globalImg.currentSrc || globalImg.src);
        }
      }

      if (!trackId) {

        const trackLink = desktopPlayer.querySelector('a[href*="/track/"]');

        if (trackLink) {

          const m = trackLink.href.match(/track\/(\d+)/);

          if (m) trackId = m[1];

        }

      }

    }



    // 6. Global Document Title Fallback

    if (!title && document.title && document.title.includes(" — ")) {

      const parts = document.title.split(" — ");

      if (parts.length >= 2 && !parts[0].includes("Яндекс Музыка")) {

        title = parts[0].trim();

        if (!artists && parts[1] && !parts[1].includes("Яндекс Музыка")) {

          artists = parts[1].trim();

        }

      }

    }



    // 7. Track ID fallback

    if (!trackId && title) {

      trackId = `${title}-${artists || "unknown"}`;

    }



    // 8. Like and Dislike status
    if (rawMeta) {
      if (typeof rawMeta.liked === "boolean") liked = rawMeta.liked;
      if (typeof rawMeta.isLiked === "boolean") liked = rawMeta.isLiked;
      if (typeof rawMeta.disliked === "boolean") disliked = rawMeta.disliked;
    }

    const activeLikeBtn = findActivePlayerLikeButton();
    if (activeLikeBtn && !isDislikeButton(activeLikeBtn) && isButtonActive(activeLikeBtn)) {
      liked = true;
      disliked = false;
    }

    const activeDislikeBtn = findActivePlayerDislikeButton();
    if (activeDislikeBtn && isDislikeButton(activeDislikeBtn) && isButtonActive(activeDislikeBtn)) {
      disliked = true;
      liked = false;
    }

    // 9. Volume extraction (Direct Sonata Context, Mod Volume & Audio Elements)
    let volume = typeof window.__ymCurrentVolume === "number" ? window.__ymCurrentVolume : 1.0;
    let muted = false;

    const sonata = findSonataPlayer();
    if (sonata) {
      const sVol = sonata.playbackState?.playerState?.volume?.value ?? sonata.state?.volume?.value;
      if (typeof sVol === "number" && !isNaN(sVol)) {
        volume = sVol;
        window.__ymCurrentVolume = volume;
      }
    } else {
      const activeAud = (typeof window.__ymGetActiveAudio === "function" ? window.__ymGetActiveAudio() : null) || (typeof getActiveAudioElement === "function" ? getActiveAudioElement() : null);
      if (activeAud && typeof activeAud.volume === "number") {
        if (typeof window.__ymCurrentVolume !== "number") {
          volume = activeAud.volume;
          window.__ymCurrentVolume = volume;
        }
        muted = !!activeAud.muted;
      } else if (typeof window.__ymCurrentVolume === "number") {
        volume = window.__ymCurrentVolume;
      } else {
        try {
          const savedV = localStorage.getItem("ym_mod_volume");
          if (savedV !== null) {
            volume = parseFloat(savedV);
            window.__ymCurrentVolume = volume;
          }
        } catch (e) {}
      }
    }

    if (!title && window.__lastPlayerState && window.__lastPlayerState.track && window.__lastPlayerState.track.title) {
      title = window.__lastPlayerState.track.title;
      if (!artists) artists = window.__lastPlayerState.track.artists || "";
      if (!coverUrl) coverUrl = window.__lastPlayerState.track.coverUrl || "";
      if (!trackId) trackId = window.__lastPlayerState.track.id || "";
    }

    return {
      isPlaying,
      track: {
        id: trackId,
        title,
        artists,
        coverUrl,
        liked,
        isLiked: liked,
        disliked,
        isDisliked: disliked,
        rawMeta,
      },
      progress: {
        position,
        duration,
      },
      volume: {
        volume,
        muted,
      },
    };

  }



  function isDislikeButton(el) {
    if (!el) return false;
    const tid = (el.getAttribute("data-test-id") || "").toLowerCase();
    if (tid.includes("dislike")) return true;
    const aria = (el.getAttribute("aria-label") || "").toLowerCase();
    if (aria.includes("не нравится") || aria.includes("дизлайк") || aria.includes("dislike")) return true;
    return false;
  }

  function isLikeButton(el) {
    if (!el || isDislikeButton(el)) return false;
    const tid = (el.getAttribute("data-test-id") || "").toLowerCase();
    if (tid === "like_button" || tid.endsWith("_like_button") || tid.includes("playerbar_like_button")) return true;
    const aria = (el.getAttribute("aria-label") || "").toLowerCase();
    if (aria.includes("нравится") && !aria.includes("не нравится")) return true;
    if (aria.includes("в любимые") || aria.includes("из любимых") || aria.includes("фонотек") || aria.includes("коллекци")) return true;
    return false;
  }

  function findSonataPlayer() {
    const seeds = [
      document.querySelector('[data-test-id="CHANGE_VOLUME_BUTTON"]'),
      document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]'),
      document.querySelector('[data-test-id="VIBE_PLAYERBAR"]'),
      document.querySelector('footer'),
      document.body
    ].filter(Boolean);

    for (const el of seeds) {
      const fiberKey = Object.keys(el).find((k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"));
      if (!fiberKey || !el[fiberKey]) continue;
      let node = el[fiberKey];
      for (let depth = 0; depth < 60 && node; depth++) {
        const p = node.memoizedProps;
        if (p) {
          if (p.sonata && typeof p.sonata.setExponentVolume === "function") return p.sonata;
          if (typeof p.setExponentVolume === "function") return p;
          if (p.mediaController && typeof p.mediaController.setExponentVolume === "function") return p;
        }

        if (node.dependencies) {
          let curContext = node.dependencies.firstContext;
          while (curContext) {
            const val = curContext.memoizedValue;
            if (val) {
              if (typeof val.setExponentVolume === "function") return val;
              if (val.mediaController && typeof val.mediaController.setExponentVolume === "function") return val;
            }
            curContext = curContext.next;
          }
        }

        let hook = node.memoizedState;
        while (hook) {
          const val = hook.memoizedState;
          if (val) {
            if (typeof val.setExponentVolume === "function") return val;
            if (val.mediaController && typeof val.mediaController.setExponentVolume === "function") return val;
          }
          hook = hook.next;
        }

        node = node.return;
      }
    }
    return null;
  }

  function findActivePlayerLikeButton() {
    // 1. Strict specific selectors (can NEVER match dislike)
    const directSelectors = [
      'section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id="LIKE_BUTTON"]',
      '[data-test-id="VIBE_PLAYERBAR"] button[data-test-id="LIKE_BUTTON"]',
      '[data-test-id="FULLSCREEN_PLAYER_MODAL"] button[data-test-id="LIKE_BUTTON"]',
      '[data-test-id="VIBE_BLOCK"] button[data-test-id="LIKE_BUTTON"]',
      'footer button[data-test-id="LIKE_BUTTON"]',
      'button[data-test-id="LIKE_BUTTON"]',
      'button[data-test-id="PLAYERBAR_LIKE_BUTTON"]'
    ];

    for (const sel of directSelectors) {
      const btn = document.querySelector(sel);
      if (btn && !isDislikeButton(btn)) return btn;
    }

    // 2. Safe scan inside containers
    const activePlayerContainers = [
      document.querySelector('[data-test-id="VIBE_PLAYERBAR"]'),
      document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]'),
      document.querySelector('[data-test-id="FULLSCREEN_PLAYER_MODAL"]'),
      document.querySelector('[data-test-id="VIBE_BLOCK"]'),
      document.querySelector('footer')
    ].filter(Boolean);

    for (const container of activePlayerContainers) {
      const allButtons = container.querySelectorAll("button");
      for (const btn of allButtons) {
        if (isLikeButton(btn)) return btn;
      }
    }

    return null;
  }

  function findActivePlayerDislikeButton() {
    const directSelectors = [
      'section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id="DISLIKE_BUTTON"]',
      '[data-test-id="VIBE_PLAYERBAR"] button[data-test-id="DISLIKE_BUTTON"]',
      '[data-test-id="FULLSCREEN_PLAYER_MODAL"] button[data-test-id="DISLIKE_BUTTON"]',
      '[data-test-id="VIBE_BLOCK"] button[data-test-id="DISLIKE_BUTTON"]',
      'footer button[data-test-id="DISLIKE_BUTTON"]',
      'button[data-test-id="DISLIKE_BUTTON"]',
      'button[data-test-id="PLAYERBAR_DISLIKE_BUTTON"]'
    ];

    for (const sel of directSelectors) {
      const btn = document.querySelector(sel);
      if (btn && isDislikeButton(btn)) return btn;
    }

    const activePlayerContainers = [
      document.querySelector('[data-test-id="VIBE_PLAYERBAR"]'),
      document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]'),
      document.querySelector('[data-test-id="FULLSCREEN_PLAYER_MODAL"]'),
      document.querySelector('[data-test-id="VIBE_BLOCK"]'),
      document.querySelector('footer')
    ].filter(Boolean);

    for (const container of activePlayerContainers) {
      const allButtons = container.querySelectorAll("button");
      for (const btn of allButtons) {
        if (isDislikeButton(btn)) return btn;
      }
    }

    return null;
  }

  function isButtonActive(btn) {
    if (!btn) return false;
    const ariaChecked = btn.getAttribute("aria-checked") === "true" || btn.getAttribute("aria-pressed") === "true";
    const dataState = btn.getAttribute("data-state") === "selected" || btn.dataset?.state === "selected" || btn.getAttribute("data-selected") === "true";
    const hasActiveClass = btn.className.includes("likeButton_active") || btn.className.includes("Like_active") || btn.className.includes("active") || btn.classList.contains("liked");
    const hasActiveChild = !!btn.querySelector('[class*="active" i], [class*="liked" i], [class*="filled" i], [class*="Like_active" i]');
    const pathFilled = Array.from(btn.querySelectorAll("path, svg")).some((el) => {
      const f = (el.getAttribute("fill") || "").toLowerCase();
      return f && f !== "none" && f !== "transparent" && f !== "currentColor";
    });
    const redSvg = !!btn.querySelector('svg[fill="#ef4444"], svg[fill="#fc3f1d"], svg[fill="red"], path[fill="#ef4444"], path[fill="#fc3f1d"], path[fill="red"]');
    let fiberActive = false;
    try {
      const fiberKey = Object.keys(btn).find((k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"));
      if (fiberKey && btn[fiberKey]) {
        let node = btn[fiberKey];
        for (let i = 0; i < 8 && node; i++) {
          const p = node.memoizedProps;
          if (p && (p.isLiked === true || p.liked === true || p.checked === true || p.active === true || p.selected === true || p.isSelected === true)) {
            fiberActive = true;
            break;
          }
          node = node.return;
        }
      }
    } catch (_) {}

    return ariaChecked || dataState || hasActiveClass || hasActiveChild || pathFilled || redSvg || fiberActive;
  }

  function observePlayer() {

    ensureTopTrackbar();

    // Only one interval runner

    if (window.__ymModObserverRunning) return;

    window.__ymModObserverRunning = true;



    setInterval(() => {

      try {

        const state = scrapeCurrentPlayerState();

        if (state && (state.track.title || state.isPlaying || state.progress.duration > 0)) {

          window.__lastPlayerState = state;

          if (window.yandexMusicMod && window.yandexMusicMod.updatePlayerState) {

            window.yandexMusicMod.updatePlayerState(state);

          }

          try {
            updateTopTrackbar(pos, dur);
          } catch (e) {}



          // If new track detected, fetch lyrics and notify
          const curTrackId = state.track.id || `${state.track.title}-${state.track.artists}`;
          if (curTrackId && curTrackId !== lastTrackId && state.track.title) {
            lastTrackId = curTrackId;
            loadLyricsForTrack(state.track.title, state.track.artists, state.track.id, state.track.coverUrl);
          }

          hookDirectAudioElement();
          // Active lyrics line synchronization & Apple Music progress update
          if (fsLyricsVisible && state.progress) {
            if (state.progress.position !== undefined) {
              updateFullscreenLyricsActiveLine(state.progress.position);
            }
            updateAppleMusicProgress(state.progress.position, state.progress.duration, state.isPlaying);
          }
        }
      } catch (err) {}

    }, 350);



    // Listen for remote player actions from Overlay and Shortcuts

    if (window.yandexMusicMod && window.yandexMusicMod.onExecutePlayerAction) {

      window.yandexMusicMod.onExecutePlayerAction((action, payload) => {

        handlePlayerAction(action, payload);

      });

    }

  }



  function triggerClick(el) {
    if (!el) return;
    try {
      el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
      el.click();
    } catch (e) {
      try { el.click(); } catch (_e) {}
    }
  }

  function handlePlayerAction(action, payload) {
    if (action === "requestState") {
      const state = scrapeCurrentPlayerState();
      if (state && window.yandexMusicMod && window.yandexMusicMod.updatePlayerState) {
        window.yandexMusicMod.updatePlayerState(state);
      }
      return;
    }

    const activeAudio = typeof window.__ymGetActiveAudio === "function" ? window.__ymGetActiveAudio() : null;

    if (action === "playPause") {
      const isCurrentlyPlaying = (activeAudio && !activeAudio.paused) ||
        (window.__lastPlayerState && window.__lastPlayerState.isPlaying) ||
        (navigator.mediaSession && navigator.mediaSession.playbackState === "playing") ||
        !!document.querySelector('button[data-test-id="PAUSE_BUTTON"], button[data-test-id="MY_VIBE_PAUSE_BUTTON"], section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id*="PAUSE" i], button[aria-label*="Пауза" i]');

      if (isCurrentlyPlaying) {
        if (activeAudio) {
          try { activeAudio.pause(); } catch (e) {}
        }
        const pauseBtn = document.querySelector(
          'section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id*="PAUSE" i], button[data-test-id="PAUSE_BUTTON"], button[data-test-id="MY_VIBE_PAUSE_BUTTON"], [data-test-id="FULLSCREEN_PLAYER_MODAL"] button[data-test-id*="PAUSE" i], button[aria-label*="Пауза" i], button[aria-label*="pause" i]'
        );
        if (pauseBtn) {
          triggerClick(pauseBtn);
        } else {
          window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true }));
          window.dispatchEvent(new KeyboardEvent("keyup", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true }));
        }
      } else {
        if (activeAudio) {
          try { activeAudio.play().catch(() => {}); } catch (e) {}
        }
        const playBtn = document.querySelector(
          'section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id*="PLAY" i], button[data-test-id="PLAY_BUTTON"], button[data-test-id="MY_VIBE_PLAY_BUTTON"], [data-test-id="FULLSCREEN_PLAYER_MODAL"] button[data-test-id*="PLAY" i], button[aria-label*="Воспроизвести" i], button[aria-label*="play" i]'
        );
        if (playBtn) {
          triggerClick(playBtn);
        } else {
          window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true }));
          window.dispatchEvent(new KeyboardEvent("keyup", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true }));
        }
      }
    } else if (action === "next") {
      const nextBtn = document.querySelector(
        'section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id*="NEXT" i], button[data-test-id="NEXT_TRACK_BUTTON"], button[data-test-id="sonata.NEXT_TRACK_BUTTON"], button[data-test-id="NEXT_BUTTON"], button[aria-label*="Следующий"], button[aria-label*="next" i]'
      );
      if (nextBtn) {
        triggerClick(nextBtn);
      } else {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", code: "ArrowRight", ctrlKey: true, bubbles: true }));
      }
    } else if (action === "prev") {
      const prevBtn = document.querySelector(
        'section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id*="PREV" i], button[data-test-id="PREVIOUS_TRACK_BUTTON"], button[data-test-id="sonata.PREVIOUS_TRACK_BUTTON"], button[data-test-id="PREV_BUTTON"], button[aria-label*="Предыдущий"], button[aria-label*="prev" i]'
      );
      if (prevBtn) {
        triggerClick(prevBtn);
      } else {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", code: "ArrowLeft", ctrlKey: true, bubbles: true }));
      }
    } else if (action === "like" || action === "toggleLike") {
      const likeBtn = findActivePlayerLikeButton();
      if (likeBtn && !isDislikeButton(likeBtn)) {
        let fiberInvoked = false;
        try {
          const props = searchFiberProperty(likeBtn, "onClick");
          if (props && typeof props.onClick === "function") {
            props.onClick({ stopPropagation: () => {}, preventDefault: () => {} });
            fiberInvoked = true;
          }
        } catch(e) {}

        if (!fiberInvoked) {
          triggerClick(likeBtn);
        }
      }

      setTimeout(() => {
        try {
          const s = scrapeCurrentPlayerState();
          if (s && window.yandexMusicMod?.updatePlayerState) {
            window.yandexMusicMod.updatePlayerState(s);
          }
        } catch (e) {}
      }, 200);
    } else if (action === "dislike") {
      const dislikeBtn = findActivePlayerDislikeButton();
      if (dislikeBtn && isDislikeButton(dislikeBtn)) {
        let fiberInvoked = false;
        try {
          const props = searchFiberProperty(dislikeBtn, "onClick");
          if (props && typeof props.onClick === "function") {
            props.onClick({ stopPropagation: () => {}, preventDefault: () => {} });
            fiberInvoked = true;
          }
        } catch(e) {}

        if (!fiberInvoked) {
          triggerClick(dislikeBtn);
        }
      }

      setTimeout(() => {
        try {
          const s = scrapeCurrentPlayerState();
          if (s && window.yandexMusicMod?.updatePlayerState) {
            window.yandexMusicMod.updatePlayerState(s);
          }
        } catch (e) {}
      }, 200);
    } else if (action === "setVolume" && payload && typeof payload.volume === "number") {
      const vol = Math.max(0, Math.min(1, Math.round(payload.volume * 100) / 100));
      window.__ymCurrentVolume = vol;
      try {
        localStorage.setItem("ym_mod_volume", String(vol));
      } catch (e) {}

      // 1. Native Sonata Player Engine Integration
      const sonata = findSonataPlayer();
      if (sonata) {
        try {
          if (typeof sonata.setExponentVolume === "function") {
            sonata.setExponentVolume(vol);
          } else if (sonata.mediaController && typeof sonata.mediaController.setExponentVolume === "function") {
            sonata.mediaController.setExponentVolume(vol);
          } else if (typeof sonata.setVolume === "function") {
            sonata.setVolume(vol);
          }
        } catch (e) {}
      }

      // 2. React Volume Slider & Button Props
      const sliderEl = document.querySelector('[data-test-id="CHANGE_VOLUME_SLIDER"]');
      if (sliderEl) {
        try {
          const sp = searchFiberProperty(sliderEl, "onChange");
          if (sp && typeof sp.onChange === "function") {
            sp.onChange(vol);
          }
        } catch (e) {}
      }

      const volBtn = document.querySelector('[data-test-id="CHANGE_VOLUME_BUTTON"]');
      if (volBtn) {
        try {
          const bp = searchFiberProperty(volBtn, "onVolumeSet");
          if (bp && typeof bp.onVolumeSet === "function") {
            bp.onVolumeSet(vol);
          }
        } catch (e) {}
      }

      // 3. Update HTML5 audio elements (active & all known)
      const activeAud = (typeof window.__ymGetActiveAudio === "function" ? window.__ymGetActiveAudio() : null) || getActiveAudioElement();
      if (activeAud) {
        try {
          activeAud.volume = vol;
          if (vol > 0 && activeAud.muted) activeAud.muted = false;
        } catch (e) {}
      }

      if (window.__ymKnownAudios) {
        window.__ymKnownAudios.forEach((a) => {
          try {
            a.volume = vol;
            if (vol > 0 && a.muted) a.muted = false;
          } catch (e) {}
        });
      }

      const audios = document.querySelectorAll("audio");
      audios.forEach((a) => {
        try {
          a.volume = vol;
          if (vol > 0 && a.muted) a.muted = false;
        } catch (e) {}
      });

      // 4. Broadcast state immediately back to overlay
      setTimeout(() => {
        try {
          const s = scrapeCurrentPlayerState();
          if (s && window.yandexMusicMod?.updatePlayerState) {
            window.yandexMusicMod.updatePlayerState(s);
          }
        } catch (e) {}
      }, 50);
    } else if (action === "toggleMute") {
      const volBtn = document.querySelector('button[data-test-id*="VOLUME"], [data-test-id="VOLUME_BUTTON"]');
      if (volBtn) {
        triggerClick(volBtn);
      } else if (activeAudio) {
        activeAudio.muted = !activeAudio.muted;
      }
    } else if (action === "seek" && payload && payload.position !== undefined) {
      if (activeAudio) {
        activeAudio.currentTime = payload.position;
      } else {
        const audios = document.querySelectorAll("audio");
        for (const a of audios) a.currentTime = payload.position;
      }
    }
  }



  async function fetchTrackLyrics(title, artist, meta, directTrackId = null) {
    const trackId = directTrackId || (meta && meta.id ? meta.id : null);
    await loadLyricsForTrack(title, artist, trackId, meta && meta.coverUrl);
  }





  // Expose window.__getPlayerState (Stephanzion / Vzlomhik standard)

  window.__getPlayerState = () => {

    const s = window.__lastPlayerState;

    if (!s || !s.track) {

      return {

        enabled: modSettings["discordRPC/enabled"] !== false,

        showModButton: modSettings["discordRPC/showModButton"] !== false,

        data: null,

      };

    }

    const artistsArr = Array.isArray(s.track.artists)

      ? s.track.artists

      : (s.track.artists || "").split(", ").map(name => ({ name: name.trim() }));

    return {

      enabled: modSettings["discordRPC/enabled"] !== false,

      showModButton: modSettings["discordRPC/showModButton"] !== false,

      data: {

        trackMeta: {

          id: s.track.id || "0",

          title: s.track.title || "Unknown",

          version: s.track.version || "",

          coverUri: s.track.coverUrl ? s.track.coverUrl.replace(/^https?:\/\//, "").replace(/\/400x400\b/, "/%%") : "",

          artists: artistsArr,

        },

        playback: {

          position: s.progress ? s.progress.position : 0,

          duration: s.progress ? s.progress.duration : 0,

          progress: s.progress && s.progress.duration > 0 ? s.progress.position / s.progress.duration : 0,

        },

        isPlaying: !!s.isPlaying,

      },

    };

  };



  // ==========================================

  // 8. INITIALIZE ALL

  // ==========================================

  async function init() {

    try {

      await loadSettings();

    } catch (e) {

      console.error("[YandexMusicMod] Error loading settings:", e);

    }



    try {

      try {
        initLiveWallpaper();
      } catch (e) {
        console.error("[YandexMusicMod] Error initializing live wallpaper:", e);
      }

      try {
        initTopTrackbar();
      } catch (e) {
        console.error("[YandexMusicMod] Error initializing top trackbar:", e);
      }

      const accent = modSettings["custom-themes/accent"] || "#007acc";

      applyTheme(accent, true);

    } catch (e) {

      console.error("[YandexMusicMod] Error applying theme:", e);

    }



    try {

      const fontName = modSettings["font-changer/savedFont"] || "JetBrains Mono";

      const fontEnabled = modSettings["font-changer/enabled"] !== false;

      applyFont(fontName, fontEnabled);

    } catch (e) {

      console.error("[YandexMusicMod] Error applying font:", e);

    }



    try {

      applyScale(modSettings["scale-changer/savedScale"] || 1.0);

    } catch (e) {

      console.error("[YandexMusicMod] Error applying scale:", e);

    }



    try {

      applyAutoQuality();

    } catch (e) {

      console.error("[YandexMusicMod] Error applying auto quality:", e);

    }



    try {

      applyHiddenMenuItems();

    } catch (e) {

      console.error("[YandexMusicMod] Error applying hidden menu items:", e);

    }



    try {

      applyUiCleaner();

    } catch (e) {

      console.error("[YandexMusicMod] Error applying UI cleaner:", e);

    }



    try {

      injectModUI();

    } catch (e) {

      console.error("[YandexMusicMod] Error injecting Mod UI:", e);

    }



    try {

      injectSidebarButton();

      injectFloatingBadge();

    } catch (e) {

      console.error("[YandexMusicMod] Error injecting Mod buttons:", e);

    }



    try {

      const observer = new MutationObserver(() => {

        injectSidebarButton();

        injectFloatingBadge();

      });

      observer.observe(document.body, { childList: true, subtree: true });

    } catch (e) {

      console.error("[YandexMusicMod] Error observing DOM mutations:", e);

    }



    try {

      observePlayer();

    } catch (e) {

      console.error("[YandexMusicMod] Error observing player:", e);

    }



    // Continuous Top Banner Eliminator

  function killTopBanner() {

    try {

      const root = document.querySelector('div[class*="WithTopBanner_root"]');

      if (root) {

        root.style.setProperty("display", "block", "important");

        root.style.setProperty("grid-template", "none", "important");

        root.style.setProperty("height", "100vh", "important");

        root.style.setProperty("max-height", "100vh", "important");

        root.style.setProperty("overflow", "hidden", "important");



        for (const child of Array.from(root.children)) {

          if (!child.className.includes("WithTopBanner_content")) {

            child.remove();

          } else {

            child.style.setProperty("height", "100vh", "important");

            child.style.setProperty("max-height", "100vh", "important");

            child.style.setProperty("min-height", "100vh", "important");

          }

        }

      }

    } catch (e) {}

  }

  setInterval(killTopBanner, 300);

  killTopBanner();



  console.log("[YandexMusicMod] Mod initialized successfully!");

  }



  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", init);

  } else {

    init();

  }

})();


  // Global click handler for open-proposal
  document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'ym-btn-open-proposal' || e.target.closest('#ym-btn-open-proposal'))) {
      e.preventDefault();
      e.stopPropagation();
      openProposalModal();
    }
  });
