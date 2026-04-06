import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, Grid, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { role, storeName, fullName } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const portalNames: Record<string, string> = {
    'District Admin': 'Admin Portal',
    'Associate': 'Associate Panel',
    'Store Supervisor': 'Supervisor Panel',
    'Pharmacist': 'Pharmacist Panel'
  };
  const portalName = portalNames[role] || 'User Portal';

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans relative overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40] md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Positioned for Mobile Drawer and Desktop Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-[50] transition-transform duration-300 transform md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="h-20 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 font-outfit">
          <div className="flex items-center gap-3">
             {/* Mobile Menu Toggle */}
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden"
             >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>

             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#D1FAE5] rounded-lg border border-emerald-100">
                <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                <span className="text-[10px] md:text-xs font-bold text-[#065F46] truncate max-w-[100px] md:max-w-none">{storeName || 'Main Branch'}</span>
              </div>
          </div>

          <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none text-xs font-bold text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <span className="text-[10px] md:text-[11px] font-black text-[#111827] leading-none text-right">{fullName || 'User'}</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">{portalName}</span>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="hidden sm:block p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
