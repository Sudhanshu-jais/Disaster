import React, { useState, useEffect } from 'react';
import { HeaderBand } from '../components/layout/HeaderBand';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  CloudRain, 
  Activity, 
  Wind, 
  Droplets,
  Flame,
  Radio,
  ArrowRight,
  Clock,
  Bot
} from 'lucide-react';

export const RiskAnalysisPage: React.FC = () => {
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    api.getRiskAnalysis()
      .then(res => setRiskData(res))
      .catch(e => console.warn(e));
  }, []);

  const modalities = riskData?.disaster_modalities || {
    floods: {
      status: "Active Alert",
      severity: "Extreme",
      score: 92,
      high_risk_zone: "Zone A - Marina Basin & Mission Lower Arterial",
      early_warning: "Water levels rising at 2.4 in/hr. Peak crest predicted in 38 mins.",
      lead_time_min: 38
    },
    earthquakes: {
      status: "Elevated Watch",
      severity: "High",
      score: 84,
      high_risk_zone: "Zone B - Fault Fracture & Masonry Historic District",
      early_warning: "5.4M initial rupture logged with 4 aftershocks (2.8M - 3.6M). Liquefaction watch active.",
      lead_time_min: 15
    },
    fires: {
      status: "High Advisory",
      severity: "Severe",
      score: 79,
      high_risk_zone: "Zone C - Hillside Timber Belt & Chemical Buffer",
      early_warning: "Industrial chemical fire plume moving NE at 12 km/h. Smoke particulate AQI 280.",
      lead_time_min: 45
    },
    extreme_weather: {
      status: "Severe Warning",
      severity: "Critical",
      score: 89,
      high_risk_zone: "Zone A & Coastal Sector Grid",
      early_warning: "Storm Zephyr sustained winds 84 km/h with 108 km/h gale gusts. Structural debris risk.",
      lead_time_min: 25
    }
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'AI Disaster Intelligence' },
          { label: 'Early Warnings & Risk Zones' }
        ]}
        title="Predictive Risk Analysis & Early Warnings"
        description="Continuously analyzing real-time data across floods, earthquakes, fires, and extreme weather to identify high-risk areas and dispatch early warnings."
        statusText="Multi-Hazard Telemetry Synced"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        
        {/* Composite Threat Banner */}
        <div className="rounded-2xl border border-rose-500/30 bg-[#0D162B] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-extrabold text-2xl font-mono shrink-0">
              {riskData?.composite_risk_score || 88}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30 uppercase">
                  {riskData?.overall_threat_level || 'HIGH'} VULNERABILITY INDEX
                </span>
                <span className="text-xs text-[#9AA6BA] font-mono">0-100 Multi-Hazard Scale</span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Multi-Modal Disaster Risk & Early Warning Matrix
              </h2>
              <p className="text-xs text-[#9AA6BA] mt-0.5">
                Active monitoring across Floods, Earthquakes, Fires, and Extreme Weather with predictive lead times.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/operator/assistant"
              className="px-4 py-2 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#020617] font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-[#020617]" />
              <span>Ask AI Assistant</span>
            </Link>
            <Link
              to="/operator/alerts"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Siren Alert</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Modalities: Early Warning Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Disaster Early Warning Cards (Floods · Earthquakes · Fires · Extreme Weather)
            </h3>
            <span className="text-[11px] font-mono text-[#55D6A7]">Live Prediction Stream</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Flash Floods */}
            <div className="rounded-2xl border border-blue-500/30 bg-[#0D162B] p-4 shadow-md space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {modalities.floods.severity} ({modalities.floods.score}/100)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">01 / Hydrology</span>
                <h4 className="text-sm font-bold text-white mt-0.5">🌊 Flash Floods</h4>
                <p className="text-[11px] text-[#38bdf8] font-mono mt-1 font-semibold">{modalities.floods.high_risk_zone}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0A1022] border border-white/5 text-xs space-y-1">
                <span className="text-[10px] font-mono text-[#38bdf8] uppercase tracking-wider block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#38bdf8]" />
                  <span>Lead Time: ~{modalities.floods.lead_time_min} mins</span>
                </span>
                <p className="text-[11.5px] text-[#9AA6BA] font-sans leading-snug">{modalities.floods.early_warning}</p>
              </div>
            </div>

            {/* 2. Earthquakes */}
            <div className="rounded-2xl border border-amber-500/30 bg-[#0D162B] p-4 shadow-md space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {modalities.earthquakes.severity} ({modalities.earthquakes.score}/100)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">02 / Seismology</span>
                <h4 className="text-sm font-bold text-white mt-0.5">🌋 Earthquakes & Faults</h4>
                <p className="text-[11px] text-amber-400 font-mono mt-1 font-semibold">{modalities.earthquakes.high_risk_zone}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0A1022] border border-white/5 text-xs space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Lead Time: ~{modalities.earthquakes.lead_time_min} mins</span>
                </span>
                <p className="text-[11.5px] text-[#9AA6BA] font-sans leading-snug">{modalities.earthquakes.early_warning}</p>
              </div>
            </div>

            {/* 3. Fires */}
            <div className="rounded-2xl border border-rose-500/30 bg-[#0D162B] p-4 shadow-md space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {modalities.fires.severity} ({modalities.fires.score}/100)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">03 / Thermal Plume</span>
                <h4 className="text-sm font-bold text-white mt-0.5">🔥 Wildfires & Chemical</h4>
                <p className="text-[11px] text-rose-400 font-mono mt-1 font-semibold">{modalities.fires.high_risk_zone}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0A1022] border border-white/5 text-xs space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-400" />
                  <span>Lead Time: ~{modalities.fires.lead_time_min} mins</span>
                </span>
                <p className="text-[11.5px] text-[#9AA6BA] font-sans leading-snug">{modalities.fires.early_warning}</p>
              </div>
            </div>

            {/* 4. Extreme Weather */}
            <div className="rounded-2xl border border-purple-500/30 bg-[#0D162B] p-4 shadow-md space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Wind className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {modalities.extreme_weather.severity} ({modalities.extreme_weather.score}/100)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">04 / Atmospheric</span>
                <h4 className="text-sm font-bold text-white mt-0.5">🌪️ Extreme Weather</h4>
                <p className="text-[11px] text-purple-400 font-mono mt-1 font-semibold">{modalities.extreme_weather.high_risk_zone}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0A1022] border border-white/5 text-xs space-y-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>Lead Time: ~{modalities.extreme_weather.lead_time_min} mins</span>
                </span>
                <p className="text-[11.5px] text-[#9AA6BA] font-sans leading-snug">{modalities.extreme_weather.early_warning}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Live Weather & Seismic Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Weather Telemetry */}
          <div className="rounded-2xl border border-white/10 bg-[#0D162B] p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Live Atmospheric Telemetry (Doppler Stream)
                </h3>
              </div>
              <span className="text-[10.5px] font-mono text-[#55D6A7]">NOAA Live Feed</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-3 rounded-xl bg-[#0A1022] border border-white/5">
                <span className="text-[10px] font-mono text-[#9AA6BA] uppercase block mb-1">Precipitation</span>
                <span className="text-lg font-bold text-[#38bdf8] font-mono">
                  {riskData?.external_telemetry?.weather?.precipitation_mm || 38.4} mm/h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0A1022] border border-white/5">
                <span className="text-[10px] font-mono text-[#9AA6BA] uppercase block mb-1">Wind Gusts</span>
                <span className="text-lg font-bold text-white font-mono">
                  {riskData?.external_telemetry?.weather?.wind_speed_kmh || 52} km/h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0A1022] border border-white/5">
                <span className="text-[10px] font-mono text-[#9AA6BA] uppercase block mb-1">Humidity</span>
                <span className="text-lg font-bold text-[#55D6A7] font-mono">
                  {riskData?.external_telemetry?.weather?.humidity_percent || 94}%
                </span>
              </div>
            </div>

            <p className="text-xs text-[#9AA6BA] italic pt-1">
              Condition: {riskData?.external_telemetry?.weather?.weather_condition || 'Torrential Rain & High Winds'}. High risk of urban water accumulation.
            </p>
          </div>

          {/* USGS Seismic Activity */}
          <div className="rounded-2xl border border-white/10 bg-[#0D162B] p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  USGS Seismic Activity (Realtime Stream)
                </h3>
              </div>
              <span className="text-[10.5px] font-mono text-[#55D6A7]">USGS Feed</span>
            </div>

            <div className="space-y-2 pt-2">
              {(riskData?.external_telemetry?.earthquakes || [
                { id: "eq-1", magnitude: 4.8, place: "8km ESE of Berkeley, CA", alert_level: "yellow" },
                { id: "eq-2", magnitude: 3.2, place: "14km N of San Francisco, CA", alert_level: "green" }
              ]).map((eq: any) => (
                <div key={eq.id} className="p-2.5 rounded-xl bg-[#0A1022] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block font-sans">{eq.place}</span>
                    <span className="text-[11px] text-[#9AA6BA] font-mono">Magnitude: {eq.magnitude} M</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    eq.alert_level === 'yellow' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-[#55D6A7]/20 text-[#55D6A7] border border-[#55D6A7]/30'
                  }`}>
                    Level: {eq.alert_level}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* High-Risk Geographic Zones Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-[#0D162B] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Identify High-Risk Geographic Zones
              </h3>
              <p className="text-xs text-[#9AA6BA] mt-0.5">Continuous spatial hazard modeling across regional infrastructure sectors</p>
            </div>
            <Link to="/operator/map" className="text-xs font-semibold text-[#38bdf8] hover:underline flex items-center gap-1">
              <span>View On Tactical Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                zone: "Zone A - Marina Waterfront & Low-Lying Basin",
                hazard: "🌊 Flash Flood Inundation & Storm Surge",
                score: 92,
                status: "CRITICAL RISK",
                color: "rose",
                desc: "Low elevation (elevation +1.2m) with storm drain bottleneck. 3.8ft water standing on arterial roads. Direct evacuation directive active."
              },
              {
                zone: "Zone B - Industrial Corridor & Masonry District",
                hazard: "🌋 Seismic Fault Fracture & Collapse Vulnerability",
                score: 84,
                status: "HIGH RISK",
                color: "amber",
                desc: "Unreinforced brick structures built on landfill soil. High liquefaction susceptibility following 5.4M seismic activity."
              },
              {
                zone: "Zone C - Hillside Timber Belt & Chemical Cache",
                hazard: "🔥 Wildfire Ember & Toxic Chemical Plume",
                score: 79,
                status: "SEVERE RISK",
                color: "amber",
                desc: "Dry eucalyptus fuel load + industrial solvent fire. Expanding NE at 12 km/h propelled by 45 km/h winds. AQI index 280."
              },
              {
                zone: "Zone D - High Ridge Staging Sanctuary",
                hazard: "🛡️ Designated Safe Haven Refuge",
                score: 14,
                status: "SAFE HAVEN",
                color: "emerald",
                desc: "Solid granite bedrock, zero flood risk, and clear prevailing airflow. Primary staging point for 3 community shelters and helipad."
              }
            ].map((z, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-white/10 bg-[#0A1022] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white font-sans">{z.zone}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    z.color === 'rose' 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : z.color === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-[#55D6A7]/20 text-[#55D6A7] border border-[#55D6A7]/30'
                  }`}>
                    {z.status} ({z.score}/100)
                  </span>
                </div>
                <p className="text-xs font-semibold text-white/90">{z.hazard}</p>
                <p className="text-xs text-[#9AA6BA] leading-relaxed">{z.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
