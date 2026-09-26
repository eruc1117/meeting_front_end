import { test, expect, Page } from '@playwright/test';
import { makeUser, register, adminUser, cleanup, TestUser } from './helpers/api';
import { loginViaStorage } from './helpers/login';

/**
 * 行程（components/Calendar 的實際互動）：
 *   在月曆某一天連點兩下 → 右鍵選單「新增」 → 新增活動 modal（input[name=title/startDate/startTime/endDate/endTime/description]）→「確定」
 *   事件方塊點一下 → 詳情彈窗 →「修改」開編輯 modal →「確定」；「刪除」→「確定刪除」
 *   scheduleForm 的搜尋列：placeholder「搜尋活動主旨...」→「搜尋」→ 結果列
 * 時段衝突：新時段涵蓋既有活動時後端回 409，前端不顯示訊息、modal 不關（依現行行為斷言）。
 */
const DAY = 12;                                           // 當月 12 號：不會跟前後月的補位日撞號
const pad = (n: number) => String(n).padStart(2, '0');
const today = new Date();
const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(DAY)}`;

const dayCell = (page: Page) => page.getByText(String(DAY), { exact: true }).first();

async function openAddModal(page: Page) {
  await dayCell(page).dblclick();
  await page.getByText('新增', { exact: true }).click();
  await expect(page.locator('input[name=title]')).toBeVisible();
}

test.describe('行程', () => {
  let admin: TestUser; let u: TestUser;
  test.beforeAll(async () => { admin = await adminUser(); u = await register(makeUser('sch')); });
  test.afterAll(async () => { await cleanup(admin, [u]); });
  test.beforeEach(async ({ page }) => { await loginViaStorage(page, u); await page.goto('/schedule'); await expect(page.getByText(/\d{4} 年 \d{1,2} 月/)).toBeVisible(); });

  const title = `E2E 行程 ${Date.now().toString(36)}`;
  const edited = `${title} 已改`;

  test('新增行程後出現在月曆', async ({ page }) => {
    await openAddModal(page);
    await expect(page.locator('input[name=startDate]')).toHaveValue(dateStr);
    await page.locator('input[name=title]').fill(title);
    await page.locator('input[name=startTime]').fill('09:00');
    await page.locator('input[name=endTime]').fill('10:00');
    await page.locator('input[name=description]').fill('由 Playwright 建立');
    await page.getByRole('button', { name: '確定', exact: true }).click();
    await expect(page.locator('input[name=title]')).toHaveCount(0);
    await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 15_000 });
  });

  test('涵蓋既有時段再建一筆 → 後端 409，modal 不關、月曆沒有第二筆', async ({ page }) => {
    await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 15_000 });
    await openAddModal(page);
    await page.locator('input[name=title]').fill(`${title} 衝突`);
    // 後端的重複判斷是「新時段涵蓋既有活動」（Schedule.findEvent：start >= 新 start AND end <= 新 end）
    await page.locator('input[name=startTime]').fill('08:30');
    await page.locator('input[name=endTime]').fill('10:30');
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/schedules/create')),
      page.getByRole('button', { name: '確定', exact: true }).click(),
    ]);
    expect(res.status()).toBe(409);
    await expect(page.locator('input[name=title]')).toBeVisible();
    await page.getByRole('button', { name: '取消', exact: true }).click();
    await expect(page.getByText(`${title} 衝突`)).toHaveCount(0);
  });

  test('修改標題後月曆更新', async ({ page }) => {
    await page.getByText(title, { exact: true }).first().click();
    await page.getByRole('button', { name: '修改', exact: true }).click();
    await page.locator('input[name=title]').fill(edited);
    await page.getByRole('button', { name: '確定', exact: true }).click();
    await expect(page.getByText(edited, { exact: true })).toBeVisible({ timeout: 15_000 });
  });

  test('搜尋找得到、刪除後消失', async ({ page }) => {
    await page.getByPlaceholder('搜尋活動主旨...').fill(title);
    await page.getByRole('button', { name: '搜尋', exact: true }).click();
    await expect(page.getByText(edited).nth(1)).toBeVisible({ timeout: 15_000 });   // 月曆一筆 + 結果一筆
    await page.getByRole('button', { name: '✕' }).first().click().catch(() => undefined);

    await page.getByText(edited, { exact: true }).first().click();
    await page.getByRole('button', { name: '刪除', exact: true }).click();
    await page.getByRole('button', { name: '確定刪除', exact: true }).click();
    await expect(page.getByText(edited, { exact: true })).toHaveCount(0, { timeout: 15_000 });
  });
});
