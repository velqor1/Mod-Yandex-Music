"""Patch only owned mod assets, preserving the archive's native entries and metadata."""
from pathlib import Path
import copy,hashlib,json,struct
ROOT=Path(__file__).resolve().parents[1]
ASSETS={
 'renderer.js':'src/renderer/mod-renderer.js','renderer.css':'src/renderer/mod-renderer.css',
 'main.js':'src/main/mod-main.js','settings.js':'src/main/settings.js',
 'preload.js':'src/preload/mod-preload.js','mod-updater.js':'src/main/mod-updater.js',
 'updater-ipc.js':'src/main/updater-ipc.js','mod-version.json':'src/mod-version.json'}
def update_root_preload(data):
    """The installed app embeds its mod bridge in ROOT preload.js, not the copied module."""
    source=(ROOT/'src/preload/mod-preload.js').read_text(encoding='utf-8')
    marker='electron.contextBridge.exposeInMainWorld("yandexMusicMod", {'
    text=data.decode('utf-8').replace('\r','')
    if text.count(marker)!=1:raise ValueError('Expected exactly one native preload bridge')
    begin=text.index(marker)+len(marker);end=text.index('      getStorageValue:',begin)
    owned=text[begin:end].strip()
    if owned and not owned.startswith('updater:'):raise ValueError('Unknown fields before native preload storage bridge')
    src_begin=source.index(marker)+len(marker);src_end=source.index('      getStorageValue:',src_begin)
    # Replace only our updater property; all native code and other bridge fields stay unchanged.
    return (text[:begin]+source[src_begin:src_end]+text[end:]).encode('utf-8')

def set_data(node,data,body):
    if node.get('unpacked'):raise ValueError('Cannot patch unpacked entry')
    node.update(size=len(data),offset=str(len(body)))
    if 'integrity' in node:
        integrity=node['integrity']
        if integrity['algorithm']!='SHA256':raise ValueError('Unknown integrity algorithm')
        block=integrity['blockSize']
        integrity['hash']=hashlib.sha256(data).hexdigest()
        integrity['blocks']=[hashlib.sha256(data[i:i+block]).hexdigest() for i in range(0,len(data),block)]
    return body+data

def patch_installation(folder):
    folder=Path(folder);archive=folder/'resources/app.asar';exe=folder/'Яндекс Музыка.exe'
    original=archive.read_bytes();_,n,_,size=struct.unpack('<IIII',original[:16])
    header=json.loads(original[16:16+size]);body=original[8+n:];updated=copy.deepcopy(header)
    parent=updated['files']['app']['files']['yandexMusicMod']['files']
    for name,source in ASSETS.items():
        data=(ROOT/source).read_bytes();node=parent.setdefault(name,{})
        body=set_data(node,data,body)
    preload=header['files']['preload.js']
    original_preload=body[int(preload['offset']):int(preload['offset'])+preload['size']]
    body=set_data(updated['files']['preload.js'],update_root_preload(original_preload),body)
    packed=json.dumps(updated,separators=(',',':'),ensure_ascii=False).encode();pad=b'\0'*(-len(packed)%4);aligned=len(packed)+len(pad)
    archive_data=struct.pack('<IIII',4,aligned+8,aligned+4,len(packed))+packed+pad+body
    executable=exe.read_bytes();before=hashlib.sha256(original[16:16+size]).hexdigest().encode();after=hashlib.sha256(packed).hexdigest().encode()
    if executable.count(before)!=1:raise ValueError('Executable ASAR fingerprint not unique')
    # Build everything before writing either file. Installation helper handles rollback.
    archive.write_bytes(archive_data);exe.write_bytes(executable.replace(before,after))
    (folder/'mod-version.json').write_bytes((ROOT/'src/mod-version.json').read_bytes())
    return {'asarSha256':hashlib.sha256(archive_data).hexdigest(),'changedEntries':list(ASSETS)+['/preload.js (updater bridge only)']}
