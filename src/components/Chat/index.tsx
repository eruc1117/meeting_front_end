import React, { useState, useEffect, useRef, useContext } from "react";
import { withTranslation } from "react-i18next";
import { message as antdMessage } from "antd";
import {
  ChatContainer,
  Header,
  RoomInfo,
  RoomBadge,
  RoomTitle,
  HeaderActions,
  StatusPill,
  Messages,
  EmptyState,
  DateDivider,
  SystemMessage,
  MessageRow,
  Avatar,
  MessageBody,
  Sender,
  BubbleLine,
  Bubble,
  Time,
  InputBar,
  ChatInput,
  CharCount,
} from "./styles";
import { Button } from "../../common/Button";
import { AuthContext } from "../../contexts/AuthContext";
import useChat, { ChatMessage } from "../../common/utils/useChat";

const MAX_MESSAGE_LENGTH = 2000; // 與 chatServer 限制一致

const SEND_ERROR_MESSAGES: Record<string, string> = {
  MESSAGE_TOO_LONG: `訊息過長（上限 ${MAX_MESSAGE_LENGTH} 字）`,
  E429_RATE_LIMIT: "發送太快了，請稍後再試",
  E005_FORBIDDEN: "你不在此聊天室中",
  INVALID_PAYLOAD: "訊息格式不正確",
};

interface Group {
  id: number;
  name: string;
}

interface ChatBlockProps {
  group: Group;
  onLeave: () => void;
}

/** 依 senderId 產生穩定的頭像色相 */
const hueFromId = (id: number) => (id * 137) % 360;

/** 日期分隔標籤：今天 / 昨天 / 完整日期 */
const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "今天";
  if (d.toDateString() === yesterday.toDateString()) return "昨天";
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ChatBlock = ({ group, onLeave }: ChatBlockProps) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const [inputValue, setInputValue] = useState("");
  const [groupName, setGroupName] = useState(group.name);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const { messages, connected, sendMessage } = useChat(group.id, token, {
    onGroupUpdated: (name) => setGroupName(name),
    onGroupDeleted: () => {
      antdMessage.info("此聊天室已被建立者刪除");
      onLeave();
    },
  });

  // 自動捲動到最新訊息（初次載入直接跳到底，不做動畫）
  useEffect(() => {
    const isInitialLoad = prevCountRef.current === 0 && messages.length > 0;
    prevCountRef.current = messages.length;
    messagesEndRef.current?.scrollIntoView({
      behavior: isInitialLoad ? "auto" : "smooth",
    });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !connected) return;
    sendMessage(inputValue, (code) => {
      antdMessage.warning(SEND_ERROR_MESSAGES[code] || "訊息發送失敗，請再試一次");
    });
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (sentAt: string) => {
    try {
      return new Date(sentAt).toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  /** 前一則非系統訊息（判斷是否需要日期分隔與重複頭像） */
  const prevVisible = (index: number): ChatMessage | null => {
    for (let i = index - 1; i >= 0; i--) {
      if (!messages[i].system) return messages[i];
    }
    return null;
  };

  const remaining = MAX_MESSAGE_LENGTH - inputValue.length;

  return (
    <ChatContainer>
      <Header>
        <RoomInfo>
          <RoomBadge>#{group.id}</RoomBadge>
          <RoomTitle title={groupName}>{groupName}</RoomTitle>
        </RoomInfo>
        <HeaderActions>
          <StatusPill connected={connected}>
            {connected ? "已連線" : "連線中…"}
          </StatusPill>
          <Button onClick={onLeave} style={{ padding: "2px 12px", fontSize: 12 }}>
            離開
          </Button>
        </HeaderActions>
      </Header>

      <Messages>
        {messages.length === 0 && (
          <EmptyState>
            <span>💬</span>
            <span>尚無訊息，開始聊天吧！</span>
          </EmptyState>
        )}
        {messages.map((msg, index) => {
          if (msg.system) {
            return (
              <SystemMessage key={msg.id}>
                <span>{msg.content}</span>
              </SystemMessage>
            );
          }

          const prev = prevVisible(index);
          const showDate =
            !prev ||
            new Date(prev.sentAt).toDateString() !==
              new Date(msg.sentAt).toDateString();
          const isSelf = msg.senderId === user?.id;
          // 同一人連續發言時，後續訊息不重複顯示名稱
          const showSender =
            !isSelf && (showDate || !prev || prev.senderId !== msg.senderId);

          return (
            <React.Fragment key={msg.id}>
              {showDate && <DateDivider>{formatDateLabel(msg.sentAt)}</DateDivider>}
              <MessageRow isSelf={isSelf}>
                {!isSelf && (
                  <Avatar hue={hueFromId(msg.senderId)} title={msg.senderName}>
                    {(msg.senderName || "?").charAt(0).toUpperCase()}
                  </Avatar>
                )}
                <MessageBody isSelf={isSelf}>
                  {showSender && <Sender>{msg.senderName}</Sender>}
                  <BubbleLine isSelf={isSelf}>
                    <Bubble isSelf={isSelf}>{msg.content}</Bubble>
                    <Time>{formatTime(msg.sentAt)}</Time>
                  </BubbleLine>
                </MessageBody>
              </MessageRow>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </Messages>

      <InputBar
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <ChatInput
          type="text"
          name="message"
          autoComplete="off"
          placeholder={connected ? "輸入訊息…（Enter 送出）" : "連線中，請稍候…"}
          value={inputValue}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={!connected}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
        {remaining <= 200 && (
          <CharCount warn={remaining <= 50}>{remaining}</CharCount>
        )}
        <Button
          name="submit"
          disabled={!connected || !inputValue.trim()}
          onClick={handleSend}
        >
          送出
        </Button>
      </InputBar>
    </ChatContainer>
  );
};

export default withTranslation()(ChatBlock);
