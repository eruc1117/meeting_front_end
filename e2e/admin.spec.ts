import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 管理模式（admin）：平台使用者列表、升 admin、停用、刪除；股票本地帳號頁；爬蟲頁狀態；資料新鮮度；健康狀態。
 * 一般使用者：/stock/admin/* 被導回分析。
 * 前置：股票測試後端的 FastAPI 位址指到 mock（見 e2e/README.md），狀態端點回 idle。
 */
test.describe('管理模式', () => {
  let admin: TestUser; let victim: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); victim = await register(makeUser('victim')); });
  test.afterAll(async () => { await cleanup(admin, [victim]); });

  test('平台使用者：列表、升 admin、停用、刪除；不能動自己', async ({ page }) => {
    await loginViaStorage(page, admin);
    await page.goto('/stock/admin/users');
    const s = stockShell(page);
    await expect(s.title).toHaveText('平台使用者');
    await expect(s.app).toHaveAttribute('data-mode', 'admin');
    const me = page.locator('tr', { hasText: '（我）' });
    await expect(me.locator('select')).toBeDisabled();

    const row = page.locator('tr', { hasText: victim.account });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.locator('select').selectOption('admin');
    await expect(page.getByText(/已更新.*角色 admin/)).toBeVisible();
    await expect(row.locator('select')).toHaveValue('admin');

    await row.getByRole('button', { name: /停用/ }).click();
    await expect(row).toContainText('停用');
    await row.getByRole('button', { name: /啟用/ }).click();

    page.once('dialog', (d) => d.accept());
    await row.getByRole('button', { name: /刪除/ }).click();
    await expect(page.locator('tr', { hasText: victim.account })).toHaveCount(0);
    victim.id = undefined;   // 已刪，afterAll 不用再刪
  });

  test('股票本地帳號頁列出股票系統的使用者，平台帳號標「行事曆 #id」', async ({ page }) => {
    await loginViaStorage(page, admin);
    await page.goto('/stock/admin/local');
    await expect(stockShell(page).title).toHaveText('股票本地帳號');
    await expect(page.locator('tr', { hasText: /行事曆 #\d+/ }).first()).toBeVisible({ timeout: 15_000 });
  });

  test('爬蟲與排程：四個區塊有狀態、按鈕可按', async ({ page }) => {
    await loginViaStorage(page, admin);
    await page.goto('/stock/admin/crawler');
    await expect(stockShell(page).title).toHaveText('爬蟲與排程');
    await expect(page.getByText(/狀態 idle/).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/下次排程/)).toBeVisible();
    await expect(page.getByRole('button', { name: /對 \d+ 檔追蹤股票投票/ })).toBeEnabled();
  });

  test('資料新鮮度：表格與外生資料列', async ({ page }) => {
    await loginViaStorage(page, admin);
    await page.goto('/stock/admin/data');
    await expect(page.locator('.stock-app table.data-table').first().locator('tbody tr').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/美股行情|台指期|韓日指數/).first()).toBeVisible();
  });

  test('健康狀態：四格都有值', async ({ page }) => {
    await loginViaStorage(page, admin);
    await page.goto('/stock/admin/health');
    const cards = page.locator('.stock-app .metric-card');
    await expect(cards).toHaveCount(4);
    for (const c of await cards.all()) await expect(c.locator('.metric-value')).not.toHaveText('…', { timeout: 15_000 });
  });

  test('一般使用者：/stock/admin/users 被導回分析、管理鍵 disabled', async ({ page }) => {
    const u = await register(makeUser('plain'));
    await loginViaStorage(page, u);
    await page.goto('/stock/admin/users');
    await expect(page).toHaveURL(/\/stock\/analysis/);
    await expect(stockShell(page).modeButton('管理')).toBeDisabled();
    await cleanup(admin, [u]);
  });
});
