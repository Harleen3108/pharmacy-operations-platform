import { useState } from 'react';
import { 
  Lock, 
  User, 
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Package,
  TrendingUp,
  LineChart,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { authService } from '../api/services';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('password', password);

    try {
      const response = await authService.login(formData);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_role', response.role);
      localStorage.setItem('store_id', response.store_id);
      localStorage.setItem('store_name', response.store_name);
      localStorage.setItem('full_name', response.full_name);
      
      switch (response.role) {
        case 'District Admin':
          navigate('/admin');
          break;
        case 'Store Supervisor':
          navigate('/supervisor');
          break;
        case 'Pharmacist':
          navigate('/pharmacist');
          break;
        case 'Associate':
          navigate('/billing');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F4] font-outfit relative overflow-hidden flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-800/10 blur-[120px] rounded-full -ml-64 -mb-64"></div>
      
      {/* Navigation Header */}
      <nav className="h-20 w-full px-8 md:px-16 flex items-center justify-between relative z-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center p-2.5">
                <img src="/favicon.png" alt="Omnichannel Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-black text-[#013220] tracking-tight">OMNICHANNEL PHARMACY</span>
        </div>
        
        <button 
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2.5 bg-[#013220] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#024a30] transition-all shadow-xl shadow-emerald-900/10"
        >
            PORTAL ACCESS
        </button>
      </nav>

      {/* Hero Section Container */}
      <main className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 px-8 md:px-16 items-start py-20 relative z-10">
        
        {/* Left Column: Platform Values and AI Highlight */}
        <div className="hidden lg:flex flex-col space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D1FAE5] rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-[#065F46] uppercase tracking-widest">NEXT-GEN OPERATIONAL INTELLIGENCE</span>
                </div>
                
                <h2 className="text-6xl font-black text-[#111827] tracking-tighter leading-[0.95]">
                    AI-Powered Pharmacy <br /> Management System
                </h2>
                
                <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-lg">
                    A smart platform designed to manage multi-store pharmacy operations including inventory, sales, and stock tracking. The system uses AI to provide demand predictions, reorder suggestions, and real-time insights for better decision-making.
                </p>
            </div>

            {/* Feature List Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                {[
                    { icon: Package, text: 'Inventory & Stock Management' },
                    { icon: LineChart, text: 'Sales & Billing System' },
                    { icon: Clock, text: 'Expiry Tracking' },
                    { icon: Lock, text: 'Role-Based Access Control' },
                    { icon: TrendingUp, text: 'AI-Based Insights & Alerts' }
                ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-default">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#013220] group-hover:scale-110 transition-transform">
                            <feature.icon className="w-5 h-5 border-none" />
                        </div>
                        <span className="text-sm font-black text-[#111827] tracking-tight">{feature.text}</span>
                    </div>
                ))}
            </div>

            {/* AI Highlight Box Overlay - Exactly as in Image */}
            <div className="bg-white rounded-3xl border-l-[6px] border-l-[#065F46] border border-slate-100 p-8 max-w-xl shadow-xl shadow-emerald-900/5 mt-12 relative">
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center gap-2 text-[#065F46]">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-[#111827] uppercase tracking-widest">AI Highlights</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                        <span className="text-xs font-bold text-slate-500">Predicts product demand</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                        <span className="text-xs font-bold text-slate-500">Suggests stock reordering</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                        <span className="text-xs font-bold text-slate-500">Detects unusual transactions</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                        <span className="text-xs font-bold text-slate-500">Supports smart data queries</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Original Authentication Card Re-positioned */}
        <div className="flex flex-col items-center lg:items-end w-full animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="w-full max-w-[440px] space-y-8">
                {/* Branding elements shown on mobile only */}
                <div className="flex lg:hidden flex-col items-center mb-0 mt-4">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center p-3.5 mb-6">
                        <img src="/favicon.png" alt="Mobile Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-black text-[#013220] tracking-tight">OMNICHANNEL PHARMACY</h1>
                </div>

                {/* Authentication Card Section */}
                <div id="auth-section" className="bg-white rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100/50 p-8 md:p-12 relative overflow-hidden transition-all duration-500 scroll-mt-24">
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black text-[#111827] tracking-tight">Personnel Authentication</h3>
                        <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-2">ACCESSING OMNICHANNEL PHARMACY Operations</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-xs font-bold leading-relaxed">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {/* Personnel ID */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">PERSONNEL ID</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-300 group-focus-within:text-emerald-600 transition-colors">
                                    <User className="w-4.5 h-4.5" />
                                </div>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="enter your id"
                                    className="w-full pl-14 pr-6 py-4.5 bg-[#F1F3F2]/50 border-none rounded-2xl text-sm font-bold focus:ring-[6px] focus:ring-emerald-500/5 focus:bg-white transition-all outline-none text-[#111827] shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">PASSWORD</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-300 group-focus-within:text-emerald-600 transition-colors">
                                    <Lock className="w-4.5 h-4.5" />
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••"
                                    className="w-full pl-14 pr-14 py-4.5 bg-[#F1F3F2]/50 border-none rounded-2xl text-sm font-bold tracking-[0.5em] focus:ring-[6px] focus:ring-emerald-500/5 focus:bg-white transition-all outline-none text-[#111827] shadow-inner placeholder:tracking-normal"
                                    required
                                />
                                <button 
                                    type="button"
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] mt-4",
                                isLoading 
                                    ? "bg-slate-100 text-slate-400 cursor-wait" 
                                    : "bg-[#013220] text-white hover:bg-[#024a30] shadow-emerald-900/10"
                            )}
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Validating...</span>
                            ) : (
                                <>
                                    <span className="relative z-10">AUTHENTICATE</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <button className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 underline-offset-4 underline decoration-slate-200 transition-colors">
                            Trouble Signing In? Contact Systems Admin
                        </button>
                    </div>
                </div>

                <div className="text-center px-10 relative z-10 opacity-30 mt-4 md:hidden">
                    <p className="text-[9px] font-bold text-slate-400 tracking-[0.4em] uppercase">V 4.2.0-FINAL</p>
                </div>
            </div>
        </div>
      </main>

      {/* Footer System Branding */}
      <footer className="w-full bg-white/40 border-t border-slate-100 px-8 md:px-16 py-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-20">
        <div>
            <p className="text-[11px] font-black text-[#111827] tracking-tight">Built for efficient and intelligent pharmacy operations.</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1 opacity-70">© 2026 OMNICHANNEL PHARMACY Operations. Precision in every dose.</p>
        </div>
      </footer>
    </div>
  );
};
