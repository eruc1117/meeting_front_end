/**
 * 股票 auth shim — 使用者 = 行事曆 user + 股票系統 /auth/me；角色以行事曆的 role 為準
 */
import { getToken, getUser, isAdmin, setStockUser, setSession, clearSession, onAuthChange } from './auth';

const realLocation = window.location;

beforeEach(() => {
  localStorage.clear();
  delete window.location;
  window.location = { assign: jest.fn(), pathname: '/stock/analysis/overview' };
});

afterAll(() => {
  window.location = realLocation;
});

test('沒登入 → getUser null、getToken null', () => {
  expect(getToken()).toBeNull();
  expect(getUser()).toBeNull();
  expect(isAdmin()).toBe(false);
});

test('只有行事曆 user：id 未解析、role 預設 user、resolved false', () => {
  localStorage.setItem('token', 'T');
  localStorage.setItem('user', JSON.stringify({ id: 208, username: 'eruc101010' }));
  expect(getToken()).toBe('T');
  expect(getUser()).toEqual({
    id: null, calendar_id: 208, username: 'eruc101010', display_name: 'eruc101010', role: 'user', resolved: false,
  });
});

test('行事曆 role=admin 時，不管股票系統怎麼說都是 admin', () => {
  localStorage.setItem('user', JSON.stringify({ id: 208, username: 'eruc', role: 'admin' }));
  localStorage.setItem('stock_user', JSON.stringify({ id: 9, username: 'eruc', role: 'user', display_name: 'E' }));
  const u = getUser();
  expect(u.role).toBe('admin');
  expect(u.id).toBe(9);
  expect(u.calendar_id).toBe(208);
  expect(u.display_name).toBe('E');
  expect(u.resolved).toBe(true);
  expect(isAdmin()).toBe(true);
});

test('行事曆沒說 admin 時用股票系統的 role', () => {
  localStorage.setItem('user', JSON.stringify({ id: 208, username: 'eruc', role: 'user' }));
  localStorage.setItem('stock_user', JSON.stringify({ id: 9, username: 'eruc', role: 'admin' }));
  expect(getUser().role).toBe('admin');
  localStorage.setItem('stock_user', JSON.stringify({ id: 9, username: 'eruc', role: 'user' }));
  expect(getUser().role).toBe('user');
});

test('setStockUser 存 stock_user 並通知 onAuthChange；setSession 相容', () => {
  localStorage.setItem('user', JSON.stringify({ id: 208, username: 'eruc' }));
  const seen = [];
  const off = onAuthChange((u) => seen.push(u));
  setStockUser({ id: 9, username: 'eruc', role: 'user', display_name: 'E' });
  expect(JSON.parse(localStorage.getItem('stock_user')).id).toBe(9);
  expect(seen).toHaveLength(1);
  expect(seen[0].resolved).toBe(true);
  setSession('ignored', { id: 10, username: 'eruc', role: 'admin' });
  expect(getUser().id).toBe(10);
  off();
  setStockUser(null);
  expect(seen).toHaveLength(2);           // 取消訂閱後不再通知
  expect(localStorage.getItem('stock_user')).toBeNull();
});

test('clearSession 清三個 key、通知 null、導向 /login', () => {
  localStorage.setItem('token', 'T');
  localStorage.setItem('user', '{}');
  localStorage.setItem('stock_user', '{}');
  const seen = [];
  const off = onAuthChange((u) => seen.push(u));
  clearSession();
  off();
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
  expect(localStorage.getItem('stock_user')).toBeNull();
  expect(seen).toEqual([null]);
  expect(window.location.assign).toHaveBeenCalledWith('/login');
});

test('已經在 /login 時 clearSession 不再導向', () => {
  window.location.pathname = '/login';
  clearSession();
  expect(window.location.assign).not.toHaveBeenCalled();
});

test('損毀的 JSON 視為沒有資料', () => {
  localStorage.setItem('user', '{bad');
  expect(getUser()).toBeNull();
});
