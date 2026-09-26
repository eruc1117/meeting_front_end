// ============================================================
//  股票分頁的登入狀態 —— 直接用行事曆平台的登入（單一登入）
//
//  行事曆的 AuthContext 把 token 與 { id, username } 存在 localStorage 的 token / user。
//  股票系統（erucMoney）用同一把密鑰驗這個 token，並以 external_id 對應到自己的使用者列，
//  角色（user / admin）以那邊為準：StockApp 載入時打 /api/stock/auth/me，把結果存到 stock_user。
//  這個模組給搬過來的儀表板頁面用（介面與原本 Screen/src/services/auth.js 相同）。
// ============================================================

const TOKEN_KEY = 'token'
const CAL_USER_KEY = 'user'
const STOCK_USER_KEY = 'stock_user'
const listeners = new Set()

function safeGet(k) { try { return localStorage.getItem(k) } catch { return null } }
function safeSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch { /* 隱私模式 */ } }
function parse(k) { try { return JSON.parse(safeGet(k) || 'null') } catch { return null } }

export function getToken() { return safeGet(TOKEN_KEY) }

/** 合併後的使用者：id 是股票系統的 users.id（使用者管理頁要拿它比對「我」），角色以股票系統為準。 */
export function getUser() {
  const cal = parse(CAL_USER_KEY)
  if (!cal) return null
  const stock = parse(STOCK_USER_KEY)
  return {
    id: stock?.id ?? null,
    calendar_id: cal.id,
    username: stock?.username || cal.username,
    display_name: stock?.display_name || cal.username,
    role: stock?.role || 'user',
    resolved: Boolean(stock),
  }
}
export function isAdmin() { return getUser()?.role === 'admin' }

/** StockApp 用：/auth/me 的結果 */
export function setStockUser(u) {
  safeSet(STOCK_USER_KEY, u ? JSON.stringify(u) : null)
  listeners.forEach(fn => fn(getUser()))
}

/** 舊介面相容：搬過來的頁面不會呼叫它（登入在行事曆），保留以免 import 失敗 */
export function setSession(_token, user) { setStockUser(user) }

/** 401：清掉行事曆的登入並回登入頁 */
export function clearSession() {
  safeSet(TOKEN_KEY, null)
  safeSet(CAL_USER_KEY, null)
  safeSet(STOCK_USER_KEY, null)
  listeners.forEach(fn => fn(null))
  if (typeof window !== 'undefined' && !/\/login$/.test(window.location.pathname)) window.location.assign('/login')
}

export function onAuthChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
