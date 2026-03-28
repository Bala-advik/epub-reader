import React, { useCallback, useState } from 'react';

interface DropZoneProps {
  onFileLoaded: (file: ArrayBuffer, name: string) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/epub+zip" && !file.name.endsWith('.epub')) {
      alert("Please upload a valid .epub file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onFileLoaded(e.target.result as ArrayBuffer, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div 
        className={`
          w-full max-w-2xl p-12 rounded-3xl border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
          <i className="fas fa-book-open text-4xl"></i>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Lumina Reader</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-lg">
          Drag & drop your EPUB file here, or click to browse. Experience reading with AI-powered insights.
        </p>
        
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition hover:-translate-y-1">
          <span>Choose File</span>
          <input 
            type="file" 
            accept=".epub,application/epub+zip" 
            className="hidden" 
            onChange={handleFileInput}
          />
        </label>
      </div>
      
      <div className="mt-8 text-sm text-gray-400 flex space-x-6">
        <span className="flex items-center"><i className="fas fa-check-circle mr-2 text-green-500"></i> Local Processing</span>
        <span className="flex items-center"><i className="fas fa-check-circle mr-2 text-green-500"></i> Gemini AI Integrated</span>
        <span className="flex items-center"><i className="fas fa-check-circle mr-2 text-green-500"></i> Customizable</span>
      </div>
    </div>
  );
};

export default DropZone;
