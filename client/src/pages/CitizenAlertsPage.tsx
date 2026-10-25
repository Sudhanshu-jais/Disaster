// DisasterOS Public Emergency Alerts & Evacuation Advisories
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDisaster } from '../context/DisasterContext';
import { useAuth } from '../context/AuthContext';
import { emergencySound } from '../services/emergencySound';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Radio, 
  CheckCircle2, 
  Volume2,
  VolumeX,
  Megaphone,
  Share2,
  Copy,
  Check,
  Printer,
  Compass,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  TowerControl
} from 'lucide-react';

export const CitizenAlertsPage: React.FC = () => {
  const { alerts, isDemoMode, disaster } = useDisaster();
  const { isOperator } = useAuth();
  
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = filterSeverity === 'all' || a.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchesType = filterType === 'all' || a.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSeverity && matchesType;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const severeCount = alerts.filter(a => a.severity === 'severe').length;

  const handleToggleSiren = () => {
    if (isSirenPlaying) {
      emergencySound.stop();
      setIsSirenPlaying(false);
    } else {
      emergencySound.playEmergencySiren(6);
      setIsSirenPlaying(true);
      setTimeout(() => setIsSirenPlaying(false), 6000);
    }
  };

  const handleSpeakAlert = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
  };

  const handleCopyAlert = (id: string, alertObj: any) => {
    const text = `🚨 [DISASTEROS OFFICIAL ADVISORY]\n${alertObj.title}\nSeverity: ${alertObj.severity.toUpperCase()}\nAffected Area: ${alertObj.affected_area}\nDetails: ${alertObj.message}\nIssued: ${new Date(alertObj.sent_at).toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-20 selection:bg-[#38bdf8] selection:text-[#020617]">
      
      {/* 1. Header Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                CIVIL DEFENSE EMERGENCY ALERT BROADCAST SYSTEM (EAS)
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Public Safety Alerts & Evacuation Orders
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
              Official real-time disaster warnings, civil defense sirens, road closures, and shelter directives transmitted across regional communication towers.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {/* Siren Audio Button */}
            <button
              onClick={handleToggleSiren}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                isSirenPlaying
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/50'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
              }`}
              title={isSirenPlaying ? "Silence Emergency Siren" : "Sound Emergency Siren Audio"}
            >
              {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSirenPlaying ? 'Silence Siren' : 'Civil Defense Siren'}</span>
            </button>

            {/* Print Directives Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Emergency Directives for offline use"
            >
              <Printer className="w-3.5 h-3.5 text-white/70" />
              <span className="hidden sm:inline">Print / Save Offline</span>
            </button>

            {/* Operator Quick Broadcast Link */}
            {isOperator && (
              <Link
                to="/operator/alerts"
                className="px-3.5 py-2 rounded-xl bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#020617] text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#38bdf8]/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Broadcast New Alert</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full mt-6 space-y-6">
        
        {/* 2. Top Broadcast Status KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#0A1022] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-white/50 block font-bold">Total Directives</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">{alerts.length}</div>
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Live Tower Sync</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A1022] border border-rose-500/20">
            <span className="text-[10px] font-mono uppercase text-rose-300 block font-bold">Critical Warnings</span>
            <div className="text-2xl font-extrabold text-rose-400 mt-0.5">{criticalCount}</div>
            <span className="text-[11px] text-rose-300 font-mono mt-1 block">Immediate Life-Safety</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A1022] border border-amber-500/20">
            <span className="text-[10px] font-mono uppercase text-amber-300 block font-bold">Severe Advisories</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-0.5">{severeCount}</div>
            <span className="text-[11px] text-amber-300 font-mono mt-1 block">Rerouting Recommended</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A1022] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-[#38bdf8] block font-bold">Cell Channels</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">4 Active</div>
            <span className="text-[11px] text-white/50 font-mono mt-1 block">Push, SMS, Siren, Radio</span>
          </div>
        </div>

        {/* 3. Filters & Controls */}
        <div className="p-4 rounded-2xl bg-[#0D162B] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Severity Filter */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-mono text-white/50 mr-1">Severity:</span>
            {[
              { id: 'all', label: 'All Levels' },
              { id: 'critical', label: 'Critical' },
              { id: 'severe', label: 'Severe' },
              { id: 'warning', label: 'Moderate' },
              { id: 'info', label: 'Informational' }
            ].map(sev => (
              <button
                key={sev.id}
                onClick={() => setFilterSeverity(sev.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filterSeverity === sev.id
                    ? 'bg-[#38bdf8] text-[#020617] font-bold shadow-md'
                    : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-mono text-white/50 mr-1">Category:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'evacuat', label: 'Evacuations' },
              { id: 'flood', label: 'Floods' },
              { id: 'road', label: 'Road Closures' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  filterType === t.id
                    ? 'bg-white/20 text-white font-bold border border-white/30'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>

        {/* 4. Alerts Stream */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 bg-[#0A1022] rounded-3xl border border-white/10 space-y-3">
              <ShieldAlert className="w-10 h-10 mx-auto text-emerald-400" />
              <h3 className="text-base font-bold text-white">No Directives Match Selected Filter</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                No active public safety directives currently match the chosen severity or category parameters.
              </p>
              <button
                onClick={() => { setFilterSeverity('all'); setFilterType('all'); }}
                className="pill-button-secondary text-xs py-1.5 px-4 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCrit = alert.severity === 'critical';
              const isSevere = alert.severity === 'severe';
              const readText = `Official Emergency Advisory. ${alert.title}. ${alert.message}. Affected Geographic Area: ${alert.affected_area}.`;

              return (
                <div
                  key={alert.id}
                  className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xl ${
                    isCrit
                      ? 'bg-rose-950/25 border-rose-500/40 shadow-rose-950/20'
                      : isSevere
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-[#0D162B] border-white/10'
                  }`}
                >
                  {/* Alert Header Band */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-md'
                          : isSevere
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-blue-500/20 text-[#38bdf8] border border-blue-500/40'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 ${isCrit ? 'animate-bounce' : ''}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10.5px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            isCrit
                              ? 'bg-rose-500/30 text-rose-200 border-rose-400/50'
                              : isSevere
                              ? 'bg-amber-500/30 text-amber-200 border-amber-400/50'
                              : 'bg-blue-500/30 text-blue-200 border-blue-400/50'
                          }`}>
                            LEVEL {isCrit ? '4 CRITICAL' : isSevere ? '3 SEVERE' : '2 ADVISORY'} · {alert.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-[11px] text-white/50 font-mono hidden md:inline">
                            · Issuing Authority: DisasterOS Civil Protection
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                          {alert.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/60 font-mono shrink-0">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>Issued {new Date(alert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  </div>

                  {/* Alert Message Body */}
                  <div className="text-sm leading-relaxed text-white/90 font-medium">
                    {alert.message}
                  </div>

                  {/* Affected Geographic Area */}
                  <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#38bdf8] font-mono">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="font-bold text-white">Target Zone:</span>
                      <span>{alert.affected_area}</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/50 text-[11px] font-mono">
                      <span>Transmission Channels:</span>
                      {alert.channels && alert.channels.map(ch => (
                        <span key={ch} className="px-2 py-0.5 rounded bg-white/5 border border-white/15 uppercase text-[#38bdf8]">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Action Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    
                    {/* Audio & Sharing Tools */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeakAlert(alert.id, readText)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          speakingId === alert.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white/5 hover:bg-white/10 text-white/90 border border-white/10'
                        }`}
                        title="Listen to official voice transmission"
                      >
                        <Megaphone className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>{speakingId === alert.id ? 'Stop Voice' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => handleCopyAlert(alert.id, alert)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy alert text for SMS distribution"
                      >
                        {copiedId === alert.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === alert.id ? 'Copied to Clipboard' : 'Share / SMS'}</span>
                      </button>
                    </div>

                    {/* Navigation Directives */}
                    <div className="flex items-center gap-3">
                      <Link
                        to="/citizen/map"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 text-[#38bdf8] font-bold transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Inspect Safe Corridors</span>
                      </Link>

                      <Link
                        to="/citizen/sos"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-md shadow-rose-900/40"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Report Peril SOS</span>
                      </Link>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
