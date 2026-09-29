import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, stock, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 持股與交易台帳（pages/Holdings.jsx 的實際 DOM）：
 *   分頁按鈕「目前持倉」「交易紀錄」「建議對照」；交易紀錄分頁的「＋ 記錄交易」開表單：
 *   代號（placeholder 2330）、日期、買賣別 select、股數（張 + 零股兩個 number）、成交價（placeholder 2350）、「記錄交易」
 *   台帳列的「刪除」→ window.confirm；持倉分頁有「目前市值」統計。
 * seed 的 0050 最新收盤約 124.5（base 110 + 29×0.5），買 100 股 @100 → 有未實現損益。
 */
test.describe('我的持股', () => {
  let admin: TestUser; let a: TestUser; let b: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); a = await register(makeUser('hold_a')); b = await register(makeUser('hold_b')); });
  test.afterAll(async () => { await cleanup(admin, [a, b]); });

  test('用 UI 記一筆買進 → 台帳與持倉出現、市值是數字 → 刪除 → 消失', async ({ page }) => {
    await loginViaStorage(page, a);
    await page.goto('/stock/analysis/holdings');
    await expect(stockShell(page).title).toHaveText('我的持股');

    await page.getByRole('button', { name: /交易紀錄/ }).click();
    await page.getByRole('button', { name: /記錄交易/ }).first().click();
    const form = page.locator('.stock-app form');
    await form.locator('input[placeholder="2330"]').fill('0050');
    await form.locator('select').selectOption('Buy');
    await form.locator('input[type=number][placeholder="0"]').first().fill('0');     // 張
    await form.locator('input[type=number][placeholder="0"]').nth(1).fill('100');    // 零股
    await form.locator('input[placeholder="2350"]').fill('100');
    await form.getByRole('button', { name: /^記錄交易$/ }).click();

    const tradeRow = page.locator('.stock-app table.data-table tbody tr', { hasText: '0050' }).first();
    await expect(tradeRow).toBeVisible({ timeout: 15_000 });
    await expect(tradeRow).toContainText(/100/);

    await page.getByRole('button', { name: /目前持倉/ }).click();
    const posRow = page.locator('.stock-app table.data-table tbody tr', { hasText: '0050' }).first();
    await expect(posRow).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/目前市值/)).toBeVisible();
    await expect(page.locator('.stock-app', { hasText: /目前市值/ }).getByText(/\d[\d,]*\s*元/).first()).toBeVisible();

    await page.getByRole('button', { name: /交易紀錄/ }).click();
    page.once('dialog', (d) => d.accept());
    await page.locator('.stock-app table.data-table tbody tr', { hasText: '0050' }).first().getByRole('button', { name: '刪除' }).click();
    await expect(page.locator('.stock-app table.data-table tbody tr', { hasText: '0050' })).toHaveCount(0, { timeout: 15_000 });
    await page.getByRole('button', { name: /目前持倉/ }).click();
    await expect(page.locator('.stock-app table.data-table tbody tr', { hasText: '0050' })).toHaveCount(0, { timeout: 15_000 });
  });

  test('帳號 B 用 API 建的持股，帳號 A 看不到；B 自己看得到', async ({ page }) => {
    const r = await stock('/holdings/trades', b.token!, { method: 'POST', body: JSON.stringify({ stock_id: '2330', side: 'Buy', shares: 1, price: 900, trade_date: '2026-09-22' }) });
    expect(r.status).toBe(200);
    await loginViaStorage(page, a);
    const loaded = page.waitForResponse((r) => r.url().includes('/api/stock/holdings') && r.status() === 200);   // 先掛再導頁，不然回應可能已經過了
    await page.goto('/stock/analysis/holdings');
    await expect(stockShell(page).title).toHaveText('我的持股');
    await loaded;
    await expect(page.getByRole('button', { name: /目前持倉/ })).toBeVisible();
    await expect(page.locator('.stock-app table.data-table tbody tr', { hasText: '2330' })).toHaveCount(0);
    await loginViaStorage(page, b);
    await page.goto('/stock/analysis/holdings');
    await expect(page.locator('.stock-app table.data-table tbody tr', { hasText: '2330' })).toHaveCount(1, { timeout: 15_000 });
  });
});
