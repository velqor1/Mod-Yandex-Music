"""Install the actual built EXE into an isolated directory, with no launch or shell edits."""
from pathlib import Path
import hashlib,json,subprocess,uuid,struct
ROOT=Path(__file__).resolve().parents[2]
manifest=json.loads((ROOT/'dist/windows-update.json').read_text(encoding='utf-8'))
installer=ROOT/'dist'/manifest['installer']
assert installer.stat().st_size==manifest['size']
assert hashlib.sha256(installer.read_bytes()).hexdigest()==manifest['sha256']
target=(ROOT/'build/windows'/('NSIS test installation '+uuid.uuid4().hex[:6])).resolve()
assert target.is_relative_to((ROOT/'build/windows').resolve())
target.mkdir();(target/'resources').mkdir();(target/'resources/app.asar').write_bytes(b'OLD ARCHIVE')
sentinels={'user-data/account.json':b'ACCOUNT SENTINEL','mod_settings.json':b'SETTINGS SENTINEL','wallpapers/own.mp4':b'WALLPAPER SENTINEL'}
for name,data in sentinels.items():
    p=target/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
# NSIS requires /D last and unquoted. No shell is involved.
command='"'+str(installer)+'" /S /TEST /NOLAUNCH /D='+str(target)
result=subprocess.run(command,creationflags=subprocess.CREATE_NO_WINDOW,timeout=180)
assert result.returncode==0,'NSIS installer failed: '+str(result.returncode)
assert (target/'Яндекс Музыка.exe').is_file(),'NSIS /D path with spaces not respected'
for name,data in sentinels.items():assert (target/name).read_bytes()==data,'Changed user data: '+name
backups=list(target.glob('.mod-backup-*'));assert len(backups)==1
assert (backups[0]/'resources/app.asar').read_bytes()==b'OLD ARCHIVE'
assert json.loads((target/'mod-version.json').read_text(encoding='utf-8'))['version']==manifest['version']
raw=(target/'resources/app.asar').read_bytes();_,n,_,size=struct.unpack('<IIII',raw[:16]);header=json.loads(raw[16:16+size]);body=raw[8+n:]
e=header['files']['preload.js'];preload=body[int(e['offset']):int(e['offset'])+e['size']]
assert b'yandexMusicMod.updater.ready' in preload,'Actual Electron preload must expose updater'
for name,source in {'renderer.js':'src/renderer/mod-renderer.js','renderer.css':'src/renderer/mod-renderer.css','updater-ipc.js':'src/main/updater-ipc.js','mod-updater.js':'src/main/mod-updater.js'}.items():
    e=header['files']['app']['files']['yandexMusicMod']['files'][name];assert body[int(e['offset']):int(e['offset'])+e['size']]==(ROOT/source).read_bytes(),'Stale packaged asset: '+name
report={'installer':installer.name,'version':manifest['version'],'sizeAndHashVerified':True,'pathWithSpaces':True,'userDataPreserved':True,'backupVerified':True,'packagedSourcesCurrent':True,'target':str(target)}
(ROOT/'build/windows/nsis-test-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('PASS: actual NSIS installer, path with spaces, backup, account/settings/wallpapers preserved, packaged sources match.')
