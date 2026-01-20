
import React, { useState } from 'react';
import { Teacher } from '../types';

interface TeacherModuleProps {
  teachers: Teacher[];
  onAdd: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
}

const TeacherModule: React.FC<TeacherModuleProps> = ({ teachers, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Teacher>>({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    empNo: `EMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 999)}`,
    dob: '1990-01-01',
    subjectTaught: '',
    yearsTeachingSubject: 1,
    tesdaQualifications: [],
    position: 'Teacher I',
    educationBS: '',
    yearsInService: 1,
    contact: '',
    address: ''
  });

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const calculateRetirementYear = (dob: string) => {
    if (!dob) return '-';
    const birthYear = new Date(dob).getFullYear();
    return birthYear + 65;
  };

  const filteredTeachers = teachers.filter(t => {
    const fullName = `${t.firstName} ${t.middleName} ${t.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           t.subjectTaught.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.empNo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher: Teacher = {
      ...formData as Teacher,
      id: Date.now().toString(),
      tesdaQualifications: formData.tesdaQualifications || []
    };
    onAdd(newTeacher);
    setIsModalOpen(false);
    alert("Teacher profile added successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search registry..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">New Teacher Profile Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Data */}
              <div className="space-y-4 md:col-span-3">
                <h4 className="text-xs font-black uppercase text-indigo-600 tracking-widest border-b pb-1">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
                    <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Middle Name</label>
                    <input type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
                    <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Suffix</label>
                    <input type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="Jr., III" value={formData.suffix} onChange={e => setFormData({...formData, suffix: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
                    <input required type="date" className="w-full border rounded-lg p-2 text-sm" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                    <p className="text-[10px] mt-1 text-indigo-500 font-bold">Age: {calculateAge(formData.dob || '')} • Retirement: {calculateRetirementYear(formData.dob || '')}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Contact No.</label>
                    <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Address</label>
                    <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Professional Data */}
              <div className="space-y-4 md:col-span-3">
                <h4 className="text-xs font-black uppercase text-indigo-600 tracking-widest border-b pb-1">Employment & Expertise</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Employee Number</label>
                    <input required type="text" className="w-full border rounded-lg p-2 text-sm bg-gray-50" value={formData.empNo} onChange={e => setFormData({...formData, empNo: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Position / Designation</label>
                    <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Subject Taught</label>
                    <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.subjectTaught} onChange={e => setFormData({...formData, subjectTaught: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Yrs Teaching Subject</label>
                    <input required type="number" className="w-full border rounded-lg p-2 text-sm" value={formData.yearsTeachingSubject} onChange={e => setFormData({...formData, yearsTeachingSubject: parseInt(e.target.value)})} />
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4 md:col-span-3">
                <h4 className="text-xs font-black uppercase text-indigo-600 tracking-widest border-b pb-1">Educational Attainment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Bachelor's Degree (BS)</label>
                    <input required type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.educationBS} onChange={e => setFormData({...formData, educationBS: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Master's Degree (MA)</label>
                    <input type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.educationMA} onChange={e => setFormData({...formData, educationMA: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Doctorate (PhD)</label>
                    <input type="text" className="w-full border rounded-lg p-2 text-sm" value={formData.educationPhD} onChange={e => setFormData({...formData, educationPhD: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end space-x-3 mt-4 border-t pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-10 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white shadow-xl border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">Full Name & Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Position</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Expertise</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Education</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Retirement</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-indigo-50/30 group">
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white group-hover:bg-indigo-50/30 z-10 border-r border-gray-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">{t.lastName.charAt(0)}{t.firstName.charAt(0)}</div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 leading-none">{t.lastName}, {t.firstName} {t.suffix}</div>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Age: {calculateAge(t.dob)} • {t.empNo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{t.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">{t.subjectTaught}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">{t.yearsTeachingSubject} yrs specialization</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-bold text-blue-700">BS: {t.educationBS}</span>
                      {t.educationMA && <span className="text-[10px] font-bold text-purple-700">MA: {t.educationMA}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-gray-900">{calculateRetirementYear(t.dob)}</div>
                    <div className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">Target Date</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white group-hover:bg-indigo-50/30 z-10 border-l border-gray-50">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => alert("Edit mode coming soon - update functional in v1.1")} className="text-indigo-600 font-bold">Edit</button>
                      <button onClick={() => onDelete(t.id)} className="text-red-400 hover:text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherModule;
