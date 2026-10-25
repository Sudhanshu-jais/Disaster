import React, { useState } from 'react';
import { DisasterMap } from '../components/map/DisasterMap';
import { useDisaster } from '../context/DisasterContext';
import { Incident } from '../types';
import { 
  MapPin, 
  Layers, 
  Radio, 
  Shield, 
  Activity, 
  Home, 
  Boxes, 
  AlertTriangle,
  ArrowRight,
  Filter,
  Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { incidents, rescueTeams, hospitals, shelters, hazards, latestSOS } = useDisaster();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-12">
      
      {/* Top Header Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#63BDF5] font-bold">
                GEOSPATIAL SITUATIONAL AWARENESS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Tactical Disaster Operations Map
            </h1>
          </div>

          <button
            onClick={() => navigate('/command-center')}
            className="pill-button-secondary text-xs py-2 px-4 self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <span className="shrink-0 whitespace-nowrap">Open Command Center</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-4">
        
        {/* Latest Active SOS Live Alert Bar */}
        {latestSOS && (
          <div className="bg-[#FF5D67]/15 border border-[#FF5D67]/40 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5D67] animate-ping shrink-0" />
              <span className="font-bold text-white font-mono">
                LATEST LIVE CITIZEN SOS: #{latestSOS.tracking_code}
              </span>
              <span className="text-[#9AA6BA] truncate">
                · {latestSOS.title} ({Number(latestSOS.latitude).toFixed(4)}, {Number(latestSOS.longitude).toFixed(4)})
              </span>
            </div>
            <button
              onClick={() => setSelectedIncident(latestSOS)}
              className="px-3 py-1 bg-[#FF5D67] hover:bg-[#FF5D67]/90 text-white font-bold rounded-xl shadow-xs shrink-0 transition-colors"
            >
              Focus on Map
            </button>
          </div>
        )}

        {/* Quick summary stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="terra-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF5D67]/15 text-[#FF5D67] border border-[#FF5D67]/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9AA6BA] block">Incidents</span>
              <span className="text-sm font-bold font-mono text-white">{incidents.length} ACTIVE</span>
            </div>
          </div>

          <div className="terra-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#35D6E8]/15 text-[#35D6E8] border border-[#35D6E8]/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9AA6BA] block">Responders</span>
              <span className="text-sm font-bold font-mono text-white">{rescueTeams.length} UNITS</span>
            </div>
          </div>

          <div className="terra-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF5D67]/15 text-[#FF5D67] border border-[#FF5D67]/30 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9AA6BA] block">Trauma</span>
              <span className="text-sm font-bold font-mono text-white">{hospitals.length} CENTERS</span>
            </div>
          </div>

          <div className="terra-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#55D6A7]/15 text-[#55D6A7] border border-[#55D6A7]/30 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9AA6BA] block">Shelters</span>
              <span className="text-sm font-bold font-mono text-white">{shelters.length} OPEN</span>
            </div>
          </div>

          <div className="terra-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFB454]/15 text-[#FFB454] border border-[#FFB454]/30 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9AA6BA] block">Road Blocks</span>
              <span className="text-sm font-bold font-mono text-white">{hazards.length} CLOSED</span>
            </div>
          </div>
        </div>

        {/* Tactical Map Container */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl min-h-[640px]">
          <DisasterMap
            height="640px"
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        </div>
      </div>
    </div>
  );
};
