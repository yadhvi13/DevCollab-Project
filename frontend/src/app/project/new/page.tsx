"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Layout, Columns, Bug } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function NewProject() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('kanban');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    alert(`Project "${name}" created with template ${template}!`);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="border-b border-[#2d2623] pb-6 mb-6">
          <h1 className="text-3xl font-semibold text-white tracking-tight">Create a new project</h1>
          <p className="text-[#8b949e] mt-2">
            A project is an adaptable spreadsheet, task-board, and roadmap that integrates with your issues and pull requests to help you plan and track your work.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
             <label className="block text-sm font-semibold text-white mb-2">Project board name <span className="text-red-400">*</span></label>
             <Input
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
                className="w-full max-w-xl bg-zinc-950 border border-[#2d2623] text-white focus-visible:ring-indigo-500/50 h-[40px]"
               autoFocus
             />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description <span className="text-[#8b949e] font-normal">(optional)</span>
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full max-w-xl bg-zinc-950 border border-[#2d2623] text-white focus-visible:ring-indigo-500/50 h-[40px]"
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-white mb-4">Template</label>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               
               <div 
                 onClick={() => setTemplate('kanban')}
                  className={`border rounded-xl p-4 cursor-pointer transition-colors ${template === 'kanban' ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#2d2623] bg-zinc-950 hover:border-[#e79e6b]/40'}`}
                >
                   <Columns className="w-8 h-8 text-indigo-500 mb-3" />
                  <h3 className="font-semibold text-white mb-1">Basic Kanban</h3>
                  <p className="text-xs text-[#8b949e]">Track tasks across To Do, In Progress, and Done columns.</p>
               </div>

               <div 
                 onClick={() => setTemplate('roadmap')}
                  className={`border rounded-xl p-4 cursor-pointer transition-colors ${template === 'roadmap' ? 'border-[#2ea043] bg-[#2ea043]/10' : 'border-[#2d2623] bg-zinc-950 hover:border-[#e79e6b]/40'}`}
               >
                  <Layout className="w-8 h-8 text-[#2ea043] mb-3" />
                  <h3 className="font-semibold text-white mb-1">Roadmap</h3>
                  <p className="text-xs text-[#8b949e]">Plan and track major releases over a timeline.</p>
               </div>

               <div 
                 onClick={() => setTemplate('bug')}
                  className={`border rounded-xl p-4 cursor-pointer transition-colors ${template === 'bug' ? 'border-[#f85149] bg-[#f85149]/10' : 'border-[#2d2623] bg-zinc-950 hover:border-[#e79e6b]/40'}`}
               >
                  <Bug className="w-8 h-8 text-[#f85149] mb-3" />
                  <h3 className="font-semibold text-white mb-1">Bug Triage</h3>
                  <p className="text-xs text-[#8b949e]">Prioritize, assign, and resolve incoming bugs effectively.</p>
               </div>
               
             </div>
          </div>

          <div className="border-t border-[#2d2623] pt-6 mt-8">
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-indigo-500 hover:bg-indigo-500/90 text-zinc-950 font-bold border-none cursor-pointer rounded-full px-5 shadow-[0_0_10px_rgba(231,158,107,0.25)]"
            >
               Create project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <ProtectedRoute>
      <NewProject />
    </ProtectedRoute>
  );
}
