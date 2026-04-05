import { useState } from 'react';
import { 
  FileText, 
  QrCode, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  ScanLine,
  Loader2,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { cn } from '../lib/utils';
import { useSales, useInventory } from '../hooks/useClinicalApi';

export const Sales = () => {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, isLoading: isSearchingApi } = useInventory(searchQuery);
  const { checkout } = useSales(1); // Default to Store 1

  // Derived totals
  const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const vat = subtotal * 0.18; // Standardized 18% GST
  const total = subtotal + vat;

  const handleCheckout = () => {
    const saleData = {
      store_id: 1,
      associate_id: 1, // Default for demo
      items: items.map(i => ({
        batch_id: i.batch_id,
        quantity: i.quantity,
        unit_price: i.price
      })),
      total_amount: total
    };

    checkout.mutate(saleData, {
      onSuccess: () => {
        setSuccess(true);
        clearCart();
      }
    });
  };

  const handleAddItem = (product: any) => {
    // Select the first available batch for simplicity in this demo
    const batch = product.batches?.[0];
    if (batch) {
      if (batch.current_quantity <= 0) {
          alert('Batch depleted. Please select another batch from inventory.');
          return;
      }
      addItem({
        id: batch.id,
        batch_id: batch.id,
        name: product.name,
        price: batch.selling_price,
        quantity: 1,
        batch_number: batch.batch_number,
        requiresPrescription: product.is_prescription_required
      });
      setSearchQuery('');
      setIsSearching(false);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  const handleExport = () => {
      alert("Generating Operational Transaction Log... Export Success.");
  };

  if (success) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-[#111827]">Order Completed!</h2>
          <p className="text-slate-500 font-medium mt-2">Transaction {checkout.data?.transaction_id} finalized.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="px-6 py-4 bg-[#065F46] text-white rounded-xl font-bold hover:bg-[#047857] transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/10"
          >
            <Printer className="w-5 h-5" /> Print Invoice
          </button>
          <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all font-bold" onClick={() => setSuccess(false)}>Start New Sale</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">Step 2 of 3</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Verification & Reconciliation</span>
          </div>
          <h2 className="text-3xl font-black text-[#111827] tracking-tight">POS Terminal</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D1FAE5] rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider">Terminal Active • Branch 041</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Search & Reconciliation */}
        <div className="xl:col-span-5 space-y-6">
          {/* Real-time Search Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Items to Cart</h4>
              <div className="flex items-center gap-4">
                 <button className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <ScanLine className="w-3 h-3" />
                    Quick Scan
                 </button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products or batches..." 
                value={searchQuery}
                onFocus={() => setIsSearching(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm font-bold"
              />
              
              {isSearching && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 max-h-[300px] overflow-auto">
                    {isSearchingApi ? (
                        <div className="p-4 flex items-center justify-center gap-2 text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest">Searching Vault...</span>
                        </div>
                    ) : searchResults?.length === 0 ? (
                         <div className="p-4 text-center text-xs font-bold text-slate-400 bg-slate-50 uppercase tracking-widest">No matching records found</div>
                    ) : (
                        searchResults?.map((product: any) => (
                            <button 
                                key={product.id}
                                onClick={() => handleAddItem(product)}
                                className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex justify-between items-center border-b border-slate-50 last:border-0"
                            >
                                <div>
                                    <p className="text-sm font-black text-[#111827]">{product.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.generic_name} • {product.batches?.[0]?.batch_number || 'No Batch'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600">₹{product.batches?.[0]?.selling_price?.toFixed(2) || '0.00'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.stock_level} Unit(s)</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
              )}
            </div>
            
            {isSearching && (
                <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsSearching(false)} />
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Selection</h4>
              <button className="text-[10px] font-bold text-emerald-600 hover:underline">Change Account</button>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-50 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100" 
                  alt="Patient" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-black text-xl text-[#111827]">Elena Rodriguez</h3>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-tighter">WALK-IN CUSTOMER</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span className="text-emerald-600 uppercase tracking-tighter">LOYALTY ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Checkout */}
        <div className="xl:col-span-7 space-y-6 flex flex-col h-full">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-[#111827]">Validated Cart Items</h3>
              <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {items.length} Items Listed
              </div>
            </div>

            <div className="flex-1 min-h-[400px] overflow-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40 py-20">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">Terminal empty. <br/> Search medicines above to rebuild cart.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-100 transition-all group">
                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-emerald-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black text-[#111827] uppercase tracking-tight">{item.name}</p>
                        {item.requiresPrescription && (
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Batch: {item.batch_number}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                        <button 
                          className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-900 transition-colors"
                          onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                        <button 
                          className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-900 transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-sm font-black text-[#111827]">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <button 
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Subtotal</span>
                    <span className="text-[#111827]">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-sm font-black text-[#111827] uppercase tracking-widest">Grand Total</span>
                    <span className="text-2xl font-black text-[#111827]">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                   <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      <Printer className="w-4 h-4" /> Print Invoice
                    </button>
                    <button 
                         onClick={handleExport}
                        className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                       <Download className="w-4 h-4" /> Export
                    </button>
                  </div>
                  <button 
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-5 rounded-xl font-black text-sm uppercase tracking-widest transition-all",
                      items.length > 0 && !checkout.isPending
                        ? "bg-[#065F46] text-white hover:bg-[#047857] shadow-xl shadow-emerald-900/10" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                    disabled={items.length === 0 || checkout.isPending}
                    onClick={handleCheckout}
                  >
                    {checkout.isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Finalizing...
                        </>
                    ) : (
                        <>
                            Finalize & Checkout
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
