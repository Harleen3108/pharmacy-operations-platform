import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  LineChart, 
  ShieldPlus,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: ClipboardList, label: 'Billing', path: '/sales' },
  { icon: LineChart, label: 'Insights', path: '/ai' },
];

export const Sidebar = () => {
  return (
    <aside className="w-72 bg-white text-slate-600 flex flex-col h-screen sticky top-0 border-r border-slate-100 shrink-0">
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#065F46] rounded-lg flex items-center justify-center text-white shadow-sm overflow-hidden">
          <ShieldPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-[#111827] font-extrabold text-lg leading-tight tracking-tight">Clinical Atelier</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.1em] uppercase">OPERATIONAL HUB</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm",
              isActive 
                ? "bg-[#D1FAE5] text-[#065F46]" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-5 h-5")} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-8 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-4 bg-[#065F46] text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-900/10 hover:bg-[#047857] transition-all mb-6">
          <Plus className="w-5 h-5" />
          Quick Dispense
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all text-sm font-medium">
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all text-sm font-medium">
          <HelpCircle className="w-5 h-5" />
          Support
        </button>
      </div>
    </aside>
  );
};
