"""Build a local NSIS installer and its public, token-free Windows manifest."""
from pathlib import Path
import argparse,hashlib,json,os,shutil,subprocess
from desktop_package import ROOT,patch_installation

def build_installer():
    parser=argparse.ArgumentParser();parser.add_argument('--keep-staging',action='store_true');args=parser.parse_args()
    app=Path(os.environ['LOCALAPPDATA'])/'Programs/YandexMusic'
    staging=(ROOT/'dist/staging').resolve();dist=(ROOT/'dist').resolve();out=ROOT/'build/windows';out.mkdir(parents=True,exist_ok=True)
    assert staging.parent==dist and staging.name=='staging'
    if staging.exists():shutil.rmtree(staging)
    def ignore(folder,names):
        return [n for n in names if n.startswith('.mod-backup-') or n.endswith(('.bak','.tmp','.log')) or n in ('mod-updates','wallpapers','mod_settings.json')]
    print('Preparing local application payload...',flush=True)
    shutil.copytree(app,staging,ignore=ignore)
    patch_report=patch_installation(staging)
    version=json.loads((ROOT/'src/mod-version.json').read_text(encoding='utf-8'))
    (out/'version.nsh').write_text('!define MOD_VERSION "'+version['version']+'"\n',encoding='utf-8-sig')
    compiler=Path(os.environ['WINDIR'])/'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
    subprocess.run([str(compiler),'/nologo','/utf8output','/target:exe','/reference:System.Web.Extensions.dll','/reference:Microsoft.CSharp.dll','/out:'+str(out/'InstallModUpdate.exe'),str(ROOT/'tools/InstallModUpdate.cs')],check=True)
    proc=subprocess.run([str(ROOT/'tools/nsis/makensis.exe'),'/INPUTCHARSET','UTF8',str(ROOT/'tools/native_installer.nsi')],cwd=ROOT/'tools',stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    log=proc.stdout.decode('utf-8',errors='replace');(out/'nsis-build.log').write_text(log,encoding='utf-8')
    if proc.returncode:print(log[-5000:]);raise SystemExit(proc.returncode)
    installer=dist/f"YandexMusic-Mod-{version['version']}-win-x64.exe"
    manifest={'version':version['version'],'platform':version['platform'],'installer':installer.name,'size':installer.stat().st_size,'sha256':hashlib.sha256(installer.read_bytes()).hexdigest(),'notes':['Новое компактное меню с поиском, подразделами и отдельным выбором оформления.','Масштаб текста меню до 200%, восстановленные шрифты и размытие.','Обновления мода с проверкой SHA256, резервной копией и сохранением данных.','После сбоя сети проверку обновлений можно повторить сразу.']}
    (dist/'windows-update.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (out/'package-report.json').write_text(json.dumps(patch_report,indent=2),encoding='utf-8')
    print('Created:',installer.name,'Size:',manifest['size'],'SHA256:',manifest['sha256'],flush=True)
    if not args.keep_staging:shutil.rmtree(staging)
if __name__=='__main__':build_installer()
