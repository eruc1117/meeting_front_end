import { StyledButton } from "./styles";
import { ButtonProps } from "../types";

export const Button = ({ bgColor, strColor, children, onClick }: ButtonProps) => (
  <StyledButton bgColor={bgColor} strColor={strColor} onClick={onClick}>
    {children}
  </StyledButton>
);
