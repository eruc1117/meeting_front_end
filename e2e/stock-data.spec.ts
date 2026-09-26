import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 法人持股、預算查詢、查詢紀錄：輸入代號出圖；預算篩選結果價格都 ≤ 上限；查詢紀錄多一筆
 */
test.describe('法人持股、預算查詢、查詢紀錄', () => {
  let admin: TestUser; let u: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); u = await register(makeUser('data')); });
  test.afterAll(async () => { await cleanup(admin, [u]); });
  test.beforeEach(async ({ page }) => { await loginViaStorage(page, u); });

  test('法人持股：輸入代號出圖與累計欄位', async ({ page }) => {
    await page.goto('/stock/analysis/institutional?stock=2330');
    await expect(stockShell(page).title).toHaveText('三大法人持股變化');
    await expect(page.locator('.stock-app .apexcharts-canvas').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/外資|投信|自營/).first()).toBeVisible();
  });

  test('預算查詢：結果的價格都不超過上限', async ({ page }) => {
    await page.goto('/stock/analysis/budget');
    // 預算 200,000 → 每張 1,000 股 → 可買 ≤ 200 元/股（seed：0050 約 124.5、2303 約 158.7；2330 約 2,545 不會出現）
    await page.locator('.stock-app input.budget-input').first().fill('200000');
    await page.getByRole('button', { name: /查詢可買股票/ }).click();
    const cells = page.locator('.stock-app table.data-table tbody tr td.num, .stock-app table.data-table tbody tr');
    await expect(cells.first()).toBeVisible({ timeout: 15_000 });
    const prices = await page.locator('.stock-app table.data-table tbody tr').evaluateAll((rows) =>
      rows.map((r) => Number(((r as HTMLElement).innerText.match(/\b(\d+\.\d{2})\b/) || [])[1])).filter((n) => !Number.isNaN(n)));
    expect(prices.length).toBeGreaterThan(0);
    for (const p of prices) expect(p).toBeLessThanOrEqual(200);
  });

  test('查過的東西出現在查詢紀錄，清除後歸零', async ({ page }) => {
    await page.goto('/stock/analysis/stock');
    await page.locator('.stock-app input.stock-input').first().fill('2303');
    await page.getByRole('button', { name: /查詢/ }).click();
    await page.waitForTimeout(1000);
    await page.goto('/stock/analysis/history');
    await expect(page.getByText('2303').first()).toBeVisible();
    await page.getByRole('button', { name: /清除|清空/ }).click();
    await expect(page.getByText(/尚無查詢紀錄|共 0 筆/)).toBeVisible();
  });
});
