import React, { useState, useCallback } from 'react';
import { useAuth } from './src/contexts/AuthContext';
import { useAdminAuth } from './src/contexts/AdminAuthContext';
import LoginPage from './src/components/LoginPage';
import AdminLoginPage from './src/components/AdminLoginPage';
import AdminDashboard from './src/components/AdminDashboard';
import ThemeSettings from './src/components/ThemeSettings';
import { FactInputForm } from './components/FactInputForm';
import { AttractivenessDisplay } from './components/AttractivenessDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { generateAttractivenessPoints } from './services/geminiService';
import type { AttractivenessOutput } from './types';
import { InfoIcon, ZapIcon, LogOutIcon, PaletteIcon, Cog6ToothIcon } from './components/Icons';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentAdmin, isAdmin } = useAdminAuth();
  const [attractiveness, setAttractiveness] = useState<AttractivenessOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'main' | 'theme' | 'settings'>('main');

  const handleSubmit = useCallback(async (fact: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateAttractivenessPoints(fact);
      setAttractiveness(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      if (isAdmin) {
        await logout();
      } else {
        await logout();
      }
      setAttractiveness(null);
      setError(null);
      setActiveView('main');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // Admin routing logic
  if (isAdmin && currentAdmin) {
    return <AdminDashboard />;
  }
  
  if (currentUser && currentUser.email === 'yamane@potentialight.com' && !isAdmin) {
    return <AdminLoginPage />;
  }

  // General user routing logic
  if (currentUser && !isAdmin) {
    if (activeView === 'theme') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* ヘッダー */}
          <header className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <ZapIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    採用魅力発見アシスタント
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveView('main')}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <InfoIcon className="w-4 h-4 mr-2" />
                    メイン画面
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          <ThemeSettings />
        </div>
      );
    }

    if (activeView === 'settings') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* ヘッダー */}
          <header className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <ZapIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    採用魅力発見アシスタント
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveView('main')}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <InfoIcon className="w-4 h-4 mr-2" />
                    メイン画面
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Cog6ToothIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">設定画面</h2>
              <p className="text-gray-600 mb-6">
                この画面では、アプリケーションの詳細設定を行うことができます。
              </p>
              <button
                onClick={() => setActiveView('main')}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                メイン画面に戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <ZapIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  採用魅力発見アシスタント
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveView('theme')}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PaletteIcon className="w-4 h-4 mr-2" />
                  テーマ設定
                </button>
                <button
                  onClick={() => setActiveView('settings')}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  設定
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              採用魅力発見アシスタントへようこそ！
            </h2>
            <p className="text-lg text-gray-600">
              あなたの企業の魅力をAIが分析し、採用活動に活用できるポイントをお伝えします
            </p>
          </div>

          <FactInputForm onSubmit={handleSubmit} />

          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {attractiveness && <AttractivenessDisplay attractiveness={attractiveness} />}
        </main>
      </div>
    );
  }

  // Default to login page if not authenticated
  return <LoginPage />;
};

export default App;