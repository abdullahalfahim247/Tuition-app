import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Table as TableIcon, 
  PieChart as PieChartIcon,
  Users,
  Wallet,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../lib/db';
import { formatCurrency } from '../../lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function Reports() {
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    activeStudents: 0,
    totalDues: 0,
    totalIncome: 0,
    dueCount: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const students = await db.students.toArray();
    const fees = await db.fees.toArray();
    
    const dues = fees.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);
    const income = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const dueCount = fees.filter(f => f.status === 'Unpaid').length;

    setStats({
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'Active').length,
      totalDues: dues,
      totalIncome: income,
      dueCount
    });
  };

  const exportToExcel = async (type: 'students' | 'dues') => {
    let data = [];
    let filename = '';

    if (type === 'students') {
      const students = await db.students.toArray();
      data = students.map(s => ({
        ID: s.id,
        Name: s.fullName,
        Class: s.className,
        Roll: s.rollNumber,
        Phone: s.mobileNumber,
        Status: s.status,
        'Monthly Fee': s.monthlyTuitionFee
      }));
      filename = 'Students_List.xlsx';
    } else {
      const dues = await db.fees.where('status').equals('Unpaid').toArray();
      const students = await db.students.toArray();
      data = dues.map(d => {
        const student = students.find(s => s.id === d.studentId);
        return {
          Student: student?.fullName || 'Unknown',
          Month: d.month,
          Amount: d.amount,
          'Phone': student?.mobileNumber || ''
        };
      });
      filename = 'Due_Fees_Report.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename);
  };

  const exportStudentsPDF = async () => {
    const doc = new jsPDF();
    const students = await db.students.toArray();
    
    doc.setFontSize(22);
    doc.setTextColor(26, 54, 93);
    doc.text('Students Master Report', 14, 22);
    
    const rows = students.map((s, i) => [
      i + 1,
      s.fullName,
      s.className,
      s.rollNumber,
      s.mobileNumber,
      s.status
    ]);

    (doc as any).autoTable({
      head: [['#', 'Name', 'Class', 'Roll', 'Phone', 'Status']],
      body: rows,
      startY: 32,
      theme: 'grid',
      headStyles: { fillColor: [26, 54, 93], textColor: [212, 175, 55] }
    });

    doc.save('Students_Full_Report.pdf');
  };

  return (
    <div className="space-y-8">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ReportStat label="Student Integrity" value={`${stats.activeStudents}/${stats.totalStudents}`} sub="Active / Total" icon={<Users className="text-blue-500" />} />
         <ReportStat label="Collection Status" value={formatCurrency(stats.totalIncome)} sub="Total Collected" icon={<TrendingUp className="text-emerald-500" />} />
         <ReportStat label="Outstanding Dues" value={formatCurrency(stats.totalDues)} sub="Total Receivable" icon={<AlertTriangle className="text-red-500" />} />
         <ReportStat label="Due Records" value={stats.dueCount} sub="Count of Unpaid Fees" icon={<Clock className="text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="card bg-white dark:bg-slate-900 border-none shadow-xl">
           <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
             <Download className="text-gold" size={20} />
             Export Center
           </h3>
           <div className="space-y-4">
              <ExportRow 
                title="Master student List" 
                desc="Generate a complete list of all students with full details." 
                onPDF={exportStudentsPDF} 
                onExcel={() => exportToExcel('students')}
              />
              <ExportRow 
                title="Due Fees Report" 
                desc="List of all unpaid tuition fees across all months." 
                onExcel={() => exportToExcel('dues')}
              />
              <ExportRow 
                title="Attendance History" 
                desc="Consolidated attendance performance for all classes." 
                onPDF={exportStudentsPDF} 
              />
           </div>
        </div>

        {/* Report Overview Card */}
        <div className="card bg-navy text-white border-none shadow-xl flex flex-col justify-between overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gold rounded-full opacity-10 translate-x-1/2 -translate-y-1/2"></div>
           <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Performance Summary</h3>
              <p className="text-slate-400 text-sm font-medium mb-8">Generated for Admin Abdullah al Fahim</p>
              
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-xs font-bold uppercase mb-2">
                       <span>Collection Progress</span>
                       <span className="text-gold">85%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-gold w-[85%] rounded-full shadow-[0_0_10px_#d4af37]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs font-bold uppercase mb-2">
                       <span>Attendance Rate</span>
                       <span className="text-gold">92%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-400 w-[92%] rounded-full"></div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="mt-12 flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/10 rounded-xl">
                <FileText className="text-gold" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Last System Backup</p>
                <p className="text-sm font-bold">2 days ago</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value, sub, icon }: any) {
  return (
    <div className="card bg-white dark:bg-slate-900 border-none shadow-xl">
       <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-black text-navy dark:text-white">{value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{sub}</p>
          </div>
       </div>
    </div>
  );
}

function ExportRow({ title, desc, onPDF, onExcel }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
       <div>
          <h4 className="font-bold text-sm text-navy dark:text-gold uppercase tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500 font-medium">{desc}</p>
       </div>
       <div className="flex gap-2">
          {onPDF && (
            <button onClick={onPDF} className="p-2.5 bg-white dark:bg-slate-700 text-slate-500 hover:text-red-500 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm transition-all active:scale-90">
              <Download size={16} />
            </button>
          )}
          {onExcel && (
            <button onClick={onExcel} className="p-2.5 bg-white dark:bg-slate-700 text-slate-500 hover:text-emerald-500 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm transition-all active:scale-90">
              <FileSpreadsheet size={16} />
            </button>
          )}
       </div>
    </div>
  );
}
