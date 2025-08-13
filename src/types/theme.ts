// テーマの基本設定
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
  customCSS?: string;
}

// プリセットテーマ
export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  colors: Omit<ThemeConfig, 'mode' | 'customCSS'>;
  category: 'professional' | 'creative' | 'minimal' | 'vibrant' | 'seasonal';
  isPopular?: boolean;
}

// ユーザーのテーマ設定
export interface UserThemePreferences {
  userId: string;
  currentTheme: ThemeConfig;
  favoriteThemes: string[];
  customThemes: ThemeConfig[];
  lastUpdated: Date;
}

// カラーパレット
export const COLOR_PALETTES = {
  // プロフェッショナル系
  professional: [
    { name: 'クラシックブルー', value: '#2563eb', description: '信頼性と安定感' },
    { name: 'フォレストグリーン', value: '#059669', description: '成長と自然' },
    { name: 'エレガントグレー', value: '#374151', description: '洗練された印象' },
    { name: 'ロイヤルパープル', value: '#7c3aed', description: '高貴さと創造性' }
  ],
  // クリエイティブ系
  creative: [
    { name: 'サンセットオレンジ', value: '#ea580c', description: '情熱とエネルギー' },
    { name: 'ネオンピンク', value: '#ec4899', description: '若さと革新性' },
    { name: 'エレクトリックブルー', value: '#06b6d4', description: 'テクノロジー感' },
    { name: 'ライムグリーン', value: '#84cc16', description: 'フレッシュさ' }
  ],
  // 季節系
  seasonal: [
    { name: '桜ピンク', value: '#fce7f3', description: '春の桜の季節' },
    { name: '新緑グリーン', value: '#bbf7d0', description: '夏の新緑' },
    { name: '紅葉オレンジ', value: '#fed7aa', description: '秋の紅葉' },
    { name: '雪白', value: '#f8fafc', description: '冬の雪景色' }
  ]
};

// アニメーション設定
export interface AnimationConfig {
  enabled: boolean;
  type: 'subtle' | 'smooth' | 'playful' | 'none';
  speed: 'slow' | 'normal' | 'fast';
  particleEffects: boolean;
  confettiOnSuccess: boolean;
}

// サウンド設定
export interface SoundConfig {
  enabled: boolean;
  volume: number;
  soundEffects: {
    buttonClick: boolean;
    success: boolean;
    error: boolean;
    notification: boolean;
  };
}

// 完全なユーザー設定
export interface UserPreferences {
  theme: ThemeConfig;
  animations: AnimationConfig;
  sounds: SoundConfig;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
}
