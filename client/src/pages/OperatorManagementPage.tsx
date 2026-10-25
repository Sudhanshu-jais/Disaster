// DisasterOS Operator Management Workspace
// Administrative Hub: Team Roles, Data Source Telemetry Health, Immutable Audit History, and Policies.

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AuditLog } from '../types';
import {
  Sliders,
  Users,
  Shield,
  Activity,
  ClipboardList,
  Radio,
  Lock,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Key
} from 'lucide-react';

export const OperatorManagementPage: React.FC = () => {
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<'team' | 'datasources' | 'audit' | 'policies' | 'security'>('team');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [searchAudit, setSearchAudit] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [geminiStatus, setGeminiStatus] = useState<any>(null);

  const loadData = async () => {
    try {
      const logsRes = await api.getAuditLogs();
      setAuditLogs(logsRes.audit_logs);

      const hRes = await api.getHealth();
      setHealthData(hRes);

      const sbRes = await api.getSupabaseStatus();
      setSupabaseStatus(sbRes);

      const gemRes = await api.getGeminiStatus();
      setGeminiStatus(gemRes);
    } catch (e) {
      console.warn('[Management] Failed to fetch admin data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
    l.details.toLowerCase().includes(searchAudit.toLowerCase()) ||
    l.user_role.toLowerCase().includes(searchAudit.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-20 selection:bg-[#38bdf8] selection:text-[#05070d]">
      
      {/* 1. Header */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-8 sm:px-8">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                SYSTEM ADMINISTRATION & COMPLIANCE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10 font-bold">
                EOC MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Platform Administration & Integrations
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
              Manage organization roles, inspect external data-source connectivity, verify immutable audit records, and configure security boundaries.
            </p>
          </div>

          <button
            onClick={loadData}
            className="pill-button-secondary text-xs py-2 px-3 font-semibold flex items-center gap-1.5 self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {/* Sub-nav */}
        <div className="max-w-[1700px] mx-auto mt-6 flex items-center gap-2 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'team', label: 'Team Members & Roles (RBAC)', icon: Users },
            { id: 'datasources', label: 'Data Source Health & Telemetry', icon: Activity },
            { id: 'audit', label: 'Immutable Audit Trail', icon: ClipboardList },
            { id: 'policies', label: 'Notification & Broadcast Policies', icon: Radio },
            { id: 'security', label: 'Security & Privacy Configuration', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 border-b-2 shrink-0 cursor-pointer ${
                  active ? 'text-[#38bdf8] border-[#38bdf8]' : 'text-white/60 border-transparent hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Body Area */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 w-full mt-6 flex-1">
        
        {/* TAB 1: TEAM & ROLES (RBAC) */}
        {activeSection === 'team' && (
          <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Authorized Team Personas & Roles</h3>
              <p className="text-xs text-white/60">
                DisasterOS enforces least-privilege role-based access control across all operational tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Chief Marcus Vance", role: "authority", email: "authority@disasteros.gov", desc: "Full EOC dispatch & simulation approval authority." },
                { name: "Capt. Sarah Jenkins", role: "rescue_team", email: "responder@disasteros.gov", desc: "Swiftwater Taskforce mission queue and tactical status." },
                { name: "Dr. Arvind Patel", role: "hospital", email: "hospital@disasteros.gov", desc: "Metro Trauma Center bed and ICU capacity telemetry." },
                { name: "Elena Rostova", role: "warehouse", email: "warehouse@disasteros.gov", desc: "North Cache Depot stock allocation & dispatch." },
                { name: "Sgt. Tom Bradley", role: "logistics", email: "logistics@disasteros.gov", desc: "Heavy transit fleet tracking and road clearance." },
                { name: "Alex Mercer", role: "admin", email: "admin@disasteros.gov", desc: "Platform audit trails, API integrations, and policy limits." }
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{m.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold uppercase">
                      {m.role}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-white/50">{m.email}</div>
                  <p className="text-xs text-white/70">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DATA SOURCE HEALTH */}
        {activeSection === 'datasources' && (
          <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Data-Source Telemetry Health</h3>
              <p className="text-xs text-white/60">
                Continuous operational telemetry feeds and their current ingestion health.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "National Weather Service / OpenWeather", type: "Meteorological & Storm Surge", status: "Active Stream", latency: "140ms", note: "Continuous precipitation and atmospheric river tracking." },
                { name: "USGS Earthquake Hazard Program", type: "Seismic Telemetry Feed", status: "Active Stream", latency: "95ms", note: "Live 4.5+ magnitude tremors and aftershock shockwaves." },
                { name: "DisasterOS Realtime Event Bus", type: "WebSocket Broadcast (/ws)", status: "Active", latency: "< 5ms", note: "Instant tactical updates across Command Center and citizen portals." },
                { name: "Google Gemini 2.0 Flash AI", type: "LLM Decision Engine", status: geminiStatus?.configured ? "Connected" : "Simulated Heuristic", latency: "420ms", note: geminiStatus?.configured ? "Active Google AI Studio key" : "Using built-in explainable emergency engine." },
                { name: "Supabase Cloud Database", type: "PostgreSQL Hybrid Storage", status: supabaseStatus?.connected ? "Connected" : "Embedded Memory Store", latency: "65ms", note: "High-fidelity reactive data store with automatic cloud synchronization." },
                { name: "ReliefChain Attestation Protocol", type: "Verifiable Ledger Attestations", status: "Active", latency: "12ms", note: "Cryptographic hash logging for donations and field distribution receipts." }
              ].map((ds, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{ds.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {ds.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#38bdf8]">{ds.type} · Latency: {ds.latency}</div>
                  <p className="text-xs text-white/70">{ds.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: IMMUTABLE AUDIT TRAIL */}
        {activeSection === 'audit' && (
          <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Immutable Operational Audit Trail</h3>
                <p className="text-xs text-white/60">
                  Every state change, dispatch authorization, and inventory movement is permanently logged.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchAudit}
                  onChange={(e) => setSearchAudit(e.target.value)}
                  placeholder="Filter audit logs..."
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="divide-y divide-white/10 overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-white/40 font-mono uppercase text-[10px] pb-3">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 font-mono text-white/50 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/70 font-semibold uppercase">
                          {log.user_role}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[#38bdf8] font-bold text-[11px]">{log.action}</td>
                      <td className="py-2.5 text-white/80">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATION & BROADCAST POLICIES */}
        {activeSection === 'policies' && (
          <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Broadcast Safeguards & Siren Policies</h3>
              <p className="text-xs text-white/60">
                Safeguards to prevent panic, abuse, and notification fatigue during extended crises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="font-bold text-white">Nearby Emergency Alert Radius</span>
                <p className="text-white/70">
                  Consent-based civilian notifications are capped at <strong>1.5 km</strong> radius from verified SOS distress coordinates to protect bystander safety.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="font-bold text-white">Siren Broadcast Rate Limit</span>
                <p className="text-white/70">
                  High-priority audio siren transmissions are rate-limited to <strong>1 broadcast per sector per 15 minutes</strong> unless overridden by Chief Director.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="font-bold text-white">Duplicate SOS Suppressor</span>
                <p className="text-white/70">
                  Multiple calls from within a 50-meter radius within 3 minutes are clustered under a single master incident with incremented affected count.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="font-bold text-white">Audio Autoplay Policy Respect</span>
                <p className="text-white/70">
                  Browsers enforce user gesture requirements before playing Web Audio sirens. DisasterOS includes visible prompts if sound cannot play automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & PRIVACY */}
        {activeSection === 'security' && (
          <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Privacy Controls & Data Retention</h3>
              <p className="text-xs text-white/60">
                Ethical data management ensuring citizen safety without permanent surveillance.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Automatic GPS Trail Purging</div>
                  <div className="text-white/50 mt-0.5">High-accuracy live coordinate trails are purged 48 hours after incident resolution.</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Expiring Contact Tracking Links</div>
                  <div className="text-white/50 mt-0.5">Civilian SOS tracking tokens automatically expire after 24 hours and can be revoked instantly.</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Public Blockchain Privacy Safeguard</div>
                  <div className="text-white/50 mt-0.5">Beneficiary personal identities are never recorded on public ledgers; only cryptographic receipts and attestations are logged.</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold">ENFORCED</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
