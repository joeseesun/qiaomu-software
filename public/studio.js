// Browser-based Mac Software Poster Studio (/studio)
// 1:1 native macOS poster aesthetic (matching qiaomu-mac-software render.js & demo.webp):
// - 20 curated Unsplash desktop wallpapers (self-hosted WebP) + custom upload
// - Click-to-pick from all existing community-submitted apps with real consensus icons
// - Enter your name and publish (POST) / update in-place (PUT) / download PNG in 30s!

(() => {
  const root = document.getElementById('studio-root');
  if (!root) return;

  const OWNED_KEY = 'qiaomu_studio_posters_v1';
  const TASTE_CARRY_KEY = 'qiaomu_taste_carry_v1';

  const canvas = document.getElementById('studio-canvas');
  const ctx = canvas.getContext('2d');
  const bgFileInput = document.getElementById('studio-bg-file');
  const titleInput = document.getElementById('studio-title');
  const nameInput = document.getElementById('studio-name');
  const roleInput = document.getElementById('studio-role');
  const visSelect = document.getElementById('studio-visibility');
  const scrimSelect = document.getElementById('studio-scrim');
  const publishBtn = document.getElementById('studio-publish');
  const downloadBtn = document.getElementById('studio-download');
  const statusEl = document.getElementById('studio-status');
  const appSearch = document.getElementById('studio-app-search');
  const defaultCatSelect = document.getElementById('studio-default-cat');
  const addCustomBtn = document.getElementById('studio-add-custom');
  const selectedListEl = document.getElementById('studio-selected-list');
  const appCountEl = document.getElementById('studio-app-count');
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

  let bgImage = null; // HTMLImageElement or ImageBitmap
  let activeWallpaperUrl = wallpapers[0]?.url || '';
  let activeThemeFilter = '';
  let editing = null; // { id, token }
  const selectedApps = []; // [{ name, key, group, note, icon }]
  const iconImages = new Map(); // hash -> HTMLImageElement
  const wallpaperCache = new Map(); // url -> HTMLImageElement

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

  function loadIconImage(hash) {
    return hash ? loadImage('/icons/' + hash + '.webp', iconImages) : Promise.resolve(null);
  }

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

  // Matches qiaomu-mac-software/scripts/render.js & demo.webp visual design!
  async function renderPoster() {
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

    // 1. Full-bleed photography wallpaper + authentic macOS scrim gradients
    ctx.fillStyle = '#0f1822';
    ctx.fillRect(0, 0, W, H);

    if (bgImage) {
      drawCover(bgImage, W, H);
      const isNight = scrimSelect?.value === 'night';
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
    } else {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#102938');
      g.addColorStop(1, '#263f3d');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    const white = '#fffbf4';
    const quiet = 'rgba(255, 251, 244, 0.78)';
    const serifFont = (sz) => `700 ${sz}px "Songti SC", "STSongti-SC-Bold", "Noto Serif CJK SC", "PingFang SC", Georgia, serif`;
    const uiFont = (sz, weight = 600) => `${weight} ${sz}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Noto Sans SC", sans-serif`;

    // Helper for crisp text with drop shadow matching render.js
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

    // 2. Title heading
    const rawTitle = titleInput.value.trim() || `${new Date().getFullYear()} 我推荐的 Mac 软件`;
    const fittedHeading = fitText(rawTitle, serifFont, 68, 40, W - 128);
    ctx.font = serifFont(fittedHeading.size);
    drawShadowText(fittedHeading.text, 64, 132, 'left', white);

    // 3. Footer signature & domain
    const author = nameInput.value.trim();
    const role = roleInput?.value.trim() || '';
    if (author) {
      const sep = /[A-Za-z0-9]$/.test(author) ? ' ' : '';
      const footerLeft = `${author}${sep}的推荐${role ? ' · ' + role : ''}`;
      ctx.font = uiFont(20, 500);
      drawShadowText(footerLeft, 64, H - 30, 'left', quiet);
    }
    ctx.font = uiFont(19, 500);
    drawShadowText('software.qiaomu.ai', W - 64, H - 30, 'right', quiet);

    // 4. Empty hint when no apps selected yet
    if (!rows.length) {
      ctx.font = uiFont(28, 500);
      drawShadowText('在下方点选你常用的 Mac 软件，这里会实时生成同款桌面海报', W / 2, H / 2 + 12, 'center', 'rgba(255,251,244,0.82)');
      return;
    }

    // 5. Grouped horizontal app rows (identical rhythm to demo.webp!)
    const labelW = 198;
    const cols = Math.max(6, ...rows.map(r => r.apps.length));
    const step = (W - labelW - 128) / cols;
    const iconSize = Math.min(86, Math.round(rowHeight * 0.62));

    rows.forEach((row, rowIdx) => {
      const rowTop = 186 + rowIdx * rowHeight;
      if (row.label) {
        const fittedLabel = fitText(row.label, serifFont, 30, 18, labelW - 22);
        ctx.font = serifFont(fittedLabel.size);
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
    appCountEl.textContent = String(selectedApps.length);
    const chosenKeys = new Set(selectedApps.map(a => a.key));
    for (const btn of document.querySelectorAll('[data-catalog-key]')) {
      const on = chosenKeys.has(btn.dataset.catalogKey);
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    renderSelectedEditor();
  }

  function renderSelectedEditor() {
    selectedListEl.replaceChildren();
    if (!selectedApps.length) {
      const li = document.createElement('li');
      li.className = 'kit-sub';
      li.textContent = '还没有选中任何软件。在下方点选软件后，这里可以微调分类或补写推荐理由。';
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
        img.width = 28;
        img.height = 28;
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
      noteInput.placeholder = '写一句推荐理由（可选，最多 60 字）';
      noteInput.addEventListener('input', () => { app.note = noteInput.value.trim(); });

      controls.append(catInput, noteInput);
      li.append(top, controls);
      selectedListEl.append(li);
    });
  }

  function addApp(item) {
    if (selectedApps.length >= 48) {
      statusEl.textContent = '每张海报最多选择 48 款软件。';
      return false;
    }
    const key = (item.key || item.name.trim().toLowerCase());
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
    if (idx >= 0) {
      selectedApps.splice(idx, 1);
    } else {
      const found = catalogByKey.get(key);
      if (found) addApp(found);
    }
    syncCatalogHighlights();
    renderPoster();
  }

  function filterCatalogGrid() {
    const q = (appSearch?.value || '').trim().toLowerCase();
    for (const btn of document.querySelectorAll('[data-catalog-key]')) {
      const key = btn.dataset.catalogKey;
      const app = catalogByKey.get(key);
      const themes = (btn.dataset.catalogThemes || '').split(',').filter(Boolean);
      const matchTheme = !activeThemeFilter || themes.includes(activeThemeFilter);
      const matchQ = !q || key.includes(q) || (app?.name || '').toLowerCase().includes(q) || (app?.summary || '').toLowerCase().includes(q);
      btn.closest('li').hidden = !(matchTheme && matchQ);
    }
  }

  async function selectWallpaper(url, tileBtn = null) {
    activeWallpaperUrl = url;
    bgImage = await loadImage(url, wallpaperCache);
    for (const other of document.querySelectorAll('[data-wallpaper-url]')) {
      const on = tileBtn ? other === tileBtn : other.dataset.wallpaperUrl === url;
      other.classList.toggle('is-active', on);
      other.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    renderPoster();
  }

  // Click cards in full catalog grid
  for (const btn of document.querySelectorAll('[data-catalog-key]')) {
    btn.addEventListener('click', () => toggleCatalogApp(btn.dataset.catalogKey));
  }

  // Theme filter bar
  for (const btn of document.querySelectorAll('[data-studio-theme]')) {
    btn.addEventListener('click', () => {
      activeThemeFilter = btn.dataset.studioTheme;
      for (const other of document.querySelectorAll('[data-studio-theme]')) {
        other.classList.toggle('is-on', other === btn);
      }
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
  appSearch?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomFromInput(); }
  });

  // One-click pick top 12 non-system apps
  pickHotBtn?.addEventListener('click', () => {
    const picks = catalog.filter(a => !a.isSystem).slice(0, 12);
    for (const a of picks) addApp(a);
    syncCatalogHighlights();
    renderPoster();
  });

  clearAppsBtn?.addEventListener('click', () => {
    selectedApps.length = 0;
    syncCatalogHighlights();
    renderPoster();
  });

  // 20 Wallpaper picker tiles + Random button + Custom file upload
  for (const btn of document.querySelectorAll('[data-wallpaper-url]')) {
    btn.addEventListener('click', () => selectWallpaper(btn.dataset.wallpaperUrl, btn));
  }

  randomBgBtn?.addEventListener('click', () => {
    if (!wallpapers.length) return;
    const pool = wallpapers.filter(w => w.url !== activeWallpaperUrl);
    const next = pool[Math.floor(Math.random() * pool.length)] || wallpapers[0];
    selectWallpaper(next.url);
  });

  bgFileInput?.addEventListener('change', async () => {
    const file = bgFileInput.files?.[0];
    if (!file) return;
    try {
      bgImage = await createImageBitmap(file);
      activeWallpaperUrl = '';
      for (const other of document.querySelectorAll('[data-wallpaper-url]')) {
        other.classList.remove('is-active');
        other.setAttribute('aria-pressed', 'false');
      }
      renderPoster();
    } catch {
      statusEl.textContent = '无法读取该图片，请换一张 JPG/PNG/WebP 壁纸。';
    }
  });

  [titleInput, nameInput, roleInput, scrimSelect].forEach(el => el?.addEventListener('input', renderPoster));
  scrimSelect?.addEventListener('change', renderPoster);

  // Batch paste import from `ls /Applications`
  pasteBtn?.addEventListener('click', async () => {
    const rawText = pasteInput?.value?.trim();
    if (!rawText) { pasteInput?.focus(); return; }
    pasteBtn.disabled = true;
    statusEl.textContent = '正在匹配站内图标并分类…';
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
      statusEl.textContent = added ? `已自动导入 ${added} 款软件并匹配共识图标！` : '没有新增软件（可能已在清单中或均为系统自带应用）。';
    } catch (err) {
      statusEl.textContent = err.message || '解析失败。';
    } finally {
      pasteBtn.disabled = false;
    }
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
        if (!confirm('确认从网站撤回这张海报？撤回后链接将失效。')) return;
        const res = await fetch('/api/v1/shares/' + item.id, {
          method: 'DELETE',
          headers: { authorization: 'Bearer ' + item.token },
        });
        if (res.ok || res.status === 404) {
          saveOwned(loadOwned().filter(x => x.id !== item.id));
          if (editing?.id === item.id) {
            editing = null;
            publishBtn.textContent = '生成并发布到画廊';
          }
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
    statusEl.textContent = '正在载入海报数据…';
    try {
      const res = await fetch('/api/v1/shares/' + id, {
        headers: { authorization: 'Bearer ' + token },
      });
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
      publishBtn.textContent = '更新这张海报';
      statusEl.textContent = `正在编辑海报「${data.title}」，保存后原链接保持不变。`;
      syncCatalogHighlights();
      renderPoster();
    } catch (err) {
      statusEl.textContent = err.message;
    }
  }

  downloadBtn?.addEventListener('click', async () => {
    if (!selectedApps.length) {
      statusEl.textContent = '请先在下方点选至少 1 款软件。';
      return;
    }
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
    if (!selectedApps.length) { statusEl.textContent = '请先在下方点选至少 1 款软件（也可以点「一键勾选热门 12 款」）。'; return; }
    if (!name) { statusEl.textContent = '请输入你的名字（署名），就能立刻发布海报！'; nameInput.focus(); return; }

    publishBtn.disabled = true;
    statusEl.textContent = editing ? '正在更新海报…' : '正在生成高清海报并发布…';
    try {
      await renderPoster();
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      const payload = {
        name,
        title,
        role: role || undefined,
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
      if (!res.ok) throw new Error(result.error || '发布失败，请稍后重试。');

      const owned = loadOwned().filter(x => x.id !== result.id);
      owned.unshift({ id: result.id, token: result.removeToken, title });
      saveOwned(owned);
      renderHistory();
      statusEl.textContent = isEdit ? '海报已更新！正在跳转…' : '发布成功！正在跳转到你的海报页…';
      location.href = '/s/' + result.id;
    } catch (err) {
      statusEl.textContent = err.message || '发布失败。';
    } finally {
      publishBtn.disabled = false;
    }
  });

  // Init: carry over from /taste, or load ?edit=:id, or pre-select top 6 so preview looks alive immediately!
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
      // Pre-select top 6 popular apps so visitors immediately see a gorgeous live poster preview!
      for (const a of catalog.filter(x => !x.isSystem).slice(0, 6)) addApp(a);
    }
  }
  syncCatalogHighlights();
  renderPoster();
})();
