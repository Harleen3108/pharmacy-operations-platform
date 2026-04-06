import { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  TrendingUp, 
  Users, 
  Search,
  MoreVertical,
  Activity,
  ArrowUpRight,
  Loader2,
  X,
  Phone,
  LayoutGrid,
  Filter,
  RotateCcw,
  List as ListIcon
} from 'lucide-react';
import { useStores } from '../../hooks/useClinicalApi';
import { cn } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const StoreManagement = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { stats, createStore } = useStores();

  const filteredStores = stats.data?.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerformance = performanceFilter === 'All' || s.performance_level === performanceFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    
    return matchesSearch && matchesPerformance && matchesStatus;
  });

  const topPerformer = stats.data ? [...stats.data].sort((a, b) => b.total_sales - a.total_sales)[0] : null;

  const handleAddStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createStore.mutateAsync({
        name: formData.get('name'),
        location: formData.get('location'),
        contact_number: formData.get('contact')
      });
      setIsAddModalOpen(false);
    } catch (err) {
      alert("Failed to add store. Check if name already exists.");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-outfit">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Empire Oversight</span>
          </div>
          <h1 className="text-4xl font-black text-[#111827] tracking-tight">Store Network Management</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Monitor, compare and expand your pharmacy operations.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
             <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-white text-[#111827] shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
             >
                <LayoutGrid className="w-4 h-4" />
             </button>
             <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-white text-[#111827] shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
             >
                <ListIcon className="w-4 h-4" />
             </button>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-[#065F46] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/10 hover:bg-[#047857] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Store
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">Active Net</span>
          </div>
          <p className="text-3xl font-black text-[#111827]">{stats.data?.length || 0}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Branches</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Live Ops</span>
          </div>
          <p className="text-3xl font-black text-[#111827]">{stats.data?.filter((s:any) => s.status === 'online').length || 0}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Stores</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-2 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <ArrowUpRight className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">+12.4%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-black text-[#111827]">₹{(stats.data?.reduce((acc: number, curr: any) => acc + curr.total_sales, 0) || 0).toLocaleString('en-IN')}</p>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Network Revenue</p>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5">
             <TrendingUp className="w-32 h-32" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Store Performance Comparison Chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col h-[350px] md:h-[500px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-[#111827]">Performance Comparison</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-Branch Sales Volume (Today)</p>
            </div>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none">
               <option>Revenue (₹)</option>
               <option>Transactions</option>
            </select>
          </div>
          
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.data?.slice(0, 10)}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                   <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 9, fontWeight: 800}} 
                    interval={0}
                   />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                   <Tooltip 
                    cursor={{fill: '#F8FAFC'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    itemStyle={{fontSize: '12px', fontWeight: 900}}
                   />
                   <Bar dataKey="total_sales" radius={[6, 6, 0, 0]} barSize={32}>
                      {stats.data?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.performance_level === 'High' ? '#059669' : entry.performance_level === 'Low' ? '#E11D48' : '#3B82F6'} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Card */}
        <div className="bg-[#111827] text-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group">
           <div className="relative z-10">
              <h2 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">🏆 Network Leader</h2>
              {topPerformer && (
                <>
                  <p className="text-3xl font-black tracking-tight mb-2">{topPerformer.name}</p>
                  <div className="flex items-center gap-2 text-slate-400 mb-8">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold">{topPerformer.location}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's Sales</span>
                       <span className="text-2xl font-black">₹{topPerformer.total_sales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Growth Rate</span>
                       <span className="text-xl font-black text-emerald-400">+18.5%</span>
                    </div>
                  </div>
                </>
              )}
           </div>
           
           <div className="mt-8 relative z-10">
              <button className="w-full py-4 bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all">
                 View Analytics Report
              </button>
           </div>
           
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px] group-hover:bg-emerald-600/20 transition-all duration-700" />
        </div>
      </div>
           {/* Search & Grid Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/30">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search branches..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all outline-none shadow-sm"
              />
            </div>

            {/* Performance Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-emerald-600 transition-colors">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select 
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value)}
                className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer shadow-sm min-w-[170px]"
              >
                <option value="All">All Performance</option>
                <option value="High">🔥 High Performance</option>
                <option value="Average">⚡ Average</option>
                <option value="Low">🔻 Low Performance</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 pointer-events-none">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer shadow-sm min-w-[150px]"
              >
                <option value="All">All Status</option>
                <option value="online">🟢 Operational</option>
                <option value="offline">🔴 Maintenance</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchTerm || performanceFilter !== 'All' || statusFilter !== 'All') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setPerformanceFilter('All');
                  setStatusFilter('All');
                }}
                className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                title="Reset All Filters"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase whitespace-nowrap">Clear</span>
              </button>
            )}
          </div>
        </div>

        {stats.isLoading ? (
          <div className="p-20 flex flex-col items-center gap-4">
             <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Global Network Assets...</p>
          </div>
        ) : (
          <div className={cn(
            "p-8",
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"
          )}>
            {filteredStores?.map((store: any) => (
              viewMode === 'grid' ? (
                <div key={store.id} className="group p-7 bg-white border border-slate-200 rounded-[32px] hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                          store.performance_level === 'High' ? "bg-emerald-50 text-emerald-600" : 
                          store.performance_level === 'Low' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                        )}>
                          <Building2 className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#111827] group-hover:text-emerald-700 transition-colors leading-tight">{store.name}</h3>
                          <div className="flex items-center gap-1 text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">{store.location}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Live Inventory</span>
                         <p className="text-base font-black text-[#111827]">940 Items</p>
                      </div>
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Branch Staff</span>
                         <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <p className="text-base font-black text-[#111827]">{store.staff_count}</p>
                          </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Today's Sales</span>
                      <span className="text-xl font-black text-[#111827]">₹{store.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                      store.performance_level === 'High' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                      store.performance_level === 'Low' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                    )}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      {store.performance_level}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={store.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                   <div className="flex items-center gap-3 min-w-[250px]">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#111827]">{store.name}</p>
                        <p className="text-[9px] font-bold text-slate-400">{store.location}</p>
                      </div>
                   </div>
                   <div className="flex-1 flex justify-around items-center">
                      <div className="text-center">
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Revenue</span>
                         <p className="text-xs font-black text-[#111827]">₹{store.total_sales.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sales</span>
                         <p className="text-xs font-black text-[#111827]">{store.transaction_count}</p>
                      </div>
                   </div>
                   <div className={cn(
                      "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                      store.performance_level === 'High' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {store.performance_level}
                   </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Add Store Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#111827]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl border border-white/20 p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-[#111827]">Expand Network</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Register a new pharmacy branch to the portal.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStore} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Legal Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input 
                    name="name"
                    required
                    placeholder="e.g. HealthFirst Medics - North" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographic Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input 
                    name="location"
                    required
                    placeholder="Area, Sector or Landmark" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Contact Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input 
                    name="contact"
                    required
                    placeholder="Branch Contact Number" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createStore.isPending}
                  className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                >
                  {createStore.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Register Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
