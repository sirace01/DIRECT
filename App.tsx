
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
import { Notification, UserRole, Teacher, Task, ToolItem, LabConsumable, ItemAnalysis, Laboratory } from './types';

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
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
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
      const [dbTeachers, dbTasks, dbTools, dbConsumables, dbAnalyses, dbLabs] = await Promise.all([
        sql`SELECT * FROM teachers ORDER BY "lastName" ASC`,
        sql`SELECT * FROM tasks ORDER BY deadline ASC`,
        sql`SELECT * FROM tools ORDER BY name ASC`,
        sql`SELECT * FROM consumables ORDER BY name ASC`,
        sql`SELECT * FROM analyses ORDER BY created_at DESC`,
        sql`SELECT * FROM laboratories ORDER BY name ASC`
      ]);

      setTeachers(dbTeachers.map((t: any) => ({ ...t, id: String(t.id) })) as Teacher[]);
      setTasks(dbTasks.map((t: any) => ({ ...t, id: String(t.id) })) as Task[]);
      setTools(dbTools.map((t: any) => ({ ...t, id: String(t.id), labId: String(t.labId) })) as ToolItem[]);
      setConsumables(dbConsumables.map((c: any) => ({ ...c, id: String(c.id), labId: String(c.labId) })) as LabConsumable[]);
      setAnalyses(dbAnalyses.map((a: any) => ({ 
        ...a, 
        id: String(a.id),
        responses: typeof a.responses === 'string' ? JSON.parse(a.responses) : a.responses
      })) as ItemAnalysis[]);
      setLaboratories(dbLabs.map((l: any) => ({ ...l, id: String(l.id) })) as Laboratory[]);
      
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

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'Pending' ? 'Done' : 'Pending';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await sql`UPDATE tasks SET status = ${newStatus} WHERE id = ${Number(id)}`;
    } catch (e) { 
      console.error("Sync Error:", e);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: task.status } : t));
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const result = await sql`
        INSERT INTO tasks ("title", "assignedTo", "deadline", "status")
        VALUES (${taskData.title}, ${taskData.assignedTo}, ${taskData.deadline}, 'Pending')
        RETURNING *`;
      const saved = result[0];
      setTasks(prev => [{ ...saved, id: String(saved.id) }, ...prev]);
    } catch (e: any) {
      console.error("Save Task Error:", e);
      alert("Error saving task: " + e.message);
      throw e;
    }
  };

  const handleAddLab = async (lab: Partial<Laboratory>) => {
    try {
      const result = await sql`
        INSERT INTO laboratories ("name", "building", "floor", "condition", "status")
        VALUES (${lab.name}, ${lab.building}, ${lab.floor}, ${lab.condition || 'Functional'}, ${lab.status || 'Available'})
        RETURNING *`;
      const saved = result[0];
      setLaboratories(prev => [...prev, { ...saved, id: String(saved.id) }]);
    } catch (e: any) {
      alert("Error adding lab: " + e.message);
    }
  };

  const handleAddTool = async (tool: Partial<ToolItem>) => {
    try {
      const result = await sql`
        INSERT INTO tools ("labId", "name", "serialNumber", "condition")
        VALUES (${Number(tool.labId)}, ${tool.name}, ${tool.serialNumber}, ${tool.condition || 'Good'})
        RETURNING *`;
      const saved = result[0];
      setTools(prev => [{ ...saved, id: String(saved.id), labId: String(saved.labId) }, ...prev]);
    } catch (e: any) {
      console.error("Add Tool Error:", e);
      alert("Error adding tool: " + e.message);
      throw e;
    }
  };

  const handleAddConsumable = async (item: Partial<LabConsumable>) => {
    try {
      const result = await sql`
        INSERT INTO consumables ("labId", "name", "quantity", "unit", "expiryDate", "location")
        VALUES (${Number(item.labId)}, ${item.name}, ${Number(item.quantity) || 0}, ${item.unit}, ${item.expiryDate}, ${item.location})
        RETURNING *`;
      const saved = result[0];
      setConsumables(prev => [{ ...saved, id: String(saved.id), labId: String(saved.labId) }, ...prev]);
    } catch (e: any) {
      console.error("Add Consumable Error:", e);
      alert("Error adding consumable: " + e.message);
      throw e;
    }
  };

  const handleUpdateConsumable = async (id: string, amount: number) => {
    const item = consumables.find(c => c.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + amount);
    setConsumables(prev => prev.map(c => c.id === id ? { ...c, quantity: newQty } : c));
    try {
      await sql`UPDATE consumables SET "quantity" = ${newQty} WHERE id = ${Number(id)}`;
    } catch (e) { 
      console.error("Sync Error:", e);
      setConsumables(prev => prev.map(c => c.id === id ? { ...c, quantity: item.quantity } : c));
    }
  };

  const handleUpdateTool = async (id: string, condition: ToolItem['condition']) => {
    const tool = tools.find(t => t.id === id);
    if (!tool) return;
    setTools(prev => prev.map(t => t.id === id ? { ...t, condition } : t));
    try {
      await sql`UPDATE tools SET "condition" = ${condition} WHERE id = ${Number(id)}`;
    } catch (e) { 
      console.error("Sync Error:", e);
      setTools(prev => prev.map(t => t.id === id ? { ...t, condition: tool.condition } : t));
    }
  };

  const handleAddTeacher = async (t: Teacher) => {
    try {
      const result = await sql`
        INSERT INTO teachers (
          "firstName", "middleName", "lastName", "suffix", "empNo", 
          "contact", "address", "dob", "subjectTaught", "yearsTeachingSubject", 
          "tesdaQualifications", "position", "educationBS", "educationMA", "educationPhD", "yearsInService"
        ) VALUES (
          ${t.firstName}, ${t.middleName}, ${t.lastName}, ${t.suffix}, ${t.empNo},
          ${t.contact}, ${t.address}, ${t.dob}, ${t.subjectTaught}, ${t.yearsTeachingSubject},
          ${t.tesdaQualifications || []}, ${t.position}, ${t.educationBS}, ${t.educationMA}, ${t.educationPhD}, ${t.yearsInService}
        ) RETURNING *`;
      const saved = result[0];
      setTeachers(prev => [{ ...saved, id: String(saved.id) }, ...prev]);
    } catch (e: any) {
      console.error("Sync Error:", e);
      alert("Error saving teacher: " + e.message);
      throw e;
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if(window.confirm("Permanently delete this teacher profile?")) {
      try {
        await sql`DELETE FROM teachers WHERE id = ${Number(id)}`;
        setTeachers(prev => prev.filter(t => t.id !== id));
      } catch (e) { console.error("Sync Error:", e); }
    }
  };

  const handleUploadSimulation = async () => {
    const responses = Array.from({ length: 10 }, (_, i) => ({
      questionNo: i + 1,
      correctCount: Math.floor(Math.random() * 40) + 10,
      totalExaminees: 50
    }));

    try {
      const result = await sql`
        INSERT INTO analyses ("gradeLevel", "specialization", "quarter", "totalQuestions", "responses")
        VALUES (${7 + Math.floor(Math.random()*6)}, 'TVL - ICT', ${Math.floor(Math.random()*4)+1}, 10, ${JSON.stringify(responses)})
        RETURNING *`;
      const saved = result[0];
      setAnalyses(prev => [{ 
        ...saved, 
        id: String(saved.id),
        responses: typeof saved.responses === 'string' ? JSON.parse(saved.responses) : saved.responses
      }, ...prev]);
      alert("Simulation report generated and saved to Neon!");
    } catch (e: any) {
      console.error("Simulation Error:", e);
      alert("Failed to save analysis: " + e.message);
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
              Direct Database Connection Active. Data is synchronized directly with your Neon Cloud PostgreSQL instance.
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
        return (
          <InventoryModule 
            laboratories={laboratories}
            tools={tools} 
            consumables={consumables} 
            onToolUpdate={handleUpdateTool} 
            onConsumableUpdate={handleUpdateConsumable}
            onAddTool={handleAddTool}
            onAddConsumable={handleAddConsumable}
            onAddLab={handleAddLab}
          />
        );
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
