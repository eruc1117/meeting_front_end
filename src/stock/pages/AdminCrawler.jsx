// 管理 › 爬蟲與排程：個股爬蟲、新聞爬蟲、每週全模型預測、投票，手動觸發與狀態（上游全部要 admin）
import { useEffect, useState, useCallback } from 'react'
import {
  triggerCrawler, getCrawlerStatus, triggerNewsCrawl, getNewsCrawlStatus,
  getWeeklyForecastStatus, runWeeklyForecast, getVotingStatus, triggerVoting, getTrackedStocks,
} from '../services/api'

const fmt = (iso) => (iso ? String(iso).slice(0, 16).replace('T', ' ') : '—')

function Section({ title, children }) {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div className="card-body" style={{ display: 'grid', gap: '.7rem' }}>{children}</div>
    </div>
  )
}

function usePoll(fn, ms, deps = []) {
  const [v, setV] = useState(null)
  const load = useCallback(() => fn().then(({ data }) => setV(data ?? null)), [fn]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); const id = setInterval(load, ms); return () => clearInterval(id) }, [load, ms, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
  return [v, load]
}

export default function AdminCrawler() {
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const note = (m) => { setMsg(m); setErr('') }
  const fail = (e) => { setErr(e); setMsg('') }

  // 個股爬蟲
  const [stockId, setStockId] = useState('')
  const [range, setRange] = useState({ start_date: '', end_date: '' })
  const [crawlStatus, setCrawlStatus] = useState(null)
  useEffect(() => {
    if (!stockId) return undefined
    const tick = () => getCrawlerStatus(stockId).then(({ data }) => setCrawlStatus(data))
    tick(); const id = setInterval(tick, 4000); return () => clearInterval(id)
  }, [stockId])
  async function runCrawler(e) {
    e.preventDefault()
    const opts = range.start_date && range.end_date ? range : {}
    const { error } = await triggerCrawler(stockId.trim(), opts)
    error ? fail(error) : note(`已觸發 ${stockId} 的爬蟲${opts.start_date ? `（${opts.start_date} → ${opts.end_date}）` : ''}`)
  }

  // 新聞爬蟲
  const [news, setNews] = useState({ start_date: '', end_date: '', keywords: '' })
  const [newsStatus, reloadNews] = usePoll(getNewsCrawlStatus, 5000)
  async function runNews(e) {
    e.preventDefault()
    const keywords = news.keywords.split(/[,\s，]+/).map(s => s.trim()).filter(Boolean)
    const { error } = await triggerNewsCrawl({ start_date: news.start_date, end_date: news.end_date, keywords })
    error ? fail(error) : note('已觸發新聞爬蟲'); reloadNews()
  }

  // 每週全模型預測
  const [weekly, reloadWeekly] = usePoll(getWeeklyForecastStatus, 8000)
  async function runWeekly() {
    if (!window.confirm('手動補跑每週全模型預測？49 檔 × 27 模型約 20 分鐘。')) return
    const { error } = await runWeeklyForecast()
    error ? fail(error) : note('已開始每週全模型預測'); reloadWeekly()
  }

  // 投票
  const [voting, reloadVoting] = usePoll(getVotingStatus, 5000)
  const [tracked, setTracked] = useState([])
  useEffect(() => { getTrackedStocks().then(({ data }) => setTracked(data || [])) }, [])
  async function runVoting() {
    const ids = tracked.map(s => s.stock_id)
    if (!ids.length) return fail('沒有追蹤股票')
    const { error } = await triggerVoting(ids)
    error ? fail(error) : note(`已對 ${ids.length} 檔追蹤股票觸發投票`); reloadVoting()
  }

  const running = (s) => s === 'running'

  return (
    <>
      <div className="stock-admin-note">這一頁的動作都會打到本機的 FastAPI（:8000）。爬蟲有 FinMind 額度限制（600 次/小時），不要連續重按。</div>
      {msg && <div className="note-box" style={{ color: 'var(--green)' }}>{msg}</div>}
      {err && <div className="alert-error">{err}</div>}

      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <Section title="個股爬蟲（價量、籌碼、法人）">
          <form onSubmit={runCrawler} style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="stock-input" placeholder="代號，如 2330" value={stockId} onChange={e => setStockId(e.target.value)} required style={{ width: 130 }} />
            <input className="form-input" type="date" value={range.start_date} onChange={e => setRange({ ...range, start_date: e.target.value })} title="歷史補充：開始日" />
            <input className="form-input" type="date" value={range.end_date} onChange={e => setRange({ ...range, end_date: e.target.value })} title="歷史補充：結束日" />
            <button className="btn-primary" type="submit" disabled={running(crawlStatus?.status)}>{running(crawlStatus?.status) ? '執行中…' : '執行'}</button>
          </form>
          <div className="muted" style={{ fontSize: '.85rem' }}>
            {stockId ? <>狀態：<span className={`tag ${running(crawlStatus?.status) ? 'blue' : ''}`}>{crawlStatus?.status || '…'}</span></> : '不填日期 = 近期資料；填了 = 補歷史區間。'}
          </div>
        </Section>

        <Section title="新聞爬蟲">
          <form onSubmit={runNews} style={{ display: 'grid', gap: '.5rem' }}>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <input className="form-input" type="date" value={news.start_date} onChange={e => setNews({ ...news, start_date: e.target.value })} title="歷史（Wayback）開始日" />
              <input className="form-input" type="date" value={news.end_date} onChange={e => setNews({ ...news, end_date: e.target.value })} title="歷史（Wayback）結束日" />
            </div>
            <input className="form-input" placeholder="關鍵字（逗號分隔，留空不過濾）" value={news.keywords} onChange={e => setNews({ ...news, keywords: e.target.value })} />
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
              <button className="btn-primary" type="submit" disabled={running(newsStatus?.status)}>{running(newsStatus?.status) ? '執行中…' : '執行'}</button>
              <span className="muted" style={{ fontSize: '.85rem' }}>狀態 {newsStatus?.status || '…'}{newsStatus?.mode ? ` · ${newsStatus.mode}` : ''} · 上次 {newsStatus?.last_count ?? 0} 則</span>
            </div>
          </form>
          <div className="muted" style={{ fontSize: '.85rem' }}>沒填日期 = 即時首頁；有日期 = Wayback Machine 歷史（上限 7 天）。</div>
        </Section>

        <Section title="每週全模型預測">
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={runWeekly} disabled={Boolean(weekly?.running)}>{weekly?.running ? '執行中…' : '手動補跑'}</button>
            <span className="muted" style={{ fontSize: '.85rem' }}>
              {weekly ? <>下次排程 {fmt(weekly.next_run)}{weekly.started_at ? ` · 開始 ${fmt(weekly.started_at)}` : ''}{weekly.last_error ? <span style={{ color: 'var(--red)' }}> · 上次錯誤：{weekly.last_error}</span> : ''}</> : '…'}
            </span>
          </div>
          <div className="muted" style={{ fontSize: '.85rem' }}>平常不需要：排程每週日 08:00 自動跑。</div>
        </Section>

        <Section title="投票決策">
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={runVoting} disabled={running(voting?.status)}>{running(voting?.status) ? '執行中…' : `對 ${tracked.length} 檔追蹤股票投票`}</button>
            <span className="muted" style={{ fontSize: '.85rem' }}>狀態 {voting?.status || '…'} · 上次 {voting?.last_count ?? 0} 檔</span>
          </div>
          <div className="muted" style={{ fontSize: '.85rem' }}>用模型目錄的預設集合；結果在「分析 › 投票決策」。</div>
        </Section>
      </div>
    </>
  )
}
