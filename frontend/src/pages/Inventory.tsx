import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Download,
  MapPin,
  ChevronRight,
  Loader2,
  XCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useInventory, useInventoryMutation } from '../hooks/useClinicalApi';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All Inventory', 'Antibiotics', 'Wellness', 'Chronic Care'];

export const Inventory = () => {
  const [activeCategory, setActiveCategory] = useState('All Inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adjustmentTarget, setAdjustmentTarget] = useState<any>(null);
  
  const { data: products, isLoading } = useInventory(searchQuery);
  const { addBatch, updateStock } = useInventoryMutation();

  const getStockStatus = (item: any) => {
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    const hasExpired = item.batches?.some((b: any) => new Date(b.expiry_date) <= today);
    if (hasExpired) return 'EXPIRED';

    const isLowStock = item.stock_level <= (item.reorder_level || 10);
    if (isLowStock) return 'LOW_STOCK';

    const isNearExpiry = item.batches?.some((b: any) => new Date(b.expiry_date) <= ninetyDaysFromNow);
    if (isNearExpiry) return 'NEAR_EXPIRY';

    return 'HEALTHY';
  };

  const displayProducts = (products || []).filter((item: any) => 
    activeCategory === 'All Inventory' || item.category === activeCategory
  );
  
  // Update selection if not set
  if (!selectedProduct && displayProducts.length > 0) {
    setSelectedProduct(displayProducts[0]);
  }

  const handleExport = () => {
    alert("Compiling Clinical Audit Logs (CSV)... Batch data exported successfully.");
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-[#111827] tracking-tight">Inventory Management</h2>
          <p className="text-slate-500 font-medium mt-1">Monitor stock levels and batch expirations.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#065F46] text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/10 hover:bg-[#047857] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Batch
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Inventory List */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search inventory, batches, or SKUs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm font-bold"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                    activeCategory === cat 
                      ? "bg-[#065F46] text-white" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accessing Clinical Vault...</p>
                </div>
            ) : displayProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching records found</p>
                </div>
            ) : (
                displayProducts.map((item: any) => (
                    <div 
                        key={item.id} 
                        onClick={() => {
                            setSelectedProduct(item);
                            setIsDetailModalOpen(true);
                        }}
                        className={cn(
                            "bg-white p-6 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex justify-between items-center",
                            selectedProduct?.id === item.id ? "border-l-[#065F46] ring-2 ring-emerald-500/5 ring-inset" : 
                            getStockStatus(item) === 'EXPIRED' ? "border-l-rose-500" :
                            getStockStatus(item) === 'LOW_STOCK' ? "border-l-rose-400" :
                            getStockStatus(item) === 'NEAR_EXPIRY' ? "border-l-amber-500" : "border-l-transparent"
                        )}
                    >
                        <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-start pr-8">
                            <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] font-bold text-emerald-600 tracking-wider">SYSTEM ID: {item.id}</span>
                                {item.is_prescription_required && (
                                    <span className="text-[8px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-tighter">RX Required</span>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-[#111827]">{item.name}</h3>
                            <div className="flex items-center gap-2 text-slate-400 mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">{item.generic_name} • {item.category || 'General'}</span>
                            </div>
                            </div>
                            <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Stock</p>
                            <p className="text-xl font-black text-[#111827] leading-none">{item.stock_level} <span className="text-xs font-bold text-slate-400">UNITS</span></p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                getStockStatus(item) === 'EXPIRED' || getStockStatus(item) === 'LOW_STOCK' ? "bg-rose-500" :
                                getStockStatus(item) === 'NEAR_EXPIRY' ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                            <span className={cn(
                                "text-xs font-bold",
                                getStockStatus(item) === 'EXPIRED' ? "text-rose-600" :
                                getStockStatus(item) === 'LOW_STOCK' ? "text-rose-500" :
                                getStockStatus(item) === 'NEAR_EXPIRY' ? "text-amber-600" : "text-emerald-600"
                            )}>
                                {getStockStatus(item) === 'EXPIRED' ? "Expired Batch Alert" :
                                 getStockStatus(item) === 'LOW_STOCK' ? "Reorder Triggered" :
                                 getStockStatus(item) === 'NEAR_EXPIRY' ? "Expiring Within 90 Days" : "Optimal Stock"}
                            </span>
                            </div>
                        </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4 sticky top-28 h-fit space-y-6">
          {selectedProduct ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-[#044E3B] p-6 text-white relative">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-white/10 px-2 py-1 rounded">Active Selection</span>
                    <button className="text-white/60 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
                <h3 className="text-2xl font-black mb-1">{selectedProduct.name}</h3>
                <p className="text-emerald-50/70 text-xs font-medium">{selectedProduct.generic_name}</p>
                </div>
                
                <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
                    <p className="text-xs font-bold text-[#111827]">{selectedProduct.category || 'General Pharma'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prescription</p>
                    <p className="text-xs font-bold text-[#111827]">{selectedProduct.is_prescription_required ? 'Required (H1)' : 'OTC Allowed'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Batches</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{selectedProduct.batches?.length || 0} Batches Tracked</span>
                    </div>
                    
                    <div className="space-y-3">
                    {selectedProduct.batches?.map((batch: any) => (
                        <div key={batch.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg group/batch hover:border-emerald-200 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-[#111827]">{batch.batch_number}</span>
                                    <span className={cn(
                                        "text-[8px] font-bold px-1.5 py-0.5 rounded",
                                        batch.current_quantity > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {batch.current_quantity > 0 ? "LIFE" : "DEPLETED"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    <span className={cn(
                                        new Date(batch.expiry_date) <= new Date() ? "text-rose-600" :
                                        new Date(batch.expiry_date) <= new Date(new Date().setDate(new Date().getDate() + 90)) ? "text-amber-600" : "text-slate-400"
                                    )}>
                                        Exp: {new Date(batch.expiry_date).toLocaleDateString()}
                                    </span>
                                    <span className="text-emerald-700">₹ {batch.selling_price.toFixed(2)} / unit</span>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="text-right">
                                    <span className="text-sm font-black text-[#111827]">{batch.current_quantity}</span>
                                    <span className="text-[10px] ml-1 font-bold text-slate-400 uppercase tracking-wider">UNIT</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        setAdjustmentTarget({productId: selectedProduct.id, batchId: batch.id, current: batch.current_quantity, name: selectedProduct.name});
                                        setIsAdjustModalOpen(true);
                                    }}
                                    className="p-1 text-slate-300 hover:text-emerald-500 opacity-0 group-hover/batch:opacity-100 transition-all"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                    <button 
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-200 transition-all"
                    >
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#065F46] text-white font-bold text-xs rounded-lg hover:bg-[#047857] transition-all"
                    >
                        Adjust All Stock
                    </button>
                </div>
                </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-xl border border-dashed border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">Select a product to view <br/> clinical batch details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
          {isAddModalOpen && (
              <Modal 
                title="Add Logistics Batch" 
                onClose={() => setIsAddModalOpen(false)}
                className="max-w-xl"
              >
                  <AddBatchForm 
                    productId={selectedProduct?.id} 
                    onSuccess={() => setIsAddModalOpen(false)} 
                    mutation={addBatch} 
                  />
              </Modal>
          )}

          {isAdjustModalOpen && adjustmentTarget && (
              <Modal 
                title={`Reconcile Stock: ${adjustmentTarget.name}`} 
                onClose={() => setIsAdjustModalOpen(false)}
                className="max-w-md"
              >
                  <div className="p-6 space-y-6">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-4">
                          <AlertTriangle className="w-5 h-5 text-emerald-600" />
                          <p className="text-xs font-bold text-emerald-900 leading-relaxed">
                              Verified reconciliation updates the clinical ledger immediately. 
                          </p>
                      </div>
                      <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Physical Unit Count</label>
                            <input 
                                type="number" 
                                defaultValue={adjustmentTarget.current}
                                onChange={(e) => setAdjustmentTarget({...adjustmentTarget, current: parseInt(e.target.value)})}
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-xl text-[#065F46]"
                            />
                          </div>
                          <button 
                            onClick={() => {
                                updateStock.mutate({ id: adjustmentTarget.batchId, quantity: adjustmentTarget.current }, {
                                    onSuccess: () => setIsAdjustModalOpen(false)
                                });
                            }}
                            disabled={updateStock.isPending}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                          >
                              {updateStock.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Confirm Reconciliation
                          </button>
                      </div>
                  </div>
              </Modal>
          )}

          {isDetailModalOpen && selectedProduct && (
              <Modal 
                title="Clinical Inventory Pulse" 
                onClose={() => setIsDetailModalOpen(false)}
                className="max-w-4xl"
              >
                  <div className="flex flex-col">
                      <div className={cn(
                          "p-8 text-white relative h-48 flex flex-col justify-end",
                          getStockStatus(selectedProduct) === 'EXPIRED' ? "bg-rose-600" :
                          getStockStatus(selectedProduct) === 'LOW_STOCK' ? "bg-rose-500" :
                          getStockStatus(selectedProduct) === 'NEAR_EXPIRY' ? "bg-amber-500" : "bg-[#065F46]"
                      )}>
                          <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[10px] font-black tracking-[0.2em] uppercase bg-white/20 px-2 py-1 rounded">Asset Detail</span>
                                  <span className="text-[10px] font-black tracking-[0.2em] uppercase bg-white/20 px-2 py-1 rounded">SKU: {selectedProduct.id}2026</span>
                              </div>
                              <h2 className="text-4xl font-black tracking-tight">{selectedProduct.name}</h2>
                              <p className="text-white/70 font-semibold">{selectedProduct.generic_name}</p>
                          </div>
                          <div className="absolute top-0 right-0 p-8 opacity-10">
                              <Plus className="w-32 h-32" />
                          </div>
                      </div>

                      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 space-y-8">
                              <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total On-Hand</p>
                                      <p className="text-2xl font-black text-[#111827]">{selectedProduct.stock_level}</p>
                                  </div>
                                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Batches</p>
                                      <p className="text-2xl font-black text-[#111827]">{selectedProduct.batches?.length || 0}</p>
                                  </div>
                                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reorder Point</p>
                                      <p className="text-2xl font-black text-emerald-600">{selectedProduct.reorder_level || 10}</p>
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Batch Ledger</h4>
                                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                      <table className="w-full text-left">
                                          <thead className="bg-slate-50">
                                              <tr>
                                                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                                                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Quant.</th>
                                                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiration</th>
                                                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-50">
                                              {selectedProduct.batches?.map((batch: any) => (
                                                  <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                                                      <td className="px-6 py-4 text-xs font-black text-[#111827]">{batch.batch_number}</td>
                                                      <td className="px-6 py-4 text-xs font-bold">{batch.current_quantity}</td>
                                                      <td className="px-6 py-4">
                                                          <span className={cn(
                                                              "text-xs font-bold",
                                                              new Date(batch.expiry_date) <= new Date() ? "text-rose-600" :
                                                              new Date(batch.expiry_date) <= new Date(new Date().setDate(new Date().getDate() + 90)) ? "text-amber-600" : "text-slate-600"
                                                          )}>
                                                              {new Date(batch.expiry_date).toLocaleDateString()}
                                                          </span>
                                                      </td>
                                                      <td className="px-6 py-4">
                                                          <div className={cn(
                                                              "w-2 h-2 rounded-full",
                                                              new Date(batch.expiry_date) <= new Date() ? "bg-rose-500" : "bg-emerald-500"
                                                          )} />
                                                      </td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-6">
                              <div className="bg-[#111827] p-6 rounded-2xl text-white">
                                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Storage Intelligence</h4>
                                  <div className="space-y-4">
                                      <div className="flex justify-between items-center text-xs font-bold">
                                          <span className="text-slate-400">Category</span>
                                          <span>{selectedProduct.category || 'Pharma'}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs font-bold">
                                          <span className="text-slate-400">Prescription</span>
                                          <span className={selectedProduct.is_prescription_required ? "text-rose-400" : "text-emerald-400"}>
                                              {selectedProduct.is_prescription_required ? "Required" : "OTC"}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              <button 
                                onClick={handleExport}
                                className="w-full py-4 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                              >
                                  <Download className="w-4 h-4" /> Download Audit
                              </button>
                          </div>
                      </div>
                  </div>
              </Modal>
          )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components for Cleanliness
const Modal = ({ title, children, onClose, className }: any) => (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#022C22]/80 backdrop-blur-sm"
    >
        <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className={cn("bg-white rounded-2xl shadow-2xl w-full overflow-hidden", className)}
        >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-[#111827] uppercase tracking-tight">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><XCircle className="w-5 h-5 text-slate-400" /></button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

const AddBatchForm = ({ productId, onSuccess, mutation }: any) => {
    const [formData, setFormData] = useState({
        batch_number: `B-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        expiry_date: '',
        cost_price: 0,
        selling_price: 0,
        quantity: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ ...formData, inventory_id: productId }, {
            onSuccess: () => onSuccess()
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Batch Identifier</label>
                    <input 
                        type="text" required
                        value={formData.batch_number}
                        onChange={e => setFormData({...formData, batch_number: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Expiry Date</label>
                    <input 
                        type="date" required
                        onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cost Price (₹)</label>
                    <input 
                        type="number" step="0.01" required
                        onChange={e => setFormData({...formData, cost_price: parseFloat(e.target.value)})}
                        className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl font-bold text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Clinical MSRP (₹)</label>
                    <input 
                        type="number" step="0.01" required
                        onChange={e => setFormData({...formData, selling_price: parseFloat(e.target.value)})}
                        className="w-full p-4 bg-[#065F46]/5 border border-emerald-100 rounded-xl font-bold text-sm"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Initial Reserve Units</label>
                <input 
                    type="number" required
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full p-4 bg-slate-900 text-white rounded-xl font-black text-2xl text-center"
                />
            </div>
            <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full py-5 bg-[#065F46] text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/20 hover:bg-[#047857] transition-all flex items-center justify-center gap-2"
            >
                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Stock Entry"}
            </button>
        </form>
    );
};
