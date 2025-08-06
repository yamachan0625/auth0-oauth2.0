import React, { useState } from "react";
import { Card, Button, Alert, Row, Col, Form, Badge } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import ApiService from "../services/ApiService";
import Loading from "../components/Loading";

const ApiTest = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState("");

  const endpoints = [
    {
      path: "/api/external",
      method: "GET",
      description: "基本的なAPI呼び出し",
      scopes: ["read:api"]
    },
    {
      path: "/api/v1/me",
      method: "GET", 
      description: "現在のユーザー情報",
      scopes: ["read:profile"]
    },
    {
      path: "/api/v1/profile",
      method: "GET",
      description: "詳細プロファイル情報",
      scopes: ["read:profile"]
    }
  ];

  const callApi = async (endpoint) => {
    if (!isAuthenticated) {
      setError("認証が必要です");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently({
        authorizationParams: {
          scope: "openid profile email read:profile read:api"
        }
      });

      let response;
      const apiService = new ApiService(token);

      switch (endpoint.path) {
        case "/api/external":
          response = await apiService.callExternalApi();
          break;
        case "/api/v1/me":
          response = await apiService.getCurrentUser();
          break;
        case "/api/v1/profile":
          response = await apiService.getUserProfile();
          break;
        default:
          throw new Error("不明なエンドポイント");
      }

      setResults(prev => ({
        ...prev,
        [endpoint.path]: {
          success: true,
          data: response,
          timestamp: new Date().toLocaleString("ja-JP")
        }
      }));

    } catch (err) {
      console.error("API呼び出しエラー:", err);
      setError(err.message || "API呼び出しに失敗しました");
      setResults(prev => ({
        ...prev,
        [endpoint.path]: {
          success: false,
          error: err.message,
          timestamp: new Date().toLocaleString("ja-JP")
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const callAllApis = async () => {
    setLoading(true);
    setError(null);
    setResults({});

    for (const endpoint of endpoints) {
      await callApi(endpoint);
    }

    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <Card.Body className="text-center">
          <i className="fas fa-lock fa-3x text-muted mb-3"></i>
          <h4>認証が必要です</h4>
          <p>API テストを実行するにはログインしてください。</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <Row>
        <Col md={12}>
          <h2 className="mb-4">
            <i className="fas fa-flask me-2"></i>
            API テスト
          </h2>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>エラーが発生しました</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">利用可能な API エンドポイント</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  onClick={callAllApis}
                  disabled={loading}
                  className="mb-3"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      実行中...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play me-2"></i>
                      全APIテスト実行
                    </>
                  )}
                </Button>

                {endpoints.map((endpoint, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <strong>{endpoint.method}</strong> {endpoint.path}
                        <br />
                        <small className="text-muted">{endpoint.description}</small>
                        <br />
                        <div className="mt-1">
                          {endpoint.scopes.map(scope => (
                            <Badge key={scope} bg="secondary" className="me-1" style={{fontSize: "0.7rem"}}>
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => callApi(endpoint)}
                        disabled={loading}
                        className="ms-2"
                      >
                        テスト
                      </Button>
                    </div>
                    <hr className="my-2" />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h6 className="mb-0">API サーバー情報</h6>
            </Card.Header>
            <Card.Body>
              <table className="table table-sm table-borderless">
                <tbody>
                  <tr>
                    <td><strong>サーバーURL:</strong></td>
                    <td>http://localhost:3001</td>
                  </tr>
                  <tr>
                    <td><strong>認証方式:</strong></td>
                    <td>JWT Bearer Token</td>
                  </tr>
                  <tr>
                    <td><strong>Audience:</strong></td>
                    <td>http://localhost:3001</td>
                  </tr>
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">API レスポンス</h6>
            </Card.Header>
            <Card.Body>
              {Object.keys(results).length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-info-circle fa-2x mb-3"></i>
                  <p>API をテストして結果を確認しましょう</p>
                </div>
              ) : (
                <div>
                  {endpoints.map((endpoint) => {
                    const result = results[endpoint.path];
                    if (!result) return null;

                    return (
                      <div key={endpoint.path} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">
                            <Badge bg={result.success ? "success" : "danger"} className="me-2">
                              {endpoint.method}
                            </Badge>
                            {endpoint.path}
                          </h6>
                          <small className="text-muted">
                            {result.timestamp}
                          </small>
                        </div>

                        <div className="api-response">
                          {result.success ? (
                            JSON.stringify(result.data, null, 2)
                          ) : (
                            `エラー: ${result.error}`
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ApiTest;