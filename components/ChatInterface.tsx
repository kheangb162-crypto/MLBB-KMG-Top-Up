
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Message } from '../types';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm Luminary, your advanced AI assistant. I can help with coding, reasoning, and creative tasks. How can I assist you today?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Create a new instance right before making an API call to ensure it uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // We'll use a chat session for context awareness
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: 'You are Luminary, a world-class senior engineer and creative strategist. You provide precise, insightful, and helpful responses.',
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });

      const result = await chat.sendMessageStream({ message: input });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '', timestamp: Date.now() }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        // Use the .text property directly, as per SDK extraction rules
        fullResponse += c.text || '';
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "I encountered an error. Please check your connectivity and try again.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 glass sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <h2 className="font-display font-semibold text-lg">Luminary Chat v3</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Gemini 3 Pro</span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Thinking Enabled</span>
        </div>
      </header>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10 ml-12' 
                : 'bg-white/5 border border-white/10 text-slate-200 mr-12'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
              <span className="text-[10px] opacity-40 mt-2 block">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 border-t border-white/5 glass">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe your request..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 min-h-[56px] max-h-48 transition-all resize-none overflow-hidden"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-2 rounded-xl bg-blue-600 text-white disabled:opacity-50 disabled:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-500 mt-3">
          Luminary can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};
