import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';
import { API_BASE_URL } from '../config';

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
        
        // If moving across columns (this is a simple implementation, typically requires multiple sortable contexts for strict column movement, but this allows reordering visually and we infer column based on drop zone in more complex setups. For simplicity, we keep column state unless explicitly dragged into a drop zone, but sortable doesn't handle column crossing easily without multiple contexts. Let's just update the array order for now).
        saveKanban(newItems);
        return newItems;
      });
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
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
      <div className="p-3 border-b border-zinc-800">
        <form onSubmit={addTask} className="flex gap-2">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add task..." 
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded py-1 px-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 p-1.5 rounded text-white hover:bg-indigo-500"><Plus className="w-4 h-4"/></button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">To Do</h3>
            <SortableContext items={todoTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {todoTasks.map(task => <SortableTask key={task.id} task={task} />)}
            </SortableContext>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
            <h3 className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-wider">In Progress</h3>
            <SortableContext items={inProgressTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {inProgressTasks.map(task => <SortableTask key={task.id} task={task} />)}
            </SortableContext>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
            <h3 className="text-xs font-bold text-emerald-500 mb-3 uppercase tracking-wider">Done</h3>
            <SortableContext items={doneTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {doneTasks.map(task => <SortableTask key={task.id} task={task} />)}
            </SortableContext>
          </div>

        </DndContext>
      </div>
    </div>
  );
}
