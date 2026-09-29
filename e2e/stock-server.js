/**
 * 股票測試後端（由 stack.js 以子程序啟動；不要直接拿來跑正式服務）。
 *
 * 1. 載入 erucMoney Server/tests/setup-env.js：根目錄 .env（DB 密碼）+ Server/.env.test 覆蓋，並拒絕非 *_test 資料庫
 * 2. JWT_SECRET 換成行事曆的測試 SECRET（單一登入要同一把）、關掉限流
 * 3. 起假 FastAPI（tests/helpers/fastapi-mock.js）並補上管理頁與冒煙頁會打的端點
 * 4. bootstrap Stock_test（基底表 + 18 個 migration + app.init()）、清使用者資料、seed 3 檔行情
 * 5. app.listen(E2E_STOCK_PORT)
 */
const path = require('path');

const MONEY = process.env.E2E_MONEY_DIR || path.resolve(__dirname, '..', '..', 'money');
const SERVER = path.join(MONEY, 'Server');
const PORT = Number(process.env.E2E_STOCK_PORT || 3101);

require(path.join(SERVER, 'tests', 'setup-env.js'));
if (process.env.TEST_DB_PASSWORD) process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD;
process.env.JWT_SECRET = process.env.E2E_CAL_SECRET || process.env.JWT_SECRET;
process.env.RATE_LIMIT_PER_MIN = '0';
process.env.ALLOWED_ORIGINS = '';          // 只有行事曆後端會打它（server to server），CORS 無關
process.env.AUTH_API_URL = '';

const { startFakeFastAPI } = require(path.join(SERVER, 'tests', 'helpers', 'fastapi-mock.js'));
const { db, bootstrap, resetUserData, resetMarket } = require(path.join(SERVER, 'tests', 'helpers', 'db.js'));
const { seedMarket } = require(path.join(SERVER, 'tests', 'helpers', 'seed.js'));

const today = new Date();
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

(async () => {
  const fake = await startFakeFastAPI();
  // 管理頁與冒煙頁會打的端點：回固定、可讀的資料
  fake.respond('GET /data/freshness', () => ({ status: 200, body: {
    available: true, market_last: iso(yesterday), market_gap_days: 1, market_stale: false,
    items: [
      { stock_id: '0050', last_date: iso(yesterday), rows: 30, days_behind: 0, stale: false },
      { stock_id: '2330', last_date: iso(yesterday), rows: 30, days_behind: 0, stale: false },
      { stock_id: '2303', last_date: iso(yesterday), rows: 29, days_behind: 1, stale: true },
    ],
  } }));
  fake.respond('GET /data/freshness/exogenous', () => ({ status: 200, body: {
    available: true,
    items: [
      { key: 'us', label: '美股行情', table: 'us_daily_prices', last_date: iso(yesterday), days_behind: 1, stale: false, note: '跳空模型用' },
      { key: 'futures', label: '台指期', table: 'futures_daily', last_date: iso(yesterday), days_behind: 1, stale: false, note: '夜盤' },
      { key: 'index', label: '韓日指數', table: 'index_daily_prices', last_date: iso(yesterday), days_behind: 3, stale: true, note: '振幅模型用' },
    ],
    problems: ['韓日指數落後 3 天'],
  } }));
  fake.respond('GET /forecast/weekly/status', () => ({ status: 200, body: { running: false, started_at: null, last_error: null, next_run: '2030-01-06T08:00' } }));
  fake.respond('GET /forecast/weekly', () => ({ status: 200, body: { available: false, reason: 'E2E 假 FastAPI：沒有週預測' } }));
  fake.respond('GET /voting/status', () => ({ status: 200, body: { status: 'idle', last_count: 0 } }));
  fake.respond('POST /voting/run', () => ({ status: 200, body: { status: 'started' } }));
  fake.respond('GET /catalog', () => ({ status: 200, body: { models: [] } }));
  fake.respond('GET /models', () => ({ status: 200, body: [] }));
  fake.respond('GET /gap/predict', () => ({ status: 503, body: { detail: 'E2E 假 FastAPI：沒有模型' } }));
  fake.respond('GET /cash/plan', () => ({ status: 503, body: { detail: 'E2E 假 FastAPI：沒有模型' } }));
  fake.respond('GET /model/predict', () => ({ status: 503, body: { detail: 'E2E 假 FastAPI：沒有模型' } }));

  await bootstrap();
  await resetUserData();
  await resetMarket();
  await seedMarket(db);

  const { app } = require(path.join(SERVER, 'app.js'));
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[stock-test] 股票測試後端 http://127.0.0.1:${PORT}（Stock_test，假 FastAPI :${fake.port}）`);
  });
})().catch((e) => { console.error('[stock-test] 啟動失敗：', e); process.exit(1); });
