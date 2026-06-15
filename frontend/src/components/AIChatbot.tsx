"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '@/config';

interface AIChatbotProps {
  fileContext: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIChatbot({ fileContext }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am the Gemini AI assistant. Ask me anything about the code.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-chatbot', handleOpen);
    return () => window.removeEventListener('open-ai-chatbot', handleOpen);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          message: userMsg, 
          fileContext,
          history: messages.filter(m => m.role !== 'model' || m.text !== 'Hi! I am the Gemini AI assistant. Ask me anything about the code.') 
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl hover:bg-primary/90 transition-all z-50 group cursor-pointer shadow-[0_0_15px_var(--shadow-color)] active:scale-95 duration-200"
          >
            <Bot className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bg-card border border-border shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 bottom-0 right-0 left-0 top-0 sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 ${
              isExpanded 
                ? 'w-full h-full sm:w-[600px] sm:h-[80vh] rounded-none sm:rounded-2xl' 
                : 'w-full h-full sm:w-80 sm:h-[450px] rounded-none sm:rounded-xl'
            }`}
          >
            {/* Header */}
            <div className="h-14 bg-card border-b border-border px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Bot className="w-5 h-5 text-primary" />
                Gemini Assistant
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-muted-foreground hover:text-foreground p-1 cursor-pointer">
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-background space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground font-medium rounded-tr-none shadow-[0_0_10px_var(--shadow-color)]' 
                      : 'bg-card text-foreground rounded-tl-none border border-border'
                  }`}>
                    {msg.role === 'model' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-card border-t border-border shrink-0">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question about the code..."
                  className="w-full bg-background border border-border rounded-full py-2.5 pl-4 pr-12 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer h-[32px] w-[32px] border-none"
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
