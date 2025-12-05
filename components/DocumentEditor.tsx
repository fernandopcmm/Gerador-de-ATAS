import React, { useRef, useEffect, useState } from 'react';

interface DocumentEditorProps {
  initialContent: string;
  onContentChange: (newContent: string) => void;
  isGenerating: boolean;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialContent, onContentChange, isGenerating }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [internalHtml, setInternalHtml] = useState(initialContent);

  // Sync initial content when it changes from the parent (e.g., after AI generation)
  useEffect(() => {
    setInternalHtml(initialContent);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setInternalHtml(html);
      // Debounce this in a real app, calling directly here for simplicity
      onContentChange(html);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-sm w-full h-full max-w-[210mm] mx-auto min-h-[297mm] p-[20mm] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible">
      {isGenerating && (
        <div className="flex items-center justify-center h-40 space-x-2 animate-pulse text-primary">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Gerando ata...</span>
        </div>
      )}
      
      {!isGenerating && !internalHtml && (
        <div className="text-center text-slate-400 mt-20 font-sans">
          <p>Faça o upload de uma transcrição para gerar a ata.</p>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={!isGenerating}
        onInput={handleInput}
        style={{ 
          fontFamily: '"Times New Roman", Times, serif', 
          fontSize: '12pt',
          lineHeight: '1.5'
        }}
        className={`outline-none prose max-w-none prose-p:text-justify empty:before:content-['Digite_aqui...'] empty:before:text-slate-300 ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default DocumentEditor;