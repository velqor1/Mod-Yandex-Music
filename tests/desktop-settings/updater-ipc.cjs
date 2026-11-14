const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {EventEmitter}=require('node:events');
test('IPC restricted to main frame; schedule starts once; no arbitrary paths accepted',async()=>{
  const handlers={},timers=[],actions=[],settings={get:(_,d)=>d};
  const app=new EventEmitter();app.getPath=k=>k==='userData'?'C:\\test':'C:\\test\\Music.exe';
  const win=new EventEmitter();win.webContents=new EventEmitter();let url='music-application://desktop/';win.webContents.getURL=()=>url;win.webContents.mainFrame={};win.webContents.send=()=>{};win.isDestroyed=()=>false;win.isVisible=()=>true;win.isFocused=()=>true;win.isMinimized=()=>false;
  class FakeUpdater {snapshot(){return {version:'1.6.0'};}check(manual){actions.push(['check',manual]);}download(...args){actions.push(['download',args]);}cancel(){}defer(){}install(...args){actions.push(['install',args]);}canOffer(){return true;}emit(){}}
  const sandbox={module:{exports:{}},URL,require:name=>name==='./mod-updater'?{ModUpdater:FakeUpdater}:require(name),setTimeout:(fn,delay)=>{timers.push({fn,delay});return {unref(){}};},setInterval:(fn,delay)=>{timers.push({fn,delay});return {unref(){}};},clearTimeout(){},clearInterval(){},process};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../src/main/updater-ipc.js'),'utf8'),sandbox);
  sandbox.module.exports.setupModUpdater({app,ipcMain:{handle:(key,fn)=>handlers[key]=fn},BrowserWindow:{getAllWindows:()=>[win]},settings,isAuxiliary:()=>false});
  const event={sender:win.webContents,senderFrame:win.webContents.mainFrame};
  const call=(command,e=event,...args)=>handlers['yandexMusicMod.updater.'+command](e,...args);
  await call('ready');await call('ready');assert.deepEqual(timers.map(t=>t.delay),[10000,21600000]);
  timers[0].fn();assert.deepEqual(actions.pop(),['check',false]);
  await call('download',event,'https://evil.example/bad.exe','C:\\unsafe');assert.equal(actions[0][1].length,0);
  await assert.rejects(()=>call('install',{sender:{},senderFrame:{}}));
  await assert.rejects(()=>call('state',{sender:win.webContents,senderFrame:{}}));
  url='https://passport.yandex.ru/auth';await assert.rejects(()=>call('install'));
});
