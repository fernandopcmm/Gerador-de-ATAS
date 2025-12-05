import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200">
      <div className="p-4 bg-white border-b border-slate-200 shadow-sm">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Assistente IA
        </h2>
        <p className="text-xs text-slate-500">Peça ajustes ou modificações na ata.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-sm text-slate-400 mt-10">
            <p>Nenhuma mensagem ainda.</p>
            <p className="mt-2">Exemplos:</p>
            <ul className="mt-1 space-y-1">
              <li>"Mude o prazo da tarefa X"</li>
              <li>"Adicione Fulano nos presentes"</li>
              <li>"Resuma mais a pauta 2"</li>
            </ul>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg rounded-bl-none shadow-sm">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Peça uma alteração..."
            className="w-full pl-4 pr-12 py-2 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1 top-1 p-1.5 bg-primary text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;