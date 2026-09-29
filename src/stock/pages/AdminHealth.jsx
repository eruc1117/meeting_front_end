// 管理 › 健康狀態：股票 API（Node :3001）、爬蟲服務（FastAPI :8000）、排程、資料新鮮度一眼看完
import { useEffect, useState } from 'react'
import { getStockHealth, getWeeklyForecastStatus, getVotingStatus, getNewsCrawlStatus, getDataFreshness, getExogenousFreshness } from '../services/api'

const fmt = (iso) => (iso ? String(iso).slice(0, 19).replace('T', ' ') : '—')

function Row({ label, ok, text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '.55rem 0', borderBottom: '1px solid var(--border-soft)' }}>
      <span>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontSize: '.88rem' }}>
        <span className="muted">{text}</span>
        <span className={`tag ${ok == null ? '' : ok ? 'green' : 'red'}`}>{ok == null ? '…' : ok ? '正常' : '異常'}</span>
      </span>
    </div>
  )
}

export default function AdminHealth() {
  const [s, setS] = useState({})
  const [at, setAt] = useState('')

  async function load() {
    const [health, weekly, voting, news, fresh, exo] = await Promise.all([
      getStockHealth(), getWeeklyForecastStatus(), getVotingStatus(), getNewsCrawlStatus(), getDataFreshness(), getExogenousFreshness(),
    ])
    setS({ health, weekly, voting, news, fresh, exo })
    setAt(new Date().toLocaleTimeString('zh-TW', { hour12: false }))
  }
  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id) }, [])

  const node = s.health?.data?.online
  const fastapi = s.weekly && !s.weekly.error
  const staleCount = (s.fresh?.data?.items || []).filter(i => i.stale).length
  const exoProblems = s.exo?.data?.problems || []

  return (
    <>
      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="metric-card"><div className="metric-label">股票 API（Node :3001）</div><div className="metric-value" style={{ color: node ? 'var(--green)' : 'var(--red)' }}>{node == null ? '…' : node ? '在線' : '離線'}</div><div className="metric-delta muted">{fmt(s.health?.data?.upstream?.time)}</div></div>
        <div className="metric-card"><div className="metric-label">爬蟲服務（FastAPI :8000）</div><div className="metric-value" style={{ color: fastapi ? 'var(--green)' : 'var(--red)' }}>{s.weekly ? (fastapi ? '在線' : '離線') : '…'}</div><div className="metric-delta muted">{s.weekly?.error || '週預測、投票、爬蟲都靠它'}</div></div>
        <div className="metric-card"><div className="metric-label">個股資料落後</div><div className="metric-value" style={{ color: staleCount ? 'var(--yellow)' : 'var(--green)' }}>{s.fresh ? staleCount : '…'}</div><div className="metric-delta muted">市場最新 {s.fresh?.data?.market_last || '—'}</div></div>
        <div className="metric-card"><div className="metric-label">外生資料問題</div><div className="metric-value" style={{ color: exoProblems.length ? 'var(--yellow)' : 'var(--green)' }}>{s.exo ? exoProblems.length : '…'}</div><div className="metric-delta muted">{exoProblems[0] || '全部最新'}</div></div>
      </div>

      <div className="card" style={{ padding: '1rem 1.2rem' }}>
        <div className="card-title" style={{ marginBottom: '.4rem' }}>排程與背景工作 <span className="muted" style={{ fontWeight: 400, fontSize: '.8rem' }}>每 15 秒更新 · {at}</span></div>
        <Row label="每週全模型預測" ok={s.weekly ? !s.weekly.error && !s.weekly.data?.last_error : null}
             text={s.weekly?.data ? `${s.weekly.data.running ? '執行中' : '閒置'} · 下次 ${fmt(s.weekly.data.next_run)}${s.weekly.data.last_error ? ` · 上次錯誤：${s.weekly.data.last_error}` : ''}` : (s.weekly?.error || '')} />
        <Row label="投票決策" ok={s.voting ? !s.voting.error : null} text={s.voting?.data ? `${s.voting.data.status} · 上次 ${s.voting.data.last_count} 檔` : (s.voting?.error || '')} />
        <Row label="新聞爬蟲" ok={s.news ? !s.news.error : null} text={s.news?.data ? `${s.news.data.status} · 上次 ${s.news.data.last_count} 則` : (s.news?.error || '')} />
        <Row label="LSTM 推論（:8001）" ok={null} text="由「分析 › 趨勢預測」實際呼叫驗證；沒有獨立健康端點" />
      </div>

      <div className="note-box muted" style={{ fontSize: '.85rem' }}>
        這四個服務都在本機以工作排程器常駐（MoneyApi、MoneyCalendarApi、MoneyCrawlerApi、MoneyLstm），對外只經 Cloudflare Tunnel 開放 Node API 與行事曆 API。
        重啟後不通時到本機看 Windows Terminal 的對應分頁。
      </div>
    </>
  )
}
