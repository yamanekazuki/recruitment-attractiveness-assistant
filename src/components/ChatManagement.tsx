import React, { useState, useEffect, useCallback } from 'react';
import { 
  ref, 
  onValue, 
  off, 
  update, 
  query, 
  orderByChild, 
  equalTo 
} from 'firebase/database';
import { database } from '../firebase';
import { sendMessage } from '../services/chatService';
import type { ChatMessage, ChatSession } from '../types/chat';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon
} from './Icons';

interface ChatManagementProps {
  className?: string;
}

const ChatManagement: React.FC<ChatManagementProps> = ({ className = '' }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // アクティブセッションの監視
  useEffect(() => {
    const sessionsRef = ref(database, 'chat/sessions');
    const activeSessionsQuery = query(
      sessionsRef,
      orderByChild('status'),
      equalTo('active')
    );

    const unsubscribe = onValue(activeSessionsQuery, (snapshot) => {
      const sessionList: ChatSession[] = [];
      snapshot.forEach((childSnapshot) => {
        const session = childSnapshot.val();
        sessionList.push({
          id: childSnapshot.key || '',
          ...session,
          createdAt: new Date(session.createdAt),
          lastMessageAt: new Date(session.lastMessageAt)
        });
      });
      
      // 最終メッセージ時刻でソート（新しい順）
      sessionList.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
      setSessions(sessionList);
    });

    return () => {
      off(activeSessionsQuery);
    };
  }, []);

  // 選択されたセッションのメッセージを監視
  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(database, `chat/messages/${selectedSession.id}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messageList: ChatMessage[] = [];
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        messageList.push({
          id: childSnapshot.key || '',
          ...message,
          timestamp: new Date(message.timestamp)
        });
      });
      
      // タイムスタンプでソート
      messageList.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setMessages(messageList);
    });

    return () => {
      off(messagesRef);
    };
  }, [selectedSession]);

  // 管理者メッセージの送信
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !selectedSession) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      setIsLoading(true);
      
      await sendMessage(
        selectedSession.id,
        'admin',
        'サポート担当者',
        'admin@example.com',
        message,
        false // 管理者からのメッセージ
      );
      
      setIsLoading(false);
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      setIsLoading(false);
    }
  }, [inputMessage, selectedSession]);

  // Enterキーでメッセージ送信
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // セッションのステータスを更新
  const updateSessionStatus = useCallback(async (sessionId: string, status: 'active' | 'closed') => {
    try {
      const sessionRef = ref(database, `chat/sessions/${sessionId}`);
      await update(sessionRef, { status });
    } catch (error) {
      console.error('セッション状態更新エラー:', error);
    }
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 text-blue-600" />
          チャット管理
        </h2>
        <p className="text-gray-600 mt-2">アクティブなチャットセッションを管理できます</p>
      </div>

      <div className="flex h-96">
        {/* セッション一覧 */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">アクティブセッション ({sessions.length})</h3>
          </div>
          <div className="overflow-y-auto h-full">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                アクティブなセッションがありません
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSession?.id === session.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{session.userName}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {session.lastMessageAt.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <EnvelopeIcon className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500 truncate">{session.userEmail}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <ClockIcon className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {session.messageCount} メッセージ
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* チャットエリア */}
        <div className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              {/* チャットヘッダー */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedSession.userName}</h3>
                    <p className="text-sm text-gray-500">{selectedSession.userEmail}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateSessionStatus(selectedSession.id, 'closed')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      セッション終了
                    </button>
                  </div>
                </div>
              </div>

              {/* メッセージエリア */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.isFromUser
                            ? 'bg-white text-gray-800 border border-gray-200'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.isFromUser ? 'text-gray-500' : 'text-blue-100'
                        }`}>
                          {message.timestamp.toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 入力エリア */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="メッセージを入力..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              セッションを選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManagement;
