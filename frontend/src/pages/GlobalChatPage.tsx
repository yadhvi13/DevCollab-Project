import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Navbar from '../components/Navbar';
import { Hash, MessageSquare, Send, Users, UserCircle2 } from 'lucide-react';

const CHANNELS = [
  { id: 'general', name: 'General Chat', desc: 'Discuss anything and everything' },
  { id: 'help', name: 'Help & Support', desc: 'Ask for coding help' },
  { id: 'showcase', name: 'Showcase', desc: 'Show off your projects' },
  { id: 'random', name: 'Random', desc: 'Non-tech conversations' },
];

export default function GlobalChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Join channel
    socket.emit('join-room', activeChannel);
    
    // Clear messages when switching channel (in a real app, you'd fetch history)
    setMessages([]);

    const handleMessage = (data: any) => {
      setMessages(prev => [...prev, data]);
    };

    socket.on('global-chat-message', handleMessage);

    return () => {
      socket.emit('leave-room', activeChannel);
      socket.off('global-chat-message', handleMessage);
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
        _id: user._id,
        username: user.username,
      }
    });

    setMessageInput('');
  };

  const channelObj = CHANNELS.find(c => c.id === activeChannel);

  return (
    <div className="min-h-screen bg-[#050505] text-[#c9d1d9] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-6 h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#0d1117] border border-[#30363d] rounded-xl flex flex-col overflow-hidden shrink-0">
           <div className="p-4 border-b border-[#30363d]">
             <h2 className="text-white font-bold flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-indigo-400" /> DevCollab Chat
             </h2>
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2 mt-2 px-2">Channels</div>
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeChannel === channel.id 
                      ? 'bg-indigo-500/10 text-indigo-400' 
                      : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
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
                  <div key={msg.id || i} className="flex gap-4 group">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 mt-1">
                        {msg.user.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <div className="flex items-baseline gap-2 mb-1">
                         <span className="font-bold text-white">{msg.user.username}</span>
                         <span className="text-xs text-[#8b949e]">
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       <p className="text-[#c9d1d9] text-sm leading-relaxed">{msg.message}</p>
                     </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
           </div>
           
           <div className="p-4 bg-[#0d1117] border-t border-[#30363d]">
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
