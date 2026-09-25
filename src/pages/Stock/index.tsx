import { lazy } from "react";
import { StockProvider } from "../../contexts/StockContext";
import StockContent from "../../content/StockContent.json";

const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));
const StockBlock = lazy(() => import("../../components/Stock"));

const Stock = () => {
  return (
    <Container>
      <ScrollToTop />
      <StockProvider>
        <StockBlock title={StockContent.title} content={StockContent.text} id="stock" />
      </StockProvider>
    </Container>
  );
};

export default Stock;
