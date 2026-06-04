import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Layout, Columns, CheckSquare, Bug } from 'lucide-react';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('kanban');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Simulate project creation and return to home page
    alert(`Project "${name}" created with template ${template}!`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="border-b border-[#30363d] pb-6 mb-6">
          <h1 className="text-3xl font-semibold text-white tracking-tight">Create a new project</h1>
          <p className="text-[#8b949e] mt-2">
            A project is an adaptable spreadsheet, task-board, and roadmap that integrates with your issues and pull requests to help you plan and track your work.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
             <label className="block text-sm font-semibold text-white mb-2">Project board name <span className="text-red-400">*</span></label>
             <input
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full max-w-xl bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
               autoFocus
             />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description <span className="text-[#8b949e] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full max-w-xl bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-white mb-4">Template</label>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               
               <div 
                 onClick={() => setTemplate('kanban')}
                 className={`border rounded-xl p-4 cursor-pointer transition-colors ${template === 'kanban' ? 'border-[#58a6ff] bg-[#58a6ff]/10' : 'border-[#30363d] bg-[#161b22] hover:border-[#8b949e]'}`}
               >
                  <Columns className="w-8 h-8 text-[#58a6ff] mb-3" />
                  <h3 className="font-semibold text-white mb-1">Basic Kanban</h3>
                  <p className="text-xs text-[#8b949e]">Track tasks across To Do, In Progress, and Done columns.</p>
               </div>

               <div 
                 onClick={() => setTemplate('roadmap')}
                 className={`border rounded-xl p-4 cursor-pointer transition-colors ${template === 'roadmap' ? 'border-[#2ea043] bg-[#2ea043]/10' : 'border-[#30363d] bg-[#161b22] hover:border-[#8b949e]'}`}
               >
                  <Layout className="w-8 h-8 text-[#2ea043] mb-3" />
                  <h3 className="font-semibold text-white mb-1">Roadmap</h3>
                  <p className="text-xs text-[#8b949e]">Plan and track major releases over a timeline.</p>
               </div>

               <div 
                 onClick={() => setTemplate('bug')}
                 className={`border rounded-xl p-4 cursor-pointer transition-colors ${template === 'bug' ? 'border-[#f85149] bg-[#f85149]/10' : 'border-[#30363d] bg-[#161b22] hover:border-[#8b949e]'}`}
               >
                  <Bug className="w-8 h-8 text-[#f85149] mb-3" />
                  <h3 className="font-semibold text-white mb-1">Bug Triage</h3>
                  <p className="text-xs text-[#8b949e]">Prioritize, assign, and resolve incoming bugs effectively.</p>
               </div>
               
             </div>
          </div>

          <div className="border-t border-[#30363d] pt-6 mt-8">
            <button
              type="submit"
              disabled={!name.trim()}
              className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-md transition-colors flex items-center gap-2"
            >
               Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
