import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, stock, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 持股與交易台帳：新增交易 → 持股表出現 → 市值與損益合理 → 刪除交易 → 消失；兩個帳號互相看不到
 */
test.describe('我的持股', () => {
  let admin: TestUser; let a: TestUser; let b: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); a = await register(makeUser('hold_a')); b = await register(makeUser('hold_b')); });
  test.afterAll(async () => { await cleanup(admin, [a, b]); });

  test('用 UI 記一筆買進 → 持股出現、市值與損益是數字 → 刪除 → 消失', async ({ page }) => {
    await loginViaStorage(page, a);
    await page.goto('/stock/analysis/holdings');
    await expect(stockShell(page).title).toHaveText('我的持股');
    await page.getByRole('button', { name: /新增交易|記錄交易/ }).click();
    await page.locator('.stock-app input[name=stock_id], .stock-app input.stock-input').first().fill('0050');
    await page.locator('.stock-app select[name=side]').selectOption('Buy').catch(() => undefined);
    await page.locator('.stock-app input[name=shares]').fill('100');
    await page.locator('.stock-app input[name=price]').fill('100');
    await page.getByRole('button', { name: /儲存|送出|確定/ }).click();
    const row = page.locator('.stock-app table.data-table tbody tr', { hasText: '0050' }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText(/100/);
    await expect(page.locator('.metric-card', { hasText: /市值/ })).toContainText(/\d/);
    // 刪除台帳那筆
    await page.getByRole('button', { name: /台帳|交易紀錄/ }).click().catch(() => undefined);
    await page.locator('tr', { hasText: '0050' }).getByRole('button', { name: /刪除/ }).first().click();
    page.once('dialog', (d) => d.accept());
    await expect(page.locator('.stock-app table.data-table tbody tr', { hasText: '0050' })).toHaveCount(0, { timeout: 15_000 });
  });

  test('帳號 B 用 API 建的持股，帳號 A 看不到；B 自己看得到', async ({ page }) => {
    const r = await stock('/holdings/trades', b.token!, { method: 'POST', body: JSON.stringify({ stock_id: '2330', side: 'Buy', shares: 1, price: 900, trade_date: '2026-09-22' }) });
    expect(r.status).toBe(200);
    await loginViaStorage(page, a);
    await page.goto('/stock/analysis/holdings');
    await expect(page.locator('.stock-app table.data-table tbody tr', { hasText: '2330' })).toHaveCount(0);
    await loginViaStorage(page, b);
    await page.goto('/stock/analysis/holdings');
    await expect(page.locator('.stock-app table.data-table tbody tr', { hasText: '2330' })).toHaveCount(1, { timeout: 15_000 });
  });
});
