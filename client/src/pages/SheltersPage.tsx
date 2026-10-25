import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import { Home, Users, HeartPulse, ShieldCheck, MapPin, ArrowRight, Dog, Utensils, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SheltersPage: React.FC = () => {
  const navigate = useNavigate();
  const { shelters } = useDisaster();

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.current_occupancy, 0);
  const totalAvailable = totalCapacity - totalOccupancy;

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      
      {/* Top Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#63BDF5] font-bold">
                CIVILIAN EVACUATION SANCTUARIES
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Emergency Shelters & Intake Capacity
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
        
        {/* Sample Data Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-[#0D162B] border border-white/10 text-xs text-[#9AA6BA] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#63BDF5] shrink-0" />
            <span>
              <strong className="text-white">Sample Operational Telemetry:</strong> Shelter occupancy and food buffer metrics are modeled for demo scenario validation. Real-world intake counts require official municipal verification.
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#63BDF5] uppercase tracking-wider shrink-0">
            SIMULATED FEED
          </span>
        </div>

        {/* Global Capacity Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="terra-card p-5">
            <span className="text-[11px] font-mono text-[#9AA6BA] uppercase tracking-wider block mb-1">Total Regional Capacity</span>
            <div className="text-3xl font-black text-white font-telemetry">{totalCapacity}</div>
            <span className="text-xs text-[#9AA6BA] mt-1 block">Registered refuge beds across 4 facilities</span>
          </div>

          <div className="terra-card p-5">
            <span className="text-[11px] font-mono text-[#9AA6BA] uppercase tracking-wider block mb-1">Current Occupancy</span>
            <div className="text-3xl font-black text-[#FFB454] font-telemetry">{totalOccupancy}</div>
            <span className="text-xs text-[#9AA6BA] mt-1 block">{Math.round((totalOccupancy / totalCapacity) * 100)}% capacity utilized</span>
          </div>

          <div className="terra-card p-5 border-[#55D6A7]/30 bg-gradient-to-b from-[#55D6A7]/10 to-transparent">
            <span className="text-[11px] font-mono text-[#55D6A7] uppercase tracking-wider font-bold block mb-1">Available Intake Places</span>
            <div className="text-3xl font-black text-[#55D6A7] font-telemetry">{totalAvailable}</div>
            <span className="text-xs text-[#55D6A7] mt-1 block">Immediate admissions accepted</span>
          </div>
        </div>

        {/* Shelters List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shelters.map(shelt => {
            const free = shelt.capacity - shelt.current_occupancy;
            const percent = Math.round((shelt.current_occupancy / shelt.capacity) * 100);
            const isFull = shelt.status === 'at_capacity' || free <= 0;

            return (
              <div key={shelt.id} className="terra-card p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9AA6BA] block">
                      INTAKE SECTOR · {shelt.id.toUpperCase()}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-snug">{shelt.name}</h3>
                    <p className="text-xs text-[#9AA6BA] flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#35D6E8]" />
                      {shelt.address}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isFull ? 'bg-[#FF5D67]/20 text-[#FF5D67] border border-[#FF5D67]/40' : 'bg-[#55D6A7]/20 text-[#55D6A7] border border-[#55D6A7]/40'
                  }`}>
                    {isFull ? 'At Capacity' : 'Accepting Intake'}
                  </span>
                </div>

                {/* Capacity Gauge */}
                <div className="space-y-1.5 bg-[#050817]/60 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#9AA6BA]">Occupancy: {shelt.current_occupancy} / {shelt.capacity}</span>
                    <span className="font-bold text-white">{free} places open ({percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull ? 'bg-[#FF5D67]' : percent > 75 ? 'bg-[#FFB454]' : 'bg-[#55D6A7]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Facility Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#9AA6BA]">
                  <div className="flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-[#63BDF5]" />
                    <span>{shelt.food_supplies_days} Days Food</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-[#35D6E8]" />
                    <span>{shelt.water_supplies_days} Days Water</span>
                  </div>
                  {shelt.medical_staff_present && (
                    <div className="flex items-center gap-1 text-[#55D6A7]">
                      <HeartPulse className="w-3.5 h-3.5" />
                      <span>Medical Staff Present</span>
                    </div>
                  )}
                  {shelt.pet_friendly && (
                    <div className="flex items-center gap-1 text-[#63BDF5]">
                      <Dog className="w-3.5 h-3.5" />
                      <span>Pet Friendly</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
