import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  FileText,
  Filter,
  Download,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../lib/db';
import { Student, Attendance as AttendanceType, AttendanceStatus } from '../../types';
import { cn } from '../../lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('Class 8');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = useState(false);

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC'];

  useEffect(() => {
    fetchData();
  }, [selectedClass, date]);

  const fetchData = async () => {
    setIsLoading(true);
    const classStudents = await db.students.where('className').equals(selectedClass).toArray();
    setStudents(classStudents);

    // Fetch existing attendance for this date and class
    const existing = await db.attendance.where('date').equals(date).toArray();
    const map: Record<number, AttendanceStatus> = {};
    existing.forEach(rec => {
      map[rec.studentId] = rec.status;
    });
    setAttendanceRecords(map);
    setIsLoading(false);
  };

  const markAttendance = async (studentId: number, status: AttendanceStatus) => {
    const existing = await db.attendance.where({ date, studentId }).first();
    if (existing) {
      await db.attendance.update(existing.id!, { status });
    } else {
      await db.attendance.add({ studentId, date, status });
    }
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = async (status: AttendanceStatus) => {
    for (const student of students) {
      await markAttendance(student.id!, status);
    }
  };

  const downloadReport = async () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Attendance Report - ${selectedClass}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Date: ${date}`, 14, 30);
    doc.text(`Total Students: ${students.length}`, 14, 35);
    
    const rows = students.map((s, index) => [
      index + 1,
      s.fullName,
      s.rollNumber,
      attendanceRecords[s.id!] || 'Not Marked'
    ]);

    (doc as any).autoTable({
      head: [['#', 'Name', 'Roll', 'Status']],
      body: rows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [26, 54, 93], textColor: [212, 175, 55] }
    });

    doc.save(`Attendance_${selectedClass}_${date}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
           <button onClick={() => markAll(AttendanceStatus.PRESENT)} className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-600">Mark All Present</button>
           <button onClick={downloadReport} className="btn-primary flex items-center gap-2">
             <Download size={16} />
             PDF Report
           </button>
        </div>
      </div>

      <div className="card bg-white dark:bg-slate-900 border-none shadow-xl overflow-hidden p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
              <th className="px-8 py-4">Roll</th>
              <th className="px-8 py-4">Student Name</th>
              <th className="px-8 py-4 text-center">Mark Attendance</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-8 py-4">
                  <span className="font-mono text-xs font-bold text-slate-400">{student.rollNumber}</span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy text-gold flex items-center justify-center font-bold text-xs">
                      {student.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{student.fullName}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{student.mobileNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <AttendanceToggle 
                      icon={<CheckCircle2 />} 
                      color="green" 
                      active={attendanceRecords[student.id!] === AttendanceStatus.PRESENT}
                      onClick={() => markAttendance(student.id!, AttendanceStatus.PRESENT)}
                      label="Present"
                    />
                    <AttendanceToggle 
                      icon={<XCircle />} 
                      color="red" 
                      active={attendanceRecords[student.id!] === AttendanceStatus.ABSENT}
                      onClick={() => markAttendance(student.id!, AttendanceStatus.ABSENT)}
                      label="Absent"
                    />
                    <AttendanceToggle 
                      icon={<Clock />} 
                      color="amber" 
                      active={attendanceRecords[student.id!] === AttendanceStatus.LATE}
                      onClick={() => markAttendance(student.id!, AttendanceStatus.LATE)}
                      label="Late"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && !isLoading && (
          <div className="py-20 text-center text-slate-400">
            <p className="font-bold uppercase tracking-widest text-xs">No students found in this class</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceToggle({ icon, color, active, onClick, label }: any) {
  const colors = {
    green: active ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-200" : "bg-white text-slate-300 border-slate-200",
    red: active ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-200" : "bg-white text-slate-300 border-slate-200",
    amber: active ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200" : "bg-white text-slate-300 border-slate-200"
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 px-3 rounded-xl border transition-all duration-300 group",
        (colors as any)[color],
        !active && "hover:border-gold hover:text-gold"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110")}>{React.cloneElement(icon, { size: 18 })}</span>
      <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}
