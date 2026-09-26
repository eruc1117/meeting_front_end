import { lazy, Suspense } from "react";

// 股票：erucMoney 儀表板的全部功能併進來（src/stock/），分析／管理雙模式；路由 /stock/:mode?/:page?
const StockApp = lazy(() => import("../../stock/StockApp.jsx"));

const Stock = () => (
  <Suspense fallback={null}>
    <StockApp />
  </Suspense>
);

export default Stock;
