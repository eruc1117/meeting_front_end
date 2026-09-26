import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 市場總覽 → 個股分析：表格有追蹤股票（Stock_test seed 3 檔）；產業篩選；點「分析」跳頁且代號帶入；K 線 canvas；週期切換
 */
test.describe('市場總覽與個股分析', () => {
  let admin: TestUser; let u: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); u = await register(makeUser('ov')); });
  test.afterAll(async () => { await cleanup(admin, [u]); });
  test.beforeEach(async ({ page }) => { await loginViaStorage(page, u); });

  test('總覽表格列出 seed 的追蹤股票，漲跌家數卡片有數字', async ({ page }) => {
    await page.goto('/stock/analysis/overview');
    const rows = page.locator('.stock-app table.data-table tbody tr');
    await expect(rows).toHaveCount(3, { timeout: 15_000 });
    await expect(page.getByText('2330')).toBeVisible();
    await expect(page.locator('.metric-card').first()).toContainText(/\d/);
  });

  test('產業篩選只留該產業', async ({ page }) => {
    await page.goto('/stock/analysis/overview');
    await page.locator('.stock-app .btn-chip', { hasText: /半導體/ }).first().click();
    const rows = page.locator('.stock-app table.data-table tbody tr');
    await expect(rows).toHaveCount(2);
    for (const row of await rows.all()) await expect(row).toContainText(/半導體/);
  });

  test('點「分析」跳到個股頁、代號帶入、K 線圖出現、週期可切', async ({ page }) => {
    await page.goto('/stock/analysis/overview');
    await page.locator('tr', { hasText: '2330' }).getByRole('button', { name: /分析/ }).click();
    await expect(page).toHaveURL(/\/stock\/analysis\/stock\?stock=2330/);
    const s = stockShell(page);
    await expect(s.title).toHaveText('個股分析');
    await expect(page.locator('.stock-app input.stock-input').first()).toHaveValue('2330');
    await expect(page.locator('.stock-app .apexcharts-canvas').first()).toBeVisible({ timeout: 20_000 });
    await page.locator('.stock-app .btn-period', { hasText: /2 週|2週/ }).click();
    await expect(page.locator('.stock-app .btn-period.active')).toContainText(/2/);
  });

  test('查無此股顯示查無資料，不是連線失敗', async ({ page }) => {
    await page.goto('/stock/analysis/stock');
    await page.locator('.stock-app input.stock-input').first().fill('9999');
    await page.getByRole('button', { name: /查詢/ }).click();
    await expect(page.getByText(/查無|資料不足|尚無/)).toBeVisible();
    await expect(page.getByText(/連線失敗/)).toHaveCount(0);
  });
});
