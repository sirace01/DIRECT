
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TeacherModule from './components/TeacherModule';
import InventoryModule from './components/InventoryModule';
import ProposalView from './components/ProposalView';
import { analyzeNotifications } from './services/geminiService';
import { sql } from './api/db';
import { Notification, UserRole, Teacher, Task, ToolItem, LabConsumable, ItemAnalysis } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State Management
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [consumables, setConsumables] = useState<LabConsumable[]>([]);
  const [analyses, setAnalyses] = useState<ItemAnalysis[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Direct Database Load
        const [dbTeachers, dbTasks, dbTools, dbConsumables, dbAnalyses] = await Promise.all([
          sql`SELECT * FROM teachers ORDER BY "lastName" ASC`,
          sql`SELECT * FROM tasks ORDER BY deadline ASC`,
          sql`SELECT * FROM tools ORDER BY name ASC`,
          sql`SELECT * FROM consumables ORDER BY name ASC`,
          sql`SELECT * FROM analyses ORDER BY created_at DESC`
        ]);

        const mappedTeachers = dbTeachers.map(t => ({ ...t, id: String(t.id) })) as Teacher[];
        const mappedTasks = dbTasks.map(t => ({ ...t, id: String(t.id) })) as Task[];
        const mappedTools = dbTools.map(t => ({ ...t, id: String(t.id) })) as ToolItem[];
        const mappedConsumables = dbConsumables.map(c => ({ ...c, id: String(c.id) })) as LabConsumable[];
        const mappedAnalyses = dbAnalyses.map(a => ({ 
          ...a, 
          id: String(a.id),
          responses: typeof a.responses === 'string' ? JSON.parse(a.responses) : a.responses
        })) as ItemAnalysis[];

        setTeachers(mappedTeachers);
        setTasks(mappedTasks);
        setTools(mappedTools);
        setConsumables(mappedConsumables);
        setAnalyses(mappedAnalyses);
        
        setDbConnected(true);

        const alerts = await analyzeNotifications(mappedConsumables, mappedTasks);
        setNotifications(alerts);
      } catch (err: any) {
        console.error("System Bootstrap Failed:", err);
        setDbConnected(false);
        setError(err.message || "Failed to establish a connection to the database.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'Pending' ? 'Done' : 'Pending';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await fetch(`/api/tasks?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) { console.error("Sync Error:", e); }
  };

  const handleUpdateConsumable = async (id: string, amount: number) => {
    const item = consumables.find(c => c.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + amount);
    setConsumables(prev => prev.map(c => c.id === id ? { ...c, quantity: newQty } : c));
    try {
      await fetch(`/api/inventory?type=consumables&id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
    } catch (e) { console.error("Sync Error:", e); }
  };

  const handleUpdateTool = async (id: string, condition: ToolItem['condition']) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, condition } : t));
    try {
      await fetch(`/api/inventory?type=tools&id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition })
      });
    } catch (e) { console.error("Sync Error:", e); }
  };

  const handleAddTeacher = async (newTeacher: Teacher) => {
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher)
      });
      if (res.ok) {
        const savedTeacher = await res.json();
        setTeachers(prev => [ { ...savedTeacher, id: String(savedTeacher.id) }, ...prev]);
      }
    } catch (e) { console.error("Sync Error:", e); }
  };

  const handleDeleteTeacher = async (id: string) => {
    if(window.confirm("Permanently delete this teacher profile?")) {
      try {
        const res = await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setTeachers(prev => prev.filter(t => t.id !== id));
        }
      } catch (e) { console.error("Sync Error:", e); }
    }
  };

  const handleUploadSimulation = async () => {
    const newAnalysis = {
      gradeLevel: 12,
      specialization: 'TVL - ICT',
      quarter: 2,
      totalQuestions: 10,
      responses: Array.from({length: 10}, (_, i) => ({
        questionNo: i + 1,
        correctCount: Math.floor(Math.random() * 40),
        totalExaminees: 40
      }))
    };
    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnalysis)
      });
      if (res.ok) {
        const savedAnalysis = await res.json();
        setAnalyses(prev => [{ ...savedAnalysis, id: String(savedAnalysis.id) }, ...prev]);
        alert("Report generated and saved to database!");
      }
    } catch (e) { console.error("Sync Error:", e); }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Establishing Direct Link to Neon PostgreSQL...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration Required</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 p-4 rounded-xl text-left mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Instructions:</p>
            <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
              <li>Open your project settings in <b>Vercel</b>.</li>
              <li>Go to <b>Environment Variables</b>.</li>
              <li>Add <code>DATABASE_URL</code> with your Neon connection string.</li>
              <li>Redeploy your application.</li>
            </ul>
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard notifications={notifications} teachers={teachers} tasks={tasks} analyses={analyses} />;
      case 'teachers':
        return <TeacherModule teachers={teachers} onAdd={handleAddTeacher} onDelete={handleDeleteTeacher} />;
      case 'analysis':
        return (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Item Analysis Engine</h3>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Direct Database Connection Active. Data is fetched directly from your Neon PostgreSQL cluster.
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={handleUploadSimulation} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg">
                Upload & Generate Simulation Report
              </button>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="p-6 border border-gray-100 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest text-indigo-600">Report Registry</h4>
                <ul className="space-y-3">
                  {analyses.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No reports found in database.</p>
                  ) : (
                    analyses.map(a => (
                      <li key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                        <span className="text-sm text-gray-700 font-bold">Grade {a.gradeLevel} - {a.specialization} (Q{a.quarter})</span>
                        <button className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">View Results</button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="p-6 border border-gray-100 rounded-lg bg-indigo-50 flex flex-col items-center justify-center">
                <div className="w-3 h-3 rounded-full mb-2 bg-green-500"></div>
                <p className="text-xs text-indigo-700 italic font-medium text-center">Live: Frontend is connected directly to Neon.</p>
              </div>
            </div>
          </div>
        );
      case 'inventory':
        return <InventoryModule tools={tools} consumables={consumables} onToolUpdate={handleUpdateTool} onConsumableUpdate={handleUpdateConsumable} />;
      case 'tasks':
        return (
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
                  <p className="text-xs text-gray-500 mb-6">Assigned: <span className="font-bold text-gray-700">{task.assignedTo}</span></p>
                  <button onClick={() => handleToggleTask(task.id)} className={`w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${task.status === 'Done' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                    {task.status === 'Done' ? 'Reopen' : 'Complete'}
                  </button>
                </div>
              ))
            )}
          </div>
        );
      case 'proposal':
        return <ProposalView />;
      default:
        return <Dashboard notifications={notifications} teachers={teachers} tasks={tasks} analyses={analyses} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={role}>
      {renderContent()}
    </Layout>
  );
};

export default App;
