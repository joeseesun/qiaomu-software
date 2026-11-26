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
const scanCmd = "ls /Applications | sed 's/\\.app$//'";
const htmlChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, character => htmlChars[character]);
const safeJsonScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const siteDescription = '看看大家的 Mac 里真正在用什么软件。每张海报来自一位真实用户，支持新 Mac 装机向导、软件体检、免费平替与 Homebrew 一键安装。';
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
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
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
const kindLabels = { recommend: '体验点评', tip: '使用技巧', caveat: '避坑提醒' };
const pricingTag = (pricing) => pricing ? `<span class="mini-tag${pricing === '开源免费' ? ' is-foss' : ''}">${esc(pricing)}</span>` : '';

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

function frame({ origin, umamiId, title, description = siteDescription, path = '/', photo = demoAsset, hidden = false, current = '', extraScript = '', jsonLd = null, main }) {
  const fullTitle = title === '乔木软件推荐' ? title + ' · 大家真正在用的 Mac 软件' : title + ' · 乔木软件推荐';
  const analytics = /^[0-9a-f-]{36}$/i.test(umamiId ?? '') ?
    `<script defer src="https://umami.qiaomu.ai/script.js" data-website-id="${esc(umamiId)}" data-domains="${esc(new URL(origin).hostname)}"></script>` : '';
  const ldItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean) : [];
  const ldHtml = ldItems.map(item => `<script type="application/ld+json">${safeJsonScript(item)}</script>`).join('\n');
  const nav = (link, label, key) => `<a href="${link}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0b0d11">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="乔木软件">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(origin + path)}">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="${markAsset}">
<link rel="alternate" type="application/rss+xml" title="乔木软件推荐 RSS" href="${esc(origin)}/feed.xml">
<link rel="alternate" type="text/markdown" title="乔木软件推荐 LLMs.txt" href="${esc(origin)}/llms.txt">
${hidden ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}
<meta property="og:site_name" content="乔木软件推荐">
<meta property="og:locale" content="zh_CN">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(origin + photo)}">
<meta property="og:url" content="${esc(origin + path)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(origin + photo)}">
<link rel="icon" href="${markAsset}" type="image/svg+xml">
<link rel="stylesheet" href="${styleAsset}">
${ldHtml}
<script defer src="${scriptAsset}"></script>
${extraScript ? `<script defer src="${extraScript}"></script>` : ''}
${analytics}
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="/"><img src="${markAsset}" width="28" height="28" alt=""><span>乔木软件推荐</span></a>
    <nav class="main-nav" aria-label="主导航">${nav('/posters', '海报', 'posters')}${nav('/apps', '软件榜', 'apps')}${nav('/setup', '装机包', 'setup')}${nav('/taste', '体检', 'taste')}</nav>
    <form class="header-search" role="search" action="/apps" data-suggest-wrap>
      <label class="sr" for="header-q">搜索软件或需求</label>${glyph('search')}
      <input id="header-q" type="search" name="q" maxlength="60" placeholder="搜软件或需求，如 截图 / 剪贴板" autocomplete="off" aria-autocomplete="list" aria-controls="header-suggest" aria-expanded="false">
      <kbd aria-hidden="true">/</kbd>
      <div id="header-suggest" class="suggest-menu" role="listbox" hidden></div>
    </form>
    <a class="button primary header-make${current === 'make' || current === 'studio' ? ' is-current' : ''}" href="/studio">${glyph('plus')}做一张</a>
  </div>
</header>
<main id="main">${main}</main>
<footer class="site-footer">
  <div class="shell footer-inner">
    <p class="footer-brand"><img src="${markAsset}" width="22" height="22" alt="">乔木软件推荐<span>大家真正在用的 Mac 软件</span></p>
    <nav class="footer-links" aria-label="页脚">
      <a href="/posters">海报</a><a href="/apps">软件榜</a><a href="/alternatives">开源平替</a><a href="/insights">数据洞察</a><a href="/setup">新机装机包</a><a href="/taste">软件体检</a><a href="/compare">软件对比</a><a href="/studio">网页制作</a><a href="/make">Skill 教程</a><a href="/random">随机逛逛</a><a href="/feed.xml">RSS</a><a href="/llms.txt">llms.txt</a><a href="/api/v1/apps">开放 API</a><a href="/privacy">数据与分享说明</a>
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
<dialog id="cmdk-dialog" class="cmdk-dialog" closedby="any" aria-label="快捷命令与全站搜索">
  <div class="cmdk-head">
    ${glyph('search')}
    <input type="search" id="cmdk-input" maxlength="60" placeholder="搜任意 Mac 软件、AI Harness 或痛点需求（如 Paseo / Ollama / 截图）…" autocomplete="off" aria-autocomplete="list" aria-controls="cmdk-results">
    <kbd aria-hidden="true">Esc</kbd>
  </div>
  <div class="cmdk-body" id="cmdk-results" role="listbox"></div>
  <div class="cmdk-foot" aria-hidden="true">
    <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
    <span><kbd>↵</kbd> 打开</span>
    <span><kbd>Esc</kbd> 关闭</span>
  </div>
</dialog>
<div id="site-toast" class="site-toast" role="status" aria-live="polite"></div>
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
  const cat = (app.categories ?? [])[0] ? esc(app.categories[0]) : '';
  const isQuote = Boolean(app.note);
  const blurb = isQuote ? quoted(app.note) : (app.summary ? esc(app.summary) : '');
  return `<a class="app-card" href="${appHref(app.key)}">${appIcon(app, 'lg')}<span class="app-card-body">
  <span class="app-card-top"><span class="app-card-name">${esc(app.name)}</span>${pricingTag(app.pricing)}</span>
  <span class="app-card-meta">${num(app.count)} 张海报${cat ? `<span class="dot" aria-hidden="true">·</span>${cat}` : ''}</span>
  ${blurb ? `<span class="app-card-note${isQuote ? ' is-quote' : ''}">${blurb}</span>` : ''}
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

const statLine = (stats) => `<p class="stat-line">${num(stats.posters)} 张公开海报<span class="dot" aria-hidden="true">·</span>${num(stats.apps)} 款软件${stats.notes ? `<span class="dot" aria-hidden="true">·</span>${num(stats.notes)} 条推荐与技巧` : ''}</p>`;

export function home({ origin, umamiId, stats, popular = [], rising = false, latest = [], categories = [], themes = [], roles = [], featuredReasons = [] }) {
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
      <div class="actions">${featured ? `<a class="button primary" href="/s/${esc(featured.id)}">看这张海报${glyph('arrow')}</a><a class="button secondary" href="/setup">${glyph('zap')}新 Mac 装机包</a><a class="button secondary" href="/taste">${glyph('sparkles')}软件体检</a>` : `<a class="button primary" href="/studio">网页做一张${glyph('arrow')}</a><a class="button secondary" href="/setup">${glyph('zap')}新 Mac 装机包</a>`}</div>
      ${statLine(stats)}
    </div>
    <a class="hero-art" href="${featured ? '/s/' + esc(featured.id) : demoAsset}" aria-label="${featured ? '查看这张海报' : '查看示例海报大图'}"><img src="${heroArt}" alt="${featured ? esc(featured.name + '的推荐海报') : '金门大桥桌面背景上的 23 款 Mac 软件推荐示例'}" width="${featured ? esc(featured.width) : 1600}" height="${featured ? esc(featured.height) : 900}" fetchpriority="high"></a>
  </div>
</section>`;

  const utilityStrip = `<section class="shell utility-strip" aria-label="实用快捷入口">
  <a class="utility-card" href="/setup"><strong>${glyph('zap')}新 Mac 5 分钟装机包</strong><span>6 套场景套餐（含 2026 AI Harness 工作站），一键生成 Brew 装机脚本</span></a>
  <a class="utility-card" href="/alternatives"><strong>${glyph('box')}付费软件开源平替大全</strong><span>37 组热门付费 Mac / AI 工具的 0 元开源平替，一年轻松省下数千元</span></a>
  <a class="utility-card" href="/insights"><strong>${glyph('sparkles')}真实 Mac 生态数据洞察</strong><span>基于真实桌面海报统计装机穿透率、黄金搭档组合与开源/Brew 占比</span></a>
  <a class="utility-card" href="/taste"><strong>${glyph('terminal')}Mac 软件体检 & 查漏补缺</strong><span>粘贴本机应用列表，找出同频高手都在用但你漏掉的神器</span></a>
  <a class="utility-card" href="/compare"><strong>${glyph('scale')}同类软件二选一对比</strong><span>Paseo vs Conductor、Ollama vs LM Studio 等热门软件并排对比</span></a>
  <a class="utility-card" href="/apps?theme=harness"><strong>${glyph('code')}AI Harness & 工具精选</strong><span>一站浏览 30 款 AI Harness 与 100+ 热门 AI 桌面及本地模型工具</span></a>
</section>`;

  const appsSection = popular.length ? `<section class="shell section" aria-labelledby="popular-title">
  <div class="section-head"><div><h2 id="popular-title">${rising ? '最近大家在推荐' : '大家常推荐'}</h2><p>${rising ? '按近 30 天的海报数排序' : '数字是推荐它的公开海报数，一张海报只算一次'}</p></div><div class="head-links"><a class="text-link" href="/apps?sort=gems">小众宝藏${glyph('sparkles')}</a><a class="text-link" href="/apps${rising ? '?sort=rising' : ''}">完整软件榜${glyph('arrow')}</a></div></div>
  <div class="app-grid">${popular.slice(0, 12).map(appCard).join('')}</div>
</section>` : `<section class="shell section" aria-labelledby="popular-title">
  <div class="section-head"><div><h2 id="popular-title">大家常推荐</h2></div></div>
  <div class="empty-note"><h3>软件榜还空着</h3><p>第一张公开海报发布后，里面的软件会出现在这里，并按被推荐的次数排名。</p><a class="text-link" href="/studio">做第一张海报${glyph('arrow')}</a></div>
</section>`;

  const reasonsSection = featuredReasons.length ? `<section class="shell section" aria-labelledby="quotes-title">
  <div class="section-head"><div><h2 id="quotes-title">大家写的走心理由</h2><p>真人写的一句话种草与避坑技巧，比介绍页更直接</p></div><a class="text-link" href="/random">${glyph('shuffle')}随机逛逛</a></div>
  <ul class="quote-grid">${featuredReasons.map(r => `<li class="quote-card">
    <a class="quote-app" href="${appHref(r.app_key)}">${appIcon({ name: r.app_name, icon: r.icon }, 'md')}<span><strong>${esc(r.app_name)}</strong>${r.votes ? `<span class="quote-votes">${glyph('thumb')}${num(r.votes)}</span>` : ''}</span></a>
    <blockquote><p>${quoted(r.note)}</p></blockquote>
    <p class="reason-by">${r.id ? `${authorLink(r.author)}<span class="dot" aria-hidden="true">·</span><a href="/s/${esc(r.id)}">${esc(r.title)}</a>` : `<span class="author">${esc(r.author)}</span><span class="dot" aria-hidden="true">·</span>${esc(kindLabels[r.kind] ?? '体验点评')}`}</p>
  </li>`).join('')}</ul>
</section>` : '';

  const shelfSection = shelf.length ? `<section class="section shelf-section" aria-labelledby="latest-title">
  <div class="shell section-head"><div><h2 id="latest-title">最近发布</h2><p>${num(stats.posters)} 张公开海报</p></div><a class="text-link" href="/posters">全部海报${glyph('arrow')}</a></div>
  <div class="shelf" tabindex="0" aria-label="最近发布的海报，可横向滚动">${shelf.map(row => posterCard(row)).join('')}</div>
</section>` : '';

  const needShortcuts = ['截图', '剪贴板', '翻译', '窗口分屏', '菜单栏', '外接显示器', '防休眠', '卸载清理', '解压', 'Docker'];
  const catSection = (themes.length || categories.length || roles.length) ? `<section class="shell section" aria-labelledby="cat-title">
  <div class="section-head"><div><h2 id="cat-title">按场景、需求或身份找软件</h2><p>直接点痛点关键词，或按标准场景主题浏览</p></div><a class="text-link" href="/apps">全部软件${glyph('arrow')}</a></div>
  ${themes.length ? `<ul class="cat-cloud role-cloud">${themes.map(t => `<li><a class="role-chip" href="${href('/apps', { theme: t.id })}"><span>${esc(t.name)}</span>${num(t.count)}</a></li>`).join('')}</ul>` : ''}
  <ul class="cat-cloud need-cloud">${needShortcuts.map(kw => `<li><a href="${href('/apps', { q: kw })}"><span>找「${esc(kw)}」</span></a></li>`).join('')}</ul>
  ${roles.length ? `<ul class="cat-cloud role-cloud">${roles.map(r => `<li><a href="${href('/posters', { role: r.name })}"><span>${esc(r.name)}的桌面</span>${num(r.count)}</a></li>`).join('')}</ul>` : ''}
</section>` : '';

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '乔木软件推荐',
      alternateName: 'Qiaomu Mac Software Recommendations',
      url: origin + '/',
      inLanguage: 'zh-CN',
      description: siteDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: origin + '/apps?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '乔木软件推荐',
      url: origin + '/',
      logo: origin + markAsset,
      sameAs: ['https://x.com/vista8', 'https://github.com/joeseesun/qiaomu-software'],
    },
    ...(popular.length ? [{
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '大家真正在用的热门 Mac 软件榜',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: Math.min(12, popular.length),
      itemListElement: popular.slice(0, 12).map((a, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: a.name,
        url: origin + appHref(a.key),
      })),
    }] : []),
  ];

  return frame({
    title: '乔木软件推荐', origin, umamiId, current: 'home', photo: featured ? image(featured.id) : demoAsset, jsonLd: homeJsonLd, main: `${hero}
${utilityStrip}
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
      <p>不用装 Skill！直接在网页点选大家提交过的软件、从 20 张高清壁纸挑一张、填上名字 30 秒生成同款海报；也支持 Mac Skill 自动扫描本机 Spotlight 使用记录。</p>
      <div class="actions"><a class="button primary" href="/studio">${glyph('plus')}网页直接制作</a><a class="button secondary" href="/make">Mac Skill 完整教程${glyph('arrow')}</a></div>
    </div>
    <div class="make-install"><p class="command-label">${glyph('terminal')}或者在 Mac 终端安装 Skill</p>${installBlock()}</div>
  </div>
</section>`;
}

export function galleryPage({ origin, umamiId, shares, q = '', app = '', category = '', role = '', author = '', source = '', roles = [], page = 1, stats }) {
  const filtered = Boolean(q || app || category || role || author || source);
  const sourceLabels = { skill: 'Mac 本机扫描', web: '网页制作' };
  const chips = [
    author ? chip('作者', author, href('/posters', { q, app, category, role, source })) : '',
    role ? chip('身份', role, href('/posters', { q, app, category, author, source })) : '',
    source ? chip('来源', sourceLabels[source], href('/posters', { q, app, category, role, author })) : '',
    app ? chip('软件', app, href('/posters', { q, category, role, author, source })) : '',
    category ? chip('分类', category, href('/posters', { q, app, role, author, source })) : '',
    q ? chip('搜索', q, href('/posters', { app, category, role, author, source })) : '',
  ].filter(Boolean);
  const empty = filtered || page > 1 ?
    `<div class="empty-note"><h3>没有匹配的海报</h3><p>换个软件名、作者名、身份或海报标题试试，也可以去软件榜按分类找。</p><p class="empty-links"><a class="text-link" href="/posters">查看全部海报${glyph('arrow')}</a><a class="text-link" href="/apps">软件榜${glyph('arrow')}</a></p></div>` :
    `<div class="empty-note"><h3>还没有公开海报</h3><p>发布时选择「发布到画廊」，海报就会出现在这里。</p><a class="text-link" href="/studio">做第一张海报${glyph('arrow')}</a></div>`;
  const heading = author ? `${author} 的推荐海报` : '推荐海报';
  const roleBar = roles.length ? `<ul class="role-bar" aria-label="按身份筛选">
    <li><a href="${href('/posters', { q, app, category, author, source })}"${role ? '' : ' aria-current="page"'}>全部身份</a></li>
    ${roles.map(r => `<li><a href="${href('/posters', { q, app, category, author, source, role: r.name })}"${r.name === role ? ' aria-current="page"' : ''}>${esc(r.name)} ${num(r.count)}</a></li>`).join('')}
  </ul>` : '';
  const sourceNav = `<nav class="segmented" aria-label="按制作来源筛选">
    <a href="${href('/posters', { q, app, category, role, author })}"${source === '' ? ' aria-current="true"' : ''}>全部来源</a>
    <a href="${href('/posters', { q, app, category, role, author, source: 'skill' })}"${source === 'skill' ? ' aria-current="true"' : ''}>Mac 本机扫描</a>
    <a href="${href('/posters', { q, app, category, role, author, source: 'web' })}"${source === 'web' ? ' aria-current="true"' : ''}>网页制作</a>
  </nav>`;
  return frame({
    title: heading, origin, umamiId, path: '/posters', current: 'posters', hidden: Boolean(filtered || page !== 1),
    description: '大家公开分享的 Mac 软件推荐海报，可以按软件、作者、身份或标题查找。', main: `
<section class="shell page-head">
  <div><h1>${esc(heading)}</h1><p class="lede">${author ? `共找到这位作者公开发布的 Mac 软件推荐海报。` : '每一张都来自一位用户自己的 Mac：真实壁纸、真实图标、亲手挑的软件。'}</p>${statLine(stats)}</div>
  <form class="search" role="search" action="/posters"><label for="posters-q">搜索海报</label><div class="search-row"><input id="posters-q" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="软件名、作者或标题" autocomplete="off">${app ? `<input type="hidden" name="app" value="${esc(app)}">` : ''}${category ? `<input type="hidden" name="category" value="${esc(category)}">` : ''}${role ? `<input type="hidden" name="role" value="${esc(role)}">` : ''}${author ? `<input type="hidden" name="author" value="${esc(author)}">` : ''}${source ? `<input type="hidden" name="source" value="${esc(source)}">` : ''}<button type="submit" class="button primary">${glyph('search')}搜索</button></div></form>
</section>
<section class="shell section-tight" aria-label="海报列表">
  <div class="posters-toolbar">${roleBar}${sourceNav}</div>
  ${chips.length ? `<div class="filters" role="group" aria-label="当前筛选">${chips.join('')}${chips.length > 1 ? '<a class="text-link" href="/posters">全部清除</a>' : ''}</div>` : ''}
  ${shares.length ? `<div class="poster-grid">${shares.slice(0, 24).map(row => posterCard(row)).join('')}</div>` : empty}
  ${pager(page, shares.length > 24 && page < 167, number => href('/posters', { q, app, category, role, author, source, page: number }))}
</section>`,
  });
}

export function appsPage({ origin, umamiId, apps = [], curatedMatches = [], categories = [], themes = [], q = '', category = '', theme = '', pricing = '', brew = false, hideSystem = false, sort = 'top', page = 1, hasNext = false, stats }) {
  const filtered = Boolean(q || category || theme || pricing || brew || hideSystem || sort !== 'top');
  const sorts = [['top', '总榜'], ['rising', '最近升温'], ['new', '新上榜'], ['gems', '小众宝藏']];
  const baseParams = (override = {}) => ({
    q, category, theme, pricing,
    brew: brew ? '1' : '',
    hide_system: hideSystem ? '1' : '',
    sort: sort === 'top' ? '' : sort,
    ...override,
  });
  const catUrl = (name) => href('/apps', baseParams({ category: name, theme: '', page: '' }));
  const themeUrl = (id) => href('/apps', baseParams({ theme: id, category: '', page: '' }));
  const activeThemeName = themes.find(t => t.id === theme)?.name ?? '';

  const catNav = (themes.length || categories.length) ? `<nav class="cats" aria-label="软件场景与分类">
      ${themes.length ? `<h2 class="cats-title">标准场景</h2>
      <ul class="cats-group">
        <li><a href="${themeUrl('')}"${!theme && !category ? ' aria-current="page"' : ''}><span class="cat-name">全部软件</span>${num(stats.apps)}</a></li>
        ${themes.map(t => `<li><a href="${themeUrl(t.id)}"${t.id === theme ? ' aria-current="page"' : ''}><span class="cat-name">${esc(t.name)}</span>${num(t.count)}</a></li>`).join('')}
      </ul>` : ''}
      ${categories.length ? `<h2 class="cats-title cats-title-sub">作者分类</h2>
      <ul>
        ${categories.slice(0, 24).map(c => `<li><a href="${catUrl(c.name)}"${c.name === category ? ' aria-current="page"' : ''}><span class="cat-name">${esc(c.name)}</span>${num(c.count)}</a></li>`).join('')}
      </ul>` : ''}
    </nav>` : '';

  const pricingLabels = { foss: '开源免费', free: '免费可用', paid: '付费软件' };
  const chips = [
    activeThemeName ? chip('场景', activeThemeName, href('/apps', baseParams({ theme: '' }))) : '',
    category ? chip('分类', category, href('/apps', baseParams({ category: '' }))) : '',
    pricing ? chip('价格', pricingLabels[pricing], href('/apps', baseParams({ pricing: '' }))) : '',
    brew ? chip('安装', '仅看支持 Brew', href('/apps', baseParams({ brew: '' }))) : '',
    hideSystem ? chip('范围', '已隐藏系统自带', href('/apps', baseParams({ hide_system: '' }))) : '',
    q ? chip('搜索', q, href('/apps', baseParams({ q: '' }))) : '',
  ].filter(Boolean);

  const offset = (page - 1) * 24;
  const row = (app, index) => {
    const line = app.note ? quoted(app.note) : (app.summary ? esc(app.summary) : '');
    return `<li class="rank-row">
      <span class="rank num">${esc(String(offset + index + 1).padStart(2, '0'))}</span>
      ${appIcon(app, 'md')}
      <div class="rank-main">
        <div class="rank-title-row">
          <h3><a href="${appHref(app.key)}">${esc(app.name)}</a></h3>
          ${pricingTag(app.pricing)}
          ${app.cask ? '<span class="mini-tag is-brew">brew</span>' : ''}
        </div>
        ${(app.categories ?? []).length ? `<p class="rank-cats"><span class="sr">分类：</span>${app.categories.slice(0, 3).map(c => `<a href="${catUrl(c)}">${esc(c)}</a>`).join('')}</p>` : ''}
        ${line ? `<p class="rank-note">${line}</p>` : ''}
      </div>
      <div class="rank-end">
        <p class="rank-count">${num(app.count)}<span>张海报</span></p>
        ${kitButton(app)}
      </div>
    </li>`;
  };
  const empty = filtered || page > 1 ?
    `<div class="empty-note"><h3>没有找到匹配的软件</h3><p>${q ? `还没有公开海报匹配「${esc(q)}」。` : '当前筛选条件下还没有软件。'}可以清除部分筛选条件，或者把它做进你的海报。</p><p class="empty-links"><a class="text-link" href="/apps">查看全部软件${glyph('arrow')}</a><a class="text-link" href="/studio">做一张海报${glyph('arrow')}</a></p></div>` :
    `<div class="empty-note"><h3>软件榜还空着</h3><p>第一张公开海报发布后，里面的软件和分类会出现在这里。</p><a class="text-link" href="/studio">做第一张海报${glyph('arrow')}</a></div>`;
  const sortNotes = {
    rising: '按近 30 天推荐它的海报数排序。',
    new: '按第一次被推荐的时间排序。',
    gems: '优先展示推荐数偏小众、但有人写过推荐理由或技巧的宝藏软件。',
  };

  const appsJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: activeThemeName ? `${activeThemeName} Mac 软件推荐榜` : 'Mac 软件推荐榜',
      url: origin + '/apps',
      inLanguage: 'zh-CN',
      description: '基于真实 Mac 用户公开桌面海报投票统计的软件推荐榜单，支持按开源免费、Homebrew、场景主题和痛点需求检索。',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: '软件榜', item: origin + '/apps' },
      ],
    },
    ...(apps.length ? [{
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: activeThemeName ? `${activeThemeName} Mac 软件榜` : '热门 Mac 软件榜',
      numberOfItems: apps.length,
      itemListElement: apps.slice(0, 20).map((a, idx) => ({
        '@type': 'ListItem',
        position: offset + idx + 1,
        url: origin + appHref(a.key),
        name: a.name,
      })),
    }] : []),
  ];

  const isIndexableThemeLanding = Boolean(!q && !category && !brew && !hideSystem && sort === 'top' && page === 1 && (theme || pricing === 'foss'));
  const appsCanonicalPath = isIndexableThemeLanding
    ? href('/apps', { theme, pricing })
    : '/apps';

  return frame({
    title: activeThemeName ? `${activeThemeName} Mac 软件推荐` : pricing === 'foss' ? '开源免费 Mac 软件精选' : '软件榜',
    description: activeThemeName
      ? `真实 Mac 用户公开海报投票选出的热门「${activeThemeName}」软件排行，含定价、Homebrew 一键安装与免费平替。`
      : '大家公开推荐过的 Mac 软件，支持按开源免费、Homebrew、场景主题和痛点需求检索。',
    origin, umamiId, path: appsCanonicalPath, current: 'apps',
    hidden: Boolean((filtered && !isIndexableThemeLanding) || page !== 1),
    jsonLd: appsJsonLd, main: `
<section class="shell page-head">
  <div><h1>软件榜</h1><p class="lede">一张公开海报算一票。支持直接搜需求痛点（如「截图」「剪贴板」「外接显示器」），也可按开源免费、Homebrew 精准筛选。</p></div>
  <form class="search" role="search" action="/apps"><label for="apps-q">搜软件名或痛点需求</label><div class="search-row"><input id="apps-q" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="例如 Raycast、截图、剪贴板" autocomplete="off">${category ? `<input type="hidden" name="category" value="${esc(category)}">` : ''}${theme ? `<input type="hidden" name="theme" value="${esc(theme)}">` : ''}${pricing ? `<input type="hidden" name="pricing" value="${esc(pricing)}">` : ''}${brew ? '<input type="hidden" name="brew" value="1">' : ''}${hideSystem ? '<input type="hidden" name="hide_system" value="1">' : ''}${sort !== 'top' ? `<input type="hidden" name="sort" value="${esc(sort)}">` : ''}<button type="submit" class="button primary">${glyph('search')}搜索</button></div></form>
</section>
<div class="shell directory${catNav ? '' : ' no-cats'}">
  ${catNav}
  <section class="index" aria-labelledby="index-title">
    <div class="index-head">
      <h2 id="index-title">${activeThemeName ? esc(activeThemeName) : category ? `<span class="sr">分类：</span>${esc(category)}` : '全部软件'}</h2>
      <div class="index-controls">
        <nav class="segmented" aria-label="排序">${sorts.map(([key, label]) => `<a href="${href('/apps', baseParams({ sort: key === 'top' ? '' : key, page: '' }))}"${sort === key ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</nav>
        <a class="button secondary small" href="/compare">${glyph('scale')}软件对比</a>
        <a class="button secondary small" href="/random" title="随机发现一款有推荐理由的软件">${glyph('shuffle')}随机逛逛</a>
      </div>
    </div>
    <div class="decision-bar" aria-label="快捷决策筛选">
      <a class="filter-pill${pricing === '' ? ' is-on' : ''}" href="${href('/apps', baseParams({ pricing: '', page: '' }))}">全部价格</a>
      <a class="filter-pill${pricing === 'foss' ? ' is-on' : ''}" href="${href('/apps', baseParams({ pricing: pricing === 'foss' ? '' : 'foss', page: '' }))}">开源免费</a>
      <a class="filter-pill${pricing === 'free' ? ' is-on' : ''}" href="${href('/apps', baseParams({ pricing: pricing === 'free' ? '' : 'free', page: '' }))}">免费可用</a>
      <a class="filter-pill${pricing === 'paid' ? ' is-on' : ''}" href="${href('/apps', baseParams({ pricing: pricing === 'paid' ? '' : 'paid', page: '' }))}">付费 / Setapp</a>
      <span class="filter-sep" aria-hidden="true"></span>
      <a class="filter-pill${brew ? ' is-on' : ''}" href="${href('/apps', baseParams({ brew: brew ? '' : '1', page: '' }))}">仅看支持 Brew</a>
      <a class="filter-pill${hideSystem ? ' is-on' : ''}" href="${href('/apps', baseParams({ hide_system: hideSystem ? '' : '1', page: '' }))}">隐藏系统自带</a>
    </div>
    ${chips.length ? `<div class="filters" role="group" aria-label="当前筛选">${chips.join('')}${chips.length > 1 ? '<a class="text-link" href="/apps">全部清除</a>' : ''}</div>` : ''}
    ${sortNotes[sort] ? `<p class="index-note">${sortNotes[sort]}</p>` : ''}
    ${apps.length ? `<ol class="rank-list">${apps.map(row).join('')}</ol>` : (curatedMatches.length ? '' : empty)}
    ${curatedMatches.length ? `<section class="curated-supplement" aria-labelledby="curated-title">
      <div class="section-head"><div><h3 id="curated-title">站内精选收录（等你投出第 1 票）</h3><p>这些热门软件已收录真实图标与信息，暂未有人放进公开海报</p></div></div>
      <div class="curated-grid">${curatedMatches.map(a => `<div class="curated-card">
        <a class="curated-card-main" href="${appHref(a.key)}">${appIcon(a, 'md')}<div class="curated-card-body"><strong>${esc(a.name)} ${pricingTag(a.pricing)}${a.cask ? ' <span class="mini-tag is-brew">brew</span>' : ''}</strong>${a.summary ? `<p>${esc(a.summary)}</p>` : ''}</div></a>
        <a class="button secondary small" href="/studio?add=${encodeURIComponent(a.key)}">${glyph('plus')}投第 1 票</a>
      </div>`).join('')}</div>
    </section>` : ''}
    ${pager(page, hasNext, number => href('/apps', baseParams({ page: number })))}
  </section>
</div>`,
  });
}

export function appPage({ origin, umamiId, app, categories = [], reasons = [], reviews = [], together = [], alternatives = [], freeAlternatives = [], posters = [] }) {
  const description = `${app.name} 被 ${app.count} 张公开海报推荐。${app.summary ? app.summary + '。' : ''}看看大家为什么用它，以及免费替代和常一起出现的软件。`;
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

  const posterReasonItems = reasons.map(r => `<li class="reason">
      ${glyph('quote')}
      <div class="reason-body">
        <blockquote><p>${quoted(r.note)}</p></blockquote>
        <div class="reason-foot">
          <p class="reason-by"><span class="mini-tag is-brew">来自海报</span> ${authorLink(r.author)}${r.role ? `<span class="dot" aria-hidden="true">·</span>${rolePill(r.role)}` : ''}<span class="dot" aria-hidden="true">·</span><a href="/s/${esc(r.id)}">${esc(r.title)}</a><span class="dot" aria-hidden="true">·</span>${esc(ago(r.created))}</p>
          <button type="button" class="vote-btn" data-vote-reason data-share-id="${esc(r.id)}" data-app-key="${esc(app.key)}" aria-pressed="false" title="觉得这条推荐理由有帮助">${glyph('thumb')}<span>写得好</span><span class="vote-num num">${esc(r.votes || 0)}</span></button>
        </div>
      </div>
    </li>`);

  const communityReviewItems = reviews.map(r => `<li class="reason">
      ${glyph('quote')}
      <div class="reason-body">
        <blockquote><p>${quoted(r.note)}</p></blockquote>
        <div class="reason-foot">
          <p class="reason-by"><span class="mini-tag">${esc(kindLabels[r.kind] ?? '体验点评')}</span> <span class="author">${esc(r.author)}</span><span class="dot" aria-hidden="true">·</span>${esc(ago(r.created))}</p>
          <button type="button" class="vote-btn" data-vote-review data-review-id="${esc(r.id)}" aria-pressed="false" title="觉得这条经验有帮助">${glyph('thumb')}<span>有帮助</span><span class="vote-num num">${esc(r.votes || 0)}</span></button>
        </div>
      </div>
    </li>`);

  const allNotes = [...posterReasonItems, ...communityReviewItems];
  const reasonList = `<ul class="reasons" id="app-reasons-list">${allNotes.join('')}</ul>${allNotes.length ? '' : `<div class="empty-note" id="reasons-empty"><h3>还没有人写推荐理由或使用技巧</h3><p>在下方直接补一句你的真实体验，或者做海报时写上推荐理由。</p></div>`}`;

  const reviewForm = `<form class="review-form" data-review-form="/api/v1/apps/${encodeURIComponent(app.key)}/reviews">
    <h3>我也用过 · 补一句真实体验或避坑技巧</h3>
    <p class="review-hint">限 4–60 字，立刻展示给后来者参考（不影响软件榜票数，榜单票数只由公开海报计票）。</p>
    <div class="review-row">
      <select name="kind" aria-label="类型">
        <option value="tip">使用技巧</option>
        <option value="recommend">体验点评</option>
        <option value="caveat">避坑提醒</option>
      </select>
      <input type="text" name="author" maxlength="24" placeholder="署名（可选，默认匿名）">
    </div>
    <div class="review-row-main">
      <input type="text" name="note" required minlength="4" maxlength="60" placeholder="例如：把快捷键改成 Option+Space 后，顺手程度翻倍">
      <button type="submit" class="button primary small">发布补充</button>
    </div>
    <output role="status" class="review-status"></output>
  </form>`;

  const freeAltSection = freeAlternatives.length ? `<section aria-labelledby="free-alt-title">
    <h2 id="free-alt-title">免费 / 开源平替</h2>
    <p class="section-sub">预算有限或偏好开源时的直接替代方案</p>
    <ul class="together">${freeAlternatives.map(a => `<li class="aside-row">
      <a class="aside-main" href="${a.inCatalog ? appHref(a.key) : esc(a.homepage || '/apps?q=' + encodeURIComponent(a.name))}"${a.inCatalog ? '' : ' target="_blank" rel="noopener noreferrer"'}>${appIcon(a, 'md')}<span class="together-name"><strong>${esc(a.name)}</strong> ${pricingTag(a.pricing || '免费')}${a.summary ? `<span class="aside-desc">${esc(a.summary)}</span>` : ''}</span></a>
      ${a.inCatalog ? `<a class="compare-mini" href="${href('/compare', { a: app.key, b: a.key })}" title="并排对比">对比</a>` : ''}
    </li>`).join('')}</ul>
  </section>` : '';

  const faqItems = [
    {
      q: `${app.name} 是什么软件？有多少 Mac 用户在用？`,
      a: `${app.name}${app.summary ? '：' + app.summary + '。' : ' 是一款 Mac 软件。'}在「乔木软件推荐」社区中，它已被 ${app.count} 张真实用户的公开桌面海报推荐${categories.length ? `，常归类于「${categories.slice(0, 2).map(c => c.name).join(' / ')}」` : ''}。`,
    },
    ...(app.pricing || brewCmd ? [{
      q: `${app.name} 免费吗？怎么在 Mac 上安装？`,
      a: `${app.pricing ? `定价模式为「${app.pricing}」。` : ''}${brewCmd ? `支持在 macOS 终端通过 Homebrew 一键安装：${brewCmd}` : app.homepage ? `可直接访问官网下载安装：${app.homepage}` : '可通过官方渠道或 App Store 安装。'}`,
    }] : []),
    ...(freeAlternatives.length ? [{
      q: `${app.name} 有哪些免费或开源平替？`,
      a: `社区常用的免费 / 开源替代方案包括：${freeAlternatives.map(a => `${a.name}（${a.pricing || '免费'}）`).join('、')}。`,
    }] : []),
    ...(together.length ? [{
      q: `使用 ${app.name} 的人通常还装了哪些 Mac 软件？`,
      a: `和 ${app.name} 最常同时出现在同一台 Mac 桌面上的软件包括：${together.slice(0, 5).map(t => t.name).join('、')}。`,
    }] : []),
  ];

  const isFreeApp = ['开源免费', '免费', '系统自带'].includes(app.pricing);
  const appJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: app.name,
      operatingSystem: 'macOS',
      applicationCategory: categories[0]?.name || 'UtilitiesApplication',
      url: appUrl,
      ...(app.homepage ? { sameAs: app.homepage } : {}),
      ...(app.summary ? { description: app.summary } : {}),
      ...(app.icon ? { image: origin + iconUrl(app.icon) } : {}),
      ...(app.pricing ? {
        offers: {
          '@type': 'Offer',
          price: isFreeApp ? '0' : undefined,
          priceCurrency: isFreeApp ? 'USD' : undefined,
          description: app.pricing,
        },
      } : {}),
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: Number(app.count) || 0,
      },
      ...(reasons.length ? {
        review: reasons.slice(0, 5).map(r => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.author },
          reviewBody: r.note,
          datePublished: new Date(r.created).toISOString().slice(0, 10),
        })),
      } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: '软件榜', item: origin + '/apps' },
        { '@type': 'ListItem', position: 3, name: app.name, item: appUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ];

  const faqSection = `<section class="app-faq" aria-labelledby="faq-title">
    <h2 id="faq-title">快速结论与常见问题</h2>
    <dl class="faq-list">${faqItems.map(item => `<div class="faq-item"><dt>${esc(item.q)}</dt><dd>${esc(item.a)}</dd></div>`).join('')}</dl>
  </section>`;

  return frame({
    title: app.name, description, origin, umamiId, path: '/apps/' + encodeURIComponent(app.key), current: 'apps',
    photo: '/og/apps/' + encodeURIComponent(app.key) + '.png', jsonLd: appJsonLd, main: `
<article class="shell app-page">
  <nav class="crumbs" aria-label="返回"><a href="/apps">${glyph('back')}软件榜</a></nav>
  <header class="app-hero">
    ${appIcon(app, 'xl')}
    <div class="app-hero-copy">
      <div class="app-hero-title"><h1>${esc(app.name)}</h1>${app.pricing ? `<span class="pricing-pill${app.pricing === '开源免费' ? ' is-foss' : ''}">${esc(app.pricing)}</span>` : ''}</div>
      ${app.summary ? `<p class="app-summary">${esc(app.summary)}</p>` : ''}
      <p class="app-hero-count">${app.curatedOnly ? '站内精选收录 · 等待第一张公开海报投票' : `被 ${num(app.count)} 张公开海报推荐<span class="dot" aria-hidden="true">·</span>最早 ${esc(date.format(app.first))}`}</p>
      <ul class="app-cats">${categories.map(c => `<li><a href="${c.themeId ? href('/apps', { theme: c.themeId }) : href('/apps', { category: c.name })}">${esc(c.name)}${c.count ? `<span class="num">${esc(c.count)}</span>` : ''}</a></li>`).join('')}</ul>
      ${app.bundle && !app.bundle.startsWith('cli:') ? `<p class="bundle"><span class="sr">应用标识：</span><code>${esc(app.bundle)}</code></p>` : ''}
      ${metaStrip}
    </div>
    <div class="actions app-hero-actions">
      ${app.curatedOnly
        ? `<a class="button primary" href="/studio?add=${encodeURIComponent(app.key)}">${glyph('sparkles')}加入海报 · 投第 1 票</a>`
        : `<a class="button primary" href="${href('/posters', { app: app.key })}">看推荐它的海报${glyph('arrow')}</a>`}
      ${kitButton(app, { label: true })}
      <a class="button secondary" href="${href('/compare', { a: app.key })}">${glyph('scale')}找同类对比</a>
    </div>
  </header>
  <div class="app-columns">
    <section aria-labelledby="reasons-title"><h2 id="reasons-title">大家怎么说</h2>${reasonList}${reviewForm}</section>
    <aside class="app-aside">
      ${freeAltSection}
      ${together.length ? `<section aria-labelledby="together-title"><h2 id="together-title">常一起被推荐</h2><p class="section-sub">和 ${esc(app.name)} 出现在同一张海报的次数</p>
        <ul class="together">${together.map(t => `<li><a href="${appHref(t.key)}">${appIcon(t, 'md')}<span class="together-name">${esc(t.name)}</span><span class="together-count">${num(t.count)}</span></a></li>`).join('')}</ul></section>` : ''}
      ${alternatives.length ? `<section class="alt-section" aria-labelledby="alt-title"><h2 id="alt-title">同分类其他选择</h2><p class="section-sub">在同类场景下大家还推荐了这些软件</p>
        <ul class="together">${alternatives.map(a => `<li class="aside-row"><a class="aside-main" href="${appHref(a.key)}">${appIcon(a, 'md')}<span class="together-name">${esc(a.name)}${a.pricing ? ` ${pricingTag(a.pricing)}` : ''}</span><span class="together-count">${num(a.count)}</span></a><a class="compare-mini" href="${href('/compare', { a: app.key, b: a.key })}">对比</a></li>`).join('')}</ul></section>` : ''}
    </aside>
  </div>
  ${posters.length ? `<section class="app-posters" aria-labelledby="posters-title">
    <div class="section-head"><div><h2 id="posters-title">出现在这些海报里</h2></div>${posters.length >= 12 ? `<a class="text-link" href="${href('/posters', { app: app.key })}">全部${glyph('arrow')}</a>` : ''}</div>
    <div class="poster-grid">${posters.map(row => posterCard(row)).join('')}</div>
  </section>` : `<section class="app-posters"><div class="empty-note"><h3>还没有公开海报推荐 ${esc(app.name)}</h3><p>你正在用它吗？点一下把它放进你的 Mac 软件海报，为它投出站内第 1 票。</p><a class="text-link" href="/studio?add=${encodeURIComponent(app.key)}">立刻把它放进我的海报${glyph('arrow')}</a></div></section>`}
  ${faqSection}
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

export function setupPage({ origin, umamiId, packs = [], stats }) {
  const setupJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: '新 Mac 5 分钟装机指南（Homebrew 自动装机脚本）',
    description: '按场景选择社区投票最高的 Mac 软件套餐，一键生成带 Homebrew 自动检测的终端批量安装脚本或 Brewfile。',
    totalTime: 'PT5M',
    step: [
      { '@type': 'HowToStep', name: '选择场景装机套餐', text: '在全站 Top 15、新 Mac 必装基础包、AI & 独立开发全家桶、写作套件或纯开源全家桶中选一套起点。' },
      { '@type': 'HowToStep', name: '微调勾选要安装的软件', text: '根据个人需求勾选或取消软件，右侧实时同步 Homebrew Cask 批量安装命令。' },
      { '@type': 'HowToStep', name: '粘贴到终端一键执行', text: '复制一键终端命令或下载 setup-mac.sh / Brewfile 在 macOS 终端中运行，未安装 Homebrew 会自动先安装。' },
    ],
  };
  return frame({
    title: '新 Mac 5 分钟装机包',
    description: '按场景挑选新 Mac 必装软件，一键生成自动安装 Homebrew 与批量 Cask 的终端脚本或 Brewfile。',
    origin, umamiId, path: '/setup', current: 'setup', jsonLd: setupJsonLd, main: `
<section class="shell page-head">
  <div>
    <h1>新 Mac 5 分钟装机包</h1>
    <p class="lede">刚买新 Mac 或重装系统？选一套场景套餐，微调勾选，一键生成完整终端装机脚本（没装 Homebrew 会自动先装）。</p>
    ${statLine(stats)}
  </div>
</section>
<section class="shell setup-shell" data-setup-app>
  <div class="setup-packs" role="tablist" aria-label="装机套餐">${packs.map((p, idx) => `
    <button type="button" class="setup-pack-btn${idx === 0 ? ' is-active' : ''}" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}" data-setup-pack="${esc(p.id)}">
      <strong>${esc(p.name)}</strong>
      <span>${esc(p.desc)}</span>
      <em class="num">${p.items.length} 款软件</em>
    </button>`).join('')}
  </div>
  <div class="setup-workspace">
    <div class="setup-picker-col">
      <div class="setup-col-head">
        <h2>勾选要安装的软件（已选 <span class="num" id="setup-selected-count">0</span> 款）</h2>
        <div class="actions">
          <button type="button" class="button secondary small" id="setup-select-all">全选当前套餐</button>
          <button type="button" class="button secondary small" id="setup-clear">清空</button>
        </div>
      </div>
      <ul class="setup-items" id="setup-items"></ul>
    </div>
    <div class="setup-output-col">
      <div class="studio-card">
        <h2>一键终端装机命令</h2>
        <p class="kit-sub">自动检测是否已安装 Homebrew，再批量安装已选的支持 Cask 的软件。</p>
        <div class="command-terminal">
          <div class="command-terminal-bar">
            <span>macOS Terminal · bash / zsh</span>
            <button type="button" class="button primary small" id="setup-copy-cmd">${glyph('copy')}复制命令</button>
          </div>
          <pre><code id="setup-oneliner"></code></pre>
        </div>
        <div class="actions">
          <button type="button" class="button secondary small" id="setup-download-sh">${glyph('download')}下载 setup-mac.sh</button>
          <button type="button" class="button secondary small" id="setup-download-brewfile">${glyph('download')}下载 Brewfile</button>
          <button type="button" class="button secondary small" id="setup-to-kit">${glyph('box')}存入装机清单</button>
          <button type="button" class="button secondary small" id="setup-to-studio">${glyph('sparkles')}做成海报</button>
        </div>
      </div>
      <div class="studio-card" id="setup-manual-card" hidden>
        <h2>需官网 / App Store 手动下载</h2>
        <ul class="setup-manual-list" id="setup-manual-list"></ul>
      </div>
    </div>
  </div>
  <script type="application/json" id="setup-packs-data">${safeJsonScript(packs)}</script>
</section>`,
  });
}

export function comparePage({ origin, umamiId, sideA, sideB, overlap, topChoices = [], stats }) {
  const hotPairs = [
    ['paseo', 'conductor', 'Paseo vs Conductor'],
    ['claude code', 'opencode', 'Claude Code vs OpenCode'],
    ['ollama', 'lm studio', 'Ollama vs LM Studio'],
    ['wispr flow', 'superwhisper', 'Wispr Flow vs Superwhisper'],
    ['cursor', 'claude code', 'Cursor vs Claude Code'],
    ['raycast', 'alfred', 'Raycast vs Alfred'],
    ['ghostty', 'warp', 'Ghostty vs Warp'],
    ['cursor', 'visual studio code', 'Cursor vs VS Code'],
    ['cleanshot x', 'shottr', 'CleanShot X vs Shottr'],
    ['obsidian', 'notion', 'Obsidian vs Notion'],
    ['orbstack', 'docker desktop', 'OrbStack vs Docker'],
    ['bartender', 'ice', 'Bartender vs Ice'],
    ['bob', 'easydict', 'Bob vs Easydict'],
  ];

  const renderSide = (side, label) => {
    if (!side) return `<div class="compare-card is-empty"><p class="kit-sub">请选择${label}进行对比</p></div>`;
    const allNotes = [
      ...(side.reasons ?? []).map(r => ({ note: r.note, by: `${r.author} · ${r.title}`, id: r.id })),
      ...(side.reviews ?? []).map(r => ({ note: r.note, by: `${r.author} · ${kindLabels[r.kind] ?? '点评'}`, id: '' })),
    ].slice(0, 5);
    return `<div class="compare-card">
      <div class="compare-card-head">
        ${appIcon(side, 'lg')}
        <div>
          <h2><a href="${appHref(side.key)}">${esc(side.name)}</a></h2>
          <p class="app-hero-count">被 ${num(side.count)} 张海报推荐${side.pricing ? `<span class="dot">·</span>${pricingTag(side.pricing)}` : ''}</p>
        </div>
        ${kitButton(side)}
      </div>
      ${side.summary ? `<p class="compare-summary">${esc(side.summary)}</p>` : ''}
      <dl class="compare-specs">
        <div><dt>分类</dt><dd>${(side.categories ?? []).slice(0, 3).map(c => esc(c.name)).join(' · ') || '—'}</dd></div>
        <div><dt>Homebrew</dt><dd>${side.cask ? `<code>brew install --cask ${esc(side.cask)}</code>` : '暂无 Cask'}</dd></div>
        <div><dt>直达</dt><dd>${side.homepage ? `<a class="text-link" href="${esc(side.homepage)}" target="_blank" rel="noopener noreferrer">官网${glyph('external')}</a>` : '—'}${side.mas_url ? ` <a class="text-link" href="${esc(side.mas_url)}" target="_blank" rel="noopener noreferrer">App Store${glyph('external')}</a>` : ''}</dd></div>
      </dl>
      <div class="compare-notes">
        <h3>大家怎么评价它</h3>
        ${allNotes.length ? `<ul>${allNotes.map(n => `<li><p>${quoted(n.note)}</p><span>${esc(n.by)}</span></li>`).join('')}</ul>` : '<p class="kit-sub">暂无文字评价</p>'}
      </div>
    </div>`;
  };

  const totalOverlap = overlap ? (overlap.only_a + overlap.both + overlap.only_b) : 0;
  const overlapSection = (sideA && sideB && overlap && totalOverlap > 0) ? `<section class="compare-overlap">
    <h2>真实桌面怎么选？</h2>
    <p class="kit-sub">统计全站推荐了这两款软件的 ${num(totalOverlap)} 张公开海报：</p>
    <div class="overlap-bar" role="img" aria-label="只用 ${esc(sideA.name)} ${overlap.only_a} 张，两款都用 ${overlap.both} 张，只用 ${esc(sideB.name)} ${overlap.only_b} 张">
      ${overlap.only_a > 0 ? `<span class="ov-a" data-flex="${overlap.only_a}">只装 ${esc(sideA.name)} · ${overlap.only_a}</span>` : ''}
      ${overlap.both > 0 ? `<span class="ov-both" data-flex="${overlap.both}">两款都装 · ${overlap.both}</span>` : ''}
      ${overlap.only_b > 0 ? `<span class="ov-b" data-flex="${overlap.only_b}">只装 ${esc(sideB.name)} · ${overlap.only_b}</span>` : ''}
    </div>
  </section>` : '';

  const validPair = Boolean(sideA && sideB);
  const compareCanonical = validPair ? href('/compare', { a: sideA.name, b: sideB.name }) : '/compare';
  const compareDesc = validPair
    ? `${sideA.name}（${sideA.count} 票，${sideA.pricing || '未知定价'}）与 ${sideB.name}（${sideB.count} 票，${sideB.pricing || '未知定价'}）深度对比：真实桌面同时安装比例、Homebrew 命令与用户评价。`
    : '并排对比任意两款 Mac 软件的真实推荐票数、定价、Homebrew 安装命令、同时安装比例与用户评价。';
  const compareJsonLd = validPair ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${sideA.name} 和 ${sideB.name} 在 Mac 上选哪个更好？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `根据「乔木软件推荐」真实 Mac 桌面海报统计：${sideA.name} 获得 ${sideA.count} 票（${sideA.pricing || '定价见官网'}），${sideB.name} 获得 ${sideB.count} 票（${sideB.pricing || '定价见官网'}）。${totalOverlap > 0 ? `在同时提及两者的 ${totalOverlap} 张海报中，只装 ${sideA.name} 占 ${overlap.only_a} 张、两款都装占 ${overlap.both} 张、只装 ${sideB.name} 占 ${overlap.only_b} 张。` : ''}`,
        },
      },
    ],
  } : null;

  return frame({
    title: validPair ? `${sideA.name} vs ${sideB.name}：Mac 软件对比` : '软件二选一对比',
    description: compareDesc,
    origin, umamiId, path: compareCanonical, current: 'apps', hidden: Boolean((sideA || sideB) && !validPair), jsonLd: compareJsonLd, main: `
<section class="shell page-head">
  <div>
    <h1>${sideA && sideB ? `${esc(sideA.name)} vs ${esc(sideB.name)}` : 'Mac 软件二选一对比'}</h1>
    <p class="lede">纠结装哪款？并排看真实桌面票数、价格、Homebrew 安装命令和大家的真实取舍。</p>
    ${statLine(stats)}
  </div>
</section>
<section class="shell compare-shell">
  <form class="compare-form" action="/compare">
    <input type="text" name="a" list="compare-choices" value="${esc(sideA?.name ?? '')}" placeholder="输入软件 A，如 Raycast" maxlength="60" required>
    <span class="compare-vs">VS</span>
    <input type="text" name="b" list="compare-choices" value="${esc(sideB?.name ?? '')}" placeholder="输入软件 B，如 Alfred" maxlength="60" required>
    <button type="submit" class="button primary">${glyph('scale')}开始对比</button>
    <datalist id="compare-choices">${topChoices.map(a => `<option value="${esc(a.name)}">`).join('')}</datalist>
  </form>
  <ul class="cat-cloud compare-presets">${hotPairs.map(([a, b, label]) => `<li><a href="${href('/compare', { a, b })}">${esc(label)}</a></li>`).join('')}</ul>
  ${overlapSection}
  ${(sideA || sideB) ? `<div class="compare-grid">${renderSide(sideA, '软件 A')}${renderSide(sideB, '软件 B')}</div>` : ''}
</section>`,
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

  const shareJsonLd = isPublic ? [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: row.title,
      author: { '@type': 'Person', name: row.name },
      datePublished: new Date(row.created).toISOString(),
      image: origin + image(row.id),
      url: origin + '/s/' + row.id,
      description,
      inLanguage: 'zh-CN',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: '全部海报', item: origin + '/posters' },
        { '@type': 'ListItem', position: 3, name: row.title, item: origin + '/s/' + row.id },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${row.name}推荐的 Mac 软件清单`,
      numberOfItems: row.items.length,
      itemListElement: row.items.slice(0, 30).map((a, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: a.name,
        url: origin + appHref(a.key),
      })),
    },
  ] : null;

  return frame({
    title: row.title, description, origin, umamiId, path: '/s/' + row.id, photo: image(row.id), hidden: !isPublic, current: 'posters', jsonLd: shareJsonLd,
    main: `<article class="share">
  <div class="shell">
    <nav class="crumbs" aria-label="返回"><a href="/posters">${glyph('back')}全部海报</a></nav>
    <header class="share-head">
      <h1>${esc(row.title)}</h1>
      <p class="share-by">${isPublic ? authorLink(row.name) : `<span class="author">${esc(row.name)}</span>`} 的推荐${row.role ? `<span class="dot" aria-hidden="true">·</span>${rolePill(row.role)}` : ''}<span class="dot" aria-hidden="true">·</span>${num(row.items.length)} 款软件<span class="dot" aria-hidden="true">·</span><span class="mini-tag">${row.source === 'web' ? '网页制作' : 'Mac 本机扫描'}</span><span class="dot" aria-hidden="true">·</span><time datetime="${new Date(row.created).toISOString()}">${date.format(row.created)}</time>${isPublic ? '' : '<span class="dot" aria-hidden="true">·</span>仅链接可见'}</p>
    </header>
    <figure class="share-figure">
      <button type="button" class="share-zoom-trigger" data-lightbox="${image(esc(row.id))}" data-lightbox-alt="${esc(row.name + '的推荐海报：' + row.title)}" aria-label="放大查看海报大图">
        <img class="share-image" src="${image(esc(row.id))}" alt="${esc(row.name + '的推荐海报：' + row.title)}" width="${esc(row.width)}" height="${esc(row.height)}" fetchpriority="high">
        <span class="zoom-hint" aria-hidden="true">${glyph('zoom')}点击放大</span>
      </button>
    </figure>
    <div class="actions share-actions">
      <a class="button primary" href="${image(esc(row.id))}" download="${esc(downloadName)}">${glyph('download')}下载海报</a>
      <button type="button" class="button secondary" data-copy-poster-img="${image(esc(row.id))}">${glyph('copy')}复制图片</button>
      <button type="button" class="button secondary" data-copy-url>${glyph('link')}复制链接</button>
      <button type="button" class="button secondary" data-copy-list>${glyph('list')}复制清单</button>
      <button type="button" class="button secondary" data-kit-batch>${glyph('box')}加入装机清单</button>
      <button type="button" class="button secondary" data-remix-poster>${glyph('sparkles')}复刻同款做一张</button>
      <a class="button secondary" id="studio-edit-link" data-share-owner-id="${esc(row.id)}" href="/studio?edit=${esc(row.id)}" hidden>${glyph('edit')}编辑 / 更新海报</a>
    </div>
    <script type="application/json" id="share-manifest">${safeJsonScript(manifest)}</script>
    ${(() => {
      const casks = [...new Set(row.items.map(a => a.cask).filter(Boolean))];
      if (!casks.length) return '';
      const brewCmd = 'brew install --cask ' + casks.join(' ');
      return `<div class="share-brew-bar">
        <div class="command-terminal">
          <div class="command-terminal-bar">
            <span>${glyph('terminal')} 一键安装这张海报的 ${casks.length} 款 Homebrew 软件</span>
            <button type="button" class="button primary small" data-copy="share-brew-cmd">${glyph('copy')}复制安装命令</button>
          </div>
          <pre><code id="share-brew-cmd">${esc(brewCmd)}</code></pre>
        </div>
      </div>`;
    })()}
    <section class="app-list" aria-labelledby="list-title">
      <h2 id="list-title">推荐清单</h2>
      ${[...groups].map(([label, apps]) => `<div class="app-group"><h3><a href="${href('/apps', { category: label })}">${esc(label)}</a></h3>
        <ul>${apps.map(app => `<li class="list-app-row"><a class="list-app" href="${appLink(app)}">${appIcon(app, 'md')}<span class="list-app-body"><span class="list-app-name">${esc(app.name)}${app.cask ? ' <span class="mini-tag is-brew">brew</span>' : ''}</span>${app.note ? `<span class="list-app-note">${quoted(app.note)}</span>` : ''}</span></a>${kitButton(app)}</li>`).join('')}</ul></div>`).join('')}
    </section>
    ${(() => {
      const shareUrl = origin + '/s/' + row.id;
      const imgUrl = origin + image(row.id);
      const mdLines = [
        `## ${row.title}`,
        '',
        `[![${row.title}](${imgUrl})](${shareUrl})`,
        '',
        ...[...groups].map(([label, list]) => `- **${label}**：${list.map(a => `[${a.name}](${origin}${appHref(a.key)})`).join(' · ')}`),
        '',
        `> 来自 [乔木软件推荐](${shareUrl})`,
      ];
      return `<details class="badge-box share-embed-box">
        <summary>${glyph('code')}嵌入到 GitHub README / 个人博客 /uses 页面（Markdown）</summary>
        <div class="badge-body">
          <div class="command-terminal">
            <div class="command-terminal-bar">
              <span>Markdown · 可直接贴进 GitHub Profile README / Notion / 博客</span>
              <button type="button" class="button primary small" data-copy="share-readme-md">${glyph('copy')}复制 Markdown</button>
            </div>
            <pre><code id="share-readme-md">${esc(mdLines.join('\n'))}</code></pre>
          </div>
        </div>
      </details>`;
    })()}
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
    title: 'Mac 软件体检 & 差缺补漏',
    description: '1 秒导入本机已装软件或手动勾选，测出你的撞款率、效率短板，以及同频高手都在用但你还没装的神器。',
    origin, umamiId, path: '/taste', current: 'taste', main: `
<section class="shell page-head">
  <div>
    <h1>Mac 软件体检 &amp; 差缺补漏</h1>
    <p class="lede">粘贴一行终端命令结果（或直接点选常用软件），立刻帮你找出：<strong>同频高手都在用但你漏掉的神器</strong>、<strong>7 项核心效率短板</strong>和你的软件品味画像。</p>
    ${statLine(stats)}
  </div>
</section>
<section class="shell taste-shell" data-taste-app>
  <div class="paste-import-card">
    <div class="paste-import-head">
      <div>
        <h2>方式 A：1 秒导入本机已装软件（推荐）</h2>
        <p class="kit-sub">在 Mac 终端运行下方只读命令，把输出的软件名粘贴进来，纯本地筛选不上传任何隐私路径。</p>
      </div>
      <div class="command command-compact"><span class="command-prompt" aria-hidden="true">$</span><code id="taste-scan-cmd">${esc(scanCmd)}</code><button type="button" class="button secondary small" data-copy="taste-scan-cmd">${glyph('copy')}复制命令</button></div>
    </div>
    <div class="paste-import-body">
      <textarea id="taste-paste" rows="4" placeholder="把终端输出的软件名粘贴到这里，每行一个，例如：&#10;Raycast&#10;Cursor&#10;Obsidian"></textarea>
      <button type="button" class="button primary" id="taste-paste-run">${glyph('zap')}1 秒识别并开始体检</button>
    </div>
  </div>
  <div class="taste-toolbar">
    <div class="taste-search-wrap">
      <label class="sr" for="taste-input">方式 B：手动添加软件</label>
      <input id="taste-input" type="search" maxlength="60" placeholder="或者手动输入软件名回车添加，如 Ghostty" autocomplete="off">
      <button type="button" class="button secondary small" id="taste-add-btn">${glyph('plus')}添加</button>
    </div>
    <div class="taste-summary-bar">
      <span>已选 <strong class="num" id="taste-count">0</strong> 款</span>
      <button type="button" class="button secondary small" id="taste-clear" hidden>清空</button>
      <button type="button" class="button primary" id="taste-submit" disabled>${glyph('sparkles')}生成体检报告</button>
    </div>
  </div>
  <div class="taste-selected" id="taste-selected" aria-live="polite"></div>
  ${topApps.length ? `<div class="taste-picker">
    <h2 class="taste-sub-title">站内热门软件（点选即可）</h2>
    <ul class="taste-grid" id="taste-grid">${topApps.map(app => `<li><button type="button" class="taste-chip" data-taste-chip="${esc(app.name)}" data-taste-key="${esc(app.key)}" data-taste-icon="${esc(app.icon ?? '')}" data-taste-cat="${esc(app.categories?.[0] ?? '效率')}" aria-pressed="false">${appIcon(app, 'sm')}<span>${esc(app.name)}</span></button></li>`).join('')}</ul>
  </div>` : `<div class="empty-note"><h3>站内软件库正在积累中</h3><p>直接在上方的输入框添加或粘贴你常用的 Mac 软件即可开始体检。</p></div>`}
  <div id="taste-result" class="taste-result" hidden aria-live="polite"></div>
</section>`,
  });
}

export function studioPage({ origin, umamiId, catalogApps = [], wallpapers = [], themes = [], categories = [], roles = [], stats }) {
  const defaultCats = categories.length ? categories : ['AI 与开发', '浏览与沟通', '写作与办公', '效率与工具', '创作'];
  const currentYear = new Date().getFullYear();
  const compactCatalog = catalogApps.map(a => ({
    key: a.key,
    name: a.name,
    count: a.count,
    group: a.categories?.[0] ?? '效率与工具',
    themes: a.themes ?? [],
    icon: a.icon ?? '',
    summary: a.summary ?? '',
    searchText: a.searchText ?? '',
    isSystem: Boolean(a.is_system),
  }));

  const studioJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '乔木 Mac 软件海报在线制作台',
    url: origin + '/studio',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    inLanguage: 'zh-CN',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: '免费在线制作高清 Mac 软件推荐海报，内置 200+ 真实软件与 AI Harness 图标、20 张高清壁纸、霞鹜文楷/思源宋体等开源字体与 16:9 / 3:4 双画幅导出。',
  };

  return frame({
    title: '在线制作你的 Mac 软件推荐海报',
    description: '选软件、换壁纸、填署名，30 秒在线生成高清 Mac 软件推荐海报，内置 200+ 真实图标（全面覆盖热门 AI Harness 与 AI 工具）与 20 张精选壁纸。',
    origin, umamiId, path: '/studio', current: 'studio', extraScript: studioAsset, jsonLd: studioJsonLd, main: `
<section class="shell studio-v3" id="studio-root">
  <header class="studio-top">
    <div class="studio-top-left">
      <h1>制作你的软件海报</h1>
      <p class="studio-sub">点选软件 · 挑张壁纸 · 填名字出图</p>
    </div>
    <a class="text-link studio-skill-link" href="/make">${glyph('terminal')}用 Mac Skill 自动扫描本机${glyph('arrow')}</a>
  </header>

  <div class="studio-stage-card">
    <div class="studio-canvas-wrap" id="studio-dropzone">
      <canvas id="studio-canvas" width="1600" height="900" aria-label="软件推荐海报实时预览"></canvas>
      <div class="studio-drop-overlay" aria-hidden="true"><span>${glyph('upload')}松开即可设为海报壁纸</span></div>
    </div>

    <div class="studio-dock">
      <div class="studio-dock-tools">
        <button type="button" class="button secondary" id="open-apps-modal">${glyph('box')}选软件 <span class="dock-pill num" id="studio-app-count">0</span></button>
        <div class="dock-split-btn">
          <button type="button" class="button secondary" id="open-bg-modal">${glyph('upload')}换壁纸 <span class="dock-meta" id="studio-bg-label">${esc(wallpapers[0]?.name ?? '默认')}</span></button>
          <button type="button" class="button secondary dock-icon-btn" id="studio-dock-shuffle" aria-label="随机换一张壁纸" title="随机换一张壁纸">${glyph('shuffle')}</button>
        </div>
        <button type="button" class="button secondary" id="open-style-modal">${glyph('edit')}字体与水印</button>
      </div>
      <div class="studio-dock-finish">
        <label class="sr" for="studio-name">你的名字（署名）</label>
        <input type="text" id="studio-name" maxlength="40" placeholder="输入你的名字">
        <button type="button" class="button secondary" id="studio-copy-img" title="复制高清图片到剪贴板，可直接 ⌘V 粘贴">${glyph('copy')}复制图</button>
        <button type="button" class="button secondary" id="studio-download">${glyph('download')}下载</button>
        <button type="button" class="button primary" id="studio-publish">${glyph('sparkles')}发布海报</button>
      </div>
    </div>
    <p id="studio-status" class="studio-status" role="status"></p>
  </div>
  <p class="studio-hints"><span>拖拽或 <kbd>⌘V</kbd> 粘贴图片可直换壁纸</span><span class="dot" aria-hidden="true">·</span><span>按 <kbd>R</kbd> 随机换壁纸</span><span class="dot" aria-hidden="true">·</span><span><kbd>⌘S</kbd> 下载高清图</span></p>

  <div class="studio-card" id="studio-history-card" hidden>
    <h2>本机发布过的海报</h2>
    <ul class="studio-history" id="studio-history"></ul>
  </div>

  <!-- Modal 1: Software Picker -->
  <dialog id="studio-apps-modal" class="studio-modal studio-modal-lg" closedby="any" aria-labelledby="apps-modal-title">
    <div class="modal-head">
      <div>
        <h2 id="apps-modal-title">选择软件（<span class="num" id="modal-app-count">0</span> / 48）</h2>
        <p class="kit-sub">收录全站提交与 200+ 热门 AI Harness / AI 工具 / Mac 应用，均配真实图标</p>
      </div>
      <div class="actions">
        <button type="button" class="button secondary small" id="studio-pick-hot">热门 12 款</button>
        <button type="button" class="button secondary small" id="studio-pick-ai">AI Harness 栈</button>
        <button type="button" class="button secondary small" id="studio-pick-foss">开源效率栈</button>
        <button type="button" class="button secondary small" id="studio-clear-apps">清空</button>
        <form method="dialog"><button type="submit" class="button primary small">完成</button></form>
      </div>
    </div>
    <div class="modal-toolbar">
      <input type="search" id="studio-app-search" maxlength="60" placeholder="搜索软件，或输入新软件名回车添加" autocomplete="off">
      <select id="studio-default-cat" aria-label="新增软件分类">${defaultCats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
      <button type="button" class="button secondary small" id="studio-add-custom">${glyph('plus')}添加</button>
    </div>
    <div class="studio-theme-bar" id="studio-theme-bar" role="group" aria-label="按场景筛选">
      <button type="button" class="filter-pill is-on" data-studio-theme="">全部 (${compactCatalog.length})</button>
      <button type="button" class="filter-pill" data-studio-theme="__selected">只看已选</button>
      ${themes.map(t => `<button type="button" class="filter-pill" data-studio-theme="${esc(t.id)}">${esc(t.name)} (${t.count})</button>`).join('')}
    </div>
    <div class="studio-selected-strip" id="studio-selected-strip" hidden aria-label="已选软件快捷管理"></div>
    <ul class="studio-catalog-grid" id="studio-catalog-grid">
      ${compactCatalog.map(app => `<li><button type="button" class="studio-pick-card" data-catalog-key="${esc(app.key)}" data-catalog-themes="${esc(app.themes.join(','))}" aria-pressed="false">
        <span class="pick-check" aria-hidden="true">✓</span>
        ${appIcon(app, 'md')}
        <span class="pick-name">${esc(app.name)}</span>
        ${app.count ? `<span class="pick-meta num">${app.count} 票</span>` : ''}
      </button></li>`).join('')}
    </ul>
    <div class="modal-extras">
      <details class="studio-paste-box">
        <summary>${glyph('edit')}微调已选软件的分类与推荐理由</summary>
        <ul class="studio-selected-list" id="studio-selected-list"></ul>
      </details>
      <details class="studio-paste-box">
        <summary>${glyph('zap')}粘贴 ls /Applications 批量勾选本机软件</summary>
        <div class="studio-paste-inner">
          <div class="command command-compact"><span class="command-prompt" aria-hidden="true">$</span><code id="studio-scan-cmd">${esc(scanCmd)}</code><button type="button" class="button secondary small" data-copy="studio-scan-cmd">${glyph('copy')}复制</button></div>
          <textarea id="studio-paste-input" rows="3" placeholder="把终端输出粘贴在这里，自动匹配真实图标并过滤系统自带应用"></textarea>
          <button type="button" class="button primary small" id="studio-paste-btn">解析并加入</button>
        </div>
      </details>
    </div>
  </dialog>

  <!-- Modal 2: Wallpaper Picker -->
  <dialog id="studio-bg-modal" class="studio-modal studio-modal-lg" closedby="any" aria-labelledby="bg-modal-title">
    <div class="modal-head">
      <div>
        <h2 id="bg-modal-title">选择背景壁纸</h2>
        <p class="kit-sub">20 张精选高清摄影壁纸，点选即刻生效</p>
      </div>
      <div class="actions">
        <button type="button" class="button secondary small" id="studio-random-bg">${glyph('shuffle')}随机</button>
        <label class="button secondary small studio-file-btn">${glyph('upload')}上传本地图片<input type="file" id="studio-bg-file" accept="image/*" hidden></label>
        <form method="dialog"><button type="submit" class="button primary small">完成</button></form>
      </div>
    </div>
    <div class="modal-scrim-row">
      <span class="kit-sub">背景质感：</span>
      <button type="button" class="filter-pill is-on" data-scrim="desktop">标准通透</button>
      <button type="button" class="filter-pill" data-scrim="night">深邃暗夜</button>
      <button type="button" class="filter-pill" data-scrim="blur">柔焦景深</button>
    </div>
    <ul class="wallpaper-grid" id="studio-wallpaper-grid">
      ${wallpapers.map((wp, idx) => `<li><button type="button" class="wallpaper-tile${idx === 0 ? ' is-active' : ''}" data-wallpaper-url="${esc(wp.url)}" data-wallpaper-name="${esc(wp.name)}" data-wallpaper-id="${esc(wp.id)}" aria-pressed="${idx === 0 ? 'true' : 'false'}">
        <img src="${esc(wp.thumb)}" alt="${esc(wp.name)}" width="320" height="180" loading="lazy" decoding="async">
        <span>${esc(wp.name)}</span>
      </button></li>`).join('')}
    </ul>
  </dialog>

  <!-- Modal 3: Fonts, Title & Watermark -->
  <dialog id="studio-style-modal" class="studio-modal studio-modal-sm" closedby="any" aria-labelledby="style-modal-title">
    <div class="modal-head">
      <div><h2 id="style-modal-title">字体、标题与水印</h2></div>
      <form method="dialog"><button type="submit" class="button primary small">完成</button></form>
    </div>
    <div class="style-modal-body">
      <div class="style-group">
        <p class="style-label">海报画幅比例</p>
        <div class="font-grid" role="group" aria-label="选择海报画幅">
          <button type="button" class="font-card is-active" data-aspect="wide" aria-pressed="true"><strong>16:9 横版</strong><span>桌面壁纸 · X / 公众号 / 博客</span></button>
          <button type="button" class="font-card" data-aspect="portrait" aria-pressed="false"><strong>3:4 竖版</strong><span>小红书 · 朋友圈 · 即刻卡片</span></button>
        </div>
      </div>
      <div class="style-group">
        <p class="style-label">海报开源字体</p>
        <div class="font-grid" role="group" aria-label="选择海报字体">
          <button type="button" class="font-card is-active" data-font="wenkai" aria-pressed="true"><strong>霞鹜文楷</strong><span>默认开源字体 · 温润雅致</span></button>
          <button type="button" class="font-card" data-font="noto-serif" aria-pressed="false"><strong>思源宋体</strong><span>开源衬线体 · 出版质感</span></button>
          <button type="button" class="font-card" data-font="noto-sans" aria-pressed="false"><strong>思源黑体</strong><span>开源无衬线 · 干净现代</span></button>
          <button type="button" class="font-card" data-font="smiley" aria-pressed="false"><strong>得意黑</strong><span>开源海报体 · 利落斜体</span></button>
        </div>
      </div>
      <div class="studio-fields">
        <label><span>海报标题（留空将自动随署名生成）</span><input type="text" id="studio-title" maxlength="34" value="" placeholder="${currentYear} 我推荐的 Mac 软件"></label>
        <label><span>身份标签（可选）</span>
          <input type="text" id="studio-role" maxlength="16" list="studio-role-list" placeholder="如：独立开发者、设计师">
          <datalist id="studio-role-list">${roles.map(r => `<option value="${esc(r)}">`).join('')}</datalist>
        </label>
        <label><span>可见范围</span>
          <select id="studio-visibility">
            <option value="public">公开到画廊（参与软件榜投票）</option>
            <option value="link">仅链接可见（不进入画廊）</option>
          </select>
        </label>
        <label><span>右下角水印文字</span>
          <input type="text" id="studio-watermark" maxlength="40" value="software.qiaomu.ai" placeholder="自定义水印，如 @你的ID">
        </label>
      </div>
      <label class="checkbox-row">
        <input type="checkbox" id="studio-watermark-show" checked>
        <span>显示右下角水印（取消勾选可完全隐藏）</span>
      </label>
      <div class="style-modal-actions">
        <button type="button" class="button secondary small" id="studio-copy-caption">${glyph('list')}一键复制社交分享配文</button>
      </div>
    </div>
  </dialog>

  <script type="application/json" id="studio-catalog-data">${safeJsonScript(compactCatalog)}</script>
  <script type="application/json" id="studio-wallpapers-data">${safeJsonScript(wallpapers)}</script>
</section>`,
  });
}

export function makePage({ origin, umamiId, stats }) {
  const steps = [
    ['安装或更新 Skill', `在 Mac 的终端运行下面这条命令（已更新至 v0.4.0，支持身份标签与原地更新海报）。`, installBlock('install-make')],
    ['让助手扫描本机', '对助手说「用我的壁纸和应用图标做一张软件推荐海报」。它按 Spotlight 记录的最近使用天数给出候选，不启动任何应用。', '<p class="say">「扫一下我最近半年常用的软件，先给我看候选」</p>'],
    ['挑软件、填身份与理由', '打开本机挑选页去掉不想推荐的、补上漏掉的，顺手填上身份标签和 2–3 条最走心的推荐理由。', '<p class="say">「身份写独立开发者，Raycast 理由写：一个快捷键搞定剪贴板和窗口」</p>'],
    ['预览、发布或原地更新', '海报先在本机生成，满意后再选「只保存」「仅链接分享」或「发布到画廊」。以后换软件了可直接原地更新，原分享链接不变。', '<p class="say">「用『小乔』署名发布到画廊」或「更新我上次发的那张海报」</p>'],
  ];
  return frame({
    title: '做一张你的软件海报', description: '在网页 10 秒导入直接制作，或安装 qiaomu-mac-software Skill 用自己的壁纸和应用图标做一张 Mac 软件推荐海报。', origin, umamiId, path: '/make', current: 'make', main: `
<section class="shell page-head make-head">
  <div><h1>做一张你的软件海报</h1><p class="lede">两种方式任选：网页粘贴应用列表 10 秒直接做，或者用 Mac Skill 自动扫描本机 Spotlight 真实使用记录。</p>${statLine(stats)}</div>
  <figure class="make-sample"><img src="${demoAsset}" width="1600" height="900" alt="金门大桥桌面背景上的 23 款 Mac 软件推荐示例"><figcaption>示例：桌面壁纸 + 23 款软件</figcaption></figure>
</section>
<section class="shell section-tight">
  <div class="make-tracks">
    <div class="track-card is-highlight">
      <p class="track-eyebrow">推荐新手 · 免安装</p>
      <h2>方式一：网页直接制作</h2>
      <p>上传一张壁纸或选内置暗色背景，支持粘贴 <code>ls /Applications</code> 批量匹配全站共识图标，30 秒出图发布并随时原地更新。</p>
      <div class="actions"><a class="button primary" href="/studio">${glyph('plus')}打开网页制作器</a><a class="button secondary" href="/taste">${glyph('sparkles')}先做软件体检</a></div>
    </div>
    <div class="track-card">
      <p class="track-eyebrow">进阶 · 最真实</p>
      <h2>方式二：安装 Mac Skill (v0.4.0)</h2>
      <p>适合使用 Claude Code、Codex 等 AI 助手的用户。自动读取本机 Spotlight 活跃天数、提取冷门软件独有图标与当前壁纸，支持身份标签与原地更新。</p>
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
<h2>在你的 Mac 或浏览器上制作</h2><p>使用 Skill 时，脚本只在本地读取应用列表、Spotlight 使用日期和桌面背景，应用路径和使用次数留在本机。使用网页制作器或软件体检时，上传的壁纸只在你的浏览器 Canvas 本地合成，粘贴的应用名仅用于匹配软件目录，不会保存个人设备清单。</p>
<h2>你选择分享后</h2><p>网站接收合成海报、你选的软件名称与分类、你写的推荐理由、这些软件的 128px 图标与应用标识、标题、署名、可选身份标签和分享范围。网站已经有的图标只发送指纹，不重复上传。壁纸会出现在合成海报中，发布前请选一张适合分享的背景并预览海报。</p>
<h2>软件归并、图标与元数据</h2><p>同一款软件的不同常见别名（如 VS Code 与 Visual Studio Code）或相同 Bundle ID 会自动归并到规范页面，旧链接自动 301 跳转。图标显示被最多公开海报使用的版本。软件的官网、App Store 与 Homebrew Cask 安装信息来自内置精选字典及公开的 Homebrew Cask / Apple iTunes 目录。</p>
<h2>可见范围、更新和撤回</h2><p>公开海报会出现在海报列表、软件榜、RSS 与公开只读 API 中，并给其中的软件计票。仅链接海报只有拿到链接的人能看，不计票。Skill 或浏览器本地保存的凭证可用于随时原地更新（PUT）或撤回（DELETE）海报，撤回后本站停止提供该海报和图片。</p>
<h2>装机清单、补充点评与访问统计</h2><p>装机清单保存在浏览器 localStorage 中，无需账号，也不会上传服务器。软件详情页的「补充体验/避坑技巧」与「写得好」投票按访问来源哈希防刷，均不影响软件榜的海报票数。本站使用 Umami 统计访问。项目问题请提到 <a href="${issues}">GitHub</a>。</p>
</article>`,
  });
}

export function alternativesPage({ origin, umamiId, rows = [], freeCasks = [], stats }) {
  const groups = [
    ['', '全部平替'],
    ['ai-dev', 'AI Harness & 编程'],
    ['ai', 'AI 助手与创作'],
    ['system', '系统增强与效率'],
    ['media', '截图与影音'],
    ['dev', '开发与网络'],
    ['notes', '写作与阅读'],
  ];
  const brewAll = freeCasks.length ? 'brew install --cask ' + freeCasks.slice(0, 18).join(' ') : '';
  const altJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Mac & AI 付费软件免费开源平替大全',
      url: origin + '/alternatives',
      inLanguage: 'zh-CN',
      description: `精选 ${rows.length} 组热门付费 Mac 软件与 AI 工具的开源免费替代方案，涵盖 CleanShot X、Cursor、Conductor、Bartender、1Password、Wispr Flow 等。`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: rows.slice(0, 12).map(r => ({
        '@type': 'Question',
        name: `${r.paid.name} 在 Mac 上有哪些免费或开源平替？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${r.paid.name}（${r.paid.pricing}）最受 Mac 社区推荐的免费 / 开源替代方案包括：${r.alts.map(a => `${a.name}（${a.pricing}${a.cask ? `，brew install --cask ${a.cask}` : ''}）`).join('、')}。`,
        },
      })),
    },
  ];
  return frame({
    title: 'Mac & AI 付费软件开源平替大全',
    description: `精选 ${rows.length} 组热门付费 Mac 软件与 AI 工具的 0 元开源免费替代方案，含真实投票、一键 Homebrew 安装与并排对比。`,
    origin, umamiId, path: '/alternatives', current: 'apps', jsonLd: altJsonLd, main: `
<section class="shell page-head">
  <div>
    <h1>Mac &amp; AI 付费软件开源平替大全</h1>
    <p class="lede">不想被十几个订阅制 Mac / AI 软件掏空钱包？这里整理了 <strong>${rows.length} 组</strong>经过社区实测的高口碑开源免费替代方案，支持一键对比与 Homebrew 批量安装。</p>
    ${statLine(stats)}
  </div>
</section>
<section class="shell alt-hub" data-alt-hub>
  ${brewAll ? `<div class="alt-brew-banner">
    <div class="command-terminal">
      <div class="command-terminal-bar">
        <span>${glyph('terminal')} 热门免费 / 开源平替一键安装命令（${Math.min(18, freeCasks.length)} 款精选 Cask）</span>
        <button type="button" class="button primary small" data-copy="alt-brew-all">${glyph('copy')}复制一键命令</button>
      </div>
      <pre><code id="alt-brew-all">${esc(brewAll)}</code></pre>
    </div>
  </div>` : ''}
  <div class="alt-controls">
    <div class="studio-theme-bar" role="group" aria-label="按场景筛选平替">
      ${groups.map(([id, label], idx) => `<button type="button" class="filter-pill${idx === 0 ? ' is-on' : ''}" data-alt-group="${esc(id)}">${esc(label)}${id === '' ? ` (${rows.length})` : ''}</button>`).join('')}
    </div>
    <input type="search" id="alt-search" maxlength="50" placeholder="搜想替代的付费软件，如 CleanShot / Cursor / Conductor / 1Password…" autocomplete="off">
  </div>
  <ul class="alt-matrix" id="alt-matrix">
    ${rows.map(r => `<li class="alt-pair-card" data-alt-item data-group="${esc(r.group)}" data-search="${esc((r.paid.name + ' ' + r.paid.summary + ' ' + r.alts.map(a => a.name + ' ' + a.summary).join(' ')).toLowerCase())}">
      <div class="alt-paid-col">
        <span class="alt-col-label">热门付费 / 订阅</span>
        <a class="alt-app-link" href="${appHref(r.paid.key)}">
          ${appIcon(r.paid, 'md')}
          <div>
            <strong>${esc(r.paid.name)} ${pricingTag(r.paid.pricing)}</strong>
            ${r.paid.summary ? `<p>${esc(r.paid.summary)}</p>` : ''}
          </div>
        </a>
      </div>
      <div class="alt-arrow-col" aria-hidden="true">${glyph('arrow')}<span>开源平替</span></div>
      <div class="alt-free-col">
        <span class="alt-col-label">推荐免费 / 开源替代</span>
        <ul class="alt-free-list">${r.alts.map(a => `<li>
          <a class="alt-free-main" href="${appHref(a.key)}">
            ${appIcon(a, 'sm')}
            <span class="alt-free-info">
              <strong>${esc(a.name)} ${pricingTag(a.pricing)}${a.cask ? ' <span class="mini-tag is-brew">brew</span>' : ''}</strong>
              ${a.summary ? `<span>${esc(a.summary)}</span>` : ''}
            </span>
          </a>
          <div class="alt-free-acts">
            <a class="compare-mini" href="${href('/compare', { a: r.paid.key, b: a.key })}" title="并排对比 ${esc(r.paid.name)} 与 ${esc(a.name)}">对比</a>
            ${kitButton(a)}
          </div>
        </li>`).join('')}</ul>
      </div>
    </li>`).join('')}
  </ul>
</section>`,
  });
}

export function insightsPage({ origin, umamiId, report }) {
  const { stats, avgApps, fossCount, fossPct, freePct, brewCount, brewPct, topPenetration = [], pairs = [], themeBreakdown = [], roleBreakdowns = [] } = report;
  const citeLines = [
    `【Mac 真实软件生态数据摘要】来源：乔木软件推荐 (${origin}/insights)`,
    `- 样本规模：${stats.posters} 张真实 Mac 用户公开海报 · ${stats.apps} 款实测软件 · 人均推荐 ${avgApps} 款`,
    `- 开源与装机：${fossPct}% 为纯开源免费软件，${freePct}% 可免费使用，${brewPct}% 支持 Homebrew Cask 一键安装`,
    `- 真实桌面装机率 Top 5：${topPenetration.slice(0, 5).map(a => `${a.name} (${a.pct}%)`).join('、')}`,
    ...(pairs.length ? [`- 最常见黄金搭档：${pairs.slice(0, 3).map(p => `${p.nameA} + ${p.nameB} (${p.pct}%)`).join('、')}`] : []),
  ];
  const insightsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: '乔木软件推荐 · 真实 Mac 软件装机率与生态数据报告',
    url: origin + '/insights',
    inLanguage: 'zh-CN',
    description: `基于 ${stats.posters} 张真实 Mac 用户公开桌面海报实时统计的软件装机穿透率、黄金搭档组合、开源免费占比与 Homebrew Cask 覆盖率数据。`,
    creator: { '@type': 'Organization', name: '乔木软件推荐', url: origin + '/' },
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: origin + '/api/v1/insights' }],
  };
  return frame({
    title: '真实 Mac 软件生态数据洞察',
    description: `基于 ${stats.posters} 张真实 Mac 桌面海报实时统计：装机率 Top 榜、最常见黄金搭档组合、开源免费与 Homebrew 覆盖率报告。`,
    origin, umamiId, path: '/insights', current: 'apps', jsonLd: insightsJsonLd, main: `
<section class="shell page-head">
  <div>
    <h1>真实 Mac 软件生态数据洞察</h1>
    <p class="lede">每张公开海报都来自一台真实在用的 Mac。以下所有穿透率、黄金搭档与结构分布均由全站真实数据实时计算，零广告干预。</p>
  </div>
  <div class="actions">
    <a class="button primary" href="/studio">${glyph('plus')}贡献我的桌面数据</a>
    <a class="button secondary" href="/api/v1/insights">${glyph('code')}开放 JSON 数据</a>
  </div>
</section>
<section class="shell insights-shell">
  <div class="insights-kpis">
    <div class="kpi-card"><span class="kpi-label">公开真实桌面</span><strong class="kpi-val num">${esc(stats.posters)}</strong><span class="kpi-sub">张署名的 Mac 软件海报</span></div>
    <div class="kpi-card"><span class="kpi-label">人均推荐软件</span><strong class="kpi-val num">${esc(avgApps)}</strong><span class="kpi-sub">款日常主力应用 / 台</span></div>
    <div class="kpi-card"><span class="kpi-label">开源免费占比</span><strong class="kpi-val num is-mint">${esc(fossPct)}%</strong><span class="kpi-sub">${esc(fossCount)} 款开源 · ${esc(freePct)}% 免费可用</span></div>
    <div class="kpi-card"><span class="kpi-label">Homebrew 覆盖</span><strong class="kpi-val num is-amber">${esc(brewPct)}%</strong><span class="kpi-sub">${esc(brewCount)} 款支持 brew 一键安装</span></div>
  </div>

  <div class="insights-grid">
    <section class="studio-card" aria-labelledby="pen-title">
      <div class="section-head"><div><h2 id="pen-title">真实桌面装机率 Top 14</h2><p>按出现在公开海报中的比例排序（已排除系统自带）</p></div><a class="text-link" href="/apps">完整软件榜${glyph('arrow')}</a></div>
      <ol class="pen-list">
        ${topPenetration.map((a, idx) => `<li class="pen-row">
          <span class="pen-rank num">${String(idx + 1).padStart(2, '0')}</span>
          <a class="pen-app" href="${appHref(a.key)}">${appIcon(a, 'sm')}<span>${esc(a.name)}</span></a>
          <div class="pen-bar-wrap"><div class="pen-bar-track"><div class="pen-bar-fill" data-width="${a.pct}%"></div></div></div>
          <span class="pen-stat num"><strong>${a.pct}%</strong><span>${a.count} 票</span></span>
        </li>`).join('')}
      </ol>
    </section>

    <div class="insights-side">
      ${pairs.length ? `<section class="studio-card" aria-labelledby="pairs-title">
        <div class="section-head"><div><h2 id="pairs-title">高频黄金搭档组合</h2><p>最常同时出现在同一台 Mac 桌面上的软件对</p></div></div>
        <ul class="pair-list">
          ${pairs.slice(0, 10).map(p => `<li class="pair-row">
            <div class="pair-apps">
              <a href="${appHref(p.keyA)}">${appIcon({ name: p.nameA, icon: p.iconA }, 'sm')}<span>${esc(p.nameA)}</span></a>
              <span class="pair-plus" aria-hidden="true">+</span>
              <a href="${appHref(p.keyB)}">${appIcon({ name: p.nameB, icon: p.iconB }, 'sm')}<span>${esc(p.nameB)}</span></a>
            </div>
            <div class="pair-end">
              <span class="pair-stat num">${p.count} 台 · ${p.pct}%</span>
              <a class="compare-mini" href="${href('/compare', { a: p.keyA, b: p.keyB })}">对比</a>
            </div>
          </li>`).join('')}
        </ul>
      </section>` : ''}

      <section class="studio-card" aria-labelledby="theme-dist-title">
        <h2 id="theme-dist-title">站内软件场景分布</h2>
        <div class="taste-bars">
          ${themeBreakdown.map(t => `<a class="taste-bar-row theme-dist-row" href="${href('/apps', { theme: t.id })}">
            <div class="taste-bar-head"><span>${esc(t.name)}</span><span class="num">${t.count} 款 · ${t.pct}%</span></div>
            <div class="taste-bar-track"><div class="taste-bar-fill" data-width="${Math.max(6, t.pct)}%"></div></div>
          </a>`).join('')}
        </div>
      </section>
    </div>
  </div>

  ${roleBreakdowns.length ? `<section class="studio-card" aria-labelledby="role-dist-title">
    <h2 id="role-dist-title">不同身份 Mac 用户的 Top 5 主力软件</h2>
    <div class="role-insights-grid">
      ${roleBreakdowns.map(rb => `<div class="role-insight-box">
        <h3><a href="${href('/posters', { role: rb.role })}">${esc(rb.role)}</a></h3>
        <ul>${rb.items.map(it => `<li><a href="${appHref(it.key)}">${appIcon(it, 'sm')}<span>${esc(it.name)}</span><span class="num">${it.count}</span></a></li>`).join('')}</ul>
      </div>`).join('')}
    </div>
  </section>` : ''}

  <section class="studio-card" aria-labelledby="cite-title">
    <h2 id="cite-title">一键引用实时数据摘要（适合文章 / 播客 / 视频引用）</h2>
    <div class="command-terminal">
      <div class="command-terminal-bar">
        <span>实时统计摘要 · 欢迎署名引用</span>
        <button type="button" class="button primary small" data-copy="insights-cite-text">${glyph('copy')}复制摘要</button>
      </div>
      <pre><code id="insights-cite-text">${esc(citeLines.join('\n'))}</code></pre>
    </div>
  </section>
</section>`,
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
