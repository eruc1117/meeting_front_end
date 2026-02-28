import styled from "styled-components";
export { FormGroup, Span, ButtonContainer } from "../../common/styles";

export const ScheduleInputContainer = styled("div")`
  padding: 5rem 0;

  @media only screen and (max-width: 1024px) {
    padding: 3rem 0;
  }
`;

export const SelectContainer = styled("div")`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 5px;
  gap: 1.25rem;
`;

export const SelectLabel = styled("label")`
  white-space: nowrap;
  flex-shrink: 0;
  width: 5rem;
  text-align: right;
  text-transform: capitalize;
`;

export const StyledSelect = styled("select")`
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  padding: 2px 4px;
`;
