# E2E（Playwright）

打「建置後的前端」+ 兩個**測試**後端。正式服務佔著 :5000（行事曆）與 :3001（股票），E2E 一律用另外的埠與測試資料庫，不碰正式庫。

## 拓樸

```
Playwright ──▶ http://localhost:3000（npx serve -s build）
                 └─ REACT_APP_BASEURL=http://localhost:5100
                        └─ 行事曆測試後端 meeting_API_Server（.env.test：Schedule_test、PORT=5100、ADMIN_ACCOUNTS=t_admin、STOCK_API_URL=http://localhost:3101）
                               └─ /api/stock/* ──▶ 股票測試後端 erucMoney/Server（.env.test：Stock_test、PORT=3101、FastAPI 指到 mock）
```

## 前置

1. 測試資料庫：`Schedule_test`（行事曆，跑 node-pg-migrate）與 `Stock_test`（股票，跑 18 個 SQL migration + seed 3 檔）。建法在各 repo 的 README「測試」章節。
2. 起兩個測試後端（各自 repo）：
   ```
   cd E:\Desktop\coding\meeting_API_Server && PORT=5100 NODE_ENV=test node -r dotenv/config server.js dotenv_config_path=.env.test
   cd E:\Desktop\coding\money\Server      && PORT=3101 node -r dotenv/config index.js dotenv_config_path=.env.test
   ```
   （實際指令以兩個 repo 的測試章節為準；重點是埠與 .env.test。）
3. 股票測試後端要能回爬蟲／新鮮度狀態：把它的 FastAPI 位址指到 mock（erucMoney `Server/tests/helpers/fastapi-mock.js`）或真的起 `Crawler` 服務在另一個埠。
4. 建前端：`npm run build:e2e`（REACT_APP_BASEURL=http://localhost:5100）。

## 執行

```
npm run test:e2e                     # 全部
npx playwright test e2e/csp.spec.ts  # 只跑不需要後端的
npx playwright test --ui             # 互動
```

環境變數：

| 變數 | 預設 | 說明 |
|------|------|------|
| `E2E_BASE_URL` | `http://localhost:3000` | 前端 |
| `E2E_API` | `http://localhost:5100` | 行事曆測試後端（helpers/api.ts 直接打它註冊、登入、清理） |
| `E2E_ADMIN_ACCOUNT` / `E2E_ADMIN_PASSWORD` | `t_admin` / `Passw0rdE2E` | 測試 admin；帳號要在後端 `.env.test` 的 `ADMIN_ACCOUNTS` |

## 規則

- 每支 spec 自己註冊測試帳號（`makeUser()` 帶時間戳不撞名），`afterAll` 用 admin 刪掉。
- 依序跑（`workers: 1`），因為共用同一個測試 DB。
- 模型類頁面只做冒煙（`stock-smoke.spec.ts`），不斷言預測數值。
- 第一次在真後端跑時，`schedule.spec.ts`、`holdings.spec.ts`、`news-input.spec.ts` 的表單 selector 要對照實際 DOM 調整（檔內已標）。

## 排程

`.github/workflows/e2e.yml` 每天 03:00 UTC 跑（骨架已在，等測試庫流程確定後補 checkout 三個 repo 與起服務的步驟）。
