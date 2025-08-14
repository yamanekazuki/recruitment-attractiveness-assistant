import React, { useState } from 'react';
import type { AttractivenessOutput, AttractivenessPoint } from '../types';
import { BrainIcon, HeartIcon, LightbulbIcon, ClipboardCopyIcon, CheckIcon, ZapIcon } from './Icons';

interface AttractivenessDisplayProps {
  data: AttractivenessOutput;
}

const PointCard: React.FC<{ point: AttractivenessPoint; index: number }> = ({ point }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(point.description);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Consider adding a user-facing error message here if desired
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col">
      <div className="flex items-start mb-3">
        <LightbulbIcon className="w-6 h-6 text-yellow-500 mr-3 shrink-0 mt-1" />
        <h4 className="text-xl font-semibold text-slate-700 flex-grow">{point.title}</h4>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-md transition-colors duration-150 ${
            isCopied 
              ? 'bg-green-100 hover:bg-green-200' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          aria-label={isCopied ? `${point.title}の説明をコピーしました` : `${point.title}の説明をコピー`}
          aria-live="polite"
        >
          {isCopied ? (
            <CheckIcon className="w-5 h-5 text-green-600" />
          ) : (
            <ClipboardCopyIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed flex-grow">{point.description}</p>
    </div>
  );
};


export const AttractivenessDisplay: React.FC<AttractivenessDisplayProps> = ({ attractiveness }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <ZapIcon className="w-5 h-5 text-yellow-500 mr-2" />
        魅力ポイント
      </h3>
      
      <div className="space-y-4">
        {attractiveness.points.map((point, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border-l-4 border-blue-500 dark:border-blue-400"
          >
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {point.title}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {point.description}
            </p>
          </div>
        ))}
      </div>
      
      {attractiveness.summary && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border-l-4 border-purple-500 dark:border-purple-400">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">総合評価</h4>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {attractiveness.summary}
          </p>
        </div>
      )}
    </div>
  );
};