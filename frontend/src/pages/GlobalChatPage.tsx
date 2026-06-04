import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Navbar from '../components/Navbar';
import { Hash, MessageSquare, Send, Users, X, Reply, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Base64 tiny pop sound
const POP_SOUND = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAAAABzQk9sBwF/3/v/6f/5//b97/u+9v/2//u/6/4f//h/9/+P+H/h/6f+n/j/5//z/6/+z/s/5f+T/m/8//9//7//9//+//9//7//+//3/+/9v/l/4f9v/b/1/9H/P/0f8//H/x/7f+z/m/4v+f/n/6P/b///+//n/5/+f/t/6/+X/l/5v+v/0//z///+//r/6/+f/v/5/+b/nf6f+r/n/7P/T/z//z//7///7//3/9//+//v//P/2/9v/d/0/8//N/0f8//f/4/9P/j/5f+T/m/4f+j/x//z//z//v//z///+//7/+//+//+//7///+//+//9//z//v/6//P/0/9H/M/w/8L/B/wv7f+n/p/6v+r/v/8v/j/+P/x/9P/P/1f9X/Z/3f+b/nf5/+j/3/9//7///+//v///+//7//v/9//r/8f/S/1v9T/O/y/8v/L/z/8//j/9P/H/v/7/+z/s/7P+z/m/6//b//f//P/4/+X/s/7v+7/u/7v+b/l/6v/T/z//v/+//7//v//v//P/0/9P/Z/2v9v/R/yv8H/B/wP7v+7/v/6v+n/q/7v+//t/7f+v/q/7v+v/p/6P+b/of6v+z/0//z///+/////+/9v/n/5v+b/m/5v+b/o/7/+//3/+//+//9//z/9f/h/8f/b/5f+X/m/5f+f/n/5/+T/l/5f+b/m/5v+r/v/9v///+//5/+//7//7//+//z/8P/d/4//j/9P/z///+P/n/6f+v/p/5f+X/q/7v+T/l/4v9//j/9f/T/zP8f+3/l/6v+X/n/6v+P/r/7v+v/p/4/+v/s/6v/z/9//9//t/8f/S/yf8f+3/h/3f9n/P/x/7v+P/t/5f+X/m/5v+P/j/7f+b/n/5v+j/p/4v93/P/zP8H+z/l/6f/3/8f/b/5/+v/t/6//b/4f/f/0/+//3//n//f/8//+//f/8//+//n///+//z/8f/S/0/8v/P/0f8v+f/n/6v/f/8f/P/2/9H/P/yv7f+v/p/6v+v/t/6f+v/o/7P+j/n/6f+//t/8f/L/yv8H/C/vf7f+n/m/5v+r/u/6f+b/q/6f+n/p/6f+//+//5///9v///v/+//t///+//n/6//P//f/z//v/7//f/6/+P/x/9f/V/2f9T/H/x/6/+z/p/6v+7/r/7v+P/v/4f+L/l/5/+//1//X/6/+z/q/5v+L/j/4/+H/v/9f///f/z/+P/o/6f+3/p/6v+3/o/6/+z/0/9v/Z/0f8f+f/l/5f+z/q/5/+//x/9f/Z/1v9T/O/xv7/+7/s/6f+n/v/6v+z/s/6f+r/u/9P///P/0/+f/r/4/+H/i/4v9//d/y/8v+//z///+f/v/8v/n///+//v///+//7/+P/z///+P/j/5/+n/r/8f/T/0f8n/D/wf8H+3/u/7P+z/m/6//D/yv8P/f///f/z/9f/T/zv7v+j/o/5//D/yf7v+X/r/6v+3/r/6v+7/q/7//v///P////v/9//v/+//7//z/9P/d/4//f/7//f/8//f/8//7///+//7///+//+//9//z//v/+//z/+v///+//3/+z/s/5v+P/g/4v93/R/z/8v/L/0f9b/W/2P9T/L/xv7//P/3/+H/q/6/+b/l/4f+X/s/7/+//7///+//7//+//+//+//3///v//P////9//9//3/9//f/8//z/9P/W/zf8v/P/2/9H/N/xf7v+f/o/6f+z/s/7P+f/q/6v+f/l/5f+T/m/6P+7/w/8r/A/vv6//3//P/z/9H/O/wf7/+7/u/6/+T/l/5f+j/0/9v/b/3/+f/r/5/+f/t/6v+//3///f///v//z/9X/f/3f8//H/t/7v+n/r/8P/F/wf73+v/p/5P+L/d/x/8H+n/m/6v+//7//v/9//f///X///9//5//X/5/+H/k/4P+L/f/4//f/6/+f/n/6f+7/o/6f+X/j/4/+n///+";

const CHANNELS = [
  { id: 'general', name: 'General Chat', desc: 'Discuss anything and everything' },
  { id: 'help', name: 'Help & Support', desc: 'Ask for coding help' },
  { id: 'showcase', name: 'Showcase', desc: 'Show off your projects' },
  { id: 'random', name: 'Random', desc: 'Non-tech conversations' },
];

export default function GlobalChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Join channel
    socket.emit('join-room', activeChannel);
    
    // Clear messages when switching channel (in a real app, you'd fetch history)
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

    socket.on('global-chat-message', handleMessage);
    socket.on('delete-global-message', handleDeleteMessage);

    return () => {
      socket.emit('leave-room', activeChannel);
      socket.off('global-chat-message', handleMessage);
      socket.off('delete-global-message', handleDeleteMessage);
    };
  }, [socket, activeChannel]);

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
    <div className="min-h-screen bg-[#050505] text-[#c9d1d9] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar / Top Bar on mobile */}
        <div className="w-full md:w-64 bg-[#0d1117] border border-[#30363d] rounded-xl flex flex-col overflow-hidden shrink-0">
           <div className="p-4 border-b border-[#30363d] hidden md:block">
             <h2 className="text-white font-bold flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-indigo-400" /> DevCollab Chat
             </h2>
           </div>
           <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-3 gap-2 md:gap-1 no-scrollbar items-center md:items-stretch">
              <div className="hidden md:block text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2 mt-2 px-2">Channels</div>
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex items-center gap-2 px-4 md:px-3 py-2 rounded-full md:rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeChannel === channel.id 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 md:border-transparent' 
                      : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9] border border-transparent'
                  }`}
                >
                  <Hash className="w-4 h-4" /> {channel.name}
                </button>
              ))}
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl flex flex-col overflow-hidden relative">
           {/* Background glow */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full"></div>
           
           <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]/80 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-white font-bold flex items-center gap-2 text-lg">
                  <Hash className="w-5 h-5 text-[#8b949e]" /> {channelObj?.name}
                </h2>
                <p className="text-sm text-[#8b949e]">{channelObj?.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                <Users className="w-4 h-4" /> Online
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#8b949e]">
                   <Hash className="w-16 h-16 text-[#30363d] mb-4" />
                   <h3 className="text-white font-bold text-xl mb-2">Welcome to #{channelObj?.name}!</h3>
                   <p className="text-sm text-center max-w-sm">This is the start of the #{channelObj?.name} channel. Introduce yourself and say hi!</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div 
                    key={msg.id || i}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ right: 0.5, left: 0 }}
                    onDragEnd={(e, info) => {
                      if (info.offset.x > 50) {
                        setReplyingTo(msg);
                      }
                    }}
                    className="flex gap-4 group relative"
                  >
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 mt-1 overflow-hidden">
                        {msg.user.avatar ? (
                          <img src={msg.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          msg.user.username.charAt(0).toUpperCase()
                        )}
                     </div>
                     <div className="flex-1">
                       <div className="flex items-baseline gap-2 mb-1">
                         <span className="font-bold text-white">{msg.user.username}</span>
                         <span className="text-xs text-[#8b949e]">
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       
                       {msg.replyTo && (
                         <div className="mb-2 pl-3 border-l-2 border-indigo-500/50 text-xs text-[#8b949e] bg-[#161b22] py-1.5 pr-3 rounded-r-lg max-w-md">
                           <span className="font-semibold text-indigo-400">@{msg.replyTo.username}</span>: {msg.replyTo.message}
                         </div>
                       )}
                       
                       <p className="text-[#c9d1d9] text-sm leading-relaxed">{msg.message}</p>
                     </div>
                     
                     {/* Desktop Buttons */}
                     <div className="absolute right-0 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                       {(msg.user._id === user?._id || msg.user.id === user?._id) && (
                         <button 
                           onClick={() => handleDelete(msg.id)}
                           className="p-2 bg-[#21262d] rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all shadow-lg"
                           title="Delete message"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                       <button 
                         onClick={() => setReplyingTo(msg)}
                         className="p-2 bg-[#21262d] rounded-lg text-[#8b949e] hover:text-white transition-all shadow-lg"
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
           
           <div className="p-4 bg-[#0d1117] border-t border-[#30363d] flex flex-col gap-2">
              {replyingTo && (
                <div className="flex items-center justify-between bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-sm">
                  <div className="flex items-center gap-2 text-[#8b949e]">
                    <Reply className="w-4 h-4" />
                    Replying to <span className="font-bold text-white">@{replyingTo.user.username}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-[#8b949e] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                 <input 
                   type="text" 
                   value={messageInput}
                   onChange={e => setMessageInput(e.target.value)}
                   placeholder={`Message #${channelObj?.name}`}
                   className="w-full bg-[#161b22] border border-[#30363d] rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                 />
                 <button 
                   type="submit" 
                   disabled={!messageInput.trim()}
                   className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                 >
                   <Send className="w-4 h-4" />
                 </button>
              </form>
           </div>
        </div>
      </main>
    </div>
  );
}
