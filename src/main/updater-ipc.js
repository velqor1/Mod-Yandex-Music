const path = require('path');
const {spawn} = require('child_process');
const {ModUpdater} = require('./mod-updater');
function setupModUpdater({app,ipcMain,BrowserWindow,settings,isAuxiliary}) {
  let main = null, started = false;
  const packagedMain = win => {
    if (!win || win.isDestroyed() || isAuxiliary(win)) return false;
    try { const url = new URL(win.webContents.getURL());return url.protocol === 'music-application:' && url.hostname === 'desktop' && !/passport|oauth|auth\/|login/i.test(url.href); } catch { return false; }
  };
  const authorized = event => {
    if (!main || main.isDestroyed()) main = BrowserWindow.getAllWindows().find(win => win.webContents === event.sender && packagedMain(win)) || null;
    if (!packagedMain(main)) throw new Error('Недоступно на странице входа');
    if (!main || main.isDestroyed() || event.sender !== main.webContents || event.senderFrame !== main.webContents.mainFrame) throw new Error('Обновлятор доступен только в основном окне');
  };
  const isSafeWindow = () => main && !main.isDestroyed() && main.isVisible() && main.isFocused() && !main.isMinimized() && !/passport|oauth|auth\/|login/i.test(main.webContents.getURL());
  const updater = new ModUpdater({settings,directory:path.join(app.getPath('userData'),'mod-updates'),
    notify: state => {if (main && !main.isDestroyed()) main.webContents.send('yandexMusicMod.updateState',{...state,presentationAllowed:!!isSafeWindow()});},
    launch: file => new Promise((resolve,reject) => {
      // NSIS /D must be last and must not be quoted, including paths containing spaces.
      const child = spawn(file,['/UPDATE',`/PARENT=${process.pid}`,`/D=${path.dirname(app.getPath('exe'))}`],{detached:true,stdio:'ignore',windowsHide:true,windowsVerbatimArguments:true});
      child.once('error',reject); child.once('spawn',() => {child.unref();resolve();app.quit();});
    })});
  const bind = (name,fn) => ipcMain.handle('yandexMusicMod.updater.'+name,async event => {authorized(event); return fn();});
  bind('state',() => ({...updater.snapshot(),presentationAllowed:!!isSafeWindow()}));
  bind('check',() => updater.check(true));
  bind('download',() => updater.download());
  bind('cancel',() => updater.cancel());
  bind('later',() => updater.defer());
  bind('skip',() => updater.defer(true));
  bind('install',() => updater.install());
  ipcMain.handle('yandexMusicMod.updater.automatic',(event,value) => {authorized(event);return updater.automatic(value === true);});
  bind('ready',() => {
    if (!started) {
      started = true;
      const check = () => {if (settings.get('updates/automatic',true)) updater.check(false);};
      const first = setTimeout(check,10000), repeat = setInterval(check,6*3600000);
      first.unref();repeat.unref();
      app.once('before-quit',() => {clearTimeout(first);clearInterval(repeat);updater.cancel();});
    }
    return updater.snapshot();
  });
  const track = win => {
    if (!win || win.isDestroyed() || isAuxiliary(win)) return;
    // Accept only the application's packaged main document, never Passport/web popup windows.
    const consider = () => {
      if (!packagedMain(win)) return;
      if (!main || main.isDestroyed()) main = win;
    };
    consider();win.webContents.on('did-finish-load',consider);
    win.on('focus',() => {consider();updater.emit({offer:updater.canOffer()});});
    win.on('closed',() => {if(main===win)main=null;});
  };
  BrowserWindow.getAllWindows().forEach(track);
  app.on('browser-window-created',(_event,win) => track(win));
  return updater;
}
module.exports = {setupModUpdater};
