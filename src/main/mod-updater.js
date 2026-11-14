// Independent of electron-updater: the original application's updater stays disabled.
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');
const { Transform } = require('stream');
const VERSION = fs.existsSync(path.join(__dirname,'mod-version.json')) ? require('./mod-version.json') : require('../mod-version.json');
const HOUR = 3600000;
function compare(a, b) {
  const parse = v => { if (!/^\d+\.\d+\.\d+$/.test(v)) throw new Error('Некорректная версия'); return v.split('.').map(Number); };
  const x = parse(a), y = parse(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
  return 0;
}
function allowedURL(value) {
  const u = new URL(value);
  if (u.protocol !== 'https:' || u.username || u.password || u.port || !['api.github.com','github.com','objects.githubusercontent.com','release-assets.githubusercontent.com'].includes(u.hostname)) throw new Error('Недопустимый адрес обновления');
  return u;
}
function request(url, signal, redirects = 0) {
  return new Promise((resolve, reject) => {
    try { allowedURL(url); } catch (e) { reject(e); return; }
    const req = https.get(url, {signal, headers:{'User-Agent':`YandexMusicMod/${VERSION.version}`,Accept:'application/vnd.github+json'}}, res => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
        res.resume();
        if (redirects >= 5) return reject(new Error('Слишком много перенаправлений'));
        request(new URL(res.headers.location, url).href, signal, redirects + 1).then(resolve, reject); return;
      }
      if (res.statusCode !== 200) {
        res.resume(); const e = new Error([403,429].includes(res.statusCode) ? 'GitHub временно ограничил проверки. Попробуйте позже.' : `Сервер обновлений: HTTP ${res.statusCode}`);
        e.retryAt = Number(res.headers['x-ratelimit-reset'] || 0) * 1000 || Date.now() + Number(res.headers['retry-after'] || 60) * 1000;
        reject(e); return;
      }
      resolve(res);
    });
    req.setTimeout(30000, () => req.destroy(new Error('Сервер не ответил вовремя')));
    req.on('error', reject);
  });
}
async function json(url, signal, transport = request) {
  const stream = await transport(url, signal); const chunks = []; let size = 0;
  for await (const chunk of stream) { size += chunk.length; if (size > 2 * 1024 * 1024) { stream.destroy(); throw new Error('Слишком большой ответ сервера'); } chunks.push(chunk); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function manifestFor(release, manifest) {
  if (!manifest || manifest.platform !== VERSION.platform) return null;
  compare(manifest.version, VERSION.version);
  if (!/^[\w. -]+\.exe$/i.test(manifest.installer) || !Number.isSafeInteger(manifest.size) || manifest.size < 1 || manifest.size > 2 * 1024 ** 3 || !/^[a-f\d]{64}$/i.test(manifest.sha256)) throw new Error('Некорректный манифест Windows');
  const asset = release.assets.find(a => a.name === manifest.installer);
  if (!asset || asset.size !== manifest.size || !asset.browser_download_url.startsWith(`https://github.com/${VERSION.repository}/releases/download/`)) throw new Error('Установщик не совпадает с манифестом');
  allowedURL(asset.browser_download_url);
  return {...manifest, sha256:manifest.sha256.toLowerCase(), notes:(Array.isArray(manifest.notes) ? manifest.notes : [manifest.notes || 'Обновление мода']).slice(0,12).map(s => String(s).slice(0,500)), url:asset.browser_download_url};
}
class ModUpdater {
  constructor({settings, directory, notify = () => {}, transport = request, now = Date.now, version = VERSION.version, launch, diskFree} = {}) {
    Object.assign(this, {settings,directory,notify,transport,now,version,launch,diskFree});
    this.state = {status:'idle',version,baseVersion:VERSION.baseVersion,auto:settings.get('updates/automatic',true)};
    this.lastCheck = null; this.pending = null; this.flight = null; this.controller = null; this.retryAt = 0; this.generation = 0;
  }
  snapshot() { const {url, ...update} = this.pending || {}; return {...this.state,auto:this.settings.get('updates/automatic',true), update:this.pending ? update : null}; }
  emit(patch) { Object.assign(this.state,patch); const state = this.snapshot(); this.notify(state); return state; }
  canOffer(manual = false) { return !!this.pending && (manual || (this.settings.get('updates/skipped','') !== this.pending.version && this.now() >= this.settings.get('updates/deferUntil',0))); }
  async check(manual = false) {
    if (this.flight) return manual ? this.flight.then(() => this.emit({manual:true,offer:this.canOffer(true)})) : this.flight;
    if (this.controller || this.state.status === 'ready') return this.emit({offer:this.canOffer(manual)});
    if (this.lastCheck !== null && this.now() - this.lastCheck < HOUR) return this.emit({offer:this.canOffer(manual), manual});
    if (this.now() < this.retryAt) return manual ? this.emit({status:'error',error:'GitHub временно ограничил проверки. Попробуйте позже.',manual:true}) : this.snapshot();
    this.flight = this.performCheck(manual).finally(() => {this.flight = null;}); return this.flight;
  }
  async performCheck(manual) {
    this.emit({status:'checking',error:null,manual,offer:false});
    try {
      const releases = await json(`https://api.github.com/repos/${VERSION.repository}/releases?per_page=50`,undefined,this.transport);
      if (!Array.isArray(releases)) throw new Error('Некорректный список релизов');
      const candidates = [];
      for (const release of releases) {
        if (release.draft || release.prerelease || !Array.isArray(release.assets)) continue;
        const asset = release.assets.find(a => a.name === 'windows-update.json');
        if (!asset) continue;
        if (!asset.browser_download_url.startsWith(`https://github.com/${VERSION.repository}/releases/download/`)) throw new Error('Некорректный адрес манифеста');
        const candidate = manifestFor(release, await json(asset.browser_download_url,undefined,this.transport));
        if (candidate) candidates.push(candidate);
      }
      candidates.sort((a,b) => compare(b.version,a.version));
      const latest = candidates[0]; this.pending = latest && compare(latest.version,this.version) > 0 ? latest : null;
      this.lastCheck = this.now();
      return this.emit({status:this.pending ? 'available':'current',checkedAt:this.lastCheck,compatible:!!latest,offer:this.canOffer(manual),manual});
    } catch(e) {
      // Cache completed checks, not outages. A manual retry can recover as soon
      // as the network returns; rate limits still honor the server deadline.
      this.retryAt = e.retryAt || 0;
      return this.emit({status:'error',error:e.message,checkedAt:this.now(),manual,offer:false});
    }
  }
  automatic(enabled) { this.settings.set('updates/automatic',!!enabled); return this.emit({auto:!!enabled}); }
  defer(skip = false) { if (this.pending) this.settings.set(skip ? 'updates/skipped':'updates/deferUntil',skip ? this.pending.version : this.now() + 24 * HOUR); return this.emit({offer:false,manual:false}); }
  async download() {
    if (!this.pending || this.controller || this.state.status === 'ready') return this.snapshot();
    const update = {...this.pending}, controller = new AbortController(), generation = ++this.generation;
    this.controller = controller; const part = path.join(this.directory,'installer.part');
    this.emit({status:'downloading',progress:0,received:0,error:null,offer:true});
    try {
      await fs.promises.mkdir(this.directory,{recursive:true});
      const free = this.diskFree ? await this.diskFree(this.directory) : await fs.promises.statfs(this.directory).then(s => s.bavail * s.bsize);
      if (free < update.size * 2 + 16 * 1024 ** 2) throw new Error('Недостаточно места для обновления');
      const response = await this.transport(update.url,controller.signal);
      const hash = crypto.createHash('sha256'); let count = 0, last = 0;
      const meter = new Transform({transform:(chunk,enc,done) => {
        count += chunk.length;
        if (count > update.size) return done(new Error('Размер загрузки не совпал'));
        hash.update(chunk);
        if (this.now() - last > 120) {last = this.now(); this.emit({received:count,progress:count/update.size});}
        done(null,chunk);
      }});
      await pipeline(response,meter,fs.createWriteStream(part,{flags:'w'}),{signal:controller.signal});
      if (count !== update.size || hash.digest('hex') !== update.sha256) throw new Error('Проверка SHA256 не пройдена. Повторите загрузку.');
      this.verifiedPath = path.join(this.directory,`MusicMod-${update.version}.exe`);
      await fs.promises.rename(part,this.verifiedPath);
      return this.emit({status:'ready',progress:1,received:count,offer:this.canOffer()});
    } catch(e) {
      await fs.promises.rm(part,{force:true}).catch(() => {});
      return this.emit(controller.signal.aborted ? {status:'available',offer:false,error:null} : {status:'error',error:e.message,offer:true});
    } finally { if (this.generation === generation) this.controller = null; }
  }
  cancel() { this.controller?.abort(); return this.snapshot(); }
  async install() {
    if (this.installing) return this.snapshot();
    if (this.state.status !== 'ready' || !this.verifiedPath || !this.pending) throw new Error('Обновление ещё не готово');
    this.installing = true;
    try {
      // Recheck immediately before execution, including modifications after download.
      const stat = await fs.promises.stat(this.verifiedPath); const hash = crypto.createHash('sha256');
      for await (const chunk of fs.createReadStream(this.verifiedPath)) hash.update(chunk);
      if (stat.size !== this.pending.size || hash.digest('hex') !== this.pending.sha256) throw new Error('Установщик повреждён. Загрузите его заново.');
      await this.launch(this.verifiedPath); return this.snapshot();
    } catch(e) {
      this.verifiedPath = null;
      return this.emit({status:'error',error:e.code === 'ENOENT' ? 'Файл обновления удалён. Загрузите его заново.' : e.message,offer:true});
    }
    finally { this.installing = false; }
  }
}
module.exports = {ModUpdater,compare,manifestFor,allowedURL,VERSION};
