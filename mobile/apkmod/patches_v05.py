"""Pinned native lyrics entry and tab models. Fail when upstream contracts change."""
from pathlib import Path
import re


def apply(work: Path, report: dict):
    report['patches'] = [item for item in report['patches'] if item != 'Local free-tier flag hook; native lyrics entitlement remains unresolved']
    account = work / 'smali/u8e.smali'
    data = account.read_text(encoding='utf-8')
    original_account = data
    for register, field in [('p7', 'g'), ('p8', 'h')]:
        old = f'    iput-boolean {register}, p0, Lu8e;->{field}:Z'
        new = (f'    invoke-static {{{register}}}, Lru/yandex/music/mod/ModRuntime;->subscriptionFlag(Z)Z\n\n'
               f'    move-result {register}\n\n' + old)
        if new not in data:
            if data.count(old) != 1:
                raise RuntimeError('FullUserInfo capability constructor changed')
            data = data.replace(old, new)
    if data != original_account:
        account.write_text(data, encoding='utf-8')

    # Try the public lookup even when the server advertises no lyrics for this account.
    track = work / 'smali/oqv.smali'
    data = track.read_text(encoding='utf-8')
    for old, new in [
        ('    iput-boolean p2, p0, Loqv;->m:Z', '    invoke-static {p2}, Lru/yandex/music/mod/ModRuntime;->subscriptionFlag(Z)Z\n\n    move-result p2\n\n    iput-boolean p2, p0, Loqv;->m:Z'),
        ('    iput-object p2, p0, Loqv;->n:Ljqv;', '    invoke-static {p2}, Lru/yandex/music/mod/ModLyrics;->availableInfo(Ljava/lang/Object;)Ljava/lang/Object;\n\n    move-result-object p2\n\n    check-cast p2, Ljqv;\n\n    iput-object p2, p0, Loqv;->n:Ljqv;')]:
        if new not in data:
            if data.count(old) != 1: raise RuntimeError('Native track lyrics flags changed')
            data = data.replace(old, new)
    if data != track.read_text(encoding='utf-8'): track.write_text(data, encoding='utf-8')

    # Also normalize cached/downloaded native placeholders at the domain boundary.
    model = work / 'smali_classes4/uji.smali'
    data = model.read_text(encoding='utf-8')
    old = ('.method public constructor <init>(Lqli;ILjava/lang/String;Lspi;Ljava/util/List;Lcli;Ljava/lang/String;Ljava/util/List;)V\n'
           '    .locals 0\n')
    new = old.replace('.locals 0', '.locals 1') + '''
    invoke-static {p7}, Lru/yandex/music/mod/ModLyrics;->isPlaceholder(Ljava/lang/String;)Z
    move-result v0
    if-eqz v0, :mod_lyrics_content
    const-string p7, "Текст этой записи пока не найден в доступных источниках."
    sget-object p6, Lcli;->b:Lcli;
    invoke-static {}, Ljava/util/Collections;->emptyList()Ljava/util/List;
    move-result-object p8
    :mod_lyrics_content
'''
    if new not in data:
        if data.count(old) != 1: raise RuntimeError('Native cached lyrics constructor changed')
        model.write_text(data.replace(old, new), encoding='utf-8')

    lyrics = work / 'smali/yli.smali'
    data = lyrics.read_text(encoding='utf-8')
    old = ('.method public final a(Ljava/lang/String;Lcli;Ljava/lang/Long;Lva7;)Ljava/lang/Object;\n'
           '    .locals 24\n')
    new = old + '''
    invoke-static/range {p0 .. p4}, Lru/yandex/music/mod/ModLyrics;->resolve(Ljava/lang/Object;Ljava/lang/String;Ljava/lang/Object;Ljava/lang/Long;Ljava/lang/Object;)Ljava/lang/Object;
    move-result-object v0
    if-eqz v0, :mod_native_lyrics
    return-object v0
    :mod_native_lyrics
'''
    if new not in data:
        if data.count(old) != 1:
            raise RuntimeError('Native lyrics resolver signature changed')
        lyrics.write_text(data.replace(old, new), encoding='utf-8')
    data = lyrics.read_text(encoding='utf-8')
    old = ('    invoke-static {v2, v0, v3, v1}, Lqp7;->B(Lqli;Lbli;Lcli;Ljava/lang/String;)Luji;\n\n'
           '    move-result-object v0')
    new = old + ('\n\n    invoke-static {v0}, Lru/yandex/music/mod/ModLyrics;->sanitizeNative(Ljava/lang/Object;)Ljava/lang/Object;'
                 '\n\n    move-result-object v0\n\n    check-cast v0, Luji;')
    if new not in data:
        if data.count(old) != 1: raise RuntimeError('Native lyric result conversion changed')
        lyrics.write_text(data.replace(old, new), encoding='utf-8')

    nav = work / 'smali_classes4/b7k.smali'
    data = nav.read_text(encoding='utf-8')
    section = re.search(r'\.method public final x\(\)V\n.*?\.end method', data, re.S)
    if section is None:
        raise RuntimeError('Native tab provider changed')
    old = '    iget-object v0, p0, Lb7k;->l:Luzt;'
    new = ('    invoke-static {v1}, Lru/yandex/music/mod/ModChrome;->filterTabs(Ljava/util/Set;)V\n\n' + old)
    if new not in section[0]:
        if section[0].count(old) != 1:
            raise RuntimeError('Native tab set changed')
        data = data[:section.start()] + section[0].replace(old, new) + data[section.end():]
        nav.write_text(data, encoding='utf-8')

    # Block conversion is shared by home, artist pages and the expanded player.
    # Null is the original converter's supported "skip unknown/absent block" path.
    for relative, register in [('smali_classes4/gpm.smali', 'v7'), ('smali_classes5/icm.smali', 'v5')]:
        path = work / relative
        data = path.read_text(encoding='utf-8')
        old = f'    move-result-object {register}\n\n    if-eqz {register}, :cond_5' if register == 'v7' else f'    move-result-object {register}\n\n    if-nez {register}, :cond_2'
        # Restrict the replacement to the getType result, not another same-register branch.
        prefix = '    invoke-interface {v6}, Lt5t;->getType()Ljava/lang/String;\n\n' if register == 'v7' else '    invoke-interface {v4}, Lt5t;->getType()Ljava/lang/String;\n\n'
        old = prefix + old
        new = old.replace(f'    move-result-object {register}\n', f'    move-result-object {register}\n\n    invoke-static {{{register}}}, Lru/yandex/music/mod/ModChrome;->blockType(Ljava/lang/String;)Ljava/lang/String;\n\n    move-result-object {register}\n', 1)
        if new not in data:
            if data.count(old) != 1:
                raise RuntimeError(f'Native skeleton block converter changed: {relative}')
            path.write_text(data.replace(old, new), encoding='utf-8')

    for relative, field in [
        ('smali_classes5/com/yandex/music/shared/skeleton/data/api/model/SkeletonDataDto.smali', 'blocks'),
        ('smali_classes5/com/yandex/music/shared/skeleton/blocks/tabs/TabDataDto.smali', 'blocks')]:
        path = work / relative
        data = path.read_text(encoding='utf-8')
        method = re.search(r'\.method public final a\(\)Ljava/util/List;\n.*?\.end method', data, re.S)
        if not method or f'->{field}:Ljava/util/List;' not in method[0]:
            raise RuntimeError(f'Native block list changed: {relative}')
        if 'ModChrome;->filterBlocks' not in method[0]:
            new = method[0].replace('    return-object p0', '    invoke-static {p0}, Lru/yandex/music/mod/ModChrome;->filterBlocks(Ljava/util/List;)Ljava/util/List;\n\n    move-result-object p0\n\n    return-object p0')
            path.write_text(data[:method.start()] + new + data[method.end():], encoding='utf-8')

    # The mini-player concert informer is local Compose UI, not a skeleton DTO.
    # Omit only this one pinned composable call, preserving the surrounding groups
    # and all normal track / media controls.
    informer = work / 'smali_classes5/bi6.smali'
    data = informer.read_text(encoding='utf-8')
    original = '    invoke-static/range {v23 .. v32}, Lzxe;->f(ILjava/lang/String;JLrti;Lkotlin/jvm/functions/Function0;Lg1k;Lbk6;II)V'
    replacement = '    # music-mod: omit player_concert_informer; native music controls remain'
    if replacement not in data:
        if data.count(original) != 1 or '"player_concert_informer"' not in data:
            raise RuntimeError('Pinned mini-player concert informer changed')
        informer.write_text(data.replace(original, replacement), encoding='utf-8')

    yml = work / 'apktool.yml'
    data = yml.read_text(encoding='utf-8')
    data = re.sub(r'(?m)^  versionCode: .+$', '  versionCode: 24026573', data)
    data = re.sub(r'(?m)^  versionName: .+$', '  versionName: "2026.11.1 #171rur Mod 0.6.4"', data)
    yml.write_text(data, encoding='utf-8')
    manifest = work / 'AndroidManifest.xml'
    data = manifest.read_text(encoding='utf-8')
    # A YAML version change alone does not invalidate APKTool's compiled manifest cache.
    if 'android:versionCode="24026573"' not in data:
        data = re.sub(r' android:versionCode="[^"]*"', '', data)
        data = re.sub(r' android:versionName="[^"]*"', '', data)
        data = data.replace('<manifest ', '<manifest android:versionCode="24026573" android:versionName="2026.11.1 #171rur Mod 0.6.4" ', 1)
        manifest.write_text(data, encoding='utf-8')
    report['modVersion'] = '0.6.4-alpha.1'
    for description in ['Native FullUserInfo music capabilities; public synchronized lyrics in original resolver',
                        'Music-only native tabs with centered glass navigation and retargetable sliding selection',
                        'Wave home destination and nonoverlapping mini-player',
                        'Full-width tab selection matches touch targets; delayed generic Plus plaque views are suppressed',
                        'Public lyric attempts independent of missing server availability flags; all artist matching and supplement fallback',
                        'Native settings keep their Fragment/Compose parent; no legacy mod footer',
                        'Shared two-tab navigation in native secondary activities',
                        'No rectangular glass capsules or translucent large action sheets; explicit dark mod dialogs',
                        'Direct settings hub entry and non-destructive close button',
                        'Independent spring pill; serialized native transactions with Fragment readiness; no duplicate tab ripple',
                        'Pinned mini-player concert informer omitted']:
        if description not in report['patches']: report['patches'].append(description)
