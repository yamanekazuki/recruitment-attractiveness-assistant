// チャットメッセージの型定義
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  timestamp: Date;
  isFromUser: boolean;
  isRead: boolean;
  sessionId: string;
}

// チャットセッションの型定義
export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'active' | 'closed' | 'pending';
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  isOnline: boolean;
}

// Slack通知の型定義
export interface SlackNotification {
  channel: string;
  text: string;
  attachments?: SlackAttachment[];
  username?: string;
  icon_emoji?: string;
}

export interface SlackAttachment {
  color: string;
  title: string;
  text: string;
  fields?: SlackField[];
  footer?: string;
  ts?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short: boolean;
}

// チャット設定の型定義
export interface ChatConfig {
  enabled: boolean;
  autoOpen: boolean;
  welcomeMessage: string;
  officeHours: {
    enabled: boolean;
    startTime: string; // "09:00"
    endTime: string;   // "18:00"
    timezone: string;  // "Asia/Tokyo"
  };
  notifications: {
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
}

// チャット状態の型定義
export interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  currentSession: ChatSession | null;
  unreadCount: number;
  isTyping: boolean;
  error: string | null;
}
