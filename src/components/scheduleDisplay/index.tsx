import { withTranslation } from "react-i18next";

import { ScheduleDisplayContainer, FormGroup, Span, ButtonContainer } from "./styles";
import { ScheduleDisPlayProps, ScheduleInputTypeProps } from "./types";


import { Row, Col } from "antd";
import { Slide } from "react-awesome-reveal";
import { useForm } from "../../common/utils/useForm";
import { scheduleVal } from "../../common/utils/validationRules";
import { scheduleValProps } from "../../common/types"
import { Button } from "../../common/Button";
import Block from "../Block";
import Input from "../../common/Input";
import TextArea from "../../common/TextArea";
import Table from "../../common/Table";

const initialValues: scheduleValProps = {
  eventID: "",
  eventName: "",
  eventStartDate: "",
  eventStartTime: "",
  eventEndDate: "",
  eventEndTime: "",
  eventContent: ""
};

const columns = ["姓名", "信箱", "電話"];
const data = [
  { 姓名: "小明", 信箱: "ming@example.com", 電話: "0912-345-678" },
  { 姓名: "小美", 信箱: "mei@example.com", 電話: "0987-654-321" },
];


const ScheduleDisplay = ({ t }: ScheduleDisPlayProps) => {
  const { values, errors, handleChange, handleSubmit } = useForm(scheduleVal, initialValues);

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
            <Row gutter={[16, 16]} justify="center" align="middle">
              <Col xs={24} sm={12}>
                <Input
                  type="text"
                  name="活動 ID"
                  placeholder="Event ID"
                  value={values.eventID || ""}
                  onChange={handleChange}
                />
                <ValidationType type="email" />
              </Col>

              <Col xs={24} sm={12}>
                <Input
                  type="text"
                  name="活動名稱"
                  placeholder="Event Name"
                  value={values.eventName || ""}
                  onChange={handleChange}
                />
                <ValidationType type="email" />
              </Col>
              <Col xs={24} sm={12}>
                <Input
                  type="date"
                  name="活動開始日期"
                  placeholder=""
                  value={values.eventStartDate || ""}
                  onChange={handleChange}
                />
                <ValidationType type="name" />
              </Col>

              <Col xs={24} sm={12}>
                <Input
                  type="time"
                  name="活動開始時間"
                  placeholder=""
                  value={values.eventStartTime || ""}
                  onChange={handleChange}
                />
                <ValidationType type="email" />
              </Col>

              <Col xs={24} sm={12}>
                <Input
                  type="date"
                  name="活動結束日期"
                  placeholder=""
                  value={values.eventEndDate || ""}
                  onChange={handleChange}
                />
                <ValidationType type="name" />
              </Col>

              <Col xs={24} sm={12}>
                <Input
                  type="time"
                  name="活動結束時間"
                  placeholder=""
                  value={values.eventEndTime || ""}
                  onChange={handleChange}
                />
                <ValidationType type="email" />
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]} justify="center" align="middle">
                  <Col lg={12} md={12} sm={24} xs={24}>
                    <ButtonContainer style={{ textAlign: "center" }}>
                      <Button name="submit">{t("查詢事件")}</Button>
                    </ButtonContainer>
                  </Col>
                  <Col lg={12} md={12} sm={24} xs={24}>
                    <ButtonContainer style={{ textAlign: "center" }}>
                      <Button name="submit">{t("查詢空閒")}</Button>
                    </ButtonContainer>
                  </Col>
                </Row>
              </Col>
            </Row>
          </FormGroup>
        </Slide>
      </Row>
      <Table columns={columns} data={data} />
    </ScheduleDisplayContainer>
  );
};

export default withTranslation()(ScheduleDisplay);
