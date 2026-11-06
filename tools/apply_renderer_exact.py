# -*- coding: utf-8 -*-
import os

renderer_path = os.path.abspath('src/renderer/mod-renderer.js')
with open(renderer_path, 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('function findActivePlayerLikeButton()')
idx2 = text.find('function observePlayer()', idx1)

new_helpers = """function findSonataPlayer() {
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
        // 1. Check memoizedProps
        const p = node.memoizedProps;
        if (p) {
          if (p.sonata && typeof p.sonata.setExponentVolume === "function") return p.sonata;
          if (typeof p.setExponentVolume === "function") return p;
          if (p.mediaController && typeof p.mediaController.setExponentVolume === "function") return p;
        }

        // 2. Check dependencies (contexts)
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

        // 3. Check memoizedState (hooks chain)
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
    const activePlayerContainers = [
      document.querySelector('[data-test-id="VIBE_PLAYERBAR"]'),
      document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]'),
      document.querySelector('[data-test-id="FULLSCREEN_PLAYER_MODAL"]'),
      document.querySelector('[data-test-id="VIBE_BLOCK"]'),
      document.querySelector('footer')
    ].filter(Boolean);

    for (const container of activePlayerContainers) {
      const btn = container.querySelector(
        'button[data-test-id="LIKE_BUTTON"], button[data-test-id*="LIKE" i], button[aria-label*="нравится" i], button[aria-label*="любим" i], button[aria-label*="like" i]'
      );
      if (btn) return btn;
    }
    return document.querySelector(
      'section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id*="LIKE" i], [data-test-id="VIBE_PLAYERBAR"] button[data-test-id*="LIKE" i]'
    );
  }

  function findActivePlayerDislikeButton() {
    const activePlayerContainers = [
      document.querySelector('[data-test-id="VIBE_PLAYERBAR"]'),
      document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"]'),
      document.querySelector('[data-test-id="FULLSCREEN_PLAYER_MODAL"]'),
      document.querySelector('[data-test-id="VIBE_BLOCK"]'),
      document.querySelector('footer')
    ].filter(Boolean);

    for (const container of activePlayerContainers) {
      const btn = container.querySelector(
        'button[data-test-id="DISLIKE_BUTTON"], button[data-test-id*="DISLIKE" i], button[aria-label*="не нравится" i], button[aria-label*="дизлайк" i], button[aria-label*="dislike" i]'
      );
      if (btn) return btn;
    }
    return document.querySelector(
      'section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id*="DISLIKE" i], [data-test-id="VIBE_PLAYERBAR"] button[data-test-id*="DISLIKE" i]'
    );
  }

  function isButtonActive(btn) {
    if (!btn) return false;
    const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();
    const isDelete = ariaLabel.includes("удалить") || ariaLabel.includes("убрать") || ariaLabel.includes("из любимых") || ariaLabel.includes("из коллекции") || ariaLabel.includes("из фонотеки");
    const ariaChecked = btn.getAttribute("aria-checked") === "true" || btn.getAttribute("aria-pressed") === "true";
    const dataState = btn.getAttribute("data-state") === "selected" || btn.dataset?.state === "selected" || btn.getAttribute("data-selected") === "true";
    const hasActiveClass = btn.className.includes("likeButton_active") || btn.className.includes("Like_active") || btn.className.includes("active") || btn.classList.contains("liked") || btn.classList.contains("disliked");
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
          if (p && (p.isLiked === true || p.liked === true || p.checked === true || p.active === true || p.isDisliked === true || p.disliked === true || p.selected === true || p.isSelected === true)) {
            fiberActive = true;
            break;
          }
          node = node.return;
        }
      }
    } catch (_) {}

    return isDelete || ariaChecked || dataState || hasActiveClass || hasActiveChild || pathFilled || redSvg || fiberActive;
  }

  """

text = text[:idx1] + new_helpers + text[idx2:]
print("[+] Replaced helpers slice.")

act1 = text.find('} else if (action === "like" || action === "toggleLike") {')
act2 = text.find('}, 50);', act1) + 7

new_actions = """} else if (action === "like" || action === "toggleLike") {
      let triggered = false;
      const likeCandidates = [
        findActivePlayerLikeButton(),
        document.querySelector('section[data-test-id="PLAYERBAR_DESKTOP"] button[data-test-id="LIKE_BUTTON"]'),
        document.querySelector('[data-test-id="VIBE_PLAYERBAR"] button[data-test-id="LIKE_BUTTON"]'),
        document.querySelector('[data-test-id="FULLSCREEN_PLAYER_MODAL"] button[data-test-id="LIKE_BUTTON"]'),
        document.querySelector('[data-test-id="VIBE_BLOCK"] button[data-test-id="LIKE_BUTTON"]'),
        document.querySelector('footer button[data-test-id="LIKE_BUTTON"]'),
        document.querySelector('button[data-test-id="LIKE_BUTTON"]'),
        document.getElementById("ym-am-btn-like")
      ].filter(Boolean);

      for (const btn of likeCandidates) {
        if (btn) {
          let fiberInvoked = false;
          try {
            const props = searchFiberProperty(btn, "onClick");
            if (props && typeof props.onClick === "function") {
              props.onClick({ stopPropagation: () => {}, preventDefault: () => {} });
              fiberInvoked = true;
              triggered = true;
            }
          } catch(e) {}

          // Crucial fix: ONLY trigger click if Fiber onClick was NOT directly invoked!
          if (!fiberInvoked) {
            triggerClick(btn);
            triggered = true;
          }
          break;
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
      if (dislikeBtn) {
        let fiberInvoked = false;
        try {
          const props = searchFiberProperty(dislikeBtn, "onClick");
          if (props && typeof props.onClick === "function") {
            props.onClick({ stopPropagation: () => {}, preventDefault: () => {} });
            fiberInvoked = true;
          }
        } catch(e) {}
        if (!fiberInvoked) triggerClick(dislikeBtn);
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
      }, 50);"""

text = text[:act1] + new_actions + text[act2:]
print("[+] Replaced actions slice.")

with open(renderer_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("[+] All done patching mod-renderer.js!")
