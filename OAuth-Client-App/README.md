# OAuth2.0 Authorization Code Demo

このプロジェクトは、OAuth2.0のAuthorization Code Flowを使用してAuth0で認証し、リソースサーバー（API）からユーザー情報を取得するReactアプリケーションのデモです。

## 機能

- **OAuth2.0 Authorization Code Flow**: Auth0を使用したユーザー認証
- **アクセストークン管理**: JWTトークンの取得と管理
- **API呼び出し**: 認証されたAPIリソースへのアクセス
- **ユーザープロファイル表示**: Auth0から取得したユーザー情報の表示
- **リアルタイムAPIテスト**: 複数のAPIエンドポイントのテスト機能

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Auth0設定

1. `.env.example`を`.env`にコピー
2. Auth0ダッシュボードで新しいアプリケーションを作成（Single Page Application）
3. `.env`ファイルにAuth0の設定を記入：

```bash
REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_client_id_here
REACT_APP_AUTH0_AUDIENCE=http://localhost:3001
REACT_APP_API_SERVER_URL=http://localhost:3001
```

### 3. Auth0アプリケーション設定

Auth0ダッシュボードで以下を設定：

- **Allowed Callback URLs**: `http://localhost:3003`
- **Allowed Logout URLs**: `http://localhost:3003`
- **Allowed Web Origins**: `http://localhost:3003`
- **Allowed Origins (CORS)**: `http://localhost:3003`

### 4. APIサーバーの起動

このアプリケーションはリソースサーバー（ポート3001）と連携します。
事前にAPIサーバーを起動してください：

```bash
# APIサーバーディレクトリで
node api-server.js
```

### 5. アプリケーションの起動

```bash
npm start
```

アプリケーションは http://localhost:3003 で起動します。

## システム構成

```
OAuth-Client-App (ポート3003) ←→ API Server (ポート3001)
         ↓
    Auth0 認証プロバイダー
```

## 利用可能なAPIエンドポイント

- `GET /api/external` - 基本的なAPI呼び出し（read:api スコープ）
- `GET /api/v1/me` - 現在のユーザー情報（read:profile スコープ）
- `GET /api/v1/profile` - 詳細プロファイル情報（read:profile スコープ）

## プロジェクト構造

```
src/
├── components/         # 共通コンポーネント
│   ├── Loading.js     # ローディングコンポーネント
│   └── Navigation.js  # ナビゲーションバー
├── pages/             # ページコンポーネント
│   ├── Home.js        # ホームページ
│   ├── Profile.js     # プロファイルページ
│   └── ApiTest.js     # APIテストページ
├── services/          # サービスクラス
│   └── ApiService.js  # API呼び出しサービス
├── App.js             # メインアプリケーション
├── App.css            # カスタムスタイル
└── index.js           # エントリーポイント
```

## 認証フロー

1. ユーザーがログインボタンをクリック
2. Auth0の認証エンドポイントにリダイレクト
3. ユーザーが認証情報を入力
4. 認証成功後、認可コードと共にアプリにリダイレクト
5. 認可コードをアクセストークンと交換
6. アクセストークンを使ってAPIリソースにアクセス

## 開発

### 利用技術

- **React 18** - フロントエンドフレームワーク
- **React Router** - ルーティング
- **React Bootstrap** - UIコンポーネント
- **@auth0/auth0-react** - Auth0認証SDK
- **Bootstrap 5** - CSSフレームワーク

### カスタマイズ

- スタイリング: `src/App.css`で独自のスタイルを定義
- APIエンドポイント: `src/services/ApiService.js`で新しいAPIエンドポイントを追加
- 認証設定: `src/index.js`でAuth0プロバイダーの設定を変更

## トラブルシューティング

### よくある問題

1. **認証エラー**: `.env`ファイルのAuth0設定を確認
2. **API呼び出し失敗**: APIサーバー（ポート3001）が起動しているか確認
3. **CORS エラー**: Auth0ダッシュボードのCORS設定を確認

### ログ確認

開発者ツールのコンソールでエラーログを確認してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。