import styled from "styled-components";

export const ChatContainer = styled("div")`
  width: 100%;
  max-width: 800px;
  margin: 3rem auto 24px;
  border: 1px solid #2e2e35;
  border-radius: 16px;
  padding: 2rem;
  background: #1a1a1f;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);

  @media only screen and (max-width: 1024px) {
    padding: 1rem;
    margin-top: 2rem;
  }
`;

export const FormGroup = styled("form")`
  width: 100%;
`;

export const ButtonContainer = styled("div")`
  text-align: end;
  position: relative;
`;

export const WelcomeTitle = styled("p")`
  color: #e8e8f0;
  font-size: 16px;
  margin-bottom: 16px;

  strong {
    color: #7de8a0;
    font-weight: 600;
  }
`;

export const SectionLabel = styled("p")`
  color: #8a8aa0;
  font-size: 13px;
  margin: 0 0 6px 2px;
  letter-spacing: 0.5px;
`;

/** 包住 antd List，補上捲軸樣式與項目 hover 效果 */
export const GroupListWrapper = styled("div")`
  margin-bottom: 20px;

  .ant-list {
    background: #0f0f11;
    border-radius: 10px;
    border: 1px solid #222228;
    max-height: 220px;
    overflow-y: auto;
  }

  .ant-list::-webkit-scrollbar {
    width: 6px;
  }
  .ant-list::-webkit-scrollbar-thumb {
    background: #2e2e35;
    border-radius: 3px;
  }

  .ant-list-item {
    transition: background 0.15s ease;
  }
  .ant-list-item:hover {
    background: rgba(125, 232, 160, 0.05);
  }
`;

export const IdBadge = styled("span")`
  flex-shrink: 0;
  font-size: 12px;
  color: #7de8a0;
  background: rgba(125, 232, 160, 0.1);
  border: 1px solid rgba(125, 232, 160, 0.3);
  border-radius: 999px;
  padding: 0 8px;
  margin-right: 8px;
`;

export const OwnerBadge = styled("span")`
  flex-shrink: 0;
  font-size: 11px;
  color: #f0b45a;
  background: rgba(240, 180, 90, 0.1);
  border: 1px solid rgba(240, 180, 90, 0.3);
  border-radius: 999px;
  padding: 0 8px;
  margin-left: 8px;
`;

export const SearchTag = styled("span")`
  font-size: 11px;
  color: #55556a;
  margin-left: 8px;
`;

export const ActionLink = styled("span")<{ tone?: "accent" | "danger" | "muted" }>`
  color: ${({ tone }) =>
    tone === "accent" ? "#7de8a0" : tone === "danger" ? "#ff6b6b" : "#8a8aa0"};
  font-size: 12px;
  cursor: pointer;
  margin-left: 12px;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.75;
    text-decoration: underline;
  }
`;

export const ErrorText = styled("p")`
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 6px;
`;

export const RenameInput = styled("input")`
  flex: 1;
  min-width: 0;
  background: #0f0f11;
  border: 1px solid #7de8a0;
  border-radius: 6px;
  color: #e8e8f0;
  padding: 3px 10px;
  outline: none;
  box-shadow: 0 0 0 3px rgba(125, 232, 160, 0.1);
`;
