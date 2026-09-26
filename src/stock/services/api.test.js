/**
 * 股票 API shim — 走行事曆後端代理 /api/stock/*
 *
 * 位址、Bearer、{data} 拆回、錯誤訊息、404 notFound、401 清登入、逾時、health 取 upstream
 */
jest.mock('./auth', () => ({
  getToken: jest.fn(() => 'CAL_TOKEN'),
  clearSession: jest.fn(),
}));

const { getToken, clearSession } = require('./auth');

function load(baseurl = 'http://api.test/') {
  let api;
  jest.isolateModules(() => {
    process.env.REACT_APP_BASEURL = baseurl;
    api = require('./api');
  });
  return api;
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

beforeEach(() => {
  global.fetch = jest.fn();
  getToken.mockReturnValue('CAL_TOKEN');
  clearSession.mockClear();
});

afterEach(() => {
  delete global.fetch;
});

test('位址 = REACT_APP_BASEURL（去尾斜線）+ /api/stock，且帶 Bearer', async () => {
  const api = load('http://api.test/');
  global.fetch.mockResolvedValue(jsonResponse(200, { data: [] }));
  await api.getTrackedStocks();
  expect(api.getApiBase()).toBe('http://api.test/api/stock');
  const [url, init] = global.fetch.mock.calls[0];
  expect(url).toBe('http://api.test/api/stock/stocks?tracked=true');
  expect(init.headers.Authorization).toBe('Bearer CAL_TOKEN');
  expect(init.headers['Content-Type']).toBe('application/json');
});

test('沒 token 時不帶 Authorization', async () => {
  const api = load();
  getToken.mockReturnValue(null);
  global.fetch.mockResolvedValue(jsonResponse(200, { data: {} }));
  await api.getIndustries();
  expect(global.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
});

test('成功：代理的 {data} 拆回', async () => {
  const api = load();
  global.fetch.mockResolvedValue(jsonResponse(200, { data: [{ stock_id: '2330' }] }));
  const r = await api.getStockInfo('2330');
  expect(r).toEqual({ data: [{ stock_id: '2330' }], notFound: false, error: null });
});

test('成功但沒有 data 包裝時原樣回', async () => {
  const api = load();
  global.fetch.mockResolvedValue(jsonResponse(200, { ok: true }));
  const r = await api.getStockInfo('2330');
  expect(r.data).toEqual({ ok: true });
});

test('錯誤：message 變成 error 字串並附 HTTP 狀態', async () => {
  const api = load();
  global.fetch.mockResolvedValue(jsonResponse(403, { message: '需要 admin 權限', error: { code: 'E502_STOCK_UPSTREAM' } }));
  const r = await api.triggerCrawler('2330');
  expect(r.data).toBeNull();
  expect(r.notFound).toBe(false);
  expect(r.error).toBe('需要 admin 權限（HTTP 403）');
});

test('錯誤：沒有 message 時退回 upstream.detail，再退回 HTTP 碼', async () => {
  const api = load();
  global.fetch.mockResolvedValueOnce(jsonResponse(502, { upstream: { detail: '爬蟲服務未啟動' } }));
  expect((await api.getWeeklyForecastStatus()).error).toBe('爬蟲服務未啟動（HTTP 502）');
  global.fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => { throw new Error('no json'); } });
  expect((await api.getWeeklyForecastStatus()).error).toBe('HTTP 500');
});

test('404 → notFound 且 data.detail 保留（個股分析靠它分辨查無此股）', async () => {
  const api = load();
  global.fetch.mockResolvedValue(jsonResponse(404, { message: '股票 9999 資料不足' }));
  const r = await api.getStockInfo('9999');
  expect(r.notFound).toBe(true);
  expect(r.data).toEqual({ detail: '股票 9999 資料不足' });
  expect(r.error).toBe('股票 9999 資料不足（HTTP 404）');
});

test('401 → clearSession 並回登入過期', async () => {
  const api = load();
  global.fetch.mockResolvedValue(jsonResponse(401, { message: 'Token 無效或已過期' }));
  const r = await api.getHoldings();
  expect(clearSession).toHaveBeenCalledTimes(1);
  expect(r).toEqual({ data: null, notFound: false, error: '登入已過期，請重新登入' });
});

test('AbortError → 逾時訊息含秒數', async () => {
  const api = load();
  global.fetch.mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
  const r = await api.getMe();   // timeout 15000
  expect(r.data).toBeNull();
  expect(r.error).toMatch(/等待逾時（超過 15 秒）/);
});

test('POST 帶 JSON body 與方法', async () => {
  const api = load();
  global.fetch.mockResolvedValue(jsonResponse(200, { data: { id: 5 } }));
  await api.addTrade({ stock_id: '0050', side: 'Buy', shares: 10, price: 100 });
  const [url, init] = global.fetch.mock.calls[0];
  expect(url).toBe('http://api.test/api/stock/holdings/trades');
  expect(init.method).toBe('POST');
  expect(JSON.parse(init.body)).toEqual({ stock_id: '0050', side: 'Buy', shares: 10, price: 100 });
});

test('getHealth 取代理回應裡的 upstream；getStockHealth 原樣', async () => {
  const api = load();
  global.fetch.mockResolvedValue(jsonResponse(200, { data: { online: true, upstream: { ok: true, time: 't' } } }));
  expect((await api.getHealth()).data).toEqual({ ok: true, time: 't' });
  expect((await api.getStockHealth()).data).toEqual({ online: true, upstream: { ok: true, time: 't' } });
});

test('setApiBase 是無作用的（統一前端不可改位址）', () => {
  const api = load('http://api.test');
  api.setApiBase('http://other');
  expect(api.getApiBase()).toBe('http://api.test/api/stock');
  expect(api.defaultApiBase()).toBe('http://api.test/api/stock');
});
