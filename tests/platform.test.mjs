import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import test from 'node:test';
import sharp from 'sharp';
import { createSoftwareServer } from '../server.mjs';

const day = 86_400_000;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const icon = (color, size = 128) => sharp({ create: { width: size, height: size, channels: 4, background: color } }).png().toBuffer();

async function start(t, options = {}) {
  const server = createSoftwareServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  const picture = (await sharp({ create: { width: 320, height: 180, channels: 3, background: '#20242c' } }).png().toBuffer()).toString('base64');
  const post = (body, path = '/api/v1/shares') => fetch(base + path, { method: 'POST',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const share = (title, apps, extra = {}) => post({ name: 'QA', title, visibility: 'public', apps, image: picture, ...extra });
  const page = path => fetch(base + path, { redirect: 'manual' });
  return { base, post, share, page, html: path => page(path).then(r => r.text()) };
}

test('icons are content-addressed, verified, deduplicated and shown by consensus', async t => {
  const { post, share, page, html } = await start(t);
  const blue = await icon('#2f6fff');
  const red = await icon('#ff3b30');
  const [blueHash, redHash] = [sha(blue), sha(red)];

  const lookup = await post({ hashes: [blueHash, redHash, blueHash] }, '/api/v1/icons/lookup');
  assert.equal(lookup.status, 200);
  assert.deepEqual(await lookup.json(), { missing: [blueHash, redHash] });
  assert.equal((await post({ hashes: ['nothex'] }, '/api/v1/icons/lookup')).status, 400);
  assert.equal((await post({ hashes: Array(49).fill(blueHash) }, '/api/v1/icons/lookup')).status, 400);

  const app = (hash, note) => ({ name: 'Raycast', group: '效率', id: 'com.raycast.macos', icon: hash, ...(note ? { note } : {}) });
  assert.equal((await share('错配', [app(blueHash)], { icons: { [blueHash]: red.toString('base64') } })).status, 400);
  assert.equal((await share('未引用', [app(blueHash)], { icons: { [redHash]: red.toString('base64') } })).status, 400);
  const jpeg = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#000' } }).jpeg().toBuffer();
  assert.equal((await share('非 PNG', [app(sha(jpeg))], { icons: { [sha(jpeg)]: jpeg.toString('base64') } })).status, 415);
  const wide = await sharp({ create: { width: 128, height: 64, channels: 4, background: '#000' } }).png().toBuffer();
  assert.equal((await share('非方形', [app(sha(wide))], { icons: { [sha(wide)]: wide.toString('base64') } })).status, 422);
  assert.equal((await share('坏 ID', [{ ...app(blueHash), id: 'bad id' }])).status, 400);
  assert.equal((await share('长理由', [app(blueHash, '字'.repeat(61))])).status, 400);

  const first = await share('红色版本', [app(redHash, '一个快捷键打开一切')], { icons: { [redHash]: red.toString('base64') } });
  assert.equal(first.status, 201);
  const served = await page('/icons/' + redHash + '.webp');
  assert.equal(served.headers.get('content-type'), 'image/webp');
  assert.match(served.headers.get('cache-control'), /immutable/);
  const meta = await sharp(Buffer.from(await served.arrayBuffer())).metadata();
  assert.deepEqual([meta.format, meta.width, meta.height], ['webp', 128, 128]);
  assert.deepEqual(await (await post({ hashes: [blueHash, redHash] }, '/api/v1/icons/lookup')).json(), { missing: [blueHash] });
  assert.match(await html('/apps/raycast'), new RegExp('/icons/' + redHash));

  const big = await icon('#2f6fff', 256);
  assert.equal((await share('蓝色版本', [app(blueHash)], { icons: { [blueHash]: blue.toString('base64') } })).status, 201);
  assert.equal((await share('蓝色版本二', [app(blueHash)])).status, 201, 'a known icon can be referenced without re-uploading');
  assert.equal((await share('大图标', [{ ...app(sha(big)), name: 'Other' }], { icons: { [sha(big)]: big.toString('base64') } })).status, 201);
  const detail = await html('/apps/raycast');
  assert.match(detail, new RegExp('<img class="app-icon app-icon-xl" src="/icons/' + blueHash));
  assert.match(detail, /一个快捷键打开一切/);
  assert.match(detail, /com\.raycast\.macos/);
  assert.match(await html('/apps'), new RegExp('/icons/' + blueHash));

  const firstShare = await first.json();
  const own = await html('/s/' + firstShare.id);
  assert.match(own, new RegExp('/icons/' + blueHash), 'poster pages show the consensus icon too');
  assert.match(own, /href="\/apps\/raycast"/);
  assert.match(own, /一个快捷键打开一切/);
  assert.equal((await page('/icons/' + '0'.repeat(64) + '.webp')).status, 404);
});

test('home, ranked list, app pages, similar posters and legacy redirects', async t => {
  let clock = Date.now() - 90 * day;
  const { share, page, html } = await start(t, { now: () => clock });
  const apps = names => names.map(name => ({ name, group: name === 'Cursor' ? '开发' : '效率' }));
  for (let i = 0; i < 3; i++) assert.equal((await share('老海报' + i, apps(['Obsidian', 'Raycast']))).status, 201);
  clock = Date.now() - day;
  assert.equal((await share('新海报一', apps(['Cursor', 'Raycast']))).status, 201);
  const latest = await (await share('新海报二', apps(['Cursor']))).json();
  const hidden = await (await share('私密', apps(['Secret App']), { visibility: 'link' })).json();

  const redirect = await page('/?app=Raycast&category=' + encodeURIComponent('效率'));
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), '/posters?app=Raycast&category=' + encodeURIComponent('效率'));

  const order = body => [...body.matchAll(/<h3><a href="\/apps\/([^"]+)">/g)].map(match => decodeURIComponent(match[1]));
  assert.deepEqual(order(await html('/apps')), ['raycast', 'obsidian', 'cursor']);
  assert.deepEqual(order(await html('/apps?sort=rising')).slice(0, 2), ['cursor', 'raycast']);
  assert.equal(order(await html('/apps?sort=new'))[0], 'cursor');
  assert.deepEqual(order(await html('/apps?category=' + encodeURIComponent('开发'))), ['cursor']);
  assert.doesNotMatch(await html('/apps'), /Secret App/);

  const home = await html('/');
  assert.match(home, new RegExp('/s/' + latest.id));
  assert.match(home, /href="\/apps\/raycast"/);

  const detail = await html('/apps/Raycast');
  assert.match(detail, /被 <span class="num">4<\/span> 张公开海报推荐/);
  assert.match(detail, /常一起被推荐/);
  assert.match(detail, /href="\/apps\/obsidian"/);
  assert.equal((await page('/apps/secret%20app')).status, 404);
  assert.equal((await page('/apps/%E0%A4%A')).status, 404);

  const similar = await html('/s/' + latest.id);
  assert.match(similar, /口味相近的海报/);
  assert.match(similar, /新海报一/);
  assert.doesNotMatch(await html('/s/' + hidden.id), /口味相近的海报/);

  const sitemap = await html('/sitemap.xml');
  assert.match(sitemap, /\/apps\/raycast</);
  assert.doesNotMatch(sitemap, /secret/);
  for (const path of ['/posters', '/make', '/privacy']) assert.equal((await page(path)).status, 200, path);
});
