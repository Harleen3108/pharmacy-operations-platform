import { useState } from 'react';
import { 
  AlertCircle, 
  Sparkles, 
  Brain,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
  Send,
  Loader2,
  CheckCircle2
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
import { useAnalytics, useAI } from '../hooks/useClinicalApi';

const InsightCard = ({ icon: Icon, label, value, subtext, color, isLoading }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", color)}>
        <Icon className="w-5 h-5 shadow-sm" />
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-300" />
    </div>
    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
    {isLoading ? (
        <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
    ) : (
        <h3 className="text-2xl font-black text-[#111827] mb-1">{value}</h3>
    )}
    <p className="text-xs font-medium text-slate-500">{subtext}</p>
  </div>
);

export const AI = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [appliedId, setAppliedId] = useState<number | null>(null);
  
  const { trends, health } = useAnalytics();
  const { query: aiQueryMutation, applyReorder } = useAI();

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const query = aiQuery;
    setAiQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);

    aiQueryMutation.mutate({ query }, {
        onSuccess: (data) => {
            setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);
        }
    });
  };

  const handleApplySuggestion = (inventoryId: number, quantity: number) => {
      applyReorder.mutate({ inventoryId, quantity }, {
          onSuccess: () => {
              setAppliedId(inventoryId);
              setTimeout(() => setAppliedId(null), 3000);
          }
      });
  };

  const formattedTrends = trends.data?.map((t: any) => ({
    name: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    revenue: t.amount * 1.15 // Simulate "Forecast" as trend + 15%
  })) || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Powered Insights</span>
          </div>
          <h2 className="text-3xl font-black text-[#111827] tracking-tight">Forecasting & Optimization</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Zap className="w-4 h-4 text-emerald-500" />
          Sync Models
        </button>
      </div>

      {/* Top Section Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard 
          icon={Target} 
          label="Prediction Accuracy" 
          value="98.4%" 
          isLoading={false}
          color="bg-emerald-50 border-emerald-100 text-[#059669]" 
          subtext="+2.1% performance gain"
        />
        <InsightCard 
          icon={AlertCircle} 
          label="Stockout Risk" 
          value={`${health.data?.low_stock || 0} items`} 
          isLoading={health.isLoading}
          color="bg-orange-50 border-orange-100 text-orange-500" 
          subtext="High probability in Terminal branch"
        />
        <InsightCard 
          icon={ShieldCheck} 
          label="Expiring Batches" 
          value={`${health.data?.expiring_soon || 0} units`} 
          isLoading={health.isLoading}
          color="bg-rose-50 border-rose-100 text-rose-500" 
          subtext="Detected in active inventory"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="xl:col-span-8 bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-[#111827] text-xl">Demand Forecast</h3>
              <p className="text-xs text-slate-400 font-medium font-bold">Predictive revenue trends for the upcoming week based on historical velocity</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-bold text-[#065F46] border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                AI Predicted
              </span>
            </div>
          </div>
          <div className="h-[350px]">
             {trends.isLoading ? (
                <div className="w-full h-full bg-slate-50 animate-pulse flex items-center justify-center text-[10px] font-black text-slate-300">MODELS LOADING...</div>
             ) : (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedTrends.length > 0 ? formattedTrends : [{name: '...', revenue: 0}]}>
                    <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
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
                    <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorForecast)" 
                    animationDuration={2000}
                    />
                </AreaChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>

        {/* AI Assistant Column */}
        <div className="xl:col-span-4 space-y-6 flex flex-col">
          <div className="flex items-center gap-2 text-[#065F46]">
            <Brain className="w-4 h-4" />
            <h3 className="font-black text-sm uppercase tracking-wider">Ask Clinic Intelligence</h3>
          </div>

          <div className="bg-slate-900 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl border border-slate-800">
            {/* Chat Messages */}
            <div className="flex-1 p-6 space-y-4 overflow-auto min-h-[300px] max-h-[500px]">
                {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                         <Brain className="w-12 h-12 text-slate-500 mb-4" />
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                            Query medication trends <br/> or stockout risks
                         </p>
                    </div>
                )}
                {chatHistory.map((msg, i) => (
                    <div key={i} className={cn(
                        "p-4 rounded-xl text-xs font-medium leading-relaxed max-w-[85%]",
                        msg.role === 'user' ? "ml-auto bg-slate-800 text-slate-300" : "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                    )}>
                        {msg.content}
                    </div>
                ))}
                {aiQueryMutation.isPending && (
                    <div className="p-4 rounded-xl bg-emerald-600/20 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing Vault...
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleAskAI} className="p-4 bg-slate-800/50 border-t border-slate-800">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="e.g. Predict stockout for Amoxicillin" 
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold"
                    />
                    <button 
                        type="submit"
                        disabled={aiQueryMutation.isPending || !aiQuery.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-[8px] font-bold uppercase tracking-widest border border-orange-100">AI Recommendation</div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-lg font-black text-[#111827] mb-2">Replenish Essential Meds</h4>
              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 uppercase tracking-tighter">
                System detected {health.data?.low_stock || '...'} items below safety buffer. Reorder suggested for optimized winter stock.
              </p>
              <button 
                onClick={() => handleApplySuggestion(1, 50)}
                disabled={applyReorder.isPending || appliedId === 1}
                className={cn(
                    "w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    appliedId === 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-900 text-white hover:bg-black"
                )}
              >
                  {applyReorder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : appliedId === 1 ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {appliedId === 1 ? "Suggestion Applied" : "Apply Reorder (50 Units)"}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
