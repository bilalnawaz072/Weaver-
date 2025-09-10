import React from 'react';
import { SparklesIcon } from '../icons';

interface SynthesizedAnswerProps {
  answer: string;
  isLoading: boolean;
}

export const SynthesizedAnswer: React.FC<SynthesizedAnswerProps> = ({ answer, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <SparklesIcon className="w-5 h-5 text-indigo-400 animate-pulse" />
        <p className="text-gray-400 animate-pulse">Weaver is thinking...</p>
      </div>
    );
  }

  if (!answer) return null;

  return (
    <div>
      <div className="flex items-center space-x-3 mb-3">
        <SparklesIcon className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">Synthesized Answer</h2>
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
        {answer}
        <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />
      </div>
    </div>
  );
};
