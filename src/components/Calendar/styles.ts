import styled from "styled-components";

export const CalendarWrapper = styled("div")`
  width: 80vw;
  margin: 1.5rem auto;
  border: 1px solid #2e2e35;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
`;

export const CalendarHeader = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1a1a1f;
  color: #e8e8ee;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #2e2e35;
`;

export const MonthTitle = styled("span")`
  font-size: 1rem;
  font-weight: 700;
  color: #e8e8ee;
`;

export const NavButton = styled("button")`
  background: none;
  border: none;
  color: #9898aa;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: #ff8a65;
  }
`;

export const WeekRow = styled("div")`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #1a1a1f;
`;

export const WeekLabel = styled("div")`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #55556a;
  padding: 0.4rem 0;
  border: 1px solid #222228;
`;

export const DaysGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #0f0f11;
`;

export const DayCell = styled("div")<{ isToday: boolean; isCurrentMonth: boolean; isSelected: boolean }>`
  position: relative;
  border: 1px solid #222228;
  color: ${({ isCurrentMonth }) => (isCurrentMonth ? "#c8c8d8" : "#3a3a4a")};
  font-size: 0.875rem;
  cursor: ${({ isCurrentMonth }) => (isCurrentMonth ? "pointer" : "default")};
  background: ${({ isSelected }) => (isSelected ? "#1e1a38" : "transparent")};
  transition: background 0.15s ease;
  user-select: none;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  &:hover {
    background: ${({ isCurrentMonth, isSelected }) =>
      isCurrentMonth ? (isSelected ? "#1e1a38" : "#1a1a1f") : "transparent"};
  }

  span {
    position: absolute;
    top: 0.3em;
    left: 0.4em;

    ${({ isToday }) =>
      isToday &&
      `
      background: #ff8a65;
      color: #fff;
      border-radius: 50%;
      width: 2em;
      height: 2em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    `}
  }
`;

export const EventsArea = styled("div")`
  position: absolute;
  top: 1.8em;
  left: 0;
  right: 0;
  bottom: 20%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 1px 2px;
`;

export const EventBlock = styled("div")<{ isPublic: boolean }>`
  background: ${({ isPublic }) => (isPublic ? "#1e3a5f" : "#1a3d2a")};
  color: ${({ isPublic }) => (isPublic ? "#7ec8f8" : "#7de8a0")};
  font-size: 0.6rem;
  padding: 1px 3px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  cursor: pointer;
  border-left: 2px solid ${({ isPublic }) => (isPublic ? "#4a9fd4" : "#4cc870")};

  &:hover {
    filter: brightness(1.2);
  }
`;

export const PopupOverlay = styled("div")`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const PopupCard = styled("div")`
  background: #1a1a1f;
  border: 1px solid #2e2e35;
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  min-width: 320px;
  max-width: 420px;
  width: 90vw;
  overflow: hidden;
`;

export const PopupHeader = styled("div")<{ isPublic: boolean }>`
  background: ${({ isPublic }) => (isPublic ? "#1e3a5f" : "#1a3d2a")};
  padding: 0.9rem 1.1rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ isPublic }) => (isPublic ? "#2a4f7a" : "#235232")};
`;

export const PopupTitle = styled("span")`
  font-size: 1rem;
  font-weight: 700;
  color: #e8e8ee;
`;

export const PopupClose = styled("button")`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #9898aa;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: #e8e8ee;
  }
`;

export const PopupBody = styled("div")`
  padding: 1rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  background: #1a1a1f;
`;

export const PopupRow = styled("div")`
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #c8c8d8;
  align-items: flex-start;
`;

export const PopupLabel = styled("span")`
  color: #55556a;
  min-width: 4.5em;
  flex-shrink: 0;
`;

export const ContextMenu = styled("div")`
  position: fixed;
  background: #1a1a1f;
  border: 1px solid #2e2e35;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 2000;
  overflow: hidden;
`;

export const ContextMenuItem = styled("button")`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  cursor: pointer;
  color: #c8c8d8;
  transition: background 0.15s;

  &:hover {
    background: #242429;
    color: #e8e8ee;
  }
`;

export const ContextMenuDivider = styled("div")`
  height: 1px;
  background: #2e2e35;
  margin: 2px 0;
`;

export const ModalField = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

export const ModalLabel = styled("label")`
  font-size: 0.75rem;
  color: #55556a;
`;

export const ModalInput = styled("input")`
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  border: 1px solid #2e2e35;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  background: #242429;
  color: #e8e8ee;
  transition: border-color 0.2s;

  ::placeholder {
    color: #55556a;
  }

  &:focus {
    border-color: #7c6af2;
    box-shadow: 0 0 0 2px rgba(124, 106, 242, 0.15);
  }
`;

export const ModalSelect = styled("select")`
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  border: 1px solid #2e2e35;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  background: #242429;
  color: #e8e8ee;
  transition: border-color 0.2s;

  &:focus {
    border-color: #7c6af2;
  }

  option {
    background: #242429;
    color: #e8e8ee;
  }
`;

export const ModalRow = styled("div")`
  display: flex;
  gap: 0.75rem;
`;

export const ModalActions = styled("div")`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const ModalBtn = styled("button")<{ primary?: boolean }>`
  padding: 0.4rem 1.2rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ primary }) => (primary ? "#7c6af2" : "#2e2e35")};
  background: ${({ primary }) => (primary ? "#7c6af2" : "#242429")};
  color: ${({ primary }) => (primary ? "#fff" : "#9898aa")};

  &:hover {
    background: ${({ primary }) => (primary ? "#9a8ef5" : "#2e2e35")};
    border-color: ${({ primary }) => (primary ? "#9a8ef5" : "#44444f")};
    color: #e8e8ee;
  }
`;
