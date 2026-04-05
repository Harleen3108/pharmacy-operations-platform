import { useState } from 'react';
import { 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Filter,
  CheckCircle,
  Truck
} from 'lucide-react';
import { useTransfers } from '../../hooks/useClinicalApi';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const ReplenishmentHistory = () => {
  const { storeId, storeName } = useAuth();
  const numericStoreId = parseInt(storeId || '1');
  const transfers = useTransfers(numericStoreId);
  
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransfers = transfers.list.data?.filter((t: any) => {
    const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'incoming' && t.to_store_id === numericStoreId) ||
        (activeTab === 'outgoing' && t.from_store_id === numericStoreId);
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesTab && matchesStatus;
  });

  const handleProcess = (id: number, status: string) => {
      transfers.process.mutate({ id, status });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-12 font-outfit px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">Stock Requests</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs">Inter-store logistics and replenishment logs</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
            <Truck className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-700 uppercase">{transfers.list.data?.length || 0} Transfers active</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row border-b border-slate-50">
            <div className="flex p-2 gap-1 bg-slate-50/50">
                {(['all', 'incoming', 'outgoing'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === tab ? "bg-white text-[#111827] shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="flex-1 flex items-center px-6 gap-4 border-t md:border-t-0 md:border-l border-slate-50 py-3 md:py-0">
                <Filter className="w-3.5 h-3.5 text-slate-300" />
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">In Transit</option>
                    <option value="received">Completed</option>
                </select>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Movement</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Medicine</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Store Context</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode='popLayout'>
                        {filteredTransfers?.map((t: any) => (
                            <motion.tr 
                                key={t.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="hover:bg-slate-50/30 transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                        t.from_store_id === numericStoreId ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
                                    )}>
                                        {t.from_store_id === numericStoreId ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs font-black text-[#111827]">{t.product_name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Request ID: #{t.id}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-black text-[#111827]">{t.quantity}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <p className="text-[10px] font-bold text-slate-600">
                                            {t.from_store_id === numericStoreId ? `Shipping to ${t.to_store_name}` : `Incoming from ${t.from_store_name}`}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "text-[8px] font-black uppercase px-2.5 py-1 rounded-full border",
                                        t.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                        t.status === 'approved' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    )}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {t.status === 'pending' && t.from_store_id === numericStoreId && (
                                            <button 
                                                onClick={() => handleProcess(t.id, 'approved')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                Approve
                                            </button>
                                        )}
                                        {t.status === 'approved' && t.to_store_id === numericStoreId && (
                                            <button 
                                                onClick={() => handleProcess(t.id, 'received')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                Confirm Receipt
                                            </button>
                                        )}
                                        {t.status === 'received' && (
                                            <span className="text-[10px] font-bold text-slate-300 italic">Transferred</span>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
            
            {(!filteredTransfers || filteredTransfers.length === 0) && !transfers.list.isLoading && (
                <div className="py-20 text-center bg-white border-t border-slate-50">
                    <RefreshCw className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching transfers found</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
