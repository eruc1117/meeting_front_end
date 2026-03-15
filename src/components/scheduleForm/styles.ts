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
  color: #9898aa;
`;

export const StyledSelect = styled("select")`
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  background: #242429;
  color: #e8e8ee;
  border: 1px solid #2e2e35;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #7c6af2;
  }

  option {
    background: #242429;
    color: #e8e8ee;
  }
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
  border: 1px solid #2e2e35;
  border-radius: 8px;
  outline: none;
  background: #1a1a1f;
  color: #e8e8ee;
  transition: border-color 0.2s;

  &::placeholder {
    color: #55556a;
  }

  &:focus {
    border-color: #7c6af2;
    box-shadow: 0 0 0 2px rgba(124, 106, 242, 0.15);
  }
`;

export const SearchButton = styled("button")`
  height: 2.5rem;
  padding: 0 1.5rem;
  background: #7c6af2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  font-weight: 500;

  &:hover {
    background: #9a8ef5;
  }
`;

export const AdvancedToggle = styled("button")`
  height: 2.5rem;
  padding: 0 1rem;
  background: transparent;
  color: #9898aa;
  border: 1px solid #2e2e35;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: #e8e8ee;
    border-color: #44444f;
  }
`;

export const AdvancedPanel = styled("div")`
  width: 80vw;
  margin: 0 auto 0.75rem;
  padding: 1rem 1.25rem;
  background: #1a1a1f;
  border: 1px solid #2e2e35;
  border-radius: 8px;
`;

export const AdvancedGrid = styled("div")`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.5rem;

  @media only screen and (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const AdvancedField = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

export const AdvancedLabel = styled("label")`
  font-size: 0.8rem;
  color: #9898aa;
`;

export const AdvancedInput = styled("input")`
  height: 2.25rem;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #2e2e35;
  border-radius: 6px;
  outline: none;
  background: #242429;
  color: #e8e8ee;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: #55556a;
  }

  &:focus {
    border-color: #7c6af2;
  }
`;

export const AutocompleteWrapper = styled("div")`
  position: relative;
  width: 100%;
`;

export const AutocompleteDropdown = styled("div")`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 200;
  background: #1a1a1f;
  border: 1px solid #2e2e35;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 180px;
  overflow-y: auto;
`;

export const AutocompleteItem = styled("div")`
  padding: 0.45rem 0.75rem;
  font-size: 0.875rem;
  color: #e8e8ee;
  cursor: pointer;

  &:hover {
    background: #242429;
  }

  span {
    color: #9898aa;
    font-size: 0.8rem;
    margin-left: 0.4rem;
  }
`;

export const ResultsList = styled("div")`
  width: 80vw;
  margin: 0 auto 1rem;
  background: #1a1a1f;
  border: 1px solid #2e2e35;
  border-radius: 8px;
  overflow: hidden;
`;

export const ResultsHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #242429;
  font-size: 0.825rem;
  color: #9898aa;
`;

export const ResultsClose = styled("button")`
  background: transparent;
  border: none;
  color: #9898aa;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;

  &:hover {
    color: #e8e8ee;
  }
`;

export const ResultItem = styled("div")`
  padding: 0.6rem 1rem;
  border-top: 1px solid #2e2e35;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  transition: background 0.15s;

  &:hover {
    background: #242429;
  }
`;

export const ResultTitle = styled("span")`
  font-size: 0.9rem;
  color: #e8e8ee;
`;

export const ResultMeta = styled("span")`
  font-size: 0.78rem;
  color: #9898aa;
`;
