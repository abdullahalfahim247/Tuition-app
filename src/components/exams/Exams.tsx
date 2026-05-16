import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Search, 
  ChevronRight, 
  BarChart2, 
  Trophy,
  MessageCircle,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../lib/db';
import { Exam, ExamResult, Student } from '../../types';
import { cn } from '../../lib/utils';

export function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Record<number, ExamResult>>({});

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const all = await db.exams.toArray();
    setExams(all);
  };

  const handleCreateExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const exam = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      totalMarks: Number(formData.get('totalMarks'))
    };
    await db.exams.add(exam);
    fetchExams();
    (e.target as HTMLFormElement).reset();
  };

  const deleteExam = async (id: number) => {
    if (confirm('Delete this exam and all results?')) {
      await db.exams.delete(id);
      await db.results.where('examId').equals(id).delete();
      fetchExams();
      if (selectedExam?.id === id) setSelectedExam(null);
    }
  };

  const openExam = async (exam: Exam) => {
    setSelectedExam(exam);
    const allStudents = await db.students.where('status').equals('Active').toArray();
    setStudents(allStudents);
    
    const examResults = await db.results.where('examId').equals(exam.id!).toArray();
    const map: Record<number, ExamResult> = {};
    examResults.forEach(r => { map[r.studentId] = r; });
    setResults(map);
  };

  const saveMark = async (studentId: number, marks: number) => {
    if (!selectedExam) return;
    
    const marksObtained = Number(marks);
    const gpa = calculateGPA(marksObtained, selectedExam.totalMarks);
    const grade = calculateGrade(gpa);
    
    const existing = await db.results.where({ examId: selectedExam.id!, studentId }).first();
    const resultData = { examId: selectedExam.id!, studentId, marksObtained, gpa, grade };
    
    if (existing) {
      await db.results.update(existing.id!, resultData);
    } else {
      await db.results.add(resultData);
    }
    
    setResults(prev => ({ ...prev, [studentId]: { ...resultData } as ExamResult }));
  };

  const calculateGPA = (marks: number, total: number) => {
    const percentage = (marks / total) * 100;
    if (percentage >= 80) return 5.0;
    if (percentage >= 70) return 4.0;
    if (percentage >= 60) return 3.5;
    if (percentage >= 50) return 3.0;
    if (percentage >= 40) return 2.0;
    if (percentage >= 33) return 1.0;
    return 0.0;
  };

  const calculateGrade = (gpa: number) => {
    if (gpa === 5.0) return 'A+';
    if (gpa >= 4.0) return 'A';
    if (gpa >= 3.5) return 'A-';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.0) return 'C';
    if (gpa >= 1.0) return 'D';
    return 'F';
  };

  const shareResult = (student: Student, result: ExamResult, type: 'SMS' | 'WA') => {
    const msg = `Exam Result: ${selectedExam?.title}
Student: ${student.fullName}
Marks: ${result.marksObtained}/${selectedExam?.totalMarks}
GPA: ${result.gpa}
Grade: ${result.grade}
- Abdullah al Fahim`;

    if (type === 'WA') {
      window.open(`https://wa.me/${student.mobileNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.location.href = `sms:${student.mobileNumber}?body=${encodeURIComponent(msg)}`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Exam List */}
      <div className="space-y-6">
        <div className="card bg-navy text-white border-none p-8">
          <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <Plus className="text-gold" />
            New Exam
          </h3>
          <form onSubmit={handleCreateExam} className="space-y-4">
            <input name="title" placeholder="Exam Title" className="w-full bg-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-gold border-none placeholder:text-white/40 font-bold text-sm" required />
            <input name="date" type="date" className="w-full bg-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-gold border-none text-sm font-bold" required />
            <input name="totalMarks" type="number" placeholder="Total Marks" className="w-full bg-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-gold border-none placeholder:text-white/40 font-bold text-sm" required />
            <button className="w-full py-3 bg-gold text-navy font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all active:scale-95">Create Exam</button>
          </form>
        </div>

        <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
             <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400">All Exams</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {exams.map(exam => (
              <div 
                key={exam.id} 
                className={cn(
                  "p-4 flex items-center justify-between group cursor-pointer transition-colors",
                  selectedExam?.id === exam.id ? "bg-gold/10" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
                onClick={() => openExam(exam)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy text-gold flex items-center justify-center font-bold">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm truncate max-w-[120px]">{exam.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold">{exam.date}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); deleteExam(exam.id!); }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              </div>
            ))}
            {exams.length === 0 && <p className="p-10 text-center text-xs text-slate-400 font-bold uppercase">No exams created</p>}
          </div>
        </div>
      </div>

      {/* Result Entry */}
      <div className="lg:col-span-2">
        {selectedExam ? (
          <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-0 flex flex-col min-h-[600px]">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black text-navy dark:text-gold uppercase tracking-tighter">{selectedExam.title}</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Marks: {selectedExam.totalMarks}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <BarChart2 size={16} className="text-gold" />
                  <span className="text-xs font-bold">{students.length} Students</span>
                </div>
             </div>

             <div className="flex-1 overflow-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-[10px] uppercase font-black text-slate-400">
                   <tr>
                     <th className="px-8 py-4">Student</th>
                     <th className="px-8 py-4">Marks Obtained</th>
                     <th className="px-8 py-4">GPA/Grade</th>
                     <th className="px-8 py-4 text-center">Share</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                   {students.map(student => {
                     const res = results[student.id!];
                     return (
                       <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                         <td className="px-8 py-4">
                           <p className="text-sm font-bold">{student.fullName}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Roll: {student.rollNumber} • {student.className}</p>
                         </td>
                         <td className="px-8 py-4">
                            <input 
                              type="number" 
                              className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-gold outline-none"
                              defaultValue={res?.marksObtained}
                              onBlur={(e) => saveMark(student.id!, Number(e.target.value))}
                            />
                         </td>
                         <td className="px-8 py-4">
                            {res ? (
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-navy dark:text-white px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">{res.gpa.toFixed(2)}</span>
                                <span className={cn(
                                  "text-xs font-black px-2 py-1 rounded",
                                  res.gpa >= 4 ? "bg-green-100 text-green-700" : res.gpa >= 2 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                                )}>{res.grade}</span>
                              </div>
                            ) : <span className="text-xs text-slate-300 font-bold uppercase">No Mark</span>}
                         </td>
                         <td className="px-8 py-4">
                            <div className="flex items-center justify-center gap-2">
                               <button 
                                 disabled={!res}
                                 onClick={() => shareResult(student, res, 'WA')}
                                 className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-30 disabled:cursor-not-allowed"
                               >
                                 <MessageCircle size={16} />
                               </button>
                               <button 
                                 disabled={!res}
                                 onClick={() => shareResult(student, res, 'SMS')}
                                 className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed"
                               >
                                 <Share2 size={16} />
                               </button>
                            </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
             <Trophy size={80} strokeWidth={1} className="mb-4 opacity-20" />
             <p className="font-bold uppercase tracking-widest text-sm">Select an exam to manage marks</p>
          </div>
        )}
      </div>
    </div>
  );
}
