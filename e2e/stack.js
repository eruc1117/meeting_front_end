/**
 * E2E 測試堆疊：起兩個「測試」後端（不碰正式的 :5000／:3001）。
 *
 *   行事曆測試後端  meeting_API_Server  server.js   → :5100，接 Schedule_test（.env.test），STOCK_API_URL → :3101
 *   股票測試後端    erucMoney/Server    app.js      → :3101，接 Stock_test（Server/.env.test）+ seed 3 檔，
 *                                                     FastAPI 是 tests/helpers/fastapi-mock.js 的假伺服器（隨機埠）
 *
 * 用法：
 *   const stack = require('./e2e/stack');  await stack.start();  …  await stack.stop();
 *   node e2e/stack.js            # 直接起著（Ctrl+C 結束），方便手動看畫面
 *
 * 環境變數：
 *   E2E_CAL_DIR    行事曆後端 repo（預設 ../meeting_API_Server）
 *   E2E_MONEY_DIR  erucMoney repo（預設 ../money）
 *   E2E_CAL_PORT / E2E_STOCK_PORT（預設 5100 / 3101）
 *   DB_PASSWORD / TEST_DB_PASSWORD：本機從兩個 repo 的 .env 讀；CI 直接給
 *
 * 兩邊的 JWT 密鑰必須相同（單一登入），所以股票後端的 JWT_SECRET 會被設成行事曆 .env.test 的 SECRET。
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

const ROOT = path.resolve(__dirname, '..');
const CAL = path.resolve(process.env.E2E_CAL_DIR || path.join(ROOT, '..', 'meeting_API_Server'));
const MONEY = path.resolve(process.env.E2E_MONEY_DIR || path.join(ROOT, '..', 'money'));
const CAL_PORT = Number(process.env.E2E_CAL_PORT || 5100);
const STOCK_PORT = Number(process.env.E2E_STOCK_PORT || 3101);

const children = [];
let started = false;

function parseEnv(file) {
  try { return dotenv.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function log(msg) { process.stdout.write(`[e2e-stack] ${msg}\n`); }

function run(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });   // 不用 shell：cmd.exe 會吃掉引號與 > 符號
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} 結束碼 ${code}`))));
    p.on('error', reject);
  });
}

function spawnServer(name, cmd, args, opts) {
  const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  p.stdout.on('data', (d) => process.env.E2E_STACK_QUIET ? null : process.stdout.write(`[${name}] ${d}`));
  p.stderr.on('data', (d) => process.stderr.write(`[${name}] ${d}`));
  p.on('exit', (code) => log(`${name} 結束（${code}）`));
  children.push({ name, p });
  return p;
}

async function waitFor(url, expectStatuses, timeoutMs = 60000) {
  const t0 = Date.now();
  let last = '';
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(url);
      if (expectStatuses.includes(r.status)) return;
      last = `HTTP ${r.status}`;
    } catch (e) { last = e.message; }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`等 ${url} 逾時（最後：${last}）`);
}

/** 行事曆測試後端的環境：.env（本機 DB 密碼）→ .env.test 覆蓋 → E2E 專用覆蓋 */
function calendarEnv() {
  const base = parseEnv(path.join(CAL, '.env'));
  const test = parseEnv(path.join(CAL, '.env.test'));
  const env = { ...process.env, ...base, ...test };
  if (process.env.TEST_DB_PASSWORD) env.DB_PASSWORD = process.env.TEST_DB_PASSWORD;
  Object.assign(env, {
    PORT: String(CAL_PORT),
    NODE_ENV: 'test',
    STOCK_API_URL: `http://127.0.0.1:${STOCK_PORT}`,
    STOCK_API_TIMEOUT_MS: '20000',
    STOCK_API_LONG_TIMEOUT_MS: '30000',
    ALLOWED_ORIGINS: [test.ALLOWED_ORIGINS, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean).join(','),
    // E2E 會頻繁註冊／登入，放寬限流（正式預設 5／分鐘、10／小時）
    LOGIN_RATE_LIMIT: '100000',
    REGISTER_RATE_LIMIT: '100000',
    GLOBAL_RATE_LIMIT: '100000',
  });
  return env;
}

async function start() {
  if (started) return;
  for (const [label, dir, marker] of [['行事曆後端', CAL, 'server.js'], ['erucMoney', MONEY, path.join('Server', 'app.js')]]) {
    if (!fs.existsSync(path.join(dir, marker))) throw new Error(`找不到${label}：${dir}（缺 ${marker}）；用 E2E_CAL_DIR / E2E_MONEY_DIR 指定`);
  }
  const cenv = calendarEnv();
  const calSecret = cenv.SECRET;
  if (!calSecret) throw new Error('行事曆 .env.test 沒有 SECRET');

  // 1. Schedule_test：建庫 + migration（meeting_API_Server 的 global-setup）
  log('Schedule_test：建庫與 migration…');
  await run(process.execPath, [path.join(__dirname, 'calendar-migrate.js')], { cwd: CAL, env: cenv });

  // 2. 股票測試後端（自己的子程序：bootstrap Stock_test、seed、假 FastAPI、listen）
  log(`股票測試後端 → :${STOCK_PORT}`);
  spawnServer('stock', process.execPath, [path.join(__dirname, 'stock-server.js')], {
    cwd: path.join(MONEY, 'Server'),
    env: { ...process.env, E2E_MONEY_DIR: MONEY, E2E_STOCK_PORT: String(STOCK_PORT), E2E_CAL_SECRET: calSecret },
  });
  await waitFor(`http://127.0.0.1:${STOCK_PORT}/health`, [200], 120000);

  // 3. 行事曆測試後端
  log(`行事曆測試後端 → :${CAL_PORT}`);
  spawnServer('calendar', process.execPath, ['server.js'], { cwd: CAL, env: cenv });
  await waitFor(`http://127.0.0.1:${CAL_PORT}/api/user/info`, [401], 60000);

  started = true;
  log('就緒');
}

async function stop() {
  for (const { name, p } of children.splice(0)) {
    try {
      if (process.platform === 'win32') spawn('taskkill', ['/pid', String(p.pid), '/T', '/F'], { stdio: 'ignore' });
      else p.kill('SIGTERM');
    } catch (e) { log(`關 ${name} 失敗：${e.message}`); }
  }
  started = false;
}

module.exports = { start, stop, CAL_PORT, STOCK_PORT, CAL, MONEY };

if (require.main === module) {
  start().then(() => {
    log(`按 Ctrl+C 結束。行事曆 http://localhost:${CAL_PORT}，股票 http://localhost:${STOCK_PORT}`);
    const bye = () => stop().then(() => process.exit(0));
    process.on('SIGINT', bye); process.on('SIGTERM', bye);
  }).catch((e) => { console.error(e); stop().then(() => process.exit(1)); });
}
