
import React from 'react';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, role }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'teachers', label: 'Teacher Profiles', icon: Icons.Teachers },
    { id: 'analysis', label: 'Item Analysis', icon: Icons.ItemAnalysis },
    { id: 'inventory', label: 'Inventory', icon: Icons.Inventory },
    { id: 'tasks', label: 'Task Module', icon: Icons.Tasks },
    { id: 'proposal', label: 'Innovation Proposal', icon: Icons.Proposal },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex-shrink-0">
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-indigo-200">PROJECT D.I.R.E.C.T.</h1>
            <p className="text-xs text-indigo-400 mt-1 uppercase tracking-widest font-semibold">School Admin Suite</p>
          </div>
          
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-700 text-white' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <item.icon />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-indigo-800">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
                {role === 'ADMIN' ? 'AD' : 'TC'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{role === 'ADMIN' ? 'Principal Office' : 'Faculty Member'}</p>
                <p className="text-xs text-indigo-400 truncate">{role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Sign Out</button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
