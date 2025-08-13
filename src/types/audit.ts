// 監査ログのイベントタイプ
export type AuditEventType = 
  | 'user.login'           // ユーザーログイン
  | 'user.logout'          // ユーザーログアウト
  | 'user.account_created' // アカウント作成
  | 'user.account_deleted' // アカウント削除
  | 'admin.user_created'   // 管理者によるユーザー作成
  | 'admin.user_deleted'   // 管理者によるユーザー削除
  | 'admin.settings_changed' // 管理者設定変更
  | 'system.error'          // システムエラー
  | 'security.alert'        // セキュリティアラート
  | 'performance.metric';   // パフォーマンス指標

// 監査ログの重要度レベル
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

// 監査ログの基本構造
export interface AuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  userDisplayName?: string;
  action: AuditEventType;
  targetId?: string;        // 操作対象のID
  targetType?: string;      // 操作対象の種類
  description: string;      // 操作の詳細説明
  metadata: Record<string, any>; // 追加情報
  severity: AuditSeverity;
  timestamp: Date;          // サーバー時刻
  ipAddress?: string;       // IPアドレス（取得可能な場合）
  userAgent?: string;       // ユーザーエージェント
  sessionId?: string;       // セッションID
  success: boolean;         // 操作が成功したか
  errorMessage?: string;    // エラーメッセージ（失敗時）
}

// 監査ログの検索・フィルタ条件
export interface AuditLogFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditEventType;
  severity?: AuditSeverity;
  success?: boolean;
  searchText?: string;
}

// 監査ログの集計結果
export interface AuditStats {
  totalLogs: number;
  successCount: number;
  errorCount: number;
  uniqueUsers: number;
  topActions: Array<{ action: AuditEventType; count: number }>;
  topUsers: Array<{ userId: string; email: string; actionCount: number }>;
  recentActivity: AuditLog[];
}

// セキュリティアラートの設定
export interface SecurityAlertRule {
  id: string;
  name: string;
  description: string;
  condition: {
    eventType: AuditEventType;
    threshold: number;      // しきい値
    timeWindow: number;     // 時間窓（分）
    severity: AuditSeverity;
  };
  enabled: boolean;
  actions: string[];        // 実行するアクション
}

// 監査ログのエクスポート設定
export interface AuditExportConfig {
  format: 'csv' | 'json';
  filters: AuditLogFilter;
  includeMetadata: boolean;
  maxRecords: number;
}
