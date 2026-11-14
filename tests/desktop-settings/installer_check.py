"""Exercise the real installer transaction, without touching the working installation."""
from pathlib import Path
import hashlib,json,subprocess,uuid,os,time
ROOT=Path(__file__).resolve().parents[2]
case=(ROOT/'build/windows'/('transaction-test-'+uuid.uuid4().hex[:8])).resolve()
assert case.is_relative_to((ROOT/'build/windows').resolve())
payload=case/'payload';target=case/'installation'
payload.mkdir(parents=True);target.mkdir()
for folder,files in [(target,{'Яндекс Музыка.exe':b'OLD','resources/app.asar':b'OLD ASAR','user-data/session.json':b'KEEP ACCOUNT','mod_settings.json':b'KEEP SETTINGS','wallpapers/custom.mp4':b'KEEP WALLPAPER'}),(payload,{'Яндекс Музыка.exe':b'NEW','resources/app.asar':b'NEW ASAR','resources/new-file.txt':b'NEW FILE','mod-version.json':b'{"version":"1.6.0"}'})]:
    for name,data in files.items():
        file=folder/name;file.parent.mkdir(parents=True,exist_ok=True);file.write_bytes(data)
def run(*extra):
    return subprocess.run([str(ROOT/'build/windows/InstallModUpdate.exe'),'--target='+str(target),'--payload='+str(payload),'--no-launch','--no-shell',*extra],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
def snapshot():return {f.relative_to(target).as_posix():hashlib.sha256(f.read_bytes()).hexdigest() for f in target.rglob('*') if f.is_file() and not any(p.startswith('.mod-backup-') for p in f.relative_to(target).parts)}
before=snapshot()
r=run('--fail-after=4');assert r.returncode!=0,'Injected copy failure must fail';assert b'Simulated' in r.stderr,r.stderr;assert snapshot()==before,'Rollback must restore every original file and remove newly added files'
r=run();assert r.returncode==0,r.stderr.decode(errors='replace')
assert (target/'resources/app.asar').read_bytes()==b'NEW ASAR'
for name in ['user-data/session.json','mod_settings.json','wallpapers/custom.mp4']:assert snapshot()[name]==before[name]
backups=list(target.glob('.mod-backup-*'));assert len(backups)==2
assert sorted((b/'result.txt').read_text(encoding='utf-8-sig').strip() for b in backups)==['complete','rolled-back']
report={'copyRollback':True,'newFilesRemovedOnFailure':True,'settingsPreserved':True,'accountSentinelPreserved':True,'wallpapersPreserved':True,'backupDirectories':len(backups),'case':str(case)}
# Exercise the actual post-update launch with a silent test executable, never playback.
source=case/'TestPlayer.cs'
source.write_text('using System;using System.IO;class TestPlayer{static void Main(){File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"launch-marker.txt"),"started");}}',encoding='utf-8')
compiler=Path(os.environ['WINDIR'])/'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
subprocess.run([str(compiler),'/nologo','/target:winexe','/out:'+str(payload/'Яндекс Музыка.exe'),str(source)],check=True,capture_output=True)
r=subprocess.run([str(ROOT/'build/windows/InstallModUpdate.exe'),'--target='+str(target),'--payload='+str(payload),'--no-shell'],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
assert r.returncode==0,r.stderr
for _ in range(50):
    if (target/'launch-marker.txt').exists():break
    time.sleep(.02)
assert (target/'launch-marker.txt').read_text()=='started','Installer must restart the executable from its exact installation'
report['postUpdateLaunchVerified']=True
(ROOT/'build/windows/transaction-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('PASS: real installer copies, preserves settings/account/wallpapers, rolls back after copy failure, launches the updated executable.')
