// DisasterOS Citizen Home Dashboard
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDisaster } from '../context/DisasterContext';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  HeartPulse, 
  Home, 
  PhoneCall, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Compass, 
  Search,
  Radio,
  LifeBuoy
} from 'lucide-react';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { incidents, shelters, hospitals, disaster, alerts, isDemoMode } = useDisaster();
  const navigate = useNavigate();

  const primaryAlert = alerts[0];

  // Find incidents submitted by the citizen (or sample ones matching citizen)
  const myIncidents = incidents.filter(i => 
    i.tracking_code.includes('SOS') || i.affected_count < 10
  ).slice(0, 3);

  const openShelters = shelters.filter(s => s.status === 'open');
  const openHospitals = hospitals.filter(h => h.status === 'open');

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-16 selection:bg-[#38bdf8] selection:text-[#020617]">
      
      {/* 1. TOP CITIZEN BANNER */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                CIVILIAN SAFETY & LIFE-PROTECTION PORTAL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
              {isDemoMode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                  SIMULATED SCENARIO
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.fullName || 'Resident'}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span>{user?.region || 'San Francisco Bay Basin'} · Active Crisis Response: {disaster?.title || 'Atmospheric River Inundation'}</span>
            </p>
          </div>

          {/* Prominent Emergency SOS Action */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/citizen/track"
              className="pill-button-secondary text-xs sm:text-sm py-2.5 px-4 font-semibold"
            >
              <Search className="w-4 h-4 text-[#38bdf8] shrink-0" />
              <span>Track SOS Report</span>
            </Link>

            <Link
              to="/citizen/sos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF5D67] hover:bg-[#ff434e] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF5D67]/30 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <span>REPORT EMERGENCY SOS</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full mt-8 space-y-8">
        
        {/* ACTIVE SOS STATUS (If citizen has submitted an incident) */}
        {myIncidents.length > 0 && myIncidents[0].status !== 'resolved' && (
          <div className="p-5 rounded-3xl bg-blue-600/15 border border-[#38bdf8]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[#38bdf8] shrink-0">
                <LifeBuoy className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#38bdf8]">
                    ACTIVE SOS DISTRESS TRANSMISSION: #{myIncidents[0].tracking_code}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                    {myIncidents[0].status}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  {myIncidents[0].title}
                </h2>
                <div className="text-xs text-white/70">
                  Location: {myIncidents[0].address} · Emergency teams dispatched and tracking live coordinates.
                </div>
              </div>
            </div>

            <Link
              to={`/citizen/track/${myIncidents[0].tracking_code}`}
              className="pill-button-primary text-xs py-2 px-4 font-bold flex items-center gap-2 shrink-0"
            >
              <span>View Live Rescue Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 2. ACTIVE REGIONAL PUBLIC ADVISORY STRIP */}
        {primaryAlert && (
          <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-xl ${
            primaryAlert.severity === 'critical'
              ? 'bg-rose-950/20 border-rose-500/40 text-rose-100 shadow-rose-950/20'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-100'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                primaryAlert.severity === 'critical'
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                  : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${primaryAlert.severity === 'critical' ? 'animate-bounce' : 'animate-pulse'}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    primaryAlert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    LEVEL {primaryAlert.severity.toUpperCase()} DIRECTIVE · {primaryAlert.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-[11px] text-white/50">· {new Date(primaryAlert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {primaryAlert.title}
                </h2>
                <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                  {primaryAlert.message}
                </p>
                <div className="text-[11px] text-[#38bdf8] font-mono pt-0.5">
                  Zone: {primaryAlert.affected_area}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/citizen/alerts"
                className="pill-button-primary text-xs py-2 px-4 cursor-pointer font-bold flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>All Directives</span>
              </Link>
              <Link
                to="/citizen/map"
                className="pill-button-secondary text-xs py-2 px-4 cursor-pointer"
              >
                <span>Safe Routes</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
          </div>
        )}

        {/* AI CONCISE SAFETY BRIEFING */}
        <div className="p-5 rounded-3xl bg-[#0A1022] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              <span>DisasterOS Grounded Safety Briefing</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              VERIFIED TELEMETRY
            </span>
          </div>

          <p className="text-xs text-white/80 leading-relaxed">
            Atmospheric River Storm Zephyr is currently producing sustained rainfall (38-42 mm/hr) with peak high-tide crest expected in 35 minutes. 
            <strong> 2 safe havens (St. Jude Community Center & Lincoln High Gymnasium)</strong> have 205 open beds, hot meals, and zero flood risk. 
            All emergency responder corridors are maintaining elevated high-ground routing along Van Ness Ave.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
            <Link
              to="/citizen/sos"
              className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-400 transition-colors flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-rose-300 block">Get Help / SOS</span>
                <span className="text-[10.5px] text-white/50">Request immediate extraction</span>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/citizen/map"
              className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 transition-colors flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-blue-300 block">Safety Map</span>
                <span className="text-[10.5px] text-white/50">Shelters, hazards & routes</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/citizen/donate"
              className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 transition-colors flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-300 block">Donate & Support</span>
                <span className="text-[10.5px] text-white/50">Verified relief funds</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/citizen/assistant"
              className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 transition-colors flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-cyan-300 block">AI Safety Assistant</span>
                <span className="text-[10.5px] text-white/50">Ask evacuation & shelter advice</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3. THREE OPERATIONAL SNAPSHOT COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Col 1: Nearby Safe Evacuation Shelters */}
          <div className="terra-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#55D6A7]/20 border border-[#55D6A7]/40 flex items-center justify-center text-[#55D6A7]">
                    <Home className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Nearby Evacuation Shelters</h3>
                </div>
                <span className="text-xs font-mono text-[#55D6A7] font-semibold">
                  {openShelters.length} OPEN
                </span>
              </div>
              <p className="text-xs text-white/60">
                Public intake sanctuaries with heated cots, hot meals, drinking water, and basic medical aid.
              </p>

              <div className="space-y-2.5 pt-1">
                {openShelters.slice(0, 3).map(s => {
                  const available = s.capacity - s.current_occupancy;
                  return (
                    <div key={s.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-semibold text-white">{s.name}</h4>
                        <span className="text-[11px] text-white/50">{s.address}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono font-bold text-[#55D6A7]">
                          {available} places
                        </span>
                        <span className="block text-[10px] text-white/40">Available</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/citizen/map"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#38bdf8] hover:text-white pt-2 border-t border-white/10"
            >
              <span>Explore Public Shelter Map</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>

          {/* Col 2: Emergency Trauma Care Centers */}
          <div className="terra-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#FF5D67]/20 border border-[#FF5D67]/40 flex items-center justify-center text-[#FF5D67]">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Trauma Hospitals</h3>
                </div>
                <span className="text-xs font-mono text-[#38bdf8] font-semibold">
                  {openHospitals.length} ACTIVE
                </span>
              </div>
              <p className="text-xs text-white/60">
                Verified emergency medical faculties and triage stations accepting civilian injuries.
              </p>

              <div className="space-y-2.5 pt-1">
                {openHospitals.slice(0, 3).map(h => (
                  <div key={h.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-white">{h.name}</h4>
                      <span className="text-[11px] text-white/50">Level-{h.trauma_level} Trauma · {h.address}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold text-[#38bdf8]">
                        {h.available_beds} beds
                      </span>
                      <span className="block text-[10px] text-[#55D6A7]">Accepting</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/citizen/assistant"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#38bdf8] hover:text-white pt-2 border-t border-white/10"
            >
              <span>Ask AI About Hospital Triage</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>

          {/* Col 3: Direct Emergency Contact Helplines */}
          <div className="terra-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Official Emergency Helplines</h3>
              </div>
              <p className="text-xs text-white/60">
                Direct telephony dispatch numbers if cellular internet coverage or power is degraded.
              </p>

              <div className="space-y-2 pt-1 text-xs">
                {[
                  { name: 'National Life-Safety Emergency', num: '911', desc: 'Direct Police, Fire & Paramedic Dispatch' },
                  { name: 'DisasterOS Regional EOC Hotline', num: '1-800-555-DISASTER', desc: 'Evacuation logistics and bus rendezvous' },
                  { name: 'Red Cross Family Reunification', num: '1-800-733-2767', desc: 'Shelter intake and missing persons' },
                  { name: 'Poison Control & Hazmat', num: '1-800-222-1222', desc: 'Chemical contamination and floodwater toxins' }
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">{item.name}</span>
                      <span className="text-[10px] text-white/50">{item.desc}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#38bdf8]">{item.num}</span>
                  </div>
                ))}
              </div>
            </div>

            <span className="text-[10.5px] text-white/40 block text-center pt-2 border-t border-white/10">
              ⚡ In life-threatening emergencies, always dial 911 immediately.
            </span>
          </div>
        </div>

        {/* 4. MY SUBMITTED SOS REPORTS STRIP */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                My Submitted SOS Reports
              </h3>
              <p className="text-xs text-white/60">
                Track the chronological rescue progress of your emergency submissions
              </p>
            </div>
            <Link
              to="/citizen/track"
              className="text-xs text-[#38bdf8] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Search any tracking code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myIncidents.map(inc => (
              <div 
                key={inc.id}
                onClick={() => navigate(`/citizen/track/${inc.tracking_code}`)}
                className="p-5 rounded-2xl bg-[#0D162B] border border-white/10 hover:border-[#38bdf8]/40 transition-all cursor-pointer shadow-xl space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-2.5 py-1 rounded-lg border border-[#38bdf8]/30">
                    #{inc.tracking_code}
                  </span>
                  <span className={`text-[10.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                    inc.status === 'resolved' 
                      ? 'bg-[#55D6A7]/20 text-[#55D6A7]' 
                      : inc.status === 'in_progress' 
                      ? 'bg-[#38bdf8]/20 text-[#38bdf8] animate-pulse'
                      : 'bg-[#FFB454]/20 text-[#FFB454]'
                  }`}>
                    {inc.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                    {inc.title}
                  </h4>
                  <p className="text-xs text-white/60 line-clamp-2 mt-1">
                    {inc.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#38bdf8]" />
                    {inc.address || 'Bay Area'}
                  </span>
                  <span className="text-[#38bdf8] font-semibold group-hover:translate-x-1 transition-transform">
                    Track &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. CITIZEN ACTION SHORTCUTS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <Link
            to="/citizen/sos"
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-center space-y-2 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FF5D67]/20 text-[#FF5D67] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Report SOS</h4>
            <span className="text-[10px] text-white/50 block">Urgent rescue or supplies</span>
          </Link>

          <Link
            to="/citizen/map"
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-center space-y-2 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Public Map</h4>
            <span className="text-[10px] text-white/50 block">Shelters, hospitals & safe paths</span>
          </Link>

          <Link
            to="/citizen/assistant"
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-center space-y-2 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#55D6A7]/20 text-[#55D6A7] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">AI Safety Guide</h4>
            <span className="text-[10px] text-white/50 block">First aid, packing & evacuation</span>
          </Link>

          <Link
            to="/citizen/profile"
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-center space-y-2 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">My Profile</h4>
            <span className="text-[10px] text-white/50 block">Contacts & notifications</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
