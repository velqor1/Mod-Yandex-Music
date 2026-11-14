"""Deploy owned assets locally with an exact-path process scope and a rollback copy."""
from pathlib import Path
import datetime,json,os,shutil
import psutil
from desktop_package import ROOT,patch_installation
app=Path(os.environ['LOCALAPPDATA'])/'Programs/YandexMusic';exe=app/'Яндекс Музыка.exe';asar=app/'resources/app.asar'
backup=ROOT/'build/windows'/('local-backup-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True,exist_ok=False)
for file,name in [(asar,'app.asar'),(exe,exe.name),(app/'mod-version.json','mod-version.json')]:
    if file.exists():shutil.copy2(file,backup/name)
processes=[p for p in psutil.process_iter(['exe']) if (p.info['exe'] or '').casefold()==str(exe).casefold()]
for p in processes:
    try:p.terminate()
    except psutil.NoSuchProcess:pass
_,alive=psutil.wait_procs(processes,timeout=8)
for p in alive:
    try:p.kill()
    except psutil.NoSuchProcess:pass
psutil.wait_procs(alive,timeout=5)
try:
    report=patch_installation(app)
except BaseException:
    shutil.copy2(backup/'app.asar',asar);shutil.copy2(backup/exe.name,exe)
    if (backup/'mod-version.json').exists():shutil.copy2(backup/'mod-version.json',app/'mod-version.json')
    elif (app/'mod-version.json').exists():(app/'mod-version.json').unlink()
    raise
report.update(backup=str(backup),published=False,androidChanged=False)
(ROOT/'build/windows/local-deployment.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('Installed local mod assets; backup:',backup.name)
