import { useState, useContext, useEffect } from "react";
import { ScheduleContext } from "../../contexts/SechduleContext";
import { AuthContext } from "../../contexts/AuthContext";
import {
  CalendarWrapper,
  CalendarHeader,
  MonthTitle,
  NavButton,
  WeekRow,
  WeekLabel,
  DaysGrid,
  DayCell,
  EventsArea,
  EventBlock,
  PopupOverlay,
  PopupCard,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupBody,
  PopupRow,
  PopupLabel,
} from "./styles";

const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const toKey = (year: number, month: number, day: number) =>
  `${year}-${month}-${day}`;

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface EventData {
  title: string;
  isPublic: boolean;
  startTime: string;
  endTime: string;
  participants: string;
  location: string;
  content: string;
}

const Calendar = () => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [popupEvent, setPopupEvent] = useState<EventData | null>(null);
  const { tableData, getSchedules } = useContext(ScheduleContext);
  const { user } = useContext(AuthContext);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    if (!user?.id) return;
    const pad = (n: number) => String(n).padStart(2, "0");
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startISO = `${year}-${pad(month + 1)}-01T00:00:00`;
    const endISO = `${year}-${pad(month + 1)}-${pad(lastDay)}T23:59:59`;
    getSchedules(user.id, startISO, endISO).catch(() => {});
  }, [year, month, user?.id]);

  // Group events by date key
  const eventsByDate: Record<string, EventData[]> = {};
  if (tableData) {
    (tableData as any[]).forEach((event) => {
      if (event.startTime) {
        const date = new Date(event.startTime);
        if (!isNaN(date.getTime())) {
          const key = toKey(date.getFullYear(), date.getMonth(), date.getDate());
          if (!eventsByDate[key]) eventsByDate[key] = [];
          eventsByDate[key].push({
            title: event.title,
            isPublic: event.isPublic ?? false,
            startTime: event.startTime,
            endTime: event.endTime,
            participants: event.participants ?? "",
            location: event.location ?? "",
            content: event.content ?? "",
          });
        }
      }
    });
  }

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
    <>
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
          {cells.map((cell, idx) => {
            const dayKey = toKey(year, month, cell.day);
            const events = cell.isCurrentMonth ? (eventsByDate[dayKey] ?? []) : [];
            return (
              <DayCell
                key={idx}
                isToday={isToday(cell.day, cell.isCurrentMonth)}
                isCurrentMonth={cell.isCurrentMonth}
                isSelected={isSelected(cell.day, cell.isCurrentMonth)}
                onClick={() => toggleSelected(cell.day, cell.isCurrentMonth)}
              >
                <span>{cell.day}</span>
                {events.length > 0 && (
                  <EventsArea>
                    {events.map((evt, i) => (
                      <EventBlock
                        key={i}
                        isPublic={evt.isPublic}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupEvent(evt);
                        }}
                      >
                        {evt.title}
                      </EventBlock>
                    ))}
                  </EventsArea>
                )}
              </DayCell>
            );
          })}
        </DaysGrid>
      </CalendarWrapper>

      {popupEvent && (
        <PopupOverlay onClick={() => setPopupEvent(null)}>
          <PopupCard onClick={(e) => e.stopPropagation()}>
            <PopupHeader isPublic={popupEvent.isPublic}>
              <PopupTitle>{popupEvent.title}</PopupTitle>
              <PopupClose onClick={() => setPopupEvent(null)}>✕</PopupClose>
            </PopupHeader>
            <PopupBody>
              <PopupRow>
                <PopupLabel>時間</PopupLabel>
                <span>
                  {formatTime(popupEvent.startTime)}
                  {popupEvent.endTime ? ` ～ ${formatTime(popupEvent.endTime)}` : ""}
                </span>
              </PopupRow>
              {popupEvent.participants && (
                <PopupRow>
                  <PopupLabel>參與人員</PopupLabel>
                  <span>{popupEvent.participants}</span>
                </PopupRow>
              )}
              {popupEvent.location && (
                <PopupRow>
                  <PopupLabel>地點</PopupLabel>
                  <span>{popupEvent.location}</span>
                </PopupRow>
              )}
              {popupEvent.content && (
                <PopupRow>
                  <PopupLabel>內容</PopupLabel>
                  <span>{popupEvent.content}</span>
                </PopupRow>
              )}
            </PopupBody>
          </PopupCard>
        </PopupOverlay>
      )}
    </>
  );
};

export default Calendar;
