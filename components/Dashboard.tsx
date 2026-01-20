
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Teacher, ItemAnalysis, Task, Notification } from '../types';

interface DashboardProps {
  notifications: Notification[];
  teachers: Teacher[];
  tasks: Task[];
  analyses: ItemAnalysis[];
}

const Dashboard: React.FC<DashboardProps> = ({ notifications, teachers, tasks, analyses }) => {
  // Use the most recent analysis for the chart
  const activeAnalysis = analyses[0];
  const masteryData = activeAnalysis ? activeAnalysis.responses.map(r => ({
    question: `Q${r.questionNo}`,
    percentage: Math.round((r.correctCount / r.totalExaminees) * 100)
  })) : [];

  const stats = [
    { label: 'Total Teachers', value: teachers.length, color: 'bg-indigo-600' },
    { label: 'Active Tasks', value: tasks.filter(t => t.status === 'Pending').length, color: 'bg-amber-500' },
    { label: 'Smart Alerts', value: notifications.length, color: 'bg-rose-500' },
    { label: 'Reports Gen.', value: analyses.length, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Learning Mastery Analysis</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {activeAnalysis ? `Grade ${activeAnalysis.gradeLevel} - Q${activeAnalysis.quarter}` : 'No Data'}
            </span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="question" axisLine={false} tickLine={false} />
                <YAxis unit="%" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} barSize={40}>
                  {masteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage < 50 ? '#f43f5e' : entry.percentage < 75 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Smart Notifications</h3>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">{notifications.length} Active</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-bold">System Clear</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`p-4 rounded-xl border-l-4 transition-all hover:translate-x-1 ${
                  notif.severity === 'high' ? 'bg-rose-50 border-rose-500 text-rose-700' : 
                  notif.severity === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-700' : 
                  'bg-blue-50 border-blue-500 text-blue-700'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest">{notif.type}</span>
                  </div>
                  <p className="text-sm font-bold leading-tight">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
