import type { 
  AnalysisHistory, 
  AttractivenessOutput, 
  CharmCategoryAnalysis, 
  UserAnalytics,
  CharmCategory 
} from '../types/analysis';
import { CHARM_CATEGORIES } from '../types/analysis';

// 魅力ポイントを6P CGM Tech分類に分類する関数
export const categorizeCharmPoints = (output: AttractivenessOutput): CharmCategoryAnalysis[] => {
  const categories = CHARM_CATEGORIES.map(category => ({
    category,
    points: [],
    percentage: 0,
    strength: 'low' as const
  }));

  // 各魅力ポイントを適切なカテゴリに分類
  output.points.forEach(point => {
    const category = determineCategory(point);
    const categoryIndex = categories.findIndex(c => c.category.id === category.id);
    
    if (categoryIndex !== -1) {
      categories[categoryIndex].points.push(point);
    }
  });

  // パーセンテージと強度を計算
  const totalPoints = output.points.length;
  categories.forEach(category => {
    category.percentage = totalPoints > 0 ? (category.points.length / totalPoints) * 100 : 0;
    
    if (category.percentage >= 30) category.strength = 'high';
    else if (category.percentage >= 15) category.strength = 'medium';
    else category.strength = 'low';
  });

  return categories.filter(category => category.points.length > 0);
};

// 魅力ポイントの内容からカテゴリを判定する関数
const determineCategory = (point: { title: string; description: string }): CharmCategory => {
  const text = `${point.title} ${point.description}`.toLowerCase();
  
  // キーワードベースの分類
  if (text.includes('サービス') || text.includes('商品') || text.includes('プロダクト')) {
    return CHARM_CATEGORIES[0]; // プロダクト・サービス
  }
  if (text.includes('チーム') || text.includes('人材') || text.includes('従業員') || text.includes('専門性')) {
    return CHARM_CATEGORIES[1]; // 人材・チーム
  }
  if (text.includes('プロセス') || text.includes('効率') || text.includes('仕組み') || text.includes('システム')) {
    return CHARM_CATEGORIES[2]; // プロセス・仕組み
  }
  if (text.includes('技術') || text.includes('プラットフォーム') || text.includes('インフラ') || text.includes('ai')) {
    return CHARM_CATEGORIES[3]; // プラットフォーム・技術
  }
  if (text.includes('パートナー') || text.includes('提携') || text.includes('協力') || text.includes('連携')) {
    return CHARM_CATEGORIES[4]; // パートナーシップ
  }
  if (text.includes('成長') || text.includes('将来') || text.includes('可能性') || text.includes('未来')) {
    return CHARM_CATEGORIES[5]; // ポテンシャル・将来性
  }
  
  // デフォルトはプロダクト・サービス
  return CHARM_CATEGORIES[0];
};

// 分析履歴を保存
export const saveAnalysisHistory = async (
  userId: string, 
  userInput: string, 
  output: AttractivenessOutput,
  sessionDuration: number
): Promise<AnalysisHistory> => {
  const history: AnalysisHistory = {
    id: generateId(),
    timestamp: new Date(),
    userInput,
    output,
    charmCategories: categorizeCharmPoints(output),
    sessionDuration,
    tags: extractTags(userInput),
    isBookmarked: false
  };

  const existingHistory = getAnalysisHistory(userId);
  existingHistory.push(history);
  
  // 最新100件まで保存
  if (existingHistory.length > 100) {
    existingHistory.splice(0, existingHistory.length - 100);
  }
  
  localStorage.setItem(`analysisHistory_${userId}`, JSON.stringify(existingHistory));
  return history;
};

// 分析履歴を取得
export const getAnalysisHistory = (userId: string): AnalysisHistory[] => {
  try {
    const saved = localStorage.getItem(`analysisHistory_${userId}`);
    if (saved) {
      const history = JSON.parse(saved);
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
  } catch (error) {
    console.error('履歴の読み込みエラー:', error);
  }
  return [];
};

// 特定の履歴を取得
export const getAnalysisHistoryById = (userId: string, historyId: string): AnalysisHistory | null => {
  const history = getAnalysisHistory(userId);
  return history.find(h => h.id === historyId) || null;
};

// 履歴を更新（評価、フィードバック、お気に入り）
export const updateAnalysisHistory = async (
  userId: string,
  historyId: string,
  updates: Partial<AnalysisHistory>
): Promise<void> => {
  const history = getAnalysisHistory(userId);
  const index = history.findIndex(h => h.id === historyId);
  
  if (index !== -1) {
    history[index] = { ...history[index], ...updates };
    localStorage.setItem(`analysisHistory_${userId}`, JSON.stringify(history));
  }
};

// 履歴を削除
export const deleteAnalysisHistory = async (userId: string, historyId: string): Promise<void> => {
  const history = getAnalysisHistory(userId);
  const filtered = history.filter(h => h.id !== historyId);
  localStorage.setItem(`analysisHistory_${userId}`, JSON.stringify(filtered));
};

// ユーザー分析統計を生成
export const generateUserAnalytics = (userId: string): UserAnalytics => {
  const history = getAnalysisHistory(userId);
  
  if (history.length === 0) {
    return {
      totalAnalyses: 0,
      totalCharmPoints: 0,
      averageSessionDuration: 0,
      favoriteCategories: [],
      industryBreakdown: [],
      usagePatterns: [],
      improvementSuggestions: [],
      streakDays: 0,
      lastAnalysisDate: new Date()
    };
  }

  const totalAnalyses = history.length;
  const totalCharmPoints = history.reduce((sum, h) => sum + h.output.points.length, 0);
  const averageSessionDuration = history.reduce((sum, h) => sum + h.sessionDuration, 0) / totalAnalyses;
  
  // お気に入りカテゴリ（使用頻度が高いもの）
  const categoryUsage = CHARM_CATEGORIES.map(category => ({
    category,
    count: history.reduce((sum, h) => 
      sum + h.charmCategories.filter(cc => cc.category.id === category.id).length, 0
    )
  }));
  
  const favoriteCategories = categoryUsage
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => item.category);

  // 業界別分析
  const industryMap = new Map<string, { count: number; totalRating: number; ratings: number[] }>();
  history.forEach(h => {
    h.tags.forEach(tag => {
      if (!industryMap.has(tag)) {
        industryMap.set(tag, { count: 0, totalRating: 0, ratings: [] });
      }
      const industry = industryMap.get(tag)!;
      industry.count++;
      if (h.userRating) {
        industry.totalRating += h.userRating;
        industry.ratings.push(h.userRating);
      }
    });
  });

  const industryBreakdown = Array.from(industryMap.entries()).map(([industry, data]) => ({
    industry,
    count: data.count,
    percentage: (data.count / totalAnalyses) * 100,
    averageRating: data.ratings.length > 0 ? data.totalRating / data.ratings.length : 0
  }));

  // 使用パターン分析
  const usagePatterns = analyzeUsagePatterns(history);

  // 改善提案
  const improvementSuggestions = generateImprovementSuggestions(categoryUsage, totalAnalyses);

  // 連続使用日数
  const streakDays = calculateStreakDays(history);

  return {
    totalAnalyses,
    totalCharmPoints,
    averageSessionDuration,
    favoriteCategories,
    industryBreakdown,
    usagePatterns,
    improvementSuggestions,
    streakDays,
    lastAnalysisDate: history[history.length - 1].timestamp
  };
};

// 使用パターンを分析
const analyzeUsagePatterns = (history: AnalysisHistory[]): any[] => {
  const patterns = [
    { pattern: '朝の分析', frequency: 0, effectiveness: 0 },
    { pattern: '昼の分析', frequency: 0, effectiveness: 0 },
    { pattern: '夜の分析', frequency: 0, effectiveness: 0 },
    { pattern: '週末の分析', frequency: 0, effectiveness: 0 }
  ];

  history.forEach(h => {
    const hour = h.timestamp.getHours();
    const day = h.timestamp.getDay();
    
    if (hour >= 6 && hour < 12) {
      patterns[0].frequency++;
      if (h.userRating && h.userRating >= 4) patterns[0].effectiveness++;
    } else if (hour >= 12 && hour < 18) {
      patterns[1].frequency++;
      if (h.userRating && h.userRating >= 4) patterns[1].effectiveness++;
    } else if (hour >= 18 && hour < 24) {
      patterns[2].frequency++;
      if (h.userRating && h.userRating >= 4) patterns[2].effectiveness++;
    }
    
    if (day === 0 || day === 6) {
      patterns[3].frequency++;
      if (h.userRating && h.userRating >= 4) patterns[3].effectiveness++;
    }
  });

  return patterns.map(p => ({
    ...p,
    effectiveness: p.frequency > 0 ? (p.effectiveness / p.frequency) * 100 : 0
  }));
};

// 改善提案を生成
const generateImprovementSuggestions = (categoryUsage: any[], totalAnalyses: number): any[] => {
  const suggestions: any[] = [];
  
  categoryUsage.forEach(item => {
    const usagePercentage = (item.count / totalAnalyses) * 100;
    
    if (usagePercentage < 10) {
      suggestions.push({
        category: item.category,
        currentUsage: usagePercentage,
        recommendedUsage: 15,
        suggestion: `${item.category.name}の魅力をより積極的に分析してみましょう`,
        impact: 'high' as const
      });
    } else if (usagePercentage < 20) {
      suggestions.push({
        category: item.category,
        currentUsage: usagePercentage,
        recommendedUsage: 25,
        suggestion: `${item.category.name}の魅力をさらに深掘りしてみましょう`,
        impact: 'medium' as const
      });
    }
  });

  return suggestions.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
};

// 連続使用日数を計算
const calculateStreakDays = (history: AnalysisHistory[]): number => {
  if (history.length === 0) return 0;
  
  const sortedHistory = history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 365; i++) {
    const hasAnalysis = sortedHistory.some(h => {
      const historyDate = new Date(h.timestamp);
      historyDate.setHours(0, 0, 0, 0);
      return historyDate.getTime() === currentDate.getTime();
    });
    
    if (hasAnalysis) {
      streak++;
    } else {
      break;
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
};

// タグを抽出
const extractTags = (userInput: string): string[] => {
  const tags: string[] = [];
  
  // 業界タグ
  if (userInput.includes('スタートアップ') || userInput.includes('startup')) tags.push('スタートアップ');
  if (userInput.includes('hr') || userInput.includes('人事')) tags.push('HR・人事');
  if (userInput.includes('it') || userInput.includes('技術')) tags.push('IT・技術');
  if (userInput.includes('製造') || userInput.includes('工場')) tags.push('製造業');
  if (userInput.includes('金融') || userInput.includes('銀行')) tags.push('金融業');
  if (userInput.includes('医療') || userInput.includes('病院')) tags.push('医療・ヘルスケア');
  
  // 規模タグ
  if (userInput.includes('大企業') || userInput.includes('大手')) tags.push('大企業');
  if (userInput.includes('中小企業') || userInput.includes('中堅')) tags.push('中小企業');
  if (userInput.includes('ベンチャー') || userInput.includes('新興')) tags.push('ベンチャー企業');
  
  return tags;
};

// ID生成
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
