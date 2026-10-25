// DisasterOS Public Alerts & Evacuation Advisories
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDisaster } from '../context/DisasterContext';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Radio, 
  CheckCircle2, 
  Waves, 
  Flame, 
  Activity,
  ArrowRight
} from 'lucide-react';

export const CitizenAlertsPage: React.FC = () => {
  const { alerts, isDemoMode } = useDisaster();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredAlerts = alerts.filter(a => 
    filterSeverity === 'all' || a.severity.toLowerCase() === filterSeverity.toLowerCase()
  );

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-16 selection:bg-[#38bdf8] selection:text-[#020617]">
      
      {/* Top Header */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                OFFICIAL CIVILIAN BROADCAST DIRECTIVES
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5D67] animate-ping" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Emergency Alerts & Evacuation Orders
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/citizen/sos"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF5D67] hover:bg-[#ff434e] text-white text-xs font-bold shadow-lg shadow-[#FF5D67]/30 transition-all hover:scale-105"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report SOS</span>
            </Link>
            <Link
              to="/citizen/dashboard"
              className="pill-button-secondary text-xs py-2 px-4 cursor-pointer"
            >
              <span>Citizen Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full mt-6 space-y-6">
        
        {/* Severity Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/50">Filter Level:</span>
            {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-[#38bdf8] text-[#020617]'
                    : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-white/50">
            {filteredAlerts.length} Active Directives
          </span>
        </div>

        {/* Alerts Feed */}
        <div className="space-y-4">
          {filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`p-6 rounded-3xl border transition-all space-y-3 ${
                  isCritical
                    ? 'bg-[#FF5D67]/10 border-[#FF5D67]/40 shadow-lg shadow-[#FF5D67]/10'
                    : 'bg-[#0D162B] border-white/10 shadow-lg'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical ? 'bg-[#FF5D67]/20 text-[#FF5D67]' : 'bg-[#FFB454]/20 text-[#FFB454]'
                    }`}>
                      <AlertTriangle className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isCritical ? 'text-[#FF5D67]' : 'text-[#FFB454]'
                      }`}>
                        {alert.severity} ADVISORY · {alert.type.toUpperCase()}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {alert.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/50 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                      {new Date(alert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                      {alert.affected_area}
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-white/80">
                  {alert.message}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">Broadcast Channels:</span>
                    {alert.channels.map(ch => (
                      <span key={ch} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10.5px] text-[#38bdf8]">
                        {ch}
                      </span>
                    ))}
                  </div>

                  <Link
                    to="/citizen/map"
                    className="text-xs font-semibold text-[#38bdf8] hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Affected Area on Public Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
