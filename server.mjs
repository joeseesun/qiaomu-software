import { createServer } from 'node:http';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { home, sharePage, terms, errorPage } from './views.mjs';

const directory = fileURLToPath(new URL('./public/', import.meta.url));
const maxImage = 8 * 1024 * 1024;
const maxBody = Math.ceil(maxImage / 3) * 4 + 12000;
const idPattern = '[a-f0-9]{24}';
const pngMagic = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const media = new Map([
  ['/site.css', 'text/css; charset=utf-8'],
  ['/site.js', 'text/javascript; charset=utf-8'],
  ['/mark.svg', 'image/svg+xml'],
  ['/demo.webp', 'image/webp'],
  ['/qiaomu-reward.png', 'image/png'],
  ['/qiaomu-follow.jpg', 'image/jpeg'],
]);
const policy = "default-src 'none'; style-src 'self'; img-src 'self'; script-src 'self' https://umami.qiaomu.ai; connect-src 'self' https://umami.qiaomu.ai; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
const sha = (data) => createHash('sha256').update(data).digest('hex');
class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function send(res, status, type, body, extra = {}) {
  res.writeHead(status, { 'content-type': type, 'x-content-type-options': 'nosniff',
    'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'content-security-policy': policy, ...extra });
  res.end(body);
}
const html = (res, status, body) => send(res, status, 'text/html; charset=utf-8', body);
const json = (res, status, body) => send(res, status, 'application/json; charset=utf-8', JSON.stringify(body));

function clean(value, maximum, label) {
  if (typeof value !== 'string') throw new RequestError(400, label + '无效。');
  const normalized = value.normalize('NFC').trim();
  if (!normalized || Array.from(normalized).length > maximum || /[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(normalized)) {
    throw new RequestError(400, label + '长度或字符无效。');
  }
  return normalized;
}

async function readJson(req, limit) {
  if (req.headers['content-type']?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') throw new RequestError(415, '需要 JSON 请求。');
  if (Number(req.headers['content-length']) > limit) throw new RequestError(413, '上传内容过大。');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new RequestError(413, '上传内容过大。');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new RequestError(400, '无法读取 JSON。'); }
}

function sharePayload(input) {
  const name = clean(input?.name, 40, '分享名');
  const title = clean(input?.title, 34, '标题');
  const visibility = input.visibility;
  if (!['link', 'public'].includes(visibility)) throw new RequestError(400, '请选择分享范围。');
  if (!Array.isArray(input.apps) || input.apps.length < 1 || input.apps.length > 48) throw new RequestError(400, '请选择 1–48 款软件。');
  const apps = input.apps.map((app) => ({ name: clean(app?.name, 60, '软件名'), group: clean(app?.group, 14, '分类') }));
  if (typeof input.image !== 'string' || input.image.length > Math.ceil(maxImage / 3) * 4 || input.image.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(input.image)) throw new RequestError(400, '图片编码无效。');
  const picture = Buffer.from(input.image, 'base64');
  if (picture.length > maxImage) throw new RequestError(413, '图片超过 8 MiB。');
  if (!picture.subarray(0, 8).equals(pngMagic)) throw new RequestError(415, '请上传 PNG 海报。');
  return { name, title, visibility, apps: JSON.stringify(apps), picture };
}

async function encodeImages(picture) {
  try {
    const input = sharp(picture, { limitInputPixels: 10_000_000, failOn: 'warning' });
    const meta = await input.metadata();
    if (meta.format !== 'png' || meta.width < 320 || meta.height < 180 || meta.width > 4096 || meta.height > 4096 || meta.pages > 1) throw Error('unsupported');
    const normal = input.flatten({ background: '#152029' }).toColourspace('srgb');
    const image = await normal.clone().resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
    const thumbnail = await normal.resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
    if (image.data.length > 5 * 1024 * 1024) throw Error('output size');
    return { image: image.data, thumbnail, width: image.info.width, height: image.info.height };
  } catch { throw new RequestError(422, '图片损坏或尺寸不符合要求。'); }
}

export function createSoftwareServer({
  path = ':memory:', origin = 'http://localhost:3268', umamiId = '', trustedProxy = false, maxShares = 4000, maxBytes = 1_500_000_000,
} = {}) {
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA secure_delete = FAST;
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY, owner_hash TEXT NOT NULL, digest TEXT NOT NULL,
      name TEXT NOT NULL, title TEXT NOT NULL, visibility TEXT NOT NULL,
      apps TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
      image BLOB NOT NULL, thumbnail BLOB NOT NULL, created INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS gallery_created ON shares(visibility, created DESC);
    CREATE TABLE IF NOT EXISTS reports (id TEXT NOT NULL, reason TEXT NOT NULL, created INTEGER NOT NULL);
  `);
  const summary = 'id,name,title,visibility,apps,width,height,created';
  const getShare = db.prepare('SELECT ' + summary + ' FROM shares WHERE id=?');
  const getOwner = db.prepare('SELECT owner_hash,digest,visibility FROM shares WHERE id=?');
  const insert = db.prepare('INSERT INTO shares VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  const deleteShare = db.prepare('DELETE FROM shares WHERE id=? AND owner_hash=?');
  const getImage = db.prepare('SELECT image AS data FROM shares WHERE id=?');
  const getThumb = db.prepare('SELECT thumbnail AS data FROM shares WHERE id=?');
  const getUsage = db.prepare('SELECT COUNT(*) AS count, COALESCE(SUM(length(image)+length(thumbnail)),0) AS bytes FROM shares');
  const report = db.prepare('INSERT INTO reports VALUES (?,?,?)');
  const reportCount = db.prepare('SELECT count(*) AS count FROM reports WHERE id=?');
  const getGallery = db.prepare('SELECT ' + summary + " FROM shares WHERE visibility='public' AND (?='' OR instr(lower(name),lower(?))>0 OR instr(lower(title),lower(?))>0 OR EXISTS (SELECT 1 FROM json_each(shares.apps) WHERE instr(lower(json_extract(value, '$.name')),lower(?))>0)) ORDER BY created DESC,id DESC LIMIT 25 OFFSET ?");
  const getSitemap = db.prepare("SELECT id FROM shares WHERE visibility='public' ORDER BY created DESC LIMIT 4000");
  const buckets = new Map();
  let processing = 0;

  function limit(req, kind, maximum) {
    const now = Date.now();
    const address = (trustedProxy && req.headers['x-real-ip']) || req.socket.remoteAddress;
    const key = kind + ':' + address;
    if (buckets.size >= 4096) {
      for (const [old, value] of buckets) if (value.until <= now) buckets.delete(old);
    }
    let bucket = buckets.get(key);
    if (!bucket || bucket.until <= now) {
      if (buckets.size >= 4096 && !buckets.has(key)) throw new RequestError(429, '请稍后再试。');
      bucket = { until: now + 15 * 60_000, count: 0 };
      buckets.set(key, bucket);
    }
    if (++bucket.count > maximum) throw new RequestError(429, '操作太频繁，请稍后再试。');
  }

  async function create(req, res) {
    limit(req, 'upload', 10);
    if (processing >= 3) throw new RequestError(503, '现在有多张海报正在处理，请稍后重试。');
    processing++;
    try {
      const requested = req.headers['idempotency-key'];
      if (requested !== undefined && !/^[a-f0-9]{64}$/.test(String(requested))) throw new RequestError(400, '上传编号格式无效。');
      const owner = requested ?? randomBytes(32).toString('hex');
      const id = sha('share:' + owner).slice(0, 24);
      const ownerHash = sha('owner:' + owner);
      const data = sharePayload(await readJson(req, maxBody));
      const digest = sha(JSON.stringify([data.name, data.title, data.visibility, data.apps, sha(data.picture)]));
      const result = () => ({ id, url: origin + '/s/' + id, removeToken: owner, visibility: data.visibility });
      const replay = () => {
        const existing = getOwner.get(id);
        if (!existing) return false;
        if (existing.digest !== digest || existing.owner_hash !== ownerHash) throw new RequestError(409, '同一上传编号已用于另一张海报。');
        json(res, 200, result());
        return true;
      };
      if (replay()) return;
      let usage = getUsage.get();
      if (usage.count >= maxShares || usage.bytes >= maxBytes) throw new RequestError(503, '画廊暂时无法接收新作品。');
      const rendered = await encodeImages(data.picture);
      if (replay()) return;
      usage = getUsage.get();
      if (usage.count >= maxShares || usage.bytes + rendered.image.length + rendered.thumbnail.length > maxBytes) throw new RequestError(503, '画廊暂时无法接收新作品。');
      insert.run(id, ownerHash, digest, data.name, data.title, data.visibility, data.apps,
        rendered.width, rendered.height, rendered.image, rendered.thumbnail, Date.now());
      return json(res, 201, result());
    } finally { processing--; }
  }

  async function route(req, res) {
    const url = new URL(req.url, 'http://local.invalid');
    const pathname = url.pathname;
    const method = req.method;
    const read = method === "GET" || method === "HEAD";
    if (read && pathname === '/healthz') return json(res, 200, { ok: db.prepare('SELECT 1 AS ok').get().ok === 1 });
    if (read && pathname === '/') {
      const q = (url.searchParams.get('q') ?? '').slice(0, 60).trim();
      const page = Math.min(167, Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1));
      return html(res, 200, home({ shares: getGallery.all(q, q, q, q, (page - 1) * 24), q, page, origin, umamiId }));
    }
    if (read && pathname === '/privacy') return html(res, 200, terms({ origin, umamiId }));
    if (read && pathname === '/robots.txt') return send(res, 200, 'text/plain; charset=utf-8', 'User-agent: *\nDisallow: /api/\nSitemap: ' + origin + '/sitemap.xml\n');
    if (read && pathname === '/sitemap.xml') {
      const links = ['/', '/privacy', ...getSitemap.all().map(row => '/s/' + row.id)];
      return send(res, 200, 'application/xml; charset=utf-8', '<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        links.map(link => '<url><loc>' + origin + link + '</loc></url>').join('') + '</urlset>');
    }
    if ((method === 'GET' || method === 'HEAD') && media.has(pathname)) {
      try {
        const data = readFileSync(join(directory, pathname.slice(1)));
        return send(res, 200, media.get(pathname), method === 'HEAD' ? '' : data, { 'cache-control': 'public, max-age=3600', 'content-length': data.length });
      } catch { throw new RequestError(404, '找不到这个文件。'); }
    }
    if (method === 'POST' && pathname === '/api/v1/shares') return create(req, res);
    const showcase = pathname.match(new RegExp('^/s/(' + idPattern + ')$'));
    if ((method === 'GET' || method === 'HEAD') && showcase) {
      const row = getShare.get(showcase[1]);
      if (row) return html(res, 200, method === 'HEAD' ? '' : sharePage({ row, origin, umamiId }));
    }
    const asset = pathname.match(new RegExp('^/media/(' + idPattern + ')(/thumb)?[.]webp$'));
    if ((method === 'GET' || method === 'HEAD') && asset) {
      const data = (asset[2] ? getThumb : getImage).get(asset[1])?.data;
      if (data) return send(res, 200, 'image/webp', method === 'HEAD' ? '' : data, { 'content-length': data.byteLength, 'x-robots-tag': 'noindex' });
    }
    const api = pathname.match(new RegExp('^/api/v1/shares/(' + idPattern + ')(/reports)?$'));
    if (method === 'DELETE' && api && !api[2]) {
      limit(req, 'remove', 25);
      const owner = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
      const existing = getOwner.get(api[1]);
      if (!owner || !existing || !timingSafeEqual(Buffer.from(existing.owner_hash), Buffer.from(sha('owner:' + owner)))) throw new RequestError(404, '找不到这条分享或移除凭证无效。');
      deleteShare.run(api[1], existing.owner_hash);
      db.prepare('DELETE FROM reports WHERE id=?').run(api[1]);
      return send(res, 204, 'application/json', '');
    }
    if (method === 'POST' && api?.[2]) {
      limit(req, 'report', 10);
      if (!getShare.get(api[1])) throw new RequestError(404, '找不到这条分享。');
      if (reportCount.get(api[1]).count >= 30) throw new RequestError(429, '已有反馈在等待查看。');
      const reason = clean((await readJson(req, 1200))?.reason, 200, '举报原因');
      report.run(api[1], reason, Date.now());
      return json(res, 201, { received: true });
    }
    throw new RequestError(404, '没有找到这个页面。');
  }

  const server = createServer({ requestTimeout: 30_000, headersTimeout: 12_000 }, (req, res) => {
    route(req, res).catch(error => {
      if (res.destroyed || res.headersSent) return;
      const status = error instanceof RequestError ? error.status : 500;
      if (status === 500) console.error('Software request failed', error.name);
      const message = status === 500 ? '暂时无法处理，请稍后再试。' : error.message;
      if (req.url.startsWith('/api/')) json(res, status, { error: message });
      else html(res, status, errorPage({ origin, umamiId, status, message }));
    });
  });
  server.on('close', () => db.close());
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT ?? 3268);
  const folder = process.env.DATA_DIR ?? './data';
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const origin = new URL(process.env.PUBLIC_ORIGIN ?? 'http://localhost:' + port).origin;
  const server = createSoftwareServer({ path: join(folder, 'shares.sqlite'), origin, umamiId: process.env.UMAMI_SITE_ID, trustedProxy: process.env.TRUST_PROXY === '1' });
  server.listen(port, '127.0.0.1', () => console.log('Qiaomu Software http://127.0.0.1:' + port));
}
