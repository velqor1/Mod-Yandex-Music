const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const DEFAULT_SETTINGS = {
  "updates/automatic": true,
  // Plus Unlocker
  "plus-unlocker/enabled": true,
  "plus-unlocker/bypassAds": true,
  "plus-unlocker/unlimitedSkips": true,
  "plus-unlocker/hideUpgradePrompts": true,

  // Appearance & Design
  "settings/appearance": "standard", // independent menu: standard | modern | classic | compact
  "settings/useAppFont": false,
  "design/mode": "modern", // "modern" | "classic" | "compact"
  "design/modern/transparency": 18,
  "design/modern/edge": true,
  "design/classic/tone": "dark",
  "design/classic/radius": 8,
  "design/compact/playerHeight": 64,
  "design/compact/rowDensity": "tight",
  "design/glassBlur": "medium", // "off" | "light" | "medium" | "ultra"
  "design/borderRadius": "modern", // "classic" | "modern" | "round"
  "design/cardHoverFx": true,
  "design/playerGlow": true,
  "design/glowProgress": true,
  "design/smoothTransitions": true,
  "custom-themes/enabled": true,
  "custom-themes/accent": "#8b5cf6",
  "custom-themes/playerColorsReplace": true,
  "custom-themes/disableVibeAnimation": false,
  "custom-themes/disableExplicitMark": false,
  "custom-themes/hideMenuItems": [],

  // Fonts & Typography
  "font-changer/enabled": true,
  "font-changer/savedFont": "JetBrains Mono",
  "font-changer/sizeScale": 1.0,
  "font-changer/weight": "normal",
  "font-changer/letterSpacing": "normal",
  "scale-changer/savedScale": 1.0,

  // UI Cleaner (Hide unwanted buttons/sections)
  "cleaner/hideConcerts": false,
  "cleaner/hideKids": false,
  "cleaner/hidePodcasts": false,
  "cleaner/hideTrends": false,
  "cleaner/hideRadio": false,
  "cleaner/hideBanners": true,
  "cleaner/hideMobileApp": true,
  "cleaner/hideDonates": false,
  "cleaner/hideTickets": false,
  "cleaner/hideTrailers": false,
  "cleaner/hideDislike": false,
  "cleaner/hideQueue": false,
  "cleaner/hideLyrics": false,
  "cleaner/hideFullscreen": false,
  "cleaner/hidePrev": false,
  "cleaner/hideQuality": false,
  "cleaner/hideVolume": false,
  "cleaner/hideVibeBlock": false,

  // Equalizer & Audio FX
  "equalizer/enabled": false,
  "equalizer/preset": "flat",

  // Killer Features: Overlays & Tools
  "downloader/enabled": true,
  "osd/enabled": false,
  "autoLiker/enabled": false,

  // Killer Features: Overlays
  "overlay/enabled": true,
  "overlay/hotkey": "CommandOrControl+Shift+O",
  "overlay/clickThrough": false,
  "overlay/hudTheme": "steam-glass", // "steam-glass" | "discord-dark" | "cyberpunk"
  "overlay/opacity": 92,
  "overlay/pureShadow": true,
  "overlay/showLyrics": true,
  "karaoke/enabled": false,
  "karaoke/hotkey": "CommandOrControl+Shift+L",
  "karaoke/position": "bottom", // "top" | "bottom"
  "karaoke/glow": true,

  // Tweaks & Tools
  "discordRPC/enabled": true,
  "discordRPC/activityType": "listening", // "listening" (Слушает) | "playing" (Играет в)
  "discordRPC/timeFormat": "progress", // "progress" (01:34 / 02:54) | "elapsed" (прошло) | "remaining" (обратный отсчет)
  "discordRPC/showModButton": true,
  "devtools/enabled": true,
  "blockAds/enabled": true,
  "autoQuality/enabled": true,
  "autoLiker/enabled": false,
  "settings/accountExperimentsOverride": [],

  // Live Wallpaper & Workshop
  "wallpaper/enabled": true,
  "wallpaper/source": "synthwave", // "cyberpunk" | "lofi" | "synthwave" | "nebula" | "matrix" | "waves" | "hyperspace" | "custom"
  "wallpaper/type": "video", // "video" | "canvas" | "image"
  "wallpaper/url": "",
  "wallpaper/opacity": 55, // dimming percentage 0-90%
  "wallpaper/blur": 0, // backdrop blur in px
  "wallpaper/pauseOnBlur": true,

  // Custom Neon Top Trackbar (TikTok / Image 3 style)
  "trackbar/topBarEnabled": true,
  "trackbar/color": "#ffe600", // Yellow default like in TikTok / Image 3
  "trackbar/thickness": "3px", // "2px" | "3px" | "5px"
  "trackbar/glow": true,
  "trackbar/hideDefaultSlider": false
};

class SettingsManager {
  constructor() {
    this.userDataPath = app ? app.getPath("userData") : "";
    this.filePath = path.join(this.userDataPath, "mod_settings.json");
    this.settings = { ...DEFAULT_SETTINGS };
    this.listeners = new Set();
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf8");
        const parsed = JSON.parse(raw);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("[Mod Settings] Error reading settings, resetting to defaults:", e);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), "utf8");
    } catch (e) {
      console.error("[Mod Settings] Error writing settings:", e);
    }
  }

  get(key, defaultValue = undefined) {
    if (this.settings[key] !== undefined) {
      return this.settings[key];
    }
    return defaultValue !== undefined ? defaultValue : DEFAULT_SETTINGS[key];
  }

  getAll() {
    return { ...this.settings };
  }

  set(key, value) {
    this.settings[key] = value;
    this.save();
    for (const cb of this.listeners) {
      try {
        cb(key, value);
      } catch (e) {}
    }
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

module.exports = { SettingsManager, DEFAULT_SETTINGS };
