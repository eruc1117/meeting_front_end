import { withTranslation, TFunction } from "react-i18next";
import React, { useState } from "react";
import { LoginContainer, StyledRow, FormWrapper, Title, StyledInput, StyledButton, SwitchText, SwitchLink } from "./styles";


const LoginBlock = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    ID: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isLogin) {
      console.log("Login with:", formData.username, formData.password);
    } else {
      console.log("Register with:", formData);
    }
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
                placeholder="ID"
                name="ID"
                value={formData.ID}
                onChange={handleChange}
              />
            </>

          )}

          <StyledInput
            placeholder="帳號"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />

          <StyledInput.Password
            placeholder="密碼"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <StyledButton type="primary" onClick={handleSubmit}>
            {isLogin ? "登入" : "註冊"}
          </StyledButton>

          <SwitchText>
            {isLogin ? "沒有帳號？" : "已有帳號？"}{" "}
            <SwitchLink onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "註冊" : "登入"}
            </SwitchLink>
          </SwitchText>
        </FormWrapper>
      </StyledRow>
    </LoginContainer>
  );
};

export default withTranslation()(LoginBlock);
