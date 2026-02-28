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
import {
  ScheduleInputContainer,
  FormGroup,
  Span,
  ButtonContainer,
  SelectContainer,
  SelectLabel,
  StyledSelect,
} from "./styles";
import { useContext } from "react";
import { ScheduleContext } from "../../contexts/SechduleContext";
import { AuthContext } from "../../contexts/AuthContext";
import Calendar from "../Calendar";

interface UseFormReturn {
  values: scheduleValProps;
  errors: scheduleValProps;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setValues: (values: scheduleValProps) => void;
}

const initialValues: scheduleValProps = {
  eventID: "",
  eventName: "",
  eventStartDate: "",
  eventStartTime: "",
  eventEndDate: "",
  eventEndTime: "",
  eventContent: "",
  eventPlace: "",
  eventPublic: "false",
  eventParticipants: "",
};

const ScheduleForm = ({ title, content, id, t }: ScheduleInputFormProps) => {
  const { values, errors, handleChange, handleSubmit, setValues } = useForm(scheduleVal, initialValues) as UseFormReturn;
  const { createSchedule, updateSchedule, deleteSchedule, getSchedules, attendSchedule, leaveSchedule } = useContext(ScheduleContext);
  const { user } = useContext(AuthContext);

  const ValidationType = ({ type }: ScheduleInputTypeProps) => {
    const ErrorMessage = errors[type as keyof typeof errors];
    return <Span>{ErrorMessage}</Span>;
  };

  const buildScheduleBody = () => ({
    title: values.eventName,
    description: values.eventContent || undefined,
    start_time: `${values.eventStartDate}T${values.eventStartTime}`,
    end_time: `${values.eventEndDate}T${values.eventEndTime}`,
    is_public: values.eventPublic === "true",
    location: values.eventPlace || undefined,
    participants: values.eventParticipants || undefined,
  });

  const handleCreateSchedule = async () => {
    try {
      await createSchedule({ user_id: user.id, ...buildScheduleBody() });
      setValues(initialValues);
    } catch (error) {
      console.error("Failed to create schedule:", error);
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      await updateSchedule(values.eventID, buildScheduleBody());
    } catch (error) {
      console.error("Failed to update schedule:", error);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await deleteSchedule(Number(values.eventID));
      setValues(initialValues);
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const handleAttendSchedule = async () => {
    try {
      await attendSchedule(Number(values.eventID));
    } catch (error) {
      console.error("Failed to attend schedule:", error);
    }
  };

  const handleLeaveSchedule = async () => {
    try {
      await leaveSchedule(Number(values.eventID));
    } catch (error) {
      console.error("Failed to leave schedule:", error);
    }
  };

  return (
    <ScheduleInputContainer id={id}>
      <Row justify="center" align="middle" style={{ flexDirection: "column" }}>
        <Col lg={12} md={11} sm={24} xs={24}>
          <Slide direction="left" triggerOnce>
            <Block title={title} content={content} />
          </Slide>
        </Col>

        <Col lg={24} md={24} sm={24} xs={24} style={{ display: "flex", justifyContent: "center" }}>
          <Calendar />
        </Col>

        <Col lg={12} md={12} sm={24} xs={24}>
          <Slide direction="right" triggerOnce>
            <FormGroup autoComplete="off" onSubmit={handleSubmit}>
              <Row gutter={[16, 16]} justify="center" align="middle">

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="eventID"
                    labName="活動 ID"
                    placeholder="Event ID"
                    value={values.eventID}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventID" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="eventName"
                    labName="活動名稱"
                    placeholder="Event Name"
                    value={values.eventName}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventName" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="date"
                    name="eventStartDate"
                    labName="開始日期"
                    placeholder="Start Date"
                    value={values.eventStartDate}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventStartDate" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="time"
                    name="eventStartTime"
                    labName="開始時間"
                    placeholder="Start Time"
                    value={values.eventStartTime}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventStartTime" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="date"
                    name="eventEndDate"
                    labName="結束日期"
                    placeholder="End Date"
                    value={values.eventEndDate}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventEndDate" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="time"
                    name="eventEndTime"
                    labName="結束時間"
                    placeholder="End Time"
                    value={values.eventEndTime}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventEndTime" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="eventContent"
                    labName="活動內容"
                    placeholder="Event Content"
                    value={values.eventContent}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventContent" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="eventPlace"
                    labName="活動地點"
                    placeholder="Event Place"
                    value={values.eventPlace}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventPlace" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="eventParticipants"
                    labName="參與人員"
                    placeholder="小明、小美"
                    value={values.eventParticipants}
                    onChange={handleChange}
                  />
                  <ValidationType type="eventParticipants" />
                </Col>

                <Col xs={24} sm={12}>
                  <SelectContainer>
                    <SelectLabel htmlFor="eventPublic">{t("是否公開")}</SelectLabel>
                    <StyledSelect
                      id="eventPublic"
                      name="eventPublic"
                      value={values.eventPublic}
                      onChange={handleChange as any}
                    >
                      <option value="false">不公開（個人）</option>
                      <option value="true">公開</option>
                    </StyledSelect>
                  </SelectContainer>
                </Col>

                <Col span={24}>
                  <Row gutter={[16, 16]} justify="center" align="middle">
                    <Col lg={8} md={8} sm={24} xs={24}>
                      <ButtonContainer style={{ textAlign: "center" }}>
                        <Button onClick={handleCreateSchedule}>{t("新增")}</Button>
                      </ButtonContainer>
                    </Col>
                    <Col lg={8} md={8} sm={24} xs={24}>
                      <ButtonContainer style={{ textAlign: "center" }}>
                        <Button onClick={handleUpdateSchedule}>{t("修改")}</Button>
                      </ButtonContainer>
                    </Col>
                    <Col lg={8} md={8} sm={24} xs={24}>
                      <ButtonContainer style={{ textAlign: "center" }}>
                        <Button onClick={handleDeleteSchedule}>{t("刪除")}</Button>
                      </ButtonContainer>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]} justify="center" align="middle">
                    <Col span={24}>
                      <Row gutter={[16, 16]} justify="center" align="middle">
                        <Col lg={6} md={6} sm={24} xs={24}>
                          <ButtonContainer style={{ textAlign: "center" }}>
                            <Button onClick={() => getSchedules(user?.id)}>{t("查詢事件")}</Button>
                          </ButtonContainer>
                        </Col>
                        <Col lg={6} md={6} sm={24} xs={24}>
                          <ButtonContainer style={{ textAlign: "center" }}>
                            <Button name="submit">{t("查詢空閒")}</Button>
                          </ButtonContainer>
                        </Col>
                        <Col lg={6} md={6} sm={24} xs={24}>
                          <ButtonContainer style={{ textAlign: "center" }}>
                            <Button onClick={handleAttendSchedule}>{t("參加活動")}</Button>
                          </ButtonContainer>
                        </Col>
                        <Col lg={6} md={6} sm={24} xs={24}>
                          <ButtonContainer style={{ textAlign: "center" }}>
                            <Button onClick={handleLeaveSchedule}>{t("退出活動")}</Button>
                          </ButtonContainer>
                        </Col>
                      </Row>
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
