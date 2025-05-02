import { Row, Col } from "antd";
import { withTranslation } from "react-i18next";
import { Slide } from "react-awesome-reveal";
import { ScheduleInputFormProps, ScheduleInputTypeProps } from "./types";
import { useForm } from "../../common/utils/useForm";
import { scheduleVal } from "../../common/utils/validationRules";
import { scheduleValProps } from "../../common/types"
import { Button } from "../../common/Button";
import Block from "../Block";
import Input from "../../common/Input";
import TextArea from "../../common/TextArea";
import { ScheduleInputContainer, FormGroup, Span, ButtonContainer } from "./styles";

const initialValues: scheduleValProps = {
  eventID: "",
  eventName: "",
  eventStartDate: "",
  eventStartTime: "",
  eventEndDate: "",
  eventEndTime: "",
  eventContent: ""
};


const ScheduleForm = ({ title, content, id, t }: ScheduleInputFormProps) => {
  const { values, errors, handleChange, handleSubmit } = useForm(scheduleVal, initialValues);

  const ValidationType = ({ type }: ScheduleInputTypeProps) => {
    const ErrorMessage = errors[type as keyof typeof errors];
    return <Span>{ErrorMessage}</Span>;
  };

  return (

    <ScheduleInputContainer id={id}>
      <Row
        justify="center"
        align="middle"
        style={{ flexDirection: "column" }}
      >
        <Col lg={12} md={11} sm={24} xs={24}>
          <Slide direction="left" triggerOnce>
            <Block title={title} content={content} />
          </Slide>
        </Col>

        <Col lg={12} md={12} sm={24} xs={24}>
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

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="活動內容"
                    placeholder=""
                    value={values.eventContent || ""}
                    onChange={handleChange}
                  />
                  <ValidationType type="email" />
                </Col>
                


                <Col span={24}>
                  <Row gutter={[16, 16]} justify="center" align="middle">
                    <Col lg={8} md={8} sm={24} xs={24}>
                      <ButtonContainer style={{ textAlign: "center" }}>
                        <Button name="submit">{t("新增")}</Button>
                      </ButtonContainer>
                    </Col>
                    <Col lg={8} md={8} sm={24} xs={24}>
                      <ButtonContainer style={{ textAlign: "center" }}>
                        <Button name="submit">{t("修改")}</Button>
                      </ButtonContainer>
                    </Col>
                    <Col lg={8} md={8} sm={24} xs={24}>
                      <ButtonContainer style={{ textAlign: "center" }}>
                        <Button name="submit">{t("刪除")}</Button>
                      </ButtonContainer>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </FormGroup>
          </Slide>
        </Col>
      </Row>
    </ScheduleInputContainer>

  );
};

export default withTranslation()(ScheduleForm);
