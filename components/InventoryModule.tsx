
import React, { useState } from 'react';
import { ToolItem, LabConsumable, Laboratory } from '../types';

interface InventoryModuleProps {
  laboratories: Laboratory[];
  tools: ToolItem[];
  consumables: LabConsumable[];
  onToolUpdate: (id: string, condition: ToolItem['condition']) => void;
  onConsumableUpdate: (id: string, amount: number) => void;
  onAddTool: (tool: Partial<ToolItem>) => Promise<void>;
  onAddConsumable: (item: Partial<LabConsumable>) => Promise<void>;
  onAddLab: (lab: Partial<Laboratory>) => Promise<void>;
}

const InventoryModule: React.FC<InventoryModuleProps> = ({ 
  laboratories,
  tools, 
  consumables, 
  onToolUpdate, 
  onConsumableUpdate,
  onAddTool,
  onAddConsumable,
  onAddLab
}) => {
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [view, setView] = useState<'TOOLS' | 'LAB'>('TOOLS');
  
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isConsumableModalOpen, setIsConsumableModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [labForm, setLabForm] = useState({ name: '', building: '', floor: '', condition: 'Functional' as Laboratory['condition'], status: 'Available' as Laboratory['status'] });
  const [toolForm, setToolForm] = useState({ name: '', serialNumber: '', condition: 'Good' as ToolItem['condition'] });
  const [consumableForm, setConsumableForm] = useState({ name: '', quantity: 0, unit: 'pcs', expiryDate: '', location: '' });

  const activeLab = laboratories.find(l => l.id === selectedLabId);
  const labTools = tools.filter(t => t.labId === selectedLabId);
  const labConsumables = consumables.filter(c => c.labId === selectedLabId);

  const handleLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddLab(labForm);
      setIsLabModalOpen(false);
      setLabForm({ name: '', building: '', floor: '', condition: 'Functional', status: 'Available' });
    } finally { setIsSaving(false); }
  };

  const handleToolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabId) return;
    setIsSaving(true);
    try {
      await onAddTool({ ...toolForm, labId: selectedLabId });
      setIsToolModalOpen(false);
      setToolForm({ name: '', serialNumber: '', condition: 'Good' });
    } finally { setIsSaving(false); }
  };

  const handleConsumableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabId) return;
    setIsSaving(true);
    try {
      await onAddConsumable({ ...consumableForm, labId: selectedLabId });
      setIsConsumableModalOpen(false);
      setConsumableForm({ name: '', quantity: 0, unit: 'pcs', expiryDate: '', location: '' });
    } finally { setIsSaving(false); }
  };

  if (!selectedLabId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Available Laboratories</h3>
          <button 
            onClick={() => setIsLabModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            <span>Register New Lab</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laboratories.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No laboratories registered in system.</p>
            </div>
          ) : (
            laboratories.map(lab => (
              <div 
                key={lab.id} 
                onClick={() => setSelectedLabId(lab.id)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    lab.condition === 'Functional' ? 'bg-green-100 text-green-700' : 
                    lab.condition === 'Maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {lab.condition}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    lab.status === 'Available' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {lab.status}
                  </span>
                </div>
                <h4 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{lab.name}</h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><span className="font-bold">Building:</span> {lab.building}</p>
                  <p><span className="font-bold">Floor:</span> {lab.floor}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">View Lab Assets</span>
                  <svg className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            ))
          )}
        </div>

        {isLabModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Laboratory</h3>
                <button onClick={() => setIsLabModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <form onSubmit={handleLabSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Laboratory Name</label>
                  <input required type="text" className="w-full border rounded-lg p-3 text-sm" placeholder="e.g. Computer Laboratory 1" value={labForm.name} onChange={e => setLabForm({...labForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Building</label>
                  <input required type="text" className="w-full border rounded-lg p-3 text-sm" placeholder="e.g. Science Building" value={labForm.building} onChange={e => setLabForm({...labForm, building: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Floor</label>
                  <input required type="text" className="w-full border rounded-lg p-3 text-sm" placeholder="e.g. 2nd Floor" value={labForm.floor} onChange={e => setLabForm({...labForm, floor: e.target.value})} />
                </div>
                <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                  <button type="button" onClick={() => setIsLabModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">Cancel</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 text-sm">{isSaving ? 'Registering...' : 'Register Lab'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <button 
          onClick={() => setSelectedLabId(null)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h3 className="text-2xl font-black text-gray-900">{activeLab?.name}</h3>
          <p className="text-xs text-gray-500 font-medium">{activeLab?.building} • {activeLab?.floor}</p>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setView('TOOLS')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              view === 'TOOLS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tools & Equipment ({labTools.length})
          </button>
          <button
            onClick={() => setView('LAB')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              view === 'LAB' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Laboratory Consumables ({labConsumables.length})
          </button>
        </div>
        <button 
          onClick={() => view === 'TOOLS' ? setIsToolModalOpen(true) : setIsConsumableModalOpen(true)}
          className="mb-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg"
        >
          {view === 'TOOLS' ? 'Add Tool' : 'Add Consumable'}
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        {view === 'TOOLS' ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Asset Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Serial No.</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {labTools.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic text-sm">No tools registered in this lab.</td></tr>
              ) : labTools.map((tool) => (
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
                    <button className="text-indigo-600 hover:text-indigo-900 font-bold">Borrow</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Storage</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {labConsumables.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic text-sm">No consumables registered in this lab.</td></tr>
              ) : labConsumables.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-black ${item.quantity < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.expiryDate || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => onConsumableUpdate(item.id, -1)} className="text-red-600 font-bold px-2 py-1 hover:bg-red-50 rounded transition-colors">-1</button>
                    <button onClick={() => onConsumableUpdate(item.id, 5)} className="text-indigo-600 font-bold px-2 py-1 hover:bg-indigo-50 rounded transition-colors">+5</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Item Modals */}
      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add Tool to {activeLab?.name}</h3>
            <form onSubmit={handleToolSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tool Name</label>
                <input required type="text" className="w-full border rounded-lg p-3 text-sm" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Serial Number</label>
                <input required type="text" className="w-full border rounded-lg p-3 text-sm" value={toolForm.serialNumber} onChange={e => setToolForm({...toolForm, serialNumber: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsToolModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg text-sm">{isSaving ? 'Saving...' : 'Add Tool'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConsumableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add Consumable to {activeLab?.name}</h3>
            <form onSubmit={handleConsumableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                <input required type="text" className="w-full border rounded-lg p-3 text-sm" value={consumableForm.name} onChange={e => setConsumableForm({...consumableForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Qty</label>
                  <input required type="number" className="w-full border rounded-lg p-3 text-sm" value={consumableForm.quantity} onChange={e => setConsumableForm({...consumableForm, quantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                  <input required type="text" className="w-full border rounded-lg p-3 text-sm" placeholder="pcs, meters" value={consumableForm.unit} onChange={e => setConsumableForm({...consumableForm, unit: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                <input required type="text" className="w-full border rounded-lg p-3 text-sm" placeholder="Cabinet A" value={consumableForm.location} onChange={e => setConsumableForm({...consumableForm, location: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsConsumableModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg text-sm">{isSaving ? 'Saving...' : 'Add Consumable'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModule;
