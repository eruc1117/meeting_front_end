import { useState } from "react";
import { withTranslation } from "react-i18next";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Container, InputWrapper, StyledInput, ToggleButton, InputLabel } from "./styles";
import { InputProps } from "../types";

const Input = ({ labName, name, type, placeholder, value, onChange, t }: InputProps) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <Container>
      <InputLabel htmlFor={name}>{t(labName)}</InputLabel>
      <InputWrapper>
        <StyledInput
          placeholder={t(placeholder)}
          name={name}
          type={isPassword ? (visible ? "text" : "password") : type}
          id={name}
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <ToggleButton
            type="button"
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
          >
            {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </ToggleButton>
        )}
      </InputWrapper>
    </Container>
  );
};

export default withTranslation()(Input);
