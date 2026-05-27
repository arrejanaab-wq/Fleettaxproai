/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Brain, Bot, HelpCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';

interface AiAssistantProps {
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  onResetChat: () => void;
}

export default function AiAssistant({ chatHistory, onSendMessage, onResetChat }: AiAssistantProps) {
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    "How much IFTA do I owe for Q2?",
    "Which driver has CDL or medical card alert warnings?",
    "Which vehicle has low MPG anomalies?",
    "Show our fleet DOT CSA compliance risk scores"
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isSending) return;
    
    const textMsg = userInput;
    setUserInput('');
    setIsSending(true);
    await onSendMessage(textMsg);
    setIsSending(false);
  };

  const selectSuggestion = async (suggest: string) => {
    if (isSending) return;
    setIsSending(true);
    await onSendMessage(suggest);
    setIsSending(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '520px' }} id="compliance-ai-assistant">
      {/* Bot Header details */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800" id="ai-chat-head">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-400/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-sky-400">FleetTax Pro AI Compliance Copilot</span>
            <h3 className="text-sm font-bold leading-none mt-1">FMCSA Compliance & Audit Assistant</h3>
          </div>
        </div>

        <button 
          onClick={onResetChat}
          className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Clear History
        </button>
      </div>

      {/* Main chat ledger messages */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[400px]" id="chat-messages-container">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-4 max-w-md mx-auto" id="chat-empty-state">
            <Bot className="w-12 h-12 text-slate-400 animate-bounce" />
            <div className="space-y-1">
              <strong className="text-sm font-extrabold text-slate-800 font-sans">Enquire anything about IFTA, CDL risks or Fuel Audits</strong>
              <p className="text-xs text-gray-400 leading-relaxed">I am directly connected to your active fleet register, fuel database invoices, and real-time state tax rate matrices. Ask me for custom computations or regulatory guidance under FMCSA rules.</p>
            </div>

            {/* Prompt Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
              {promptSuggestions.map((p, idx) => (
                <button 
                  key={idx} 
                  onClick={() => selectSuggestion(p)}
                  className="text-left text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-3 py-2 rounded-lg border border-slate-100 transition-colors flex items-start gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((m) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div key={m.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-2 shadow-sm border ${
                    isAssistant 
                      ? 'bg-slate-50 border-slate-100 text-slate-800 rounded-tl-none' 
                      : 'bg-slate-900 border-slate-900 text-white rounded-tr-none'
                  }`}>
                    <div className="flex items-center gap-1.5 justify-between">
                      <strong className={`text-[10px] uppercase font-mono tracking-wider ${
                        isAssistant ? 'text-indigo-600' : 'text-slate-400'
                      }`}>
                        {isAssistant ? 'FleetTax Pro Copilot' : 'Administrator'}
                      </strong>
                      <span className="text-[9px] text-gray-400 font-mono font-medium">{m.timestamp}</span>
                    </div>
                    {/* Render message formatting lines */}
                    <div className="whitespace-pre-line font-sans" id={`msg-text-${m.id}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl rounded-tl-none p-4 max-w-[140px] text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
                  <span>AI reasoning...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input controller */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2 bg-slate-50/50" id="chat-input-form">
        <input 
          type="text" 
          value={userInput}
          onChange={e=>setUserInput(e.target.value)}
          placeholder="Ask AI Compliance assistant (e.g. Which CDL driver has violations list?)..." 
          className="flex-1 text-xs border border-gray-200 bg-white px-3.5 py-2.5 rounded-xl text-slate-800"
          id="chat-input-box"
          disabled={isSending}
        />
        <button 
          type="submit" 
          disabled={isSending || !userInput.trim()}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold p-2.5 rounded-xl shrink-0 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
