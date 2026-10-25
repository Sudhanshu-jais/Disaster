import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { HeaderBand } from '../components/layout/HeaderBand';
import { api } from '../services/api';
import { Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';

export const HazardRoutesPage: React.FC = () => {
  const { hazards } = useDisaster();

  const [startPoint, setStartPoint] = useState('Central Warehouse Depot');
  const [destPoint, setDestPoint] = useState('Marina Community Shelter');
  const [vehicleType, setVehicleType] = useState('ambulance');
  const [calculating, setCalculating] = useState(false);
  const [calculatedRoute, setCalculatedRoute] = useState<any>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await api.calculateHazardRoute({
        origin: [37.7749, -122.4194],
        destination: [37.7850, -122.4080],
        vehicle_type: vehicleType
      });
      setCalculatedRoute(res);
    } catch (e: any) {
      alert(`Calculation error: ${e.message}`);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'GIS & Infrastructure' },
          { label: 'Hazard Routing' }
        ]}
        title="Hazard-Aware Emergency Route Optimization"
        description="Dynamic routing algorithm that checks for standing floodwater, bridge structural damage, and debris to calculate safe corridors."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Route Calculator Form */}
        <div className="lg:col-span-6 bg-[#0D162B] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/10">
            <Navigation className="w-4 h-4 text-[#38bdf8]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Emergency Corridor Calculator
            </h3>
          </div>

          <form onSubmit={handleCalculate} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-white/80 block mb-1">Origin Point</label>
              <input
                type="text"
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/80 block mb-1">Destination Target</label>
              <input
                type="text"
                value={destPoint}
                onChange={(e) => setDestPoint(e.target.value)}
                className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/80 block mb-1">Emergency Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
              >
                <option value="ambulance">Standard ALS Ambulance (Low clearance)</option>
                <option value="high_clearance_truck">High-Clearance 6x6 Truck (Can ford 3ft)</option>
                <option value="rescue_boat">Inflatable Rescue Boat (Amphibious/Water only)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#020617] font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {calculating ? 'Analyzing Road Hazards...' : 'Calculate Safe Emergency Corridors'}
            </button>
          </form>

          {/* Results Comparison */}
          {calculatedRoute && (
            <div className="pt-4 border-t border-white/10 space-y-3 animate-in fade-in">
              {/* Safest Route Card */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#55D6A7] font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#55D6A7]" />
                    {calculatedRoute.safest_route.name}
                  </span>
                  <span>{calculatedRoute.safest_route.distance_km} km · {calculatedRoute.safest_route.estimated_minutes} min</span>
                </div>
                <p className="text-white/80">
                  {calculatedRoute.safest_route.clearance_notes}
                </p>
                <span className="text-[10px] uppercase font-bold text-[#55D6A7] bg-[#55D6A7]/20 px-2 py-0.5 rounded border border-[#55D6A7]/30 inline-block">
                  Zero Submerged Segments
                </span>
              </div>

              {/* Direct Route Warning Card */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    {calculatedRoute.fastest_route.name}
                  </span>
                  <span>{calculatedRoute.fastest_route.distance_km} km · {calculatedRoute.fastest_route.estimated_minutes} min</span>
                </div>
                <p className="text-rose-200">
                  {calculatedRoute.fastest_route.hazards_detected?.[0] || 'Hazard detected on direct route.'}
                </p>
                <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 inline-block">
                  Impassable to Standard Ambulance
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Known Road Hazards */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Road Hazards & Flood Inundation Points ({hazards.length})
          </h3>

          <div className="space-y-3">
            {hazards.map(h => (
              <div key={h.id} className="bg-[#0D162B] border border-white/10 rounded-2xl p-4 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white">{h.road_name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">
                    {h.severity}
                  </span>
                </div>
                <p className="text-xs text-[#9AA6BA]">{h.description || 'Passage blocked by storm debris or high water.'}</p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                  <span>Reported: {new Date(h.reported_at).toLocaleTimeString()}</span>
                  <span>Type: <strong className="text-white capitalize">{h.hazard_type}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
