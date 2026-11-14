const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {Readable} = require('node:stream');
const {ModUpdater,compare,allowedURL,VERSION} = require('../../src/main/mod-updater');
const data = Buffer.from('MZ test installer payload');
const digest = crypto.createHash('sha256').update(data).digest('hex');
const root = `https://github.com/${VERSION.repository}/releases/download/v2.0.0/`;
function fixture({version='2.0.0',releaseFlags={},manifest=true,hash=digest,networkError=null,free=1e10,stream}={}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(),'ym-updater-'));
  const values = {}, states = []; let requests = 0, clock = 100000000, launches = 0;
  const settings = {get:(k,d)=>k in values ? values[k]:d,set:(k,v)=>values[k]=v};
  const transport = async (url,signal) => {
    requests++;
    if(networkError)throw networkError;
    const asset = {name:'MusicMod.exe',size:data.length,browser_download_url:root+'MusicMod.exe'};
    if(url.includes('api.github.com'))return Readable.from([Buffer.from(JSON.stringify([{...releaseFlags,assets:[asset,...(manifest?[{name:'windows-update.json',browser_download_url:root+'windows-update.json'}]:[])]}]))]);
    if(url.endsWith('.json'))return Readable.from([Buffer.from(JSON.stringify({version,platform:'win32-x64',installer:'MusicMod.exe',size:data.length,sha256:hash,notes:['Changes']}))]);
    return stream ? stream(signal) : Readable.from([data]);
  };
  const updater = new ModUpdater({settings,directory,transport,now:()=>clock,notify:s=>states.push(s),diskFree:()=>free,launch:async()=>{launches++;}});
  return {updater,values,states,directory,requests:()=>requests,advance:ms=>clock+=ms,launches:()=>launches,cleanup:()=>fs.rmSync(directory,{recursive:true,force:true})};
}
test('numeric stable version comparison; equal/local newer never offer',async()=>{
  assert.equal(compare('1.10.0','1.9.9'),1);assert.throws(()=>compare('1.2.3-beta','1.2.3'));
  for(const version of [VERSION.version,'1.0.0']){const f=fixture({version});try{assert.equal((await f.updater.check()).status,'current');assert.equal(f.updater.snapshot().offer,false);}finally{f.cleanup();}}
});
test('Android-only, missing manifest, draft and prerelease ignored',async()=>{
  for(const opts of [{manifest:false},{releaseFlags:{prerelease:true}},{releaseFlags:{draft:true}}]){const f=fixture(opts);try{const s=await f.updater.check();assert.equal(s.status,'current');assert.equal(s.compatible,false);}finally{f.cleanup();}}
});
test('new release; 1h cache, concurrent checks merge, manual skip/defer override',async()=>{
  const f=fixture();try{
    const results=await Promise.all([f.updater.check(),f.updater.check()]);assert.equal(f.requests(),2);assert.equal(results[0].status,'available');
    assert.equal('url' in results[0].update,false);
    f.updater.defer(true);assert.equal((await f.updater.check()).offer,false);assert.equal((await f.updater.check(true)).offer,true);
    f.values['updates/skipped']='';f.updater.defer();assert.equal((await f.updater.check()).offer,false);f.advance(24*3600000+1);assert.equal((await f.updater.check()).offer,true);
    f.updater.automatic(false);assert.equal(f.updater.snapshot().auto,false);
  }finally{f.cleanup();}
});
test('offline failure is silent in background, explicit on manual check',async()=>{
  const f=fixture({networkError:new Error('offline')});try{assert.equal((await f.updater.check()).manual,false);assert.equal((await f.updater.check(true)).manual,true);}finally{f.cleanup();}
});
test('rate limit prevents new requests until retry time',async()=>{
  const error=Object.assign(new Error('rate limited'),{retryAt:100060000});const f=fixture({networkError:error});try{await f.updater.check();await f.updater.check(true);assert.equal(f.requests(),1);}finally{f.cleanup();}
});

test('manual check recovers immediately after a transient network failure',async()=>{
  const f=fixture();try{
    const online=f.updater.transport;
    f.updater.transport=async()=>{throw new Error('offline');};
    assert.equal((await f.updater.check()).status,'error');
    f.updater.transport=online;
    assert.equal((await f.updater.check(true)).status,'available');
    assert.equal(f.requests(),2);
  }finally{f.cleanup();}
});

test('rate-limit recovery uses the server deadline instead of a one-hour error cache',async()=>{
  const f=fixture();try{
    const online=f.updater.transport;
    f.updater.transport=async()=>{throw Object.assign(new Error('rate limited'),{retryAt:100060000});};
    await f.updater.check();f.updater.transport=online;
    assert.equal((await f.updater.check(true)).status,'error');assert.equal(f.requests(),0);
    f.advance(60001);
    assert.equal((await f.updater.check(true)).status,'available');
  }finally{f.cleanup();}
});
test('verified download, explicit installation, recheck hash before execute',async()=>{
  const f=fixture();try{
    await f.updater.check();assert.equal((await f.updater.download()).status,'ready');assert.equal(f.launches(),0);assert.equal(fs.existsSync(path.join(f.directory,'installer.part')),false);
    await f.updater.install();assert.equal(f.launches(),1);
    fs.appendFileSync(f.updater.verifiedPath,'bad');assert.equal((await f.updater.install()).status,'error');assert.equal(f.launches(),1);
  }finally{f.cleanup();}
});
test('SHA mismatch, disk space and retry never execute incomplete files',async()=>{
  for(const opts of [{hash:'0'.repeat(64)},{free:0}]){const f=fixture(opts);try{await f.updater.check();assert.equal((await f.updater.download()).status,'error');assert.equal(f.launches(),0);assert.equal(fs.existsSync(path.join(f.directory,'installer.part')),false);f.updater.pending.sha256=digest;f.updater.diskFree=()=>1e10;assert.equal((await f.updater.download()).status,'ready');}finally{f.cleanup();}}
});
test('cancel stops and removes partial download; retry succeeds',async()=>{
  const f=fixture({stream:()=>new Readable({read(){}})});try{
    await f.updater.check();const pending=f.updater.download();await new Promise(r=>setTimeout(r,20));f.updater.cancel();assert.equal((await pending).status,'available');assert.equal(fs.existsSync(path.join(f.directory,'installer.part')),false);
    const transport=f.updater.transport;f.updater.transport=async(url,signal)=>url.endsWith('.exe')?Readable.from([data]):transport(url,signal);assert.equal((await f.updater.download()).status,'ready');
  }finally{f.cleanup();}
});
test('untrusted URLs and malformed manifest rejected',async()=>{
  for(const url of ['http://github.com/a','https://evil.example/test','https://user:password@github.com/a','file:///tmp/test'])assert.throws(()=>allowedURL(url));
  const f=fixture({version:'garbage'});try{assert.equal((await f.updater.check(true)).status,'error');}finally{f.cleanup();}
});
test('manual request during background check overrides a skipped release without a second request',async()=>{
  const f=fixture();try{
    f.values['updates/skipped']='2.0.0';const background=f.updater.check(false),manual=f.updater.check(true);
    await background;const state=await manual;assert.equal(state.manual,true);assert.equal(state.offer,true);assert.equal(f.requests(),2);
  }finally{f.cleanup();}
});
test('double install is coalesced before asynchronous hash check; missing file allows retry',async()=>{
  const f=fixture();try{
    await f.updater.check();await f.updater.download();await Promise.all([f.updater.install(),f.updater.install()]);assert.equal(f.launches(),1);
    fs.unlinkSync(f.updater.verifiedPath);assert.equal((await f.updater.install()).status,'error');assert.equal((await f.updater.download()).status,'ready');
  }finally{f.cleanup();}
});
