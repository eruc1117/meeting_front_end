import { Row, Input, Button  } from "antd";
import styled from "styled-components";

export const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f11;
`;

export const StyledRow = styled(Row)`
  width: 100%;
`;

export const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border: 1px solid #2e2e35;
  border-radius: 14px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  background: #1a1a1f;
  text-align: center;
`;

export const Title = styled.h2`
  margin-bottom: 8px;
  color: #e8e8ee;
  font-size: 1.75rem;
`;

export const ErrorMsg = styled.p`
  color: #ff8a65;
  font-size: 13px;
  margin-bottom: 16px;
  min-height: 20px;
`;

export const ErrorText = styled.span`
  display: block;
  color: #ff8a65;
  font-size: 12px;
  margin-top: -12px;
  margin-bottom: 8px;
  padding-left: 4px;
  min-height: 16px;
`;

export const StyledInput = styled(Input)`
  margin-bottom: 16px;
  background: #242429 !important;
  border: 1px solid #2e2e35 !important;
  border-radius: 8px !important;
  color: #e8e8ee !important;

  &:hover {
    border-color: #44444f !important;
  }

  &:focus,
  &.ant-input-focused {
    border-color: #7c6af2 !important;
    box-shadow: 0 0 0 2px rgba(124, 106, 242, 0.15) !important;
  }

  .ant-input {
    background: #242429 !important;
    color: #e8e8ee !important;
  }

  input {
    background: #242429 !important;
    color: #e8e8ee !important;
    &::placeholder {
      color: #55556a !important;
    }
  }
`;

export const StyledButton = styled(Button)`
  width: 100%;
  margin-top: 8px;
  background: #7c6af2 !important;
  border-color: #7c6af2 !important;
  border-radius: 8px !important;
  color: #fff !important;
  font-weight: 500;
  height: 40px;
  transition: all 0.2s ease;

  &:hover {
    background: #9a8ef5 !important;
    border-color: #9a8ef5 !important;
  }
`;

export const SwitchText = styled.p`
  margin-top: 16px;
  font-size: 14px;
  color: #9898aa;
`;

export const SwitchLink = styled.span`
  color: #9a8ef5;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: #b8b0f8;
  }
`;
