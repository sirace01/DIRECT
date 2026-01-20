
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TeacherModule from './components/TeacherModule';
import InventoryModule from './components/InventoryModule';
import ProposalView from './components/ProposalView';
import { analyzeNotifications } from './services/geminiService';
import { Notification, UserRole, Teacher, Task, ToolItem, LabConsumable, ItemAnalysis } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  // State Management - Initialized with empty arrays
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [consumables, setConsumables] = useState<LabConsumable[]>([]);
  const [analyses, setAnalyses] = useState<ItemAnalysis[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initial Data Load from API/Database
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [resTeachers, resTasks, resTools, resConsumables, resAnalyses] = await Promise.all([
          fetch('/api/teachers'),
          fetch('/api/tasks'),
          fetch('/api/inventory?type=tools'),
          fetch('/api/inventory?type=consumables'),
          fetch('/api/analyses')
        ]);

        const safeJson = async (res: Response) => {
          if (!res.ok) return null;
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return res.json();
          }
          return null;
        };

        const [dataTeachers, dataTasks, dataTools, dataConsumables, dataAnalyses] = await Promise.all([
          safeJson(resTeachers),
          safeJson(resTasks),
          safeJson(resTools),
          safeJson(resConsumables),
          safeJson(resAnalyses)
        ]);

        if (dataTeachers) setTeachers(dataTeachers);
        if (dataTasks) setTasks(dataTasks);
        if (dataTools) setTools(dataTools);
        if (dataConsumables) setConsumables(dataConsumables);
        if (dataAnalyses) setAnalyses(dataAnalyses);
        
        setDbConnected(true);

        // Smart Notifications via Gemini
        const alerts = await analyzeNotifications(dataConsumables || [], dataTasks || []);
        setNotifications(alerts);
      } catch (error) {
        console.error("Database connection failed:", error);
        setDbConnected(false);
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
    } catch (e) {
      console.error("Failed to sync task update to DB");
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
    } catch (e) {
      console.error("Failed to sync inventory update");
    }
  };

  const handleUpdateTool = async (id: string, condition: ToolItem['condition']) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, condition } : t));
    try {
      await fetch(`/api/inventory?type=tools&id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition })
      });
    } catch (e) {
      console.error("Failed to sync tool update");
    }
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
        setTeachers(prev => [savedTeacher, ...prev]);
      }
    } catch (e) {
      console.error("Failed to sync new teacher to DB");
      // Fallback for visual continuity if needed, but we prefer DB state
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if(window.confirm("Permanently delete this teacher profile?")) {
      try {
        const res = await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setTeachers(prev => prev.filter(t => t.id !== id));
        }
      } catch (e) {
        console.error("Failed to delete from DB");
      }
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
        setAnalyses(prev => [savedAnalysis, ...prev]);
        alert("Report generated and saved to database!");
      }
    } catch (e) {
      console.error("Failed to save simulation to DB");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Synchronizing with Neon Database...</p>
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
              {dbConnected ? 'Cloud Sync Active (Neon PostgreSQL).' : 'Cloud Sync Offline.'} Upload periodical test results to generate mastery charts and track student progress.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={handleUploadSimulation}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg"
              >
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
                <div className={`w-3 h-3 rounded-full mb-2 ${dbConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-xs text-indigo-700 italic font-medium text-center">
                  {dbConnected 
                    ? "Live Database: Neon PostgreSQL is connected." 
                    : "Error: Could not reach Neon PostgreSQL. Ensure DATABASE_URL is set."}
                </p>
              </div>
            </div>
          </div>
        );
      case 'inventory':
        return (
          <InventoryModule 
            tools={tools} 
            consumables={consumables} 
            onToolUpdate={handleUpdateTool} 
            onConsumableUpdate={handleUpdateConsumable} 
          />
        );
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
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      task.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">DUE {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <h4 className={`text-lg font-black text-gray-900 leading-tight mb-2 ${task.status === 'Done' ? 'line-through' : ''}`}>{task.title}</h4>
                  <p className="text-xs text-gray-500 mb-6">Assigned: <span className="font-bold text-gray-700">{task.assignedTo}</span></p>
                  <button 
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${
                      task.status === 'Done' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
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
