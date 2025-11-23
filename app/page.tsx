import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load the chat interface for better initial load performance
const ChatInterface = dynamic(() => import('@/components/chat/ChatInterface'), {
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  ),
  ssr: false // Client-side logic mostly
});

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex justify-center">
       <ChatInterface />
    </main>
  );
}