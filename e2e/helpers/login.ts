import { Page, expect } from '@playwright/test';
import { TestUser } from './api';

/** 登入表單的送出鈕（antd primary，文字「登 入」）；導覽列另有一顆「登入」連結，不能用文字選 */
export const loginButton = (page: Page) => page.locator('form button.ant-btn-primary, button.ant-btn-primary', { hasText: /登\s*入/ }).first();

/** 走 UI 登入：/login 表單 → 成功導到 /schedule */
export async function loginViaUi(page: Page, u: TestUser) {
  await page.goto('/login');
  await page.locator('input[name=account]').fill(u.account);
  await page.locator('input[name=password]').fill(u.password);
  await loginButton(page).click();
  await expect(page).toHaveURL(/\/schedule$/);
}

/** 不走表單：把 token 與 user 直接寫進 localStorage（AuthContext 會還原登入），快很多 */
export async function loginViaStorage(page: Page, u: TestUser) {
  if (!u.token || !u.id) throw new Error('loginViaStorage 需要先 register/login 拿 token');
  await page.goto('/login');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token: u.token, user: { id: u.id, username: u.username, role: u.role || 'user' } });
}

export async function logoutViaUi(page: Page) {
  await page.getByRole('button', { name: /登\s*出/ }).click();
  await expect(page).toHaveURL(/\/$|\/login$/);
}

/** 股票分頁殼層的常用定位 */
export const stockShell = (page: Page) => ({
  app: page.locator('.stock-app'),
  modeButton: (label: '分析' | '管理') => page.locator('.stock-mode button', { hasText: label }),
  sideLink: (label: string) => page.locator('.stock-side a', { hasText: label }),
  title: page.locator('.stock-page-head h1'),
  boundaryError: page.getByText(/顯示失敗/),
  onlinePill: page.locator('.stock-modebar .pill.online'),
});
