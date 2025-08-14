import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  sendMessage, 
  createChatSession, 
  getUserActiveSession, 
  subscribeToMessages,
  getChatConfig,
  isWithinOfficeHours 
} from '../services/chatService';
import type { ChatMessage, ChatSession, ChatState } from '../types/chat';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon,
  PlusIcon
} from './Icons';

interface ChatWidgetProps {
  className?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    isMinimized: false,
    isLoading: false,
    messages: [],
    currentSession: null,
    unreadCount: 0,
    isTyping: false,
    error: null
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [config, setConfig] = useState(getChatConfig());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // メッセージを最下部にスクロール
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // チャットセッションの初期化
  const initializeChat = useCallback(async () => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // 既存のアクティブセッションを確認
      let session = await getUserActiveSession(currentUser.uid);
      
      if (!session) {
        // 新しいセッションを作成
        const sessionId = await createChatSession(
          currentUser.uid,
          currentUser.displayName || currentUser.email?.split('@')[0] || 'ユーザー',
          currentUser.email || ''
        );
        
        session = {
          id: sessionId,
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'ユーザー',
          userEmail: currentUser.email || '',
          status: 'active',
          createdAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: 0,
          isOnline: true
        };
      }

      setState(prev => ({ 
        ...prev, 
        currentSession: session,
        isLoading: false 
      }));

      // メッセージの監視を開始
      if (session) {
        const unsubscribe = subscribeToMessages(session.id, (messages) => {
          setState(prev => {
            const newUnreadCount = messages.filter(m => !m.isRead && !m.isFromUser).length;
            return {
              ...prev,
              messages,
              unreadCount: prev.isOpen ? 0 : newUnreadCount
            };
          });
        });

        // クリーンアップ関数を返す
        return unsubscribe;
      }
    } catch (error) {
      console.error('チャット初期化エラー:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'チャットの初期化に失敗しました',
        isLoading: false 
      }));
    }
  }, [currentUser]);

  // メッセージ送信
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !state.currentSession || !currentUser) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      setState(prev => ({ ...prev, isTyping: true }));
      
      await sendMessage(
        state.currentSession.id,
        currentUser.uid,
        currentUser.displayName || currentUser.email?.split('@')[0] || 'ユーザー',
        currentUser.email || '',
        message,
        true
      );
      
      setState(prev => ({ ...prev, isTyping: false }));
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'メッセージの送信に失敗しました',
        isTyping: false 
      }));
    }
  }, [inputMessage, state.currentSession, currentUser]);

  // チャットを開く
  const openChat = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isOpen: true, 
      isMinimized: false,
      unreadCount: 0 
    }));
    
    // 入力フィールドにフォーカス
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // チャットを閉じる
  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // チャットを最小化
  const minimizeChat = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  // Enterキーでメッセージ送信
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 初期化とメッセージ監視
  useEffect(() => {
    if (currentUser && state.isOpen) {
      const unsubscribe = initializeChat();
      return () => {
        if (unsubscribe) {
          unsubscribe.then(unsub => unsub());
        }
      };
    }
  }, [currentUser, state.isOpen, initializeChat]);

  // メッセージが更新されたらスクロール
  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  // 設定の自動読み込み
  useEffect(() => {
    setConfig(getChatConfig());
  }, []);

  // 営業時間外の場合は表示しない
  if (!isWithinOfficeHours()) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* チャットボタン（閉じている時） */}
      {!state.isOpen && (
        <button
          onClick={openChat}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
          title="サポートチャットを開く"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          {state.unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {state.unreadCount > 9 ? '9+' : state.unreadCount}
            </span>
          )}
        </button>
      )}

      {/* チャットウィンドウ */}
      {state.isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 flex flex-col">
          {/* ヘッダー */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              <span className="font-semibold">サポートチャット</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={minimizeChat}
                className="text-white hover:text-gray-200 transition-colors"
                title="最小化"
              >
                {state.isMinimized ? <PlusIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={closeChat}
                className="text-white hover:text-gray-200 transition-colors"
                title="閉じる"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* チャット内容 */}
          {!state.isMinimized && (
            <>
              {/* メッセージエリア */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {state.isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : state.error ? (
                  <div className="text-red-600 text-center p-4">
                    {state.error}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* ウェルカムメッセージ */}
                    {state.messages.length === 0 && (
                      <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
                        <p className="text-sm">{config.welcomeMessage}</p>
                      </div>
                    )}
                    
                    {/* メッセージ一覧 */}
                    {state.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            message.isFromUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.isFromUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* タイピングインジケーター */}
                    {state.isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* 入力エリア */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="メッセージを入力..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={state.isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || state.isTyping}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
