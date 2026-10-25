// DisasterOS Operator Operations Workspace
// Unified Command Workspace synchronizing Tactical GIS, Incident Triage, Live SOS, Responder Telemetry & Resource Dispatch.

import React, { useState, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { emergencySound } from '../services/emergencySound';
import { Incident, RescueTeam, Vehicle, Hospital, Shelter, Warehouse, RoadHazard, Mission } from '../types';
import { DisasterMap } from '../components/map/DisasterMap';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ShieldAlert,
  MapPin,
  Users,
  HeartPulse,
  Navigation,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Truck,
  Boxes,
  Home,
  Flame,
  Search,
  Filter,
  Check,
  Zap,
  ArrowRight,
  Layers,
  Volume2
} from 'lucide-react';

export const OperatorOperationsPage: React.FC = () => {
  const { 
    incidents, 
    rescueTeams, 
    vehicles, 
    hospitals, 
    shelters, 
    warehouses, 
    inventory, 
    hazards, 
    missions,
    updateIncidentStatus,
    dispatchMission,
    refreshData 
  } = useDisaster();

  const { user } = useAuth();

  // Selected incident for contextual panel
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'triage' | 'teams' | 'facilities' | 'logistics' | 'broadcast'>('triage');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Allocation recommendation state
  const [allocationRec, setAllocationRec] = useState<any>(null);
  const [loadingAllocation, setLoadingAllocation] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState('critical');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const selectedIncident = incidents.find((i: Incident) => i.id === selectedIncidentId) || incidents[0];

  // Fetch AI allocation recommendation when selected incident changes
  useEffect(() => {
    if (selectedIncident && selectedIncident.status !== 'resolved') {
      setLoadingAllocation(true);
      setDispatchSuccess(false);
      api.aiAllocate(selectedIncident.id)
        .then((res: any) => setAllocationRec(res))
        .catch(() => setAllocationRec(null))
        .finally(() => setLoadingAllocation(false));
    } else {
      setAllocationRec(null);
    }
  }, [selectedIncidentId, incidents]);

  // Execute mission dispatch
  const handleAuthorizeDispatch = async () => {
    if (!selectedIncident || !allocationRec) return;
    try {
      await dispatchMission({
        incident_id: selectedIncident.id,
        team_id: allocationRec.recommended_team?.id,
        vehicle_id: allocationRec.recommended_vehicle?.id,
        target_hospital_id: allocationRec.recommended_hospital?.id,
        priority: selectedIncident.severity,
        objective: `Emergency Response to ${selectedIncident.title}`,
        notes: allocationRec.reasoning
      });

      emergencySound.playStatusChime();
      setDispatchSuccess(true);
      refreshData();
    } catch (err: any) {
      alert(`Dispatch failed: ${err.message}`);
    }
  };

  // Status transition progression
  const handleAdvanceStatus = async (nextStatus: any) => {
    if (!selectedIncident) return;
    await updateIncidentStatus(selectedIncident.id, nextStatus);
    emergencySound.playStatusChime();
    refreshData();
  };

  // Broadcast transmitter
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      await api.createAlert({
        title: broadcastTitle,
        message: broadcastMessage,
        severity: broadcastSeverity,
        affected_area: selectedIncident?.address || "Metropolitan Crisis Sector",
        channels: ["push", "sms", "siren"]
      });

      emergencySound.playEmergencySiren(3);
      setBroadcastSent(true);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setBroadcastSent(false), 5000);
      refreshData();
    } catch (err: any) {
      alert(`Broadcast failed: ${err.message}`);
    }
  };

  const filteredIncidents = incidents.filter((i: Incident) => {
    const matchesSev = filterSeverity === 'all' || i.severity === filterSeverity;
    const matchesStat = filterStatus === 'all' || i.status === filterStatus;
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (i.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesStat && matchesSearch;
  });

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-16 selection:bg-[#38bdf8] selection:text-[#05070d]">
      
      {/* 1. TOP OPERATIONAL HUD METRICS */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-8">
        <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                OPERATIONAL COMMAND CENTER · UNIFIED WORKSPACE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Tactical Operations & Multi-Agency Dispatch
            </h1>
          </div>

          {/* Connected Operational Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-white/50 uppercase">Active SOS</div>
              <div className="text-base font-bold font-mono text-white">
                {incidents.filter((i: Incident) => i.status !== 'resolved').length}
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-white/50 uppercase">Critical Queue</div>
              <div className="text-base font-bold font-mono text-rose-400">
                {incidents.filter((i: Incident) => i.severity === 'critical' && i.status !== 'resolved').length}
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-white/50 uppercase">Teams Deployed</div>
              <div className="text-base font-bold font-mono text-[#38bdf8]">
                {rescueTeams.filter((t: RescueTeam) => t.status !== 'available').length} / {rescueTeams.length}
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-white/50 uppercase">ICU Beds Free</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {hospitals.reduce((acc: number, h: Hospital) => acc + h.icu_available, 0)}
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-white/50 uppercase">Road Hazards</div>
              <div className="text-base font-bold font-mono text-amber-400">
                {hazards.filter((h: RoadHazard) => !h.is_passable).length} Impassable
              </div>
            </div>
          </div>
        </div>

        {/* Sub-workspace Navigation Tabs */}
        <div className="max-w-[1700px] mx-auto mt-4 flex items-center gap-2 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'triage', label: 'Incident Triage & Allocation', icon: ShieldAlert },
            { id: 'teams', label: 'Rescue Teams & Fleet Telemetry', icon: Truck },
            { id: 'facilities', label: 'Hospitals & Shelters Capacity', icon: HeartPulse },
            { id: 'logistics', label: 'Depot Stocks & Road Hazards', icon: Boxes },
            { id: 'broadcast', label: 'Emergency Siren Broadcast', icon: Radio }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`pb-2.5 px-3 text-xs font-semibold transition-colors flex items-center gap-1.5 border-b-2 shrink-0 cursor-pointer ${
                  active ? 'text-[#38bdf8] border-[#38bdf8]' : 'text-white/60 border-transparent hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. UNIFIED WORKSPACE BODY */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 w-full mt-6 flex-1 flex flex-col gap-6">
        
        {/* SUBTAB 1: INCIDENT TRIAGE & ALLOCATION (Main Screen) */}
        {activeSubTab === 'triage' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* Left 7 cols: Map & Incident List Synchronized */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Tactical GIS Map */}
              <div className="h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-xl relative">
                <DisasterMap
                  selectedIncident={selectedIncident || null}
                  onSelectIncident={(incident: Incident) => setSelectedIncidentId(incident.id)}
                />
              </div>

              {/* Incident Feed Controls & List */}
              <div className="rounded-3xl bg-[#0A1022] border border-white/10 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter queue by code, hazard, or address..."
                      className="w-full bg-white/[0.06] border border-white/10 focus:border-[#38bdf8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="bg-white/[0.06] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="all">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-white/[0.06] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="prioritized">Prioritized</option>
                      <option value="assigned">Assigned</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Compact Incident Rows */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {filteredIncidents.map((inc: Incident) => {
                    const isSelected = inc.id === selectedIncidentId;
                    return (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-600/15 border-[#38bdf8] shadow-md shadow-blue-500/10'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            inc.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            inc.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {inc.priority_score}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white">{inc.tracking_code}</span>
                              <span className="text-[10px] text-white/50 capitalize font-medium">{inc.type.replace('_', ' ')}</span>
                            </div>
                            <div className="text-xs text-white/80 font-medium truncate max-w-[280px] sm:max-w-[360px]">
                              {inc.title}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={inc.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 5 cols: Contextual Incident Action Workspace */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {selectedIncident ? (
                <div className="rounded-3xl bg-[#0A1022] border border-white/10 p-5 space-y-5 shadow-2xl flex-1 flex flex-col justify-between">
                  
                  {/* Incident Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold font-mono text-[#38bdf8]">
                            {selectedIncident.tracking_code}
                          </span>
                          <PriorityBadge priority={selectedIncident.severity} score={selectedIncident.priority_score} />
                        </div>
                        <h2 className="text-base font-bold text-white mt-1 leading-snug">
                          {selectedIncident.title}
                        </h2>
                      </div>
                      <StatusBadge status={selectedIncident.status} />
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs text-white/70">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <MapPin className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                        <span>{selectedIncident.address || 'Address unverified'}</span>
                      </div>
                      <p className="line-clamp-3 text-white/60">
                        {selectedIncident.description}
                      </p>
                      <div className="flex items-center gap-3 pt-1 border-t border-white/5 text-[11px] text-white/50">
                        <span>Trapped: {selectedIncident.trapped_count}</span>
                        <span>Injured: {selectedIncident.injured_count}</span>
                        <span>Vulnerable Present: {selectedIncident.has_children_elderly ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Explainable Prioritization Signals */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                      <span>Explainable Priority Rationale ({selectedIncident.priority_score}/100)</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#080D1A] border border-white/5 text-xs space-y-1.5">
                      <div className="text-[11px] text-white/70">
                        {selectedIncident.ai_classification?.rationale || 
                         `High lethality risk factor compounded by potential mass casualty vulnerability and reported physical entrapment.`}
                      </div>
                    </div>
                  </div>

                  {/* Smart Allocation Recommendation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Navigation className="w-4 h-4 text-[#55D6A7]" />
                        <span>Recommended Dispatch Package</span>
                      </div>
                      {loadingAllocation && <span className="text-[10px] text-white/40 animate-pulse">Computing transit...</span>}
                    </div>

                    {allocationRec ? (
                      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">
                            {allocationRec.recommended_team?.name || 'Rapid USAR Squad'}
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            ETA: {allocationRec.eta_minutes || 4} mins
                          </span>
                        </div>

                        <div className="text-[11px] text-white/60">
                          {allocationRec.reasoning}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 border-t border-white/5 font-mono text-white/50">
                          <div>Vehicle: {allocationRec.recommended_vehicle?.make_model || 'AMB-ALS-04'}</div>
                          <div>Target Trauma: {allocationRec.recommended_hospital?.name?.split(' ')[0] || 'St. Jude'}</div>
                        </div>

                        {/* Dispatch Button */}
                        {selectedIncident.status !== 'resolved' && !dispatchSuccess && (
                          <button
                            onClick={handleAuthorizeDispatch}
                            className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Authorize & Dispatch Responder Mission</span>
                          </button>
                        )}

                        {dispatchSuccess && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mission Successfully Dispatched!</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-white/[0.02] text-xs text-white/50">
                        {selectedIncident.status === 'resolved' 
                          ? 'Incident is already resolved.' 
                          : 'Analyzing resource proximity and road hazard detours...'}
                      </div>
                    )}
                  </div>

                  {/* Incident Lifecycle Stepper Controls */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="text-[10px] font-mono text-white/50 uppercase">Update Incident Lifecycle</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        onClick={() => handleAdvanceStatus('assigned')}
                        disabled={selectedIncident.status === 'assigned'}
                        className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white font-semibold text-[11px] cursor-pointer"
                      >
                        Set Assigned
                      </button>
                      <button
                        onClick={() => handleAdvanceStatus('in_progress')}
                        disabled={selectedIncident.status === 'in_progress'}
                        className="py-1.5 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40 font-semibold text-[11px] cursor-pointer"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleAdvanceStatus('resolved')}
                        disabled={selectedIncident.status === 'resolved'}
                        className="py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 font-semibold text-[11px] cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#0A1022] border border-white/10 text-center text-white/50">
                  Select an incident from the tactical map or feed to view telemetry.
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUBTAB 2: RESCUE TEAMS & FLEET TELEMETRY */}
        {activeSubTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#38bdf8]" />
                <span>Tactical Rescue Teams & Specialties</span>
              </h3>
              <div className="space-y-2.5">
                {rescueTeams.map(team => (
                  <div key={team.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{team.name} ({team.team_code})</div>
                      <div className="text-[11px] text-white/50">Lead: {team.lead_name} · Phone: {team.phone}</div>
                      <div className="text-[10px] text-white/40 mt-1">Skills: {team.skills.join(', ')}</div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                      team.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' :
                      team.status === 'dispatched' ? 'bg-blue-500/15 text-blue-400 animate-pulse' :
                      'bg-amber-500/15 text-amber-400'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#38bdf8]" />
                <span>Emergency Logistics Fleet Telemetry</span>
              </h3>
              <div className="space-y-2.5">
                {vehicles.map(v => (
                  <div key={v.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{v.make_model} ({v.registration_number})</div>
                      <div className="text-[11px] text-white/50">Driver: {v.driver_name} · Type: {v.type}</div>
                      <div className="text-[10px] text-white/40 mt-1">Fuel: {v.fuel_percent}% · Capacity: {v.capacity_payload_kg} kg</div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                      v.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' :
                      v.status === 'on_mission' ? 'bg-blue-500/15 text-blue-400 animate-pulse' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: HOSPITALS & SHELTERS CAPACITY */}
        {activeSubTab === 'facilities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#38bdf8]" />
                <span>Emergency Hospitals & Trauma Bed Buffer</span>
              </h3>
              <div className="space-y-3">
                {hospitals.map(h => (
                  <div key={h.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{h.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                        h.status === 'open' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {h.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                      <div>Total Beds: {h.total_beds}</div>
                      <div className="text-emerald-400 font-bold">Free: {h.available_beds}</div>
                      <div className="text-amber-400 font-bold">ICU Free: {h.icu_available}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-[#38bdf8]" />
                <span>Safe Havens & Shelter Occupancy</span>
              </h3>
              <div className="space-y-3">
                {shelters.map(s => {
                  const pct = Math.round((s.current_occupancy / s.capacity) * 100);
                  return (
                    <div key={s.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{s.name}</span>
                        <span className="text-xs font-mono text-[#38bdf8] font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span>{s.current_occupancy} / {s.capacity} Occupants</span>
                        <span>Food: {s.food_supplies_days} days · Pet-Friendly: {s.pet_friendly ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: DEPOT STOCKS & ROAD HAZARDS */}
        {activeSubTab === 'logistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#38bdf8]" />
                <span>Forward Cache Inventory Buffers</span>
              </h3>
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
                {inventory.map(item => (
                  <div key={item.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{item.item_name}</div>
                      <div className="text-[10px] text-white/40">Category: {item.category}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-white">{item.quantity_available} {item.unit}</div>
                      <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        item.status === 'healthy' ? 'text-emerald-400 bg-emerald-500/10' :
                        item.status === 'low' ? 'text-amber-400 bg-amber-500/10' :
                        'text-rose-400 bg-rose-500/10'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Reported Road Hazards & Dynamic Corridors</span>
              </h3>
              <div className="space-y-2.5">
                {hazards.map(hz => (
                  <div key={hz.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{hz.road_name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                        hz.is_passable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {hz.severity}
                      </span>
                    </div>
                    <div className="text-xs text-white/70">{hz.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: EMERGENCY BROADCAST */}
        {activeSubTab === 'broadcast' && (
          <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <span>Authorized Emergency Alert & Siren Transmitter</span>
              </h3>
              <p className="text-xs text-white/60">
                Broadcasts high-priority alerts to opted-in civilian devices and triggers warning telemetry across affected sectors.
              </p>
            </div>

            {broadcastSent && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Emergency Broadcast Dispatched & Logged in Immutable Audit Trail!</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Alert Headline</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Emergency: Evacuate Lower Basin"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3.5 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Message & Instructions</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={3}
                  placeholder="Factual action instructions for civilians..."
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">Severity</label>
                  <select
                    value={broadcastSeverity}
                    onChange={(e) => setBroadcastSeverity(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="critical">Critical (Immediate Life-Threat)</option>
                    <option value="severe">Severe Advisory</option>
                    <option value="moderate">Moderate Watch</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">Target Sector</label>
                  <input
                    type="text"
                    disabled
                    value={selectedIncident?.address || "Zone A Waterfront & Marina"}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Transmit Level-4 Emergency Siren & Push Alert</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
