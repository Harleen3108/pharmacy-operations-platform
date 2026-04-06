import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MapPin, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Search,
  Key,
  AlertTriangle,
  X
} from 'lucide-react';
import { useStaff } from '../../hooks/useStaffApi';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Custom Safe Delete Modal
const SafeDeleteModal = ({ isOpen, onClose, onConfirm, personnelName, isDeleting }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022C22]/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[40px] w-full max-w-[440px] shadow-2xl relative overflow-hidden"
      >
        <div className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <div className="w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-900/20">
                    <AlertTriangle className="w-8 h-8" />
                </div>
            </div>
            <h3 className="text-2xl font-black text-[#111827] tracking-tight">Personnel De-induction</h3>
            <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed px-4">
                Are you absolutely sure you want to remove <span className="text-rose-600 font-bold">{personnelName}</span> from the registry? This action is permanent and will revoke all access immediately.
            </p>
        </div>

        <div className="px-10 pb-10 flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-900/10 hover:bg-rose-700 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? 'Erasing Record...' : 'Confirm Permanent Removal'}
            </button>
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              Abeyance (Keep Record)
            </button>
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

// Personnel Drawer (Induction & Editing)
const PersonnelDrawer = ({ isOpen, onClose, roles, stores, formData, setFormData, handleSubmit, isPending, mode = 'induction' }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#022C22]/60 backdrop-blur-sm z-[60]"
          />
          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:max-w-[420px] bg-white shadow-2xl z-[70] overflow-y-auto p-6 md:p-10 font-outfit"
          >
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                <h3 className="text-2xl font-black text-[#111827] flex items-center gap-3">
                    {mode === 'induction' ? <UserPlus className="w-7 h-7 text-emerald-600" /> : <Edit2 className="w-7 h-7 text-emerald-600" />}
                    {mode === 'induction' ? 'Personnel Induction' : 'Personnel Modification'}
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Identity</label>
                        <div className="relative group">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Dr. John Carter"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                          />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Communication hub</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                          <input 
                            type="email" 
                            required
                            placeholder="john@pharmacy.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                          />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Protocol (Phone)</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                          <input 
                            type="text" 
                            placeholder="+91 XXXXX XXXXX"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                          />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registry Username</label>
                        <input 
                          type="text" 
                          required
                          placeholder="john_carter"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Access Pass (Security PIN) {mode === 'edit' && <span className="text-rose-400 lowercase">(leave blank to keep current)</span>}
                        </label>
                        <div className="relative group">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                          <input 
                            type="password" 
                            required={mode === 'induction'}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                          />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Privilege</label>
                        <select 
                          required
                          value={formData.role_id}
                          onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none appearance-none"
                        >
                          <option value="">Designate Role</option>
                          {roles.data?.map((role: any) => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Branch</label>
                        <select 
                          required
                          value={formData.store_id}
                          onChange={(e) => setFormData({...formData, store_id: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none appearance-none"
                        >
                          <option value="">Assign Location</option>
                          {stores.data?.map((store: any) => (
                              <option key={store.id} value={store.id}>{store.name}</option>
                          ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-8">
                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full py-4 bg-[#065F46] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#047857] shadow-2xl shadow-emerald-900/20 disabled:opacity-50 transition-all transform active:scale-[0.98]"
                    >
                      {isPending ? 'Synchronizing...' : mode === 'induction' ? 'Finalize Induction' : 'Update Record'}
                    </button>
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-600 transition-all font-outfit"
                    >
                      Cancel Draft
                    </button>
                </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const StaffManagement = () => {
  const { users, roles, stores, createStaff, updateStaff, deleteStaff } = useStaff();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'induction' | 'edit'>('induction');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; personnel: any }>({ open: false, personnel: null });

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    username: '',
    password: '',
    role_id: '',
    store_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim(),
        role_id: parseInt(formData.role_id),
        store_id: parseInt(formData.store_id)
      };

      if (drawerMode === 'edit' && editingId) {
        // Remove empty password for updates
        if (!payload.password) delete (payload as any).password;
        await updateStaff.mutateAsync({ id: editingId, ...payload });
      } else {
        await createStaff.mutateAsync(payload);
      }
      
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
       const detail = (error as any).response?.data?.detail || `Error ${drawerMode === 'edit' ? 'updating' : 'creating'} staff member`;
       alert(detail);
    }
  };

  const resetForm = () => {
    setFormData({ full_name: '', email: '', phone_number: '', username: '', password: '', role_id: '', store_id: '' });
    setEditingId(null);
    setDrawerMode('induction');
  };

  const handleEditInitiated = (staff: any) => {
    setEditingId(staff.id);
    setFormData({
        full_name: staff.full_name || '',
        email: staff.email || '',
        phone_number: staff.phone_number || '',
        username: staff.username || '',
        password: '', // Password stays empty unless changing
        role_id: staff.role_id?.toString() || '',
        store_id: staff.store_id?.toString() || ''
    });
    setDrawerMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.personnel) return;
    try {
      await deleteStaff.mutateAsync(deleteModal.personnel.id);
      setDeleteModal({ open: false, personnel: null });
    } catch (error) {
      alert('Deletion Protocol Failed.');
    }
  };

  const filteredStaff = users.data?.filter((p: any) => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12 font-outfit">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight mb-2">Personnel Registry</h1>
          <p className="text-slate-500 font-medium text-sm">Orchestrate clinical talent and branch assignments across the network.</p>
        </div>
        <button 
          onClick={() => {
              if (isFormOpen) resetForm();
              setIsFormOpen(!isFormOpen);
          }}
          className="px-8 py-3.5 bg-[#065F46] text-white rounded-[18px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 hover:bg-[#047857] transition-all flex items-center gap-3 transform active:scale-95"
        >
          {isFormOpen ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          {isFormOpen ? 'Cancel Registration' : 'Induct New Talent'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Statistics Cards */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100 group-hover:scale-110 transition-transform">
                 <Users className="w-7 h-7" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active Clinical Force</p>
              <h3 className="text-4xl font-black text-[#111827]">{users.data?.length || 0}</h3>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-125 transition-transform" />
           </div>
           
           <div className="bg-[#111827] p-8 rounded-[32px] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
              <Shield className="w-10 h-10 text-emerald-400 mb-8" />
              <h4 className="text-xl font-black mb-3 tracking-tight">Security Governance</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                 Enforce granular Role-Based Access Controls to protect clinical integrity and customer privacy.
              </p>
              <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Encryption Active</span>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -mr-12 -mt-12" />
           </div>
        </div>

        {/* Main List & Form Area */}
        <div className="lg:col-span-3 space-y-8">
           <PersonnelDrawer 
             isOpen={isFormOpen} 
             onClose={() => {
                 setIsFormOpen(false);
                 resetForm();
             }}
             mode={drawerMode}
             roles={roles}
             stores={stores}
             formData={formData}
             setFormData={setFormData}
             handleSubmit={handleSubmit}
             isPending={createStaff.isPending || updateStaff.isPending}
           />

           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col group/table">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="relative flex-1 w-full max-w-lg group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search hub by personnel identity..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[20px] text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                    />
                 </div>
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 pulse" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">LIVE ROSTER</span>
                    </div>
                 </div>
              </div>

              <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-200">
                 <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Identification</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Privilege</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Status</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Governance</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredStaff.map((staff: any) => (
                          <tr key={staff.id} className="hover:bg-slate-50/40 transition-all group/row">
                             <td className="px-6 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#111827] font-black border border-slate-100 shadow-sm group-hover/row:border-emerald-200 transition-all">
                                      {staff.full_name[0]}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-[#111827]">{staff.full_name}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-60 italic">{staff.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <span className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-[14px] text-[11px] font-black text-slate-700 uppercase tracking-tighter">
                                   <Shield className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                   {staff.role_name}
                                </span>
                             </td>
                             <td className="px-6 py-6">
                                <div className="flex items-center gap-2.5">
                                   <MapPin className="w-4 h-4 text-slate-300" />
                                   <span className="text-[11px] font-bold text-slate-600">{staff.store_name}</span>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 max-w-fit">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Operational</span>
                                </div>
                             </td>
                             <td className="px-6 py-6 text-right">
                                <div className="flex items-center justify-end gap-3 translate-x-2 group-hover/row:translate-x-0 transition-all duration-300">
                                   <button 
                                     onClick={() => handleEditInitiated(staff)}
                                     className="p-3 text-slate-400 hover:text-[#065F46] hover:bg-emerald-50 rounded-2xl transition-all"
                                   >
                                      <Edit2 className="w-4.5 h-4.5" />
                                   </button>
                                   <button 
                                     onClick={() => setDeleteModal({ open: true, personnel: staff })}
                                     className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                   >
                                      <Trash2 className="w-4.5 h-4.5" />
                                   </button>
                                   
                                     
                                </div>
                             </td>
                          </tr>
                       ))}
                       {filteredStaff.length === 0 && (
                           <tr>
                               <td colSpan={5} className="py-32 text-center">
                                   <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                                       <Users className="w-16 h-16" />
                                       <p className="text-xs font-black uppercase tracking-[0.3em]">Registry Empty</p>
                                   </div>
                               </td>
                           </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        <SafeDeleteModal 
            isOpen={deleteModal.open}
            onClose={() => setDeleteModal({ open: false, personnel: null })}
            onConfirm={handleDelete}
            personnelName={deleteModal.personnel?.full_name}
            isDeleting={deleteStaff.isPending}
        />
      </AnimatePresence>
    </div>
  );
};
