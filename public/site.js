// Client interactions: copy helpers, `/` shortcut, instant search suggest,
// localStorage Install Kit (Homebrew cart), reason & review upvotes,
// inline community review submission, lightbox, checklist copy,
// upgraded /taste Mac Audit (with ls /Applications paste), and /setup wizard.

const KIT_KEY = 'qiaomu_kit_v1';
const VOTES_KEY = 'qiaomu_reason_votes_v1';
const STUDIO_OWNED_KEY = 'qiaomu_studio_posters_v1';
const TASTE_CARRY_KEY = 'qiaomu_taste_carry_v1';

let toastTimer = null;
function showToast(message) {
  const el = document.getElementById('site-toast');
  if (!el || !message) return;
  el.textContent = message;
  el.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-show'), 2200);
}
window.qiaomuToast = showToast;

async function copy(text, button, doneText = '已复制') {
  if (button.dataset.busy) return;
  button.dataset.busy = '1';
  const original = button.innerHTML;
  const width = button.offsetWidth;
  button.style.minWidth = width + 'px';
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = doneText;
  } catch {
    button.textContent = '请手动复制';
  }
  setTimeout(() => {
    button.innerHTML = original;
    button.style.minWidth = '';
    delete button.dataset.busy;
  }, 1600);
}

for (const button of document.querySelectorAll('button[data-copy]')) {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.copy);
    if (target) copy(target.textContent, button);
  });
}
for (const button of document.querySelectorAll('button[data-copy-url]')) {
  button.addEventListener('click', () => copy(location.href, button));
}

// Copy plain-text checklist on share page
for (const button of document.querySelectorAll('button[data-copy-list]')) {
  button.addEventListener('click', () => {
    const manifestEl = document.getElementById('share-manifest');
    if (!manifestEl) return;
    const data = JSON.parse(manifestEl.textContent);
    const groups = new Map();
    for (const app of data.apps) {
      if (!groups.has(app.group)) groups.set(app.group, []);
      groups.get(app.group).push(app);
    }
    const lines = [`${data.title}（${data.author}${data.role ? ' · ' + data.role : ''}，共 ${data.apps.length} 款 Mac 软件）`, ''];
    for (const [group, apps] of groups) {
      lines.push(`【${group}】`);
      for (const a of apps) lines.push(`- ${a.name}${a.note ? '：' + a.note : ''}`);
      lines.push('');
    }
    lines.push('完整海报与软件详情：' + data.url);
    copy(lines.join('\n'), button, '清单已复制');
  });
}

// Copy poster image to clipboard on /s/:id
for (const button of document.querySelectorAll('button[data-copy-poster-img]')) {
  button.addEventListener('click', async () => {
    const src = button.dataset.copyPosterImg;
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw Error('unsupported');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      const blob = await new Promise(resolve => c.toBlob(resolve, 'image/png'));
      if (!blob) throw Error('blob');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      window.qiaomuToast?.('海报图片已复制，可直接 ⌘V 粘贴');
    } catch {
      window.qiaomuToast?.('当前浏览器不支持复制图片，请点「下载海报」');
    }
  });
}

// Remix poster into /studio on /s/:id
for (const button of document.querySelectorAll('button[data-remix-poster]')) {
  button.addEventListener('click', () => {
    const manifestEl = document.getElementById('share-manifest');
    if (!manifestEl) { location.href = '/studio'; return; }
    try {
      const data = JSON.parse(manifestEl.textContent);
      const carried = (data.apps || []).map(a => ({
        name: a.name,
        key: a.key || a.name.toLowerCase(),
        group: a.group || '效率与工具',
        note: a.note || '',
        icon: a.icon || '',
      }));
      sessionStorage.setItem('qiaomu_taste_carry_v1', JSON.stringify(carried));
    } catch {}
    location.href = '/studio';
  });
}

// Raycast-style `⌘K` / `Ctrl+K` Command Palette + `/` focuses search
const headerSearch = document.getElementById('header-q');
const headerKbd = document.querySelector('.header-search kbd');
const cmdkDialog = document.getElementById('cmdk-dialog');
const cmdkInput = document.getElementById('cmdk-input');
const cmdkResults = document.getElementById('cmdk-results');

if (headerKbd && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)) {
  headerKbd.textContent = '⌘K';
}

const CMDK_QUICK_ACTIONS = [
  { label: '制作我的 Mac 软件海报', sub: '200+ 真实图标 · 20 张壁纸 · 16:9 / 3:4 双画幅', href: '/studio', badge: '制作台' },
  { label: '付费软件开源平替大全', sub: '37 组 CleanShot / Cursor / Conductor / Bartender 0 元平替', href: '/alternatives', badge: '省钱' },
  { label: '真实 Mac 生态数据洞察', sub: '实时装机穿透率、黄金搭档组合与开源/Brew 占比', href: '/insights', badge: '洞察' },
  { label: 'AI Harness & Agent 工具精选', sub: 'Paseo、Claude Code、Codex、OpenCode、OpenClaw、Conductor', href: '/apps?theme=harness', badge: '热门' },
  { label: '新 Mac 5 分钟装机包', sub: '6 套场景套餐，一键生成 Homebrew 装机脚本', href: '/setup', badge: '装机' },
  { label: 'Mac 软件体检 & 查漏补缺', sub: '粘贴本机应用列表，找出同频高手都在用的神器', href: '/taste', badge: '体检' },
  { label: '同类软件二选一对比', sub: 'Paseo vs Conductor · Ollama vs LM Studio · Raycast vs Alfred', href: '/compare', badge: '对比' },
  { label: '随机逛逛一款宝藏软件', sub: '发现站内有真实走心评价的软件', href: '/random', badge: '漫游' },
];

let openCmdk = () => {};
if (cmdkDialog && cmdkInput && cmdkResults) {
  let cmdkTimer = null;
  let cmdkItems = [];
  let cmdkIdx = 0;

  const setCmdkActive = (idx) => {
    cmdkItems.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    cmdkIdx = idx;
    cmdkItems[idx]?.scrollIntoView({ block: 'nearest' });
  };

  const renderCmdkList = (groups) => {
    cmdkResults.replaceChildren();
    cmdkItems = [];
    for (const group of groups) {
      if (!group.items.length) continue;
      const g = document.createElement('div');
      g.className = 'cmdk-group';
      g.textContent = group.title;
      cmdkResults.append(g);
      for (const item of group.items) {
        const a = document.createElement('a');
        a.className = 'cmdk-item';
        a.role = 'option';
        a.href = item.href;
        if (item.icon) {
          const img = document.createElement('img');
          img.src = item.icon;
          img.width = 24;
          img.height = 24;
          img.alt = '';
          a.append(img);
        }
        const wrap = document.createElement('span');
        wrap.className = 'cmdk-item-wrap';
        const name = document.createElement('span');
        name.className = 'cmdk-item-name';
        name.textContent = item.label;
        wrap.append(name);
        if (item.sub) {
          const sub = document.createElement('span');
          sub.className = 'cmdk-item-sub';
          sub.textContent = item.sub;
          wrap.append(sub);
        }
        const meta = document.createElement('span');
        meta.className = 'cmdk-item-meta num';
        meta.textContent = item.badge || '';
        a.append(wrap, meta);
        a.addEventListener('mouseenter', () => {
          const i = cmdkItems.indexOf(a);
          if (i >= 0) setCmdkActive(i);
        });
        cmdkResults.append(a);
        cmdkItems.push(a);
      }
    }
    if (!cmdkItems.length) {
      const empty = document.createElement('p');
      empty.className = 'cmdk-empty';
      empty.textContent = '没有找到匹配项，按回车前往完整软件榜搜索';
      cmdkResults.append(empty);
    } else {
      setCmdkActive(0);
    }
  };

  const queryCmdk = async () => {
    const q = cmdkInput.value.trim();
    if (!q) {
      renderCmdkList([{ title: '快捷入口', items: CMDK_QUICK_ACTIONS }]);
      return;
    }
    try {
      const res = await fetch('/api/v1/suggest?q=' + encodeURIComponent(q));
      if (!res.ok) return;
      const data = await res.json();
      const appEntries = (data.apps || []).map(a => ({
        label: a.name,
        sub: a.summary || '',
        icon: a.icon || '',
        href: '/apps/' + encodeURIComponent(a.key),
        badge: a.curatedOnly ? (a.pricing || '精选收录') : `${a.count} 票`,
      }));
      const catEntries = (data.categories || []).map(c => ({
        label: c.name,
        sub: '分类浏览',
        href: '/apps?category=' + encodeURIComponent(c.name),
        badge: `${c.count} 款`,
      }));
      const quickHits = CMDK_QUICK_ACTIONS.filter(x => (x.label + x.sub).toLowerCase().includes(q.toLowerCase())).slice(0, 3);
      renderCmdkList([
        { title: '匹配软件（含 200+ AI & Mac 应用）', items: appEntries },
        { title: '分类', items: catEntries },
        { title: '站内工具', items: quickHits },
      ]);
    } catch {}
  };

  openCmdk = () => {
    if (cmdkDialog.open) { cmdkDialog.close(); return; }
    cmdkInput.value = '';
    renderCmdkList([{ title: '快捷入口', items: CMDK_QUICK_ACTIONS }]);
    cmdkDialog.showModal();
    cmdkInput.focus();
  };

  cmdkInput.addEventListener('input', () => {
    clearTimeout(cmdkTimer);
    cmdkTimer = setTimeout(queryCmdk, 110);
  });
  cmdkInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && cmdkItems.length) {
      e.preventDefault();
      setCmdkActive((cmdkIdx + 1) % cmdkItems.length);
    } else if (e.key === 'ArrowUp' && cmdkItems.length) {
      e.preventDefault();
      setCmdkActive((cmdkIdx - 1 + cmdkItems.length) % cmdkItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (cmdkItems[cmdkIdx]) location.href = cmdkItems[cmdkIdx].href;
      else if (cmdkInput.value.trim()) location.href = '/apps?q=' + encodeURIComponent(cmdkInput.value.trim());
    }
  });
  headerKbd?.addEventListener('click', (e) => { e.preventDefault(); openCmdk(); });
}

document.addEventListener('keydown', event => {
  const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
  const isSlash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey;
  if (isCmdK && cmdkDialog) {
    event.preventDefault();
    if (document.querySelector('dialog[open]:not(#cmdk-dialog)')) return;
    openCmdk();
    return;
  }
  if (!isSlash || !headerSearch) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
  if (document.querySelector('dialog[open]')) return;
  event.preventDefault();
  const pageSearch = document.querySelector('main input[type="search"]');
  const field = pageSearch && pageSearch.offsetParent !== null ? pageSearch : headerSearch;
  field.focus();
  field.select();
});

// Instant search autocomplete (supports app names, aliases, and Chinese pain-point needs!)
if (headerSearch) {
  const menu = document.getElementById('header-suggest');
  let timer = null;
  let activeIndex = -1;
  let items = [];

  const closeMenu = () => {
    menu.hidden = true;
    menu.replaceChildren();
    headerSearch.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
    items = [];
  };

  const highlight = (idx) => {
    const nodes = menu.querySelectorAll('.suggest-item');
    nodes.forEach((n, i) => n.classList.toggle('is-active', i === idx));
    activeIndex = idx;
  };

  const renderSuggest = (data) => {
    menu.replaceChildren();
    items = [];
    if (!data.apps?.length && !data.categories?.length) { closeMenu(); return; }
    if (data.apps?.length) {
      const label = document.createElement('div');
      label.className = 'suggest-group';
      label.textContent = '匹配软件';
      menu.append(label);
      for (const app of data.apps) {
        const a = document.createElement('a');
        a.className = 'suggest-item';
        a.role = 'option';
        a.href = '/apps/' + encodeURIComponent(app.key);
        if (app.icon) {
          const img = document.createElement('img');
          img.src = app.icon;
          img.alt = '';
          img.width = 24;
          img.height = 24;
          a.append(img);
        }
        const wrap = document.createElement('span');
        wrap.className = 'suggest-item-wrap';
        const name = document.createElement('span');
        name.className = 'suggest-item-name';
        name.textContent = app.name;
        wrap.append(name);
        if (app.summary) {
          const sub = document.createElement('span');
          sub.className = 'suggest-item-sub';
          sub.textContent = app.summary;
          wrap.append(sub);
        }
        const meta = document.createElement('span');
        meta.className = 'suggest-item-meta num';
        meta.textContent = app.curatedOnly ? (app.pricing || '精选收录') : `${app.count} 票`;
        a.append(wrap, meta);
        menu.append(a);
        items.push(a);
      }
    }
    if (data.categories?.length) {
      const label = document.createElement('div');
      label.className = 'suggest-group';
      label.textContent = '分类';
      menu.append(label);
      for (const cat of data.categories) {
        const a = document.createElement('a');
        a.className = 'suggest-item';
        a.role = 'option';
        a.href = '/apps?category=' + encodeURIComponent(cat.name);
        const name = document.createElement('span');
        name.className = 'suggest-item-name';
        name.textContent = cat.name;
        const meta = document.createElement('span');
        meta.className = 'suggest-item-meta num';
        meta.textContent = `${cat.count} 款`;
        a.append(name, meta);
        menu.append(a);
        items.push(a);
      }
    }
    menu.hidden = false;
    headerSearch.setAttribute('aria-expanded', 'true');
    activeIndex = -1;
  };

  headerSearch.addEventListener('input', () => {
    clearTimeout(timer);
    const q = headerSearch.value.trim();
    if (!q) { closeMenu(); return; }
    timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/suggest?q=' + encodeURIComponent(q));
        if (res.ok && headerSearch.value.trim() === q) renderSuggest(await res.json());
      } catch {}
    }, 140);
  });

  headerSearch.addEventListener('keydown', event => {
    if (menu.hidden || !items.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); highlight((activeIndex + 1) % items.length); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); highlight((activeIndex - 1 + items.length) % items.length); }
    else if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); location.href = items[activeIndex].href; }
    else if (event.key === 'Escape') { closeMenu(); }
  });

  document.addEventListener('click', event => {
    if (!headerSearch.closest('[data-suggest-wrap]')?.contains(event.target)) closeMenu();
  });
}

// Report form
for (const form of document.querySelectorAll('form[data-report]')) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('output');
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      const response = await fetch(form.dataset.report, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: new FormData(form).get('reason') }),
      });
      if (!response.ok) throw Error((await response.json()).error);
      form.reset();
      status.textContent = '已收到反馈。';
    } catch (error) {
      status.textContent = error.message || '暂时无法提交。';
    } finally { button.disabled = false; }
  });
}

// Community quick review/tip form on /apps/:key
for (const form of document.querySelectorAll('form[data-review-form]')) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('output');
    const button = form.querySelector('button[type="submit"]');
    const fd = new FormData(form);
    button.disabled = true;
    status.textContent = '提交中…';
    try {
      const res = await fetch(form.dataset.reviewForm, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: fd.get('kind'),
          author: fd.get('author'),
          note: fd.get('note'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');
      form.reset();
      status.textContent = '已发布！感谢你的真实经验。';
      const empty = document.getElementById('reasons-empty');
      if (empty) empty.remove();
      const list = document.getElementById('app-reasons-list');
      if (list) {
        const kinds = { recommend: '体验点评', tip: '使用技巧', caveat: '避坑提醒' };
        const li = document.createElement('li');
        li.className = 'reason';
        const body = document.createElement('div');
        body.className = 'reason-body';
        const bq = document.createElement('blockquote');
        const p = document.createElement('p');
        p.textContent = `「${data.note}」`;
        bq.append(p);
        const foot = document.createElement('div');
        foot.className = 'reason-foot';
        const by = document.createElement('p');
        by.className = 'reason-by';
        const tag = document.createElement('span');
        tag.className = 'mini-tag';
        tag.textContent = kinds[data.kind] || '体验点评';
        const author = document.createElement('span');
        author.className = 'author';
        author.textContent = ' ' + data.author + ' · 刚刚';
        by.append(tag, author);
        foot.append(by);
        body.append(bq, foot);
        li.append(body);
        list.prepend(li);
      }
    } catch (err) {
      status.textContent = err.message || '提交失败，请稍后重试。';
    } finally {
      button.disabled = false;
    }
  });
}

// Dialog triggers + outside click fallback
function wireDialogBackdrop(dialog) {
  if (!dialog || 'closedBy' in dialog) return;
  const outside = (event) => {
    const frame = dialog.getBoundingClientRect();
    return event.clientX < frame.left || event.clientX > frame.right ||
      event.clientY < frame.top || event.clientY > frame.bottom;
  };
  let beganOutside = false;
  dialog.addEventListener('pointerdown', event => { beganOutside = outside(event); });
  dialog.addEventListener('pointerup', event => { if (beganOutside && outside(event)) dialog.close(); });
}
for (const dialog of document.querySelectorAll('dialog')) wireDialogBackdrop(dialog);
for (const button of document.querySelectorAll('[data-dialog]')) {
  const dialog = document.getElementById(button.dataset.dialog);
  if (dialog) button.addEventListener('click', () => dialog.showModal());
}

// Poster Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
for (const trigger of document.querySelectorAll('[data-lightbox]')) {
  trigger.addEventListener('click', () => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = trigger.dataset.lightbox;
    lightboxImg.alt = trigger.dataset.lightboxAlt || '';
    lightbox.showModal();
  });
}

// Reveal studio edit button if this browser created the poster
const ownerLink = document.getElementById('studio-edit-link');
if (ownerLink) {
  try {
    const owned = JSON.parse(localStorage.getItem(STUDIO_OWNED_KEY) || '[]');
    if (owned.some(item => item.id === ownerLink.dataset.shareOwnerId)) ownerLink.hidden = false;
  } catch {}
}

// Reason & Review voting
function readVoted() {
  try { return new Set(JSON.parse(localStorage.getItem(VOTES_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveVoted(set) {
  try { localStorage.setItem(VOTES_KEY, JSON.stringify([...set].slice(-200))); } catch {}
}
const votedSet = readVoted();
for (const btn of document.querySelectorAll('[data-vote-reason]')) {
  const voteKey = `${btn.dataset.shareId}:${btn.dataset.appKey}`;
  if (votedSet.has(voteKey)) btn.setAttribute('aria-pressed', 'true');
  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    try {
      const res = await fetch('/api/v1/reasons/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shareId: btn.dataset.shareId, appKey: btn.dataset.appKey }),
      });
      if (!res.ok) return;
      const data = await res.json();
      btn.setAttribute('aria-pressed', data.voted ? 'true' : 'false');
      const numEl = btn.querySelector('.vote-num');
      if (numEl) numEl.textContent = String(data.votes);
      if (data.voted) votedSet.add(voteKey);
      else votedSet.delete(voteKey);
      saveVoted(votedSet);
    } finally { btn.disabled = false; }
  });
}
for (const btn of document.querySelectorAll('[data-vote-review]')) {
  const voteKey = `review:${btn.dataset.reviewId}`;
  if (votedSet.has(voteKey)) btn.setAttribute('aria-pressed', 'true');
  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    try {
      const res = await fetch('/api/v1/reviews/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reviewId: Number(btn.dataset.reviewId) }),
      });
      if (!res.ok) return;
      const data = await res.json();
      btn.setAttribute('aria-pressed', data.voted ? 'true' : 'false');
      const numEl = btn.querySelector('.vote-num');
      if (numEl) numEl.textContent = String(data.votes);
      if (data.voted) votedSet.add(voteKey);
      else votedSet.delete(voteKey);
      saveVoted(votedSet);
    } finally { btn.disabled = false; }
  });
}

// LocalStorage Install Kit (Homebrew Cask Cart)
function loadKit() {
  try {
    const raw = JSON.parse(localStorage.getItem(KIT_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
function saveKit(list) {
  try { localStorage.setItem(KIT_KEY, JSON.stringify(list)); } catch {}
}
function addToKit(app) {
  const kit = loadKit();
  if (!kit.some(x => x.key === app.key)) {
    kit.push({ key: app.key, name: app.name, cask: app.cask || '', homepage: app.homepage || '', icon: app.icon || '' });
    saveKit(kit);
  }
  syncKitUI();
}

const kitFab = document.getElementById('kit-fab');
const kitFabCount = document.getElementById('kit-fab-count');
const kitDialog = document.getElementById('kit-dialog');
const kitListEl = document.getElementById('kit-list');
const kitExportEl = document.getElementById('kit-export');
const kitBrewCmdEl = document.getElementById('kit-brew-cmd');

function syncKitUI() {
  const kit = loadKit();
  const keys = new Set(kit.map(item => item.key));
  if (kitFab && kitFabCount) {
    kitFab.hidden = kit.length === 0;
    kitFabCount.textContent = String(kit.length);
  }
  const plusSvg = '<svg class="glyph" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
  const checkSvg = '<svg class="glyph" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  for (const btn of document.querySelectorAll('[data-kit-toggle]')) {
    try {
      const app = JSON.parse(btn.dataset.kitToggle);
      const inKit = keys.has(app.key);
      btn.setAttribute('aria-pressed', inKit ? 'true' : 'false');
      const span = btn.querySelector('span');
      if (span) span.textContent = inKit ? '已在装机清单' : '加入装机清单';
      else {
        btn.title = inKit ? '从装机清单移除' : '加入装机清单';
        btn.innerHTML = inKit ? checkSvg : plusSvg;
      }
    } catch {}
  }
  if (kitDialog?.open) renderKitDialog();
}

function renderKitDialog() {
  const kit = loadKit();
  kitListEl.replaceChildren();
  if (!kit.length) {
    const li = document.createElement('li');
    li.className = 'kit-item';
    li.textContent = '装机清单还是空的，逛软件榜、体检或海报时点击 + 即可收集。';
    kitListEl.append(li);
    kitExportEl.hidden = true;
    return;
  }
  for (const app of kit) {
    const li = document.createElement('li');
    li.className = 'kit-item';
    if (app.icon) {
      const img = document.createElement('img');
      img.src = '/icons/' + app.icon + '.webp';
      img.width = 32;
      img.height = 32;
      img.alt = '';
      li.append(img);
    }
    const info = document.createElement('div');
    info.className = 'kit-item-info';
    const name = document.createElement('div');
    name.className = 'kit-item-name';
    name.textContent = app.name;
    const meta = document.createElement('div');
    meta.className = 'kit-item-meta';
    meta.textContent = app.cask ? `brew install --cask ${app.cask}` : (app.homepage || '需前往官网或 App Store 下载');
    info.append(name, meta);
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'button secondary small';
    rm.textContent = '移除';
    rm.addEventListener('click', () => {
      saveKit(loadKit().filter(x => x.key !== app.key));
      syncKitUI();
      renderKitDialog();
    });
    li.append(info, rm);
    kitListEl.append(li);
  }
  const casks = kit.map(a => a.cask).filter(Boolean);
  kitBrewCmdEl.textContent = casks.length
    ? `brew install --cask ${casks.join(' ')}`
    : '# 当前清单中的软件暂无 Homebrew Cask 记录，可导出 Markdown 清单查看官网链接';
  kitExportEl.hidden = false;
}

for (const btn of document.querySelectorAll('[data-kit-toggle]')) {
  btn.addEventListener('click', () => {
    const app = JSON.parse(btn.dataset.kitToggle);
    const kit = loadKit();
    const idx = kit.findIndex(x => x.key === app.key);
    if (idx >= 0) {
      kit.splice(idx, 1);
      showToast(`已移除 ${app.name}`);
    } else {
      kit.push(app);
      showToast(`已将 ${app.name} 加入装机清单`);
    }
    saveKit(kit);
    syncKitUI();
  });
}

for (const btn of document.querySelectorAll('[data-kit-batch]')) {
  btn.addEventListener('click', () => {
    const manifestEl = document.getElementById('share-manifest');
    if (!manifestEl) return;
    const data = JSON.parse(manifestEl.textContent);
    const kit = loadKit();
    const map = new Map(kit.map(x => [x.key, x]));
    for (const a of data.apps) {
      if (!map.has(a.key)) map.set(a.key, { key: a.key, name: a.name, cask: a.cask || '', homepage: a.homepage || '', icon: a.icon || '' });
    }
    saveKit([...map.values()]);
    syncKitUI();
    renderKitDialog();
    kitDialog?.showModal();
  });
}

kitFab?.addEventListener('click', () => { renderKitDialog(); kitDialog.showModal(); });
document.getElementById('kit-copy-brew')?.addEventListener('click', (e) => copy(kitBrewCmdEl.textContent, e.currentTarget));
document.getElementById('kit-download-brewfile')?.addEventListener('click', () => {
  const kit = loadKit();
  const lines = ['# Generated by 乔木软件推荐 (software.qiaomu.ai)', ''];
  for (const a of kit) {
    if (a.cask) lines.push(`cask "${a.cask}" # ${a.name}`);
    else lines.push(`# ${a.name}${a.homepage ? ' - ' + a.homepage : ''}`);
  }
  const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Brewfile';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
document.getElementById('kit-copy-md')?.addEventListener('click', (e) => {
  const kit = loadKit();
  const lines = ['# 我的 Mac 装机清单', ''];
  for (const a of kit) {
    const extra = [a.cask ? `\`brew install --cask ${a.cask}\`` : '', a.homepage ? `[官网](${a.homepage})` : ''].filter(Boolean).join(' · ');
    lines.push(`- **${a.name}**${extra ? ' — ' + extra : ''}`);
  }
  copy(lines.join('\n'), e.currentTarget, 'Markdown 已复制');
});
document.getElementById('kit-clear')?.addEventListener('click', () => { saveKit([]); syncKitUI(); renderKitDialog(); });
syncKitUI();

// New Mac Setup Wizard (/setup)
const setupRoot = document.querySelector('[data-setup-app]');
if (setupRoot) {
  const packs = JSON.parse(document.getElementById('setup-packs-data')?.textContent || '[]');
  const itemsEl = document.getElementById('setup-items');
  const countEl = document.getElementById('setup-selected-count');
  const onelinerEl = document.getElementById('setup-oneliner');
  const manualCard = document.getElementById('setup-manual-card');
  const manualList = document.getElementById('setup-manual-list');

  let activePack = packs[0] || { items: [] };
  const picked = new Map(); // key -> item
  for (const item of activePack.items || []) picked.set(item.key, item);

  function buildBrewCommand() {
    const casks = [...picked.values()].map(i => i.cask).filter(Boolean);
    if (!casks.length) return '# 请至少勾选一款支持 Homebrew Cask 的软件';
    return `command -v brew >/dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"; brew install --cask ${casks.join(' ')}`;
  }

  function renderSetupOutput() {
    countEl.textContent = String(picked.size);
    onelinerEl.textContent = buildBrewCommand();
    const manual = [...picked.values()].filter(i => !i.cask);
    manualList.replaceChildren();
    manualCard.hidden = manual.length === 0;
    for (const a of manual) {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = a.name;
      li.append(strong);
      if (a.masUrl || a.homepage) {
        const link = document.createElement('a');
        link.className = 'text-link';
        link.href = a.masUrl || a.homepage;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = a.masUrl ? 'App Store →' : '官网下载 →';
        li.append(' ', link);
      }
      manualList.append(li);
    }
  }

  function renderPackItems() {
    itemsEl.replaceChildren();
    for (const item of activePack.items || []) {
      const li = document.createElement('li');
      li.className = 'setup-item' + (picked.has(item.key) ? ' is-picked' : '');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = picked.has(item.key);
      cb.addEventListener('change', () => {
        if (cb.checked) picked.set(item.key, item);
        else picked.delete(item.key);
        li.classList.toggle('is-picked', cb.checked);
        renderSetupOutput();
      });

      const body = document.createElement('div');
      body.className = 'setup-item-body';
      const top = document.createElement('div');
      top.className = 'setup-item-top';
      const name = document.createElement('strong');
      name.textContent = item.name;
      top.append(name);
      if (item.pricing) {
        const tag = document.createElement('span');
        tag.className = 'mini-tag' + (item.pricing === '开源免费' ? ' is-foss' : '');
        tag.textContent = item.pricing;
        top.append(tag);
      }
      if (item.cask) {
        const tag = document.createElement('span');
        tag.className = 'mini-tag is-brew';
        tag.textContent = 'brew';
        top.append(tag);
      }
      if (item.count > 0) {
        const cnt = document.createElement('span');
        cnt.className = 'setup-votes num';
        cnt.textContent = `${item.count} 票`;
        top.append(cnt);
      }
      body.append(top);
      if (item.summary) {
        const p = document.createElement('p');
        p.textContent = item.summary;
        body.append(p);
      }

      const label = document.createElement('label');
      label.className = 'setup-item-label';
      label.append(cb);
      if (item.icon) {
        const img = document.createElement('img');
        img.src = '/icons/' + item.icon + '.webp';
        img.width = 36;
        img.height = 36;
        img.alt = '';
        label.append(img);
      }
      label.append(body);
      li.append(label);
      itemsEl.append(li);
    }
    renderSetupOutput();
  }

  for (const btn of document.querySelectorAll('[data-setup-pack]')) {
    btn.addEventListener('click', () => {
      const found = packs.find(p => p.id === btn.dataset.setupPack);
      if (!found) return;
      activePack = found;
      picked.clear();
      for (const item of found.items) picked.set(item.key, item);
      for (const other of document.querySelectorAll('[data-setup-pack]')) {
        const on = other === btn;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-selected', on ? 'true' : 'false');
      }
      renderPackItems();
    });
  }

  document.getElementById('setup-select-all')?.addEventListener('click', () => {
    for (const item of activePack.items || []) picked.set(item.key, item);
    renderPackItems();
  });
  document.getElementById('setup-clear')?.addEventListener('click', () => {
    picked.clear();
    renderPackItems();
  });
  document.getElementById('setup-copy-cmd')?.addEventListener('click', (e) => copy(onelinerEl.textContent, e.currentTarget));
  document.getElementById('setup-download-sh')?.addEventListener('click', () => {
    const casks = [...picked.values()].filter(i => i.cask);
    const manual = [...picked.values()].filter(i => !i.cask);
    const lines = [
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      '# Generated by 乔木软件推荐 (https://software.qiaomu.ai/setup)',
      '',
      'if ! command -v brew >/dev/null 2>&1; then',
      '  echo ">>> 正在安装 Homebrew..."',
      '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
      'fi',
      '',
    ];
    if (casks.length) {
      lines.push(`echo ">>> 正在安装 ${casks.length} 款 Mac 软件..."`);
      lines.push(`brew install --cask ${casks.map(c => c.cask).join(' ')}`);
    }
    if (manual.length) {
      lines.push('', 'echo ""', 'echo ">>> 以下软件需前往官网或 App Store 手动下载："');
      for (const m of manual) lines.push(`echo "  - ${m.name}: ${m.masUrl || m.homepage || 'https://software.qiaomu.ai/apps/' + encodeURIComponent(m.key)}"`);
    }
    lines.push('', 'echo ">>> 装机完成！"');
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/x-shellscript;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'setup-mac.sh';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  document.getElementById('setup-download-brewfile')?.addEventListener('click', () => {
    const lines = ['# Generated by 乔木软件推荐 (https://software.qiaomu.ai/setup)', ''];
    for (const a of picked.values()) {
      if (a.cask) lines.push(`cask "${a.cask}" # ${a.name}`);
      else lines.push(`# ${a.name}${a.homepage ? ' - ' + a.homepage : ''}`);
    }
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Brewfile';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  document.getElementById('setup-to-kit')?.addEventListener('click', (e) => {
    for (const a of picked.values()) addToKit(a);
    e.currentTarget.textContent = '已存入装机清单';
    window.qiaomuToast?.(`已将 ${picked.size} 款软件存入装机清单`);
    setTimeout(() => { e.currentTarget.textContent = '存入装机清单'; }, 1600);
  });
  document.getElementById('setup-to-studio')?.addEventListener('click', () => {
    const carried = [...picked.values()].map(a => ({
      name: a.name,
      key: a.key,
      group: 'AI 与开发',
      icon: a.icon || '',
    }));
    if (!carried.length) { window.qiaomuToast?.('请先勾选至少 1 款软件'); return; }
    try { sessionStorage.setItem('qiaomu_taste_carry_v1', JSON.stringify(carried)); } catch {}
    location.href = '/studio';
  });
  renderPackItems();
}

// Upgraded Taste Test & Mac Audit (/taste)
const tasteRoot = document.querySelector('[data-taste-app]');
if (tasteRoot) {
  const selected = new Map();
  const input = document.getElementById('taste-input');
  const addBtn = document.getElementById('taste-add-btn');
  const countEl = document.getElementById('taste-count');
  const clearBtn = document.getElementById('taste-clear');
  const submitBtn = document.getElementById('taste-submit');
  const selectedWrap = document.getElementById('taste-selected');
  const resultEl = document.getElementById('taste-result');
  const pasteArea = document.getElementById('taste-paste');
  const pasteBtn = document.getElementById('taste-paste-run');

  const syncTaste = () => {
    countEl.textContent = String(selected.size);
    clearBtn.hidden = selected.size === 0;
    submitBtn.disabled = selected.size === 0;
    selectedWrap.replaceChildren();
    for (const [k, item] of selected) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip-clear';
      const val = document.createElement('span');
      val.className = 'chip-value';
      val.textContent = item.name;
      const x = document.createElement('span');
      x.className = 'chip-x';
      x.textContent = '×';
      chip.append(val, x);
      chip.addEventListener('click', () => { selected.delete(k); syncTaste(); });
      selectedWrap.append(chip);
    }
    for (const btn of document.querySelectorAll('[data-taste-chip]')) {
      btn.setAttribute('aria-pressed', selected.has(btn.dataset.tasteKey) ? 'true' : 'false');
    }
  };

  for (const btn of document.querySelectorAll('[data-taste-chip]')) {
    btn.addEventListener('click', () => {
      const key = btn.dataset.tasteKey;
      if (selected.has(key)) selected.delete(key);
      else if (selected.size < 48) {
        selected.set(key, { name: btn.dataset.tasteChip, key, icon: btn.dataset.tasteIcon || '', group: btn.dataset.tasteCat || '效率' });
      }
      syncTaste();
    });
  }

  const addCustom = () => {
    const name = input.value.trim();
    if (!name || selected.size >= 48) return;
    const key = name.toLowerCase();
    if (!selected.has(key)) selected.set(key, { name, key, icon: '', group: '效率' });
    input.value = '';
    syncTaste();
  };
  addBtn?.addEventListener('click', addCustom);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } });
  clearBtn?.addEventListener('click', () => { selected.clear(); resultEl.hidden = true; syncTaste(); });

  async function runAudit(payload) {
    submitBtn.disabled = true;
    if (pasteBtn) pasteBtn.disabled = true;
    try {
      const res = await fetch('/api/v1/taste', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '分析失败');
      if (payload.rawText && Array.isArray(data.details)) {
        selected.clear();
        for (const d of data.details) {
          selected.set(d.key, { name: d.name, key: d.key, icon: d.icon || '', group: d.categories?.[0] || '效率' });
        }
        syncTaste();
      }
      renderTasteResult(data);
    } catch (err) {
      resultEl.hidden = false;
      resultEl.textContent = err.message || '暂时无法分析，请稍后再试。';
    } finally {
      submitBtn.disabled = selected.size === 0;
      if (pasteBtn) pasteBtn.disabled = false;
    }
  }

  submitBtn?.addEventListener('click', () => runAudit({ apps: [...selected.values()].map(x => x.name) }));
  pasteBtn?.addEventListener('click', () => {
    const rawText = pasteArea?.value?.trim();
    if (!rawText) { pasteArea?.focus(); return; }
    runAudit({ rawText });
  });

  function mkQuickKitBtn(app) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'button secondary small';
    btn.textContent = '+ 装机清单';
    btn.addEventListener('click', () => {
      addToKit(app);
      btn.textContent = '已加入 ✓';
    });
    return btn;
  }

  function renderTasteResult(data) {
    resultEl.replaceChildren();
    resultEl.hidden = false;
    const coveredCount = (data.gapAudit || []).filter(s => s.covered).length;
    const totalSlots = (data.gapAudit || []).length;

    const header = document.createElement('div');
    header.className = 'taste-persona';
    const left = document.createElement('div');
    const eyebrow = document.createElement('p');
    eyebrow.className = 'track-eyebrow';
    eyebrow.textContent = '你的 Mac 软件体检报告';
    const title = document.createElement('h2');
    title.textContent = data.persona;
    left.append(eyebrow, title);

    const metrics = document.createElement('div');
    metrics.className = 'taste-metrics';
    const mkMetric = (val, label) => {
      const box = document.createElement('div');
      box.className = 'taste-metric';
      const n = document.createElement('span');
      n.className = 'num';
      n.textContent = val;
      const l = document.createElement('span');
      l.textContent = label;
      box.append(n, l);
      return box;
    };
    metrics.append(
      mkMetric(`${coveredCount} / ${totalSlots}`, '效率场景覆盖'),
      mkMetric(`${data.uniqueness}%`, '小众独特度'),
      mkMetric(`${data.avgRate}%`, '平均撞款率')
    );
    header.append(left, metrics);
    resultEl.append(header);

    // 1. Collaborative filtering: what peers use that you don't
    if (data.missingRecommended?.length) {
      const sec = document.createElement('div');
      sec.className = 'audit-section';
      const h = document.createElement('h3');
      h.textContent = '同频高手都在用，但你还没装的神器';
      const sub = document.createElement('p');
      sub.className = 'kit-sub';
      sub.textContent = '根据与你装机最像的真实桌面海报做差集推荐（已排除系统自带应用）：';
      const grid = document.createElement('ul');
      grid.className = 'audit-rec-grid';
      for (const app of data.missingRecommended) {
        const li = document.createElement('li');
        li.className = 'audit-rec-card';
        const top = document.createElement('div');
        top.className = 'audit-rec-top';
        if (app.icon) {
          const img = document.createElement('img');
          img.src = '/icons/' + app.icon + '.webp';
          img.width = 40;
          img.height = 40;
          img.alt = '';
          top.append(img);
        }
        const info = document.createElement('div');
        info.className = 'audit-rec-info';
        const a = document.createElement('a');
        a.href = '/apps/' + encodeURIComponent(app.key);
        a.className = 'audit-rec-name';
        a.textContent = app.name;
        const meta = document.createElement('p');
        meta.className = 'audit-rec-meta';
        meta.textContent = `${app.totalPeers} 位同频用户中有 ${app.peerCount} 位在用${app.pricing ? ' · ' + app.pricing : ''}`;
        info.append(a, meta);
        top.append(info, mkQuickKitBtn(app));
        li.append(top);
        if (app.summary) {
          const desc = document.createElement('p');
          desc.className = 'audit-rec-desc';
          desc.textContent = app.summary;
          li.append(desc);
        }
        grid.append(li);
      }
      sec.append(h, sub, grid);
      resultEl.append(sec);
    }

    // 2. 7-Pillar Productivity Gap Audit
    if (data.gapAudit?.length) {
      const sec = document.createElement('div');
      sec.className = 'audit-section';
      const h = document.createElement('h3');
      h.textContent = '7 项核心效率位体检';
      const ul = document.createElement('ul');
      ul.className = 'gap-grid';
      for (const slot of data.gapAudit) {
        const li = document.createElement('li');
        li.className = 'gap-card ' + (slot.covered ? 'is-ok' : 'is-gap');
        const head = document.createElement('div');
        head.className = 'gap-head';
        const name = document.createElement('strong');
        name.textContent = (slot.covered ? '✓ ' : '○ ') + slot.name;
        const badge = document.createElement('span');
        badge.className = 'mini-tag' + (slot.covered ? '' : ' is-brew');
        badge.textContent = slot.covered ? '已覆盖' : '可补齐';
        head.append(name, badge);
        li.append(head);

        const desc = document.createElement('p');
        desc.className = 'gap-why';
        desc.textContent = slot.covered ? `你已安装：${slot.matched.join('、')}` : slot.why;
        li.append(desc);

        if (!slot.covered) {
          const picks = document.createElement('div');
          picks.className = 'gap-picks';
          const addPickRow = (label, pick) => {
            if (!pick) return;
            const row = document.createElement('div');
            row.className = 'gap-pick-row';
            const link = document.createElement('a');
            link.href = pick.inCatalog ? '/apps/' + encodeURIComponent(pick.key) : (pick.homepage || '/apps');
            if (!pick.inCatalog && pick.homepage) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
            link.textContent = `${label}：${pick.name}`;
            row.append(link, mkQuickKitBtn(pick));
            picks.append(row);
          };
          addPickRow('口碑冠军', slot.champion);
          if (slot.freePick) addPickRow('免费平替', slot.freePick);
          li.append(picks);
        }
        ul.append(li);
      }
      sec.append(h, ul);
      resultEl.append(sec);
    }

    // 3. Mainstream & Niche bars
    const cols = document.createElement('div');
    cols.className = 'taste-columns';
    const buildBarBox = (heading, list, emptyMsg) => {
      const box = document.createElement('div');
      box.className = 'taste-box';
      const h = document.createElement('h3');
      h.textContent = heading;
      box.append(h);
      if (!list.length) {
        const p = document.createElement('p');
        p.className = 'kit-sub';
        p.textContent = emptyMsg;
        box.append(p);
        return box;
      }
      const wrap = document.createElement('div');
      wrap.className = 'taste-bars';
      for (const item of list) {
        const row = document.createElement('div');
        row.className = 'taste-bar-row';
        const head = document.createElement('div');
        head.className = 'taste-bar-head';
        const name = document.createElement('span');
        name.textContent = item.name;
        const pct = document.createElement('span');
        pct.className = 'num';
        pct.textContent = item.count === 0 ? '全站首发独门武器' : `${item.rate}% 海报也在用 (${item.count} 张)`;
        head.append(name, pct);
        const track = document.createElement('div');
        track.className = 'taste-bar-track';
        const fill = document.createElement('div');
        fill.className = 'taste-bar-fill';
        fill.style.width = Math.max(4, Math.min(100, item.rate)) + '%';
        track.append(fill);
        row.append(head, track);
        wrap.append(row);
      }
      box.append(wrap);
      return box;
    };
    cols.append(
      buildBarBox('最撞款的大众标配', data.mainstream, '你选的软件目前都还没撞款！'),
      buildBarBox('最独特的宝藏小众', data.niche, '暂无数据')
    );
    resultEl.append(cols);

    // 4. Similar real desktops
    if (data.similar?.length) {
      const simTitle = document.createElement('h3');
      simTitle.textContent = '全站和你口味最像的真实桌面';
      resultEl.append(simTitle);
      const simGrid = document.createElement('div');
      simGrid.className = 'taste-similar-grid';
      for (const p of data.similar) {
        const card = document.createElement('article');
        card.className = 'poster-card';
        const a = document.createElement('a');
        a.className = 'poster-thumb';
        a.href = '/s/' + p.id;
        const img = document.createElement('img');
        img.src = p.thumb;
        img.alt = p.title;
        const pill = document.createElement('span');
        pill.className = 'count-pill';
        pill.textContent = `共同 ${p.shared} 款 · 契合 ${p.matchScore}%`;
        a.append(img, pill);
        const h = document.createElement('h3');
        const link = document.createElement('a');
        link.href = '/s/' + p.id;
        link.textContent = p.title;
        h.append(link);
        const meta = document.createElement('p');
        meta.className = 'poster-meta';
        meta.textContent = `${p.name}${p.role ? ' · ' + p.role : ''} · 共同软件：${p.matchedNames.join('、')}`;
        card.append(a, h, meta);
        simGrid.append(card);
      }
      resultEl.append(simGrid);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';
    const toStudio = document.createElement('button');
    toStudio.type = 'button';
    toStudio.className = 'button primary';
    toStudio.textContent = '带着这批软件直接做海报 →';
    toStudio.addEventListener('click', () => {
      try { sessionStorage.setItem(TASTE_CARRY_KEY, JSON.stringify([...selected.values()])); } catch {}
      location.href = '/studio';
    });
    const copyCard = document.createElement('button');
    copyCard.type = 'button';
    copyCard.className = 'button secondary';
    copyCard.textContent = '复制体检报告文案';
    copyCard.addEventListener('click', () => {
      const missNames = (data.missingRecommended || []).slice(0, 3).map(m => m.name).join('、') || '暂无';
      const text = `我在「乔木软件推荐」做了 Mac 软件体检：${data.persona}（覆盖 ${coveredCount}/${totalSlots} 效率位，小众独特度 ${data.uniqueness}%）\n被种草的同频神器：${missNames}\n来测测你的 Mac：${location.origin}/taste`;
      copy(text, copyCard, '报告已复制');
    });
    actions.append(toStudio, copyCard);
    resultEl.append(actions);
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// CSP-safe proportional flex & width values (e.g. /compare overlap bar & /insights bars)
for (const el of document.querySelectorAll('[data-flex]')) {
  const w = Number(el.dataset.flex);
  if (w > 0) el.style.flex = `${w} 1 0%`;
}
for (const el of document.querySelectorAll('[data-width]')) {
  if (/^\d{1,3}(\.\d+)?%$/.test(el.dataset.width || '')) el.style.width = el.dataset.width;
}

// Live filter on /alternatives
const altHub = document.querySelector('[data-alt-hub]');
if (altHub) {
  let activeGroup = '';
  const searchInput = document.getElementById('alt-search');
  const items = [...altHub.querySelectorAll('[data-alt-item]')];
  const applyAltFilter = () => {
    const q = (searchInput?.value || '').trim().toLowerCase();
    for (const li of items) {
      const matchG = q ? true : (!activeGroup || li.dataset.group === activeGroup);
      const matchQ = !q || (li.dataset.search || '').includes(q);
      li.hidden = !(matchG && matchQ);
    }
  };
  for (const btn of altHub.querySelectorAll('[data-alt-group]')) {
    btn.addEventListener('click', () => {
      activeGroup = btn.dataset.altGroup;
      for (const other of altHub.querySelectorAll('[data-alt-group]')) other.classList.toggle('is-on', other === btn);
      applyAltFilter();
    });
  }
  searchInput?.addEventListener('input', applyAltFilter);
}
