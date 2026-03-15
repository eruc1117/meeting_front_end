import { withTranslation } from "react-i18next";
import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { LoginContainer, StyledRow, FormWrapper, Title, ErrorMsg, ErrorText, StyledInput, StyledButton, SwitchText, SwitchLink } from "./styles";
import { useHistory } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASEURL;

const ERROR_FIELD_MAP: Record<string, string> = {
  E001_USER_EXISTS: "account",
  E002_INVALID_EMAIL: "email",
  E009_PASSWORD_NOT_SAME: "passwordChk",
  E008_ACCOUNT_NOT_EXIST: "account",
  E003_INVALID_CREDENTIALS: "password",
};

const LoginBlock = () => {
  const history = useHistory();
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    account: "",
    username: "",
    password: "",
    passwordChk: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    setFieldErrors({});

    // 前端輸入驗證
    const newErrors: Record<string, string> = {};
    if (!formData.account.trim() || formData.account.length < 3 || formData.account.length > 50) {
      newErrors.account = "帳號長度需介於 3 至 50 字元";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "密碼至少需要 6 個字元";
    }
    if (!isLogin) {
      if (!formData.email.includes("@") || formData.email.trim().length < 5) {
        newErrors.email = "請輸入有效的信箱格式";
      }
      if (!formData.username.trim()) {
        newErrors.username = "請填寫使用者名稱";
      }
      if (formData.password !== formData.passwordChk) {
        newErrors.passwordChk = "密碼和確認密碼不同";
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    try {
      const url = isLogin
        ? `${BASE_URL}/api/auth/login`
        : `${BASE_URL}/api/auth/register`;

      const payload = isLogin
        ? {
            account: formData.account,
            password: formData.password,
          }
        : {
            email: formData.email,
            username: formData.username,
            account: formData.account,
            password: formData.password,
            passwordChk: formData.passwordChk,
          };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorCode = data.error?.code ?? "";
        const targetField = ERROR_FIELD_MAP[errorCode];
        if (targetField) {
          setFieldErrors({ [targetField]: data.message });
        } else {
          setErrorMsg(data.message);
        }
        return;
      }

      login(data.data.token, data.data.user);
      history.push("/schedule");

    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("API 錯誤:", err);
      setErrorMsg("伺服器錯誤，請稍後再試。");
    }
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", account: "", username: "", password: "", passwordChk: "" });
    setErrorMsg("");
    setFieldErrors({});
  };

  return (
    <LoginContainer>
      <StyledRow justify="center">
        <FormWrapper>
          <Title>{isLogin ? "登入" : "註冊"}</Title>
          <ErrorMsg>{errorMsg}</ErrorMsg>

          {!isLogin && (
            <>
              <StyledInput
                placeholder="信箱"
                name="email"
                value={formData.email}
                onChange={handleChange}
                status={fieldErrors.email ? "error" : ""}
              />
              <ErrorText>{fieldErrors.email}</ErrorText>

              <StyledInput
                placeholder="使用者名稱"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </>
          )}

          <StyledInput
            placeholder="帳號"
            name="account"
            value={formData.account}
            onChange={handleChange}
            status={fieldErrors.account ? "error" : ""}
          />
          <ErrorText>{fieldErrors.account}</ErrorText>

          <StyledInput.Password
            placeholder="密碼"
            name="password"
            value={formData.password}
            onChange={handleChange}
            status={fieldErrors.password ? "error" : ""}
          />
          <ErrorText>{fieldErrors.password}</ErrorText>

          {!isLogin && (
            <>
              <StyledInput.Password
                placeholder="確認密碼"
                name="passwordChk"
                value={formData.passwordChk}
                onChange={handleChange}
                status={fieldErrors.passwordChk ? "error" : ""}
              />
              <ErrorText>{fieldErrors.passwordChk}</ErrorText>
            </>
          )}

          <StyledButton type="primary" onClick={handleSubmit}>
            {isLogin ? "登入" : "註冊"}
          </StyledButton>

          <SwitchText>
            {isLogin ? "沒有帳號？" : "已有帳號？"}{" "}
            <SwitchLink onClick={handleSwitch}>
              {isLogin ? "註冊" : "登入"}
            </SwitchLink>
          </SwitchText>
        </FormWrapper>
      </StyledRow>
    </LoginContainer>
  );
};

export default withTranslation()(LoginBlock);
