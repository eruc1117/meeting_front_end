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
  SearchRow,
  SearchInput,
  SearchButton,
} from "./styles";
import { useContext, useState } from "react";
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
    start_time: `${values.eventStartDate}T${values.eventStartTime}:00`,
    end_time: `${values.eventEndDate}T${values.eventEndTime}:00`,
    is_public: values.eventPublic === "true",
    location: values.eventPlace || undefined,
    participants: values.eventParticipants || undefined,
  });

  const handleCreateSchedule = async () => {
    try {
      const result = await createSchedule({ user_id: Number(user.id), ...buildScheduleBody() });
      setValues({ ...initialValues, eventID: String(result.data.id) });
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

  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = () => {
    getSchedules(user?.id);
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
          <SearchRow>
            <SearchInput
              type="text"
              placeholder="搜尋活動..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <SearchButton onClick={handleSearch}>搜尋</SearchButton>
          </SearchRow>
        </Col>

        <Col lg={24} md={24} sm={24} xs={24} style={{ display: "flex", justifyContent: "center" }}>
          <Calendar />
        </Col>

      </Row>
    </ScheduleInputContainer>
  );
};

export default withTranslation()(ScheduleForm);
