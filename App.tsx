
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TeacherModule from './components/TeacherModule';
import InventoryModule from './components/InventoryModule';
import TaskModule from './components/TaskModule';
import ProposalView from './components/ProposalView';
import SQLEditor from './components/SQLEditor';
import { analyzeNotifications } from './services/geminiService';
import { sql, getDatabaseUrl, setDatabaseUrl } from './api/db';
import { Notification, UserRole, Teacher, Task, ToolItem, LabConsumable, ItemAnalysis } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState('');

  // State Management
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [consumables, setConsumables] = useState<LabConsumable[]>([]);
  const [analyses, setAnalyses] = useState<ItemAnalysis[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadAllData = async () => {
    const currentUrl = getDatabaseUrl();
    if (!currentUrl) {
      setSetupMode(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSetupMode(false);
    
    try {
      const [dbTeachers, dbTasks, dbTools, dbConsumables, dbAnalyses] = await Promise.all([
        sql`SELECT * FROM teachers ORDER BY "lastName" ASC`,
        sql`SELECT * FROM tasks ORDER BY deadline ASC`,
        sql`SELECT * FROM tools ORDER BY name ASC`,
        sql`SELECT * FROM consumables ORDER BY name ASC`,
        sql`SELECT * FROM analyses ORDER BY created_at DESC`
      ]);

      setTeachers(dbTeachers.map((t: any) => ({ ...t, id: String(t.id) })) as Teacher[]);
      setTasks(dbTasks.map((t: any) => ({ ...t, id: String(t.id) })) as Task[]);
      setTools(dbTools.map((t: any) => ({ ...t, id: String(t.id) })) as ToolItem[]);
      setConsumables(dbConsumables.map((c: any) => ({ ...c, id: String(c.id) })) as LabConsumable[]);
      setAnalyses(dbAnalyses.map((a: any) => ({ 
        ...a, 
        id: String(a.id),
        responses: typeof a.responses === 'string' ? JSON.parse(a.responses) : a.responses
      })) as ItemAnalysis[]);
      
      setDbConnected(true);
      const alerts = await analyzeNotifications(dbConsumables, dbTasks);
      setNotifications(alerts);
    } catch (err: any) {
      console.error("Connection Failed:", err);
      setDbConnected(false);
      setError(err.message || "Failed to establish a connection to the database cluster.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = tempUrl.trim();
    if (!cleanUrl.startsWith('postgres://') && !cleanUrl.startsWith('postgresql://')) {
      setError("Invalid Protocol. Connection string must start with 'postgres://' or 'postgresql://'");
      return;
    }
    setDatabaseUrl(cleanUrl);
    window.location.reload(); 
  };

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

  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const saved = await res.json();
        setTasks(prev => [{ ...saved, id: String(saved.id) }, ...prev]);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Save failed");
      }
    } catch (e) {
      console.error("Save Task Error:", e);
      throw e;
    }
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
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save to database");
      }
    } catch (e: any) {
      console.error("Sync Error:", e);
      alert("Error saving teacher: " + e.message);
      throw e;
    }
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
    const simulationData = {
      gradeLevel: Math.floor(Math.random() * 6) + 7,
      specialization: 'TVL - ICT',
      quarter: (Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4,
      totalQuestions: 10,
      responses: Array.from({ length: 10 }, (_, i) => ({
        questionNo: i + 1,
        correctCount: Math.floor(Math.random() * 40) + 10,
        totalExaminees: 50
      }))
    };

    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulationData)
      });
      if (res.ok) {
        const saved = await res.json();
        setAnalyses(prev => [{ 
          ...saved, 
          id: String(saved.id),
          responses: typeof saved.responses === 'string' ? JSON.parse(saved.responses) : saved.responses
        }, ...prev]);
        alert("Simulation report generated and saved to Neon!");
      }
    } catch (e) {
      console.error("Simulation Error:", e);
    }
  };

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
                <p className="text-xs text-indigo-700 italic font-medium text-center">Live: Cloud Connection Active</p>
              </div>
            </div>
          </div>
        );
      case 'inventory':
        return <InventoryModule tools={tools} consumables={consumables} onToolUpdate={handleUpdateTool} onConsumableUpdate={handleUpdateConsumable} />;
      case 'tasks':
        return <TaskModule tasks={tasks} onAdd={handleAddTask} onToggle={handleToggleTask} />;
      case 'proposal':
        return <ProposalView />;
      case 'sql-editor':
        return <SQLEditor />;
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
