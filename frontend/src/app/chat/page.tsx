"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Navbar from '@/components/Navbar';
import { Hash, MessageSquare, Send, Users, X, Reply, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CHANNELS = [
  { id: 'general', name: 'General Chat', desc: 'Discuss anything and everything' },
  { id: 'help', name: 'Help & Support', desc: 'Ask for coding help' },
  { id: 'showcase', name: 'Showcase', desc: 'Show off your projects' },
  { id: 'random', name: 'Random', desc: 'Non-tech conversations' },
];

function GlobalChat() {
  const { user, token } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', activeChannel);
    setMessages([]);

    const playPopSound = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {
        console.error('Audio play failed:', e);
      }
    };

    const handleMessage = (data: any) => {
      setMessages(prev => [...prev, data]);
      if (data.user._id !== user?._id && data.user.id !== user?._id) {
        playPopSound();
      }
    };

    const handleDeleteMessage = (messageId: string) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const handleChatHistory = (history: any[]) => {
      setMessages(history);
    };

    socket.on('global-chat-message', handleMessage);
    socket.on('delete-global-message', handleDeleteMessage);
    socket.on('chat-history', handleChatHistory);

    return () => {
      socket.emit('leave-room', activeChannel);
      socket.off('global-chat-message', handleMessage);
      socket.off('delete-global-message', handleDeleteMessage);
      socket.off('chat-history', handleChatHistory);
    };
  }, [socket, activeChannel, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !user) return;

    socket.emit('global-chat-message', {
      room: activeChannel,
      message: messageInput,
      user: {
        _id: user._id || user.id,
        username: user.username,
        avatar: user.avatar
      },
      replyTo: replyingTo ? {
        id: replyingTo.id,
        username: replyingTo.user.username,
        message: replyingTo.message
      } : null
    });

    setMessageInput('');
    setReplyingTo(null);
  };

  const handleDelete = (messageId: string) => {
    if (!socket) return;
    socket.emit('delete-global-message', {
      room: activeChannel,
      messageId
    });
  };

  const channelObj = CHANNELS.find(c => c.id === activeChannel);

  return (
    <div className="min-h-screen bg-[#F4F2EF] dark:bg-[#090909] text-[#1C1917] dark:text-zinc-100 font-sans flex flex-col transition-colors duration-200">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100vh-80px)] overflow-hidden">
        {/* Sidebar Channels */}
        <div className="w-full md:w-64 glass-card p-4 bg-white/85 dark:bg-[#121316]/90 backdrop-blur-xl border border-[#E2E0DB] dark:border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] rounded-3xl flex flex-col overflow-hidden shrink-0">
           <div className="pb-3 mb-2 border-b border-gray-100 dark:border-zinc-800 hidden md:block">
             <h2 className="text-[#1C1917] dark:text-white font-display font-extrabold flex items-center gap-2 text-base">
               <MessageSquare className="w-5 h-5 text-[#B7194B]" /> DevCollab Lounge
             </h2>
             <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">Live Socket.io Community</span>
           </div>
           <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto gap-1.5 no-scrollbar items-center md:items-stretch py-1">
              <div className="hidden md:block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-2">Channels</div>
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeChannel === channel.id 
                      ? 'bg-[#B7194B] text-white shadow-[0_4px_12px_rgba(183,25,75,0.3)]' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-[#1C1917] dark:hover:text-white'
                  }`}
                >
                  <Hash className="w-4 h-4" /> {channel.name}
                </button>
              ))}
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 glass-card bg-white/85 dark:bg-[#121316]/90 backdrop-blur-xl border border-[#E2E0DB] dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)] rounded-3xl flex flex-col overflow-hidden relative">
           
           <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white/60 dark:bg-[#121316]/60 backdrop-blur-md z-10">
              <div>
                <h2 className="text-[#1C1917] dark:text-white font-display font-extrabold flex items-center gap-2 text-lg">
                  <Hash className="w-5 h-5 text-[#B7194B]" /> {channelObj?.name}
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{channelObj?.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-200/60 dark:border-zinc-700">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>{onlineUsers?.length || 1} Online</span>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                   <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-[#B7194B]/15 flex items-center justify-center mb-4 text-[#B7194B]">
                     <Hash className="w-8 h-8" />
                   </div>
                   <h3 className="text-[#1C1917] dark:text-white font-display font-extrabold text-xl mb-1">Welcome to #{channelObj?.name}!</h3>
                   <p className="text-xs text-center max-w-sm text-zinc-500 dark:text-zinc-400">This is the start of the #{channelObj?.name} channel. Say hi and start collaborating!</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div 
                    key={msg.id || i}
                    className="flex gap-4 group relative"
                  >
                     <div className="relative shrink-0 mt-1">
                       <div className="w-10 h-10 rounded-2xl bg-[#B7194B] flex items-center justify-center text-white font-extrabold overflow-hidden border border-white/20 shadow-xs">
                          {msg.user.avatar ? (
                            <img src={msg.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            msg.user.username.charAt(0).toUpperCase()
                          )}
                       </div>
                       {(onlineUsers?.includes(msg.user._id) || onlineUsers?.includes(msg.user.id)) && (
                         <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white dark:border-zinc-900 rounded-full z-10" />
                       )}
                     </div>
                     <div className="flex-1">
                       <div className="flex items-baseline gap-2 mb-1">
                         <span className="font-bold text-[#1C1917] dark:text-white text-sm">{msg.user.username}</span>
                         <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       
                       {msg.replyTo && (
                         <div className="mb-2 pl-3 border-l-2 border-[#B7194B] text-xs text-zinc-600 dark:text-zinc-300 bg-rose-50/50 dark:bg-[#B7194B]/10 py-1.5 pr-3 rounded-r-xl max-w-md">
                           <span className="font-bold text-[#B7194B]">@{msg.replyTo.username}</span>: {msg.replyTo.message}
                         </div>
                       )}
                       
                       <p className="text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed">{msg.message}</p>
                     </div>
                     
                     <div className="absolute right-0 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                       {(msg.user._id === user?._id || msg.user.id === user?._id) && (
                         <button 
                           onClick={() => handleDelete(msg.id)}
                           className="p-1.5 bg-rose-50 dark:bg-[#B7194B]/20 rounded-lg text-[#B7194B] hover:bg-rose-100 dark:hover:bg-[#B7194B]/30 transition-all cursor-pointer border border-rose-200/60 dark:border-[#B7194B]/30"
                           title="Delete message"
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       )}
                       <button 
                         onClick={() => setReplyingTo(msg)}
                         className="p-1.5 bg-stone-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#1C1917] dark:hover:text-white hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                         title="Reply"
                       >
                          <Reply className="w-3.5 h-3.5" />
                       </button>
                     </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
           </div>
           
           <div className="p-4 bg-white/60 dark:bg-[#121316]/60 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2 z-10">
              {replyingTo && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-[#18191E] border border-gray-200/80 dark:border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <Reply className="w-3.5 h-3.5 text-[#B7194B]" />
                    Replying to <span className="font-bold text-[#1C1917] dark:text-white">@{replyingTo.user.username}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-zinc-400 hover:text-[#1C1917] dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                 <input 
                   type="text" 
                   value={messageInput}
                   onChange={e => setMessageInput(e.target.value)}
                   placeholder={`Message #${channelObj?.name}`}
                   className="w-full bg-gray-50 dark:bg-[#18191E] border border-gray-200/80 dark:border-zinc-800 rounded-full py-2.5 pl-4 pr-12 text-xs sm:text-sm text-[#1C1917] dark:text-zinc-100 focus:outline-none focus:border-[#B7194B] focus:bg-white dark:focus:bg-[#121316] focus:ring-2 focus:ring-[#B7194B]/15 transition-all placeholder:text-zinc-400"
                 />
                 <button 
                   type="submit" 
                   disabled={!messageInput.trim()}
                   className="absolute right-1.5 p-2 bg-[#B7194B] hover:bg-[#c92055] disabled:opacity-40 text-white rounded-full transition-all cursor-pointer shadow-xs"
                 >
                   <Send className="w-3.5 h-3.5" />
                 </button>
              </form>
           </div>
        </div>
      </main>
    </div>
  );
}

export default function GlobalChatPage() {
  return (
    <ProtectedRoute>
      <GlobalChat />
    </ProtectedRoute>
  );
}
