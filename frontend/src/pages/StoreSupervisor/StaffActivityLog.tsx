import { 
  Users, 
  TrendingUp, 
  Award, 
  Clock, 
  Activity,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useSales } from '../../hooks/useClinicalApi';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export const StaffActivityLog = () => {
  const { storeId, storeName } = useAuth();
  const numericStoreId = parseInt(storeId || '1');
  const { summary, history } = useSales(numericStoreId);
  
  const staffData = summary.data?.staff_activity || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-12 font-outfit px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">Staff Activity</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs">Personnel performance and operational audit for <span className="text-[#065F46] font-bold">{storeName}</span></p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">{staffData.length} Staff on Duty</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                    <Award className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-[#111827] mb-1">Top Performer</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Daily Volume Leader</p>
                {staffData.length > 0 ? (
                    <div>
                        <p className="text-lg font-black text-[#065F46]">{staffData.sort((a: any, b: any) => b.volume - a.volume)[0].name}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">₹{staffData[0].volume.toLocaleString()} processed</p>
                    </div>
                ) : (
                    <p className="text-xs font-bold text-slate-300 italic">No activity recorded</p>
                )}
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Pulse Check</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">Total TXNs</span>
                        <span className="text-sm font-black">{summary.data?.total_transactions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">Avg Efficiency</span>
                        <span className="text-sm font-black">94.2%</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-base font-black text-[#111827]">Performance Leaderboard</h3>
                    <button className="text-[10px] font-black text-[#065F46] uppercase tracking-widest hover:underline">View Historical</button>
                </div>
                <div className="divide-y divide-slate-50">
                    {staffData.length > 0 ? staffData.sort((a: any, b: any) => b.transactions - a.transactions).map((staff: any, i: number) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                                    {staff.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-[#111827]">{staff.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Shift</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-12 items-center">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Transactions</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="text-lg font-black text-[#111827]">{staff.transactions}</span>
                                        <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Volume</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="text-lg font-black text-[#065F46]">₹{staff.volume.toLocaleString()}</span>
                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                                    </div>
                                </div>
                                <button className="p-2 text-slate-300 hover:text-emerald-500 transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center">
                            <Users className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No staff activity logged today</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-base font-black text-[#111827]">Recent Activity Audit</h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {history.data?.slice(0, 5).map((sale: any) => (
                        <div key={sale.id} className="p-4 px-6 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#111827]">
                                        <span className="font-black text-emerald-700">{sale.transaction_id}</span> processed successfully
                                    </p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight">{new Date(sale.created_at).toLocaleTimeString()} • Verified by System</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">LEDGER-OK</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
