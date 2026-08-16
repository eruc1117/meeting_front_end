import React, { useState, useEffect, useContext } from "react";
import { withTranslation } from "react-i18next";
import { Row, Col, List, Spin, Popconfirm } from "antd";
import { Slide } from "react-awesome-reveal";
import {
  ChatContainer,
  FormGroup,
  ButtonContainer,
  WelcomeTitle,
  SectionLabel,
  GroupListWrapper,
  IdBadge,
  OwnerBadge,
  SearchTag,
  ActionLink,
  ErrorText,
  RenameInput,
} from "./styles";
import Input from "../../common/Input";
import { Button } from "../../common/Button";
import { AuthContext } from "../../contexts/AuthContext";

const CHAT_SERVER_URL = process.env.REACT_APP_CHAT_URL || "http://localhost:4000";

interface Group {
  id: number;
  name: string;
  owner_id?: number | null;
  created_at: string;
}

interface ChatEnterBlockProps {
  onEnterGroup: (group: Group) => void;
}

const ChatEnterBlock = ({ onEnterGroup }: ChatEnterBlockProps) => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const token = localStorage.getItem("token");

  const fetchGroups = async (): Promise<Group[]> => {
    if (!token) return [];
    try {
      const res = await fetch(`${CHAT_SERVER_URL}/api/chat/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setGroups(json.data.groups);
        return json.data.groups as Group[];
      }
    } catch {
      setError("無法載入群組列表");
    }
    return [];
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CHAT_SERVER_URL}/api/chat/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setNewGroupName("");
        await fetchGroups();
        onEnterGroup(json.data.group);
      } else {
        setError(json.message || "建立失敗");
      }
    } catch {
      setError("建立群組失敗");
    } finally {
      setLoading(false);
    }
  };

  const joinById = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CHAT_SERVER_URL}/api/chat/groups/${id}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setJoinGroupId("");
        setSearchResults([]);
        const updated = await fetchGroups();
        const joined = updated.find((g) => g.id === id);
        if (joined) onEnterGroup(joined);
      } else {
        setError(json.message || "加入失敗");
      }
    } catch {
      setError("加入群組失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const keyword = joinGroupId.trim();
    if (!keyword) return;

    // 純數字視為 ID，直接加入
    if (/^\d+$/.test(keyword)) {
      await joinById(parseInt(keyword));
      return;
    }

    // 其他文字視為名稱，搜尋群組
    setLoading(true);
    setError("");
    setSearchResults([]);
    try {
      const res = await fetch(
        `${CHAT_SERVER_URL}/api/chat/groups/search?name=${encodeURIComponent(keyword)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (res.ok) {
        const found: Group[] = json.data.groups;
        if (found.length === 0) {
          setError("找不到符合名稱的聊天室");
        } else if (found.length === 1) {
          await joinById(found[0].id);
        } else {
          setSearchResults(found);
        }
      } else {
        setError(json.message || "搜尋失敗");
      }
    } catch {
      setError("搜尋聊天室失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (groupId: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CHAT_SERVER_URL}/api/chat/groups/${groupId}/leave`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchGroups();
      } else {
        const json = await res.json();
        setError(json.message || "退出失敗");
      }
    } catch {
      setError("退出群組失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CHAT_SERVER_URL}/api/chat/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchGroups();
      } else {
        const json = await res.json();
        setError(json.message || "刪除失敗");
      }
    } catch {
      setError("刪除群組失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (groupId: number) => {
    if (!editName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CHAT_SERVER_URL}/api/chat/groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditingGroupId(null);
        setEditName("");
        await fetchGroups();
      } else {
        const json = await res.json();
        setError(json.message || "改名失敗");
      }
    } catch {
      setError("群組改名失敗");
    } finally {
      setLoading(false);
    }
  };

  type ListEntry = Group & { isSearchResult?: boolean };
  const listData: ListEntry[] = [
    ...searchResults
      .filter((r) => !groups.some((g) => g.id === r.id))
      .map((r) => ({ ...r, isSearchResult: true })),
    ...groups,
  ];

  return (
    <ChatContainer>
      <Row justify="center" style={{ width: "100%", flexDirection: "column", gap: "16px" }}>
        <Col span={24}>
          <Slide direction="right" triggerOnce>
            <WelcomeTitle>歡迎，{user?.username}！請選擇或建立聊天室</WelcomeTitle>

            {/* 我的群組列表 */}
            <SectionLabel>我的聊天室</SectionLabel>
            <Spin spinning={loading}>
              <GroupListWrapper>
                <List
                  dataSource={listData}
                  locale={{ emptyText: <span style={{ color: "#55556a" }}>尚無群組，請建立或加入</span> }}
                  renderItem={(group) => {
                    if (group.isSearchResult) {
                      return (
                        <List.Item
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            color: "#c8c8d8",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                          onClick={() => joinById(group.id)}
                        >
                          <span style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                            <IdBadge>#{group.id}</IdBadge>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {group.name}
                            </span>
                            <SearchTag>搜尋結果</SearchTag>
                          </span>
                          <ActionLink tone="accent">加入</ActionLink>
                        </List.Item>
                      );
                    }
                    const isOwner = group.owner_id != null && group.owner_id === user?.id;
                    const isEditing = editingGroupId === group.id;
                    return (
                      <List.Item
                        style={{
                          padding: "10px 16px",
                          cursor: "pointer",
                          color: "#c8c8d8",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                        onClick={() => onEnterGroup(group)}
                      >
                        {isEditing ? (
                          <span
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}
                          >
                            <RenameInput
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename(group.id);
                                if (e.key === "Escape") setEditingGroupId(null);
                              }}
                            />
                            <ActionLink tone="accent" onClick={() => handleRename(group.id)}>
                              確認
                            </ActionLink>
                            <ActionLink onClick={() => setEditingGroupId(null)}>取消</ActionLink>
                          </span>
                        ) : (
                          <>
                            <span style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                              <IdBadge>#{group.id}</IdBadge>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {group.name}
                              </span>
                              {isOwner && <OwnerBadge>建立者</OwnerBadge>}
                            </span>
                            <span
                              onClick={(e) => e.stopPropagation()}
                              style={{ flexShrink: 0 }}
                            >
                              {isOwner && (
                                <ActionLink
                                  onClick={() => {
                                    setEditingGroupId(group.id);
                                    setEditName(group.name);
                                  }}
                                >
                                  改名
                                </ActionLink>
                              )}
                              {isOwner && (
                                <Popconfirm
                                  title="確定刪除此聊天室？所有訊息將一併刪除"
                                  okText="刪除"
                                  cancelText="取消"
                                  onConfirm={() => handleDelete(group.id)}
                                >
                                  <ActionLink tone="danger">刪除</ActionLink>
                                </Popconfirm>
                              )}
                              <Popconfirm
                                title="確定退出此聊天室？"
                                okText="退出"
                                cancelText="取消"
                                onConfirm={() => handleLeave(group.id)}
                              >
                                <ActionLink>退出</ActionLink>
                              </Popconfirm>
                            </span>
                          </>
                        )}
                      </List.Item>
                    );
                  }}
                />
              </GroupListWrapper>
            </Spin>

            {/* 建立新群組 */}
            <FormGroup autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <Row gutter={[8, 8]}>
                <Col span={18}>
                  <Input
                    type="text"
                    name="newGroupName"
                    labName="建立新聊天室"
                    placeholder="輸入聊天室名稱"
                    value={newGroupName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewGroupName(e.target.value)
                    }
                  />
                </Col>
                <Col span={6} style={{ display: "flex", alignItems: "flex-end" }}>
                  <ButtonContainer style={{ textAlign: "center", width: "100%" }}>
                    <Button onClick={handleCreate}>建立</Button>
                  </ButtonContainer>
                </Col>
              </Row>

              {/* 加入群組 */}
              <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                <Col span={18}>
                  <Input
                    type="text"
                    name="joinGroupId"
                    labName="加入聊天室（ID 或名稱）"
                    placeholder="輸入聊天室 ID 或名稱"
                    value={joinGroupId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setJoinGroupId(e.target.value)
                    }
                  />
                </Col>
                <Col span={6} style={{ display: "flex", alignItems: "flex-end" }}>
                  <ButtonContainer style={{ textAlign: "center", width: "100%" }}>
                    <Button onClick={handleJoin}>加入</Button>
                  </ButtonContainer>
                </Col>
              </Row>

              {error && <ErrorText>{error}</ErrorText>}
            </FormGroup>
          </Slide>
        </Col>
      </Row>
    </ChatContainer>
  );
};

export default withTranslation()(ChatEnterBlock);
