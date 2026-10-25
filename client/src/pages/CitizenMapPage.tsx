// DisasterOS Public Citizen Disaster Operations Map
import React from 'react';
import { DisasterMap } from '../components/map/DisasterMap';
import { useDisaster } from '../context/DisasterContext';
import { Link } from 'react-router-dom';
import { 
  Home, 
  HeartPulse, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  ShieldAlert,
  Compass
} from 'lucide-react';

export const CitizenMapPage: React.FC = () => {
  const { shelters, hospitals, disaster } = useDisaster();

  const openShelters = shelters.filter(s => s.status === 'open');
  const openHospitals = hospitals.filter(h => h.status === 'open');

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-16 selection:bg-[#38bdf8] selection:text-[#020617]">
      
      {/* Top Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                CIVILIAN SAFE EVACUATION & SHELTER MAP
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Public Hazards & Designated Sanctuary Map
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/citizen/sos"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF5D67] hover:bg-[#ff434e] text-white text-xs font-bold shadow-lg shadow-[#FF5D67]/30 transition-all hover:scale-105 cursor-pointer"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full mt-6 space-y-6">
        
        {/* Security & Public Transparency Notice */}
        <div className="p-3.5 rounded-2xl bg-[#0D162B] border border-white/10 flex items-center justify-between gap-4 text-xs text-white/70">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#38bdf8] shrink-0" />
            <span>
              <strong className="text-white">Public Clearance Active:</strong> This map displays verified civilian shelters, trauma emergency centers, and public evacuation perimeters. Tactical responder frequencies and military escort corridors are restricted to the Operator EOC console.
            </span>
          </div>
          <span className="hidden md:inline-block font-mono text-[10.5px] text-[#55D6A7] bg-[#55D6A7]/10 px-2 py-0.5 rounded-full border border-[#55D6A7]/30 shrink-0">
            GOOGLE MAPS LIVE
          </span>
        </div>

        {/* Public DisasterMap with Google Maps basemaps */}
        <DisasterMap height="600px" />

        {/* Shelter and Care Center Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="terra-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#55D6A7]" />
                <h3 className="text-sm font-bold text-white">Open Evacuation Sanctuaries ({openShelters.length})</h3>
              </div>
              <span className="text-[11px] font-mono text-[#55D6A7]">Verified Safe</span>
            </div>
            <div className="space-y-2.5">
              {openShelters.map(s => (
                <div key={s.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{s.name}</span>
                    <span className="text-[11px] text-white/50">{s.address} · Food buffer: {s.food_supplies_days} days</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#55D6A7]">{s.capacity - s.current_occupancy} places</span>
                    <span className="block text-[10px] text-white/40">Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="terra-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#FF5D67]" />
                <h3 className="text-sm font-bold text-white">Trauma Receiving Hospitals ({openHospitals.length})</h3>
              </div>
              <span className="text-[11px] font-mono text-[#38bdf8]">24/7 Triage</span>
            </div>
            <div className="space-y-2.5">
              {openHospitals.map(h => (
                <div key={h.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{h.name}</span>
                    <span className="text-[11px] text-white/50">Level-{h.trauma_level} Trauma · {h.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#38bdf8]">{h.available_beds} beds</span>
                    <span className="block text-[10px] text-[#55D6A7]">Accepting</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
