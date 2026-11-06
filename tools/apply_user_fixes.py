import os, sys

def patch_main():
    with open('src/main/mod-main.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add extractWallpaperPkg implementation before extractWallpaperZip
    pkg_extractor_code = """// ==========================================
// WALLPAPER ENGINE (.pkg) EXTRACTOR
// Extracts video (mp4/webm) or high-res texture/preview from Wallpaper Engine scene packages
// ==========================================
async function extractWallpaperPkg(pkgPath, wallpapersDir) {
  try {
    if (!fs.existsSync(pkgPath)) return pkgPath;
    const fd = fs.openSync(pkgPath, "r");
    const headerBuf = Buffer.alloc(16);
    fs.readSync(fd, headerBuf, 0, 16, 0);

    const magicLen = headerBuf.readUInt32LE(0);
    if (magicLen <= 0 || magicLen > 32) {
      fs.closeSync(fd);
      return pkgPath;
    }

    const magicBuf = Buffer.alloc(magicLen);
    fs.readSync(fd, magicBuf, 0, magicLen, 4);
    const magic = magicBuf.toString("ascii");
    if (!magic.startsWith("PKGV")) {
      fs.closeSync(fd);
      return pkgPath;
    }

    const countBuf = Buffer.alloc(4);
    fs.readSync(fd, countBuf, 0, 4, 4 + magicLen);
    const fileCount = countBuf.readUInt32LE(0);

    let curOffset = 4 + magicLen + 4;
    const entries = [];
    for (let i = 0; i < fileCount; i++) {
      const lenBuf = Buffer.alloc(4);
      fs.readSync(fd, lenBuf, 0, 4, curOffset);
      const nameLen = lenBuf.readUInt32LE(0);
      curOffset += 4;

      const nameBuf = Buffer.alloc(nameLen);
      fs.readSync(fd, nameBuf, 0, nameLen, curOffset);
      const name = nameBuf.toString("utf-8");
      curOffset += nameLen;

      const metaBuf = Buffer.alloc(8);
      fs.readSync(fd, metaBuf, 0, 8, curOffset);
      const fileOffset = metaBuf.readUInt32LE(0);
      const fileSize = metaBuf.readUInt32LE(4);
      curOffset += 8;

      entries.push({ name, offset: fileOffset, size: fileSize });
    }

    const dataStart = curOffset;
    fs.closeSync(fd);

    const baseName = path.basename(pkgPath, path.extname(pkgPath)).replace(/^(\\d+_)/, "");

    // 1. Check for video entries (.mp4, .webm, .gif) inside package
    const videoEntry = entries
      .filter((e) => /\\.(mp4|webm|gif|mov|mkv)$/i.test(e.name))
      .sort((a, b) => b.size - a.size)[0];

    if (videoEntry) {
      const ext = path.extname(videoEntry.name) || ".mp4";
      const targetPath = path.join(wallpapersDir, `${Date.now()}_${baseName}${ext}`);
      const rfd = fs.openSync(pkgPath, "r");
      const buf = Buffer.alloc(videoEntry.size);
      fs.readSync(rfd, buf, 0, videoEntry.size, dataStart + videoEntry.offset);
      fs.closeSync(rfd);
      fs.writeFileSync(targetPath, buf);
      return targetPath;
    }

    // 2. Check for textures (.tex) with embedded full-res JPEG or PNG
    const texEntries = entries
      .filter((e) => e.name.endsWith(".tex") || /\\.(png|jpe?g)$/i.test(e.name))
      .sort((a, b) => b.size - a.size);

    for (const te of texEntries) {
      if (te.size < 40000) continue; // Skip small masks
      const rfd = fs.openSync(pkgPath, "r");
      const readSize = Math.min(te.size, 16 * 1024 * 1024);
      const buf = Buffer.alloc(readSize);
      fs.readSync(rfd, buf, 0, readSize, dataStart + te.offset);
      fs.closeSync(rfd);

      const jpgIdx = buf.indexOf(Buffer.from([0xff, 0xd8, 0xff]));
      if (jpgIdx !== -1) {
        const targetPath = path.join(wallpapersDir, `${Date.now()}_${baseName}.jpg`);
        fs.writeFileSync(targetPath, buf.slice(jpgIdx));
        return targetPath;
      }
      const pngIdx = buf.indexOf(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
      if (pngIdx !== -1) {
        const targetPath = path.join(wallpapersDir, `${Date.now()}_${baseName}.png`);
        fs.writeFileSync(targetPath, buf.slice(pngIdx));
        return targetPath;
      }
    }

    // 3. Check for companion preview media in pkg folder
    const pkgDir = path.dirname(pkgPath);
    const candidates = ["preview.gif", "preview.mp4", "preview.webm", "preview.jpg", "preview.png"];
    for (const c of candidates) {
      const p = path.join(pkgDir, c);
      if (fs.existsSync(p)) {
        const ext = path.extname(c);
        const targetPath = path.join(wallpapersDir, `${Date.now()}_${baseName}${ext}`);
        fs.copyFileSync(p, targetPath);
        return targetPath;
      }
    }
  } catch (err) {
    console.error("[extractWallpaperPkg Error]:", err);
  }
  return pkgPath;
}

"""

    old_extract_zip_start = "async function extractWallpaperZip(zipPath, wallpapersDir) {"
    assert old_extract_zip_start in content, "old_extract_zip_start not found in mod-main.js"
    content = content.replace(old_extract_zip_start, pkg_extractor_code + old_extract_zip_start, 1)

    # 2. In extractWallpaperZip: check for .pkg files in unzipped archive
    old_zip_search = """  const media = findMediaFiles(extractDir);
  if (media.length > 0) {"""

    new_zip_search = """  // Check if archive contains Wallpaper Engine .pkg files
  try {
    const list = fs.readdirSync(extractDir);
    const pkgFile = list.find((f) => f.toLowerCase().endsWith(".pkg"));
    if (pkgFile) {
      const extracted = await extractWallpaperPkg(path.join(extractDir, pkgFile), wallpapersDir);
      try { fs.rmSync(extractDir, { recursive: true, force: true }); fs.unlinkSync(zipPath); } catch (e) {}
      return extracted;
    }
  } catch(e) {}

  const media = findMediaFiles(extractDir);
  if (media.length > 0) {"""

    assert old_zip_search in content, "old_zip_search not found in mod-main.js"
    content = content.replace(old_zip_search, new_zip_search, 1)

    # 3. In selectWallpaperFile: add .pkg to dialog filters and handle .pkg selection
    old_select_dialog = """  ipcMain.handle("yandexMusicMod.selectWallpaperFile", async () => {
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
    const srcPath = result.filePaths[0];
    const wallpapersDir = path.join(appFolder, "wallpapers");
    try {
      fs.mkdirSync(wallpapersDir, { recursive: true });
    } catch (e) {}
    const cleanName = path.basename(srcPath).replace(/[^a-zA-Z0-9._-]/g, "_");
    const targetPath = path.join(wallpapersDir, `${Date.now()}_${cleanName}`);
    try {
      fs.copyFileSync(srcPath, targetPath);
      return targetPath;
    } catch(e) {
      return srcPath;
    }
  });"""

    new_select_dialog = """  ipcMain.handle("yandexMusicMod.selectWallpaperFile", async () => {
    const result = await dialog.showOpenDialog({
      title: "Выберите живые обои (MP4, WebM, GIF, JPG, PNG, PKG)",
      filters: [
        { name: "Живые обои (MP4, WebM, GIF, Wallpaper Engine PKG)", extensions: ["mp4", "webm", "gif", "pkg"] },
        { name: "Изображения", extensions: ["jpg", "jpeg", "png", "webp"] },
        { name: "Все файлы", extensions: ["*"] },
      ],
      properties: ["openFile"],
    });
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    const srcPath = result.filePaths[0];
    const wallpapersDir = path.join(appFolder, "wallpapers");
    try {
      fs.mkdirSync(wallpapersDir, { recursive: true });
    } catch (e) {}

    if (srcPath.toLowerCase().endsWith(".pkg")) {
      return await extractWallpaperPkg(srcPath, wallpapersDir);
    }

    const cleanName = path.basename(srcPath).replace(/[^a-zA-Z0-9._-]/g, "_");
    const targetPath = path.join(wallpapersDir, `${Date.now()}_${cleanName}`);
    try {
      fs.copyFileSync(srcPath, targetPath);
      return targetPath;
    } catch(e) {
      return srcPath;
    }
  });"""

    assert old_select_dialog in content, "old_select_dialog not found in mod-main.js"
    content = content.replace(old_select_dialog, new_select_dialog, 1)

    # 4. In importWallpaperFile: support .pkg files
    old_import_file = """  ipcMain.handle("yandexMusicMod.importWallpaperFile", async (_ev, srcPath) => {
    if (!srcPath || !fs.existsSync(srcPath)) return null;
    const wallpapersDir = path.join(appFolder, "wallpapers");
    try {
      fs.mkdirSync(wallpapersDir, { recursive: true });
    } catch (e) {}
    const cleanName = path.basename(srcPath).replace(/[^a-zA-Z0-9._-]/g, "_");
    const targetPath = path.join(wallpapersDir, `${Date.now()}_${cleanName}`);
    try {
      fs.copyFileSync(srcPath, targetPath);
      return targetPath;
    } catch(e) {
      return srcPath;
    }
  });"""

    new_import_file = """  ipcMain.handle("yandexMusicMod.importWallpaperFile", async (_ev, srcPath) => {
    if (!srcPath || !fs.existsSync(srcPath)) return null;
    const wallpapersDir = path.join(appFolder, "wallpapers");
    try {
      fs.mkdirSync(wallpapersDir, { recursive: true });
    } catch (e) {}

    if (srcPath.toLowerCase().endsWith(".pkg")) {
      return await extractWallpaperPkg(srcPath, wallpapersDir);
    }

    const cleanName = path.basename(srcPath).replace(/[^a-zA-Z0-9._-]/g, "_");
    const targetPath = path.join(wallpapersDir, `${Date.now()}_${cleanName}`);
    try {
      fs.copyFileSync(srcPath, targetPath);
      return targetPath;
    } catch(e) {
      return srcPath;
    }
  });"""

    assert old_import_file in content, "old_import_file not found in mod-main.js"
    content = content.replace(old_import_file, new_import_file, 1)

    with open('src/main/mod-main.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("mod-main.js patched successfully!")

if __name__ == '__main__':
    patch_main()
