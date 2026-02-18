import { Row, Col, Table } from "antd";
import { withTranslation } from "react-i18next";
import { Slide } from "react-awesome-reveal";
import { ScheduleInputFormProps, ScheduleInputTypeProps } from "./types";
import { useForm } from "../../common/utils/useForm";
import { userVal } from "../../common/utils/validationRules";
import { userValProps } from "../../common/types"
import { Button } from "../../common/Button";
import Block from "../Block";
import Input from "../../common/Input";
import { ScheduleInputContainer, FormGroup, Span, ButtonContainer } from "./styles";
import { useContext, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { AuthContext } from "../../contexts/AuthContext";

interface UseFormReturn {
  values: userValProps;
  errors: userValProps;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setValues: (values: userValProps) => void;
}

const initialValues: userValProps = {
  account: "",
  name: "",
  group: ""
};

const UserForm = ({ title, content, id, t }: ScheduleInputFormProps) => {
  const { values, errors, handleChange, handleSubmit, setValues } = useForm(userVal, initialValues) as UseFormReturn;
  const { createSchedule, updateSchedule, deleteSchedule, getSchedules } = useContext(UserContext);
  const { user } = useContext(AuthContext);

  const ValidationType = ({ type }: ScheduleInputTypeProps) => {
    const ErrorMessage = errors[type as keyof typeof errors];
    return <Span>{ErrorMessage}</Span>;
  };


  return (
    <ScheduleInputContainer id={id}>
      <Row justify="center" align="middle" style={{ flexDirection: "column" }}>
        <Col lg={12} md={11} sm={24} xs={24}>
          <Slide direction="left" triggerOnce>
            <Block title={title} content={content} />
          </Slide>
        </Col>

        <Col lg={12} md={12} sm={24} xs={24}>
          <Slide direction="right" triggerOnce>
            <FormGroup autoComplete="off" onSubmit={handleSubmit}>
              <Row gutter={[16, 16]} justify="center" align="middle">
                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="account"
                    labName="帳號"
                    placeholder="Account"
                    value={values.account}
                    onChange={handleChange}
                  />
                  <ValidationType type="account" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="name"
                    labName="名稱"
                    placeholder="Name"
                    value={values.name}
                    onChange={handleChange}
                  />
                  <ValidationType type="name" />
                </Col>
              </Row>
            </FormGroup>
          </Slide>
        </Col>

        <Col span={24}>
          <Row gutter={[16, 16]} justify="center" align="middle">
            <Col lg={24} md={24} sm={24} xs={24}>
              <ButtonContainer style={{ textAlign: "center" }}>
                <Button>{t("參與活動")}</Button>
              </ButtonContainer>
            </Col>
          </Row>
        </Col>

      </Row>
    </ScheduleInputContainer>
  );
};

export default withTranslation()(UserForm);
