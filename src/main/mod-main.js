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

const electron = require("electron");
const { app, BrowserWindow, ipcMain, globalShortcut, dialog, shell, screen, protocol, net, session } = electron;
const path = require("path");
const fs = require("fs");
const https = require("https");
const { pathToFileURL } = require("url");
const { exec } = require("child_process");

// Protocol ym-media handled dynamically without registerSchemesAsPrivileged
const { SettingsManager } = require("./settings");
const appFolder = app ? app.getPath("userData") : path.join(process.env.APPDATA || "", "YandexMusic");
const { DiscordRPC } = require("./discord-rpc");

let settingsManager = null;
let discordRPC = null;
let overlayWindow = null;
let karaokeWindow = null;
let lastPlayerState = null;
let lastPlayerStateTimestamp = 0;
let lastLyricsData = null;

function resolvePreloadPath(scriptName) {
  // In packaged app.asar, mod-main.js is in /app/yandexMusicMod/main.js
  const localDir = path.join(__dirname, scriptName);
  if (fs.existsSync(localDir)) return localDir;

  const parentPreload = path.join(__dirname, "../preload", scriptName);
  if (fs.existsSync(parentPreload)) return parentPreload;

  const rootPreload = path.join(__dirname, "../../preload", scriptName);
  if (fs.existsSync(rootPreload)) return rootPreload;

  return localDir;
}

function initModMain() {
  if (settingsManager) return; // already initialized
  settingsManager = new SettingsManager();

  // 0. Disable official Yandex Music Auto-Updater to prevent overwriting the mod
  try {
    const electronUpdater = require("electron-updater");
    if (electronUpdater && electronUpdater.autoUpdater) {
      electronUpdater.autoUpdater.autoDownload = false;
      electronUpdater.autoUpdater.autoInstallOnAppQuit = false;
      electronUpdater.autoUpdater.checkForUpdates = async () => null;
      electronUpdater.autoUpdater.checkForUpdatesAndNotify = async () => null;
      electronUpdater.autoUpdater.downloadUpdate = async () => null;
      electronUpdater.autoUpdater.quitAndInstall = () => {};
    }
  } catch (e) {}

  // Register ym-media protocol handler
  if (app.isReady()) {
    setupMediaProtocol();
  } else {
    app.whenReady().then(setupMediaProtocol);
  }

  // 1. Discord RPC
  function resolveDiscordClientId(appTitle) {
    if (appTitle === "en") return "1269807014393942046";
    if (appTitle === "ru_alt") return "1269826362399522849";
    return "1283109459463377011"; // "Яндекс Музыка" (Vzlomhik2005 standard)
  }
  const initialAppTitle = settingsManager.get("discordRPC/appTitle", "ru");
  discordRPC = new DiscordRPC(resolveDiscordClientId(initialAppTitle));
  const rpcEnabled = settingsManager.get("discordRPC/enabled", true);
  discordRPC.enabled = rpcEnabled;
  if (rpcEnabled) {
    discordRPC.connect();
  }

  settingsManager.onChange((key, value) => {
    if (key === "discordRPC/appTitle") {
      const newCid = resolveDiscordClientId(value);
      if (discordRPC) {
        discordRPC.setClientId(newCid);
        if (lastPlayerState) updateDiscordActivity(lastPlayerState);
      }
    }
    if (key === "discordRPC/activityType" || key === "discordRPC/timeFormat" || key === "discordRPC/showModButton") {
      if (lastPlayerState) {
        rpcLastSentState.timestamp = 0;
        updateDiscordActivity(lastPlayerState);
      }
    }
    if (key === "discordRPC/enabled") {
      discordRPC.enabled = !!value;
      if (value) {
        discordRPC.startWatchdog();
        discordRPC.connect();
        if (lastPlayerState) updateDiscordActivity(lastPlayerState);
      } else {
        discordRPC.stopWatchdog();
        discordRPC.clearActivity();
        discordRPC.cleanupSocket();
      }
    }

    // Broadcast settings update to all open windows
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        try {
          win.webContents.send("yandexMusicMod.storageValueUpdated", key, value);
        } catch (e) {}
      }
    });
  });

  // 2. Setup IPC Handlers
  setupIpcHandlers();
  startPlayerStatePolling();

  // 3. Register devtools shortcuts & console logger on every window
  function attachToWindow(win) {
    if (!win || win.isDestroyed()) return;

    const consoleLogPath = path.join(appFolder, "mod-renderer-console.log");

    win.webContents.on("console-message", (_event, level, message, line, sourceId) => {
      const entry = `[LVL ${level}] ${message} (${sourceId}:${line})\n`;
      try {
        fs.appendFileSync(consoleLogPath, entry, "utf8");
      } catch (e) {}
    });

    win.webContents.on("did-fail-load", (_ev, errorCode, errorDescription, validatedURL) => {
      const entry = `[FAIL LOAD] Code: ${errorCode}, Desc: ${errorDescription}, URL: ${validatedURL}\n`;
      try {
        fs.appendFileSync(consoleLogPath, entry, "utf8");
      } catch (e) {}
    });

    const dumpState = async () => {
      try {
        const domDump = await win.webContents.executeJavaScript(`
          (() => {
            const getElInfo = (el) => {
              if (!el) return null;
              const r = el.getBoundingClientRect();
              const s = window.getComputedStyle(el);
              return {
                tag: el.tagName,
                id: el.id,
                cls: el.className,
                rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
                display: s.display,
                visibility: s.visibility,
                opacity: s.opacity,
                zIndex: s.zIndex,
                bg: s.backgroundColor,
                color: s.color,
                overflow: s.overflow
              };
            };

            
            const asideLinks = Array.from(document.querySelectorAll('aside a, [data-test-id="NAVBAR"] a')).map(a => ({
              href: a.getAttribute("href"),
              text: a.innerText.trim(),
              testId: a.getAttribute("data-test-id") || (a.parentElement ? a.parentElement.getAttribute("data-test-id") : null)
            }));

            const pointCenter = document.elementFromPoint(Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2));
            const pointSidebar = document.elementFromPoint(50, 150);
            const pointTop = document.elementFromPoint(100, 20);

            return JSON.stringify({
              windowSize: { w: window.innerWidth, h: window.innerHeight },
              elementsAtPoints: {
                top: pointTop ? { tag: pointTop.tagName, id: pointTop.id, cls: pointTop.className } : null,
                sidebar: pointSidebar ? { tag: pointSidebar.tagName, id: pointSidebar.id, cls: pointSidebar.className } : null,
                center: pointCenter ? { tag: pointCenter.tagName, id: pointCenter.id, cls: pointCenter.className } : null,
                sidebarLinks: asideLinks
              },
              nodes: {
                body: getElInfo(document.body),
                modalBackdrop: getElInfo(document.getElementById("ym-mod-modal-backdrop")),
                withTopBanner: getElInfo(document.querySelector('div[class*="WithTopBanner_root"]')),
                withTopBannerContent: getElInfo(document.querySelector('div[class*="WithTopBanner_content"]')),
                defaultLayout: getElInfo(document.querySelector('div[class*="DefaultLayout_root"]')),
                navbar: getElInfo(document.querySelector('aside[data-test-id="NAVBAR"], aside, nav')),
                sidebarBtn: getElInfo(document.getElementById("ym-mod-menu-btn")),
                floatingTrigger: getElInfo(document.getElementById("ym-mod-floating-trigger"))
              },
              errors: window.__ymLastErrors || []
            }, null, 2);
          })()
        `);
        fs.appendFileSync(consoleLogPath, `[DEEP DOM DUMP] ${domDump}\n`, "utf8");

        const screenshotPath = path.join(appFolder, "mod-screen-capture.png");
        try {
          const image = await win.webContents.capturePage();
          fs.writeFileSync(screenshotPath, image.toPNG());
          fs.appendFileSync(consoleLogPath, `[SCREENSHOT SAVED] ${screenshotPath} (${image.getSize().width}x${image.getSize().height})\n`, "utf8");
        } catch (scErr) {
          fs.appendFileSync(consoleLogPath, `[SCREENSHOT ERROR] ${scErr.message}\n`, "utf8");
        }
      } catch (e) {
        fs.appendFileSync(consoleLogPath, `[DUMP ERROR] ${e.message}\n`, "utf8");
      }
    };

    win.webContents.on("did-finish-load", () => {
      setTimeout(dumpState, 1500);
    });
    setTimeout(dumpState, 1000);

    win.webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        const isF12 = input.key === "F12";
        const isCtrlShiftI = (input.control || input.meta) && input.shift && input.key && input.key.toLowerCase() === "i";
        if (isF12 || isCtrlShiftI) {
          if (settingsManager.get("devtools/enabled", true)) {
            win.webContents.toggleDevTools();
            event.preventDefault();
          }
        }
      }
    });
  }

  let mainWindow = null;

  function trackMainWindow(win) {
    if (!win || win.isDestroyed()) return;
    if (win === overlayWindow || win === karaokeWindow) return;

    mainWindow = win;

    win.on("closed", () => {
      if (mainWindow === win) {
        mainWindow = null;
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      if (discordRPC) {
        try { discordRPC.destroy(); } catch (e) {}
      }
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        try { overlayWindow.destroy(); } catch (e) {}
        overlayWindow = null;
      }
      if (karaokeWindow && !karaokeWindow.isDestroyed()) {
        try { karaokeWindow.destroy(); } catch (e) {}
        karaokeWindow = null;
      }
      // Force immediate process exit so no zombie tasks linger in Task Manager
      try { app.exit(0); } catch (e) { app.quit(); }
    });
  }

  // Attach to existing windows immediately
  BrowserWindow.getAllWindows().forEach((win) => {
    attachToWindow(win);
    trackMainWindow(win);
  });

  // Attach to future windows
  app.on("browser-window-created", (_ev, win) => {
    attachToWindow(win);
    trackMainWindow(win);
  });

  // Handle second instance launch: bring main window to front
  app.on("second-instance", () => {
    const wins = BrowserWindow.getAllWindows();
    for (const win of wins) {
      if (!win.isDestroyed() && win !== overlayWindow && win !== karaokeWindow) {
        if (win.isMinimized()) win.restore();
        win.show();
        win.setSkipTaskbar(false);
        win.focus();
        return;
      }
    }
  });

  // 4. Register Global Shortcuts when App is ready
  if (app.isReady()) {
    onAppReady();
  } else {
    app.whenReady().then(onAppReady);
  }
}

function onAppReady() {
  registerGlobalShortcuts();
}

function registerGlobalShortcuts() {
  try {
    // Overlay toggle hotkey
    const overlayHotkey = settingsManager.get("overlay/hotkey", "CommandOrControl+Shift+O");
    globalShortcut.register(overlayHotkey, () => {
      toggleOverlayWindow();
    });

    // Karaoke toggle hotkey
    const karaokeHotkey = settingsManager.get("karaoke/hotkey", "CommandOrControl+Shift+L");
    globalShortcut.register(karaokeHotkey, () => {
      toggleKaraokeWindow();
    });

    // Ghost mode toggle hotkey (Ctrl+Shift+G)
    globalShortcut.register("CommandOrControl+Shift+G", () => {
      toggleOverlayGhostMode();
    });

    // Settings modal hotkey (Ctrl+Shift+S)
    globalShortcut.register("CommandOrControl+Shift+S", () => {
      openSettingsInMainWindow();
    });

    // Global DevTools hotkey
    globalShortcut.register("CommandOrControl+Shift+I", () => {
      toggleFocusedDevTools();
    });
    globalShortcut.register("F12", () => {
      toggleFocusedDevTools();
    });
  } catch (e) {
    console.error("[Mod Main] Failed to register global shortcuts:", e);
  }
}

function toggleFocusedDevTools() {
  const focused = BrowserWindow.getFocusedWindow();
  if (focused && !focused.isDestroyed()) {
    focused.webContents.toggleDevTools();
  }
}

function openSettingsInMainWindow() {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (win !== overlayWindow && win !== karaokeWindow && !win.isDestroyed()) {
      try {
        win.webContents.send("yandexMusicMod.openSettingsModal");
        if (win.isMinimized()) win.restore();
        win.focus();
      } catch (e) {}
    }
  });
}

// ==========================================
// STEAM / DISCORD STYLE OVERLAY WINDOW
// ==========================================
function getOrCreateOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    return overlayWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;
  const overlayWidth = 380;
  const overlayHeight = 160;
  const posX = width - overlayWidth - 30;
  const posY = 40;

  const preloadScript = resolvePreloadPath("overlay-preload.js");

  overlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x: posX,
    y: posY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    hasShadow: false,
    show: false,
    backgroundColor: "#00000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: preloadScript,
    },
  });

  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const clickThrough = settingsManager.get("overlay/clickThrough", false);
  if (clickThrough) {
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  }

  // Load overlay.html via standard music-application protocol
  overlayWindow.loadURL("music-application://desktop/yandexMusicMod/overlay.html");

  overlayWindow.webContents.on("did-finish-load", () => {
    if (lastPlayerState) {
      try {
        overlayWindow.webContents.send("overlay:trackUpdate", lastPlayerState);
      } catch (e) {}
    }
    if (lastLyricsData) {
      try {
        overlayWindow.webContents.send("overlay:lyricsUpdate", lastLyricsData);
      } catch (e) {}
    }
  });

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

function toggleOverlayWindow() {
  const win = getOrCreateOverlayWindow();
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    if (lastPlayerState) {
      try {
        win.webContents.send("overlay:trackUpdate", lastPlayerState);
      } catch (e) {}
    }
    if (lastLyricsData) {
      try {
        win.webContents.send("overlay:lyricsUpdate", lastLyricsData);
      } catch (e) {}
    }
  }
}

function toggleOverlayGhostMode() {
  const current = settingsManager.get("overlay/clickThrough", false);
  const updated = !current;
  settingsManager.set("overlay/clickThrough", updated);
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.setIgnoreMouseEvents(updated, { forward: true });
    try {
      overlayWindow.webContents.send("overlay:ghostModeToggled", updated);
    } catch (e) {}
  }
}

// ==========================================
// FLOATING KARAOKE WINDOW
// ==========================================
function getOrCreateKaraokeWindow() {
  if (karaokeWindow && !karaokeWindow.isDestroyed()) {
    return karaokeWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const karaokeWidth = 680;
  const karaokeHeight = 90;
  const posX = Math.round((width - karaokeWidth) / 2);
  const posY = height - karaokeHeight - 35;

  const preloadScript = resolvePreloadPath("karaoke-preload.js");

  karaokeWindow = new BrowserWindow({
    width: karaokeWidth,
    height: karaokeHeight,
    x: posX,
    y: posY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    hasShadow: false,
    show: false,
    backgroundColor: "#00000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: preloadScript,
    },
  });

  karaokeWindow.setAlwaysOnTop(true, "screen-saver");
  karaokeWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  karaokeWindow.setIgnoreMouseEvents(true, { forward: true });

  karaokeWindow.loadURL("music-application://desktop/yandexMusicMod/karaoke.html");

  karaokeWindow.webContents.on("did-finish-load", () => {
    if (lastPlayerState) {
      try {
        karaokeWindow.webContents.send("karaoke:trackUpdate", lastPlayerState);
      } catch (e) {}
    }
    if (lastLyricsData) {
      try {
        karaokeWindow.webContents.send("karaoke:lyricsUpdate", lastLyricsData);
      } catch (e) {}
    }
  });

  karaokeWindow.on("closed", () => {
    karaokeWindow = null;
  });

  return karaokeWindow;
}

function toggleKaraokeWindow() {
  const win = getOrCreateKaraokeWindow();
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    if (lastPlayerState) {
      try {
        win.webContents.send("karaoke:trackUpdate", lastPlayerState);
      } catch (e) {}
    }
    if (lastLyricsData) {
      try {
        win.webContents.send("karaoke:lyricsUpdate", lastLyricsData);
      } catch (e) {}
    }
  }
}

// ==========================================
// DISCORD RICH PRESENCE UPDATE
// ==========================================
let rpcLastSentState = {
  trackId: null,
  isPlaying: null,
  position: 0,
  timestamp: 0,
};

function updateDiscordActivity(state) {
  if (!discordRPC || !discordRPC.enabled) return;
  if (!state) {
    if (rpcLastSentState.trackId !== null) {
      rpcLastSentState = { trackId: null, isPlaying: null, position: 0, timestamp: 0 };
      discordRPC.clearActivity();
    }
    return;
  }

  // Handle all player state shapes: state.track (renderer), state.trackMeta (IPC), or flat state
  const track = state.track || state.trackMeta || state;
  const isPlaying = state.isPlaying !== undefined 
    ? !!state.isPlaying 
    : (state.playback ? !!state.playback.isPlaying : false);
  const position = (state.progress && state.progress.position) 
    || (state.playback && state.playback.position) 
    || state.position 
    || 0;
  const duration = (state.progress && state.progress.duration) 
    || (state.playback && state.playback.duration) 
    || state.duration 
    || 0;

  const rawTitle = track.title || "";
  let rawArtist = "";
  if (Array.isArray(track.artists)) {
    rawArtist = track.artists.map((a) => (typeof a === "object" ? (a.name || "") : String(a))).join(", ");
  } else {
    rawArtist = track.artists || track.artist || "";
  }
  const album = (track.albums && track.albums[0] && track.albums[0].title) || track.album || "";

  if (!rawTitle) {
    if (rpcLastSentState.trackId !== null) {
      rpcLastSentState = { trackId: null, isPlaying: null, position: 0, timestamp: 0 };
      discordRPC.clearActivity();
    }
    return;
  }

  const trackId = track.id ? String(track.id) : `${rawTitle}-${rawArtist}`;
  const now = Math.floor(Date.now() / 1000);
  const trackChanged = rpcLastSentState.trackId !== trackId;
  const playStateChanged = rpcLastSentState.isPlaying !== isPlaying;

  let seekDetected = false;
  if (isPlaying && rpcLastSentState.isPlaying && rpcLastSentState.timestamp > 0) {
    const elapsedSec = now - rpcLastSentState.timestamp;
    const expectedPos = rpcLastSentState.position + elapsedSec;
    if (Math.abs(position - expectedPos) > 4) {
      seekDetected = true;
    }
  }

  const timeSinceLastUpdate = now - rpcLastSentState.timestamp;

  // Discord allows at most 1 update every ~15 seconds without rate-limiting.
  // Bypass throttle ONLY on track change, play/pause toggle, or seek (> 4s).
  if (!trackChanged && !playStateChanged && !seekDetected && timeSinceLastUpdate < 15) {
    return;
  }

  rpcLastSentState = {
    trackId,
    isPlaying,
    position,
    timestamp: now,
  };

  const isEn = settingsManager && settingsManager.get("discordRPC/appTitle", "ru") === "en";

  const cleanTitle = (rawTitle || "").trim();
  const cleanArtist = (rawArtist || "").trim();
  const safeTitle = (cleanTitle.length === 1 ? cleanTitle + "\u200b" : cleanTitle).substring(0, 128) || (isEn ? "Music" : "Музыка");
  const safeArtist = (cleanArtist.length === 1 ? cleanArtist + "\u200b" : cleanArtist).substring(0, 128) || (isEn ? "Yandex Music" : "Яндекс Музыка");

  let validCover = track.coverUrl || track.coverUri || (track.ogImage ? "https://" + track.ogImage.replace("%%", "400x400") : "");
  if (validCover && validCover.startsWith("//")) {
    validCover = "https:" + validCover;
  }
  if (validCover && validCover.includes("%%")) {
    validCover = validCover.replace("%%", "400x400");
  }
  if (!validCover || !validCover.startsWith("http")) {
    validCover = "https://music.yandex.ru/favicon.ico";
  }

  const activityTypeSetting = settingsManager ? settingsManager.get("discordRPC/activityType", "listening") : "listening";
  const timeFormat = settingsManager ? settingsManager.get("discordRPC/timeFormat", "progress") : "progress";

  const activity = {
    type: activityTypeSetting === "playing" ? 0 : 2, // 2 = Listening ("Слушает"), 0 = Playing ("Играет в")
    details: safeTitle,
    state: safeArtist,
    assets: {
      large_image: validCover,
      large_text: album ? `${album} — ${safeTitle}`.substring(0, 128) : safeTitle,
      small_image: isPlaying 
        ? "https://raw.githubusercontent.com/FozerG/WinYandexMusicRPC/main/assets/Playing.png" 
        : "https://raw.githubusercontent.com/FozerG/WinYandexMusicRPC/main/assets/Paused.png",
      small_text: isPlaying 
        ? (isEn ? "Listening to Yandex Music" : "Слушает в Яндекс Музыке")
        : (isEn ? "Paused" : "На паузе"),
    },
    instance: false,
  };

  if (isPlaying) {
    const nowMs = Date.now();
    const startMs = Math.round(nowMs - (position || 0) * 1000);
    const endMs = duration > 0 ? Math.round(startMs + duration * 1000) : null;

    activity.timestamps = {};
    if (timeFormat === "elapsed") {
      activity.timestamps.start = startMs;
    } else if (timeFormat === "remaining" && endMs) {
      activity.timestamps.end = endMs;
    } else if (endMs) {
      activity.timestamps.start = startMs;
      activity.timestamps.end = endMs;
    } else {
      activity.timestamps.start = startMs;
    }
  }

  const buttons = [];
  if (trackId && !trackId.includes("-") && trackId !== "0" && String(trackId).match(/^\d+$/)) {
    buttons.push({
      label: isEn ? "🎵 Open" : "🎵 Открыть",
      url: `https://music.yandex.ru/track/${trackId}`,
    });
  }
  const showModBtn = settingsManager ? settingsManager.get("discordRPC/showModButton", true) : true;
  if (showModBtn) {
    buttons.push({
      label: "💻 Yandex Music Mod",
      url: "https://github.com/velqor1/Yandex-Music-Mod",
    });
  }
  if (buttons.length > 0) {
    activity.buttons = buttons;
  }

  discordRPC.setActivity(activity);
}

// Active polling fallback for Discord RPC & Overlay (Stephanzion standard)
let pollingInterval = null;
function startPlayerStatePolling() {
  if (pollingInterval) return;
  setTimeout(() => { if (pollingInterval && typeof pollingInterval.unref === 'function') pollingInterval.unref(); }, 100);
  pollingInterval = setInterval(async () => {
    try {
      // Feature 8: Eliminate poller vs. renderer race condition.
      // Renderer push is authoritative. If renderer updated within 3500ms, skip poller entirely.
      if (Date.now() - lastPlayerStateTimestamp < 3500) {
        return;
      }

      const wins = BrowserWindow.getAllWindows();
      const mainWin = wins.find((w) => !w.isDestroyed() && w !== overlayWindow && w !== karaokeWindow);
      if (mainWin && !mainWin.isDestroyed()) {
        const pState = await mainWin.webContents.executeJavaScript(`
          (() => {
            return typeof window.__getPlayerState === "function" ? window.__getPlayerState() : null;
          })()
        `).catch(() => null);

        if (pState && pState.data) {
          if (!lastPlayerState || lastPlayerState.track?.id !== pState.data.trackMeta?.id || lastPlayerState.isPlaying !== pState.data.isPlaying) {
            updateDiscordActivity(pState.data);
          }
        }
      }
    } catch (e) {}
  }, 1500);
}

let vsthemesWindow = null;

function setupMediaProtocol() {
  try {
    if (protocol && protocol.handle) {
      protocol.handle("ym-media", (request) => {
        try {
          let raw = request.url.replace(/^ym-media:\/\//, "");
          let filePath = decodeURIComponent(raw);
          if (filePath.startsWith("/") && filePath.length > 2 && filePath[2] === ":") {
            filePath = filePath.slice(1);
          }
          const fileUrl = pathToFileURL(filePath).toString();
          return net.fetch(fileUrl);
        } catch (err) {
          console.error("[ym-media error]", err);
          return new Response("Not found", { status: 404 });
        }
      });
    }
  } catch (err) {
    console.error("[setupMediaProtocol]", err);
  }
}

let downloadListenerAttached = false;

async function extractWallpaperZip(zipPath, wallpapersDir) {
  const extractDir = path.join(wallpapersDir, `unpacked_${Date.now()}`);
  try {
    fs.mkdirSync(extractDir, { recursive: true });
  } catch (e) {}

  await new Promise((resolve) => {
    // Try native Windows tar.exe first (fast, silent)
    exec(`tar -xf "${zipPath}" -C "${extractDir}"`, (err) => {
      if (!err) return resolve();
      // Fallback to powershell Expand-Archive
      exec(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${extractDir}' -Force"`, () => {
        resolve();
      });
    });
  });

  function findMediaFiles(dir) {
    let results = [];
    try {
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat && stat.isDirectory()) {
          results = results.concat(findMediaFiles(full));
        } else if (/\.(mp4|webm|gif|mov|mkv)$/i.test(file)) {
          results.push({ path: full, size: stat.size, name: file });
        }
      }
    } catch (e) {}
    return results;
  }

  const media = findMediaFiles(extractDir);
  if (media.length > 0) {
    // Largest video file is the main wallpaper loop
    media.sort((a, b) => b.size - a.size);
    const chosen = media[0];
    const finalExt = path.extname(chosen.path);
    const baseName = path.basename(zipPath, path.extname(zipPath)).replace(/^(\d+_)/, "");
    const finalTarget = path.join(wallpapersDir, `${Date.now()}_${baseName}${finalExt}`);
    try {
      fs.copyFileSync(chosen.path, finalTarget);
      fs.rmSync(extractDir, { recursive: true, force: true });
      fs.unlinkSync(zipPath);
    } catch (e) {}
    return fs.existsSync(finalTarget) ? finalTarget : chosen.path;
  }

  return zipPath;
}

function ensureWallpaperDownloadListener() {
  if (downloadListenerAttached) return;
  const sess = session.defaultSession;
  if (!sess) return;
  downloadListenerAttached = true;

  sess.on("will-download", (_event, item, webContents) => {
    const filename = item.getFilename();
    console.log("[VSThemes Download Started]:", filename, item.getURL());

    const wallpapersDir = path.join(appFolder, "wallpapers");
    try {
      fs.mkdirSync(wallpapersDir, { recursive: true });
    } catch (e) {}

    const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const targetPath = path.join(wallpapersDir, `${Date.now()}_${cleanName}`);
    item.setSavePath(targetPath);

    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed() && win !== vsthemesWindow && win !== overlayWindow && win !== karaokeWindow) {
        try {
          win.webContents.send("yandexMusicMod.wallpaperDownloadStarted", filename);
        } catch (e) {}
      }
    });

    item.on("updated", (_e, state) => {
      if (state === "progressing") {
        const received = item.getReceivedBytes();
        const total = item.getTotalBytes();
        const percent = total > 0 ? Math.round((received / total) * 100) : 0;
        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed() && win !== vsthemesWindow && win !== overlayWindow && win !== karaokeWindow) {
            try {
              win.webContents.send("yandexMusicMod.wallpaperDownloadProgress", { filename, received, total, percent });
            } catch (e) {}
          }
        });
      }
    });

    item.once("done", async (_e, state) => {
      if (state === "completed") {
        console.log("[VSThemes Download Finished]:", targetPath);
        let finalPath = targetPath;
        if (targetPath.toLowerCase().endsWith(".zip")) {
          try {
            finalPath = await extractWallpaperZip(targetPath, wallpapersDir);
          } catch (err) {
            console.error("[VSThemes Unpack Error]:", err);
          }
        }
        const finalName = path.basename(finalPath);
        console.log("[VSThemes Wallpaper Ready]:", finalPath);
        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed() && win !== vsthemesWindow && win !== overlayWindow && win !== karaokeWindow) {
            try {
              win.webContents.send("yandexMusicMod.wallpaperDownloaded", finalPath, finalName);
            } catch (e) {}
          }
        });
      } else {
        console.warn("[VSThemes Download Cancelled/Failed]:", state);
      }
    });
  });
}

function openVSThemesWindow() {
  if (vsthemesWindow && !vsthemesWindow.isDestroyed()) {
    if (vsthemesWindow.isMinimized()) vsthemesWindow.restore();
    vsthemesWindow.show();
    vsthemesWindow.focus();
    return;
  }

  ensureWallpaperDownloadListener();

  vsthemesWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    title: "Каталог живых обоев VSThemes - Yandex Music Mod",
    backgroundColor: "#0d0e15",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  vsthemesWindow.webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
  );

  // Prevent blank popups and intercept all download and category clicks
  vsthemesWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log("[VSThemes setWindowOpenHandler intercepted]:", url);
    if (url.match(/\.(zip|rar|7z|mp4|webm|gif)(\?.*)?$/i) || url.includes("download") || url.includes("/load/") || url.includes("/d/")) {
      vsthemesWindow.webContents.downloadURL(url);
      return { action: "deny" };
    }
    if (url.includes("vsthemes.org")) {
      vsthemesWindow.loadURL(url);
      return { action: "deny" };
    }
    return { action: "deny" };
  });

  // Inject script to unlock countdowns and keep all navigation within the window
  vsthemesWindow.webContents.on("did-finish-load", () => {
    vsthemesWindow.webContents.executeJavaScript(`
      (() => {
        try {
          document.querySelectorAll('.download-disabled, [disabled]').forEach(el => {
            el.classList.remove('download-disabled');
            el.removeAttribute('disabled');
          });
          document.querySelectorAll('a[target="_blank"]').forEach(a => {
            a.target = '_self';
          });
          const style = document.createElement('style');
          style.textContent = \`
            iframe[src*="ads"], div[class*="banner"], div[id*="ad_"] {
              display: none !important;
            }
            .download-disabled {
              opacity: 1 !important;
              pointer-events: auto !important;
            }
          \`;
          document.head.appendChild(style);
        } catch(e) {}
      })()
    `).catch(() => {});
  });

  vsthemesWindow.loadURL("https://vsthemes.org/wallpapers/live/");

  vsthemesWindow.on("closed", () => {
    vsthemesWindow = null;
  });
}

// ==========================================
// SETUP IPC HANDLERS
// ==========================================
function setupIpcHandlers() {
  // Prevent any official update installation from quitting and executing updater
  try {
    ipcMain.removeAllListeners("desktop:application:install-update");
    ipcMain.on("desktop:application:install-update", () => {
      console.warn("[Mod Main] Blocked official update installation request.");
    });
  } catch (e) {}
  // VSThemes In-App Catalog
  ipcMain.on("yandexMusicMod.openVSThemes", () => {
    openVSThemesWindow();
  });

  // Local File Selector Dialog for Wallpapers
  ipcMain.handle("yandexMusicMod.selectWallpaperFile", async () => {
    const result = await dialog.showOpenDialog({
      title: "Выберите живые обои (MP4, WebM, GIF, JPG, PNG)",
      filters: [
        { name: "Видео и анимации", extensions: ["mp4", "webm", "gif"] },
        { name: "Изображения", extensions: ["jpg", "jpeg", "png", "webp"] },
        { name: "Все файлы", extensions: ["*"] },
      ],
      properties: ["openFile"],
    });
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // Get list of downloaded wallpapers
    // Delete downloaded wallpaper
  ipcMain.handle("yandexMusicMod.deleteDownloadedWallpaper", async (_ev, filePath) => {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (e) {
      console.error("[Delete wallpaper error]", e);
    }
    return false;
  });

  ipcMain.handle("yandexMusicMod.getDownloadedWallpapers", async () => {
    const wallpapersDir = path.join(appFolder, "wallpapers");
    try {
      if (!fs.existsSync(wallpapersDir)) return [];
      const files = fs.readdirSync(wallpapersDir);
      return files
        .filter((f) => /\.(mp4|webm|gif|png|jpe?g)$/i.test(f))
        .map((f) => {
          const fullPath = path.join(wallpapersDir, f);
          const stat = fs.statSync(fullPath);
          return {
            filename: f,
            path: fullPath,
            mtime: stat.mtimeMs,
            size: stat.size,
          };
        })
        .sort((a, b) => b.mtime - a.mtime);
    } catch (e) {
      return [];
    }
  });

  // Storage API
  ipcMain.handle("yandexMusicMod.getStorageValue", (_ev, key) => {
    return settingsManager.get(key);
  });

  ipcMain.on("yandexMusicMod.setStorageValue", (_ev, key, value) => {
    settingsManager.set(key, value);
  });

  ipcMain.handle("yandexMusicMod.getAllSettings", () => {
    return settingsManager.getAll();
  });

  // DevTools
  ipcMain.on("yandexMusicMod.openDevTools", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.webContents.openDevTools({ mode: "detach" });
    }
  });

  // Settings Modal
  ipcMain.on("yandexMusicMod.openModSettings", () => {
    openSettingsInMainWindow();
  });

  // Overlay Windows Controls
  ipcMain.on("yandexMusicMod.toggleOverlay", () => {
    toggleOverlayWindow();
  });

  ipcMain.on("yandexMusicMod.toggleKaraoke", () => {
    toggleKaraokeWindow();
  });

  ipcMain.on("yandexMusicMod.setOverlayClickThrough", (_ev, enabled) => {
    settingsManager.set("overlay/clickThrough", !!enabled);
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setIgnoreMouseEvents(!!enabled, { forward: true });
    }
  });

  ipcMain.on("yandexMusicMod.setOverlayIgnoreMouseEvents", (_ev, ignore, forward) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setIgnoreMouseEvents(!!ignore, { forward: forward !== false });
    }
  });

  // Pull Handlers for immediate cache hydration
  ipcMain.handle("yandexMusicMod.getLastPlayerState", () => {
    return lastPlayerState;
  });

  ipcMain.handle("yandexMusicMod.getLastLyrics", () => {
    return lastLyricsData;
  });

  // Action executed from Overlay -> forward to Main App Window (deduplicated: executePlayerAction only)
  ipcMain.on("yandexMusicMod.overlayAction", (_ev, action, payload) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win !== overlayWindow && win !== karaokeWindow && !win.isDestroyed()) {
        try {
          win.webContents.send("yandexMusicMod.executePlayerAction", action, payload);
        } catch (e) {}
      }
    });
  });

  // Player State updated from Main App Window -> forward to Overlay, Karaoke, Discord
  ipcMain.on("yandexMusicMod.updatePlayerState", (_ev, state) => {
    lastPlayerState = state;
    lastPlayerStateTimestamp = Date.now();

    // 1. Forward to Overlay
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      try {
        overlayWindow.webContents.send("overlay:trackUpdate", state);
      } catch (e) {}
    }

    // 2. Forward to Karaoke
    if (karaokeWindow && !karaokeWindow.isDestroyed()) {
      try {
        karaokeWindow.webContents.send("karaoke:trackUpdate", state);
      } catch (e) {}
    }

    // 3. Discord RPC
    updateDiscordActivity(state);
  });

  // Resize Overlay dynamically (e.g. expanding for Apple Music full lyrics view)
  ipcMain.on("yandexMusicMod.resizeOverlay", (_ev, width, height) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      try {
        const [curW, curH] = overlayWindow.getSize();
        const targetW = Math.max(380, Math.round(width || curW));
        const targetH = Math.max(160, Math.round(height || curH));
        overlayWindow.setSize(targetW, targetH);
      } catch (e) {}
    }
  });

  // Open external URL in system browser
  ipcMain.on("yandexMusicMod.openExternal", (_ev, url) => {
    try {
      if (url && typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
        shell.openExternal(url);
      }
    } catch (e) {
      console.error("[Mod Main] openExternal error:", e);
    }
  });

  // Lyrics forward to Karaoke and Overlay
  ipcMain.on("yandexMusicMod.updateLyrics", (_ev, lyricsData) => {
    lastLyricsData = lyricsData;
    if (karaokeWindow && !karaokeWindow.isDestroyed()) {
      try {
        karaokeWindow.webContents.send("karaoke:lyricsUpdate", lyricsData);
      } catch (e) {}
    }
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      try {
        overlayWindow.webContents.send("overlay:lyricsUpdate", lyricsData);
      } catch (e) {}
    }
  });

  // Multi-Tier Cascading Lyrics Fetcher (Yandex Supplement -> LRCLib Direct -> Genius Search)
  ipcMain.handle("yandexMusicMod.fetchLyrics", async (_ev, trackTitle, trackArtist, trackId = null, oauthToken = null) => {
    if (!trackTitle && !trackId) return null;
    const cleanTitleLower = (trackTitle || "").trim().toLowerCase();
    if (BUILTIN_SYNCED_LYRICS[cleanTitleLower]) {
      return BUILTIN_SYNCED_LYRICS[cleanTitleLower];
    }
    if (!trackTitle && !trackId) return null;
    try {
      const cleanTitle = (trackTitle || "").trim();
      const cleanArtist = (trackArtist || "").trim();

      const fetchJson = (url, extraHeaders = {}) => {
        return new Promise((resolve) => {
          const req = https.get(
            url,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json, text/plain, */*",
                ...extraHeaders,
              },
              timeout: 2500,
            },
            (res) => {
              let data = "";
              res.on("data", (chunk) => (data += chunk));
              res.on("end", () => {
                try {
                  if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                  } else {
                    resolve(null);
                  }
                } catch (e) {
                  resolve(null);
                }
              });
            }
          );
          req.on("error", () => resolve(null));
          req.on("timeout", () => {
            req.destroy();
            resolve(null);
          });
        });
      };

      const fetchText = (url, extraHeaders = {}) => {
        return new Promise((resolve) => {
          const req = https.get(
            url,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                ...extraHeaders,
              },
              timeout: 3500,
            },
            (res) => {
              let data = "";
              res.on("data", (chunk) => (data += chunk));
              res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                  resolve(data);
                } else {
                  resolve(null);
                }
              });
            }
          );
          req.on("error", () => resolve(null));
          req.on("timeout", () => {
            req.destroy();
            resolve(null);
          });
        });
      };

      let plainLyricsFallback = null;

      // 0. Auto-resolve Yandex trackId if missing
      if ((!trackId || !String(trackId).match(/^\d+$/)) && cleanTitle) {
        try {
          const searchData = await fetchJson(`https://api.music.yandex.net/search?text=${encodeURIComponent(cleanTitle + " " + cleanArtist)}&type=track&page=0`);
          if (searchData && searchData.result && searchData.result.tracks && searchData.result.tracks.results && searchData.result.tracks.results.length > 0) {
            trackId = String(searchData.result.tracks.results[0].id);
          }
        } catch (_se) {}
      }

      // 1. Tier 1: Official Yandex Music Track Supplement (Zero-latency native synced lyrics)
      if (trackId && String(trackId).match(/^\d+$/)) {
        try {
          const ymHeaders = {
            "User-Agent": "YandexMusicDesktopAppWindows/5.124.1",
            "X-Yandex-Music-Client": "YandexMusicDesktopAppWindows/5.124.1",
            "X-Yandex-Music-Frontend": "new",
          };
          if (oauthToken) ymHeaders["Authorization"] = oauthToken;
          const yandexData = await fetchJson(`https://api.music.yandex.net/tracks/${trackId}/supplement`, ymHeaders);

          if (yandexData && yandexData.result && yandexData.result.lyrics) {
            const lyricsObj = yandexData.result.lyrics;
            if (Array.isArray(lyricsObj.syncLyrics) && lyricsObj.syncLyrics.length > 0) {
              const lrcLines = lyricsObj.syncLyrics.map((item) => {
                const totalSec = (item.timestamp || item.offset || 0) / 1000;
                const m = Math.floor(totalSec / 60);
                const s = Math.floor(totalSec % 60);
                const cs = Math.floor((totalSec % 1) * 100);
                const timeTag = `[${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}.${cs < 10 ? "0" : ""}${cs}]`;
                return `${timeTag} ${item.line || item.text || ""}`;
              });
              return lrcLines.join("\n");
            } else if (lyricsObj.fullLyrics) {
              plainLyricsFallback = lyricsObj.fullLyrics;
            }
          }
        } catch (e) {}
      }

      // 2. Tier 2: LRCLib Direct Match (with fast timeout in case of 502)
      if (cleanTitle) {
        try {
          const query = new URLSearchParams({
            track_name: cleanTitle,
            artist_name: cleanArtist,
          }).toString();
          const direct = await fetchJson(`https://lrclib.net/api/get?${query}`);
          if (direct && direct.syncedLyrics) {
            return direct.syncedLyrics;
          }
          if (direct && direct.plainLyrics && !plainLyricsFallback) {
            plainLyricsFallback = direct.plainLyrics;
          }
        } catch (_lrce) {}
      }

      // 3. Tier 3: Genius API & Scraper Fallback (Covers virtually all Russian rap/pop tracks)
      if (cleanTitle) {
        try {
          const q = encodeURIComponent(`${cleanArtist} ${cleanTitle}`.trim());
          const geniusSearch = await fetchJson(`https://genius.com/api/search/multi?q=${q}`);
          if (geniusSearch && geniusSearch.response && geniusSearch.response.sections) {
            let songUrl = null;
            const candidates = [];
            const hasCyrillicQuery = /[а-яё]/i.test(`${cleanArtist} ${cleanTitle}`);

            for (const sec of geniusSearch.response.sections) {
              if (sec.type === "song" && Array.isArray(sec.hits)) {
                for (const hit of sec.hits) {
                  const res = hit.result;
                  if (!res || !res.url) continue;

                  const fullTitle = res.full_title || res.title || "";
                  const hitArtist = (res.primary_artist && res.primary_artist.name) || "";
                  const hitUrl = res.url || "";

                  // 1. Strict rejection of translation/romanization bot accounts & translation titles
                  const isTransAccount = /^genius\s*(english|russian|romanization|translation|türkçe|deutsch|español|polskie)/i.test(hitArtist);
                  const isTransTitle = /\(.*(translation|romaniz|traduc|перевод|çeviri|übersetzung).*\)/i.test(fullTitle);
                  const isTransUrl = /-(english-translation|translations|romanized|transition)-lyrics/i.test(hitUrl);

                  if (isTransAccount || isTransTitle || isTransUrl) {
                    continue; // Skip translations entirely!
                  }

                  let score = 10;
                  const lowerHitArtist = hitArtist.toLowerCase();
                  const lowerCleanArtist = cleanArtist.toLowerCase().replace(/,/g, " ");
                  const artistTokens = lowerCleanArtist.split(/\s+/).filter(Boolean);
                  for (const tok of artistTokens) {
                    if (tok.length > 2 && lowerHitArtist.includes(tok)) {
                      score += 15;
                    }
                  }

                  if (hasCyrillicQuery && /[а-яё]/i.test(fullTitle)) {
                    score += 25;
                  }

                  const lowerTitle = cleanTitle.toLowerCase();
                  if (fullTitle.toLowerCase().includes(lowerTitle)) {
                    score += 25;
                  }

                  const isSpeedUp = /speed\s*up|sped\s*up/i.test(cleanTitle);
                  if (isSpeedUp && /speed\s*up|sped\s*up/i.test(fullTitle)) {
                    score += 20;
                  }

                  candidates.push({ score, url: hitUrl });
                }
              }
            }

            if (candidates.length > 0) {
              candidates.sort((a, b) => b.score - a.score);
              songUrl = candidates[0].url;
            }

            if (songUrl) {
              const html = await fetchText(songUrl);
              if (html) {
                const containerRegex = /<div[^>]*data-lyrics-container="true"[^>]*>/gi;
                let match;
                const blocks = [];
                while ((match = containerRegex.exec(html)) !== null) {
                  const start = containerRegex.lastIndex;
                  let depth = 1;
                  const tagRegex = /<\s*(\/)?\s*([a-zA-Z0-9]+)[^>]*>/g;
                  tagRegex.lastIndex = start;
                  let tagMatch;
                  while (depth > 0 && (tagMatch = tagRegex.exec(html)) !== null) {
                    const isClosing = Boolean(tagMatch[1]);
                    const tagName = tagMatch[2].toLowerCase();
                    if (tagName === "div") {
                      if (isClosing) depth--;
                      else depth++;
                    }
                    if (depth === 0) {
                      let block = html.slice(start, tagMatch.index);
                      block = block.replace(/<div data-exclude-from-selection="true"[\s\S]*?<\/div>/gi, "");
                      block = block.replace(/<br\s*\/?>/gi, "\n");
                      block = block.replace(/<\/?(div|p)[^>]*>/gi, "\n");
                      block = block.replace(/<[^>]+>/g, "");
                      block = block
                        .replace(/&amp;/g, "&")
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&#x27;/g, "'")
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">");

                      const cleanBlockLines = block
                        .split("\n")
                        .map((l) => l.trim())
                        .filter((l) => {
                          if (!l) return false;
                          if (/^<[a-z0-9_-]+/i.test(l)) return false;
                          if (/^(class|id|data-)\s*=/i.test(l)) return false;
                          if (l.includes("Lyrics__Container")) return false;
                          if (/^\d+\s*Contributors/i.test(l)) return false;
                          if (/^\d*\s*Embed$/i.test(l)) return false;
                          if (/^\[?You might also like/i.test(l)) return false;
                          if (/^Translations$/i.test(l) || /^English$/i.test(l)) return false;
                          if (/Lyrics$/i.test(l) && l.includes("Lyrics")) return false;
                          return true;
                        });

                      if (cleanBlockLines.length > 0) {
                        blocks.push(cleanBlockLines.join("\n"));
                      }
                      break;
                    }
                  }
                }

                const geniusFull = blocks.join("\n").trim();
                if (geniusFull) {
                  return geniusFull;
                }
              }
            }
          }
        } catch (_ge) {}
      }

      if (plainLyricsFallback) {
        return plainLyricsFallback;
      }

      return null;
    } catch (err) {
      return null;
    }
  });

  // Directory pickers
  ipcMain.handle("yandexMusicMod.selectDownloadFolder", async (_ev) => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Выберите папку для сохранения музыки",
    });
    if (!result.canceled && result.filePaths.length > 0) {
      settingsManager.set("downloadFolderPath", result.filePaths[0]);
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.on("yandexMusicMod.openDownloadDirectory", () => {
    const folder = settingsManager.get("downloadFolderPath", app.getPath("downloads"));
    shell.openPath(folder);
  });

  ipcMain.handle("yandexMusicMod.openFolder", (_ev, folderPath) => {
    if (folderPath) {
      shell.openPath(folderPath);
      return { success: true };
    }
    return { success: false };
  });
}

// Auto-run initialization
initModMain();

module.exports = {
  initModMain,
  getOrCreateOverlayWindow,
  getOrCreateKaraokeWindow,
  toggleOverlayWindow,
  toggleKaraokeWindow,
  toggleOverlayGhostMode,
};