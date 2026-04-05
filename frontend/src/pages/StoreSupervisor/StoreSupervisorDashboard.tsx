import { 
  Package, 
  AlertCircle, 
  RefreshCw, 
  ClipboardList,
  Clock,
  UserCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useInventory, useSales } from '../../hooks/useClinicalApi';

export const StoreSupervisorDashboard = () => {
  const storeId = 1; // Logged in store context
  const inventoryQuery = useInventory();
  const { summary } = useSales(storeId);

  const lowStockItems = inventoryQuery.data?.filter((i: any) => i.batches.some((b: any) => b.current_quantity < 20)) || [];
  const expiringSoon = inventoryQuery.data?.flatMap((i: any) => 
    i.batches.filter((b: any) => {
      const expiry = new Date(b.expiry_date);
      const today = new Date();
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays < 90 && diffDays > 0;
    }).map((b: any) => ({ ...b, productName: i.name }))
  ) || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-outfit">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight mb-2">Store Manager Console</h1>
          <p className="text-slate-500 font-medium text-sm">Managing Main St. Central Pharmacy Operations.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
           <div className="px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-[#065F46] uppercase tracking-widest text-left">Live Telemetry</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Daily Store Revenue</p>
              <h3 className="text-2xl font-black text-[#111827]">₹{summary.data?.total_sales?.toLocaleString() || '0'}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Critical Stock Alerts</p>
              <h3 className="text-2xl font-black text-[#111827]">{lowStockItems.length} SKUs</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
              <Clock className="w-6 h-6" />
           </div>
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Batches Expiring</p>
              <h3 className="text-2xl font-black text-[#111827]">{expiringSoon.length} Batches</h3>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Core Management Cards */}
        <div className="space-y-6">
           {/* Inter-store Transfer Card */}
           <div className="bg-[#111827] p-8 rounded-2xl text-white relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                    <div className="flex items-center gap-2 mb-6">
                       <RefreshCw className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400">Inventory Liquidity</span>
                    </div>
                    <h3 className="text-2xl font-black mb-4">Inter-store Stock Transfer</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
                       Move excess inventory to high-demand branches or request urgent stock from the North Hub depot.
                    </p>
                 </div>
                 <button className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                    Initiate Transfer Protocol
                    <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
              <RefreshCw className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
           </div>

           {/* Staff Activity List */}
           <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-black text-[#111827]">Personnel On-Duty</h3>
                 <span className="text-[10px] font-black text-emerald-600 uppercase">3 active sessions</span>
              </div>
              <div className="space-y-4">
                 {[
                    { name: 'Dr. Sarah Wilson', role: 'Lead Pharmacist', status: 'Verifying', time: '10m ago' },
                    { name: 'John Doe', role: 'Sr. Associate', status: 'At POS #1', time: '2m ago' },
                    { name: 'Jane Smith', role: 'Associate', status: 'Inventory Audit', time: 'Now' },
                 ].map((staff) => (
                    <div key={staff.name} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-50">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                             <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-[#111827]">{staff.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{staff.role}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-600 uppercase">{staff.status}</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">{staff.time}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Inventory Intelligence Sidebar */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                 <div>
                    <h3 className="font-black text-[#111827]">Critical Action Queue</h3>
                    <p className="text-xs text-slate-400 font-medium">Automatic system priorities for today</p>
                 </div>
                 <div className="w-10 h-10 bg-[#065F46] rounded-xl flex items-center justify-center text-white">
                    <ClipboardList className="w-5 h-5" />
                 </div>
              </div>

              <div className="flex-1 space-y-4">
                 {lowStockItems.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-rose-100 bg-rose-50/30 rounded-xl">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                          <div>
                             <p className="text-xs font-bold text-[#111827]">{item.name}</p>
                             <p className="text-[10px] text-rose-600 font-bold uppercase">Replenish ASAP</p>
                          </div>
                       </div>
                       <span className="text-xs font-black text-rose-700">{item.batches[0].current_quantity} Units left</span>
                    </div>
                 ))}

                 {expiringSoon.slice(0, 3).map((batch: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-orange-100 bg-orange-50/30 rounded-xl">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div>
                             <p className="text-xs font-bold text-[#111827]">{batch.productName}</p>
                             <p className="text-[10px] text-orange-600 font-bold uppercase">Exp: {batch.expiry_date}</p>
                          </div>
                       </div>
                       <Package className="w-4 h-4 text-orange-400" />
                    </div>
                 ))}
                 
                 {lowStockItems.length === 0 && expiringSoon.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                       <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                          <UserCheck className="w-8 h-8" />
                       </div>
                       <p className="text-sm font-bold text-[#111827]">Operations are Stable</p>
                       <p className="text-xs text-slate-400 max-w-[200px] mt-2">No critical stock or expiry issues detected in this store session.</p>
                    </div>
                 )}
              </div>

              <button className="w-full mt-6 py-4 bg-slate-50 hover:bg-slate-100 text-[#111827] border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                 Generate Mid-Day Operations Report
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
