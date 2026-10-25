// DisasterOS Citizen Registration Page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerCitizen } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('San Francisco Bay Basin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await registerCitizen({
        fullName,
        email,
        phone,
        region,
        password
      });

      if (res.success) {
        navigate('/citizen/dashboard');
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#38bdf8] selection:text-[#020617]">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70vmin_70vmin_at_50%_40%,rgba(56,189,248,0.12),transparent_75%)]" />

      <div className="relative z-10 max-w-lg w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group transition-transform hover:scale-105">
            <span className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
              Disaster<span className="text-[#38bdf8]">OS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40">
                AI
              </span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-white pt-2">
            Civilian Account Registration
          </h2>
          <p className="text-xs text-white/60">
            Create your citizen profile to file verified SOS emergencies and track local safe shelters
          </p>
        </div>

        {/* Form Card */}
        <div className="terra-card p-6 sm:p-8 space-y-5 bg-[#0D162B]/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl">
          
          <div className="p-3 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center gap-2.5 text-xs text-[#7dd3fc]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#38bdf8]" />
            <span>Public registration creates a secure <strong>Citizen Profile</strong>. Operator roles require EOC administrator provisioning.</span>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FF5D67]/15 border border-[#FF5D67]/40 flex items-start gap-2.5 text-xs text-[#FF5D67] animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">Full Legal Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Lin"
                  className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Emergency Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (415) 555-0192"
                    className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">Geographic Region / District</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Marina District, Sector 4"
                  className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm py-2.5 mt-2 flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Civilian Profile...</span>
              ) : (
                <>
                  <span>Create Citizen Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-white/60 pt-2 border-t border-white/10">
            Already have an account?{' '}
            <Link to="/login?portal=citizen" className="text-[#38bdf8] font-semibold hover:underline">
              Sign In to Citizen Portal &rarr;
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs text-white/50 hover:text-white transition-colors">
            &larr; Return to DisasterOS Public Overview
          </Link>
        </div>
      </div>
    </div>
  );
};
