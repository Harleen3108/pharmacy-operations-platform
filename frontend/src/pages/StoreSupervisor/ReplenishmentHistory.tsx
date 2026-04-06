import { useState } from 'react';
import { RefreshCw, ArrowUpRight, ArrowDownLeft, CheckCircle2, Filter, CheckCircle, Truck, Plus, X, Search } from 'lucide-react';
import { useTransfers, useInventory, useStores } from '../../hooks/useClinicalApi';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Request Modal Component
const RequestModal = ({ isOpen, onClose, onSubmit, products, stores, currentStoreId }: any) => {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [productSearch, setProductSearch] = useState('');

    const filteredProducts = products?.filter((p: any) => 
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    ) || [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100"
            >
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-[#111827]">Initialize Replenishment</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inter-branch inventory movement</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Product Search & Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Clinical Asset</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input 
                                type="text"
                                placeholder="Search medicine registry..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                            />
                        </div>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-100">
                            {filteredProducts.map((p: any) => (
                                <button 
                                    key={p.id}
                                    onClick={() => setSelectedProduct(p)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center",
                                        selectedProduct?.id === p.id ? "bg-blue-50 border-blue-200" : "bg-white border-slate-50 hover:border-slate-200"
                                    )}
                                >
                                    <span className="text-xs font-bold text-slate-700">{p.name}</span>
                                    {selectedProduct?.id === p.id && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Hub</label>
                            <select 
                                value={selectedStore}
                                onChange={(e) => setSelectedStore(e.target.value)}
                                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none ring-offset-0 focus:ring-2 focus:ring-blue-500/10"
                            >
                                <option value="">Select Branch</option>
                                {stores?.filter((s: any) => s.id !== currentStoreId).map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Volume (Units)</label>
                            <input 
                                type="number" 
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-0">
                    <button 
                        onClick={() => onSubmit({ product_id: selectedProduct?.id, from_store_id: parseInt(selectedStore), quantity })}
                        disabled={!selectedProduct || !selectedStore || quantity < 1}
                        className="w-full py-4 bg-[#111827] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Submit Stock Request
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export const ReplenishmentHistory = () => {
  const { storeId, storeName } = useAuth();
  const numericStoreId = parseInt(storeId || '1');
  const transfers = useTransfers(numericStoreId);
  const inventory = useInventory(undefined, numericStoreId);
  const stores = useStores();
  
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const handleCreateRequest = async (data: any) => {
      try {
          await transfers.request.mutateAsync({
              ...data,
              to_store_id: numericStoreId
          });
          setIsRequestModalOpen(false);
      } catch (error) {
          alert("Request Protocol Failed");
      }
  };

  const handleProcess = (id: number, status: string) => {
      transfers.process.mutate({ id, status });
  };

  const filteredTransfers = transfers.list.data?.filter((t: any) => {
    const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'incoming' && t.to_store_id === numericStoreId) ||
        (activeTab === 'outgoing' && t.from_store_id === numericStoreId);
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesTab && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-12 font-outfit px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">Stock Requests</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs">Inter-store logistics and replenishment logs</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="flex items-center gap-2.5 px-6 py-2.5 bg-[#111827] text-white rounded-[14px] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10"
            >
                <Plus className="w-4 h-4" />
                Initialize Request
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-[14px] border border-blue-100">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-blue-700 uppercase">{transfers.list.data?.length || 0} Transfers active</span>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <RequestModal 
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
            onSubmit={handleCreateRequest}
            products={inventory.data} // Use inventory from current store as a basis or a global list
            stores={stores.stats.data}
            currentStoreId={numericStoreId}
        />

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
