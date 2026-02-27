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
  color: #999;
  display: flex;
  align-items: center;

  &:hover {
    color: #333;
  }
`;