import { withTranslation } from "react-i18next";
import { useContext } from "react";
import { ScheduleDisplayContainer, FormGroup, Span, ButtonContainer } from "./styles";
import { ScheduleDisPlayProps, ScheduleInputTypeProps } from "./types";


import { Row, Col } from "antd";
import { Slide } from "react-awesome-reveal";
import { useForm } from "../../common/utils/useForm";
import { scheduleVal } from "../../common/utils/validationRules";
import { scheduleValProps } from "../../common/types"
import { Button } from "../../common/Button";
import Input from "../../common/Input";
import Table from "../../common/Table";
import { ScheduleContext } from "../../contexts/SechduleContext";


const initialValues: scheduleValProps = {
  eventID: "",
  eventName: "",
  eventStartDate: "",
  eventStartTime: "",
  eventEndDate: "",
  eventEndTime: "",
  eventContent: ""
};
const columnsTitle = ["日期","活動主旨", "內容", "時間", "地點", "報名"];
const columns = ["date", "title", "content", "Time", "place", "attend"];



const ScheduleDisplay = ({ t }: ScheduleDisPlayProps) => {
  const { errors, handleSubmit } = useForm(scheduleVal, initialValues);
  const { tableData } = useContext(ScheduleContext);

  const ValidationType = ({ type }: ScheduleInputTypeProps) => {
    const ErrorMessage = errors[type as keyof typeof errors];
    return <Span>{ErrorMessage}</Span>;
  };
  return (
    <ScheduleDisplayContainer >
      <Row
        justify="center"
        align="middle"
        style={{ flexDirection: "column", marginBottom: "1rem" }}
      >
        <Slide direction="right" triggerOnce>
          <FormGroup autoComplete="off" onSubmit={handleSubmit} style={{ width: "100%" }}>

          </FormGroup>
        </Slide>
      </Row>
      <Table columnsTitle={columnsTitle} columns={columns} data={tableData} />
    </ScheduleDisplayContainer>
  );
};

export default withTranslation()(ScheduleDisplay);
