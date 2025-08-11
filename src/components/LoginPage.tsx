import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ZapIcon } from '../../components/Icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('認証に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 mb-4">
            <ZapIcon className="w-12 h-12 mr-3" />
            <h1 className="text-3xl font-bold">
              採用魅力発見アシスタント
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            {isSignup ? 'アカウントを作成して開始' : 'ログインして開始'}
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="example@company.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:ring-4 focus:ring-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isSignup ? 'アカウント作成中...' : 'ログイン中...'}
              </div>
            ) : (
              isSignup ? 'アカウントを作成' : 'ログイン'
            )}
          </button>
        </form>

        {/* 切り替えリンク */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            {isSignup ? '既にアカウントをお持ちですか？ログイン' : 'アカウントをお持ちでないですか？新規作成'}
          </button>
        </div>

        {/* 説明 */}
        <div className="mt-8 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700 text-center">
            このアプリケーションは、会社の事実を分析して採用魅力ポイントを生成するAI搭載ツールです。
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
