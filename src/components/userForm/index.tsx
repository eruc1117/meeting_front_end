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

const BASE_URL = process.env.REACT_APP_BASEURL;

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
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiMessage, setApiMessage] = useState("");

  const ValidationType = ({ type }: ScheduleInputTypeProps) => {
    const ErrorMessage = errors[type as keyof typeof errors];
    return <Span>{ErrorMessage}</Span>;
  };

  const handleConfirmPassword = async () => {
    let hasError = false;

    if (!newPassword) {
      setNewPasswordError("新密碼為必填欄位");
      hasError = true;
    } else {
      setNewPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("確認密碼為必填欄位");
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("密碼與確認密碼不符");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    if (hasError) return;

    try {
      const res = await fetch(`${BASE_URL}/api/auth/updatePassword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: values.account,
          oirPassword: values.password,
          newPassword: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiMessage(data.message || "更新失敗，請稍後再試。");
        return;
      }

      setApiMessage("更新成功");
      setShowPasswordFields(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setApiMessage("伺服器錯誤，請稍後再試。");
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordFields(false);
    setNewPassword("");
    setNewPasswordError("");
    setConfirmPassword("");
    setConfirmPasswordError("");
    setApiMessage("");
  };


  return (
    <ScheduleInputContainer id={id}>
      <Row justify="center" align="middle" style={{ flexDirection: "column" }}>
        <Col xs={24} style={{ width: "80%", margin: "0 auto" }}>
          <Slide direction="left" triggerOnce>
            <Block title={title} content={content} />
          </Slide>
        </Col>

        <Col xs={24} style={{ width: "80%", margin: "0 auto", marginTop: "2rem" }}>
          <Slide direction="right" triggerOnce>
            <FormGroup autoComplete="off" onSubmit={handleSubmit}>
              <Row gutter={[16, 16]} justify="start">
                <Col xs={24}>
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

                <Col xs={24}>
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

                <Col xs={24}>
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

                {showPasswordFields && (
                  <>
                    <Col xs={24}>
                      <Input
                        type="password"
                        name="password"
                        labName="舊密碼"
                        placeholder="Old Password"
                        value={values.password}
                        onChange={handleChange}
                      />
                      <ValidationType type="password" />
                    </Col>

                    <Col xs={24}>
                      <Input
                        type="password"
                        name="newPassword"
                        labName="新密碼"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword((e.target as HTMLInputElement).value); setNewPasswordError(""); }}
                      />
                      {newPasswordError && <Span>{newPasswordError}</Span>}
                    </Col>

                    <Col xs={24}>
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
                  </>
                )}

                <Col xs={24} sm={24}>
                  <ButtonContainer style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem" }}>
                    {showPasswordFields ? (
                      <>
                        <Button type="button" onClick={handleConfirmPassword}>{t("確認")}</Button>
                        <Button type="button" onClick={handleCancelPassword}>{t("取消")}</Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setShowPasswordFields(true)}>{t("修改密碼")}</Button>
                    )}
                  </ButtonContainer>
                  {apiMessage && <Span style={{ display: "block", textAlign: "center", marginTop: "0.5rem" }}>{apiMessage}</Span>}
                </Col>

              </Row>
            </FormGroup>
          </Slide>
        </Col>

      </Row>
    </ScheduleInputContainer>
  );
};

export default withTranslation()(UserForm);
