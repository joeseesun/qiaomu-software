// Dynamic 1200x630 OG image renderer (via sharp) and developer SVG badge renderer.
import sharp from 'sharp';

const xmlChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => xmlChars[ch]);

const tileColors = [
  ['#6f86b8', '#3d4f7a'],
  ['#6fa89a', '#36675c'],
  ['#b48a5e', '#74532f'],
  ['#a77aa8', '#643f68'],
  ['#b87474', '#763c3f'],
  ['#7d9a5c', '#4a6131'],
  ['#5f9fb8', '#305f78'],
  ['#8f8f9c', '#55555f'],
];

function visualWidth(str) {
  let units = 0;
  for (const ch of String(str ?? '')) {
    const cp = ch.codePointAt(0);
    units += cp > 0x2e80 ? 1.85 : 1;
  }
  return units;
}

function truncateVisual(str, maxUnits) {
  let units = 0;
  let out = '';
  for (const ch of String(str ?? '')) {
    const w = ch.codePointAt(0) > 0x2e80 ? 1.85 : 1;
    if (units + w > maxUnits) return out.trimEnd() + '…';
    out += ch;
    units += w;
  }
  return out;
}

function wrapLines(str, maxUnitsPerLine, maxLines = 2) {
  const chars = Array.from(String(str ?? '').trim());
  const lines = [];
  let line = '';
  let units = 0;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const w = ch.codePointAt(0) > 0x2e80 ? 1.85 : 1;
    if (units + w > maxUnitsPerLine) {
      if (lines.length + 1 >= maxLines) {
        lines.push(line.trimEnd() + '…');
        return lines;
      }
      lines.push(line.trimEnd());
      line = ch === ' ' ? '' : ch;
      units = ch === ' ' ? 0 : w;
    } else {
      line += ch;
      units += w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Lightweight bounded LRU cache for rendered OG PNG buffers (~35KB each, max 64 = ~2.2MB)
export function createOgCache(limit = 64) {
  const map = new Map();
  return {
    get(key) {
      if (!map.has(key)) return undefined;
      const value = map.get(key);
      map.delete(key);
      map.set(key, value);
      return value;
    },
    set(key, value) {
      if (map.has(key)) map.delete(key);
      else if (map.size >= limit) map.delete(map.keys().next().value);
      map.set(key, value);
    },
  };
}

export async function renderAppOg({ app, categories = [], reason = '', iconBuffer = null }) {
  const font = 'Noto Sans CJK SC, PingFang SC, Hiragino Sans GB, SF Pro Display, sans-serif';
  const titleText = truncateVisual(app.name, 26);
  const countText = `被 ${Number(app.count) || 0} 张真实桌面海报推荐`;
  const pills = categories.slice(0, 3).map(c => truncateVisual(c.name ?? c, 12));
  const quoteLines = reason ? wrapLines(`「${reason}」`, 56, 2) : [];

  const letter = Array.from(String(app.name ?? '').trim())[0]?.toUpperCase() ?? '?';
  const tileIdx = Array.from(String(app.name ?? '').toLowerCase()).reduce((sum, ch) => sum + ch.codePointAt(0), 0) % 8;
  const [tileA, tileB] = tileColors[tileIdx];

  let pillX = 276;
  const pillSvg = pills.map(label => {
    const w = Math.max(76, Math.round(visualWidth(label) * 14 + 34));
    const el = `<g transform="translate(${pillX}, 270)">
      <rect width="${w}" height="38" rx="10" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12"/>
      <text x="${w / 2}" y="25" text-anchor="middle" font-family="${font}" font-size="18" font-weight="500" fill="#ffffff" fill-opacity="0.86">${esc(label)}</text>
    </g>`;
    pillX += w + 12;
    return el;
  }).join('');

  const quoteSvg = quoteLines.length ? `
    <rect x="88" y="362" width="1024" height="${quoteLines.length === 1 ? 94 : 132}" rx="18" fill="#171a21" stroke="#ffffff" stroke-opacity="0.1"/>
    ${quoteLines.map((line, idx) =>
      `<text x="120" y="${418 + idx * 42}" font-family="${font}" font-size="27" font-weight="500" fill="#ffffff" fill-opacity="0.92">${esc(line)}</text>`
    ).join('')}
  ` : `
    <rect x="88" y="362" width="1024" height="94" rx="18" fill="#171a21" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="120" y="419" font-family="${font}" font-size="25" font-weight="400" fill="#ffffff" fill-opacity="0.68">看看大家在 Mac 上为什么推荐它，以及常和它一起出现的软件</text>
  `;

  const fallbackIconSvg = iconBuffer ? '' : `
    <defs>
      <linearGradient id="tileGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${tileA}"/>
        <stop offset="100%" stop-color="${tileB}"/>
      </linearGradient>
    </defs>
    <rect x="104" y="138" width="136" height="136" rx="32" fill="url(#tileGrad)" stroke="#ffffff" stroke-opacity="0.18"/>
    <text x="172" y="228" text-anchor="middle" font-family="${font}" font-size="68" font-weight="600" fill="#ffffff">${esc(letter)}</text>
  `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="amberGlow" cx="15%" cy="15%" r="65%">
      <stop offset="0%" stop-color="#ffb547" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#0c0e12" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="logoBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffc566"/>
      <stop offset="100%" stop-color="#ff9f1c"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0c0e12"/>
  <rect width="1200" height="630" fill="url(#amberGlow)"/>
  <rect x="44" y="44" width="1112" height="542" rx="28" fill="#12151c" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1.5"/>
  ${fallbackIconSvg}
  <text x="276" y="182" font-family="${font}" font-size="56" font-weight="700" fill="#ffffff" fill-opacity="0.96">${esc(titleText)}</text>
  <text x="276" y="236" font-family="${font}" font-size="28" font-weight="600" fill="#ffb547">${esc(countText)}</text>
  ${pillSvg}
  ${quoteSvg}
  <g transform="translate(88, 520)">
    <rect width="34" height="34" rx="8" fill="url(#logoBg)"/>
    <path d="M17 8 L24 18 H20 L25 25 H9 L14 18 H10 Z" fill="#241503"/>
    <text x="48" y="24" font-family="${font}" font-size="22" font-weight="600" fill="#ffffff" fill-opacity="0.9">乔木软件推荐</text>
    <text x="200" y="24" font-family="${font}" font-size="20" fill="#ffffff" fill-opacity="0.5">·  大家真正在用的 Mac 软件</text>
    <text x="1024" y="24" text-anchor="end" font-family="SF Mono, Menlo, monospace" font-size="19" fill="#ffffff" fill-opacity="0.5">software.qiaomu.ai</text>
  </g>
</svg>`;

  const base = sharp(Buffer.from(svg));
  if (!iconBuffer) return base.png({ compressionLevel: 8 }).toBuffer();

  const iconPng = await sharp(iconBuffer)
    .resize(144, 144, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return base
    .composite([{ input: iconPng, left: 100, top: 134 }])
    .png({ compressionLevel: 8 })
    .toBuffer();
}

export function renderAppBadge({ app }) {
  const count = Number(app.count) || 0;
  const leftLabel = '乔木软件推荐';
  const rightLabel = `${count} Macs 推荐`;
  const leftW = Math.round(visualWidth(leftLabel) * 7.2 + 34);
  const rightW = Math.round(visualWidth(rightLabel) * 7.2 + 22);
  const totalW = leftW + rightW;
  const font = '-apple-system, BlinkMacSystemFont, PingFang SC, Noto Sans CJK SC, sans-serif';
  const title = `${app.name} - ${leftLabel} (${rightLabel})`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="28" viewBox="0 0 ${totalW} 28" role="img" aria-label="${esc(title)}">
  <title>${esc(title)}</title>
  <defs>
    <linearGradient id="b-amber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffc463"/>
      <stop offset="100%" stop-color="#ffa628"/>
    </linearGradient>
    <clipPath id="b-clip"><rect width="${totalW}" height="28" rx="7"/></clipPath>
  </defs>
  <g clip-path="url(#b-clip)">
    <rect width="${leftW}" height="28" fill="#171a21"/>
    <rect x="${leftW}" width="${rightW}" height="28" fill="url(#b-amber)"/>
    <rect x="8" y="6" width="16" height="16" rx="4" fill="url(#b-amber)"/>
    <path d="M16 9 L19.5 14 H17.5 L20 18 H12 L14.5 14 H12.5 Z" fill="#241503"/>
    <text x="${28 + (leftW - 28) / 2}" y="18.5" text-anchor="middle" font-family="${font}" font-size="12" font-weight="600" fill="#f5f6f8">${esc(leftLabel)}</text>
    <text x="${leftW + rightW / 2}" y="18.5" text-anchor="middle" font-family="${font}" font-size="12" font-weight="700" fill="#241503">${esc(rightLabel)}</text>
  </g>
  <rect x="0.5" y="0.5" width="${totalW - 1}" height="27" rx="6.5" fill="none" stroke="#ffffff" stroke-opacity="0.14"/>
</svg>`;
}
