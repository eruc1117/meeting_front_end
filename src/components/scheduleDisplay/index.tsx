import { withTranslation } from "react-i18next";

import { ContactContainer } from "../scheduleForm/styles";
import Table from "../../common/Table"; 


const columns = ["姓名", "信箱", "電話"];
const data = [
  { 姓名: "小明", 信箱: "ming@example.com", 電話: "0912-345-678" },
  { 姓名: "小美", 信箱: "mei@example.com", 電話: "0987-654-321" },
];


const ScheduleDisplay = () => {
  return (
    <ContactContainer >
     <Table columns={columns} data={data} />
    </ContactContainer>
  );
};

export default withTranslation()(ScheduleDisplay);
