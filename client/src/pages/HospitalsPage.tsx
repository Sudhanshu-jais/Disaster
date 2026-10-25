import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { useAuth } from '../context/AuthContext';
import { HeaderBand } from '../components/layout/HeaderBand';
import { StatusBadge } from '../components/common/StatusBadge';
import { Hospital } from '../types';
import { api } from '../services/api';
import { Activity as HospitalIcon, HeartPulse, Plus, Minus, ShieldAlert, Boxes, AlertTriangle, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const HospitalsPage: React.FC = () => {
  const { hospitals, incidents, refreshData } = useDisaster();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [beds, setBeds] = useState<number>(0);
  const [icu, setIcu] = useState<number>(0);
  const [status, setStatus] = useState<string>('open');
  const [isUpdating, setIsUpdating] = useState(false);
  const [resupplyMessage, setResupplyMessage] = useState<string | null>(null);

  const isHospitalOperator = user?.role === 'hospital';
  const isCitizen = user?.role === 'citizen';

  // Primary facility for the logged-in doctor
  const myHospital = hospitals.find(h => h.name.includes('Metropolitan') || h.trauma_level === 1) || hospitals[0];

  const handleQuickAdjust = async (hospitalId: string, deltaBeds: number, deltaIcu: number) => {
    const target = hospitals.find(h => h.id === hospitalId);
    if (!target) return;

    const newBeds = Math.max(0, Math.min(target.total_beds, target.available_beds + deltaBeds));
    const newIcu = Math.max(0, Math.min(target.icu_total, target.icu_available + deltaIcu));

    try {
      await api.updateHospitalCapacity(hospitalId, {
        available_beds: newBeds,
        icu_available: newIcu
      });
      await refreshData();
    } catch (err: any) {
      alert(`Capacity update failed: ${err.message}`);
    }
  };

  const handleToggleDivert = async (hospitalId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'open' ? 'diverted' : 'open';
    try {
      await api.updateHospitalCapacity(hospitalId, { status: nextStatus });
      await refreshData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleRequestSupplies = async () => {
    try {
      await api.createAlert({
        title: `URGENT MEDICAL RESUPPLY: ${myHospital?.name || 'Metropolitan Hospital'}`,
        message: 'Requesting immediate emergency dispatch of 40 Trauma Hemostatic Kits and 20 Blood Plasma Units.',
        severity: 'severe',
        type: 'medical_resupply'
      });
      setResupplyMessage('Emergency resupply requisition transmitted to Central Depot!');
      setTimeout(() => setResupplyMessage(null), 4000);
      refreshData();
    } catch (err: any) {
      alert(`Request failed: ${err.message}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospital) return;
    setIsUpdating(true);
    try {
      await api.updateHospitalCapacity(editingHospital.id, {
        available_beds: beds,
        icu_available: icu,
        status: status as any
      });
      await refreshData();
      setEditingHospital(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // High-priority casualty queue
  const incomingTraumaIncidents = incidents.filter(
    i => i.severity === 'critical' && i.status !== 'resolved'
  );

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Medical Operations' },
          { label: 'Hospitals & Trauma Centers' }
        ]}
        title="Emergency Hospital Triage & Bed Capacity Network"
        description="Live ICU availability, level-1 trauma facilities, surgical capabilities, and patient divert protocols."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">

        {/* ROLE WORKSPACE: HOSPITAL TRIAGE OPERATOR */}
        {isHospitalOperator && myHospital && (
          <div className="bg-[#0D162B] border border-rose-500/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    Medical Triage Console
                  </span>
                  <span className="text-xs font-bold text-rose-300">Authorized: Dr. Arvind Patel</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <HospitalIcon className="w-5 h-5 text-rose-400" />
                  {myHospital.name} (Trauma Level {myHospital.trauma_level})
                </h2>
                <p className="text-xs text-[#9AA6BA]">
                  Address: <strong className="text-white">{myHospital.address}</strong> · Phone: <strong className="text-white">{myHospital.phone}</strong> · Helipad: <strong className="text-white">{myHospital.has_helipad ? 'Active' : 'No'}</strong>
                </p>
              </div>

              {/* Instant Capacity Fast-Adjusters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* General Beds Quick Click */}
                <div className="bg-[#0A1022] border border-rose-500/30 rounded-xl p-2.5 text-center min-w-[120px]">
                  <span className="text-[10px] font-bold text-[#9AA6BA] uppercase block">General Beds</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      onClick={() => handleQuickAdjust(myHospital.id, -5, 0)}
                      className="p-1 rounded bg-white/10 hover:bg-rose-500/30 text-white cursor-pointer"
                      title="Decrease by 5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-bold text-white">{myHospital.available_beds}</span>
                    <button
                      onClick={() => handleQuickAdjust(myHospital.id, 5, 0)}
                      className="p-1 rounded bg-white/10 hover:bg-emerald-500/30 text-white cursor-pointer"
                      title="Increase by 5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ICU Beds Quick Click */}
                <div className="bg-[#0A1022] border border-rose-500/30 rounded-xl p-2.5 text-center min-w-[120px]">
                  <span className="text-[10px] font-bold text-[#9AA6BA] uppercase block">ICU / Vent Beds</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      onClick={() => handleQuickAdjust(myHospital.id, 0, -2)}
                      className="p-1 rounded bg-white/10 hover:bg-rose-500/30 text-white cursor-pointer"
                      title="Decrease by 2"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-bold text-rose-400">{myHospital.icu_available}</span>
                    <button
                      onClick={() => handleQuickAdjust(myHospital.id, 0, 2)}
                      className="p-1 rounded bg-white/10 hover:bg-emerald-500/30 text-white cursor-pointer"
                      title="Increase by 2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Divert Toggle */}
                <button
                  onClick={() => handleToggleDivert(myHospital.id, myHospital.status)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                    myHospital.status === 'open'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  }`}
                >
                  {myHospital.status === 'open' ? 'STATUS: OPEN' : 'STATUS: DIVERTED'}
                </button>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-rose-300">
                <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Live EMR Triage Telemetry Sync Active</span>
                {resupplyMessage && (
                  <span className="ml-2 font-bold text-[#55D6A7] bg-[#55D6A7]/15 px-2 py-0.5 rounded border border-[#55D6A7]/30">
                    {resupplyMessage}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRequestSupplies}
                  className="px-3 py-1.5 rounded-lg bg-[#0A1022] border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5 text-rose-400" />
                  Request Trauma Resupply
                </button>
                <button
                  onClick={() => navigate('/operator/dashboard')}
                  className="px-3 py-1.5 rounded-lg bg-[#38bdf8] text-[#020617] hover:bg-[#7dd3fc] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  EOC Command Center
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROLE WORKSPACE: CITIZEN VIEW */}
        {isCitizen && (
          <div className="bg-[#0D162B] border border-[#38bdf8]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#38bdf8] text-[#020617] flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Need Immediate Emergency Medical Care?</h3>
                <p className="text-xs text-[#9AA6BA]">
                  If you are experiencing severe bleeding, difficulty breathing, or trauma, submit an SOS or call 911 immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/citizen/sos"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md whitespace-nowrap cursor-pointer"
              >
                🚨 Transmit Emergency SOS
              </Link>
            </div>
          </div>
        )}

        {/* Incoming Trauma Queue */}
        {incomingTraumaIncidents.length > 0 && (
          <div className="bg-[#0D162B] border border-rose-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-white">
                  High-Acuity Incoming Casualty Queue ({incomingTraumaIncidents.length} Critical Cases)
                </h3>
              </div>
              <span className="text-[11px] text-[#9AA6BA] font-mono">Priority Triage Stream</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {incomingTraumaIncidents.slice(0, 3).map(inc => (
                <div key={inc.id} className="p-3 rounded-xl bg-[#0A1022] border border-rose-500/20 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                      #{inc.tracking_code}
                    </span>
                    <span className="text-[10px] font-bold text-rose-400">Priority: {inc.priority_score}/100</span>
                  </div>
                  <h4 className="font-bold text-white truncate">{inc.title}</h4>
                  <p className="text-[11px] text-[#9AA6BA] line-clamp-1">{inc.description}</p>
                  <div className="pt-1 flex items-center justify-between text-[10.5px] text-white/50">
                    <span>{inc.address || 'Waterfront Grid'}</span>
                    <span className="text-rose-400 font-bold capitalize">{inc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-[#9AA6BA] uppercase tracking-wide">Total Standard Beds Free</span>
            <p className="text-2xl font-black text-white mt-1">
              {hospitals.reduce((acc, h) => acc + h.available_beds, 0)}
            </p>
            <span className="text-xs text-white/40">Across {hospitals.length} receiving centers</span>
          </div>

          <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-[#9AA6BA] uppercase tracking-wide">Critical ICU Beds Free</span>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {hospitals.reduce((acc, h) => acc + h.icu_available, 0)}
            </p>
            <span className="text-xs text-white/40">High acuity life-support</span>
          </div>

          <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-[#9AA6BA] uppercase tracking-wide">Trauma Level 1 Centers</span>
            <p className="text-2xl font-black text-[#38bdf8] mt-1">
              {hospitals.filter(h => h.trauma_level === 1).length}
            </p>
            <span className="text-xs text-white/40">Surgical & burn readiness</span>
          </div>

          <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-[#9AA6BA] uppercase tracking-wide">Facilities on Diversion</span>
            <p className="text-2xl font-black text-[#FFB454] mt-1">
              {hospitals.filter(h => h.status === 'diverted').length}
            </p>
            <span className="text-xs text-white/40">Routing redirected</span>
          </div>
        </div>

        {/* Hospital Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hospitals.map(h => {
            const bedPercent = Math.round(((h.total_beds - h.available_beds) / h.total_beds) * 100);
            const isMine = isHospitalOperator && myHospital?.id === h.id;

            return (
              <div 
                key={h.id} 
                className={`bg-[#0D162B] border rounded-2xl p-5 space-y-4 transition-all ${
                  isMine ? 'border-rose-400 ring-2 ring-rose-400/30' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider">
                        Trauma Level {h.trauma_level} Center
                      </span>
                      {isMine && (
                        <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded">
                          YOUR FACILITY
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{h.name}</h3>
                    <p className="text-xs text-[#9AA6BA]">{h.address}</p>
                  </div>
                  <StatusBadge status={h.status} />
                </div>

                {/* Occupancy bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Bed Occupancy:</span>
                    <strong className="text-white">{bedPercent}% Full ({h.available_beds} Free)</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0A1022] overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${bedPercent > 90 ? 'bg-rose-500' : 'bg-[#38bdf8]'}`}
                      style={{ width: `${bedPercent}%` }}
                    />
                  </div>
                </div>

                {/* ICU Status */}
                <div className="p-3 rounded-xl bg-[#0A1022] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#9AA6BA] block text-[11px]">ICU Capacity:</span>
                    <strong className="text-white">{h.icu_available} / {h.icu_total} Available</strong>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.icu_available > 2 ? 'bg-[#55D6A7]/20 text-[#55D6A7]' : 'bg-rose-500/20 text-rose-400'}`}>
                    {h.icu_available > 2 ? 'Adequate' : 'Critical Low'}
                  </span>
                </div>

                {/* Specialties */}
                {h.specialties && (
                  <div className="flex flex-wrap gap-1">
                    {h.specialties.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2 py-0.5 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-white/40">Helipad: {h.has_helipad ? 'Active' : 'No'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/operator/routes')}
                      className="px-2.5 py-1 rounded-lg border border-white/15 hover:bg-white/5 text-xs font-semibold text-white/80 flex items-center gap-1 cursor-pointer"
                      title="Route to hospital"
                    >
                      <Navigation className="w-3 h-3" />
                      Route
                    </button>
                    <button
                      onClick={() => {
                        setEditingHospital(h);
                        setBeds(h.available_beds);
                        setIcu(h.icu_available);
                        setStatus(h.status);
                      }}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                    >
                      Update Triage
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Edit Capacity Modal */}
      {editingHospital && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D162B] rounded-2xl border border-white/15 p-6 max-w-sm w-full shadow-2xl space-y-4 text-white">
            <h3 className="text-base font-bold text-white">
              Update {editingHospital.name} Capacity
            </h3>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Available General Beds</label>
                <input
                  type="number"
                  min="0"
                  max={editingHospital.total_beds}
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Available ICU Beds</label>
                <input
                  type="number"
                  min="0"
                  max={editingHospital.icu_total}
                  value={icu}
                  onChange={(e) => setIcu(Number(e.target.value))}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Diversion Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                >
                  <option value="open">Open (Accepting Patients)</option>
                  <option value="diverted">Diverted (Full - Redirect Ambulances)</option>
                  <option value="damaged">Damaged / Limited Operations</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHospital(null)}
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white/70 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#020617] text-xs font-bold cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Save Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
