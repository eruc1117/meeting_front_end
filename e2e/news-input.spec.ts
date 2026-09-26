import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 新聞輸入：貼一篇 → 列表出現 → 編輯 → 刪除；超長內容（> 10kb）不 413
 */
test.describe('新聞輸入', () => {
  let admin: TestUser; let u: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); u = await register(makeUser('news')); });
  test.afterAll(async () => { await cleanup(admin, [u]); });
  test.beforeEach(async ({ page }) => { await loginViaStorage(page, u); await page.goto('/stock/analysis/news'); });

  const title = `E2E 新聞 ${Date.now()}`;

  test('新增 → 列表 → 編輯 → 刪除', async ({ page }) => {
    await expect(stockShell(page).title).toHaveText('新聞輸入');
    await page.locator('.stock-app input[name=title], .stock-app input.form-input').first().fill(title);
    await page.locator('.stock-app textarea').first().fill('台積電法說會釋出正面展望，外資連續買超。');
    await page.locator('.stock-app .ticker-input').fill('2330').catch(() => undefined);
    await page.getByRole('button', { name: /送出|新增|分析/ }).first().click();
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });

    await page.locator('.news-card', { hasText: title }).getByRole('button', { name: /編輯/ }).click();
    await page.locator('.stock-app input[name=title], .stock-app input.form-input').first().fill(`${title} 改`);
    await page.getByRole('button', { name: /儲存|更新/ }).click();
    await expect(page.getByText(`${title} 改`)).toBeVisible();

    page.once('dialog', (d) => d.accept());
    await page.locator('.news-card', { hasText: `${title} 改` }).getByRole('button', { name: /刪除/ }).click();
    await expect(page.getByText(`${title} 改`)).toHaveCount(0);
  });

  test('超長內容（約 60kb）也送得出去，不會 413', async ({ page }) => {
    const long = '這是一段很長的新聞內容。'.repeat(5000);
    await page.locator('.stock-app input[name=title], .stock-app input.form-input').first().fill(`${title} 長`);
    await page.locator('.stock-app textarea').first().fill(long);
    await page.getByRole('button', { name: /送出|新增|分析/ }).first().click();
    await expect(page.getByText(`${title} 長`)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/413|too large/i)).toHaveCount(0);
  });
});
