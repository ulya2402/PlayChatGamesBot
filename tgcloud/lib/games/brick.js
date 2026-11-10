import { t } from '../locales.js';

export function getBrickHtml(lang = 'en', botUsername = '') {
  const lblStart = t('dragToPlay', lang);
  const lblPlay = t('playAgain', lang);
  const lblScore = t('score', lang);
  const lblBest = t('best', lang);
  const lblSubmit = t('submitScore', lang);
  const lblSaved = t('submitted', lang);
  const lblTop = t('topGlobal', lang);
  const lblNone = t('noRecord', lang);

  return `<style>
body{margin:0;padding:0;overflow:hidden;touch-action:pan-y;user-select:none;font-family:system-ui,sans-serif;background:#090d16}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#090d16;touch-action:pan-y}
canvas{display:block;width:320px;height:480px;touch-action:pan-y}
#liveTop{position:absolute;top:6px;left:0;width:100%;text-align:center;pointer-events:none;color:#10b981;font-size:12px;font-weight:800}
#hud{position:absolute;top:22px;left:0;width:100%;text-align:center;pointer-events:none;color:#f8fafc;font-size:32px;font-weight:900;font-variant-numeric:tabular-nums}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#1e293b;border:3px solid #10b981;border-radius:16px;padding:16px;text-align:center;display:none}
.row{display:flex;justify-content:space-around;margin-bottom:8px}
.stat{font-size:11px;font-weight:800;color:#94a3b8}
.val{font-size:24px;font-weight:900;color:#ffffff}
#lbBox{background:#090d16;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#e2e8f0}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:13px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none}
#subBtn{background:#f59e0b;color:#090d16}
#btn{background:#10b981;color:#090d16}
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

const rowColors = ['#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#8b5cf6'];
let state = 0, score = 0, best = 0;
let lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_br_best')) || 0; } catch(e) {}

const pad = { x: 120, y: 430, w: 80, h: 12 };
const ball = { x: 160, y: 418, vx: 3.2, vy: -3.6, r: 6 };
const bricks = [];

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
    lbBox.innerHTML = '<div style="text-align:center;color:#64748b">${lblNone}</div>';
    return;
  }
  lbBox.innerHTML = lb.top.slice(0, 5).map((item, idx) =>
    '<div class="lbr"><span>#' + (idx + 1) + ' ' + item.n + '</span><span>' + item.s + '</span></div>'
  ).join('');
}

function buildBricks() {
  bricks.length = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      bricks.push({ x: 18 + c * 48, y: 68 + r * 20, w: 44, h: 16, c: rowColors[r], alive: true });
    }
  }
}
buildBricks();

function reset() {
  buildBricks(); score = 0; pad.x = 120;
  ball.x = 160; ball.y = 418;
  ball.vx = (Math.random() > 0.5 ? 1 : -1) * 3.1; ball.vy = -3.6;
  hud.textContent = '0'; hud.style.display = 'block';
  panel.style.display = 'none'; state = 1;
}

function movePad(clientX) {
  const rect = cvs.getBoundingClientRect();
  const relX = (clientX - rect.left) * (320 / (rect.width || 320));
  pad.x = Math.max(20, Math.min(300 - pad.w, relX - pad.w / 2));
}

cvs.addEventListener('pointerdown', (e) => {
  movePad(e.clientX);
  if (state === 0) reset();
});

cvs.addEventListener('pointermove', (e) => {
  if (state === 1) movePad(e.clientX);
});

btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); reset(); });

subBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const s = Math.max(best, score);
  subBtn.textContent = '${lblSaved}';
  if (TW && typeof TW.openTelegramLink === 'function' && BOT) {
    TW.openTelegramLink('https://t.me/' + BOT + '?start=save_brick_' + s);
  }
});

function gameOver() {
  state = 2;
  if (score > best) {
    best = score;
    try { localStorage.setItem('arc_br_best', String(best)); } catch(e) {}
  }
  hud.style.display = 'none';
  scVal.textContent = String(score); bsVal.textContent = String(best);
  subBtn.textContent = '${lblSubmit}';
  renderLbList();
  panel.style.display = 'block';
}

function update() {
  if (state !== 1) return;
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.x - ball.r <= 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
  else if (ball.x + ball.r >= 320) { ball.x = 320 - ball.r; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - ball.r <= 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

  if (ball.vy > 0 && ball.y + ball.r >= pad.y && ball.y - ball.r <= pad.y + pad.h && ball.x >= pad.x - 4 && ball.x <= pad.x + pad.w + 4) {
    const hitOffset = (ball.x - (pad.x + pad.w / 2)) / (pad.w / 2);
    const spd = Math.min(6.4, Math.hypot(ball.vx, ball.vy) + 0.08);
    ball.vx = hitOffset * spd * 0.85;
    ball.vy = -Math.sqrt(Math.max(4, spd * spd - ball.vx * ball.vx));
    ball.y = pad.y - ball.r;
  }

  let rem = 0;
  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i];
    if (!b.alive) continue;
    rem++;
    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
      b.alive = false; ball.vy = -ball.vy; score++; hud.textContent = String(score); break;
    }
  }
  if (rem === 0) { buildBricks(); ball.vy = -Math.abs(ball.vy); }
  if (ball.y - ball.r > 480) gameOver();
}

function draw() {
  ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, 320, 480);
  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i];
    if (!b.alive) continue;
    ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 3);
  }
  ctx.fillStyle = '#10b981'; ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
  ctx.fillStyle = '#34d399'; ctx.fillRect(pad.x + 4, pad.y + 2, pad.w - 8, 4);
  ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();

  if (state === 0) {
    ctx.fillStyle = '#10b981'; ctx.fillRect(50, 240, 220, 40);
    ctx.fillStyle = '#090d16'; ctx.font = '800 15px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('${lblStart}', 160, 265);
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