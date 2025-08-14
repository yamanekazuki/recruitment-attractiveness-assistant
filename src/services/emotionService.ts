import type { EmotionScore, EmotionAnalysis, EmotionTrend, EmotionInsight } from '../types/theme';
import type { AttractivenessPoint } from '../../types';

// 感情分析の実行
export const analyzeEmotions = (points: AttractivenessPoint[]): EmotionScore => {
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  let totalPoints = points.length;

  // 各ポイントの感情を分析
  points.forEach(point => {
    const text = point.point.toLowerCase();
    
    // ポジティブなキーワード
    const positiveKeywords = [
      '優れている', '素晴らしい', '魅力的', '強み', '特徴', '利点', '価値', '成功',
      '成長', '発展', '革新', '創造的', '効率的', '効果的', '信頼性', '安全性',
      '品質', 'サービス', 'サポート', '柔軟性', '適応性', '持続性', '環境配慮'
    ];

    // ネガティブなキーワード
    const negativeKeywords = [
      '問題', '課題', '弱み', '不足', '欠点', 'リスク', '懸念', '不安',
      '困難', '複雑', '高コスト', '時間がかかる', '手間', '制限', '制約'
    ];

    let pointPositive = 0;
    let pointNegative = 0;
    let pointNeutral = 0;

    // キーワードマッチング
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        pointPositive += 2;
      }
    });

    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        pointNegative += 2;
      }
    });

    // 文脈分析
    if (text.includes('改善') || text.includes('向上') || text.includes('強化')) {
      pointPositive += 1;
    }

    if (text.includes('対応') || text.includes('対策') || text.includes('解決')) {
      pointPositive += 1;
    }

    // 感情スコアの正規化
    const total = pointPositive + pointNegative + pointNeutral;
    if (total > 0) {
      positiveScore += (pointPositive / total) * 100;
      negativeScore += (pointNegative / total) * 100;
      neutralScore += (pointNeutral / total) * 100;
    } else {
      neutralScore += 100;
    }
  });

  // 平均値を計算
  const avgPositive = Math.round(positiveScore / totalPoints);
  const avgNegative = Math.round(negativeScore / totalPoints);
  const avgNeutral = Math.round(neutralScore / totalPoints);

  // 支配的な感情を決定
  let dominant: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (avgPositive > avgNegative && avgPositive > avgNeutral) {
    dominant = 'positive';
  } else if (avgNegative > avgPositive && avgNegative > avgNeutral) {
    dominant = 'negative';
  }

  // 信頼度の計算（ポイント数に基づく）
  const confidence = Math.min(100, Math.max(50, totalPoints * 10));

  return {
    positive: avgPositive,
    negative: avgNegative,
    neutral: avgNeutral,
    confidence,
    dominant,
  };
};

// 感情分析の詳細分析
export const generateEmotionAnalysis = (points: AttractivenessPoint[], analysisId: string): EmotionAnalysis => {
  const overall = analyzeEmotions(points);
  
  // カテゴリ別の感情分析
  const byCategory: { [category: string]: EmotionScore } = {};
  const categories = ['技術', '文化', '福利厚生', '成長', '環境', 'その他'];
  
  categories.forEach(category => {
    const categoryPoints = points.filter(point => 
      point.point.includes(category) || 
      point.point.includes(category.toLowerCase())
    );
    
    if (categoryPoints.length > 0) {
      byCategory[category] = analyzeEmotions(categoryPoints);
    }
  });

  // 改善提案の生成
  const suggestions = generateEmotionSuggestions(overall, byCategory);

  // 感情トレンド（現在は空配列、履歴データと連携予定）
  const trends: EmotionTrend[] = [];

  return {
    overall,
    byCategory,
    suggestions,
    trends,
  };
};

// 感情に基づく改善提案の生成
export const generateEmotionSuggestions = (
  overall: EmotionScore, 
  byCategory: { [category: string]: EmotionScore }
): string[] => {
  const suggestions: string[] = [];

  // 全体的な感情に基づく提案
  if (overall.negative > 50) {
    suggestions.push('ネガティブな要素が多いため、改善点の明確化と具体的な対策の提示を検討してください');
  }

  if (overall.positive < 30) {
    suggestions.push('ポジティブな要素をより強調し、企業の強みを前面に出すことをお勧めします');
  }

  if (overall.neutral > 60) {
    suggestions.push('感情的なインパクトが薄いため、より具体的で魅力的な表現への改善を検討してください');
  }

  // カテゴリ別の提案
  Object.entries(byCategory).forEach(([category, score]) => {
    if (score.negative > 60) {
      suggestions.push(`${category}分野での改善が必要です。具体的な対策を検討してください`);
    }
    
    if (score.positive > 70) {
      suggestions.push(`${category}分野は強みです。より積極的なアピールを検討してください`);
    }
  });

  return suggestions.slice(0, 5); // 最大5件まで
};

// 感情インサイトの生成
export const generateEmotionInsights = (analysis: EmotionAnalysis): EmotionInsight[] => {
  const insights: EmotionInsight[] = [];

  // 全体的な感情インサイト
  if (analysis.overall.positive > 70) {
    insights.push({
      type: 'highlight',
      message: '非常にポジティブな印象を与える内容です',
      confidence: analysis.overall.confidence,
    });
  }

  if (analysis.overall.negative > 60) {
    insights.push({
      type: 'warning',
      message: 'ネガティブな要素が多く、改善が必要です',
      confidence: analysis.overall.confidence,
    });
  }

  if (analysis.overall.confidence < 70) {
    insights.push({
      type: 'improvement',
      message: '分析の信頼度を向上させるため、より詳細な情報の追加を検討してください',
      confidence: analysis.overall.confidence,
    });
  }

  // カテゴリ別のインサイト
  Object.entries(analysis.byCategory).forEach(([category, score]) => {
    if (score.positive > 80) {
      insights.push({
        type: 'highlight',
        message: `${category}分野で非常に高い評価を得ています`,
        confidence: score.confidence,
        category,
      });
    }

    if (score.negative > 70) {
      insights.push({
        type: 'warning',
        message: `${category}分野での改善が急務です`,
        confidence: score.confidence,
        category,
      });
    }
  });

  return insights;
};

// 感情スコアの可視化用データ
export const getEmotionChartData = (score: EmotionScore) => {
  return [
    { name: 'ポジティブ', value: score.positive, color: '#10B981' },
    { name: 'ネガティブ', value: score.negative, color: '#EF4444' },
    { name: 'ニュートラル', value: score.neutral, color: '#6B7280' },
  ];
};

// 感情トレンドの保存
export const saveEmotionTrend = (trend: EmotionTrend): void => {
  try {
    const trends = JSON.parse(localStorage.getItem('emotionTrends') || '[]');
    trends.push({
      ...trend,
      date: trend.date.toISOString(),
    });
    localStorage.setItem('emotionTrends', JSON.stringify(trends.slice(-100))); // 最新100件を保持
  } catch (error) {
    console.error('感情トレンドの保存に失敗:', error);
  }
};

// 感情トレンドの取得
export const getEmotionTrends = (uid: string, limit: number = 20): EmotionTrend[] => {
  try {
    const trends = JSON.parse(localStorage.getItem('emotionTrends') || '[]');
    return trends
      .filter((trend: any) => trend.uid === uid)
      .slice(-limit)
      .map((trend: any) => ({
        ...trend,
        date: new Date(trend.date),
      }));
  } catch (error) {
    console.error('感情トレンドの取得に失敗:', error);
    return [];
  }
};
