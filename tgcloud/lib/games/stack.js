import { t } from '../locales.js';

export function getStackHtml(lang = 'en', botUsername = '') {
  const lblStart = t('tapToStart', lang);
  const lblPlay = t('playAgain', lang);
  const lblScore = t('score', lang);
  const lblBest = t('best', lang);
  const lblPerfect = t('perfect', lang);
  const lblSubmit = t('submitScore', lang);
  const lblSaved = t('submitted', lang);
  const lblTop = t('topGlobal', lang);
  const lblNone = t('noRecord', lang);

  return `<style>
body{margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;font-family:system-ui,sans-serif;background:#18181b}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#18181b}
canvas{display:block;width:320px;height:480px}
#liveTop{position:absolute;top:8px;left:0;width:100%;text-align:center;pointer-events:none;color:#a1a1aa;font-size:12px;font-weight:800}
#hud{position:absolute;top:26px;left:0;width:100%;text-align:center;pointer-events:none;color:#ffffff;font-size:38px;font-weight:900;font-variant-numeric:tabular-nums}
#msg{position:absolute;top:72px;left:0;width:100%;text-align:center;pointer-events:none;color:#facc15;font-size:15px;font-weight:900}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#27272a;border:3px solid #a855f7;border-radius:16px;padding:16px;text-align:center;display:none}
.row{display:flex;justify-content:space-around;margin-bottom:8px}
.stat{font-size:11px;font-weight:800;color:#a1a1aa}
.val{font-size:24px;font-weight:900;color:#ffffff}
#lbBox{background:#18181b;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#e4e4e7}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:13px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none}
#subBtn{background:#f59e0b;color:#18181b}
#btn{background:#a855f7;color:#ffffff}
</style>
<div id="wrap">
  <div id="liveTop">${lblTop} --</div>
  <div id="hud">0</div>
  <div id="msg"></div>
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
const msg = document.getElementById('msg');
const panel = document.getElementById('panel');
const scVal = document.getElementById('scVal');
const bsVal = document.getElementById('bsVal');
const lbBox = document.getElementById('lbBox');
const subBtn = document.getElementById('subBtn');
const btn = document.getElementById('btn');

const palette = ['#f43f5e','#f97316','#f59e0b','#10b981','#06b6d4','#3b82f6','#8b5cf6','#d946ef'];
const blockH = 24;
let state = 0, score = 0, best = 0, msgTimer = 0;
let lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_st_best')) || 0; } catch(e) {}

const stack = [], debris = [];
let curr = { x: 0, w: 160, dir: 1, spd: 2.5, c: palette[1] };

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
    lbBox.innerHTML = '<div style="text-align:center;color:#71717a">${lblNone}</div>';
    return;
  }
  lbBox.innerHTML = lb.top.slice(0, 5).map((item, idx) =>
    '<div class="lbr"><span>#' + (idx + 1) + ' ' + item.n + '</span><span>' + item.s + '</span></div>'
  ).join('');
}

function initTower() {
  stack.length = 0; debris.length = 0;
  stack.push({ x: 80, w: 160, c: palette[0] });
  curr = { x: 0, w: 160, dir: 1, spd: 2.6, c: palette[1] };
}
initTower();

function start() {
  initTower(); score = 0;
  hud.textContent = '0'; hud.style.display = 'block';
  panel.style.display = 'none'; msg.textContent = ''; state = 1;
}

function gameOver() {
  state = 2;
  if (score > best) {
    best = score;
    try { localStorage.setItem('arc_st_best', String(best)); } catch(e) {}
  }
  hud.style.display = 'none'; msg.textContent = '';
  scVal.textContent = String(score); bsVal.textContent = String(best);
  subBtn.textContent = '${lblSubmit}';
  renderLbList();
  panel.style.display = 'block';
}

function getRenderY(index) {
  const shift = Math.max(0, stack.length - 10) * blockH;
  return 420 - index * blockH + shift;
}

function placeBlock() {
  if (state === 0) { start(); return; }
  if (state !== 1) return;
  const top = stack[stack.length - 1];
  const diff = curr.x - top.x;

  if (Math.abs(diff) <= 4) {
    curr.x = top.x; msg.textContent = '${lblPerfect}'; msgTimer = 35;
  } else {
    const overlap = curr.w - Math.abs(diff);
    if (overlap <= 0) {
      debris.push({ x: curr.x, y: getRenderY(stack.length), w: curr.w, vy: 1, c: curr.c });
      gameOver(); return;
    }
    const cutW = Math.abs(diff);
    const cutX = diff > 0 ? curr.x + overlap : curr.x;
    debris.push({ x: cutX, y: getRenderY(stack.length), w: cutW, vy: 1, c: curr.c });
    if (diff > 0) curr.w = overlap;
    else { curr.x = top.x; curr.w = overlap; }
  }
  stack.push({ x: curr.x, w: curr.w, c: curr.c });
  score++; hud.textContent = String(score);
  const fromLeft = score % 2 === 0;
  curr = {
    x: fromLeft ? 0 : 320 - curr.w,
    w: curr.w,
    dir: fromLeft ? 1 : -1,
    spd: Math.min(6.2, 2.6 + score * 0.12),
    c: palette[(score + 1) % palette.length]
  };
}

document.addEventListener('pointerdown', (e) => {
  if (e.target !== btn && e.target !== subBtn) placeBlock();
});

btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); start(); });

subBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const s = Math.max(best, score);
  subBtn.textContent = '${lblSaved}';
  if (TW && typeof TW.openTelegramLink === 'function' && BOT) {
    TW.openTelegramLink('https://t.me/' + BOT + '?start=save_stack_' + s);
  }
});

function update() {
  if (msgTimer > 0 && --msgTimer === 0) msg.textContent = '';
  for (let i = debris.length - 1; i >= 0; i--) {
    debris[i].vy += 0.4; debris[i].y += debris[i].vy;
    if (debris[i].y > 500) debris.splice(i, 1);
  }
  if (state !== 1) return;
  curr.x += curr.spd * curr.dir;
  if (curr.x + curr.w >= 320) { curr.x = 320 - curr.w; curr.dir = -1; }
  else if (curr.x <= 0) { curr.x = 0; curr.dir = 1; }
}

function draw() {
  ctx.fillStyle = '#18181b'; ctx.fillRect(0, 0, 320, 480);
  ctx.fillStyle = '#27272a'; ctx.fillRect(0, getRenderY(0) + blockH, 320, 100);
  for (let i = 0; i < stack.length; i++) {
    const b = stack[i], y = getRenderY(i);
    if (y <= 480) { ctx.fillStyle = b.c; ctx.fillRect(b.x, y, b.w, blockH - 2); }
  }
  for (let i = 0; i < debris.length; i++) {
    const d = debris[i]; ctx.fillStyle = d.c; ctx.fillRect(d.x, d.y, d.w, blockH - 2);
  }
  if (state === 1) {
    ctx.fillStyle = curr.c; ctx.fillRect(curr.x, getRenderY(stack.length), curr.w, blockH - 2);
  }
  if (state === 0) {
    ctx.fillStyle = '#a855f7'; ctx.fillRect(60, 220, 200, 40);
    ctx.fillStyle = '#ffffff'; ctx.font = '800 16px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('${lblStart}', 160, 245);
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