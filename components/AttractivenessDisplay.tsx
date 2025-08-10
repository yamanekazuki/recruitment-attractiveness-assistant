import React, { useState } from 'react';
import type { AttractivenessOutput, AttractivenessPoint } from '../types';
import { BrainIcon, HeartIcon, LightbulbIcon, ClipboardCopyIcon, CheckIcon } from './Icons';

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


export const AttractivenessDisplay: React.FC<AttractivenessDisplayProps> = ({ data }) => {
  return (
    <div className="mt-8 space-y-10">
      <div>
        <div className="flex items-center mb-6">
          <BrainIcon className="w-8 h-8 text-purple-600 mr-3" />
          <h3 className="text-2xl md:text-3xl font-bold text-purple-700">合理的魅力ポイント</h3>
        </div>
        {data.rationalPoints.length > 0 ? (
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {data.rationalPoints.map((point, index) => (
              <PointCard key={`rational-${index}`} point={point} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">合理的魅力ポイントは見つかりませんでした。</p>
        )}
      </div>

      <div>
        <div className="flex items-center mb-6">
          <HeartIcon className="w-8 h-8 text-pink-500 mr-3" />
          <h3 className="text-2xl md:text-3xl font-bold text-pink-600">情理的魅力ポイント</h3>
        </div>
        {data.emotionalPoints.length > 0 ? (
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {data.emotionalPoints.map((point, index) => (
              <PointCard key={`emotional-${index}`} point={point} index={index} />
            ))}
          </div>
        ) : (
           <p className="text-gray-500 italic">情理的魅力ポイントは見つかりませんでした。</p>
        )}
      </div>
    </div>
  );
};