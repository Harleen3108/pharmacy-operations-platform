import {  
  LineChart as LineChartIcon, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Users,
  Target,
  Zap,
  ArrowRight,
  Loader2,
  PieChart
} from 'lucide-react';
import { useAnalytics, useSales } from '../../hooks/useClinicalApi';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const SupervisorAnalytics = () => {
  const { storeId, storeName } = useAuth();
  const numericStoreId = parseInt(storeId || '1');
  
  const { trends, health } = useAnalytics(7, numericStoreId);
  const { summary } = useSales(numericStoreId);

  const stats = [
    { 
        label: 'Revenue (7D)', 
        value: `₹${trends.data?.reduce((acc: number, t: any) => acc + t.amount, 0).toLocaleString()}`, 
        change: '+12.5%', 
        trend: 'up',
        icon: TrendingUp,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    { 
        label: 'Avg Daily Sales', 
        value: `₹${trends.data?.length ? (trends.data.reduce((acc: number, t: any) => acc + t.amount, 0) / trends.data.length).toFixed(0).toLocaleString() : '0'}`, 
        change: '+4.2%', 
        trend: 'up',
        icon: Target,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    { 
        label: 'Transactions', 
        value: trends.data?.reduce((acc: number, t: any) => acc + t.transactions, 0) || 0, 
        change: '-2.1%', 
        trend: 'down',
        icon: ShoppingBag,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-12 font-outfit px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">Store Analytics</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs tracking-tight uppercase">Performance Insight Ledger • <span className="text-[#065F46] font-bold">{storeName}</span></p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] text-white rounded-lg">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">AI Forecast Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full",
                        stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.change}
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-[#111827]">{stat.value}</h3>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-black text-[#111827]">Revenue Timeline</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">7-Day Transaction Volume</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-[#065F46]" />
                        <span className="text-[9px] font-black uppercase text-slate-500">Revenue</span>
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full">
                {trends.isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends.data}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}}
                                dy={10}
                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}}
                                tickFormatter={(val) => `₹${val/1000}k`}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#065F46" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorAmount)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111827] p-8 rounded-3xl text-white shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white/10 rounded-2xl text-yellow-400">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">Optimal</span>
                </div>
                <h3 className="text-xl font-black mb-2">Category Performance</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">Wellness and Chronic Care continue to lead in profit margins this quarter.</p>
                <div className="space-y-4">
                    {[
                        { label: 'Antibiotics', value: 34, color: 'bg-emerald-500' },
                        { label: 'Wellness', value: 48, color: 'bg-blue-500' },
                        { label: 'Chronic Care', value: 18, color: 'bg-purple-500' }
                    ].map((item, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                                <span className="text-slate-400">{item.label}</span>
                                <span>{item.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top Fast-Moving SKU</h4>
                {summary.data?.top_product !== "N/A" ? (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#065F46]">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#111827]">{summary.data?.top_product}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase">High velocity asset</p>
                        </div>
                        <button className="ml-auto p-2 hover:bg-slate-50 rounded-xl transition-all">
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                        </button>
                    </div>
                ) : (
                    <p className="text-xs font-bold text-slate-400 italic">No sales data logged yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
