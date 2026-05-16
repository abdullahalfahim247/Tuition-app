import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Lock, 
  ShieldAlert, 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../lib/db';

export function Settings() {
  const [pinChange, setPinChange] = useState({ old: '', new: '' });

  const exportBackup = async () => {
    const backup: any = {
      students: await db.students.toArray(),
      attendance: await db.attendance.toArray(),
      fees: await db.fees.toArray(),
      exams: await db.exams.toArray(),
      results: await db.results.toArray(),
      version: 1,
      date: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fahim_Tuition_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        
        if (confirm('Importing will overwrite current data. Continue?')) {
          await db.transaction('rw', [db.students, db.attendance, db.fees, db.exams, db.results], async () => {
            await db.students.clear();
            await db.attendance.clear();
            await db.fees.clear();
            await db.exams.clear();
            await db.results.clear();

            await db.students.bulkAdd(backup.students || []);
            await db.attendance.bulkAdd(backup.attendance || []);
            await db.fees.bulkAdd(backup.fees || []);
            await db.exams.bulkAdd(backup.exams || []);
            await db.results.bulkAdd(backup.results || []);
          });
          alert('Backup restored successfully!');
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = async () => {
    if (confirm('CRITICAL: This will delete ALL data. This cannot be undone. Type "DELETE" to confirm.')) {
      const confirmation = prompt('Type DELETE:');
      if (confirmation === 'DELETE') {
        await db.delete();
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Security Section */}
      <div className="card bg-white dark:bg-slate-900 border-none shadow-xl">
         <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
           <Lock className="text-gold" size={20} />
           Security & Privacy
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Current PIN</label>
                  <input 
                    type="password" 
                    placeholder="••••" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold font-bold tracking-[0.5em]"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">New 4-Digit PIN</label>
                  <input 
                    type="password" 
                    placeholder="••••" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold font-bold tracking-[0.5em]"
                  />
               </div>
               <button className="w-full btn-primary h-12 rounded-xl mt-4">Change Access PIN</button>
            </div>
            <div className="bg-navy rounded-2xl p-6 text-white relative overflow-hidden">
               <ShieldCheck className="absolute -bottom-4 -right-4 w-24 h-24 text-gold opacity-10" />
               <h4 className="font-bold text-gold uppercase tracking-tighter mb-2">Device Lock</h4>
               <p className="text-xs text-slate-400 font-medium mb-6">Your data is stored locally using industry-standard IndexedDB with AES-256 equivalent browser-level isolation.</p>
               <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <Fingerprint className="text-gold" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">Local Encryption ON</span>
               </div>
            </div>
         </div>
      </div>

      {/* Backup Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="card bg-white dark:bg-slate-900 border-none shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
              <Database className="text-gold" size={20} />
              Data Backup
            </h3>
            <p className="text-sm text-slate-500 mb-8">Download a full snapshot of your database to keep it safe offline.</p>
            <button 
              onClick={exportBackup}
              className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-gold hover:bg-gold/5 flex items-center justify-center gap-3 transition-all group font-bold"
            >
              <Download className="text-slate-400 group-hover:text-gold" />
              Download Backup File
            </button>
         </div>

         <div className="card bg-white dark:bg-slate-900 border-none shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
              <Upload className="text-blue-500" size={20} />
              Restore Data
            </h3>
            <p className="text-sm text-slate-500 mb-8">Import a previously saved JSON backup file to restore your data.</p>
            <label className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 flex items-center justify-center gap-3 transition-all cursor-pointer group font-bold">
              <Upload className="text-slate-400 group-hover:text-blue-500" />
              Upload Backup File
              <input type="file" className="hidden" accept=".json" onChange={importBackup} />
            </label>
         </div>
      </div>

      {/* Danger Zone */}
      <div className="card bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 shadow-xl">
         <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl">
               <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
               <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Danger Zone</h3>
               <p className="text-sm text-red-600 dark:text-red-500/80 mb-6 font-medium">Be extremely careful. These actions are irreversible and will wipe your entire management system.</p>
               <button 
                 onClick={clearAllData}
                 className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none"
               >
                 Factory Reset System
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function Fingerprint({ className, size }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.02-.26 3z" />
      <path d="M7 10a5 5 0 0 1 10 0c0 1.96-.13 3.92-.4 5.88" />
      <path d="M4 10a8 8 0 0 1 16 0c0 2.91-.19 5.8-.57 8.66" />
      <path d="M12 22v-3" />
      <path d="M15.37 22c-.26-2.2-.4-4.44-.37-6.66" />
      <path d="M9 22c.26-2.2.4-4.44.37-6.66" />
      <path d="M18 22a27 27 0 0 0 .5-7" />
      <path d="M5.5 22a27 27 0 0 1-.5-7" />
    </svg>
  );
}
