
import React from 'react';
import { Teacher, ItemAnalysis, ToolItem, LabConsumable, Task } from './types';

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: '1',
    firstName: 'John',
    middleName: 'Quincy',
    lastName: 'Doe',
    suffix: 'Jr.',
    empNo: 'EMP-2024-001',
    contact: '0917-123-4567',
    address: '123 Academic St., Manila, Philippines',
    dob: '1975-05-15',
    subjectTaught: 'Computer Systems Servicing',
    yearsTeachingSubject: 15,
    tesdaQualifications: ['NC II CSS', 'NC III VGD', 'TM I'],
    position: 'Master Teacher II',
    educationBS: 'BS Computer Science',
    educationMA: 'MA in Educational Management',
    educationPhD: 'PhD in Information Technology',
    yearsInService: 22
  },
  {
    id: '2',
    firstName: 'Jane',
    middleName: 'Marie',
    lastName: 'Smith',
    empNo: 'EMP-2024-002',
    contact: '0920-987-6543',
    address: '45 Faculty Rd., Quezon City, Philippines',
    dob: '1988-11-20',
    subjectTaught: 'Cookery',
    yearsTeachingSubject: 8,
    tesdaQualifications: ['NC II Cookery', 'NC II Bread & Pastry'],
    position: 'Teacher III',
    educationBS: 'BS Hotel and Restaurant Management',
    educationMA: 'MA in Home Economics',
    yearsInService: 10
  }
];

export const MOCK_ITEM_ANALYSIS: ItemAnalysis[] = [
  {
    id: 'ia-1',
    gradeLevel: 11,
    specialization: 'Computer Programming',
    quarter: 1,
    totalQuestions: 5,
    responses: [
      { questionNo: 1, correctCount: 35, totalExaminees: 40 },
      { questionNo: 2, correctCount: 22, totalExaminees: 40 },
      { questionNo: 3, correctCount: 15, totalExaminees: 40 },
      { questionNo: 4, correctCount: 38, totalExaminees: 40 },
      { questionNo: 5, correctCount: 10, totalExaminees: 40 },
    ]
  }
];

export const MOCK_TOOLS: ToolItem[] = [
  { id: 't1', name: 'Digital Multimeter', serialNumber: 'SN-77812', condition: 'Good', borrower: null, lastBorrowed: null },
  { id: 't2', name: 'Soldering Station', serialNumber: 'SN-99021', condition: 'Fair', borrower: 'Jane Smith', lastBorrowed: '2024-05-01' }
];

export const MOCK_CONSUMABLES: LabConsumable[] = [
  { id: 'c1', name: 'Solder Wire (60/40)', quantity: 15, unit: 'Rolls', expiryDate: '2025-12-30', location: 'Cabinet A' },
  { id: 'c2', name: 'Hydrogen Peroxide', quantity: 5, unit: 'Liters', expiryDate: '2024-06-15', location: 'Chemical Storage' }
];

export const MOCK_TASKS: Task[] = [
  { id: 'task1', title: 'Submit 1st Quarter Grades', assignedTo: 'All Teachers', deadline: '2024-05-25', status: 'Pending' },
  { id: 'task2', title: 'Physical Inventory Count', assignedTo: 'Inventory Custodian', deadline: '2024-05-20', status: 'Done' }
];

export const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Teachers: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  ItemAnalysis: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /></svg>,
  Inventory: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Tasks: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Proposal: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
};
