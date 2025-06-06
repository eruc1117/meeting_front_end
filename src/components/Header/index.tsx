import { useState, useContext } from "react";
import { Row, Col, Drawer } from "antd";
import { withTranslation, TFunction } from "react-i18next";
import Container from "../../common/Container";
import { SvgIcon } from "../../common/SvgIcon";
import { Button } from "../../common/Button";
import {
  HeaderSection,
  LogoContainer,
  Burger,
  NotHidden,
  Menu,
  CustomNavLinkSmall,
  Label,
  Outline,
  Span,
} from "./styles";
import { AuthContext } from "../../contexts/AuthContext";


const Header = ({ t }: { t: TFunction }) => {
  const [visible, setVisibility] = useState(false);
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  const toggleButton = () => {
    setVisibility(!visible);
  };

  const MenuItem = () => {
    const scrollTo = (id: string) => {
      const element = document.getElementById(id) as HTMLDivElement;
      element.scrollIntoView({
        behavior: "smooth",
      });
      setVisibility(false);
    };
    return (
      <>
        <CustomNavLinkSmall as="a" href="/schedule" >
          <Span>{t("Sehedule")}</Span>
        </CustomNavLinkSmall>
        <CustomNavLinkSmall as="a" href="/chat">
          <Span>{t("Chat")}</Span>
        </CustomNavLinkSmall>
        <CustomNavLinkSmall
          style={{ width: "80px" }}
          as="a" href="/login"
        >
          <Span>
          {isLoggedIn ? (
          <CustomNavLinkSmall style={{ width: "80px" }} as="a" href="/">
            <Span>
              <Button onClick={logout}>{t("登出")}</Button>
            </Span>
          </CustomNavLinkSmall>
        ) : (
          <CustomNavLinkSmall style={{ width: "80px" }} as="a" href="/login">
            <Span>
              <Button>{t("登入")}</Button>
            </Span>
          </CustomNavLinkSmall>
        )}
          </Span>
        </CustomNavLinkSmall>
      </>
    );
  };

  return (
    <HeaderSection>
      <Container>
        <Row justify="space-between">
          <LogoContainer to="/" aria-label="homepage">
            <SvgIcon src="clock-seven.svg" width="101px" height="64px" />
          </LogoContainer>
          <NotHidden>
            <MenuItem />
          </NotHidden>
          <Burger onClick={toggleButton}>
            <Outline />
          </Burger>
        </Row>
        <Drawer closable={false} open={visible} onClose={toggleButton}>
          <Col style={{ marginBottom: "2.5rem" }}>
            <Label onClick={toggleButton}>
              <Col span={12}>
                <Menu>Menu</Menu>
              </Col>
              <Col span={12}>
                <Outline />
              </Col>
            </Label>
          </Col>
          <MenuItem />
        </Drawer>
      </Container>
    </HeaderSection>
  );
};

export default withTranslation()(Header);
