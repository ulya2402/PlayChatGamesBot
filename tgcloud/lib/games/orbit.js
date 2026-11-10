import { t } from '../locales.js';

export function getOrbitHtml(lang = 'en', botUsername = '') {
  const lblStart = t('tapToStart', lang);
  const lblPlay = t('playAgain', lang);
  const lblScore = t('score', lang);
  const lblBest = t('best', lang);
  const lblSubmit = t('submitScore', lang);
  const lblSaved = t('submitted', lang);
  const lblTop = t('topGlobal', lang);
  const lblNone = t('noRecord', lang);

  return `<style>
body{margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;font-family:system-ui,sans-serif;background:#0c0a1d}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#0c0a1d}
canvas{display:block;width:320px;height:480px}
#liveTop{position:absolute;top:8px;left:0;width:100%;text-align:center;pointer-events:none;color:#a5b4fc;font-size:12px;font-weight:800}
#hud{position:absolute;top:26px;left:0;width:100%;text-align:center;pointer-events:none;color:#fde047;font-size:38px;font-weight:900;font-variant-numeric:tabular-nums}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#1e1b4b;border:3px solid #fde047;border-radius:16px;padding:16px;text-align:center;display:none}
.row{display:flex;justify-content:space-around;margin-bottom:8px}
.stat{font-size:11px;font-weight:800;color:#a5b4fc}
.val{font-size:24px;font-weight:900;color:#ffffff}
#lbBox{background:#0c0a1d;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#e0e7ff}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:13px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none}
#subBtn{background:#f59e0b;color:#0c0a1d}
#btn{background:#fde047;color:#0c0a1d}
</style>
<div id="wrap">
  <div id="liveTop">${lblTop} --</div>
  <div id="hud">0</div>
  <div id="panel">
    <div class="row">
      <div><div class="stat">${lblScore}</div><div id="scVal" class="val">0</div></div>
      <div><div class="stat">${lblBest}</div><div id="bsVal" class="val">0</div></div>
    </div>
    <div id="lbBox"></div>
    <button id="subBtn" class="pbtn">${lblSubmit}</button>
    <button id="btn" class="pbtn">${lblPlay}</button>
  </div>
  <canvas id="cvs" width="320" height="480"></canvas>
</div>
<script>
const TW = window.TelegramWidget;
const BOT = '${botUsername}';
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
const hud = document.getElementById('hud');
const liveTop = document.getElementById('liveTop');
const panel = document.getElementById('panel');
const scVal = document.getElementById('scVal');
const bsVal = document.getElementById('bsVal');
const lbBox = document.getElementById('lbBox');
const subBtn = document.getElementById('subBtn');
const btn = document.getElementById('btn');

const cx = 160, cy = 250, radii = [72, 118];
let state = 0, score = 0, best = 0;
let lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_or_best')) || 0; } catch(e) {}

let lane = 0, curR = radii[0], angle = 0, spd = 0.032;
let star = { lane: 1, angle: Math.PI };
const hazards = [{ lane: 0, angle: Math.PI * 0.7 }, { lane: 1, angle: Math.PI * 1.6 }];

function syncLb(raw) {
  if (!raw) return;
  try {
    const next = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (next && typeof next.r === 'number' && next.r >= lb.r) {
      lb = next;
      liveTop.textContent = (lb.top && lb.top[0]) ? '${lblTop} ' + lb.top[0].n + ' (' + lb.top[0].s + ')' : '${lblTop} --';
      renderLbList();
    }
  } catch(e) {}
}

function renderLbList() {
  if (!lb.top || !lb.top.length) {
    lbBox.innerHTML = '<div style="text-align:center;color:#6366f1">${lblNone}</div>';
    return;
  }
  lbBox.innerHTML = lb.top.slice(0, 5).map((item, idx) =>
    '<div class="lbr"><span>#' + (idx + 1) + ' ' + item.n + '</span><span>' + item.s + '</span></div>'
  ).join('');
}

function spawnStar() {
  star.lane = Math.random() > 0.5 ? 1 : 0;
  star.angle = (angle + Math.PI * (0.6 + Math.random() * 1.1)) % (Math.PI * 2);
}

function reset() {
  score = 0; lane = 0; curR = radii[0]; angle = 0; spd = 0.032;
  hazards[0] = { lane: 0, angle: Math.PI * 0.8 };
  hazards[1] = { lane: 1, angle: Math.PI * 1.5 };
  spawnStar();
  hud.textContent = '0'; hud.style.display = 'block';
  panel.style.display = 'none'; state = 1;
}

function switchLane() {
  if (state === 0) reset();
  else if (state === 1) lane = lane === 0 ? 1 : 0;
}

document.addEventListener('pointerdown', (e) => {
  if (e.target !== btn && e.target !== subBtn) switchLane();
});

btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); reset(); });

subBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const s = Math.max(best, score);
  subBtn.textContent = '${lblSaved}';
  if (TW && typeof TW.openTelegramLink === 'function' && BOT) {
    TW.openTelegramLink('https://t.me/' + BOT + '?start=save_orbit_' + s);
  }
});

function gameOver() {
  state = 2;
  if (score > best) {
    best = score;
    try { localStorage.setItem('arc_or_best', String(best)); } catch(e) {}
  }
  hud.style.display = 'none';
  scVal.textContent = String(score); bsVal.textContent = String(best);
  subBtn.textContent = '${lblSubmit}';
  renderLbList();
  panel.style.display = 'block';
}

function update() {
  if (state !== 1) return;
  curR += (radii[lane] - curR) * 0.25;
  angle = (angle + spd) % (Math.PI * 2);
  for (let i = 0; i < hazards.length; i++) {
    hazards[i].angle = (hazards[i].angle - spd * 0.45 + Math.PI * 2) % (Math.PI * 2);
  }
  const px = cx + Math.cos(angle) * curR, py = cy + Math.sin(angle) * curR;
  const sx = cx + Math.cos(star.angle) * radii[star.lane], sy = cy + Math.sin(star.angle) * radii[star.lane];
  if (Math.hypot(px - sx, py - sy) < 18) {
    score++; hud.textContent = String(score);
    spd = Math.min(0.058, 0.032 + score * 0.0008);
    spawnStar();
  }
  for (let i = 0; i < hazards.length; i++) {
    const h = hazards[i];
    const hx = cx + Math.cos(h.angle) * radii[h.lane], hy = cy + Math.sin(h.angle) * radii[h.lane];
    if (Math.hypot(px - hx, py - hy) < 15) { gameOver(); return; }
  }
}

function draw() {
  ctx.fillStyle = '#0c0a1d'; ctx.fillRect(0, 0, 320, 480);
  ctx.strokeStyle = '#312e81'; ctx.lineWidth = 3;
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(cx, cy, radii[i], 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = '#6366f1'; ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#818cf8'; ctx.beginPath(); ctx.arc(cx - 8, cy - 8, 12, 0, Math.PI * 2); ctx.fill();

  const sx = cx + Math.cos(star.angle) * radii[star.lane], sy = cy + Math.sin(star.angle) * radii[star.lane];
  ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.fill();

  for (let i = 0; i < hazards.length; i++) {
    const h = hazards[i];
    const hx = cx + Math.cos(h.angle) * radii[h.lane], hy = cy + Math.sin(h.angle) * radii[h.lane];
    ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fda4af'; ctx.beginPath(); ctx.arc(hx - 3, hy - 3, 3, 0, Math.PI * 2); ctx.fill();
  }

  const px = cx + Math.cos(angle) * curR, py = cy + Math.sin(angle) * curR;
  ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();

  if (state === 0) {
    ctx.fillStyle = '#fde047'; ctx.fillRect(60, 405, 200, 40);
    ctx.fillStyle = '#0c0a1d'; ctx.font = '800 16px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('${lblStart}', 160, 430);
  }
}

if (TW) {
  syncLb(TW.publicData);
  if (typeof TW.watchPublicData === 'function') TW.watchPublicData();
  if (typeof TW.onEvent === 'function') TW.onEvent('publicDataChanged', () => syncLb(TW.publicData));
}
function loop() { update(); draw(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
</script>`;
}