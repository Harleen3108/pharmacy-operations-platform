import { useState } from 'react';
import { 
  DollarSign, 
  Package, 
  TrendingUp,
  AlertTriangle,
  Brain,
  Store,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '../../lib/utils';

const PerformanceCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
        trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-2xl font-black text-[#111827]">{value}</h3>
  </div>
);

import { useAnalytics } from '../../hooks/useClinicalApi';

export const DistrictAdminDashboard = () => {
  const [days, setDays] = useState(1);
  const { districtSummary } = useAnalytics(days);
  const data = districtSummary.data || {
    total_sales: 0,
    sales_change: 0,
    total_dispensing: 0,
    dispensing_change: 0,
    avg_margin: 31.4,
    margin_change: 0,
    store_performance: []
  };

  const storeComparison = data.store_performance;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-outfit">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-[#111827] tracking-tight mb-2">District Performance</h2>
          <p className="text-slate-500 font-medium text-sm">Aggregated insights for all 4 clinical branches.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setDays(1)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all",
              days === 1 ? "bg-[#065F46] text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Today
          </button>
          <button 
            onClick={() => setDays(7)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all",
              days === 7 ? "bg-[#065F46] text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            )}
          >
            This Week
          </button>
          <button 
            onClick={() => setDays(30)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all",
              days === 30 ? "bg-[#065F46] text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            )}
          >
            This Month
          </button>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceCard 
          title="Total District Sales" 
          value={`₹${data.total_sales.toLocaleString()}`} 
          change={`${data.sales_change > 0 ? '+' : ''}${data.sales_change}%`} 
          trend={data.sales_change >= 0 ? 'up' : 'down'} 
          icon={DollarSign} 
          color="bg-emerald-600"
        />
        <PerformanceCard 
          title="Average Margin" 
          value={`${data.avg_margin}%`} 
          change={`${data.margin_change > 0 ? '+' : ''}${data.margin_change}%`} 
          trend={data.margin_change >= 0 ? 'up' : 'down'} 
          icon={TrendingUp} 
          color="bg-blue-600"
        />
        <PerformanceCard 
          title="Total Dispensing" 
          value={`${data.total_dispensing.toLocaleString()} pkts`} 
          change={`${data.dispensing_change > 0 ? '+' : ''}${data.dispensing_change}%`} 
          trend={data.dispensing_change >= 0 ? 'up' : 'down'} 
          icon={Package} 
          color="bg-purple-600"
        />
        <PerformanceCard 
          title="Anomaly Alerts" 
          value="3 Active" 
          change="Critical" 
          trend="down" 
          icon={AlertTriangle} 
          color="bg-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sales Distribution Chart */}
        <div className="xl:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-[#111827] text-lg">Sales Distribution</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Real-time store comparison</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="sales" fill="#065F46" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Inventory Intelligence */}
        <div className="bg-[#022C22] p-8 rounded-2xl text-white relative overflow-hidden flex flex-col">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                <Brain className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-400">AI Intelligence Hub</span>
            </div>
            
            <h3 className="text-2xl font-black mb-6 leading-tight">District Demand Forecasting</h3>
            
            <div className="space-y-6 mb-10">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-xs font-bold text-emerald-400 mb-1 leading-none uppercase tracking-widest">Reorder Suggestion</p>
                <p className="text-sm font-medium text-slate-300">Increase Paracetamol stock by 25% for North Hub based on upcoming flu season trends.</p>
              </div>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-xs font-bold text-rose-400 mb-1 leading-none uppercase tracking-widest">Anomaly Detected</p>
                <p className="text-sm font-medium text-slate-300">Unexplained stock variance in Insulin 30/70 (Batch #204) at East Side branch.</p>
              </div>
            </div>

            <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20">
              Generate Detailed AI Report
            </button>
          </div>
          
          {/* Decorative mesh */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        </div>
      </div>

      {/* Store Detailed List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-black text-[#111827]">Branch Performance Audit</h3>
          <button className="text-xs font-bold text-emerald-600 hover:underline">Download CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Branch</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue (24h)</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {storeComparison.map((store: any) => (
                <tr key={store.name} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[#065F46]">
                        <Store className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-[#111827]">{store.name} Pharmacy</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#111827]">₹{store.sales.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${store.margin * 2}%` }}></div>
                       </div>
                       <span className="text-[10px] font-black text-slate-400">{store.margin * 2}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Operational</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
