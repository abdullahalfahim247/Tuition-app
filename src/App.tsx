import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Wallet, 
  GraduationCap, 
  FileText, 
  Settings, 
  UserCircle, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  IdCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Dashboard } from './components/dashboard/Dashboard';
import { Students } from './components/students/Students';
import { Attendance } from './components/attendance/Attendance';
import { Fees } from './components/fees/Fees';
import { Exams } from './components/exams/Exams';
import { Reports } from './components/reports/Reports';
import { Settings as SettingsPage } from './components/settings/Settings';
import { About } from './components/about/About';

type View = 'dashboard' | 'students' | 'attendance' | 'fees' | 'exams' | 'reports' | 'settings' | 'about';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'fees', label: 'Tuition Fees', icon: Wallet },
    { id: 'exams', label: 'Exams & Results', icon: GraduationCap },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'about', label: 'About Teacher', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  return (
    <div className={cn("min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300")}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-navy dark:bg-slate-900 text-white z-50 shadow-2xl flex flex-col"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-navy font-bold text-xl shadow-lg">
                  F
                </div>
                <div>
                  <h1 className="font-bold text-lg leading-tight uppercase tracking-wider">Fahim</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Tuition Mgmt</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                currentView === item.id 
                  ? "bg-gold text-navy shadow-lg font-semibold" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn("shrink-0", currentView === item.id ? "text-navy" : "group-hover:scale-110 transition-transform")} />
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition-colors rounded-xl font-medium"
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            {isSidebarOpen && <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors rounded-xl font-medium"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen",
        isSidebarOpen ? "ml-[280px]" : "ml-[80px]"
      )}>
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-bottom border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {menuItems.find(i => i.id === currentView)?.label}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Welcome back, Abdullah al Fahim</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-navy dark:text-gold uppercase tracking-tighter">Premium License</span>
              <span className="text-[10px] text-slate-400">Offline Active</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-gold p-0.5">
              <img 
                src="https://raw.githubusercontent.com/A-A-Fahim/A.A.Fahim/main/fahim.jpg" 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://graph.facebook.com/A.A.Fahim.me/picture?type=large';
                }}
              />
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && <Dashboard onNavigate={(v) => setCurrentView(v as View)} />}
              {currentView === 'students' && <Students />}
              {currentView === 'attendance' && <Attendance />}
              {currentView === 'fees' && <Fees />}
              {currentView === 'exams' && <Exams />}
              {currentView === 'reports' && <Reports />}
              {currentView === 'settings' && <SettingsPage />}
              {currentView === 'about' && <About />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
