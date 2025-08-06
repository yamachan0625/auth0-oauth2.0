const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { auth, requiredScopes } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "{API_IDENTIFIER}"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 1000, // 最大1000リクエスト
  message: "レート制限に達しました。15分後に再試行してください。",
  standardHeaders: true,
  legacyHeaders: false,
});

const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

// 基本のAPIエンドポイント（従来と同じ）
app.get("/api/external", checkJwt, (req, res) => {
  // JWTペイロードから情報を取得
  const payload = req.auth.payload || req.auth;
  
  // JWTからスコープを取得（複数の形式に対応）
  let scopes = [];
  if (payload.scope) {
    scopes = payload.scope.split(' ');
  } else if (payload.scp) {
    scopes = Array.isArray(payload.scp) ? payload.scp : payload.scp.split(' ');
  } else if (payload.permissions) {
    scopes = payload.permissions;
  }

  res.send({
    msg: "Your access token was successfully validated!",
    user: payload.sub,
    scopes: scopes,
    token_info: {
      iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
      audience: payload.aud,
      grant_type: payload.gty,
      client_id: payload.azp
    }
  });
});

// スコープベースのエンドポイント群
app.use("/api/v1", limiter); // API v1にRate limiting適用

// 読み取り専用エンドポイント
app.get("/api/v1/data", checkJwt, requiredScopes("read:api"), (req, res) => {
  res.json({
    data: [
      { id: 1, name: "サンプルデータ1", type: "sample" },
      { id: 2, name: "サンプルデータ2", type: "demo" },
      { id: 3, name: "サンプルデータ3", type: "test" }
    ],
    user: req.auth.sub,
    timestamp: new Date().toISOString()
  });
});

// 書き込み権限が必要なエンドポイント
app.post("/api/v1/data", checkJwt, requiredScopes("write:api"), (req, res) => {
  const { name, type } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "名前は必須です" });
  }

  res.json({
    message: "データが作成されました",
    data: {
      id: Date.now(),
      name: name,
      type: type || "default",
      created_by: req.auth.sub,
      created_at: new Date().toISOString()
    }
  });
});

// 管理者権限が必要なエンドポイント
app.delete("/api/v1/data/:id", checkJwt, requiredScopes("admin:api"), (req, res) => {
  const { id } = req.params;
  
  res.json({
    message: `データ ID ${id} が削除されました`,
    deleted_by: req.auth.sub,
    deleted_at: new Date().toISOString()
  });
});

// ユーザー情報取得エンドポイント
app.get("/api/v1/profile", checkJwt, requiredScopes("read:profile"), (req, res) => {
  res.json({
    user_id: req.auth.sub,
    scopes: req.auth.scope ? req.auth.scope.split(' ') : [],
    iat: req.auth.iat,
    exp: req.auth.exp,
    aud: req.auth.aud
  });
});

// ヘルスチェックエンドポイント
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "api-server",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
