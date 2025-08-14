import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  createDefaultProfile, 
  validateProfile,
  generateInitialsAvatar,
  AVATAR_COLORS
} from '../services/profileService';
import type { UserProfile, ProfileUpdateData } from '../types/theme';
import { 
  UserCircleIcon, 
  PencilIcon, 
  PhotoIcon, 
  CheckIcon, 
  XMarkIcon,
  ChevronDownIcon
} from '../../components/Icons';

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileUpdateData>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);

  useEffect(() => {
    if (currentUser) {
      let userProfile = getUserProfile(currentUser.uid);
      if (!userProfile) {
        userProfile = createDefaultProfile(currentUser.uid, currentUser.email || '', currentUser.displayName || undefined);
      }
      setProfile(userProfile);
      setEditData({
        displayName: userProfile.displayName,
        bio: userProfile.bio,
        company: userProfile.company,
        position: userProfile.position,
      });
    }
  }, [currentUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors([]);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors([]);
    setEditData({
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      company: profile?.company || '',
      position: profile?.position || '',
    });
  };

  const handleSave = async () => {
    if (!currentUser || !profile) return;

    // バリデーション
    const validationErrors = validateProfile(editData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = updateUserProfile(currentUser.uid, editData);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
        setErrors([]);
      }
    } catch (error) {
      setErrors(['プロフィールの更新に失敗しました']);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleAvatarSelect = (avatarPath: string) => {
    setEditData(prev => ({ ...prev, avatar: avatarPath }));
    setShowAvatarSelector(false);
  };

  const handleColorSelect = (color: string) => {
    if (profile) {
      const initials = profile.displayName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      const customAvatar = generateInitialsAvatar(initials, color);
      setEditData(prev => ({ ...prev, avatar: customAvatar }));
    }
    setShowColorSelector(false);
  };

  const getAvatarDisplay = (avatar: string) => {
    if (avatar.startsWith('data:image/svg+xml')) {
      return <img src={avatar} alt="アバター" className="w-10 h-10 rounded-full" />;
    }
    if (avatar.startsWith('/avatars/')) {
      return <img src={avatar} alt="アバター" className="w-10 h-10 rounded-full" />;
    }
    return <UserCircleIcon className="w-10 h-10 text-gray-400" />;
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              編集
            </button>
          )}
        </div>

        {/* アバター設定 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">プロフィール画像</label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {getAvatarDisplay(editData.avatar || profile.avatar)}
              {isEditing && (
                <button
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors"
                >
                  <PhotoIcon className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                >
                  アバター選択
                </button>
                <button
                  onClick={() => setShowColorSelector(!showColorSelector)}
                  className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded border border-purple-200 transition-colors"
                >
                  カラー選択
                </button>
              </div>
            )}
          </div>

          {/* アバター選択モーダル */}
          {showAvatarSelector && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">アバターを選択</h3>
              <div className="grid grid-cols-6 gap-2">
                {['/avatars/avatar-1.png', '/avatars/avatar-2.png', '/avatars/avatar-3.png', '/avatars/avatar-4.png', '/avatars/avatar-5.png', '/avatars/avatar-6.png'].map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleAvatarSelect(avatar)}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors overflow-hidden"
                  >
                    <img src={avatar} alt={`アバター${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* カラー選択モーダル */}
          {showColorSelector && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">カラーを選択</h3>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(color)}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* プロフィール情報 */}
        <div className="space-y-6">
          {/* 表示名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">表示名</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.displayName || ''}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="表示名を入力"
                maxLength={50}
              />
            ) : (
              <p className="text-gray-900">{profile.displayName}</p>
            )}
          </div>

          {/* メールアドレス（読み取り専用） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
            <p className="text-gray-600">{profile.email}</p>
          </div>

          {/* 自己紹介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">自己紹介</label>
            {isEditing ? (
              <textarea
                value={editData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="自己紹介を入力（200文字以内）"
                rows={3}
                maxLength={200}
              />
            ) : (
              <p className="text-gray-900">{profile.bio || '自己紹介が設定されていません'}</p>
            )}
          </div>

          {/* 会社名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="会社名を入力"
                maxLength={100}
              />
            ) : (
              <p className="text-gray-900">{profile.company || '会社名が設定されていません'}</p>
            )}
          </div>

          {/* 役職 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">役職</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="役職を入力"
                maxLength={100}
              />
            ) : (
              <p className="text-gray-900">{profile.position || '役職が設定されていません'}</p>
            )}
          </div>
        </div>

        {/* エラーメッセージ */}
        {errors.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ul className="text-sm text-red-600 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* アクションボタン */}
        {isEditing && (
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  保存
                </>
              )}
            </button>
          </div>
        )}

        {/* 作成日・更新日 */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
          <p>作成日: {profile.createdAt.toLocaleDateString('ja-JP')}</p>
          <p>更新日: {profile.updatedAt.toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
