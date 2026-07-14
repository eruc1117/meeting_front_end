import React, { useState, useEffect, useRef, useContext } from "react";
import { withTranslation } from "react-i18next";
import { message as antdMessage } from "antd";
import {
  ChatContainer,
  Messages,
  Message,
  MetaData,
  Sender,
  Bubble,
  FormGroup,
  ButtonContainer,
} from "./styles";
import Input from "../../common/Input";
import { Button } from "../../common/Button";
import { AuthContext } from "../../contexts/AuthContext";
import useChat from "../../common/utils/useChat";

interface Group {
  id: number;
  name: string;
}

interface ChatBlockProps {
  group: Group;
  onLeave: () => void;
}

const ChatBlock = ({ group, onLeave }: ChatBlockProps) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const [inputValue, setInputValue] = useState("");
  const [groupName, setGroupName] = useState(group.name);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, connected, sendMessage } = useChat(group.id, token, {
    onGroupUpdated: (name) => setGroupName(name),
    onGroupDeleted: () => {
      antdMessage.info("此聊天室已被建立者刪除");
      onLeave();
    },
  });

  // 自動捲動到最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
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

  return (
    <ChatContainer>
      {/* Header */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ color: "#7de8a0", fontWeight: 600 }}>
          #{group.id} {groupName}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#7de8a0" : "#ff6b6b",
              display: "inline-block",
            }}
          />
          <span style={{ color: "#55556a", fontSize: 12 }}>
            {connected ? "已連線" : "連線中..."}
          </span>
          <Button onClick={onLeave} style={{ padding: "2px 10px", fontSize: 12 }}>
            離開
          </Button>
        </div>
      </div>

      {/* Messages */}
      <Messages>
        {messages.length === 0 && (
          <p style={{ color: "#55556a", textAlign: "center", marginTop: 40 }}>
            尚無訊息，開始聊天吧！
          </p>
        )}
        {messages.map((msg) => {
          if (msg.system) {
            return (
              <p
                key={msg.id}
                style={{
                  color: "#55556a",
                  textAlign: "center",
                  fontSize: 12,
                  margin: "8px 0",
                }}
              >
                {msg.content}
              </p>
            );
          }
          const isSelf = msg.senderId === user?.id;
          return (
            <Message key={msg.id} isSelf={isSelf}>
              <MetaData isSelf={isSelf}>
                <Sender>
                  {msg.senderName} {formatTime(msg.sentAt)}
                </Sender>
              </MetaData>
              <Bubble isSelf={isSelf}>{msg.content}</Bubble>
            </Message>
          );
        })}
        <div ref={messagesEndRef} />
      </Messages>

      {/* Input */}
      <FormGroup onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <Input
          type="text"
          labName=""
          name="message"
          placeholder="輸入訊息… (Enter 送出)"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
        <ButtonContainer style={{ textAlign: "center" }}>
          <Button name="submit" disabled={!connected || !inputValue.trim()} onClick={handleSend}>
            送出
          </Button>
        </ButtonContainer>
      </FormGroup>
    </ChatContainer>
  );
};

export default withTranslation()(ChatBlock);
