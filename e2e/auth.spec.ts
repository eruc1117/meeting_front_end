import { test, expect } from '@playwright/test';
import { makeUser, register, adminUser, setActive, cleanup, TestUser } from './helpers/api';
import { loginViaUi, logoutViaUi, stockShell } from './helpers/login';

/**
 * 註冊與登入：註冊 → 導到 /schedule；登出；錯密碼；停用帳號；admin 帳號的管理鍵可用
 */
test.describe('註冊與登入', () => {
  let admin: TestUser;
  const created: TestUser[] = [];
  test.beforeAll(async () => { admin = await adminUser(); });
  test.afterAll(async () => { await cleanup(admin, created); });

  test('用表單註冊 → 直接登入並導到 /schedule', async ({ page }) => {
    const u = makeUser('reg');
    await page.goto('/login');
    await page.getByText(/註冊|Register/).first().click();          // 切到註冊表單
    await page.locator('input[name=email]').fill(u.email);
    await page.locator('input[name=account]').fill(u.account);
    await page.locator('input[name=username]').fill(u.username);
    await page.locator('input[name=password]').fill(u.password);
    await page.locator('input[name=passwordChk]').fill(u.password);
    await page.getByRole('button', { name: /註\s*冊|Register/ }).click();
    await expect(page).toHaveURL(/\/schedule$/);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('user') || 'null'));
    expect(stored).toMatchObject({ username: u.username, role: 'user' });
    created.push({ ...u, id: stored.id });
  });

  test('登入 → 登出', async ({ page }) => {
    const u = await register(makeUser('login')); created.push(u);
    await loginViaUi(page, u);
    await logoutViaUi(page);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });

  test('錯密碼顯示訊息、停在登入頁', async ({ page }) => {
    const u = await register(makeUser('bad')); created.push(u);
    await page.goto('/login');
    await page.locator('input[name=account]').fill(u.account);
    await page.locator('input[name=password]').fill('WrongPass1');
    await page.getByRole('button', { name: /登\s*入/ }).click();
    await expect(page.getByText(/帳號密碼錯誤|登入失敗/)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('停用的帳號登入被拒', async ({ page }) => {
    const u = await register(makeUser('dis')); created.push(u);
    await setActive(admin, u.id!, false);
    await page.goto('/login');
    await page.locator('input[name=account]').fill(u.account);
    await page.locator('input[name=password]').fill(u.password);
    await page.getByRole('button', { name: /登\s*入/ }).click();
    await expect(page.getByText(/已停用/)).toBeVisible();
  });

  test('ADMIN_ACCOUNTS 帳號登入後，股票分頁的「管理」鍵可用', async ({ page }) => {
    await loginViaUi(page, admin);
    await page.goto('/stock');
    const s = stockShell(page);
    await expect(s.app).toBeVisible();
    await expect(s.modeButton('管理')).toBeEnabled();
  });

  test('一般使用者的「管理」鍵 disabled', async ({ page }) => {
    const u = await register(makeUser('usr')); created.push(u);
    await loginViaUi(page, u);
    await page.goto('/stock');
    await expect(stockShell(page).modeButton('管理')).toBeDisabled();
  });
});
