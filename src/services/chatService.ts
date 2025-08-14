import { 
  ref, 
  push, 
  onValue, 
  off, 
  set, 
  update, 
  query, 
  orderByChild, 
  equalTo,
  serverTimestamp 
} from 'firebase/database';
import { database } from '../firebase';
import type { 
  ChatMessage, 
  ChatSession, 
  SlackNotification, 
  ChatConfig 
} from '../types/chat';

// チャットメッセージの送信
export const sendMessage = async (
  sessionId: string,
  userId: string,
  userName: string,
  userEmail: string,
  message: string,
  isFromUser: boolean = true
): Promise<string> => {
  try {
    const messageRef = ref(database, `chat/messages/${sessionId}`);
    const newMessageRef = push(messageRef);
    
    const chatMessage: Omit<ChatMessage, 'id'> = {
      userId,
      userName,
      userEmail,
      message,
      timestamp: new Date(),
      isFromUser,
      isRead: false,
      sessionId
    };

    await set(newMessageRef, chatMessage);
    
    // セッションの最終メッセージ時刻を更新
    await updateSessionLastMessage(sessionId);
    
    // ユーザーメッセージの場合はSlackに通知
    if (isFromUser) {
      await sendSlackNotification(sessionId, userName, userEmail, message);
    }
    
    return newMessageRef.key || '';
  } catch (error) {
    console.error('メッセージ送信エラー:', error);
    throw error;
  }
};

// チャットセッションの作成
export const createChatSession = async (
  userId: string,
  userName: string,
  userEmail: string
): Promise<string> => {
  try {
    const sessionRef = ref(database, 'chat/sessions');
    const newSessionRef = push(sessionRef);
    
    const session: Omit<ChatSession, 'id'> = {
      userId,
      userName,
      userEmail,
      status: 'active',
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messageCount: 0,
      isOnline: true
    };

    await set(newSessionRef, session);
    return newSessionRef.key || '';
  } catch (error) {
    console.error('セッション作成エラー:', error);
    throw error;
  }
};

// セッションの最終メッセージ時刻を更新
export const updateSessionLastMessage = async (sessionId: string): Promise<void> => {
  try {
    const sessionRef = ref(database, `chat/sessions/${sessionId}`);
    await update(sessionRef, {
      lastMessageAt: new Date(),
      messageCount: serverTimestamp()
    });
  } catch (error) {
    console.error('セッション更新エラー:', error);
  }
};

// メッセージの読み取り状態を更新
export const markMessageAsRead = async (sessionId: string, messageId: string): Promise<void> => {
  try {
    const messageRef = ref(database, `chat/messages/${sessionId}/${messageId}`);
    await update(messageRef, { isRead: true });
  } catch (error) {
    console.error('メッセージ読み取り状態更新エラー:', error);
  }
};

// セッションのメッセージを監視
export const subscribeToMessages = (
  sessionId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const messagesRef = ref(database, `chat/messages/${sessionId}`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      messages.push({
        id: childSnapshot.key || '',
        ...message,
        timestamp: new Date(message.timestamp)
      });
    });
    
    // タイムスタンプでソート
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    callback(messages);
  });

  return unsubscribe;
};

// ユーザーのアクティブセッションを取得
export const getUserActiveSession = async (userId: string): Promise<ChatSession | null> => {
  try {
    const sessionsRef = ref(database, 'chat/sessions');
    const userSessionsQuery = query(
      sessionsRef,
      orderByChild('userId'),
      equalTo(userId)
    );

    return new Promise((resolve) => {
      onValue(userSessionsQuery, (snapshot) => {
        let activeSession: ChatSession | null = null;
        
        snapshot.forEach((childSnapshot) => {
          const session = childSnapshot.val();
          if (session.status === 'active') {
            activeSession = {
              id: childSnapshot.key || '',
              ...session,
              createdAt: new Date(session.createdAt),
              lastMessageAt: new Date(session.lastMessageAt)
            };
          }
        });
        
        resolve(activeSession);
        off(userSessionsQuery);
      });
    });
  } catch (error) {
    console.error('アクティブセッション取得エラー:', error);
    return null;
  }
};

// Slack通知の送信
export const sendSlackNotification = async (
  sessionId: string,
  userName: string,
  userEmail: string,
  message: string
): Promise<void> => {
  try {
    const slackWebhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL;
    
    if (!slackWebhookUrl) {
      console.warn('Slack Webhook URLが設定されていません');
      return;
    }

    const notification: SlackNotification = {
      channel: '#customer-support',
      text: `新しいチャットメッセージが届きました`,
      username: '採用魅力発見アシスタント',
      icon_emoji: ':speech_balloon:',
      attachments: [
        {
          color: '#36a64f',
          title: `${userName} からのメッセージ`,
          text: message,
          fields: [
            {
              title: 'ユーザー',
              value: userName,
              short: true
            },
            {
              title: 'メールアドレス',
              value: userEmail,
              short: true
            },
            {
              title: 'セッションID',
              value: sessionId,
              short: true
            },
            {
              title: '時刻',
              value: new Date().toLocaleString('ja-JP'),
              short: true
            }
          ],
          footer: '採用魅力発見アシスタント サポート',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification)
    });

    if (!response.ok) {
      throw new Error(`Slack通知送信エラー: ${response.status}`);
    }
  } catch (error) {
    console.error('Slack通知送信エラー:', error);
  }
};

// チャット設定の取得
export const getChatConfig = (): ChatConfig => {
  const defaultConfig: ChatConfig = {
    enabled: true,
    autoOpen: false,
    welcomeMessage: 'こんにちは！採用魅力発見アシスタントのサポートです。何かお困りのことがございましたら、お気軽にお声かけください。',
    officeHours: {
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Asia/Tokyo'
    },
    notifications: {
      sound: true,
      desktop: true,
      email: false
    }
  };

  const savedConfig = localStorage.getItem('chatConfig');
  if (savedConfig) {
    try {
      return { ...defaultConfig, ...JSON.parse(savedConfig) };
    } catch (error) {
      console.error('チャット設定の読み込みエラー:', error);
    }
  }

  return defaultConfig;
};

// チャット設定の保存
export const saveChatConfig = (config: ChatConfig): void => {
  try {
    localStorage.setItem('chatConfig', JSON.stringify(config));
  } catch (error) {
    console.error('チャット設定の保存エラー:', error);
  }
};

// 営業時間内かどうかをチェック
export const isWithinOfficeHours = (): boolean => {
  const config = getChatConfig();
  
  if (!config.officeHours.enabled) {
    return true;
  }

  const now = new Date();
  const currentTime = now.toLocaleTimeString('ja-JP', { 
    hour12: false, 
    timeZone: config.officeHours.timezone 
  });

  return currentTime >= config.officeHours.startTime && 
         currentTime <= config.officeHours.endTime;
};
