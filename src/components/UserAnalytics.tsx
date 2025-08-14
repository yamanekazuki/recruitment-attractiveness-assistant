import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  generateUserAnalytics, 
  getAnalysisHistory, 
  updateAnalysisHistory, 
  deleteAnalysisHistory 
} from '../services/historyService';
import type { 
  AnalysisHistory, 
  UserAnalytics, 
  CharmCategoryAnalysis 
} from '../types/analysis';
import { CHARM_CATEGORIES } from '../types/analysis';
import { 
  ChartBarIcon, 
  ClockIcon, 
  StarIcon, 
  BookmarkIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  TrendingUpIcon,
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  ArrowTrendingUpIcon
} from './Icons';

const UserAnalytics: React.FC = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<AnalysisHistory | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'insights' | 'improvements'>('overview');
  const [filter, setFilter] = useState({
    dateRange: 'all',
    category: 'all',
    rating: 'all'
  });

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = () => {
    if (!currentUser) return;
    
    const userAnalytics = generateUserAnalytics(currentUser.uid);
    const userHistory = getAnalysisHistory(currentUser.uid);
    
    setAnalytics(userAnalytics);
    setHistory(userHistory);
  };

  const handleHistoryUpdate = async (historyId: string, updates: Partial<AnalysisHistory>) => {
    if (!currentUser) return;
    
    await updateAnalysisHistory(currentUser.uid, historyId, updates);
    loadData();
  };

  const handleHistoryDelete = async (historyId: string) => {
    if (!currentUser || !confirm('この履歴を削除しますか？')) return;
    
    await deleteAnalysisHistory(currentUser.uid, historyId);
    loadData();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '不明';
    }
  };

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ユーザー分析・履歴管理
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                連続使用: {analytics.streakDays}日
              </span>
              <FireIcon className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: '概要', icon: ChartBarIcon },
              { id: 'history', label: '履歴', icon: ClockIcon },
              { id: 'insights', label: 'インサイト', icon: LightBulbIcon },
              { id: 'improvements', label: '改善提案', icon: TrendingUpIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPIカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">総分析回数</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalAnalyses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <StarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">総魅力ポイント</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalCharmPoints}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平均分析時間</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(analytics.averageSessionDuration)}秒
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <TrophyIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">連続使用日数</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.streakDays}日</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6P CGM Tech分類の使用状況 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                6P CGM Tech分類の使用状況
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHARM_CATEGORIES.map((category) => {
                  const usage = analytics.favoriteCategories.find(c => c.id === category.id);
                  const isFavorite = usage !== undefined;
                  
                  return (
                    <div
                      key={category.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isFavorite
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                        {isFavorite && (
                          <StarIcon className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 業界別分析 */}
            {analytics.industryBreakdown.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  業界別分析状況
                </h3>
                <div className="space-y-3">
                  {analytics.industryBreakdown.map((industry) => (
                    <div key={industry.industry} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{industry.industry}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {industry.count}回
                        </span>
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${industry.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {industry.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 履歴タブ */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* フィルター */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filter.dateRange}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">全期間</option>
                  <option value="today">今日</option>
                  <option value="week">今週</option>
                  <option value="month">今月</option>
                </select>

                <select
                  value={filter.category}
                  onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">全カテゴリ</option>
                  {CHARM_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filter.rating}
                  onChange={(e) => setFilter(prev => ({ ...prev, rating: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">全評価</option>
                  <option value="high">高評価（4-5）</option>
                  <option value="medium">中評価（3）</option>
                  <option value="low">低評価（1-2）</option>
                </select>
              </div>
            </div>

            {/* 履歴リスト */}
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedHistory(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.timestamp)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.sessionDuration}秒
                        </span>
                        {item.isBookmarked && (
                          <BookmarkIcon className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        入力: {item.userInput}
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {item.charmCategories.map((cc) => (
                          <div
                            key={cc.category.id}
                            className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <span className="text-sm">{cc.category.icon}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {cc.category.name}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(cc.strength)}`}>
                              {getStrengthText(cc.strength)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHistory(item);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHistoryUpdate(item.id, { isBookmarked: !item.isBookmarked });
                        }}
                        className={`p-2 transition-colors ${
                          item.isBookmarked
                            ? 'text-yellow-500'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <BookmarkIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHistoryDelete(item.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* インサイトタブ */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* 使用パターン分析 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                使用パターン分析
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.usagePatterns.map((pattern) => (
                  <div key={pattern.pattern} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {pattern.pattern}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">使用頻度</span>
                        <span className="text-gray-900 dark:text-white">{pattern.frequency}回</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">効果性</span>
                        <span className="text-gray-900 dark:text-white">
                          {pattern.effectiveness.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 魅力カテゴリの詳細分析 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                魅力カテゴリの詳細分析
              </h3>
              <div className="space-y-4">
                {CHARM_CATEGORIES.map((category) => {
                  const usage = analytics.favoriteCategories.find(c => c.id === category.id);
                  const usageCount = usage ? 1 : 0;
                  const usagePercentage = (usageCount / analytics.totalAnalyses) * 100;
                  
                  return (
                    <div key={category.id} className="flex items-center space-x-4">
                      <span className="text-2xl w-12">{category.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {usagePercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {usageCount}回使用
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 改善提案タブ */}
        {activeTab === 'improvements' && (
          <div className="space-y-6">
            {analytics.improvementSuggestions.length > 0 ? (
              <div className="space-y-4">
                {analytics.improvementSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.category.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        suggestion.impact === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                        suggestion.impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        <span className="text-2xl">{suggestion.category.icon}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {suggestion.category.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            suggestion.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {suggestion.impact === 'high' ? '重要' : 
                             suggestion.impact === 'medium' ? '中程度' : '軽微'}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {suggestion.suggestion}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            現在の使用率: {suggestion.currentUsage.toFixed(1)}%
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            推奨使用率: {suggestion.recommendedUsage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          #{index + 1}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          優先度
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                <TrophyIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  素晴らしいです！
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  現在、すべての魅力カテゴリをバランスよく活用できています。
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 履歴詳細モーダル */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  分析履歴の詳細
                </h3>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* 基本情報 */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">基本情報</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">分析日時:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {formatDate(selectedHistory.timestamp)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">分析時間:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedHistory.sessionDuration}秒
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">魅力ポイント数:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedHistory.output.points.length}個
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">タグ:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedHistory.tags.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ユーザー入力 */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">ユーザー入力</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white">{selectedHistory.userInput}</p>
                  </div>
                </div>

                {/* 魅力ポイント */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">生成された魅力ポイント</h4>
                  <div className="space-y-3">
                    {selectedHistory.output.points.map((point, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          {point.title}
                        </h5>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6P CGM Tech分類 */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">6P CGM Tech分類</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedHistory.charmCategories.map((cc) => (
                      <div
                        key={cc.category.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{cc.category.icon}</span>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {cc.category.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {cc.category.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">ポイント数:</span>
                            <span className="text-gray-900 dark:text-white">
                              {cc.points.length}個
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">割合:</span>
                            <span className="text-gray-900 dark:text-white">
                              {cc.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">強度:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStrengthColor(cc.strength)}`}>
                              {getStrengthText(cc.strength)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ユーザー評価 */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">評価・フィードバック</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-gray-600 dark:text-gray-400">評価:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleHistoryUpdate(selectedHistory.id, { userRating: rating })}
                            className={`w-8 h-8 rounded-full border-2 transition-colors ${
                              selectedHistory.userRating === rating
                                ? 'border-yellow-500 bg-yellow-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-yellow-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        フィードバック
                      </label>
                      <textarea
                        value={selectedHistory.userFeedback || ''}
                        onChange={(e) => handleHistoryUpdate(selectedHistory.id, { userFeedback: e.target.value })}
                        placeholder="この分析結果についてのご意見をお聞かせください..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;
