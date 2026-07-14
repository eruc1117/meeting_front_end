# 問題紀錄索引

| # | 問題描述 | 日期 | 狀態 |
|---|----------|------|------|
| [001](./001.md) | 新增行事曆事件時回傳 `E011_DATA_TYPE_ERROR`，並伴隨多項前端路由與顯示錯誤 | 2026-02-28 | ✅ 已解決 |
| [002](./002.md) | 移除 SubMenu state 後，useEffect 內的 `close` 函式仍殘留 `setSubMenu(null)` 呼叫，導致 TS2304 編譯錯誤 | 2026-03-03 | ✅ 已解決 |
| [003](./003.md) | 已登入使用者點選 Schedule 被導向 /login，原因為 AuthContext useEffect 非同步初始化，PrivateRoute 第一次 render 時 isLoggedIn 仍為 false | 2026-03-07 | ✅ 已解決 |
| [004](./004.md) | spec 9.5 要求參與人員搜尋支援 autocomplete（名稱/信箱模糊比對並記錄 user_id），需後端新增 GET /api/users/search API | 2026-03-07 | ✅ 已解決 |
| [005](./005.md) | 點擊搜尋結果跳轉月份後，Calendar 重新抓取該月資料覆蓋 tableData，導致 searchResults live 計算結果筆數改變 | 2026-03-07 | ✅ 已解決 |
| [006](./006.md) | `E013_WEAK_PASSWORD` 未映射至密碼欄；密碼前端驗證與後端規則不一致；`updatePassword` 缺少 Authorization header | 2026-04-05 | ✅ 已解決 |
| [007](./007.md) | Chat：`socket.io-client` 未安裝；`ButtonProps` 缺 `style`/`disabled`；`InputProps` 缺 `onKeyDown`；`onChange` 聯集型別過寬導致 TS2322 | 2026-04-05 | ✅ 已解決 |
| [008](./008.md) | `TextArea` 沿用 `InputProps` 導致 TS2769：`onChange` 型別與 `<textarea>` 不符 | 2026-04-05 | ✅ 已解決 |
