
import React, { useState } from 'react';
import { ToolItem, LabConsumable } from '../types';

interface InventoryModuleProps {
  tools: ToolItem[];
  consumables: LabConsumable[];
  onToolUpdate: (id: string, condition: ToolItem['condition']) => void;
  onConsumableUpdate: (id: string, amount: number) => void;
}

const InventoryModule: React.FC<InventoryModuleProps> = ({ tools, consumables, onToolUpdate, onConsumableUpdate }) => {
  const [view, setView] = useState<'TOOLS' | 'LAB'>('TOOLS');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setView('TOOLS')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            view === 'TOOLS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tools & Equipment
        </button>
        <button
          onClick={() => setView('LAB')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            view === 'LAB' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Laboratory Inventory
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        {view === 'TOOLS' ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Asset Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Serial No.</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Borrower</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{tool.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tool.serialNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={tool.condition}
                      onChange={(e) => onToolUpdate(tool.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase border-none focus:ring-0 cursor-pointer ${
                        tool.condition === 'Good' ? 'bg-green-100 text-green-700' : 
                        tool.condition === 'Fair' ? 'bg-yellow-100 text-yellow-700' : 
                        tool.condition === 'Defective' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Defective">Defective</option>
                      <option value="Under Maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                    {tool.borrower || 'Available'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => alert("Log view for " + tool.name)} className="text-indigo-600 hover:text-indigo-900 font-bold">View History</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Storage</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consumables.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-black ${item.quantity < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${new Date(item.expiryDate) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                      {item.expiryDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => onConsumableUpdate(item.id, -1)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-bold"
                    >
                      Use 1
                    </button>
                    <button 
                      onClick={() => onConsumableUpdate(item.id, 5)}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors font-bold"
                    >
                      Restock +5
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryModule;
