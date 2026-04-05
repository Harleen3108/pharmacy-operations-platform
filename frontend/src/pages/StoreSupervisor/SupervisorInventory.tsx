import { useState } from 'react';
import { 
  Search,
  Download,
  Loader2,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Package,
  TrendingDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useInventory, useInventoryMutation } from '../../hooks/useClinicalApi';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export const SupervisorInventory = () => {
  const { storeId, storeName } = useAuth();
  const numericStoreId = parseInt(storeId || '1');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentTarget, setAdjustmentTarget] = useState<any>(null);
  
  const { data: products, isLoading } = useInventory(searchQuery, numericStoreId);
  const { updateStock } = useInventoryMutation();

  const getStockStatus = (item: any) => {
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    const hasExpired = item.batches?.some((b: any) => new Date(b.expiry_date) <= today);
    if (hasExpired) return 'EXPIRED';

    const isLowStock = item.stock_level <= 20;
    if (isLowStock) return 'LOW_STOCK';

    const isNearExpiry = item.batches?.some((b: any) => new Date(b.expiry_date) <= ninetyDaysFromNow);
    if (isNearExpiry) return 'NEAR_EXPIRY';

    return 'HEALTHY';
  };

  const handleExport = () => {
    alert(`Exporting Inventory Audit for ${storeName}...`);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-12 font-outfit px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">Inventory Control</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs italic">Branch Ledger: <span className="text-[#065F46] font-bold not-italic">{storeName}</span></p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button 
                onClick={handleExport}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
                <Download className="w-3.5 h-3.5" />
                Audit Log
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Filter branch inventory..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-bold shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 gap-3">
                {isLoading ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditing Stock...</p>
                    </div>
                ) : products?.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-slate-100">
                        <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No stock records found</p>
                    </div>
                ) : (
                    products?.map((item: any) => (
                        <div 
                            key={item.id}
                            onClick={() => setSelectedProduct(item)}
                            className={cn(
                                "bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center cursor-pointer transition-all hover:shadow-md hover:border-emerald-100 group",
                                selectedProduct?.id === item.id && "ring-2 ring-emerald-500/10 border-emerald-200"
                            )}
                        >
                            <div className="flex gap-4 items-center min-w-0">
                                <div className={cn(
                                    "w-1.5 h-10 rounded-full shrink-0",
                                    getStockStatus(item) === 'EXPIRED' ? "bg-rose-500" :
                                    getStockStatus(item) === 'LOW_STOCK' ? "bg-rose-400" :
                                    getStockStatus(item) === 'NEAR_EXPIRY' ? "bg-amber-500" : "bg-emerald-500"
                                )} />
                                <div className="min-w-0">
                                    <h3 className="font-black text-[#111827] text-sm md:text-base truncate">{item.name}</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate">{item.generic_name}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-0.5 leading-none">In Stock</p>
                                <p className="text-base md:text-lg font-black text-[#111827]">{item.stock_level} <span className="text-[9px] text-slate-400">UNITS</span></p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
            {selectedProduct ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden sticky top-24">
                    <div className="bg-[#111827] p-6 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded tracking-widest uppercase">Clinical Detail</span>
                            <span className="text-[8px] font-black bg-white/10 text-white/60 px-1.5 py-0.5 rounded tracking-widest uppercase">ID: {selectedProduct.id}</span>
                        </div>
                        <h2 className="text-xl font-black truncate">{selectedProduct.name}</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mt-1 truncate">{selectedProduct.generic_name}</p>
                    </div>

                    <div className="p-5 space-y-5">
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Status</p>
                                <p className={cn(
                                    "text-[10px] font-black uppercase",
                                    getStockStatus(selectedProduct) === 'HEALTHY' ? "text-emerald-600" : "text-rose-500"
                                )}>{getStockStatus(selectedProduct).replace('_', ' ')}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Batches</p>
                                <p className="text-sm font-black text-[#111827]">{selectedProduct.batches?.length || 0}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Listing</p>
                             <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                                {selectedProduct.batches?.map((batch: any) => (
                                    <div key={batch.id} className="p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 transition-all group/batch">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-[#111827] truncate">{batch.batch_number}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Exp: {batch.expiry_date}</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setAdjustmentTarget({productId: selectedProduct.id, batchId: batch.id, current: batch.current_quantity, name: selectedProduct.name});
                                                    setIsAdjustmentModalOpen(true);
                                                }}
                                                className="p-1 px-2 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                            >
                                                <TrendingDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">₹{batch.selling_price}</span>
                                            <div className="text-right">
                                                <span className="text-xs font-black text-[#111827]">{batch.current_quantity}</span>
                                                <span className="text-[8px] ml-1 font-bold text-slate-400">UNITS</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-[400px] bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                    <Package className="w-10 h-10 text-slate-200 mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Select pharmaceutical <br/> asset to manage batches</p>
                </div>
            )}
        </div>
      </div>

      <AnimatePresence>
        {isAdjustmentModalOpen && adjustmentTarget && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden font-outfit"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#111827] text-white">
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Manual Reconciliation</h3>
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Inventory Update</p>
                        </div>
                        <button onClick={() => setIsAdjustmentModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><XCircle className="w-5 h-5" /></button>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <p className="text-[9px] font-bold text-amber-900 leading-normal">Updates to physical stock counts will impact replenishment triggers and audit logging.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Physical Count</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xl font-black text-[#111827] outline-none"
                                value={adjustmentTarget.current}
                                onChange={(e) => setAdjustmentTarget({...adjustmentTarget, current: parseInt(e.target.value)})}
                            />
                        </div>

                        <button 
                            onClick={() => {
                                updateStock.mutate({ id: adjustmentTarget.batchId, quantity: adjustmentTarget.current }, {
                                    onSuccess: () => setIsAdjustmentModalOpen(false)
                                });
                            }}
                            disabled={updateStock.isPending}
                            className="w-full py-4 bg-[#111827] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            {updateStock.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Confirm Audit Update
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
