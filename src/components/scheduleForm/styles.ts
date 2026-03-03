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

export const SearchRow = styled("div")`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 80vw;
  margin: 0 auto 1rem;
`;

export const SearchInput = styled("input")`
  flex: 1;
  height: 2.5rem;
  padding: 0 1rem;
  font-size: 0.9rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #000;
  }
`;

export const SearchButton = styled("button")`
  height: 2.5rem;
  padding: 0 1.5rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover {
    background: rgb(255, 130, 92);
  }
`;
