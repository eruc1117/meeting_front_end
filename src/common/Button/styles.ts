import styled from "styled-components";

interface buttonColor {
  strColor?: string;
  bgColor?: string;
}


export const StyledButton = styled("button")<buttonColor>`
  background: ${(p) => p.bgColor || "#7c6af2"};
  color: ${(p) => (p.strColor ? "#e8e8ee" : "#fff")};
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 13px 0;
  cursor: pointer;
  margin-top: 0.625rem;
  max-width: 180px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 16px rgba(124, 106, 242, 0.25);

  &:hover,
  &:active,
  &:focus {
    color: #fff;
    border: 1px solid #ff8a65;
    background-color: #ff8a65;
    box-shadow: 0 4px 16px rgba(255, 138, 101, 0.25);
  }
`;
