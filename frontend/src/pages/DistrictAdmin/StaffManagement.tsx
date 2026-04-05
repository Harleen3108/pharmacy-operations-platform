import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MapPin, 
  Edit2, 
  UserMinus, 
  CheckCircle2, 
  XCircle,
  Search,
  MoreVertical,
  Key
} from 'lucide-react';
import { useStaff } from '../../hooks/useStaffApi';

export const StaffManagement = () => {
  const { users, roles, stores, createStaff, deactivateStaff } = useStaff();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role_id: '',
    store_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff.mutateAsync({
        ...formData,
        role_id: parseInt(formData.role_id),
        store_id: parseInt(formData.store_id)
      });
      setIsFormOpen(false);
      setFormData({ full_name: '', email: '', username: '', password: '', role_id: '', store_id: '' });
    } catch (error) {
      alert('Error creating staff member');
    }
  };

  const filteredStaff = users.data?.filter((user: any) => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-outfit">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight mb-2">Personnel Management</h1>
          <p className="text-slate-500 font-medium text-sm">Orchestrate roles and branch assignments across the district.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-6 py-3 bg-[#065F46] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/10 hover:bg-[#047857] transition-all flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add New Personnel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Statistics Cards */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
                 <Users className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Active Staff</p>
              <h3 className="text-2xl font-black text-[#111827]">{users.data?.filter((u: any) => u.is_active).length || 0}</h3>
           </div>
           
           <div className="bg-[#111827] p-8 rounded-2xl text-white relative overflow-hidden">
              <Shield className="w-8 h-8 text-emerald-400 mb-6" />
              <h4 className="text-lg font-black mb-2">RBAC Governance</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                 Manage access levels for District Admins, Store Supervisors, Pharmacists, and Billing Associates.
              </p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -mr-10 -mt-10"></div>
           </div>
        </div>

        {/* Main List & Form Area */}
        <div className="lg:col-span-3 space-y-6">
           {isFormOpen && (
              <div className="bg-white p-8 rounded-2xl border-2 border-emerald-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                 <h3 className="text-xl font-black text-[#111827] mb-6 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-600" />
                    New Staff Induction
                 </h3>
                 <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       <div className="relative group">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Dr. John Carter"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                          />
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                       <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                          <input 
                            type="email" 
                            required
                            placeholder="john@pharmacy.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel ID (Username)</label>
                       <input 
                         type="text" 
                         required
                         placeholder="john_carter"
                         value={formData.username}
                         onChange={(e) => setFormData({...formData, username: e.target.value})}
                         className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Security PIN</label>
                       <div className="relative group">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                          <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Role</label>
                       <select 
                         required
                         value={formData.role_id}
                         onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                         className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none appearance-none"
                       >
                          <option value="">Select Role</option>
                          {roles.data?.map((role: any) => (
                             <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Assignment</label>
                       <select 
                         required
                         value={formData.store_id}
                         onChange={(e) => setFormData({...formData, store_id: e.target.value})}
                         className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none appearance-none"
                       >
                          <option value="">Select Store</option>
                          {stores.data?.map((store: any) => (
                             <option key={store.id} value={store.id}>{store.name}</option>
                          ))}
                       </select>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-50">
                       <button 
                         type="button" 
                         onClick={() => setIsFormOpen(false)}
                         className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                       >
                          Cancel
                       </button>
                       <button 
                         type="submit" 
                         disabled={createStaff.isPending}
                         className="px-8 py-3 bg-[#065F46] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#047857] shadow-lg shadow-emerald-900/10 disabled:opacity-50"
                       >
                          {createStaff.isPending ? 'On-boarding...' : 'Induct Personnel'}
                       </button>
                    </div>
                 </form>
              </div>
           )}

           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search personnel by name or email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                       Export Data
                    </button>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Name</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role & Privilege</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Branch</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Activity</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-outfit">
                       {filteredStaff.map((staff: any) => (
                          <tr key={staff.id} className="hover:bg-slate-50/30 transition-colors group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-[#111827] font-black border border-slate-50">
                                      {staff.full_name[0]}
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-[#111827]">{staff.full_name}</p>
                                      <p className="text-[10px] text-slate-400 font-medium italic">{staff.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                   <Shield className="w-3 h-3 text-emerald-600" />
                                   <span className="text-[11px] font-bold text-slate-600">{staff.role_name}</span>
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                   <MapPin className="w-3 h-3 text-slate-300" />
                                   <span className="text-[11px] font-bold text-slate-600">{staff.store_name}</span>
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                {staff.is_active ? (
                                   <div className="flex items-center gap-1.5 text-emerald-600">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Operational</span>
                                   </div>
                                ) : (
                                   <div className="flex items-center gap-1.5 text-rose-400">
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Deactivated</span>
                                   </div>
                                )}
                             </td>
                             <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                   <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                      <Edit2 className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={() => { if(confirm('Deactivate user?')) deactivateStaff.mutate(staff.id) }}
                                     disabled={!staff.is_active}
                                     className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30"
                                   >
                                      <UserMinus className="w-4 h-4" />
                                   </button>
                                   <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                                      <MoreVertical className="w-4 h-4" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
