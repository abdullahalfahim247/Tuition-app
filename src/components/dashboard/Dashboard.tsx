import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Wallet, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  CreditCard, 
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../lib/db';
import { cn, formatCurrency } from '../../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    todayAttendance: 0,
    dueFees: 0,
    totalIncome: 0,
    monthlyIncome: 0,
  });

  const [recentStudents, setRecentStudents] = useState<any[]>([]);

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const allStudents = await db.students.toArray();
      const active = allStudents.filter(s => s.status === 'Active');
      
      const today = new Date().toISOString().split('T')[0];
      const todayAtt = await db.attendance.where('date').equals(today).count();
      
      const allFees = await db.fees.toArray();
      const income = allFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
      const dues = allFees.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthIncome = allFees
        .filter(f => f.status === 'Paid' && f.paymentDate.startsWith(currentMonth))
        .reduce((sum, f) => sum + f.amount, 0);

      setStats({
        totalStudents: allStudents.length,
        activeStudents: active.length,
        todayAttendance: todayAtt,
        dueFees: dues,
        totalIncome: income,
        monthlyIncome: monthIncome
      });

      const recent = await db.students.orderBy('id').reverse().limit(5).toArray();
      setRecentStudents(recent);

      // Generate real chart data from last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mKey = d.toISOString().slice(0, 7);
        const mName = d.toLocaleString('default', { month: 'short' });
        
        const mIncome = allFees
          .filter(f => f.status === 'Paid' && f.paymentDate.startsWith(mKey))
          .reduce((sum, f) => sum + f.amount, 0);
          
        months.push({ name: mName, income: mIncome });
      }
      setChartData(months);
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-blue-500" />} 
          label="Total Students" 
          value={stats.totalStudents} 
          subValue={`${stats.activeStudents} Active`}
          color="blue"
        />
        <StatCard 
          icon={<CalendarCheck className="text-green-500" />} 
          label="Today Attendance" 
          value={stats.todayAttendance} 
          subValue="Students Marked"
          color="green"
        />
        <StatCard 
          icon={<AlertCircle className="text-amber-500" />} 
          label="Due Fees" 
          value={formatCurrency(stats.dueFees)} 
          subValue="Payment Pending"
          color="amber"
        />
        <StatCard 
          icon={<TrendingUp className="text-emerald-500" />} 
          label="Monthly Income" 
          value={formatCurrency(stats.monthlyIncome)} 
          subValue="Received this month"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 card bg-white dark:bg-slate-900 border-none shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="text-gold" size={20} />
              Income Analytics
            </h3>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold px-3 py-2 outline-none">
              <option>Last 7 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card bg-navy text-white border-none shadow-xl">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <PlusCircle className="text-gold" size={20} />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton icon={<UserPlus />} label="Add Student" onClick={() => onNavigate('students')} />
              <ActionButton icon={<CalendarCheck />} label="Mark Attendance" onClick={() => onNavigate('attendance')} />
              <ActionButton icon={<CreditCard />} label="Pay Fee" onClick={() => onNavigate('fees')} />
              <ActionButton icon={<Clock />} label="Reminders" onClick={() => onNavigate('reports')} />
            </div>
          </div>

          <div className="card bg-white dark:bg-slate-900 border-none shadow-xl">
            <h3 className="font-bold text-lg mb-4">Recent Students</h3>
            <div className="space-y-4">
              {recentStudents.map(student => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-navy dark:text-gold">
                    {student.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{student.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{student.className} • Roll {student.rollNumber}</p>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    student.status === 'Active' ? "bg-green-500" : "bg-red-500"
                  )} />
                </div>
              ))}
              {recentStudents.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No students added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card bg-white dark:bg-slate-900 border-none shadow-xl flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", `bg-${color}-500/10`)}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
          <p className="text-2xl font-black text-navy dark:text-white mt-1">{value}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subValue}</p>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="p-4 bg-white/10 hover:bg-gold hover:text-navy transition-all rounded-xl flex flex-col items-center justify-center gap-2 group text-white active:scale-95"
    >
      <div className="group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
