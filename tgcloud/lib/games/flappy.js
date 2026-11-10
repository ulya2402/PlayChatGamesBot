import { t } from '../locales.js';

// === AWAL PERUBAHAN: tgcloud/lib/games/flappy.js ===
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
body{margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;font-family:system-ui,sans-serif;background:#090d16}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#090d16}
canvas{display:block;width:320px;height:480px}
#liveTop{position:absolute;top:10px;left:0;width:100%;text-align:center;pointer-events:none;color:#38bdf8;font-size:11px;font-weight:800;letter-spacing:.5px}
#hud{position:absolute;top:30px;left:0;width:100%;text-align:center;pointer-events:none;color:#f8fafc;font-size:40px;font-weight:900;font-variant-numeric:tabular-nums}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#090d16;border:2px solid #38bdf8;border-radius:14px;padding:16px;text-align:center;display:none}
.row{display:flex;justify-content:space-around;margin-bottom:10px}
.stat{font-size:10px;font-weight:800;color:#38bdf8;letter-spacing:.5px}
.val{font-size:24px;font-weight:900;color:#f8fafc}
#lbBox{background:#111827;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#f8fafc}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:12px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none;letter-spacing:.4px}
#subBtn{background:transparent;border:1.5px solid #38bdf8;color:#38bdf8}
#btn{background:#38bdf8;color:#090d16}
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

let state = 0, score = 0, best = 0, lastT = 0, spawnDist = 0, waveT = 0;
let lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_fb_best')) || 0; } catch(e) {}

const bird = { x: 78, y: 220, v: 0, g: 0.24, j: -5.1, r: 10 };
const pipes = [];
const pipeW = 44, gap = 132, groundY = 436;

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

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
    lbBox.innerHTML = '<div style="text-align:center;color:#38bdf8">${lblNone}</div>';
    return;
  }
  lbBox.innerHTML = lb.top.slice(0, 5).map((item, idx) =>
    '<div class="lbr"><span>#' + (idx + 1) + ' ' + esc(item.n) + '</span><span>' + item.s + '</span></div>'
  ).join('');
}

function reset() {
  pipes.length = 0;
  score = 0;
  spawnDist = 180;
  bird.y = 220;
  bird.v = bird.j;
  hud.textContent = '0';
  hud.style.display = 'block';
  panel.style.display = 'none';
  state = 1;
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

function update(dt) {
  waveT += 0.08 * dt;
  if (state === 0) {
    bird.y = 220 + Math.sin(waveT) * 6;
    return;
  }
  if (state !== 1) return;

  bird.v += bird.g * dt;
  bird.y += bird.v * dt;

  if (bird.y - bird.r < 0) {
    bird.y = bird.r;
    bird.v = 0;
  }
  if (bird.y + bird.r >= groundY) {
    bird.y = groundY - bird.r;
    gameOver();
    return;
  }

  const moveX = 2.2 * dt;
  spawnDist += moveX;
  if (spawnDist >= 186) {
    spawnDist = 0;
    const topH = Math.floor(Math.random() * (groundY - gap - 110)) + 55;
    pipes.push({ x: 324, top: topH, passed: false });
  }

  const hr = bird.r - 1;
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= moveX;
    if (p.x + pipeW < -10) {
      pipes.splice(i, 1);
      continue;
    }
    if (bird.x + hr > p.x && bird.x - hr < p.x + pipeW) {
      if (bird.y - hr < p.top || bird.y + hr > p.top + gap) {
        gameOver();
        return;
      }
    }
    if (!p.passed && p.x + pipeW < bird.x) {
      p.passed = true;
      score++;
      hud.textContent = String(score);
    }
  }
}

function draw() {
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 320, 480);

  ctx.fillStyle = '#38bdf8';
  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i], botY = p.top + gap;
    ctx.fillRect(p.x, 0, pipeW, p.top);
    ctx.fillRect(p.x, botY, pipeW, groundY - botY);
    ctx.fillStyle = '#090d16';
    ctx.fillRect(p.x + 3, 0, pipeW - 6, Math.max(0, p.top - 3));
    ctx.fillRect(p.x + 3, botY + 3, pipeW - 6, Math.max(0, groundY - botY - 3));
    ctx.fillStyle = '#38bdf8';
  }

  ctx.fillRect(0, groundY, 320, 2);

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(bird.x + 3, bird.y - 2, 3, 0, Math.PI * 2);
  ctx.fill();

  if (state === 0) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(70, 272, 180, 36);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('${lblStart}', 160, 295);
  }
}

if (TW) {
  syncLb(TW.publicData);
  if (typeof TW.watchPublicData === 'function') TW.watchPublicData();
  if (typeof TW.onEvent === 'function') TW.onEvent('publicDataChanged', () => syncLb(TW.publicData));
}

function loop(now) {
  if (!lastT) lastT = now;
  const dt = Math.min(2.2, Math.max(0.5, (now - lastT) / 16.667));
  lastT = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
</script>`;
}
// === BATAS PERUBAHAN: tgcloud/lib/games/flappy.js ===