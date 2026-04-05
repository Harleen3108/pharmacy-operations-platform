import { 
  Settings, 
  Bell, 
  Lock, 
  Palette, 
  MapPin, 
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const SupervisorSettings = () => {
  const { storeName, role } = useAuth();

  const sections = [
    { title: 'Store Profile', icon: MapPin, desc: 'Manage branch contact details and address.' },
    { title: 'Notifications', icon: Bell, desc: 'Configure low stock and expiry alerts.' },
    { title: 'Security', icon: Lock, desc: 'Update passwords and session privacy.' },
    { title: 'Display', icon: Palette, desc: 'High-contrast mode and UI scaling.' },
    { title: 'Inventory Rules', icon: ShieldCheck, desc: 'Automated replenishment thresholds.' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-12 font-outfit px-4 md:px-0">
      <div>
        <h1 className="text-2xl font-black text-[#111827] tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium text-xs">Environment configuration for <span className="text-[#065F46] font-bold">{storeName}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                        <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[#111827]">{role}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Access Level</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        Clinical Ledger Access
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        Inventory Reconciliation
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Build Identifier</p>
                <p className="text-[10px] font-mono text-slate-400">v2.4.0-stable_branch_alpha</p>
            </div>
        </div>

        <div className="md:col-span-2 space-y-3">
            {sections.map((section, idx) => (
                <button 
                    key={idx}
                    className="w-full bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#065F46] group-hover:bg-emerald-50 transition-colors">
                            <section.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-black text-[#111827]">{section.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{section.desc}</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
