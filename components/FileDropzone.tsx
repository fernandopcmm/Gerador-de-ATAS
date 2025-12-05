import React, { useCallback } from 'react';

interface FileDropzoneProps {
  onFileLoaded: (content: string, fileName: string) => void;
  disabled?: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileLoaded, disabled }) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onFileLoaded(text, file.name);
    };
    reader.readAsText(file); // Primarily supports .txt. 
  }, [onFileLoaded]);

  return (
    <div className="w-full">
      <label 
        htmlFor="file-upload" 
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
        ${disabled ? 'bg-slate-100 border-slate-300 cursor-not-allowed' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-primary'} transition-colors`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
          <p className="text-xs text-slate-500">.TXT (Transcrições de reuniões)</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".txt" 
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default FileDropzone;