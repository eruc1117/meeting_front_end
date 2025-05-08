import { Row, Input, Button  } from "antd";
import styled from "styled-components";

export const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledRow = styled(Row)`
  width: 100%;
`;

export const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: #fff;
  text-align: center;
`;

export const Title = styled.h2`
  margin-bottom: 24px;
`;

export const StyledInput = styled(Input)`
  margin-bottom: 16px;
`;

export const StyledButton = styled(Button)`
  width: 100%;
  margin-top: 8px;
`;

export const SwitchText = styled.p`
  margin-top: 16px;
  font-size: 14px;
`;

export const SwitchLink = styled.span`
  color: #1890ff;
  cursor: pointer;
  text-decoration: underline;
`;
