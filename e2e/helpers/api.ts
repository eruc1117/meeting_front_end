/**
 * 直接打行事曆測試後端的 helper（不經 UI）：建帳號、登入拿 token、清理。
 * E2E_API 預設 http://localhost:5100（接 Schedule_test）；它的 /api/stock 代理到股票測試後端。
 */
export const API = (process.env.E2E_API || 'http://localhost:5100').replace(/\/+$/, '');

export interface TestUser { account: string; username: string; email: string; password: string; id?: number; token?: string; role?: string }

const stamp = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** 產生一組不會撞名的測試帳號（密碼符合後端強度：8 字元含大小寫與數字） */
export function makeUser(prefix = 'e2e'): TestUser {
  const s = stamp();
  return { account: `${prefix}_${s}`, username: `${prefix}_${s}`, email: `${prefix}_${s}@example.test`, password: 'Passw0rdE2E' };
}

async function call(path: string, init: RequestInit = {}, token?: string) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

export async function register(u: TestUser): Promise<TestUser> {
  const { status, body } = await call('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: u.email, username: u.username, account: u.account, password: u.password, passwordChk: u.password }),
  });
  if (status !== 200) throw new Error(`register ${u.account} failed: ${status} ${JSON.stringify(body)}`);
  return { ...u, id: body.data.user.id, token: body.data.token, role: body.data.user.role };
}

export async function login(u: TestUser): Promise<TestUser> {
  const { status, body } = await call('/api/auth/login', { method: 'POST', body: JSON.stringify({ account: u.account, password: u.password }) });
  if (status !== 200) throw new Error(`login ${u.account} failed: ${status} ${JSON.stringify(body)}`);
  return { ...u, id: body.data.user.id, token: body.data.token, role: body.data.user.role };
}

/** admin 才能呼叫：改角色／停用、刪除 */
export const setRole = (admin: TestUser, id: number, role: 'user' | 'admin') =>
  call(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify({ role }) }, admin.token);
export const setActive = (admin: TestUser, id: number, is_active: boolean) =>
  call(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify({ is_active }) }, admin.token);
export const deleteUser = (admin: TestUser, id: number) =>
  call(`/api/admin/users/${id}`, { method: 'DELETE' }, admin.token);

/** 股票代理 */
export const stock = (path: string, token: string, init: RequestInit = {}) => call(`/api/stock${path}`, init, token);

/**
 * 測試用 admin：帳號在行事曆測試後端 .env.test 的 ADMIN_ACCOUNTS 裡（預設 t_admin），
 * 第一次註冊就是 admin；已存在就直接登入。
 */
export async function adminUser(): Promise<TestUser> {
  const u: TestUser = { account: process.env.E2E_ADMIN_ACCOUNT || 't_admin', username: 't_admin', email: 't_admin@example.test', password: process.env.E2E_ADMIN_PASSWORD || 'Passw0rdE2E' };
  try { return await login(u); } catch { return register(u); }
}

/** 用 admin 把一批測試帳號刪掉（afterAll 清理） */
export async function cleanup(admin: TestUser, users: TestUser[]) {
  for (const u of users) if (u.id && u.id !== admin.id) await deleteUser(admin, u.id).catch(() => undefined);
}
