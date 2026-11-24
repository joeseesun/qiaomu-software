import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const asset = name => {
  const bytes = readFileSync(new URL('./public/' + name, import.meta.url));
  return '/' + name + '?v=' + createHash('sha256').update(bytes).digest('hex').slice(0, 12);
};
const styleAsset = asset('site.css');
const scriptAsset = asset('site.js');
const demoAsset = asset('demo.webp');
const markAsset = asset('mark.svg');

const skill = 'https://github.com/joeseesun/qiaomu-mac-software';
const repo = 'https://github.com/joeseesun/qiaomu-software';
const install = 'npx skills add joeseesun/qiaomu-mac-software --skill qiaomu-mac-software';
const email = 'https://github.com/joeseesun/qiaomu-software/issues/new';
const htmlChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, character => htmlChars[character]);
const galleryDescription = '看看大家在 Mac 上推荐什么。用自己的桌面壁纸和应用图标，做一张可以署名分享的软件海报。';
const appsDescription = '按分类浏览大家公开推荐的 Mac 软件，看每款软件被多少张海报提到。';
const thumb = (id) => '/media/' + id + '/thumb.webp';
const image = (id) => '/media/' + id + '.webp';
const date = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', dateStyle: 'medium' });
const num = (value) => `<span class="num">${esc(Number(value) || 0)}</span>`;

// Builds an escaped href; empty values are dropped, values are URL-encoded.
function href(base, params = {}, hash = '') {
  const qs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => key + '=' + encodeURIComponent(String(value)))
    .join('&');
  return esc(base + (qs ? '?' + qs : '') + hash);
}
const appLink = (name, category = '') => href('/', { app: name, category }, '#gallery');

function frame({ origin, umamiId, title, description = galleryDescription, path = '/', photo = demoAsset, hidden = false, current = '', main }) {
  const fullTitle = title === '乔木软件推荐' ? title : title + ' · 乔木软件推荐';
  const analytics = /^[0-9a-f-]{36}$/i.test(umamiId ?? '') ?
    `<script defer src="https://umami.qiaomu.ai/script.js" data-website-id="${esc(umamiId)}" data-domains="${esc(new URL(origin).hostname)}"></script>` : '';
  const nav = (link, label, key) => `<a href="${link}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f5f7fa">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(origin + path)}">
${hidden ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(origin + photo)}">
<meta property="og:url" content="${esc(origin + path)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${markAsset}" type="image/svg+xml">
<link rel="stylesheet" href="${styleAsset}">
<script defer src="${scriptAsset}"></script>
${analytics}
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">⌘</span><span>乔木软件推荐</span></a>
    <nav class="main-nav" aria-label="主导航">${nav('/#gallery', '看推荐', 'home')}${nav('/apps', '软件目录', 'apps')}${nav('/#make', '做一张', 'make')}<a href="${repo}">GitHub</a></nav>
  </div>
</header>
<main id="main">${main}</main>
<footer class="site-footer">
  <div class="shell footer-inner">
    <a href="/apps">软件目录</a>
    <a href="/privacy">数据与分享说明</a>
    <a href="https://tuijian.qiaomu.ai/">乔木推荐</a>
    <a href="https://x.com/vista8">X</a>
    <a href="${repo}">网站源码</a>
    <button type="button" class="footer-button" data-dialog="follow" title="关注乔木">关注乔木</button>
    <button type="button" class="footer-button" data-dialog="reward" title="支持乔木">支持乔木</button>
  </div>
</footer>
<dialog id="follow" closedby="any" aria-labelledby="follow-title">
  <h1 id="follow-title">关注向阳乔木</h1>
  <p>微信公众号 · 向阳乔木推荐看</p>
  <img width="160" height="160" src="/qiaomu-follow.jpg" alt="向阳乔木推荐看公众号二维码" fetchpriority="low">
  <p><a href="https://github.com/joeseesun/">GitHub</a> · <a href="https://x.com/vista8">X</a></p>
  <form method="dialog"><button type="submit" autofocus>关闭</button></form>
</dialog>
<dialog id="reward" closedby="any" aria-labelledby="reward-title">
  <h1 id="reward-title">打赏支持</h1>
  <img width="160" height="160" src="/qiaomu-reward.png" alt="向阳乔木打赏二维码" fetchpriority="low">
  <form method="dialog"><button type="submit" autofocus>关闭</button></form>
</dialog>
</body>
</html>`;
}

function card(row) {
  const apps = JSON.parse(row.apps);
  return `<article class="card"><a class="card-art" href="/s/${esc(row.id)}"><img src="${thumb(esc(row.id))}" alt="${esc(row.name + '的推荐海报')}" width="${esc(row.width)}" height="${esc(row.height)}" loading="lazy" decoding="async"></a>
  <div class="card-body"><h3><a href="/s/${esc(row.id)}">${esc(row.title)}</a></h3><p class="byline"><span class="author">${esc(row.name)}</span><span class="dot" aria-hidden="true">·</span>${num(apps.length)} 款软件</p>
  <div class="tags">${apps.slice(0, 4).map(a => `<a href="${appLink(a.name)}">${esc(a.name)}</a>`).join('')}${apps.length > 4 ? `<a class="tag-more" href="/s/${esc(row.id)}">+${esc(apps.length - 4)}</a>` : ''}</div></div></article>`;
}

function topList(topApps) {
  if (!topApps.length) return '';
  return `<section class="hero-top" aria-labelledby="top-title">
    <div class="hero-top-head"><h2 id="top-title">大家常推荐</h2><a class="text-link" href="/apps">完整软件目录 →</a></div>
    <ol class="top-apps">${topApps.slice(0, 6).map(app => {
      const cats = (app.categories ?? []).slice(0, 2);
      return `<li><a href="${appLink(app.name)}"><span class="top-name">${esc(app.name)}</span><span class="top-meta">${num(app.count)} 张海报${cats.length ? `<span class="dot" aria-hidden="true">·</span><span class="top-cats">${cats.map(esc).join(' / ')}</span>` : ''}</span></a></li>`;
    }).join('')}</ol>
  </section>`;
}

export function home({ shares, q = '', page = 1, origin, umamiId, app = '', category = '', topApps = [] }) {
  q = q ?? ''; app = app ?? ''; category = category ?? '';
  const filtered = Boolean(q || app || category);
  const chip = (label, value, clear) => `<a class="chip-clear" href="${clear}"><span class="chip-label">${label}</span><span class="chip-value">${esc(value)}</span><span class="chip-x" aria-hidden="true">×</span><span class="sr">，清除这个条件</span></a>`;
  const chips = [
    app ? chip('软件', app, href('/', { q, category }, '#gallery')) : '',
    category ? chip('分类', category, href('/', { q, app }, '#gallery')) : '',
    q ? chip('搜索', q, href('/', { app, category }, '#gallery')) : '',
  ].filter(Boolean);
  const filterBar = chips.length ? `<div class="filters" role="group" aria-label="当前筛选"><span class="filters-label">当前筛选</span>${chips.join('')}${chips.length > 1 ? '<a class="text-link" href="/#gallery">全部清除</a>' : ''}</div>` : '';
  const sample = '<div class="empty-note"><h3>画廊还没有公开海报</h3><p>完成海报后选择「发布到画廊」，作品会出现在这里。</p><a class="text-link" href="#make">开始制作 →</a></div>';
  const matching = `<div class="empty-note"><h3>没有匹配的海报</h3><p>试试别的软件名、分享名或海报标题，或去软件目录按分类找。</p><p class="empty-links"><a class="text-link" href="/#gallery">查看全部海报 →</a><a class="text-link" href="/apps">软件目录 →</a></p></div>`;
  const pageUrl = (number) => href('/', { q, app, category, page: number }, '#gallery');
  const hasNext = shares.length > 24 && page < 167;
  return frame({ title: '乔木软件推荐', origin, umamiId, current: 'home', hidden: Boolean(filtered || page !== 1), main: `
<section class="hero shell">
  <div class="hero-copy">
    <p class="eyebrow">Mac 软件推荐海报</p>
    <h1>大家推荐的 Mac 软件</h1>
    <p class="lede">按软件或分类找到别人真实在用的应用，看完整海报；也可以用自己的桌面和应用图标，做一张署名分享。</p>
    <div class="actions"><button type="button" class="button primary install-copy" data-copy="install-command">复制 Skill 安装命令</button><a class="button secondary" href="/apps">浏览软件目录</a></div>
  </div>
  <figure class="hero-image"><a class="hero-example" href="${demoAsset}" aria-label="查看软件海报示例大图"><img src="${demoAsset}" width="1600" height="900" alt="金门大桥桌面背景上的 23 款 Mac 软件推荐" fetchpriority="high"></a><figcaption>桌面壁纸示例 · 23 款软件</figcaption></figure>
  ${topList(topApps)}
</section>
<section class="shell section" id="gallery" aria-labelledby="gallery-title">
  <div class="section-head">
    <div><h2 id="gallery-title">推荐画廊</h2><p>按软件名、分享名或海报标题找推荐。</p></div>
    <form class="search" role="search" action="/#gallery"><label for="search-input">搜索海报</label><div class="search-row"><input id="search-input" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="例如 Obsidian" autocomplete="off">${app ? `<input type="hidden" name="app" value="${esc(app)}">` : ''}${category ? `<input type="hidden" name="category" value="${esc(category)}">` : ''}<button type="submit">搜索</button></div></form>
  </div>
  ${filterBar}
  ${shares.length ? `<div class="gallery">${shares.slice(0, 24).map(card).join('')}</div>` : (filtered || page > 1 ? matching : sample)}
  ${page > 1 || hasNext ? `<nav class="pager" aria-label="分页">${page > 1 ? `<a class="button secondary" href="${pageUrl(page - 1)}" rel="prev">← 上一页</a>` : ''}<span class="pager-now">第 ${num(page)} 页</span>${hasNext ? `<a class="button secondary" href="${pageUrl(page + 1)}" rel="next">下一页 →</a>` : ''}</nav>` : ''}
</section>
<section class="make" id="make" aria-labelledby="make-title">
  <div class="shell make-inner">
    <div class="make-copy">
      <h2 id="make-title">做一张你的软件海报</h2>
      <p>在 Mac 上安装 Skill，让支持 Skill 的助手运行。应用清单和使用记录留在本机，预览确认后再分享成图。</p>
      <ol class="steps"><li>复制命令，安装 Skill</li><li>让助手生成本地预览</li><li>确认后发布到画廊或仅链接分享</li></ol>
    </div>
    <div class="installation"><p class="command-label">安装命令</p><div class="command"><code id="install-command">${install}</code><button type="button" data-copy="install-command">复制</button></div><p><a class="text-link" href="${skill}">查看 Skill 与安装说明 ↗</a></p></div>
  </div>
</section>` });
}

export function appsPage({ apps = [], categories = [], q = '', category = '', page = 1, hasNext = false, origin, umamiId }) {
  q = q ?? ''; category = category ?? '';
  const filtered = Boolean(q || category);
  const catUrl = (name) => href('/apps', { q, category: name });
  const catNav = categories.length ? `<nav class="cats" aria-label="软件分类">
      <h2 class="cats-title">分类</h2>
      <ul>
        <li><a href="${catUrl('')}"${category ? '' : ' aria-current="page"'}><span class="cat-name">全部</span></a></li>
        ${categories.map(c => `<li><a href="${catUrl(c.name)}"${c.name === category ? ' aria-current="page"' : ''}><span class="cat-name">${esc(c.name)}</span>${num(c.count)}</a></li>`).join('')}
      </ul>
    </nav>` : '';
  const chips = [
    category ? `<a class="chip-clear" href="${href('/apps', { q })}"><span class="chip-label">分类</span><span class="chip-value">${esc(category)}</span><span class="chip-x" aria-hidden="true">×</span><span class="sr">，清除这个条件</span></a>` : '',
    q ? `<a class="chip-clear" href="${href('/apps', { category })}"><span class="chip-label">搜索</span><span class="chip-value">${esc(q)}</span><span class="chip-x" aria-hidden="true">×</span><span class="sr">，清除这个条件</span></a>` : '',
  ].filter(Boolean);
  const row = (app) => `<li class="app-row">
      <div class="app-main"><h3>${esc(app.name)}</h3>${(app.categories ?? []).length ? `<p class="app-cats"><span class="sr">出现过的分类：</span>${app.categories.map(c => `<a href="${catUrl(c)}"${c === category ? ' aria-current="true"' : ''}>${esc(c)}</a>`).join('')}</p>` : ''}</div>
      <p class="app-count">${num(app.count)}<span class="app-count-label">张海报</span></p>
      <a class="app-go" href="${appLink(app.name, category)}">看相关海报<span class="sr">：${esc(app.name)}</span><span aria-hidden="true"> →</span></a>
    </li>`;
  const empty = filtered || page > 1 ?
    `<div class="empty-note"><h3>没有找到匹配的软件</h3><p>${q ? `目录里还没有叫「${esc(q)}」的软件。` : '这一页还没有软件。'}换个关键词，或者把它做进你的海报。</p><p class="empty-links"><a class="text-link" href="/apps">查看全部软件 →</a><a class="text-link" href="/#make">制作我的海报 →</a></p></div>` :
    '<div class="empty-note"><h3>目录还是空的</h3><p>第一张公开海报发布后，里面的软件和分类会出现在这里。</p><p class="empty-links"><a class="text-link" href="/#make">制作第一张海报 →</a></p></div>';
  const pageUrl = (number) => href('/apps', { q, category, page: number });
  return frame({ title: '软件目录', description: appsDescription, origin, umamiId, path: '/apps', current: 'apps', hidden: Boolean(filtered || page !== 1), main: `
<section class="shell page-head">
  <div>
    <h1>软件目录</h1>
    <p class="lede">大家公开推荐过的 Mac 软件。数字是提到它的公开海报数，同一张海报只算一次。</p>
  </div>
  <form class="search" role="search" action="/apps"><label for="apps-search">搜索软件</label><div class="search-row"><input id="apps-search" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="例如 Raycast" autocomplete="off">${category ? `<input type="hidden" name="category" value="${esc(category)}">` : ''}<button type="submit">搜索</button></div></form>
</section>
<div class="shell directory${catNav ? '' : ' no-cats'}">
  ${catNav}
  <section class="index" aria-labelledby="index-title">
    <div class="index-head">
      <h2 id="index-title">${category ? `<span class="sr">分类：</span>${esc(category)}` : '全部软件'}</h2>
      ${chips.length ? `<div class="filters" role="group" aria-label="当前筛选">${chips.join('')}</div>` : ''}
    </div>
    ${apps.length ? `<ol class="app-index">${apps.map(row).join('')}</ol>` : empty}
    ${page > 1 || hasNext ? `<nav class="pager" aria-label="分页">${page > 1 ? `<a class="button secondary" href="${pageUrl(page - 1)}" rel="prev">← 上一页</a>` : ''}<span class="pager-now">第 ${num(page)} 页</span>${hasNext ? `<a class="button secondary" href="${pageUrl(page + 1)}" rel="next">下一页 →</a>` : ''}</nav>` : ''}
  </section>
</div>` });
}

export function sharePage({ row, origin, umamiId }) {
  const apps = JSON.parse(row.apps);
  const groups = new Map();
  for (const app of apps) {
    if (!groups.has(app.group)) groups.set(app.group, []);
    groups.get(app.group).push(app.name);
  }
  const description = row.name + '推荐了 ' + apps.length + ' 款 Mac 软件。';
  return frame({ title: row.title, description, origin, umamiId, path: '/s/' + row.id, photo: image(row.id), hidden: row.visibility === 'link',
    main: `<article class="shell share">
  <nav class="crumbs" aria-label="返回"><a href="/#gallery">← 推荐画廊</a><a href="/apps">软件目录</a></nav>
  <header class="share-head">
    <h1>${esc(row.title)}</h1>
    <p class="share-by"><span class="author">${esc(row.name)}</span> 的推荐<span class="dot" aria-hidden="true">·</span>${num(apps.length)} 款软件<span class="dot" aria-hidden="true">·</span><time datetime="${new Date(row.created).toISOString()}">${date.format(row.created)}</time></p>
  </header>
  <figure class="share-figure"><img class="share-image" src="${image(esc(row.id))}" alt="${esc(row.title)}" width="${esc(row.width)}" height="${esc(row.height)}" fetchpriority="high"></figure>
  <div class="actions share-actions">
    <a class="button primary" href="${image(esc(row.id))}" download="mac-software.webp">下载海报</a>
    <button type="button" class="button secondary" data-copy-url>复制分享链接</button>
    <a class="button ghost" href="/#make">我也做一张</a>
  </div>
  <section class="app-list" aria-labelledby="list-title"><h2 id="list-title">推荐清单</h2><ul>${[...groups].map(([label, names]) =>
    `<li><h3><a href="${href('/apps', { category: label })}">${esc(label)}</a></h3><div class="tags">${names.map(name => `<a href="${appLink(name)}">${esc(name)}</a>`).join('')}</div></li>`).join('')}</ul></section>
  <details class="report"><summary>举报这张海报</summary><form data-report="/api/v1/shares/${esc(row.id)}/reports"><label for="report-reason">原因</label><textarea id="report-reason" name="reason" required maxlength="200" rows="3"></textarea><button type="submit">提交反馈</button><output role="status"></output></form></details>
</article>` });
}

export function terms({ origin, umamiId }) {
  return frame({ title: '数据与分享说明', origin, umamiId, path: '/privacy', main: `<article class="shell prose">
<p class="eyebrow">隐私</p>
<h1>数据与分享说明</h1>
<h2>在你的 Mac 上制作</h2><p>Skill 读取本机应用、Spotlight 使用日期和桌面背景，生成本地 PNG。应用安装路径、使用日期、计数和桌面背景源文件留在本机。</p>
<h2>你选择分享后</h2><p>网站接收合成海报、你选的应用名称与分类、标题、分享名和分享范围。壁纸会出现在合成海报中。发布前请选择一张适合分享的背景，并预览海报内容。</p>
<h2>可见范围和撤回</h2><p>公开作品可以出现在画廊、软件目录和搜索结果。仅链接作品可由拿到链接的人查看。Skill 会在本机保存撤回凭证，撤回后本站停止提供该作品和图片。其他人已保存的副本由对方保管。</p>
<h2>网站访问和举报</h2><p>本站使用 Umami 做访问统计。网站对上传和举报限流。作品页面底部可以提交举报。项目问题可发到 <a href="${email}">GitHub</a>。</p>
</article>` });
}
export function errorPage({ origin, umamiId, status, message }) {
  return frame({ title: String(status), origin, umamiId, hidden: true, main: `<article class="shell prose error">
<p class="error-code">${num(status)}</p>
<h1>${esc(message)}</h1>
<p class="empty-links"><a class="text-link" href="/">回首页 →</a><a class="text-link" href="/apps">软件目录 →</a></p>
</article>` });
}
