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
  Building2
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = () => {
  const { role, logout } = useAuth();

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
      icon: FileCheck, 
      label: 'Prescriptions', 
      path: '/pharmacist',
      roles: ['Pharmacist', 'District Admin']
    },
    { 
      icon: ClipboardList, 
      label: 'Billing / POS', 
      path: '/billing',
      roles: ['Associate', 'Store Supervisor', 'District Admin', 'Pharmacist']
    },
    { 
      icon: Receipt, 
      label: 'Billing History', 
      path: '/billing/history',
      roles: ['Associate', 'Store Supervisor', 'District Admin', 'Pharmacist']
    },
    { 
      icon: Package, 
      label: 'Inventory', 
      path: '/inventory',
      roles: ['Store Supervisor', 'District Admin', 'Pharmacist']
    },
    { 
      icon: LineChart, 
      label: 'AI Insights', 
      path: '/ai',
      roles: ['District Admin', 'Store Supervisor']
    },
    { 
      icon: Users, 
      label: 'Staff Management', 
      path: '/admin/staff',
      roles: ['District Admin']
    },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-72 bg-white text-slate-600 flex flex-col h-screen sticky top-0 border-r border-slate-100 shrink-0">
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#065F46] rounded-lg flex items-center justify-center text-white shadow-sm overflow-hidden">
          <ShieldPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-[#111827] font-extrabold text-lg leading-tight tracking-tight">Clinical Atelier</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.1em] uppercase">{role} HUB</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all font-bold text-xs",
              isActive 
                ? "bg-[#D1FAE5] text-[#065F46]" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-4 h-4")} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 pb-6 space-y-0.5">
        {role === 'Associate' && (
          <button className="w-full flex items-center gap-2.5 px-3 py-3 bg-[#065F46] text-white rounded-lg font-bold text-xs shadow-lg shadow-emerald-900/10 hover:bg-[#047857] transition-all mb-4">
            <Plus className="w-4 h-4" />
            Quick Dispense
          </button>
        )}

        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all text-xs font-bold">
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          Logout Session
        </button>
      </div>
    </aside>
  );
};
