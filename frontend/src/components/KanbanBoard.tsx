"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import { API_BASE_URL } from '@/config';

interface Task {
  id: string;
  column: 'todo' | 'in-progress' | 'done';
  title: string;
  desc: string;
  author: string;
}

const SortableTask = ({ task }: { task: Task }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 mb-2 cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-colors">
      <h4 className="text-sm font-medium text-zinc-200">{task.title}</h4>
      {task.desc && <p className="text-xs text-zinc-400 mt-1">{task.desc}</p>}
    </div>
  );
};

export default function KanbanBoard({ repoId, initialKanban }: { repoId: string, initialKanban: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialKanban || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { user, token } = useAuth();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const saveKanban = async (newTasks: Task[]) => {
    try {
      await fetch(`${API_BASE_URL}/api/repos/${repoId}/kanban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ kanban: newTasks })
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        saveKanban(newItems);
        return newItems;
      });
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      column: 'todo',
      title: newTaskTitle,
      desc: '',
      author: user.username
    };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    setNewTaskTitle('');
    saveKanban(newTasks);
  };

  const todoTasks = tasks.filter(t => t.column === 'todo');
  const inProgressTasks = tasks.filter(t => t.column === 'in-progress');
  const doneTasks = tasks.filter(t => t.column === 'done');

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="p-3 border-b border-[#2d2623] bg-zinc-950">
        <form onSubmit={addTask} className="flex gap-2">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add new task..." 
            className="flex-1 bg-zinc-900 border border-[#2d2623] rounded-full py-1.5 px-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-[#c9d1d9] transition-all placeholder-zinc-500"
          />
          <button type="submit" className="bg-indigo-500 text-zinc-950 p-1.5 rounded-full hover:bg-indigo-400 cursor-pointer transition-all flex items-center justify-center shadow-[0_0_10px_rgba(231,158,107,0.2)] active:scale-95 h-[34px] w-[34px] border-none"><Plus className="w-5 h-5 text-zinc-950"/></button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          
          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-[#2d2623] shadow-lg">
            <h3 className="text-xs font-extrabold text-zinc-400 mb-3 uppercase tracking-wider">To Do</h3>
            <SortableContext items={todoTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {todoTasks.map(task => <SortableTask key={task.id} task={task} />)}
            </SortableContext>
          </div>

          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-[#2d2623] shadow-lg">
            <h3 className="text-xs font-extrabold text-indigo-500 mb-3 uppercase tracking-wider">In Progress</h3>
            <SortableContext items={inProgressTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {inProgressTasks.map(task => <SortableTask key={task.id} task={task} />)}
            </SortableContext>
          </div>

          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-[#2d2623] shadow-lg">
            <h3 className="text-xs font-extrabold text-amber-500 mb-3 uppercase tracking-wider">Done</h3>
            <SortableContext items={doneTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {doneTasks.map(task => <SortableTask key={task.id} task={task} />)}
            </SortableContext>
          </div>

        </DndContext>
      </div>
    </div>
  );
}
