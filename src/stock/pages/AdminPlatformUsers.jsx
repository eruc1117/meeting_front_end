// 管理 › 平台使用者：整套平台共用的帳號與 admin 身分（meeting_API_Server /api/admin/users）
// 角色寫在 JWT（1 小時），改了角色要對方重新登入才生效；股票系統讀同一個 role，所以這裡是唯一要改的地方。
import { useEffect, useState } from 'react'
import { getUser, getToken } from '../services/auth'

const BASE = `${(process.env.REACT_APP_BASEURL || 'http://localhost:5000').replace(/\/+$/, '')}/api/admin`
const input = { padding: '.45rem .6rem', border: '1px solid var(--border)', borderRadius: 6,
                background: 'var(--bg, transparent)', color: 'var(--text-strong, inherit)' }

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`)
  return body.data
}

export default function AdminPlatformUsers() {
  const me = getUser()
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    try { setRows((await call('/users')).users || []); setErr('') } catch (e) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])

  async function patch(u, body) {
    setMsg(''); setErr('')
    try {
      await call(`/users/${u.id}`, { method: 'PUT', body: JSON.stringify(body) })
      setMsg(`已更新 ${u.account}${body.role ? `：角色 ${body.role}（對方重新登入後生效）` : ''}`)
      load()
    } catch (e) { setErr(e.message) }
  }
  async function remove(u) {
    if (!window.confirm(`刪除 ${u.account}（${u.username}）？行程、訊息與股票系統的持股都會一起刪除，無法復原。`)) return
    setMsg(''); setErr('')
    try { await call(`/users/${u.id}`, { method: 'DELETE' }); setMsg(`已刪除 ${u.account}`); load() } catch (e) { setErr(e.message) }
  }

  const admins = rows.filter(r => r.role === 'admin').length

  return (
    <>
      <div className="stock-admin-note">
        整套平台只有一種 admin：這裡改的角色會寫進登入 token，行事曆的管理 API 與股票系統都讀同一個。
        第一個 admin 由行事曆後端 .env 的 ADMIN_ACCOUNTS 指定（註冊或登入時自動升級）。
      </div>
      {msg && <div className="note-box" style={{ color: 'var(--green)' }}>{msg}</div>}
      {err && <div className="alert-error">{err}</div>}
      <div className="card" style={{ padding: '1.2rem' }}>
        <div className="card-title" style={{ marginBottom: '.8rem' }}>平台使用者（{rows.length}） <span className="muted" style={{ fontWeight: 400, fontSize: '.85rem' }}>admin {admins}</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '.92rem' }}>
            <thead><tr><th>帳號</th><th>暱稱</th><th>Email</th><th>角色</th><th>狀態</th><th>建立</th><th></th></tr></thead>
            <tbody>
              {rows.map(u => {
                const self = u.id === me?.calendar_id
                return (
                  <tr key={u.id}>
                    <td>{u.account}{self && '（我）'}</td>
                    <td>{u.username}</td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <select value={u.role} disabled={self} onChange={e => patch(u, { role: e.target.value })} style={input}>
                        <option value="user">user</option><option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{u.is_active ? '啟用' : <span className="tag red">停用</span>}</td>
                    <td className="muted">{u.created_at ? String(u.created_at).slice(0, 10) : '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {!self && <>
                        <button className="btn-secondary" onClick={() => patch(u, { is_active: !u.is_active })}>{u.is_active ? '停用' : '啟用'}</button>{' '}
                        <button className="btn-secondary" onClick={() => remove(u)}>刪除</button>
                      </>}
                    </td>
                  </tr>
                )
              })}
              {!rows.length && !err && <tr><td colSpan={7} className="muted">載入中…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="muted" style={{ fontSize: '.85rem', marginTop: '.8rem' }}>
          註冊在行事曆平台的登入頁；這裡不建帳號。停用的帳號不能登入，已發出的 token 最多再撐 1 小時。
        </div>
      </div>
    </>
  )
}
