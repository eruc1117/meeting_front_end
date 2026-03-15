import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import 'antd/dist/antd.min.css';

import Router from "./router";
import i18n from "./translation";

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </I18nextProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

ReactDOM.render(<App />, document.getElementById("root"));
