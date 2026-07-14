import { StyledButton } from "./styles";
import { ButtonProps } from "../types";

export const Button = ({ bgColor, strColor, type, children, onClick, disabled, style }: ButtonProps) => (
  <StyledButton bgColor={bgColor} strColor={strColor} type={type || "button"} onClick={onClick} disabled={disabled} style={style}>
    {children}
  </StyledButton>
);
