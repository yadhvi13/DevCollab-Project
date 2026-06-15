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
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-card border border-border rounded-xl flex flex-col overflow-hidden shrink-0">
           <div className="p-4 border-b border-border hidden md:block">
             <h2 className="text-foreground font-bold flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-primary" /> DevCollab Chat
             </h2>
           </div>
           <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-3 gap-2 md:gap-1 no-scrollbar items-center md:items-stretch">
              <div className="hidden md:block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-2 px-2">Channels</div>
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex items-center gap-2 px-4 md:px-3 py-2 rounded-full md:rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeChannel === channel.id 
                      ? 'bg-primary/10 text-primary border border-primary/20 md:border-transparent' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                  }`}
                >
                  <Hash className="w-4 h-4" /> {channel.name}
                </button>
              ))}
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden relative">
           {/* Background glow */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] pointer-events-none rounded-full"></div>
           
           <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-foreground font-bold flex items-center gap-2 text-lg">
                  <Hash className="w-5 h-5 text-muted-foreground" /> {channelObj?.name}
                </h2>
                <p className="text-sm text-muted-foreground">{channelObj?.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" /> Online
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                   <Hash className="w-16 h-16 text-border mb-4" />
                   <h3 className="text-foreground font-bold text-xl mb-2">Welcome to #{channelObj?.name}!</h3>
                   <p className="text-sm text-center max-w-sm">This is the start of the #{channelObj?.name} channel. Introduce yourself and say hi!</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div 
                    key={msg.id || i}
                    className="flex gap-4 group relative"
                  >
                     <div className="relative shrink-0 mt-1">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-primary-foreground font-bold overflow-hidden">
                          {msg.user.avatar ? (
                            <img src={msg.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            msg.user.username.charAt(0).toUpperCase()
                          )}
                       </div>
                       {(onlineUsers?.includes(msg.user._id) || onlineUsers?.includes(msg.user.id)) && (
                         <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-card rounded-full z-10" />
                       )}
                     </div>
                     <div className="flex-1">
                       <div className="flex items-baseline gap-2 mb-1">
                         <span className="font-bold text-foreground">{msg.user.username}</span>
                         <span className="text-xs text-muted-foreground">
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       
                       {msg.replyTo && (
                         <div className="mb-2 pl-3 border-l-2 border-primary/50 text-xs text-muted-foreground bg-muted py-1.5 pr-3 rounded-r-lg max-w-md">
                           <span className="font-semibold text-primary">@{msg.replyTo.username}</span>: {msg.replyTo.message}
                         </div>
                       )}
                       
                       <p className="text-foreground text-sm leading-relaxed">{msg.message}</p>
                     </div>
                     
                     <div className="absolute right-0 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                       {(msg.user._id === user?._id || msg.user.id === user?._id) && (
                         <button 
                           onClick={() => handleDelete(msg.id)}
                           className="p-2 bg-muted rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all shadow-lg cursor-pointer border border-border"
                           title="Delete message"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                       <button 
                         onClick={() => setReplyingTo(msg)}
                         className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all shadow-lg cursor-pointer border border-border"
                         title="Reply"
                       >
                          <Reply className="w-4 h-4" />
                       </button>
                     </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
           </div>
           
           <div className="p-4 bg-card border-t border-border flex flex-col gap-2 z-10">
              {replyingTo && (
                <div className="flex items-center justify-between bg-muted border border-border rounded-lg px-4 py-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Reply className="w-4 h-4" />
                    Replying to <span className="font-bold text-foreground">@{replyingTo.user.username}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                 <Input 
                   type="text" 
                   value={messageInput}
                   onChange={e => setMessageInput(e.target.value)}
                   placeholder={`Message #${channelObj?.name}`}
                   className="w-full bg-muted border border-border rounded-xl py-6 pl-4 pr-12 text-sm text-foreground focus-visible:ring-primary h-[45px]"
                 />
                 <Button 
                   type="submit" 
                   disabled={!messageInput.trim()}
                   className="absolute right-2 p-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg transition-colors cursor-pointer border-none h-[30px]"
                 >
                   <Send className="w-4 h-4 text-primary-foreground" />
                 </Button>
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
