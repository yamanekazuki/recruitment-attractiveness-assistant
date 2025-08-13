import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  applyTheme, 
  loadUserPreferences, 
  saveUserPreferences, 
  getPresetThemes, 
  getThemesByCategory,
  previewTheme,
  clearThemePreview,
  createCustomTheme,
  showConfetti,
  playSound
} from '../services/themeService';
import type { ThemeConfig, UserPreferences, PresetTheme } from '../types/theme';
import { COLOR_PALETTES } from '../types/theme';
import { 
  PaletteIcon, 
  MoonIcon, 
  SunIcon, 
  ComputerDesktopIcon,
  SparklesIcon,
  MusicalNoteIcon,
  EyeIcon,
  HeartIcon,
  DownloadIcon,
  UploadIcon,
  PaintBrushIcon
} from '../../components/Icons';

const ThemeSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'animations' | 'accessibility'>('themes');
  const [selectedTheme, setSelectedTheme] = useState<PresetTheme | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customColors, setCustomColors] = useState({
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#3b82f6'
  });
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const userPrefs = loadUserPreferences(currentUser.uid);
      setPreferences(userPrefs);
      setIsDarkMode(userPrefs.theme.mode === 'dark');
    }
  }, [currentUser]);

  const handleThemeChange = (theme: PresetTheme) => {
    setSelectedTheme(theme);
    if (preferences) {
      const newTheme: ThemeConfig = {
        ...theme.colors,
        mode: preferences.theme.mode,
        customCSS: undefined
      };
      
      if (isDarkMode) {
        newTheme.backgroundColor = '#0f172a';
        newTheme.surfaceColor = '#1e293b';
        newTheme.textColor = '#f1f5f9';
        newTheme.borderColor = '#334155';
      }
      
      setPreferences(prev => prev ? {
        ...prev,
        theme: newTheme
      } : null);
      
      applyTheme(newTheme);
      playSound('buttonClick');
    }
  };

  const handleDarkModeToggle = () => {
    if (preferences) {
      const newMode = isDarkMode ? 'light' : 'dark';
      const newTheme: ThemeConfig = {
        ...preferences.theme,
        mode: newMode
      };
      
      if (newMode === 'dark') {
        newTheme.backgroundColor = '#0f172a';
        newTheme.surfaceColor = '#1e293b';
        newTheme.textColor = '#f1f5f9';
        newTheme.borderColor = '#334155';
      } else {
        newTheme.backgroundColor = '#ffffff';
        newTheme.surfaceColor = '#f8fafc';
        newTheme.textColor = '#1e293b';
        newTheme.borderColor = '#e2e8f0';
      }
      
      setPreferences(prev => prev ? {
        ...prev,
        theme: newTheme
      } : null);
      
      setIsDarkMode(!isDarkMode);
      applyTheme(newTheme);
      playSound('buttonClick');
    }
  };

  const handleAutoMode = () => {
    if (preferences) {
      const newTheme: ThemeConfig = {
        ...preferences.theme,
        mode: 'auto'
      };
      
      setPreferences(prev => prev ? {
        ...prev,
        theme: newTheme
      } : null);
      
      setIsDarkMode(false);
      applyTheme(newTheme);
      playSound('buttonClick');
    }
  };

  const handleCustomColorChange = (colorType: string, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const handleCreateCustomTheme = () => {
    if (selectedTheme && preferences) {
      const customTheme = createCustomTheme(selectedTheme, customColors, 'カスタムテーマ');
      
      setPreferences(prev => prev ? {
        ...prev,
        theme: customTheme,
        customThemes: [...(prev.customThemes || []), customTheme]
      } : null);
      
      applyTheme(customTheme);
      showConfetti();
      playSound('success');
    }
  };

  const handlePreviewTheme = (theme: PresetTheme) => {
    setPreviewing(true);
    previewTheme(theme, isDarkMode);
  };

  const handleClearPreview = () => {
    if (currentUser && preferences) {
      setPreviewing(false);
      clearThemePreview(currentUser.uid);
    }
  };

  const handleSavePreferences = () => {
    if (currentUser && preferences) {
      saveUserPreferences(currentUser.uid, preferences);
      showConfetti();
      playSound('success');
    }
  };

  const handleAnimationToggle = (enabled: boolean) => {
    if (preferences) {
      setPreferences(prev => prev ? {
        ...prev,
        animations: {
          ...prev.animations,
          enabled
        }
      } : null);
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    if (preferences) {
      setPreferences(prev => prev ? {
        ...prev,
        sounds: {
          ...prev.sounds,
          enabled
        }
      } : null);
    }
  };

  if (!preferences) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎨 テーマ設定
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          あなただけの特別な体験を作りましょう！
        </p>
      </div>

      {/* ダークモード切り替え */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center space-x-4">
          <SunIcon className="w-6 h-6 text-yellow-500" />
          <button
            onClick={handleDarkModeToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDarkMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <MoonIcon className="w-6 h-6 text-blue-500" />
          
          <button
            onClick={handleAutoMode}
            className="ml-4 flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ComputerDesktopIcon className="w-5 h-5" />
            <span>自動</span>
          </button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <nav className="flex space-x-8 p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'themes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <PaletteIcon className="w-5 h-5" />
            <span>テーマ</span>
          </button>
          
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'colors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <PaintBrushIcon className="w-5 h-5" />
            <span>カスタムカラー</span>
          </button>
          
          <button
            onClick={() => setActiveTab('animations')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'animations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <SparklesIcon className="w-5 h-5" />
            <span>アニメーション</span>
          </button>
          
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'accessibility'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <EyeIcon className="w-5 h-5" />
            <span>アクセシビリティ</span>
          </button>
        </nav>

        <div className="p-6">
          {/* テーマタブ */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              {/* 人気テーマ */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
                  人気テーマ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPresetThemes().filter(t => t.isPopular).map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isSelected={selectedTheme?.id === theme.id}
                      onSelect={() => handleThemeChange(theme)}
                      onPreview={() => handlePreviewTheme(theme)}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>

              {/* カテゴリ別テーマ */}
              {['professional', 'creative', 'seasonal', 'minimal', 'vibrant'].map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                    {category === 'professional' && 'プロフェッショナル'}
                    {category === 'creative' && 'クリエイティブ'}
                    {category === 'seasonal' && '季節'}
                    {category === 'minimal' && 'ミニマル'}
                    {category === 'vibrant' && 'ビビッド'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getThemesByCategory(category).map((theme) => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        isSelected={selectedTheme?.id === theme.id}
                        onSelect={() => handleThemeChange(theme)}
                        onPreview={() => handlePreviewTheme(theme)}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* カスタムカラータブ */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(COLOR_PALETTES).map(([category, colors]) => (
                  <div key={category} className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {category === 'professional' && 'プロフェッショナル'}
                      {category === 'creative' && 'クリエイティブ'}
                      {category === 'seasonal' && '季節'}
                    </h4>
                    <div className="space-y-2">
                      {colors.map((color) => (
                        <div
                          key={color.value}
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => handleCustomColorChange('primaryColor', color.value)}
                        >
                          <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color.value }}
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{color.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{color.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* カラーピッカー */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">カスタムカラー</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(customColors).map(([colorType, colorValue]) => (
                    <div key={colorType}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                        {colorType === 'primaryColor' && 'プライマリ'}
                        {colorType === 'secondaryColor' && 'セカンダリ'}
                        {colorType === 'accentColor' && 'アクセント'}
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={colorValue}
                          onChange={(e) => handleCustomColorChange(colorType, e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colorValue}
                          onChange={(e) => handleCustomColorChange(colorType, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleCreateCustomTheme}
                  className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🎨 カスタムテーマを作成
                </button>
              </div>
            </div>
          )}

          {/* アニメーションタブ */}
          {activeTab === 'animations' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <SparklesIcon className="w-5 h-5 text-purple-500 mr-2" />
                    アニメーション効果
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.animations.enabled}
                        onChange={(e) => handleAnimationToggle(e.target.checked)}
                        className="mr-3"
                      />
                      <span>アニメーションを有効にする</span>
                    </label>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        アニメーションタイプ
                      </label>
                      <select
                        value={preferences.animations.type}
                        onChange={(e) => setPreferences(prev => prev ? {
                          ...prev,
                          animations: { ...prev.animations, type: e.target.value as any }
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="subtle">繊細</option>
                        <option value="smooth">スムーズ</option>
                        <option value="playful">遊び心</option>
                        <option value="none">なし</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <MusicalNoteIcon className="w-5 h-5 text-green-500 mr-2" />
                    サウンド効果
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.sounds.enabled}
                        onChange={(e) => handleSoundToggle(e.target.checked)}
                        className="mr-3"
                      />
                      <span>サウンドを有効にする</span>
                    </label>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        音量
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={preferences.sounds.volume}
                        onChange={(e) => setPreferences(prev => prev ? {
                          ...prev,
                          sounds: { ...prev.sounds, volume: parseFloat(e.target.value) }
                        } : null)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* アクセシビリティタブ */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">表示設定</h4>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.accessibility.highContrast}
                        onChange={(e) => setPreferences(prev => prev ? {
                          ...prev,
                          accessibility: { ...prev.accessibility, highContrast: e.target.checked }
                        } : null)}
                        className="mr-3"
                      />
                      <span>高コントラスト</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.accessibility.largeText}
                        onChange={(e) => setPreferences(prev => prev ? {
                          ...prev,
                          accessibility: { ...prev.accessibility, largeText: e.target.checked }
                        } : null)}
                        className="mr-3"
                      />
                      <span>大きなテキスト</span>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">動作設定</h4>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.accessibility.reducedMotion}
                        onChange={(e) => setPreferences(prev => prev ? {
                          ...prev,
                          accessibility: { ...prev.accessibility, reducedMotion: e.target.checked }
                        } : null)}
                        className="mr-3"
                      />
                      <span>動きを減らす</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.accessibility.screenReader}
                        onChange={(e) => setPreferences(prev => prev ? {
                          ...prev,
                          accessibility: { ...prev.accessibility, screenReader: e.target.checked }
                        } : null)}
                        className="mr-3"
                      />
                      <span>スクリーンリーダー対応</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-center space-x-4">
        {previewing && (
          <button
            onClick={handleClearPreview}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            プレビューを解除
          </button>
        )}
        
        <button
          onClick={handleSavePreferences}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>設定を保存</span>
        </button>
      </div>
    </div>
  );
};

// テーマカードコンポーネント
interface ThemeCardProps {
  theme: PresetTheme;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  isDarkMode: boolean;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect, onPreview, isDarkMode }) => {
  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-2 transition-all cursor-pointer ${
      isSelected 
        ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900' 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      {/* テーマプレビュー */}
      <div className="mb-4">
        <div className="h-20 rounded-lg mb-2" style={{ backgroundColor: theme.colors.primaryColor }} />
        <div className="h-8 rounded-lg mb-2" style={{ backgroundColor: theme.colors.secondaryColor }} />
        <div className="h-6 rounded-lg" style={{ backgroundColor: theme.colors.accentColor }} />
      </div>
      
      {/* テーマ情報 */}
      <div className="text-center mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{theme.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{theme.description}</p>
      </div>
      
      {/* アクションボタン */}
      <div className="flex space-x-2">
        <button
          onClick={onPreview}
          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          プレビュー
        </button>
        <button
          onClick={onSelect}
          className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
          }`}
        >
          {isSelected ? '選択中' : '選択'}
        </button>
      </div>
      
      {/* 人気マーク */}
      {theme.isPopular && (
        <div className="absolute top-2 right-2">
          <HeartIcon className="w-5 h-5 text-red-500" />
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;
