import { Row, Col } from "antd";
import { withTranslation } from "react-i18next";
import { Slide } from "react-awesome-reveal";
import { ScheduleInputFormProps, ScheduleInputTypeProps } from "./types";
import { useForm } from "../../common/utils/useForm";
import { scheduleVal } from "../../common/utils/validationRules";
import { scheduleValProps } from "../../common/types"
import { Button } from "../../common/Button";
import Block from "../Block";
import Input from "../../common/Input";
import {
  ScheduleInputContainer,
  FormGroup,
  Span,
  ButtonContainer,
  SelectContainer,
  SelectLabel,
  StyledSelect,
  SearchRow,
  SearchInput,
  SearchButton,
  AdvancedToggle,
  AdvancedPanel,
  AdvancedGrid,
  AdvancedField,
  AdvancedLabel,
  AdvancedInput,
  AutocompleteWrapper,
  AutocompleteDropdown,
  AutocompleteItem,
  ResultsList,
  ResultsHeader,
  ResultsClose,
  ResultItem,
  ResultTitle,
  ResultMeta,
} from "./styles";
import { useContext, useState, useEffect, useRef } from "react";
import { ScheduleContext } from "../../contexts/ScheduleContext";
import { AuthContext } from "../../contexts/AuthContext";
import Calendar from "../Calendar";

interface UseFormReturn {
  values: scheduleValProps;
  errors: scheduleValProps;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setValues: (values: scheduleValProps) => void;
}

const initialValues: scheduleValProps = {
  eventID: "",
  eventName: "",
  eventStartDate: "",
  eventStartTime: "",
  eventEndDate: "",
  eventEndTime: "",
  eventContent: "",
  eventPlace: "",
  eventPublic: "false",
  eventParticipants: "",
};

const BASE_URL = process.env.REACT_APP_BASEURL;

const pad = (n: number) => String(n).padStart(2, "0");
const formatResultTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface UserSuggestion { id: number; username: string; email: string; }

const ScheduleForm = ({ title, content, id, t }: ScheduleInputFormProps) => {
  const { values, errors, handleChange, handleSubmit, setValues } = useForm(scheduleVal, initialValues) as UseFormReturn;
  const { tableData, createSchedule, updateSchedule, deleteSchedule, getSchedules, attendSchedule, leaveSchedule } = useContext(ScheduleContext);
  const { user } = useContext(AuthContext);

  const ValidationType = ({ type }: ScheduleInputTypeProps) => {
    const ErrorMessage = errors[type as keyof typeof errors];
    return <Span>{ErrorMessage}</Span>;
  };

  const buildScheduleBody = () => ({
    title: values.eventName,
    description: values.eventContent || undefined,
    start_time: `${values.eventStartDate}T${values.eventStartTime}:00`,
    end_time: `${values.eventEndDate}T${values.eventEndTime}:00`,
    is_public: values.eventPublic === "true",
    location: values.eventPlace || undefined,
    participants: values.eventParticipants || undefined,
  });

  const handleCreateSchedule = async () => {
    try {
      const result = await createSchedule({ user_id: Number(user.id), ...buildScheduleBody() });
      setValues({ ...initialValues, eventID: String(result.data.id) });
    } catch (error) {
      console.error("Failed to create schedule:", error);
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      await updateSchedule(values.eventID, buildScheduleBody());
    } catch (error) {
      console.error("Failed to update schedule:", error);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await deleteSchedule(Number(values.eventID));
      setValues(initialValues);
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const handleAttendSchedule = async () => {
    try {
      await attendSchedule(Number(values.eventID));
    } catch (error) {
      console.error("Failed to attend schedule:", error);
    }
  };

  const handleLeaveSchedule = async () => {
    try {
      await leaveSchedule(Number(values.eventID));
    } catch (error) {
      console.error("Failed to leave schedule:", error);
    }
  };

  const [keyword, setKeyword] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advStartDate, setAdvStartDate] = useState("");
  const [advEndDate, setAdvEndDate] = useState("");
  const [advLocation, setAdvLocation] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [activeParticipants, setActiveParticipants] = useState("");
  const [snapshotResults, setSnapshotResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);
  const [jumpDate, setJumpDate] = useState("");

  // 參與人員 autocomplete
  const [participantInput, setParticipantInput] = useState("");
  const [participantSuggestions, setParticipantSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skipNextFetchRef = useRef(false);

  useEffect(() => {
    if (!participantInput.trim()) {
      setParticipantSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      if (skipNextFetchRef.current) {
        skipNextFetchRef.current = false;
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/users/search?q=${encodeURIComponent(participantInput)}`, {
          headers: { Authorization: `Bearer ${token}`, "X-Requested-With": "XMLHttpRequest" },
        });
        const data = await res.json();
        const users: UserSuggestion[] = data.data?.users ?? [];
        setParticipantSuggestions(users);
        setShowSuggestions(users.length > 0);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [participantInput]);

  const handleSelectParticipant = (u: UserSuggestion) => {
    skipNextFetchRef.current = true;
    setParticipantInput(u.username);
    setShowSuggestions(false);
  };

  const handleSearch = async () => {
    const startISO = advStartDate ? `${advStartDate}T00:00:00` : undefined;
    const endISO = advEndDate ? `${advEndDate}T23:59:59` : undefined;
    const currentKeyword = keyword;
    const currentLocation = advLocation;
    const currentParticipants = participantInput;
    try {
      const mapped: any[] = await getSchedules(user?.id, startISO, endISO) ?? [];
      const filtered = mapped.filter((event) => {
        if (currentKeyword && !event.title?.toLowerCase().includes(currentKeyword.toLowerCase())) return false;
        if (currentLocation && !event.location?.toLowerCase().includes(currentLocation.toLowerCase())) return false;
        if (currentParticipants && !event.participants?.toLowerCase().includes(currentParticipants.toLowerCase())) return false;
        return true;
      });
      setSnapshotResults(filtered);
    } catch {
      setSnapshotResults([]);
    }
    setActiveKeyword(currentKeyword);
    setActiveLocation(currentLocation);
    setActiveParticipants(currentParticipants);
    setShowResults(true);
    setResultsCollapsed(false);
  };

  const handleResultClick = (event: any) => {
    setJumpDate(`${event.startTime}__${Date.now()}`);
    setResultsCollapsed(true);
  };



  return (
    <ScheduleInputContainer id={id}>
      <Row justify="center" align="middle" style={{ flexDirection: "column" }}>
        <Col lg={12} md={11} sm={24} xs={24}>
          <Slide direction="left" triggerOnce>
            <Block title={title} content={content} />
          </Slide>
        </Col>

        <Col lg={24} md={24} sm={24} xs={24} style={{ display: "flex", justifyContent: "center" }}>
          <SearchRow>
            <SearchInput
              type="text"
              placeholder="搜尋活動主旨..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <AdvancedToggle onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? "收起" : "進階搜尋"}
            </AdvancedToggle>
            <SearchButton onClick={handleSearch}>搜尋</SearchButton>
          </SearchRow>
        </Col>

        {showAdvanced && (
          <Col lg={24} md={24} sm={24} xs={24} style={{ display: "flex", justifyContent: "center" }}>
            <AdvancedPanel>
              <AdvancedGrid>
                <AdvancedField>
                  <AdvancedLabel>開始時間（起）</AdvancedLabel>
                  <AdvancedInput
                    type="date"
                    value={advStartDate}
                    onChange={(e) => setAdvStartDate(e.target.value)}
                  />
                </AdvancedField>
                <AdvancedField>
                  <AdvancedLabel>開始時間（迄）</AdvancedLabel>
                  <AdvancedInput
                    type="date"
                    value={advEndDate}
                    onChange={(e) => setAdvEndDate(e.target.value)}
                  />
                </AdvancedField>
                <AdvancedField>
                  <AdvancedLabel>地點</AdvancedLabel>
                  <AdvancedInput
                    type="text"
                    placeholder="搜尋地點..."
                    value={advLocation}
                    onChange={(e) => setAdvLocation(e.target.value)}
                  />
                </AdvancedField>
                <AdvancedField>
                  <AdvancedLabel>參與人員</AdvancedLabel>
                  <AutocompleteWrapper>
                    <AdvancedInput
                      type="text"
                      placeholder="輸入名稱或信箱..."
                      value={participantInput}
                      onChange={(e) => setParticipantInput(e.target.value)}
                      onFocus={() => { if (participantSuggestions.length > 0) setShowSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    />
                    {showSuggestions && (
                      <AutocompleteDropdown>
                        {participantSuggestions.map((u) => (
                          <AutocompleteItem key={u.id} onMouseDown={() => handleSelectParticipant(u)}>
                            {u.username}<span>{u.email}</span>
                          </AutocompleteItem>
                        ))}
                      </AutocompleteDropdown>
                    )}
                  </AutocompleteWrapper>
                </AdvancedField>
              </AdvancedGrid>
            </AdvancedPanel>
          </Col>
        )}

        {showResults && (
          <Col lg={24} md={24} sm={24} xs={24} style={{ display: "flex", justifyContent: "center" }}>
            <ResultsList>
              <ResultsHeader>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setResultsCollapsed((v) => !v)}
                >
                  {resultsCollapsed ? "▶" : "▼"} 找到 {snapshotResults.length} 筆結果
                </span>
                <ResultsClose onClick={() => setShowResults(false)}>✕</ResultsClose>
              </ResultsHeader>
              {!resultsCollapsed && (
                snapshotResults.length === 0 ? (
                  <ResultItem style={{ cursor: "default" }}>
                    <ResultMeta>沒有符合條件的活動</ResultMeta>
                  </ResultItem>
                ) : (
                  snapshotResults.map((event: any, i: number) => (
                    <ResultItem key={i} onClick={() => handleResultClick(event)}>
                      <ResultTitle>{event.title}</ResultTitle>
                      <ResultMeta>
                        {formatResultTime(event.startTime)}
                        {event.location ? ` · ${event.location}` : ""}
                      </ResultMeta>
                    </ResultItem>
                  ))
                )
              )}
            </ResultsList>
          </Col>
        )}

        <Col lg={24} md={24} sm={24} xs={24} style={{ display: "flex", justifyContent: "center" }}>
          <Calendar
            filterKeyword={activeKeyword}
            filterLocation={activeLocation}
            filterParticipants={activeParticipants}
            jumpToDate={jumpDate}
          />
        </Col>

      </Row>
    </ScheduleInputContainer>
  );
};

export default withTranslation()(ScheduleForm);
