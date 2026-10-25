// DisasterOS Password Recovery Flow
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatusMsg(null);

    const res = await forgotPassword(email);
    setLoading(false);
    setStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#38bdf8] selection:text-[#020617]">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70vmin_70vmin_at_50%_40%,rgba(56,189,248,0.12),transparent_75%)]" />

      <div className="relative z-10 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              Disaster<span className="text-[#38bdf8]">OS</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-white pt-2">
            Account Credential Recovery
          </h2>
          <p className="text-xs text-white/60">
            Enter your account email to dispatch emergency password reset directives
          </p>
        </div>

        <div className="terra-card p-6 sm:p-8 space-y-5 bg-[#0D162B]/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl">
          {statusMsg && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
              statusMsg.type === 'success'
                ? 'bg-[#55D6A7]/15 border-[#55D6A7]/40 text-[#55D6A7]'
                : 'bg-[#FF5D67]/15 border-[#FF5D67]/40 text-[#FF5D67]'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com or citizen@disasteros.org"
                  className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
            >
              {loading ? (
                <span>Dispatching Verification...</span>
              ) : (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-white/60 pt-2 border-t border-white/10">
            Remembered your credentials?{' '}
            <Link to="/login" className="text-[#38bdf8] font-semibold hover:underline">
              Return to Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
