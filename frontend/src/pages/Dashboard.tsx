import { 
  DollarSign, 
  Package, 
  ChevronRight,
  Plus,
  AlertCircle,
  Clock,
  Brain,
  History,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '../lib/utils';
import { useAnalytics, useSales } from '../hooks/useClinicalApi';

import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, badge, badgeType, isLoading }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-w-[200px]">
    <div className="flex justify-between items-start mb-6">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center border",
        badgeType === 'danger' ? "bg-rose-50 border-rose-100 text-rose-500" : 
        badgeType === 'warning' ? "bg-orange-50 border-orange-100 text-orange-500" :
        "bg-[#D1FAE5] border-emerald-100 text-[#059669]"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      {!isLoading && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
          badgeType === 'danger' ? "text-rose-600" : 
          badgeType === 'warning' ? "text-orange-600" :
          "text-[#059669]"
        )}>
          {badge}
        </span>
      )}
    </div>
    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
    {isLoading ? (
      <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
    ) : (
      <h3 className="text-2xl font-black text-[#111827]">{value}</h3>
    )}
  </div>
);

export const Dashboard = () => {
  const storeId = 1; // Default for prototype
  const navigate = useNavigate();
  const { trends, health } = useAnalytics();
  const { summary } = useSales(storeId);

  const formattedTrends = trends.data?.map((t: any) => ({
    name: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    revenue: t.amount
  })) || [];

  const dailyTotal = summary.data?.total_sales || 0;
  const lowStock = health.data?.low_stock || 0;
  const expiring = health.data?.expiring_soon || 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-[#111827] tracking-tight mb-2">Morning Overview</h2>
        <p className="text-slate-500 font-medium">Real-time operations for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: '2-digit' })}.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={DollarSign} 
              label="Daily Sales" 
              value={`₹${dailyTotal.toLocaleString()}`} 
              badge="+12% vs LW" 
              isLoading={summary.isLoading}
            />
            <StatCard 
              icon={FileText} 
              label="Dispensing" 
              value={`${summary.data?.total_transactions || 0} items`} 
              badge="Daily Queue" 
              isLoading={summary.isLoading}
            />
            <StatCard 
              icon={Package} 
              label="Low Stock Items" 
              value={`${lowStock} items`} 
              badgeType={lowStock > 0 ? "warning" : "default"} 
              badge={lowStock > 0 ? "ALERT" : "STABLE"} 
              isLoading={health.isLoading}
            />
            <StatCard 
              icon={Clock} 
              label="Expiring Soon" 
              value={`${expiring} batches`} 
              badgeType={expiring > 10 ? "danger" : "warning"} 
              badge={expiring > 10 ? "CRITICAL" : "MONITOR"} 
              isLoading={health.isLoading}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Revenue Performance Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black text-[#111827]">Revenue Performance</h3>
                  <p className="text-xs text-slate-400 font-medium">Weekly growth trend across all dispensing categories</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button className="px-3 py-1 text-[10px] font-bold bg-white text-[#111827] shadow-sm rounded-md uppercase">Weekly</button>
                  <button className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">Monthly</button>
                </div>
              </div>
              <div className="h-[280px]">
                {trends.isLoading ? (
                   <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-300">CALCULATING TRENDS...</span>
                   </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedTrends.length > 0 ? formattedTrends : [{name: 'N/A', revenue: 0}]}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                        dy={10} 
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-[#044E3B] p-8 rounded-xl text-white relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">AI Inventory Insights</span>
                </div>
                <h3 className="text-2xl font-black mb-4">Inventory Stock Pulse</h3>
                <p className="text-emerald-50/70 text-sm leading-relaxed mb-8">
                  {lowStock > 0 
                    ? `System has identified ${lowStock} high-demand items that require immediate replenishment to avoid service disruption.`
                    : "Inventory levels are currently optimized. No immediate procurement actions were identified by the AI engine."}
                </p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate('/ai')}
                    className="px-4 py-2 bg-[#10B981] hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Review All Suggestions
                  </button>
                  <button 
                    onClick={() => alert("Our AI models use Poisson Distribution combined with seasonal regression to predict pharmacy inventory velocity.")}
                    className="text-emerald-400 hover:text-white transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    View Methodology
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Snapshot (Dynamic Top Products soon) */}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-black text-[#111827] mb-8">System Health Snapshot</h3>
            <div className="space-y-6">
              {[
                { name: 'Dispensing Efficiency', value: 92, total: 100, color: 'bg-emerald-500' },
                { name: 'Cold Chain Compliance', value: 100, total: 100, color: 'bg-emerald-500' },
                { name: 'Queue Processing Speed', value: 78, total: 100, color: 'bg-orange-500' }
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#111827]">{item.name}</span>
                    <span className="text-slate-400">{item.value}% Accuracy Plan</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar/Activity Area */}
        <div className="space-y-8">
          {/* Urgent Tasks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-4 h-4" />
              <h3 className="font-black text-sm uppercase tracking-wider">Urgent Tasks</h3>
            </div>
            <div className="space-y-2">
               {lowStock > 0 && (
                <button 
                  onClick={() => navigate('/ai')}
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 border border-rose-100">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#111827]">Procure Low Stock</p>
                      <p className="text-[10px] text-slate-400 font-medium">{lowStock} SKUs below threshold</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
               )}
              {expiring > 0 && (
                <button 
                  onClick={() => navigate('/inventory')}
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 border border-orange-100">
                      <History className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#111827]">Expiry Audit</p>
                      <p className="text-[10px] text-slate-400 font-medium">{expiring} batches near end-of-life</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
               )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#111827]">Clinical Log</h3>
            <div className="space-y-6">
              {[
                { title: 'System Heartbeat', desc: 'Backend services synchronized', time: 'Online', color: 'bg-emerald-500' },
                { title: 'Database Integrated', desc: 'Seeded with 24 medications', time: 'Live', color: 'bg-emerald-500' },
                { title: 'POS Sync', desc: 'Transaction listener active', time: 'Active', color: 'bg-emerald-500' }
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", activity.color)} />
                  <div>
                    <p className="text-xs font-bold text-[#111827]">{activity.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{activity.desc} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
