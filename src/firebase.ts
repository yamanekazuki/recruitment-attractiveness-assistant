import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// 環境変数からFirebase設定を取得
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD0kLwiFyEo4CuNC-i5Qk8Oh8wvLHFOLCo",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "recruitment-attractiveness.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "recruitment-attractiveness",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "recruitment-attractiveness.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "950247830054",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:950247830054:web:8aae1b013fc1c38bfc6ce7",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-G71N5RFTK5"
};

// 設定の検証
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase設定が不完全です。環境変数を確認してください。');
}

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Authインスタンスの取得
export const auth = getAuth(app);

// 認証エラーのハンドリング
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('ユーザーが認証されました:', user.email);
  }
}, (error) => {
  console.error('認証エラー:', error);
  
  // 特定のエラーの詳細を表示
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = (error as any).code;
    switch (errorCode) {
      case 'auth/unauthorized-domain':
        console.error('このドメインはFirebaseで許可されていません。Firebaseコンソールで承認済みドメインを確認してください。');
        break;
      case 'auth/network-request-failed':
        console.error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
        break;
      case 'auth/popup-closed-by-user':
        console.error('ポップアップがユーザーによって閉じられました。');
        break;
      default:
        console.error('認証エラーが発生しました:', error.message);
    }
  } else {
    console.error('認証エラーが発生しました:', error.message);
  }
});

export default app;
