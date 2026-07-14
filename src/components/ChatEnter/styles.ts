import styled from "styled-components";

export const ChatContainer = styled("div")`
  width: 100%;
  max-width: 800px;
  margin: 3rem auto 24px;
  border: 1px solid #2e2e35;
  border-radius: 12px;
  padding: 2rem;
  background: #1a1a1f;

  @media only screen and (max-width: 1024px) {
    padding: 1rem;
    margin-top: 2rem;
  }
`;

export const FormGroup = styled("form")`
  width: 100%;
`;

export const ButtonContainer = styled("div")`
  text-align: end;
  position: relative;
`;
