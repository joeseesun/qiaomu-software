import { createServer } from 'node:http';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { appPage, appsPage, galleryPage, home, makePage, sharePage, terms, errorPage } from './views.mjs';

const directory = fileURLToPath(new URL('./public/', import.meta.url));
const maxImage = 8 * 1024 * 1024;
const maxIcon = 64 * 1024;
const maxIconTotal = 1536 * 1024;
// Base64 image and icons, plus up to 48 app entries (name, group, note, bundle ID, icon hash) and the icon map keys.
const maxBody = Math.ceil(maxImage / 3) * 4 + Math.ceil(maxIconTotal / 3) * 4 + 48 * 900 + 24000;
const idPattern = '[a-f0-9]{24}';
const hashPattern = /^[a-f0-9]{64}$/;
const bundlePattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
const day = 86_400_000;
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
// SQLite's lower() only folds ASCII, so keys built in JS must do the same to match stored app_key values.
const appKey = (name) => String(name ?? '').normalize('NFC').trim().replace(/[A-Z]+/g, letters => letters.toLowerCase());
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

function appEntry(app) {
  const entry = { name: clean(app?.name, 60, '软件名'), group: clean(app?.group, 14, '分类') };
  if (app?.note !== undefined && app.note !== null && app.note !== '') entry.note = clean(app.note, 60, '推荐理由');
  if (app?.icon !== undefined && app.icon !== null) {
    if (typeof app.icon !== 'string' || !hashPattern.test(app.icon)) throw new RequestError(400, '图标编号无效。');
    entry.icon = app.icon;
  }
  if (app?.id !== undefined && app.id !== null) {
    if (typeof app.id !== 'string' || !bundlePattern.test(app.id)) throw new RequestError(400, '应用 ID 无效。');
    entry.id = app.id;
  }
  return entry;
}

function iconPayload(input, apps) {
  const icons = new Map();
  if (input === undefined || input === null) return icons;
  if (typeof input !== 'object' || Array.isArray(input)) throw new RequestError(400, '图标格式无效。');
  const referenced = new Set(apps.map(app => app.icon).filter(Boolean));
  let total = 0;
  for (const [hash, data] of Object.entries(input)) {
    if (!hashPattern.test(hash) || !referenced.has(hash)) throw new RequestError(400, '图标与软件清单不对应。');
    if (typeof data !== 'string' || data.length > Math.ceil(maxIcon / 3) * 4 || data.length % 4 !== 0 || !base64Pattern.test(data)) {
      throw new RequestError(400, '图标编码无效。');
    }
    const bytes = Buffer.from(data, 'base64');
    total += bytes.length;
    if (bytes.length > maxIcon || total > maxIconTotal) throw new RequestError(413, '图标过大。');
    if (!bytes.subarray(0, 8).equals(pngMagic)) throw new RequestError(415, '图标需要是 PNG。');
    if (sha(bytes) !== hash) throw new RequestError(400, '图标内容与编号不一致。');
    icons.set(hash, bytes);
  }
  return icons;
}

function sharePayload(input) {
  const name = clean(input?.name, 40, '分享名');
  const title = clean(input?.title, 34, '标题');
  const visibility = input.visibility;
  if (!['link', 'public'].includes(visibility)) throw new RequestError(400, '请选择分享范围。');
  if (!Array.isArray(input.apps) || input.apps.length < 1 || input.apps.length > 48) throw new RequestError(400, '请选择 1–48 款软件。');
  const apps = input.apps.map(appEntry);
  const icons = iconPayload(input.icons, apps);
  if (typeof input.image !== 'string' || input.image.length > Math.ceil(maxImage / 3) * 4 || input.image.length % 4 !== 0 ||
      !base64Pattern.test(input.image)) throw new RequestError(400, '图片编码无效。');
  const picture = Buffer.from(input.image, 'base64');
  if (picture.length > maxImage) throw new RequestError(413, '图片超过 8 MiB。');
  if (!picture.subarray(0, 8).equals(pngMagic)) throw new RequestError(415, '请上传 PNG 海报。');
  return { name, title, visibility, apps: JSON.stringify(apps), picture, icons };
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

async function encodeIcon(bytes) {
  try {
    const input = sharp(bytes, { limitInputPixels: 512 * 512, failOn: 'warning' });
    const meta = await input.metadata();
    if (meta.format !== 'png' || meta.width !== meta.height || meta.width < 32 || meta.width > 512 || meta.pages > 1) throw Error('unsupported');
    return await input.toColourspace('srgb').resize(128, 128).webp({ quality: 90, alphaQuality: 100 }).toBuffer();
  } catch { throw new RequestError(422, '图标损坏或尺寸不符合要求。'); }
}

// The displayed icon is the one most public posters used for the app (ties go to the newest),
// so a single bad upload cannot replace an icon that other posters agree on.
const consensusIcon = (key) => `(
  SELECT ci.icon FROM app_mentions AS ci
  JOIN shares AS cs ON cs.id=ci.share_id AND cs.visibility='public'
  JOIN icons AS cn ON cn.hash=ci.icon AND cn.blocked=0
  WHERE ci.app_key=${key}
  GROUP BY ci.icon ORDER BY COUNT(DISTINCT ci.share_id) DESC, MAX(cs.created) DESC LIMIT 1
)`;
const latestNote = (key) => `(
  SELECT ln.note FROM app_mentions AS ln JOIN shares AS ls ON ls.id=ln.share_id AND ls.visibility='public'
  WHERE ln.app_key=${key} AND ln.note IS NOT NULL ORDER BY ls.created DESC LIMIT 1
)`;
const categoriesOf = (key) => `(
  SELECT json_group_array(category) FROM (
    SELECT MIN(cm.category) AS category
    FROM app_mentions AS cm JOIN shares AS cs ON cm.share_id=cs.id AND cs.visibility='public'
    WHERE cm.app_key=${key} GROUP BY cm.category_key ORDER BY COUNT(DISTINCT cm.share_id) DESC, cm.category_key
  )
)`;

export function createSoftwareServer({
  path = ':memory:', origin = 'http://localhost:3268', umamiId = '', trustedProxy = false, maxShares = 4000, maxBytes = 1_500_000_000,
  now = () => Date.now(),
} = {}) {
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA secure_delete = FAST;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY, owner_hash TEXT NOT NULL, digest TEXT NOT NULL,
      name TEXT NOT NULL, title TEXT NOT NULL, visibility TEXT NOT NULL,
      apps TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
      image BLOB NOT NULL, thumbnail BLOB NOT NULL, created INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS gallery_created ON shares(visibility, created DESC);
    CREATE TABLE IF NOT EXISTS reports (id TEXT NOT NULL, reason TEXT NOT NULL, created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS icons (
      hash TEXT PRIMARY KEY, data BLOB NOT NULL, created INTEGER NOT NULL, blocked INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS app_mentions (
      share_id TEXT NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
      app_key TEXT NOT NULL,
      name TEXT NOT NULL,
      category_key TEXT NOT NULL,
      category TEXT NOT NULL,
      PRIMARY KEY(share_id, app_key, category_key)
    );
  `);
  const columns = new Set(db.prepare('PRAGMA table_info(app_mentions)').all().map(column => column.name));
  for (const column of ['note', 'icon', 'bundle']) {
    if (!columns.has(column)) db.exec(`ALTER TABLE app_mentions ADD COLUMN ${column} TEXT`);
  }
  const mentionColumns = 'share_id, app_key, name, category_key, category, note, icon, bundle';
  const mentionValues = (source) => `lower(trim(json_extract(${source}, '$.name'))), json_extract(${source}, '$.name'),
      lower(trim(json_extract(${source}, '$.group'))), json_extract(${source}, '$.group'),
      json_extract(${source}, '$.note'), json_extract(${source}, '$.icon'), json_extract(${source}, '$.id')`;
  db.exec(`
    CREATE INDEX IF NOT EXISTS mentions_by_app ON app_mentions(app_key, category_key, share_id);
    CREATE INDEX IF NOT EXISTS mentions_by_category ON app_mentions(category_key, app_key, share_id);
    CREATE INDEX IF NOT EXISTS mentions_by_icon ON app_mentions(app_key, icon);
    BEGIN IMMEDIATE;
    DELETE FROM app_mentions WHERE NOT EXISTS (
      SELECT 1 FROM shares WHERE id=app_mentions.share_id AND visibility='public'
    );
    INSERT OR IGNORE INTO app_mentions (${mentionColumns})
    SELECT s.id, ${mentionValues('a.value')}
    FROM shares AS s, json_each(s.apps) AS a WHERE s.visibility='public';
    COMMIT;
  `);
  const summary = 'id,name,title,visibility,apps,width,height,created';
  const publicJoin = "JOIN shares AS s ON m.share_id=s.id AND s.visibility='public'";
  const getShare = db.prepare('SELECT ' + summary + ' FROM shares WHERE id=?');
  const getOwner = db.prepare('SELECT owner_hash,digest,visibility FROM shares WHERE id=?');
  const insert = db.prepare('INSERT INTO shares VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  const insertMentions = db.prepare(`
    INSERT OR IGNORE INTO app_mentions (${mentionColumns})
    SELECT ?, ${mentionValues('value')} FROM json_each(?)
  `);
  const hasIcon = db.prepare('SELECT 1 AS ok FROM icons WHERE hash=?');
  const insertIcon = db.prepare('INSERT OR IGNORE INTO icons (hash, data, created) VALUES (?,?,?)');
  const getIcon = db.prepare('SELECT data FROM icons WHERE hash=? AND blocked=0');
  const knownIcons = db.prepare('SELECT hash FROM icons WHERE hash IN (SELECT value FROM json_each(?))');
  const usableIcons = db.prepare('SELECT hash FROM icons WHERE blocked=0 AND hash IN (SELECT value FROM json_each(?))');
  const iconsByKey = db.prepare(`
    WITH keys(k) AS (SELECT DISTINCT value FROM json_each(?))
    SELECT k AS key, ${consensusIcon('keys.k')} AS icon FROM keys
  `);
  const getStats = db.prepare(`
    SELECT (SELECT COUNT(*) FROM shares WHERE visibility='public') AS posters,
      (SELECT COUNT(DISTINCT m.app_key) FROM app_mentions AS m ${publicJoin}) AS apps,
      (SELECT COUNT(DISTINCT m.category_key) FROM app_mentions AS m ${publicJoin}) AS categories,
      (SELECT COUNT(*) FROM (SELECT DISTINCT m.share_id, m.app_key FROM app_mentions AS m ${publicJoin} WHERE m.note IS NOT NULL)) AS notes
  `);
  const getCategories = db.prepare(`
    SELECT MIN(m.category) AS name, COUNT(DISTINCT m.app_key) AS count, COUNT(DISTINCT m.share_id) AS posters
    FROM app_mentions AS m ${publicJoin}
    GROUP BY m.category_key
    ORDER BY (m.category_key=lower(?)) DESC, count DESC, m.category_key
    LIMIT 80
  `);
  const getApps = db.prepare(`
    WITH matches AS (
      SELECT m.app_key, MIN(m.name) AS name, COUNT(DISTINCT m.share_id) AS count,
        COUNT(DISTINCT CASE WHEN s.created >= ? THEN m.share_id END) AS recent,
        MIN(s.created) AS first, MAX(s.created) AS last
      FROM app_mentions AS m ${publicJoin}
      WHERE (?='' OR instr(m.app_key, lower(?))>0) AND (?='' OR m.category_key=lower(?))
      GROUP BY m.app_key
    ), ranked AS (
      SELECT *, CASE ? WHEN 'rising' THEN recent WHEN 'new' THEN first ELSE count END AS score
      FROM matches ORDER BY score DESC, count DESC, last DESC, app_key LIMIT ? OFFSET ?
    )
    SELECT app_key AS key, name, count, recent, first, last,
      ${categoriesOf('ranked.app_key')} AS categories,
      ${consensusIcon('ranked.app_key')} AS icon,
      ${latestNote('ranked.app_key')} AS note
    FROM ranked ORDER BY score DESC, count DESC, last DESC, app_key
  `);
  const apps = ({ q = '', category = '', sort = 'top', limit = 24, offset = 0 } = {}) =>
    getApps.all(now() - 30 * day, q, q, category, category, sort, limit, offset)
      .map(row => ({ ...row, categories: JSON.parse(row.categories) }));
  const getApp = db.prepare(`
    SELECT m.app_key AS key, MIN(m.name) AS name, COUNT(DISTINCT m.share_id) AS count,
      MIN(s.created) AS first, MAX(s.created) AS last, ${consensusIcon('m.app_key')} AS icon,
      (SELECT b.bundle FROM app_mentions AS b WHERE b.app_key=m.app_key AND b.bundle IS NOT NULL
        GROUP BY b.bundle ORDER BY COUNT(*) DESC LIMIT 1) AS bundle
    FROM app_mentions AS m ${publicJoin} WHERE m.app_key=? GROUP BY m.app_key
  `);
  const getAppCategories = db.prepare(`
    SELECT MIN(m.category) AS name, COUNT(DISTINCT m.share_id) AS count
    FROM app_mentions AS m ${publicJoin} WHERE m.app_key=? GROUP BY m.category_key ORDER BY count DESC, m.category_key
  `);
  const getReasons = db.prepare(`
    SELECT s.id, s.name AS author, s.title, s.created, MIN(m.note) AS note
    FROM app_mentions AS m ${publicJoin} WHERE m.app_key=? AND m.note IS NOT NULL
    GROUP BY s.id ORDER BY s.created DESC, s.id DESC LIMIT 40
  `);
  const getTogether = db.prepare(`
    SELECT o.app_key AS key, MIN(o.name) AS name, COUNT(DISTINCT o.share_id) AS count, ${consensusIcon('o.app_key')} AS icon
    FROM app_mentions AS m ${publicJoin}
    JOIN app_mentions AS o ON o.share_id=m.share_id AND o.app_key<>m.app_key
    WHERE m.app_key=? GROUP BY o.app_key ORDER BY count DESC, o.app_key LIMIT 12
  `);
  const getSimilar = db.prepare(`
    SELECT s.${summary.split(',').join(', s.')}, COUNT(DISTINCT o.app_key) AS shared
    FROM app_mentions AS o JOIN shares AS s ON s.id=o.share_id AND s.visibility='public'
    WHERE o.share_id<>? AND o.app_key IN (SELECT lower(trim(json_extract(value, '$.name'))) FROM json_each(?))
    GROUP BY s.id ORDER BY shared DESC, s.created DESC LIMIT 6
  `);
  const deleteShare = db.prepare('DELETE FROM shares WHERE id=? AND owner_hash=?');
  const getImage = db.prepare('SELECT image AS data FROM shares WHERE id=?');
  const getThumb = db.prepare('SELECT thumbnail AS data FROM shares WHERE id=?');
  const getUsage = db.prepare('SELECT COUNT(*) AS count, COALESCE(SUM(length(image)+length(thumbnail)),0) AS bytes FROM shares');
  const report = db.prepare('INSERT INTO reports VALUES (?,?,?)');
  const reportCount = db.prepare('SELECT count(*) AS count FROM reports WHERE id=?');
  const getGallery = db.prepare(`
    SELECT ${summary} FROM shares
    WHERE visibility='public'
      AND (?='' OR instr(lower(name),lower(?))>0 OR instr(lower(title),lower(?))>0
        OR EXISTS (SELECT 1 FROM app_mentions AS m WHERE m.share_id=shares.id AND instr(m.app_key,lower(?))>0))
      AND ((?='' AND ?='') OR EXISTS (
        SELECT 1 FROM app_mentions AS m WHERE m.share_id=shares.id
          AND (?='' OR m.app_key=lower(?))
          AND (?='' OR m.category_key=lower(?))
      ))
    ORDER BY created DESC,id DESC LIMIT ? OFFSET ?
  `);
  const gallery = ({ q = '', app = '', category = '', limit = 25, offset = 0 } = {}) =>
    getGallery.all(q, q, q, q, app, category, app, app, category, category, limit, offset);
  const getSitemap = db.prepare("SELECT id FROM shares WHERE visibility='public' ORDER BY created DESC LIMIT 4000");
  const getSitemapApps = db.prepare(`SELECT DISTINCT m.app_key AS key FROM app_mentions AS m ${publicJoin} LIMIT 4000`);
  const buckets = new Map();
  let processing = 0;

  // Attaches each app's display icon: the consensus icon, or the poster's own upload when no consensus exists.
  function withIcons(rows) {
    const items = rows.map(row => JSON.parse(row.apps));
    const keys = [...new Set(items.flat().map(app => appKey(app.name)))];
    const own = [...new Set(items.flat().map(app => app.icon).filter(Boolean))];
    const consensus = new Map(keys.length ? iconsByKey.all(JSON.stringify(keys)).map(row => [row.key, row.icon]) : []);
    const usable = new Set(own.length ? usableIcons.all(JSON.stringify(own)).map(row => row.hash) : []);
    return rows.map((row, index) => ({ ...row, items: items[index].map(app => ({
      name: app.name, group: app.group, note: app.note ?? '', key: appKey(app.name),
      icon: consensus.get(appKey(app.name)) ?? (usable.has(app.icon) ? app.icon : null),
    })) }));
  }

  function limit(req, kind, maximum) {
    const time = Date.now();
    const address = (trustedProxy && req.headers['x-real-ip']) || req.socket.remoteAddress;
    const key = kind + ':' + address;
    if (buckets.size >= 4096) {
      for (const [old, value] of buckets) if (value.until <= time) buckets.delete(old);
    }
    let bucket = buckets.get(key);
    if (!bucket || bucket.until <= time) {
      if (buckets.size >= 4096 && !buckets.has(key)) throw new RequestError(429, '请稍后再试。');
      bucket = { until: time + 15 * 60_000, count: 0 };
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
      if (requested !== undefined && !hashPattern.test(String(requested))) throw new RequestError(400, '上传编号格式无效。');
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
      const icons = [];
      for (const [hash, bytes] of data.icons) {
        if (!hasIcon.get(hash)) icons.push([hash, await encodeIcon(bytes)]);
      }
      if (replay()) return;
      usage = getUsage.get();
      if (usage.count >= maxShares || usage.bytes + rendered.image.length + rendered.thumbnail.length > maxBytes) throw new RequestError(503, '画廊暂时无法接收新作品。');
      db.exec('BEGIN IMMEDIATE');
      try {
        const created = now();
        for (const [hash, webp] of icons) insertIcon.run(hash, webp, created);
        insert.run(id, ownerHash, digest, data.name, data.title, data.visibility, data.apps,
          rendered.width, rendered.height, rendered.image, rendered.thumbnail, created);
        if (data.visibility === 'public') insertMentions.run(id, data.apps);
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return json(res, 201, result());
    } finally { processing--; }
  }

  async function route(req, res) {
    const url = new URL(req.url, 'http://local.invalid');
    const pathname = url.pathname;
    const method = req.method;
    const read = method === 'GET' || method === 'HEAD';
    const page = (body) => html(res, 200, method === 'HEAD' ? '' : body);
    if (read && pathname === '/healthz') return json(res, 200, { ok: db.prepare('SELECT 1 AS ok').get().ok === 1 });
    const search = (key, max) => Array.from((url.searchParams.get(key) ?? '').normalize('NFC').trim()).slice(0, max).join('');
    const pageNumber = (max) => Math.min(max, Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1));
    const context = { origin, umamiId };
    if (read && pathname === '/') {
      if (['q', 'app', 'category', 'page'].some(key => url.searchParams.has(key))) {
        return send(res, 301, 'text/plain; charset=utf-8', '', { location: '/posters' + url.search });
      }
      const rising = apps({ sort: 'rising', limit: 12 }).filter(app => app.recent > 0);
      const popular = rising.length >= 6 ? rising : apps({ limit: 12 });
      return page(home({ ...context, stats: getStats.get(), popular, rising: rising.length >= 6,
        latest: withIcons(gallery({ limit: 7 })), categories: getCategories.all('').slice(0, 12) }));
    }
    if (read && pathname === '/posters') {
      const q = search('q', 60);
      const app = search('app', 60);
      const category = search('category', 14);
      const number = pageNumber(167);
      const shares = withIcons(gallery({ q, app, category, offset: (number - 1) * 24 }));
      return page(galleryPage({ ...context, shares, q, app, category, page: number, stats: getStats.get() }));
    }
    if (read && pathname === '/apps') {
      const q = search('q', 60);
      const category = search('category', 14);
      const sort = ['top', 'rising', 'new'].includes(url.searchParams.get('sort')) ? url.searchParams.get('sort') : 'top';
      const number = pageNumber(8000);
      const items = apps({ q, category, sort, limit: 25, offset: (number - 1) * 24 });
      return page(appsPage({ ...context, apps: items.slice(0, 24), categories: getCategories.all(category), q, category, sort,
        page: number, hasNext: items.length > 24 && number < 8000, stats: getStats.get() }));
    }
    const appRoute = pathname.match(/^\/apps\/([^/]+)$/);
    if (read && appRoute) {
      let key;
      try { key = appKey(decodeURIComponent(appRoute[1])); } catch { throw new RequestError(404, '没有找到这个软件。'); }
      const app = Array.from(key).length <= 60 ? getApp.get(key) : undefined;
      if (!app) throw new RequestError(404, '还没有公开海报推荐这个软件。');
      return page(appPage({ ...context, app, categories: getAppCategories.all(key), reasons: getReasons.all(key),
        together: getTogether.all(key), posters: withIcons(gallery({ app: key, limit: 12 })) }));
    }
    if (read && pathname === '/make') return page(makePage({ ...context, stats: getStats.get() }));
    if (read && pathname === '/privacy') return page(terms(context));
    if (read && pathname === '/robots.txt') return send(res, 200, 'text/plain; charset=utf-8', 'User-agent: *\nDisallow: /api/\nSitemap: ' + origin + '/sitemap.xml\n');
    if (read && pathname === '/sitemap.xml') {
      const links = ['/', '/posters', '/apps', '/make', '/privacy',
        ...getSitemapApps.all().map(row => '/apps/' + encodeURIComponent(row.key)),
        ...getSitemap.all().map(row => '/s/' + row.id)];
      const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return send(res, 200, 'application/xml; charset=utf-8', '<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        links.map(link => '<url><loc>' + escape(origin + link) + '</loc></url>').join('') + '</urlset>');
    }
    if (read && media.has(pathname)) {
      try {
        const data = readFileSync(join(directory, pathname.slice(1)));
        return send(res, 200, media.get(pathname), method === 'HEAD' ? '' : data, { 'cache-control': 'public, max-age=3600', 'content-length': data.length });
      } catch { throw new RequestError(404, '找不到这个文件。'); }
    }
    if (method === 'POST' && pathname === '/api/v1/shares') return create(req, res);
    if (method === 'POST' && pathname === '/api/v1/icons/lookup') {
      limit(req, 'lookup', 60);
      const hashes = (await readJson(req, 8000))?.hashes;
      if (!Array.isArray(hashes) || hashes.length > 48 || !hashes.every(hash => typeof hash === 'string' && hashPattern.test(hash))) {
        throw new RequestError(400, '请提供最多 48 个图标编号。');
      }
      const known = new Set(hashes.length ? knownIcons.all(JSON.stringify(hashes)).map(row => row.hash) : []);
      return json(res, 200, { missing: [...new Set(hashes)].filter(hash => !known.has(hash)) });
    }
    const iconRoute = pathname.match(/^\/icons\/([a-f0-9]{64})[.]webp$/);
    if (read && iconRoute) {
      const data = getIcon.get(iconRoute[1])?.data;
      if (data) return send(res, 200, 'image/webp', method === 'HEAD' ? '' : data,
        { 'content-length': data.byteLength, 'cache-control': 'public, max-age=31536000, immutable' });
    }
    const showcase = pathname.match(new RegExp('^/s/(' + idPattern + ')$'));
    if (read && showcase) {
      const row = getShare.get(showcase[1]);
      if (row) {
        const [share] = withIcons([row]);
        const similar = row.visibility === 'public' ? withIcons(getSimilar.all(row.id, row.apps)) : [];
        return page(sharePage({ ...context, row: share, similar }));
      }
    }
    const asset = pathname.match(new RegExp('^/media/(' + idPattern + ')(/thumb)?[.]webp$'));
    if (read && asset) {
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
      if (status === 500) console.error('Software request failed', error.name, error.message);
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
