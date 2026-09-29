import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 模型類頁面冒煙：只斷言掛得起來、沒有 ErrorBoundary、沒有 console error。內容（預測數值）不在範圍。
 */
const PAGES: Array<[string, string]> = [
  ['prediction', '趨勢預測'],
  ['compare', '預測比對'],
  ['weekly', '每週全模型預測'],
  ['voting', '投票決策'],
  ['cash', '閒置資金'],
  ['us', '美股開盤跳空'],
];

test.describe('模型類頁面冒煙', () => {
  let admin: TestUser; let u: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); u = await register(makeUser('smoke')); });
  test.afterAll(async () => { await cleanup(admin, [u]); });

  for (const [key, title] of PAGES) {
    test(`${title}（/stock/analysis/${key}）`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await loginViaStorage(page, u);
      await page.goto(`/stock/analysis/${key}`);
      const s = stockShell(page);
      await expect(s.title).toHaveText(title);
      await page.waitForTimeout(1500);
      await expect(s.boundaryError).toHaveCount(0);
      expect(errors.filter((e) => !/favicon|ResizeObserver|X-Frame-Options|Failed to load resource/.test(e))).toEqual([]);
    });
  }

  test('模型版本（admin）掛得起來', async ({ page }) => {
    await loginViaStorage(page, admin);
    await page.goto('/stock/admin/models');
    await expect(stockShell(page).title).toHaveText('模型版本');
    await page.waitForTimeout(1500);
    await expect(stockShell(page).boundaryError).toHaveCount(0);
  });
});
