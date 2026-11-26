import { createServer } from 'node:http';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  BUILTIN_BUNDLE_TO_CANONICAL,
  ROLES,
  normalizeAppKey,
  seedMetadataAndAliases,
  startMetadataSync,
} from './metadata.mjs';
import { createOgCache, renderAppBadge, renderAppOg } from './og.mjs';
import {
  appPage,
  appsPage,
  errorPage,
  galleryPage,
  home,
  makePage,
  sharePage,
  studioPage,
  tastePage,
  terms,
} from './views.mjs';

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
  ['/studio.js', 'text/javascript; charset=utf-8'],
  ['/mark.svg', 'image/svg+xml'],
  ['/demo.webp', 'image/webp'],
  ['/qiaomu-reward.png', 'image/png'],
  ['/qiaomu-follow.jpg', 'image/jpeg'],
]);
const policy = "default-src 'none'; style-src 'self'; img-src 'self' blob: data:; script-src 'self' https://umami.qiaomu.ai; connect-src 'self' https://umami.qiaomu.ai; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
const sha = (data) => createHash('sha256').update(data).digest('hex');
const appKey = normalizeAppKey;
const xmlEsc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]));

class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function send(res, status, type, body, extra = {}) {
  res.writeHead(status, {
    'content-type': type,
    'x-content-type-options': 'nosniff',
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    'content-security-policy': policy,
    ...extra,
  });
  res.end(body);
}
const html = (res, status, body) => send(res, status, 'text/html; charset=utf-8', body);
const json = (res, status, body, extra = {}) => send(res, status, 'application/json; charset=utf-8', JSON.stringify(body), extra);
const publicJson = (res, status, body) => json(res, status, body, {
  'access-control-allow-origin': '*',
  'cache-control': 'public, max-age=60',
});

function clean(value, maximum, label) {
  if (typeof value !== 'string') throw new RequestError(400, label + '无效。');
  const normalized = value.normalize('NFC').trim();
  if (!normalized || Array.from(normalized).length > maximum || /[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(normalized)) {
    throw new RequestError(400, label + '长度或字符无效。');
  }
  return normalized;
}

function cleanOptional(value, maximum, label) {
  if (value === undefined || value === null || value === '') return '';
  return clean(value, maximum, label);
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
  if (app?.icon !== undefined && app.icon !== null && app.icon !== '') {
    if (typeof app.icon !== 'string' || !hashPattern.test(app.icon)) throw new RequestError(400, '图标编号无效。');
    entry.icon = app.icon;
  }
  if (app?.id !== undefined && app.id !== null && app.id !== '') {
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

function sharePayload(input, { imageOptional = false } = {}) {
  const name = clean(input?.name, 40, '分享名');
  const title = clean(input?.title, 34, '标题');
  const role = cleanOptional(input?.role, 16, '角色标签');
  const visibility = input?.visibility;
  if (!['link', 'public'].includes(visibility)) throw new RequestError(400, '请选择分享范围。');
  if (!Array.isArray(input?.apps) || input.apps.length < 1 || input.apps.length > 48) throw new RequestError(400, '请选择 1–48 款软件。');
  const apps = input.apps.map(appEntry);
  const icons = iconPayload(input.icons, apps);
  let picture = null;
  if (input.image !== undefined && input.image !== null && input.image !== '') {
    if (typeof input.image !== 'string' || input.image.length > Math.ceil(maxImage / 3) * 4 || input.image.length % 4 !== 0 ||
        !base64Pattern.test(input.image)) throw new RequestError(400, '图片编码无效。');
    picture = Buffer.from(input.image, 'base64');
    if (picture.length > maxImage) throw new RequestError(413, '图片超过 8 MiB。');
    if (!picture.subarray(0, 8).equals(pngMagic)) throw new RequestError(415, '请上传 PNG 海报。');
  } else if (!imageOptional) {
    throw new RequestError(400, '图片编码无效。');
  }
  return { name, title, role, visibility, appsList: apps, apps: JSON.stringify(apps), picture, icons };
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

const consensusIcon = (key) => `(
  SELECT ci.icon FROM app_mentions AS ci
  JOIN shares AS cs ON cs.id=ci.share_id AND cs.visibility='public'
  JOIN icons AS cn ON cn.hash=ci.icon AND cn.blocked=0
  WHERE ci.app_key=${key}
  GROUP BY ci.icon ORDER BY COUNT(DISTINCT ci.share_id) DESC, MAX(cs.created) DESC LIMIT 1
)`;
const latestNote = (key) => `(
  SELECT ln.note FROM app_mentions AS ln
  JOIN shares AS ls ON ls.id=ln.share_id AND ls.visibility='public'
  LEFT JOIN (SELECT share_id, app_key, COUNT(*) AS vc FROM reason_votes GROUP BY share_id, app_key) AS lv
    ON lv.share_id=ln.share_id AND lv.app_key=ln.app_key
  WHERE ln.app_key=${key} AND ln.note IS NOT NULL
  ORDER BY COALESCE(lv.vc, 0) DESC, ls.created DESC LIMIT 1
)`;
const categoriesOf = (key) => `(
  SELECT json_group_array(category) FROM (
    SELECT MIN(cm.category) AS category
    FROM app_mentions AS cm JOIN shares AS cs ON cm.share_id=cs.id AND cs.visibility='public'
    WHERE cm.app_key=${key} GROUP BY cm.category_key ORDER BY COUNT(DISTINCT cm.share_id) DESC, cm.category_key
  )
)`;

export function createSoftwareServer({
  path = ':memory:',
  origin = 'http://localhost:3268',
  umamiId = '',
  trustedProxy = false,
  maxShares = 4000,
  maxBytes = 1_500_000_000,
  enableMetadataSync = false,
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
    CREATE TABLE IF NOT EXISTS app_aliases (
      alias_key TEXT PRIMARY KEY,
      canonical_key TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS app_metadata (
      app_key TEXT PRIMARY KEY,
      homepage TEXT NOT NULL DEFAULT '',
      cask TEXT NOT NULL DEFAULT '',
      mas_url TEXT NOT NULL DEFAULT '',
      pricing TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'builtin',
      updated INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS reason_votes (
      share_id TEXT NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
      app_key TEXT NOT NULL,
      voter_hash TEXT NOT NULL,
      created INTEGER NOT NULL,
      PRIMARY KEY(share_id, app_key, voter_hash)
    );
  `);

  const shareColumns = new Set(db.prepare('PRAGMA table_info(shares)').all().map(column => column.name));
  if (!shareColumns.has('role')) {
    db.exec("ALTER TABLE shares ADD COLUMN role TEXT NOT NULL DEFAULT ''");
  }
  const mentionCols = new Set(db.prepare('PRAGMA table_info(app_mentions)').all().map(column => column.name));
  for (const column of ['note', 'icon', 'bundle']) {
    if (!mentionCols.has(column)) db.exec(`ALTER TABLE app_mentions ADD COLUMN ${column} TEXT`);
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS mentions_by_app ON app_mentions(app_key, category_key, share_id);
    CREATE INDEX IF NOT EXISTS mentions_by_category ON app_mentions(category_key, app_key, share_id);
    CREATE INDEX IF NOT EXISTS mentions_by_icon ON app_mentions(app_key, icon);
    CREATE INDEX IF NOT EXISTS mentions_by_bundle ON app_mentions(bundle, app_key);
    CREATE INDEX IF NOT EXISTS shares_by_role ON shares(visibility, role, created DESC);
    CREATE INDEX IF NOT EXISTS shares_by_author ON shares(visibility, lower(name), created DESC);
    CREATE INDEX IF NOT EXISTS reason_votes_by_target ON reason_votes(app_key, share_id);
  `);

  seedMetadataAndAliases(db, now);

  const getAlias = db.prepare('SELECT canonical_key, display_name FROM app_aliases WHERE alias_key=?');
  const findCanonicalByBundle = db.prepare(`
    SELECT m.app_key AS key, MIN(m.name) AS name
    FROM app_mentions AS m
    JOIN shares AS s ON s.id=m.share_id AND s.visibility='public'
    WHERE m.bundle=?
    GROUP BY m.app_key
    ORDER BY COUNT(DISTINCT m.share_id) DESC, MIN(s.created) ASC
    LIMIT 1
  `);
  const insertOneMention = db.prepare(`
    INSERT OR IGNORE INTO app_mentions (share_id, app_key, name, category_key, category, note, icon, bundle)
    VALUES (?,?,?,?,?,?,?,?)
  `);
  const deleteShareMentions = db.prepare('DELETE FROM app_mentions WHERE share_id=?');

  function resolveCanonical(name, bundle = null) {
    const rawKey = appKey(name);
    const alias = getAlias.get(rawKey);
    if (alias) {
      return { key: alias.canonical_key, name: alias.display_name || name };
    }
    if (bundle && !bundle.startsWith('cli:')) {
      const builtinBundle = BUILTIN_BUNDLE_TO_CANONICAL.get(bundle);
      if (builtinBundle) return { key: builtinBundle.key, name: builtinBundle.name };
      const existing = findCanonicalByBundle.get(bundle);
      if (existing) return { key: existing.key, name: existing.name };
    }
    return { key: rawKey, name };
  }

  function resolveCanonicalKey(nameOrKey, bundle = null) {
    return resolveCanonical(nameOrKey, bundle).key;
  }

  function indexShareMentions(shareId, appsList) {
    for (const app of appsList) {
      const resolved = resolveCanonical(app.name, app.id ?? null);
      const catKey = appKey(app.group);
      insertOneMention.run(
        shareId,
        resolved.key,
        resolved.name,
        catKey,
        app.group,
        app.note ?? null,
        app.icon ?? null,
        app.id ?? null
      );
    }
  }

  // Startup backfill and alias reconciliation for public posters
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`
      DELETE FROM app_mentions WHERE NOT EXISTS (
        SELECT 1 FROM shares WHERE id=app_mentions.share_id AND visibility='public'
      );
    `);
    const publicShares = db.prepare("SELECT id, apps FROM shares WHERE visibility='public'").all();
    const hasMentions = db.prepare('SELECT 1 AS ok FROM app_mentions WHERE share_id=? LIMIT 1');
    const hasAliasMention = db.prepare(`
      SELECT 1 AS ok FROM app_mentions AS m
      JOIN app_aliases AS a ON a.alias_key=m.app_key
      WHERE m.share_id=? AND a.canonical_key<>m.app_key LIMIT 1
    `);
    for (const row of publicShares) {
      if (!hasMentions.get(row.id) || hasAliasMention.get(row.id)) {
        deleteShareMentions.run(row.id);
        let parsed = [];
        try { parsed = JSON.parse(row.apps); } catch {}
        indexShareMentions(row.id, parsed);
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const stopSync = enableMetadataSync ? startMetadataSync(db, { now }) : () => {};

  const summary = 'id,name,title,role,visibility,apps,width,height,created';
  const publicJoin = "JOIN shares AS s ON m.share_id=s.id AND s.visibility='public'";
  const getShare = db.prepare('SELECT ' + summary + ' FROM shares WHERE id=?');
  const getOwner = db.prepare('SELECT owner_hash,digest,visibility,width,height FROM shares WHERE id=?');
  const insert = db.prepare(`
    INSERT INTO shares (id, owner_hash, digest, name, title, visibility, apps, width, height, image, thumbnail, created, role)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const updateShareWithImage = db.prepare(`
    UPDATE shares SET digest=?, name=?, title=?, role=?, visibility=?, apps=?, width=?, height=?, image=?, thumbnail=?
    WHERE id=? AND owner_hash=?
  `);
  const updateShareMetaOnly = db.prepare(`
    UPDATE shares SET digest=?, name=?, title=?, role=?, visibility=?, apps=?
    WHERE id=? AND owner_hash=?
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
  const metaByKey = db.prepare(`
    SELECT app_key AS key, homepage, cask, mas_url, pricing, summary
    FROM app_metadata WHERE app_key IN (SELECT value FROM json_each(?))
  `);
  const getMeta = db.prepare('SELECT homepage, cask, mas_url, pricing, summary FROM app_metadata WHERE app_key=?');

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
  const getRoles = db.prepare(`
    SELECT role AS name, COUNT(*) AS count
    FROM shares WHERE visibility='public' AND role <> ''
    GROUP BY role ORDER BY count DESC, role LIMIT 20
  `);

  const getApps = db.prepare(`
    WITH matches AS (
      SELECT m.app_key, MIN(m.name) AS name, COUNT(DISTINCT m.share_id) AS count,
        COUNT(DISTINCT CASE WHEN s.created >= ? THEN m.share_id END) AS recent,
        COUNT(DISTINCT CASE WHEN m.note IS NOT NULL THEN m.share_id END) AS note_count,
        COALESCE((SELECT COUNT(*) FROM reason_votes AS rv WHERE rv.app_key=m.app_key), 0) AS votes,
        MIN(s.created) AS first, MAX(s.created) AS last
      FROM app_mentions AS m ${publicJoin}
      WHERE (?='' OR instr(m.app_key, lower(?))>0 OR instr(lower(m.name), lower(?))>0) AND (?='' OR m.category_key=lower(?))
      GROUP BY m.app_key
    ), ranked AS (
      SELECT *,
        CASE ?
          WHEN 'rising' THEN recent
          WHEN 'new' THEN first
          WHEN 'gems' THEN
            (CASE WHEN note_count > 0 THEN 1000000 ELSE 0 END)
            + (CASE WHEN count BETWEEN 2 AND 8 THEN 200000 WHEN count = 1 THEN 100000 ELSE 0 END)
            + (votes * 5000) + (note_count * 2000) - (count * 50)
          ELSE count
        END AS score
      FROM matches ORDER BY score DESC, count DESC, last DESC, app_key LIMIT ? OFFSET ?
    )
    SELECT ranked.app_key AS key, ranked.name, ranked.count, ranked.recent, ranked.note_count, ranked.votes, ranked.first, ranked.last,
      ${categoriesOf('ranked.app_key')} AS categories,
      ${consensusIcon('ranked.app_key')} AS icon,
      ${latestNote('ranked.app_key')} AS note,
      COALESCE(md.cask, '') AS cask,
      COALESCE(md.homepage, '') AS homepage,
      COALESCE(md.pricing, '') AS pricing
    FROM ranked
    LEFT JOIN app_metadata AS md ON md.app_key=ranked.app_key
    ORDER BY score DESC, count DESC, last DESC, ranked.app_key
  `);
  const apps = ({ q = '', category = '', sort = 'top', limit = 24, offset = 0 } = {}) =>
    getApps.all(now() - 30 * day, q, q, q, category, category, sort, limit, offset)
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
    SELECT s.id, s.name AS author, s.title, s.role, s.created, MIN(m.note) AS note,
      (SELECT COUNT(*) FROM reason_votes AS rv WHERE rv.share_id=s.id AND rv.app_key=m.app_key) AS votes
    FROM app_mentions AS m ${publicJoin} WHERE m.app_key=? AND m.note IS NOT NULL
    GROUP BY s.id ORDER BY votes DESC, s.created DESC, s.id DESC LIMIT 40
  `);
  const getFeaturedReasons = db.prepare(`
    SELECT s.id, s.name AS author, s.title, s.role, s.created,
      m.app_key AS app_key, MIN(m.name) AS app_name, MIN(m.note) AS note,
      ${consensusIcon('m.app_key')} AS icon,
      (SELECT COUNT(*) FROM reason_votes AS rv WHERE rv.share_id=s.id AND rv.app_key=m.app_key) AS votes
    FROM app_mentions AS m ${publicJoin}
    WHERE m.note IS NOT NULL AND length(m.note) >= 4
    GROUP BY m.app_key, s.id
    ORDER BY votes DESC, s.created DESC, s.id DESC
    LIMIT 24
  `);
  const getTogether = db.prepare(`
    SELECT o.app_key AS key, MIN(o.name) AS name, COUNT(DISTINCT o.share_id) AS count, ${consensusIcon('o.app_key')} AS icon
    FROM app_mentions AS m ${publicJoin}
    JOIN app_mentions AS o ON o.share_id=m.share_id AND o.app_key<>m.app_key
    WHERE m.app_key=? GROUP BY o.app_key ORDER BY count DESC, o.app_key LIMIT 12
  `);
  const getAlternatives = db.prepare(`
    SELECT o.app_key AS key, MIN(o.name) AS name, COUNT(DISTINCT o.share_id) AS count,
      ${consensusIcon('o.app_key')} AS icon, ${latestNote('o.app_key')} AS note,
      COALESCE(md.pricing, '') AS pricing
    FROM app_mentions AS o
    JOIN shares AS s ON o.share_id=s.id AND s.visibility='public'
    LEFT JOIN app_metadata AS md ON md.app_key=o.app_key
    WHERE o.app_key <> ?
      AND o.category_key IN (
        SELECT category_key FROM app_mentions AS m2
        JOIN shares AS s2 ON m2.share_id=s2.id AND s2.visibility='public'
        WHERE m2.app_key = ?
        GROUP BY m2.category_key ORDER BY COUNT(DISTINCT m2.share_id) DESC LIMIT 2
      )
    GROUP BY o.app_key
    ORDER BY count DESC, o.app_key
    LIMIT 8
  `);
  const getSimilar = db.prepare(`
    SELECT s.${summary.split(',').join(', s.')}, COUNT(DISTINCT o.app_key) AS shared
    FROM app_mentions AS o JOIN shares AS s ON s.id=o.share_id AND s.visibility='public'
    WHERE o.share_id<>? AND o.app_key IN (SELECT value FROM json_each(?))
    GROUP BY s.id ORDER BY shared DESC, s.created DESC LIMIT 6
  `);
  const getSimilarForKeys = db.prepare(`
    SELECT s.${summary.split(',').join(', s.')}, COUNT(DISTINCT o.app_key) AS shared,
      json_group_array(DISTINCT o.name) AS matched_names
    FROM app_mentions AS o JOIN shares AS s ON s.id=o.share_id AND s.visibility='public'
    WHERE o.app_key IN (SELECT value FROM json_each(?))
    GROUP BY s.id ORDER BY shared DESC, s.created DESC LIMIT 6
  `);
  const deleteShare = db.prepare('DELETE FROM shares WHERE id=? AND owner_hash=?');
  const getImage = db.prepare('SELECT image AS data FROM shares WHERE id=?');
  const getThumb = db.prepare('SELECT thumbnail AS data FROM shares WHERE id=?');
  const getUsage = db.prepare('SELECT COUNT(*) AS count, COALESCE(SUM(length(image)+length(thumbnail)),0) AS bytes FROM shares');
  const report = db.prepare('INSERT INTO reports VALUES (?,?,?)');
  const reportCount = db.prepare('SELECT count(*) AS count FROM reports WHERE id=?');
  const hasReason = db.prepare(`
    SELECT 1 AS ok FROM app_mentions AS m ${publicJoin}
    WHERE m.share_id=? AND m.app_key=? AND m.note IS NOT NULL LIMIT 1
  `);
  const hasVote = db.prepare('SELECT 1 AS ok FROM reason_votes WHERE share_id=? AND app_key=? AND voter_hash=?');
  const insertVote = db.prepare('INSERT OR IGNORE INTO reason_votes (share_id, app_key, voter_hash, created) VALUES (?,?,?,?)');
  const deleteVote = db.prepare('DELETE FROM reason_votes WHERE share_id=? AND app_key=? AND voter_hash=?');
  const countVotes = db.prepare('SELECT COUNT(*) AS count FROM reason_votes WHERE share_id=? AND app_key=?');

  const getGallery = db.prepare(`
    SELECT ${summary} FROM shares
    WHERE visibility='public'
      AND (?='' OR instr(lower(name),lower(?))>0 OR instr(lower(title),lower(?))>0 OR instr(lower(role),lower(?))>0
        OR EXISTS (SELECT 1 FROM app_mentions AS m WHERE m.share_id=shares.id AND (instr(m.app_key,lower(?))>0 OR instr(lower(m.name),lower(?))>0)))
      AND ((?='' AND ?='') OR EXISTS (
        SELECT 1 FROM app_mentions AS m WHERE m.share_id=shares.id
          AND (?='' OR m.app_key=lower(?))
          AND (?='' OR m.category_key=lower(?))
      ))
      AND (?='' OR role=?)
      AND (?='' OR lower(name)=lower(?))
    ORDER BY created DESC,id DESC LIMIT ? OFFSET ?
  `);
  const gallery = ({ q = '', app = '', category = '', role = '', author = '', limit = 25, offset = 0 } = {}) => {
    const resolvedApp = app ? resolveCanonicalKey(app) : '';
    return getGallery.all(q, q, q, q, q, q, resolvedApp, category, resolvedApp, resolvedApp, category, category, role, role, author, author, limit, offset);
  };

  const suggestApps = db.prepare(`
    SELECT m.app_key AS key, MIN(m.name) AS name, COUNT(DISTINCT m.share_id) AS count,
      ${consensusIcon('m.app_key')} AS icon,
      (SELECT MIN(cm.category) FROM app_mentions AS cm JOIN shares AS cs ON cm.share_id=cs.id AND cs.visibility='public'
        WHERE cm.app_key=m.app_key GROUP BY cm.category_key ORDER BY COUNT(DISTINCT cm.share_id) DESC LIMIT 1) AS category,
      COALESCE(md.cask, '') AS cask
    FROM app_mentions AS m ${publicJoin}
    LEFT JOIN app_metadata AS md ON md.app_key=m.app_key
    WHERE ?='' OR instr(m.app_key, lower(?))>0 OR instr(lower(m.name), lower(?))>0
      OR EXISTS (SELECT 1 FROM app_aliases AS a WHERE a.canonical_key=m.app_key AND instr(a.alias_key, lower(?))>0)
    GROUP BY m.app_key
    ORDER BY (m.app_key=lower(?)) DESC, (instr(m.app_key, lower(?))=1) DESC, count DESC, m.app_key
    LIMIT ?
  `);
  const suggestCategories = db.prepare(`
    SELECT MIN(m.category) AS name, COUNT(DISTINCT m.app_key) AS count
    FROM app_mentions AS m ${publicJoin}
    WHERE instr(m.category_key, lower(?))>0
    GROUP BY m.category_key ORDER BY count DESC LIMIT 4
  `);
  const randomAppWithNote = db.prepare(`
    SELECT m.app_key AS key FROM app_mentions AS m ${publicJoin}
    WHERE m.note IS NOT NULL GROUP BY m.app_key ORDER BY RANDOM() LIMIT 1
  `);
  const randomAppAny = db.prepare(`
    SELECT m.app_key AS key FROM app_mentions AS m ${publicJoin}
    GROUP BY m.app_key ORDER BY RANDOM() LIMIT 1
  `);
  const randomPoster = db.prepare("SELECT id FROM shares WHERE visibility='public' ORDER BY RANDOM() LIMIT 1");
  const getSitemap = db.prepare("SELECT id FROM shares WHERE visibility='public' ORDER BY created DESC LIMIT 4000");
  const getSitemapApps = db.prepare(`SELECT DISTINCT m.app_key AS key FROM app_mentions AS m ${publicJoin} LIMIT 4000`);

  const buckets = new Map();
  const ogCache = createOgCache(64);
  let processing = 0;

  function withIcons(rows) {
    const items = rows.map(row => JSON.parse(row.apps));
    const resolvedItems = items.map(list => list.map(app => {
      const resolved = resolveCanonical(app.name, app.id ?? null);
      return { ...app, key: resolved.key, canonicalName: resolved.name };
    }));
    const keys = [...new Set(resolvedItems.flat().map(app => app.key))];
    const own = [...new Set(resolvedItems.flat().map(app => app.icon).filter(Boolean))];
    const consensus = new Map(keys.length ? iconsByKey.all(JSON.stringify(keys)).map(row => [row.key, row.icon]) : []);
    const metas = new Map(keys.length ? metaByKey.all(JSON.stringify(keys)).map(row => [row.key, row]) : []);
    const usable = new Set(own.length ? usableIcons.all(JSON.stringify(own)).map(row => row.hash) : []);
    return rows.map((row, index) => ({
      ...row,
      role: row.role ?? '',
      items: resolvedItems[index].map(app => {
        const meta = metas.get(app.key);
        return {
          name: app.name,
          canonicalName: app.canonicalName,
          group: app.group,
          note: app.note ?? '',
          key: app.key,
          cask: meta?.cask ?? '',
          homepage: meta?.homepage ?? '',
          pricing: meta?.pricing ?? '',
          icon: consensus.get(app.key) ?? (usable.has(app.icon) ? app.icon : null),
        };
      }),
    }));
  }

  function clientIp(req) {
    return (trustedProxy && req.headers['x-real-ip']) || req.socket.remoteAddress || 'unknown';
  }

  function limit(req, kind, maximum) {
    const time = Date.now();
    const key = kind + ':' + clientIp(req);
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
      const digest = sha(JSON.stringify([data.name, data.title, data.role, data.visibility, data.apps, sha(data.picture)]));
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
        insert.run(
          id, ownerHash, digest, data.name, data.title, data.visibility, data.apps,
          rendered.width, rendered.height, rendered.image, rendered.thumbnail, created, data.role
        );
        if (data.visibility === 'public') indexShareMentions(id, data.appsList);
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return json(res, 201, result());
    } finally { processing--; }
  }

  async function update(req, res, id) {
    limit(req, 'upload', 15);
    const owner = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    const existing = getOwner.get(id);
    if (!owner || !existing || !timingSafeEqual(Buffer.from(existing.owner_hash), Buffer.from(sha('owner:' + owner)))) {
      throw new RequestError(404, '找不到这条分享或更新凭证无效。');
    }
    if (processing >= 3) throw new RequestError(503, '现在有多张海报正在处理，请稍后重试。');
    processing++;
    try {
      const data = sharePayload(await readJson(req, maxBody), { imageOptional: true });
      const rendered = data.picture ? await encodeImages(data.picture) : null;
      const icons = [];
      for (const [hash, bytes] of data.icons) {
        if (!hasIcon.get(hash)) icons.push([hash, await encodeIcon(bytes)]);
      }
      const digest = sha(JSON.stringify([
        data.name, data.title, data.role, data.visibility, data.apps,
        data.picture ? sha(data.picture) : existing.digest,
      ]));
      db.exec('BEGIN IMMEDIATE');
      try {
        const ts = now();
        for (const [hash, webp] of icons) insertIcon.run(hash, webp, ts);
        if (rendered) {
          updateShareWithImage.run(
            digest, data.name, data.title, data.role, data.visibility, data.apps,
            rendered.width, rendered.height, rendered.image, rendered.thumbnail, id, existing.owner_hash
          );
        } else {
          updateShareMetaOnly.run(
            digest, data.name, data.title, data.role, data.visibility, data.apps, id, existing.owner_hash
          );
        }
        deleteShareMentions.run(id);
        if (data.visibility === 'public') {
          indexShareMentions(id, data.appsList);
          const keepKeys = [...new Set(data.appsList.map(a => resolveCanonicalKey(a.name, a.id ?? null)))];
          db.prepare('DELETE FROM reason_votes WHERE share_id=? AND app_key NOT IN (SELECT value FROM json_each(?))')
            .run(id, JSON.stringify(keepKeys));
        } else {
          db.prepare('DELETE FROM reason_votes WHERE share_id=?').run(id);
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return json(res, 200, { id, url: origin + '/s/' + id, removeToken: owner, visibility: data.visibility, updated: true });
    } finally { processing--; }
  }

  function analyzeTaste(submittedApps) {
    const cleaned = [];
    const seen = new Set();
    for (const raw of submittedApps) {
      const name = clean(raw, 60, '软件名');
      const resolved = resolveCanonical(name);
      if (!seen.has(resolved.key)) {
        seen.add(resolved.key);
        cleaned.push({ key: resolved.key, inputName: name, name: resolved.name });
      }
    }
    if (!cleaned.length || cleaned.length > 48) throw new RequestError(400, '请选择 1–48 款软件。');
    const stats = getStats.get();
    const totalPosters = Math.max(0, stats.posters);

    const details = cleaned.map(item => {
      const app = getApp.get(item.key);
      const cats = app ? getAppCategories.all(item.key) : [];
      const count = app?.count ?? 0;
      const rate = totalPosters > 0 ? Math.round((count / totalPosters) * 100) : 0;
      return {
        key: item.key,
        name: app?.name ?? item.name,
        icon: app?.icon ?? null,
        count,
        rate,
        inCatalog: Boolean(app),
        categories: cats.map(c => c.name),
      };
    });

    const mainstream = [...details].filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);
    const niche = [...details].sort((a, b) => a.count - b.count).slice(0, 3);

    const catCounts = new Map();
    for (const d of details) {
      for (const c of d.categories.slice(0, 2)) {
        catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
      }
    }
    const topCategories = [...catCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }));

    let persona = '实用主义 Mac 玩家';
    if (topCategories.length >= 2) {
      persona = `${topCategories[0].name} × ${topCategories[1].name}派`;
    } else if (topCategories.length === 1) {
      persona = `深度「${topCategories[0].name}」派`;
    }
    const avgRate = details.length ? Math.round(details.reduce((s, d) => s + d.rate, 0) / details.length) : 0;
    const uniqueness = Math.max(0, Math.min(100, 100 - avgRate));

    const keysJson = JSON.stringify(cleaned.map(c => c.key));
    const similarRaw = getSimilarForKeys.all(keysJson);
    const similar = withIcons(similarRaw).map(row => {
      const union = new Set([...cleaned.map(c => c.key), ...row.items.map(i => i.key)]).size;
      return {
        id: row.id,
        title: row.title,
        name: row.name,
        role: row.role,
        created: row.created,
        shared: row.shared,
        totalApps: row.items.length,
        matchScore: union > 0 ? Math.round((row.shared / union) * 100) : 0,
        matchedNames: JSON.parse(row.matched_names ?? '[]').slice(0, 6),
        thumb: '/media/' + row.id + '/thumb.webp',
      };
    });

    return {
      totalPosters,
      selectedCount: details.length,
      persona,
      uniqueness,
      avgRate,
      topCategories,
      mainstream,
      niche,
      details,
      similar,
    };
  }

  function buildFeed() {
    const items = withIcons(gallery({ limit: 30 }));
    const entries = items.map(row => {
      const link = origin + '/s/' + row.id;
      const appNames = row.items.map(a => a.name).join('、');
      const noted = row.items.filter(a => a.note).slice(0, 4).map(a => `${a.name}：「${a.note}」`).join('；');
      const desc = `${row.name}${row.role ? `（${row.role}）` : ''}推荐了 ${row.items.length} 款 Mac 软件：${appNames}。${noted ? ' 精选理由：' + noted : ''}`;
      return `<item>
  <title>${xmlEsc(row.title)} — ${xmlEsc(row.name)}</title>
  <link>${xmlEsc(link)}</link>
  <guid isPermaLink="true">${xmlEsc(link)}</guid>
  <pubDate>${new Date(row.created).toUTCString()}</pubDate>
  <description>${xmlEsc(desc)}</description>
  <enclosure url="${xmlEsc(origin + '/media/' + row.id + '.webp')}" type="image/webp" length="0"/>
</item>`;
    }).join('\n');
    return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>乔木软件推荐 · 大家真正在用的 Mac 软件</title>
  <link>${xmlEsc(origin)}/</link>
  <atom:link href="${xmlEsc(origin)}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>看看大家的 Mac 里真正在用什么软件。每张海报来自一位真实用户，每款软件按被推荐的海报数排名。</description>
  <language>zh-CN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${entries}
</channel>
</rss>`;
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
      if (['q', 'app', 'category', 'page', 'role', 'author'].some(key => url.searchParams.has(key))) {
        return send(res, 301, 'text/plain; charset=utf-8', '', { location: '/posters' + url.search });
      }
      const rising = apps({ sort: 'rising', limit: 12 }).filter(app => app.recent > 0);
      const popular = rising.length >= 6 ? rising : apps({ limit: 12 });
      const seenReasonApps = new Set();
      const featuredReasons = [];
      for (const r of getFeaturedReasons.all()) {
        if (!seenReasonApps.has(r.app_key)) {
          seenReasonApps.add(r.app_key);
          featuredReasons.push(r);
          if (featuredReasons.length >= 6) break;
        }
      }
      return page(home({
        ...context,
        stats: getStats.get(),
        popular,
        rising: rising.length >= 6,
        latest: withIcons(gallery({ limit: 7 })),
        categories: getCategories.all('').slice(0, 12),
        roles: getRoles.all().slice(0, 8),
        featuredReasons,
      }));
    }

    if (read && pathname === '/posters') {
      const q = search('q', 60);
      const app = search('app', 60);
      const category = search('category', 14);
      const role = search('role', 16);
      const author = search('author', 40);
      const number = pageNumber(167);
      const shares = withIcons(gallery({ q, app, category, role, author, offset: (number - 1) * 24 }));
      return page(galleryPage({
        ...context,
        shares,
        q,
        app,
        category,
        role,
        author,
        roles: getRoles.all(),
        page: number,
        stats: getStats.get(),
      }));
    }

    if (read && pathname === '/apps') {
      const q = search('q', 60);
      const category = search('category', 14);
      const sort = ['top', 'rising', 'new', 'gems'].includes(url.searchParams.get('sort')) ? url.searchParams.get('sort') : 'top';
      const number = pageNumber(8000);
      const items = apps({ q, category, sort, limit: 25, offset: (number - 1) * 24 });
      return page(appsPage({
        ...context,
        apps: items.slice(0, 24),
        categories: getCategories.all(category),
        q,
        category,
        sort,
        page: number,
        hasNext: items.length > 24 && number < 8000,
        stats: getStats.get(),
      }));
    }

    const appRoute = pathname.match(/^\/apps\/([^/]+)$/);
    if (read && appRoute) {
      let key;
      try { key = appKey(decodeURIComponent(appRoute[1])); } catch { throw new RequestError(404, '没有找到这个软件。'); }
      if (Array.from(key).length > 60) throw new RequestError(404, '没有找到这个软件。');
      const alias = getAlias.get(key);
      if (alias && alias.canonical_key !== key) {
        const target = getApp.get(alias.canonical_key);
        if (target) {
          return send(res, 301, 'text/plain; charset=utf-8', '', { location: '/apps/' + encodeURIComponent(alias.canonical_key) });
        }
      }
      const app = getApp.get(key);
      if (!app) throw new RequestError(404, '还没有公开海报推荐这个软件。');
      const meta = getMeta.get(key) ?? { homepage: '', cask: '', mas_url: '', pricing: '', summary: '' };
      return page(appPage({
        ...context,
        app: { ...app, ...meta },
        categories: getAppCategories.all(key),
        reasons: getReasons.all(key),
        together: getTogether.all(key),
        alternatives: getAlternatives.all(key, key),
        posters: withIcons(gallery({ app: key, limit: 12 })),
      }));
    }

    const ogAppRoute = pathname.match(/^\/og\/apps\/([^/]+)\.png$/);
    if (read && ogAppRoute) {
      let key;
      try { key = appKey(decodeURIComponent(ogAppRoute[1])); } catch { throw new RequestError(404, '没有找到这个软件。'); }
      const resolvedKey = resolveCanonicalKey(key);
      const app = getApp.get(resolvedKey);
      if (!app) throw new RequestError(404, '没有找到这个软件。');
      const categories = getAppCategories.all(resolvedKey);
      const topReason = getReasons.all(resolvedKey)[0]?.note ?? '';
      const cacheKey = `${resolvedKey}:${app.count}:${app.icon ?? ''}:${topReason}`;
      let png = ogCache.get(cacheKey);
      if (!png) {
        const iconBuffer = app.icon ? getIcon.get(app.icon)?.data ?? null : null;
        png = await renderAppOg({ app, categories, reason: topReason, iconBuffer });
        ogCache.set(cacheKey, png);
      }
      return send(res, 200, 'image/png', method === 'HEAD' ? '' : png, {
        'content-length': png.byteLength,
        'cache-control': 'public, max-age=3600',
      });
    }

    const badgeRoute = pathname.match(/^\/badges\/apps\/([^/]+)\.svg$/);
    if (read && badgeRoute) {
      let key;
      try { key = appKey(decodeURIComponent(badgeRoute[1])); } catch { throw new RequestError(404, '没有找到这个软件。'); }
      const resolvedKey = resolveCanonicalKey(key);
      const app = getApp.get(resolvedKey);
      if (!app) throw new RequestError(404, '没有找到这个软件。');
      const svg = renderAppBadge({ app });
      return send(res, 200, 'image/svg+xml; charset=utf-8', method === 'HEAD' ? '' : svg, {
        'cache-control': 'public, max-age=300',
        'access-control-allow-origin': '*',
      });
    }

    if (read && pathname === '/random') {
      const kind = url.searchParams.get('type');
      if (kind === 'poster') {
        const pick = randomPoster.get();
        return send(res, 302, 'text/plain; charset=utf-8', '', { location: pick ? '/s/' + pick.id : '/posters' });
      }
      const pick = randomAppWithNote.get() ?? randomAppAny.get();
      return send(res, 302, 'text/plain; charset=utf-8', '', {
        location: pick ? '/apps/' + encodeURIComponent(pick.key) : '/apps',
      });
    }

    if (read && pathname === '/taste') {
      const topApps = apps({ sort: 'top', limit: 40 });
      return page(tastePage({ ...context, topApps, stats: getStats.get() }));
    }

    if (read && pathname === '/studio') {
      const topApps = apps({ sort: 'top', limit: 36 });
      const cats = getCategories.all('').slice(0, 12).map(c => c.name);
      return page(studioPage({ ...context, topApps, categories: cats, roles: ROLES, stats: getStats.get() }));
    }

    if (read && pathname === '/make') return page(makePage({ ...context, stats: getStats.get() }));
    if (read && pathname === '/privacy') return page(terms(context));
    if (read && pathname === '/feed.xml') {
      return send(res, 200, 'application/rss+xml; charset=utf-8', method === 'HEAD' ? '' : buildFeed(), {
        'cache-control': 'public, max-age=300',
      });
    }
    if (read && pathname === '/robots.txt') {
      return send(res, 200, 'text/plain; charset=utf-8', 'User-agent: *\nDisallow: /api/\nSitemap: ' + origin + '/sitemap.xml\n');
    }
    if (read && pathname === '/sitemap.xml') {
      const links = [
        '/', '/posters', '/apps', '/taste', '/studio', '/make', '/privacy',
        ...getSitemapApps.all().map(row => '/apps/' + encodeURIComponent(row.key)),
        ...getSitemap.all().map(row => '/s/' + row.id),
      ];
      const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return send(res, 200, 'application/xml; charset=utf-8',
        '<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        links.map(link => '<url><loc>' + escape(origin + link) + '</loc></url>').join('') + '</urlset>');
    }

    if (read && media.has(pathname)) {
      try {
        const data = readFileSync(join(directory, pathname.slice(1)));
        return send(res, 200, media.get(pathname), method === 'HEAD' ? '' : data, { 'cache-control': 'public, max-age=3600', 'content-length': data.length });
      } catch { throw new RequestError(404, '找不到这个文件。'); }
    }

    // Public read-only APIs + instant search suggest
    if (read && pathname === '/api/v1/suggest') {
      const q = search('q', 60);
      const appHits = suggestApps.all(q, q, q, q, q, q, q ? 8 : 6).map(a => ({
        key: a.key,
        name: a.name,
        count: a.count,
        icon: a.icon ? '/icons/' + a.icon + '.webp' : null,
        iconHash: a.icon ?? null,
        category: a.category ?? '',
        cask: a.cask ?? '',
      }));
      const catHits = q ? suggestCategories.all(q) : [];
      return publicJson(res, 200, { apps: appHits, categories: catHits });
    }

    if (read && pathname === '/api/v1/apps') {
      const q = search('q', 60);
      const category = search('category', 14);
      const sort = ['top', 'rising', 'new', 'gems'].includes(url.searchParams.get('sort')) ? url.searchParams.get('sort') : 'top';
      const limitCount = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '24', 10) || 24));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10) || 0);
      const items = apps({ q, category, sort, limit: limitCount, offset }).map(item => ({
        key: item.key,
        name: item.name,
        count: item.count,
        recent: item.recent,
        categories: item.categories,
        note: item.note ?? '',
        icon: item.icon ? origin + '/icons/' + item.icon + '.webp' : null,
        homepage: item.homepage || null,
        cask: item.cask || null,
        pricing: item.pricing || null,
        url: origin + '/apps/' + encodeURIComponent(item.key),
      }));
      return publicJson(res, 200, { stats: getStats.get(), sort, items });
    }

    const apiAppRoute = pathname.match(/^\/api\/v1\/apps\/([^/]+)$/);
    if (read && apiAppRoute) {
      let key;
      try { key = resolveCanonicalKey(decodeURIComponent(apiAppRoute[1])); } catch { throw new RequestError(404, '没有找到这个软件。'); }
      const app = getApp.get(key);
      if (!app) throw new RequestError(404, '没有找到这个软件。');
      const meta = getMeta.get(key) ?? { homepage: '', cask: '', mas_url: '', pricing: '', summary: '' };
      return publicJson(res, 200, {
        key: app.key,
        name: app.name,
        count: app.count,
        first: app.first,
        last: app.last,
        bundle: app.bundle ?? null,
        icon: app.icon ? origin + '/icons/' + app.icon + '.webp' : null,
        homepage: meta.homepage || null,
        cask: meta.cask || null,
        masUrl: meta.mas_url || null,
        pricing: meta.pricing || null,
        summary: meta.summary || null,
        categories: getAppCategories.all(key),
        reasons: getReasons.all(key).map(r => ({
          shareId: r.id, author: r.author, title: r.title, role: r.role ?? '', note: r.note, votes: r.votes, created: r.created,
        })),
        together: getTogether.all(key).map(t => ({ key: t.key, name: t.name, count: t.count })),
        alternatives: getAlternatives.all(key, key).map(a => ({ key: a.key, name: a.name, count: a.count })),
        url: origin + '/apps/' + encodeURIComponent(app.key),
      });
    }

    if (read && pathname === '/api/v1/posters') {
      const q = search('q', 60);
      const app = search('app', 60);
      const category = search('category', 14);
      const role = search('role', 16);
      const author = search('author', 40);
      const limitCount = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '24', 10) || 24));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10) || 0);
      const items = withIcons(gallery({ q, app, category, role, author, limit: limitCount, offset })).map(row => ({
        id: row.id,
        title: row.title,
        author: row.name,
        role: row.role || null,
        created: row.created,
        url: origin + '/s/' + row.id,
        image: origin + '/media/' + row.id + '.webp',
        thumbnail: origin + '/media/' + row.id + '/thumb.webp',
        apps: row.items.map(a => ({ name: a.name, key: a.key, group: a.group, note: a.note || null })),
      }));
      return publicJson(res, 200, { items });
    }

    if (method === 'POST' && pathname === '/api/v1/taste') {
      limit(req, 'taste', 40);
      const body = await readJson(req, 16_000);
      if (!Array.isArray(body?.apps) || body.apps.length < 1 || body.apps.length > 48) {
        throw new RequestError(400, '请至少选择 1 款软件（最多 48 款）。');
      }
      return json(res, 200, analyzeTaste(body.apps));
    }

    if (method === 'POST' && pathname === '/api/v1/reasons/vote') {
      limit(req, 'vote', 60);
      const body = await readJson(req, 1024);
      const shareId = typeof body?.shareId === 'string' && new RegExp('^' + idPattern + '$').test(body.shareId) ? body.shareId : '';
      const key = typeof body?.appKey === 'string' ? resolveCanonicalKey(body.appKey) : '';
      if (!shareId || !key || !hasReason.get(shareId, key)) {
        throw new RequestError(404, '找不到这条推荐理由。');
      }
      const voterHash = sha('vote:' + clientIp(req));
      let voted;
      if (hasVote.get(shareId, key, voterHash)) {
        deleteVote.run(shareId, key, voterHash);
        voted = false;
      } else {
        insertVote.run(shareId, key, voterHash, now());
        voted = true;
      }
      const votes = countVotes.get(shareId, key).count;
      return json(res, 200, { voted, votes });
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
        const keys = [...new Set(share.items.map(item => item.key))];
        const similar = row.visibility === 'public' ? withIcons(getSimilar.all(row.id, JSON.stringify(keys))) : [];
        return page(sharePage({ ...context, row: share, similar }));
      }
    }

    const asset = pathname.match(new RegExp('^/media/(' + idPattern + ')(/thumb)?[.]webp$'));
    if (read && asset) {
      const data = (asset[2] ? getThumb : getImage).get(asset[1])?.data;
      if (data) return send(res, 200, 'image/webp', method === 'HEAD' ? '' : data, { 'content-length': data.byteLength, 'x-robots-tag': 'noindex' });
    }

    const api = pathname.match(new RegExp('^/api/v1/shares/(' + idPattern + ')(/reports)?$'));
    if (read && api && !api[2]) {
      // Allow studio owner (with Bearer token) to fetch their share JSON for editing
      const owner = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
      const existing = getOwner.get(api[1]);
      if (!owner || !existing || !timingSafeEqual(Buffer.from(existing.owner_hash), Buffer.from(sha('owner:' + owner)))) {
        throw new RequestError(404, '找不到这条分享或凭证无效。');
      }
      const row = getShare.get(api[1]);
      const [share] = withIcons([row]);
      return json(res, 200, {
        id: share.id,
        name: share.name,
        title: share.title,
        role: share.role ?? '',
        visibility: share.visibility,
        apps: share.items.map(a => ({ name: a.name, group: a.group, note: a.note, icon: a.icon })),
      });
    }
    if (method === 'PUT' && api && !api[2]) return update(req, res, api[1]);
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
  server.on('close', () => {
    stopSync();
    db.close();
  });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT ?? 3268);
  const folder = process.env.DATA_DIR ?? './data';
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const origin = new URL(process.env.PUBLIC_ORIGIN ?? 'http://localhost:' + port).origin;
  const server = createSoftwareServer({
    path: join(folder, 'shares.sqlite'),
    origin,
    umamiId: process.env.UMAMI_SITE_ID,
    trustedProxy: process.env.TRUST_PROXY === '1',
    enableMetadataSync: process.env.DISABLE_METADATA_SYNC !== '1',
  });
  server.listen(port, '127.0.0.1', () => console.log('Qiaomu Software http://127.0.0.1:' + port));
}
