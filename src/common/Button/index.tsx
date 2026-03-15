import { StyledButton } from "./styles";
import { ButtonProps } from "../types";

export const Button = ({ bgColor, strColor, type, children, onClick }: ButtonProps) => (
  <StyledButton bgColor={bgColor} strColor={strColor} type={type} onClick={onClick}>
    {children}
  </StyledButton>
);
