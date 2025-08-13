import type { AuditLog, AuditLogFilter, AuditStats, AuditEventType, AuditSeverity } from '../types/audit';

// 初期サンプルデータの設定
const initializeSampleData = () => {
  if (localStorage.getItem('auditLogs')) return; // 既にデータがある場合は何もしない
  
  const sampleLogs: AuditLog[] = [
    {
      id: 'sample-1',
      userId: 'admin',
      userEmail: 'yamane@potentialight.com',
      userDisplayName: '管理者',
      action: 'admin.user_created',
      targetId: 'user-001',
      targetType: 'user',
      description: '管理者がユーザーアカウントを作成: test@example.com',
      metadata: { newUserEmail: 'test@example.com' },
      severity: 'medium',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2時間前
      success: true
    },
    {
      id: 'sample-2',
      userId: 'user-001',
      userEmail: 'test@example.com',
      userDisplayName: 'テストユーザー',
      action: 'user.login',
      description: 'ユーザーログイン成功',
      metadata: {},
      severity: 'low',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1時間前
      success: true
    },
    {
      id: 'sample-3',
      userId: 'user-002',
      userEmail: 'unknown@example.com',
      userDisplayName: '不明ユーザー',
      action: 'user.login',
      description: 'ユーザーログイン失敗',
      metadata: {},
      severity: 'medium',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30分前
      success: false,
      errorMessage: 'パスワードが正しくありません'
    },
    {
      id: 'sample-4',
      userId: 'admin',
      userEmail: 'yamane@potentialight.com',
      userDisplayName: '管理者',
      action: 'admin.settings_changed',
      description: '管理者設定を変更',
      metadata: { setting: 'security_level', value: 'high' },
      severity: 'high',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15分前
      success: true
    }
  ];
  
  localStorage.setItem('auditLogs', JSON.stringify(sampleLogs));
};

// 初期化を実行
initializeSampleData();

// 監査ログの記録（非同期・ベストエフォート）
export const recordAuditLog = async (logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const auditLog: AuditLog = {
      ...logData,
      id: generateId(),
      timestamp: new Date(),
    };

    // ローカルストレージに一時保存（本格実装ではデータベースに保存）
    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.push(auditLog);
    
    // 最大1000件まで保持
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs));
    
    // コンソールにも出力（開発用）
    console.log('🔍 監査ログ記録:', auditLog);
    
  } catch (error) {
    // 監査ログの失敗は本処理に影響を与えない
    console.error('監査ログ記録に失敗:', error);
  }
};

// 監査ログの取得
export const getAuditLogs = async (filter: AuditLogFilter = {}): Promise<AuditLog[]> => {
  try {
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    
    // フィルタリング
    let filteredLogs = logs.filter((log: AuditLog) => {
      if (filter.startDate && new Date(log.timestamp) < filter.startDate) return false;
      if (filter.endDate && new Date(log.timestamp) > filter.endDate) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.action && log.action !== filter.action) return false;
      if (filter.severity && log.severity !== filter.severity) return false;
      if (filter.success !== undefined && log.success !== filter.success) return false;
      if (filter.searchText && !log.description.toLowerCase().includes(filter.searchText.toLowerCase())) return false;
      
      return true;
    });
    
    // タイムスタンプでソート（新しい順）
    filteredLogs.sort((a: AuditLog, b: AuditLog) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return filteredLogs;
  } catch (error) {
    console.error('監査ログ取得に失敗:', error);
    return [];
  }
};

// 監査統計の取得
export const getAuditStats = async (): Promise<AuditStats> => {
  try {
    const logs = await getAuditLogs();
    
    // 基本統計
    const totalLogs = logs.length;
    const successCount = logs.filter(log => log.success).length;
    const errorCount = totalLogs - successCount;
    
    // ユニークユーザー数
    const uniqueUsers = new Set(logs.map(log => log.userId)).size;
    
    // アクション別集計
    const actionCounts: Record<string, number> = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action: action as AuditEventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // ユーザー別集計
    const userCounts: Record<string, number> = {};
    logs.forEach(log => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });
    
    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => {
        const userLog = logs.find(log => log.userId === userId);
        return {
          userId,
          email: userLog?.userEmail || 'Unknown',
          actionCount: count
        };
      })
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 5);
    
    // 最近のアクティビティ
    const recentActivity = logs.slice(0, 10);
    
    return {
      totalLogs,
      successCount,
      errorCount,
      uniqueUsers,
      topActions,
      topUsers,
      recentActivity
    };
  } catch (error) {
    console.error('監査統計取得に失敗:', error);
    return {
      totalLogs: 0,
      successCount: 0,
      errorCount: 0,
      uniqueUsers: 0,
      topActions: [],
      topUsers: [],
      recentActivity: []
    };
  }
};

// セキュリティアラートのチェック
export const checkSecurityAlerts = async (): Promise<AuditLog[]> => {
  try {
    const logs = await getAuditLogs();
    const alerts: AuditLog[] = [];
    
    // 連続ログイン失敗のチェック
    const recentLogins = logs.filter(log => 
      log.action === 'user.login' && 
      new Date(log.timestamp) > new Date(Date.now() - 30 * 60 * 1000) // 30分以内
    );
    
    const failedLogins = recentLogins.filter(log => !log.success);
    if (failedLogins.length >= 5) {
      alerts.push({
        id: generateId(),
        userId: 'system',
        action: 'security.alert',
        description: `連続ログイン失敗が検出されました: ${failedLogins.length}回`,
        metadata: { failedLogins: failedLogins.length },
        severity: 'high',
        timestamp: new Date(),
        success: true
      });
    }
    
    // 大量削除のチェック
    const recentDeletions = logs.filter(log => 
      log.action === 'admin.user_deleted' && 
      new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // 1時間以内
    );
    
    if (recentDeletions.length >= 10) {
      alerts.push({
        id: generateId(),
        userId: 'system',
        action: 'security.alert',
        description: `短時間での大量削除が検出されました: ${recentDeletions.length}件`,
        metadata: { deletions: recentDeletions.length },
        severity: 'critical',
        timestamp: new Date(),
        success: true
      });
    }
    
    return alerts;
  } catch (error) {
    console.error('セキュリティアラートチェックに失敗:', error);
    return [];
  }
};

// 監査ログのエクスポート
export const exportAuditLogs = async (format: 'csv' | 'json', filters: AuditLogFilter = {}): Promise<string> => {
  try {
    const logs = await getAuditLogs(filters);
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV形式
      const headers = ['ID', 'ユーザーID', 'メール', 'アクション', '説明', '重要度', 'タイムスタンプ', '成功', 'IPアドレス'];
      const csvRows = [headers.join(',')];
      
      logs.forEach(log => {
        const row = [
          log.id,
          log.userId,
          log.userEmail || '',
          log.action,
          log.description.replace(/"/g, '""'),
          log.severity,
          log.timestamp.toISOString(),
          log.success ? '成功' : '失敗',
          log.ipAddress || ''
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    }
  } catch (error) {
    console.error('監査ログエクスポートに失敗:', error);
    throw new Error('エクスポートに失敗しました');
  }
};

// ユーティリティ関数
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// プリセット監査ログ記録関数
export const auditLogPresets = {
  // ユーザーログイン
  userLogin: (userId: string, userEmail: string, success: boolean, ipAddress?: string, userAgent?: string) => {
    recordAuditLog({
      userId,
      userEmail,
      action: 'user.login',
      description: success ? 'ユーザーログイン成功' : 'ユーザーログイン失敗',
      metadata: { ipAddress, userAgent },
      severity: success ? 'low' : 'medium',
      success,
      ipAddress,
      userAgent
    });
  },
  
  // ユーザーログアウト
  userLogout: (userId: string, userEmail: string, ipAddress?: string) => {
    recordAuditLog({
      userId,
      userEmail,
      action: 'user.logout',
      description: 'ユーザーログアウト',
      metadata: { ipAddress },
      severity: 'low',
      success: true,
      ipAddress
    });
  },
  
  // 管理者によるユーザー作成
  adminUserCreated: (adminUserId: string, adminEmail: string, newUserEmail: string) => {
    recordAuditLog({
      userId: adminUserId,
      userEmail: adminEmail,
      action: 'admin.user_created',
      description: `管理者がユーザーアカウントを作成: ${newUserEmail}`,
      metadata: { newUserEmail },
      severity: 'medium',
      success: true
    });
  },
  
  // 管理者によるユーザー削除
  adminUserDeleted: (adminUserId: string, adminEmail: string, deletedUserEmail: string) => {
    recordAuditLog({
      userId: adminUserId,
      userEmail: adminEmail,
      action: 'admin.user_deleted',
      description: `管理者がユーザーアカウントを削除: ${deletedUserEmail}`,
      metadata: { deletedUserEmail },
      severity: 'high',
      success: true
    });
  }
};
