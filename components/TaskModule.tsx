
import React, { useState } from 'react';
import { Task } from '../types';

interface TaskModuleProps {
  tasks: Task[];
  onAdd: (task: Partial<Task>) => Promise<void>;
  onToggle: (id: string) => void;
}

const TaskModule: React.FC<TaskModuleProps> = ({ tasks, onAdd, onToggle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    deadline: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAdd(formData);
      setIsModalOpen(false);
      setFormData({ title: '', assignedTo: '', deadline: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert("Failed to save task. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Administrative Tasks</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          <span>Create New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No tasks found in registry.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 ${task.status === 'Done' ? 'border-green-100 opacity-75' : 'border-gray-100 hover:shadow-md'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${task.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {task.status}
                </span>
                <span className="text-[10px] font-bold text-gray-400">DUE {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              <h4 className={`text-lg font-black text-gray-900 leading-tight mb-2 ${task.status === 'Done' ? 'line-through' : ''}`}>{task.title}</h4>
              <p className="text-xs text-gray-500 mb-6">Assigned: <span className="font-bold text-gray-700">{task.assignedTo || 'Unassigned'}</span></p>
              <button onClick={() => onToggle(task.id)} className={`w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${task.status === 'Done' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {task.status === 'Done' ? 'Reopen Task' : 'Mark as Complete'}
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Task Title</label>
                <input 
                  required 
                  type="text" 
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Inventory Audit May 2024"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned To</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Science Faculty"
                  value={formData.assignedTo} 
                  onChange={e => setFormData({...formData, assignedTo: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deadline Date</label>
                <input 
                  required 
                  type="date" 
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.deadline} 
                  onChange={e => setFormData({...formData, deadline: e.target.value})} 
                />
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 text-sm"
                >
                  {isSaving ? 'Saving...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskModule;
