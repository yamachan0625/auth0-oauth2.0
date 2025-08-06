#!/bin/bash

# OAuth2.0 デモアプリケーション統合起動スクリプト

echo "🚀 OAuth2.0 デモシステムを起動しています..."
echo "================================="

# 利用可能なポートをチェック
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  ポート $1 は既に使用されています"
        return 1
    else
        echo "✅ ポート $1 は利用可能です"
        return 0
    fi
}

# 必要なポートをチェック
echo "📡 ポートの可用性をチェック中..."
check_port 3001
check_port 3002  
check_port 3003

echo ""
echo "🔧 各サービスを起動中..."

# APIサーバー (リソースサーバー) - ポート3001
echo "1️⃣ APIサーバー (リソースサーバー) を起動中..."
cd ../Sample-01
if [ -f "api-server.js" ]; then
    node api-server.js &
    API_PID=$!
    echo "   ✅ APIサーバー起動完了 (PID: $API_PID, ポート: 3001)"
else
    echo "   ❌ api-server.js が見つかりません"
fi

sleep 2

# Management API サーバー (認証プロバイダー) - ポート3002
echo "2️⃣ Management APIサーバー (認証プロバイダー) を起動中..."
if [ -f "management-server.js" ]; then
    node management-server.js &
    MGMT_PID=$!
    echo "   ✅ Management APIサーバー起動完了 (PID: $MGMT_PID, ポート: 3002)"
else
    echo "   ❌ management-server.js が見つかりません"
fi

sleep 2

# React OAuth Client App - ポート3003
echo "3️⃣ React OAuth Client App を起動中..."
cd ../OAuth-Client-App
if [ -f "package.json" ]; then
    npm start &
    REACT_PID=$!
    echo "   ✅ React アプリ起動中 (PID: $REACT_PID, ポート: 3003)"
else
    echo "   ❌ package.json が見つかりません"
fi

echo ""
echo "🎉 システム起動完了！"
echo "================================="
echo "📝 アクセス情報:"
echo "   • OAuth Client App:      http://localhost:3003"
echo "   • API Server (リソース):  http://localhost:3001"
echo "   • Management API:        http://localhost:3002"
echo ""
echo "💡 使用方法:"
echo "   1. http://localhost:3003 にアクセス"
echo "   2. ログインして認証を完了"
echo "   3. プロファイルやAPI テストを実行"
echo ""
echo "🛑 停止するには Ctrl+C を押してください"
echo ""

# プロセスの監視とクリーンアップ
cleanup() {
    echo ""
    echo "🔄 システムを停止中..."
    
    if [ ! -z "$REACT_PID" ]; then
        kill $REACT_PID 2>/dev/null
        echo "   ✅ React アプリを停止しました"
    fi
    
    if [ ! -z "$MGMT_PID" ]; then
        kill $MGMT_PID 2>/dev/null
        echo "   ✅ Management APIサーバーを停止しました"
    fi
    
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null
        echo "   ✅ APIサーバーを停止しました"
    fi
    
    echo "👋 システム停止完了"
    exit 0
}

# シグナルハンドラを設定
trap cleanup SIGINT SIGTERM

# プロセスを待機
wait