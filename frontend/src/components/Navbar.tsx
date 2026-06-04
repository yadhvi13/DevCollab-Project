import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FolderGit2, Search, Bell, Plus, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between z-10 sticky top-0 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-white p-1 rounded-md">
            <FolderGit2 className="w-6 h-6 text-black" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">DEVCOLLAB</span>
        </div>
        
        <div className="relative w-64 ml-4 hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
          <input 
            type="text" 
            placeholder="Quick search... (cmd + k)"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 pl-9 pr-3 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
          />
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm font-semibold ml-2">
          <a onClick={() => navigate('/feed')} className="cursor-pointer hover:text-white active:text-indigo-400 transition-colors">Social Feed</a>
          <a onClick={() => navigate('/chat')} className="cursor-pointer hover:text-white active:text-indigo-400 transition-colors">Global Chat</a>
          <a href="#" className="hover:text-white active:text-indigo-400 transition-colors">Marketplace</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-[#8b949e] hover:text-white active:scale-90 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#161b22]"></span>
        </button>
        
        <div className="relative group" onMouseEnter={() => setShowPlusMenu(true)} onMouseLeave={() => setShowPlusMenu(false)}>
          <button onClick={() => setShowPlusMenu(!showPlusMenu)} className="text-[#8b949e] hover:text-white active:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer">
            <Plus className="w-5 h-5" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Plus Dropdown */}
          <div className={`absolute right-0 mt-2 w-56 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl transition-all z-50 ${showPlusMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div className="px-4 py-2 border-b border-[#30363d]">
              <p className="text-[10px] font-bold text-[#8b949e] tracking-wider uppercase">New Actions</p>
            </div>
            <div className="py-1 border-b border-[#30363d]">
              <button onClick={() => { setShowPlusMenu(false); navigate('/create'); }} className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#0d1117] hover:text-white active:bg-indigo-600/20 active:text-white transition-colors">Create Repository</button>
              <button onClick={() => { setShowPlusMenu(false); navigate('/import'); }} className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#0d1117] hover:text-white active:bg-indigo-600/20 active:text-white transition-colors">Import Repository</button>
              <button onClick={() => { setShowPlusMenu(false); navigate('/project/new'); }} className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#0d1117] hover:text-white active:bg-indigo-600/20 active:text-white transition-colors">New Project</button>
            </div>
            <div className="py-1">
               <button onClick={() => { setShowPlusMenu(false); navigate('/explore'); }} className="w-full text-center px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#0d1117] hover:text-white active:bg-indigo-600/20 active:text-white transition-colors">Explore more repositories</button>
            </div>
          </div>
        </div>
        
        <div className="relative group" onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border border-[#30363d] hover:border-zinc-400 transition-all cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            title="Profile"
          >
            {user?.username?.charAt(0).toUpperCase()}
          </button>
          
          {/* Dropdown on hover/click */}
          <div className={`absolute right-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl transition-all z-50 ${showProfileMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div className="px-4 py-2 border-b border-[#30363d]">
              <p className="text-xs text-[#8b949e]">Signed in as</p>
              <p className="text-sm font-bold text-white truncate">{user?.username}</p>
            </div>
            <div className="py-1">
              <button onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#0d1117] hover:text-white">Your profile</button>
              <button onClick={() => { setShowProfileMenu(false); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#0d1117] hover:text-white">Your repositories</button>
              <button onClick={() => { setShowProfileMenu(false); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#0d1117] hover:text-white">Your projects</button>
              <div className="border-t border-[#30363d] my-1"></div>
              <button onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#0d1117] hover:text-white">Settings</button>
              <button onClick={() => { setShowProfileMenu(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-[#f85149] hover:bg-[#0d1117]">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
