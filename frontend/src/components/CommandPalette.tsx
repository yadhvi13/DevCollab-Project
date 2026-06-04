import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Folder, User, Terminal, Code } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const commands = [
    { id: 'home', title: 'Go to Dashboard', icon: <Folder />, action: () => navigate('/') },
    { id: 'profile', title: 'Go to Profile', icon: <User />, action: () => navigate('/profile') },
    { id: 'feed', title: 'Go to Social Feed', icon: <Code />, action: () => navigate('/feed') },
    { id: 'theme-github', title: 'Theme: GitHub Dark', icon: <Terminal />, action: () => setTheme('github-dark') },
    { id: 'theme-cyberpunk', title: 'Theme: Cyberpunk', icon: <Terminal />, action: () => setTheme('cyberpunk') },
    { id: 'theme-neon', title: 'Theme: Neon', icon: <Terminal />, action: () => setTheme('neon') },
    { id: 'theme-dracula', title: 'Theme: Dracula', icon: <Terminal />, action: () => setTheme('dracula') },
    { id: 'theme-nord', title: 'Theme: Nord', icon: <Terminal />, action: () => setTheme('nord') },
    { id: 'theme-ocean', title: 'Theme: Ocean', icon: <Terminal />, action: () => setTheme('ocean') },
    { id: 'theme-matrix', title: 'Theme: Matrix', icon: <Terminal />, action: () => setTheme('matrix') },
  ];

  const filteredCommands = commands.filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-lg bg-[var(--bg-panel)] border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-[var(--border-main)]">
          <Search className="w-5 h-5 text-[var(--text-secondary)]" />
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent border-none p-4 text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-main)] rounded-md border border-[var(--border-main)]">ESC</kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2 no-scrollbar">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => { cmd.action(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-black rounded-xl transition-colors text-left"
              >
                <span className="opacity-70">{cmd.icon}</span>
                {cmd.title}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-[var(--text-secondary)]">No results found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
