import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  Filter, 
  Download, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Plus,
  Send,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../lib/db';
import { Student, TuitionFee } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import jsPDF from 'jspdf';

export function Fees() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [feeRecords, setFeeRecords] = useState<Record<number, TuitionFee>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedMonth, searchTerm]);

  const fetchData = async () => {
    let classStudents = await db.students.where('status').equals('Active').toArray();
    
    if (searchTerm) {
      classStudents = classStudents.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    setStudents(classStudents);

    const records = await db.fees.where('month').equals(selectedMonth).toArray();
    const map: Record<number, TuitionFee> = {};
    records.forEach(r => { map[r.studentId] = r; });
    setFeeRecords(map);
  };

  const handlePayment = async (studentId: number, amount: number) => {
    const existing = await db.fees.where({ studentId, month: selectedMonth }).first();
    const now = new Date().toISOString().split('T')[0];
    
    if (existing) {
      await db.fees.update(existing.id!, { status: 'Paid', paymentDate: now, amount });
    } else {
      await db.fees.add({ studentId, month: selectedMonth, amount, paymentDate: now, status: 'Paid' });
    }
    fetchData();
  };

  const toggleStatus = async (studentId: number) => {
    const rec = feeRecords[studentId];
    if (rec) {
      await db.fees.update(rec.id!, { status: rec.status === 'Paid' ? 'Unpaid' : 'Paid' });
    } else {
      const student = students.find(s => s.id === studentId);
      await db.fees.add({ 
        studentId, 
        month: selectedMonth, 
        amount: student?.monthlyTuitionFee || 0, 
        paymentDate: '', 
        status: 'Paid' 
      });
    }
    fetchData();
  };

  const sendReminder = (student: Student, type: 'SMS' | 'WA') => {
    const msg = `Hello ${student.fullName}, this is a reminder for your tuition fee of ${selectedMonth} (Amount: ${student.monthlyTuitionFee} BDT). Please pay it at your earliest convenience. - Abdullah al Fahim`;
    if (type === 'WA') {
      window.open(`https://wa.me/${student.mobileNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.location.href = `sms:${student.mobileNumber}?body=${encodeURIComponent(msg)}`;
    }
  };

  const generateReceipt = async (student: Student) => {
    const doc = new jsPDF();
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(22);
    doc.text('Fahim Tuition Receipt', 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Receipt ID: TUI-REC-${Date.now().toString().slice(-6)}`, 14, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 60);
    
    doc.rect(14, 70, 182, 60);
    doc.text(`Student Name: ${student.fullName}`, 20, 80);
    doc.text(`Class: ${student.className}`, 20, 90);
    doc.text(`Fee Month: ${selectedMonth}`, 20, 100);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: ${formatCurrency(student.monthlyTuitionFee)}`, 20, 120);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Status: PAID', 140, 120);
    
    doc.text('Authorized Signature', 150, 180);
    doc.line(140, 175, 200, 175);
    
    doc.save(`Receipt_${student.fullName}_${selectedMonth}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm"
            />
          </div>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 font-bold text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => {
          const record = feeRecords[student.id!];
          const isPaid = record?.status === 'Paid';

          return (
            <motion.div 
              layout
              key={student.id}
              className="card bg-white dark:bg-slate-900 border-none shadow-xl flex flex-col relative overflow-hidden"
            >
              {isPaid && <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pt-8 pl-8"><CheckCircle2 className="text-green-500" size={32} /></div>}
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-navy dark:text-gold font-bold">
                  {student.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-navy dark:text-white truncate max-w-[150px]">{student.fullName}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase">{student.className} • {formatCurrency(student.monthlyTuitionFee)}</p>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {isPaid ? 'Payment Received' : 'Payment Due'}
                  </span>
                  {isPaid && <p className="text-[10px] text-slate-400 font-bold">{record.paymentDate}</p>}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(student.id!)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                      isPaid ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-gold text-navy hover:shadow-lg shadow-gold/20"
                    )}
                  >
                    {isPaid ? 'Undo Payment' : 'Mark As Paid'}
                  </button>
                  <div className="flex gap-1">
                    {isPaid ? (
                      <button onClick={() => generateReceipt(student)} className="p-3 bg-navy text-white rounded-xl hover:bg-navy/90"><Download size={16} className="text-gold" /></button>
                    ) : (
                      <>
                        <button onClick={() => sendReminder(student, 'WA')} className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200">
                          <MessageSquare size={16} />
                        </button>
                        <button onClick={() => sendReminder(student, 'SMS')} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200">
                          <Send size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {students.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <Wallet size={64} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">No records for this month</p>
        </div>
      )}
    </div>
  );
}
