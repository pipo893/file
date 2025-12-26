import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QuizData, UserAnswers } from '../types';
import { Button } from './Button';

interface QuizPlayerProps {
  data: QuizData;
  onFinish: (answers: UserAnswers, timeSpent: number) => void;
  initialAnswers?: UserAnswers;
  initialTimeLeft?: number | null;
  onProgressUpdate?: (answers: UserAnswers, timeLeft: number) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ 
  data, 
  onFinish, 
  initialAnswers = {}, 
  initialTimeLeft = null,
  onProgressUpdate 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>(initialAnswers);
  const [startTime] = useState(Date.now());
  
  // Use initialTimeLeft if provided, otherwise default to configured time limit or 1 min/question fallback
  const allocatedTime = data.timeLimit || data.questions.length * 60;
  const [timeLeft, setTimeLeft] = useState(
    initialTimeLeft !== null ? initialTimeLeft : allocatedTime
  );

  // Determine starting question index based on first unanswered question
  useEffect(() => {
    if (Object.keys(initialAnswers).length > 0) {
      const firstUnanswered = data.questions.findIndex(q => !initialAnswers[q.id]);
      if (firstUnanswered !== -1) {
        setCurrentQuestionIndex(firstUnanswered);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newVal = prev - 1;
        // Save progress periodically (e.g., every 5 seconds) to avoid spamming localStorage
        if (newVal % 5 === 0 && onProgressUpdate) {
          onProgressUpdate(answers, newVal);
        }

        if (newVal <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return newVal;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, onProgressUpdate]);

  // Save on answer change
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(answers, timeLeft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const handleSelectOption = (questionId: number, optionKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid interfering if focus is on an input (though none exist here yet)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const currentQ = data.questions[currentQuestionIndex];

      switch (e.key) {
        case 'ArrowLeft':
          setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault(); // Prevent default Enter behavior (like form submission if wrapped)
          setCurrentQuestionIndex(prev => Math.min(data.questions.length - 1, prev + 1));
          break;
        case '1':
        case 'a':
        case 'A':
          if (currentQ.options.some(o => o.key === 'A')) handleSelectOption(currentQ.id, 'A');
          break;
        case '2':
        case 'b':
        case 'B':
          if (currentQ.options.some(o => o.key === 'B')) handleSelectOption(currentQ.id, 'B');
          break;
        case '3':
        case 'c':
        case 'C':
          if (currentQ.options.some(o => o.key === 'C')) handleSelectOption(currentQ.id, 'C');
          break;
        case '4':
        case 'd':
        case 'D':
          if (currentQ.options.some(o => o.key === 'D')) handleSelectOption(currentQ.id, 'D');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.questions, currentQuestionIndex]); // Dependency on currentQuestionIndex is crucial for option selection

  const handleSubmit = () => {
    // Calculate actual time spent based on original duration vs time left
    const spent = Math.max(0, allocatedTime - timeLeft);
    onFinish(answers, spent);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / data.questions.length) * 100);
  }, [answers, data.questions.length]);

  const currentQuestion = data.questions[currentQuestionIndex];
  const isCurrentQuestionAnswered = !!answers[currentQuestion.id];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Sidebar - Navigation */}
      <div className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Danh sách câu hỏi</h3>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Đã làm: {Object.keys(answers).length}/{data.questions.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
            <div className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-4 gap-2">
            {data.questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCorrect = answers[q.id] === q.correctAnswer;
              
              let bgClass = 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600';
              if (isAnswered) {
                bgClass = isCorrect 
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' 
                  : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-colors
                    ${currentQuestionIndex === idx ? 'ring-2 ring-indigo-600 ring-offset-1 dark:ring-offset-slate-800' : ''}
                    ${bgClass}
                  `}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Shortcut Legend */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-[10px] text-slate-400 dark:text-slate-500">
           <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div>Enter/→ : Câu sau</div>
              <div>← : Câu trước</div>
              <div>A-D / 1-4 : Chọn đáp án</div>
           </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
           <div className="flex items-center justify-between mb-4 text-slate-700 dark:text-slate-300 font-mono font-medium bg-white dark:bg-slate-700 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-600">
             <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">Thời gian</span>
             <span>{formatTime(timeLeft)}</span>
           </div>
           <Button onClick={handleSubmit} className="w-full">
             Nộp bài
           </Button>
        </div>
      </div>

      {/* Main Content - Question */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
           <span className="font-semibold text-slate-700 dark:text-slate-200">Câu {currentQuestionIndex + 1}/{data.questions.length}</span>
           <span className="font-mono text-slate-700 dark:text-slate-300">{formatTime(timeLeft)}</span>
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Câu hỏi {currentQuestionIndex + 1}
              </span>
              <h2 className="text-xl md:text-2xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.key;
                const isCorrectAnswer = option.key === currentQuestion.correctAnswer;
                
                let containerClass = "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700/50";
                let circleClass = "border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400 group-hover:border-indigo-400 dark:group-hover:border-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400";
                let textClass = "text-slate-700 dark:text-slate-300";

                // Instant Feedback Logic
                if (isCurrentQuestionAnswered) {
                  if (isCorrectAnswer) {
                     // Correct (Green)
                     containerClass = "border-green-500 dark:border-green-500/70 bg-green-50 dark:bg-green-900/20";
                     circleClass = "bg-green-600 dark:bg-green-600 border-green-600 text-white";
                     textClass = "text-green-900 dark:text-green-200 font-medium";
                  } else if (isSelected && !isCorrectAnswer) {
                     // Wrong (Red)
                     containerClass = "border-red-500 dark:border-red-500/70 bg-red-50 dark:bg-red-900/20";
                     circleClass = "bg-red-500 dark:bg-red-600 border-red-500 text-white";
                     textClass = "text-red-900 dark:text-red-200 font-medium";
                  } else {
                     // Fade out
                     containerClass = "border-slate-100 dark:border-slate-800 opacity-50";
                  }
                }

                return (
                  <label 
                    key={option.key}
                    className={`
                      flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                      ${containerClass}
                    `}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.key}
                      checked={isSelected}
                      onChange={() => handleSelectOption(currentQuestion.id, option.key)}
                      className="hidden"
                    />
                    <div className={`
                      w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mr-4 shrink-0 transition-colors
                      ${circleClass}
                    `}>
                      {option.key}
                    </div>
                    <span className={`text-base ${textClass} flex-1`}>
                      {option.text}
                    </span>
                    
                    {/* Status Icons */}
                    {isCurrentQuestionAnswered && isCorrectAnswer && (
                      <span className="text-green-600 dark:text-green-400 ml-2">✓</span>
                    )}
                    {isCurrentQuestionAnswered && isSelected && !isCorrectAnswer && (
                      <span className="text-red-600 dark:text-red-400 ml-2">✗</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Instant Explanation */}
            {isCurrentQuestionAnswered && currentQuestion.explanation && (
              <div className="mt-6 animate-fade-in-up">
                <div className={`p-4 rounded-lg border text-sm ${
                   answers[currentQuestion.id] === currentQuestion.correctAnswer 
                   ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-100 dark:border-blue-800' 
                   : 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100 border-orange-100 dark:border-orange-800' 
                }`}>
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Giải thích
                  </div>
                  <p>{currentQuestion.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex-1 lg:flex-none lg:px-6"
          >
            ← Câu trước
          </Button>
          
          <div className="lg:hidden flex-1 px-1">
             <Button onClick={handleSubmit} variant="outline" className="w-full text-xs sm:text-sm px-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
               Nộp bài
             </Button>
          </div>

          <Button 
            variant="primary" 
            onClick={() => setCurrentQuestionIndex(prev => Math.min(data.questions.length - 1, prev + 1))}
            disabled={currentQuestionIndex === data.questions.length - 1}
            className="flex-1 lg:flex-none lg:px-6"
          >
            Câu sau →
          </Button>
        </div>
      </div>
    </div>
  );
};