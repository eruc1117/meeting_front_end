import styled from "styled-components";

export const Container = styled("div")`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 5px;
  gap: 1.25rem;
`;

export const InputLabel = styled("label")`
  white-space: nowrap;
  flex-shrink: 0;
  width: 5rem;
  text-align: right;
  text-transform: capitalize;
  color: #9898aa;
`;

export const InputWrapper = styled("div")`
  position: relative;
  flex: 1;
`;

export const StyledInput = styled.input.attrs(props => ({
  type: props.type || "text",
}))`
  font-size: 0.875rem;
  padding-right: 2rem;
  width: 100%;
  box-sizing: border-box;
  background: #1a1a1f;
  color: #e8e8ee;
  border: 1px solid #2e2e35;
  border-radius: 6px;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  transition: border-color 0.2s;

  &::placeholder {
    color: #55556a;
  }

  &:focus {
    border-color: #7c6af2;
    box-shadow: 0 0 0 2px rgba(124, 106, 242, 0.15);
  }
`;

export const ToggleButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #55556a;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #9898aa;
  }
`;
