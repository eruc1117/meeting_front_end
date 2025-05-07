import { withTranslation, TFunction } from "react-i18next";
import React, { useState } from "react";
import { MetaData, ChatContainer, Messages, Message, FormGroup, ButtonContainer, Sender, Time, Bubble } from "./styles";
import Input from "../../common/Input";
import { Button } from "../../common/Button";

const messages = [
  { idx: 1, msg: "Hello!", sender: "Alice", time: "10:01", isSelf: false },
  { idx: 2, msg: "Hi there!", sender: "Me", time: "10:02", isSelf: true },
];



const ChatBlock = () => {
  return (
    <ChatContainer>
      <Messages>
        {messages.map((msg, idx) => (
          <Message key={idx} isSelf={msg.isSelf}>
            <MetaData isSelf={msg.isSelf}>
              <Sender>{msg.sender + " " + msg.time}</Sender>
            </MetaData>
            <Bubble isSelf={msg.isSelf}>{msg.msg}</Bubble>
          </Message>
        ))}


      </Messages>
      <FormGroup>
        <Input
          type="text"
          name=""
          placeholder=""
          value={""}
          onChange={function () {

          }}
        />
        <ButtonContainer style={{ textAlign: "center" }}>
          <Button name="submit">{("送出")}</Button>
        </ButtonContainer>
      </FormGroup>
    </ChatContainer>
  );
};


export default withTranslation()(ChatBlock);
