(async () => {
  const checks = [], options = [];
  const check = (ok, name, detail='') => { checks.push({ok:!!ok,name,detail}); };
  const pause = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const params = new URLSearchParams(location.search);
  document.body.dataset.background = params.get('background') || 'dark';
  if (params.get('test') !== 'persist') localStorage.removeItem('test-settings');
  await __menu.load(); __menu.injectModUI(); __menu.applyFont(__menu.settings['font-changer/savedFont']||'Segoe UI',true); __menu.applyTheme('#8b5cf6',true); __menu.openModSettings();
  const modal = document.getElementById('ym-mod-modal');
  check(!!modal && failures.length === 0,'full renderer settings initialization',failures.join('; '));
  if(params.get('test')!=='persist')check(modal.dataset.mode==='standard' && modal.dataset.menuFont==='standard','reference menu appearance and readable font are default');
  const set = (id,value,event) => {
    const el=document.getElementById(id); if(!el) throw new Error('Missing '+id);
    if(el.type==='checkbox') el.checked=value; else el.value=String(value);
    el.dispatchEvent(new Event(event || (el.type==='range' ? 'input':'change'),{bubbles:true})); return el;
  };
  const map = {
    'opt-menu-appearance':['settings/appearance','modern','applyTheme'],
    'opt-menu-app-font':['settings/useAppFont',true,'applyFont'],
    'opt-design-mode':['design/mode','classic','applyTheme'],
    'opt-custom-color':['custom-themes/accent','#2378d4','applyTheme'],
    'opt-glass-blur':['design/glassBlur','light','applyTheme'],
    'opt-card-hover':['design/cardHoverFx',false,'applyTheme'],
    'opt-player-glow':['design/playerGlow',false,'applyTheme'],
    'opt-glow-progress':['design/glowProgress',false,'applyTheme'],
    'opt-smooth-transitions':['design/smoothTransitions',false,'applyTheme'],
    'opt-disable-vibe':['custom-themes/disableVibeAnimation',true,'applyTheme'],
    'opt-trackbar-top':['trackbar/topBarEnabled',false,'applyTrackbarStyle'],
    'opt-trackbar-custom-color':['trackbar/color','#15a080','applyTrackbarStyle'],
    'opt-trackbar-thickness':['trackbar/thickness','5px','applyTrackbarStyle'],
    'opt-trackbar-hide-default':['trackbar/hideDefaultSlider',true,'applyTrackbarStyle'],
    'opt-wallpaper-enable':['wallpaper/enabled',false,'applyLiveWallpaperSettings'],
    'opt-wallpaper-opacity':['wallpaper/opacity',65,'applyLiveWallpaperSettings'],
    'opt-wallpaper-blur':['wallpaper/blur',8,'applyLiveWallpaperSettings'],
    'opt-wallpaper-pause':['wallpaper/pauseOnBlur',false,'applyLiveWallpaperSettings'],
    'opt-font-enabled':['font-changer/enabled',false,'applyFont'],
    'opt-font-family':['font-changer/savedFont','Minecraft','applyFont'],
    'opt-font-effects':['typography/fontEffects',false,'applyFont'],
    'opt-font-size':['font-changer/sizeScale',1.2,'applyFont'],
    'opt-modal-font-size':['font-changer/modalSizeScale',1.2,'applyFont'],
    'opt-font-custom':['font-changer/savedFont','Georgia','applyFont'],
    'opt-overlay-ghost':['overlay/clickThrough',true,'setOverlayClickThrough'],
    'opt-hud-pure-shadow':['overlay/pureShadow',false,'storageValueUpdated'],
    'opt-hud-show-lyrics':['overlay/showLyrics',false,'storageValueUpdated'],
    'opt-discord-rpc':['discordRPC/enabled',false,'storageValueUpdated'],
    'opt-discord-app-title':['discordRPC/appTitle','en','storageValueUpdated'],
    'opt-discord-activity-type':['discordRPC/activityType','playing','storageValueUpdated'],
    'opt-discord-time-format':['discordRPC/timeFormat','remaining','storageValueUpdated'],
    'opt-discord-mod-button':['discordRPC/showModButton',false,'storageValueUpdated'],
    'opt-block-app-updates':['system/blockAppUpdates',false,'removeOfficialUpdateBanners'],
    'opt-auto-quality':['autoQuality/enabled',false,'applyAutoQuality'],
    'opt-ui-scale':['scale-changer/savedScale',1.1,'applyScale']
  };
  const cleaners={concerts:'Concerts',kids:'Kids',podcasts:'Podcasts',trends:'Trends',radio:'Radio',banners:'Banners',mobile:'MobileApp',donates:'Donates',tickets:'Tickets',trailers:'Trailers',dislike:'Dislike',queue:'Queue',fullscreen:'Fullscreen',quality:'Quality',prev:'Prev',lyrics:'Lyrics'};
  for(const [id,key] of Object.entries(cleaners)) map['opt-cleaner-'+id]=['cleaner/hide'+key,true,'applyUiCleaner'];
  if(params.get('test') !== 'preview' && params.get('test') !== 'persist') {
    for(const [id,[key,value,effect]] of Object.entries(map)) {
      const callsBefore=calls.length; set(id,id==='opt-font-size'||id==='opt-modal-font-size'?value*100:value,id==='opt-trackbar-custom-color'?'input':undefined);
      const saved=calls.slice(callsBefore).find(call=>call.key===key && call.value===value);
      options.push({id,key,effect,ok:!!saved});check(!!saved,'handler '+id,JSON.stringify(calls.slice(callsBefore)));
    }
    set('opt-font-enabled',true);set('opt-font-family','Terraria'); await pause();
    check(getComputedStyle(modal).fontFamily.includes('Terraria'),'selected font applies to menu');
    check(getComputedStyle(document.querySelector('.native-text')).fontFamily.includes('Terraria'),'selected font applies to app');
    set('opt-font-enabled',false);check(!getComputedStyle(modal).fontFamily.includes('Terraria'),'font toggle restores menu font');
    set('opt-menu-app-font',false);set('opt-menu-appearance','standard');set('opt-font-enabled',true);set('opt-font-family','Cyberpunk');await pause();
    check(getComputedStyle(modal.querySelector('.ym-hub-intro h1')).fontFamily.includes('Segoe UI') && getComputedStyle(document.querySelector('.native-text')).fontFamily.includes('Rubik Glitch'),'decorative app font does not change standard menu');
    document.body.classList.add('ym-has-live-wallpaper');document.documentElement.classList.add('ym-has-live-wallpaper');
    check(getComputedStyle(modal.querySelector('.ym-hub-list')).backgroundColor==='rgb(25, 25, 31)','wallpaper does not erase reference group surfaces');
    check(getComputedStyle(modal.querySelector('.ym-hub-feature .ym-hub-icon')).backgroundColor!=='rgba(0, 0, 0, 0)','wallpaper keeps reference icon tiles');
    check(getComputedStyle(modal).backdropFilter==='none','reference preset stays independent of app blur');
    set('opt-design-mode','classic');set('opt-menu-appearance','modern');await pause();
    check(modal.dataset.mode==='modern' && document.documentElement.dataset.ymDesignMode==='classic','menu glass is independent of classic app design');
    check(!modal.querySelector('[data-design-profile="modern"]').hidden && !modal.querySelector('[data-design-profile="classic"]').hidden,'different app and menu materials both expose their parameters');
    set('opt-design-mode','modern');
    set('opt-menu-appearance','modern');
    set('opt-font-custom','Segoe UI');set('opt-font-size',120,'input');set('opt-modal-font-size',120,'input');await pause();
    check(Math.abs(parseFloat(getComputedStyle(document.querySelector('.native-text')).fontSize)-24)<.2,'app scale 20px → 24px');
    check(Math.abs(parseFloat(getComputedStyle(document.querySelector('.native-text span')).fontSize)-19.2)<.2,'nested app scale does not compound');
    check(Math.abs(parseFloat(getComputedStyle(modal).fontSize)-18)<.2,'separate menu scale 15px → 18px');
    set('opt-design-mode','modern');
    for(const [choice,blur] of Object.entries({off:0,light:14,medium:28,ultra:44})) {
      set('opt-glass-blur',choice);await pause();
      const result=getComputedStyle(modal).backdropFilter;check(blur?result.includes('blur('+blur+'px)'):result==='none','actual blur '+choice,result);
    }
    set('opt-design-mode','classic');check(getComputedStyle(document.querySelector('.PlayerBarDesktop_root_test')).borderRadius==='8px','classic layout applies');
    set('opt-design-mode','modern');check(getComputedStyle(document.querySelector('.PlayerBarDesktop_root_test')).borderRadius==='18px','modern layout applies');
    const accent=__menu.settings['custom-themes/accent'];
    document.querySelector('#trackbar-palette .ym-color-swatch').click();
    check(__menu.settings['custom-themes/accent']===accent,'trackbar color does not change global accent');
    document.querySelector('#tab-appearance .ym-color-swatch').click();
    check(__menu.settings['custom-themes/accent']==='#8b5cf6','appearance palette applies accent');
    for(const [id,method] of Object.entries({'btn-open-vsthemes':'openVSThemes','btn-upload-local-wp':'selectWallpaperFile','btn-open-overlay':'toggleOverlay','btn-open-karaoke':'toggleKaraoke','btn-open-devtools':'openDevTools'})) {
      const n=calls.length;document.getElementById(id).click();check(calls.slice(n).some(c=>c.method===method),'action '+id); options.push({id,key:'IPC',effect:method,ok:calls.slice(n).some(c=>c.method===method)});
    }
    const imageUrl='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="10"%3E%3Crect width="10" height="10" fill="red"/%3E%3C/svg%3E';
    set('opt-wallpaper-custom-url',imageUrl);document.getElementById('btn-apply-custom-wallpaper').click();
    check(__menu.settings['wallpaper/url']===imageUrl && document.getElementById('ym-live-wallpaper-container').style.display!=='none','custom wallpaper action applies selected image');
    await pause();
    check(!!document.getElementById('ym-wallpaper-force-transparency'),'real active wallpaper installs its runtime stylesheet');
    check(getComputedStyle(modal.querySelector('.ym-hub-list')).backgroundColor==='rgb(25, 25, 31)','runtime wallpaper stylesheet preserves menu group fills');
    check(getComputedStyle(modal.querySelector('.ym-hub-feature .ym-hub-icon')).backgroundColor!=='rgba(0, 0, 0, 0)','runtime wallpaper stylesheet preserves colored icon tiles');
    options.push({id:'opt-wallpaper-custom-url',key:'wallpaper/url',effect:'btn-apply-custom-wallpaper',ok:true},{id:'btn-apply-custom-wallpaper',key:'wallpaper/url',effect:'applyLiveWallpaperSettings',ok:__menu.settings['wallpaper/enabled']});
    document.getElementById('btn-reset-wallpaper').click();check(__menu.settings['wallpaper/enabled']===false,'wallpaper reset action');
    options.push({id:'btn-reset-wallpaper',key:'wallpaper/enabled',effect:'applyLiveWallpaperSettings',ok:__menu.settings['wallpaper/enabled']===false});
    document.getElementById('ym-wallpaper-grid').replaceChildren();document.getElementById('btn-refresh-wallpapers').click();await pause();
    const refreshed=document.getElementById('ym-wallpaper-grid').children.length>0;
    check(refreshed,'refresh wallpapers renders actual entries');options.push({id:'btn-refresh-wallpapers',key:'none',effect:'renderWallpaperGrid',ok:refreshed});
    for(const id of ['opt-plus-enabled','opt-plus-skips','opt-plus-ads']) { const el=document.getElementById(id);check(el.dataset.capability==='built-in' && el.tagName==='SPAN' && !el.querySelector('input'),'readonly capability '+id);options.push({id,key:'readonly',effect:'capability indicator',ok:el.dataset.capability==='built-in'}); }
    options.push({id:'btn-reload-plus',key:'none',effect:'window.location.reload',ok:typeof __menu.closeModSettings==='function'});
    for(const button of document.querySelectorAll('.ym-modal-tabs button')) {button.click();check(!document.getElementById(button.dataset.tab).hidden && document.activeElement.id==='ym-glass-page-title','navigation '+button.dataset.tab);}
    const search=document.getElementById('ym-settings-search');search.value='размытие';search.dispatchEvent(new Event('input'));check(document.querySelectorAll('.ym-glass-result').length>0,'search finds actual settings');
    document.querySelector('.ym-glass-result').click();check(document.getElementById('tab-appearance').hidden===false,'search routes to original control');
    const savedBeforeHome=JSON.stringify(__menu.settings);
    document.getElementById('ym-settings-home').click();
    check(!document.querySelector('.ym-modal-tabs').hidden && document.querySelector('.ym-glass-settings').hidden,'back opens mobile-style settings hub');
    check(savedBeforeHome===JSON.stringify(__menu.settings),'back preserves all settings');
    const firstTab=document.querySelector('.ym-modal-tabs button');firstTab.focus();firstTab.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
    check(document.activeElement.dataset.tab==='tab-wallpapers','keyboard arrows navigate visible hub buttons');
    const search2=document.getElementById('ym-settings-search');modal.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}));
    check(document.activeElement===search2,'Ctrl K focuses settings search');
    document.getElementById('entry').focus();__menu.openModSettings();
    modal.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    check(document.activeElement===document.getElementById('entry'),'Escape restores trigger focus');__menu.openModSettings();
    search.value='такогопараметранет';search.dispatchEvent(new Event('input'));check(document.querySelector('.ym-glass-results').textContent.includes('Ничего не найдено'),'search empty state');
    __menu.closeModSettings();check(!document.getElementById('ym-mod-modal-backdrop').classList.contains('open'),'close settings');
    document.getElementById('ym-mod-modal-backdrop').remove(); await __menu.load();__menu.injectModUI();__menu.openModSettings();
    check(document.getElementById('opt-font-family').value==='Segoe UI','custom font restored on reopen');
    check(document.getElementById('opt-glass-blur').value==='ultra','blur restored on reopen');
    localStorage.setItem('durable-check',JSON.stringify(__menu.settings));
    check(!document.querySelector('.ym-glass-preview'),'preview removed completely');
    check(document.getElementById('opt-discord-rpc').closest('.ym-tab-pane').id==='tab-tweaks','Discord controls live in Discord');
    check(document.getElementById('opt-auto-quality').closest('.ym-tab-pane').id==='tab-plus','general controls live in General');
    document.querySelector('[data-tab="tab-appearance"]').click();
    document.querySelector('[data-subtarget="appearance-design"]').click();
    const designChoices=document.querySelector('[data-choice-select="opt-design-mode"]');
    designChoices.querySelector('[data-value="classic"]').click();
    check(__menu.settings['design/mode']==='classic' && designChoices.querySelector('[data-value="classic"]').getAttribute('aria-checked')==='true','visible design choice invokes original setting handler');
    designChoices.querySelector('[data-value="classic"]').focus();
    designChoices.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
    check(__menu.settings['design/mode']==='compact' && document.activeElement.dataset.value==='compact','segmented control arrow keys change value and focus');
    designChoices.querySelector('[data-value="modern"]').click();
    document.querySelector('[data-subtarget="appearance-profile"]').click();
    for(const [choice,blur] of Object.entries({off:0,light:14,medium:28,ultra:44})){
      document.querySelector('[data-choice-select="opt-glass-blur"] [data-value="'+choice+'"]').click();await pause();
      const result=getComputedStyle(document.getElementById('ym-mod-modal')).backdropFilter;
      check(blur?result.includes('blur('+blur+'px)'):result==='none','visible blur choice '+choice+' controls actual material');
    }
    const query=document.getElementById('ym-settings-search');query.value='Консоль';query.dispatchEvent(new Event('input'));
    document.querySelector('.ym-glass-result').click();
    check(document.getElementById('btn-open-devtools').closest('details').open && document.activeElement.id==='btn-open-devtools','search reveals advanced settings and focuses actual control');
    document.querySelector('[data-tab="tab-fonts"]').click();
    const toggle=document.getElementById('opt-font-enabled'),before=toggle.checked;
    toggle.closest('.ym-row').querySelector('.ym-label').click();
    check(toggle.checked!==before,'whole toggle row changes real control');
    document.querySelector('[data-tab="tab-appearance"]').click();
    document.querySelector('[data-subtarget="appearance-profile"]').click();const scroller=document.getElementById('ym-mod-modal').querySelector('.ym-modal-content');scroller.scrollTop=180;const savedScroll=scroller.scrollTop;scroller.dispatchEvent(new Event('scroll'));
    document.querySelector('[data-tab="tab-plus"]').click();document.querySelector('[data-tab="tab-appearance"]').click();
    check(Math.abs(scroller.scrollTop-savedScroll)<1,'section remembers scroll');
    document.querySelector('[data-tab="tab-about"]').click();
    Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>true});
    document.getElementById('btn-check-mod-update').click();await pause();
    check(!!document.getElementById('ym-mod-update-dialog'),'manual update check opens real dialog');
    check(!document.querySelector('#ym-update-notes img') && document.getElementById('ym-update-notes').textContent.includes('<img'),'release notes rendered safely as text');
    document.getElementById('ym-update-primary').click();await pause();
    check(document.getElementById('ym-update-primary').textContent==='Установить и перезапустить','download becomes explicit installation action');
    check(!calls.some(c=>c.method==='installModUpdate'),'download never installs automatically');
    document.getElementById('ym-update-later').click();await pause();
    check(!document.getElementById('ym-mod-update-dialog'),'later closes update dialog');
    window.updaterEmit({offer:true,presentationAllowed:false});await pause();
    check(!document.getElementById('ym-mod-update-dialog'),'background window never opens update dialog');
    // Exercise what the user actually sees, including the real 5.124.1 audio-player selector.
    document.querySelector('[data-tab="tab-appearance"]').click();
    const showSub=id=>document.querySelector('[data-subtarget="'+id+'"]').click();
    const choose=mode=>{document.querySelector('[data-tab="tab-appearance"]').click();showSub('appearance-design');set('opt-menu-appearance',mode);document.querySelector('[data-choice-select="opt-design-mode"] [data-value="'+mode+'"]').click();};
    const liveModal=document.getElementById('ym-mod-modal'),nativePlayer=document.getElementById('native-player');
    check(document.querySelectorAll('.ym-settings-subnav button').length===4,'appearance has four direct subsections');
    for(const mode of ['modern','classic','compact']){
      choose(mode);await pause();
      const radio=document.querySelector('[data-choice-select="opt-design-mode"] [data-value="'+mode+'"]'),rect=radio.getBoundingClientRect();
      check(document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)===radio,'mode '+mode+' is directly clickable without an overlay');
      check(liveModal.dataset.mode===mode && __menu.settings['design/mode']===mode,'mode '+mode+' changes material and saved preference');
      check(mode==='modern'?getComputedStyle(liveModal).backdropFilter!=='none':getComputedStyle(liveModal).backdropFilter==='none','mode '+mode+' has correct actual menu blur');
      check(mode==='modern'?getComputedStyle(nativePlayer).backdropFilter!=='none':getComputedStyle(nativePlayer).backdropFilter==='none','mode '+mode+' changes actual native audio player material');
      if(mode!=='modern')check(getComputedStyle(liveModal).backgroundImage==='none','mode '+mode+' removes glass gradients');
      showSub('appearance-profile');
      check(!liveModal.querySelector('[data-design-profile="'+mode+'"]').hidden,'mode '+mode+' exposes its own settings');
    }
    choose('modern');showSub('appearance-profile');set('opt-glass-transparency',45);set('opt-glass-edge',false);await pause();
    check(getComputedStyle(liveModal).backgroundImage.includes('0.55') && getComputedStyle(nativePlayer).backgroundColor.includes('0.55'),'glass transparency changes menu and native player opacity');
    check(getComputedStyle(liveModal).borderTopColor==='rgba(0, 0, 0, 0)','glass outline can be disabled');
    choose('classic');showSub('appearance-profile');set('opt-classic-tone','coal');set('opt-classic-radius',12);await pause();
    check(getComputedStyle(liveModal).backgroundColor==='rgb(16, 17, 20)' && getComputedStyle(nativePlayer).backgroundColor==='rgb(16, 17, 20)','classic tone changes menu and native player');
    check(getComputedStyle(liveModal).borderRadius==='12px' && getComputedStyle(nativePlayer).borderRadius==='12px','classic corner setting affects menu and native player');
    choose('compact');showSub('appearance-profile');set('opt-compact-height','72');set('opt-compact-density','normal');await pause();
    check(getComputedStyle(nativePlayer).height==='72px' && __menu.settings['design/compact/playerHeight']===72,'compact height changes actual player geometry');
    check(getComputedStyle(document.querySelector('.HorizontalCardContainer_root__YoAAP')).height==='56px','compact normal collection rows use native height variable');
    set('opt-compact-density','tight');await pause();
    check(getComputedStyle(document.querySelector('.HorizontalCardContainer_root__YoAAP')).height==='48px','compact tight collection rows use native height variable');
    choose('classic');showSub('appearance-profile');
    const find=document.getElementById('ym-settings-search');find.value='Скругление';find.dispatchEvent(new Event('input'));document.querySelector('.ym-glass-result').click();
    check(!document.getElementById('ym-sub-appearance-profile').hidden && document.activeElement.id==='opt-classic-radius','search navigates into the right subsection and profile');
    for(const mode of ['modern','classic','compact'])choose(mode);
    check(__menu.settings['design/modern/transparency']===45 && __menu.settings['design/classic/radius']===12 && __menu.settings['design/compact/playerHeight']===72,'switching designs preserves each independent profile');
    document.querySelector('[data-tab="tab-wallpapers"]').click();
    check(document.querySelectorAll('.ym-settings-subnav button').length===3,'wallpapers have library, catalog and settings subsections');
    showSub('wallpapers-catalog');
    check(!document.querySelector('.ym-vsthemes-banner') && getComputedStyle(document.querySelector('.ym-wallpaper-catalog')).backgroundImage==='none','wallpaper catalog uses the common menu surface');
    const catalogTab=document.querySelector('[data-subtarget="wallpapers-catalog"]');catalogTab.focus();catalogTab.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
    check(document.activeElement.dataset.subtarget==='wallpapers-settings' && !document.getElementById('ym-sub-wallpapers-settings').hidden,'subsection keyboard navigation keeps visible focus');
    choose('modern');
    __menu.saveSetting('wallpaper/url',imageUrl);__menu.saveSetting('wallpaper/type','image');__menu.saveSetting('wallpaper/enabled',true);__menu.applyLiveWallpaperSettings();
    const sidebar=document.querySelector('.NavbarDesktop_root_test');
    for(const mode of ['modern','classic','compact']){
      choose(mode);await pause();const surface=getComputedStyle(sidebar);
      check(surface.backgroundColor==='rgba(0, 0, 0, 0)' && surface.backgroundImage==='none' && surface.borderTopWidth==='0px' && surface.boxShadow==='none' && surface.backdropFilter==='none','wallpaper sidebar remains transparent without a frame in '+mode);
    }
    __menu.saveSetting('wallpaper/enabled',false);__menu.applyLiveWallpaperSettings();choose('modern');
    localStorage.setItem('ym_mod_is_admin','true');document.getElementById('ym-mod-modal-backdrop').remove();__menu.injectModUI();__menu.openModSettings();
    check(!!document.querySelector('[data-tab="tab-admin"]') && !!document.getElementById('tab-admin') && !document.querySelector('.ym-creator-crown'),'creator tools remain accessible without a profile crown');
    check(document.querySelector('[data-tab="tab-admin"]').hidden && !!document.querySelector('#tab-about #ym-open-creator'),'creator access lives in About without adding a home row');
    document.querySelector('[data-tab="tab-about"]').click();
    const description=document.querySelector('.ym-about-description'),aboutTitle=description.previousElementSibling;
    check(Math.abs(description.getBoundingClientRect().left-aboutTitle.getBoundingClientRect().left-parseFloat(getComputedStyle(aboutTitle).paddingLeft))<1,'About description follows the title reading edge');
    const creator=document.getElementById('ym-open-creator');
    check(creator.closest('.ym-row')?.querySelector('.ym-label')?.textContent==='Панель создателя' && creator.getBoundingClientRect().width===208,'creator entry uses a regular aligned action row');
    for(const entry of document.querySelectorAll('.ym-modal-tabs [data-tab]:not([hidden])')){
      entry.click();const pane=document.getElementById(entry.dataset.tab);
      check(pane.getAttribute('role')==='region' && document.getElementById(pane.getAttribute('aria-labelledby'))?.textContent.trim()===entry.querySelector('.ym-hub-label').textContent,'named screen region '+pane.id);
      check([...document.querySelectorAll('.ym-settings-subnav [role="tab"]')].every(tab=>tab.id && document.getElementById(tab.getAttribute('aria-controls'))?.getAttribute('aria-labelledby')===tab.id),'subsection tabs have reciprocal accessible names in '+pane.id);
    }
    set('opt-menu-app-font',false);set('opt-modal-font-size',200);await pause();
    check(__menu.settings['font-changer/modalSizeScale']===2 && getComputedStyle(document.getElementById('ym-mod-modal')).fontSize==='30px','200 percent setting enlarges actual menu text and persists');
    localStorage.removeItem('ym_mod_is_admin');
    localStorage.setItem('durable-check',JSON.stringify(__menu.settings));
  }
  if(params.get('test')==='persist') {
    const previous=JSON.parse(localStorage.getItem('durable-check')||'{}');
    check(previous['design/glassBlur']===__menu.settings['design/glassBlur'],'saved blur survives page reload');
    check(previous['font-changer/savedFont']===document.getElementById('opt-font-family').value,'saved custom font survives page reload');
    check(previous['settings/appearance']===document.getElementById('opt-menu-appearance').value,'independent menu appearance survives reload');
    check(previous['settings/useAppFont']===document.getElementById('opt-menu-app-font').checked,'independent menu font choice survives reload');
    check(document.getElementById('opt-modal-font-size').value==='200' && getComputedStyle(modal).fontSize==='30px','200 percent menu text survives reload');
    for(const key of ['design/modern/transparency','design/modern/edge','design/classic/tone','design/classic/radius','design/compact/playerHeight','design/compact/rowDensity'])check(previous[key]===__menu.settings[key],'independent style profile persists '+key);
  }
  if(params.get('test')==='preview') {
    __menu.saveSetting('font-changer/savedFont','Segoe UI');__menu.saveSetting('font-changer/enabled',true);__menu.saveSetting('typography/fontEffects',false);
    __menu.saveSetting('font-changer/sizeScale',1);__menu.saveSetting('font-changer/modalSizeScale',1);
    __menu.saveSetting('design/glassBlur',params.get('blur')||'medium');__menu.saveSetting('design/smoothTransitions',true);
    __menu.saveSetting('custom-themes/accent','#f65c73');__menu.applyFont('Segoe UI',true);__menu.applyTheme('#f65c73',true);
    if(params.get('group')) { const pane = {tools:'overlay',system:'plus'}[params.get('group')]||params.get('group'); document.querySelector(`[data-tab="tab-${pane}"]`).click(); }
    if(params.get('pane')==='home')document.getElementById('ym-settings-home').click();
    else if(params.get('pane'))document.querySelector('[data-tab="'+params.get('pane')+'"]').click();
    if(params.get('mode')){set('opt-design-mode',params.get('mode'));set('opt-menu-appearance',params.get('mode'));}
    if(params.get('stress')==='wallpaper-font'){set('opt-font-family','Cyberpunk');__menu.saveSetting('font-changer/weight','900');__menu.saveSetting('font-changer/letterSpacing','2px');__menu.applyFont('Cyberpunk',true);__menu.saveSetting('wallpaper/enabled',true);__menu.saveSetting('wallpaper/url','data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E');__menu.saveSetting('wallpaper/type','image');__menu.applyLiveWallpaperSettings();set('opt-menu-appearance','standard');set('opt-menu-app-font',false);}
    if(params.get('sub'))document.querySelector('[data-subtarget="'+params.get('sub')+'"]').click();
    if(params.get('scale'))set('opt-modal-font-size',params.get('scale'));
  }
  await pause();
  check(failures.length===0,'no renderer exceptions',failures.join('; '));
  window.results={checks,options,calls,settings:__menu.settings};
  const report=document.createElement('pre');report.id='test-report';report.hidden=true;report.textContent=JSON.stringify(window.results);document.body.append(report);
  document.body.dataset.result=checks.every(c=>c.ok)?'PASS':'FAIL';
})().catch(error=>{document.body.dataset.result='FAIL';document.body.innerHTML+='<pre id="fatal"></pre>';document.getElementById('fatal').textContent=error.stack;});
