// 股票分頁殼層（Iteration 44，方案 9：分析／管理雙模式）
//
// 股票儀表板（erucMoney Screen/）的全部頁面搬到 ./pages，資料走行事曆後端的代理 /api/stock/*，
// 登入就是行事曆的登入。這裡負責：模式列（分析／管理）、左側分組導覽、路由 /stock/:mode/:page、
// 向股票系統確認身分（/auth/me → 角色）。
import { Suspense, useEffect, useState, useCallback } from 'react'
import { useHistory, useParams, useLocation, Link } from 'react-router-dom'
import { ThemeProvider } from './theme'
import { MODES, findItem } from './nav'
import { getMe, getStockHealth } from './services/api'
import { getUser, setStockUser, onAuthChange } from './services/auth'
import ErrorBoundary from './components/ErrorBoundary'
import './stock.css'
import './stock-overrides.css'

function useQuery() {
  const { search } = useLocation()
  return new URLSearchParams(search)
}

export default function StockApp() {
  const history = useHistory()
  const params = useParams()
  const query = useQuery()
  const [user, setUser] = useState(getUser())
  const [online, setOnline] = useState(null)
  const [meError, setMeError] = useState('')

  const mode = MODES[params.mode] ? params.mode : 'analysis'
  const key = params.page || MODES[mode].home
  const item = findItem(mode, key) || findItem(mode, MODES[mode].home)
  const isAdmin = user?.role === 'admin'

  // 向股票系統確認身分（第一次會自動建立對應使用者），拿角色
  useEffect(() => {
    let alive = true
    getMe().then(({ data, error }) => {
      if (!alive) return
      if (error || !data) { setMeError(error || '無法確認股票系統身分'); return }
      setStockUser({ id: data.id, username: data.username, role: data.role, display_name: data.display_name })
      setMeError('')
    })
    getStockHealth().then(({ data }) => { if (alive) setOnline(Boolean(data?.online)) })
    return () => { alive = false }
  }, [])
  useEffect(() => onAuthChange(setUser), [])

  // 沒有 admin 卻在管理模式 → 回分析
  useEffect(() => {
    if (mode === 'admin' && user?.resolved && !isAdmin) history.replace('/stock/analysis')
  }, [mode, user, isAdmin, history])

  const go = useCallback((m, k, extra = '') => history.push(`/stock/${m}/${k}${extra}`), [history])
  const goToStock = useCallback((stockId) => go('analysis', 'stock', `?stock=${encodeURIComponent(stockId)}`), [go])

  const Page = item?.page
  const initStock = query.get('stock') || ''
  const pageProps = { onSelectStock: goToStock, initStock }

  return (
    <ThemeProvider>
      <div className="stock-app" data-theme="dark" data-mode={mode}>
        <div className="stock-modebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="stock-mode" role="tablist" aria-label="模式">
              {Object.entries(MODES).map(([m, cfg]) => {
                const disabled = m === 'admin' && !isAdmin
                return (
                  <button key={m} role="tab" aria-selected={mode === m}
                          className={`${mode === m ? 'on ' : ''}${m}`} disabled={disabled}
                          title={disabled ? '需要股票系統的 admin 角色' : ''}
                          onClick={() => go(m, cfg.home)}>
                    {cfg.label} <span className="sub">{cfg.sub}</span>
                  </button>
                )
              })}
            </div>
            {mode === 'admin' && <span className="hint">管理模式會動到系統：觸發爬蟲、回填資料、凍結模型、改角色</span>}
          </div>
          <div className="who">
            {online === false && <span className="pill offline">股票服務離線</span>}
            {online === true && <span className="pill online">股票服務在線</span>}
            {user && <span><b>{user.display_name}</b></span>}
            {user && <span className={`pill${isAdmin ? ' admin' : ''}`}>{user.role}</span>}
          </div>
        </div>

        {meError && (
          <div className="content" style={{ paddingBottom: 0 }}>
            <div className="alert-error">無法連上股票系統：{meError}</div>
          </div>
        )}

        <div className="stock-body">
          <aside className="stock-side" aria-label="股票功能">
            {MODES[mode].groups.map(g => (
              <div key={g.group}>
                <h3>{g.group}</h3>
                {g.items.map(it => (
                  <Link key={it.key} to={`/stock/${mode}/${it.key}`} className={it.key === item?.key ? 'on' : ''}>
                    <span>{it.label}</span>
                  </Link>
                ))}
              </div>
            ))}
            <div className="side-foot">
              {mode === 'admin' ? '一般使用者看不到這個模式。' : '資料經行事曆後端代理到股票系統；持股與交易只有你自己看得到。'}
            </div>
          </aside>

          <main className="content">
            <div className="stock-page-head">
              <h1>{item?.title}</h1>
              <span className="desc">{item?.desc}</span>
            </div>
            {mode === 'admin' && !isAdmin ? (
              <div className="stock-forbidden">需要股票系統的 admin 角色</div>
            ) : Page ? (
              <ErrorBoundary label={item.title}>
                <Suspense fallback={<div className="muted">載入中…</div>}>
                  <Page key={`${mode}/${item.key}/${initStock}`} {...pageProps} />
                </Suspense>
              </ErrorBoundary>
            ) : null}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
