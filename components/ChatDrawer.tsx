
import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useUser } from '../contexts/UserContext';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const { isPro, openPaywall } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'RecruitBox systems online. How may I assist you today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Use setTimeout to ensure layout is complete before scrolling, especially when opening
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    
    if (!isPro) {
      openPaywall();
      return;
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      // Format history for Gemini
      const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(history, userMsg.text);
      
      const modelMsg: ChatMessage = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          text: responseText || "I apologize, I could not generate a response.", 
          timestamp: Date.now() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "System Error: Unable to connect to neural processing unit.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-md h-full bg-neutral-950 border-l border-neutral-800 flex flex-col shadow-2xl animate-slide-in">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/90 backdrop-blur">
            <div>
                <h2 className="text-sm font-mono uppercase tracking-widest text-white">Assistant</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-white animate-pulse' : 'bg-sky-500'}`}></div>
                    <span className="text-xs text-neutral-500">Gemini 3 Pro Preview</span>
                </div>
            </div>
            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth" ref={scrollRef}>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-4 ${msg.role === 'user' ? 'bg-neutral-900 border border-neutral-800 text-neutral-200' : 'bg-transparent text-neutral-400'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-neutral-700 font-mono mt-2 uppercase">{msg.role}</span>
                </div>
            ))}
            {isThinking && (
                 <div className="flex flex-col items-start">
                     <div className="flex items-center gap-1 text-neutral-500 text-xs font-mono uppercase tracking-widest">
                         <span>Thinking</span>
                         <span className="animate-pulse">...</span>
                     </div>
                 </div>
            )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-950 relative">
            {!isPro && (
                <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <button 
                        onClick={openPaywall}
                        className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wide rounded hover:bg-neutral-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        Upgrade to Chat
                    </button>
                </div>
            )}
            <div className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={isPro ? "Type command..." : "Assistant Locked"}
                    disabled={!isPro}
                    className="w-full bg-neutral-900/50 border border-neutral-800 p-4 pr-12 text-neutral-200 focus:outline-none focus:border-neutral-600 transition-colors resize-none font-mono text-sm h-24 disabled:opacity-50"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className="absolute bottom-4 right-4 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
