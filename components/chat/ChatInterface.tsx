'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useChat } from 'ai/react';
import MessageBubble from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInterface() {
  // استخدام useChat من Vercel AI SDK لإدارة الحالة والبث تلقائياً
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error("Stream Error:", error);
      alert("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[100dvh] bg-background w-full max-w-3xl mx-auto border-x border-border shadow-2xl">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-4 sticky top-0 z-10 justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg">أثر</h1>
            <p className="text-xs text-muted-foreground">المساعد الذكي</p>
          </div>
        </div>
        <div className="flex gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <Sparkles className="w-16 h-16 text-muted mb-4" />
            <h3 className="text-xl font-bold mb-2">مرحباً بك في أثر</h3>
            <p className="text-sm">كيف يمكنني مساعدتك في رحلتك الإيمانية اليوم؟</p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble 
              key={m.id} 
              role={m.role === 'user' ? 'user' : 'assistant'} 
              content={m.content} 
            />
          ))
        )}
        
        {/* Loading Indicator */}
        <AnimatePresence>
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-muted-foreground px-4 py-2"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              جاري الكتابة...
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border sticky bottom-0 z-10 pb-[env(safe-area-inset-bottom)]">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-secondary/50 p-2 rounded-3xl border border-input focus-within:border-primary/50 transition-colors">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="اكتب رسالتك هنا..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-4 text-sm scrollbar-hide"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const event = new Event('submit', { cancelable: true, bubbles: true });
                e.currentTarget.form?.dispatchEvent(event);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-primary text-black rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 mb-0.5"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:-rotate-90" />}
          </button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          هذا نموذج ذكاء اصطناعي، يرجى التحقق من المعلومات الشرعية من المصادر الموثوقة.
        </p>
      </div>
    </div>
  );
}