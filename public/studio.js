// Browser-based Mac Software Poster Studio (/studio)
// Clean Canvas Stage + Modal Pickers (Apps, 20 Wallpapers, Open-Source Fonts & Custom/Hidden Watermark)
// Renders 1:1 native macOS poster aesthetic with 130+ real app icons & sends `source: 'web'` on publish.

(() => {
  const root = document.getElementById('studio-root');
  if (!root) return;

  const OWNED_KEY = 'qiaomu_studio_posters_v1';
  const TASTE_CARRY_KEY = 'qiaomu_taste_carry_v1';

  const canvas = document.getElementById('studio-canvas');
  const ctx = canvas.getContext('2d');
  const appsModal = document.getElementById('studio-apps-modal');
  const bgModal = document.getElementById('studio-bg-modal');
  const styleModal = document.getElementById('studio-style-modal');

  const bgFileInput = document.getElementById('studio-bg-file');
  const bgLabelEl = document.getElementById('studio-bg-label');
  const titleInput = document.getElementById('studio-title');
  const nameInput = document.getElementById('studio-name');
  const roleInput = document.getElementById('studio-role');
  const visSelect = document.getElementById('studio-visibility');
  const watermarkInput = document.getElementById('studio-watermark');
  const watermarkShow = document.getElementById('studio-watermark-show');
  const publishBtn = document.getElementById('studio-publish');
  const downloadBtn = document.getElementById('studio-download');
  const statusEl = document.getElementById('studio-status');
  const appSearch = document.getElementById('studio-app-search');
  const defaultCatSelect = document.getElementById('studio-default-cat');
  const addCustomBtn = document.getElementById('studio-add-custom');
  const selectedListEl = document.getElementById('studio-selected-list');
  const appCountEl = document.getElementById('studio-app-count');
  const modalAppCountEl = document.getElementById('modal-app-count');
  const historyCard = document.getElementById('studio-history-card');
  const historyList = document.getElementById('studio-history');
  const pickHotBtn = document.getElementById('studio-pick-hot');
  const clearAppsBtn = document.getElementById('studio-clear-apps');
  const randomBgBtn = document.getElementById('studio-random-bg');
  const pasteInput = document.getElementById('studio-paste-input');
  const pasteBtn = document.getElementById('studio-paste-btn');

  const catalog = JSON.parse(document.getElementById('studio-catalog-data')?.textContent || '[]');
  const wallpapers = JSON.parse(document.getElementById('studio-wallpapers-data')?.textContent || '[]');
  const catalogByKey = new Map(catalog.map(a => [a.key, a]));

  const tilePalettes = [
    ['#6f86b8', '#3d4f7a'],
    ['#6fa89a', '#36675c'],
    ['#b48a5e', '#74532f'],
    ['#a77aa8', '#643f68'],
    ['#b87474', '#763c3f'],
    ['#7d9a5c', '#4a6131'],
    ['#5f9fb8', '#305f78'],
    ['#8f8f9c', '#55555f'],
  ];

  // 4 Poster Font Presets (classic STSongti/Noto Serif + SmileySans + LXGW WenKai + Modern Sans)
  const FONT_PRESETS = {
    songti: {
      heading: (sz) => `700 ${sz}px "STSongti-SC-Bold", "Songti SC", "Noto Serif SC", Georgia, serif`,
      label: (sz) => `700 ${sz}px "STSongti-SC-Bold", "Songti SC", "Noto Serif SC", Georgia, serif`,
      cssUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700&display=swap',
      familyName: 'Noto Serif SC',
    },
    smiley: {
      heading: (sz) => `400 ${sz}px "SmileySans", "PingFang SC", sans-serif`,
      label: (sz) => `400 ${sz}px "SmileySans", "PingFang SC", sans-serif`,
      localUrl: '/fonts/SmileySans-Oblique.otf',
      familyName: 'SmileySans',
    },
    wenkai: {
      heading: (sz) => `700 ${sz}px "LXGW WenKai", "LXGW WenKai TC", "Kaiti SC", serif`,
      label: (sz) => `700 ${sz}px "LXGW WenKai", "LXGW WenKai TC", "Kaiti SC", serif`,
      cssUrl: 'https://fontsapi.zeoseven.com/292/main/result.css',
      familyName: 'LXGW WenKai',
    },
    sans: {
      heading: (sz) => `700 ${sz}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Noto Sans SC", sans-serif`,
      label: (sz) => `600 ${sz}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Noto Sans SC", sans-serif`,
    },
  };

  let activeFont = 'songti';
  let activeScrim = 'desktop';
  let bgImage = null;
  let activeWallpaperUrl = wallpapers[0]?.url || '';
  let activeThemeFilter = '';
  let editing = null;
  const selectedApps = [];
  const iconImages = new Map();
  const wallpaperCache = new Map();
  const loadedFonts = new Set();

  async function ensureFontLoaded(fontId) {
    const preset = FONT_PRESETS[fontId];
    if (!preset || loadedFonts.has(fontId)) return;
    loadedFonts.add(fontId);
    try {
      if (preset.localUrl && 'FontFace' in window) {
        const face = new FontFace(preset.familyName, `url(${preset.localUrl})`);
        await face.load();
        document.fonts.add(face);
      } else if (preset.cssUrl) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = preset.cssUrl;
        document.head.append(link);
        await new Promise(resolve => { link.onload = resolve; link.onerror = resolve; setTimeout(resolve, 2500); });
        if (document.fonts?.load) {
          await document.fonts.load(`700 48px "${preset.familyName}"`).catch(() => {});
        }
      }
    } catch {}
  }

  function loadOwned() {
    try { return JSON.parse(localStorage.getItem(OWNED_KEY) || '[]'); }
    catch { return []; }
  }
  function saveOwned(list) {
    try { localStorage.setItem(OWNED_KEY, JSON.stringify(list.slice(0, 30))); } catch {}
  }

  function loadImage(url, cache) {
    if (!url) return Promise.resolve(null);
    if (cache.has(url)) return Promise.resolve(cache.get(url));
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { cache.set(url, img); resolve(img); };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
  const loadIconImage = (hash) => hash ? loadImage('/icons/' + hash + '.webp', iconImages) : Promise.resolve(null);

  function roundedRect(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
    c.closePath();
  }

  function drawCover(img, w, h) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  function drawFallbackTile(x, y, size, name) {
    const trimmed = String(name || '?').trim();
    const letter = Array.from(trimmed)[0]?.toUpperCase() || '?';
    const idx = Array.from(trimmed.toLowerCase()).reduce((s, ch) => s + ch.codePointAt(0), 0) % 8;
    const [a, b] = tilePalettes[idx];
    const inset = size * 0.08;
    const s = size - inset * 2;
    const g = ctx.createLinearGradient(x + inset, y + inset, x + inset + s, y + inset + s);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    roundedRect(ctx, x + inset, y + inset, s, s, s * 0.23);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.5;
    roundedRect(ctx, x + inset, y + inset, s, s, s * 0.23);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.font = `600 ${Math.round(s * 0.46)}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x + size / 2, y + size / 2 + 1);
  }

  function fitText(text, fontTemplate, maxSize, minSize, maxWidth) {
    let size = maxSize;
    ctx.font = fontTemplate(size);
    while (ctx.measureText(text).width > maxWidth && size > minSize) {
      size -= 1;
      ctx.font = fontTemplate(size);
    }
    let out = text;
    if (ctx.measureText(out).width > maxWidth) {
      const chars = Array.from(out);
      while (chars.length > 1 && ctx.measureText(chars.join('') + '…').width > maxWidth) chars.pop();
      out = chars.join('') + '…';
    }
    return { text: out, size };
  }

  function groupIntoRows(apps) {
    const groups = new Map();
    for (const app of apps) {
      const label = app.group || '效率与工具';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(app);
    }
    const rows = [];
    for (const [label, list] of groups) {
      for (let i = 0; i < list.length; i += 10) {
        rows.push({ label: i === 0 ? label : '', apps: list.slice(i, i + 10) });
      }
    }
    return rows;
  }

  async function renderPoster() {
    await ensureFontLoaded(activeFont);
    if (!bgImage && activeWallpaperUrl) {
      bgImage = await loadImage(activeWallpaperUrl, wallpaperCache);
    }
    await Promise.all(selectedApps.map(a => loadIconImage(a.icon)));

    const W = 1600;
    const rows = groupIntoRows(selectedApps);
    const rowHeight = rows.length <= 5 ? Math.min(146, Math.floor(650 / Math.max(1, rows.length))) : 118;
    const footerH = 46;
    const H = Math.max(900, 214 + footerH + rows.length * rowHeight);
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }

    ctx.fillStyle = '#0f1822';
    ctx.fillRect(0, 0, W, H);

    if (bgImage) {
      drawCover(bgImage, W, H);
      const isNight = activeScrim === 'night';
      ctx.fillStyle = `rgba(10, 18, 28, ${isNight ? 0.56 : 0.30})`;
      ctx.fillRect(0, 0, W, H);

      const leftGrad = ctx.createLinearGradient(0, 0, W, 0);
      leftGrad.addColorStop(0, 'rgba(10, 18, 33, 0.42)');
      leftGrad.addColorStop(1, 'rgba(18, 28, 41, 0.14)');
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, W, H);

      const topGrad = ctx.createLinearGradient(0, 0, 0, H);
      topGrad.addColorStop(0, 'rgba(8, 13, 20, 0.48)');
      topGrad.addColorStop(0.35, 'rgba(8, 13, 20, 0.12)');
      topGrad.addColorStop(1, 'rgba(8, 13, 20, 0.44)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, H);
    }

    const white = '#fffbf4';
    const quiet = 'rgba(255, 251, 244, 0.78)';
    const fp = FONT_PRESETS[activeFont] || FONT_PRESETS.songti;
    const uiFont = (sz, weight = 600) => `${weight} ${sz}px "Avenir Next", -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Noto Sans SC", sans-serif`;

    const drawShadowText = (text, x, y, align = 'left', color = white) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.82)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    const rawTitle = titleInput.value.trim() || `${new Date().getFullYear()} 我推荐的 Mac 软件`;
    const headingBase = activeFont === 'smiley' ? 76 : 68;
    const fittedHeading = fitText(rawTitle, fp.heading, headingBase, 40, W - 128);
    ctx.font = fp.heading(fittedHeading.size);
    drawShadowText(fittedHeading.text, 64, 132, 'left', white);

    // Bottom-left signature
    const author = nameInput.value.trim();
    const role = roleInput?.value.trim() || '';
    if (author) {
      const sep = /[A-Za-z0-9]$/.test(author) ? ' ' : '';
      const footerLeft = `${author}${sep}的推荐${role ? ' · ' + role : ''}`;
      ctx.font = uiFont(20, 500);
      drawShadowText(footerLeft, 64, H - 30, 'left', quiet);
    }

    // Bottom-right watermark (customizable or hidden!)
    if (watermarkShow?.checked) {
      const wmText = (watermarkInput?.value ?? 'software.qiaomu.ai').trim();
      if (wmText) {
        ctx.font = uiFont(19, 500);
        drawShadowText(wmText, W - 64, H - 30, 'right', quiet);
      }
    }

    if (!rows.length) {
      ctx.font = uiFont(28, 500);
      drawShadowText('点击下方「选软件」挑几款你常用的 Mac 应用', W / 2, H / 2 + 12, 'center', 'rgba(255,251,244,0.84)');
      return;
    }

    const labelW = 198;
    const cols = Math.max(6, ...rows.map(r => r.apps.length));
    const step = (W - labelW - 128) / cols;
    const iconSize = Math.min(86, Math.round(rowHeight * 0.62));

    rows.forEach((row, rowIdx) => {
      const rowTop = 186 + rowIdx * rowHeight;
      if (row.label) {
        const labelBase = activeFont === 'smiley' ? 34 : 30;
        const fittedLabel = fitText(row.label, fp.label, labelBase, 18, labelW - 22);
        ctx.font = fp.label(fittedLabel.size);
        drawShadowText(fittedLabel.text, 64, rowTop + iconSize * 0.60, 'left', white);
      }

      row.apps.forEach((app, colIdx) => {
        const cx = 64 + labelW + step * (colIdx + 0.5);
        const ix = cx - iconSize / 2;
        const iy = rowTop;
        const img = app.icon ? iconImages.get(app.icon) : null;
        if (img) {
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.42)';
          ctx.shadowBlur = 14;
          ctx.shadowOffsetY = 5;
          ctx.drawImage(img, ix, iy, iconSize, iconSize);
          ctx.restore();
        } else {
          drawFallbackTile(ix, iy, iconSize, app.name);
        }

        const fittedName = fitText(app.name, (sz) => uiFont(sz, 600), 19, 13, step - 10);
        ctx.font = uiFont(fittedName.size, 600);
        drawShadowText(fittedName.text, cx, iy + iconSize + 26, 'center', white);
      });
    });
  }

  function syncCatalogHighlights() {
    const countStr = String(selectedApps.length);
    appCountEl.textContent = countStr;
    if (modalAppCountEl) modalAppCountEl.textContent = countStr;
    const chosenKeys = new Set(selectedApps.map(a => a.key));
    for (const btn of document.querySelectorAll('[data-catalog-key]')) {
      const on = chosenKeys.has(btn.dataset.catalogKey);
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (activeThemeFilter === '__selected') filterCatalogGrid();
    renderSelectedEditor();
  }

  function renderSelectedEditor() {
    selectedListEl.replaceChildren();
    if (!selectedApps.length) {
      const li = document.createElement('li');
      li.className = 'kit-sub';
      li.textContent = '暂未选择软件';
      selectedListEl.append(li);
      return;
    }
    selectedApps.forEach((app, idx) => {
      const li = document.createElement('li');
      li.className = 'studio-app-item';
      const top = document.createElement('div');
      top.className = 'studio-app-top';
      if (app.icon) {
        const img = document.createElement('img');
        img.src = '/icons/' + app.icon + '.webp';
        img.width = 24;
        img.height = 24;
        img.alt = '';
        top.append(img);
      }
      const name = document.createElement('strong');
      name.textContent = app.name;
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'button secondary small';
      rm.textContent = '移除';
      rm.addEventListener('click', () => {
        selectedApps.splice(idx, 1);
        syncCatalogHighlights();
        renderPoster();
      });
      top.append(name, rm);

      const controls = document.createElement('div');
      controls.className = 'studio-app-controls';
      const catInput = document.createElement('input');
      catInput.type = 'text';
      catInput.maxLength = 14;
      catInput.value = app.group;
      catInput.placeholder = '分类';
      catInput.addEventListener('input', () => { app.group = catInput.value.trim() || '效率与工具'; renderPoster(); });

      const noteInput = document.createElement('input');
      noteInput.type = 'text';
      noteInput.maxLength = 60;
      noteInput.value = app.note || '';
      noteInput.placeholder = '推荐理由（可选，60 字内）';
      noteInput.addEventListener('input', () => { app.note = noteInput.value.trim(); });

      controls.append(catInput, noteInput);
      li.append(top, controls);
      selectedListEl.append(li);
    });
  }

  function addApp(item) {
    if (selectedApps.length >= 48) { statusEl.textContent = '每张海报最多选择 48 款软件。'; return false; }
    const key = item.key || item.name.trim().toLowerCase();
    if (!key || selectedApps.some(a => a.key === key)) return false;
    selectedApps.push({
      name: item.name.trim(),
      key,
      group: item.group || defaultCatSelect.value || '效率与工具',
      note: item.note || '',
      icon: item.icon || '',
    });
    return true;
  }

  function toggleCatalogApp(key) {
    const idx = selectedApps.findIndex(a => a.key === key);
    if (idx >= 0) selectedApps.splice(idx, 1);
    else {
      const found = catalogByKey.get(key);
      if (found) addApp(found);
    }
    syncCatalogHighlights();
    renderPoster();
  }

  function filterCatalogGrid() {
    const q = (appSearch?.value || '').trim().toLowerCase();
    const chosenKeys = new Set(selectedApps.map(a => a.key));
    for (const btn of document.querySelectorAll('[data-catalog-key]')) {
      const key = btn.dataset.catalogKey;
      const app = catalogByKey.get(key);
      const themes = (btn.dataset.catalogThemes || '').split(',').filter(Boolean);
      const matchTheme = activeThemeFilter === '__selected'
        ? chosenKeys.has(key)
        : (!activeThemeFilter || themes.includes(activeThemeFilter));
      const matchQ = !q || key.includes(q) || (app?.name || '').toLowerCase().includes(q) || (app?.summary || '').toLowerCase().includes(q);
      btn.closest('li').hidden = !(matchTheme && matchQ);
    }
  }

  async function selectWallpaper(url, name, tileBtn = null) {
    activeWallpaperUrl = url;
    bgImage = await loadImage(url, wallpaperCache);
    if (bgLabelEl && name) bgLabelEl.textContent = name;
    for (const other of document.querySelectorAll('[data-wallpaper-url]')) {
      const on = tileBtn ? other === tileBtn : other.dataset.wallpaperUrl === url;
      other.classList.toggle('is-active', on);
      other.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    renderPoster();
  }

  // Modal openers
  document.getElementById('open-apps-modal')?.addEventListener('click', () => appsModal?.showModal());
  document.getElementById('open-bg-modal')?.addEventListener('click', () => bgModal?.showModal());
  document.getElementById('open-style-modal')?.addEventListener('click', () => styleModal?.showModal());

  for (const btn of document.querySelectorAll('[data-catalog-key]')) {
    btn.addEventListener('click', () => toggleCatalogApp(btn.dataset.catalogKey));
  }
  for (const btn of document.querySelectorAll('[data-studio-theme]')) {
    btn.addEventListener('click', () => {
      activeThemeFilter = btn.dataset.studioTheme;
      for (const other of document.querySelectorAll('[data-studio-theme]')) other.classList.toggle('is-on', other === btn);
      filterCatalogGrid();
    });
  }
  appSearch?.addEventListener('input', filterCatalogGrid);

  const addCustomFromInput = () => {
    const val = appSearch.value.trim();
    if (!val) return;
    const match = catalogByKey.get(val.toLowerCase());
    if (match) addApp(match);
    else addApp({ name: val, key: val.toLowerCase(), group: defaultCatSelect.value || '效率与工具' });
    appSearch.value = '';
    filterCatalogGrid();
    syncCatalogHighlights();
    renderPoster();
  };
  addCustomBtn?.addEventListener('click', addCustomFromInput);
  appSearch?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCustomFromInput(); } });

  pickHotBtn?.addEventListener('click', () => {
    for (const a of catalog.filter(x => !x.isSystem).slice(0, 12)) addApp(a);
    syncCatalogHighlights();
    renderPoster();
  });
  clearAppsBtn?.addEventListener('click', () => {
    selectedApps.length = 0;
    syncCatalogHighlights();
    renderPoster();
  });

  // Wallpaper & scrim controls
  for (const btn of document.querySelectorAll('[data-wallpaper-url]')) {
    btn.addEventListener('click', () => selectWallpaper(btn.dataset.wallpaperUrl, btn.dataset.wallpaperName, btn));
  }
  for (const btn of document.querySelectorAll('[data-scrim]')) {
    btn.addEventListener('click', () => {
      activeScrim = btn.dataset.scrim;
      for (const other of document.querySelectorAll('[data-scrim]')) other.classList.toggle('is-on', other === btn);
      renderPoster();
    });
  }
  randomBgBtn?.addEventListener('click', () => {
    if (!wallpapers.length) return;
    const pool = wallpapers.filter(w => w.url !== activeWallpaperUrl);
    const next = pool[Math.floor(Math.random() * pool.length)] || wallpapers[0];
    selectWallpaper(next.url, next.name);
  });
  bgFileInput?.addEventListener('change', async () => {
    const file = bgFileInput.files?.[0];
    if (!file) return;
    try {
      bgImage = await createImageBitmap(file);
      activeWallpaperUrl = '';
      if (bgLabelEl) bgLabelEl.textContent = '自定义壁纸';
      for (const other of document.querySelectorAll('[data-wallpaper-url]')) {
        other.classList.remove('is-active');
        other.setAttribute('aria-pressed', 'false');
      }
      renderPoster();
    } catch {
      statusEl.textContent = '无法读取该图片，请换一张 JPG/PNG/WebP 壁纸。';
    }
  });

  // Font & watermark controls
  for (const btn of document.querySelectorAll('[data-font]')) {
    btn.addEventListener('click', async () => {
      activeFont = btn.dataset.font;
      for (const other of document.querySelectorAll('[data-font]')) {
        const on = other === btn;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      statusEl.textContent = '正在应用字体…';
      await renderPoster();
      statusEl.textContent = '';
    });
  }
  [titleInput, nameInput, roleInput, watermarkInput].forEach(el => el?.addEventListener('input', renderPoster));
  watermarkShow?.addEventListener('change', () => {
    if (watermarkInput) watermarkInput.disabled = !watermarkShow.checked;
    renderPoster();
  });

  // Paste ls /Applications batch import
  pasteBtn?.addEventListener('click', async () => {
    const rawText = pasteInput?.value?.trim();
    if (!rawText) { pasteInput?.focus(); return; }
    pasteBtn.disabled = true;
    try {
      const res = await fetch('/api/v1/parse-apps', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '解析失败');
      let added = 0;
      for (const item of data.items) {
        if (item.isSystem) continue;
        if (selectedApps.length >= 24 && added >= 24) break;
        if (addApp({ name: item.name, key: item.key, group: item.group, icon: item.icon })) added++;
      }
      pasteInput.value = '';
      syncCatalogHighlights();
      renderPoster();
      statusEl.textContent = added ? `已导入 ${added} 款软件` : '没有新增软件';
    } catch (err) {
      statusEl.textContent = err.message || '解析失败。';
    } finally { pasteBtn.disabled = false; }
  });

  function renderHistory() {
    const owned = loadOwned();
    historyList.replaceChildren();
    historyCard.hidden = owned.length === 0;
    for (const item of owned) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '/s/' + item.id;
      link.className = 'text-link';
      link.textContent = item.title || item.id;
      const acts = document.createElement('div');
      acts.className = 'studio-history-actions';
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'button secondary small';
      editBtn.textContent = '载入编辑';
      editBtn.addEventListener('click', () => loadForEdit(item.id, item.token));
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'button secondary small';
      delBtn.textContent = '撤回删除';
      delBtn.addEventListener('click', async () => {
        if (!confirm('确认从网站撤回这张海报？')) return;
        const res = await fetch('/api/v1/shares/' + item.id, {
          method: 'DELETE',
          headers: { authorization: 'Bearer ' + item.token },
        });
        if (res.ok || res.status === 404) {
          saveOwned(loadOwned().filter(x => x.id !== item.id));
          if (editing?.id === item.id) { editing = null; publishBtn.textContent = '发布海报'; }
          renderHistory();
          statusEl.textContent = '已撤回该海报。';
        }
      });
      acts.append(editBtn, delBtn);
      li.append(link, acts);
      historyList.append(li);
    }
  }

  async function loadForEdit(id, token) {
    statusEl.textContent = '正在载入海报…';
    try {
      const res = await fetch('/api/v1/shares/' + id, { headers: { authorization: 'Bearer ' + token } });
      if (!res.ok) throw new Error('无法载入该海报（可能已被撤回）。');
      const data = await res.json();
      editing = { id, token };
      titleInput.value = data.title;
      nameInput.value = data.name;
      roleInput.value = data.role || '';
      visSelect.value = data.visibility;
      selectedApps.length = 0;
      for (const a of data.apps) {
        selectedApps.push({ name: a.name, key: a.name.toLowerCase(), group: a.group, note: a.note || '', icon: a.icon || '' });
      }
      publishBtn.textContent = '更新海报';
      statusEl.textContent = `正在编辑「${data.title}」，保存后原链接不变。`;
      syncCatalogHighlights();
      renderPoster();
    } catch (err) { statusEl.textContent = err.message; }
  }

  downloadBtn?.addEventListener('click', async () => {
    if (!selectedApps.length) { appsModal?.showModal(); return; }
    await renderPoster();
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    const prefix = nameInput.value.trim() ? nameInput.value.trim() + '-' : '';
    a.download = prefix + (titleInput.value.trim() || 'mac-software') + '.png';
    a.click();
  });

  publishBtn?.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const title = titleInput.value.trim() || `${new Date().getFullYear()} 我推荐的 Mac 软件`;
    const role = roleInput?.value.trim() || '';
    if (!selectedApps.length) { appsModal?.showModal(); return; }
    if (!name) { statusEl.textContent = '请先输入你的名字（署名）。'; nameInput.focus(); return; }

    publishBtn.disabled = true;
    statusEl.textContent = editing ? '正在更新海报…' : '正在生成高清海报并发布…';
    try {
      await renderPoster();
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      const payload = {
        name,
        title,
        role: role || undefined,
        source: 'web',
        visibility: visSelect?.value || 'public',
        apps: selectedApps.map(a => ({
          name: a.name,
          group: a.group || '效率与工具',
          ...(a.note ? { note: a.note } : {}),
          ...(a.icon ? { icon: a.icon } : {}),
        })),
        image: base64,
      };
      const isEdit = Boolean(editing);
      const res = await fetch(isEdit ? '/api/v1/shares/' + editing.id : '/api/v1/shares', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'content-type': 'application/json',
          ...(isEdit ? { authorization: 'Bearer ' + editing.token } : {}),
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '发布失败。');

      const owned = loadOwned().filter(x => x.id !== result.id);
      owned.unshift({ id: result.id, token: result.removeToken, title });
      saveOwned(owned);
      renderHistory();
      location.href = '/s/' + result.id;
    } catch (err) {
      statusEl.textContent = err.message || '发布失败。';
    } finally { publishBtn.disabled = false; }
  });

  // Init
  renderHistory();
  const editId = new URLSearchParams(location.search).get('edit');
  if (editId) {
    const found = loadOwned().find(x => x.id === editId);
    if (found) loadForEdit(found.id, found.token);
  } else {
    let loaded = false;
    try {
      const carried = JSON.parse(sessionStorage.getItem(TASTE_CARRY_KEY) || 'null');
      if (Array.isArray(carried) && carried.length) {
        sessionStorage.removeItem(TASTE_CARRY_KEY);
        for (const a of carried) addApp(a);
        loaded = true;
      }
    } catch {}
    if (!loaded && catalog.length) {
      for (const a of catalog.filter(x => !x.isSystem && x.icon).slice(0, 6)) addApp(a);
    }
  }
  syncCatalogHighlights();
  renderPoster();
})();
