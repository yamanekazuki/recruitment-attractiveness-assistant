import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAuth } from '../contexts/AuthContext';
import { ZapIcon, UserPlusIcon, UsersIcon, LogOutIcon, EyeIcon, DownloadIcon, ChartBarIcon, ExclamationTriangleIcon, UserIcon, ChatBubbleLeftRightIcon } from '../../components/Icons';
import { auditLogPresets, getAuditLogs, getAuditStats, checkSecurityAlerts, exportAuditLogs } from '../services/auditService';
import type { AuditLog, AuditLogFilter, AuditStats } from '../types/audit';
import ChatManagement from './ChatManagement';

const AdminDashboard: React.FC = () => {
  const { adminLogout } = useAdminAuth();
  const { signup } = useAuth();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // 監査ログ関連の状態
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'analytics' | 'chat'>('users');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState<AuditLogFilter>({});
  const [auditLoading, setAuditLoading] = useState(false);

  // 初期データ読み込み
  useEffect(() => {
    loadAuditData();
  }, []);

  // 監査データの読み込み
  const loadAuditData = async () => {
    setAuditLoading(true);
    try {
      const [logs, stats, alerts] = await Promise.all([
        getAuditLogs(auditFilter),
        getAuditStats(),
        checkSecurityAlerts()
      ]);
      
      setAuditLogs(logs);
      setAuditStats(stats);
      setSecurityAlerts(alerts);
    } catch (error) {
      console.error('監査データ読み込みエラー:', error);
    } finally {
      setAuditLoading(false);
    }
  };

  // メール送信機能
  const sendAccountNotification = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/send-account-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: email,
          userPassword: password,
          adminEmail: 'yamane@potentialight.com'
        }),
      });

      if (!response.ok) {
        throw new Error('メール送信に失敗しました');
      }

      return true;
    } catch (error) {
      console.error('メール送信エラー:', error);
      return false;
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // ユーザーアカウントを作成
      await signup(newUserEmail, newUserPassword);
      
      // 監査ログを記録
      await auditLogPresets.adminUserCreated(
        'admin', 
        'yamane@potentialight.com', 
        newUserEmail
      );
      
      // アカウント作成成功後、メール通知を送信
      const emailSent = await sendAccountNotification(newUserEmail, newUserPassword);
      
      if (emailSent) {
        setMessage('ユーザーアカウントが正常に作成され、メール通知が送信されました');
        setMessageType('success');
      } else {
        setMessage('ユーザーアカウントは作成されましたが、メール通知の送信に失敗しました');
        setMessageType('error');
      }
      
      setNewUserEmail('');
      setNewUserPassword('');
      
      // 監査データを再読み込み
      loadAuditData();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`エラー: ${error.message}`);
      } else {
        setMessage('ユーザー作成に失敗しました');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // ユーザー画面に移動する関数
  const handleSwitchToUserMode = () => {
    // 管理画面からユーザー画面に切り替える
    // 親コンポーネント（App.tsx）の状態を更新する
    if (window.parent && window.parent !== window) {
      // 親ウィンドウが存在する場合
      window.parent.postMessage({ type: 'SWITCH_TO_USER_MODE' }, '*');
    } else {
      // 直接ページをリロードしてユーザーモードに戻る
      window.location.reload();
    }
  };

  // 監査ログのエクスポート
  const handleExportAuditLogs = async (format: 'csv' | 'json') => {
    try {
      const data = await exportAuditLogs(format, auditFilter);
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage('エクスポートに失敗しました');
      setMessageType('error');
    }
  };

  // 重要度に応じた色を取得
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ZapIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                採用魅力発見アシスタント - 管理画面
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSwitchToUserMode}
                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                ユーザー画面に移動
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* メッセージ表示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserPlusIcon className="w-5 h-5 inline mr-2" />
              ユーザー管理
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <EyeIcon className="w-5 h-5 inline mr-2" />
              監査ログ
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              分析・統計
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
              チャット管理
            </button>
          </nav>
        </div>

        {/* ユーザー管理タブ */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ユーザー作成セクション */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <UserPlusIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  新規ユーザー作成
                </h2>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="user@company.com"
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
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    パスワードは6文字以上で入力してください
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      作成中...
                    </div>
                  ) : (
                    'ユーザーアカウントを作成'
                  )}
                </button>
              </form>

              {/* メール通知の説明 */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  📧 アカウント作成後、指定されたメールアドレスにアカウント情報が自動送信されます
                </p>
              </div>
            </div>

            {/* 管理情報セクション */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <UsersIcon className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  管理情報
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">管理者権限</h3>
                  <p className="text-blue-700 text-sm">
                    この画面では、ユーザーアカウントの作成・管理が可能です。
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">セキュリティ</h3>
                  <p className="text-green-700 text-sm">
                    一般ユーザーは新規アカウントを作成できません。
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">ユーザー管理</h3>
                  <p className="text-purple-700 text-sm">
                    作成したユーザーアカウントは、一般ユーザー画面でログインできます。
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">メール通知</h3>
                  <p className="text-yellow-700 text-sm">
                    ユーザーアカウント作成時、自動的にメール通知が送信されます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 監査ログタブ */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* セキュリティアラート */}
            {securityAlerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-medium text-red-900">セキュリティアラート</h3>
                </div>
                <div className="space-y-2">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="text-sm text-red-700">
                      {alert.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* フィルタとエクスポート */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <input
                    type="date"
                    onChange={(e) => setAuditFilter(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : undefined }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="開始日"
                  />
                  <input
                    type="date"
                    onChange={(e) => setAuditFilter(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : undefined }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="終了日"
                  />
                  <input
                    type="text"
                    placeholder="検索..."
                    onChange={(e) => setAuditFilter(prev => ({ ...prev, searchText: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48"
                  />
                  <button
                    onClick={loadAuditData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    フィルタ適用
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportAuditLogs('csv')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportAuditLogs('json')}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    JSON
                  </button>
                </div>
              </div>
            </div>

            {/* 監査ログ一覧 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">監査ログ一覧</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイムスタンプ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">説明</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">重要度</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          読み込み中...
                        </td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          監査ログがありません
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{log.userEmail || log.userId}</div>
                              {log.userDisplayName && (
                                <div className="text-gray-500 text-xs">{log.userDisplayName}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {log.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              log.success 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.success ? '成功' : '失敗'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 分析・統計タブ */}
        {activeTab === 'analytics' && auditStats && (
          <div className="space-y-6">
            {/* KPIカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総ログ数</p>
                    <p className="text-2xl font-semibold text-gray-900">{auditStats.totalLogs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UsersIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">ユニークユーザー</p>
                    <p className="text-2xl font-semibold text-gray-900">{auditStats.uniqueUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <EyeIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">成功率</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {auditStats.totalLogs > 0 
                        ? Math.round((auditStats.successCount / auditStats.totalLogs) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">エラー数</p>
                    <p className="text-2xl font-semibold text-gray-900">{auditStats.errorCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 人気アクション */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">人気アクション Top 5</h3>
              <div className="space-y-3">
                {auditStats.topActions.map((action, index) => (
                  <div key={action.action} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{action.action}</span>
                    </div>
                    <span className="text-sm text-gray-500">{action.count}回</span>
                  </div>
                ))}
              </div>
            </div>

            {/* アクティブユーザー */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">アクティブユーザー Top 5</h3>
              <div className="space-y-3">
                {auditStats.topUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.userId}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{user.actionCount}回</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* チャット管理タブ */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <ChatManagement />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
