const skill = 'https://github.com/joeseesun/qiaomu-mac-software';
const repo = 'https://github.com/joeseesun/qiaomu-software';
const install = 'npx skills add joeseesun/qiaomu-mac-software --skill qiaomu-mac-software';
const email = 'https://github.com/joeseesun/qiaomu-software/issues/new';
const htmlChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value).replace(/[&<>"']/g, character => htmlChars[character]);
const galleryDescription = '看看大家在 Mac 上推荐什么。用自己的桌面壁纸和应用图标，做一张可以署名分享的软件海报。';
const thumb = (id) => '/media/' + id + '/thumb.webp';
const image = (id) => '/media/' + id + '.webp';
const query = (name) => '/?q=' + encodeURIComponent(name) + '#gallery';
const date = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', dateStyle: 'medium' });

function frame({ origin, umamiId, title, description = galleryDescription, path = '/', photo = '/demo.webp', hidden = false, main }) {
  const fullTitle = title === '乔木软件推荐' ? title : title + ' · 乔木软件推荐';
  const analytics = /^[0-9a-f-]{36}$/i.test(umamiId ?? '') ?
    `<script defer src="https://umami.qiaomu.ai/script.js" data-website-id="${esc(umamiId)}" data-domains="${esc(new URL(origin).hostname)}"></script>` : '';
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#111713">
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
<link rel="icon" href="/mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="/site.css">
<script defer src="/site.js"></script>
${analytics}
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="site-header shell">
  <a class="brand" href="/"><span aria-hidden="true">⌘</span> 乔木软件推荐</a>
  <nav aria-label="主导航"><a href="/#gallery">看推荐</a><a href="/#make">做一张</a><a href="${repo}">GitHub</a></nav>
</header>
<main id="main">${main}</main>
<footer class="site-footer shell">
  <a href="/privacy">数据与分享说明</a>
  <a href="https://tuijian.qiaomu.ai/">乔木推荐</a>
  <a href="https://x.com/vista8">X</a>
  <a href="${repo}">网站源码</a>
  <button type="button" class="footer-button" data-dialog="follow" title="关注乔木">关注乔木</button>
  <button type="button" class="footer-button" data-dialog="reward" title="支持乔木">支持乔木</button>
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
  return `<article class="card"><a class="card-art" href="/s/${row.id}"><img src="${thumb(row.id)}" alt="${esc(row.name + '的推荐海报')}" width="${row.width}" height="${row.height}" loading="lazy" decoding="async"></a>
  <div class="card-body"><h3><a href="/s/${row.id}">${esc(row.title)}</a></h3><p>${esc(row.name)} · ${apps.length} 款</p>
  <div class="tags">${apps.slice(0, 4).map(a => `<a href="${query(a.name)}">${esc(a.name)}</a>`).join('')}</div></div></article>`;
}

export function home({ shares, q, page, origin, umamiId }) {
  const sample = '<div class="empty"><h3>画廊等你的第一张海报</h3><p>完成海报后，选择「发布到画廊」，作品就会出现在这里。</p><a class="text-link" href="#make">开始制作 →</a></div>';
  const matching = '<div class="empty"><h3>没有匹配的分享</h3><p>试试软件名、分享名或海报标题。</p><a class="text-link" href="/#gallery">查看全部 →</a></div>';
  const pageUrl = (number) => '/?page=' + number + (q ? '&amp;q=' + encodeURIComponent(q) : '') + '#gallery';
  return frame({ title: '乔木软件推荐', origin, umamiId, hidden: Boolean(q || page !== 1), main: `
<section class="hero shell">
  <div class="hero-copy">
    <p class="eyebrow">Mac 软件推荐海报</p>
    <h1>大家推荐的<br>Mac 软件</h1>
    <p class="lede">挑出你想推荐的软件，用自己的桌面背景和应用图标做成一张海报。署上名字，就能分享。</p>
    <div class="actions"><a class="button primary" href="#make">制作我的海报</a><a class="button quiet" href="#gallery">看大家的推荐</a></div>
  </div>
  <figure class="hero-image"><img src="/demo.webp" width="1200" height="675" alt="软件海报示例，按用途横排展示原生 Mac 应用图标" fetchpriority="high"><figcaption>海报示例</figcaption></figure>
</section>
<section class="shell section" id="gallery">
  <div class="section-head"><div><h2>推荐画廊</h2><p>按软件名或分享名找推荐。</p></div>
    <form class="search" role="search" action="/#gallery"><label for="search-input">搜索海报</label><div><input id="search-input" type="search" name="q" maxlength="60" value="${esc(q)}" placeholder="例如 Obsidian"><button type="submit">搜索</button></div></form></div>
  ${shares.length ? `<div class="gallery">${shares.slice(0, 24).map(card).join('')}</div>` : (q || page > 1 ? matching : sample)}
  ${page > 1 || shares.length > 24 ? `<nav class="pager" aria-label="分页">${page > 1 ? `<a href="${pageUrl(page - 1)}">上一页</a>` : ''}${shares.length > 24 && page < 167 ? `<a href="${pageUrl(page + 1)}">下一页</a>` : ''}</nav>` : ''}
</section>
<section class="shell section" id="make">
  <div class="install">
    <div><h2>做一张你的软件海报</h2><p>在 Mac 上安装 Skill，让支持 Skill 的助手运行。应用清单和使用记录留在本机，预览确认后再分享成图。</p></div>
    <div class="installation"><p class="command-label">安装命令</p><div class="command"><code id="install-command">${install}</code><button type="button" data-copy="install-command">复制</button></div><p><a href="${skill}">查看 Skill 与安装说明 ↗</a></p></div>
  </div>
</section>` });
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
  <p class="eyebrow"><a href="/#gallery">推荐画廊</a></p>
  <h1>${esc(row.title)}</h1>
  <p class="share-by">${esc(row.name)} · ${apps.length} 款软件 · <time datetime="${new Date(row.created).toISOString()}">${date.format(row.created)}</time></p>
  <img class="share-image" src="${image(row.id)}" alt="${esc(row.title)}" width="${row.width}" height="${row.height}" fetchpriority="high">
  <div class="actions share-actions">
    <a class="button primary" href="${image(row.id)}" download="mac-software.webp">下载海报</a>
    <button class="button quiet" data-copy-url>复制分享链接</button>
    <a class="button quiet" href="/#make">我也做一张</a>
  </div>
  <section class="app-list"><h2>推荐清单</h2><ul>${[...groups].map(([label, names]) =>
    `<li><h3>${esc(label)}</h3><div class="tags">${names.map(name => `<a href="${query(name)}">${esc(name)}</a>`).join('')}</div></li>`).join('')}</ul></section>
  <details class="report"><summary>举报这张海报</summary><form data-report="/api/v1/shares/${row.id}/reports"><label for="report-reason">原因</label><textarea id="report-reason" name="reason" required maxlength="200" rows="3"></textarea><button type="submit">提交反馈</button><output role="status"></output></form></details>
</article>` });
}

export function terms({ origin, umamiId }) {
  return frame({ title: '数据与分享说明', origin, umamiId, path: '/privacy', main: `<article class="shell prose">
<h1>数据与分享说明</h1>
<h2>在你的 Mac 上制作</h2><p>Skill 读取本机应用、Spotlight 使用日期和桌面背景，生成本地 PNG。应用安装路径、使用日期、计数和桌面背景源文件留在本机。</p>
<h2>你选择分享后</h2><p>网站接收合成海报、你选的应用名称与分类、标题、分享名和分享范围。壁纸会出现在合成海报中。发布前请选择一张适合分享的背景，并预览海报内容。</p>
<h2>可见范围和撤回</h2><p>公开作品可以出现在画廊和搜索结果。仅链接作品可由拿到链接的人查看。Skill 会在本机保存撤回凭证，撤回后本站停止提供该作品和图片。其他人已保存的副本由对方保管。</p>
<h2>网站访问和举报</h2><p>本站使用 Umami 做访问统计。网站对上传和举报限流。作品页面底部可以提交举报。项目问题可发到 <a href="${email}">GitHub</a>。</p>
</article>` });
}
export function errorPage({ origin, umamiId, status, message }) {
  return frame({ title: String(status), origin, umamiId, hidden: true, main: `<article class="shell prose"><h1>${status}</h1><p>${esc(message)}</p><a class="text-link" href="/">回首页 →</a></article>` });
}
