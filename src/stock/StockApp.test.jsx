/**
 * StockApp 殼層 — 模式守門、導覽、路由參數
 *
 * 1. 非 admin：管理鍵 disabled；直接開 /stock/admin/* 會被導回 /stock/analysis
 * 2. admin（股票系統 /auth/me 回 admin，或行事曆 role=admin）：兩種模式都可切
 * 3. 未知 page → 該模式首頁
 * 4. ?stock=2330 → 個股分析頁收到 initStock
 * 5. /auth/me 失敗 → 顯示錯誤，頁面仍在
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, useLocation } from 'react-router-dom';

jest.mock('./services/api', () => ({
  getMe: jest.fn(),
  getStockHealth: jest.fn(),
}));

// 用固定的假頁面取代 lazy import 的真頁面（真頁面會拉 apexcharts 等）
jest.mock('./nav', () => {
  const React = require('react');
  const Overview = () => React.createElement('div', { 'data-testid': 'page' }, 'OVERVIEW');
  const StockPage = ({ initStock }) => React.createElement('div', { 'data-testid': 'page' }, `initStock:${initStock}`);
  const Crawler = () => React.createElement('div', { 'data-testid': 'page' }, 'CRAWLER');
  const ANALYSIS = [{ group: '行情', items: [
    { key: 'overview', label: '市場總覽', title: '市場總覽', desc: 'd1', page: Overview },
    { key: 'stock', label: '個股分析', title: '個股分析', desc: 'd2', page: StockPage },
  ] }];
  const ADMIN = [{ group: '資料', items: [
    { key: 'crawler', label: '爬蟲與排程', title: '爬蟲與排程', desc: 'd3', page: Crawler },
  ] }];
  const MODES = {
    analysis: { label: '分析', sub: 's', groups: ANALYSIS, home: 'overview' },
    admin: { label: '管理', sub: 'admin', groups: ADMIN, home: 'crawler' },
  };
  const findItem = (mode, key) => {
    const m = MODES[mode];
    if (!m) return null;
    for (const g of m.groups) for (const it of g.items) if (it.key === key) return it;
    return null;
  };
  return { MODES, ANALYSIS, ADMIN, findItem };
});

const { getMe, getStockHealth } = require('./services/api');
const StockApp = require('./StockApp').default;

function Where() {
  const loc = useLocation();
  return <div data-testid="where">{loc.pathname}{loc.search}</div>;
}

function mount(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Route path="/stock/:mode?/:page?"><StockApp /></Route>
      <Where />
    </MemoryRouter>
  );
}

const calendarUser = (role) => localStorage.setItem('user', JSON.stringify({ id: 208, username: 'eruc', role }));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'T');
  getStockHealth.mockResolvedValue({ data: { online: true } });
  getMe.mockResolvedValue({ data: { id: 9, username: 'eruc', role: 'user', display_name: 'Eruc' } });
});

test('預設開分析模式的市場總覽，狀態燈在線，非 admin 的管理鍵 disabled', async () => {
  calendarUser('user');
  mount('/stock');
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('市場總覽');
  expect(await screen.findByText('OVERVIEW')).toBeInTheDocument();
  await screen.findByText('股票服務在線');
  const adminBtn = screen.getByRole('tab', { name: /管理/ });
  expect(adminBtn).toBeDisabled();
  expect(screen.getByRole('tab', { name: /分析/ })).toHaveAttribute('aria-selected', 'true');
  await waitFor(() => expect(screen.getByText('Eruc')).toBeInTheDocument());   // /auth/me 的 display_name
});

test('非 admin 直接開 /stock/admin/crawler → 導回 /stock/analysis', async () => {
  calendarUser('user');
  mount('/stock/admin/crawler');
  // /auth/me 解析完（resolved）才判斷 → replace
  await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/stock/analysis'));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('市場總覽');
});

test('股票系統回 admin → 管理鍵可用，點了切到管理首頁', async () => {
  calendarUser('user');
  getMe.mockResolvedValue({ data: { id: 9, username: 'eruc', role: 'admin', display_name: 'Eruc' } });
  mount('/stock');
  const adminBtn = screen.getByRole('tab', { name: /管理/ });
  await waitFor(() => expect(adminBtn).not.toBeDisabled());
  fireEvent.click(adminBtn);
  await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/stock/admin/crawler'));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('爬蟲與排程');
  expect(await screen.findByText('CRAWLER')).toBeInTheDocument();
  expect(screen.getByText(/管理模式會動到系統/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: /分析/ }));
  await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/stock/analysis/overview'));
});

test('行事曆 role=admin 時即使股票系統說 user 也是 admin（整套平台一種 admin）', async () => {
  calendarUser('admin');
  mount('/stock/admin/crawler');
  expect(screen.getByRole('tab', { name: /管理/ })).not.toBeDisabled();
  expect(await screen.findByText('CRAWLER')).toBeInTheDocument();
  await act(async () => { await Promise.resolve(); });
  expect(screen.getByTestId('where').textContent).toBe('/stock/admin/crawler');   // 沒被導回
});

test('未知 page → 該模式首頁的標題', async () => {
  calendarUser('user');
  mount('/stock/analysis/nope');
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('市場總覽');
  expect(await screen.findByText('OVERVIEW')).toBeInTheDocument();
});

test('?stock=2330 → 個股分析頁收到 initStock；側欄目前項目標 on', async () => {
  calendarUser('user');
  mount('/stock/analysis/stock?stock=2330');
  expect(await screen.findByText('initStock:2330')).toBeInTheDocument();
  const link = screen.getByRole('link', { name: '個股分析' });
  expect(link).toHaveClass('on');
  expect(screen.getByRole('link', { name: '市場總覽' })).not.toHaveClass('on');
});

test('/auth/me 失敗 → 顯示錯誤但頁面照常，管理鍵維持 disabled', async () => {
  calendarUser('user');
  getMe.mockResolvedValue({ data: null, error: '股票服務逾時' });
  getStockHealth.mockResolvedValue({ data: { online: false } });
  mount('/stock');
  expect(await screen.findByText(/無法連上股票系統：股票服務逾時/)).toBeInTheDocument();
  expect(await screen.findByText('股票服務離線')).toBeInTheDocument();
  expect(screen.getByText('OVERVIEW')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /管理/ })).toBeDisabled();
});
