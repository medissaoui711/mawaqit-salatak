'use client';

import React, { memo } from 'react';
import { cn, sanitizeHtml, formatDate } from '../../lib/utils';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

// استخدام React.memo لمنع إعادة التصيير غير الضرورية
const MessageBubble = memo(({ role, content }: MessageBubbleProps) => {
  const isUser = role === 'user';
  
  // تنظيف المحتوى للحماية من XSS
  const sanitizedContent = sanitizeHtml(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-black" : "bg-muted text-primary"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={cn(
        "relative max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-sm" 
          : "bg-secondary border border-border text-secondary-foreground rounded-tl-sm"
      )}>
        <div 
          className="prose prose-invert prose-sm max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
        />
        <span className="text-[10px] opacity-50 mt-1 block w-full text-end">
          {formatDate(new Date())}
        </span>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;