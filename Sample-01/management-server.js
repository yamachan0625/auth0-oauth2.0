const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { auth } = require("express-oauth2-jwt-bearer");
const { ManagementClient } = require("auth0");
const authConfig = require("./src/auth_config.json");
const managementConfig = require("./src/management_config.json");

const app = express();

const port = process.env.MANAGEMENT_PORT || 3002;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

// 設定チェック
if (
  !managementConfig.domain ||
  !managementConfig.clientId ||
  !managementConfig.clientSecret
) {
  console.log(
    "終了: management_config.jsonに適切なdomain、clientId、clientSecretが設定されていることを確認してください"
  );
  process.exit();
}

// ミドルウェア設定
app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
  message: "レート制限に達しました。15分後に再試行してください。"
});
app.use(limiter);

// JWT認証ミドルウェア
const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

// Auth0 Management APIクライアント
const management = new ManagementClient({
  domain: managementConfig.domain,
  clientId: managementConfig.clientId,
  clientSecret: managementConfig.clientSecret,
  scope: managementConfig.scope
});

// 開発者用クライアント作成
app.post("/api/developer/clients", checkJwt, async (req, res) => {
  try {
    const { name, description, callbacks, allowed_origins } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "クライアント名が必要です" });
    }

    const userId = req.auth?.payload?.sub || req.auth?.sub || "unknown";
    
    const clientData = {
      name: name,
      description: description || "API用クライアント",
      app_type: "non_interactive", // Machine-to-Machine
      grant_types: ["client_credentials"],
      client_metadata: {
        created_by: userId, // JWT内のユーザーID
        created_at: new Date().toISOString()
      }
    };

    if (callbacks && callbacks.length > 0) {
      clientData.callbacks = callbacks;
    }
    
    if (allowed_origins && allowed_origins.length > 0) {
      clientData.allowed_origins = allowed_origins;
    }

    const clientResponse = await management.clients.create(clientData);
    
    // APIレスポンスからdataを取得
    const client = clientResponse.data || clientResponse;
    
    // 作成されたクライアントにAPI アクセス権限を付与
    try {
      const scopes = req.body.scopes || ["read:api"]; // デフォルトは読み取りのみ
      const grantPayload = {
        client_id: client.client_id,
        audience: authConfig.audience,
        scope: scopes
      };
      
      await management.clientGrants.create(grantPayload);
    } catch (grantError) {
      console.error("Client grant creation failed, but client was created:", grantError);
    }

    res.json({
      client_id: client.client_id,
      client_secret: client.client_secret,
      name: client.name,
      description: client.description,
      created_at: client.client_metadata?.created_at
    });
  } catch (error) {
    console.error("クライアント作成エラー:", error);
    res.status(500).json({ 
      error: "クライアント作成に失敗しました",
      details: error.message 
    });
  }
});

// 開発者のクライアント一覧取得
app.get("/api/developer/clients", checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.payload?.sub || req.auth?.sub;
    
    // 全クライアントを取得（実際にはページングが必要）
    const clientsResponse = await management.clients.getAll();
    
    // レスポンスの構造を確認してから配列にアクセス
    const clients = Array.isArray(clientsResponse) 
      ? clientsResponse 
      : (clientsResponse.data 
          ? (Array.isArray(clientsResponse.data) ? clientsResponse.data : [clientsResponse.data])
          : clientsResponse.clients || []);
    
    // このユーザーが作成したクライアントのみフィルタ
    const userClients = clients.filter(client => 
      client.client_metadata?.created_by === userId
    );

    const responseData = userClients.map(client => ({
      client_id: client.client_id,
      name: client.name,
      description: client.description,
      created_at: client.client_metadata?.created_at
    }));
    
    console.log("Sending client data:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("クライアント一覧取得エラー:", error);
    res.status(500).json({ 
      error: "クライアント一覧取得に失敗しました",
      details: error.message 
    });
  }
});

// クライアント削除
app.delete("/api/developer/clients/:clientId", checkJwt, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const userId = req.auth?.payload?.sub || req.auth?.sub;
    
    // クライアント情報を取得して所有者確認
    const client = await management.clients.get({ client_id: clientId });
    
    if (client.client_metadata?.created_by !== userId) {
      return res.status(403).json({ error: "このクライアントを削除する権限がありません" });
    }
    
    // クライアント削除
    await management.clients.delete({ client_id: clientId });
    
    res.json({ message: "クライアントが削除されました" });
  } catch (error) {
    console.error("クライアント削除エラー:", error);
    res.status(500).json({ 
      error: "クライアント削除に失敗しました",
      details: error.message 
    });
  }
});

// ヘルスチェック
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "management-api" });
});

app.listen(port, () => {
  console.log(`Management API サーバーがポート ${port} で開始されました`);
});