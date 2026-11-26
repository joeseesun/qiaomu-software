// Client interactions: copy helpers, `/` shortcut, instant search suggest,
// localStorage Install Kit (Homebrew cart), reason upvotes, lightbox,
// poster checklist copy, and Taste Test page.

const KIT_KEY = 'qiaomu_kit_v1';
const VOTES_KEY = 'qiaomu_reason_votes_v1';
const STUDIO_OWNED_KEY = 'qiaomu_studio_posters_v1';
const TASTE_CARRY_KEY = 'qiaomu_taste_carry_v1';

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

// Copy plain-text / Markdown checklist on share page
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
      for (const a of apps) {
        lines.push(`- ${a.name}${a.note ? '：' + a.note : ''}`);
      }
      lines.push('');
    }
    lines.push('完整海报与软件详情：' + data.url);
    copy(lines.join('\n'), button, '清单已复制');
  });
}

// `/` focuses search input
const headerSearch = document.getElementById('header-q');
document.addEventListener('keydown', event => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || !headerSearch) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
  if (document.querySelector('dialog[open]')) return;
  event.preventDefault();
  const pageSearch = document.querySelector('main input[type="search"]');
  const field = pageSearch && pageSearch.offsetParent !== null ? pageSearch : headerSearch;
  field.focus();
  field.select();
});

// Instant search autocomplete for header search
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
    if (!data.apps?.length && !data.categories?.length) {
      closeMenu();
      return;
    }
    if (data.apps?.length) {
      const label = document.createElement('div');
      label.className = 'suggest-group';
      label.textContent = '软件';
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
        const name = document.createElement('span');
        name.className = 'suggest-item-name';
        name.textContent = app.name;
        const meta = document.createElement('span');
        meta.className = 'suggest-item-meta num';
        meta.textContent = `${app.count} 张海报`;
        a.append(name, meta);
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
        meta.textContent = `${cat.count} 款软件`;
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
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlight((activeIndex + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlight((activeIndex - 1 + items.length) % items.length);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      location.href = items[activeIndex].href;
    } else if (event.key === 'Escape') {
      closeMenu();
    }
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
    if (owned.some(item => item.id === ownerLink.dataset.shareOwnerId)) {
      ownerLink.hidden = false;
    }
  } catch {}
}

// Reason "Helpful / 写得好" voting
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
    } finally {
      btn.disabled = false;
    }
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
  for (const btn of document.querySelectorAll('[data-kit-toggle]')) {
    try {
      const app = JSON.parse(btn.dataset.kitToggle);
      const inKit = keys.has(app.key);
      btn.setAttribute('aria-pressed', inKit ? 'true' : 'false');
      const span = btn.querySelector('span');
      if (span) span.textContent = inKit ? '已在装机清单' : '加入装机清单';
      else btn.title = inKit ? '从装机清单移除' : '加入装机清单';
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
    li.textContent = '装机清单还是空的，逛软件榜或海报时点击 + 即可收集。';
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
    if (idx >= 0) kit.splice(idx, 1);
    else kit.push(app);
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
      if (!map.has(a.key)) {
        map.set(a.key, { key: a.key, name: a.name, cask: a.cask || '', homepage: a.homepage || '', icon: a.icon || '' });
      }
    }
    saveKit([...map.values()]);
    syncKitUI();
    renderKitDialog();
    kitDialog?.showModal();
  });
}

kitFab?.addEventListener('click', () => {
  renderKitDialog();
  kitDialog.showModal();
});
document.getElementById('kit-copy-brew')?.addEventListener('click', (e) => {
  copy(kitBrewCmdEl.textContent, e.currentTarget);
});
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
document.getElementById('kit-clear')?.addEventListener('click', () => {
  saveKit([]);
  syncKitUI();
  renderKitDialog();
});
syncKitUI();

// Taste Test page (/taste)
const tasteRoot = document.querySelector('[data-taste-app]');
if (tasteRoot) {
  const selected = new Map(); // lowercase key -> { name, key, icon, group }
  const input = document.getElementById('taste-input');
  const addBtn = document.getElementById('taste-add-btn');
  const countEl = document.getElementById('taste-count');
  const clearBtn = document.getElementById('taste-clear');
  const submitBtn = document.getElementById('taste-submit');
  const selectedWrap = document.getElementById('taste-selected');
  const resultEl = document.getElementById('taste-result');

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
      chip.addEventListener('click', () => {
        selected.delete(k);
        syncTaste();
      });
      selectedWrap.append(chip);
    }
    for (const btn of document.querySelectorAll('[data-taste-chip]')) {
      const active = selected.has(btn.dataset.tasteKey);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  };

  for (const btn of document.querySelectorAll('[data-taste-chip]')) {
    btn.addEventListener('click', () => {
      const key = btn.dataset.tasteKey;
      if (selected.has(key)) selected.delete(key);
      else if (selected.size < 48) {
        selected.set(key, {
          name: btn.dataset.tasteChip,
          key,
          icon: btn.dataset.tasteIcon || '',
          group: btn.dataset.tasteCat || '效率',
        });
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
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
  });
  clearBtn?.addEventListener('click', () => {
    selected.clear();
    resultEl.hidden = true;
    syncTaste();
  });

  submitBtn?.addEventListener('click', async () => {
    submitBtn.disabled = true;
    try {
      const res = await fetch('/api/v1/taste', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ apps: [...selected.values()].map(x => x.name) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || '分析失败');
      const data = await res.json();
      renderTasteResult(data);
    } catch (err) {
      resultEl.hidden = false;
      resultEl.textContent = err.message || '暂时无法分析，请稍后再试。';
    } finally {
      submitBtn.disabled = false;
    }
  });

  function renderTasteResult(data) {
    resultEl.replaceChildren();
    resultEl.hidden = false;

    const header = document.createElement('div');
    header.className = 'taste-persona';
    const left = document.createElement('div');
    const eyebrow = document.createElement('p');
    eyebrow.className = 'track-eyebrow';
    eyebrow.textContent = '你的 Mac 软件品味报告';
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
      mkMetric(`${data.uniqueness}%`, '小众独特度'),
      mkMetric(`${data.avgRate}%`, '平均撞款率'),
      mkMetric(`${data.selectedCount} 款`, '参与测评')
    );
    header.append(left, metrics);
    resultEl.append(header);

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
      try {
        sessionStorage.setItem(TASTE_CARRY_KEY, JSON.stringify([...selected.values()]));
      } catch {}
      location.href = '/studio';
    });
    const copyCard = document.createElement('button');
    copyCard.type = 'button';
    copyCard.className = 'button secondary';
    copyCard.textContent = '复制品味报告文案';
    copyCard.addEventListener('click', () => {
      const topHit = data.mainstream[0] ? `${data.mainstream[0].name}（${data.mainstream[0].rate}% 撞款）` : '暂无';
      const rareHit = data.niche[0] ? `${data.niche[0].name}（${data.niche[0].count === 0 ? '全站独门' : `仅 ${data.niche[0].rate}%`}）` : '暂无';
      const text = `我在「乔木软件推荐」测了我的 Mac 软件品味：${data.persona}（小众独特度 ${data.uniqueness}%）\n最撞款：${topHit}\n最宝藏：${rareHit}\n来测测你的：${location.origin}/taste`;
      copy(text, copyCard, '报告已复制');
    });
    actions.append(toStudio, copyCard);
    resultEl.append(actions);
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
