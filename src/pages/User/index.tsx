import { lazy } from "react";
import { UserProvider } from "../../contexts/UserContext";
import ContactContent from "../../content/UserContent.json";


const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));
const UserForm = lazy(() => import("../../components/userForm"));





const User = () => {
  return (
    <Container>
      <ScrollToTop />
      <UserProvider>
        <UserForm
          title={ContactContent.title}
          content={ContactContent.text}
          id="contact" />
      </UserProvider>
    </Container>
  );
};

export default User;
