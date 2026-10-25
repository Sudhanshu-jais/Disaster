import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { 
  Boxes, 
  Users, 
  Activity, 
  Home, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  RotateCcw, 
  ArrowRight,
  Plus,
  CheckCircle2,
  Package,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SmartAllocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    inventory, 
    rescueTeams, 
    vehicles, 
    shelters, 
    incidents, 
    allocateResource, 
    releaseResource 
  } = useDisaster();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => incidents[0]?.id || '');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('Medical');
  const [dispatchQty, setDispatchQty] = useState<number>(10);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter low or critical inventory
  const criticalItems = inventory.filter(i => i.quantity_available <= i.minimum_threshold);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentId) return;
    setFeedbackMsg(null);

    const res = allocateResource(selectedIncidentId, selectedResourceType, Number(dispatchQty));
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.error || 'Allocation failed.' });
    } else {
      setFeedbackMsg({ 
        type: 'success', 
        text: `Allocated ${dispatchQty} units of ${selectedResourceType} to incident #${selectedIncidentId}. Over-allocation prevented.` 
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleRelease = (itemCategory: string) => {
    const res = releaseResource(selectedIncidentId, itemCategory, 5);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: `Released 5 units of ${itemCategory} back to warehouse reserve.` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#63BDF5] font-bold">
                LOGISTICS & RESOURCE COORDINATION
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Emergency Resource Management & Dispatch
            </h1>
          </div>

          <button
            onClick={() => navigate('/command-center')}
            className="pill-button-secondary text-xs py-2 px-4 self-start sm:self-auto cursor-pointer shrink-0"
          >
            <span className="shrink-0 whitespace-nowrap">Command Center</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        
        {/* Shortage Alarm Notice if any critical stock */}
        {criticalItems.length > 0 && (
          <div className="terra-card p-4 border-[#FF5D67]/40 bg-[#FF5D67]/10 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF5D67] shrink-0" />
              <div>
                <span className="font-bold text-white block">Logistics Depletion Warning</span>
                <span className="text-[#9AA6BA]">
                  {criticalItems.map(i => i.item_name).join(', ')} below minimum replenishment threshold.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#FF5D67]/20 text-[#FF5D67] px-2.5 py-1 rounded-full font-bold">
              DEPLETION ALERT
            </span>
          </div>
        )}

        {/* Quick Resource Allocation Form Card */}
        <div className="terra-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Direct Incident Resource Allocation Engine
              </h3>
              <p className="text-xs text-[#9AA6BA]">
                Validates staging quantities in real time and strictly prevents negative inventory.
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#55D6A7] bg-[#55D6A7]/10 px-2 py-0.5 rounded border border-[#55D6A7]/30">
              ZERO-OVERALLOCATION GUARANTEE
            </span>
          </div>

          {feedbackMsg && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success' 
                ? 'bg-[#55D6A7]/15 border-[#55D6A7]/30 text-[#55D6A7]' 
                : 'bg-[#FF5D67]/15 border-[#FF5D67]/30 text-[#FF5D67]'
            }`}>
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleDispatch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[10.5px] font-mono uppercase text-[#9AA6BA] mb-1">
                Target Incident
              </label>
              <select
                value={selectedIncidentId}
                onChange={(e) => setSelectedIncidentId(e.target.value)}
                className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#63BDF5]/50"
              >
                {incidents.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    #{inc.tracking_code} - {inc.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono uppercase text-[#9AA6BA] mb-1">
                Resource Category / Type
              </label>
              <select
                value={selectedResourceType}
                onChange={(e) => setSelectedResourceType(e.target.value)}
                className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#63BDF5]/50"
              >
                <option value="Medical">Field Trauma Kits (Level-A)</option>
                <option value="Hydration">Potable Drinking Water (10L)</option>
                <option value="Nutrition">Emergency MRE Rations</option>
                <option value="Shelter">Inflatable Weather Tents</option>
                <option value="Power">Portable Diesel Generators</option>
                <option value="Rescue">Swiftwater Rescue Rafts</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono uppercase text-[#9AA6BA] mb-1">
                Quantity to Deploy
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={dispatchQty}
                onChange={(e) => setDispatchQty(Number(e.target.value))}
                className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#63BDF5]/50 font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full pill-button-primary text-xs py-2 justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Assign & Dispatch</span>
              </button>
            </div>
          </form>
        </div>

        {/* Inventory Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Staging Depot Inventory Tracking ({inventory.length})
            </h3>
            <span className="text-xs font-mono text-[#9AA6BA]">South Basin & Presidio Facilities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map(item => {
              const total = item.quantity_available + item.quantity_reserved;
              const percentAvail = total > 0 ? Math.round((item.quantity_available / total) * 100) : 0;
              const isLow = item.quantity_available <= item.minimum_threshold;

              return (
                <div key={item.id} className="terra-card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9AA6BA] block">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">{item.item_name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isLow ? 'bg-[#FF5D67]/20 text-[#FF5D67]' : 'bg-[#55D6A7]/20 text-[#55D6A7]'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Stock Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#9AA6BA]">Available: {item.quantity_available} {item.unit}</span>
                      <span className="text-white font-bold">{percentAvail}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isLow ? 'bg-[#FF5D67]' : 'bg-gradient-to-r from-[#63BDF5] to-[#35D6E8]'
                        }`}
                        style={{ width: `${percentAvail}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#5E6D84]">
                      <span>Reserved: {item.quantity_reserved}</span>
                      <span>Min Threshold: {item.minimum_threshold}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                    <button
                      onClick={() => handleRelease(item.category)}
                      className="text-[#63BDF5] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Release 5 Units</span>
                    </button>
                    <span className="text-[10.5px] font-mono text-[#9AA6BA]">
                      Depot: {item.warehouse_id === 'wh-001' ? 'South Basin' : 'Presidio'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Responders & Fleet Overview Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Rescue Teams */}
          <div className="terra-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#35D6E8]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Rescue Taskforces ({rescueTeams.length})</h3>
              </div>
              <span className="text-xs font-mono text-[#35D6E8]">
                {rescueTeams.filter(t => t.status === 'available').length} Available
              </span>
            </div>

            <div className="space-y-2.5">
              {rescueTeams.map(team => (
                <div key={team.id} className="p-3 rounded-xl bg-[#050817]/60 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{team.name}</span>
                    <span className="text-[11px] font-mono text-[#9AA6BA]">Lead: {team.lead_name} · Cap: {team.capacity}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    team.status === 'available' ? 'bg-[#55D6A7]/20 text-[#55D6A7]' : 'bg-[#FFB454]/20 text-[#FFB454]'
                  }`}>
                    {team.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Vehicles */}
          <div className="terra-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#63BDF5]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Emergency Fleet ({vehicles.length})</h3>
              </div>
              <span className="text-xs font-mono text-[#63BDF5]">Active Readiness</span>
            </div>

            <div className="space-y-2.5">
              {vehicles.map(veh => (
                <div key={veh.id} className="p-3 rounded-xl bg-[#050817]/60 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{veh.type} · {veh.registration_number}</span>
                    <span className="text-[11px] font-mono text-[#9AA6BA]">{veh.make_model} (Fuel: {veh.fuel_percent}%)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    veh.status === 'available' ? 'bg-[#55D6A7]/20 text-[#55D6A7]' : 'bg-[#FFB454]/20 text-[#FFB454]'
                  }`}>
                    {veh.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
