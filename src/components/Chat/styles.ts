import styled, { keyframes, css } from "styled-components";

export const ChatContainer = styled("div")`
  width: 100%;
  max-width: 800px;
  height: min(72vh, 680px);
  margin: 3rem auto 0;
  border: 1px solid #2e2e35;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem 1.5rem;
  background: #1a1a1f;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);

  @media only screen and (max-width: 1024px) {
    height: min(78vh, 560px);
    padding: 1rem;
    margin-top: 2rem;
  }
`;

/* ── Header ─────────────────────────────────────────── */

export const Header = styled("div")`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #26262e;
`;

export const RoomInfo = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const RoomBadge = styled("span")`
  flex-shrink: 0;
  font-size: 12px;
  color: #7de8a0;
  background: rgba(125, 232, 160, 0.1);
  border: 1px solid rgba(125, 232, 160, 0.3);
  border-radius: 999px;
  padding: 1px 10px;
`;

export const RoomTitle = styled("span")`
  color: #e8e8f0;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HeaderActions = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

export const StatusPill = styled("span")<{ connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ connected }) => (connected ? "#7de8a0" : "#8a8aa0")};
  background: ${({ connected }) =>
    connected ? "rgba(125, 232, 160, 0.08)" : "rgba(138, 138, 160, 0.08)"};
  border: 1px solid
    ${({ connected }) =>
      connected ? "rgba(125, 232, 160, 0.25)" : "rgba(138, 138, 160, 0.25)"};
  border-radius: 999px;
  padding: 2px 10px;

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ connected }) => (connected ? "#7de8a0" : "#f0b45a")};
    ${({ connected }) =>
      !connected &&
      css`
        animation: ${pulse} 1.2s ease-in-out infinite;
      `}
  }
`;

/* ── Messages ───────────────────────────────────────── */

export const Messages = styled("div")`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  margin-bottom: 12px;
  padding: 1rem;
  background: #0f0f11;
  border-radius: 12px;
  border: 1px solid #222228;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #2e2e35;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #3a3a44;
  }
`;

export const EmptyState = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #55556a;
  margin-top: 15%;
  font-size: 14px;

  span:first-child {
    font-size: 32px;
  }
`;

export const DateDivider = styled("div")`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #55556a;
  font-size: 11px;
  margin: 14px 0 10px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #222228;
  }
`;

export const SystemMessage = styled("p")`
  text-align: center;
  margin: 8px auto;
  font-size: 12px;
  color: #55556a;

  span {
    background: rgba(85, 85, 106, 0.12);
    border-radius: 999px;
    padding: 2px 12px;
  }
`;

export const MessageRow = styled.div<{ isSelf: boolean }>`
  display: flex;
  flex-direction: ${({ isSelf }) => (isSelf ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
`;

export const Avatar = styled.span<{ hue: number }>`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #0f0f11;
  background: ${({ hue }) => `hsl(${hue}, 45%, 65%)`};
  user-select: none;
`;

export const MessageBody = styled.div<{ isSelf: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isSelf }) => (isSelf ? "flex-end" : "flex-start")};
  max-width: 76%;
`;

export const Sender = styled.span`
  font-size: 12px;
  color: #8a8aa0;
  margin: 0 4px 3px;
`;

export const BubbleLine = styled.div<{ isSelf: boolean }>`
  display: flex;
  flex-direction: ${({ isSelf }) => (isSelf ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: 6px;
`;

export const Bubble = styled.div<{ isSelf: boolean }>`
  background: ${({ isSelf }) => (isSelf ? "#1e2f1e" : "#1e1e2e")};
  color: ${({ isSelf }) => (isSelf ? "#a5eebc" : "#c8c8d8")};
  border: 1px solid ${({ isSelf }) => (isSelf ? "#235232" : "#2a2a40")};
  padding: 0.5rem 0.9rem;
  border-radius: ${({ isSelf }) =>
    isSelf ? "14px 14px 4px 14px" : "14px 14px 14px 4px"};
  word-break: break-word;
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.55;
`;

export const Time = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  color: #55556a;
  margin-bottom: 2px;
`;

/* ── Input ──────────────────────────────────────────── */

export const InputBar = styled("form")`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ChatInput = styled("input")`
  flex: 1;
  min-width: 0;
  background: #0f0f11;
  border: 1px solid #2e2e35;
  border-radius: 999px;
  color: #e8e8f0;
  font-size: 0.9rem;
  padding: 10px 18px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #55556a;
  }

  &:focus {
    border-color: #7de8a0;
    box-shadow: 0 0 0 3px rgba(125, 232, 160, 0.12);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CharCount = styled.span<{ warn: boolean }>`
  flex-shrink: 0;
  font-size: 11px;
  color: ${({ warn }) => (warn ? "#f0b45a" : "#55556a")};
`;
