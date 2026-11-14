"""Verify the entry point actually used by Electron, not just the copied source module."""
from pathlib import Path
import os,json,struct,sys,subprocess
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools'))
from desktop_package import update_root_preload
archive=Path(os.environ['LOCALAPPDATA'])/'Programs/YandexMusic/resources/app.asar'
a=archive.read_bytes();_,n,_,size=struct.unpack('<IIII',a[:16]);h=json.loads(a[16:16+size]);body=a[8+n:];e=h['files']['preload.js'];original=body[int(e['offset']):int(e['offset'])+e['size']]
updated=update_root_preload(original);old=original.decode('utf-8').replace('\r','');new=updated.decode('utf-8')
marker='electron.contextBridge.exposeInMainWorld("yandexMusicMod", {'
def parts(s):
    begin=s.index(marker)+len(marker);end=s.index('      getStorageValue:',begin)
    return s[:begin],s[end:]
assert parts(old)==parts(new),'Unrelated native preload or bridge fields changed'
assert update_root_preload(updated)==updated,'Repeated packing must be idempotent'
end=new.index('})();',new.index('[Mod Preload Error]'))+len('})();')
test=ROOT/'build/settings-refinement/packaged-preload-test.cjs'
test.write_text('''const assert=require('node:assert/strict'),vm=require('node:vm');let exposed,calls=[];
const ipc={on(){},send(){},invoke:(...args)=>{calls.push(args);return Promise.resolve({});},removeListener(){}};
const electron={ipcRenderer:ipc,contextBridge:{exposeInMainWorld:(name,api)=>{if(name==='yandexMusicMod')exposed=api;}}};
vm.runInNewContext(SCRIPT,{require:name=>{assert.equal(name,'electron');return electron;},console});
assert(exposed.updater);exposed.updater.ready();exposed.updater.state();exposed.updater.check();exposed.updater.download('https://untrusted.example');
assert.equal(calls[0][0],'yandexMusicMod.updater.ready');assert.equal(calls[3].length,1);assert(exposed.getAllSettings);
console.log('PASS: actual packaged preload exposes updater, keeps native code and existing bridge, rejects renderer URLs.');
'''.replace('SCRIPT',json.dumps(new[:end])),encoding='utf-8')
subprocess.run(['node',str(test)],check=True)
