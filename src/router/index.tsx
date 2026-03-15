import { lazy, Suspense, useContext } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import routes from "./config";
import { Styles } from "../styles/styles";
import { AuthContext } from "../contexts/AuthContext";

const PROTECTED_ROUTES = ["/schedule", "/user", "/chat"];

const PrivateRoute = ({ component: Component, path, ...rest }: any) => {
  const { isLoggedIn, isInitialized } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      path={path}
      render={(props) => {
        if (!isInitialized) return null;
        return isLoggedIn ? <Component {...props} /> : <Redirect to="/login" />;
      }}
    />
  );
};

const Router = () => {
  return (
    <Suspense fallback={null}>
      <Styles />
      <Header />
      <Switch>
        {routes.map((routeItem) => {
          const isProtected = PROTECTED_ROUTES.includes(
            Array.isArray(routeItem.path) ? routeItem.path[0] : routeItem.path
          );
          const PageComponent = lazy(() => import(`../pages/${routeItem.component}`));

          return isProtected ? (
            <PrivateRoute
              key={routeItem.component}
              path={routeItem.path}
              exact={routeItem.exact}
              component={PageComponent}
            />
          ) : (
            <Route
              key={routeItem.component}
              path={routeItem.path}
              exact={routeItem.exact}
              component={PageComponent}
            />
          );
        })}
      </Switch>
      <Footer />
    </Suspense>
  );
};

export default Router;
