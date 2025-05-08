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
    path: ["/chat"],
    exact: true,
    component: "Chat",
  },  
  {
    path: ["/login"],
    exact: true,
    component: "Login",
  },
];

export default routes;
