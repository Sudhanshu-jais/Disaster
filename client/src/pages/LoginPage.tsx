// DisasterOS Dual-Entry Authentication Portal
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Radio, 
  AlertTriangle,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Users
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Active portal tab: 'citizen' or 'operator'
  const initialPortal = searchParams.get('portal') === 'citizen' ? 'citizen' : 'operator';
  const [portal, setPortal] = useState<'citizen' | 'operator'>(initialPortal);

  // Form state
  const [email, setEmail] = useState(
    initialPortal === 'citizen' ? 'citizen@disasteros.org' : 'operator@disasteros.org'
  );
  const [password, setPassword] = useState(
    initialPortal === 'citizen' ? 'citizen123' : 'operator123'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Switch tabs
  const handleSwitchPortal = (target: 'citizen' | 'operator') => {
    setPortal(target);
    setErrorMsg(null);
    if (target === 'citizen') {
      setEmail('citizen@disasteros.org');
      setPassword('citizen123');
    } else {
      setEmail('operator@disasteros.org');
      setPassword('operator123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await login(email, password, portal);
      if (res.success) {
        if (portal === 'citizen') {
          navigate('/citizen/dashboard');
        } else {
          navigate('/operator/dashboard');
        }
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMsg('Network or service exception occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#38bdf8] selection:text-[#020617]">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70vmin_70vmin_at_50%_40%,rgba(56,189,248,0.12),transparent_75%)]" />

      <div className="relative z-10 max-w-md w-full space-y-6">
        
        {/* DisasterOS Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group transition-transform hover:scale-105">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0 overflow-visible">
              <defs>
                <linearGradient id="loginLogoGrad" x1="5" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5cc2ff" />
                  <stop offset="0.6" stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="12.6" stroke="url(#loginLogoGrad)" strokeWidth="1.7" />
              <ellipse cx="16" cy="16" rx="6.6" ry="12.6" stroke="url(#loginLogoGrad)" strokeWidth="1.5" />
              <path d="M16 3.4 V28.6" stroke="url(#loginLogoGrad)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M3.4 16 H28.6" stroke="url(#loginLogoGrad)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="21" cy="11" r="2.2" fill="#fb923c" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
              Disaster<span className="text-[#38bdf8]">OS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40">
                AI
              </span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-white pt-2">
            Multi-Tier Authentication Gateway
          </h2>
          <p className="text-xs text-white/60">
            Secure role-governed access for Citizens and Emergency Operators
          </p>
        </div>

        {/* Dual Portal Selection Pill Switcher */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#0A1022] border border-white/10 text-xs font-semibold gap-1.5">
          <button
            type="button"
            onClick={() => handleSwitchPortal('citizen')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portal === 'citizen'
                ? 'bg-[#38bdf8] text-[#020617] font-bold shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Citizen Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPortal('operator')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portal === 'operator'
                ? 'bg-[#38bdf8] text-[#020617] font-bold shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 shrink-0" />
            <span>Operator EOC</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="terra-card p-6 sm:p-8 space-y-5 bg-[#0D162B]/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold block">
                {portal === 'citizen' ? 'CIVILIAN EMERGENCY PORTAL' : 'AUTHORIZED EOC CLEARANCE'}
              </span>
              <p className="text-xs text-white/60 mt-0.5">
                {portal === 'citizen'
                  ? 'Sign in to report SOS, monitor regional safe shelters, and track aid.'
                  : 'Tactical clearance required for incident triage and resource dispatch.'}
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FF5D67]/15 border border-[#FF5D67]/40 flex items-start gap-2.5 text-xs text-[#FF5D67] animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={portal === 'citizen' ? 'citizen@disasteros.org' : 'operator@disasteros.org'}
                  className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#38bdf8] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm py-2.5 mt-2 flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to {portal === 'citizen' ? 'Citizen Portal' : 'Command Center'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Strip */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-white/50 block text-center">
              Evaluator Quick Access (1-Click Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  quickDemoLogin('citizen');
                  navigate('/citizen/dashboard');
                }}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-[#38bdf8]">
                  <Users className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                  <span>Demo Citizen</span>
                </div>
                <span className="text-[10px] text-white/50 block font-mono">Sarah Lin (Resident)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  quickDemoLogin('operator');
                  navigate('/operator/dashboard');
                }}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-[#38bdf8]">
                  <Radio className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                  <span>Demo Operator</span>
                </div>
                <span className="text-[10px] text-white/50 block font-mono">Chief Vance (EOC Lead)</span>
              </button>
            </div>
          </div>

          {/* Citizen Registration Link */}
          {portal === 'citizen' ? (
            <div className="text-center text-xs text-white/60 pt-2">
              Don't have a citizen profile?{' '}
              <Link to="/register" className="text-[#38bdf8] font-semibold hover:underline">
                Register as a Civilian &rarr;
              </Link>
            </div>
          ) : (
            <div className="text-center text-[11px] text-white/40 pt-2 font-mono">
              Operator accounts are provisioned via EOC administrative clearance only.
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link to="/" className="text-xs text-white/50 hover:text-white transition-colors">
            &larr; Return to DisasterOS Public Overview
          </Link>
        </div>
      </div>
    </div>
  );
};
