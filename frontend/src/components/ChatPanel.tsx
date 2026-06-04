import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
  repoId: string;
  user: any;
  socket: Socket | null;
}

interface Message {
  id: string;
  user: any;
  text: string;
  timestamp: Date;
}

export default function ChatPanel({ repoId, user, socket }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: any) => {
      setMessages(prev => [...prev, { ...data, id: Math.random().toString(), timestamp: new Date() }]);
    };

    const handleTyping = (data: { username: string }) => {
      if (!typingUsers.includes(data.username)) {
        setTypingUsers(prev => [...prev, data.username]);
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
        }, 3000);
      }
    };

    socket.on('chat-message', handleMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('chat-message', handleMessage);
      socket.off('typing', handleTyping);
    };
  }, [socket, typingUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    socket.emit('chat-message', { repoId, user, text: inputValue });
    setInputValue('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (socket) {
      socket.emit('typing', { repoId, username: user.username });
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.user.username === user.username;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-xs text-zinc-500 mb-1 ml-1">{msg.user.username}</span>}
                <div className={`px-3 py-2 rounded-2xl ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 italic">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleTyping}
            placeholder="Send a message..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
