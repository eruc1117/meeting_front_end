// 管理 › 使用者：股票系統（erucMoney）的使用者與角色。
// 行事曆帳號第一次用股票功能時會自動建立一列（external_id 對應、role = user），這裡可以升成 admin。
// 本地帳號（有密碼的，例如 admin）也在這裡建；SSO 使用者沒有密碼，「重設密碼」對他們沒有意義。
import { useEffect, useState } from 'react'
import { listUsers, createUser, updateUser, deleteUser } from '../services/api'
import { getUser } from '../services/auth'

const input = { padding: '.45rem .6rem', border: '1px solid var(--border)', borderRadius: 6,
                background: 'var(--bg, transparent)', color: 'var(--text-strong, inherit)' }

export default function AdminUsers() {
  const me = getUser()
  const [rows, setRows] = useState([]); const [err, setErr] = useState('')
  const [form, setForm] = useState({ username: '', password: '', role: 'user', display_name: '' })
  async function load() { const { data, error } = await listUsers(); setErr(error || ''); setRows(data || []) }
  useEffect(() => { load() }, [])

  async function add(e) {
    e.preventDefault()
    const { error } = await createUser(form)
    if (error) return setErr(error)
    setForm({ username: '', password: '', role: 'user', display_name: '' }); load()
  }
  async function patch(id, body) { const { error } = await updateUser(id, body); if (error) setErr(error); else load() }
  async function resetPw(u) {
    const pw = window.prompt(`為 ${u.username} 設定新密碼（至少 6 個字）`)
    if (pw) patch(u.id, { password: pw })
  }
  async function remove(u) {
    if (!window.confirm(`刪除 ${u.username}？他的持股與交易紀錄會一起刪除，無法復原。`)) return
    const { error } = await deleteUser(u.id); if (error) setErr(error); else load()
  }

  return (
    <>
      <div className="stock-admin-note">單一登入的管理者也可以在股票系統 .env 的 SSO_ADMIN_USERNAMES 指定（第一次登入就升 admin）；在這裡降級的帳號若還在清單裡，下次登入會被升回來。</div>
      <div className="card" style={{ padding: '1.2rem' }}>
        <div className="card-title" style={{ marginBottom: '.8rem' }}>使用者（{rows.length}）</div>
        {err && <div style={{ color: 'var(--red)', marginBottom: '.6rem' }}>{err}</div>}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '.92rem' }}>
            <thead><tr><th>帳號</th><th>顯示名</th><th>來源</th><th>角色</th><th>狀態</th><th>持股／交易</th><th>最近登入</th><th></th></tr></thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id}>
                  <td>{u.username}{u.id === me?.id && '（我）'}</td>
                  <td>{u.display_name || '—'}</td>
                  <td className="muted">{u.external_id != null ? `行事曆 #${u.external_id}` : '本地'}</td>
                  <td>
                    <select value={u.role} disabled={u.id === me?.id} onChange={e => patch(u.id, { role: e.target.value })} style={input}>
                      <option value="user">user</option><option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{u.is_active ? '啟用' : '停用'}</td>
                  <td>{u.holdings} / {u.trades}</td>
                  <td>{u.last_login_at ? String(u.last_login_at).slice(0, 16).replace('T', ' ') : '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {u.external_id == null && <><button className="btn-secondary" onClick={() => resetPw(u)}>重設密碼</button>{' '}</>}
                    {u.id !== me?.id && <>
                      <button className="btn-secondary" onClick={() => patch(u.id, { is_active: !u.is_active })}>{u.is_active ? '停用' : '啟用'}</button>{' '}
                      <button className="btn-secondary" onClick={() => remove(u)}>刪除</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={add} style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '1rem', alignItems: 'center' }}>
          <span className="muted" style={{ width: '100%', fontSize: '.85rem' }}>建立本地帳號（只能用 erucMoney 自己的登入；行事曆帳號不用建，第一次用就會出現在上面）</span>
          <input id="nu-username" style={input} placeholder="新帳號" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          <input id="nu-password" style={input} type="password" placeholder="密碼" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          <input id="nu-name" style={input} placeholder="顯示名（選填）" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} />
          <select id="nu-role" style={input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="user">user</option><option value="admin">admin</option>
          </select>
          <button className="btn-primary" type="submit">建立帳號</button>
        </form>
      </div>
    </>
  )
}
