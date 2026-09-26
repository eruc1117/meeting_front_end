/**
 * Router 守門 — 未登入的受保護路由導到 /login；登入後可進；初始化前不渲染
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

jest.mock('../components/Header', () => () => <div data-testid="header">HEADER</div>);
jest.mock('../components/Footer', () => () => <div data-testid="footer">FOOTER</div>);
jest.mock('../styles/styles', () => ({ Styles: () => null }));

const page = (name: string) => ({ __esModule: true, default: () => <div data-testid="page">{name}</div> });
jest.mock('../pages/Home', () => page('HOME'));
jest.mock('../pages/Schedule', () => page('SCHEDULE'));
jest.mock('../pages/User', () => page('USER'));
jest.mock('../pages/Chat', () => page('CHAT'));
jest.mock('../pages/Stock', () => page('STOCK'));
jest.mock('../pages/Login', () => page('LOGIN'));

const Router = require('./index').default;

function mount(path: string, auth: Partial<{ isLoggedIn: boolean; isInitialized: boolean }>) {
  const value = { isLoggedIn: false, isInitialized: true, user: null, isAdmin: false, login: jest.fn(), logout: jest.fn(), ...auth };
  return render(
    <AuthContext.Provider value={value as any}>
      <MemoryRouter initialEntries={[path]}>
        <Router />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

test.each(['/schedule', '/user', '/chat', '/stock', '/stock/admin/crawler'])(
  '未登入開 %s → 導到 /login', async (path) => {
    mount(path, { isLoggedIn: false });
    expect(await screen.findByText('LOGIN')).toBeInTheDocument();
  });

test('公開頁不用登入：/ 與 /login', async () => {
  mount('/', { isLoggedIn: false });
  expect(await screen.findByText('HOME')).toBeInTheDocument();
});

test.each([
  ['/schedule', 'SCHEDULE'],
  ['/user', 'USER'],
  ['/chat', 'CHAT'],
  ['/stock', 'STOCK'],
  ['/stock/analysis/holdings', 'STOCK'],
])('登入後開 %s → %s', async (path, name) => {
  mount(path, { isLoggedIn: true });
  expect(await screen.findByText(name)).toBeInTheDocument();
});

test('初始化完成前受保護路由不渲染任何頁（避免閃一下登入頁）', async () => {
  mount('/schedule', { isLoggedIn: false, isInitialized: false });
  await waitFor(() => expect(screen.getByTestId('header')).toBeInTheDocument());
  expect(screen.queryByTestId('page')).toBeNull();
});
