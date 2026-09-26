import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 股票殼層：/stock 預設市場總覽；分析模式每個項目點一次都不出現「顯示失敗」；狀態燈在線；深連結直接開
 */
test.describe('股票殼層', () => {
  let admin: TestUser; let u: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); u = await register(makeUser('shell')); });
  test.afterAll(async () => { await cleanup(admin, [u]); });
  test.beforeEach(async ({ page }) => { await loginViaStorage(page, u); });

  test('/stock 預設市場總覽、狀態燈在線', async ({ page }) => {
    await page.goto('/stock');
    const s = stockShell(page);
    await expect(s.title).toHaveText('市場總覽');
    await expect(s.onlinePill).toBeVisible();
    await expect(s.modeButton('分析')).toHaveAttribute('aria-selected', 'true');
  });

  test('分析模式每個項目都掛得起來（沒有 ErrorBoundary、沒有 console error）', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/stock');
    const s = stockShell(page);
    const labels = await s.app.locator('.stock-side a').allTextContents();
    expect(labels.length).toBeGreaterThanOrEqual(14);
    for (const label of labels) {
      await s.sideLink(label).click();
      await expect(s.title).not.toHaveText('');
      await page.waitForTimeout(500);
      await expect(s.boundaryError).toHaveCount(0);
    }
    expect(errors.filter((e) => !/favicon|ResizeObserver/.test(e))).toEqual([]);
  });

  test('深連結 /stock/analysis/holdings 直接開到我的持股', async ({ page }) => {
    await page.goto('/stock/analysis/holdings');
    await expect(stockShell(page).title).toHaveText('我的持股');
    await expect(stockShell(page).sideLink('我的持股')).toHaveClass(/on/);
  });

  test('一般使用者開 /stock/admin/crawler 被導回分析', async ({ page }) => {
    await page.goto('/stock/admin/crawler');
    await expect(page).toHaveURL(/\/stock\/analysis/);
    await expect(stockShell(page).title).toHaveText('市場總覽');
  });

  test('token 失效 → 股票請求 401 → 回登入頁', async ({ page }) => {
    await page.goto('/stock');
    await page.evaluate(() => localStorage.setItem('token', 'expired.token.value'));
    await stockShell(page).sideLink('我的持股').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
