import React, { useCallback, useState } from 'react';
import { Button } from './Button';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);

  // Allowed file types
  const acceptedTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const isValidFile = (file: File) => {
    const validMimes = Object.keys(acceptedTypes);
    // Check mime type or extension as fallback
    if (validMimes.includes(file.type)) return true;
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return Object.values(acceptedTypes).flat().includes(extension);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      } else {
        alert("Định dạng file không hỗ trợ. Vui lòng tải lên PDF, Word, Ảnh hoặc Text.");
      }
    }
  }, [onFileSelect, acceptedTypes]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Tạo Đề Trắc Nghiệm Từ Tài Liệu
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Tải lên đề thi (PDF, Word, Ảnh...). AI sẽ tự động phân tích và tạo bài thi trắc nghiệm trực tuyến trong vài giây.
        </p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ease-in-out
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]' 
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png,.webp"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleChange}
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
            <svg className={`w-12 h-12 ${dragActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              {dragActive ? "Thả file vào đây" : "Kéo thả file tài liệu vào đây"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hỗ trợ: PDF, Word (.docx), Ảnh (JPG/PNG), Text (.txt)
            </p>
          </div>
          <div className="pt-4">
            <Button disabled={isProcessing} variant="secondary" className="pointer-events-none dark:bg-slate-700 dark:text-white dark:border-slate-600">
              Chọn File
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <FeatureItem 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
          title="Đa dạng định dạng"
          desc="Hỗ trợ PDF, Word, file ảnh chụp đề thi hoặc văn bản thô."
        />
        <FeatureItem 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
          title="Tự động chấm điểm"
          desc="Hệ thống tự động xác định đáp án đúng và chấm điểm."
        />
        <FeatureItem 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
          title="Giải thích chi tiết"
          desc="AI cung cấp lời giải thích cho từng câu hỏi khó."
        />
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
    </div>
    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);