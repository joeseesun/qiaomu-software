import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const asset = name => {
  try {
    const bytes = readFileSync(new URL('./public/' + name, import.meta.url));
    return '/' + name + '?v=' + createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  } catch {
    return '/' + name;
  }
};
const styleAsset = asset('site.css');
const scriptAsset = asset('site.js');
const studioAsset = asset('studio.js');
const demoAsset = asset('demo.webp');
const markAsset = asset('mark.svg');

const skill = 'https://github.com/joeseesun/qiaomu-mac-software';
const repo = 'https://github.com/joeseesun/qiaomu-software';
const install = 'npx skills add joeseesun/qiaomu-mac-software --skill qiaomu-mac-software';
const issues = 'https://github.com/joeseesun/qiaomu-software/issues/new';
const htmlChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, character => htmlChars[character]);
const safeJsonScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const siteDescription = '看看大家的 Mac 里真正在用什么软件。每张海报来自一位真实用户，每款软件按被推荐的海报数排名，附上推荐理由。';
const thumb = (id) => '/media/' + id + '/thumb.webp';
const image = (id) => '/media/' + id + '.webp';
const iconUrl = (hash) => '/icons/' + hash + '.webp';
const date = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'medium' });
const num = (value) => `<span class="num">${esc(Number(value) || 0)}</span>`;

function safeFilename(value) {
  const cleaned = String(value ?? '')
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 48);
  return cleaned || 'mac-software';
}

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
  check: '<path d="M20 6 9 17l-5-5"/>',
  quote: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  thumb: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
  zoom: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  edit: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  rss: '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
};
const glyph = (name, label = '') => `<svg class="glyph" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"'}>${glyphs[name]}</svg>`;

function href(base, params = {}, hash = '') {
  const qs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => key + '=' + encodeURIComponent(String(value)))
    .join('&');
  return esc(base + (qs ? '?' + qs : '') + hash);
}
const appHref = (key) => esc('/apps/' + encodeURIComponent(key));
const authorLink = (name) => `<a class="author author-link" href="${href('/posters', { author: name })}">${esc(name)}</a>`;
const rolePill = (role) => role ? `<a class="role-pill" href="${href('/posters', { role })}">${esc(role)}</a>` : '';
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

function kitButton(app, { label = false } = {}) {
  const payload = esc(JSON.stringify({
    key: app.key,
    name: app.name,
    cask: app.cask ?? '',
    homepage: app.homepage ?? '',
    icon: app.icon ?? '',
  }));
  if (label) {
    return `<button type="button" class="button secondary kit-toggle" data-kit-toggle="${payload}" aria-pressed="false">${glyph('box')}<span>加入装机清单</span></button>`;
  }
  return `<button type="button" class="icon-btn kit-toggle" data-kit-toggle="${payload}" aria-pressed="false" aria-label="将 ${esc(app.name)} 加入装机清单" title="加入装机清单">${glyph('plus')}</button>`;
}

function frame({ origin, umamiId, title, description = siteDescription, path = '/', photo = demoAsset, hidden = false, current = '', extraScript = '', main }) {
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
<link rel="alternate" type="application/rss+xml" title="乔木软件推荐" href="${esc(origin)}/feed.xml">
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
${extraScript ? `<script defer src="${extraScript}"></script>` : ''}
${analytics}
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="/"><img src="${markAsset}" width="28" height="28" alt=""><span>乔木软件推荐</span></a>
    <nav class="main-nav" aria-label="主导航">${nav('/posters', '海报', 'posters')}${nav('/apps', '软件榜', 'apps')}${nav('/taste', '测品味', 'taste')}</nav>
    <form class="header-search" role="search" action="/apps" data-suggest-wrap>
      <label class="sr" for="header-q">搜索软件</label>${glyph('search')}
      <input id="header-q" type="search" name="q" maxlength="60" placeholder="搜索软件" autocomplete="off" aria-autocomplete="list" aria-controls="header-suggest" aria-expanded="false">
      <kbd aria-hidden="true">/</kbd>
      <div id="header-suggest" class="suggest-menu" role="listbox" hidden></div>
    </form>
    <a class="button primary header-make${current === 'make' || current === 'studio' ? ' is-current' : ''}" href="/make">${glyph('plus')}做一张</a>
  </div>
</header>
<main id="main">${main}</main>
<footer class="site-footer">
  <div class="shell footer-inner">
    <p class="footer-brand"><img src="${markAsset}" width="22" height="22" alt="">乔木软件推荐<span>大家真正在用的 Mac 软件</span></p>
    <nav class="footer-links" aria-label="页脚">
      <a href="/posters">海报</a><a href="/apps">软件榜</a><a href="/taste">测品味</a><a href="/studio">网页制作</a><a href="/make">Skill 教程</a><a href="/random">随机逛逛</a><a href="/feed.xml">RSS</a><a href="/api/v1/apps">开放 API</a><a href="/privacy">数据与分享说明</a>
      <a href="${skill}">Skill 源码</a><a href="${repo}">网站源码</a><a href="https://x.com/vista8">X</a>
      <button type="button" class="footer-button" data-dialog="follow">关注乔木</button>
      <button type="button" class="footer-button" data-dialog="reward">支持乔木</button>
    </nav>
  </div>
</footer>
<button type="button" id="kit-fab" class="kit-fab" hidden aria-label="打开装机清单">${glyph('box')}<span>装机清单</span><span class="kit-badge num" id="kit-fab-count">0</span></button>
<dialog id="kit-dialog" class="kit-dialog" closedby="any" aria-labelledby="kit-title">
  <div class="kit-head">
    <div><h2 id="kit-title">我的装机清单</h2><p class="kit-sub">保存在当前浏览器，无需登录，可一键生成 Homebrew 批量安装命令。</p></div>
    <form method="dialog"><button type="submit" class="button secondary small">关闭</button></form>
  </div>
  <ul class="kit-list" id="kit-list"></ul>
  <div class="kit-export" id="kit-export" hidden>
    <p class="command-label">${glyph('terminal')}Homebrew 一键安装命令（仅含支持 Cask 的软件）</p>
    <div class="command"><span class="command-prompt" aria-hidden="true">$</span><code id="kit-brew-cmd"></code><button type="button" class="button primary small" id="kit-copy-brew">${glyph('copy')}复制命令</button></div>
    <div class="kit-actions">
      <button type="button" class="button secondary small" id="kit-download-brewfile">${glyph('download')}下载 Brewfile</button>
      <button type="button" class="button secondary small" id="kit-copy-md">${glyph('list')}复制 Markdown 清单</button>
      <button type="button" class="button secondary small kit-clear" id="kit-clear">清空</button>
    </div>
  </div>
</dialog>
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
  <p class="poster-meta">${authorLink(row.name)}${row.role ? `<span class="dot" aria-hidden="true">·</span>${rolePill(row.role)}` : ''}<span class="dot" aria-hidden="true">·</span>${esc(ago(row.created))}</p>
  ${compact ? '' : iconStrip(row.items)}
</article>`;
}

function appCard(app) {
  const cats = (app.categories ?? []).slice(0, 2).map(esc).join(' · ');
  return `<a class="app-card" href="${appHref(app.key)}">${appIcon(app, 'lg')}<span class="app-card-body">
  <span class="app-card-top"><span class="app-card-name">${esc(app.name)}</span>${app.pricing ? `<span class="mini-tag">${esc(app.pricing)}</span>` : ''}</span>
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

const statLine = (stats) => `<p class="stat-line">${num(stats.posters)} 张公开海报<span class="dot" aria-hidden="true">·</span>${num(stats.apps)} 款软件${stats.notes ? `<span class="dot" aria-hidden="true">·</span>${num(stats.notes)} 条推荐理由` : ''}</p>`;

export function home({ origin, umamiId, stats, popular = [], rising = false, latest = [], categories = [], roles = [], featuredReasons = [] }) {
  const featured = latest[0];
  const shelf = latest.slice(1);
  const heroArt = featured ? image(esc(featured.id)) : demoAsset;
  const hero = `<section class="hero" aria-labelledby="hero-title">
  <img class="hero-backdrop" src="${featured ? thumb(esc(featured.id)) : demoAsset}" alt="" aria-hidden="true">
  <div class="shell hero-inner">
    <div class="hero-copy">
      <p class="hero-label">${featured ? '最新海报' : '示例海报'}</p>
      <h1 id="hero-title">${featured ? esc(featured.title) : '大家真正在用的 Mac 软件'}</h1>
      <p class="hero-by">${featured ? `${authorLink(featured.name)}${featured.role ? `<span class="dot" aria-hidden="true">·</span>${rolePill(featured.role)}` : ''}<span class="dot" aria-hidden="true">·</span>${num(featured.items.length)} 款软件<span class="dot" aria-hidden="true">·</span>${esc(ago(featured.created))}` : '用自己的桌面壁纸和应用图标，做一张署名的软件海报。每张公开海报都会给里面的软件投一票。'}</p>
      ${featured ? iconStrip(featured.items, 8, 'md') : ''}
      <div class="actions">${featured ? `<a class="button primary" href="/s/${esc(featured.id)}">看这张海报${glyph('arrow')}</a><a class="button secondary" href="/studio">网页做一张</a><a class="button secondary" href="/taste">${glyph('sparkles')}测软件品味</a>` : `<a class="button primary" href="/studio">网页做一张${glyph('arrow')}</a><a class="button secondary" href="/make">用 Mac Skill 做</a>`}</div>
      ${statLine(stats)}
    </div>
    <a class="hero-art" href="${featured ? '/s/' + esc(featured.id) : demoAsset}" aria-label="${featured ? '查看这张海报' : '查看示例海报大图'}"><img src="${heroArt}" alt="${featured ? esc(featured.name + '的推荐海报') : '金门大桥桌面背景上的 23 款 Mac 软件推荐示例'}" width="${featured ? esc(featured.width) : 1600}" height="${featured ? esc(featured.height) : 900}" fetchpriority="high"></a>
  </div>
</section>`;

  const appsSection = popular.length ? `<section class="shell section" aria-labelledby="popular-title">
  <div class="section-head"><div><h2 id="popular-title">${rising ? '最近大家在推荐' : '大家常推荐'}</h2><p>${rising ? '按近 30 天的海报数排序' : '数字是推荐它的公开海报数，一张海报只算一次'}</p></div><div class="head-links"><a class="text-link" href="/apps?sort=gems">小众宝藏${glyph('sparkles')}</a><a class="text-link" href="/apps${rising ? '?sort=rising' : ''}">完整软件榜${glyph('arrow')}</a></div></div>
  <div class="app-grid">${popular.slice(0, 12).map(appCard).join('')}</div>
</section>` : `<section class="shell section" aria-labelledby="popular-title">
  <div class="section-head"><div><h2 id="popular-title">大家常推荐</h2></div></div>
  <div class="empty-note"><h3>软件榜还空着</h3><p>第一张公开海报发布后，里面的软件会出现在这里，并按被推荐的次数排名。</p><a class="text-link" href="/make">做第一张海报${glyph('arrow')}</a></div>
</section>`;

  const reasonsSection = featuredReasons.length ? `<section class="shell section" aria-labelledby="quotes-title">
  <div class="section-head"><div><h2 id="quotes-title">大家写的走心理由</h2><p>真人写的一句话种草，比介绍页更直接</p></div><a class="text-link" href="/random">${glyph('shuffle')}随机逛逛</a></div>
  <ul class="quote-grid">${featuredReasons.map(r => `<li class="quote-card">
    <a class="quote-app" href="${appHref(r.app_key)}">${appIcon({ name: r.app_name, icon: r.icon }, 'md')}<span><strong>${esc(r.app_name)}</strong>${r.votes ? `<span class="quote-votes">${glyph('thumb')}${num(r.votes)}</span>` : ''}</span></a>
    <blockquote><p>${quoted(r.note)}</p></blockquote>
    <p class="reason-by">${authorLink(r.author)}<span class="dot" aria-hidden="true">·</span><a href="/s/${esc(r.id)}">${esc(r.title)}</a></p>
  </li>`).join('')}</ul>
</section>` : '';

  const shelfSection = shelf.length ? `<section class="section shelf-section" aria-labelledby="latest-title">
  <div class="shell section-head"><div><h2 id="latest-title">最近发布</h2><p>${num(stats.posters)} 张公开海报</p></div><a class="text-link" href="/posters">全部海报${glyph('arrow')}</a></div>
  <div class="shelf" tabindex="0" aria-label="最近发布的海报，可横向滚动">${shelf.map(row => posterCard(row)).join('')}</div>
</section>` : '';

  const catSection = (categories.length || roles.length) ? `<section class="shell section" aria-labelledby="cat-title">
  <div class="section-head"><div><h2 id="cat-title">按分类或身份找</h2><p>看看不同场景和同行都在用哪些顺手工具</p></div><a class="text-link" href="/taste">${glyph('sparkles')}测测你的撞款率</a></div>
  ${roles.length ? `<ul class="cat-cloud role-cloud">${roles.map(r => `<li><a class="role-chip" href="${href('/posters', { role: r.name })}"><span>${esc(r.name)}</span>${num(r.count)}</a></li>`).join('')}</ul>` : ''}
  ${categories.length ? `<ul class="cat-cloud">${categories.map(c => `<li><a href="${href('/apps', { category: c.name })}"><span>${esc(c.name)}</span>${num(c.count)}</a></li>`).join('')}<li><a class="cat-all" href="/apps">全部软件${glyph('arrow')}</a></li></ul>` : ''}
</section>` : '';

  return frame({
    title: '乔木软件推荐', origin, umamiId, current: 'home', photo: featured ? image(featured.id) : demoAsset, main: `${hero}
${appsSection}
${reasonsSection}
${shelfSection}
${catSection}
${makeBand()}`,
  });
}

function makeBand() {
  return `<section class="shell section" aria-labelledby="make-title">
  <div class="make-band">
    <div class="make-copy">
      <h2 id="make-title">晒出你 Mac 上真正在用的软件</h2>
      <p>可以在网页直接选壁纸和图标 30 秒生成海报；也可以装好 Mac Skill，让助手自动扫描 Spotlight 真实使用记录和本机独有图标。</p>
      <div class="actions"><a class="button primary" href="/studio">${glyph('plus')}网页直接制作</a><a class="button secondary" href="/make">Mac Skill 完整教程${glyph('arrow')}</a></div>
    </div>
    <div class="make-install"><p class="command-label">${glyph('terminal')}或者在 Mac 终端安装 Skill</p>${installBlock()}</div>
  </div>
</section>`;
}

export function galleryPage({ origin, umamiId, shares, q = '', app = '', category = '', role = '', author = '', roles = [], page = 1, stats }) {
  const filtered = Boolean(q || app || category || role || author);
  const chips = [
    author ? chip('作者', author, href('/posters', { q, app, category, role })) : '',
    role ? chip('身份', role, href('/posters', { q, app, category, author })) : '',
    app ? chip('软件', app, href('/posters', { q, category, role, author })) : '',
    category ? chip('分类', category, href('/posters', { q, app, role, author })) : '',
    q ? chip('搜索', q, href('/posters', { app, category, role, author })) : '',
  ].filter(Boolean);
  const empty = filtered || page > 1 ?
    `<div class="empty-note"><h3>没有匹配的海报</h3><p>换个软件名、作者名、身份或海报标题试试，也可以去软件榜按分类找。</p><p class="empty-links"><a class="text-link" href="/posters">查看全部海报${glyph('arrow')}</a><a class="text-link" href="/apps">软件榜${glyph('arrow')}</a></p></div>` :
    `<div class="empty-note"><h3>还没有公开海报</h3><p>发布时选择「发布到画廊」，海报就会出现在这里。</p><a class="text-link" href="/studio">做第一张海报${glyph('arrow')}</a></div>`;
  const heading = author ? `${author} 的推荐海报` : '推荐海报';
  const roleBar = roles.length ? `<ul class="role-bar" aria-label="按身份筛选">
    <li><a href="${href('/posters', { q, app, category, author })}"${role ? '' : ' aria-current="page"'}>全部身份</a></li>
    ${roles.map(r => `<li><a href="${href('/posters', { q, app, category, author, role: r.name })}"${r.name === role ? ' aria-current="page"' : ''}>${esc(r.name)} ${num(r.count)}</a></li>`).join('')}
  </ul>` : '';
  return frame({
    title: heading, origin, umamiId, path: '/posters', current: 'posters', hidden: Boolean(filtered || page !== 1),
    description: '大家公开分享的 Mac 软件推荐海报，可以按软件、作者、身份或标题查找。', main: `
<section class="shell page-head">
  <div><h1>${esc(heading)}</h1><p class="lede">${author ? `共找到这位作者公开发布的 Mac 软件推荐海报。` : '每一张都来自一位用户自己的 Mac：真实壁纸、真实图标、亲手挑的软件。'}</p>${statLine(stats)}</div>
  <form class="search" role="search" action="/posters"><label for="posters-q">搜索海报</label><div class="search-row"><input id="posters-q" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="软件名、作者或标题" autocomplete="off">${app ? `<input type="hidden" name="app" value="${esc(app)}">` : ''}${category ? `<input type="hidden" name="category" value="${esc(category)}">` : ''}${role ? `<input type="hidden" name="role" value="${esc(role)}">` : ''}${author ? `<input type="hidden" name="author" value="${esc(author)}">` : ''}<button type="submit" class="button primary">${glyph('search')}搜索</button></div></form>
</section>
<section class="shell section-tight" aria-label="海报列表">
  ${roleBar}
  ${chips.length ? `<div class="filters" role="group" aria-label="当前筛选">${chips.join('')}${chips.length > 1 ? '<a class="text-link" href="/posters">全部清除</a>' : ''}</div>` : ''}
  ${shares.length ? `<div class="poster-grid">${shares.slice(0, 24).map(row => posterCard(row)).join('')}</div>` : empty}
  ${pager(page, shares.length > 24 && page < 167, number => href('/posters', { q, app, category, role, author, page: number }))}
</section>`,
  });
}

export function appsPage({ origin, umamiId, apps = [], categories = [], q = '', category = '', sort = 'top', page = 1, hasNext = false, stats }) {
  const filtered = Boolean(q || category || sort !== 'top');
  const sorts = [['top', '总榜'], ['rising', '最近升温'], ['new', '新上榜'], ['gems', '小众宝藏']];
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
        <div class="rank-title-row">
          <h3><a href="${appHref(app.key)}">${esc(app.name)}</a></h3>
          ${app.pricing ? `<span class="mini-tag">${esc(app.pricing)}</span>` : ''}
          ${app.cask ? '<span class="mini-tag is-brew">brew</span>' : ''}
        </div>
        ${(app.categories ?? []).length ? `<p class="rank-cats"><span class="sr">分类：</span>${app.categories.slice(0, 3).map(c => `<a href="${catUrl(c)}">${esc(c)}</a>`).join('')}</p>` : ''}
        ${app.note ? `<p class="rank-note">${quoted(app.note)}</p>` : ''}
      </div>
      <div class="rank-end">
        <p class="rank-count">${num(app.count)}<span>张海报</span></p>
        ${kitButton(app)}
      </div>
    </li>`;
  const empty = filtered || page > 1 ?
    `<div class="empty-note"><h3>没有找到匹配的软件</h3><p>${q ? `还没有公开海报推荐「${esc(q)}」。` : '这一页还没有软件。'}换个关键词，或者把它做进你的海报。</p><p class="empty-links"><a class="text-link" href="/apps">查看全部软件${glyph('arrow')}</a><a class="text-link" href="/studio">做一张海报${glyph('arrow')}</a></p></div>` :
    `<div class="empty-note"><h3>软件榜还空着</h3><p>第一张公开海报发布后，里面的软件和分类会出现在这里。</p><a class="text-link" href="/studio">做第一张海报${glyph('arrow')}</a></div>`;
  const sortNotes = {
    rising: '按近 30 天推荐它的海报数排序。',
    new: '按第一次被推荐的时间排序。',
    gems: '优先展示推荐数偏小众、但有人写过推荐理由的宝藏软件。',
  };
  return frame({
    title: '软件榜', description: '大家公开推荐过的 Mac 软件，按推荐它的海报数排名，附推荐理由与一键装机清单。', origin, umamiId, path: '/apps', current: 'apps',
    hidden: Boolean(filtered || page !== 1), main: `
<section class="shell page-head">
  <div><h1>软件榜</h1><p class="lede">一张公开海报算一票。点进软件能看到推荐理由、官网与 Homebrew 安装命令，也可以顺手收进装机清单。</p></div>
  <form class="search" role="search" action="/apps"><label for="apps-q">搜索软件</label><div class="search-row"><input id="apps-q" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="例如 Raycast" autocomplete="off">${category ? `<input type="hidden" name="category" value="${esc(category)}">` : ''}${sort !== 'top' ? `<input type="hidden" name="sort" value="${esc(sort)}">` : ''}<button type="submit" class="button primary">${glyph('search')}搜索</button></div></form>
</section>
<div class="shell directory${catNav ? '' : ' no-cats'}">
  ${catNav}
  <section class="index" aria-labelledby="index-title">
    <div class="index-head">
      <h2 id="index-title">${category ? `<span class="sr">分类：</span>${esc(category)}` : '全部软件'}</h2>
      <div class="index-controls">
        <nav class="segmented" aria-label="排序">${sorts.map(([key, label]) => `<a href="${href('/apps', { q, category, sort: key === 'top' ? '' : key })}"${sort === key ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</nav>
        <a class="button secondary small" href="/random" title="随机发现一款有推荐理由的软件">${glyph('shuffle')}随机逛逛</a>
      </div>
    </div>
    ${chips.length ? `<div class="filters" role="group" aria-label="当前筛选">${chips.join('')}</div>` : ''}
    ${sortNotes[sort] ? `<p class="index-note">${sortNotes[sort]}</p>` : ''}
    ${apps.length ? `<ol class="rank-list">${apps.map(row).join('')}</ol>` : empty}
    ${pager(page, hasNext, number => href('/apps', { q, category, sort: sort === 'top' ? '' : sort, page: number }))}
  </section>
</div>`,
  });
}

export function appPage({ origin, umamiId, app, categories = [], reasons = [], together = [], alternatives = [], posters = [] }) {
  const description = `${app.name} 被 ${app.count} 张公开海报推荐。看看大家为什么用它，以及常和它一起出现的 Mac 软件。`;
  const appUrl = origin + '/apps/' + encodeURIComponent(app.key);
  const badgeUrl = origin + '/badges/apps/' + encodeURIComponent(app.key) + '.svg';
  const badgeMd = `[![${app.name} - 乔木软件推荐](${badgeUrl})](${appUrl})`;
  const badgeHtml = `<a href="${appUrl}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="${app.name} - 乔木软件推荐"></a>`;
  const brewCmd = app.cask ? `brew install --cask ${app.cask}` : '';

  const metaLinks = [
    app.homepage ? `<a class="button secondary small" href="${esc(app.homepage)}" target="_blank" rel="noopener noreferrer">${glyph('external')}访问官网</a>` : '',
    app.mas_url ? `<a class="button secondary small" href="${esc(app.mas_url)}" target="_blank" rel="noopener noreferrer">${glyph('external')}App Store</a>` : '',
  ].filter(Boolean).join('');

  const metaStrip = (metaLinks || brewCmd) ? `<div class="app-install-bar">
    ${brewCmd ? `<div class="command command-inline"><span class="command-prompt" aria-hidden="true">$</span><code id="app-brew-cmd">${esc(brewCmd)}</code><button type="button" class="button secondary small" data-copy="app-brew-cmd">${glyph('copy')}复制</button></div>` : ''}
    ${metaLinks ? `<div class="app-ext-links">${metaLinks}</div>` : ''}
  </div>` : '';

  const reasonList = reasons.length ? `<ul class="reasons">${reasons.map(r => `<li class="reason">
      ${glyph('quote')}
      <div class="reason-body">
        <blockquote><p>${quoted(r.note)}</p></blockquote>
        <div class="reason-foot">
          <p class="reason-by">${authorLink(r.author)}${r.role ? `<span class="dot" aria-hidden="true">·</span>${rolePill(r.role)}` : ''}<span class="dot" aria-hidden="true">·</span><a href="/s/${esc(r.id)}">${esc(r.title)}</a><span class="dot" aria-hidden="true">·</span>${esc(ago(r.created))}</p>
          <button type="button" class="vote-btn" data-vote-reason data-share-id="${esc(r.id)}" data-app-key="${esc(app.key)}" aria-pressed="false" title="觉得这条推荐理由有帮助">${glyph('thumb')}<span>写得好</span><span class="vote-num num">${esc(r.votes || 0)}</span></button>
        </div>
      </div>
    </li>`).join('')}</ul>` :
    `<div class="empty-note"><h3>还没有人写推荐理由</h3><p>做海报时可以给每款软件写一句为什么推荐，它会出现在这里。</p><a class="text-link" href="/studio">我来写第一条${glyph('arrow')}</a></div>`;

  return frame({
    title: app.name, description, origin, umamiId, path: '/apps/' + encodeURIComponent(app.key), current: 'apps',
    photo: '/og/apps/' + encodeURIComponent(app.key) + '.png', main: `
<article class="shell app-page">
  <nav class="crumbs" aria-label="返回"><a href="/apps">${glyph('back')}软件榜</a></nav>
  <header class="app-hero">
    ${appIcon(app, 'xl')}
    <div class="app-hero-copy">
      <div class="app-hero-title"><h1>${esc(app.name)}</h1>${app.pricing ? `<span class="pricing-pill">${esc(app.pricing)}</span>` : ''}</div>
      ${app.summary ? `<p class="app-summary">${esc(app.summary)}</p>` : ''}
      <p class="app-hero-count">被 ${num(app.count)} 张公开海报推荐<span class="dot" aria-hidden="true">·</span>最早 ${esc(date.format(app.first))}</p>
      <ul class="app-cats">${categories.map(c => `<li><a href="${href('/apps', { category: c.name })}">${esc(c.name)}<span class="num">${esc(c.count)}</span></a></li>`).join('')}</ul>
      ${app.bundle && !app.bundle.startsWith('cli:') ? `<p class="bundle"><span class="sr">应用标识：</span><code>${esc(app.bundle)}</code></p>` : ''}
      ${metaStrip}
    </div>
    <div class="actions app-hero-actions">
      <a class="button primary" href="${href('/posters', { app: app.key })}">看推荐它的海报${glyph('arrow')}</a>
      ${kitButton(app, { label: true })}
      <a class="button secondary" href="/studio">我也推荐它</a>
    </div>
  </header>
  <div class="app-columns">
    <section aria-labelledby="reasons-title"><h2 id="reasons-title">大家怎么说</h2>${reasonList}</section>
    <aside class="app-aside">
      ${together.length ? `<section aria-labelledby="together-title"><h2 id="together-title">常一起被推荐</h2><p class="section-sub">和 ${esc(app.name)} 出现在同一张海报的次数</p>
        <ul class="together">${together.map(t => `<li><a href="${appHref(t.key)}">${appIcon(t, 'md')}<span class="together-name">${esc(t.name)}</span><span class="together-count">${num(t.count)}</span></a></li>`).join('')}</ul></section>` : ''}
      ${alternatives.length ? `<section class="alt-section" aria-labelledby="alt-title"><h2 id="alt-title">同分类其他选择</h2><p class="section-sub">在同类场景下大家还推荐了这些软件</p>
        <ul class="together">${alternatives.map(a => `<li><a href="${appHref(a.key)}">${appIcon(a, 'md')}<span class="together-name">${esc(a.name)}${a.pricing ? ` <span class="mini-tag">${esc(a.pricing)}</span>` : ''}</span><span class="together-count">${num(a.count)}</span></a></li>`).join('')}</ul></section>` : ''}
    </aside>
  </div>
  <section class="app-posters" aria-labelledby="posters-title">
    <div class="section-head"><div><h2 id="posters-title">出现在这些海报里</h2></div>${posters.length >= 12 ? `<a class="text-link" href="${href('/posters', { app: app.key })}">全部${glyph('arrow')}</a>` : ''}</div>
    <div class="poster-grid">${posters.map(row => posterCard(row)).join('')}</div>
  </section>
  <details class="badge-box">
    <summary>${glyph('code')}给开发者的推荐徽章（可嵌入 GitHub README 或官网）</summary>
    <div class="badge-body">
      <p class="badge-preview"><img src="/badges/apps/${encodeURIComponent(app.key)}.svg" alt="${esc(app.name)} 推荐徽章" height="28"></p>
      <div class="badge-snippets">
        <div>
          <p class="command-label">Markdown</p>
          <div class="command"><code id="badge-md">${esc(badgeMd)}</code><button type="button" class="button secondary small" data-copy="badge-md">${glyph('copy')}复制</button></div>
        </div>
        <div>
          <p class="command-label">HTML</p>
          <div class="command"><code id="badge-html">${esc(badgeHtml)}</code><button type="button" class="button secondary small" data-copy="badge-html">${glyph('copy')}复制</button></div>
        </div>
      </div>
    </div>
  </details>
</article>`,
  });
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
  const downloadName = safeFilename(`${row.name}-${row.title}`) + '.webp';
  const manifest = {
    id: row.id,
    title: row.title,
    author: row.name,
    role: row.role ?? '',
    url: origin + '/s/' + row.id,
    apps: row.items.map(a => ({
      key: a.key,
      name: a.name,
      group: a.group,
      note: a.note ?? '',
      cask: a.cask ?? '',
      homepage: a.homepage ?? '',
      icon: a.icon ?? '',
    })),
  };

  return frame({
    title: row.title, description, origin, umamiId, path: '/s/' + row.id, photo: image(row.id), hidden: !isPublic,
    main: `<article class="share">
  <div class="shell">
    <nav class="crumbs" aria-label="返回"><a href="/posters">${glyph('back')}全部海报</a></nav>
    <header class="share-head">
      <h1>${esc(row.title)}</h1>
      <p class="share-by">${isPublic ? authorLink(row.name) : `<span class="author">${esc(row.name)}</span>`} 的推荐${row.role ? `<span class="dot" aria-hidden="true">·</span>${rolePill(row.role)}` : ''}<span class="dot" aria-hidden="true">·</span>${num(row.items.length)} 款软件<span class="dot" aria-hidden="true">·</span><time datetime="${new Date(row.created).toISOString()}">${date.format(row.created)}</time>${isPublic ? '' : '<span class="dot" aria-hidden="true">·</span>仅链接可见'}</p>
    </header>
    <figure class="share-figure">
      <button type="button" class="share-zoom-trigger" data-lightbox="${image(esc(row.id))}" data-lightbox-alt="${esc(row.name + '的推荐海报：' + row.title)}" aria-label="放大查看海报大图">
        <img class="share-image" src="${image(esc(row.id))}" alt="${esc(row.name + '的推荐海报：' + row.title)}" width="${esc(row.width)}" height="${esc(row.height)}" fetchpriority="high">
        <span class="zoom-hint" aria-hidden="true">${glyph('zoom')}点击放大</span>
      </button>
    </figure>
    <div class="actions share-actions">
      <a class="button primary" href="${image(esc(row.id))}" download="${esc(downloadName)}">${glyph('download')}下载海报</a>
      <button type="button" class="button secondary" data-copy-url>${glyph('link')}复制分享链接</button>
      <button type="button" class="button secondary" data-copy-list>${glyph('list')}复制文字清单</button>
      <button type="button" class="button secondary" data-kit-batch>${glyph('box')}整张加入装机清单</button>
      <a class="button secondary" href="/studio">${glyph('plus')}我也做一张</a>
      <a class="button secondary" id="studio-edit-link" data-share-owner-id="${esc(row.id)}" href="/studio?edit=${esc(row.id)}" hidden>${glyph('edit')}编辑 / 更新海报</a>
    </div>
    <script type="application/json" id="share-manifest">${safeJsonScript(manifest)}</script>
    <section class="app-list" aria-labelledby="list-title">
      <h2 id="list-title">推荐清单</h2>
      ${[...groups].map(([label, apps]) => `<div class="app-group"><h3><a href="${href('/apps', { category: label })}">${esc(label)}</a></h3>
        <ul>${apps.map(app => `<li class="list-app-row"><a class="list-app" href="${appLink(app)}">${appIcon(app, 'md')}<span class="list-app-body"><span class="list-app-name">${esc(app.name)}${app.cask ? ' <span class="mini-tag is-brew">brew</span>' : ''}</span>${app.note ? `<span class="list-app-note">${quoted(app.note)}</span>` : ''}</span></a>${kitButton(app)}</li>`).join('')}</ul></div>`).join('')}
    </section>
  </div>
  ${similar.length ? `<section class="section shelf-section" aria-labelledby="similar-title">
    <div class="shell section-head"><div><h2 id="similar-title">口味相近的海报</h2><p>推荐了相同软件最多的几张</p></div></div>
    <div class="shelf" tabindex="0" aria-label="口味相近的海报，可横向滚动">${similar.map(r => posterCard(r)).join('')}</div>
  </section>` : ''}
  <div class="shell">
    <details class="report"><summary>${glyph('flag')}举报这张海报</summary><form data-report="/api/v1/shares/${esc(row.id)}/reports"><label for="report-reason">原因</label><textarea id="report-reason" name="reason" required maxlength="200" rows="3"></textarea><button type="submit" class="button secondary">提交反馈</button><output role="status"></output></form></details>
  </div>
  <dialog id="lightbox" class="lightbox" closedby="any" aria-label="高清大图预览">
    <img id="lightbox-img" src="" alt="">
    <form method="dialog"><button type="submit" class="button secondary small lightbox-close">关闭 (Esc)</button></form>
  </dialog>
</article>`,
  });
}

export function tastePage({ origin, umamiId, topApps = [], stats }) {
  return frame({
    title: '测测你的 Mac 软件品味',
    description: '勾选你 Mac 上正在用的软件，立刻测出你的撞款率、宝藏小众品味，以及全站和你口味最像的真实桌面海报。',
    origin, umamiId, path: '/taste', current: 'taste', main: `
<section class="shell page-head">
  <div>
    <h1>测测你的 Mac 软件品味</h1>
    <p class="lede">勾选你 Mac 上真正在用的软件，看看你和大家有多「撞衫」，哪几款是你的独门宝藏，以及谁的桌面和你最同频。</p>
    ${statLine(stats)}
  </div>
</section>
<section class="shell taste-shell" data-taste-app>
  <div class="taste-toolbar">
    <div class="taste-search-wrap">
      <label class="sr" for="taste-input">添加更多软件</label>
      <input id="taste-input" type="search" maxlength="60" placeholder="搜不到？输入任意软件名回车添加，如 Ghostty" autocomplete="off">
      <button type="button" class="button secondary small" id="taste-add-btn">${glyph('plus')}添加</button>
    </div>
    <div class="taste-summary-bar">
      <span>已选 <strong class="num" id="taste-count">0</strong> 款</span>
      <button type="button" class="button secondary small" id="taste-clear" hidden>清空</button>
      <button type="button" class="button primary" id="taste-submit" disabled>${glyph('sparkles')}生成品味报告</button>
    </div>
  </div>
  <div class="taste-selected" id="taste-selected" aria-live="polite"></div>
  ${topApps.length ? `<div class="taste-picker">
    <h2 class="taste-sub-title">站内热门软件（点选即可）</h2>
    <ul class="taste-grid" id="taste-grid">${topApps.map(app => `<li><button type="button" class="taste-chip" data-taste-chip="${esc(app.name)}" data-taste-key="${esc(app.key)}" data-taste-icon="${esc(app.icon ?? '')}" data-taste-cat="${esc(app.categories?.[0] ?? '效率')}" aria-pressed="false">${appIcon(app, 'sm')}<span>${esc(app.name)}</span></button></li>`).join('')}</ul>
  </div>` : `<div class="empty-note"><h3>站内软件库正在积累中</h3><p>直接在上方的输入框添加你常用的 Mac 软件，也可以测一测并直接做成你的第一张海报。</p></div>`}
  <div id="taste-result" class="taste-result" hidden aria-live="polite"></div>
</section>`,
  });
}

export function studioPage({ origin, umamiId, topApps = [], categories = [], roles = [], stats }) {
  const defaultCats = categories.length ? categories : ['效率', '开发', '写作', 'AI', '设计', '影音', '系统', '沟通'];
  return frame({
    title: '网页制作你的软件海报',
    description: '无需安装工具，在浏览器里选一张桌面壁纸、挑选你的常用 Mac 软件、写下推荐理由，30 秒生成并发布你的专属软件海报。',
    origin, umamiId, path: '/studio', current: 'studio', extraScript: studioAsset, main: `
<section class="shell page-head studio-head">
  <div>
    <h1>网页制作软件海报</h1>
    <p class="lede">直接在浏览器里合成 1600×900 高清海报，复用全站共识图标。如果想自动扫描本机使用记录，也可以使用 <a class="text-link" href="/make">Mac Skill${glyph('arrow')}</a>。</p>
    ${statLine(stats)}
  </div>
</section>
<section class="shell studio-layout" id="studio-root">
  <div class="studio-stage">
    <div class="studio-canvas-wrap">
      <canvas id="studio-canvas" width="1600" height="900" aria-label="软件推荐海报实时预览"></canvas>
    </div>
    <div class="studio-card">
      <h2>1. 背景与海报信息</h2>
      <div class="studio-wallpapers">
        <label class="button secondary small studio-file-btn">${glyph('upload')}上传我的壁纸<input type="file" id="studio-bg-file" accept="image/*" hidden></label>
        <div class="preset-row" role="group" aria-label="内置暗色壁纸">
          <button type="button" class="preset-btn is-active" data-preset="amber" aria-pressed="true">琥珀暗夜</button>
          <button type="button" class="preset-btn" data-preset="ocean" aria-pressed="false">深海暮色</button>
          <button type="button" class="preset-btn" data-preset="forest" aria-pressed="false">松林微光</button>
          <button type="button" class="preset-btn" data-preset="slate" aria-pressed="false">极简碳灰</button>
        </div>
      </div>
      <div class="studio-fields">
        <label><span>海报标题</span><input type="text" id="studio-title" maxlength="34" value="我的 Mac 常用软件" placeholder="例如：2026 独立开发主力清单"></label>
        <label><span>署名</span><input type="text" id="studio-name" maxlength="40" placeholder="你的昵称或网名"></label>
        <label><span>身份标签（可选）</span>
          <input type="text" id="studio-role" maxlength="16" list="studio-role-list" placeholder="如：独立开发者、设计师">
          <datalist id="studio-role-list">${roles.map(r => `<option value="${esc(r)}">`).join('')}</datalist>
        </label>
        <label><span>可见范围</span>
          <select id="studio-visibility">
            <option value="public">发布到公开画廊（计入软件榜票数）</option>
            <option value="link">仅拿到链接的人可见（不计票）</option>
          </select>
        </label>
      </div>
      <div class="actions studio-publish-actions">
        <button type="button" class="button primary" id="studio-publish">${glyph('sparkles')}发布海报</button>
        <button type="button" class="button secondary" id="studio-download">${glyph('download')}仅下载 PNG</button>
      </div>
      <p id="studio-status" class="studio-status" role="status"></p>
    </div>
    <div class="studio-card" id="studio-history-card" hidden>
      <h2>本机发布过的海报（可原地更新或撤回）</h2>
      <ul class="studio-history" id="studio-history"></ul>
    </div>
  </div>
  <div class="studio-sidebar">
    <div class="studio-card">
      <h2>2. 挑选软件（<span class="num" id="studio-app-count">0</span> / 48）</h2>
      <div class="studio-add-row">
        <div class="studio-search-box">
          <input type="search" id="studio-app-search" maxlength="60" placeholder="搜索站内软件或直接输入名称" autocomplete="off">
          <div id="studio-suggest" class="suggest-menu" role="listbox" hidden></div>
        </div>
        <select id="studio-default-cat" aria-label="默认分类">${defaultCats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
        <button type="button" class="button secondary small" id="studio-add-custom">${glyph('plus')}添加</button>
      </div>
      ${topApps.length ? `<div class="studio-quick">
        <p class="studio-quick-label">点选快速加入：</p>
        <div class="studio-quick-chips">${topApps.slice(0, 20).map(app => `<button type="button" class="taste-chip small-chip" data-studio-pick="${esc(JSON.stringify({ name: app.name, key: app.key, group: app.categories?.[0] ?? '效率', icon: app.icon ?? '' }))}">${appIcon(app, 'sm')}<span>${esc(app.name)}</span></button>`).join('')}</div>
      </div>` : ''}
      <ul class="studio-selected-list" id="studio-selected-list"></ul>
    </div>
  </div>
  <script type="application/json" id="studio-cats">${safeJsonScript(defaultCats)}</script>
</section>`,
  });
}

export function makePage({ origin, umamiId, stats }) {
  const steps = [
    ['安装 Skill', `在 Mac 的终端运行下面这条命令。支持 Agent Skills 的助手都能用，比如 Claude Code、Codex。`, installBlock('install-make')],
    ['让助手扫描本机', '对助手说「用我的壁纸和应用图标做一张软件推荐海报」。它按 Spotlight 记录的最近使用天数给出候选，不启动任何应用。', '<p class="say">「扫一下我最近半年常用的软件，先给我看候选」</p>'],
    ['挑软件、写理由', '去掉不想推荐的，补上漏掉的，调整分类。想写的话，给喜欢的几款各写一句推荐理由。', '<p class="say">「去掉微信，加上 Raycast，Raycast 的理由写：一个快捷键搞定剪贴板和窗口」</p>'],
    ['预览后再决定', '海报先在本机生成，满意了再选「只保存」「仅链接分享」或「发布到画廊」。公开海报会给里面每款软件投一票。', '<p class="say">「用『小乔』署名，发布到画廊」</p>'],
  ];
  return frame({
    title: '做一张你的软件海报', description: '在网页 30 秒直接制作，或安装 qiaomu-mac-software Skill 用自己的壁纸和应用图标做一张 Mac 软件推荐海报。', origin, umamiId, path: '/make', current: 'make', main: `
<section class="shell page-head make-head">
  <div><h1>做一张你的软件海报</h1><p class="lede">两种方式任选：网页 30 秒直接做，或者用 Mac Skill 自动扫描本机 Spotlight 真实使用记录。</p>${statLine(stats)}</div>
  <figure class="make-sample"><img src="${demoAsset}" width="1600" height="900" alt="金门大桥桌面背景上的 23 款 Mac 软件推荐示例"><figcaption>示例：桌面壁纸 + 23 款软件</figcaption></figure>
</section>
<section class="shell section-tight">
  <div class="make-tracks">
    <div class="track-card is-highlight">
      <p class="track-eyebrow">推荐新手 · 免安装</p>
      <h2>方式一：网页直接制作</h2>
      <p>上传一张壁纸或选内置暗色背景，直接复用全站共识图标库，30 秒合成高清海报并一键发布，还支持随时原地更新。</p>
      <div class="actions"><a class="button primary" href="/studio">${glyph('plus')}打开网页制作器</a><a class="button secondary" href="/taste">${glyph('sparkles')}先测测软件品味</a></div>
    </div>
    <div class="track-card">
      <p class="track-eyebrow">进阶 · 最真实</p>
      <h2>方式二：安装 Mac Skill</h2>
      <p>适合使用 Claude Code、Codex 等 AI 助手的用户。自动读取本机 Spotlight 活跃天数、提取冷门软件独有图标与当前壁纸。</p>
      ${installBlock('install-top')}
    </div>
  </div>
</section>
<section class="shell section-tight">
  <h2 class="section-sub-heading">Mac Skill 完整步骤</h2>
  <ol class="make-steps">${steps.map(([title, text, extra], i) => `<li><span class="step-num num">${i + 1}</span><div><h2>${title}</h2><p>${text}</p>${extra}</div></li>`).join('')}</ol>
</section>
<section class="shell section" aria-labelledby="data-title">
  <div class="data-split">
    <div><h2 id="data-title">${glyph('shield')}留在本机的</h2><ul class="plain"><li>完整应用清单和安装路径</li><li>每款软件的使用日期和次数</li><li>桌面壁纸原图</li><li>撤回与更新凭证</li></ul></div>
    <div><h2>分享时上传的</h2><ul class="plain"><li>合成后的海报图片（包含壁纸）</li><li>选中软件的名称、分类和你写的推荐理由</li><li>选中软件的 128px 图标，网站已有的不再重复上传</li><li>标题、署名与可选身份标签</li></ul></div>
  </div>
  <p class="fine">详细说明见<a href="/privacy">数据与分享说明</a>。Skill 源码在 <a href="${skill}">GitHub</a>。</p>
</section>`,
  });
}

export function terms({ origin, umamiId }) {
  return frame({
    title: '数据与分享说明', origin, umamiId, path: '/privacy', main: `<article class="shell prose">
<h1>数据与分享说明</h1>
<h2>在你的 Mac 或浏览器上制作</h2><p>使用 Skill 时，脚本只在本地读取应用列表、Spotlight 使用日期和桌面背景，应用路径和使用次数留在本机。使用网页制作器时，上传的壁纸只在你的浏览器 Canvas 本地合成，不会上传原图。</p>
<h2>你选择分享后</h2><p>网站接收合成海报、你选的软件名称与分类、你写的推荐理由、这些软件的 128px 图标与应用标识、标题、署名、可选身份标签和分享范围。网站已经有的图标只发送指纹，不重复上传。壁纸会出现在合成海报中，发布前请选一张适合分享的背景并预览海报。</p>
<h2>软件归并、图标与元数据</h2><p>同一款软件的不同常见别名（如 VS Code 与 Visual Studio Code）或相同 Bundle ID 会自动归并到规范页面，旧链接自动 301 跳转。图标显示被最多公开海报使用的版本。软件的官网、App Store 与 Homebrew Cask 安装信息来自内置精选字典及公开的 Homebrew Cask / Apple iTunes 目录。</p>
<h2>可见范围、更新和撤回</h2><p>公开海报会出现在海报列表、软件榜、RSS 与公开只读 API 中，并给其中的软件计票。仅链接海报只有拿到链接的人能看，不计票。Skill 或浏览器本地保存的凭证可用于随时原地更新（PUT）或撤回（DELETE）海报，撤回后本站停止提供该海报和图片。</p>
<h2>装机清单、点赞与访问统计</h2><p>装机清单保存在浏览器 localStorage 中，无需账号，也不会上传服务器。推荐理由的「写得好」投票仅按访问来源哈希防重复，不影响软件榜票数。本站使用 Umami 统计访问。项目问题请提到 <a href="${issues}">GitHub</a>。</p>
</article>`,
  });
}

export function errorPage({ origin, umamiId, status, message }) {
  return frame({
    title: String(status), origin, umamiId, hidden: true, main: `<article class="shell prose error">
<p class="error-code">${num(status)}</p>
<h1>${esc(message)}</h1>
<p class="empty-links"><a class="text-link" href="/">回首页${glyph('arrow')}</a><a class="text-link" href="/apps">软件榜${glyph('arrow')}</a></p>
</article>`,
  });
}
