import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { useAuth } from '../context/AuthContext';
import { HeaderBand } from '../components/layout/HeaderBand';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import { Shield, Phone, Users, Activity, Compass, AlertTriangle, Navigation, Radio } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const RescueTeamsPage: React.FC = () => {
  const { rescueTeams, missions, incidents, refreshData } = useDisaster();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Road hazard reporting modal state
  const [hazardModalOpen, setHazardModalOpen] = useState(false);
  const [hazardRoad, setHazardRoad] = useState('');
  const [hazardType, setHazardType] = useState('flooded');
  const [hazardDesc, setHazardDesc] = useState('');
  const [hazardSubmitting, setHazardSubmitting] = useState(false);

  const handleStatusChange = async (teamId: string, newStatus: any) => {
    setUpdatingId(teamId);
    try {
      await api.updateTeamStatus(teamId, newStatus);
      await refreshData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMissionStatus = async (missionId: string, currentStatus: string) => {
    let nextStatus: any = 'en_route';
    if (currentStatus === 'assigned') nextStatus = 'en_route';
    else if (currentStatus === 'en_route') nextStatus = 'on_scene';
    else if (currentStatus === 'on_scene') nextStatus = 'completed';

    try {
      await api.updateMissionStatus(missionId, nextStatus);
      await refreshData();
    } catch (err: any) {
      alert(`Mission update failed: ${err.message}`);
    }
  };

  const handleReportHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardRoad) return;

    setHazardSubmitting(true);
    try {
      await api.reportRoadHazard({
        road_name: hazardRoad,
        hazard_type: hazardType as any,
        description: hazardDesc,
        lat: 37.7749 + (Math.random() - 0.5) * 0.05,
        lng: -122.4194 + (Math.random() - 0.5) * 0.05
      });
      await refreshData();
      setHazardModalOpen(false);
      setHazardRoad('');
      setHazardDesc('');
    } catch (err: any) {
      alert(`Report failed: ${err.message}`);
    } finally {
      setHazardSubmitting(false);
    }
  };

  const isRescueOperator = user?.role === 'rescue_team';
  const myTeam = rescueTeams.find(t => t.lead_name.includes('Jenkins') || t.team_code === 'RT-SWIFT-01') || rescueTeams[0];

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Field Operations' },
          { label: 'Rescue Teams' }
        ]}
        title="Tactical Rescue Teams & Responder Readiness"
        description="Swiftwater extraction units, USAR structural collapse taskforces, and tactical paramedic triage teams."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">

        {/* ROLE-SPECIFIC WORKSPACE PANEL: RESCUE TEAM OPERATOR */}
        {isRescueOperator && myTeam && (
          <div className="bg-[#0D162B] border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    My Active Field Unit
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-300">{myTeam.team_code}</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  {myTeam.name}
                </h2>
                <p className="text-xs text-[#9AA6BA] mt-0.5">
                  Officer in Command: <strong className="text-white">{myTeam.lead_name}</strong> · Comms: <strong className="text-white">{myTeam.phone}</strong> · Personnel: <strong className="text-white">{myTeam.capacity} deployable</strong>
                </p>
              </div>

              {/* Status Update Quick Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#9AA6BA] mr-1">Unit Readiness:</span>
                {(['available', 'dispatched', 'on_scene', 'rest'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(myTeam.id, st)}
                    disabled={updatingId === myTeam.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      myTeam.status === st
                        ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400'
                        : 'bg-[#0A1022] text-white/80 border border-white/10 hover:border-amber-400 hover:text-white'
                    }`}
                  >
                    {st === 'rest' ? 'resting' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Shortcuts for Rescue Responder */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Field Grid GPS Telemetry Synchronized with DisasterOS EOC</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHazardModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Report Road Hazard
                </button>
                <button
                  onClick={() => navigate('/operator/routes')}
                  className="px-3 py-1.5 rounded-lg bg-[#38bdf8] text-[#020617] hover:bg-[#7dd3fc] text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Tactical Hazard-Free Routes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Readiness Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-[#9AA6BA] uppercase tracking-wide">Total Taskforces</span>
            <p className="text-2xl font-black text-white mt-1">{rescueTeams.length}</p>
            <span className="text-xs text-white/40">Search & Extraction units</span>
          </div>

          <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-[#9AA6BA] uppercase tracking-wide">Available Immediately</span>
            <p className="text-2xl font-black text-[#55D6A7] mt-1">
              {rescueTeams.filter(t => t.status === 'available').length}
            </p>
            <span className="text-xs text-white/40">Zero deployment delay</span>
          </div>

          <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-[#9AA6BA] uppercase tracking-wide">Currently In Action</span>
            <p className="text-2xl font-black text-[#FFB454] mt-1">
              {rescueTeams.filter(t => t.status === 'dispatched' || t.status === 'on_scene').length}
            </p>
            <span className="text-xs text-white/40">Active field missions</span>
          </div>

          <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-[#9AA6BA] uppercase tracking-wide">Field Personnel Count</span>
            <p className="text-2xl font-black text-[#38bdf8] mt-1">
              {rescueTeams.reduce((acc, t) => acc + (t.capacity || 0), 0)}
            </p>
            <span className="text-xs text-white/40">Trained tactical specialists</span>
          </div>
        </div>

        {/* Rescue Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rescueTeams.map(t => {
            const activeMission = missions.find(m => m.team_id === t.id && m.status !== 'completed');
            const targetIncident = activeMission ? incidents.find(i => i.id === activeMission.incident_id) : null;
            const isCurrentTeam = isRescueOperator && myTeam?.id === t.id;

            return (
              <div 
                key={t.id} 
                className={`bg-[#0D162B] border rounded-2xl p-5 space-y-4 transition-all ${
                  isCurrentTeam ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#38bdf8] bg-[#38bdf8]/15 border border-[#38bdf8]/30 px-2 py-0.5 rounded-md">
                        {t.team_code}
                      </span>
                      {isCurrentTeam && (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{t.name}</h3>
                    <p className="text-xs text-[#9AA6BA] mt-0.5">Lead Commander: <strong className="text-white">{t.lead_name}</strong></p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <div className="flex items-center gap-4 text-xs text-white/80 bg-[#0A1022] p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#55D6A7]" />
                    <span>Unit Strength: {t.capacity} members</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-white/70 block mb-1.5">Certified Capabilities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 capitalize">
                        {skill.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Active Mission Details */}
                {activeMission ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        Mission {activeMission.mission_code}
                      </span>
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {activeMission.status.replace('_', ' ')}
                      </span>
                    </div>
                    {targetIncident && (
                      <p className="text-white/80 text-xs truncate">
                        <strong className="text-white">Target:</strong> {targetIncident.title} ({targetIncident.address || 'Field Location'})
                      </p>
                    )}
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                      <Link 
                        to="/operator/routes" 
                        className="text-[#38bdf8] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Navigation className="w-3 h-3" />
                        Route to Target
                      </Link>
                      <button
                        onClick={() => handleMissionStatus(activeMission.id, activeMission.status)}
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] cursor-pointer"
                      >
                        {activeMission.status === 'on_scene' ? 'Mark Completed' : activeMission.status === 'en_route' ? 'Set On Scene' : 'Set En Route'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#0A1022] border border-white/5 flex items-center justify-between text-xs text-[#9AA6BA]">
                    <span>No active mission assigned</span>
                    <span className="text-[#55D6A7] font-semibold text-[11px]">Standing By</span>
                  </div>
                )}

                {/* Quick Action Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[#9AA6BA] text-[11px]">Set Status:</span>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      disabled={updatingId === t.id}
                      className="text-[11px] font-semibold bg-[#0A1022] border border-white/15 rounded px-2 py-0.5 text-white"
                    >
                      <option value="available">Available</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="on_scene">On Scene</option>
                      <option value="returning">Returning</option>
                      <option value="rest">Resting</option>
                    </select>
                  </div>

                  <button
                    onClick={() => navigate('/operator/map')}
                    className="text-[#38bdf8] font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Compass className="w-3 h-3" />
                    Locate on Map
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Hazard Modal */}
      {hazardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D162B] rounded-2xl border border-white/15 p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Report Field Road Blockage
              </h3>
              <button onClick={() => setHazardModalOpen(false)} className="text-white/40 hover:text-white text-sm cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-[#9AA6BA]">
              Field observations immediately alert other emergency vehicles and the AI routing engine to reroute convoys.
            </p>

            <form onSubmit={handleReportHazard} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Road / Intersection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marina Blvd & Scott St"
                  value={hazardRoad}
                  onChange={(e) => setHazardRoad(e.target.value)}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Hazard Nature</label>
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value)}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                >
                  <option value="flooded">Flooded / High Water Level</option>
                  <option value="structural_collapse">Structural Debris / Collapse</option>
                  <option value="power_lines">Downed High-Voltage Power Lines</option>
                  <option value="bridge_closed">Bridge Impassable</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Field Observations</label>
                <textarea
                  rows={2}
                  placeholder="Water depth approx 3 feet, impassable to ambulances..."
                  value={hazardDesc}
                  onChange={(e) => setHazardDesc(e.target.value)}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHazardModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white/70 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hazardSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {hazardSubmitting ? 'Transmitting...' : 'Broadcast Blockage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
