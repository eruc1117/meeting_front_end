import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * CSP 與部署形狀（不需要後端）：先 npm run build:e2e（或任何 REACT_APP_BASEURL 的 build）。
 * 1. index.html 的 connect-src 含建置時的 REACT_APP_BASEURL
 * 2. 沒有 frame-src（已不再 iframe 內嵌儀表板）
 * 3. 404.html 與 index.html 相同（GitHub Pages 的 SPA fallback；本機 build 沒有 404.html 時視為略過）
 * 4. public/CNAME = erucmoney.com
 */
const root = path.resolve(__dirname, '..');
const build = path.join(root, 'build');

test.describe('CSP 與部署形狀', () => {
  test.skip(!fs.existsSync(path.join(build, 'index.html')), '先 npm run build:e2e');

  const html = () => fs.readFileSync(path.join(build, 'index.html'), 'utf8');
  const csp = () => (html().match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/) || [])[1] || '';

  test('connect-src 含 REACT_APP_BASEURL，且沒有未替換的 %REACT_APP_% 佔位', () => {
    const c = csp();
    expect(c).toContain('connect-src');
    const baseurl = (process.env.REACT_APP_BASEURL || readEnv('REACT_APP_BASEURL') || '').replace(/\/+$/, '');
    if (baseurl) expect(c).toContain(baseurl);
    expect(c).not.toMatch(/%REACT_APP_/);
  });

  test('沒有 frame-src', () => {
    expect(csp()).not.toContain('frame-src');
  });

  test('404.html 與 index.html 相同（有的話）', () => {
    const p404 = path.join(build, '404.html');
    test.skip(!fs.existsSync(p404), '本機 build 沒有 404.html；CI 的 pages.yml 會複製');
    expect(fs.readFileSync(p404, 'utf8')).toBe(html());
  });

  test('public/CNAME 是 erucmoney.com', () => {
    expect(fs.readFileSync(path.join(root, 'public', 'CNAME'), 'utf8').trim()).toBe('erucmoney.com');
  });

  test('build 裡沒有把本機 .env 的祕密帶進去（只允許 REACT_APP_ 開頭的變數）', () => {
    const js = fs.readdirSync(path.join(build, 'static', 'js')).filter((f) => f.endsWith('.js'));
    for (const f of js) {
      const s = fs.readFileSync(path.join(build, 'static', 'js', f), 'utf8');
      expect(s).not.toMatch(/DB_PASSWORD|JWT_SECRET|SECRET=/);
    }
  });
});

function readEnv(key: string) {
  try {
    const m = fs.readFileSync(path.join(root, '.env'), 'utf8').match(new RegExp(`^${key}=(.*)$`, 'm'));
    return m ? m[1].trim() : '';
  } catch { return ''; }
}
