// 管理 › 資料新鮮度：每檔最後交易日與落後天數、外生資料（美股／台指期／韓日指數），落後的補到最新
import { useEffect, useState } from 'react'
import { getDataFreshness, backfillData, getExogenousFreshness, backfillExogenous } from '../services/api'

export default function AdminData() {
  const [fresh, setFresh] = useState(null)
  const [exo, setExo] = useState(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [picked, setPicked] = useState(new Set())

  async function load() {
    setErr('')
    const [a, b] = await Promise.all([getDataFreshness(), getExogenousFreshness()])
    if (a.error) setErr(a.error); else setFresh(a.data)
    if (!b.error) setExo(b.data)
  }
  useEffect(() => { load() }, [])

  const items = fresh?.items || []
  const stale = items.filter(i => i.stale || i.days_behind > 0)

  async function doBackfill(ids) {
    setBusy('stocks'); setMsg(''); setErr('')
    const { data, error } = await backfillData(ids.length ? ids : null, 8)
    setBusy('')
    if (error) return setErr(error)
    setMsg(`回填完成：${JSON.stringify(data).slice(0, 200)}`)
    load()
  }
  async function doExo() {
    setBusy('exo'); setMsg(''); setErr('')
    const { data, error } = await backfillExogenous()
    setBusy('')
    if (error) return setErr(error)
    setMsg(`外生資料回填完成：${JSON.stringify(data).slice(0, 200)}`)
    load()
  }
  const toggle = (id) => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <>
      <div className="stock-admin-note">回填走 FinMind（匿名 30 次/小時、有 token 600 次/小時），一次最多 8 檔；美股／台指期／韓日指數一次 14 次呼叫。</div>
      {msg && <div className="note-box" style={{ color: 'var(--green)', wordBreak: 'break-all' }}>{msg}</div>}
      {err && <div className="alert-error">{err}</div>}

      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="metric-card"><div className="metric-label">市場最新交易日</div><div className="metric-value">{fresh?.market_last || '…'}</div><div className={`metric-delta ${fresh?.market_stale ? 'down' : 'muted'}`}>距今 {fresh?.market_gap_days ?? '…'} 天{fresh?.market_stale ? ' · 落後' : ''}</div></div>
        <div className="metric-card"><div className="metric-label">追蹤股票</div><div className="metric-value">{items.length || '…'}</div><div className="metric-delta muted">落後 {stale.length} 檔</div></div>
        <div className="metric-card"><div className="metric-label">外生資料問題</div><div className="metric-value">{exo ? (exo.problems?.length || 0) : '…'}</div><div className="metric-delta muted">{exo?.problems?.[0] || '全部最新'}</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">個股資料新鮮度</div>
          <div className="btn-group">
            <button className="btn-secondary" onClick={load}>重新整理</button>
            <button className="btn-secondary" disabled={!picked.size || busy === 'stocks'} onClick={() => doBackfill([...picked])}>回填勾選（{picked.size}）</button>
            <button className="btn-primary" disabled={!stale.length || busy === 'stocks'} onClick={() => doBackfill(stale.slice(0, 8).map(s => s.stock_id))}>{busy === 'stocks' ? '回填中…' : `回填落後的（最多 8 檔）`}</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th></th><th>代號</th><th>最後交易日</th><th style={{ textAlign: 'right' }}>落後（交易日）</th><th style={{ textAlign: 'right' }}>筆數</th><th>狀態</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.stock_id}>
                  <td><input type="checkbox" checked={picked.has(i.stock_id)} onChange={() => toggle(i.stock_id)} /></td>
                  <td className="num">{i.stock_id}</td>
                  <td>{i.last_date || '—'}</td>
                  <td style={{ textAlign: 'right' }} className={i.days_behind > 0 ? 'down' : ''}>{i.days_behind}</td>
                  <td style={{ textAlign: 'right' }}>{i.rows}</td>
                  <td>{i.stale ? <span className="tag red">落後</span> : <span className="tag green">最新</span>}</td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={6} className="muted">{fresh?.available === false ? '爬蟲服務未啟動' : '載入中…'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">外生資料（跳空、振幅、美股模型的輸入）</div>
          <button className="btn-primary" disabled={busy === 'exo'} onClick={doExo}>{busy === 'exo' ? '回填中…' : '全部補到最新'}</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>資料</th><th>資料表</th><th>最新日期</th><th style={{ textAlign: 'right' }}>落後（天）</th><th>用途</th></tr></thead>
            <tbody>
              {(exo?.items || []).map(i => (
                <tr key={i.key}>
                  <td>{i.label} {i.stale ? <span className="tag red">落後</span> : <span className="tag green">最新</span>}</td>
                  <td className="muted">{i.table}</td>
                  <td>{i.last_date || '—'}</td>
                  <td style={{ textAlign: 'right' }} className={i.stale ? 'down' : ''}>{i.days_behind}</td>
                  <td className="muted">{i.note}</td>
                </tr>
              ))}
              {!exo && <tr><td colSpan={5} className="muted">載入中…</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
