import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import apiClient from '@/src/api/client';

interface Message {
  text: string;
  sent: boolean;
  sources?: string[];
}

interface FloatingChatSupportProps {
  className?: string;
}

const FloatingChatSupport: React.FC<FloatingChatSupportProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animateState, setAnimateState] = useState<'in' | 'out' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      setAnimateState('out');
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setAnimateState(null);
      }, 300);
    } else {
      setIsOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateState('in');
        });
      });
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    setMessages(prev => [...prev, { text, sent: true }]);
    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/support/chat/', { message: text });
      const data = res.data;
      setMessages(prev => [...prev, {
        text: data.response,
        sent: false,
        sources: data.sources,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
        sent: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  }, [handleSend]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const t = setTimeout(() => {
        setMessages(prev => [...prev, {
          text: 'Hi there! 👋 I\'m the Support Bot. Ask me anything about courses, enrollment, payments, or platform features.',
          sent: false,
        }]);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isOpen, hasGreeted]);

  return (
    <>
      <style>{`
        .chat-bounce-in {
          animation: chatBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .chat-bounce-out {
          animation: chatBounceOut 0.3s ease-in forwards;
        }
        @keyframes chatBounceIn {
          0% { opacity: 0; transform: scale(0.3) translateY(20px); }
          50% { opacity: 1; transform: scale(1.08) translateY(-5px); }
          70% { transform: scale(0.96) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes chatBounceOut {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.3) translateY(20px); }
        }
        @keyframes chatBtnBounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-6px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-4px); }
        }
        @keyframes chatPulseRing {
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 50%, transparent); }
          50% { box-shadow: 0 0 0 12px color-mix(in srgb, var(--color-primary) 0%, transparent); }
          100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 0%, transparent); }
        }
      `}</style>
      <div className={cn("fixed bottom-12 right-6 z-50 flex flex-col items-end font-sans", className)}>
        {isOpen && (
          <div
            className={cn(
              "mb-4 w-80 sm:w-96 h-[450px] bg-surface rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden",
              animateState === null && "invisible",
              animateState === 'in' && "chat-bounce-in",
              animateState === 'out' && "chat-bounce-out"
            )}
            style={{ transformOrigin: 'bottom right' }}
          >
            <div className="bg-gradient-to-r from-primary to-primary-hover p-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                    🤖
                  </div>
                  <span className="bottom-0 right-0 absolute w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">Support Bot</h3>
                  <p className="text-xs text-white/70">Typically replies instantly</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-bg relative bg-[url('/images.jpg')] bg-cover bg-center">
              <div className="relative z-10 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start space-x-2",
                      msg.sent && "justify-end space-x-2"
                    )}
                  >
                    {!msg.sent && (
<div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-lg shadow-sm max-w-[80%]",
                        msg.sent
                          ? "bg-primary rounded-tr-none text-white"
                          : "bg-surface rounded-tl-none border border-border text-text"
                      )}
                    >
                      {msg.sent ? (
                        <p className="text-sm text-white whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="text-sm text-text [&_p]:leading-relaxed [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:my-0.5 [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-gray-900 [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:text-gray-100 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_h1]:mt-2 [&_h2]:mt-1.5 [&_h3]:mt-1 [&_h1]:mb-1 [&_h2]:mb-0.5 [&_h3]:mb-0.5 [&_strong]:text-text [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-2 [&_blockquote]:my-1 [&_blockquote]:text-text-muted [&_hr]:my-2 [&_hr]:border-border]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                    <div className="p-3 rounded-lg shadow-sm bg-surface rounded-tl-none border border-border">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-3 bg-surface border-t border-border flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-bg text-text text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all placeholder:text-text-muted/50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <button
          onClick={toggleChat}
          className="bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center group"
          style={isOpen ? {} : {
            animation: 'chatBtnBounce 2s ease-in-out infinite, chatPulseRing 2s ease-in-out infinite',
          }}
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingChatSupport;
