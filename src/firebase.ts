import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD0kLwiFyEo4CuNC-i5Qk8Oh8wvLHFOLCo",
  authDomain: "recruitment-attractiveness.firebaseapp.com",
  projectId: "recruitment-attractiveness",
  storageBucket: "recruitment-attractiveness.firebasestorage.app",
  messagingSenderId: "950247830054",
  appId: "1:950247830054:web:8aae1b013fc1c38bfc6ce7",
  measurementId: "G-G71N5RFTK5"
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Authインスタンスの取得
export const auth = getAuth(app);

export default app;
