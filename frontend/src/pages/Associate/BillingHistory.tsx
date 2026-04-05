import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Receipt, 
  Calendar,
  User,
  Phone,
  CreditCard,
  Banknote,
  SearchX,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useSales } from '../../hooks/useClinicalApi';
import { cn } from '../../lib/utils';

export const BillingHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { history } = useSales(1); // Fetch all history
  
  const filteredSales = history.data?.filter((sale: any) => 
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_mobile?.includes(searchTerm) ||
    sale.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-8 font-outfit">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Financial Audit Log</span>
          </div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Billing & Transaction History</h1>
          <p className="text-slate-500 font-medium text-xs mt-0.5">Cross-branch sales records and patient billing data.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[10px] text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-1" />
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
             <button className="px-3 py-1.5 text-[9px] font-black uppercase rounded-lg bg-white text-[#111827] shadow-sm">All Stores</button>
             <button className="px-3 py-1.5 text-[9px] font-black uppercase rounded-lg text-slate-400 hover:text-slate-600 transition-all">This Store</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header / Filters */}
        <div className="p-5 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
              <Filter className="w-3.5 h-3.5" />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/20">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tx ID</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Branch</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Audit Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSales?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <SearchX className="w-12 h-12 text-slate-300" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales?.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-[#111827] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {sale.transaction_id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 flex-shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#111827]">{sale.customer_name}</p>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-2.5 h-2.5" />
                            <span className="text-[9px] font-bold">{sale.customer_mobile || 'No Mobile'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500">{sale.store_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0">
                        <p className="text-xs font-bold text-[#111827]">{new Date(sale.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest",
                        sale.payment_method === 'cash' 
                          ? "bg-amber-50 border-amber-100 text-amber-700" 
                          : "bg-blue-50 border-blue-100 text-blue-700"
                      )}>
                        {sale.payment_method === 'cash' ? <Banknote className="w-2.5 h-2.5" /> : <CreditCard className="w-2.5 h-2.5" />}
                        {sale.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[#111827]">₹{sale.total_amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-[#111827] hover:text-white transition-all border border-slate-100 hover:border-[#111827]">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {filteredSales?.length || 0} Professional Records</p>
          <div className="flex gap-2">
             <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-lg opacity-50 cursor-not-allowed">Previous</button>
             <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm">Next Page</button>
          </div>
        </div>
      </div>
    </div>
  );
};
