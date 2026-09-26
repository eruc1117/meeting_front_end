// 把 erucMoney Screen/src/index.css 的每條規則加上 .stock-app 前綴，讓它只作用在行事曆平台的股票分頁裡。
// :root / html[data-theme='dark'] / body → .stock-app；html[data-size] 與 html,body 的全頁規則丟掉。
const fs = require('fs');
const [, , src, dst] = process.argv;
let css = fs.readFileSync(src, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function splitTop(s) {
  // 回傳 [{sel, body}] 或字串（@rule 無 body）
  const out = []; let i = 0;
  while (i < s.length) {
    const open = s.indexOf('{', i);
    if (open < 0) break;
    const sel = s.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (j < s.length && depth) { if (s[j] === '{') depth++; else if (s[j] === '}') depth--; j++; }
    out.push({ sel, body: s.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}

function mapSelector(sel) {
  sel = sel.trim();
  if (!sel) return null;
  if (sel === ':root' || /^html\[data-theme=['"]dark['"]\]$/.test(sel)) return '.stock-app';
  if (/^html\[data-theme=['"]light['"]\]$/.test(sel)) return ".stock-app[data-theme='light']";
  if (sel === 'html' || /^html\[data-size/.test(sel)) return null;
  if (sel === 'body') return '.stock-app';
  if (/^\.app$/.test(sel)) return null;              // 舊的全頁殼層，這裡不用
  return `.stock-app ${sel}`;
}

function transform(s, indent = '') {
  let out = '';
  for (const { sel, body } of splitTop(s)) {
    if (/^@(media|supports)/.test(sel)) {
      const inner = transform(body, indent + '  ');
      if (inner.trim()) out += `${indent}${sel} {\n${inner}${indent}}\n`;
      continue;
    }
    if (/^@(keyframes|font-face|import|layer)/.test(sel)) { out += `${indent}${sel} {${body}}\n`; continue; }
    if (/^html\s*,\s*body$/.test(sel)) continue;             // 全頁高度／捲動的規則，這裡不用
  const sels = sel.split(/,(?![^(]*\))/).map(mapSelector).filter(Boolean);
    if (!sels.length) continue;
    let b = body;
    if (sels.includes('.stock-app') && sel === 'body') b = b.replace(/height:\s*100%;?/g, '').replace(/overflow:\s*hidden;?/g, '');
    out += `${indent}${sels.join(', ')} {${b}}\n`;
  }
  return out;
}

const header = `/* 由 erucMoney Screen/src/index.css 產生（scripts/prefix-stock-css.js）：每條規則加上 .stock-app 前綴。
   改樣式請改 erucMoney 那份再重跑腳本；只屬於行事曆平台的覆寫放在 stock-overrides.css。 */\n`;
fs.writeFileSync(dst, header + transform(css));
console.log('written', dst, fs.statSync(dst).size, 'bytes');
