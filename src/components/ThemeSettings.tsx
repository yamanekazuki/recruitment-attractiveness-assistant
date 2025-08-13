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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [demoElement, setDemoElement] = useState<HTMLElement | null>(null);

  // アニメーション効果のデモ
  const showAnimationDemo = (type: string) => {
    if (demoElement) {
      demoElement.style.animation = 'none';
      demoElement.offsetHeight; // リフローを強制
      
      switch (type) {
        case 'playful':
          demoElement.style.animation = 'bounce 0.6s ease-in-out, wiggle 0.8s ease-in-out';
          break;
        case 'smooth':
          demoElement.style.animation = 'fadeIn 0.8s ease-in-out, slideUp 1s ease-out';
          break;
        case 'delicate':
          demoElement.style.animation = 'pulse 1.2s ease-in-out, glow 1.5s ease-in-out';
          break;
        default:
          demoElement.style.animation = 'fadeIn 0.5s ease-in-out';
      }
    }
  };

  // サウンド効果のデモ
  const playSoundDemo = (type: string) => {
    playSound(type as any);
    
    // 視覚的フィードバック
    if (demoElement) {
      demoElement.style.transform = 'scale(1.1)';
      demoElement.style.transition = 'transform 0.2s ease-in-out';
      
      setTimeout(() => {
        if (demoElement) {
          demoElement.style.transform = 'scale(1)';
        }
      }, 200);
    }
  };

  // デモ要素の設定
  const setDemoElementRef = (element: HTMLDivElement | null) => {
    if (element) {
      setDemoElement(element);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const userPrefs = loadUserPreferences(currentUser.uid);
      setPreferences(userPrefs);
      setIsDarkMode(userPrefs.theme.mode === 'dark');
      setHasUnsavedChanges(true); // 初期化時に変更フラグを設定
    } else {
      // ユーザーがログインしていない場合でもデフォルト設定を使用
      const defaultPrefs = loadUserPreferences('default');
      setPreferences(defaultPrefs);
      setIsDarkMode(defaultPrefs.theme.mode === 'dark');
      setHasUnsavedChanges(true); // 初期化時に変更フラグを設定
    }
  }, [currentUser]);

  // preferencesがnullの場合のフォールバック
  if (!preferences) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">設定を読み込み中...</p>
        </div>
      </div>
    );
  }

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
      markAsChanged(); // 設定変更時にフラグを設定
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
      markAsChanged(); // 設定変更時にフラグを設定
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
      markAsChanged(); // 設定変更時にフラグを設定
    }
  };

  const handleCustomColorChange = (colorType: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: value
    }));
    markAsChanged();
  };

  const handleCreateCustomTheme = () => {
    if (preferences) {
      const customTheme: ThemeConfig = {
        mode: isDarkMode ? 'dark' : 'light',
        primaryColor: customColors.primaryColor,
        secondaryColor: customColors.secondaryColor,
        accentColor: customColors.accentColor,
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        surfaceColor: isDarkMode ? '#374151' : '#f8fafc',
        textColor: isDarkMode ? '#f9fafb' : '#1e293b',
        borderColor: isDarkMode ? '#4b5563' : '#e2e8f0',
        shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(37, 99, 235, 0.1)',
        customCSS: ''
      };

      // テーマを適用
      applyTheme(customTheme);
      
      // 設定を更新
      const updatedPreferences = {
        ...preferences,
        theme: customTheme
      };
      setPreferences(updatedPreferences);
      
      // 成功メッセージ
      showConfetti();
      playSound('success');
      alert('カスタムテーマが作成されました！🎨');
      
      markAsChanged();
    }
  };

  // カラーパレットの選択処理
  const handlePaletteSelect = (palette: any) => {
    setCustomColors({
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent
    });
    markAsChanged();
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
      setHasUnsavedChanges(false); // 保存後に変更フラグをリセット
      showConfetti();
      playSound('success');
      
      // 成功メッセージを表示
      alert('設定が正常に保存されました！🎉');
    } else {
      alert('設定の保存に失敗しました。ユーザー情報を確認してください。');
    }
  };

  // 設定が変更されたかどうかをチェック
  const hasChanges = preferences !== null && hasUnsavedChanges;

  // 設定変更時にフラグを設定
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  const handleAnimationToggle = (enabled: boolean) => {
    setPreferences(prev => prev ? {
      ...prev,
      animations: { ...prev.animations, enabled }
    } : null);
    markAsChanged();
  };

  const handleSoundToggle = (enabled: boolean) => {
    setPreferences(prev => prev ? {
      ...prev,
      sounds: { ...prev.sounds, enabled }
    } : null);
    markAsChanged();
  };

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
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: color.value }}
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{color.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{color.description}</p>
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
                          onChange={(e) => handleCustomColorChange(colorType as 'primaryColor' | 'secondaryColor' | 'accentColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colorValue}
                          onChange={(e) => handleCustomColorChange(colorType as 'primaryColor' | 'secondaryColor' | 'accentColor', e.target.value)}
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
              {/* アニメーション効果 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <SparklesIcon className="w-5 h-5 text-purple-500 mr-2" />
                  アニメーション効果
                </h3>
                
                {/* デモ要素 */}
                <div 
                  ref={setDemoElementRef}
                  className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-6 mx-auto"
                >
                  デモ
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { value: 'playful', label: '遊び心', description: '楽しく弾むような動き' },
                        { value: 'smooth', label: 'スムーズ', description: '滑らかで自然な動き' },
                        { value: 'delicate', label: '繊細', description: '繊細で上品な動き' }
                      ].map((type) => (
                        <div
                          key={type.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            preferences.animations.type === type.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => {
                            setPreferences(prev => prev ? {
                              ...prev,
                              animations: { ...prev.animations, type: type.value as any }
                            } : null);
                            markAsChanged();
                          }}
                        >
                          <div className="text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showAnimationDemo(type.value);
                              }}
                              className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm mb-2"
                            >
                              デモを見る
                            </button>
                            <h4 className="font-medium text-gray-900 dark:text-white">{type.label}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* サウンド効果 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MusicalNoteIcon className="w-5 h-5 text-green-500 mr-2" />
                  サウンド効果
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
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
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span>{Math.round(preferences.sounds.volume * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* サウンド効果のデモ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      サウンド効果のデモ
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { type: 'buttonClick', label: 'ボタンクリック' },
                        { type: 'success', label: '成功音' },
                        { type: 'error', label: 'エラー音' },
                        { type: 'notification', label: '通知音' }
                      ].map((sound) => (
                        <button
                          key={sound.type}
                          onClick={() => playSoundDemo(sound.type)}
                          className="py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          {sound.label}
                        </button>
                      ))}
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
          disabled={!hasChanges}
          className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
            hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
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

// CSSアニメーションのスタイル
const animationStyles = `
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0,-30px,0); }
    70% { transform: translate3d(0,-15px,0); }
    90% { transform: translate3d(0,-4px,0); }
  }
  
  @keyframes wiggle {
    0%, 7% { transform: rotateZ(0); }
    15% { transform: rotateZ(-15deg); }
    20% { transform: rotateZ(10deg); }
    25% { transform: rotateZ(-10deg); }
    30% { transform: rotateZ(6deg); }
    35% { transform: rotateZ(-4deg); }
    40%, 100% { transform: rotateZ(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); }
  }
`;

// スタイルを適用
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationStyles;
  document.head.appendChild(style);
}
