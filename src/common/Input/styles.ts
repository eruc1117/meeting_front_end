import styled from "styled-components";

export const Container = styled("div")`
  display: inline-block;
  width: 100%;
  padding: 10px 5px;
`;

export const StyledInput = styled.input.attrs(props => ({
  type: props.type || "text", // 預設為 text
}))`
  font-size: 0.875rem;
`