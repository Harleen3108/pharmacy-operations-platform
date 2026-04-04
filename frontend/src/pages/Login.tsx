import { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  ShieldPlus,
  MapPin,
  ChevronDown,
  AlertCircle
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
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await authService.login(formData);
      // Store token and role for the session
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_role', response.role);
      localStorage.setItem('store_id', response.store_id);
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#022C22] flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-700/20 blur-[120px] rounded-full"></div>
      
      <div className="max-w-[440px] w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 transition-all duration-500 hover:shadow-emerald-900/20">
        <div className="p-10 pb-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#065F46] rounded-xl flex items-center justify-center text-white shadow-xl mx-auto shadow-emerald-900/10">
            <ShieldPlus className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#111827] tracking-tight">Clinical Atelier</h1>
            <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase mt-2">OPERATIONAL HUB ACCESS</p>
          </div>
        </div>

        <div className="px-10 pb-10">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Personnel ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or associate"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-[#111827]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Pin</label>
                <button type="button" className="text-[10px] font-bold text-emerald-600 hover:underline tracking-tight">Forgot Access?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#065F46] transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-[#111827]"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-slate-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 border border-slate-100 shadow-sm">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">Branch Session</p>
                  <p className="text-xs font-bold text-[#111827]">Main St. Central Pharmacy</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all relative overflow-hidden flex items-center justify-center gap-2",
                isLoading 
                  ? "bg-slate-100 text-slate-400 cursor-wait" 
                  : "bg-[#065F46] text-white hover:bg-[#047857] shadow-xl shadow-emerald-900/10 active:scale-[0.98]"
              )}
            >
              <span className="relative z-10">{isLoading ? "Validating..." : "Authenticate"}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <div className="bg-slate-50/50 p-6 border-t border-slate-50 text-center flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AES-256 Encrypted Session</span>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center space-y-2">
        <p className="text-[10px] font-bold text-emerald-400/40 uppercase tracking-[0.5em]">Clinical Atelier v4.2.0</p>
      </div>
    </div>
  );
};
