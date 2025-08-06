# OAuth2.0 プロバイダー機能セットアップガイド

このドキュメントでは、既存の Auth0 React アプリケーションに OAuth2.0 プロバイダー機能を追加する手順を説明します。

## 概要

このセットアップにより、以下が可能になります：

- 他の開発者が API クライアントを作成
- Client Credentials フローでの API 認証
- スコープベースのアクセス制御
- Rate limiting 機能

## 必要な設定

### 1. Auth0 ダッシュボードでの Management API 設定

1. Auth0 ダッシュボードにログイン
2. **Applications** > **Machine to Machine Applications**で新しいアプリケーションを作成
3. 作成したアプリケーションで以下のスコープを許可：
   - `create:clients`
   - `delete:clients`
   - `read:clients`
   - `update:clients`
   - `create:client_grants`
   - `delete:client_grants`
   - `read:client_grants`
   - `update:client_grants`

### 2. 設定ファイルの更新

`src/management_config.json`を以下のように更新：

```json
{
  "domain": "your-auth0-domain.auth0.com",
  "clientId": "Management-API用のClient-ID",
  "clientSecret": "Management-API用のClient-Secret",
  "scope": "create:clients delete:clients read:clients update:clients create:client_grants delete:client_grants read:client_grants update:client_grants"
}
```

### 3. API スコープの設定

Auth0 ダッシュボードで以下のスコープを定義：

1. **APIs** > **Your API** > **Scopes**で以下を追加：
   - `read:api` - データ読み取り権限
   - `write:api` - データ書き込み権限
   - `admin:api` - 管理者権限
   - `read:profile` - プロファイル読み取り権限

## サーバー起動

### 開発環境

```bash
npm run dev
```

これにより以下のサーバーが同時に起動されます：

- React SPA (http://localhost:3000)
- API Server (http://localhost:3001)
- Management Server (http://localhost:3002)

### 本番環境

```bash
npm run prod
```

## 使用方法

### 1. Developer Portal でのクライアント作成

1. http://localhost:3000 にアクセス
2. ログイン後、「Developer Portal」に移動
3. 「新規クライアント作成」をクリック
4. 必要な情報とスコープを選択して作成
5. 生成された Client ID と Client Secret を記録

### 2. API へのアクセス

#### Client Credentials フローでのトークン取得

```bash
curl -X POST https://your-domain.auth0.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "作成したClient-ID",
    "client_secret": "作成したClient-Secret",
    "audience": "http://localhost:3001",
    "grant_type": "client_credentials"
  }'
```

#### API エンドポイントの呼び出し

```bash
# 基本エンドポイント（従来通り）
curl -X GET http://localhost:3001/api/external \
  -H "Authorization: Bearer ACCESS_TOKEN"

# スコープが必要なエンドポイント
curl -X GET http://localhost:3001/api/v1/data \
  -H "Authorization: Bearer ACCESS_TOKEN"

curl -X POST http://localhost:3001/api/v1/data \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "テストデータ", "type": "sample"}'

curl -X DELETE http://localhost:3001/api/v1/data/123 \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## API エンドポイント一覧

### 従来のエンドポイント

- `GET /api/external` - 基本認証のみ

### 新しいスコープベースエンドポイント

- `GET /api/v1/data` - 読み取りのみ（`read:api`スコープが必要）
- `POST /api/v1/data` - データ作成（`write:api`スコープが必要）
- `DELETE /api/v1/data/:id` - データ削除（`admin:api`スコープが必要）
- `GET /api/v1/profile` - プロファイル取得（`read:profile`スコープが必要）

### Management API

- `POST /api/developer/clients` - クライアント作成
- `GET /api/developer/clients` - クライアント一覧
- `DELETE /api/developer/clients/:id` - クライアント削除

## セキュリティ機能

### Rate Limiting

- Management API: 15 分間に 100 リクエスト
- API v1 エンドポイント: 15 分間に 1000 リクエスト

### スコープベースアクセス制御

各エンドポイントは適切なスコープを持つトークンでのみアクセス可能

## トラブルシューティング

### Management API 関連のエラー

1. `management_config.json`の設定を確認
2. Auth0 ダッシュボードで Management API アプリケーションのスコープを確認
3. Client の権限設定を確認

### スコープエラー

1. Auth0 API でのスコープ定義を確認
2. クライアント作成時のスコープ選択を確認
3. トークン取得時の audience が正しいか確認

### CORS エラー

1. `api-server.js`と`management-server.js`の CORS 設定を確認
2. フロントエンドの origin 設定を確認

## 本番環境への展開

本番環境では以下の追加設定が必要です：

1. HTTPS 対応
2. 環境変数での秘密情報管理
3. Auth0 設定の本番ドメインへの更新
4. Rate limiting の調整
5. ログ設定の強化
