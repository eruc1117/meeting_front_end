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
    path: ["/stock"],
    exact: true,
    component: "Stock",
  },
  {
    path: ["/login"],
    exact: true,
    component: "Login",
  },
];

export default routes;
