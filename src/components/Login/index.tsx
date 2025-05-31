import { withTranslation, TFunction } from "react-i18next";
import React, { useState, useContext  } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { LoginContainer, StyledRow, FormWrapper, Title, StyledInput, StyledButton, SwitchText, SwitchLink } from "./styles";
import { useHistory } from "react-router-dom";


const LoginBlock = () => {
  const history = useHistory();
  const { isLoggedIn, login, logout } = useContext(AuthContext);
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

  const handleSubmit = async () => {
    try {
      const url = isLogin ? "http://localhost:4000/api/auth/login" : "http://localhost:4000/api/auth/register";
      const payload = isLogin
        ? {
          account: formData.username,
          password: formData.password,
        }
        : {
          email: formData.email,
          username: formData.username,
          account: formData.ID,
          password: formData.password,
          passwordChk: formData.password, // 若你有確認欄位也可以做驗證
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
      
      history.push("/home"); // 你要跳轉的頁面，例如 / 或 /dashboard

      // 可選擇儲存 token 或導頁
      // localStorage.setItem("token", data.data.token);
      // navigate("/home");

    } catch (err) {
      console.error("API 錯誤:", err);
      alert("伺服器錯誤，請稍後再試。");
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
