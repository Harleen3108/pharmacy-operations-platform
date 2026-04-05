import { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ReceiptText,
  User,
  CreditCard,
  Banknote,
  PackageSearch,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Stethoscope,
  ArrowRight,
  Download,
  Calendar,
  IndianRupee,
  Filter
} from 'lucide-react';
import { useInventory, useSales } from '../../hooks/useClinicalApi';
import { useCartStore } from '../../store/useCartStore';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Local Modal Component for High-Density Receipt
const ReceiptModal = ({ isOpen, onClose, transaction }: any) => {
  if (!isOpen || !transaction) return null;
  const { items, total, customerName, customerMobile, paymentMethod, id } = transaction;
  const gst = total * 0.18;
  const grandTotal = total + gst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022C22]/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[40px] w-full max-w-[480px] shadow-2xl relative overflow-hidden flex flex-col"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
        
        <div className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
            </div>
            <h3 className="text-2xl font-black text-[#111827] tracking-tight">Revenue Receipt Generated</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Clinical Asset Transfer Complete</p>
        </div>

        <div className="px-10 pb-10 space-y-8 flex-1">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Transaction ID</span>
                    <span>#{String(id || Math.floor(1000 + Math.random() * 9000)).padStart(6, '0')}</span>
                </div>
                <div className="space-y-3">
                    {items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-baseline gap-4">
                            <span className="text-xs font-bold text-[#111827] leading-tight flex-1">{item.name} x{item.quantity}</span>
                            <span className="text-xs font-bold font-mono text-slate-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t border-slate-200 border-dashed space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>NET AMOUNT</span>
                        <span className="font-mono">₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>GST (18%)</span>
                        <span className="font-mono">₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-black text-[#111827]">GROSS TOTAL</span>
                        <span className="text-xl font-black text-[#065F46] font-mono">₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 text-left p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                        <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Ledger</p>
                        <p className="text-xs font-bold text-[#111827]">{customerName} • +91 {customerMobile}</p>
                    </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-[#065F46] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 hover:bg-[#047857] transition-all transform active:scale-95"
                >
                  Confirm & Discharge
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export const BillingPanel = () => {
  const { storeId: authStoreId } = useAuth();
  const activeStoreId = authStoreId ? parseInt(authStoreId) : 1;
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const inventoryQuery = useInventory(searchTerm, activeStoreId);
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { checkout } = useSales(activeStoreId);
  const total = getTotal();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!customerName || !customerMobile || !paymentMethod) return;
    
    const saleData = {
      store_id: activeStoreId,
      associate_id: 1, 
      total_amount: total * 1.18, 
      customer_name: customerName,
      customer_mobile: customerMobile,
      payment_method: paymentMethod,
      items: items.map((item: any) => ({
        batch_id: item.batch_id,
        quantity: item.quantity,
        unit_price: item.price
      }))
    };

    try {
      const response = await checkout.mutateAsync(saleData);
      setLastTransaction({ 
        ...saleData, 
        items: [...items], 
        total, 
        id: (response as any).id 
      });
      setIsSuccessModalOpen(true);
      clearCart();
      setCustomerName('');
      setCustomerMobile('');
      setPaymentMethod(null);
    } catch (error) {
      const errorMsg = (error as any).response?.data?.detail || 'Transaction Failed.';
      alert(`Checkout Error: ${errorMsg}`);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return 'OUT';
    if (stock <= 10) return 'LOW';
    return 'HEALTHY';
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen xl:h-[calc(100vh-140px)] flex flex-col xl:flex-row gap-6 font-outfit pb-12 xl:pb-0">
      {/* Search & Stock Area */}
      <div className="flex-1 flex flex-col min-w-0 space-y-6">
        <header className="flex flex-col space-y-1">
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">Active Billing Deck</h1>
            <p className="text-slate-400 text-sm font-medium">Point of sale and inventory synchronization.</p>
        </header>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                <input 
                type="text" 
                placeholder="Scan Clinical Asset (Medicine, SKU, Brand)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                />
            </div>
            <button className="p-4 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-2xl border border-slate-100 transition-all">
                <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Medicine Information</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Shelf Health</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Commercials</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 text-right">Acquisition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inventoryQuery.isLoading ? (
                    <tr><td colSpan={4} className="py-20 text-center opacity-30"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></td></tr>
                ) : inventoryQuery.data?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                            item.is_prescription_required ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-emerald-50 border-emerald-100 text-emerald-500"
                        )}>
                            <PackageSearch className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#111827]">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.generic_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                getStockStatus(item.stock_level) === 'HEALTHY' ? "bg-emerald-500" : "bg-rose-500"
                            )} />
                            <span className="text-[11px] font-bold text-slate-700">{item.stock_level} Unit(s) On-Shelf</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">EXP: {item.batches[0]?.expiry_date ? new Date(item.batches[0].expiry_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm font-black text-[#111827] flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                          {item.batches[0]?.selling_price.toFixed(2)}
                       </p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Per Unit / Tab</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => addItem({
                          id: item.id,
                          name: item.name,
                          price: item.batches[0]?.selling_price,
                          batch_id: item.batches[0]?.id,
                          quantity: 1,
                          batch_number: item.batches[0]?.batch_number,
                          requiresPrescription: item.is_prescription_required
                        })}
                        disabled={!item.batches[0] || item.batches[0]?.current_quantity <= 0}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30 disabled:grayscale"
                      >
                         Add to Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cart & Billing Area */}
      <div className="w-full xl:w-[420px] xl:min-w-[420px] flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl flex flex-col h-full ring-4 ring-slate-50/50">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#065F46] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/10">
                    <ShoppingCart className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-black text-[#111827]">Current Bill</h2>
              </div>
              <button onClick={clearCart} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all">Reset</button>
           </div>

           <div className="mb-8 space-y-4">
              <div className="relative group">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Customer Identity" 
                   value={customerName}
                   onChange={(e) => setCustomerName(e.target.value)}
                   className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white outline-none"
                 />
              </div>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors flex items-center justify-center font-black text-[10px]">+91</div>
                 <input 
                   type="tel" 
                   placeholder="Mobile Hub" 
                   value={customerMobile}
                   onChange={(e) => setCustomerMobile(e.target.value)}
                   className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white outline-none"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-auto -mx-2 px-2 space-y-3 mb-8 min-h-[200px]">
              {items.map((item: any) => (
                 <div key={item.id} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-50 group hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#111827] border border-slate-100 font-black text-[10px]">
                                {item.quantity}
                            </div>
                            <div>
                                <p className="text-xs font-black text-[#111827] leading-tight">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">₹{item.price} Unit Cost</p>
                            </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1.5 hover:text-emerald-600 transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="w-12 text-center text-xs font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:text-emerald-600 transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        {item.requiresPrescription && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                                <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Protocol Overlock</span>
                            </div>
                        )}
                    </div>
                 </div>
              ))}
              
              {items.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-16 text-slate-300 space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Clinical Cart Empty</p>
                 </div>
              )}
           </div>

           <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center text-slate-500">
                 <span className="text-[10px] font-black uppercase tracking-widest">Clinical Subtotal</span>
                 <span className="text-sm font-black font-mono">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                 <span className="text-[10px] font-black uppercase tracking-widest">Taxes (GST 18%)</span>
                 <span className="text-sm font-black font-mono">₹{(total * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-4 px-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <span className="text-xs font-black text-emerald-900 uppercase tracking-widest">Total Valuation</span>
                 <span className="text-2xl font-black text-[#065F46] font-mono">₹{(total * 1.18).toFixed(2)}</span>
              </div>

              {items.some(i => i.requiresPrescription) && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Prescription Alert</p>
                          <p className="text-[10px] text-amber-800/70 font-semibold leading-relaxed">
                             Restricted assets detected. Ensure clinical validation is signed off before discharge.
                          </p>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    "flex flex-col items-center justify-center py-4 rounded-2xl transition-all border outline-none",
                    paymentMethod === 'cash' 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                  )}
                 >
                    <Banknote className="w-5 h-5 mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Cash Settlement</span>
                 </button>
                 <button 
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "flex flex-col items-center justify-center py-4 rounded-2xl transition-all border outline-none",
                    paymentMethod === 'card' 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                  )}
                 >
                    <CreditCard className="w-5 h-5 mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Card / UPI Link</span>
                 </button>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={items.length === 0 || checkout.isPending || !customerName || !customerMobile || !paymentMethod}
                className="w-full py-5 bg-[#065F46] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#047857] shadow-2xl shadow-emerald-900/20 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
              >
                {checkout.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ReceiptText className="w-5 h-5" />}
                {checkout.isPending ? 'Validating Transaction...' : 'Complete & Discharge'}
              </button>
           </div>
        </div>
      </div>

      <ReceiptModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
        transaction={lastTransaction} 
      />
    </div>
  );
};
