# -*- coding: utf-8 -*-
import os

repo_root = os.path.abspath('.')

# 1. README.md
readme_path = os.path.join(repo_root, 'README.md')
with open(readme_path, 'r', encoding='utf-8') as f:
    readme = f.read()

readme = readme.replace('(v1.3.13)', '(v1.4.0)')
readme = readme.replace('v1.3.13', 'v1.4.0')
with open(readme_path, 'w', encoding='utf-8') as f:
    f.write(readme)
print("[+] Updated README.md to v1.4.0")

# 2. src/renderer/mod-renderer.js
renderer_path = os.path.join(repo_root, 'src', 'renderer', 'mod-renderer.js')
with open(renderer_path, 'r', encoding='utf-8') as f:
    r_code = f.read()

r_code = r_code.replace('const CURRENT_MOD_VERSION = "v1.3.13";', 'const CURRENT_MOD_VERSION = "v1.4.0";')
r_code = r_code.replace('v1.3.13 (YM 5.124.1)', 'v1.4.0 (YM 5.124.1)')
r_code = r_code.replace('<span class="ym-mod-ver-tag">v1.3.13</span>', '<span class="ym-mod-ver-tag">v1.4.0</span>')
r_code = r_code.replace('modalLogo.title = "Версия v1.3.5";', 'modalLogo.title = "Версия v1.4.0";')
r_code = r_code.replace('**Версия мода:** v1.3.5', '**Версия мода:** v1.4.0')
with open(renderer_path, 'w', encoding='utf-8') as f:
    f.write(r_code)
print("[+] Updated src/renderer/mod-renderer.js to v1.4.0")

# 3. src/overlay/overlay.js
overlay_js = os.path.join(repo_root, 'src', 'overlay', 'overlay.js')
with open(overlay_js, 'r', encoding='utf-8') as f:
    o_code = f.read()
o_code = o_code.replace('(v1.3.13)', '(v1.4.0)')
with open(overlay_js, 'w', encoding='utf-8') as f:
    f.write(o_code)
print("[+] Updated src/overlay/overlay.js to v1.4.0")

# 4. src/overlay/overlay.css
overlay_css = os.path.join(repo_root, 'src', 'overlay', 'overlay.css')
with open(overlay_css, 'r', encoding='utf-8') as f:
    oc_code = f.read()
oc_code = oc_code.replace('(v1.3.13)', '(v1.4.0)')
with open(overlay_css, 'w', encoding='utf-8') as f:
    f.write(oc_code)
print("[+] Updated src/overlay/overlay.css to v1.4.0")

# 5. src/renderer/mod-renderer.css
r_css = os.path.join(repo_root, 'src', 'renderer', 'mod-renderer.css')
with open(r_css, 'r', encoding='utf-8') as f:
    rc_code = f.read()
rc_code = rc_code.replace('(v1.3.13)', '(v1.4.0)')
rc_code = rc_code.replace('v1.3.13', 'v1.4.0')
with open(r_css, 'w', encoding='utf-8') as f:
    f.write(rc_code)
print("[+] Updated src/renderer/mod-renderer.css to v1.4.0")

# 6. tools/native_installer.nsi
nsi_path = os.path.join(repo_root, 'tools', 'native_installer.nsi')
with open(nsi_path, 'r', encoding='utf-8') as f:
    nsi = f.read()
nsi = nsi.replace('VIAddVersionKey "FileDescription" "Яндекс Музыка Mod v1.3.13"', 'VIAddVersionKey "FileDescription" "Яндекс Музыка Mod v1.4.0"')
nsi = nsi.replace('Яндекс Музыка Mod v1.3.5', 'Яндекс Музыка Mod v1.4.0')
nsi = nsi.replace('WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\YandexMusic" "DisplayVersion" "1.3.5"', 'WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\YandexMusic" "DisplayVersion" "1.4.0"')
with open(nsi_path, 'w', encoding='utf-8') as f:
    f.write(nsi)
print("[+] Updated tools/native_installer.nsi to v1.4.0")

# 7. PROJECT.md
proj_path = os.path.join(repo_root, 'PROJECT.md')
if os.path.exists(proj_path):
    with open(proj_path, 'r', encoding='utf-8') as f:
        proj = f.read()
    proj = proj.replace('1.3.13', '1.4.0')
    proj = proj.replace('1.3.0', '1.4.0')
    with open(proj_path, 'w', encoding='utf-8') as f:
        f.write(proj)
    print("[+] Updated PROJECT.md to v1.4.0")

print("[+] All version references bumped to v1.4.0!")
