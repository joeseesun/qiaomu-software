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
const issues = 'https://github.com/joeseesun/qiaomu-software/issues/new';
const htmlChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, character => htmlChars[character]);
const siteDescription = '看看大家的 Mac 里真正在用什么软件。每张海报来自一位真实用户，每款软件按被推荐的海报数排名，附上推荐理由。';
const thumb = (id) => '/media/' + id + '/thumb.webp';
const image = (id) => '/media/' + id + '.webp';
const iconUrl = (hash) => '/icons/' + hash + '.webp';
const date = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'medium' });
const num = (value) => `<span class="num">${esc(Number(value) || 0)}</span>`;

function ago(time) {
  const days = Math.floor((Date.now() - time) / 86_400_000);
  if (days < 1) return '今天';
  if (days < 30) return days + ' 天前';
  return date.format(time);
}

// Lucide line icons (ISC license), drawn with currentColor.
const glyphs = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  quote: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
};
const glyph = (name, label = '') => `<svg class="glyph" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"'}>${glyphs[name]}</svg>`;

// Builds an escaped href; empty values are dropped, values are URL-encoded.
function href(base, params = {}, hash = '') {
  const qs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => key + '=' + encodeURIComponent(String(value)))
    .join('&');
  return esc(base + (qs ? '?' + qs : '') + hash);
}
const appHref = (key) => esc('/apps/' + encodeURIComponent(key));
const sizes = { sm: 24, md: 40, lg: 56, xl: 112 };
function appIcon(app, size = 'md') {
  const px = sizes[size];
  if (app.icon) return `<img class="app-icon app-icon-${size}" src="${iconUrl(esc(app.icon))}" alt="" width="${px}" height="${px}" loading="lazy" decoding="async">`;
  const name = String(app.name ?? '').trim();
  const letter = Array.from(name)[0]?.toUpperCase() ?? '?';
  const tile = Array.from(name.toLowerCase()).reduce((sum, character) => sum + character.codePointAt(0), 0) % 8;
  return `<span class="app-icon app-icon-${size} app-icon-blank tile-${tile}" aria-hidden="true">${esc(letter)}</span>`;
}
const quoted = (note) => note ? `「${esc(note)}」` : '';

function frame({ origin, umamiId, title, description = siteDescription, path = '/', photo = demoAsset, hidden = false, current = '', main }) {
  const fullTitle = title === '乔木软件推荐' ? title + ' · 大家真正在用的 Mac 软件' : title + ' · 乔木软件推荐';
  const analytics = /^[0-9a-f-]{36}$/i.test(umamiId ?? '') ?
    `<script defer src="https://umami.qiaomu.ai/script.js" data-website-id="${esc(umamiId)}" data-domains="${esc(new URL(origin).hostname)}"></script>` : '';
  const nav = (link, label, key) => `<a href="${link}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0c0e12">
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
    <a class="brand" href="/"><img src="${markAsset}" width="28" height="28" alt=""><span>乔木软件推荐</span></a>
    <nav class="main-nav" aria-label="主导航">${nav('/posters', '海报', 'posters')}${nav('/apps', '软件榜', 'apps')}</nav>
    <form class="header-search" role="search" action="/apps"><label class="sr" for="header-q">搜索软件</label>${glyph('search')}<input id="header-q" type="search" name="q" maxlength="60" placeholder="搜索软件" autocomplete="off"><kbd aria-hidden="true">/</kbd></form>
    <a class="button primary header-make${current === 'make' ? ' is-current' : ''}" href="/make">${glyph('plus')}做一张</a>
  </div>
</header>
<main id="main">${main}</main>
<footer class="site-footer">
  <div class="shell footer-inner">
    <p class="footer-brand"><img src="${markAsset}" width="22" height="22" alt="">乔木软件推荐<span>大家真正在用的 Mac 软件</span></p>
    <nav class="footer-links" aria-label="页脚">
      <a href="/posters">海报</a><a href="/apps">软件榜</a><a href="/make">做一张</a><a href="/privacy">数据与分享说明</a>
      <a href="${skill}">Skill 源码</a><a href="${repo}">网站源码</a><a href="https://x.com/vista8">X</a>
      <button type="button" class="footer-button" data-dialog="follow">关注乔木</button>
      <button type="button" class="footer-button" data-dialog="reward">支持乔木</button>
    </nav>
  </div>
</footer>
<dialog id="follow" closedby="any" aria-labelledby="follow-title">
  <h2 id="follow-title">关注向阳乔木</h2>
  <p>微信公众号 · 向阳乔木推荐看</p>
  <img width="160" height="160" src="/qiaomu-follow.jpg" alt="向阳乔木推荐看公众号二维码" loading="lazy">
  <p><a href="https://github.com/joeseesun/">GitHub</a> · <a href="https://x.com/vista8">X</a></p>
  <form method="dialog"><button type="submit" class="button secondary" autofocus>关闭</button></form>
</dialog>
<dialog id="reward" closedby="any" aria-labelledby="reward-title">
  <h2 id="reward-title">打赏支持</h2>
  <img width="160" height="160" src="/qiaomu-reward.png" alt="向阳乔木打赏二维码" loading="lazy">
  <form method="dialog"><button type="submit" class="button secondary" autofocus>关闭</button></form>
</dialog>
</body>
</html>`;
}

function iconStrip(items, max = 6, size = 'sm') {
  const shown = items.slice(0, max).map(app => appIcon(app, size)).join('');
  return `<span class="icon-strip" aria-hidden="true">${shown}${items.length > max ? `<span class="icon-more">+${esc(items.length - max)}</span>` : ''}</span>`;
}

function posterCard(row, { compact = false } = {}) {
  const id = esc(row.id);
  return `<article class="poster-card${compact ? ' is-compact' : ''}">
  <a class="poster-thumb" href="/s/${id}"><img src="${thumb(id)}" alt="${esc(row.name + '的推荐海报：' + row.title)}" width="${esc(row.width)}" height="${esc(row.height)}" loading="lazy" decoding="async"><span class="count-pill">${num(row.items.length)} 款</span></a>
  <h3><a href="/s/${id}">${esc(row.title)}</a></h3>
  <p class="poster-meta"><span class="author">${esc(row.name)}</span><span class="dot" aria-hidden="true">·</span>${esc(ago(row.created))}</p>
  ${compact ? '' : iconStrip(row.items)}
</article>`;
}

function appCard(app) {
  const cats = (app.categories ?? []).slice(0, 2).map(esc).join(' · ');
  return `<a class="app-card" href="${appHref(app.key)}">${appIcon(app, 'lg')}<span class="app-card-body">
  <span class="app-card-name">${esc(app.name)}</span>
  <span class="app-card-meta">${num(app.count)} 张海报${cats ? `<span class="dot" aria-hidden="true">·</span>${cats}` : ''}</span>
  ${app.note ? `<span class="app-card-note">${quoted(app.note)}</span>` : ''}
</span></a>`;
}

function installBlock(id = 'install-command') {
  return `<div class="command"><span class="command-prompt" aria-hidden="true">$</span><code id="${id}">${install}</code><button type="button" class="button secondary small" data-copy="${id}">${glyph('copy')}复制</button></div>`;
}

function pager(page, hasNext, url) {
  if (page <= 1 && !hasNext) return '';
  return `<nav class="pager" aria-label="分页">${page > 1 ? `<a class="button secondary" href="${url(page - 1)}" rel="prev">${glyph('back')}上一页</a>` : ''}<span class="pager-now">第 ${num(page)} 页</span>${hasNext ? `<a class="button secondary" href="${url(page + 1)}" rel="next">下一页${glyph('arrow')}</a>` : ''}</nav>`;
}

const chip = (label, value, clear) => `<a class="chip-clear" href="${clear}"><span class="chip-label">${label}</span><span class="chip-value">${esc(value)}</span><span class="chip-x" aria-hidden="true">×</span><span class="sr">，清除这个条件</span></a>`;

const statLine = (stats) => `<p class="stat-line">${num(stats.posters)} 张公开海报<span class="dot" aria-hidden="true">·</span>${num(stats.apps)} 款软件<span class="dot" aria-hidden="true">·</span>${num(stats.notes)} 条推荐理由</p>`;

export function home({ origin, umamiId, stats, popular = [], rising = false, latest = [], categories = [] }) {
  const featured = latest[0];
  const shelf = latest.slice(1);
  const heroArt = featured ? image(esc(featured.id)) : demoAsset;
  const hero = `<section class="hero" aria-labelledby="hero-title">
  <img class="hero-backdrop" src="${featured ? thumb(esc(featured.id)) : demoAsset}" alt="" aria-hidden="true">
  <div class="shell hero-inner">
    <div class="hero-copy">
      <p class="hero-label">${featured ? '最新海报' : '示例海报'}</p>
      <h1 id="hero-title">${featured ? esc(featured.title) : '大家真正在用的 Mac 软件'}</h1>
      <p class="hero-by">${featured ? `<span class="author">${esc(featured.name)}</span><span class="dot" aria-hidden="true">·</span>${num(featured.items.length)} 款软件<span class="dot" aria-hidden="true">·</span>${esc(ago(featured.created))}` : '用自己的桌面壁纸和应用图标，做一张署名的软件海报。每张公开海报都会给里面的软件投一票。'}</p>
      ${featured ? iconStrip(featured.items, 8, 'md') : ''}
      <div class="actions">${featured ? `<a class="button primary" href="/s/${esc(featured.id)}">看这张海报${glyph('arrow')}</a><a class="button secondary" href="/make">我也做一张</a>` : `<a class="button primary" href="/make">做一张我的海报${glyph('arrow')}</a><a class="button secondary" href="/apps">看软件榜</a>`}</div>
      ${statLine(stats)}
    </div>
    <a class="hero-art" href="${featured ? '/s/' + esc(featured.id) : demoAsset}" aria-label="${featured ? '查看这张海报' : '查看示例海报大图'}"><img src="${heroArt}" alt="${featured ? esc(featured.name + '的推荐海报') : '金门大桥桌面背景上的 23 款 Mac 软件推荐示例'}" width="${featured ? esc(featured.width) : 1600}" height="${featured ? esc(featured.height) : 900}" fetchpriority="high"></a>
  </div>
</section>`;
  const appsSection = popular.length ? `<section class="shell section" aria-labelledby="popular-title">
  <div class="section-head"><div><h2 id="popular-title">${rising ? '最近大家在推荐' : '大家常推荐'}</h2><p>${rising ? '按近 30 天的海报数排序' : '数字是推荐它的公开海报数，一张海报只算一次'}</p></div><a class="text-link" href="/apps${rising ? '?sort=rising' : ''}">完整软件榜${glyph('arrow')}</a></div>
  <div class="app-grid">${popular.slice(0, 12).map(appCard).join('')}</div>
</section>` : `<section class="shell section" aria-labelledby="popular-title">
  <div class="section-head"><div><h2 id="popular-title">大家常推荐</h2></div></div>
  <div class="empty-note"><h3>软件榜还空着</h3><p>第一张公开海报发布后，里面的软件会出现在这里，并按被推荐的次数排名。</p><a class="text-link" href="/make">做第一张海报${glyph('arrow')}</a></div>
</section>`;
  const shelfSection = shelf.length ? `<section class="section shelf-section" aria-labelledby="latest-title">
  <div class="shell section-head"><div><h2 id="latest-title">最近发布</h2><p>${num(stats.posters)} 张公开海报</p></div><a class="text-link" href="/posters">全部海报${glyph('arrow')}</a></div>
  <div class="shelf" tabindex="0" aria-label="最近发布的海报，可横向滚动">${shelf.map(row => posterCard(row)).join('')}</div>
</section>` : '';
  const catSection = categories.length ? `<section class="shell section" aria-labelledby="cat-title">
  <div class="section-head"><div><h2 id="cat-title">按分类找</h2><p>分类由作者在海报里自己定</p></div></div>
  <ul class="cat-cloud">${categories.map(c => `<li><a href="${href('/apps', { category: c.name })}"><span>${esc(c.name)}</span>${num(c.count)}</a></li>`).join('')}<li><a class="cat-all" href="/apps">全部软件${glyph('arrow')}</a></li></ul>
</section>` : '';
  return frame({ title: '乔木软件推荐', origin, umamiId, current: 'home', photo: featured ? image(featured.id) : demoAsset, main: `${hero}
${appsSection}
${shelfSection}
${catSection}
${makeBand()}` });
}

function makeBand() {
  return `<section class="shell section" aria-labelledby="make-title">
  <div class="make-band">
    <div class="make-copy">
      <h2 id="make-title">晒出你 Mac 上真正在用的软件</h2>
      <p>装好 Skill 后对助手说一句「用我的壁纸和应用图标做一张软件推荐海报」。它会扫描本机应用、让你挑选和写推荐理由，预览满意后再决定是否公开。</p>
      <a class="text-link" href="/make">看看完整流程${glyph('arrow')}</a>
    </div>
    <div class="make-install"><p class="command-label">${glyph('terminal')}在 Mac 的终端里安装</p>${installBlock()}</div>
  </div>
</section>`;
}

export function galleryPage({ origin, umamiId, shares, q = '', app = '', category = '', page = 1, stats }) {
  const filtered = Boolean(q || app || category);
  const chips = [
    app ? chip('软件', app, href('/posters', { q, category })) : '',
    category ? chip('分类', category, href('/posters', { q, app })) : '',
    q ? chip('搜索', q, href('/posters', { app, category })) : '',
  ].filter(Boolean);
  const empty = filtered || page > 1 ?
    `<div class="empty-note"><h3>没有匹配的海报</h3><p>换个软件名、作者名或海报标题试试，也可以去软件榜按分类找。</p><p class="empty-links"><a class="text-link" href="/posters">查看全部海报${glyph('arrow')}</a><a class="text-link" href="/apps">软件榜${glyph('arrow')}</a></p></div>` :
    `<div class="empty-note"><h3>还没有公开海报</h3><p>发布时选择「发布到画廊」，海报就会出现在这里。</p><a class="text-link" href="/make">做第一张海报${glyph('arrow')}</a></div>`;
  return frame({ title: '推荐海报', origin, umamiId, path: '/posters', current: 'posters', hidden: Boolean(filtered || page !== 1),
    description: '大家公开分享的 Mac 软件推荐海报，可以按软件、作者或标题查找。', main: `
<section class="shell page-head">
  <div><h1>推荐海报</h1><p class="lede">每一张都来自一位用户自己的 Mac：真实壁纸、真实图标、亲手挑的软件。</p>${statLine(stats)}</div>
  <form class="search" role="search" action="/posters"><label for="posters-q">搜索海报</label><div class="search-row"><input id="posters-q" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="软件名、作者或标题" autocomplete="off">${app ? `<input type="hidden" name="app" value="${esc(app)}">` : ''}${category ? `<input type="hidden" name="category" value="${esc(category)}">` : ''}<button type="submit" class="button primary">${glyph('search')}搜索</button></div></form>
</section>
<section class="shell section-tight" aria-label="海报列表">
  ${chips.length ? `<div class="filters" role="group" aria-label="当前筛选">${chips.join('')}${chips.length > 1 ? '<a class="text-link" href="/posters">全部清除</a>' : ''}</div>` : ''}
  ${shares.length ? `<div class="poster-grid">${shares.slice(0, 24).map(row => posterCard(row)).join('')}</div>` : empty}
  ${pager(page, shares.length > 24 && page < 167, number => href('/posters', { q, app, category, page: number }))}
</section>` });
}

export function appsPage({ origin, umamiId, apps = [], categories = [], q = '', category = '', sort = 'top', page = 1, hasNext = false, stats }) {
  const filtered = Boolean(q || category || sort !== 'top');
  const sorts = [['top', '总榜'], ['rising', '最近升温'], ['new', '新上榜']];
  const catUrl = (name) => href('/apps', { q, category: name, sort: sort === 'top' ? '' : sort });
  const catNav = categories.length ? `<nav class="cats" aria-label="软件分类">
      <h2 class="cats-title">分类</h2>
      <ul>
        <li><a href="${catUrl('')}"${category ? '' : ' aria-current="page"'}><span class="cat-name">全部</span>${num(stats.apps)}</a></li>
        ${categories.map(c => `<li><a href="${catUrl(c.name)}"${c.name === category ? ' aria-current="page"' : ''}><span class="cat-name">${esc(c.name)}</span>${num(c.count)}</a></li>`).join('')}
      </ul>
    </nav>` : '';
  const chips = [
    category ? chip('分类', category, href('/apps', { q, sort: sort === 'top' ? '' : sort })) : '',
    q ? chip('搜索', q, href('/apps', { category, sort: sort === 'top' ? '' : sort })) : '',
  ].filter(Boolean);
  const offset = (page - 1) * 24;
  const row = (app, index) => `<li class="rank-row">
      <span class="rank num">${esc(String(offset + index + 1).padStart(2, '0'))}</span>
      ${appIcon(app, 'md')}
      <div class="rank-main">
        <h3><a href="${appHref(app.key)}">${esc(app.name)}</a></h3>
        ${(app.categories ?? []).length ? `<p class="rank-cats"><span class="sr">分类：</span>${app.categories.slice(0, 3).map(c => `<a href="${catUrl(c)}">${esc(c)}</a>`).join('')}</p>` : ''}
        ${app.note ? `<p class="rank-note">${quoted(app.note)}</p>` : ''}
      </div>
      <p class="rank-count">${num(app.count)}<span>张海报</span></p>
    </li>`;
  const empty = filtered || page > 1 ?
    `<div class="empty-note"><h3>没有找到匹配的软件</h3><p>${q ? `还没有公开海报推荐「${esc(q)}」。` : '这一页还没有软件。'}换个关键词，或者把它做进你的海报。</p><p class="empty-links"><a class="text-link" href="/apps">查看全部软件${glyph('arrow')}</a><a class="text-link" href="/make">做一张海报${glyph('arrow')}</a></p></div>` :
    `<div class="empty-note"><h3>软件榜还空着</h3><p>第一张公开海报发布后，里面的软件和分类会出现在这里。</p><a class="text-link" href="/make">做第一张海报${glyph('arrow')}</a></div>`;
  return frame({ title: '软件榜', description: '大家公开推荐过的 Mac 软件，按推荐它的海报数排名，附推荐理由。', origin, umamiId, path: '/apps', current: 'apps',
    hidden: Boolean(filtered || page !== 1), main: `
<section class="shell page-head">
  <div><h1>软件榜</h1><p class="lede">一张公开海报算一票。点进软件能看到谁推荐了它、为什么推荐，以及常和它一起出现的软件。</p></div>
  <form class="search" role="search" action="/apps"><label for="apps-q">搜索软件</label><div class="search-row"><input id="apps-q" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="例如 Raycast" autocomplete="off">${category ? `<input type="hidden" name="category" value="${esc(category)}">` : ''}${sort !== 'top' ? `<input type="hidden" name="sort" value="${esc(sort)}">` : ''}<button type="submit" class="button primary">${glyph('search')}搜索</button></div></form>
</section>
<div class="shell directory${catNav ? '' : ' no-cats'}">
  ${catNav}
  <section class="index" aria-labelledby="index-title">
    <div class="index-head">
      <h2 id="index-title">${category ? `<span class="sr">分类：</span>${esc(category)}` : '全部软件'}</h2>
      <nav class="segmented" aria-label="排序">${sorts.map(([key, label]) => `<a href="${href('/apps', { q, category, sort: key === 'top' ? '' : key })}"${sort === key ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</nav>
    </div>
    ${chips.length ? `<div class="filters" role="group" aria-label="当前筛选">${chips.join('')}</div>` : ''}
    ${sort === 'rising' ? '<p class="index-note">按近 30 天推荐它的海报数排序。</p>' : sort === 'new' ? '<p class="index-note">按第一次被推荐的时间排序。</p>' : ''}
    ${apps.length ? `<ol class="rank-list">${apps.map(row).join('')}</ol>` : empty}
    ${pager(page, hasNext, number => href('/apps', { q, category, sort: sort === 'top' ? '' : sort, page: number }))}
  </section>
</div>` });
}

export function appPage({ origin, umamiId, app, categories = [], reasons = [], together = [], posters = [] }) {
  const description = `${app.name} 被 ${app.count} 张公开海报推荐。看看大家为什么用它，以及常和它一起出现的 Mac 软件。`;
  const reasonList = reasons.length ? `<ul class="reasons">${reasons.map(r => `<li class="reason">
      ${glyph('quote')}<blockquote><p>${quoted(r.note)}</p></blockquote>
      <p class="reason-by"><span class="author">${esc(r.author)}</span><span class="dot" aria-hidden="true">·</span><a href="/s/${esc(r.id)}">${esc(r.title)}</a><span class="dot" aria-hidden="true">·</span>${esc(ago(r.created))}</p>
    </li>`).join('')}</ul>` :
    `<div class="empty-note"><h3>还没有人写推荐理由</h3><p>做海报时可以给每款软件写一句为什么推荐，它会出现在这里。</p><a class="text-link" href="/make">我来写第一条${glyph('arrow')}</a></div>`;
  return frame({ title: app.name, description, origin, umamiId, path: '/apps/' + encodeURIComponent(app.key), current: 'apps',
    photo: app.icon ? iconUrl(app.icon) : demoAsset, main: `
<article class="shell app-page">
  <nav class="crumbs" aria-label="返回"><a href="/apps">${glyph('back')}软件榜</a></nav>
  <header class="app-hero">
    ${appIcon(app, 'xl')}
    <div class="app-hero-copy">
      <h1>${esc(app.name)}</h1>
      <p class="app-hero-count">被 ${num(app.count)} 张公开海报推荐<span class="dot" aria-hidden="true">·</span>最早 ${esc(date.format(app.first))}</p>
      <ul class="app-cats">${categories.map(c => `<li><a href="${href('/apps', { category: c.name })}">${esc(c.name)}<span class="num">${esc(c.count)}</span></a></li>`).join('')}</ul>
      ${app.bundle && !app.bundle.startsWith('cli:') ? `<p class="bundle"><span class="sr">应用标识：</span><code>${esc(app.bundle)}</code></p>` : ''}
    </div>
    <div class="actions app-hero-actions"><a class="button primary" href="${href('/posters', { app: app.key })}">看推荐它的海报${glyph('arrow')}</a><a class="button secondary" href="/make">我也推荐它</a></div>
  </header>
  <div class="app-columns">
    <section aria-labelledby="reasons-title"><h2 id="reasons-title">大家怎么说</h2>${reasonList}</section>
    ${together.length ? `<section aria-labelledby="together-title"><h2 id="together-title">常一起被推荐</h2><p class="section-sub">和 ${esc(app.name)} 出现在同一张海报的次数</p>
      <ul class="together">${together.map(t => `<li><a href="${appHref(t.key)}">${appIcon(t, 'md')}<span class="together-name">${esc(t.name)}</span><span class="together-count">${num(t.count)}</span></a></li>`).join('')}</ul></section>` : ''}
  </div>
  <section class="app-posters" aria-labelledby="posters-title">
    <div class="section-head"><div><h2 id="posters-title">出现在这些海报里</h2></div>${posters.length >= 12 ? `<a class="text-link" href="${href('/posters', { app: app.key })}">全部${glyph('arrow')}</a>` : ''}</div>
    <div class="poster-grid">${posters.map(row => posterCard(row)).join('')}</div>
  </section>
</article>` });
}

export function sharePage({ row, similar = [], origin, umamiId }) {
  const groups = new Map();
  for (const app of row.items) {
    if (!groups.has(app.group)) groups.set(app.group, []);
    groups.get(app.group).push(app);
  }
  const isPublic = row.visibility === 'public';
  const appLink = (app) => isPublic ? appHref(app.key) : href('/apps', { q: app.name });
  const notes = row.items.filter(app => app.note).length;
  const description = row.name + '推荐了 ' + row.items.length + ' 款 Mac 软件' + (notes ? '，并写了 ' + notes + ' 条推荐理由。' : '。');
  return frame({ title: row.title, description, origin, umamiId, path: '/s/' + row.id, photo: image(row.id), hidden: !isPublic,
    main: `<article class="share">
  <div class="shell">
    <nav class="crumbs" aria-label="返回"><a href="/posters">${glyph('back')}全部海报</a></nav>
    <header class="share-head">
      <h1>${esc(row.title)}</h1>
      <p class="share-by"><span class="author">${esc(row.name)}</span> 的推荐<span class="dot" aria-hidden="true">·</span>${num(row.items.length)} 款软件<span class="dot" aria-hidden="true">·</span><time datetime="${new Date(row.created).toISOString()}">${date.format(row.created)}</time>${isPublic ? '' : '<span class="dot" aria-hidden="true">·</span>仅链接可见'}</p>
    </header>
    <figure class="share-figure"><img class="share-image" src="${image(esc(row.id))}" alt="${esc(row.name + '的推荐海报：' + row.title)}" width="${esc(row.width)}" height="${esc(row.height)}" fetchpriority="high"></figure>
    <div class="actions share-actions">
      <a class="button primary" href="${image(esc(row.id))}" download="mac-software.webp">${glyph('download')}下载海报</a>
      <button type="button" class="button secondary" data-copy-url>${glyph('link')}复制分享链接</button>
      <a class="button secondary" href="/make">${glyph('plus')}我也做一张</a>
    </div>
    <section class="app-list" aria-labelledby="list-title">
      <h2 id="list-title">推荐清单</h2>
      ${[...groups].map(([label, apps]) => `<div class="app-group"><h3><a href="${href('/apps', { category: label })}">${esc(label)}</a></h3>
        <ul>${apps.map(app => `<li><a class="list-app" href="${appLink(app)}">${appIcon(app, 'md')}<span class="list-app-body"><span class="list-app-name">${esc(app.name)}</span>${app.note ? `<span class="list-app-note">${quoted(app.note)}</span>` : ''}</span></a></li>`).join('')}</ul></div>`).join('')}
    </section>
  </div>
  ${similar.length ? `<section class="section shelf-section" aria-labelledby="similar-title">
    <div class="shell section-head"><div><h2 id="similar-title">口味相近的海报</h2><p>推荐了相同软件最多的几张</p></div></div>
    <div class="shelf" tabindex="0" aria-label="口味相近的海报，可横向滚动">${similar.map(r => posterCard(r)).join('')}</div>
  </section>` : ''}
  <div class="shell">
    <details class="report"><summary>${glyph('flag')}举报这张海报</summary><form data-report="/api/v1/shares/${esc(row.id)}/reports"><label for="report-reason">原因</label><textarea id="report-reason" name="reason" required maxlength="200" rows="3"></textarea><button type="submit" class="button secondary">提交反馈</button><output role="status"></output></form></details>
  </div>
</article>` });
}

export function makePage({ origin, umamiId, stats }) {
  const steps = [
    ['安装 Skill', `在 Mac 的终端运行下面这条命令。支持 Agent Skills 的助手都能用，比如 Claude Code、Codex。`, installBlock('install-make')],
    ['让助手扫描本机', '对助手说「用我的壁纸和应用图标做一张软件推荐海报」。它按 Spotlight 记录的最近使用天数给出候选，不启动任何应用。', '<p class="say">「扫一下我最近半年常用的软件，先给我看候选」</p>'],
    ['挑软件、写理由', '去掉不想推荐的，补上漏掉的，调整分类。想写的话，给喜欢的几款各写一句推荐理由。', '<p class="say">「去掉微信，加上 Raycast，Raycast 的理由写：一个快捷键搞定剪贴板和窗口」</p>'],
    ['预览后再决定', '海报先在本机生成，满意了再选「只保存」「仅链接分享」或「发布到画廊」。公开海报会给里面每款软件投一票。', '<p class="say">「用『小乔』署名，发布到画廊」</p>'],
  ];
  return frame({ title: '做一张你的软件海报', description: '安装 qiaomu-mac-software Skill，用自己的壁纸和应用图标做一张 Mac 软件推荐海报。', origin, umamiId, path: '/make', current: 'make', main: `
<section class="shell page-head make-head">
  <div><h1>做一张你的软件海报</h1><p class="lede">大约两分钟。软件清单和使用记录只在你的 Mac 上处理，发不发布由你决定。</p>${statLine(stats)}</div>
  <figure class="make-sample"><img src="${demoAsset}" width="1600" height="900" alt="金门大桥桌面背景上的 23 款 Mac 软件推荐示例"><figcaption>示例：桌面壁纸 + 23 款软件</figcaption></figure>
</section>
<section class="shell section-tight">
  <ol class="make-steps">${steps.map(([title, text, extra], i) => `<li><span class="step-num num">${i + 1}</span><div><h2>${title}</h2><p>${text}</p>${extra}</div></li>`).join('')}</ol>
</section>
<section class="shell section" aria-labelledby="data-title">
  <div class="data-split">
    <div><h2 id="data-title">${glyph('shield')}留在本机的</h2><ul class="plain"><li>完整应用清单和安装路径</li><li>每款软件的使用日期和次数</li><li>桌面壁纸原图</li><li>撤回凭证</li></ul></div>
    <div><h2>分享时上传的</h2><ul class="plain"><li>合成后的海报图片（包含壁纸）</li><li>选中软件的名称、分类和你写的推荐理由</li><li>选中软件的 128px 图标，网站已有的不再重复上传</li><li>标题和署名</li></ul></div>
  </div>
  <p class="fine">详细说明见<a href="/privacy">数据与分享说明</a>。Skill 源码在 <a href="${skill}">GitHub</a>。</p>
</section>` });
}

export function terms({ origin, umamiId }) {
  return frame({ title: '数据与分享说明', origin, umamiId, path: '/privacy', main: `<article class="shell prose">
<h1>数据与分享说明</h1>
<h2>在你的 Mac 上制作</h2><p>Skill 读取本机应用、Spotlight 使用日期和桌面背景，生成本地 PNG。应用安装路径、使用日期、计数和桌面背景源文件留在本机。</p>
<h2>你选择分享后</h2><p>网站接收合成海报、你选的软件名称与分类、你写的推荐理由、这些软件的 128px 图标与应用标识、标题、署名和分享范围。网站已经有的图标只发送指纹，不重复上传。壁纸会出现在合成海报中，发布前请选一张适合分享的背景并预览海报。</p>
<h2>图标怎么显示</h2><p>同一款软件可能有多个版本的图标。软件页显示被最多公开海报使用的那个版本，单次上传无法替换大家公认的图标。</p>
<h2>可见范围和撤回</h2><p>公开海报会出现在海报列表、软件榜和搜索结果里，并给其中的软件计票。仅链接海报只有拿到链接的人能看，不计票。Skill 在本机保存撤回凭证，撤回后本站停止提供该海报和图片。其他人已保存的副本由对方保管。</p>
<h2>网站访问和举报</h2><p>本站使用 Umami 统计访问。上传和举报都有频率限制。海报页底部可以举报。项目问题请提到 <a href="${issues}">GitHub</a>。</p>
</article>` });
}

export function errorPage({ origin, umamiId, status, message }) {
  return frame({ title: String(status), origin, umamiId, hidden: true, main: `<article class="shell prose error">
<p class="error-code">${num(status)}</p>
<h1>${esc(message)}</h1>
<p class="empty-links"><a class="text-link" href="/">回首页${glyph('arrow')}</a><a class="text-link" href="/apps">软件榜${glyph('arrow')}</a></p>
</article>` });
}
