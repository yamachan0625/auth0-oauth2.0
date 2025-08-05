import React, { useEffect } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth0 } from "@auth0/auth0-react";

const SignupComplete = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  useEffect(() => {
    // サインアップ直後でログイン状態の場合、自動ログアウト
    const justSignedUp = localStorage.getItem("auth0_just_signed_up");
    if (isAuthenticated && justSignedUp === "true") {
      localStorage.removeItem("auth0_just_signed_up");
      // ログアウト時のリダイレクトを/signup-completeに設定すると無限ループになる可能性があるため、
      // ホームページにリダイレクトして、その後プログラム的に/signup-completeに遷移
      logout({
        logoutParams: { returnTo: window.location.origin },
      });
    }
  }, [isAuthenticated, logout]);

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <Container className="mb-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={12}>
          <div className="profile-header-body">
            <Card>
              <CardBody className="text-center">
                <div className="mb-4">
                  <FontAwesomeIcon
                    icon="check-circle"
                    size="4x"
                    className="text-success"
                  />
                </div>
                <h2 className="mb-3">アカウント作成完了</h2>
                <p className="lead mb-4">
                  新しいアカウントが正常に作成されました。
                  <br />
                  下のボタンをクリックしてログインしてください。
                </p>
                <Button color="primary" size="lg" onClick={handleLogin}>
                  <FontAwesomeIcon icon="sign-in-alt" className="mr-2" />
                  ログイン
                </Button>
              </CardBody>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupComplete;
