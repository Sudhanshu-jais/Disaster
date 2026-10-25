// DisasterOS Track My SOS Status & Real-Time Life-Safety Progress
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDisaster } from '../context/DisasterContext';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  HeartPulse, 
  Radio, 
  ArrowLeft,
  Share2,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { Incident } from '../types';

export const TrackSOSPage: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { incidents } = useDisaster();

  const [searchQuery, setSearchQuery] = useState(code || '');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sync with param or default to first SOS
  useEffect(() => {
    const targetCode = (code || searchQuery || '').replace('#', '').trim().toUpperCase();
    if (targetCode) {
      const found = incidents.find(i => 
        i.tracking_code.toUpperCase() === targetCode ||
        i.tracking_code.toUpperCase() === `SOS-${targetCode}` ||
        `#${i.tracking_code.toUpperCase()}` === targetCode
      );
      if (found) {
        setSelectedIncident(found);
        setSearchError(null);
      } else if (code) {
        setSearchError(`No active emergency incident found matching code "${code}".`);
      }
    } else if (incidents.length > 0) {
      setSelectedIncident(incidents[0]);
    }
  }, [code, incidents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.replace('#', '').trim().toUpperCase();
    if (!clean) return;

    const found = incidents.find(i => 
      i.tracking_code.toUpperCase().includes(clean) ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setSelectedIncident(found);
      setSearchError(null);
      navigate(`/citizen/track/${found.tracking_code}`);
    } else {
      setSearchError(`No incident found matching "${searchQuery}". Please check the code provided on submission.`);
    }
  };

  // Timeline steps
  const steps = [
    { key: 'submitted', label: 'Reported', desc: 'SOS signal transmitted & logged into EOC ingest' },
    { key: 'verified', label: 'Assessed', desc: 'Rule-based prioritization & severity validated' },
    { key: 'assigned', label: 'Assigned', desc: 'Tactical taskforce or facility resource allocated' },
    { key: 'in_progress', label: 'In Progress', desc: 'Rescue units active on-scene or en route' },
    { key: 'resolved', label: 'Resolved', desc: 'Evacuees safeguarded & incident stabilized' },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const order = ['submitted', 'verified', 'assigned', 'in_progress', 'resolved'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-16 selection:bg-[#38bdf8] selection:text-[#020617]">
      
      {/* Top Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-5 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/citizen/dashboard" className="text-xs text-[#38bdf8] hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Citizen Dashboard</span>
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold">
                INCIDENT LIFECYCLE TRACKER
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Track My Emergency SOS Report
            </h1>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter #SOS-xxxx..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#05070d] border border-white/15 rounded-full pl-8 pr-3 py-1.5 text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <button
              type="submit"
              className="pill-button-primary text-xs py-1.5 px-3.5 font-bold"
            >
              Lookup
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 w-full mt-8 space-y-6">
        
        {searchError && (
          <div className="p-4 rounded-2xl bg-[#FF5D67]/15 border border-[#FF5D67]/40 flex items-center gap-3 text-xs text-[#FF5D67]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {selectedIncident ? (
          <div className="space-y-6">
            
            {/* Main Status Header Card */}
            <div className="terra-card p-6 sm:p-8 space-y-6 bg-[#0D162B]/90 border border-white/15 rounded-3xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-mono font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-3 py-1 rounded-xl border border-[#38bdf8]/30">
                      #{selectedIncident.tracking_code}
                    </span>
                    <span className={`text-xs font-mono uppercase font-bold px-2.5 py-1 rounded-full ${
                      selectedIncident.severity === 'critical'
                        ? 'bg-[#FF5D67]/20 text-[#FF5D67] border border-[#FF5D67]/30'
                        : 'bg-[#FFB454]/20 text-[#FFB454] border border-[#FFB454]/30'
                    }`}>
                      {selectedIncident.severity} Severity
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white pt-1">
                    {selectedIncident.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>{selectedIncident.address || 'Reported Sector'} · Coordinates: {selectedIncident.latitude.toFixed(4)}° N, {selectedIncident.longitude.toFixed(4)}° W</span>
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-xs font-mono text-white/50 block">Current Triage Priority</span>
                  <div className="text-3xl font-extrabold text-[#38bdf8] font-mono">
                    {selectedIncident.priority_score}<span className="text-base text-white/40">/100</span>
                  </div>
                  <span className="text-[11px] text-[#55D6A7] font-semibold block">
                    Verified Multi-Factor Score
                  </span>
                </div>
              </div>

              {/* Chronological Lifecycle Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white/60 font-bold">
                  Chronological Rescue Progression
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                  {steps.map((st, idx) => {
                    const status = getStepStatus(st.key, selectedIncident.status);
                    return (
                      <div 
                        key={st.key}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          status === 'completed'
                            ? 'bg-[#55D6A7]/10 border-[#55D6A7]/30 text-white'
                            : status === 'current'
                            ? 'bg-[#38bdf8]/15 border-[#38bdf8]/50 text-white ring-1 ring-[#38bdf8]/50 shadow-lg'
                            : 'bg-white/[0.02] border-white/[0.06] text-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#55D6A7] shrink-0" />
                          ) : status === 'current' ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-white/30 shrink-0" />
                          )}
                          <span className={`text-xs font-bold ${status === 'current' ? 'text-[#38bdf8]' : ''}`}>
                            {idx + 1}. {st.label}
                          </span>
                        </div>
                        <p className="text-[11px] leading-snug opacity-80">
                          {st.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description & Field Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                <div className="space-y-2">
                  <span className="font-semibold text-white/60 uppercase text-[10.5px] font-mono">
                    Reported Emergency Description
                  </span>
                  <p className="text-white/80 leading-relaxed bg-[#05070d] p-3 rounded-xl border border-white/10">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-white/60 uppercase text-[10.5px] font-mono">
                    On-Scene Casualty & Life-Safety Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#05070d] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-white/50 block">People Affected</span>
                      <span className="text-sm font-mono font-bold text-white">{selectedIncident.affected_count || 1} civilians</span>
                    </div>
                    <div className="bg-[#05070d] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-white/50 block">Trapped Persons</span>
                      <span className="text-sm font-mono font-bold text-[#FF5D67]">{selectedIncident.trapped_count || 0} confirmed</span>
                    </div>
                    <div className="bg-[#05070d] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-white/50 block">Medical Urgency</span>
                      <span className="text-sm font-mono font-bold text-white">{selectedIncident.medical_urgency ? 'YES (High Priority)' : 'None reported'}</span>
                    </div>
                    <div className="bg-[#05070d] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-white/50 block">Children / Elderly</span>
                      <span className="text-sm font-mono font-bold text-white">{selectedIncident.has_children_elderly ? 'YES (Protected Group)' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Immediate Civilian Safety Directives while waiting */}
            <div className="p-6 rounded-3xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#38bdf8] font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Life-Safety Actions While Awaiting First Responders</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-white/80">
                <div className="p-3 rounded-2xl bg-[#05070d]/60 border border-white/10">
                  <strong className="text-white block mb-1">1. Stay on High Ground</strong>
                  Do not attempt to walk or drive through flowing water. Even 6 inches of rapid current can knock adults down.
                </div>
                <div className="p-3 rounded-2xl bg-[#05070d]/60 border border-white/10">
                  <strong className="text-white block mb-1">2. Conserve Cellular Power</strong>
                  Switch device to Battery Saver mode. Keep flashlights ready. Display a bright cloth or whistle if rescue boats approach.
                </div>
                <div className="p-3 rounded-2xl bg-[#05070d]/60 border border-white/10">
                  <strong className="text-white block mb-1">3. Direct Phone Contact</strong>
                  If someone sustains cardiac arrest or severe trauma, dial 911 directly rather than waiting for portal updates.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <ShieldAlert className="w-12 h-12 text-white/30 mx-auto" />
            <h3 className="text-base font-bold text-white">No Incident Selected</h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto">
              Please enter your SOS tracking code in the search bar above (e.g. #SOS-781) or view your active reports from the Citizen Dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
