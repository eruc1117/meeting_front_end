import React, { lazy, useState } from "react";
import ChatBlock from "../../components/Chat";
import ChatEnterBlock from "../../components/ChatEnter";

const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));

interface Group {
  id: number;
  name: string;
  created_at: string;
}

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  return (
    <Container>
      {selectedGroup ? (
        <ChatBlock
          group={selectedGroup}
          onLeave={() => setSelectedGroup(null)}
        />
      ) : (
        <ChatEnterBlock onEnterGroup={(group: Group) => setSelectedGroup(group)} />
      )}
    </Container>
  );
};

export default Chat;
