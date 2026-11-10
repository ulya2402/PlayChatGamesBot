import { t } from '../locales.js';

export function getFlappyHtml(lang = 'en', botUsername = '') {
  const lblStart = t('tapToStart', lang);
  const lblPlay = t('playAgain', lang);
  const lblScore = t('score', lang);
  const lblBest = t('best', lang);
  const lblSubmit = t('submitScore', lang);
  const lblSaved = t('submitted', lang);
  const lblTop = t('topGlobal', lang);
  const lblNone = t('noRecord', lang);

  return `<style>
body{margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;font-family:system-ui,sans-serif;background:#bae6fd}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#e0f2fe}
canvas{display:block;width:320px;height:480px}
#liveTop{position:absolute;top:8px;left:0;width:100%;text-align:center;pointer-events:none;color:#0369a1;font-size:12px;font-weight:800}
#hud{position:absolute;top:26px;left:0;width:100%;text-align:center;pointer-events:none;color:#0c4a6e;font-size:38px;font-weight:900;font-variant-numeric:tabular-nums}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#ffffff;border:3px solid #0284c7;border-radius:16px;padding:16px;text-align:center;display:none}
.row{display:flex;justify-content:space-around;margin-bottom:8px}
.stat{font-size:11px;font-weight:800;color:#64748b}
.val{font-size:24px;font-weight:900;color:#0f172a}
#lbBox{background:#f0f9ff;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#0c4a6e}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:13px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none}
#subBtn{background:#f59e0b;color:#ffffff}
#btn{background:#0ea5e9;color:#ffffff}
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

let state = 0, frames = 0, score = 0, best = 0, groundX = 0;
let lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_fb_best')) || 0; } catch(e) {}

const bird = { x: 76, y: 210, v: 0, g: 0.21, j: -4.8, r: 12 };
const pipes = [];
const clouds = [{ x: 30, y: 70, s: 24 }, { x: 160, y: 110, s: 18 }, { x: 260, y: 60, s: 22 }];
const pipeW = 54, gap = 138, groundY = 412;

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
  pipes.length = 0; score = 0; frames = 0;
  bird.y = 210; bird.v = bird.j;
  hud.textContent = '0'; hud.style.display = 'block';
  panel.style.display = 'none'; state = 1;
}

function flap() {
  if (state === 0) reset();
  else if (state === 1) bird.v = bird.j;
}

document.addEventListener('pointerdown', (e) => {
  if (e.target !== btn && e.target !== subBtn) flap();
});

btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); reset(); });

subBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const s = Math.max(best, score);
  subBtn.textContent = '${lblSaved}';
  if (TW && typeof TW.openTelegramLink === 'function' && BOT) {
    TW.openTelegramLink('https://t.me/' + BOT + '?start=save_flappy_' + s);
  }
});

function gameOver() {
  state = 2;
  if (score > best) {
    best = score;
    try { localStorage.setItem('arc_fb_best', String(best)); } catch(e) {}
  }
  hud.style.display = 'none';
  scVal.textContent = String(score);
  bsVal.textContent = String(best);
  subBtn.textContent = '${lblSubmit}';
  renderLbList();
  panel.style.display = 'block';
}

function update() {
  if (state !== 2) {
    groundX = (groundX - 2) % 24;
    for (let i = 0; i < clouds.length; i++) {
      clouds[i].x -= 0.3;
      if (clouds[i].x < -50) clouds[i].x = 360;
    }
  }
  if (state === 0) {
    bird.y = 210 + Math.sin(frames * 0.08) * 6;
    return;
  }
  if (state === 1) {
    bird.v += bird.g; bird.y += bird.v;
    if (bird.y - bird.r < 0) { bird.y = bird.r; bird.v = 0; }
    if (bird.y + bird.r >= groundY) { bird.y = groundY - bird.r; gameOver(); return; }
    if (frames % 95 === 0) {
      const topH = Math.floor(Math.random() * (groundY - gap - 100 + 1)) + 50;
      pipes.push({ x: 320, top: topH, passed: false });
    }
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i]; p.x -= 2;
      if (p.x + pipeW < -10) { pipes.splice(i, 1); continue; }
      const hr = bird.r - 2;
      if (bird.x + hr > p.x && bird.x - hr < p.x + pipeW) {
        if (bird.y - hr < p.top || bird.y + hr > p.top + gap) { gameOver(); return; }
      }
      if (!p.passed && p.x + pipeW < bird.x) {
        p.passed = true; score++; hud.textContent = String(score);
      }
    }
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(state === 0 ? 0 : Math.min(Math.PI / 3, Math.max(-Math.PI / 5, bird.v * 0.09)));
  ctx.fillStyle = '#ea580c';
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-18, -5); ctx.lineTo(-16, 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.arc(0, 0, bird.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(-2, -12, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fde68a';
  const wingY = (frames % 14 < 7 && state !== 2) ? 3 : -1;
  ctx.beginPath(); ctx.ellipse(-3, wingY, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(5, -3, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(6.5, -3, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ea580c';
  ctx.beginPath(); ctx.moveTo(10, -2); ctx.lineTo(19, 2); ctx.lineTo(10, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function draw() {
  ctx.fillStyle = '#e0f2fe'; ctx.fillRect(0, 0, 320, 480);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < clouds.length; i++) {
    const c = clouds[i];
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.s, 0, Math.PI * 2);
    ctx.arc(c.x + c.s * 0.8, c.y + 4, c.s * 0.75, 0, Math.PI * 2);
    ctx.arc(c.x - c.s * 0.7, c.y + 5, c.s * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(0, 340, 45, 72); ctx.fillRect(50, 315, 55, 97); ctx.fillRect(110, 350, 40, 62);
  ctx.fillRect(155, 305, 60, 107); ctx.fillRect(220, 335, 50, 77); ctx.fillRect(275, 320, 45, 92);

  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i], botY = p.top + gap, botH = groundY - botY;
    ctx.fillStyle = '#10b981'; ctx.fillRect(p.x, 0, pipeW, p.top); ctx.fillRect(p.x, botY, pipeW, botH);
    ctx.fillStyle = '#34d399'; ctx.fillRect(p.x + 6, 0, 8, p.top); ctx.fillRect(p.x + 6, botY, 8, botH);
    ctx.fillStyle = '#059669'; ctx.fillRect(p.x - 3, p.top - 18, pipeW + 6, 18); ctx.fillRect(p.x - 3, botY, pipeW + 6, 18);
  }
  ctx.fillStyle = '#d97706'; ctx.fillRect(0, groundY, 320, 68);
  ctx.fillStyle = '#10b981'; ctx.fillRect(0, groundY, 320, 14);
  ctx.fillStyle = '#059669';
  for (let x = groundX; x < 320; x += 24) ctx.fillRect(x, groundY + 4, 12, 6);

  drawBird();
  if (state === 0) {
    ctx.fillStyle = '#0284c7'; ctx.fillRect(60, 265, 200, 40);
    ctx.fillStyle = '#ffffff'; ctx.font = '800 16px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('${lblStart}', 160, 290);
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