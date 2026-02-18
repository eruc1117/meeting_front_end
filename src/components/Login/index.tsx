import { withTranslation } from "react-i18next";
import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { LoginContainer, StyledRow, FormWrapper, Title, StyledInput, StyledButton, SwitchText, SwitchLink } from "./styles";
import { useHistory } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASEURL;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!isLogin && formData.password !== formData.passwordChk) {
      alert("密碼和確認密碼不同");
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
        alert(`錯誤：${data.message}`);
        return;
      }

      login(data.data.token, data.data.user);
      history.push("/home");

    } catch (err) {
      console.error("API 錯誤:", err);
      alert("伺服器錯誤，請稍後再試。");
    }
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", account: "", username: "", password: "", passwordChk: "" });
  };

  return (
    <LoginContainer>
      <StyledRow justify="center">
        <FormWrapper>
          <Title>{isLogin ? "登入" : "註冊"}</Title>

          {!isLogin && (
            <>
              <StyledInput
                placeholder="信箱"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
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
          />

          <StyledInput.Password
            placeholder="密碼"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          {!isLogin && (
            <StyledInput.Password
              placeholder="確認密碼"
              name="passwordChk"
              value={formData.passwordChk}
              onChange={handleChange}
            />
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
