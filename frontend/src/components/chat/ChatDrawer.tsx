"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Hash, Users, Reply, Trash2, Radio, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { SparkleStar } from '@/components/ui/DecorativeShapes';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANNELS = [
  { id: 'general', name: 'General', desc: 'Dev discussion & lounge' },
  { id: 'help', name: 'Help', desc: 'Ask for coding assistance' },
  { id: 'showcase', name: 'Showcase', desc: 'Show off what you built' },
  { id: 'random', name: 'Random', desc: 'Off-topic community vibes' },
];

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Setup Socket listeners when drawer is open
  useEffect(() => {
    if (!isOpen || !socket) return;

    setIsLoading(true);
    socket.emit('join-room', activeChannel);
    setMessages([]);

    const handleMessage = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleDeleteMessage = (messageId: string) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    const handleChatHistory = (history: any[]) => {
      setMessages(history || []);
      setIsLoading(false);
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
  }, [isOpen, socket, activeChannel]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !user) return;

    socket.emit('global-chat-message', {
      room: activeChannel,
      message: messageInput.trim(),
      user: {
        _id: user._id || user.id,
        username: user.username,
        avatar: user.avatar,
      },
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            username: replyingTo.user.username,
            message: replyingTo.message,
          }
        : null,
    });

    setMessageInput('');
    setReplyingTo(null);
  };

  const handleDelete = (messageId: string) => {
    if (!socket) return;
    socket.emit('delete-global-message', {
      room: activeChannel,
      messageId,
    });
  };

  // Real presence count
  const onlineCount = onlineUsers?.length || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Dimmed & Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white/95 backdrop-blur-2xl border-l border-gray-200/80 shadow-2xl flex flex-col h-full overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EA384C] animate-pulse" />
                    <h2 className="font-display text-xl font-extrabold text-[#111827] tracking-tight">
                      Developer Lounge
                    </h2>
                  </div>
                  <p className="font-sans text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-[#10B981]" />
                    {onlineCount > 0 ? (
                      <span>{onlineCount} {onlineCount === 1 ? 'developer' : 'developers'} online</span>
                    ) : (
                      <span>No developers online right now</span>
                    )}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-[#111827] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Channel Selector Pills */}
              <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeChannel === ch.id
                        ? 'bg-[#EA384C] text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200/80 hover:text-[#111827]'
                    }`}
                  >
                    #{ch.name}
                  </button>
                ))}
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-8 h-8 border-3 border-[#EA384C] border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-xs font-bold text-gray-400">Connecting to room...</span>
                  </div>
                ) : messages.length === 0 ? (
                  /* Empty state */
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-[#EA384C]">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <h4 className="font-display text-lg font-extrabold text-[#111827] mb-1">
                      No messages yet
                    </h4>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Start the conversation in #{activeChannel}. Say hello to the DevCollab community!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSelf = msg.user?._id === user?._id || msg.user?.id === user?._id;
                    const isOnline = onlineUsers?.includes(msg.user?._id) || onlineUsers?.includes(msg.user?.id);

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col group ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        {/* Author label & Time */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-1 px-1">
                          <span className="text-[#111827]">{msg.user?.username || 'Dev'}</span>
                          {isOnline && (
                            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" title="Online" />
                          )}
                          <span>•</span>
                          <span>
                            {msg.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                        </div>

                        {/* Reply reference */}
                        {msg.replyTo && (
                          <div className="text-[10px] text-gray-500 bg-gray-100 border-l-2 border-[#EA384C] px-2.5 py-1 rounded-r-lg mb-1 max-w-[80%] truncate">
                            Replying to <span className="font-bold">@{msg.replyTo.username}</span>: {msg.replyTo.message}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`relative max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm font-medium leading-relaxed ${
                            isSelf
                              ? 'bg-[#EA384C] text-white shadow-[0_4px_12px_rgba(234,56,76,0.25)] rounded-tr-none'
                              : 'bg-white border border-gray-200/80 text-[#111827] shadow-sm rounded-tl-none'
                          }`}
                        >
                          <p className="break-words">{msg.message}</p>

                          {/* Action overlay on hover */}
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${
                              isSelf ? '-left-14' : '-right-14'
                            }`}
                          >
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:text-[#111827] shadow-xs"
                              title="Reply"
                            >
                              <Reply className="w-3 h-3" />
                            </button>
                            {isSelf && (
                              <button
                                onClick={() => handleDelete(msg.id)}
                                className="p-1 rounded-md bg-white border border-gray-200 text-[#EA384C] hover:bg-red-50 shadow-xs"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                {replyingTo && (
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold mb-2">
                    <span className="truncate text-[#111827]">
                      Replying to @{replyingTo.user?.username}
                    </span>
                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-[#111827]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {user ? (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Message #${activeChannel}...`}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200/80 rounded-full py-2.5 px-4 text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#EA384C] focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="btn-pill-red p-2.5 rounded-full text-xs font-bold disabled:opacity-40 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-center font-bold text-gray-500">
                    Please log in to chat in the Lounge.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
