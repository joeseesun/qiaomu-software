import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import test from 'node:test';
import sharp from 'sharp';
import { createSoftwareServer } from '../server.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');

async function start(t, options = {}) {
  const server = createSoftwareServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  const picture = (await sharp({ create: { width: 640, height: 360, channels: 3, background: '#171a21' } }).png().toBuffer()).toString('base64');
  const post = (body, path = '/api/v1/shares', headers = {}) => fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const share = (title, apps, extra = {}) => post({
    name: extra.name ?? '小乔',
    title,
    visibility: extra.visibility ?? 'public',
    role: extra.role,
    apps,
    image: picture,
    ...(extra.icons ? { icons: extra.icons } : {}),
  });
  const page = path => fetch(base + path, { redirect: 'manual' });
  const html = path => page(path).then(r => r.text());
  return { base, picture, post, share, page, html };
}

test('aliases merge counts and 301 redirect, metadata shows brew/homepage/appstore', async t => {
  const { share, page, html } = await start(t);
  assert.equal((await share('前端主力', [
    { name: 'VS Code', group: '开发', note: '插件生态无可替代' },
    { name: '微信', group: '沟通' },
    { name: 'Raycast', group: '效率', note: '剪贴板加启动器一体化' },
  ], { name: 'Alice', role: '前端开发' })).status, 201);

  assert.equal((await share('全栈清单', [
    { name: 'Visual Studio Code', group: '开发', id: 'com.microsoft.VSCode' },
    { name: 'WeChat', group: '沟通' },
    { name: 'Warp', group: '开发', note: '块级终端很好用' },
    { name: 'Ghostty', group: '开发', note: '极快原生终端' },
  ], { name: 'Bob', role: '独立开发者' })).status, 201);

  // Alias 301 redirect
  const redir = await page('/apps/' + encodeURIComponent('VS Code'));
  assert.equal(redir.status, 301);
  assert.equal(redir.headers.get('location'), '/apps/' + encodeURIComponent('visual studio code'));

  const wechatRedir = await page('/apps/' + encodeURIComponent('微信'));
  assert.equal(wechatRedir.status, 301);
  assert.equal(wechatRedir.headers.get('location'), '/apps/wechat');

  // Merged vote count = 2 on canonical page
  const vscHtml = await html('/apps/' + encodeURIComponent('visual studio code'));
  assert.match(vscHtml, /被 <span class="num">2<\/span> 张公开海报推荐/);
  assert.match(vscHtml, /brew install --cask visual-studio-code/);
  assert.match(vscHtml, /https:\/\/code\.visualstudio\.com/);
  assert.match(vscHtml, /同分类其他选择/);
  assert.match(vscHtml, /Ghostty/);
  assert.match(vscHtml, /Warp/);
  assert.match(vscHtml, /\/og\/apps\/visual%20studio%20code\.png/);

  // Suggest matches alias too
  const suggest = await (await page('/api/v1/suggest?q=' + encodeURIComponent('微信'))).json();
  assert.equal(suggest.apps[0]?.key, 'wechat');
  assert.equal(suggest.apps[0]?.count, 2);

  // Role and author filtering
  const byRole = await html('/posters?role=' + encodeURIComponent('独立开发者'));
  assert.match(byRole, /全栈清单/);
  assert.doesNotMatch(byRole, /前端主力/);

  const byAuthor = await html('/posters?author=Alice');
  assert.match(byAuthor, /Alice 的推荐海报/);
  assert.match(byAuthor, /前端主力/);
  assert.doesNotMatch(byAuthor, /全栈清单/);
});

test('in-place PUT update, reason voting, gems sort and random discovery', async t => {
  const { base, share, post, page, html } = await start(t);
  const created = await (await share('第一版桌面', [
    { name: 'Raycast', group: '效率', note: '第一条普通理由' },
    { name: 'ObscureGem', group: '小众', note: '非常惊艳的小众冷门工具' },
  ], { name: '张三', role: '效率极客' })).json();

  const second = await (await share('第二版桌面', [
    { name: 'Raycast', group: '效率', note: '神级效率启动器，每天按两百次' },
  ], { name: '李四' })).json();

  // Vote on second reason so it ranks above first
  const voteRes = await post({ shareId: second.id, appKey: 'raycast' }, '/api/v1/reasons/vote');
  assert.equal(voteRes.status, 200);
  assert.deepEqual(await voteRes.json(), { voted: true, votes: 1 });

  const rayHtml = await html('/apps/raycast');
  assert.ok(rayHtml.indexOf('神级效率启动器') < rayHtml.indexOf('第一条普通理由'), 'upvoted reason ranks first');

  // Toggle vote off
  const unvoteRes = await post({ shareId: second.id, appKey: 'raycast' }, '/api/v1/reasons/vote');
  assert.deepEqual(await unvoteRes.json(), { voted: false, votes: 0 });

  // Gems sort surfaces noted niche app
  const gemsHtml = await html('/apps?sort=gems');
  assert.match(gemsHtml, /ObscureGem/);

  // Random redirect
  const randApp = await page('/random');
  assert.equal(randApp.status, 302);
  assert.match(randApp.headers.get('location'), /^\/apps\//);
  const randPoster = await page('/random?type=poster');
  assert.equal(randPoster.status, 302);
  assert.match(randPoster.headers.get('location'), /^\/s\//);

  // In-place PUT update (unauthorized rejected)
  const badPut = await fetch(base + '/api/v1/shares/' + created.id, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + '0'.repeat(64) },
    body: JSON.stringify({ name: '张三', title: '改标题', visibility: 'public', apps: [{ name: 'Zed', group: '开发' }] }),
  });
  assert.equal(badPut.status, 404);

  // Authorized PUT update without re-sending image keeps existing image & updates apps/role
  const goodPut = await fetch(base + '/api/v1/shares/' + created.id, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + created.removeToken },
    body: JSON.stringify({
      name: '张三',
      title: '第二代主力桌面',
      role: '全栈开发',
      visibility: 'public',
      apps: [{ name: 'Zed', group: '开发', note: '启动快到飞起' }],
    }),
  });
  assert.equal(goodPut.status, 200);
  const updated = await goodPut.json();
  assert.equal(updated.updated, true);

  const shareHtml = await html('/s/' + created.id);
  assert.match(shareHtml, /第二代主力桌面/);
  assert.match(shareHtml, /全栈开发/);
  assert.match(shareHtml, /Zed/);
  assert.match(shareHtml, /data-lightbox=/);
  assert.match(shareHtml, /download="张三-第二代主力桌面\.webp"/);
  assert.equal((await page('/apps/obscuregem')).status, 404, 'removed app drops from catalog');

  // Owner GET endpoint for studio editing
  const ownerGet = await fetch(base + '/api/v1/shares/' + created.id, {
    headers: { authorization: 'Bearer ' + created.removeToken },
  });
  assert.equal(ownerGet.status, 200);
  const ownerData = await ownerGet.json();
  assert.equal(ownerData.title, '第二代主力桌面');
  assert.equal(ownerData.role, '全栈开发');
});

test('dynamic OG PNG, developer SVG badge, taste test, RSS feed and public JSON APIs', async t => {
  const { share, post, page, html } = await start(t);
  const iconBytes = await sharp({ create: { width: 128, height: 128, channels: 4, background: '#ffb547' } }).png().toBuffer();
  const iconHash = sha(iconBytes);

  const pub = await (await share('极客桌面', [
    { name: 'Raycast', group: '效率', note: '每天用百次的启动器', icon: iconHash },
    { name: 'Obsidian', group: '写作', note: '本地 Markdown 知识库' },
    { name: 'Ghostty', group: '开发', note: '原生快终端' },
  ], { name: '乔木', role: '独立开发者', icons: { [iconHash]: iconBytes.toString('base64') } })).json();

  await share('私密不公开', [{ name: 'HiddenSecret', group: '私密' }], { visibility: 'link' });

  // Dynamic OG PNG (with icon and without icon)
  const ogWithIcon = await page('/og/apps/raycast.png');
  assert.equal(ogWithIcon.status, 200);
  assert.equal(ogWithIcon.headers.get('content-type'), 'image/png');
  const ogMeta = await sharp(Buffer.from(await ogWithIcon.arrayBuffer())).metadata();
  assert.deepEqual([ogMeta.format, ogMeta.width, ogMeta.height], ['png', 1200, 630]);

  const ogFallback = await page('/og/apps/obsidian.png');
  assert.equal(ogFallback.status, 200);
  const ogMeta2 = await sharp(Buffer.from(await ogFallback.arrayBuffer())).metadata();
  assert.deepEqual([ogMeta2.format, ogMeta2.width, ogMeta2.height], ['png', 1200, 630]);

  // Developer SVG badge
  const badgeRes = await page('/badges/apps/raycast.svg');
  assert.equal(badgeRes.status, 200);
  assert.match(badgeRes.headers.get('content-type'), /image\/svg\+xml/);
  assert.equal(badgeRes.headers.get('access-control-allow-origin'), '*');
  const badgeSvg = await badgeRes.text();
  assert.match(badgeSvg, /1 Macs 推荐/);

  // Taste test API
  const tasteRes = await post({ apps: ['Raycast', 'Obsidian', 'MyUniqueSecretTool'] }, '/api/v1/taste');
  assert.equal(tasteRes.status, 200);
  const taste = await tasteRes.json();
  assert.equal(taste.selectedCount, 3);
  assert.equal(taste.mainstream[0].key, 'raycast');
  assert.equal(taste.niche[0].key, 'myuniquesecrettool');
  assert.equal(taste.niche[0].count, 0);
  assert.equal(taste.similar[0].id, pub.id);
  assert.equal(taste.similar[0].shared, 2);

  // RSS Feed excludes private link shares
  const feedRes = await page('/feed.xml');
  assert.equal(feedRes.status, 200);
  assert.match(feedRes.headers.get('content-type'), /application\/rss\+xml/);
  const feedXml = await feedRes.text();
  assert.match(feedXml, /<rss version="2\.0"/);
  assert.match(feedXml, /极客桌面/);
  assert.doesNotMatch(feedXml, /私密不公开/);

  // Public JSON APIs with CORS
  const apiApps = await page('/api/v1/apps');
  assert.equal(apiApps.status, 200);
  assert.equal(apiApps.headers.get('access-control-allow-origin'), '*');
  const appsJson = await apiApps.json();
  assert.ok(appsJson.items.some(a => a.key === 'raycast' && a.cask === 'raycast'));
  assert.ok(!appsJson.items.some(a => a.key === 'hiddensecret'));

  const apiApp = await (await page('/api/v1/apps/raycast')).json();
  assert.equal(apiApp.cask, 'raycast');
  assert.equal(apiApp.homepage, 'https://www.raycast.com');
  assert.equal(apiApp.reasons.length, 1);

  const apiPosters = await (await page('/api/v1/posters')).json();
  assert.equal(apiPosters.items.length, 1);
  assert.equal(apiPosters.items[0].id, pub.id);

  // New SSR pages render cleanly
  for (const route of ['/taste', '/studio', '/make', '/']) {
    const res = await page(route);
    assert.equal(res.status, 200, route);
  }
  const homeHtml = await html('/');
  assert.match(homeHtml, /大家写的走心理由/);
  assert.match(homeHtml, /每天用百次的启动器/);
});

test('need search, decision filters, free alternatives, community reviews, setup wizard, compare and Mac audit', async t => {
  const { share, post, page, html } = await start(t);

  await share('开发效率桌', [
    { name: 'Raycast', group: '效率' },
    { name: 'CleanShot X', group: '效率' },
    { name: 'Shottr', group: '效率' },
    { name: 'MonitorControl', group: '系统' },
    { name: 'OrbStack', group: '开发' },
    { name: '备忘录', group: '写作' },
  ], { name: 'DevA', role: '独立开发者' });

  await share('极客二号桌', [
    { name: 'Raycast', group: '效率' },
    { name: 'Alfred', group: '效率' },
    { name: 'OrbStack', group: '开发' },
    { name: 'Ghostty', group: '开发' },
  ], { name: 'DevB', role: '全栈开发' });

  // Pain-point Chinese keyword search in /apps and /api/v1/suggest
  const displaySuggest = await (await page('/api/v1/suggest?q=' + encodeURIComponent('外接显示器'))).json();
  assert.equal(displaySuggest.apps[0]?.key, 'monitorcontrol');
  assert.match(await html('/apps?q=' + encodeURIComponent('截图')), /CleanShot X/);

  // Decision filters: foss, brew, hide_system, theme
  const fossApps = await (await page('/api/v1/apps?pricing=foss')).json();
  assert.ok(fossApps.items.some(a => a.key === 'monitorcontrol'));
  assert.ok(!fossApps.items.some(a => a.key === 'cleanshot x'));

  const noSys = await (await page('/api/v1/apps?hide_system=1')).json();
  assert.ok(!noSys.items.some(a => a.key === '备忘录'));

  const devTheme = await (await page('/api/v1/apps?theme=dev')).json();
  assert.ok(devTheme.items.some(a => a.key === 'orbstack'));

  // Paid app shows free/open-source alternatives + compare links
  const csHtml = await html('/apps/' + encodeURIComponent('cleanshot x'));
  assert.match(csHtml, /免费 \/ 开源平替/);
  assert.match(csHtml, /Shottr/);
  assert.match(csHtml, /\/compare\?a=cleanshot%20x&amp;b=shottr/);

  // Community quick review does NOT inflate poster count, supports voting & 24h IP dedupe
  const revRes = await post({ author: '老用户', kind: 'tip', note: '配合 Option+Space 呼出剪贴板非常顺手' }, '/api/v1/apps/raycast/reviews');
  assert.equal(revRes.status, 201);
  const rev = await revRes.json();
  assert.equal(rev.kind, 'tip');
  const dupRev = await post({ author: '老用户', kind: 'tip', note: '同一天再发一条试试' }, '/api/v1/apps/raycast/reviews');
  assert.equal(dupRev.status, 429);

  const voteRev = await post({ reviewId: rev.id }, '/api/v1/reviews/vote');
  assert.deepEqual(await voteRev.json(), { voted: true, votes: 1 });
  const rayHtml = await html('/apps/raycast');
  assert.match(rayHtml, /配合 Option\+Space 呼出剪贴板非常顺手/);
  assert.match(rayHtml, /被 <span class="num">2<\/span> 张公开海报推荐/, 'review does not alter poster vote count');

  // /taste with pasted ls /Applications output -> collaborative missingRecommended + 7-pillar gapAudit
  const auditRes = await post({ rawText: 'Raycast.app\nSafari.app\nUtilities\n' }, '/api/v1/taste');
  assert.equal(auditRes.status, 200);
  const audit = await auditRes.json();
  assert.ok(audit.missingRecommended.some(m => m.key === 'orbstack'), 'peer collaborative diff recommends OrbStack');
  assert.equal(audit.gapAudit.length, 7);
  assert.equal(audit.gapAudit.find(s => s.id === 'launcher').covered, true);
  assert.equal(audit.gapAudit.find(s => s.id === 'screenshot').covered, false);

  // /api/v1/parse-apps for studio 10s batch import
  const parsed = await (await post({ rawText: '/Applications/Raycast.app\n/Applications/Safari.app\nOrbStack.app' }, '/api/v1/parse-apps')).json();
  assert.ok(parsed.items.some(i => i.key === 'raycast' && !i.isSystem));
  assert.ok(parsed.items.some(i => i.key === 'safari' && i.isSystem));

  // /setup page renders packs & scripts
  const setupHtml = await html('/setup');
  assert.match(setupHtml, /新 Mac 5 分钟装机包/);
  assert.match(setupHtml, /新 Mac 必装基础包/);
  assert.match(setupHtml, /0 元纯开源免费全家桶/);

  // /compare page renders side-by-side + overlap bar
  const cmpHtml = await html('/compare?a=raycast&b=alfred');
  assert.match(cmpHtml, /Raycast vs Alfred/);
  assert.match(cmpHtml, /只装 Raycast · 1/);
  assert.match(cmpHtml, /两款都装 · 1/);

  // /studio renders modal pickers, 4 fonts, watermark toggle, 20 wallpapers, 130+ preset apps & serves assets
  const studioHtml = await html('/studio');
  assert.match(studioHtml, /id="studio-apps-modal"/);
  assert.match(studioHtml, /id="studio-bg-modal"/);
  assert.match(studioHtml, /id="studio-style-modal"/);
  assert.match(studioHtml, /id="studio-watermark-show"/);
  assert.match(studioHtml, /data-font="smiley"/);
  assert.match(studioHtml, /data-font="wenkai"/);
  assert.match(studioHtml, /data-wallpaper-url="\/wallpapers\/01-goldengate\.webp"/);
  assert.match(studioHtml, /data-catalog-key="raycast"/);
  assert.match(studioHtml, /data-catalog-key="cursor"/);
  assert.match(studioHtml, /data-catalog-key="ghostty"/);

  const wpRes = await page('/wallpapers/01-goldengate.webp');
  assert.equal(wpRes.status, 200);
  assert.equal(wpRes.headers.get('content-type'), 'image/webp');
  assert.match(wpRes.headers.get('cache-control'), /immutable/);
  assert.equal((await page('/wallpapers/..%2Fsite.css')).status, 404);

  const fontRes = await page('/fonts/SmileySans-Oblique.otf');
  assert.equal(fontRes.status, 200);
  assert.equal(fontRes.headers.get('content-type'), 'font/otf');

  // Verify source tracking ('web' vs 'skill') on share creation, share page & /api/v1/posters
  const webRes = await post({
    name: '网页玩家', title: '网页制作示例', visibility: 'public', source: 'web',
    apps: [{ name: 'Cursor', group: 'AI 与开发' }], image: (await sharp({ create: { width: 640, height: 360, channels: 3, background: '#171a21' } }).png().toBuffer()).toString('base64'),
  });
  assert.equal(webRes.status, 201);
  const webShare = await webRes.json();
  assert.match(await html('/s/' + webShare.id), /网页制作/);
  const postersApi = await (await page('/api/v1/posters')).json();
  assert.equal(postersApi.items.find(p => p.id === webShare.id)?.source, 'web');
  assert.ok(postersApi.items.some(p => p.source === 'skill'));
});
