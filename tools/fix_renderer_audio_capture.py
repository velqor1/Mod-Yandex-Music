with open('src/renderer/mod-renderer.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """// ==========================================
// 0. AUDIO ELEMENT CAPTURE (v1.3.13)
// Intercepts detached <audio> elements created by Yandex Music Yasp player
// ==========================================
(function setupAudioCapture() {
  if (window.__ymAudioHookInstalled) return;
  window.__ymAudioHookInstalled = true;
  window.__ymActiveAudio = null;
  window.__ymKnownAudios = new Set();

  function registerAudio(audio) {
    if (!audio || !(audio instanceof HTMLMediaElement)) return;
    window.__ymKnownAudios.add(audio);
    window.__ymActiveAudio = audio;

    if (!audio.__ymTrackingAttached) {
      audio.__ymTrackingAttached = true;
      const onTick = () => {
        window.__ymActiveAudio = audio;
        if (typeof window.__ymOnAudioTimeUpdate === "function") {
          window.__ymOnAudioTimeUpdate(audio.currentTime, audio.duration, !audio.paused);
        }
      };
      audio.addEventListener("timeupdate", onTick);
      audio.addEventListener("play", onTick);
      audio.addEventListener("pause", onTick);
      audio.addEventListener("seeking", onTick);
      audio.addEventListener("seeked", onTick);
      audio.addEventListener("durationchange", onTick);
      audio.addEventListener("loadedmetadata", onTick);
    }
  }

  window.__ymGetActiveAudio = function() {
    if (window.__ymActiveAudio && !window.__ymActiveAudio.error) {
      return window.__ymActiveAudio;
    }
    if (window.__ymKnownAudios && window.__ymKnownAudios.size > 0) {
      for (const a of window.__ymKnownAudios) {
        if (!a.paused || a.currentTime > 0) return a;
      }
      const first = window.__ymKnownAudios.values().next().value;
      if (first) return first;
    }
    return document.querySelector("audio") || null;
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
      registerAudio(this);
      return origPlay.apply(this, args);
    };
  } catch (e) {}
})();"""

new_block = """// ==========================================
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
      audio.addEventListener("play", onTick);
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
})();"""

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open('src/renderer/mod-renderer.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Patched setupAudioCapture in mod-renderer.js")
else:
    print("ERROR: old_block not matched in mod-renderer.js")
