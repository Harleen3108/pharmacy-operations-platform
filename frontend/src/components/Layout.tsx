import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, Grid } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { storeName } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-10 text-outfit">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search prescriptions, patients, or stock..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D1FAE5] rounded-lg border border-emerald-100">
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              <span className="text-xs font-bold text-[#065F46]">{storeName || 'Main Branch'}</span>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
                <Grid className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-100 ml-2">
              <div className="w-9 h-9 bg-slate-200 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100&h=100" 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
