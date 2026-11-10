// === AWAL FILE BARU: tgcloud/lib/games/calc.js ===
import { t } from '../locales.js';

// === AWAL PERUBAHAN: tgcloud/lib/games/calc.js ===
export function getCalcHtml(lang = 'en') {
  const lblHist = t('calcHist', lang);
  const lblEmpty = t('calcEmpty', lang);
  const lblCopied = t('calcCopied', lang);
  const lblCopy = t('calcCopy', lang);
  const lblClear = t('calcClearHist', lang);

  return `<style>
body{margin:0;padding:0;overflow:hidden;user-select:none;-webkit-user-select:none;font-family:system-ui,sans-serif;background:#090d16;color:#f8fafc}
#wrap{width:100%;max-width:340px;height:480px;margin:0 auto;padding:8px 10px max(8px,env(safe-area-inset-bottom));box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;background:#090d16}
#top{display:flex;justify-content:space-between;align-items:center;height:22px;font-size:10px;font-weight:800;color:#38bdf8}
.tact{display:flex;gap:5px}
.mbtn{background:#111827;color:#94a3b8;border:1px solid #1e293b;border-radius:5px;padding:2px 7px;font-size:10px;font-weight:800}
.mbtn.on{color:#10b981;border-color:#10b981}
#hbox{background:#0f172a;border:1px solid #1e293b;border-radius:8px;height:76px;padding:4px 8px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden}
.hrow{display:flex;justify-content:space-between;align-items:center;font-size:11px;line-height:1.35;color:#94a3b8;padding:1px 0;font-variant-numeric:tabular-nums}
.hrow b{color:#38bdf8;font-weight:800;margin-left:6px}
#hempty{text-align:center;color:#475569;font-size:11px;margin:auto 0;font-weight:700}
#disp{background:#111827;border:1.5px solid #1e293b;border-radius:10px;height:64px;padding:6px 10px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;text-align:right;overflow:hidden}
#expr{font-size:12px;color:#64748b;height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums}
#val{font-size:24px;font-weight:900;color:#f8fafc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums}
#grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;height:282px}
.k{border:none;border-radius:8px;font-size:13px;font-weight:800;background:#1e293b;color:#f8fafc;padding:0;font-variant-numeric:tabular-nums}
.k:active{background:#334155}
.fn{background:#111827;color:#38bdf8;font-size:11px;border:1px solid #1e293b}
.op{background:#0f172a;color:#10b981;border:1px solid #10b981;font-size:14px}
.eq{background:#10b981;color:#090d16;font-size:15px;font-weight:900}
.dg{background:#1e293b;color:#f8fafc;font-size:15px}
.ac{background:#31101c;color:#f43f5e;border:1px solid #f43f5e;font-size:12px}
</style>
<div id="wrap">
  <div id="top">
    <span>${lblHist}</span>
    <div class="tact">
      <button id="degBtn" class="mbtn on">DEG</button>
      <button id="shfBtn" class="mbtn">2nd</button>
      <button id="cpyBtn" class="mbtn">${lblCopy}</button>
      <button id="clrBtn" class="mbtn">${lblClear}</button>
    </div>
  </div>
  <div id="hbox"></div>
  <div id="disp">
    <div id="expr">Ans = 0</div>
    <div id="val">0</div>
  </div>
  <div id="grid">
    <button class="k fn" data-k="sin" id="f0">sin</button>
    <button class="k fn" data-k="cos" id="f1">cos</button>
    <button class="k fn" data-k="tan" id="f2">tan</button>
    <button class="k fn" data-k="log" id="f3">log</button>
    <button class="k fn" data-k="ln" id="f4">ln</button>
    <button class="k fn" data-k="√" id="f5">√</button>
    <button class="k fn" data-k="x²" id="f6">x²</button>
    <button class="k fn" data-k="xʸ" id="f7">xʸ</button>
    <button class="k fn" data-k="(">(</button>
    <button class="k fn" data-k=")">)</button>
    <button class="k dg" data-k="7">7</button>
    <button class="k dg" data-k="8">8</button>
    <button class="k dg" data-k="9">9</button>
    <button class="k ac" data-k="⌫">⌫</button>
    <button class="k ac" data-k="AC">AC</button>
    <button class="k dg" data-k="4">4</button>
    <button class="k dg" data-k="5">5</button>
    <button class="k dg" data-k="6">6</button>
    <button class="k op" data-k="×">×</button>
    <button class="k op" data-k="÷">÷</button>
    <button class="k dg" data-k="1">1</button>
    <button class="k dg" data-k="2">2</button>
    <button class="k dg" data-k="3">3</button>
    <button class="k op" data-k="+">+</button>
    <button class="k op" data-k="−">−</button>
    <button class="k dg" data-k="0">0</button>
    <button class="k dg" data-k=".">.</button>
    <button class="k fn" data-k="π" id="f8">π</button>
    <button class="k fn" data-k="Ans">Ans</button>
    <button class="k eq" data-k="=">=</button>
  </div>
</div>
<script>
const TW = window.TelegramWidget;
const LE = ${JSON.stringify(lblEmpty)}, LC = ${JSON.stringify(lblCopy)}, LD = ${JSON.stringify(lblCopied)};
const $ = (id) => document.getElementById(id);
const hbox = $('hbox'), exprEl = $('expr'), valEl = $('val');
const degBtn = $('degBtn'), shfBtn = $('shfBtn'), cpyBtn = $('cpyBtn'), clrBtn = $('clrBtn');

let raw = '', ans = 0, isDeg = true, is2nd = false, justEq = false;
let hist = [];
try {
  const sh = JSON.parse(localStorage.getItem('arc_calc_h'));
  if (Array.isArray(sh)) hist = sh.slice(0, 4);
  const sa = parseFloat(localStorage.getItem('arc_calc_a'));
  if (!isNaN(sa)) ans = sa;
} catch(e) {}

const m1 = ['sin','cos','tan','log','ln','√','x²','xʸ','π'];
const m2 = ['asin','acos','atan','10ˣ','eˣ','x!','1/x','%','e'];

function saveState() {
  try {
    localStorage.setItem('arc_calc_h', JSON.stringify(hist.slice(0, 4)));
    localStorage.setItem('arc_calc_a', String(ans));
  } catch(e) {}
}

function fmt(n) {
  if (!isFinite(n)) return 'Error';
  const c = Math.abs(n) < 1e-12 ? 0 : Number(n.toPrecision(10));
  return String(c);
}

function fact(n) {
  if (n < 0 || n > 170 || Math.floor(n) !== n) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function calcTokens(expr) {
  if (!expr) return 0;
  let s = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  const opn = (s.match(/\\(/g) || []).length;
  const cls = (s.match(/\\)/g) || []).length;
  if (opn > cls) s += ')'.repeat(opn - cls);

  const toks = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === ' ') { i++; continue; }
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      let num = '';
      while (i < s.length && ((s[i] >= '0' && s[i] <= '9') || s[i] === '.')) num += s[i++];
      toks.push({ t: 'n', v: parseFloat(num) });
      continue;
    }
    if (s.startsWith('Ans', i)) { toks.push({ t: 'n', v: ans }); i += 3; continue; }
    if (ch === 'π') { toks.push({ t: 'n', v: Math.PI }); i++; continue; }
    if (ch === 'e') { toks.push({ t: 'n', v: Math.E }); i++; continue; }
    let fnMatch = '';
    const fns = ['asin','acos','atan','sin','cos','tan','log','ln','√'];
    for (let f = 0; f < fns.length; f++) {
      if (s.startsWith(fns[f], i)) { fnMatch = fns[f]; break; }
    }
    if (fnMatch) { toks.push({ t: 'f', v: fnMatch }); i += fnMatch.length; continue; }
    if ('+-*/^()!%'.indexOf(ch) !== -1) { toks.push({ t: 'o', v: ch }); i++; continue; }
    return NaN;
  }

  const fixed = [];
  for (let j = 0; j < toks.length; j++) {
    const cur = toks[j], prev = fixed[fixed.length - 1];
    if (prev && (prev.t === 'n' || prev.v === ')' || prev.v === '!' || prev.v === '%') &&
        (cur.t === 'n' || cur.t === 'f' || cur.v === '(')) {
      fixed.push({ t: 'o', v: '*' });
    }
    if ((cur.v === '-' || cur.v === '+') && (!prev || (prev.t === 'o' && prev.v !== ')' && prev.v !== '!' && prev.v !== '%'))) {
      if (cur.v === '-') {
        fixed.push({ t: 'n', v: 0 });
        fixed.push({ t: 'o', v: '-' });
      }
      continue;
    }
    fixed.push(cur);
  }

  const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3, '!': 4, '%': 4 };
  const out = [], ops = [];
  for (let j = 0; j < fixed.length; j++) {
    const tk = fixed[j];
    if (tk.t === 'n') out.push(tk);
    else if (tk.t === 'f') ops.push(tk);
    else if (tk.v === '(') ops.push(tk);
    else if (tk.v === ')') {
      while (ops.length && ops[ops.length - 1].v !== '(') out.push(ops.pop());
      if (ops.length && ops[ops.length - 1].v === '(') ops.pop();
      if (ops.length && ops[ops.length - 1].t === 'f') out.push(ops.pop());
    } else if (tk.t === 'o') {
      if (tk.v === '!' || tk.v === '%') { out.push(tk); continue; }
      while (ops.length) {
        const top = ops[ops.length - 1];
        if (top.t === 'o' && top.v !== '(' && (prec[top.v] > prec[tk.v] || (prec[top.v] === prec[tk.v] && tk.v !== '^'))) {
          out.push(ops.pop());
        } else break;
      }
      ops.push(tk);
    }
  }
  while (ops.length) out.push(ops.pop());

  const st = [];
  const k = isDeg ? Math.PI / 180 : 1;
  const ik = isDeg ? 180 / Math.PI : 1;
  for (let j = 0; j < out.length; j++) {
    const tk = out[j];
    if (tk.t === 'n') st.push(tk.v);
    else if (tk.t === 'f') {
      const a = st.pop();
      if (a === undefined) return NaN;
      if (tk.v === 'sin') st.push(Math.sin(a * k));
      else if (tk.v === 'cos') st.push(Math.cos(a * k));
      else if (tk.v === 'tan') st.push(Math.tan(a * k));
      else if (tk.v === 'asin') st.push(Math.asin(a) * ik);
      else if (tk.v === 'acos') st.push(Math.acos(a) * ik);
      else if (tk.v === 'atan') st.push(Math.atan(a) * ik);
      else if (tk.v === 'log') st.push(Math.log10(a));
      else if (tk.v === 'ln') st.push(Math.log(a));
      else if (tk.v === '√') st.push(Math.sqrt(a));
    } else if (tk.t === 'o') {
      if (tk.v === '!') { st.push(fact(st.pop())); continue; }
      if (tk.v === '%') { st.push(st.pop() * 0.01); continue; }
      const b = st.pop(), a = st.pop();
      if (a === undefined || b === undefined) return NaN;
      if (tk.v === '+') st.push(a + b);
      else if (tk.v === '-') st.push(a - b);
      else if (tk.v === '*') st.push(a * b);
      else if (tk.v === '/') st.push(b === 0 ? NaN : a / b);
      else if (tk.v === '^') st.push(Math.pow(a, b));
    }
  }
  return st.length === 1 ? st[0] : NaN;
}

function renderHist() {
  hbox.innerHTML = '';
  if (!hist.length) {
    const d = document.createElement('div');
    d.id = 'hempty';
    d.textContent = LE;
    hbox.appendChild(d);
    return;
  }
  for (let i = 0; i < hist.length; i++) {
    const item = hist[i];
    const row = document.createElement('div');
    row.className = 'hrow';
    const sp1 = document.createElement('span');
    sp1.textContent = item.q + ' =';
    const sp2 = document.createElement('b');
    sp2.textContent = item.a;
    row.appendChild(sp1);
    row.appendChild(sp2);
    row.addEventListener('click', () => {
      if (justEq) { raw = item.a; justEq = false; }
      else raw += item.a;
      updateScreen();
    });
    hbox.appendChild(row);
  }
}

function updateScreen() {
  valEl.textContent = raw || '0';
  if (!raw) {
    exprEl.textContent = 'Ans = ' + fmt(ans);
    return;
  }
  if (!justEq) {
    const p = calcTokens(raw);
    if (isFinite(p)) {
      exprEl.textContent = '= ' + fmt(p);
    } else {
      exprEl.textContent = 'Ans = ' + fmt(ans);
    }
  }
}

function press(k) {
  if (!k) return;
  if (k === 'AC') {
    raw = ''; justEq = false;
    exprEl.textContent = 'Ans = ' + fmt(ans);
    valEl.textContent = '0';
    return;
  }
  if (k === '⌫') {
    if (justEq) { raw = ''; justEq = false; }
    else raw = raw.slice(0, -1);
    updateScreen();
    return;
  }
  if (k === '=') {
    if (!raw) return;
    const res = calcTokens(raw);
    const str = fmt(res);
    exprEl.textContent = raw + ' =';
    valEl.textContent = str;
    if (str !== 'Error') {
      ans = Number(str);
      hist.unshift({ q: raw, a: str });
      if (hist.length > 4) hist.pop();
      saveState();
      renderHist();
      raw = /e/.test(str) ? '' : str;
    } else {
      raw = '';
    }
    justEq = true;
    return;
  }

  const isOp = ['+','−','×','÷','x²','xʸ','x!','%','1/x'].indexOf(k) !== -1;
  if (justEq) {
    if (!isOp) raw = '';
    justEq = false;
  }

  if (['sin','cos','tan','asin','acos','atan','log','ln','√'].indexOf(k) !== -1) raw += k + '(';
  else if (k === 'x²') raw += '^2';
  else if (k === 'xʸ') raw += '^';
  else if (k === '10ˣ') raw += '10^(';
  else if (k === 'eˣ') raw += 'e^(';
  else if (k === '1/x') raw = raw ? '1/(' + raw + ')' : '1/(';
  else if (k === 'x!') raw += '!';
  else raw += k;

  updateScreen();
}

document.querySelectorAll('.k').forEach((b) => {
  b.addEventListener('click', () => press(b.dataset.k));
});

degBtn.addEventListener('click', () => {
  isDeg = !isDeg;
  degBtn.textContent = isDeg ? 'DEG' : 'RAD';
  updateScreen();
});

shfBtn.addEventListener('click', () => {
  is2nd = !is2nd;
  shfBtn.className = is2nd ? 'mbtn on' : 'mbtn';
  const arr = is2nd ? m2 : m1;
  for (let i = 0; i < 9; i++) {
    const el = $('f' + i);
    el.textContent = arr[i];
    el.dataset.k = arr[i];
  }
});

clrBtn.addEventListener('click', () => {
  hist = [];
  saveState();
  renderHist();
});

cpyBtn.addEventListener('click', () => {
  const txt = String(valEl.textContent || '0').slice(0, 256);
  if (TW && typeof TW.copyText === 'function') {
    TW.copyText(txt);
    cpyBtn.textContent = LD;
    setTimeout(() => { cpyBtn.textContent = LC; }, 1200);
  }
});

renderHist();
updateScreen();
if (TW && TW.ready) TW.ready();
</script>`;
}
// === BATAS PERUBAHAN: tgcloud/lib/games/calc.js ===