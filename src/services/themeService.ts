import type { ThemeConfig, UserPreferences, PresetTheme } from '../types/theme';
import { PRESET_THEMES, getDarkModeTheme } from '../data/presetThemes';

// デフォルトテーマ
const DEFAULT_THEME: ThemeConfig = {
  mode: 'light',
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff', // 白に設定
  surfaceColor: '#f8fafc',
  textColor: '#1e293b',
  borderColor: '#e2e8f0',
  shadowColor: 'rgba(37, 99, 235, 0.1)'
};

// デフォルト設定
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: DEFAULT_THEME,
  animations: {
    enabled: true,
    type: 'smooth',
    speed: 'normal',
    particleEffects: true,
    confettiOnSuccess: true
  },
  sounds: {
    enabled: true,
    volume: 0.5,
    soundEffects: {
      buttonClick: true,
      success: true,
      error: true,
      notification: true
    }
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false
  },
  notifications: {
    email: true,
    push: true,
    sound: true
  }
};

// テーマをCSS変数として適用
export const applyTheme = (theme: ThemeConfig): void => {
  const root = document.documentElement;
  
  // CSS変数を設定
  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--color-accent', theme.accentColor);
  root.style.setProperty('--color-background', theme.backgroundColor);
  root.style.setProperty('--color-surface', theme.surfaceColor);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--color-border', theme.borderColor);
  root.style.setProperty('--color-shadow', theme.shadowColor);
  
  // 追加のCSS変数
  root.style.setProperty('--color-primary-light', lightenColor(theme.primaryColor, 0.2));
  root.style.setProperty('--color-primary-dark', darkenColor(theme.primaryColor, 0.2));
  root.style.setProperty('--color-secondary-light', lightenColor(theme.secondaryColor, 0.2));
  root.style.setProperty('--color-secondary-dark', darkenColor(theme.secondaryColor, 0.2));
  root.style.setProperty('--color-accent-light', lightenColor(theme.accentColor, 0.2));
  root.style.setProperty('--color-accent-dark', darkenColor(theme.accentColor, 0.2));
  
  // ダークモードの適用
  if (theme.mode === 'dark' || (theme.mode === 'auto' && isDarkModePreferred())) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // カスタムCSSの適用
  if (theme.customCSS) {
    applyCustomCSS(theme.customCSS);
  }
  
  // ローカルストレージに保存
  localStorage.setItem('userTheme', JSON.stringify(theme));
  
  // グローバルなテーマ設定も保存
  localStorage.setItem('globalTheme', JSON.stringify(theme));
};

// カスタムCSSの適用
const applyCustomCSS = (css: string): void => {
  let customStyle = document.getElementById('custom-theme-css');
  if (!customStyle) {
    customStyle = document.createElement('style');
    customStyle.id = 'custom-theme-css';
    document.head.appendChild(customStyle);
  }
  customStyle.textContent = css;
};

// システムのダークモード設定を確認
export const isDarkModePreferred = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// グローバルテーマの読み込み
export const loadGlobalTheme = (): ThemeConfig => {
  try {
    const saved = localStorage.getItem('globalTheme');
    if (saved) {
      return { ...DEFAULT_THEME, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('グローバルテーマの読み込みに失敗:', error);
  }
  
  return DEFAULT_THEME;
};

// ユーザー設定の読み込み
export const loadUserPreferences = (userId: string): UserPreferences => {
  try {
    const saved = localStorage.getItem(`userPreferences_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // テーマが存在しない場合はグローバルテーマを使用
      if (!parsed.theme) {
        parsed.theme = loadGlobalTheme();
      }
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('ユーザー設定の読み込みに失敗:', error);
  }
  
  // デフォルト設定にグローバルテーマを適用
  const preferences = { ...DEFAULT_PREFERENCES };
  preferences.theme = loadGlobalTheme();
  return preferences;
};

// ユーザー設定の保存
export const saveUserPreferences = (userId: string, preferences: UserPreferences): void => {
  try {
    localStorage.setItem(`userPreferences_${userId}`, JSON.stringify(preferences));
    // グローバルテーマも更新
    localStorage.setItem('globalTheme', JSON.stringify(preferences.theme));
    // 即座にテーマを適用
    applyTheme(preferences.theme);
  } catch (error) {
    console.error('ユーザー設定の保存に失敗:', error);
  }
};

// プリセットテーマの取得
export const getPresetThemes = (): PresetTheme[] => {
  return PRESET_THEMES;
};

// カテゴリ別テーマの取得
export const getThemesByCategory = (category: string): PresetTheme[] => {
  return PRESET_THEMES.filter(theme => theme.category === category);
};

// 人気テーマの取得
export const getPopularThemes = (): PresetTheme[] => {
  return PRESET_THEMES.filter(theme => theme.isPopular);
};

// テーマのプレビュー（一時適用）
export const previewTheme = (theme: PresetTheme, isDarkMode: boolean = false): void => {
  const previewTheme: ThemeConfig = {
    ...theme.colors,
    mode: isDarkMode ? 'dark' : 'light',
    customCSS: undefined
  };
  
  if (isDarkMode) {
    const darkTheme = getDarkModeTheme(theme);
    Object.assign(previewTheme, darkTheme.colors);
  }
  
  applyTheme(previewTheme);
};

// テーマのプレビューを解除
export const clearThemePreview = (userId: string): void => {
  const preferences = loadUserPreferences(userId);
  applyTheme(preferences.theme);
};

// カラーピッカーの色を検証
export const validateColor = (color: string): boolean => {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};

// カスタムテーマの作成
export const createCustomTheme = (
  baseTheme: PresetTheme,
  customColors: Partial<ThemeConfig['colors']>,
  name: string
): ThemeConfig => {
  return {
    mode: 'light',
    ...baseTheme.colors,
    ...customColors,
    customCSS: undefined
  };
};

// アニメーション効果の適用
export const applyAnimation = (type: string, element: HTMLElement): void => {
  element.classList.add(`animate-${type}`);
  
  // アニメーション完了後にクラスを削除
  element.addEventListener('animationend', () => {
    element.classList.remove(`animate-${type}`);
  }, { once: true });
};

// パーティクル効果の表示
export const showParticleEffect = (x: number, y: number): void => {
  const particles = document.createElement('div');
  particles.className = 'particle-effect';
  particles.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    z-index: 9999;
  `;
  
  document.body.appendChild(particles);
  
  // パーティクルのアニメーション
  setTimeout(() => {
    particles.remove();
  }, 1000);
};

// 成功時のコンフェッティ効果
export const showConfetti = (): void => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.cssText = `
      position: fixed;
      left: ${Math.random() * window.innerWidth}px;
      top: -10px;
      width: 10px;
      height: 10px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      pointer-events: none;
      z-index: 9999;
      animation: confetti-fall 3s linear forwards;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
};

// サウンド効果の再生
export const playSound = (type: 'buttonClick' | 'success' | 'error' | 'notification'): void => {
  // 実際の実装ではWeb Audio APIを使用
  console.log(`Playing sound: ${type}`);
};

// テーマのエクスポート
export const exportTheme = (theme: ThemeConfig): string => {
  return JSON.stringify(theme, null, 2);
};

// テーマのインポート
export const importTheme = (themeData: string): ThemeConfig | null => {
  try {
    const theme = JSON.parse(themeData);
    if (validateTheme(theme)) {
      return theme;
    }
  } catch (error) {
    console.error('テーマのインポートに失敗:', error);
  }
  return null;
};

// テーマの検証
const validateTheme = (theme: any): boolean => {
  const requiredColors = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'surfaceColor', 'textColor'];
  return requiredColors.every(color => theme[color] && validateColor(theme[color]));
};

// 色を明るくする関数
const lightenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// 色を暗くする関数
const darkenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};
