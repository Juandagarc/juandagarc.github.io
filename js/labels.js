// Canvas-drawn labels (museum placards, floor engravings). Redrawn when the language changes.
import * as THREE from 'three';

const registry = [];
export const FONT_BODY = '"Plus Jakarta Sans", system-ui, sans-serif';
export const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

export function makeLabel({ width = 1, height = 0.3, px = 768, draw, brightness = 1, side = THREE.FrontSide }) {
  const W = px;
  const H = Math.max(8, Math.round((px * height) / width));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side });
  mat.color.setScalar(brightness);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.renderOrder = 2;
  const api = {
    mesh,
    redraw(lang) {
      ctx.clearRect(0, 0, W, H);
      draw(ctx, W, H, lang);
      tex.needsUpdate = true;
    },
  };
  registry.push(api);
  return api;
}

export function redrawLabels(lang) {
  for (const l of registry) l.redraw(lang);
}

// Helpers used by the draw callbacks.
export function text(ctx, str, x, y, { size = 40, weight = 500, font = FONT_BODY, color = '#ECEEF2', align = 'left', spacing = 0, italic = false, baseline = 'alphabetic' } = {}) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(str, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

export function rule(ctx, x0, y, x1, color = 'rgba(236,238,242,.35)', w = 2) {
  ctx.fillStyle = color;
  ctx.fillRect(x0, y, x1 - x0, w);
}

// A museum placard: inventory line, title, sub-line, all on a frosted plate.
export function placard(ctx, W, H, { inv, title, sub, room, plate = true, accent = '#ECEEF2' }) {
  if (plate) {
    ctx.fillStyle = 'rgba(12,13,17,.78)';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(236,238,242,.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
  }
  const p = Math.round(H * 0.14);
  const s = H / 220;
  text(ctx, inv || '', p, p + 22 * s, { size: 22 * s, font: FONT_MONO, color: 'rgba(236,238,242,.6)', spacing: 3 * s });
  if (room) text(ctx, room, W - p, p + 22 * s, { size: 22 * s, font: FONT_MONO, color: 'rgba(236,238,242,.6)', spacing: 3 * s, align: 'right' });
  rule(ctx, p, p + 40 * s, W - p, 'rgba(236,238,242,.2)', 2 * s);
  // long titles shrink to fit the plate instead of running off it
  let ts = 54 * s;
  ctx.font = `italic 800 ${ts}px ${FONT_BODY}`;
  const tw = ctx.measureText(title || '').width;
  if (tw > W - p * 2) ts *= (W - p * 2) / tw;
  text(ctx, title || '', p, p + 104 * s, { size: ts, weight: 800, italic: true, color: accent });
  if (sub) text(ctx, sub, p, p + 150 * s, { size: 26 * s, font: FONT_MONO, color: 'rgba(236,238,242,.72)', spacing: 1 * s });
}
