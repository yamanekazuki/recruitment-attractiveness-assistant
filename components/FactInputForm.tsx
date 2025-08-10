import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface FactInputFormProps {
  onSubmit: (fact: string) => void;
  isLoading: boolean;
}

export const FactInputForm: React.FC<FactInputFormProps> = ({ onSubmit, isLoading }) => {
  const [fact, setFact] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fact.trim() && !isLoading) {
      onSubmit(fact.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <label htmlFor="factInput" className="block text-lg font-semibold mb-2 text-purple-600">
        会社の「事実」を入力してください:
      </label>
      <textarea
        id="factInput"
        value={fact}
        onChange={(e) => setFact(e.target.value)}
        placeholder="例: 当社のインフラエンジニアは優秀です。"
        rows={4}
        className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-gray-900 placeholder-gray-400 resize-y min-h-[100px]"
        disabled={isLoading}
        aria-label="会社に関する事実入力エリア"
      />
      <button
        type="submit"
        disabled={isLoading || !fact.trim()}
        className="mt-4 w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label={isLoading ? "魅力ポイントを生成中" : "魅力ポイントを生成する"}
      >
        <SendIcon className="w-5 h-5 mr-2" />
        {isLoading ? '生成中...' : '魅力ポイントを生成'}
      </button>
    </form>
  );
};