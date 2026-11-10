import { t } from '../locales.js';

// === AWAL PERUBAHAN: tgcloud/lib/games/solitaire.js ===
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
body{margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;font-family:system-ui,sans-serif;background:#090d16}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#090d16}
canvas{display:block;width:320px;height:480px}
#topbar{position:absolute;top:0;left:0;width:320px;height:26px;background:#111827;display:flex;align-items:center;justify-content:space-between;padding:0 10px;box-sizing:border-box;color:#10b981;font-size:11px;font-weight:800;pointer-events:none}
#bbar{position:absolute;bottom:8px;left:10px;right:10px;display:flex;gap:8px}
.tbtn{flex:1;padding:8px 0;font-size:11px;font-weight:800;border:1.5px solid #10b981;border-radius:8px;background:#111827;color:#10b981;touch-action:none}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#090d16;border:2px solid #10b981;border-radius:14px;padding:16px;text-align:center;display:none;color:#f8fafc}
.row{display:flex;justify-content:space-around;margin-bottom:10px}
.stat{font-size:10px;font-weight:800;color:#10b981}
.val{font-size:22px;font-weight:900;color:#f8fafc}
#lbBox{background:#111827;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#f8fafc}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:12px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none}
#subBtn{background:transparent;border:1.5px solid #10b981;color:#10b981}
#btn{background:#10b981;color:#090d16}
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
let score = 0, best = 0, hint = '${lblGuide}', sel = null, lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_sol_best')) || 0; } catch(e) {}

let stock = [], waste = [], found = [[],[],[],[]], tab = [[],[],[],[],[],[],[]];

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderLbList() {
  lbBox.innerHTML = (lb.top && lb.top.length)
    ? lb.top.slice(0, 5).map((it, i) => '<div class="lbr"><span>#' + (i + 1) + ' ' + esc(it.n) + '</span><span>' + it.s + '</span></div>').join('')
    : '<div style="text-align:center;color:#10b981">${lblNone}</div>';
}

function syncLb(raw) {
  if (!raw) return;
  try {
    const next = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (next && next.r >= lb.r) {
      lb = next;
      liveTop.textContent = (lb.top && lb.top[0]) ? '${lblTop} ' + lb.top[0].n + ' (' + lb.top[0].s + ')' : '${lblTop} --';
      renderLbList();
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
  score = 0; sel = null; hint = '${lblGuide}';
  hud.textContent = '${lblScore}: 0'; panel.style.display = 'none';
  draw();
}

function drawCard(x, y, card, isSel, badge) {
  if (!card.up) {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
    if (badge) {
      ctx.fillStyle = '#10b981'; ctx.font = '800 11px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(badge, x + cw / 2, y + 30);
    }
    return;
  }
  ctx.fillStyle = isSel ? '#d1fae5' : '#f8fafc';
  ctx.fillRect(x, y, cw, ch);
  ctx.strokeStyle = isSel ? '#10b981' : '#cbd5e1';
  ctx.lineWidth = isSel ? 2.5 : 1;
  ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
  ctx.fillStyle = card.c ? '#ef4444' : '#0f172a';
  ctx.font = '800 11px system-ui,sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(ranks[card.r], x + 4, y + 13);
  ctx.font = '10px system-ui,sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(suits[card.s], x + cw - 3, y + 13);
  ctx.font = '19px system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(suits[card.s], x + cw / 2, y + 36);
}

function drawSlot(x, y, txt) {
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
  ctx.fillStyle = '#334155'; ctx.font = '700 12px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(txt, x + cw / 2, y + 31);
}

function colX(c) { return 8 + c * 44; }
function stepY(p) { return p.length <= 7 ? 18 : Math.max(12, Math.floor(220 / p.length)); }

function draw() {
  ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, 320, 480);
  ctx.fillStyle = '#94a3b8'; ctx.font = '700 11px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(hint, 160, 40);

  if (stock.length) drawCard(colX(0), 50, { up: false }, false, String(stock.length));
  else drawSlot(colX(0), 50, '↻');

  if (waste.length) drawCard(colX(1), 50, waste[waste.length - 1], sel && sel.t === 'w');
  else drawSlot(colX(1), 50, '');

  for (let f = 0; f < 4; f++) {
    const fx = colX(f + 3);
    if (found[f].length) drawCard(fx, 50, found[f][found[f].length - 1], false);
    else drawSlot(fx, 50, suits[f]);
  }

  for (let c = 0; c < 7; c++) {
    const tx = colX(c), p = tab[c];
    if (!p.length) { drawSlot(tx, 114, 'K'); continue; }
    let cy = 114, st = stepY(p);
    for (let i = 0; i < p.length; i++) {
      drawCard(tx, cy, p[i], sel && sel.t === 'c' && sel.c === c && i >= sel.idx);
      cy += p[i].up ? st : 8;
    }
  }
}

function findFound(card) {
  for (let f = 0; f < 4; f++) {
    const fp = found[f];
    if (fp.length && fp[fp.length - 1].s === card.s && fp[fp.length - 1].r + 1 === card.r) return f;
  }
  if (card.r === 1) {
    if (!found[card.s].length) return card.s;
    for (let f = 0; f < 4; f++) if (!found[f].length) return f;
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

function addScore(pts, msg) {
  score += pts; hint = msg; sel = null;
  hud.textContent = '${lblScore}: ' + score;
  if (found[0].length + found[1].length + found[2].length + found[3].length === 52) {
    score += 500; showEnd();
  }
}

function autoMove(src) {
  if (src.t === 'w') {
    const card = waste[waste.length - 1];
    const fs = findFound(card);
    if (fs !== -1) { found[fs].push(waste.pop()); addScore(15, ranks[card.r] + suits[card.s] + ' → ' + suits[card.s]); return true; }
    for (let c = 0; c < 7; c++) {
      if (canTab(card, c)) { tab[c].push(waste.pop()); addScore(5, ranks[card.r] + suits[card.s] + ' → Col ' + (c + 1)); return true; }
    }
    return false;
  }
  const p = tab[src.c], card = p[src.idx];
  if (src.idx === p.length - 1) {
    const fs = findFound(card);
    if (fs !== -1) { found[fs].push(p.pop()); flipTop(src.c); addScore(15, ranks[card.r] + suits[card.s] + ' → ' + suits[card.s]); return true; }
  }
  for (let d = 1; d <= 6; d++) {
    const dest = (src.c + d) % 7;
    if (card.r === 13 && src.idx === 0 && !tab[dest].length) continue;
    if (canTab(card, dest)) {
      const mv = p.splice(src.idx);
      for (let m = 0; m < mv.length; m++) tab[dest].push(mv[m]);
      flipTop(src.c);
      addScore(5, ranks[card.r] + suits[card.s] + ' → Col ' + (dest + 1));
      return true;
    }
  }
  return false;
}

cvs.addEventListener('pointerdown', (e) => {
  if (panel.style.display === 'block') return;
  const rect = cvs.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (320 / (rect.width || 320));
  const y = (e.clientY - rect.top) * (480 / (rect.height || 480));

  if (y >= 46 && y <= 106) {
    if (x >= colX(0) && x <= colX(0) + cw) {
      sel = null;
      if (stock.length) { const c = stock.pop(); c.up = true; waste.push(c); hint = ranks[c.r] + suits[c.s]; }
      else { while (waste.length) { const c = waste.pop(); c.up = false; stock.push(c); } hint = '${lblGuide}'; }
      draw(); return;
    }
    if (x >= colX(1) && x <= colX(1) + cw && waste.length) {
      if (!autoMove({ t: 'w' })) {
        sel = (sel && sel.t === 'w') ? null : { t: 'w' };
        hint = sel ? ranks[waste[waste.length - 1].r] + suits[waste[waste.length - 1].s] : '${lblNoMove}';
      }
      draw(); return;
    }
    if (x >= colX(3) && x <= colX(6) + cw) {
      if (waste.length && findFound(waste[waste.length - 1]) !== -1) { autoMove({ t: 'w' }); draw(); return; }
      for (let c = 0; c < 7; c++) {
        const p = tab[c];
        if (p.length && p[p.length - 1].up && findFound(p[p.length - 1]) !== -1) {
          autoMove({ t: 'c', c, idx: p.length - 1 }); draw(); return;
        }
      }
      hint = '${lblNoMove}'; draw(); return;
    }
  }

  if (y >= 110 && y <= 435) {
    for (let c = 0; c < 7; c++) {
      const tx = colX(c);
      if (x >= tx - 3 && x <= tx + cw + 3) {
        const p = tab[c];
        if (sel) {
          const mc = sel.t === 'w' ? waste[waste.length - 1] : tab[sel.c][sel.idx];
          if (mc && (sel.t !== 'c' || sel.c !== c) && canTab(mc, c)) {
            if (sel.t === 'w') tab[c].push(waste.pop());
            else {
              const mv = tab[sel.c].splice(sel.idx);
              for (let m = 0; m < mv.length; m++) tab[c].push(mv[m]);
              flipTop(sel.c);
            }
            addScore(5, ranks[mc.r] + suits[mc.s] + ' → Col ' + (c + 1));
            draw(); return;
          }
        }
        if (!p.length) { sel = null; draw(); return; }
        let cy = 114, idx = p.length - 1, st = stepY(p);
        for (let i = 0; i < p.length; i++) {
          const ny = cy + (p[i].up ? st : 8);
          if (i < p.length - 1 && y >= cy && y < ny) { idx = i; break; }
          cy = ny;
        }
        if (!p[idx].up) {
          if (idx === p.length - 1) { p[idx].up = true; addScore(5, '${lblGuide}'); draw(); }
          return;
        }
        if (autoMove({ t: 'c', c, idx })) { draw(); return; }
        if (idx < p.length - 1 && autoMove({ t: 'c', c, idx: p.length - 1 })) { draw(); return; }
        sel = (sel && sel.t === 'c' && sel.c === c && sel.idx === idx) ? null : { t: 'c', c, idx };
        hint = sel ? ranks[p[idx].r] + suits[p[idx].s] : '${lblNoMove}';
        draw(); return;
      }
    }
  }
  sel = null; hint = '${lblGuide}'; draw();
});

function showEnd() {
  if (score > best) { best = score; try { localStorage.setItem('arc_sol_best', String(best)); } catch(e) {} }
  scVal.textContent = String(score); bsVal.textContent = String(best);
  subBtn.textContent = '${lblSubmit}';
  renderLbList();
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
// === BATAS PERUBAHAN: tgcloud/lib/games/solitaire.js ===