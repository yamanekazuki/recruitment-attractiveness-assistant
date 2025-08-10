import React from 'react';
import { AlertTriangleIcon } from './Icons';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="my-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-start" role="alert">
      <AlertTriangleIcon className="w-6 h-6 mr-3 shrink-0 text-red-500" />
      <div>
        <h4 className="font-bold text-red-800">エラーが発生しました</h4>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};