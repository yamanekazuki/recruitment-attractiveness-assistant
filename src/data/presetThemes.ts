import type { PresetTheme } from '../types/theme';

export const PRESET_THEMES: PresetTheme[] = [
  // プロフェッショナル系
  {
    id: 'classic-blue',
    name: 'クラシックブルー',
    description: '信頼性と安定感を表現した洗練されたテーマ',
    category: 'professional',
    isPopular: true,
    colors: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      accentColor: '#3b82f6',
      backgroundColor: '#ffffff',
      surfaceColor: '#f8fafc',
      textColor: '#1e293b',
      borderColor: '#e2e8f0',
      shadowColor: 'rgba(37, 99, 235, 0.1)'
    }
  },
  {
    id: 'forest-green',
    name: 'フォレストグリーン',
    description: '自然と成長を感じる落ち着いたテーマ',
    category: 'professional',
    colors: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      accentColor: '#10b981',
      backgroundColor: '#ffffff',
      surfaceColor: '#f0fdf4',
      textColor: '#064e3b',
      borderColor: '#bbf7d0',
      shadowColor: 'rgba(5, 150, 105, 0.1)'
    }
  },
  {
    id: 'elegant-gray',
    name: 'エレガントグレー',
    description: '洗練された印象のモノクロテーマ',
    category: 'professional',
    colors: {
      primaryColor: '#374151',
      secondaryColor: '#1f2937',
      accentColor: '#6b7280',
      backgroundColor: '#ffffff',
      surfaceColor: '#f9fafb',
      textColor: '#111827',
      borderColor: '#d1d5db',
      shadowColor: 'rgba(55, 65, 81, 0.1)'
    }
  },
  
  // クリエイティブ系
  {
    id: 'sunset-orange',
    name: 'サンセットオレンジ',
    description: '情熱とエネルギーに満ちたビビッドなテーマ',
    category: 'creative',
    isPopular: true,
    colors: {
      primaryColor: '#ea580c',
      secondaryColor: '#c2410c',
      accentColor: '#f97316',
      backgroundColor: '#ffffff',
      surfaceColor: '#fff7ed',
      textColor: '#7c2d12',
      borderColor: '#fed7aa',
      shadowColor: 'rgba(234, 88, 12, 0.1)'
    }
  },
  {
    id: 'neon-pink',
    name: 'ネオンピンク',
    description: '若さと革新性を表現するモダンなテーマ',
    category: 'creative',
    colors: {
      primaryColor: '#ec4899',
      secondaryColor: '#be185d',
      accentColor: '#f472b6',
      backgroundColor: '#ffffff',
      surfaceColor: '#fdf2f8',
      textColor: '#831843',
      borderColor: '#fce7f3',
      shadowColor: 'rgba(236, 72, 153, 0.1)'
    }
  },
  {
    id: 'electric-blue',
    name: 'エレクトリックブルー',
    description: 'テクノロジー感と未来を感じるテーマ',
    category: 'creative',
    colors: {
      primaryColor: '#06b6d4',
      secondaryColor: '#0891b2',
      accentColor: '#22d3ee',
      backgroundColor: '#ffffff',
      surfaceColor: '#f0fdfa',
      textColor: '#164e63',
      borderColor: '#a5f3fc',
      shadowColor: 'rgba(6, 182, 212, 0.1)'
    }
  },
  
  // 季節系
  {
    id: 'cherry-blossom',
    name: '桜ピンク',
    description: '春の桜の季節を感じる優雅なテーマ',
    category: 'seasonal',
    colors: {
      primaryColor: '#fce7f3',
      secondaryColor: '#f9a8d4',
      accentColor: '#ec4899',
      backgroundColor: '#ffffff',
      surfaceColor: '#fdf2f8',
      textColor: '#831843',
      borderColor: '#fce7f3',
      shadowColor: 'rgba(252, 231, 243, 0.1)'
    }
  },
  {
    id: 'fresh-green',
    name: '新緑グリーン',
    description: '夏の新緑を感じる爽やかなテーマ',
    category: 'seasonal',
    colors: {
      primaryColor: '#bbf7d0',
      secondaryColor: '#86efac',
      accentColor: '#22c55e',
      backgroundColor: '#ffffff',
      surfaceColor: '#f0fdf4',
      textColor: '#166534',
      borderColor: '#bbf7d0',
      shadowColor: 'rgba(187, 247, 208, 0.1)'
    }
  },
  {
    id: 'autumn-orange',
    name: '紅葉オレンジ',
    description: '秋の紅葉を感じる温かみのあるテーマ',
    category: 'seasonal',
    colors: {
      primaryColor: '#fed7aa',
      secondaryColor: '#fdba74',
      accentColor: '#f97316',
      backgroundColor: '#ffffff',
      surfaceColor: '#fff7ed',
      textColor: '#7c2d12',
      borderColor: '#fed7aa',
      shadowColor: 'rgba(254, 215, 170, 0.1)'
    }
  },
  {
    id: 'snow-white',
    name: '雪白',
    description: '冬の雪景色を感じる清潔なテーマ',
    category: 'seasonal',
    colors: {
      primaryColor: '#f8fafc',
      secondaryColor: '#e2e8f0',
      accentColor: '#64748b',
      backgroundColor: '#ffffff',
      surfaceColor: '#f8fafc',
      textColor: '#334155',
      borderColor: '#e2e8f0',
      shadowColor: 'rgba(248, 250, 252, 0.1)'
    }
  },
  
  // ミニマル系
  {
    id: 'minimal-white',
    name: 'ミニマルホワイト',
    description: 'シンプルで清潔感のあるミニマルテーマ',
    category: 'minimal',
    colors: {
      primaryColor: '#000000',
      secondaryColor: '#374151',
      accentColor: '#6b7280',
      backgroundColor: '#ffffff',
      surfaceColor: '#f9fafb',
      textColor: '#111827',
      borderColor: '#e5e7eb',
      shadowColor: 'rgba(0, 0, 0, 0.05)'
    }
  },
  
  // ビビッド系
  {
    id: 'vibrant-rainbow',
    name: 'ビビッドレインボー',
    description: 'カラフルで楽しい印象のテーマ',
    category: 'vibrant',
    colors: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      surfaceColor: '#fef3c7',
      textColor: '#1e293b',
      borderColor: '#e0e7ff',
      shadowColor: 'rgba(139, 92, 246, 0.1)'
    }
  }
];

// ダークモード用のテーマ変換
export const getDarkModeTheme = (baseTheme: PresetTheme): PresetTheme => {
  return {
    ...baseTheme,
    id: `${baseTheme.id}-dark`,
    name: `${baseTheme.name} (ダーク)`,
    colors: {
      ...baseTheme.colors,
      backgroundColor: '#0f172a',
      surfaceColor: '#1e293b',
      textColor: '#f1f5f9',
      borderColor: '#334155',
      shadowColor: 'rgba(0, 0, 0, 0.3)'
    }
  };
};
