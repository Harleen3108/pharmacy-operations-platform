import { useState } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ClipboardList, 
  ShieldCheck,
  Search,
  Filter,
  Eye,
  FileText,
  Loader2,
  X,
  Plus,
  Stethoscope,
  Clock,
  History,
  TrendingDown,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePrescriptions } from '../../hooks/usePrescriptionApi';
import { useInventory } from '../../hooks/useClinicalApi';
import { motion, AnimatePresence } from 'framer-motion';

// Simulation Overlay for OCR Processing
const UploadSimulation = ({ isUploading }: { isUploading: boolean }) => (
  <AnimatePresence>
    {isUploading && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-emerald-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white"
      >
        <div className="relative mb-6">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-400" />
          <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>
        </div>
        <h4 className="text-xl font-black tracking-tight mb-2">Analyzing Clinical Assets</h4>
        <p className="text-emerald-50/60 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Extracting Patient & Drug JSON via AI-OCR</p>
      </motion.div>
    )}
  </AnimatePresence>
);

const DigitalizeModal = ({ isOpen, onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    doctor_name: 'Dr. Sarah Wilson', // Defaulting for realism
    rx_number: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'standard',
    medicines: [{ name: '', dosage: '' }]
  });
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      onSubmit(formData);
      setUploading(false);
    }, 2500); // Simulate processing time
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022C22]/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
        <UploadSimulation isUploading={uploading} />
        
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-[#111827]">Incoming Clinical Asset</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Upload & Digitally Validate Prescription</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="border-2 border-dashed border-slate-100 rounded-2xl p-12 text-center group hover:border-emerald-200 transition-all cursor-pointer bg-slate-50/50">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform mb-4">
                <Upload className="w-8 h-8 text-emerald-600" />
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Drop RX File or Image Here</p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirmed Patient</label>
              <input 
                className="w-full px-4 py-3.5 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-sm"
                placeholder="Full Name"
                value={formData.patient_name}
                onChange={e => setFormData({...formData, patient_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Practitioner Name</label>
              <div className="relative">
                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-100 rounded-xl border-none outline-none font-bold text-sm"
                  value={formData.doctor_name}
                  onChange={e => setFormData({...formData, doctor_name: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Drug Classification</label>
            <div className="flex gap-2">
              {['standard', 'restricted', 'controlled'].map(t => (
                <button 
                  key={t}
                  type="button"
                  onClick={() => setFormData({...formData, type: t})}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent transition-all",
                    formData.type === t ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/10" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Prescribed Medicines</label>
             {formData.medicines.map((med, idx) => (
                <div key={idx} className="flex gap-3">
                   <input 
                     className="flex-1 px-4 py-2 bg-slate-50 rounded-lg border-none outline-none text-xs font-bold"
                     placeholder="Medicine Name"
                     value={med.name}
                     onChange={e => {
                       const newMeds = [...formData.medicines];
                       newMeds[idx].name = e.target.value;
                       setFormData({...formData, medicines: newMeds});
                     }}
                   />
                   <input 
                     className="w-24 px-4 py-2 bg-slate-50 rounded-lg border-none outline-none text-xs font-bold"
                     placeholder="Dosage"
                     value={med.dosage}
                     onChange={e => {
                       const newMeds = [...formData.medicines];
                       newMeds[idx].dosage = e.target.value;
                       setFormData({...formData, medicines: newMeds});
                     }}
                   />
                </div>
             ))}
             <button 
               type="button"
               onClick={() => setFormData({...formData, medicines: [...formData.medicines, { name: '', dosage: '' }]})}
               className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
             >
               <Plus className="w-3 h-3" /> Add Row
             </button>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
          <button 
            type="button"
            onClick={handleSimulatedSubmit}
            className="flex-1 py-4 bg-emerald-600 border border-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            Authorize Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export const PharmacistPanel = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { query, create, validate, reject } = usePrescriptions(activeTab);
  const inventoryQuery = useInventory(); // For Alerts Sidebar

  const handleDigitalize = (data: any) => {
    create.mutate({ ...data, store_id: 1 }, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  const handleValidate = (id: number) => {
    validate.mutate({ id, pharmacistId: 1 }, {
      onSuccess: () => {
        if (selectedRx?.id === id) setSelectedRx(null);
      }
    });
  };

  const expiringMeds = (inventoryQuery.data || []).filter((item: any) => {
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);
    return item.batches?.some((b: any) => new Date(b.expiry_date) <= ninetyDays);
  }).slice(0, 3);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-outfit">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight mb-2">Clinical Validation Deck</h1>
          <p className="text-slate-500 font-medium text-sm">Reviewing restricted assets & prescription dispensations.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <History className="w-4 h-4" />
            Audit History
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#065F46] text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/10 hover:bg-[#047857] transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Ingest Paper RX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Queue Table */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => { setActiveTab('pending'); setSelectedRx(null); }}
                      className={cn(
                        "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        activeTab === 'pending' ? "bg-white text-[#111827] shadow-sm" : "text-slate-400"
                      )}
                    >
                      Pending Queue ({query.data?.length || 0})
                    </button>
                    <button 
                      onClick={() => { setActiveTab('validated'); setSelectedRx(null); }}
                      className={cn(
                        "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        activeTab === 'validated' ? "bg-white text-[#111827] shadow-sm" : "text-slate-400"
                      )}
                    >
                      Clinical Archives
                    </button>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                       <input 
                         type="text" 
                         placeholder="Scan RX identifier..." 
                         className="pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500/20 outline-none w-48"
                       />
                    </div>
                 </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Prescription ID</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient Name</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Indication</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-outfit">
                    {query.isLoading ? (
                       <tr><td colSpan={5} className="py-20 text-center opacity-30"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></td></tr>
                    ) : query.data?.length === 0 ? (
                       <tr><td colSpan={5} className="py-20 text-center opacity-40"><FileText className="mx-auto mb-3"/><p className="text-xs font-black uppercase">No records found</p></td></tr>
                    ) : (
                      query.data?.map((rx: any) => (
                        <tr 
                          key={rx.id} 
                          onClick={() => setSelectedRx(rx)}
                          className={cn(
                            "hover:bg-slate-50/50 cursor-pointer transition-all",
                            selectedRx?.id === rx.id ? "bg-emerald-50/30 ring-inset ring-2 ring-emerald-500/10" : ""
                          )}
                        >
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-tighter">
                              {rx.rx_number}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm font-black text-[#111827]">{rx.patient_name}</td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-1.5 h-1.5 rounded-full", rx.type === 'controlled' ? "bg-rose-500" : "bg-emerald-500")} />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rx.medicines[0]?.name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                              rx.status === 'pending' ? "bg-amber-100 text-amber-700" :
                              rx.status === 'validated' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            )}>
                              {rx.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                <Eye className="w-4 h-4" />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
           </div>

           {/* Alerts Section */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
                 <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Stock Expiring Soon</h4>
                    <p className="text-[10px] text-amber-800/60 font-bold leading-relaxed">
                       {expiringMeds.length} critical batches will exceed clinical shelf-life within 90 days.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                       {expiringMeds.map((m: any) => (
                         <span key={m.id} className="text-[8px] font-black bg-white/50 text-amber-700 px-1.5 py-0.5 rounded uppercase">{m.name}</span>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 flex items-start gap-4">
                 <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                    <TrendingDown className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest mb-1">Restricted Supply Dip</h4>
                    <p className="text-[10px] text-rose-800/60 font-bold leading-relaxed">
                       Antibiotics and Controlled substances are reaching reorder thresholds.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Sidebar: RX Detail Hub */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
           <AnimatePresence mode="wait">
             {selectedRx ? (
               <motion.div 
                 key={selectedRx.id}
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                 className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-fit"
               >
                  <div className="bg-[#111827] p-8 text-white relative">
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                           <span className={cn(
                             "px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase",
                             selectedRx.type === 'controlled' ? "bg-rose-500/20 text-rose-400" :
                             selectedRx.type === 'restricted' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                           )}>
                             {selectedRx.type} Protocol
                           </span>
                           <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black mb-1">{selectedRx.patient_name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                           <Stethoscope className="w-3.5 h-3.5" />
                           <span>Dr. Sarah Wilson • Practitioner ID: 88219</span>
                        </div>
                     </div>
                     <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Activity className="w-24 h-24" />
                     </div>
                  </div>

                  <div className="p-8 space-y-8">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Prescribed Regimen</h4>
                        <div className="space-y-3">
                           {selectedRx.medicines.map((med: any, i: number) => (
                             <div key={i} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div>
                                   <p className="text-xs font-black text-[#111827]">{med.name}</p>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{med.dosage}</p>
                                </div>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                           <ShieldCheck className="w-5 h-5 text-emerald-600" />
                           <h4 className="text-[10px] font-black text-[#111827] uppercase tracking-widest">Compliance Audit</h4>
                        </div>
                        <div className="space-y-3">
                           {[
                              'Practitioner Identity Verified',
                              'Drug-Allergy Interaction Check',
                              'District Registry Validation'
                           ].map((check, i) => (
                             <div key={i} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                   <CheckCircle2 className="w-2.5 h-2.5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600">{check}</span>
                             </div>
                           ))}
                        </div>
                     </div>

                     {selectedRx.status === 'pending' ? (
                       <div className="flex gap-4">
                          <button 
                            onClick={() => reject.mutate(selectedRx.id)}
                            disabled={reject.isPending}
                            className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50"
                          >
                             Reject
                          </button>
                          <button 
                            onClick={() => handleValidate(selectedRx.id)}
                            disabled={validate.isPending}
                            className="flex-[2] py-4 bg-[#065F46] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#047857] shadow-xl shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                             {validate.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <ShieldCheck className="w-4 h-4"/>}
                             Approve
                          </button>
                       </div>
                     ) : (
                       <div className="flex items-center justify-center gap-3 py-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Validated & Processed</span>
                       </div>
                     )}
                  </div>
               </motion.div>
             ) : (
               <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                     <ClipboardList className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                     Select clinical asset <br/> for verification
                  </p>
               </div>
             )}
           </AnimatePresence>

           <div className="bg-[#022C22] p-8 rounded-2xl text-white">
              <h4 className="text-xs font-black uppercase tracking-widest mb-4">Regulatory Notice</h4>
              <p className="text-emerald-50/50 text-[10px] font-bold leading-relaxed mb-6">
                 New batch of Lisinopril identified as high-priority replenishment. Ensure all digital signatures are valid before dispatch. 
              </p>
              <button className="w-full py-3 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all">
                 Review Compliance Docs
              </button>
           </div>
        </div>
      </div>

      <DigitalizeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleDigitalize} 
      />
    </div>
  );
};
