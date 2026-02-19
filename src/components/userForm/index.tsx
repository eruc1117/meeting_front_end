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
  password: "",
  nickname: "",
  email: "",
};

const UserForm = ({ title, content, id, t }: ScheduleInputFormProps) => {
  const { values, errors, handleChange, handleSubmit, setValues } = useForm(userVal, initialValues) as UseFormReturn;
  const { createSchedule, updateSchedule, deleteSchedule, getSchedules } = useContext(UserContext);
  const { user } = useContext(AuthContext);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const ValidationType = ({ type }: ScheduleInputTypeProps) => {
    const ErrorMessage = errors[type as keyof typeof errors];
    return <Span>{ErrorMessage}</Span>;
  };

  const handleConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("確認密碼為必填欄位");
      return;
    }
    if (values.password !== confirmPassword) {
      setConfirmPasswordError("密碼與確認密碼不符");
      return;
    }
    setConfirmPasswordError("");
    setShowConfirmPassword(false);
    setConfirmPassword("");
  };

  const handleCancelPassword = () => {
    setShowConfirmPassword(false);
    setConfirmPassword("");
    setConfirmPasswordError("");
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
                    type="password"
                    name="password"
                    labName="密碼"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleChange}
                  />
                  <ValidationType type="password" />
                </Col>

                {showConfirmPassword && (
                  <Col xs={24} sm={12}>
                    <Input
                      type="password"
                      name="confirmPassword"
                      labName="確認密碼"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword((e.target as HTMLInputElement).value); setConfirmPasswordError(""); }}
                    />
                    {confirmPasswordError && <Span>{confirmPasswordError}</Span>}
                  </Col>
                )}

                <Col xs={24} sm={24}>
                  <ButtonContainer style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem" }}>
                    {showConfirmPassword ? (
                      <>
                        <Button type="button" onClick={handleConfirmPassword}>{t("確認")}</Button>
                        <Button type="button" onClick={handleCancelPassword}>{t("取消")}</Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setShowConfirmPassword(true)}>{t("修改密碼")}</Button>
                    )}
                  </ButtonContainer>
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="nickname"
                    labName="暱稱"
                    placeholder="Nickname"
                    value={values.nickname}
                    onChange={handleChange}
                  />
                  <ValidationType type="nickname" />
                </Col>

                <Col xs={24} sm={12}>
                  <Input
                    type="text"
                    name="email"
                    labName="信箱"
                    placeholder="Email"
                    value={values.email}
                    onChange={handleChange}
                  />
                  <ValidationType type="email" />
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
