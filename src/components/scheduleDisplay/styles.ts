import styled from "styled-components";
export { Span, ButtonContainer } from "../../common/styles";

export const ScheduleDisplayContainer = styled("div")`
  margin-bottom: 1rem;
  @media only screen and (max-width: 1024px) {
    padding: 3rem 0;
  }
`;

export const FormGroup = styled("form")`
  width: 100%;
  max-width: 1024px;

  @media only screen and (max-width: 1045px) {
    max-width: 100%;
    margin-top: 2rem;
  }
`;
