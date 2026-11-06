with open('src/main/mod-main.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_track = """  let mainWindow = null;

  function trackMainWindow(win) {
    if (!win || win.isDestroyed()) return;
    // CRITICAL: Do NOT let auxiliary windows (overlay, karaoke, vsthemes catalog, download workers) be tracked as main window
    if (win === overlayWindow || win === karaokeWindow || win === vsthemesWindow) return;
    if (activeDownloadWorkers && activeDownloadWorkers.has(win)) return;

    if (!mainWindow) {
      mainWindow = win;
    }

    win.on("closed", () => {
      if (mainWindow === win) {
        mainWindow = null;
        // Check if any real main player window is still open
        const remaining = BrowserWindow.getAllWindows().filter((w) => 
          !w.isDestroyed() && 
          w !== overlayWindow && 
          w !== karaokeWindow && 
          w !== vsthemesWindow &&
          (!activeDownloadWorkers || !activeDownloadWorkers.has(w))
        );
        if (remaining.length === 0) {
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
          if (vsthemesWindow && !vsthemesWindow.isDestroyed()) {
            try { vsthemesWindow.destroy(); } catch (e) {}
            vsthemesWindow = null;
          }
          // Force immediate process exit only when the ACTUAL main app window is closed
          try { app.exit(0); } catch (e) { app.quit(); }
        }
      }
    });
  }"""

new_track = """  let mainWindow = null;

  function trackMainWindow(win) {
    if (!win || win.isDestroyed()) return;
    if (win === overlayWindow || win === karaokeWindow || win === vsthemesWindow) return;
    if (activeDownloadWorkers && activeDownloadWorkers.has(win)) return;

    mainWindow = win;

    win.on("closed", () => {
      if (mainWindow === win) {
        mainWindow = null;
      }
    });
  }"""

if old_track in content:
    content = content.replace(old_track, new_track, 1)
    with open('src/main/mod-main.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Removed premature app.exit from trackMainWindow in mod-main.js")
else:
    print("ERROR: old_track not found")
