import { test, expect, Page } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage, stockShell } from './helpers/login';

/**
 * 新聞輸入（pages/NewsInput.jsx 的實際 DOM）：
 *   表單：標題 placeholder「貼上或輸入新聞標題」、全文 textarea、代碼 placeholder「新增代碼」+「+」、送出（.btn-primary）→「✓ 已儲存」
 *   列表：.news-card 點開 .modal → 「編輯」（標題 .form-input、「儲存」）／「刪除」→「確定刪除」／「關閉」
 */
test.describe('新聞輸入', () => {
  let admin: TestUser; let u: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); u = await register(makeUser('news')); });
  test.afterAll(async () => { await cleanup(admin, [u]); });
  test.beforeEach(async ({ page }) => { await loginViaStorage(page, u); await page.goto('/stock/analysis/news'); await expect(stockShell(page).title).toHaveText('新聞輸入'); });

  const title = `E2E 新聞 ${Date.now().toString(36)}`;
  const submit = (page: Page) => page.locator('.stock-app').getByRole('button', { name: /送出|分析|儲存/ }).first();

  test('新增 → 列表 → 編輯 → 刪除', async ({ page }) => {
    await page.getByPlaceholder('貼上或輸入新聞標題').fill(title);
    await page.getByPlaceholder(/在此貼上新聞全文/).fill('台積電法說會釋出正面展望，外資連續買超。');
    await page.getByPlaceholder('新增代碼').fill('2330');
    await page.getByPlaceholder('新增代碼').locator('..').getByRole('button', { name: '+' }).click();
    await submit(page).click();
    await expect(page.getByText(/已儲存/)).toBeVisible({ timeout: 15_000 });
    const card = page.locator('.news-card', { hasText: title }).first();
    await expect(card).toBeVisible({ timeout: 15_000 });

    await card.click();
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: '編輯', exact: true }).click();
    await modal.locator('input.form-input').first().fill(`${title} 改`);
    await modal.getByRole('button', { name: /^儲存/ }).click();
    await expect(page.locator('.news-card', { hasText: `${title} 改` }).first()).toBeVisible({ timeout: 15_000 });

    if (await modal.isVisible()) await modal.getByRole('button', { name: '關閉', exact: true }).click().catch(() => undefined);
    await page.locator('.news-card', { hasText: `${title} 改` }).first().click();
    await modal.getByRole('button', { name: '刪除', exact: true }).click();
    await modal.getByRole('button', { name: /^確定刪除/ }).click();
    await expect(page.locator('.news-card', { hasText: `${title} 改` })).toHaveCount(0, { timeout: 15_000 });
  });

  test('超長內容（約 60kb）也送得出去，不會 413', async ({ page }) => {
    const long = '這是一段很長的新聞內容。'.repeat(5000);
    await page.getByPlaceholder('貼上或輸入新聞標題').fill(`${title} 長`);
    await page.getByPlaceholder(/在此貼上新聞全文/).fill(long);
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/stock/news') && r.request().method() === 'POST'),
      submit(page).click(),
    ]);
    expect(res.status()).toBe(200);
    await expect(page.locator('.news-card', { hasText: `${title} 長` }).first()).toBeVisible({ timeout: 20_000 });
  });
});
