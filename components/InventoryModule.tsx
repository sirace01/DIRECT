
import React, { useState } from 'react';
import { ToolItem, LabConsumable } from '../types';

interface InventoryModuleProps {
  tools: ToolItem[];
  consumables: LabConsumable[];
  onToolUpdate: (id: string, condition: ToolItem['condition']) => void;
  onConsumableUpdate: (id: string, amount: number) => void;
  onAddTool: (tool: Partial<ToolItem>) => Promise<void>;
  onAddConsumable: (item: Partial<LabConsumable>) => Promise<void>;
}

const InventoryModule: React.FC<InventoryModuleProps> = ({ 
  tools, 
  consumables, 
  onToolUpdate, 
  onConsumableUpdate,
  onAddTool,
  onAddConsumable
}) => {
  const [view, setView] = useState<'TOOLS' | 'LAB'>('TOOLS');
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Item States with explicit typing to satisfy ToolItem['condition'] union
  const [toolForm, setToolForm] = useState<{
    name: string;
    serialNumber: string;
    condition: ToolItem['condition'];
  }>({ 
    name: '', 
    serialNumber: '', 
    condition: 'Good' 
  });
  
  const [labForm, setLabForm] = useState({ 
    name: '', 
    quantity: 0, 
    unit: 'pcs', 
    expiryDate: '', 
    location: '' 
  });

  const handleToolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddTool(toolForm);
      setIsToolModalOpen(false);
      setToolForm({ name: '', serialNumber: '', condition: 'Good' });
    } finally { setIsSaving(false); }
  };

  const handleLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddConsumable(labForm);
      setIsLabModalOpen(false);
      setLabForm({ name: '', quantity: 0, unit: 'pcs', expiryDate: '', location: '' });
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200">
        <div className="flex">
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
            Laboratory Consumables
          </button>
        </div>
        
        <button 
          onClick={() => view === 'TOOLS' ? setIsToolModalOpen(true) : setIsLabModalOpen(true)}
          className="mb-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg"
        >
          {view === 'TOOLS' ? 'Add New Tool' : 'Add New Consumable'}
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tools.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic text-sm">No tools registered in database.</td></tr>
              ) : tools.map((tool) => (
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
                    {tool.borrower || 'Available in Lab'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => alert("History functional in SQL Console")} className="text-indigo-600 hover:text-indigo-900 font-bold">View History</button>
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
              {consumables.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic text-sm">No consumables registered in database.</td></tr>
              ) : consumables.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-black ${item.quantity < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                      {item.expiryDate || 'N/A'}
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

      {/* Tool Modal */}
      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Register New Equipment</h3>
            <form onSubmit={handleToolSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asset Name</label>
                <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Serial Number</label>
                <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={toolForm.serialNumber} onChange={e => setToolForm({...toolForm, serialNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Condition</label>
                <select 
                  className="w-full border rounded-lg p-2 text-sm" 
                  value={toolForm.condition} 
                  onChange={e => setToolForm({...toolForm, condition: e.target.value as ToolItem['condition']})}
                >
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Defective">Defective</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsToolModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm">{isSaving ? 'Saving...' : 'Add Tool'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Modal */}
      {isLabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add Lab Consumable</h3>
            <form onSubmit={handleLabSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={labForm.name} onChange={e => setLabForm({...labForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                  <input required type="number" className="w-full border rounded-lg p-2 text-sm" value={labForm.quantity} onChange={e => setLabForm({...labForm, quantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                  <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={labForm.unit} placeholder="pcs, meters, etc" onChange={e => setLabForm({...labForm, unit: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                <input type="date" className="w-full border rounded-lg p-2 text-sm" value={labForm.expiryDate} onChange={e => setLabForm({...labForm, expiryDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Storage Location</label>
                <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={labForm.location} placeholder="e.g. Cabinet B-1" onChange={e => setLabForm({...labForm, location: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsLabModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm">{isSaving ? 'Saving...' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModule;
