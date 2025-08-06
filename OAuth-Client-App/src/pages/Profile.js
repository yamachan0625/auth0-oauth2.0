import React, { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Button, Tab, Tabs } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../components/Loading";

const Profile = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState(null);
  const [tokenPayload, setTokenPayload] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            scope: "openid profile email read:profile read:api"
          }
        });
        setAccessToken(token);
        
        // JWTトークンのペイロード部分をデコード
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTokenPayload(payload);
      } catch (error) {
        console.error("トークン取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      getToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (!isAuthenticated) {
    return (
      <Card>
        <Card.Body className="text-center">
          <i className="fas fa-lock fa-3x text-muted mb-3"></i>
          <h4>認証が必要です</h4>
          <p>プロファイル情報を表示するにはログインしてください。</p>
        </Card.Body>
      </Card>
    );
  }

  if (loading) {
    return <Loading />;
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString("ja-JP");
  };

  return (
    <div>
      <Row>
        <Col md={12}>
          <h2 className="mb-4">
            <i className="fas fa-user-circle me-2"></i>
            プロファイル情報
          </h2>
        </Col>
      </Row>

      <Tabs defaultActiveKey="userinfo" className="mb-4">
        <Tab eventKey="userinfo" title="ユーザー情報">
          <Row>
            <Col md={4}>
              <Card className="profile-info text-center">
                {user?.picture && (
                  <div className="mb-3">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="profile-avatar"
                    />
                  </div>
                )}
                <h5>{user?.name || "名前なし"}</h5>
                <p className="text-muted">{user?.email}</p>
                {user?.email_verified && (
                  <Badge bg="success">
                    <i className="fas fa-check me-1"></i>
                    メール認証済み
                  </Badge>
                )}
              </Card>
            </Col>
            
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">詳細情報</h6>
                </Card.Header>
                <Card.Body>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>ユーザーID:</strong></td>
                        <td><code>{user?.sub}</code></td>
                      </tr>
                      <tr>
                        <td><strong>名前:</strong></td>
                        <td>{user?.name || "未設定"}</td>
                      </tr>
                      <tr>
                        <td><strong>ニックネーム:</strong></td>
                        <td>{user?.nickname || "未設定"}</td>
                      </tr>
                      <tr>
                        <td><strong>メールアドレス:</strong></td>
                        <td>{user?.email || "未設定"}</td>
                      </tr>
                      <tr>
                        <td><strong>メール認証:</strong></td>
                        <td>
                          {user?.email_verified ? (
                            <Badge bg="success">認証済み</Badge>
                          ) : (
                            <Badge bg="warning">未認証</Badge>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>最終更新:</strong></td>
                        <td>{user?.updated_at || "不明"}</td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="token" title="アクセストークン">
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">JWT アクセストークン</h6>
                  {accessToken && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(accessToken)}
                    >
                      <i className="fas fa-copy me-1"></i>
                      コピー
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>トークン文字列:</strong>
                    <div className="api-response token-display">
                      {accessToken || "トークンを取得中..."}
                    </div>
                  </div>

                  {tokenPayload && (
                    <div>
                      <strong>デコード済みペイロード:</strong>
                      <div className="api-response">
                        {JSON.stringify(tokenPayload, null, 2)}
                      </div>
                      
                      <div className="mt-3">
                        <h6>トークン情報:</h6>
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>発行者 (iss):</strong></td>
                              <td>{tokenPayload.iss}</td>
                            </tr>
                            <tr>
                              <td><strong>対象者 (aud):</strong></td>
                              <td>{Array.isArray(tokenPayload.aud) ? tokenPayload.aud.join(', ') : tokenPayload.aud}</td>
                            </tr>
                            <tr>
                              <td><strong>有効期限 (exp):</strong></td>
                              <td>{formatDate(tokenPayload.exp)}</td>
                            </tr>
                            <tr>
                              <td><strong>発行時刻 (iat):</strong></td>
                              <td>{formatDate(tokenPayload.iat)}</td>
                            </tr>
                            <tr>
                              <td><strong>スコープ:</strong></td>
                              <td>
                                {tokenPayload.scope ? (
                                  tokenPayload.scope.split(' ').map(scope => (
                                    <Badge key={scope} bg="info" className="me-1">
                                      {scope}
                                    </Badge>
                                  ))
                                ) : "なし"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Profile;