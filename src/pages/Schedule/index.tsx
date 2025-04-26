import { lazy } from "react";
import Table from "../../common/Table"; // 路徑改成你的 
import { Row, Col } from "antd";
import ContactContent from "../../content/ContactContent.json";


const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));
const ScheduleForm = lazy(() => import("../../components/scheduleForm"));
const ScheduleDisplay = lazy(() => import("../../components/scheduleDisplay"));




const Home = () => {
  return (
    <Container>
      <ScrollToTop />
      <ScheduleForm
        title={ContactContent.title}
        content={ContactContent.text}
        id="contact" />
      <ScheduleDisplay/>
    </Container>
  );
};

export default Home;
