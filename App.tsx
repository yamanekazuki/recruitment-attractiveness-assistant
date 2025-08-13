import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from './src/contexts/AuthContext';
import { useAdminAuth } from './src/contexts/AdminAuthContext';
import LoginPage from './src/components/LoginPage';
import AdminLoginPage from './src/components/AdminLoginPage';
import AdminDashboard from './src/components/AdminDashboard';
import ThemeSettings from './src/components/ThemeSettings';
import UserAnalytics from './src/components/UserAnalytics';
import { FactInputForm } from './components/FactInputForm';
import { AttractivenessDisplay } from './components/AttractivenessDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { generateAttractivenessPoints } from './services/geminiService';
import type { AttractivenessOutput } from './types';
import { InfoIcon, ZapIcon, LogOutIcon, PaletteIcon, Cog6ToothIcon, ChartBarIcon } from './components/Icons';
import { loadUserPreferences, applyTheme } from './src/services/themeService';
import { saveAnalysisHistory } from './src/services/historyService';

const App: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { currentAdmin, adminLogout } = useAdminAuth();
  const [attractiveness, setAttractiveness] = useState<AttractivenessOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'main' | 'theme' | 'settings' | 'analytics'>('main');
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false); // 管理者モードの状態を追加

  // テーマ設定の初期化
  useEffect(() => {
    if (currentUser) {
      const userPrefs = loadUserPreferences(currentUser.uid);
      if (userPrefs) {
        applyTheme(userPrefs.theme);
      }
    }
  }, [currentUser]);

  // yamane@potentialight.comでログインした場合の初期設定
  useEffect(() => {
    if (currentUser && currentUser.email === 'yamane@potentialight.com') {
      // 管理者としてログインしている場合は管理者モードを有効にする
      if (isAdmin) {
        setIsAdminMode(true);
      }
    }
  }, [currentUser, isAdmin]);

  const handleLogout = useCallback(async () => {
    try {
      if (isAdmin) {
        await adminLogout();
      } else {
        await logout();
      }
      setActiveView('main');
      setAttractiveness(null);
      setError(null);
      setIsAdminMode(false); // ログアウト時に管理者モードをリセット
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  }, [isAdmin, adminLogout, logout]);

  // 管理者モードとユーザーモードの切り替え
  const handleToggleMode = useCallback(() => {
    setIsAdminMode(!isAdminMode);
    setActiveView('main'); // ユーザーモードに切り替える際はメイン画面に戻る
  }, [isAdminMode]);

  const handleSubmit = useCallback(async (fact: string) => {
    if (!fact.trim()) {
      setError('会社の事実を入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAttractiveness(null);
    setAnalysisStartTime(Date.now());
    
    try {
      console.log('AI分析開始:', fact);
      const result = await generateAttractivenessPoints(fact);
      console.log('AI分析完了:', result);
      
      if (result && result.points && result.points.length > 0) {
        setAttractiveness(result);
        setError(null);
        
        // 分析履歴を保存
        if (currentUser && analysisStartTime) {
          const sessionDuration = Math.round((Date.now() - analysisStartTime) / 1000);
          await saveAnalysisHistory(currentUser.uid, fact, result, sessionDuration);
        }
      } else {
        setError('AI分析の結果が正しく取得できませんでした');
      }
    } catch (err) {
      console.error('AI分析エラー:', err);
      const errorMessage = err instanceof Error ? err.message : 'AI分析中にエラーが発生しました';
      setError(errorMessage);
      setAttractiveness(null);
    } finally {
      setIsLoading(false);
      setAnalysisStartTime(null);
    }
  }, [currentUser, analysisStartTime]);

  // エラーが発生した場合のリセット処理
  const handleErrorReset = useCallback(() => {
    setError(null);
    setAttractiveness(null);
    setIsLoading(false);
  }, []);

  // デバッグ用：現在の状態をログ出力
  useEffect(() => {
    console.log('App状態:', {
      currentUser: !!currentUser,
      isAdmin,
      currentAdmin: !!currentAdmin,
      activeView,
      isLoading,
      error,
      attractiveness: !!attractiveness,
      isAdminMode: isAdminMode
    });
  }, [currentUser, isAdmin, currentAdmin, activeView, isLoading, error, attractiveness, isAdminMode]);

  // 予期しないエラーが発生した場合のセーフティネット
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('未処理のエラー:', event.error);
      setError('予期しないエラーが発生しました。ページを再読み込みしてください。');
      setIsLoading(false);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('未処理のPromise拒否:', event.reason);
      setError('処理中にエラーが発生しました。再試行してください。');
      setIsLoading(false);
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // ローディング状態が長時間続く場合のタイムアウト処理
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        console.warn('AI分析がタイムアウトしました');
        setError('AI分析が時間内に完了しませんでした。再試行してください。');
        setIsLoading(false);
      }, 30000); // 30秒でタイムアウト
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  // Admin routing logic
  if (isAdmin && currentAdmin) {
    return <AdminDashboard />;
  }
  
  // yamane@potentialight.comでログインした場合の特別な処理
  if (currentUser && currentUser.email === 'yamane@potentialight.com') {
    // 管理者としてログインしている場合は管理者モードを有効にする
    if (isAdmin && !isAdminMode) {
      setIsAdminMode(true);
    }
    
    // 管理者モードの場合は管理画面を表示
    if (isAdminMode) {
      return <AdminDashboard />;
    }
    
    // 管理者としてログインしていない場合は管理者ログインページを表示
    if (!isAdmin) {
      return <AdminLoginPage />;
    }
  }

  // General user routing logic
  if (currentUser && !isAdmin) {
    if (activeView === 'theme') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* ヘッダー */}
          <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <ZapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    採用魅力発見アシスタント
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveView('main')}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <InfoIcon className="w-4 h-4 mr-2" />
                    メイン画面
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* ヘッダー */}
          <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <ZapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    採用魅力発見アシスタント
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveView('main')}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <InfoIcon className="w-4 h-4 mr-2" />
                    メイン画面
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </header>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <Cog6ToothIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">設定画面</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">この画面では、アプリケーションの詳細設定を行うことができます。</p>
              <button onClick={() => setActiveView('main')} className="bg-blue-600 dark:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                メイン画面に戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeView === 'analytics') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* ヘッダー */}
          <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <ZapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    採用魅力発見アシスタント
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveView('main')}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <InfoIcon className="w-4 h-4 mr-2" />
                    メイン画面
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </header>
          <UserAnalytics />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* ヘッダー */}
        <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <ZapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  採用魅力発見アシスタント
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* yamane@potentialight.comの場合のみ管理者モード切り替えボタンを表示 */}
                {currentUser && currentUser.email === 'yamane@potentialight.com' && (
                  <button
                    onClick={handleToggleMode}
                    className="flex items-center px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors border border-purple-200 dark:border-purple-700"
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    管理者モードに切り替え
                  </button>
                )}
                <button
                  onClick={() => setActiveView('theme')}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <PaletteIcon className="w-4 h-4 mr-2" />
                  テーマ設定
                </button>
                <button
                  onClick={() => setActiveView('settings')}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  設定
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  分析履歴
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  ログアウト
                </button>
              </div>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">採用魅力発見アシスタントへようこそ！</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">あなたの企業の魅力をAIが分析し、採用活動に活用できるポイントをお伝えします</p>
            </div>
            <FactInputForm onSubmit={handleSubmit} />
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onReset={handleErrorReset} />}
            {attractiveness && <AttractivenessDisplay attractiveness={attractiveness} />}
          </main>
        </div>
      );
    }
  }
  
  return <LoginPage />;
};

export default App;