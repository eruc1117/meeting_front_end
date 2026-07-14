import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const CHAT_SERVER_URL = "http://localhost:4000";

export interface ChatMessage {
  id: number;
  groupId: number;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: string;
  system?: boolean;
}

export interface ChatGroupHandlers {
  onGroupUpdated?: (name: string) => void;
  onGroupDeleted?: () => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  connected: boolean;
  sendMessage: (content: string) => void;
}

const useChat = (
  groupId: number | null,
  token: string | null,
  handlers?: ChatGroupHandlers
): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastMessageIdRef = useRef<number | null>(null);
  // 系統訊息用遞減負數 id，避免與 DB 訊息 id 衝突
  const sysIdRef = useRef(0);

  // handlers 走 ref，避免呼叫端每次 render 產生新物件導致重連
  const handlersRef = useRef<ChatGroupHandlers | undefined>(handlers);
  handlersRef.current = handlers;

  // 載入歷史訊息
  const loadHistory = useCallback(async (gid: number, tok: string) => {
    try {
      const res = await fetch(
        `${CHAT_SERVER_URL}/api/chat/groups/${gid}/messages`,
        { headers: { Authorization: `Bearer ${tok}` } }
      );
      const json = await res.json();
      if (res.ok && json.data?.messages) {
        setMessages(json.data.messages);
        const last = json.data.messages[json.data.messages.length - 1];
        if (last) lastMessageIdRef.current = last.id;
      }
    } catch (err) {
      console.error("[useChat] loadHistory error", err);
    }
  }, []);

  useEffect(() => {
    if (!groupId || !token) return;

    loadHistory(groupId, token);

    const socket = io(CHAT_SERVER_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const appendSystemMessage = (content: string) => {
      sysIdRef.current -= 1;
      setMessages((prev) => [
        ...prev,
        {
          id: sysIdRef.current,
          groupId,
          senderId: 0,
          senderName: "",
          content,
          sentAt: new Date().toISOString(),
          system: true,
        },
      ]);
    };

    socket.on("connect", () => {
      setConnected(true);

      // 斷線重連後補發缺失訊息
      if (lastMessageIdRef.current) {
        socket.emit(
          "sync_messages",
          { groupId, lastMessageId: lastMessageIdRef.current },
          (res: { ok?: boolean; messages?: ChatMessage[] }) => {
            if (res?.ok && res.messages?.length) {
              setMessages((prev) => [...prev, ...(res.messages as ChatMessage[])]);
              const last = res.messages![res.messages!.length - 1];
              lastMessageIdRef.current = last.id;
            }
          }
        );
      }
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (msg: ChatMessage) => {
      if (msg.groupId !== groupId) return;
      setMessages((prev) => {
        // 避免重複（送出時 ack 已加入，廣播不重複）
        if (prev.some((m) => m.id === msg.id)) return prev;
        lastMessageIdRef.current = msg.id;
        return [...prev, msg];
      });
    });

    socket.on(
      "user_joined",
      ({ groupId: gid, username }: { groupId: number; userId: number; username: string }) => {
        if (gid !== groupId) return;
        appendSystemMessage(`${username} 加入了聊天室`);
      }
    );

    socket.on(
      "user_left",
      ({ groupId: gid, username }: { groupId: number; userId: number; username: string }) => {
        if (gid !== groupId) return;
        appendSystemMessage(`${username} 離開了聊天室`);
      }
    );

    socket.on(
      "group_updated",
      ({ groupId: gid, name }: { groupId: number; name: string }) => {
        if (gid !== groupId) return;
        appendSystemMessage(`聊天室已更名為「${name}」`);
        handlersRef.current?.onGroupUpdated?.(name);
      }
    );

    socket.on("group_deleted", ({ groupId: gid }: { groupId: number }) => {
      if (gid !== groupId) return;
      handlersRef.current?.onGroupDeleted?.();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setMessages([]);
      lastMessageIdRef.current = null;
    };
  }, [groupId, token, loadHistory]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !groupId || !content.trim()) return;
      socketRef.current.emit("send_group_message", { groupId, content: content.trim() });
    },
    [groupId]
  );

  return { messages, connected, sendMessage };
};

export default useChat;
