import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

const Navigation = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>OAuth2.0 Client Demo</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>ホーム</Nav.Link>
            </LinkContainer>
            {isAuthenticated && (
              <>
                <LinkContainer to="/profile">
                  <Nav.Link>プロファイル</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/api-test">
                  <Nav.Link>API テスト</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
          <Nav>
            {!isAuthenticated ? (
              <Button 
                variant="outline-light" 
                onClick={() => loginWithRedirect()}
              >
                ログイン
              </Button>
            ) : (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">
                  こんにちは、{user?.name || user?.email}さん
                </span>
                <Button
                  variant="outline-light"
                  onClick={() =>
                    logout({ 
                      logoutParams: { returnTo: window.location.origin } 
                    })
                  }
                >
                  ログアウト
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;