import { t } from '../locales.js';

export function getPyramidHtml(lang = 'en', botUsername = '') {
  const lblScore = t('score', lang);
  const lblBest = t('best', lang);
  const lblPlay = t('playAgain', lang);
  const lblSubmit = t('submitScore', lang);
  const lblSaved = t('submitted', lang);
  const lblTop = t('topGlobal', lang);
  const lblNone = t('noRecord', lang);
  const lblNew = t('newDeal', lang);
  const lblEnd = t('finishGame', lang);
  const lblGuide = t('pyrGuide', lang);
  const lblNeed = t('pyrNeed', lang);

  return `<style>
body{margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;font-family:system-ui,sans-serif;background:#451a03}
#wrap{position:relative;width:320px;height:480px;margin:0 auto;overflow:hidden;background:#78350f}
canvas{display:block;width:320px;height:480px}
#topbar{position:absolute;top:0;left:0;width:320px;height:26px;background:#290f02;display:flex;align-items:center;justify-content:space-between;padding:0 10px;box-sizing:border-box;color:#fde68a;font-size:11px;font-weight:800;pointer-events:none}
#bbar{position:absolute;bottom:8px;left:10px;right:10px;display:flex;gap:8px}
.tbtn{flex:1;padding:8px 0;font-size:12px;font-weight:800;border:none;border-radius:8px;background:#b45309;color:#fffbeb;touch-action:none}
#panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:236px;background:#290f02;border:2px solid #f59e0b;border-radius:14px;padding:16px;text-align:center;display:none;color:#fff}
.row{display:flex;justify-content:space-around;margin-bottom:10px}
.stat{font-size:11px;font-weight:800;color:#fcd34d}
.val{font-size:22px;font-weight:900;color:#fff}
#lbBox{background:#451a03;border-radius:8px;padding:8px;margin-bottom:10px;text-align:left;font-size:12px;color:#fef3c7}
.lbr{display:flex;justify-content:space-between;padding:2px 0;font-weight:700}
.pbtn{width:100%;padding:10px 0;font-size:13px;font-weight:900;border:none;border-radius:8px;margin-top:6px;touch-action:none}
#subBtn{background:#f59e0b;color:#290f02}
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
const cw = 38, ch = 50;
let score = 0, best = 0, sel = null, hint = '${lblGuide}', lb = { r: 0, top: [] };
try { best = parseInt(localStorage.getItem('arc_pyr_best')) || 0; } catch(e) {}
let pyr = [], stock = [], waste = [];

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
  for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) d.push({ s, r, c: (s === 1 || s === 3) ? 1 : 0 });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
  pyr = [];
  for (let r = 0; r < 7; r++) {
    const row = [];
    for (let c = 0; c <= r; c++) row.push(d.pop());
    pyr.push(row);
  }
  stock = d; waste = [stock.pop()];
  score = 0; sel = null; hint = '${lblGuide}';
  hud.textContent = '${lblScore}: 0'; panel.style.display = 'none';
  draw();
}

function isFree(r, c) {
  if (!pyr[r] || !pyr[r][c]) return false;
  return r === 6 || (!pyr[r + 1][c] && !pyr[r + 1][c + 1]);
}

function cardPos(r, c) {
  const rw = (r + 1) * cw + r * 4;
  return { x: (320 - rw) / 2 + c * (cw + 4), y: 50 + r * 33 };
}

function getCard(ref) {
  if (!ref) return null;
  if (ref.t === 'w') return waste[waste.length - 1] || null;
  if (ref.t === 's') return stock[stock.length - 1] || null;
  return pyr[ref.r][ref.c] || null;
}

function drawCard(x, y, card, free, isSel, isMatch) {
  ctx.fillStyle = '#290f02'; ctx.fillRect(x + 1, y + 2, cw, ch);
  ctx.fillStyle = isSel ? '#fef08a' : (isMatch ? '#dcfce7' : (free ? '#fffbeb' : '#a8a29e'));
  ctx.fillRect(x, y, cw, ch);
  ctx.strokeStyle = isSel ? '#eab308' : (isMatch || (free && card.r === 13) ? '#22c55e' : (free ? '#d97706' : '#57534e'));
  ctx.lineWidth = (isSel || isMatch || (free && card.r === 13)) ? 2.5 : 1;
  ctx.strokeRect(x, y, cw, ch);

  ctx.fillStyle = card.c ? (free ? '#dc2626' : '#7f1d1d') : (free ? '#0f172a' : '#292524');
  ctx.font = '800 11px system-ui,sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(ranks[card.r], x + 3, y + 12);
  ctx.font = '10px system-ui,sans-serif'; ctx.fillText(suits[card.s], x + cw - 11, y + 12);
  ctx.font = '18px system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(suits[card.s], x + cw / 2, y + 29);

  ctx.font = '800 9px system-ui,sans-serif';
  ctx.fillStyle = card.r === 13 ? '#15803d' : '#78350f';
  const valTxt = card.r === 13 ? '13★' : (card.r > 10 || card.r === 1 ? '=' + card.r : '');
  ctx.fillText(valTxt, x + cw / 2, y + 44);
}

function draw() {
  ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, 320, 480);
  ctx.fillStyle = '#290f02'; ctx.fillRect(0, 26, 320, 20);
  ctx.fillStyle = '#fde68a'; ctx.font = '700 11px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(hint, 160, 40);

  const selCard = getCard(sel);
  const needRank = selCard ? (13 - selCard.r) : -1;

  for (let r = 0; r < 7; r++) {
    for (let c = 0; c <= r; c++) {
      const card = pyr[r][c];
      if (!card) continue;
      const pos = cardPos(r, c), free = isFree(r, c);
      const isSel = sel && sel.t === 'p' && sel.r === r && sel.c === c;
      const isMatch = free && card.r === needRank;
      drawCard(pos.x, pos.y, card, free, isSel, isMatch);
    }
  }

  const sy = 374;
  ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5;
  ctx.strokeRect(55, sy, cw, ch);
  ctx.fillStyle = '#fde68a'; ctx.font = '800 11px system-ui,sans-serif';
  ctx.fillText('NEXT (' + stock.length + ')', 74, sy + 30);

  if (stock.length) {
    const sc = stock[stock.length - 1];
    drawCard(135, sy, sc, true, sel && sel.t === 's', sc.r === needRank);
  } else {
    ctx.strokeRect(135, sy, cw, ch);
  }

  if (waste.length) {
    const wc = waste[waste.length - 1];
    drawCard(215, sy, wc, true, sel && sel.t === 'w', wc.r === needRank);
  } else {
    ctx.strokeRect(215, sy, cw, ch);
  }
}

function removeRef(ref) {
  if (ref.t === 'w') waste.pop();
  else if (ref.t === 's') stock.pop();
  else pyr[ref.r][ref.c] = null;
}

function checkWin() {
  for (let r = 0; r < 7; r++) for (let c = 0; c <= r; c++) if (pyr[r][c]) return;
  score += 500; showEnd();
}

function tapRef(ref) {
  const card = getCard(ref);
  if (!card) return;
  if (card.r === 13) {
    removeRef(ref); sel = null; score += 20;
    hint = 'King (13) cleared! +20';
    hud.textContent = '${lblScore}: ' + score;
    checkWin(); return;
  }
  if (!sel) {
    sel = ref;
    const need = 13 - card.r;
    hint = '${lblNeed}' + ranks[need] + ' (' + card.r + '+' + need + '=13)';
    return;
  }
  if (sel.t === ref.t && sel.r === ref.r && sel.c === ref.c) {
    sel = null; hint = '${lblGuide}'; return;
  }
  const prev = getCard(sel);
  if (prev && prev.r + card.r === 13) {
    removeRef(sel); removeRef(ref); sel = null; score += 25;
    hint = ranks[prev.r] + ' + ' + ranks[card.r] + ' = 13! +25';
    hud.textContent = '${lblScore}: ' + score;
    checkWin();
  } else {
    sel = ref;
    const need = 13 - card.r;
    hint = '${lblNeed}' + ranks[need] + ' (' + card.r + '+' + need + '=13)';
  }
}

cvs.addEventListener('pointerdown', (e) => {
  if (panel.style.display === 'block') return;
  const rect = cvs.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (320 / (rect.width || 320));
  const y = (e.clientY - rect.top) * (480 / (rect.height || 480));
  const sy = 374;

  if (y >= sy && y <= sy + ch) {
    if (x >= 55 && x <= 55 + cw) {
      sel = null;
      if (stock.length) waste.push(stock.pop());
      else while (waste.length) stock.push(waste.pop());
      hint = '${lblGuide}'; draw(); return;
    }
    if (x >= 135 && x <= 135 + cw && stock.length) {
      tapRef({ t: 's', r: -1, c: -1 }); draw(); return;
    }
    if (x >= 215 && x <= 215 + cw && waste.length) {
      tapRef({ t: 'w', r: -1, c: -1 }); draw(); return;
    }
  }

  for (let r = 6; r >= 0; r--) {
    for (let c = 0; c <= r; c++) {
      if (!pyr[r][c] || !isFree(r, c)) continue;
      const pos = cardPos(r, c);
      if (x >= pos.x && x <= pos.x + cw && y >= pos.y && y <= pos.y + ch) {
        tapRef({ t: 'p', r, c }); draw(); return;
      }
    }
  }
  sel = null; hint = '${lblGuide}'; draw();
});

function showEnd() {
  if (score > best) { best = score; try { localStorage.setItem('arc_pyr_best', String(best)); } catch(e) {} }
  scVal.textContent = String(score); bsVal.textContent = String(best);
  subBtn.textContent = '${lblSubmit}';
  lbBox.innerHTML = (lb.top && lb.top.length)
    ? lb.top.slice(0, 5).map((it, i) => '<div class="lbr"><span>#' + (i + 1) + ' ' + it.n + '</span><span>' + it.s + '</span></div>').join('')
    : '<div style="text-align:center;color:#fcd34d">${lblNone}</div>';
  panel.style.display = 'block';
}

document.getElementById('dealBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); initGame(); });
document.getElementById('endBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); showEnd(); });
btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); initGame(); });
subBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  subBtn.textContent = '${lblSaved}';
  if (TW && typeof TW.openTelegramLink === 'function' && BOT) {
    TW.openTelegramLink('https://t.me/' + BOT + '?start=save_pyramid_' + Math.max(best, score));
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