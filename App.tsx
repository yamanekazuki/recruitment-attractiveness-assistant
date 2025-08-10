import React, { useState, useCallback } from 'react';
import { FactInputForm } from './components/FactInputForm';
import { AttractivenessDisplay } from './components/AttractivenessDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { generateAttractivenessPoints } from './services/geminiService';
import type { AttractivenessOutput } from './types';
import { InfoIcon, ZapIcon } from './components/Icons';


const App: React.FC = () => {
  const [attractiveness, setAttractiveness] = useState<AttractivenessOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFactSubmit = useCallback(async (fact: string) => {
    setIsLoading(true);
    setError(null);
    setAttractiveness(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("APIキーが設定されていません。環境変数 API_KEY を設定してください。");
      }
      const result = await generateAttractivenessPoints(fact);
      setAttractiveness(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(`エラーが発生しました: ${err.message}`);
      } else {
        setError("不明なエラーが発生しました。");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
          <ZapIcon className="w-10 h-10 md:w-12 md:h-12 mr-3" />
          <h1 className="text-3xl md:text-5xl font-bold">
            採用魅力発見アシスタント
          </h1>
        </div>
        <p className="text-gray-600 mt-3 text-sm md:text-base max-w-2xl mx-auto">
          会社に関する「事実」を入力してください。AIがその事実を分析し、求職者に響く「合理的魅力」と「情理的魅力」を提案します。
        </p>
      </header>

      <main className="flex-grow bg-white shadow-xl rounded-xl p-6 md:p-10">
        <FactInputForm onSubmit={handleFactSubmit} isLoading={isLoading} />

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        
        {attractiveness && !isLoading && !error && (
          <AttractivenessDisplay data={attractiveness} />
        )}

        {!attractiveness && !isLoading && !error && (
           <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <InfoIcon className="w-12 h-12 mx-auto text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-purple-700 mb-2">準備完了</h3>
            <p className="text-purple-600">
              会社の魅力にしたい「事実」を上のフォームに入力し、「魅力ポイントを生成」ボタンをクリックしてください。
            </p>
          </div>
        )}
      </main>

      <footer className="text-center mt-12 py-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} 採用魅力発見アシスタント. AI搭載.
        </p>
      </footer>
    </div>
  );
};

export default App;