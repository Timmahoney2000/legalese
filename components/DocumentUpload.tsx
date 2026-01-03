'use client';

import { useState, useRef, DragEvent } from 'react';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export default function DocumentUpload({ onUpload, isProcessing, disabled }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExtensions = /\.(pdf|docx?|txt)$/i;
    
    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      alert('Please upload a PDF, DOCX, or TXT file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    onUpload(file);
  };
  
  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center
          transition-all duration-300 bg-legal-cream/50
          ${isDragging 
            ? 'border-legal-gold bg-legal-gold/10 scale-105' 
            : 'border-legal-stone/30 hover:border-legal-gold/50'
          }
          ${isProcessing || disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isProcessing && !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInput}
          disabled={isProcessing || disabled}
        />
        
        {isProcessing ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-legal-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-legal-navy font-medium">Processing your document...</p>
            <p className="text-legal-stone text-sm">This may take a few moments</p>
          </div>
        ) : disabled ? (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-semibold text-legal-navy mb-2">
              Loading...
            </h3>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-legal-navy/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-legal-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <h3 className="font-serif text-2xl font-semibold text-legal-navy mb-2">
                Drop your legal document here
              </h3>
              <p className="text-legal-stone mb-4">
                or click to browse your files
              </p>
            </div>
            
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-legal-navy text-legal-cream rounded-lg font-medium hover:bg-legal-slate transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Choose File
            </div>
            
            <div className="mt-6 pt-6 border-t border-legal-stone/20">
              <p className="text-sm text-legal-stone mb-2">
                Supported formats: PDF, DOCX, TXT
              </p>
              <p className="text-xs text-legal-stone/70">
                Maximum file size: 10MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}