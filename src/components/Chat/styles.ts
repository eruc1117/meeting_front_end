import { Row } from "antd";
import styled from "styled-components";

export const ChatContainer = styled("div")`
  width: 100%;
  max-width: 600px;
  height: 600px;
  margin: 0 auto;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  align-items: center;
  justify-content: space-between;

  @media only screen and (max-width: 1024px) {
    height: 500px;
    padding: 1rem;
  }
`;


export const Messages = styled("div")`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 1rem;
  background: #f0f2f5;
  border-radius: 8px;
`;


export const Message = styled.div<{ isSelf: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isSelf }) => (isSelf ? "flex-end" : "flex-start")};
  margin-bottom: 12px;
`;

export const MetaData = styled.div<{ isSelf: boolean }>`
  display: flex;
  flex-direction: ${({ isSelf }) => (isSelf ? "row-reverse" : "row")};
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
`;

export const Sender = styled.span`
  margin: 0 6px;
`;

export const Time = styled.span`
  margin: 0 6px;
`;

export const Bubble = styled.div<{ isSelf: boolean }>`
  background: ${({ isSelf }) => (isSelf ? "#d9fdd3" : "#fffbe6")};
  padding: 0.5rem 1rem;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
  align-self: ${({ isSelf }) => (isSelf ? "flex-end" : "flex-start")};
`;




export const FormGroup = styled("form")`
  width: 100%;
  max-width: 520px;

  @media only screen and (max-width: 1045px) {
    max-width: 100%;
    margin-top: 2rem;
  }
`;

export const ButtonContainer = styled("div")`
  text-align: end;
  position: relative;

  @media only screen and (max-width: 414px) {
    padding-top: 0.75rem;
  }
`;
