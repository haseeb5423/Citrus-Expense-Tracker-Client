
import React, { useState } from 'react';
import { Citrus, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

interface Props {
  onBack?: () => void;
}

export const AuthView: React.FC<Props> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };

      const { data } = await api.post(endpoint, body);

      authLogin(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--action-primary)] opacity-20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--success)] opacity-10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/10 relative z-10 fade-in shadow-2xl">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-8 right-8 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all hover:bg-[var(--bg-primary)] rounded-full"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#f97316] to-[#fbbf24] flex items-center justify-center shadow-2xl mb-6 transform hover:rotate-12 transition-transform duration-500">
            <Citrus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">Citrus</h1>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest text-center">
            {isLogin ? 'Access your financial vault' : 'Secure your financial future'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold animate-in slide-in-from-top-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-4">
                <User size={12} /> Full Identity
              </label>
              <input
                name="name" required placeholder="Alex Rivera"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[var(--action-primary)] transition-all shadow-inner"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-4">
              <Mail size={12} /> Email Access
            </label>
            <input
              name="email" type="email" required placeholder="alex@nexus.io"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[var(--action-primary)] transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-4">
              <Lock size={12} /> Security Key
            </label>
            <input
              name="password" type="password" required placeholder="••••••••"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[var(--action-primary)] transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[var(--action-primary)] to-[#fbbf24] text-white font-bold uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? 'Access Vault' : 'Initialize Core'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--action-primary)] transition-colors"
          >
            {isLogin ? "Don't have an access key? Initialize here" : "Already have a vault? Access here"}
          </button>
        </div>
      </div>
    </div>
  );
};
