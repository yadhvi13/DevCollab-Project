import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FolderGit2, Search, Bell, Plus, ChevronDown, Star, GitFork, Eye, Play, History, Code, MessageSquare, Layout, Activity, Shield, Book, CircleDot, GitPullRequest, Settings, Terminal, Bot, X, FileText, Send } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import KanbanBoard from '../components/KanbanBoard';

export default function RepoPage() {
  const { id } = useParams();
  const { user, token, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [repo, setRepo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'issues' | 'projects'>('code');
  const [activeFile, setActiveFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  
  // New States
  const [isIntentMode, setIsIntentMode] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle'|'saving'|'saved'>('idle');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  
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
      const res = await fetch(`http://localhost:5000/api/repos/${id}`, {
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
      const res = await fetch(`http://localhost:5000/api/repos/${id}/files`, {
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
      const res = await fetch(`http://localhost:5000/api/repos/${id}/files`, {
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

  const handleRunCode = async () => {
    if (!activeFile) return;
    setBottomPanelTab('terminal');
    setTerminalOutput(prev => prev + `\n> Running ${activeFile.path}...\n⚡ Compiling & Running via Gemini AI (this may take a few seconds)...\n`);
    
    try {
      const ext = activeFile.path.split('.').pop();
      const res = await fetch(`http://localhost:5000/api/ai/run`, {
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
      const res = await fetch(`http://localhost:5000/api/ai/${action}`, {
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
      const res = await fetch(`http://localhost:5000/api/ai/chat`, {
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
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  if (!repo) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className={`h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans overflow-hidden transition-all duration-300 ${isIntentMode ? 'ring-2 ring-inset ring-indigo-500' : ''}`}>
      
      {/* Global Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between shrink-0">
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
            <a href="#" className="hover:text-white transition-colors">Pull requests</a>
            <a href="#" className="hover:text-white transition-colors">Issues</a>
            <a href="#" className="hover:text-white transition-colors">Marketplace</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-[#8b949e] hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1">
            <Plus className="w-5 h-5" />
            <ChevronDown className="w-3 h-3" />
          </button>
          <button className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold border border-[#30363d] hover:border-zinc-400 cursor-pointer" onClick={logout}>
            {user?.username.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

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
          <button className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-medium text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d] transition-colors whitespace-nowrap">
            <GitPullRequest className="w-4 h-4" /> Pull requests
          </button>
          <button className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-medium text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d] transition-colors whitespace-nowrap">
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
          <button className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-medium text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d] transition-colors whitespace-nowrap">
            <Activity className="w-4 h-4" /> Insights
          </button>
          <button className="flex items-center gap-2 pb-2 border-b-2 border-transparent font-medium text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d] transition-colors whitespace-nowrap">
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
                  {repo.files?.map((file: any) => (
                    <button 
                      key={file.path}
                      onClick={() => handleFileSelect(file)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${activeFile?.path === file.path ? 'bg-[#238636]/10 text-[#58a6ff]' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-white'}`}
                    >
                      <FileText className="w-4 h-4 opacity-70" />
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
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
                      <button className="bg-[#21262d] text-[#c9d1d9] text-xs font-medium px-3 py-1.5 rounded-md border border-[#30363d] flex items-center gap-1.5 hover:bg-[#30363d]">
                        <Code className="w-4 h-4" /> CODE <ChevronDown className="w-3 h-3" />
                      </button>
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

      </div>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#6366f1] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4f46e5] transition-colors z-50">
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
