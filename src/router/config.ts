const routes = [
  {
    path: ["/", "/home"],
    exact: true,
    component: "Home",
  },
  {
    path: ["/schedule"],
    exact: true,
    component: "Schedule",
  },
  {
    path: ["/user"],
    exact: true,
    component: "User",
  },
  {
    path: ["/chat"],
    exact: true,
    component: "Chat",
  },
  {
    path: ["/stock/:mode?/:page?"],   // 股票：分析／管理雙模式，子路徑在 src/stock/StockApp.jsx 處理
    exact: false,
    component: "Stock",
  },
  {
    path: ["/login"],
    exact: true,
    component: "Login",
  },
];

export default routes;
