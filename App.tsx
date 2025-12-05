import React, { useState, useCallback } from 'react';
import { generateMinutesFromTranscript, refineMinutes } from './services/geminiService';
import FileDropzone from './components/FileDropzone';
import DocumentEditor from './components/DocumentEditor';
import ChatPanel from './components/ChatPanel';
import { AppStatus, Message } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [minutesHtml, setMinutesHtml] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcriptName, setTranscriptName] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');

  const handleFileLoaded = useCallback(async (content: string, fileName: string) => {
    setTranscript(content);
    setTranscriptName(fileName);
    setStatus(AppStatus.GENERATING);

    try {
      const generatedHtml = await generateMinutesFromTranscript(content);
      setMinutesHtml(generatedHtml);
      setStatus(AppStatus.READY);
      
      // Add initial greeting from AI
      setMessages([{
        id: 'init',
        role: 'model',
        text: 'A ata foi gerada com base na transcrição. Você pode editá-la diretamente no documento ou pedir alterações por aqui.',
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      alert('Erro ao gerar a ata. Verifique sua chave de API ou tente novamente.');
    }
  }, []);

  const handleRefineRequest = async (instruction: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: instruction,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setStatus(AppStatus.REFINING);

    try {
      const refinedHtml = await refineMinutes(minutesHtml, instruction);
      setMinutesHtml(refinedHtml);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Documento atualizado com sucesso.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      setStatus(AppStatus.READY);
    } catch (error) {
      console.error(error);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Desculpe, tive um problema ao tentar atualizar o documento.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      setStatus(AppStatus.READY); // Return to ready even if error so user can try again
    }
  };

  const handleDocumentChange = (newContent: string) => {
    setMinutesHtml(newContent);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = () => {
    // Basic HTML to DOC export hack
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + minutesHtml + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `ata_reuniao_${new Date().toISOString().slice(0, 10)}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Header - No Print */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between no-print z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Gerador de Atas IA</h1>
            {transcriptName && <span className="text-xs text-slate-500 block">Arquivo base: {transcriptName}</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {status !== AppStatus.IDLE && (
            <>
              <button 
                onClick={handleExportWord}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M14.5 13.5h2v-3h-2v3zm0-4h2v-3h-2v3zm0-4h2v-3h-2v3zM6 2v20h12V2H6zm10 18H8V4h8v16z"/>
                </svg>
                Exportar DOC
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Exportar PDF
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Document Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-8 relative print:p-0 print:bg-white print:overflow-visible">
          
          {/* Upload Overlay (If Idle) */}
          {status === AppStatus.IDLE && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90 backdrop-blur-sm p-8">
               <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-slate-200">
                  <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Começar nova ata</h2>
                  <p className="text-center text-slate-500 mb-8">Faça o upload do arquivo de transcrição para que a IA possa gerar o documento.</p>
                  <FileDropzone onFileLoaded={handleFileLoaded} />
               </div>
            </div>
          )}

          {/* Editor Container */}
          <div className="max-w-[210mm] mx-auto print:max-w-none print:w-full">
            <DocumentEditor 
              initialContent={minutesHtml} 
              onContentChange={handleDocumentChange}
              isGenerating={status === AppStatus.GENERATING || status === AppStatus.REFINING}
            />
          </div>
        </main>

        {/* Right Sidebar - Chat */}
        {status !== AppStatus.IDLE && (
          <aside className="w-80 flex-none z-20 shadow-xl no-print">
            <ChatPanel 
              messages={messages} 
              onSendMessage={handleRefineRequest}
              isLoading={status === AppStatus.REFINING || status === AppStatus.GENERATING}
            />
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;