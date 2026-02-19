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
  background: ${({ isSelected }) => (isSelected ? "#dff0fd" : "transparent")};
  transition: background 0.15s ease;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  &:hover {
    background: ${({ isCurrentMonth, isSelected }) =>
      isCurrentMonth ? (isSelected ? "#bde0fe" : "#f0f8ff") : "transparent"};
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
