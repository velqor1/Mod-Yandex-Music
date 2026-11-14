"""Run the real renderer and its real settings handlers with a local IPC boundary."""
from pathlib import Path
import re,json
ROOT=Path(__file__).resolve().parents[2]
version=json.loads((ROOT/'src/mod-version.json').read_text(encoding='utf-8'))['version']
source=(ROOT/'src/renderer/mod-renderer.js').read_text(encoding='utf-8')
start=source.rindex('  if (document.readyState === "loading")')
end=source.index('\n})();',start)
source=source[:start]+'''  window.__menu = {injectModUI,openModSettings,closeModSettings,applyFont,applyTheme,applyScale,applyUiCleaner,applyLiveWallpaperSettings,applyTrackbarStyle,saveSetting,
    settings: modSettings, load: async () => { const values = await window.yandexMusicMod.getAllSettings(); Object.assign(modSettings, values); }};
'''+source[end:]
output=ROOT/'build/liquid-menu'
output.mkdir(parents=True,exist_ok=True)
(output/'tests.js').write_bytes((Path(__file__).parent/'behavior.js').read_bytes())
(output/'test-renderer.js').write_text(source,encoding='utf-8')
css=(ROOT/'src/renderer/mod-renderer.css').as_uri()
script=(output/'test-renderer.js').as_uri()
tests=(output/'tests.js').as_uri()
html='''<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="CSS"><style>
body{margin:0;background:#171322;color:#fff;font:14px "Segoe UI";min-height:100vh;overflow:hidden}
.test-scene{position:fixed;inset:0;display:grid;grid-template-columns:22% 1fr;background:radial-gradient(ellipse at 75% 40%,#954b7e,#233967 50%,#101b20);}
.test-scene:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(65deg,transparent 0 90px,#ffffff12 90px 110px);}
.test-scene strong{font:700 82px "Segoe UI";margin:150px 120px;line-height:1.1;opacity:.25}
.native-text{font-size:20px}.native-text span{font-size:16px}
.NavbarDesktop_root_test{background:#181a1e;border:1px solid #ffffff22;box-shadow:0 2px 4px #0002;}
.PlayerBarDesktop_root_test,#native-player,.NavbarDesktop_root_test,.HorizontalCardContainer_root__YoAAP{position:fixed;left:-10000px;width:640px;}
body[data-background="light"] .test-scene{background:linear-gradient(130deg,#ece9d4,#d2dfe7 50%,#be9eac)}
body[data-background="moving"] .test-scene{background-size:200% 200%;animation:scene 4s linear infinite alternate}
@keyframes scene{to{background-position:100% 100%}}
</style><body><div class="test-scene" aria-hidden="true"><div></div><strong>Моя<br>музыка</strong></div><div class="native-text">Native sample <span>Nested sample</span></div>
<div data-test-id="PLAYLIST_CARD">Playlist</div><div class="PlayerBarDesktop_root_test"></div><div id="native-player" class="PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN PlayerBarDesktopWithBackgroundProgressBar_important__HzXrK" style="height:var(--player-bar-height,80px)"></div><div class="NavbarDesktop_root_test"></div><div class="HorizontalCardContainer_root__YoAAP" style="height:var(--horizontal-card-height,56px)"></div><div class="Concerts_root_test"></div>
<button id="entry">Настройки мода</button>
<script>
window.calls=[];window.failures=[];window.addEventListener('error',e=>failures.push(e.message));
window.yandexMusicMod={
updater: (()=>{
let state={status:'current',version:'1.6.0',baseVersion:'5.124.1',auto:true,compatible:true,presentationAllowed:true,offer:false},listeners=[];
const emit=patch=>{state={...state,...patch};listeners.forEach(fn=>fn(state));return state;};window.updaterEmit=emit;
return {subscribe:fn=>{listeners.push(fn);return()=>listeners.splice(listeners.indexOf(fn),1);},state:async()=>state,ready:async()=>state,
check:async()=>emit({status:'available',manual:true,offer:true,update:{version:'1.7.0',size:104857600,notes:['Новые настройки','<img src=x onerror=alert(1)>']}}),
automatic:async value=>emit({auto:value}),later:async()=>emit({offer:false}),skip:async()=>emit({offer:false}),
download:async()=>{emit({status:'downloading',progress:.25});return emit({status:'ready',progress:1});},cancel:async()=>emit({status:'available',offer:false}),
install:async()=>{calls.push({method:'installModUpdate'});return state;}};
})(),
getAllSettings:async()=>JSON.parse(localStorage.getItem('test-settings')||'{"font-changer/enabled":true,"font-changer/savedFont":"Segoe UI","design/glassBlur":"medium","wallpaper/enabled":false}'),
setStorageValue:(key,value)=>{calls.push({method:'setStorageValue',key,value});const s=JSON.parse(localStorage.getItem('test-settings')||'{}');s[key]=value;localStorage.setItem('test-settings',JSON.stringify(s));},
getDownloadedWallpapers:async()=>[],getMediaServerPort:async()=>0,getMediaUrl:async()=>'',
selectWallpaperFile:async()=>{calls.push({method:'selectWallpaperFile'});return '';},
toggleOverlay:()=>calls.push({method:'toggleOverlay'}),toggleKaraoke:()=>calls.push({method:'toggleKaraoke'}),openDevTools:()=>calls.push({method:'openDevTools'}),
setOverlayClickThrough:value=>calls.push({method:'setOverlayClickThrough',value}),openVSThemes:()=>calls.push({method:'openVSThemes'})};
</script><script src="SCRIPT"></script><script src="TESTS"></script></body></html>'''.replace('CSS',css).replace('SCRIPT',script).replace('TESTS',tests)
(output/'fixture.html').write_text(html.replace("version:'1.6.0'","version:"+json.dumps(version)),encoding='utf-8')
print('Created fixture executing complete renderer functions; bootstrap disabled, IPC isolated.')
