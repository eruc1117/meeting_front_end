# 行事曆協作平台 — 前端

行事曆協作平台的前端應用，提供行程 CRUD、公開活動參加／退出、使用者搜尋與群組聊天室功能。

**後端專案：** [meeting_API_Server](https://github.com/eruc1117/meeting_API_Server)

---

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | React 18 + TypeScript |
| 樣式 | styled-components |
| UI 元件 | Ant Design |
| 路由 | React Router v5 |
| 國際化 | i18next |
| 狀態管理 | Context API（AuthContext、ScheduleContext） |

---

## 功能

- **帳號系統** — 註冊、登入、修改密碼
- **行事曆**
  - 雙擊空白格新增活動，點擊色塊查看詳情、修改、刪除（二次確認）
  - 開啟頁面自動載入當月資料，切換月份重新查詢
  - 公開活動顯示藍色、私人活動顯示綠色
- **進階搜尋**
  - 時間範圍傳入 API 查詢
  - 關鍵字、地點、參與人員 client-side 過濾
  - 搜尋結果列表，點擊跳轉對應月份
- **參與人員 autocomplete** — debounce 呼叫使用者搜尋 API，下拉選單選取
- **群組聊天室** — 即時訊息收發

---

## 專案結構

```
src/
  styles/         # 全域樣式
  router/         # 路由（含 PrivateRoute）
  pages/          # Home、Schedule、Chat、User、Login
  components/     # Calendar、Chat、Login、scheduleForm、Header、Footer…
  common/         # 共用元件：Button、Input、Table、ScrollToTop
  contexts/       # AuthContext、ScheduleContext
docs/
  spec.md         # 系統規格書
  api.md          # API 文檔
  error-codes.md  # 錯誤代碼列表
  issues/         # 問題紀錄
```

---

## 開始使用

**安裝依賴**

```bash
npm install
```

**啟動開發伺服器**

```bash
npm start
```

預設 proxy 至 `http://localhost:5000`（後端服務）。

**建置**

```bash
npm run build
```

---

## 相關文件

- [系統規格書](./docs/spec.md)
- [API 文檔](./docs/api.md)
- [錯誤代碼](./docs/error-codes.md)
- [問題紀錄](./docs/issues/README.md)
