// 股票分頁的導覽（方案 9：分析／管理雙模式）
//
// 分析：所有登入者。管理：只有平台 admin（整套平台共用一種 admin 身分，角色在登入 token 裡；第一個 admin 由行事曆後端 .env 的 ADMIN_ACCOUNTS 指定）。
// 每一項對應一個頁面元件；路徑是 /stock/<mode>/<key>。
import { lazy } from 'react'

const P = (name) => lazy(() => import(`./pages/${name}.jsx`))

export const ANALYSIS = [
  { group: '行情', items: [
    { key: 'overview',      label: '市場總覽',   title: '市場總覽',        desc: '追蹤股票的收盤、漲跌與外資持股', page: P('Overview') },
    { key: 'stock',         label: '個股分析',   title: '個股分析',        desc: 'K 線、成交量、籌碼與新聞',        page: P('StockAnalysis') },
    { key: 'institutional', label: '法人持股',   title: '三大法人持股變化', desc: '每日買賣超與期間累計',            page: P('InstitutionalHoldings') },
    { key: 'budget',        label: '預算查詢',   title: '預算查詢',        desc: '依可負擔價位與產業篩選',          page: P('BudgetSearch') },
    { key: 'us',            label: '美股',       title: '美股開盤跳空',    desc: '12 檔美股報價與下一場跳空預測',    page: P('USMarket') },
  ] },
  { group: '預測', items: [
    { key: 'prediction',    label: '趨勢預測',   title: '趨勢預測',        desc: '單檔多模型的未來走勢',            page: P('Prediction') },
    { key: 'compare',       label: '預測比對',   title: '預測比對',        desc: '已儲存的預測 vs 實際收盤',        page: P('PredictionCompare') },
    { key: 'weekly',        label: '每週全模型', title: '每週全模型預測',  desc: '49 檔 × 27 模型，兩週中位數與區間', page: P('WeeklyForecast') },
    { key: 'voting',        label: '投票決策',   title: '投票決策',        desc: '閘門過濾後的 Buy / Hold / Sell',   page: P('VotingDashboard') },
  ] },
  { group: '資產', items: [
    { key: 'holdings',      label: '我的持股',   title: '我的持股',        desc: '持股、交易台帳、建議 vs 實際',    page: P('Holdings') },
    { key: 'cash',          label: '閒置資金',   title: '閒置資金',        desc: '一週配置建議（風險調整後）',      page: P('IdleCash') },
  ] },
  { group: '新聞', items: [
    { key: 'sentiment',     label: '新聞情緒',   title: '新聞情緒',        desc: '規則引擎與 MOPS 公告分類',        page: P('NewsSentiment') },
    { key: 'news',          label: '新聞輸入',   title: '新聞輸入',        desc: '手動貼入文章分析、管理新聞',      page: P('NewsInput') },
  ] },
  { group: '其他', items: [
    { key: 'history',       label: '查詢紀錄',   title: '查詢紀錄',        desc: '這台瀏覽器查過的東西',            page: P('QueryHistory') },
  ] },
]

export const ADMIN = [
  { group: '資料', items: [
    { key: 'crawler',  label: '爬蟲與排程', title: '爬蟲與排程',  desc: '個股、新聞、週預測、投票的手動觸發與狀態', page: P('AdminCrawler') },
    { key: 'data',     label: '資料新鮮度', title: '資料新鮮度',  desc: '每檔最後交易日、外生資料，落後的補到最新', page: P('AdminData') },
  ] },
  { group: '模型', items: [
    { key: 'models',   label: '模型版本',   title: '模型版本',    desc: '凍結、切換服役版本、回填實際值重算',      page: P('ModelVersions') },
  ] },
  { group: '帳號', items: [
    { key: 'users',    label: '平台使用者', title: '平台使用者',  desc: '整套平台共用的帳號與 admin 身分（行事曆與股票同一份）', page: P('AdminPlatformUsers') },
    { key: 'local',    label: '股票本地帳號', title: '股票本地帳號', desc: '只在股票 API 存在的帳號（不走單一登入）；平台帳號會自動對應', page: P('AdminUsers') },
  ] },
  { group: '服務', items: [
    { key: 'health',   label: '健康狀態',   title: '健康狀態',    desc: '股票 API、爬蟲服務、排程',                page: P('AdminHealth') },
  ] },
]

export const MODES = {
  analysis: { label: '分析', sub: '行情 · 預測 · 投票 · 持股 · 新聞', groups: ANALYSIS, home: 'overview' },
  admin:    { label: '管理', sub: 'admin', groups: ADMIN, home: 'crawler' },
}

export function findItem(mode, key) {
  const m = MODES[mode]
  if (!m) return null
  for (const g of m.groups) for (const it of g.items) if (it.key === key) return it
  return null
}
