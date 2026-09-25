import { useContext, useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { StockContext } from "../../contexts/StockContext";
import { Button } from "../../common/Button";
import {
  StockSection,
  Title,
  Content,
  Toolbar,
  Status,
  Card,
  CardTitle,
  Up,
  Down,
  Muted,
  Frame,
} from "./styles";

interface StockBlockProps {
  title: string;
  content: string;
  id: string;
}

interface TrackedRow {
  stock_id: string;
  stock_name: string;
  industry_type?: string;
  close_price?: number | string | null;
  change_value?: number | string | null;
  change_rate?: number | string | null;
  trade_date?: string | null;
  foreign_holding_ratio?: number | string | null;
}

interface WeeklyItem {
  stock_id: string;
  stock_name?: string;
  next_week?: any;
  [key: string]: any;
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const fmt = (v: unknown, digits = 2): string => {
  const n = num(v);
  return n === null ? "—" : n.toFixed(digits);
};

const Change = ({ value, pct }: { value: unknown; pct: unknown }) => {
  const v = num(value);
  const p = num(pct);
  if (v === null) return <Muted>—</Muted>;
  const text = `${v > 0 ? "+" : ""}${v.toFixed(2)}${p === null ? "" : ` (${p > 0 ? "+" : ""}${p.toFixed(2)}%)`}`;
  if (v > 0) return <Up>▲ {text}</Up>;
  if (v < 0) return <Down>▼ {text}</Down>;
  return <Muted>{text}</Muted>;
};

/**
 * 股票分頁：追蹤股票行情摘要（走本專案後端代理）＋ 完整儀表板入口（erucMoney，另開或內嵌）。
 */
const StockBlock = ({ title, content, id }: StockBlockProps) => {
  const { tracked, weekly, online, loading, error, loadOverview, dashboardUrl } = useContext(StockContext);
  const [embed, setEmbed] = useState(false);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // 單一登入：把自己的 JWT 放在網址片段交給股票儀表板（片段不會送到伺服器；兩邊共用同一把密鑰）
  const dashboardWithToken = () => {
    const token = localStorage.getItem("token") || "";
    return token ? `${dashboardUrl}/#token=${encodeURIComponent(token)}` : dashboardUrl;
  };

  const columns = [
    { title: "代號", dataIndex: "stock_id", key: "stock_id", width: 90 },
    { title: "名稱", dataIndex: "stock_name", key: "stock_name", width: 120 },
    {
      title: "產業",
      dataIndex: "industry_type",
      key: "industry_type",
      render: (v: string) => (v ? <Tag>{v}</Tag> : <Muted>—</Muted>),
    },
    { title: "收盤", dataIndex: "close_price", key: "close_price", align: "right" as const, render: (v: unknown) => fmt(v) },
    {
      title: "漲跌",
      key: "change",
      align: "right" as const,
      render: (_: unknown, r: TrackedRow) => <Change value={r.change_value} pct={r.change_rate} />,
    },
    {
      title: "外資持股",
      dataIndex: "foreign_holding_ratio",
      key: "foreign_holding_ratio",
      align: "right" as const,
      render: (v: unknown) => (num(v) === null ? <Muted>—</Muted> : `${fmt(v, 1)}%`),
    },
    { title: "資料日期", dataIndex: "trade_date", key: "trade_date", width: 120, render: (v: string) => v || <Muted>—</Muted> },
  ];

  const weeklyRows: WeeklyItem[] = Array.isArray(weekly?.items) ? weekly.items : Array.isArray(weekly) ? weekly : [];

  return (
    <StockSection id={id}>
      <Title>{title}</Title>
      <Content>{content}</Content>

      <Toolbar>
        <Status online={online}>
          {online === null ? "連線中…" : online ? "股票服務在線" : "股票服務離線"}
        </Status>
        <Button onClick={loadOverview}>{loading ? "載入中…" : "重新整理"}</Button>
        <Button onClick={() => window.open(dashboardWithToken(), "_blank", "noopener")}>開啟完整儀表板</Button>
        <Button onClick={() => setEmbed((v) => !v)}>{embed ? "收起內嵌畫面" : "在此頁內開啟"}</Button>
      </Toolbar>

      {error && (
        <Card>
          <Muted>{error}</Muted>
        </Card>
      )}

      <Card>
        <CardTitle>追蹤股票（{tracked.length}）</CardTitle>
        <Table<TrackedRow>
          rowKey="stock_id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={tracked}
          pagination={false}
          locale={{ emptyText: online === false ? "股票服務離線" : "沒有追蹤股票" }}
          scroll={{ x: 720 }}
        />
      </Card>

      {weeklyRows.length > 0 && (
        <Card>
          <CardTitle>每週全模型預測（{weekly?.run_date || weekly?.as_of || "最近一次"}）</CardTitle>
          <Table<WeeklyItem>
            rowKey={(r) => `${r.stock_id}-${r.model_key || r.model || ""}`}
            size="small"
            columns={[
              { title: "代號", dataIndex: "stock_id", key: "stock_id", width: 90 },
              { title: "名稱", dataIndex: "stock_name", key: "stock_name", width: 120 },
              { title: "模型", dataIndex: "model_label", key: "model_label", render: (v: string, r: WeeklyItem) => v || r.model_key || r.model || "—" },
              { title: "下一週", key: "next", render: (_: unknown, r: WeeklyItem) => JSON.stringify(r.next_week ?? r.prediction ?? r.signal ?? "—") },
            ]}
            dataSource={weeklyRows.slice(0, 50)}
            pagination={{ pageSize: 10, size: "small" }}
            scroll={{ x: 640 }}
          />
        </Card>
      )}

      {embed && (
        <Card>
          <CardTitle>完整儀表板（erucMoney，同一組帳號）</CardTitle>
          <Frame src={dashboardWithToken()} title="股票儀表板" loading="lazy" />
        </Card>
      )}
    </StockSection>
  );
};

export default StockBlock;
