import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FolderGit2, Search, Bell, Plus, ChevronDown, Star, GitFork, Eye, Play, History, Code, MessageSquare, Layout, Activity, Shield, Book, CircleDot, GitPullRequest, Settings, Terminal, Bot, X, FileText, Send, Trash2, Copy, Check, GitCommit, Users, FileCode2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import KanbanBoard from '../components/KanbanBoard';
import Navbar from '../components/Navbar';
import FileTree from '../components/FileTree';
import AIChatbot from '../components/AIChatbot';
import { API_BASE_URL } from '../config';

export default function RepoPage() {
  const { id } = useParams();
  const { user, token, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

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
  const isStarred = repo?.stars?.includes(user?._id);
  
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
        navigate('/');
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
        navigate(`/repo/${forkedRepo._id}`);
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

  if (!repo) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className={`h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans overflow-hidden transition-all duration-300 ${isIntentMode ? 'ring-2 ring-inset ring-indigo-500' : ''}`}>
      
      <Navbar />

      {/* Repo Header & Tabs */}
      <div className="bg-[#0d1117] border-b border-[#30363d] pt-4 px-6 shrink-0 flex flex-col gap-4">
        
        {/* Repo Title and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl">
            <span className="text-[#58a6ff] hover:underline cursor-pointer">{repo.owner?.username}</span>
            <span className="text-[#8b949e]">/</span>
            <span className="font-bold text-white hover:underline cursor-pointer">{repo.name}</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e]">
              {repo.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
             <button 
                onClick={() => setIsIntentMode(!isIntentMode)}
                className={`border text-[#c9d1d9] px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${isIntentMode ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-[#21262d] border-[#30363d] hover:bg-[#30363d] hover:text-white'}`}
             >
                <Shield className="w-4 h-4" /> {isIntentMode ? 'Intent Mode On' : 'Intent Mode'}
             </button>
             
             <div className="flex items-center rounded-md overflow-hidden border border-[#30363d]">
               <button className="bg-[#21262d] text-[#c9d1d9] px-3 py-1 hover:bg-[#30363d] hover:text-white transition-colors flex items-center gap-1.5 border-r border-[#30363d]">
                 <Eye className="w-4 h-4" /> Watch <ChevronDown className="w-3 h-3" />
               </button>
               <span className="bg-[#0d1117] px-3 py-1 text-[#c9d1d9] font-medium">0</span>
             </div>

             <div className="flex items-center rounded-md overflow-hidden border border-[#30363d]">
               <button className="bg-[#21262d] text-[#c9d1d9] px-3 py-1 hover:bg-[#30363d] hover:text-white transition-colors flex items-center gap-1.5 border-r border-[#30363d]">
                 <GitFork className="w-4 h-4" /> Fork <ChevronDown className="w-3 h-3" />
               </button>
               <span className="bg-[#0d1117] px-3 py-1 text-[#c9d1d9] font-medium">{repo.forks?.length || 0}</span>
             </div>

             <div className="flex items-center rounded-md overflow-hidden border border-[#30363d]">
               <button className="bg-[#21262d] text-[#c9d1d9] px-3 py-1 hover:bg-[#30363d] hover:text-white transition-colors flex items-center gap-1.5 border-r border-[#30363d]">
                 <Star className="w-4 h-4" /> Star <ChevronDown className="w-3 h-3" />
               </button>
               <span className="bg-[#0d1117] px-3 py-1 text-[#c9d1d9] font-medium">{repo.stars?.length || 0}</span>
             </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('code')} className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'code' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'}`}>
            <Code className="w-4 h-4" /> Code
          </button>
          <button onClick={() => setActiveTab('issues')} className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'issues' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'}`}>
            <CircleDot className="w-4 h-4" /> Issues
          </button>
          <button onClick={() => setActiveTab('pull_requests')} className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'pull_requests' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'}`}>
            <GitPullRequest className="w-4 h-4" /> Pull requests
          </button>
          <button onClick={() => setActiveTab('discussions')} className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'discussions' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'}`}>
            <MessageSquare className="w-4 h-4" /> Discussions
          </button>
          <button className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-medium text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d] transition-colors whitespace-nowrap">
            <Play className="w-4 h-4" /> Actions
          </button>
          <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'projects' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'}`}>
            <Layout className="w-4 h-4" /> Projects
          </button>
          <button className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-medium text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d] transition-colors whitespace-nowrap">
            <Book className="w-4 h-4" /> Wiki
          </button>
          <button className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-medium text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d] transition-colors whitespace-nowrap">
            <Shield className="w-4 h-4" /> Security
          </button>
          <button onClick={() => setActiveTab('insights')} className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'insights' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'}`}>
            <Activity className="w-4 h-4" /> Insights
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'}`}>
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0 bg-[#0d1117]">
        
        {activeTab === 'code' && (
          <>
            {/* Left Sidebar (File Tree) */}
            <div className="w-[280px] border-r border-[#30363d] bg-[#161b22] flex flex-col shrink-0">
              <div className="p-3 flex items-center justify-between border-b border-[#30363d]">
                <div className="bg-[#21262d] border border-[#30363d] rounded text-sm px-2 py-1 flex items-center justify-between w-40 cursor-pointer hover:bg-[#30363d]">
                  <span className="text-[#c9d1d9]">main</span>
                  <ChevronDown className="w-4 h-4 text-[#8b949e]" />
                </div>
                <button onClick={() => setShowNewFileInput(!showNewFileInput)} className="text-[#8b949e] hover:text-white" title="New File">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {showNewFileInput && (
                  <form onSubmit={handleCreateFile} className="mb-2">
                    <input 
                      autoFocus
                      type="text" 
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="filename.ext" 
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#58a6ff]"
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
            <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117]">
              {activeFile ? (
                <>
                  {/* Editor Header */}
                  <div className="h-[50px] border-b border-[#30363d] bg-[#0d1117] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-3 text-sm">
                       <FileText className="w-4 h-4 text-[#8b949e]" />
                       <span className="font-semibold text-[#c9d1d9]">{activeFile.path}</span>
                       <span className="bg-[#21262d] text-[#8b949e] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-[#30363d]">
                         {getLanguage(activeFile.path)}
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleRunCode} className="bg-[#238636]/10 text-[#3fb950] border border-[#238636] hover:bg-[#238636]/20 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
                        <Play className="w-3.5 h-3.5" /> RUN
                      </button>
                      <button className="text-[#8b949e] hover:text-white p-1.5 rounded hover:bg-[#21262d] transition-colors" title="History">
                        <History className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button onClick={() => setShowCloneDropdown(!showCloneDropdown)} className="bg-[#21262d] text-[#c9d1d9] text-xs font-medium px-3 py-1.5 rounded-md border border-[#30363d] flex items-center gap-1.5 hover:bg-[#30363d]">
                          <Code className="w-4 h-4" /> CODE <ChevronDown className="w-3 h-3" />
                        </button>
                        {showCloneDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-80 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl z-50 p-4">
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-semibold text-white flex items-center gap-2"><Terminal className="w-4 h-4" /> Clone Repository</span>
                                <button onClick={() => setShowCloneDropdown(false)} className="text-[#8b949e] hover:text-white"><X className="w-4 h-4" /></button>
                             </div>
                             <div className="flex gap-2">
                                <input type="text" readOnly value={`https://devcollab.io/${repo?.owner?.username}/${repo?.name}.git`} className="flex-1 bg-[#0d1117] border border-[#30363d] rounded text-xs px-3 py-2 text-[#8b949e] focus:outline-none" />
                                <button onClick={handleCopyClone} className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded px-3 py-2 text-[#c9d1d9] transition-colors">
                                   {copiedClone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                             </div>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleSaveFile()} 
                        disabled={pushStatus !== 'idle'}
                        className={`text-white text-xs font-bold px-4 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                          pushStatus === 'saved' ? 'bg-emerald-600' : 'bg-[#6366f1] hover:bg-[#4f46e5]'
                        }`}
                      >
                         {pushStatus === 'saving' ? 'PUSHING...' : pushStatus === 'saved' ? 'PUSHED ✓' : 'PUSH'}
                      </button>
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language={getLanguage(activeFile.path)}
                      theme="vs-dark"
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
                  <div className="h-72 border-t border-[#30363d] bg-[#0d1117] flex flex-col shrink-0">
                     <div className="flex items-center justify-between border-b border-[#30363d] px-4 h-10 bg-[#0d1117]">
                        <div className="flex gap-4 h-full">
                           <button 
                              onClick={() => setBottomPanelTab('terminal')}
                              className={`text-xs font-bold uppercase tracking-wide h-full flex items-center border-b-2 transition-colors ${bottomPanelTab === 'terminal' ? 'border-[#58a6ff] text-white' : 'border-transparent text-[#8b949e] hover:text-white'}`}
                           >
                             TERMINAL
                           </button>
                           <button 
                              onClick={() => setBottomPanelTab('gemini')}
                              className={`text-xs font-bold uppercase tracking-wide h-full flex items-center gap-1 border-b-2 transition-colors ${bottomPanelTab === 'gemini' ? 'border-[#58a6ff] text-white' : 'border-transparent text-[#8b949e] hover:text-white'}`}
                           >
                             <Bot className="w-3.5 h-3.5" /> GEMINI AI
                           </button>
                        </div>
                        <button 
                          onClick={() => bottomPanelTab === 'terminal' ? setTerminalOutput('') : setChatHistory([])}
                          className="text-[#8b949e] hover:text-white text-xs font-medium uppercase"
                        >
                          Clear
                        </button>
                     </div>
                     
                     <div className="flex-1 overflow-hidden flex flex-col">
                        {bottomPanelTab === 'terminal' ? (
                          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-[#c9d1d9] whitespace-pre-wrap">
                            {terminalOutput}
                          </div>
                        ) : (
                          <div className="flex flex-col h-full bg-[#0d1117]">
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                               {chatHistory.length === 0 && (
                                  <div className="text-[#8b949e] text-sm text-center mt-4">
                                     Gemini AI loaded. Ask questions about the active file or request a code review.
                                  </div>
                               )}
                               {chatHistory.map((msg, i) => (
                                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-[#238636] text-white' : 'bg-[#21262d] border border-[#30363d] text-[#c9d1d9]'}`}>
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
                                    <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-3 text-sm text-[#8b949e] flex items-center gap-2">
                                       <div className="w-3 h-3 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
                                       Generating...
                                    </div>
                                 </div>
                               )}
                               <div ref={chatEndRef} />
                            </div>
                            
                            <div className="p-3 border-t border-[#30363d] bg-[#161b22]">
                               <div className="flex gap-2 mb-3">
                                 <button onClick={() => handleAiAction('explain')} disabled={isAiLoading} className="bg-[#21262d] text-[#c9d1d9] text-xs px-3 py-1.5 rounded border border-[#30363d] hover:bg-[#30363d] disabled:opacity-50 transition-colors">Explain Code</button>
                                 <button onClick={() => handleAiAction('review')} disabled={isAiLoading} className="bg-[#21262d] text-[#c9d1d9] text-xs px-3 py-1.5 rounded border border-[#30363d] hover:bg-[#30363d] disabled:opacity-50 transition-colors">Review Code</button>
                               </div>
                               <form onSubmit={handleAiChatSubmit} className="flex gap-2">
                                 <input 
                                   type="text"
                                   value={aiChatInput}
                                   onChange={e => setAiChatInput(e.target.value)}
                                   placeholder="Ask Gemini about this code..."
                                   className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                                   disabled={isAiLoading}
                                 />
                                 <button type="submit" disabled={isAiLoading || !aiChatInput.trim()} className="bg-[#6366f1] hover:bg-[#4f46e5] text-white p-2 rounded-md disabled:opacity-50 transition-colors flex items-center justify-center">
                                   <Send className="w-4 h-4" />
                                 </button>
                               </form>
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#8b949e]">
                  <FolderGit2 className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select a file to start coding</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full border border-[#30363d] rounded-xl overflow-hidden bg-[#0d1117]">
               <KanbanBoard repoId={id!} initialKanban={repo.kanban} />
            </div>
          </div>
        )}

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div className="flex-1 p-6 flex items-center justify-center text-[#8b949e]">
             Issues coming soon. Use Projects for now!
          </div>
        )}

        {/* PULL REQUESTS TAB */}
        {activeTab === 'pull_requests' && (
          <div className="flex-1 p-6 flex items-center justify-center text-[#8b949e]">
             Pull requests coming soon. Use Discussions for now!
          </div>
        )}

        {/* DISCUSSIONS TAB */}
        {activeTab === 'discussions' && (
          <div className="flex-1 flex flex-col p-6">
             <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-[#30363d] pb-4">
               <GitPullRequest className="w-5 h-5 text-emerald-400" /> Pull Request Discussions
             </h2>

             <div className="flex-1 flex flex-col justify-center items-center text-center">
               {repo.discussions?.length > 0 ? (
                 <div className="w-full max-w-4xl space-y-4 mb-6">
                   {repo.discussions.map((disc: any, i: number) => (
                     <div key={i} className="flex gap-4 items-start text-left bg-[#0d1117] border border-[#30363d] p-4 rounded-xl">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                         {disc.author.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="font-bold text-white text-sm">{disc.author}</span>
                           <span className="text-xs text-[#8b949e]">{new Date(disc.timestamp).toLocaleString()}</span>
                         </div>
                         <p className="text-[#c9d1d9] text-sm whitespace-pre-wrap">{disc.content}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center mb-8">
                   <MessageSquare className="w-12 h-12 text-[#30363d] mb-4" />
                   <h3 className="text-[#8b949e] text-lg font-medium">No discussions yet. Start the conversation!</h3>
                 </div>
               )}
             </div>

             <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden mt-auto">
                <div className="bg-[#0d1117] border-b border-[#30363d] flex">
                  <button className="px-4 py-2 text-sm font-semibold text-white border-b-2 border-[#f78166]">Write</button>
                  <button className="px-4 py-2 text-sm font-medium text-[#8b949e] hover:text-white transition-colors">Preview</button>
                </div>
                <textarea 
                  value={discussionComment}
                  onChange={e => setDiscussionComment(e.target.value)}
                  placeholder="Leave a comment"
                  className="w-full bg-[#0d1117] text-sm text-[#c9d1d9] p-4 min-h-[120px] focus:outline-none resize-y"
                />
                <div className="bg-[#161b22] border-t border-[#30363d] p-3 flex justify-end">
                  <button 
                    onClick={handlePostDiscussion}
                    disabled={!discussionComment.trim()}
                    className="bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#238636]/50 disabled:text-white/50 text-white font-semibold py-1.5 px-4 rounded-md transition-colors text-sm flex items-center gap-2"
                  >
                    Comment <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="flex-1 p-8 overflow-y-auto">
             <div className="max-w-6xl mx-auto">
                
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Repository Insights</h2>
                    <p className="text-[#8b949e]">Track activity, contributions, and project health.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-6 py-3 text-center">
                      <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-1">Commits</div>
                      <div className="text-2xl font-bold text-[#58a6ff]">{repo.commits?.length || 0}</div>
                    </div>
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-6 py-3 text-center">
                      <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-1">Contributors</div>
                      <div className="text-2xl font-bold text-emerald-400">{1 + (repo.collaborators?.length || 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                   <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-6 relative overflow-hidden">
                      <div className="text-sm font-semibold text-[#8b949e] mb-4">Pull Requests</div>
                      <div className="flex items-end gap-3">
                         <span className="text-4xl font-bold text-[#d2a8ff]">0</span>
                         <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1">HEALTHY</span>
                      </div>
                      <div className="absolute right-6 bottom-6 flex gap-1 items-end h-8">
                         <div className="w-1.5 h-3 bg-[#30363d] rounded-full"></div>
                         <div className="w-1.5 h-6 bg-[#30363d] rounded-full"></div>
                         <div className="w-1.5 h-4 bg-[#30363d] rounded-full"></div>
                      </div>
                   </div>
                   <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-6 relative overflow-hidden">
                      <div className="text-sm font-semibold text-[#8b949e] mb-4">Open Issues</div>
                      <div className="flex items-end gap-3">
                         <span className="text-4xl font-bold text-[#ffa657]">0</span>
                         <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1">ACTIVE</span>
                      </div>
                      <div className="absolute right-6 bottom-6 flex gap-1 items-end h-8">
                         <div className="w-1.5 h-5 bg-[#30363d] rounded-full"></div>
                         <div className="w-1.5 h-2 bg-[#30363d] rounded-full"></div>
                         <div className="w-1.5 h-7 bg-[#30363d] rounded-full"></div>
                      </div>
                   </div>
                   <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-6 relative overflow-hidden">
                      <div className="text-sm font-semibold text-[#8b949e] mb-4">Stars</div>
                      <div className="flex items-end gap-3">
                         <span className="text-4xl font-bold text-[#e3b341]">{repo.stars?.length || 0}</span>
                         <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1">GROWING</span>
                      </div>
                      <div className="absolute right-6 bottom-6 flex gap-1 items-end h-8">
                         <div className="w-1.5 h-4 bg-[#30363d] rounded-full"></div>
                         <div className="w-1.5 h-5 bg-[#30363d] rounded-full"></div>
                         <div className="w-1.5 h-8 bg-[#30363d] rounded-full"></div>
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Recent Activity</h3>
                   <div className="space-y-3">
                     {repo.commits?.slice().reverse().map((commit: any) => {
                       const filename = commit.message.split(' ')[1] || 'commit';
                       return (
                         <div key={commit.sha} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex items-center justify-between hover:border-[#8b949e] transition-colors">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center shrink-0">
                                 <History className="w-5 h-5 text-[#8b949e]" />
                               </div>
                               <div>
                                 <div className="font-semibold text-white text-sm mb-1">{commit.message}</div>
                                 <div className="text-xs text-[#8b949e]">
                                   {new Date(commit.timestamp).toLocaleString()} by <span className="text-[#c9d1d9] font-medium">{repo.owner?.username}</span>
                                 </div>
                               </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                               <span className="px-3 py-1 bg-[#238636]/10 text-[#2ea043] border border-[#2ea043]/30 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                 {filename}
                               </span>
                            </div>
                         </div>
                       );
                     })}
                     {(!repo.commits || repo.commits.length === 0) && (
                       <div className="text-center py-8 text-[#8b949e] text-sm">
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
          <div className="flex-1 p-8 overflow-y-auto">
             <div className="max-w-3xl mx-auto space-y-8">
                <h2 className="text-2xl font-semibold text-white border-b border-[#30363d] pb-2">Settings</h2>
                
                <div className="border border-[#f85149] rounded-lg overflow-hidden">
                   <div className="bg-[#f85149]/10 p-4 border-b border-[#f85149]">
                      <h3 className="text-lg font-semibold text-[#f85149] flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Danger Zone
                      </h3>
                   </div>
                   <div className="bg-[#0d1117] p-6 space-y-4">
                      <p className="text-sm text-[#c9d1d9]">This action cannot be undone. This will permanently delete the <span className="font-bold">{repo.owner?.username}/{repo.name}</span> repository, wiki, issues, and commits.</p>
                      <div className="bg-[#161b22] border border-[#30363d] rounded p-4 flex flex-col gap-3">
                         <label className="text-sm font-medium">Please type <span className="font-bold">{repo.name}</span> to confirm.</label>
                         <input 
                           type="text" 
                           value={deleteConfirmText}
                           onChange={e => setDeleteConfirmText(e.target.value)}
                           className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f85149]"
                         />
                         <button 
                           disabled={deleteConfirmText !== repo.name || isDeletingRepo}
                           onClick={handleDeleteRepo}
                           className="self-start bg-[#f85149] hover:bg-[#d1242f] text-white font-medium py-1.5 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                         >
                           {isDeletingRepo ? 'Deleting...' : 'Delete this repository'}
                         </button>
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
