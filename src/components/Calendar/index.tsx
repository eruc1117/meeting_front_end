import { useState } from "react";
import {
  CalendarWrapper,
  CalendarHeader,
  MonthTitle,
  NavButton,
  WeekRow,
  WeekLabel,
  DaysGrid,
  DayCell,
} from "./styles";

const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const toKey = (year: number, month: number, day: number) =>
  `${year}-${month}-${day}`;

const Calendar = () => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false });
  }

  const isToday = (day: number, isCurrentMonth: boolean) =>
    isCurrentMonth &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const toggleSelected = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const key = toKey(year, month, day);
    setSelected((prev) => {
      const next = new Set<string>();
      if (!prev.has(key)) next.add(key);
      return next;
    });
  };

  const isSelected = (day: number, isCurrentMonth: boolean) =>
    isCurrentMonth && selected.has(toKey(year, month, day));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <CalendarWrapper>
      <CalendarHeader>
        <NavButton onClick={prevMonth}>&#8249;</NavButton>
        <MonthTitle>{year} 年 {month + 1} 月</MonthTitle>
        <NavButton onClick={nextMonth}>&#8250;</NavButton>
      </CalendarHeader>
      <WeekRow>
        {WEEK_LABELS.map((label) => (
          <WeekLabel key={label}>{label}</WeekLabel>
        ))}
      </WeekRow>
      <DaysGrid>
        {cells.map((cell, idx) => (
          <DayCell
            key={idx}
            isToday={isToday(cell.day, cell.isCurrentMonth)}
            isCurrentMonth={cell.isCurrentMonth}
            isSelected={isSelected(cell.day, cell.isCurrentMonth)}
            onClick={() => toggleSelected(cell.day, cell.isCurrentMonth)}
          >
            <span>{cell.day}</span>
          </DayCell>
        ))}
      </DaysGrid>
    </CalendarWrapper>
  );
};

export default Calendar;
