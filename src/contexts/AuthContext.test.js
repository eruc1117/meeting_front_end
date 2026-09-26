/**
 * AuthContext — 登入狀態（整套平台共用的 admin 身分）
 *
 * 1. login 存 token 與最小使用者 {id, username, role}
 * 2. 沒 role 的登入回應預設 user
 * 3. isAdmin 由 role 決定
 * 4. logout 清空
 * 5. localStorage 的 user 損毀時清掉並要求重登
 */
import React, { useContext } from 'react';
import { render, act, screen } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';

let ctx;
function Probe() {
  ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="state">{ctx.isInitialized ? (ctx.isLoggedIn ? 'in' : 'out') : 'init'}</span>
      <span data-testid="role">{ctx.user?.role || '-'}</span>
      <span data-testid="admin">{String(ctx.isAdmin)}</span>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  ctx = undefined;
});

test('login 存 token 與 {id, username, role}', () => {
  render(<AuthProvider><Probe /></AuthProvider>);
  act(() => ctx.login('TOKEN', { id: 7, username: 'amy', role: 'admin', email: 'x@y' }));
  expect(localStorage.getItem('token')).toBe('TOKEN');
  expect(JSON.parse(localStorage.getItem('user'))).toEqual({ id: 7, username: 'amy', role: 'admin' });
  expect(screen.getByTestId('state').textContent).toBe('in');
  expect(screen.getByTestId('role').textContent).toBe('admin');
  expect(screen.getByTestId('admin').textContent).toBe('true');
});

test('沒 role 的登入回應預設 user，isAdmin false', () => {
  render(<AuthProvider><Probe /></AuthProvider>);
  act(() => ctx.login('T', { id: 1, username: 'bob' }));
  expect(JSON.parse(localStorage.getItem('user')).role).toBe('user');
  expect(screen.getByTestId('admin').textContent).toBe('false');
});

test('logout 清空 localStorage 與狀態', () => {
  render(<AuthProvider><Probe /></AuthProvider>);
  act(() => ctx.login('T', { id: 1, username: 'bob', role: 'user' }));
  act(() => ctx.logout());
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
  expect(screen.getByTestId('state').textContent).toBe('out');
  expect(ctx.user).toBeNull();
});

test('重新載入時從 localStorage 還原登入', () => {
  localStorage.setItem('token', 'T');
  localStorage.setItem('user', JSON.stringify({ id: 3, username: 'cat', role: 'admin' }));
  render(<AuthProvider><Probe /></AuthProvider>);
  expect(screen.getByTestId('state').textContent).toBe('in');
  expect(screen.getByTestId('admin').textContent).toBe('true');
});

test('localStorage 的 user 損毀 → 清掉並要求重登', () => {
  localStorage.setItem('token', 'T');
  localStorage.setItem('user', '{not json');
  render(<AuthProvider><Probe /></AuthProvider>);
  expect(screen.getByTestId('state').textContent).toBe('out');
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
});

test('只有 token 沒有 user 也視為未登入', () => {
  localStorage.setItem('token', 'T');
  render(<AuthProvider><Probe /></AuthProvider>);
  expect(screen.getByTestId('state').textContent).toBe('out');
});
