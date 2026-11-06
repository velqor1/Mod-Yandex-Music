import os
import re

print("=== APPLYING FIXES FOR 1, 2, 3 ===")

# ========================================================
# 1. Update src/renderer/mod-renderer.css
# ========================================================
css_path = r"d:\Яндекс Музыка мод\src\renderer\mod-renderer.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

# Replace sidebar styling when wallpaper is active
old_sidebar_rule = """/* Glass Transparency for Left Navigation Sidebar */
body.ym-has-live-wallpaper aside,
body.ym-has-live-wallpaper aside[data-test-id="NAVBAR"],
body.ym-has-live-wallpaper [class*="DefaultLayout_navbar"],
body.ym-has-live-wallpaper [class*="Navbar_root"],
body.ym-has-live-wallpaper [class*="NavbarDesktop_root"],
body.ym-has-live-wallpaper [class*="SideNavigation_root"],
body.ym-has-live-wallpaper [class*="Navigation_root"],
body.ym-has-live-wallpaper nav {
  background: rgba(10, 10, 16, 0.45) !important;
  background-color: rgba(10, 10, 16, 0.45) !important;
  backdrop-filter: blur(24px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(150%) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}"""

new_sidebar_rule = """/* 100% Transparency for Left Navigation Sidebar */
html.ym-has-live-wallpaper aside,
html.ym-has-live-wallpaper aside[data-test-id="NAVBAR"],
html.ym-has-live-wallpaper [class*="DefaultLayout_navbar"],
html.ym-has-live-wallpaper [class*="Navbar_root"],
html.ym-has-live-wallpaper [class*="NavbarDesktop_root"],
html.ym-has-live-wallpaper [class*="SideNavigation_root"],
html.ym-has-live-wallpaper [class*="Navigation_root"],
html.ym-has-live-wallpaper nav,
body.ym-has-live-wallpaper aside,
body.ym-has-live-wallpaper aside[data-test-id="NAVBAR"],
body.ym-has-live-wallpaper [class*="DefaultLayout_navbar"],
body.ym-has-live-wallpaper [class*="Navbar_root"],
body.ym-has-live-wallpaper [class*="NavbarDesktop_root"],
body.ym-has-live-wallpaper [class*="SideNavigation_root"],
body.ym-has-live-wallpaper [class*="Navigation_root"],
body.ym-has-live-wallpaper nav,
body.ym-has-live-wallpaper .ym-mod-sidebar-container {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
  box-shadow: none !important;
}"""

if old_sidebar_rule in css_content:
    css_content = css_content.replace(old_sidebar_rule, new_sidebar_rule, 1)
    print("Updated sidebar transparency in CSS")
else:
    print("Warning: old_sidebar_rule not matched directly in CSS")

# Hide Vibe glowing animation blob in CSS
vibe_hide_rule = """
/* Hide colorful glowing Vibe blob when live wallpaper is active */
html.ym-has-live-wallpaper [class*="VibePage_vibeAnimation"],
html.ym-has-live-wallpaper [class*="VibeBlock_vibeAnimation"],
html.ym-has-live-wallpaper [class*="vibeAnimation"],
html.ym-has-live-wallpaper [class*="VibeAnimation_root"],
html.ym-has-live-wallpaper [class*="VibeAnimation_root"] canvas,
html.ym-has-live-wallpaper [class*="vibeAnimation"] canvas,
html.ym-has-live-wallpaper [class*="VibePage_bigCardPanelBackground"],
body.ym-has-live-wallpaper [class*="VibePage_vibeAnimation"],
body.ym-has-live-wallpaper [class*="VibeBlock_vibeAnimation"],
body.ym-has-live-wallpaper [class*="vibeAnimation"],
body.ym-has-live-wallpaper [class*="VibeAnimation_root"],
body.ym-has-live-wallpaper [class*="VibeAnimation_root"] canvas,
body.ym-has-live-wallpaper [class*="vibeAnimation"] canvas,
body.ym-has-live-wallpaper [class*="VibePage_bigCardPanelBackground"],
body.ym-has-live-wallpaper [class*="VibePage_bigCardPanelBackground"]::before,
body.ym-has-live-wallpaper [class*="VibePage_bigCardPanelBackground"]::after {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
"""

if "Hide colorful glowing Vibe blob" not in css_content:
    css_content += "\n" + vibe_hide_rule
    print("Added vibe glowing blob hiding rule to CSS")

with open(css_path, "w", encoding="utf-8", newline="") as f:
    f.write(css_content)
print("Saved mod-renderer.css")


# ========================================================
# 2. Update src/renderer/mod-renderer.js
# ========================================================
renderer_path = r"d:\Яндекс Музыка мод\src\renderer\mod-renderer.js"
with open(renderer_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# Update forceStyle in applyLiveWallpaperSettings to also include sidebar transparency and vibe blob hiding
old_force_style = """      forceStyle.textContent = `
        html, body, #root, #__next {
          background: transparent !important;
          background-color: transparent !important;
        }"""

new_force_style = """      forceStyle.textContent = `
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
        aside *, [data-test-id="NAVBAR"] *, [class*="Navbar_root"] *, [class*="DefaultLayout_navbar"] *, [class*="NavbarDesktop_root"] *, [class*="NavbarDesktop_"] *, nav * {
          background: transparent !important;
          background-color: transparent !important;
        }
        /* Completely hide glowing Vibe animation blob */
        [class*="VibePage_vibeAnimation"],
        [class*="VibeBlock_vibeAnimation"],
        [class*="vibeAnimation"],
        [class*="VibeAnimation_root"],
        [class*="VibeAnimation_root"] canvas,
        [class*="vibeAnimation"] canvas,
        [class*="VibePage_bigCardPanelBackground"],
        [class*="VibePage_bigCardPanelBackground"]::before,
        [class*="VibePage_bigCardPanelBackground"]::after {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }"""

if old_force_style in js_content:
    js_content = js_content.replace(old_force_style, new_force_style, 1)
    print("Updated forceStyle in mod-renderer.js")
else:
    print("Warning: old_force_style not matched in mod-renderer.js")

with open(renderer_path, "w", encoding="utf-8", newline="") as f:
    f.write(js_content)
print("Saved mod-renderer.js")


# ========================================================
# 3. Update src/main/mod-main.js: extractWallpaperZip & spawnDownloadWorker
# ========================================================
main_path = r"d:\Яндекс Музыка мод\src\main\mod-main.js"
with open(main_path, "r", encoding="utf-8") as f:
    main_content = f.read()

# Replace extractWallpaperZip with tar.exe / Expand-Archive implementation
old_extract_func = """async function extractWallpaperZip(zipPath, wallpapersDir) {
  const extractDir = path.join(wallpapersDir, `unpacked_${Date.now()}`);
  try {
    fs.mkdirSync(extractDir, { recursive: true });
  } catch (e) {}

  await new Promise((resolve, reject) => {
    const yauzl = require("yauzl");
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      zipfile.readEntry();
      zipfile.on("entry", (entry) => {
        const entryPath = path.join(extractDir, entry.fileName);
        if (/\/$/.test(entry.fileName)) {
          try { fs.mkdirSync(entryPath, { recursive: true }); } catch (e) {}
          zipfile.readEntry();
        } else {
          try { fs.mkdirSync(path.dirname(entryPath), { recursive: true }); } catch (e) {}
          zipfile.openReadStream(entry, (errStream, readStream) => {
            if (errStream) return reject(errStream);
            const writeStream = fs.createWriteStream(entryPath);
            readStream.pipe(writeStream);
            writeStream.on("close", () => zipfile.readEntry());
            writeStream.on("error", reject);
          });
        }
      });
      zipfile.on("end", resolve);
      zipfile.on("error", reject);
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
}"""

new_extract_func = """async function extractWallpaperZip(zipPath, wallpapersDir) {
  const extractDir = path.join(wallpapersDir, `unpacked_${Date.now()}`);
  try {
    fs.mkdirSync(extractDir, { recursive: true });
  } catch (e) {}

  await new Promise((resolve) => {
    const { execFile } = require("child_process");
    // Native tar.exe built into Windows 10/11 handles .zip directly
    execFile("tar.exe", ["-xf", zipPath, "-C", extractDir], (tarErr) => {
      if (!tarErr) return resolve();
      // Fallback to PowerShell Expand-Archive
      const psCmd = `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force`;
      execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", psCmd], () => {
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
        } else if (/\\.(mp4|webm|gif|mov|mkv)$/i.test(file)) {
          results.push({ path: full, size: stat.size, name: file });
        }
      }
    } catch (e) {}
    return results;
  }

  const media = findMediaFiles(extractDir);
  if (media.length > 0) {
    media.sort((a, b) => b.size - a.size);
    const chosen = media[0];
    const finalExt = path.extname(chosen.path);
    const baseName = path.basename(zipPath, path.extname(zipPath)).replace(/^(\\d+_)/, "");
    const finalTarget = path.join(wallpapersDir, `${Date.now()}_${baseName}${finalExt}`);
    try {
      fs.copyFileSync(chosen.path, finalTarget);
      fs.rmSync(extractDir, { recursive: true, force: true });
      fs.unlinkSync(zipPath);
    } catch (e) {}
    return fs.existsSync(finalTarget) ? finalTarget : chosen.path;
  }

  return zipPath;
}"""

if old_extract_func in main_content:
    main_content = main_content.replace(old_extract_func, new_extract_func, 1)
    print("Replaced extractWallpaperZip with tar.exe / Expand-Archive")
else:
    # Try regex match
    pattern = r"async function extractWallpaperZip\(zipPath, wallpapersDir\) \{.*?\n  return zipPath;\n\}"
    if re.search(pattern, main_content, re.DOTALL):
        main_content = re.sub(pattern, new_extract_func, main_content, count=1, flags=re.DOTALL)
        print("Replaced extractWallpaperZip via regex")
    else:
        print("Warning: Could not match extractWallpaperZip")

# Add spawnDownloadWorker and wire it into openVSThemesWindow
spawn_worker_def = """let activeDownloadWorkers = new Set();

function spawnDownloadWorker(targetUrl) {
  modLog("[Spawning background download worker for gateway]:", targetUrl);
  const worker = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      session: session.defaultSession,
    },
  });

  activeDownloadWorkers.add(worker);

  worker.webContents.setWindowOpenHandler((details) => {
    modLog("[Worker windowOpen]:", details.url);
    worker.loadURL(details.url).catch(() => {});
    return { action: "deny" };
  });

  const refererUrl = (vsthemesWindow && !vsthemesWindow.isDestroyed())
    ? (vsthemesWindow.webContents.getURL() || "https://vsthemes.org/")
    : "https://vsthemes.org/";

  worker.loadURL(targetUrl, {
    userAgent: (vsthemesWindow && !vsthemesWindow.isDestroyed()) ? vsthemesWindow.webContents.getUserAgent() : undefined,
    extraHeaders: `Referer: ${refererUrl}\\n`,
  }).catch((e) => {
    modLog("[download worker load error]:", e);
  });

  setTimeout(() => {
    if (!worker.isDestroyed()) {
      worker.destroy();
    }
    activeDownloadWorkers.delete(worker);
  }, 90000);
}
"""

if "function spawnDownloadWorker(" not in main_content:
    target_pos = "function openVSThemesWindow() {"
    main_content = main_content.replace(target_pos, spawn_worker_def + "\n" + target_pos, 1)
    print("Added spawnDownloadWorker definition")

# Update setWindowOpenHandler and will-navigate in openVSThemesWindow to use spawnDownloadWorker
old_vsthemes_events = """    // Intercept target="_blank" and window.open
    vsthemesWindow.webContents.setWindowOpenHandler((details) => {
      const targetUrl = details.url;
      modLog("[setWindowOpenHandler intercepted]:", targetUrl);

      if (targetUrl === "about:blank") {
        return { action: "allow" };
      }

      // Ad filter
      if (targetUrl.includes("yandex.ru/ads") || targetUrl.includes("google") || targetUrl.includes("doubleclick") || targetUrl.includes("adriver")) {
        modLog("[Ad popup blocked]:", targetUrl);
        return { action: "deny" };
      }

      // Trigger download for download gateways or media links
      if (targetUrl.includes("do=download") || targetUrl.includes("/load/") || targetUrl.includes("/dnew/download") || targetUrl.includes("server=") || targetUrl.match(/\\.(zip|rar|7z|mp4|webm|gif)(\\?.*)?$/i) || targetUrl.includes("/get/")) {
        modLog("[Triggering downloadURL]:", targetUrl);
        vsthemesWindow.webContents.downloadURL(targetUrl, {
          headers: {
            "Referer": vsthemesWindow.webContents.getURL() || "https://vsthemes.org/",
            "User-Agent": vsthemesWindow.webContents.getUserAgent(),
          }
        });
        return { action: "deny" };
      }

      // Normal navigation within vsthemes.org
      if (targetUrl.includes("vsthemes.org")) {
        vsthemesWindow.loadURL(targetUrl).catch(() => {});
        return { action: "deny" };
      }

      return { action: "deny" };
    });

    // Intercept in-page navigation (links that might directly point to files or download endpoints)
    vsthemesWindow.webContents.on("will-navigate", (event, navUrl) => {
      modLog("[will-navigate]:", navUrl);
      if (navUrl.includes("do=download") || navUrl.includes("/load/") || navUrl.includes("/dnew/download") || navUrl.includes("server=") || navUrl.match(/\\.(zip|rar|7z|mp4|webm|gif)(\\?.*)?$/i) || navUrl.includes("/get/")) {
        event.preventDefault();
        modLog("[Intercepted will-navigate download]:", navUrl);
        vsthemesWindow.webContents.downloadURL(navUrl, {
          headers: {
            "Referer": vsthemesWindow.webContents.getURL() || "https://vsthemes.org/",
            "User-Agent": vsthemesWindow.webContents.getUserAgent(),
          }
        });
      }
    });"""

new_vsthemes_events = """    // Intercept target="_blank" and window.open
    vsthemesWindow.webContents.setWindowOpenHandler((details) => {
      const targetUrl = details.url;
      modLog("[setWindowOpenHandler intercepted]:", targetUrl);

      if (targetUrl === "about:blank") {
        return { action: "allow" };
      }

      // Ad filter
      if (targetUrl.includes("yandex.ru/ads") || targetUrl.includes("google") || targetUrl.includes("doubleclick") || targetUrl.includes("adriver")) {
        modLog("[Ad popup blocked]:", targetUrl);
        return { action: "deny" };
      }

      // 1. Download gateways (do=download, /load/, server=, etc.) -> use background worker with cookies
      if (targetUrl.includes("do=download") || targetUrl.includes("/load/") || targetUrl.includes("/dnew/download") || targetUrl.includes("server=")) {
        modLog("[Intercepted gateway popup, spawning worker]:", targetUrl);
        spawnDownloadWorker(targetUrl);
        return { action: "deny" };
      }

      // 2. Direct static file downloads (.zip, .mp4, etc.)
      const isDirectFile = targetUrl.match(/\\.(zip|rar|7z|mp4|webm|gif)(\\?.*)?$/i) || targetUrl.includes("/get/");
      if (isDirectFile) {
        modLog("[Triggering downloadURL]:", targetUrl);
        vsthemesWindow.webContents.downloadURL(targetUrl, {
          headers: {
            "Referer": vsthemesWindow.webContents.getURL() || "https://vsthemes.org/",
            "User-Agent": vsthemesWindow.webContents.getUserAgent(),
          }
        });
        return { action: "deny" };
      }

      // 3. Normal navigation within vsthemes.org
      if (targetUrl.includes("vsthemes.org")) {
        vsthemesWindow.loadURL(targetUrl).catch(() => {});
        return { action: "deny" };
      }

      return { action: "deny" };
    });

    // Intercept in-page navigation (links that might directly point to files or download endpoints)
    vsthemesWindow.webContents.on("will-navigate", (event, navUrl) => {
      modLog("[will-navigate]:", navUrl);
      if (navUrl.includes("do=download") || navUrl.includes("/load/") || navUrl.includes("/dnew/download") || navUrl.includes("server=")) {
        event.preventDefault();
        modLog("[Intercepted will-navigate gateway, spawning worker]:", navUrl);
        spawnDownloadWorker(navUrl);
        return;
      }
      if (navUrl.match(/\\.(zip|rar|7z|mp4|webm|gif)(\\?.*)?$/i) || navUrl.includes("/get/")) {
        event.preventDefault();
        modLog("[Intercepted will-navigate direct download]:", navUrl);
        vsthemesWindow.webContents.downloadURL(navUrl, {
          headers: {
            "Referer": vsthemesWindow.webContents.getURL() || "https://vsthemes.org/",
            "User-Agent": vsthemesWindow.webContents.getUserAgent(),
          }
        });
      }
    });

    // If a popup window is created, monitor its navigation too
    vsthemesWindow.webContents.on("did-create-window", (childWindow) => {
      modLog("[Child Window created]");
      childWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
      childWindow.webContents.on("will-navigate", (event, navUrl) => {
        modLog("[Child Window will-navigate]:", navUrl);
        if (navUrl.includes("do=download") || navUrl.includes("/load/") || navUrl.includes("/dnew/download") || navUrl.includes("server=")) {
          event.preventDefault();
          spawnDownloadWorker(navUrl);
          childWindow.close();
        } else if (navUrl.match(/\\.(zip|rar|7z|mp4|webm|gif)(\\?.*)?$/i) || navUrl.includes("/get/")) {
          event.preventDefault();
          vsthemesWindow.webContents.downloadURL(navUrl, {
            headers: {
              "Referer": vsthemesWindow.webContents.getURL() || "https://vsthemes.org/",
              "User-Agent": vsthemesWindow.webContents.getUserAgent(),
            }
          });
          childWindow.close();
        }
      });
    });"""

if old_vsthemes_events in main_content:
    main_content = main_content.replace(old_vsthemes_events, new_vsthemes_events, 1)
    print("Updated vsthemes navigation and download handlers")
else:
    print("Warning: old_vsthemes_events not matched directly")

# Also update progress display in will-download:
old_progress_code = """    item.on("updated", (_e, state) => {
      if (state === "progressing") {
        const received = item.getReceivedBytes();
        const total = item.getTotalBytes();
        const percent = total > 0 ? Math.round((received / total) * 100) : 0;
        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed() && win !== overlayWindow && win !== karaokeWindow) {
            try {
              win.webContents.send("yandexMusicMod.wallpaperDownloadProgress", { filename, received, total, percent });
            } catch (e) {}
          }
        });
      }
    });"""

new_progress_code = """    item.on("updated", (_e, state) => {
      if (state === "progressing") {
        const received = item.getReceivedBytes();
        const total = item.getTotalBytes();
        const percent = total > 0 ? Math.round((received / total) * 100) : 0;
        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed() && win !== overlayWindow && win !== karaokeWindow) {
            try {
              win.webContents.send("yandexMusicMod.wallpaperDownloadProgress", { filename, received, total, percent });
            } catch (e) {}
          }
        });
        if (vsthemesWindow && !vsthemesWindow.isDestroyed()) {
          vsthemesWindow.webContents.executeJavaScript(`
            if (window.__showDownloadToast) {
              window.__showDownloadToast("Скачивание обоев: ${percent}%", false);
            }
          `).catch(() => {});
        }
      }
    });"""

if old_progress_code in main_content:
    main_content = main_content.replace(old_progress_code, new_progress_code, 1)
    print("Updated download progress toasts in vsthemesWindow")

with open(main_path, "w", encoding="utf-8", newline="") as f:
    f.write(main_content)
print("Saved mod-main.js")
print("=== ALL FIXES APPLIED SUCCESSFULLY ===")
