import { withTranslation } from "react-i18next";
import { Container, StyledInput } from "./styles";
import { Label } from "../TextArea/styles";
import { InputProps } from "../types";

const Input = ({labName ,name, type, placeholder, onChange, t }: InputProps) => (
  <Container>
    <Label htmlFor={name}>{t(labName)}</Label>
    <StyledInput
      placeholder={t(placeholder)}
      name={name}
      type={type}
      id={name}
      onChange={onChange}
    />
  </Container>
);

export default withTranslation()(Input);
