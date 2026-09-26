# E2E（Playwright）

打「建置後的前端」+ 兩個**測試**後端。正式服務佔著 :5000（行事曆）與 :3001（股票），E2E 一律用另外的埠與測試資料庫，不碰正式庫。

## 拓樸

```
Playwright ──▶ http://localhost:3000（npx serve -s build；build 時 REACT_APP_BASEURL=http://localhost:5100）
                 └─ 行事曆測試後端 meeting_API_Server/server.js  :5100
                        .env.test（Schedule_test、SECRET、ADMIN_ACCOUNTS=t_admin）+ stack.js 覆蓋（PORT、STOCK_API_URL、放寬限流）
                        └─ /api/stock/* ──▶ 股票測試後端 erucMoney/Server/app.js  :3101
                                               Server/.env.test（Stock_test）+ seed 3 檔（0050、2330、2303）+ 未追蹤 2454
                                               JWT_SECRET = 行事曆的 SECRET；FastAPI = tests/helpers/fastapi-mock.js（隨機埠）
```

全部由 `e2e/stack.js` 起，Playwright 的 `globalSetup` 會呼叫它，`globalTeardown` 收掉。

## 前置（一次）

1. 三個 repo 並排：`../meeting_API_Server`、`../money`（或用 `E2E_CAL_DIR`／`E2E_MONEY_DIR` 指定），兩邊都 `npm install` 過。
2. 本機 PostgreSQL；兩個 repo 的 `.env` 有 `DB_PASSWORD`（stack.js 從那裡讀，測試庫名來自各自的 `.env.test`）。
   測試庫 `Schedule_test`、`Stock_test` 不存在會自動建立並 migrate／seed。
3. `npx playwright install chromium`。

## 執行

```
npm run build:e2e        # 建前端（REACT_APP_BASEURL=http://localhost:5100），改了前端才需要重跑
npm run test:e2e         # 起堆疊 → serve build → 跑 10 支 spec → 收堆疊
```

其他：

```
npm run e2e:stack                       # 只起兩個測試後端（Ctrl+C 結束），方便手動看畫面或用 --ui
E2E_STACK=external npx playwright test  # 堆疊已經自己起著，Playwright 不再起
npx playwright test e2e/csp.spec.ts     # 只跑不需要後端的
npx playwright test --ui                # 互動（先 npm run e2e:stack）
```

環境變數：

| 變數 | 預設 | 說明 |
|------|------|------|
| `E2E_BASE_URL` | `http://localhost:3000` | 前端 |
| `E2E_API` | `http://localhost:5100` | 行事曆測試後端（helpers/api.ts 直接打它註冊、登入、清理） |
| `E2E_CAL_PORT` / `E2E_STOCK_PORT` | `5100` / `3101` | 兩個測試後端的埠 |
| `E2E_CAL_DIR` / `E2E_MONEY_DIR` | `../meeting_API_Server` / `../money` | 兩個 repo 的位置 |
| `E2E_ADMIN_ACCOUNT` / `E2E_ADMIN_PASSWORD` | `t_admin` / `Passw0rdE2E` | 測試 admin；帳號要在行事曆 `.env.test` 的 `ADMIN_ACCOUNTS` |
| `TEST_DB_PASSWORD` | — | 覆蓋兩邊的 DB 密碼（CI 用） |
| `E2E_STACK` | — | `external`：不由 Playwright 起堆疊 |
| `E2E_STACK_QUIET` | — | 設了就不印後端的 stdout |

## Spec 與功能對應

| 檔案 | 案例 | 涵蓋 |
|------|------|------|
| `auth.spec.ts` | 6 | 表單註冊、登入／登出、錯密碼、停用帳號、admin 與一般使用者的「管理」鍵 |
| `schedule.spec.ts` | 4 | 新增行程（日期格連點兩下 → 新增）、涵蓋既有時段 → 409、修改、搜尋與刪除 |
| `stock-shell.spec.ts` | 5 | 預設總覽與狀態燈、14 個分析項目掛得起來、深連結、非 admin 導回、token 失效回登入 |
| `stock-overview.spec.ts` | 4 | 總覽表格（seed 3 檔）、產業篩選、跳個股分析與 K 線、查無此股 |
| `stock-data.spec.ts` | 3 | 法人持股出圖、預算查詢價格上限、查詢紀錄 |
| `holdings.spec.ts` | 2 | UI 記交易 → 持倉 → 刪除；兩帳號持股隔離 |
| `news-input.spec.ts` | 2 | 新增／編輯／刪除新聞、60kb 內容不 413 |
| `admin.spec.ts` | 6 | 平台使用者（升 admin、停用、刪除、不能動自己）、股票本地帳號、爬蟲與排程、資料新鮮度、健康狀態、非 admin |
| `stock-smoke.spec.ts` | 7 | 模型類頁面只斷言掛得起來（假 FastAPI 回 503 也算） |
| `csp.spec.ts` | 5 | connect-src、無 frame-src、404.html、CNAME、build 無祕密（不需後端） |

## 規則

- 每支 spec 自己註冊測試帳號（`makeUser()` 帶時間戳不撞名），`afterAll` 用 admin 刪掉。
- 依序跑（`workers: 1`），因為共用同一個測試 DB。
- 模型類頁面只做冒煙，不斷言預測數值。
- console error 白名單：`X-Frame-Options`（`<meta>` 設定的瀏覽器警告）、`Failed to load resource`（非 admin 打管理端點 403、假 FastAPI 沒有的模型端點）。
- 後端的行為就是規格：例如行程衝突判斷是「新時段涵蓋既有活動」才 409，spec 照此寫。

## 排程

`.github/workflows/e2e.yml` 每天 03:00 UTC 跑，也可手動觸發：checkout 三個 repo、postgres 服務、`npm ci` 三邊、
build:e2e、`npx playwright test`（globalSetup 起堆疊），報告與失敗截圖上傳為 artifact。
