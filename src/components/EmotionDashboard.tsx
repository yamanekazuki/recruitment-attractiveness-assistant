import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  generateEmotionAnalysis, 
  generateEmotionInsights,
  getEmotionChartData,
  getEmotionTrends
} from '../services/emotionService';
import type { EmotionAnalysis, EmotionInsight, EmotionTrend } from '../types/theme';
import type { AttractivenessPoint } from '../../types';
import { 
  FaceSmileIcon, 
  FaceFrownIcon, 
  FaceNeutralIcon,
  TrendingUpIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '../components/Icons';

interface EmotionDashboardProps {
  points: AttractivenessPoint[];
  analysisId: string;
}

const EmotionDashboard: React.FC<EmotionDashboardProps> = ({ points, analysisId }) => {
  const { currentUser } = useAuth();
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis | null>(null);
  const [insights, setInsights] = useState<EmotionInsight[]>([]);
  const [trends, setTrends] = useState<EmotionTrend[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'category' | 'trends' | 'insights'>('overview');

  useEffect(() => {
    if (points.length > 0) {
      const analysis = generateEmotionAnalysis(points, analysisId);
      setEmotionAnalysis(analysis);
      
      const emotionInsights = generateEmotionInsights(analysis);
      setInsights(emotionInsights);
    }
  }, [points, analysisId]);

  useEffect(() => {
    if (currentUser) {
      const userTrends = getEmotionTrends(currentUser.uid, 10);
      setTrends(userTrends);
    }
  }, [currentUser]);

  if (!emotionAnalysis) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { overall, byCategory } = emotionAnalysis;
  const chartData = getEmotionChartData(overall);

  const getEmotionIcon = (dominant: string) => {
    switch (dominant) {
      case 'positive':
        return <FaceSmileIcon className="w-6 h-6 text-green-500" />;
      case 'negative':
        return <FaceFrownIcon className="w-6 h-6 text-red-500" />;
      default:
        return <FaceNeutralIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getEmotionColor = (dominant: string) => {
    switch (dominant) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'highlight':
        return <LightBulbIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'improvement':
        return <TrendingUpIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <LightBulbIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'highlight':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-red-200 bg-red-50';
      case 'improvement':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">感情分析ダッシュボード</h1>
              <p className="text-blue-100">分析結果の感情的な傾向と改善提案</p>
            </div>
            <div className="flex items-center space-x-3">
              {getEmotionIcon(overall.dominant)}
              <span className="text-lg font-semibold">
                {overall.dominant === 'positive' ? 'ポジティブ' : 
                 overall.dominant === 'negative' ? 'ネガティブ' : 'ニュートラル'}
              </span>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '概要', count: null },
              { id: 'category', label: 'カテゴリ別', count: Object.keys(byCategory).length },
              { id: 'trends', label: 'トレンド', count: trends.length },
              { id: 'insights', label: 'インサイト', count: insights.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 感情スコアサマリー */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">ポジティブ</p>
                      <p className="text-3xl font-bold text-green-700">{overall.positive}%</p>
                    </div>
                    <FaceSmileIcon className="w-12 h-12 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">ネガティブ</p>
                      <p className="text-3xl font-bold text-red-700">{overall.negative}%</p>
                    </div>
                    <FaceFrownIcon className="w-12 h-12 text-red-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ニュートラル</p>
                      <p className="text-3xl font-bold text-gray-700">{overall.neutral}%</p>
                    </div>
                    <FaceNeutralIcon className="w-12 h-12 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* 感情チャート */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">感情分布</h3>
                <div className="space-y-3">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div className="w-24 text-sm font-medium text-gray-700">{item.name}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <div className="w-16 text-right text-sm font-medium text-gray-900">
                        {item.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 信頼度 */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">分析信頼度</h3>
                    <p className="text-blue-700">この分析結果の信頼性レベル</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{overall.confidence}%</div>
                    <div className="text-sm text-blue-600">
                      {overall.confidence >= 80 ? '非常に高い' :
                       overall.confidence >= 60 ? '高い' :
                       overall.confidence >= 40 ? '中程度' : '低い'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* カテゴリ別タブ */}
          {activeTab === 'category' && (
            <div className="space-y-6">
              {Object.entries(byCategory).map(([category, score]) => (
                <div key={category} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getEmotionColor(score.dominant)}`}>
                      {score.dominant === 'positive' ? 'ポジティブ' : 
                       score.dominant === 'negative' ? 'ネガティブ' : 'ニュートラル'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{score.positive}%</div>
                      <div className="text-sm text-gray-600">ポジティブ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{score.negative}%</div>
                      <div className="text-sm text-gray-600">ネガティブ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{score.neutral}%</div>
                      <div className="text-sm text-gray-600">ニュートラル</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {getEmotionChartData(score).map((item) => (
                      <div key={item.name} className="flex items-center">
                        <div className="w-20 text-sm text-gray-700">{item.name}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${item.value}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-medium text-gray-900">
                          {item.value}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* トレンドタブ */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              {trends.length > 0 ? (
                <div className="space-y-4">
                  {trends.map((trend, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {trend.date.toLocaleDateString('ja-JP')}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getEmotionColor(trend.score.dominant)}`}>
                          {trend.score.dominant === 'positive' ? 'ポジティブ' : 
                           trend.score.dominant === 'negative' ? 'ネガティブ' : 'ニュートラル'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">{trend.score.positive}%</div>
                          <div className="text-xs text-gray-600">ポジティブ</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-600">{trend.score.negative}%</div>
                          <div className="text-xs text-gray-600">ネガティブ</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-600">{trend.score.neutral}%</div>
                          <div className="text-xs text-gray-600">ニュートラル</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>まだトレンドデータがありません</p>
                  <p className="text-sm">分析を続けることで、感情の変化を追跡できます</p>
                </div>
              )}
            </div>
          )}

          {/* インサイトタブ */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className={`p-6 rounded-xl border ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start space-x-4">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium mb-2">{insight.message}</p>
                          <div className="flex items-center justify-between">
                            {insight.category && (
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {insight.category}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              信頼度: {insight.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <LightBulbIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>まだインサイトがありません</p>
                  <p className="text-sm">分析を続けることで、より詳細な洞察が得られます</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionDashboard;
