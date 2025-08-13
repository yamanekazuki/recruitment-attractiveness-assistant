
export interface AttractivenessPoint {
  title: string;
  description: string;
}

export interface AttractivenessOutput {
  points: AttractivenessPoint[];
  summary?: string;
}

// 魅力項目の6P CGM Tech分類
export interface CharmCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

// 分析履歴の詳細
export interface AnalysisHistory {
  id: string;
  timestamp: Date;
  userInput: string;
  output: AttractivenessOutput;
  charmCategories: CharmCategoryAnalysis[];
  sessionDuration: number; // 分析にかかった時間（秒）
  userRating?: number; // ユーザーの評価（1-5）
  userFeedback?: string; // ユーザーのフィードバック
  tags: string[]; // 業界、規模などのタグ
  isBookmarked: boolean; // お気に入り登録
}

// 魅力項目の分類分析
export interface CharmCategoryAnalysis {
  category: CharmCategory;
  points: AttractivenessPoint[];
  percentage: number; // その分類での魅力ポイントの割合
  strength: 'high' | 'medium' | 'low'; // 強度
}

// ユーザー分析統計
export interface UserAnalytics {
  totalAnalyses: number;
  totalCharmPoints: number;
  averageSessionDuration: number;
  favoriteCategories: CharmCategory[];
  industryBreakdown: IndustryAnalysis[];
  usagePatterns: UsagePattern[];
  improvementSuggestions: ImprovementSuggestion[];
  streakDays: number; // 連続使用日数
  lastAnalysisDate: Date;
}

// 業界別分析
export interface IndustryAnalysis {
  industry: string;
  count: number;
  percentage: number;
  averageRating: number;
}

// 使用パターン
export interface UsagePattern {
  pattern: string;
  frequency: number;
  effectiveness: number; // 効果的な使用の割合
}

// 改善提案
export interface ImprovementSuggestion {
  category: CharmCategory;
  currentUsage: number;
  recommendedUsage: number;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

// 魅力項目の6P CGM Tech分類定義
export const CHARM_CATEGORIES: CharmCategory[] = [
  {
    id: 'product',
    name: 'プロダクト・サービス',
    description: '提供する商品・サービスの魅力',
    color: '#3B82F6',
    icon: '🚀'
  },
  {
    id: 'people',
    name: '人材・チーム',
    description: '従業員・チームの能力と魅力',
    color: '#10B981',
    icon: '👥'
  },
  {
    id: 'process',
    name: 'プロセス・仕組み',
    description: '業務フロー・システムの効率性',
    color: '#F59E0B',
    icon: '⚙️'
  },
  {
    id: 'platform',
    name: 'プラットフォーム・技術',
    description: '技術基盤・インフラの魅力',
    color: '#8B5CF6',
    icon: '💻'
  },
  {
    id: 'partnership',
    name: 'パートナーシップ',
    description: '提携・協力関係の価値',
    color: '#EF4444',
    icon: '🤝'
  },
  {
    id: 'potential',
    name: 'ポテンシャル・将来性',
    description: '成長性・未来への可能性',
    color: '#EC4899',
    icon: '⭐'
  }
];
    