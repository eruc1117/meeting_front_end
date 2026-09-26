import { defineConfig, devices } from '@playwright/test';

/**
 * E2E（Playwright）— 打「建置後的前端」+ 兩個測試後端（見 e2e/README.md）
 *
 * 前端：npm run build:e2e → build/，這裡用 npx serve 起在 :3000（已有就重用）。
 * 後端：globalSetup 用 e2e/stack.js 起行事曆測試後端 :5100（Schedule_test）與股票測試後端 :3101（Stock_test + 假 FastAPI）。
 *       正式服務佔著 :5000／:3001，E2E 不碰。
 * 只有 csp.spec.ts 不需要後端。
 */
export default defineConfig({
  testDir: 'e2e',
  globalSetup: './e2e/global-setup.ts',       // 起兩個測試後端（e2e/stack.js）；E2E_STACK=external 跳過
  globalTeardown: './e2e/global-teardown.ts',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,          // 共用同一個測試 DB 與帳號，依序跑
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'zh-TW',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx serve -s build -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
