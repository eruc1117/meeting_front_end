import { lazy } from "react";
import LoginBlock from "../../components/Login"


const Container = lazy(() => import("../../common/Container"));





const Home = () => {
  return (
    <Container>
      <LoginBlock/>
    </Container>
  );
};

export default Home;
