"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  FolderGit2, ChevronDown, Star, GitFork, Eye, Play, History, Code, MessageSquare, 
  Layout, Activity, Shield, Book, CircleDot, GitPullRequest, Settings, Terminal, 
  Bot, X, FileText, Send, Trash2, Copy, Check, Sun, Moon 
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import KanbanBoard from '@/components/KanbanBoard';
import Navbar from '@/components/Navbar';
import FileTree from '@/components/FileTree';
import AIChatbot from '@/components/AIChatbot';
import { API_BASE_URL } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RepoPageContent() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [repo, setRepo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'issues' | 'pull_requests' | 'projects' | 'insights' | 'settings' | 'discussions'>('code');
  const [activeFile, setActiveFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  
  // New States
  const [isIntentMode, setIsIntentMode] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle'|'saving'|'saved'>('idle');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [showCloneDropdown, setShowCloneDropdown] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingRepo, setIsDeletingRepo] = useState(false);
  const [discussionComment, setDiscussionComment] = useState('');
  const [isStarring, setIsStarring] = useState(false);
  const [isForking, setIsForking] = useState(false);
  
  // Bottom Panel State
  const [bottomPanelTab, setBottomPanelTab] = useState<'terminal' | 'gemini'>('terminal');
  const [terminalOutput, setTerminalOutput] = useState("DevCollab Terminal v1.0.0\nType code and click 'Run' to see output...\n");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !token) return;
    fetchRepo();

    if (socket) {
      socket.emit('join-repo', id);
    }
    
    return () => {
      if (socket) socket.emit('leave-repo', id);
    };
  }, [id, token, socket]);

  useEffect(() => {
    if (bottomPanelTab === 'gemini' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAiLoading, bottomPanelTab]);

  const fetchRepo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRepo(data);
      
      if (data.files && data.files.length > 0 && !activeFile) {
        const readme = data.files.find((f: any) => f.path.toLowerCase() === 'readme.md');
        handleFileSelect(readme || data.files[0]);
      } else if (activeFile) {
         const updatedFile = data.files.find((f:any) => f.path === activeFile.path);
         if(updatedFile && updatedFile.content !== fileContent) {
             setFileContent(updatedFile.content);
         }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSelect = (file: any) => {
    setActiveFile(file);
    setFileContent(file.content);
  };

  const handleSaveFile = async (commitMessage?: string) => {
    if (!activeFile) return;
    setPushStatus('saving');
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/${id}/files`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ path: activeFile.path, content: fileContent, commitMessage: commitMessage || `Update ${activeFile.path}` })
      });
      if (res.ok) {
        fetchRepo();
        setPushStatus('saved');
        setTimeout(() => setPushStatus('idle'), 2000);
      }
    } catch (error) {
      console.error(error);
      setPushStatus('idle');
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/${id}/files`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ path: newFileName, content: '', commitMessage: `Create ${newFileName}` })
      });
      if (res.ok) {
        setShowNewFileInput(false);
        setNewFileName('');
        fetchRepo();
        setActiveFile({ path: newFileName, content: '' });
        setFileContent('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${path}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/${id}/files`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ path })
      });
      if (res.ok) {
        if (activeFile?.path === path) {
           setActiveFile(null);
           setFileContent('');
        }
        fetchRepo();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRepo = async () => {
    if (deleteConfirmText !== repo.name) return;
    setIsDeletingRepo(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      setIsDeletingRepo(false);
    }
  };

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`https://devcollab.io/${repo.owner?.username}/${repo.name}.git`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleStar = async () => {
    if (isStarring) return;
    setIsStarring(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/${id}/star`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRepo();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsStarring(false);
    }
  };

  const handleFork = async () => {
    if (isForking) return;
    setIsForking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/${id}/fork`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const forkedRepo = await res.json();
        router.push(`/repo/${forkedRepo._id}`);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsForking(false);
    }
  };

  const handlePostDiscussion = async () => {
    if (!discussionComment.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/${id}/discussions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: discussionComment })
      });
      if (res.ok) {
        setDiscussionComment('');
        fetchRepo();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRunCode = async () => {
    if (!activeFile) return;
    setBottomPanelTab('terminal');
    setTerminalOutput(prev => prev + `\n> Running ${activeFile.path}...\n⚡ Compiling & Running via Gemini AI (this may take a few seconds)...\n`);
    
    try {
      const ext = activeFile.path.split('.').pop();
      const res = await fetch(`${API_BASE_URL}/api/ai/run`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ code: fileContent, language: ext })
      });
      const data = await res.json();
      setTerminalOutput(prev => prev + `${data.output}\n✓ Execution finished.\n`);
    } catch (error) {
      console.error(error);
      setTerminalOutput(prev => prev + `\nError: Failed to execute code.\n`);
    }
  };

  const handleAiAction = async (action: 'explain' | 'review') => {
    if (!activeFile) return;
    setBottomPanelTab('gemini');
    setChatHistory(prev => [...prev, { role: 'user', text: `Please ${action} this code.` }]);
    setIsAiLoading(true);
    
    try {
      const ext = activeFile.path.split('.').pop();
      const res = await fetch(`${API_BASE_URL}/api/ai/${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ code: fileContent, language: ext })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'model', text: data.explanation || data.review }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', text: 'Error: Failed to get AI response.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;
    
    const userMsg = aiChatInput;
    setAiChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          message: userMsg, 
          fileContext: activeFile ? fileContent : '', 
          history: chatHistory 
        })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', text: 'Error: Failed to connect to AI.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx': return 'typescript';
      case 'js':
      case 'jsx': return 'javascript';
      case 'py': return 'python';
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'hpp':
      case 'h': return 'cpp';
      case 'c': return 'c';
      case 'html':
      case 'htm': return 'html';
      case 'css': return 'css';
      case 'scss':
      case 'sass': return 'scss';
      case 'less': return 'less';
      case 'json': return 'json';
      case 'md':
      case 'markdown': return 'markdown';
      case 'java': return 'java';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      case 'sh':
      case 'bash': return 'shell';
      case 'sql': return 'sql';
      case 'xml': return 'xml';
      case 'yaml':
      case 'yml': return 'yaml';
      case 'cs': return 'csharp';
      case 'swift': return 'swift';
      case 'kt':
      case 'kts': return 'kotlin';
      case 'r': return 'r';
      case 'm': return 'objective-c';
      case 'dart': return 'dart';
      case 'scala': return 'scala';
      case 'pl': return 'perl';
      case 'lua': return 'lua';
      case 'vue': return 'vue';
      case 'graphql':
      case 'gql': return 'graphql';
      default: return 'plaintext';
    }
  };

  if (!repo) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-sans">Loading...</div>;

  return (
    <div className={`h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden transition-all duration-300 ${isIntentMode ? 'ring-2 ring-inset ring-primary' : ''}`}>
      
      <Navbar />

      {/* Repo Header & Tabs */}
      <div className="bg-background/90 border-b border-border pt-4 px-6 shrink-0 flex flex-col gap-4 backdrop-blur-md">
        
        {/* Repo Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xl">
            <span className="text-primary hover:underline cursor-pointer" onClick={() => router.push('/')}>{repo.owner?.username}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-bold text-foreground hover:underline cursor-pointer" onClick={() => router.push('/')}>{repo.name}</span>
            <span className="ml-2 text-xs font-semibold px-3 py-0.5 rounded-full border border-border text-muted-foreground">
              {repo.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
             <button 
                onClick={() => setIsIntentMode(!isIntentMode)}
                className={`border text-foreground px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 ${isIntentMode ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_var(--shadow-color)]' : 'bg-card border-border hover:bg-muted'}`}
             >
                <Shield className="w-4 h-4" /> {isIntentMode ? 'Intent Mode On' : 'Intent Mode'}
             </button>
             
             <div className="flex items-center rounded-full overflow-hidden border border-border bg-card">
                <button className="text-foreground px-3 py-1 hover:bg-muted transition-colors flex items-center gap-1.5 border-r border-border cursor-pointer">
                  <Eye className="w-4 h-4" /> Watch <ChevronDown className="w-3 h-3" />
                </button>
                <span className="px-3 py-1 text-foreground font-medium bg-background/40">0</span>
             </div>

             <div className="flex items-center rounded-full overflow-hidden border border-border bg-card">
                <button onClick={handleFork} className="text-foreground px-3 py-1 hover:bg-muted transition-colors flex items-center gap-1.5 border-r border-border cursor-pointer">
                  <GitFork className="w-4 h-4" /> Fork <ChevronDown className="w-3 h-3" />
                </button>
                <span className="px-3 py-1 text-foreground font-medium bg-background/40">{repo.forks?.length || 0}</span>
             </div>

             <div className="flex items-center rounded-full overflow-hidden border border-border bg-card">
                <button onClick={handleStar} className="text-foreground px-3 py-1 hover:bg-muted transition-colors flex items-center gap-1.5 border-r border-border cursor-pointer">
                  <Star className="w-4 h-4" /> Star <ChevronDown className="w-3 h-3" />
                </button>
                <span className="px-3 py-1 text-foreground font-medium bg-background/40">{repo.stars?.length || 0}</span>
             </div>

             {/* Theme Toggle Button directly in Repository View */}
             <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="bg-card border border-border text-foreground hover:bg-muted px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
             </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('code')} 
            className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 origin-bottom ${
              activeTab === 'code' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            <Code className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" /> Code
          </button>
          <button 
            onClick={() => setActiveTab('issues')} 
            className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 origin-bottom ${
              activeTab === 'issues' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            <CircleDot className="w-4 h-4" /> Issues
          </button>
          <button 
            onClick={() => setActiveTab('pull_requests')} 
            className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 origin-bottom ${
              activeTab === 'pull_requests' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            <GitPullRequest className="w-4 h-4" /> Pull requests
          </button>
          <button 
            onClick={() => setActiveTab('discussions')} 
            className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 origin-bottom ${
              activeTab === 'discussions' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Discussions
          </button>
          <button 
            className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-semibold text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-all duration-200 hover:scale-[1.02] active:scale-95 origin-bottom whitespace-nowrap cursor-default"
          >
            <Play className="w-4 h-4" /> Actions
          </button>
          <button 
            onClick={() => setActiveTab('projects')} 
            className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 origin-bottom ${
              activeTab === 'projects' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            <Layout className="w-4 h-4" /> Projects
          </button>
          <button 
            className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-semibold text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-all duration-200 hover:scale-[1.02] active:scale-95 origin-bottom whitespace-nowrap cursor-default"
          >
            <Book className="w-4 h-4" /> Wiki
          </button>
          <button 
            className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-semibold text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-all duration-200 hover:scale-[1.02] active:scale-95 origin-bottom whitespace-nowrap cursor-default"
          >
            <Shield className="w-4 h-4" /> Security
          </button>
          <button 
            onClick={() => setActiveTab('insights')} 
            className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 origin-bottom ${
              activeTab === 'insights' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            <Activity className="w-4 h-4" /> Insights
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 origin-bottom ${
              activeTab === 'settings' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-background overflow-hidden">
        
        {activeTab === 'code' && (
          <>
            {/* Left Sidebar (File Tree) */}
            <div className="w-full md:w-[280px] h-48 md:h-full border-b md:border-b-0 md:border-r border-border bg-card/60 flex flex-col shrink-0">
              <div className="p-3 flex items-center justify-between border-b border-border">
                <div className="bg-card border border-border rounded-full text-sm px-3 py-1 flex items-center justify-between w-40 cursor-pointer hover:bg-muted transition-all">
                  <span className="text-foreground">main</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <button onClick={() => setShowNewFileInput(!showNewFileInput)} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" title="New File">
                  <Play className="w-4 h-4 rotate-90" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {showNewFileInput && (
                  <form onSubmit={handleCreateFile} className="mb-2">
                    <Input 
                      autoFocus
                      type="text" 
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="filename.ext" 
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      onBlur={() => setShowNewFileInput(false)}
                    />
                  </form>
                )}
                <div className="space-y-0.5">
                  <FileTree 
                    files={repo.files || []} 
                    activeFile={activeFile} 
                    onSelectFile={handleFileSelect} 
                    onDeleteFile={handleDeleteFile} 
                  />
                </div>
              </div>
            </div>

            {/* Editor & Bottom Pane */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
              {activeFile ? (
                <>
                  {/* Editor Header */}
                  <div className="h-[50px] border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-3 text-sm">
                       <FileText className="w-4 h-4 text-muted-foreground" />
                       <span className="font-semibold text-foreground">{activeFile.path}</span>
                       <span className="bg-card text-muted-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-border">
                         {getLanguage(activeFile.path)}
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleRunCode} className="bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold px-4 h-[32px] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.1)] active:scale-95">
                        <Play className="w-3.5 h-3.5" /> RUN
                      </Button>
                      <button className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer" title="History">
                        <History className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button onClick={() => setShowCloneDropdown(!showCloneDropdown)} className="bg-card text-foreground text-xs font-semibold px-4 py-1.5 rounded-full border border-border flex items-center gap-1.5 hover:bg-muted active:scale-95 transition-all cursor-pointer">
                          <Code className="w-4 h-4" /> CODE <ChevronDown className="w-3 h-3" />
                        </button>
                        {showCloneDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4">
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Terminal className="w-4 h-4 text-primary" /> Clone Repository</span>
                                <button onClick={() => setShowCloneDropdown(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-4 h-4" /></button>
                             </div>
                             <div className="flex gap-2">
                                <input type="text" readOnly value={`https://devcollab.io/${repo?.owner?.username}/${repo?.name}.git`} className="flex-1 bg-background border border-border rounded-xl text-xs px-3 py-2 text-muted-foreground focus:outline-none" />
                                <button onClick={handleCopyClone} className="bg-card border border-border hover:bg-muted rounded-xl px-3 py-2 text-foreground transition-all cursor-pointer">
                                   {copiedClone ? <Check className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 rotate-90" />}
                                </button>
                             </div>
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleSaveFile()} 
                        disabled={pushStatus !== 'idle'}
                        className={`text-primary-foreground text-xs font-extrabold px-5 h-[32px] rounded-full flex items-center gap-1.5 transition-all border-none cursor-pointer active:scale-95 ${
                          pushStatus === 'saved' ? 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-primary hover:bg-primary/90 shadow-[0_0_10px_var(--shadow-color)]'
                        }`}
                      >
                         {pushStatus === 'saving' ? 'PUSHING...' : pushStatus === 'saved' ? 'PUSHED ✓' : 'PUSH'}
                      </Button>
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language={getLanguage(activeFile.path)}
                      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                      value={fileContent}
                      onChange={(val) => setFileContent(val || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                      }}
                    />
                  </div>

                  {/* Bottom Pane (Terminal / AI) */}
                  <div className="h-72 border-t border-border bg-background flex flex-col shrink-0">
                     <div className="flex items-center justify-between border-b border-border px-4 h-10 bg-background">
                        <div className="flex gap-4 h-full">
                           <button 
                              onClick={() => setBottomPanelTab('terminal')}
                              className={`text-xs font-bold uppercase tracking-wider h-full flex items-center border-b-2 transition-colors cursor-pointer ${bottomPanelTab === 'terminal' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                           >
                              TERMINAL
                           </button>
                           <button 
                              onClick={() => setBottomPanelTab('gemini')}
                              className={`text-xs font-bold uppercase tracking-wider h-full flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${bottomPanelTab === 'gemini' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                           >
                              <Bot className="w-3.5 h-3.5 text-primary" /> GEMINI AI
                           </button>
                        </div>
                        <button 
                          onClick={() => bottomPanelTab === 'terminal' ? setTerminalOutput('') : setChatHistory([])}
                          className="text-muted-foreground hover:text-foreground text-xs font-medium uppercase cursor-pointer"
                        >
                          Clear
                        </button>
                     </div>
                     
                     <div className="flex-1 overflow-hidden flex flex-col">
                        {bottomPanelTab === 'terminal' ? (
                          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-foreground whitespace-pre-wrap bg-background/40">
                            {terminalOutput}
                          </div>
                        ) : (
                          <div className="flex flex-col h-full bg-background">
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                               {chatHistory.length === 0 && (
                                  <div className="text-muted-foreground text-sm text-center mt-4">
                                     Gemini AI loaded. Ask questions about the active file or request a code review.
                                  </div>
                                )}
                               {chatHistory.map((msg, i) => (
                                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-3 px-4 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground font-medium shadow-[0_0_10px_var(--shadow-color)]' : 'bg-card border border-border text-foreground'}`}>
                                       {msg.role === 'model' ? (
                                         <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                         </div>
                                       ) : (
                                         msg.text
                                       )}
                                    </div>
                                 </div>
                               ))}
                               {isAiLoading && (
                                 <div className="flex justify-start">
                                    <div className="bg-card border border-border rounded-2xl p-3 px-4 text-sm text-muted-foreground flex items-center gap-2">
                                       <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                       Generating...
                                    </div>
                                 </div>
                               )}
                               <div ref={chatEndRef} />
                            </div>
                            
                            <div className="p-3 border-t border-border bg-card">
                               <div className="flex gap-2 mb-3">
                                 <button onClick={() => handleAiAction('explain')} disabled={isAiLoading} className="bg-background text-foreground text-xs px-4 py-1.5 rounded-full border border-border hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer">Explain Code</button>
                                 <button onClick={() => handleAiAction('review')} disabled={isAiLoading} className="bg-background text-foreground text-xs px-4 py-1.5 rounded-full border border-border hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer">Review Code</button>
                               </div>
                               <form onSubmit={handleAiChatSubmit} className="flex gap-2">
                                 <Input 
                                   type="text"
                                   value={aiChatInput}
                                   onChange={e => setAiChatInput(e.target.value)}
                                   placeholder="Ask Gemini about this code..."
                                   className="flex-1 bg-background border border-border rounded-full px-4 text-sm text-foreground focus-visible:ring-primary/50 h-[38px]"
                                   disabled={isAiLoading}
                                 />
                                 <Button type="submit" disabled={isAiLoading || !aiChatInput.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold p-2 px-4 rounded-full disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer h-[38px] border-none shadow-[0_0_10px_var(--shadow-color)]">
                                   <Send className="w-4 h-4 text-primary-foreground" />
                                 </Button>
                               </form>
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <FolderGit2 className="w-16 h-16 mb-4 opacity-20 animate-pulse text-primary" />
                  <p className="font-semibold">Select a file to start coding</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="flex-1 p-6 overflow-hidden bg-background">
            <div className="h-full border border-border rounded-2xl overflow-hidden bg-background">
               <KanbanBoard repoId={id as string} initialKanban={repo.kanban} />
            </div>
          </div>
        )}

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div className="flex-1 p-6 flex items-center justify-center text-muted-foreground bg-background">
             Issues coming soon. Use Projects for now!
          </div>
        )}

        {/* PULL REQUESTS TAB */}
        {activeTab === 'pull_requests' && (
          <div className="flex-1 p-6 flex items-center justify-center text-muted-foreground bg-background">
             Pull requests coming soon. Use Discussions for now!
          </div>
        )}

        {/* DISCUSSIONS TAB */}
        {activeTab === 'discussions' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-background">
             <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
               <GitPullRequest className="w-5 h-5 text-primary" /> Pull Request Discussions
             </h2>

             <div className="flex-1 flex flex-col justify-center items-center text-center">
                {repo.discussions?.length > 0 ? (
                  <div className="w-full max-w-4xl space-y-4 mb-6">
                    {repo.discussions.map((disc: any, i: number) => (
                      <div key={i} className="flex gap-4 items-start text-left bg-card border border-border p-4 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-primary-foreground font-bold shrink-0">
                          {disc.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground text-sm">{disc.author}</span>
                            <span className="text-xs text-muted-foreground">{new Date(disc.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-foreground text-sm whitespace-pre-wrap">{disc.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center mb-8">
                    <MessageSquare className="w-12 h-12 text-border mb-4" />
                    <h3 className="text-muted-foreground text-lg font-medium">No discussions yet. Start the conversation!</h3>
                  </div>
                )}
             </div>

             <div className="bg-card border border-border rounded-2xl overflow-hidden mt-auto shadow-xl">
                <div className="bg-background border-b border-border flex">
                  <button className="px-4 py-2 text-sm font-semibold text-foreground border-b-2 border-primary cursor-pointer">Write</button>
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Preview</button>
                </div>
                <textarea 
                  value={discussionComment}
                  onChange={e => setDiscussionComment(e.target.value)}
                  placeholder="Leave a comment"
                  className="w-full bg-background/60 text-sm text-foreground p-4 min-h-[120px] focus:outline-none resize-y"
                />
                <div className="bg-card border-t border-border p-3 flex justify-end">
                  <Button 
                    onClick={handlePostDiscussion}
                    disabled={!discussionComment.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-none transition-all text-sm flex items-center gap-2 cursor-pointer rounded-full px-5 shadow-[0_0_10px_var(--shadow-color)]"
                  >
                    Comment <MessageSquare className="w-4 h-4 text-primary-foreground" />
                  </Button>
                </div>
             </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="flex-1 p-8 overflow-y-auto bg-background">
             <div className="max-w-6xl mx-auto">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Repository Insights</h2>
                    <p className="text-muted-foreground">Track activity, contributions, and project health.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-card border border-border rounded-2xl px-6 py-3 text-center shadow-lg">
                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Commits</div>
                       <div className="text-2xl font-bold text-primary">{repo.commits?.length || 0}</div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl px-6 py-3 text-center shadow-lg">
                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Contributors</div>
                       <div className="text-2xl font-bold text-primary">{1 + (repo.collaborators?.length || 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="border border-border bg-card rounded-2xl p-6 relative overflow-hidden shadow-lg">
                       <div className="text-sm font-semibold text-muted-foreground mb-4">Pull Requests</div>
                       <div className="flex items-end gap-3">
                          <span className="text-4xl font-bold text-primary">0</span>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">HEALTHY</span>
                       </div>
                       <div className="absolute right-6 bottom-6 flex gap-1 items-end h-8">
                          <div className="w-1.5 h-3 bg-muted rounded-full"></div>
                          <div className="w-1.5 h-6 bg-muted rounded-full"></div>
                          <div className="w-1.5 h-4 bg-muted rounded-full"></div>
                       </div>
                    </div>
                    <div className="border border-border bg-card rounded-2xl p-6 relative overflow-hidden shadow-lg">
                       <div className="text-sm font-semibold text-muted-foreground mb-4">Open Issues</div>
                       <div className="flex items-end gap-3">
                          <span className="text-4xl font-bold text-primary">0</span>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">ACTIVE</span>
                       </div>
                       <div className="absolute right-6 bottom-6 flex gap-1 items-end h-8">
                          <div className="w-1.5 h-5 bg-muted rounded-full"></div>
                          <div className="w-1.5 h-2 bg-muted rounded-full"></div>
                          <div className="w-1.5 h-7 bg-muted rounded-full"></div>
                       </div>
                    </div>
                    <div className="border border-border bg-card rounded-2xl p-6 relative overflow-hidden shadow-lg">
                       <div className="text-sm font-semibold text-muted-foreground mb-4">Stars</div>
                       <div className="flex items-end gap-3">
                          <span className="text-4xl font-bold text-primary">{repo.stars?.length || 0}</span>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">GROWING</span>
                       </div>
                       <div className="absolute right-6 bottom-6 flex gap-1 items-end h-8">
                          <div className="w-1.5 h-4 bg-muted rounded-full"></div>
                          <div className="w-1.5 h-5 bg-muted rounded-full"></div>
                          <div className="w-1.5 h-8 bg-muted rounded-full"></div>
                       </div>
                    </div>
                </div>

                <div>
                   <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Recent Activity</h3>
                   <div className="space-y-3">
                      {repo.commits?.slice().reverse().map((commit: any) => {
                        const filename = commit.message.split(' ')[1] || 'commit';
                        return (
                          <div key={commit.sha} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                                   <History className="w-5 h-5 text-muted-foreground" />
                                 </div>
                                 <div>
                                   <div className="font-semibold text-foreground text-sm mb-1">{commit.message}</div>
                                   <div className="text-xs text-muted-foreground">
                                     {new Date(commit.timestamp).toLocaleString()} by <span className="text-foreground font-medium">{repo.owner?.username}</span>
                                   </div>
                                 </div>
                              </div>
                              <div className="hidden md:flex items-center gap-2">
                                 <span className="bg-primary/10 text-primary border border-primary/30 text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1">
                                   {filename}
                                  </span>
                              </div>
                          </div>
                        );
                      })}
                      {(!repo.commits || repo.commits.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                           No recent activity.
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="flex-1 p-8 overflow-y-auto bg-background">
             <div className="max-w-3xl mx-auto space-y-8">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">Settings</h2>
                
                <div className="border border-red-500/40 rounded-2xl overflow-hidden bg-card shadow-xl">
                   <div className="bg-red-500/10 p-4 border-b border-red-500/40">
                      <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Danger Zone
                      </h3>
                   </div>
                   <div className="p-6 space-y-4">
                      <p className="text-sm text-foreground leading-relaxed">This action cannot be undone. This will permanently delete the <span className="font-bold text-foreground">{repo.owner?.username}/{repo.name}</span> repository, wiki, issues, and commits.</p>
                      <div className="bg-background border border-border rounded-2xl p-5 flex flex-col gap-3">
                         <label className="text-sm font-medium text-foreground">Please type <span className="font-bold text-red-400">{repo.name}</span> to confirm.</label>
                         <Input 
                           type="text" 
                           value={deleteConfirmText}
                           onChange={e => setDeleteConfirmText(e.target.value)}
                           className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus-visible:ring-red-500/50 h-[38px]"
                         />
                         <Button 
                           disabled={deleteConfirmText !== repo.name || isDeletingRepo}
                           onClick={handleDeleteRepo}
                           className="self-start bg-red-500 hover:bg-red-400 text-white border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm cursor-pointer h-[32px] rounded-full px-5 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                         >
                           {isDeletingRepo ? 'Deleting...' : 'Delete this repository'}
                         </Button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* Floating Chat Button */}
      <AIChatbot fileContext={activeFile ? `File Path: ${activeFile.path}\n\n${activeFile.content}` : `Repository: ${repo?.name}\nDescription: ${repo?.description}`} />
    </div>
  );
}
