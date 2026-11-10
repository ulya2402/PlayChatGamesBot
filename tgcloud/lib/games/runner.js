import { t } from '../locales.js';

export function getRunnerHtml(lang = 'en', botUsername = '') {
  const lblStart = t('tapToStart', lang);
  const lblPlay = t('playAgain', lang);
  const lblScore = t('score', lang);
  const lblBest = t('best', lang);
  const lblSubmit = t('submitScore', lang);
  const lblSaved = t('submitted', lang);
  const lblTop = t('topGlobal', lang);
  const lblNone = t('noRecord', lang);

  return `<style>
body{margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;font-family:system-ui,sans-serif;background:#0f172a}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#0f172a}
canvas{display:block;width:320px;height:480px}
#liveTop{position:absolute;top:8px;left:0;width:100%;text-align:center;pointer-events:none;color:#94a3b8;font-size:12px;font-weight:800}
#hud{position:absolute;top:26px;left:0;width:100%;text-align:center;pointer-events:none;color:#38bdf8;font-size:38px;font-weight:900;font-variant-numeric:tabular-nums}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#1e293b;border:3px solid #38bdf8;border-radius:16px;padding:16px;text-align:center;display:none}
.row{display:flex;justify-content:space-around;margin-bottom:8px}
.stat{font-size:11px;font-weight:800;color:#94a3b8}
.val{font-size:24px;font-weight:900;color:#f8fafc}
#lbBox{background:#0f172a;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#e2e8f0}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:13px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none}
#subBtn{background:#f59e0b;color:#0f172a}
#btn{background:#38bdf8;color:#0f172a}
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

let state = 0, frames = 0, score = 0, best = 0, speed = 4, gridX = 0, spawnTimer = 60;
let lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_rn_best')) || 0; } catch(e) {}

const groundY = 380;
const p = { x: 48, y: groundY, w: 26, h: 34, v: 0, g: 0.48, j: -9.6, jumps: 0 };
const obs = [];
const stars = [{ x: 40, y: 60 }, { x: 120, y: 100 }, { x: 210, y: 50 }, { x: 280, y: 120 }, { x: 80, y: 170 }, { x: 240, y: 190 }];

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

function reset() {
  obs.length = 0; score = 0; frames = 0; speed = 4.2; spawnTimer = 50;
  p.y = groundY; p.v = 0; p.jumps = 0;
  hud.textContent = '0'; hud.style.display = 'block';
  panel.style.display = 'none'; state = 1;
}

function jump() {
  if (state === 0) { reset(); p.v = p.j; p.jumps = 1; }
  else if (state === 1 && p.jumps < 2) { p.v = p.j * (p.jumps === 1 ? 0.88 : 1); p.jumps++; }
}

document.addEventListener('pointerdown', (e) => {
  if (e.target !== btn && e.target !== subBtn) jump();
});

btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); reset(); });

subBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const s = Math.max(best, score);
  subBtn.textContent = '${lblSaved}';
  if (TW && typeof TW.openTelegramLink === 'function' && BOT) {
    TW.openTelegramLink('https://t.me/' + BOT + '?start=save_runner_' + s);
  }
});

function gameOver() {
  state = 2;
  if (score > best) {
    best = score;
    try { localStorage.setItem('arc_rn_best', String(best)); } catch(e) {}
  }
  hud.style.display = 'none';
  scVal.textContent = String(score); bsVal.textContent = String(best);
  subBtn.textContent = '${lblSubmit}';
  renderLbList();
  panel.style.display = 'block';
}

function update() {
  if (state !== 2) gridX = (gridX - speed) % 32;
  if (state !== 1) return;
  speed = Math.min(7.5, 4.2 + score * 0.08);
  p.v += p.g; p.y += p.v;
  if (p.y >= groundY) { p.y = groundY; p.v = 0; p.jumps = 0; }
  spawnTimer--;
  if (spawnTimer <= 0) {
    const isTall = Math.random() > 0.5;
    obs.push({ x: 330, w: isTall ? 20 : 28, h: isTall ? 44 : 28, passed: false });
    spawnTimer = Math.floor(55 + Math.random() * 45);
  }
  const px1 = p.x + 5, px2 = p.x + p.w - 5, py1 = p.y - p.h + 4, py2 = p.y - 2;
  for (let i = obs.length - 1; i >= 0; i--) {
    const o = obs[i]; o.x -= speed;
    if (o.x + o.w < -20) { obs.splice(i, 1); continue; }
    if (px2 > o.x + 3 && px1 < o.x + o.w - 3 && py2 > groundY - o.h + 4 && py1 < groundY) {
      gameOver(); return;
    }
    if (!o.passed && o.x + o.w < p.x) {
      o.passed = true; score++; hud.textContent = String(score);
    }
  }
}

function drawPlayer() {
  const topY = p.y - p.h, scarfWave = Math.sin(frames * 0.3) * 4;
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath(); ctx.moveTo(p.x + 4, topY + 12); ctx.lineTo(p.x - 14, topY + 10 + scarfWave); ctx.lineTo(p.x - 10, topY + 18 + scarfWave); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e2e8f0'; ctx.fillRect(p.x, topY, p.w, p.h - 6);
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(p.x, topY + 14, p.w, p.h - 20);
  ctx.fillStyle = '#f43f5e'; ctx.fillRect(p.x, topY + 10, p.w, 4);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(p.x + 10, topY + 3, 16, 6);
  ctx.fillStyle = '#38bdf8'; ctx.fillRect(p.x + 14, topY + 4, 10, 4);
  ctx.fillStyle = '#64748b';
  if (p.y < groundY) {
    ctx.fillRect(p.x + 3, p.y - 8, 7, 6); ctx.fillRect(p.x + 16, p.y - 10, 7, 6);
  } else {
    const step = (frames % 12 < 6) ? 0 : 4;
    ctx.fillRect(p.x + 3, p.y - 6 - step, 7, 6); ctx.fillRect(p.x + 16, p.y - 10 + step, 7, 6);
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 320, 480);
  ctx.fillStyle = '#334155';
  for (let i = 0; i < stars.length; i++) ctx.fillRect(stars[i].x, stars[i].y, 3, 3);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, 250, 50, 130); ctx.fillRect(85, 210, 65, 170); ctx.fillRect(165, 260, 55, 120); ctx.fillRect(235, 225, 65, 155);
  ctx.fillRect(0, groundY, 320, 100);
  ctx.fillStyle = '#38bdf8'; ctx.fillRect(0, groundY, 320, 4);
  ctx.fillStyle = '#334155';
  for (let x = gridX; x < 320; x += 32) {
    ctx.fillRect(x, groundY + 16, 16, 4); ctx.fillRect(x + 12, groundY + 40, 16, 4);
  }
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i], top = groundY - o.h;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.moveTo(o.x, groundY); ctx.lineTo(o.x + o.w / 2, top); ctx.lineTo(o.x + o.w, groundY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath(); ctx.moveTo(o.x + o.w * 0.25, groundY); ctx.lineTo(o.x + o.w / 2, top + 6); ctx.lineTo(o.x + o.w * 0.5, groundY); ctx.closePath(); ctx.fill();
  }
  drawPlayer();
  if (state === 0) {
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(60, 200, 200, 40);
    ctx.fillStyle = '#0f172a'; ctx.font = '800 16px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('${lblStart}', 160, 225);
  }
}

if (TW) {
  syncLb(TW.publicData);
  if (typeof TW.watchPublicData === 'function') TW.watchPublicData();
  if (typeof TW.onEvent === 'function') TW.onEvent('publicDataChanged', () => syncLb(TW.publicData));
}
function loop() { frames++; update(); draw(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
</script>`;
}