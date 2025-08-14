import type { UserProfile, ProfileUpdateData } from '../types/theme';

// デフォルトアバターの選択肢
export const DEFAULT_AVATARS = [
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.png',
  '/avatars/avatar-5.png',
  '/avatars/avatar-6.png',
];

// カスタムアバターカラー
export const AVATAR_COLORS = [
  '#3B82F6', // 青
  '#10B981', // 緑
  '#F59E0B', // 黄
  '#EF4444', // 赤
  '#8B5CF6', // 紫
  '#F97316', // オレンジ
  '#06B6D4', // シアン
  '#84CC16', // ライム
];

// ユーザープロフィールの保存
export const saveUserProfile = (profile: UserProfile): void => {
  try {
    const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    profiles[profile.uid] = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
  } catch (error) {
    console.error('プロフィールの保存に失敗:', error);
  }
};

// ユーザープロフィールの取得
export const getUserProfile = (uid: string): UserProfile | null => {
  try {
    const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    const profile = profiles[uid];
    if (profile) {
      return {
        ...profile,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      };
    }
    return null;
  } catch (error) {
    console.error('プロフィールの取得に失敗:', error);
    return null;
  }
};

// プロフィールの更新
export const updateUserProfile = (uid: string, updates: ProfileUpdateData): UserProfile | null => {
  try {
    const currentProfile = getUserProfile(uid);
    if (!currentProfile) {
      return null;
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date(),
    };

    saveUserProfile(updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('プロフィールの更新に失敗:', error);
    return null;
  }
};

// デフォルトプロフィールの作成
export const createDefaultProfile = (uid: string, email: string, displayName?: string): UserProfile => {
  const profile: UserProfile = {
    uid,
    displayName: displayName || email.split('@')[0],
    email,
    avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    bio: '',
    company: '',
    position: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  saveUserProfile(profile);
  return profile;
};

// アバターの生成（イニシャルベース）
export const generateInitialsAvatar = (name: string, color: string = AVATAR_COLORS[0]): string => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // SVGベースのアバターを生成
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${color}" rx="20"/>
      <text x="20" y="26" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// プロフィールの検証
export const validateProfile = (profile: Partial<UserProfile>): string[] => {
  const errors: string[] = [];

  if (profile.displayName && profile.displayName.trim().length < 2) {
    errors.push('表示名は2文字以上である必要があります');
  }

  if (profile.displayName && profile.displayName.trim().length > 50) {
    errors.push('表示名は50文字以下である必要があります');
  }

  if (profile.bio && profile.bio.length > 200) {
    errors.push('自己紹介は200文字以下である必要があります');
  }

  if (profile.company && profile.company.length > 100) {
    errors.push('会社名は100文字以下である必要があります');
  }

  if (profile.position && profile.position.length > 100) {
    errors.push('役職は100文字以下である必要があります');
  }

  return errors;
};
