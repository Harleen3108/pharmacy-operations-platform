import { useState } from 'react';
import { 
  Package, 
  AlertCircle, 
  RefreshCw, 
  ClipboardList,
  Clock,
  UserCheck,
  TrendingUp,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useInventory, useSales, useTransfers, useStores } from '../../hooks/useClinicalApi';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const TransferModal = ({ isOpen, onClose, storeId, inventory, stores, onInitiate }: any) => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden font-outfit"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#111827] text-white">
                    <div>
                        <h3 className="text-lg font-black tracking-tight">Stock Replenishment</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Movement Protocol</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><XCircle className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product</label>
                        <select 
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">Choose item...</option>
                            {inventory?.map((item: any) => (
                                <option key={item.id} value={item.product_id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Store</label>
                        <select 
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                        >
                            <option value="">Choose source branch...</option>
                            {stores?.filter((s: any) => s.id !== parseInt(storeId)).map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity Requested</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-outfit"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                        />
                    </div>

                    <button 
                        onClick={() => {
                            if (!selectedProduct || !selectedStore) return;
                            onInitiate({
                                product_id: parseInt(selectedProduct),
                                from_store_id: parseInt(selectedStore),
                                to_store_id: parseInt(storeId),
                                quantity: quantity
                            });
                            onClose();
                        }}
                        disabled={!selectedProduct || !selectedStore}
                        className="w-full py-3.5 bg-[#065F46] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#047857] transition-all disabled:opacity-50"
                    >
                        Confirm Request
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export const StoreSupervisorDashboard = () => {
  const { storeId, storeName } = useAuth();
  const numericStoreId = parseInt(storeId || '1');
  
  const inventoryQuery = useInventory('', numericStoreId);
  const storesQuery = useStores();
  const { summary } = useSales(numericStoreId);
  const transfers = useTransfers(numericStoreId);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

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

  const handleProcessTransfer = (id: number, status: string) => {
      transfers.process.mutate({ id, status });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-12 font-outfit px-4 md:px-0">
      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        storeId={numericStoreId}
        inventory={inventoryQuery.data}
        stores={storesQuery.stats.data}
        onInitiate={(data: any) => transfers.request.mutate(data)}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight mb-0.5">Operational Console</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs">Managing branch: <span className="font-bold text-[#065F46]">{storeName || 'Loading...'}</span></p>
        </div>
        <button 
            onClick={() => setIsTransferModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111827] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
            <RefreshCw className="w-3.5 h-3.5" />
            Inter-store Request
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4">
           <div className="w-10 h-10 md:w-11 md:h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
           </div>
           <div className="min-w-0">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-tight mb-0.5 truncate">Revenue</p>
              <h3 className="text-sm md:text-lg font-black text-[#111827] truncate">₹{summary.data?.total_sales?.toLocaleString() || '0'}</h3>
           </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4">
           <div className="w-10 h-10 md:w-11 md:h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0">
              <ClipboardList className="w-5 h-5 border-blue-100" />
           </div>
           <div className="min-w-0">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-tight mb-0.5 truncate">Txns</p>
              <h3 className="text-sm md:text-lg font-black text-[#111827] truncate">{summary.data?.total_transactions || '0'} Bills</h3>
           </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4">
           <div className="w-10 h-10 md:w-11 md:h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
           </div>
           <div className="min-w-0">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-tight mb-0.5 truncate">Low Stock</p>
              <h3 className="text-sm md:text-lg font-black text-[#111827] truncate">{lowStockItems.length} SKUs</h3>
           </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4">
           <div className="w-10 h-10 md:w-11 md:h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100 flex-shrink-0">
              <Clock className="w-5 h-5" />
           </div>
           <div className="min-w-0">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-tight mb-0.5 truncate">Expiring</p>
              <h3 className="text-sm md:text-lg font-black text-[#111827] truncate">{expiringSoon.length} Batches</h3>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white p-5 md:p-7 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-black text-[#111827] text-base md:text-lg">Replenishment Feed</h3>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium">Inter-store balance and stock flow</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {transfers.list.data?.length === 0 ? (
                        <div className="py-12 text-center border-2 border-dashed border-slate-50 rounded-xl">
                            <RefreshCw className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-[11px] md:text-xs tracking-tight">No active stock transfers in pipeline</p>
                        </div>
                    ) : (
                        transfers.list.data?.map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between p-3 md:p-4 bg-slate-50/50 rounded-xl border border-slate-100 group transition-all">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${t.from_store_name === storeName ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        {t.from_store_name === storeName ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-[#111827] text-xs md:text-sm truncate">{t.product_name}</h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate mt-0.5">
                                            {t.from_store_name === storeName ? t.to_store_name : t.from_store_name} • Qty: {t.quantity}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border truncate ${
                                        t.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                        t.status === 'approved' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {t.status}
                                    </span>
                                    {t.status === 'pending' && t.from_store_name === storeName && (
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleProcessTransfer(t.id, 'approved')}
                                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    {t.status === 'approved' && t.to_store_name === storeName && (
                                        <button 
                                            onClick={() => handleProcessTransfer(t.id, 'received')}
                                            className="px-3 py-1.5 bg-[#065F46] text-white text-[9px] font-black uppercase rounded-lg"
                                        >
                                            Receive
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white p-5 md:p-7 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <div>
                        <h3 className="font-black text-[#111827] text-base md:text-lg">Staff Performance</h3>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-tight">Daily associate contribution summary</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                   {summary.data?.staff_activity?.length === 0 ? (
                       <p className="col-span-2 py-8 text-center text-slate-400 font-bold text-[11px] md:text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">No session activity recorded.</p>
                   ) : (
                       summary.data?.staff_activity?.map((staff: any) => (
                        <div key={staff.name} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-100 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                                 <UserCheck className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-xs md:text-sm font-black text-[#111827] truncate">{staff.name}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{staff.transactions} Txns</p>
                              </div>
                           </div>
                           <div className="text-right flex-shrink-0">
                              <p className="text-xs md:text-sm font-black text-[#065F46]">₹{staff.volume.toLocaleString()}</p>
                           </div>
                        </div>
                    ))
                   )}
                </div>
            </div>
        </div>

        <div className="space-y-4 md:space-y-6">
            <div className="bg-[#111827] p-6 md:p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Priority Center</span>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Critical Stock Out Risk</h4>
                            <div className="space-y-2">
                                {lowStockItems.slice(0, 3).map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                        <span className="text-xs font-bold truncate pr-3">{item.name}</span>
                                        <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">{item.batches[0].current_quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Expiry Alerts</h4>
                            <div className="space-y-2">
                                {expiringSoon.slice(0, 3).map((batch: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                        <span className="text-xs font-bold truncate pr-3">{batch.productName}</span>
                                        <span className="text-[9px] font-black text-orange-400">{batch.expiry_date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-3.5 bg-white text-[#111827] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Sync Network
                    </button>
                </div>
                <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                    <Package className="w-32 h-32" />
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 md:mb-5">
                    <Clock className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="font-black text-[#111827] text-base md:text-lg mb-1.5 truncate">Ops Report</h3>
                <p className="text-[11px] md:text-sm text-slate-500 leading-relaxed mb-4 md:mb-6 px-2">
                    Automated system health and reorder summary report.
                </p>
                <button className="flex items-center gap-2 text-[#065F46] font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all group">
                    Intelligence Link
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
