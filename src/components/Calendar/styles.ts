import styled from "styled-components";

export const CalendarWrapper = styled("div")`
  width: 80vw;
  margin: 1.5rem auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const CalendarHeader = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #000;
  color: #fff;
  padding: 0.75rem 1rem;
`;

export const MonthTitle = styled("span")`
  font-size: 1rem;
  font-weight: 700;
`;

export const NavButton = styled("button")`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;

  &:hover {
    color: rgb(255, 130, 92);
  }
`;

export const WeekRow = styled("div")`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
`;

export const WeekLabel = styled("div")`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  padding: 0.4rem 0;
  border: 1px solid #e0e0e0;
`;

export const DaysGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fff;
`;

export const DayCell = styled("div")<{ isToday: boolean; isCurrentMonth: boolean; isSelected: boolean }>`
  position: relative;
  border: 1px solid #e0e0e0;
  color: ${({ isCurrentMonth }) => (isCurrentMonth ? "#222" : "#ccc")};
  font-size: 0.875rem;
  cursor: ${({ isCurrentMonth }) => (isCurrentMonth ? "pointer" : "default")};
  background: ${({ isSelected }) => (isSelected ? "#fff7d9" : "transparent")};
  transition: background 0.15s ease;
  user-select: none;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  &:hover {
    background: ${({ isCurrentMonth, isSelected }) =>
      isCurrentMonth ? (isSelected ? "#fff7d9" : "#f8ddd8") : "transparent"};
  }

  span {
    position: absolute;
    top: 0.3em;
    left: 0.4em;

    ${({ isToday }) =>
      isToday &&
      `
      background: rgb(255, 130, 92);
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
  background: ${({ isPublic }) => (isPublic ? "#bfdfff" : "#bbf7c5")};
  color: #333;
  font-size: 0.6rem;
  padding: 1px 3px;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  cursor: pointer;

  &:hover {
    filter: brightness(0.92);
  }
`;

export const PopupOverlay = styled("div")`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const PopupCard = styled("div")`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  min-width: 320px;
  max-width: 420px;
  width: 90vw;
  overflow: hidden;
`;

export const PopupHeader = styled("div")<{ isPublic: boolean }>`
  background: ${({ isPublic }) => (isPublic ? "#bfdfff" : "#bbf7c5")};
  padding: 0.9rem 1.1rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PopupTitle = styled("span")`
  font-size: 1rem;
  font-weight: 700;
  color: #222;
`;

export const PopupClose = styled("button")`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #555;
  line-height: 1;
  padding: 0;

  &:hover {
    color: #000;
  }
`;

export const PopupBody = styled("div")`
  padding: 1rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

export const PopupRow = styled("div")`
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #333;
  align-items: flex-start;
`;

export const PopupLabel = styled("span")`
  color: #888;
  min-width: 4.5em;
  flex-shrink: 0;
`;

export const ContextMenu = styled("div")`
  position: fixed;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
  color: #222;

  &:hover {
    background: #f5f5f5;
  }
`;

export const ContextMenuDivider = styled("div")`
  height: 1px;
  background: #e0e0e0;
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
  color: #888;
`;

export const ModalInput = styled("input")`
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #000;
  }
`;

export const ModalSelect = styled("select")`
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;
  background: #fff;
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
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  border: 1px solid ${({ primary }) => (primary ? "#000" : "#e0e0e0")};
  background: ${({ primary }) => (primary ? "#000" : "#fff")};
  color: ${({ primary }) => (primary ? "#fff" : "#333")};

  &:hover {
    background: ${({ primary }) => (primary ? "rgb(255, 130, 92)" : "#f5f5f5")};
    border-color: ${({ primary }) => (primary ? "rgb(255, 130, 92)" : "#ccc")};
  }
`;
