import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-10 p-6 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      <p className="mt-4 text-lg font-semibold text-purple-700">AIが分析中...</p>
      <p className="text-sm text-purple-600">魅力的なポイントを生成しています。少々お待ちください。</p>
    </div>
  );
};