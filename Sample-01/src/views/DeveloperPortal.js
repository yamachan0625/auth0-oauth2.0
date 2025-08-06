import React, { useState, useEffect } from "react";
import {
  Button,
  Alert,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Badge,
} from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";

export const DeveloperPortalComponent = () => {
  const { managementApiOrigin = "http://localhost:3002" } = getConfig();
  const { getAccessTokenSilently } = useAuth0();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modal, setModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [createdClientData, setCreatedClientData] = useState(null);
  const [newClient, setNewClient] = useState({
    name: "",
    description: "",
    callbacks: "",
    allowed_origins: "",
    scopes: ["read:api"],
  });

  const availableScopes = [
    {
      value: "read:api",
      label: "データ読み取り",
      description: "APIからデータを読み取る",
    },
    {
      value: "write:api",
      label: "データ書き込み",
      description: "APIにデータを作成・更新する",
    },
    {
      value: "admin:api",
      label: "管理者権限",
      description: "データの削除など管理者操作を行う",
    },
    {
      value: "read:profile",
      label: "プロファイル読み取り",
      description: "ユーザープロファイル情報を読み取る",
    },
  ];

  // クライアント一覧取得
  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${managementApiOrigin}/api/developer/clients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("クライアント一覧の取得に失敗しました");
      }

      const data = await response.json();
      console.log("Received client data:", data);
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 新規クライアント作成
  const createClient = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();

      const clientData = {
        name: newClient.name,
        description: newClient.description,
        scopes: newClient.scopes,
      };

      if (newClient.callbacks.trim()) {
        clientData.callbacks = newClient.callbacks
          .split(",")
          .map((url) => url.trim());
      }

      if (newClient.allowed_origins.trim()) {
        clientData.allowed_origins = newClient.allowed_origins
          .split(",")
          .map((url) => url.trim());
      }

      const response = await fetch(
        `${managementApiOrigin}/api/developer/clients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(clientData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "クライアント作成に失敗しました");
      }

      const data = await response.json();
      setCreatedClientData(data);
      setModal(false);
      setResultModal(true);
      setNewClient({
        name: "",
        description: "",
        callbacks: "",
        allowed_origins: "",
        scopes: ["read:api"],
      });
      fetchClients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // クライアント削除
  const deleteClient = async (clientId) => {
    if (!window.confirm("このクライアントを削除してもよろしいですか？")) {
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${managementApiOrigin}/api/developer/clients/${clientId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "クライアント削除に失敗しました");
      }

      setSuccess("クライアントが削除されました");
      fetchClients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const toggleModal = () => setModal(!modal);
  const toggleResultModal = () => setResultModal(!resultModal);

  const handleScopeChange = (scopeValue) => {
    const updatedScopes = newClient.scopes.includes(scopeValue)
      ? newClient.scopes.filter((s) => s !== scopeValue)
      : [...newClient.scopes, scopeValue];
    setNewClient({ ...newClient, scopes: updatedScopes });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess("クリップボードにコピーされました");
  };

  return (
    <>
      <div className="mb-5">
        <h1>Developer Portal</h1>
        <p className="lead">APIクライアントの管理と認証情報の取得</p>

        {error && (
          <Alert color="danger" toggle={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="success" toggle={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>あなたのAPIクライアント</h3>
          <Button color="primary" onClick={toggleModal}>
            新規クライアント作成
          </Button>
        </div>

        {loading && (
          <div className="text-center">
            <Loading />
          </div>
        )}

        {!loading && clients.length === 0 && (
          <Card>
            <CardBody className="text-center">
              <p>まだクライアントが作成されていません。</p>
              <Button color="primary" onClick={toggleModal}>
                最初のクライアントを作成
              </Button>
            </CardBody>
          </Card>
        )}

        {!loading && clients.length > 0 && (
          <Table responsive>
            <thead>
              <tr>
                <th>クライアント名</th>
                <th>Client ID</th>
                <th>説明</th>
                <th>作成日</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                console.log("Rendering client:", client);
                return (
                <tr key={client.client_id}>
                  <td>{client.name}</td>
                  <td>
                    <code className="text-muted">{client.client_id}</code>
                  </td>
                  <td>{client.description}</td>
                  <td>
                    {client.created_at
                      ? new Date(client.created_at).toLocaleDateString("ja-JP")
                      : "不明"}
                  </td>
                  <td>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => deleteClient(client.client_id)}
                    >
                      削除
                    </Button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </Table>
        )}

        {/* API使用方法の説明 */}
        <Card className="mt-5">
          <CardBody>
            <CardTitle tag="h4">API使用方法</CardTitle>
            <p>作成したクライアント認証情報を使用してAPIにアクセスできます：</p>
            <ol>
              <li>Client CredentialsフローでAccessTokenを取得</li>
              <li>Authorizationヘッダーにトークンを設定してAPIを呼び出し</li>
            </ol>

            <h6>サンプルコード（curl）:</h6>
            <pre className="bg-light p-3">
              {`# 1. アクセストークン取得
curl -X POST https://dev-hjemkt24m2gmy0ii.us.auth0.com/oauth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "audience": "http://localhost:3001",
    "grant_type": "client_credentials"
  }'

# 2. API呼び出し
curl -X GET http://localhost:3001/api/external \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
            </pre>
          </CardBody>
        </Card>
      </div>

      {/* 新規クライアント作成モーダル */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>新規APIクライアント作成</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="clientName">クライアント名 *</Label>
              <Input
                type="text"
                id="clientName"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                placeholder="My API Client"
              />
            </FormGroup>
            <FormGroup>
              <Label for="clientDescription">説明</Label>
              <Input
                type="textarea"
                id="clientDescription"
                value={newClient.description}
                onChange={(e) =>
                  setNewClient({ ...newClient, description: e.target.value })
                }
                placeholder="このクライアントの用途を説明してください"
              />
            </FormGroup>
            <FormGroup>
              <Label for="callbacks">コールバックURL (カンマ区切り)</Label>
              <Input
                type="text"
                id="callbacks"
                value={newClient.callbacks}
                onChange={(e) =>
                  setNewClient({ ...newClient, callbacks: e.target.value })
                }
                placeholder="https://example.com/callback, https://app.example.com/auth"
              />
            </FormGroup>
            <FormGroup>
              <Label for="allowedOrigins">
                許可されたオリジン (カンマ区切り)
              </Label>
              <Input
                type="text"
                id="allowedOrigins"
                value={newClient.allowed_origins}
                onChange={(e) =>
                  setNewClient({
                    ...newClient,
                    allowed_origins: e.target.value,
                  })
                }
                placeholder="https://example.com, https://app.example.com"
              />
            </FormGroup>
            <FormGroup>
              <Label>APIアクセス権限 (スコープ)</Label>
              <div className="mt-2">
                {availableScopes.map((scope) => (
                  <div key={scope.value} className="form-check">
                    <Input
                      type="checkbox"
                      id={`scope-${scope.value}`}
                      className="form-check-input"
                      checked={newClient.scopes.includes(scope.value)}
                      onChange={() => handleScopeChange(scope.value)}
                    />
                    <Label
                      className="form-check-label"
                      for={`scope-${scope.value}`}
                    >
                      <strong>{scope.label}</strong>
                      <br />
                      <small className="text-muted">{scope.description}</small>
                    </Label>
                  </div>
                ))}
              </div>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={createClient}
            disabled={!newClient.name || loading}
          >
            {loading ? "作成中..." : "作成"}
          </Button>
          <Button color="secondary" onClick={toggleModal}>
            キャンセル
          </Button>
        </ModalFooter>
      </Modal>

      {/* クライアント作成結果表示モーダル */}
      {createdClientData && (
        <Modal isOpen={resultModal} toggle={toggleResultModal} size="lg">
          <ModalHeader toggle={toggleResultModal}>
            クライアント作成完了
          </ModalHeader>
          <ModalBody>
            <Alert color="success">
              クライアントが正常に作成されました！以下の情報を安全に保存してください。
              <strong>Client Secretは二度と表示されません。</strong>
            </Alert>
            
            <div className="mb-3">
              <Label><strong>クライアント名</strong></Label>
              <div>{createdClientData.name}</div>
            </div>
            
            <div className="mb-3">
              <Label><strong>Client ID</strong></Label>
              <div className="d-flex align-items-center">
                <code className="flex-grow-1 p-2 bg-light border rounded">
                  {createdClientData.client_id}
                </code>
                <Button
                  color="outline-primary"
                  size="sm"
                  className="ms-2"
                  onClick={() => copyToClipboard(createdClientData.client_id)}
                >
                  コピー
                </Button>
              </div>
            </div>
            
            <div className="mb-3">
              <Label><strong>Client Secret</strong></Label>
              <div className="d-flex align-items-center">
                <code className="flex-grow-1 p-2 bg-light border rounded">
                  {createdClientData.client_secret}
                </code>
                <Button
                  color="outline-primary"
                  size="sm"
                  className="ms-2"
                  onClick={() => copyToClipboard(createdClientData.client_secret)}
                >
                  コピー
                </Button>
              </div>
            </div>
            
            <div className="mb-3">
              <Label><strong>作成日</strong></Label>
              <div>{new Date(createdClientData.created_at).toLocaleString("ja-JP")}</div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={toggleResultModal}>
              閉じる
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default withAuthenticationRequired(DeveloperPortalComponent, {
  onRedirecting: () => <Loading />,
});
