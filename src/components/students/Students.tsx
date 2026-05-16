import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Eye, 
  Filter, 
  MoreVertical,
  X,
  Camera,
  Download,
  IdCard,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/db';
import { Student, StudentStatus, Gender } from '../../types';
import { cn, generateQRValue } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, filterClass]);

  const fetchStudents = async () => {
    let collection = db.students.toCollection();
    
    const all = await collection.reverse().toArray();
    let filtered = all;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.includes(searchTerm) ||
        s.mobileNumber.includes(searchTerm)
      );
    }

    if (filterClass !== 'All') {
      filtered = filtered.filter(s => s.className === filterClass);
    }

    setStudents(filtered);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentData: any = Object.fromEntries(formData.entries());
    
    // Add defaults
    studentData.monthlyTuitionFee = Number(studentData.monthlyTuitionFee);
    studentData.createdAt = Date.now();
    
    if (editingStudent) {
      await db.students.update(editingStudent.id!, studentData);
    } else {
      await db.students.add(studentData);
    }
    
    setModalOpen(false);
    setEditingStudent(null);
    fetchStudents();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student? All related records will be lost.')) {
      await db.students.delete(id);
      await db.attendance.where('studentId').equals(id).delete();
      await db.fees.where('studentId').equals(id).delete();
      await db.results.where('studentId').equals(id).delete();
      fetchStudents();
    }
  };

  const classes = ['All', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC'];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, roll, or phone..." 
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-gold outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="bg-transparent border-none text-sm font-semibold outline-none cursor-pointer"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => { setEditingStudent(null); setModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={18} />
            Add Student
          </button>
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {students.map((student) => (
          <motion.div 
            layout
            key={student.id}
            className="card bg-white dark:bg-slate-900 border-none shadow-lg hover:shadow-2xl transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-navy dark:text-gold shrink-0 overflow-hidden">
                {student.photo ? (
                  <img src={student.photo} className="w-full h-full object-cover" alt="" />
                ) : (
                  student.fullName.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg truncate group-hover:text-gold transition-colors">{student.fullName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{student.className} • Roll {student.rollNumber}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter",
                    student.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {student.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-slate-50 dark:border-slate-800 pt-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{student.mobileNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedStudent(student); setDetailOpen(true); }}
                      className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-gold transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                      className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id!)}
                      className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Users size={64} strokeWidth={1} className="mb-4" />
          <p className="text-lg font-medium">No students found</p>
          <p className="text-sm">Try adjusting your filters or add a new student</p>
        </div>
      )}

      {/* Student Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add New Student'}>
        <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
          <div className="md:col-span-2 flex justify-center mb-4">
             <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 overflow-hidden">
                   {editingStudent?.photo ? <img src={editingStudent.photo} className="w-full h-full object-cover" /> : <Camera size={32} />}
                </div>
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-3xl transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Change</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
             </div>
          </div>

          <FormField label="Full Name" name="fullName" defaultValue={editingStudent?.fullName} required />
          <FormField label="Father Name" name="fatherName" defaultValue={editingStudent?.fatherName} />
          <FormField label="Mother Name" name="motherName" defaultValue={editingStudent?.motherName} />
          <FormField label="Mobile Number" name="mobileNumber" defaultValue={editingStudent?.mobileNumber} required />
          <FormField label="Guardian Number" name="guardianNumber" defaultValue={editingStudent?.guardianNumber} />
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
            <select name="className" defaultValue={editingStudent?.className} className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold font-medium">
              {classes.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <FormField label="Group / Version" name="group" defaultValue={editingStudent?.group} />
          <FormField label="Roll Number" name="rollNumber" defaultValue={editingStudent?.rollNumber} required />
          <FormField label="Registration No" name="registrationNumber" defaultValue={editingStudent?.registrationNumber} />
          <FormField label="Date of Birth" name="dateOfBirth" type="date" defaultValue={editingStudent?.dateOfBirth} />
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
            <select name="gender" defaultValue={editingStudent?.gender} className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold font-medium">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <FormField label="Blood Group" name="bloodGroup" defaultValue={editingStudent?.bloodGroup} />
          <FormField label="Address" name="address" defaultValue={editingStudent?.address} />
          <FormField label="Admission Date" name="admissionDate" type="date" defaultValue={editingStudent?.admissionDate} />
          <FormField label="Monthly Fee (BDT)" name="monthlyTuitionFee" type="number" defaultValue={editingStudent?.monthlyTuitionFee} required />
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
            <select name="status" defaultValue={editingStudent?.status || 'Active'} className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold font-medium">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-4 flex gap-3">
             <button type="submit" className="flex-1 btn-primary h-12 rounded-xl">
               {editingStudent ? 'Update Student' : 'Save Student'}
             </button>
             <button type="button" onClick={() => setModalOpen(false)} className="px-6 h-12 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
               Cancel
             </button>
          </div>
        </form>
      </Modal>

      {/* Student Details & ID Card Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setDetailOpen(false)} title="Student Profile" width="max-w-4xl">
        {selectedStudent && (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
               {/* Info Section */}
               <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden shrink-0 border-4 border-white shadow-xl">
                      {selectedStudent.photo ? <img src={selectedStudent.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-navy text-gold">{selectedStudent.fullName.charAt(0)}</div>}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-navy">{selectedStudent.fullName}</h2>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{selectedStudent.className} • Roll {selectedStudent.rollNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <DetailItem label="Guardian" value={selectedStudent.fatherName || 'N/A'} />
                    <DetailItem label="Phone" value={selectedStudent.mobileNumber} />
                    <DetailItem label="Address" value={selectedStudent.address || 'Not set'} />
                    <DetailItem label="Admission" value={selectedStudent.admissionDate || 'N/A'} />
                  </div>
               </div>

               {/* ID Cards Section */}
               <div className="lg:w-[400px] space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Card Preview</h3>
                  <div id="student-id-card" className="w-[350px] h-[200px] bg-navy rounded-2xl relative overflow-hidden shadow-2xl p-4 text-white">
                     {/* Background pattern */}
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold rounded-full opacity-10"></div>
                     
                     <div className="flex gap-4 relative z-10">
                        <div className="w-24 h-24 rounded-lg bg-white border-2 border-gold overflow-hidden">
                           {selectedStudent.photo ? <img src={selectedStudent.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-navy font-bold text-2xl">{selectedStudent.fullName.charAt(0)}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-gold font-bold text-xs uppercase tracking-wider mb-1">Abdullah Tuition</h4>
                           <h3 className="font-black text-sm uppercase truncate leading-tight">{selectedStudent.fullName}</h3>
                           <div className="mt-2 text-[8px] space-y-0.5 opacity-80 uppercase font-bold">
                              <p>Class: {selectedStudent.className}</p>
                              <p>Roll: {selectedStudent.rollNumber}</p>
                              <p>ID: TUI-{selectedStudent.id?.toString().padStart(4, '0')}</p>
                           </div>
                        </div>
                     </div>

                     <div className="mt-6 flex items-end justify-between relative z-10">
                        <div className="bg-white p-1 rounded-sm">
                           <QRCodeSVG value={generateQRValue(selectedStudent)} size={48} />
                        </div>
                        <div className="text-right">
                           <div className="h-[2px] w-16 bg-gold mb-1"></div>
                           <p className="text-[6px] uppercase tracking-widest font-bold">Director Signature</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleExportCard('student-id-card', `ID_Card_${selectedStudent.fullName}`)}
                      className="flex-1 py-3 bg-navy text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-navy/90 transition-all"
                    >
                      <Download size={14} className="text-gold" />
                      Download JPG
                    </button>
                    <button 
                      className="p-3 bg-gold text-navy rounded-xl hover:scale-105 transition-transform"
                    >
                      <IdCard size={20} />
                    </button>
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
               <button onClick={() => setDetailOpen(false)} className="btn-primary">Done</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FormField({ label, name, type = 'text', defaultValue, required }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
      <input 
        type={type} 
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold font-medium"
      />
    </div>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children, width = 'max-w-2xl' }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={cn("bg-white dark:bg-slate-900 rounded-3xl w-full relative z-10 shadow-2xl overflow-hidden", width)}
      >
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-navy dark:text-gold uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

async function handleExportCard(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const canvas = await html2canvas(element, { scale: 2 });
  const link = document.createElement('a');
  link.download = `${filename}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 1.0);
  link.click();
}
