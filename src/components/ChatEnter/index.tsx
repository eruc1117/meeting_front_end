import { Row, Col, Table } from "antd";
import { withTranslation, TFunction } from "react-i18next";
import React, { useState } from "react";
import { Slide } from "react-awesome-reveal";
import { MetaData, ChatContainer, Messages, Message, FormGroup, ButtonContainer, Sender, Time, Bubble } from "./styles";
import Input from "../../common/Input";
import { Button } from "../../common/Button";
import Block from "../Block";

const messages = [
  { idx: 1, msg: "Hello!", sender: "Alice", time: "10:01", isSelf: false },
  { idx: 2, msg: "Hi there!", sender: "Me", time: "10:02", isSelf: true },
];



const ChatEnterBlock = () => {
  return (
    <ChatContainer>

      <Row justify="center" align="middle" style={{ flexDirection: "column" }}>
        <Col lg={24} md={24} sm={24} xs={24}>
          <Slide direction="right" triggerOnce>
            <FormGroup autoComplete="off">
              <Row gutter={[16, 16]} justify="center" align="middle">
                <Col lg={24} md={24} sm={24} xs={24}>
                  <Input
                    type="text"
                    name="username"
                    labName="使用者帳號"
                    placeholder="請輸入使用者帳號"
                    value={""}
                    onChange={function () { }}
                  />
                </Col>

                <Col lg={24} md={24} sm={24} xs={24}>
                  <ButtonContainer style={{ textAlign: "center" }}>
                    <Button>進入</Button>
                  </ButtonContainer>
                </Col>

              </Row>
            </FormGroup>
          </Slide>
        </Col>
      </Row>
    </ChatContainer >
  );
};


export default withTranslation()(ChatEnterBlock);
