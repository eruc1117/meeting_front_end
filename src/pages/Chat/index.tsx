import { lazy } from "react";
import Table from "../../common/Table"; // 路徑改成你的 
import { Row, Col } from "antd";
import ChatBlock from "../../components/Chat"

import ContactContent from "../../content/ContactContent.json";
const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));




const Chat = () => {
  return (
    <Container>
      <ChatBlock/>
    </Container>
  );
};

export default Chat;
