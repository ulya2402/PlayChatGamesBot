import { t } from '../locales.js';

export function getSolitaireHtml(lang = 'en', botUsername = '') {
  const lblScore = t('score', lang);
  const lblBest = t('best', lang);
  const lblPlay = t('playAgain', lang);
  const lblSubmit = t('submitScore', lang);
  const lblSaved = t('submitted', lang);
  const lblTop = t('topGlobal', lang);
  const lblNone = t('noRecord', lang);
  const lblNew = t('newDeal', lang);
  const lblEnd = t('finishGame', lang);
  const lblGuide = t('solGuide', lang);
  const lblNoMove = t('noMove', lang);

  return `<style>
body{margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;font-family:system-ui,sans-serif;background:#064e3b}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#065f46}
canvas{display:block;width:320px;height:480px}
#topbar{position:absolute;top:0;left:0;width:320px;height:26px;background:#042f2e;display:flex;align-items:center;justify-content:space-between;padding:0 10px;box-sizing:border-box;color:#a7f3d0;font-size:11px;font-weight:800;pointer-events:none}
#bbar{position:absolute;bottom:8px;left:10px;right:10px;display:flex;gap:8px}
.tbtn{flex:1;padding:8px 0;font-size:12px;font-weight:800;border:none;border-radius:8px;background:#047857;color:#ecfdf5;touch-action:none}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#042f2e;border:2px solid #10b981;border-radius:14px;padding:16px;text-align:center;display:none;color:#fff}
.row{display:flex;justify-content:space-around;margin-bottom:10px}
.stat{font-size:11px;font-weight:800;color:#6ee7b7}
.val{font-size:22px;font-weight:900;color:#fff}
#lbBox{background:#064e3b;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#d1fae5}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:13px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none}
#subBtn{background:#f59e0b;color:#042f2e}
#btn{background:#10b981;color:#042f2e}
</style>
<div id="wrap">
  <div id="topbar"><span id="liveTop">${lblTop} --</span><span id="hud">${lblScore}: 0</span></div>
  <canvas id="cvs" width="320" height="480"></canvas>
  <div id="bbar"><button id="dealBtn" class="tbtn">${lblNew}</button><button id="endBtn" class="tbtn">${lblEnd}</button></div>
  <div id="panel">
    <div class="row"><div><div class="stat">${lblScore}</div><div id="scVal" class="val">0</div></div><div><div class="stat">${lblBest}</div><div id="bsVal" class="val">0</div></div></div>
    <div id="lbBox"></div>
    <button id="subBtn" class="pbtn">${lblSubmit}</button>
    <button id="btn" class="pbtn">${lblPlay}</button>
  </div>
</div>
<script>
const TW = window.TelegramWidget, BOT = '${botUsername}';
const cvs = document.getElementById('cvs'), ctx = cvs.getContext('2d');
const hud = document.getElementById('hud'), liveTop = document.getElementById('liveTop');
const panel = document.getElementById('panel'), scVal = document.getElementById('scVal'), bsVal = document.getElementById('bsVal');
const lbBox = document.getElementById('lbBox'), subBtn = document.getElementById('subBtn'), btn = document.getElementById('btn');
const suits = ['♠','♥','♣','♦'], ranks = ['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const cw = 38, ch = 52;
let score = 0, best = 0, hint = '${lblGuide}', lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_sol_best')) || 0; } catch(e) {}
let stock = [], waste = [], found = [[],[],[],[]], tab = [[],[],[],[],[],[],[]];

function syncLb(raw) {
  if (!raw) return;
  try {
    const next = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (next && next.r >= lb.r) {
      lb = next;
      liveTop.textContent = (lb.top && lb.top[0]) ? '${lblTop} ' + lb.top[0].n + ' (' + lb.top[0].s + ')' : '${lblTop} --';
    }
  } catch(e) {}
}

function initGame() {
  const d = [];
  for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) d.push({ s, r, c: (s === 1 || s === 3) ? 1 : 0, up: false });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
  stock = []; waste = []; found = [[],[],[],[]]; tab = [[],[],[],[],[],[],[]];
  for (let c = 0; c < 7; c++) for (let r = 0; r <= c; r++) { const card = d.pop(); card.up = (r === c); tab[c].push(card); }
  while (d.length) stock.push(d.pop());
  score = 0; hint = '${lblGuide}';
  hud.textContent = '${lblScore}: 0'; panel.style.display = 'none';
  draw();
}

function drawCard(x, y, card) {
  ctx.fillStyle = '#022c22'; ctx.fillRect(x + 1, y + 2, cw, ch);
  if (!card.up) {
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, cw, ch);
    ctx.fillStyle = '#1d4ed8'; ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
    ctx.strokeStyle = '#93c5fd'; ctx.strokeRect(x + 5, y + 5, cw - 10, ch - 10);
    return;
  }
  ctx.fillStyle = '#fffbeb'; ctx.fillRect(x, y, cw, ch);
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.strokeRect(x, y, cw, ch);
  ctx.fillStyle = card.c ? '#dc2626' : '#0f172a';
  ctx.font = '800 11px system-ui,sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(ranks[card.r], x + 3, y + 12);
  ctx.font = '10px system-ui,sans-serif'; ctx.fillText(suits[card.s], x + cw - 11, y + 12);
  ctx.font = '20px system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(suits[card.s], x + cw / 2, y + 34);
  ctx.font = '700 9px system-ui,sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(ranks[card.r], x + cw - 3, y + ch - 4);
}

function drawSlot(x, y, txt) {
  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, cw, ch);
  ctx.fillStyle = '#6ee7b7'; ctx.font = '700 13px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(txt, x + cw / 2, y + 31);
}

function colX(c) { return 8 + c * 44; }

function draw() {
  ctx.fillStyle = '#065f46'; ctx.fillRect(0, 0, 320, 480);
  ctx.fillStyle = '#042f2e'; ctx.fillRect(0, 26, 320, 20);
  ctx.fillStyle = '#fde68a'; ctx.font = '700 11px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(hint, 160, 40);

  if (stock.length) drawCard(colX(0), 52, { up: false });
  else drawSlot(colX(0), 52, '↻');

  if (waste.length) drawCard(colX(1), 52, waste[waste.length - 1]);
  else drawSlot(colX(1), 52, '');

  for (let f = 0; f < 4; f++) {
    const fx = colX(f + 3);
    if (found[f].length) drawCard(fx, 52, found[f][found[f].length - 1]);
    else drawSlot(fx, 52, suits[f]);
  }

  for (let c = 0; c < 7; c++) {
    const tx = colX(c), p = tab[c];
    if (!p.length) { drawSlot(tx, 114, 'K'); continue; }
    let cy = 114;
    for (let i = 0; i < p.length; i++) {
      drawCard(tx, cy, p[i]);
      cy += p[i].up ? 19 : 9;
    }
  }
}

function findFoundSlot(card) {
  for (let f = 0; f < 4; f++) {
    const fp = found[f];
    if (!fp.length && card.r === 1 && f === card.s) return f;
    if (fp.length && fp[fp.length - 1].s === card.s && fp[fp.length - 1].r + 1 === card.r) return f;
  }
  for (let f = 0; f < 4; f++) {
    if (!found[f].length && card.r === 1) return f;
  }
  return -1;
}

function canTab(card, c) {
  const p = tab[c];
  if (!p.length) return card.r === 13;
  const top = p[p.length - 1];
  return top.up && top.c !== card.c && top.r === card.r + 1;
}

function flipTop(c) {
  const p = tab[c];
  if (p.length && !p[p.length - 1].up) { p[p.length - 1].up = true; score += 5; }
}

function updateScore(pts, msg) {
  score += pts; hint = msg;
  hud.textContent = '${lblScore}: ' + score;
  if (found[0].length + found[1].length + found[2].length + found[3].length === 52) {
    score += 500; showEnd();
  }
}

cvs.addEventListener('pointerdown', (e) => {
  if (panel.style.display === 'block') return;
  const rect = cvs.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (320 / (rect.width || 320));
  const y = (e.clientY - rect.top) * (480 / (rect.height || 480));

  if (y >= 48 && y <= 108) {
    if (x >= colX(0) && x <= colX(0) + cw) {
      if (stock.length) {
        const c = stock.pop(); c.up = true; waste.push(c);
        hint = ranks[c.r] + suits[c.s];
      } else {
        while (waste.length) { const c = waste.pop(); c.up = false; stock.push(c); }
        hint = '${lblGuide}';
      }
      draw(); return;
    }
    if (x >= colX(1) && x <= colX(1) + cw && waste.length) {
      const card = waste[waste.length - 1];
      const fs = findFoundSlot(card);
      if (fs !== -1) {
        found[fs].push(waste.pop());
        updateScore(15, ranks[card.r] + suits[card.s] + ' → Foundation!');
        draw(); return;
      }
      for (let c = 0; c < 7; c++) {
        if (canTab(card, c)) {
          tab[c].push(waste.pop());
          updateScore(5, ranks[card.r] + suits[card.s] + ' → Col ' + (c + 1));
          draw(); return;
        }
      }
      hint = '${lblNoMove}'; draw(); return;
    }
  }

  if (y >= 112 && y <= 435) {
    for (let c = 0; c < 7; c++) {
      const tx = colX(c);
      if (x >= tx - 2 && x <= tx + cw + 2) {
        const p = tab[c];
        if (!p.length) return;
        let cy = 114, idx = p.length - 1;
        for (let i = 0; i < p.length; i++) {
          const ny = cy + (p[i].up ? 19 : 9);
          if (i < p.length - 1 && y >= cy && y < ny) { idx = i; break; }
          cy = ny;
        }
        if (!p[idx].up) {
          if (idx === p.length - 1) { p[idx].up = true; updateScore(5, '${lblGuide}'); draw(); }
          return;
        }
        const card = p[idx];
        if (idx === p.length - 1) {
          const fs = findFoundSlot(card);
          if (fs !== -1) {
            found[fs].push(p.pop()); flipTop(c);
            updateScore(15, ranks[card.r] + suits[card.s] + ' → Foundation!');
            draw(); return;
          }
        }
        for (let d = 1; d <= 6; d++) {
          const dest = (c + d) % 7;
          if (canTab(card, dest)) {
            const moved = p.splice(idx);
            for (let m = 0; m < moved.length; m++) tab[dest].push(moved[m]);
            flipTop(c);
            updateScore(5, ranks[card.r] + suits[card.s] + ' → Col ' + (dest + 1));
            draw(); return;
          }
        }
        hint = '${lblNoMove}'; draw(); return;
      }
    }
  }
});

function showEnd() {
  if (score > best) { best = score; try { localStorage.setItem('arc_sol_best', String(best)); } catch(e) {} }
  scVal.textContent = String(score); bsVal.textContent = String(best);
  subBtn.textContent = '${lblSubmit}';
  lbBox.innerHTML = (lb.top && lb.top.length)
    ? lb.top.slice(0, 5).map((it, i) => '<div class="lbr"><span>#' + (i + 1) + ' ' + it.n + '</span><span>' + it.s + '</span></div>').join('')
    : '<div style="text-align:center;color:#6ee7b7">${lblNone}</div>';
  panel.style.display = 'block';
}

document.getElementById('dealBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); initGame(); });
document.getElementById('endBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); showEnd(); });
btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); initGame(); });
subBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  subBtn.textContent = '${lblSaved}';
  if (TW && typeof TW.openTelegramLink === 'function' && BOT) {
    TW.openTelegramLink('https://t.me/' + BOT + '?start=save_solitaire_' + Math.max(best, score));
  }
});

if (TW) {
  syncLb(TW.publicData);
  if (typeof TW.watchPublicData === 'function') TW.watchPublicData();
  if (typeof TW.onEvent === 'function') TW.onEvent('publicDataChanged', () => syncLb(TW.publicData));
}
initGame();
</script>`;
}