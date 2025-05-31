import { lazy } from "react";
import { ScheduleProvider } from "../../contexts/SechduleContext";
import ContactContent from "../../content/ContactContent.json";


const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));
const ScheduleForm = lazy(() => import("../../components/scheduleForm"));
const ScheduleDisplay = lazy(() => import("../../components/scheduleDisplay"));




const Schedule = () => {
  return (
    <Container>
      <ScrollToTop />
      <ScheduleProvider>
        <ScheduleForm
          title={ContactContent.title}
          content={ContactContent.text}
          id="contact" />
        <ScheduleDisplay />
      </ScheduleProvider>
    </Container>
  );
};

export default Schedule;
