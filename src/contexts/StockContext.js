import React, { createContext, useState, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";

/**
 * StockContext — 股票分頁的資料來源
 *
 * 全部走本專案後端的唯讀代理 /api/stock/*（meeting_API_Server → erucMoney），
 * 用的是行事曆平台的登入 token，不需要另外在 erucMoney 登入。
 * 完整儀表板（持股、交易台帳、模型管理）仍在 erucMoney 自己的網站，用它的帳號登入。
 */
export const StockContext = createContext();

const BASE_URL = process.env.REACT_APP_BASEURL;
export const STOCK_DASHBOARD_URL = process.env.REACT_APP_STOCK_URL || "https://erucmoney.com";

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "X-Requested-With": "XMLHttpRequest",
});

const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("未登入，請重新登入");
    return token;
};

export const StockProvider = ({ children }) => {
    const [tracked, setTracked] = useState([]);
    const [weekly, setWeekly] = useState(null);
    const [online, setOnline] = useState(null);      // null = 未知、true/false = 上游是否在線
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logout } = useContext(AuthContext);

    const request = useCallback(async (path) => {
        const response = await fetch(`${BASE_URL}/api/stock${path}`, { headers: authHeaders(getToken()) });
        if (response.status === 401) {
            logout();
            throw new Error("登入已過期，請重新登入");
        }
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || `請求失敗（HTTP ${response.status}）`);
        return body.data;
    }, [logout]);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const health = await request("/health").catch(() => ({ online: false }));
            setOnline(Boolean(health && health.online));
            if (!health || !health.online) {
                setTracked([]);
                setWeekly(null);
                setError("股票服務目前離線（本機後端未啟動或隧道未連線）");
                return;
            }
            const rows = await request("/stocks?tracked=true");
            setTracked(Array.isArray(rows) ? rows : []);
            // 週預測是選配：FastAPI 沒開時後端回 502，不影響行情表
            try {
                setWeekly(await request("/forecast/weekly"));
            } catch {
                setWeekly(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [request]);

    return (
        <StockContext.Provider value={{ tracked, weekly, online, loading, error, loadOverview, dashboardUrl: STOCK_DASHBOARD_URL }}>
            {children}
        </StockContext.Provider>
    );
};
