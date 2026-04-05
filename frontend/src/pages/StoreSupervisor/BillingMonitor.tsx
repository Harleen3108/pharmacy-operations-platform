import { useState } from 'react';
import { 
  Search, 
  Calendar,
  Receipt,
  User,
  CreditCard,
  Banknote,
  Eye
} from 'lucide-react';
import { useSales } from '../../hooks/useClinicalApi';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const BillingMonitor = () => {
  const { storeId, storeName } = useAuth();
  const numericStoreId = parseInt(storeId || '1');
  const { history } = useSales(numericStoreId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSales = history.data?.filter((sale: any) => {
    const matchesSearch = 
        sale.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sale.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-12 font-outfit px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">Billing Monitor</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs">Live stream of pharmacy transactions for <span className="text-[#065F46] font-bold">{storeName}</span></p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Audit Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Receipt className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total TXNs</p>
                <h3 className="text-lg font-black text-[#111827]">{history.data?.length || 0}</h3>
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Banknote className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Gross Volume</p>
                <h3 className="text-lg font-black text-[#111827]">₹{history.data?.reduce((acc: number, s: any) => acc + s.total_amount, 0).toLocaleString() || '0'}</h3>
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <User className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Ticket</p>
                <h3 className="text-lg font-black text-[#111827]">
                    ₹{history.data?.length ? (history.data.reduce((acc: number, s: any) => acc + s.total_amount, 0) / history.data.length).toFixed(1) : '0'}
                </h3>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/30">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by Transaction ID or Customer..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer shadow-sm"
                >
                    <option value="all">Status: All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#065F46] transition-all shadow-sm">
                    <Calendar className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Preview</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredSales?.map((sale: any) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <span className="text-xs font-black text-[#111827]">{sale.transaction_id}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-[#111827] truncate">{sale.customer_name || 'Walk-in Customer'}</p>
                                    <p className="text-[9px] text-slate-400 font-bold tracking-tight">{sale.customer_mobile || 'No Mobile'}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {sale.payment_method === 'card' ? <CreditCard className="w-3.5 h-3.5 text-blue-500" /> : <Banknote className="w-3.5 h-3.5 text-emerald-500" />}
                                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{sale.payment_method}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm font-black text-[#065F46]">₹{sale.total_amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-600">{new Date(sale.created_at).toLocaleDateString()}</p>
                                    <p className="text-[9px] text-slate-400 font-medium">{new Date(sale.created_at).toLocaleTimeString()}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                                    <Eye className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {(!filteredSales || filteredSales.length === 0) && !history.isLoading && (
                <div className="py-20 text-center bg-white">
                    <Receipt className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No transaction logs in current scope</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
