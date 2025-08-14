import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface FactInputFormProps {
  onSubmit: (fact: string) => void;
  isLoading: boolean;
}

export const FactInputForm: React.FC<FactInputFormProps> = ({ onSubmit, isLoading }) => {
  const [fact, setFact] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fact.trim()) {
      onSubmit(fact.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <label htmlFor="fact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          会社の「事実」を入力してください:
        </label>
        <textarea
          id="fact"
          value={fact}
          onChange={(e) => setFact(e.target.value)}
          placeholder="例: 当社のインフラエンジニアは優秀です。"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          rows={4}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? '生成中...' : '魅力ポイントを生成'}
      </button>
    </form>
  );
};