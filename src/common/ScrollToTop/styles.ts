import styled from "styled-components";

export const ScrollUpContainer = styled("div")<{
  show: boolean;
}>`
  padding: 10px;
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 10;
  cursor: pointer;
  background: #242429;
  border: 1px solid #2e2e35;
  text-align: center;
  align-items: center;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  visibility: ${(p) => (p.show ? "visible" : "hidden")};
  opacity: ${(p) => (p.show ? "1" : "0")};
  display: flex;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  &:hover,
  &:active,
  &:focus {
    background: #7c6af2;
    border-color: #7c6af2;
  }

  @media screen and (max-width: 1240px) {
    display: none;
  }
`;
