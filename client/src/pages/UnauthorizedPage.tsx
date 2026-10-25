// DisasterOS Unauthorized Access (403 Access Denied) Page
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Radio, Users, Lock } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, isCitizen, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05070d] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#38bdf8] selection:text-[#020617]">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70vmin_70vmin_at_50%_40%,rgba(255,93,103,0.12),transparent_75%)]" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        
        {/* Warning Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#FF5D67]/15 border border-[#FF5D67]/40 flex items-center justify-center text-[#FF5D67] mx-auto shadow-2xl">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF5D67]">
            SECURITY PROTOCOL · ACCESS RESTRICTED [403]
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Operational Clearance Required
          </h1>
          <p className="text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
            {isCitizen ? (
              <>
                You are currently signed in as a <strong className="text-white">Civilian Resident ({user?.fullName})</strong>. Tactical incident command, resource allocation, and fleet administration require verified EOC operational credentials.
              </>
            ) : (
              <>
                The requested operational sector requires elevated administrative or dispatch clearance.
              </>
            )}
          </p>
        </div>

        {/* Action Options */}
        <div className="terra-card p-6 bg-[#0D162B]/80 backdrop-blur-2xl border border-white/15 rounded-3xl space-y-3">
          {isCitizen ? (
            <>
              <Link
                to="/citizen/dashboard"
                className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 font-bold"
              >
                <Users className="w-4 h-4" />
                <span>Return to Citizen Dashboard</span>
              </Link>
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] text-white/50 block mb-2 font-mono">
                  Testing as an Evaluator?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    quickDemoLogin('operator');
                    navigate('/operator/dashboard');
                  }}
                  className="w-full pill-button-secondary text-xs py-2 px-4 justify-center"
                >
                  <Radio className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Switch to Operator EOC Demo &rarr;</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/operator/dashboard"
              className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 font-bold"
            >
              <Radio className="w-4 h-4" />
              <span>Return to Command Center</span>
            </Link>
          )}
        </div>

        <div>
          <Link to="/" className="text-xs text-white/50 hover:text-white transition-colors">
            &larr; Return to DisasterOS Public Overview
          </Link>
        </div>
      </div>
    </div>
  );
};
