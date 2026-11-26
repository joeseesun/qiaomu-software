// Browser-based Mac Software Poster Studio (/studio)
// Renders a 1600x900 dark-desktop poster locally on Canvas, reuses site consensus icons,
// supports publishing (POST), in-place updating (PUT), and withdrawal (DELETE) via localStorage tokens.

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
  const publishBtn = document.getElementById('studio-publish');
  const downloadBtn = document.getElementById('studio-download');
  const statusEl = document.getElementById('studio-status');
  const appSearch = document.getElementById('studio-app-search');
  const suggestMenu = document.getElementById('studio-suggest');
  const defaultCatSelect = document.getElementById('studio-default-cat');
  const addCustomBtn = document.getElementById('studio-add-custom');
  const selectedListEl = document.getElementById('studio-selected-list');
  const appCountEl = document.getElementById('studio-app-count');
  const historyCard = document.getElementById('studio-history-card');
  const historyList = document.getElementById('studio-history');

  const categories = JSON.parse(document.getElementById('studio-cats')?.textContent || '["效率","开发","写作","AI","设计","影音"]');
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

  const presets = {
    amber: ['#1b140d', '#0f1218', '#ffb547', 0.24],
    ocean: ['#0c1c2c', '#0b0e14', '#4aa8d8', 0.22],
    forest: ['#0e1d18', '#0c0f13', '#52b788', 0.2],
    slate: ['#1c2028', '#0c0e12', '#a8b0c0', 0.14],
  };

  let activePreset = 'amber';
  let bgBitmap = null;
  let editing = null; // { id, token } when editing an existing browser-created poster
  const selectedApps = []; // [{ name, key, group, note, icon }]
  const iconImages = new Map(); // hash -> HTMLImageElement

  function loadOwned() {
    try { return JSON.parse(localStorage.getItem(OWNED_KEY) || '[]'); }
    catch { return []; }
  }
  function saveOwned(list) {
    try { localStorage.setItem(OWNED_KEY, JSON.stringify(list.slice(0, 30))); } catch {}
  }

  function loadIconImage(hash) {
    if (!hash) return Promise.resolve(null);
    if (iconImages.has(hash)) return Promise.resolve(iconImages.get(hash));
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { iconImages.set(hash, img); resolve(img); };
      img.onerror = () => resolve(null);
      img.src = '/icons/' + hash + '.webp';
    });
  }

  function roundedRect(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
    c.closePath();
  }

  function drawCover(img, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
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
    roundedRect(ctx, x + inset, y + inset, s, s, s * 0.23);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = `600 ${Math.round(s * 0.48)}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x + size / 2, y + size / 2 + 1);
  }

  function truncateText(text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let out = text;
    while (out.length > 1 && ctx.measureText(out + '…').width > maxWidth) {
      out = out.slice(0, -1);
    }
    return out + '…';
  }

  async function renderPoster() {
    const W = 1600;
    const H = 900;
    await Promise.all(selectedApps.map(a => loadIconImage(a.icon)));

    // 1. Background wallpaper or preset
    if (bgBitmap) {
      drawCover(bgBitmap, W, H);
      ctx.fillStyle = 'rgba(10, 12, 16, 0.42)';
      ctx.fillRect(0, 0, W, H);
    } else {
      const [c1, c2, glow, alpha] = presets[activePreset] || presets.amber;
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, c1);
      bgGrad.addColorStop(1, c2);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const rad = ctx.createRadialGradient(W * 0.22, H * 0.18, 40, W * 0.22, H * 0.18, W * 0.72);
      rad.addColorStop(0, glow);
      rad.addColorStop(1, 'rgba(12,14,18,0)');
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // 2. Frosted dark glass main card
    const padX = 64;
    const padY = 56;
    const cardW = W - padX * 2;
    const cardH = H - padY * 2;
    ctx.save();
    roundedRect(ctx, padX, padY, cardW, cardH, 28);
    ctx.fillStyle = 'rgba(14, 17, 23, 0.80)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 3. Header row
    const title = titleInput.value.trim() || '我的 Mac 常用软件';
    const author = nameInput.value.trim() || '匿名 Mac 用户';
    const role = roleInput.value.trim();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.font = '700 44px -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillText(truncateText(title, 960), padX + 46, padY + 86);

    ctx.fillStyle = 'rgba(255,255,255,0.68)';
    ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans SC", sans-serif';
    const metaText = `${author}${role ? ' · ' + role : ''} · 共推荐 ${selectedApps.length} 款软件`;
    ctx.fillText(metaText, padX + 46, padY + 126);

    // Top-right badge
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffb547';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    ctx.fillText('乔木软件推荐', padX + cardW - 46, padY + 82);
    ctx.fillStyle = 'rgba(255,255,255,0.48)';
    ctx.font = '500 17px "SF Mono", ui-monospace, Menlo, monospace';
    ctx.fillText('software.qiaomu.ai', padX + cardW - 46, padY + 114);

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX + 46, padY + 152);
    ctx.lineTo(padX + cardW - 46, padY + 152);
    ctx.stroke();

    // 4. App Grid
    const gridX = padX + 46;
    const gridY = padY + 180;
    const gridW = cardW - 92;
    const gridH = cardH - 224;

    if (!selectedApps.length) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.52)';
      ctx.font = '500 26px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
      ctx.fillText('在右侧挑选你的 Mac 软件，这里会实时合成海报', W / 2, gridY + gridH / 2);
      return;
    }

    const n = selectedApps.length;
    let cols = 4;
    if (n <= 6) cols = 3;
    else if (n <= 12) cols = 4;
    else if (n <= 20) cols = 5;
    else if (n <= 30) cols = 6;
    else cols = 8;
    const rows = Math.ceil(n / cols);
    const gapX = cols >= 6 ? 18 : 24;
    const gapY = rows >= 5 ? 16 : 22;
    const cellW = (gridW - gapX * (cols - 1)) / cols;
    const cellH = Math.min(132, (gridH - gapY * (rows - 1)) / rows);
    const compact = cols >= 6 || rows >= 5;
    const iconSize = compact ? Math.min(54, cellH - 24) : Math.min(68, cellH - 28);

    selectedApps.forEach((app, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = gridX + col * (cellW + gapX);
      const y = gridY + row * (cellH + gapY);

      roundedRect(ctx, x, y, cellW, cellH, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const ix = x + 16;
      const iy = y + (cellH - iconSize) / 2;
      const img = app.icon ? iconImages.get(app.icon) : null;
      if (img) {
        ctx.drawImage(img, ix, iy, iconSize, iconSize);
      } else {
        drawFallbackTile(ix, iy, iconSize, app.name);
      }

      const tx = ix + iconSize + 14;
      const maxTw = cellW - (tx - x) - 14;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = `600 ${compact ? 17 : 21}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
      const nameY = app.note && !compact ? y + cellH * 0.34 : y + cellH * 0.40;
      ctx.fillText(truncateText(app.name, maxTw), tx, nameY);

      ctx.fillStyle = '#ffb547';
      ctx.font = `500 ${compact ? 13 : 15}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
      const subText = app.note && !compact ? `「${app.note}」` : app.group;
      if (app.note && !compact) {
        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.fillText(truncateText(subText, maxTw), tx, y + cellH * 0.68);
      } else {
        ctx.fillText(truncateText(app.group, maxTw), tx, y + cellH * 0.68);
      }
    });
  }

  function renderSelectedList() {
    appCountEl.textContent = String(selectedApps.length);
    selectedListEl.replaceChildren();
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
        renderSelectedList();
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
      catInput.addEventListener('input', () => {
        app.group = catInput.value.trim() || '效率';
        renderPoster();
      });

      const noteInput = document.createElement('input');
      noteInput.type = 'text';
      noteInput.maxLength = 60;
      noteInput.value = app.note || '';
      noteInput.placeholder = '写一句推荐理由（可选，最多 60 字）';
      noteInput.addEventListener('input', () => {
        app.note = noteInput.value.trim();
        renderPoster();
      });

      controls.append(catInput, noteInput);
      li.append(top, controls);
      selectedListEl.append(li);
    });
  }

  function addApp(item) {
    if (selectedApps.length >= 48) {
      statusEl.textContent = '每张海报最多选择 48 款软件。';
      return;
    }
    const norm = item.name.trim().toLowerCase();
    if (!norm || selectedApps.some(a => a.name.toLowerCase() === norm)) return;
    selectedApps.push({
      name: item.name.trim(),
      key: item.key || norm,
      group: item.group || defaultCatSelect.value || '效率',
      note: item.note || '',
      icon: item.icon || '',
    });
    renderSelectedList();
    renderPoster();
  }

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
            publishBtn.textContent = '发布海报';
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
      renderSelectedList();
      renderPoster();
    } catch (err) {
      statusEl.textContent = err.message;
    }
  }

  // Preset wallpaper switching
  for (const btn of document.querySelectorAll('[data-preset]')) {
    btn.addEventListener('click', () => {
      bgBitmap = null;
      activePreset = btn.dataset.preset;
      for (const other of document.querySelectorAll('[data-preset]')) {
        const active = other === btn;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      renderPoster();
    });
  }

  bgFileInput?.addEventListener('change', async () => {
    const file = bgFileInput.files?.[0];
    if (!file) return;
    try {
      bgBitmap = await createImageBitmap(file);
      for (const other of document.querySelectorAll('[data-preset]')) {
        other.classList.remove('is-active');
        other.setAttribute('aria-pressed', 'false');
      }
      renderPoster();
    } catch {
      statusEl.textContent = '无法读取该图片，请换一张 JPG/PNG/WebP 壁纸。';
    }
  });

  [titleInput, nameInput, roleInput].forEach(el => el?.addEventListener('input', renderPoster));

  // Quick-pick catalog chips
  for (const btn of document.querySelectorAll('[data-studio-pick]')) {
    btn.addEventListener('click', () => {
      addApp(JSON.parse(btn.dataset.studioPick));
    });
  }

  // Batch paste import from `ls /Applications`
  const pasteInput = document.getElementById('studio-paste-input');
  const pasteBtn = document.getElementById('studio-paste-btn');
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
        const before = selectedApps.length;
        addApp({ name: item.name, key: item.key, group: item.group, icon: item.icon });
        if (selectedApps.length > before) added++;
      }
      pasteInput.value = '';
      statusEl.textContent = added ? `已自动导入 ${added} 款软件并匹配共识图标！可继续调整分类或补写推荐理由。` : '没有新增软件（可能已在清单中或均为系统自带应用）。';
    } catch (err) {
      statusEl.textContent = err.message || '解析失败。';
    } finally {
      pasteBtn.disabled = false;
    }
  });

  // Search suggest inside studio
  let suggestTimer = null;
  appSearch?.addEventListener('input', () => {
    clearTimeout(suggestTimer);
    const q = appSearch.value.trim();
    if (!q) { suggestMenu.hidden = true; return; }
    suggestTimer = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/suggest?q=' + encodeURIComponent(q));
        if (!res.ok) return;
        const data = await res.json();
        suggestMenu.replaceChildren();
        if (!data.apps?.length) { suggestMenu.hidden = true; return; }
        for (const a of data.apps) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'suggest-item';
          if (a.icon) {
            const img = document.createElement('img');
            img.src = a.icon;
            img.alt = '';
            img.width = 24;
            img.height = 24;
            btn.append(img);
          }
          const span = document.createElement('span');
          span.className = 'suggest-item-name';
          span.textContent = a.name;
          const meta = document.createElement('span');
          meta.className = 'suggest-item-meta';
          meta.textContent = a.category || `${a.count} 张海报`;
          btn.append(span, meta);
          btn.addEventListener('click', () => {
            addApp({ name: a.name, key: a.key, group: a.category || defaultCatSelect.value, icon: a.iconHash || '' });
            appSearch.value = '';
            suggestMenu.hidden = true;
          });
          suggestMenu.append(btn);
        }
        suggestMenu.hidden = false;
      } catch {}
    }, 140);
  });

  const addCustomFromInput = () => {
    const val = appSearch.value.trim();
    if (!val) return;
    addApp({ name: val, group: defaultCatSelect.value || '效率' });
    appSearch.value = '';
    suggestMenu.hidden = true;
  };
  addCustomBtn?.addEventListener('click', addCustomFromInput);
  appSearch?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomFromInput(); }
  });
  document.addEventListener('click', e => {
    if (!appSearch?.closest('.studio-search-box')?.contains(e.target)) suggestMenu.hidden = true;
  });

  downloadBtn?.addEventListener('click', async () => {
    await renderPoster();
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = (titleInput.value.trim() || 'mac-software') + '.png';
    a.click();
  });

  publishBtn?.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const name = nameInput.value.trim();
    const role = roleInput.value.trim();
    if (!name) { statusEl.textContent = '请填写署名。'; nameInput.focus(); return; }
    if (!title) { statusEl.textContent = '请填写海报标题。'; titleInput.focus(); return; }
    if (!selectedApps.length) { statusEl.textContent = '请至少选择 1 款软件。'; return; }

    publishBtn.disabled = true;
    statusEl.textContent = editing ? '正在更新海报…' : '正在合成并上传海报…';
    try {
      await renderPoster();
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      const payload = {
        name,
        title,
        role: role || undefined,
        visibility: visSelect.value,
        apps: selectedApps.map(a => ({
          name: a.name,
          group: a.group || '效率',
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

  // Init: carry over from /taste, or load ?edit=:id from URL
  renderHistory();
  const editId = new URLSearchParams(location.search).get('edit');
  if (editId) {
    const found = loadOwned().find(x => x.id === editId);
    if (found) loadForEdit(found.id, found.token);
  } else {
    try {
      const carried = JSON.parse(sessionStorage.getItem(TASTE_CARRY_KEY) || 'null');
      if (Array.isArray(carried) && carried.length) {
        sessionStorage.removeItem(TASTE_CARRY_KEY);
        for (const a of carried) addApp(a);
      }
    } catch {}
  }
  renderPoster();
})();
