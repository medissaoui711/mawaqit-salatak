
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'framer-motion';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

const AIChat: React.FC = () => {
  const { t, settings } = useSettings();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'model', text: t('common.aiDisclaimer') + " " + (settings.language === 'ar' ? "كيف يمكنني مساعدتك اليوم؟" : "How can I help you today?") }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState('');
  const [needsKey, setNeedsKey] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check for env key
    // @ts-ignore
    const envKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
    if (envKey) {
        setApiKey(envKey);
    } else {
        const localKey = localStorage.getItem('google_ai_key');
        if(localKey) setApiKey(localKey);
        else setNeedsKey(true);
    }
  }, []);

  const saveKey = (key: string) => {
      localStorage.setItem('google_ai_key', key);
      setApiKey(key);
      setNeedsKey(false);
  }

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are a knowledgeable, respectful, and helpful Islamic Assistant.
        Your goal is to help users with questions about Prayer times, Quran, Hadith, and general Islamic knowledge.
        Keep answers concise.
      `;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const result = await chat.sendMessage({ message: userMsg.text });
      const responseText = result.text;
      
      setMessages(prev => [...prev, { id: Date.now()+1, role: 'model', text: responseText }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: "Error connecting to AI. Please check your API Key or internet connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (needsKey) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Sparkles className="w-12 h-12 text-neon mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Setup AI Assistant</h3>
            <p className="text-zinc-400 mb-4 text-sm">Please enter your Google Gemini API Key to enable the assistant.</p>
            <input 
                type="password" 
                placeholder="Paste API Key here..."
                className="w-full max-w-xs bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-white mb-4 focus:border-neon outline-none"
                onChange={(e) => setApiKey(e.target.value)}
            />
            <button 
                onClick={() => saveKey(apiKey)}
                disabled={!apiKey}
                className="bg-neon text-black px-6 py-2 rounded-lg font-bold disabled:opacity-50"
            >
                Start Chatting
            </button>
            <p className="text-[10px] text-zinc-600 mt-4">Key is stored locally on your device.</p>
        </div>
      )
  }

  return (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -20 }}
       className="flex flex-col h-[calc(100vh-140px)] bg-card rounded-2xl border border-zinc-800 overflow-hidden"
    >
       {/* Header */}
       <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
          <div className="bg-neon/20 p-2 rounded-full">
             <Sparkles className="w-5 h-5 text-neon" />
          </div>
          <div>
             <h3 className="font-bold text-white">{t('common.aiAssistant')}</h3>
             <p className="text-[10px] text-zinc-500 flex items-center gap-1">
               Powered by Gemini <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span>
             </p>
          </div>
       </div>

       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
             <div 
               key={msg.id} 
               className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
             >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-neon/20'}`}>
                   {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-neon" />}
                </div>
                
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                   msg.role === 'user' 
                     ? 'bg-blue-600/20 border border-blue-600/30 text-blue-100 rounded-tr-none' 
                     : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-none'
                }`}>
                   {msg.text}
                </div>
             </div>
          ))}
          
          {isLoading && (
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neon/20 flex items-center justify-center shrink-0">
                   <Bot className="w-4 h-4 text-neon" />
                </div>
                <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-2xl rounded-tl-none">
                   <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input */}
       <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('common.askAiPlaceholder')}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon transition-colors text-sm"
          />
          <button 
             onClick={handleSend}
             disabled={isLoading || !input.trim()}
             className="bg-neon text-black p-3 rounded-xl hover:bg-[#42e03c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
             <Send className="w-5 h-5" />
          </button>
       </div>
    </motion.div>
  );
};

export default AIChat;
