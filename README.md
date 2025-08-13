# 採用魅力発見アシスタント

このアプリケーションは、会社の事実を分析して採用魅力ポイントを生成するAI搭載ツールです。

## セットアップ

### 必要な環境変数

以下の環境変数を設定してください：

#### Firebase設定
```bash
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Gemini API設定
```bash
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

### Firebase設定の確認

Googleログインが動作しない場合は、以下を確認してください：

1. **Firebaseコンソール** → **認証** → **設定** → **承認済みドメイン**
2. 以下のドメインを追加：
   - `localhost` (開発環境用)
   - `vercel.app` (Vercelデプロイ用)
   - カスタムドメインがあればそれも追加

### インストールと実行

```bash
npm install
npm run dev
```

## 機能

- AIによる採用魅力ポイントの生成
- ユーザー認証（Googleログイン、メール/パスワード）
- テーマカスタマイズ
- 分析履歴の管理
- 管理者機能（ユーザー管理、監査ログ）
