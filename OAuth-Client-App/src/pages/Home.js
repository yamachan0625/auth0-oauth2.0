import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

const Home = () => {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();

  return (
    <div>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title as="h1" className="mb-4">
                OAuth2.0 Authorization Code Demo
              </Card.Title>
              
              {!isAuthenticated ? (
                <div>
                  <Card.Text className="mb-4">
                    このデモアプリケーションは、OAuth2.0のAuthorization Code Flowを使用して
                    Auth0で認証し、リソースサーバー（API）からユーザー情報を取得する仕組みを
                    示しています。
                  </Card.Text>
                  
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={() => loginWithRedirect()}
                    className="btn-auth0"
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    ログインして開始
                  </Button>
                  
                  <div className="mt-4">
                    <h5>機能紹介：</h5>
                    <Row className="mt-3">
                      <Col md={4}>
                        <Card className="h-100">
                          <Card.Body>
                            <i className="fas fa-user-circle fa-2x text-primary mb-3"></i>
                            <Card.Title>プロファイル表示</Card.Title>
                            <Card.Text>
                              Auth0から取得したユーザー情報を表示
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="h-100">
                          <Card.Body>
                            <i className="fas fa-key fa-2x text-success mb-3"></i>
                            <Card.Title>アクセストークン</Card.Title>
                            <Card.Text>
                              JWTアクセストークンの内容を確認
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="h-100">
                          <Card.Body>
                            <i className="fas fa-cogs fa-2x text-info mb-3"></i>
                            <Card.Title>API テスト</Card.Title>
                            <Card.Text>
                              リソースサーバーのAPIを呼び出し
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </div>
              ) : (
                <div>
                  <Card.Text className="mb-4">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    認証が完了しました！こんにちは、{user?.name || user?.email}さん
                  </Card.Text>
                  
                  <div className="d-grid gap-2 d-md-block">
                    <Button 
                      variant="outline-primary" 
                      href="/profile" 
                      className="me-2"
                    >
                      <i className="fas fa-user me-2"></i>
                      プロファイルを見る
                    </Button>
                    <Button 
                      variant="outline-success" 
                      href="/api-test"
                    >
                      <i className="fas fa-flask me-2"></i>
                      API をテストする
                    </Button>
                  </div>
                  
                  <Card className="mt-4 text-start">
                    <Card.Header>
                      <h6 className="mb-0">実装されている認証フロー</h6>
                    </Card.Header>
                    <Card.Body>
                      <ol className="mb-0">
                        <li>ユーザーがログインボタンをクリック</li>
                        <li>Auth0の認証エンドポイントにリダイレクト</li>
                        <li>ユーザーが認証情報を入力</li>
                        <li>認証成功後、認可コードと共にアプリにリダイレクト</li>
                        <li>認可コードをアクセストークンと交換</li>
                        <li>アクセストークンを使ってAPIリソースにアクセス</li>
                      </ol>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;