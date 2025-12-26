import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { QuizData } from '../types';

interface QuizConfigProps {
  data: QuizData;
  onStart: (config: { questionCount: number; isRandom: boolean; timeLimit: number }) => void;
  onCancel: () => void;
  onLoadBatch: (index: number) => void;
  currentBatchIndex: number;
}

export const QuizConfig: React.FC<QuizConfigProps> = ({ data, onStart, onCancel, onLoadBatch, currentBatchIndex }) => {
  const totalQuestions = data.questions.length;
  const LIMIT = 50;
  // Limit max questions to 50 or total available if less than 50
  const maxAllowed = Math.min(totalQuestions, LIMIT);

  const [questionCount, setQuestionCount] = useState(maxAllowed);
  const [timeLimit, setTimeLimit] = useState(maxAllowed); // Minutes
  const [isRandom, setIsRandom] = useState(false);

  // Update question count when data changes (e.g. after loading a new batch)
  useEffect(() => {
    const count = Math.min(data.questions.length, LIMIT);
    setQuestionCount(count);
    setTimeLimit(count);
  }, [data]);

  // Sync time limit with question count (1 min per question default)
  const handleQuestionCountChange = (val: number) => {
    setQuestionCount(val);
    setTimeLimit(val);
  };

  const handleStart = () => {
    onStart({ 
      questionCount, 
      isRandom,
      timeLimit: timeLimit * 60 // Convert to seconds
    });
  };

  // Generate batch options (assuming max 1000 questions / 20 batches for now)
  const batchOptions = [];
  for (let i = 0; i < 20; i++) {
    const start = i * 50 + 1;
    const end = (i + 1) * 50;
    batchOptions.push({ value: i, label: `Phần ${i + 1} (Câu ${start} - ${end})` });
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cấu hình bài thi</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Đề tài: <span className="font-medium text-slate-700 dark:text-slate-300">{data.title}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Batch Selector */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
              Chọn phần bài tập (File lớn)
            </label>
            <select 
              value={currentBatchIndex}
              onChange={(e) => onLoadBatch(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            >
              {batchOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
              * Nếu file có nhiều hơn 50 câu, hãy chọn các phần tiếp theo để tải thêm.
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-6"></div>

          {/* Question Count Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Số lượng câu hỏi muốn làm (Tối đa: {maxAllowed})
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max={maxAllowed}
                value={questionCount}
                onChange={(e) => handleQuestionCountChange(parseInt(e.target.value))}
                disabled={maxAllowed === 0}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 disabled:opacity-50"
              />
              <div className="w-16">
                <input
                  type="number"
                  min="1"
                  max={maxAllowed}
                  value={questionCount}
                  onChange={(e) => {
                    const val = Math.min(Math.max(1, parseInt(e.target.value) || 1), maxAllowed);
                    handleQuestionCountChange(val);
                  }}
                  disabled={maxAllowed === 0}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-center font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Time Limit Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Thời gian làm bài (phút)
            </label>
            <div className="flex items-center gap-4">
               <input
                type="number"
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
               />
               <span className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">phút</span>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Chế độ làm bài
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsRandom(false)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  !isRandom 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600' 
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className={`font-semibold mb-1 ${!isRandom ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Theo thứ tự</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Làm từ câu đầu đến hết</div>
              </button>

              <button
                onClick={() => setIsRandom(true)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isRandom 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600' 
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className={`font-semibold mb-1 ${isRandom ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Ngẫu nhiên</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Đảo lộn vị trí câu hỏi</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Chọn file khác
        </Button>
        <Button onClick={handleStart} disabled={maxAllowed === 0}>
          Bắt đầu làm bài
        </Button>
      </div>
    </div>
  );
};