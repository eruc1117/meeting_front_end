import { useState, useContext, useEffect } from "react";
import { ScheduleContext } from "../../contexts/ScheduleContext";
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
  ContextMenu,
  ContextMenuItem,
  ContextMenuDivider,
  ModalField,
  ModalLabel,
  ModalInput,
  ModalSelect,
  ModalRow,
  ModalActions,
  ModalBtn,
} from "./styles";

const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const pad = (n: number) => String(n).padStart(2, "0");

const toKey = (year: number, month: number, day: number) =>
  `${year}-${month}-${day}`;

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export interface EventData {
  Id: string;
  title: string;
  isPublic: boolean;
  startTime: string;
  endTime: string;
  participants: string;
  location: string;
  content: string;
}

interface CalendarProps {
  filterKeyword?: string;
  filterLocation?: string;
  filterParticipants?: string;
  jumpToDate?: string;
}

const initialAddForm = {
  title: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  description: "",
  location: "",
  participants: "",
  isPublic: "false",
};

const initialEditForm = {
  Id: "",
  title: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  description: "",
  location: "",
  participants: "",
  isPublic: "false",
};

type MenuState = {
  day: number;
  events: EventData[];
  x: number;
  y: number;
  width: number;
} | null;

const Calendar = ({ filterKeyword = "", filterLocation = "", filterParticipants = "", jumpToDate = "" }: CalendarProps) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [popupEvent, setPopupEvent] = useState<EventData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuState, setMenuState] = useState<MenuState>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [addForm, setAddForm] = useState(initialAddForm);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const { tableData, getSchedules, createSchedule, updateSchedule, deleteSchedule } = useContext(ScheduleContext);
  const { user } = useContext(AuthContext);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    if (!user?.id) return;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startISO = `${year}-${pad(month + 1)}-01T00:00:00`;
    const endISO = `${year}-${pad(month + 1)}-${pad(lastDay)}T23:59:59`;
    getSchedules(user.id, startISO, endISO).catch(() => {});
  }, [year, month, user?.id]);

  // 外部跳轉日期（搜尋結果點擊）
  useEffect(() => {
    if (!jumpToDate) return;
    const iso = jumpToDate.split("__")[0];
    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      setSelected(new Set([toKey(d.getFullYear(), d.getMonth(), d.getDate())]));
    }
  }, [jumpToDate]);

  // 點擊外部、滾動或按 Escape 關閉選單
  useEffect(() => {
    if (!menuState) return;
    const close = () => { setMenuState(null); };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("click", close);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("wheel", close, true);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("wheel", close, true);
    };
  }, [menuState]);

  // 依日期分組活動（套用搜尋 filter）
  const filteredData = (tableData as any[] ?? []).filter((event) => {
    if (filterKeyword && !event.title?.toLowerCase().includes(filterKeyword.toLowerCase())) return false;
    if (filterLocation && !event.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false;
    if (filterParticipants && !event.participants?.toLowerCase().includes(filterParticipants.toLowerCase())) return false;
    return true;
  });

  const eventsByDate: Record<string, EventData[]> = {};
  if (filteredData.length > 0) {
    filteredData.forEach((event) => {
      if (event.startTime) {
        const date = new Date(event.startTime);
        if (!isNaN(date.getTime())) {
          const key = toKey(date.getFullYear(), date.getMonth(), date.getDate());
          if (!eventsByDate[key]) eventsByDate[key] = [];
          eventsByDate[key].push({
            Id: event.Id ?? "",
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

  const handleDayDoubleClick = (e: React.MouseEvent, day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const key = toKey(year, month, day);
    const events = eventsByDate[key] ?? [];
    setSelected(new Set([key]));
    setMenuState({ day, events, x: e.clientX, y: e.clientY, width: rect.width });
  };

  const handleMenuNew = () => {
    if (!menuState) return;
    const dateStr = `${year}-${pad(month + 1)}-${pad(menuState.day)}`;
    setAddForm({ ...initialAddForm, startDate: dateStr, endDate: dateStr, participants: user?.username ?? "" });
    setAddFormOpen(true);
    setMenuState(null);
  };

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddConfirm = async () => {
    const title = addForm.title.trim();
    if (!title) { alert("活動名稱為必填"); return; }
    if (title.length > 100) { alert("活動名稱不得超過 100 字元"); return; }
    if (!addForm.startDate || !addForm.startTime) { alert("請填寫開始日期與時間"); return; }
    const endDate = addForm.endDate || addForm.startDate;
    const endTime = addForm.endTime || "23:59";
    try {
      await createSchedule({
        user_id: Number(user.id),
        title,
        description: addForm.description.trim() || undefined,
        start_time: `${addForm.startDate}T${addForm.startTime}:00`,
        end_time: `${endDate}T${endTime}:00`,
        is_public: addForm.isPublic === "true",
        location: addForm.location.trim() || undefined,
        participants: addForm.participants.trim() || undefined,
      });
      setAddFormOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to create schedule:", error);
    }
  };

  const handleOpenEdit = () => {
    if (!popupEvent) return;
    const parseDate = (iso: string) => iso?.split("T")[0] ?? "";
    const parseTime = (iso: string) => iso?.split("T")[1]?.slice(0, 5) ?? "";
    setEditForm({
      Id: popupEvent.Id,
      title: popupEvent.title,
      startDate: parseDate(popupEvent.startTime),
      startTime: parseTime(popupEvent.startTime),
      endDate: parseDate(popupEvent.endTime),
      endTime: parseTime(popupEvent.endTime),
      description: popupEvent.content,
      location: popupEvent.location,
      participants: popupEvent.participants,
      isPublic: popupEvent.isPublic ? "true" : "false",
    });
    setPopupEvent(null);
    setConfirmDelete(false);
    setEditFormOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditConfirm = async () => {
    const title = editForm.title.trim();
    if (!title) { alert("活動名稱為必填"); return; }
    if (title.length > 100) { alert("活動名稱不得超過 100 字元"); return; }
    if (!editForm.startDate || !editForm.startTime) { alert("請填寫開始日期與時間"); return; }
    if (!editForm.endDate || !editForm.endTime) { alert("請填寫結束日期與時間"); return; }
    try {
      await updateSchedule(editForm.Id, {
        title,
        description: editForm.description.trim() || undefined,
        start_time: `${editForm.startDate}T${editForm.startTime}:00`,
        end_time: `${editForm.endDate}T${editForm.endTime}:00`,
        is_public: editForm.isPublic === "true",
        location: editForm.location.trim() || undefined,
        participants: editForm.participants.trim() || undefined,
      });
      setEditFormOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to update schedule:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!popupEvent) return;
    try {
      await deleteSchedule(Number(popupEvent.Id));
      setPopupEvent(null);
      setConfirmDelete(false);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to delete schedule:", error);
    }
  };

  const closePopup = () => {
    setPopupEvent(null);
    setConfirmDelete(false);
  };

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
                onDoubleClick={(e) => handleDayDoubleClick(e, cell.day, cell.isCurrentMonth)}
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
                        onDoubleClick={(e) => e.stopPropagation()}
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
        <PopupOverlay onClick={closePopup}>
          <PopupCard onClick={(e) => e.stopPropagation()}>
            <PopupHeader isPublic={popupEvent.isPublic}>
              <PopupTitle>{popupEvent.title}</PopupTitle>
              <PopupClose onClick={closePopup}>✕</PopupClose>
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

              {confirmDelete ? (
                <>
                  <PopupRow style={{ marginTop: "0.5rem", color: "#c00", fontSize: "0.875rem" }}>
                    確定要刪除此活動嗎？
                  </PopupRow>
                  <ModalActions>
                    <ModalBtn onClick={() => setConfirmDelete(false)}>取消</ModalBtn>
                    <ModalBtn primary onClick={handleDeleteConfirm}>確定刪除</ModalBtn>
                  </ModalActions>
                </>
              ) : (
                <ModalActions>
                  <ModalBtn onClick={handleOpenEdit}>修改</ModalBtn>
                  <ModalBtn primary onClick={() => setConfirmDelete(true)}>刪除</ModalBtn>
                </ModalActions>
              )}
            </PopupBody>
          </PopupCard>
        </PopupOverlay>
      )}

      {menuState && (
        <ContextMenu
          style={{ top: menuState.y, left: menuState.x, width: menuState.width }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem onClick={handleMenuNew}>新增</ContextMenuItem>
        </ContextMenu>
      )}

      {addFormOpen && (
        <PopupOverlay onClick={() => setAddFormOpen(false)}>
          <PopupCard onClick={(e) => e.stopPropagation()}>
            <PopupHeader isPublic={false}>
              <PopupTitle>新增活動</PopupTitle>
              <PopupClose onClick={() => setAddFormOpen(false)}>✕</PopupClose>
            </PopupHeader>
            <PopupBody>
              <ModalField>
                <ModalLabel>活動名稱 *</ModalLabel>
                <ModalInput
                  name="title"
                  placeholder="活動名稱"
                  value={addForm.title}
                  onChange={handleAddFormChange}
                />
              </ModalField>

              <ModalRow>
                <ModalField>
                  <ModalLabel>開始日期 *</ModalLabel>
                  <ModalInput
                    type="date"
                    name="startDate"
                    value={addForm.startDate}
                    onChange={handleAddFormChange}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>開始時間 *</ModalLabel>
                  <ModalInput
                    type="time"
                    name="startTime"
                    value={addForm.startTime}
                    onChange={handleAddFormChange}
                  />
                </ModalField>
              </ModalRow>

              <ModalRow>
                <ModalField>
                  <ModalLabel>結束日期</ModalLabel>
                  <ModalInput
                    type="date"
                    name="endDate"
                    value={addForm.endDate}
                    onChange={handleAddFormChange}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>結束時間（未填預設 23:59）</ModalLabel>
                  <ModalInput
                    type="time"
                    name="endTime"
                    value={addForm.endTime}
                    onChange={handleAddFormChange}
                  />
                </ModalField>
              </ModalRow>

              <ModalField>
                <ModalLabel>活動內容</ModalLabel>
                <ModalInput
                  name="description"
                  placeholder="活動內容"
                  value={addForm.description}
                  onChange={handleAddFormChange}
                />
              </ModalField>

              <ModalField>
                <ModalLabel>活動地點</ModalLabel>
                <ModalInput
                  name="location"
                  placeholder="活動地點"
                  value={addForm.location}
                  onChange={handleAddFormChange}
                />
              </ModalField>

              <ModalField>
                <ModalLabel>參與人員</ModalLabel>
                <ModalInput
                  name="participants"
                  placeholder="小明、小美"
                  value={addForm.participants}
                  onChange={handleAddFormChange}
                />
              </ModalField>

              <ModalField>
                <ModalLabel>是否公開</ModalLabel>
                <ModalSelect
                  name="isPublic"
                  value={addForm.isPublic}
                  onChange={handleAddFormChange}
                >
                  <option value="false">不公開（個人）</option>
                  <option value="true">公開</option>
                </ModalSelect>
              </ModalField>

              <ModalActions>
                <ModalBtn onClick={() => setAddFormOpen(false)}>取消</ModalBtn>
                <ModalBtn primary onClick={handleAddConfirm}>確定</ModalBtn>
              </ModalActions>
            </PopupBody>
          </PopupCard>
        </PopupOverlay>
      )}

      {editFormOpen && (
        <PopupOverlay onClick={() => setEditFormOpen(false)}>
          <PopupCard onClick={(e) => e.stopPropagation()}>
            <PopupHeader isPublic={editForm.isPublic === "true"}>
              <PopupTitle>修改活動</PopupTitle>
              <PopupClose onClick={() => setEditFormOpen(false)}>✕</PopupClose>
            </PopupHeader>
            <PopupBody>
              <ModalField>
                <ModalLabel>活動名稱 *</ModalLabel>
                <ModalInput
                  name="title"
                  placeholder="活動名稱"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                />
              </ModalField>

              <ModalRow>
                <ModalField>
                  <ModalLabel>開始日期 *</ModalLabel>
                  <ModalInput
                    type="date"
                    name="startDate"
                    value={editForm.startDate}
                    onChange={handleEditFormChange}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>開始時間 *</ModalLabel>
                  <ModalInput
                    type="time"
                    name="startTime"
                    value={editForm.startTime}
                    onChange={handleEditFormChange}
                  />
                </ModalField>
              </ModalRow>

              <ModalRow>
                <ModalField>
                  <ModalLabel>結束日期 *</ModalLabel>
                  <ModalInput
                    type="date"
                    name="endDate"
                    value={editForm.endDate}
                    onChange={handleEditFormChange}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>結束時間 *</ModalLabel>
                  <ModalInput
                    type="time"
                    name="endTime"
                    value={editForm.endTime}
                    onChange={handleEditFormChange}
                  />
                </ModalField>
              </ModalRow>

              <ModalField>
                <ModalLabel>活動內容</ModalLabel>
                <ModalInput
                  name="description"
                  placeholder="活動內容"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                />
              </ModalField>

              <ModalField>
                <ModalLabel>活動地點</ModalLabel>
                <ModalInput
                  name="location"
                  placeholder="活動地點"
                  value={editForm.location}
                  onChange={handleEditFormChange}
                />
              </ModalField>

              <ModalField>
                <ModalLabel>參與人員</ModalLabel>
                <ModalInput
                  name="participants"
                  placeholder="小明、小美"
                  value={editForm.participants}
                  onChange={handleEditFormChange}
                />
              </ModalField>

              <ModalField>
                <ModalLabel>是否公開</ModalLabel>
                <ModalSelect
                  name="isPublic"
                  value={editForm.isPublic}
                  onChange={handleEditFormChange}
                >
                  <option value="false">不公開（個人）</option>
                  <option value="true">公開</option>
                </ModalSelect>
              </ModalField>

              <ModalActions>
                <ModalBtn onClick={() => setEditFormOpen(false)}>取消</ModalBtn>
                <ModalBtn primary onClick={handleEditConfirm}>確定</ModalBtn>
              </ModalActions>
            </PopupBody>
          </PopupCard>
        </PopupOverlay>
      )}
    </>
  );
};

export default Calendar;
