import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage } from './helpers/login';

/**
 * 行程：新增出現在月曆；時段衝突提示；編輯；刪除；進階搜尋
 * selector 依 components/scheduleForm 與 scheduleDisplay 的實際 DOM，第一次跑時對照調整。
 */
test.describe('行程', () => {
  let admin: TestUser; let u: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); u = await register(makeUser('sch')); });
  test.afterAll(async () => { await cleanup(admin, [u]); });
  test.beforeEach(async ({ page }) => { await loginViaStorage(page, u); await page.goto('/schedule'); });

  const title = `E2E 行程 ${Date.now()}`;

  test('新增行程後出現在月曆', async ({ page }) => {
    await page.getByPlaceholder(/標題|title/i).fill(title);
    await page.getByPlaceholder(/描述|description/i).fill('由 Playwright 建立');
    // 時間欄位：依表單實際的 name 調整
    await page.locator('input[name=start_time]').fill('2030-01-15T09:00');
    await page.locator('input[name=end_time]').fill('2030-01-15T10:00');
    await page.getByRole('button', { name: /新增|建立|送出/ }).click();
    await expect(page.getByText(/成功|已建立/)).toBeVisible();
    // 跳到 2030-01 看到事件
    await page.getByRole('button', { name: /›|下個月|next/i }).click({ clickCount: 1 });
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });
  });

  test('同一時段再建一筆 → 衝突提示', async ({ page }) => {
    await page.getByPlaceholder(/標題|title/i).fill(`${title} 衝突`);
    await page.locator('input[name=start_time]').fill('2030-01-15T09:30');
    await page.locator('input[name=end_time]').fill('2030-01-15T09:45');
    await page.getByRole('button', { name: /新增|建立|送出/ }).click();
    await expect(page.getByText(/衝突|重複時段/)).toBeVisible();
  });

  test('編輯標題後月曆更新', async ({ page }) => {
    await page.getByText(title).first().click();
    await page.getByRole('button', { name: /編輯|修改/ }).click();
    await page.getByPlaceholder(/標題|title/i).fill(`${title} 已改`);
    await page.getByRole('button', { name: /儲存|更新/ }).click();
    await expect(page.getByText(`${title} 已改`)).toBeVisible();
  });

  test('進階搜尋找得到、刪除後消失', async ({ page }) => {
    await page.getByRole('button', { name: /進階搜尋/ }).click();
    await page.getByPlaceholder(/關鍵字/).fill('E2E 行程');
    await page.getByRole('button', { name: /搜尋/ }).click();
    await expect(page.getByText(/已改/)).toBeVisible();
    await page.getByText(/已改/).first().click();
    await page.getByRole('button', { name: /刪除/ }).click();
    await page.getByRole('button', { name: /確定|確認|OK/ }).click();
    await expect(page.getByText(/已改/)).toHaveCount(0);
  });
});
