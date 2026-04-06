import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  LineChart, 
  ShieldPlus,
  Settings,
  Plus,
  LogOut,
  FileCheck,
  Users,
  Receipt,
  Building2,
  RefreshCw,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { role, logout, storeName, fullName } = useAuth();
  
  const portalNames: Record<string, string> = {
    'District Admin': 'Admin Portal',
    'Associate': 'Associate Panel',
    'Store Supervisor': 'Supervisor Panel',
    'Pharmacist': 'Pharmacist Panel'
  };
  const portalName = portalNames[role] || 'User Portal';

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Admin Overview', 
      path: '/admin',
      roles: ['District Admin']
    },
    { 
      icon: Building2, 
      label: 'Store Management', 
      path: '/admin/stores',
      roles: ['District Admin']
    },
    { 
      icon: LayoutDashboard, 
      label: 'Store Dashboard', 
      path: '/supervisor',
      roles: ['Store Supervisor']
    },
    { 
      icon: Package, 
      label: 'Inventory Control', 
      path: '/supervisor/inventory',
      roles: ['Store Supervisor']
    },
    { 
      icon: RefreshCw, 
      label: 'Stock Requests', 
      path: '/supervisor/transfers',
      roles: ['Store Supervisor']
    },
    { 
      icon: ClipboardList, 
      label: 'Billing Monitor', 
      path: '/supervisor/billing',
      roles: ['Store Supervisor']
    },
    { 
      icon: LineChart, 
      label: 'Store Analytics', 
      path: '/supervisor/analytics',
      roles: ['Store Supervisor']
    },
    { 
      icon: UserCheck, 
      label: 'Staff Activity', 
      path: '/supervisor/staff',
      roles: ['Store Supervisor']
    },
    { 
      icon: FileCheck, 
      label: 'Prescriptions', 
      path: '/pharmacist',
      roles: ['Pharmacist', 'District Admin']
    },
    { 
      icon: ClipboardList, 
      label: 'Billing / POS', 
      path: '/billing',
      roles: ['Associate', 'District Admin', 'Pharmacist'] // Note: Removed Supervisor from generic POS, they use Monitor
    },
    { 
      icon: Receipt, 
      label: 'Billing History', 
      path: '/billing/history',
      roles: ['Associate', 'District Admin', 'Pharmacist']
    },
    { 
      icon: Package, 
      label: 'Master Inventory', 
      path: '/inventory',
      roles: ['District Admin', 'Pharmacist']
    },
    { 
      icon: Users, 
      label: 'Staff Management', 
      path: '/admin/staff',
      roles: ['District Admin']
    },
  ];

    const roleMapping: Record<string, string> = {
      'Admin': 'District Admin',
      'Supervisor': 'Store Supervisor'
    };
    const activeRole = roleMapping[role] || role || 'Associate';
    const filteredItems = navItems.filter(item => item.roles.includes(activeRole));
  
    return (
      <AnimatePresence>
        <motion.aside 
          initial={false}
          animate={{ 
            width: isCollapsed ? 80 : 256
          }}
          style={{ minWidth: isCollapsed ? '80px' : '256px' }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className={cn(
            "bg-white text-slate-600 flex flex-col h-screen sticky top-0 border-r border-slate-100 shrink-0 relative z-30 transition-shadow",
            !isCollapsed && "shadow-2xl md:shadow-none"
          )}
        >
          {/* Toggle Slider Button - Optimized for Visibility */}
          <button 
            onClick={onToggle}
            className="absolute -right-4 top-10 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#111827] hover:text-emerald-600 hover:border-emerald-500 transition-all shadow-lg z-[100] group active:scale-95 hidden md:flex"
          >
            <div className="w-5 h-5 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </div>
          </button>
  
        <div className={cn("p-6 flex items-center gap-4 border-b border-slate-50 overflow-hidden", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-slate-50">
            <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-[#111827] font-extrabold text-base leading-tight tracking-tight">{portalName}</h1>
              <p className="text-[9px] text-slate-400 font-bold tracking-[0.1em] uppercase">Omnichannel Pharmacy</p>
            </motion.div>
          )}
        </div>
  
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-bold text-xs group",
                isActive 
                  ? "bg-[#D1FAE5] text-[#065F46]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0")} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

      <div className="mt-auto px-3 pb-6 space-y-1">
        {role === 'Associate' && !isCollapsed && (
          <button className="w-full flex items-center gap-2.5 px-3 py-3 bg-[#065F46] text-white rounded-lg font-bold text-xs shadow-lg shadow-emerald-900/10 hover:bg-[#047857] transition-all mb-4">
            <Plus className="w-4 h-4" />
            Quick Dispense
          </button>
        )}
        
        {!isCollapsed && (
          <div className="px-3 py-4 mb-4 bg-slate-50/50 rounded-xl border border-slate-100/50 mx-1">
            <p className="text-[10px] font-black text-[#065F46] uppercase tracking-widest mb-1">{fullName || 'User'}</p>
            <p className="text-[9px] text-slate-500 font-bold truncate">{storeName || 'Main Branch'}</p>
            <p className="text-[9px] text-slate-400 font-medium italic mt-1">{portalName}</p>
          </div>
        )}

        <NavLink 
          to={role === 'Store Supervisor' ? '/supervisor/settings' : '#'}
          title={isCollapsed ? 'Settings' : ''}
          className={({ isActive }) => cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-bold",
            isActive ? "bg-slate-100 text-[#065F46]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            isCollapsed && "justify-center"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
        </NavLink>
        <button 
          onClick={logout}
          title={isCollapsed ? 'Logout Session' : ''}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all text-xs font-bold", isCollapsed && "justify-center")}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Logout Session</span>}
        </button>
      </div>
    </motion.aside>
    </AnimatePresence>
  );
};
