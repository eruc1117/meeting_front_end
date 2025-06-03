import { Row, Col } from "antd";
import { withTranslation, TFunction } from "react-i18next";
import { SvgIcon } from "../../common/SvgIcon";
import Container from "../../common/Container";

import i18n from "i18next";
import {
  FooterSection,
  Title,
  NavLink,
  Extra,
  LogoContainer,
  Para,
  Large,
  Chat,
  Empty,
  FooterContainer,
  Language,
  Label,
  LanguageSwitch,
  LanguageSwitchContainer,
} from "./styles";

interface SocialLinkProps {
  href: string;
  src: string;
}

const Footer = ({ t }: { t: TFunction }) => {
  const handleChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const SocialLink = ({ href, src }: SocialLinkProps) => {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        key={src}
        aria-label={src}
      >
        <SvgIcon src={src} width="25px" height="25px" />
      </a>
    );
  };

  return (
    <>
      <FooterSection>
        <Container>
          <Row justify="space-between">
            <Col lg={10} md={10} sm={12} xs={12}>
              <Language>{t("警告")}</Language>
              <Large to="/">{t("目前網站開發中，請勿填寫個人資料")}</Large>
            </Col>
            <Col lg={8} md={8} sm={12} xs={12}>
              <Title>{t("建議")}</Title>
              <Large to="/">{t("業務內容好難")}</Large>
            </Col>
            <Col lg={6} md={6} sm={12} xs={12}>
              <Title>{t("思考 ing")}</Title>
              <Large to="/">{t("...........")}</Large>
            </Col>
          </Row>
        </Container>
      </FooterSection>
      <Extra>
        <Container border={true}>
          <Row
            justify="start"
            align="middle"
            style={{ paddingTop: "3rem" }}
          >
            <FooterContainer>
              <SocialLink
                href="https://github.com/eruc1117"
                src="github.svg"
              />
              <SocialLink
                href="https://www.linkedin.com/in/eruc1117/"
                src="linkedin.svg"
              />
              <Empty />
              <Empty />
              <Empty />
              <Empty />
              <Empty />
              <Empty />
              <Empty />
              <Empty />
            </FooterContainer>
          </Row>
        </Container>
      </Extra>
    </>
  );
};

export default withTranslation()(Footer);
