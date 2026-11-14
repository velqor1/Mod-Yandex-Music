from pathlib import Path
import base64,json,subprocess,time,urllib.request,websocket,uuid

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'build/liquid-menu'
chrome=r'C:\Program Files\Google\Chrome\Application\chrome.exe'
profile=OUT/('cdp-profile-'+uuid.uuid4().hex[:8])
portfile=profile/'DevToolsActivePort'
if portfile.exists():portfile.unlink()
proc=subprocess.Popen([chrome,'--headless=new','--no-first-run','--disable-background-networking','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+str(profile),'about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=subprocess.CREATE_NO_WINDOW)
try:
    for _ in range(100):
        if portfile.exists():break
        time.sleep(.05)
    port=int(portfile.read_text().splitlines()[0])
    targets=json.load(urllib.request.urlopen('http://127.0.0.1:%s/json'%port))
    target=next(t for t in targets if t.get('type')=='page' and t.get('url')=='about:blank')
    ws=websocket.create_connection(target['webSocketDebuggerUrl'],suppress_origin=True,timeout=10)
    sequence=0
    def call(method,params=None):
        global sequence
        sequence+=1;ident=sequence;ws.send(json.dumps({'id':ident,'method':method,'params':params or {}}))
        while True:
            data=json.loads(ws.recv())
            if data.get('id')==ident:
                if 'error' in data:raise RuntimeError(data['error'])
                return data.get('result',{})
    def evaluate(code):
        r=call('Runtime.evaluate',{'expression':code,'returnByValue':True,'awaitPromise':True})
        if r.get('exceptionDetails'):raise RuntimeError(r['exceptionDetails'])
        return r.get('result',{}).get('value')
    call('Page.enable');call('Runtime.enable')
    call('Emulation.setDeviceMetricsOverride',{'width':1360,'height':900,'deviceScaleFactor':1,'mobile':False})
    base=(OUT/'fixture.html').as_uri()
    call('Page.navigate',{'url':base})
    for _ in range(120):
        time.sleep(.05)
        state=evaluate("window.results || (document.getElementById('fatal') ? {fatal:document.getElementById('fatal').textContent}:null)")
        if state:break
    if not state:raise RuntimeError('Fixture did not finish: '+str(evaluate('window.failures')))
    (OUT/'report.json').write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding='utf-8')
    if 'fatal' in state:print(state);raise RuntimeError('Fixture failed')
    print('Checks:',len(state['checks']),'Options:',len(state['options']))
    print('Failures:',[x for x in state['checks'] if not x['ok']])
    call('Page.navigate',{'url':base+'?test=persist'})
    for _ in range(100):
        time.sleep(.05)
        persisted=evaluate('window.results || null')
        if persisted:break
    print('Reload checks:', persisted['checks'] if persisted else 'TIMEOUT')
    (OUT/'persist-report.json').write_text(json.dumps(persisted,ensure_ascii=False,indent=2),encoding='utf-8')
    origin=evaluate('performance.timeOrigin');evaluate("document.getElementById('btn-reload-plus').click();true")
    time.sleep(.2)
    for _ in range(100):
        time.sleep(.05)
        if evaluate('performance.timeOrigin')!=origin and evaluate('!!window.results'):break
    reloaded=evaluate('performance.timeOrigin')!=origin
    print('Actual reload action:',reloaded)
    for option in state['options']:
        if option['id']=='btn-reload-plus':option['ok']=reloaded
    state['checks'].append({'ok':reloaded,'name':'actual reload action preserves settings'})
    (OUT/'report.json').write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding='utf-8')
    for name,query,width,height in [('home','test=preview&pane=home',1360,900),('reference-stress','test=preview&pane=home&stress=wallpaper-font',1360,900),('dark','test=preview&pane=tab-appearance&sub=appearance-design',1360,900),('light','test=preview&background=light&pane=tab-appearance&sub=appearance-design',1360,900),('moving','test=preview&background=moving&pane=tab-appearance&sub=appearance-design',1360,900),('compact','test=preview&pane=tab-appearance&sub=appearance-design',800,800),('classic','test=preview&pane=tab-appearance&mode=classic&sub=appearance-profile',1360,900),('dense','test=preview&pane=tab-appearance&mode=compact&sub=appearance-profile',1360,900),('glass-options','test=preview&pane=tab-appearance&sub=appearance-profile',1360,900),('wallpapers','test=preview&pane=tab-wallpapers&sub=wallpapers-catalog',1360,900),('fonts','test=preview&group=fonts',1360,900),('tools','test=preview&group=tools',1360,900),('system','test=preview&group=system',1360,900),('zoom200','test=preview&pane=tab-appearance&sub=appearance-design',680,450)]:
        call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':2 if name=='zoom200' else 1,'mobile':False})
        call('Page.navigate',{'url':base+'?'+query})
        for _ in range(100):
            time.sleep(.05)
            if evaluate('!!window.results'):break
        evaluate('document.fonts.ready.then(()=>true)')
        time.sleep(.3)
        evaluate("document.activeElement.blur();document.querySelector('#ym-mod-modal .ym-modal-content').scrollTop=0;true")
        geometry=evaluate("(()=>{const m=document.getElementById('ym-mod-modal'),r=m.getBoundingClientRect();return {width:innerWidth,height:innerHeight,right:r.right,bottom:r.bottom,workspaceOverflow:m.querySelector('.ym-glass-workspace').scrollWidth>m.querySelector('.ym-glass-workspace').clientWidth}})()")
        print(name,geometry)
        png=call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})
        (OUT/(name+'.png')).write_bytes(base64.b64decode(png['data']))
    call('Emulation.setDeviceMetricsOverride',{'width':1360,'height':900,'deviceScaleFactor':1,'mobile':False})
    call('Page.navigate',{'url':base+'?test=preview&pane=tab-appearance&sub=appearance-design'})
    for _ in range(100):
        time.sleep(.05)
        if evaluate('!!window.results'):break
    pointer=[]
    for mode in ['classic','compact','modern']:
        point=evaluate("(()=>{const r=document.querySelector('[data-choice-select=\"opt-design-mode\"] [data-value=\""+mode+"\"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()")
        call('Input.dispatchMouseEvent',{'type':'mousePressed','x':point['x'],'y':point['y'],'button':'left','clickCount':1})
        call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':point['x'],'y':point['y'],'button':'left','clickCount':1})
        actual=evaluate("({mode:document.documentElement.dataset.ymDesignMode,menuMode:document.getElementById('ym-mod-modal').dataset.mode,blur:getComputedStyle(document.getElementById('ym-mod-modal')).backdropFilter,playerHeight:getComputedStyle(document.getElementById('native-player')).height})")
        assert actual['mode']==mode, 'Real pointer did not switch '+mode
        pointer.append(actual)
    (OUT/'pointer-mode-report.json').write_text(json.dumps(pointer,indent=2),encoding='utf-8')
    print('Real pointer clicks changed all three design modes:',[p['mode'] for p in pointer])
    # Real font enlargement, independent of the historical HiDPI screenshot above.
    enlarged=[]
    for width in [1360,800]:
        call('Emulation.setDeviceMetricsOverride',{'width':width,'height':800,'deviceScaleFactor':1,'mobile':False})
        call('Page.navigate',{'url':base+'?test=preview&pane=home&scale=200'})
        for _ in range(100):
            time.sleep(.05)
            if evaluate('!!window.results'):break
        assert evaluate("getComputedStyle(document.getElementById('ym-mod-modal')).fontSize")=='30px'
        pages=['home']+evaluate("[...document.querySelectorAll('.ym-modal-tabs [data-tab]:not([hidden])')].map(b=>b.dataset.tab)")
        for page in pages:
            evaluate("document.querySelector("+json.dumps('#ym-settings-home' if page=='home' else '[data-tab="'+page+'"]')+").click();true")
            subs=evaluate("[...document.querySelectorAll('.ym-settings-subnav button')].filter(b=>!b.closest('[hidden]')).map(b=>b.dataset.subtarget)") or [None]
            for sub in subs:
                if sub:evaluate("document.querySelector('[data-subtarget=\""+sub+"\"]').click();true")
                time.sleep(.03)
                result=evaluate("""(()=>{const m=document.getElementById('ym-mod-modal'),s=m.querySelector(m.dataset.page==='home'?'.ym-modal-tabs':'.ym-modal-content'),r=m.getBoundingClientRect();return {font:getComputedStyle(m).fontSize,scrollHeight:s.clientHeight,overflow:s.scrollWidth>s.clientWidth+1,outside:r.right>innerWidth||r.bottom>innerHeight,clipped:[...m.querySelectorAll('.ym-label,.ym-desc,.ym-hub-label,.ym-hub-detail,.ym-btn-action,.ym-about-description')].filter(e=>e.getClientRects().length && (e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1)).map(e=>e.id||e.textContent.trim().slice(0,60))}})()""")
                result.update(width=width,page=page,subsection=sub);enlarged.append(result)
            if page in ['home','tab-about','tab-fonts']:
                png=call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})
                (OUT/('text200-'+str(width)+'-'+page+'.png')).write_bytes(base64.b64decode(png['data']))
    (OUT/'text200-report.json').write_text(json.dumps(enlarged,ensure_ascii=False,indent=2),encoding='utf-8')
    bad=[r for r in enlarged if r['overflow'] or r['outside'] or r['clipped'] or r['scrollHeight']<60]
    print('Actual 200% text layout:',len(enlarged),'views; issues:',bad)
    assert not bad,'Enlarged text layout regression'
    call('Emulation.setDeviceMetricsOverride',{'width':1360,'height':900,'deviceScaleFactor':1,'mobile':False})
    call('Page.navigate',{'url':base+'?test=preview&pane=tab-about'})
    for _ in range(100):
        time.sleep(.05)
        if evaluate('!!window.results'):break
    evaluate("Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>true});updaterEmit({status:'available',version:'1.6.0',presentationAllowed:true,offer:true,update:{version:'1.7.0',size:107605961,notes:['Больше возможностей для оформления','Улучшения плеера и исправления ошибок']}});true")
    time.sleep(.3)
    png=call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})
    (OUT/'update-dialog.png').write_bytes(base64.b64decode(png['data']))
    ws.close()
    assert all(c['ok'] for c in state['checks']), 'Menu behavior regression'
    assert persisted and all(c['ok'] for c in persisted['checks']), 'Persistence regression'
finally:
    proc.terminate()
    try:proc.wait(timeout=5)
    except subprocess.TimeoutExpired:proc.kill()
