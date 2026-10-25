import React, { useState, useEffect, useRef } from 'react';
import { HeaderBand } from '../components/layout/HeaderBand';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { GeminiConfigModal } from '../components/common/GeminiConfigModal';
import { 
  Sparkles, 
  Send, 
  Bot, 
  MapPin, 
  ShieldAlert, 
  Activity, 
  Droplets,
  Flame,
  Wind,
  Settings,
  ShieldCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  confidence?: number;
  timestamp: string;
  model?: string;
  isGemini?: boolean;
}

interface LocationAssessment {
  zoneName: string;
  hazardType: 'flood' | 'earthquake' | 'fire' | 'extreme_weather' | 'safe';
  riskScore: number;
  riskLevel: 'Extreme' | 'High' | 'Severe' | 'Moderate' | 'Safe';
  earlyWarning: string;
  leadTime: string;
  safeRoute: string;
  nearestShelter: string;
  shelterCapacity: string;
  actionProtocol: string;
}

const PRESET_LOCATIONS: Record<string, LocationAssessment> = {
  'zone-a': {
    zoneName: 'Zone A - Marina Waterfront & Lower Mission Basin',
    hazardType: 'flood',
    riskScore: 92,
    riskLevel: 'Extreme',
    earlyWarning: 'Water depth standing at 3.8ft and rising at 2.4 in/hr. Peak storm surge inundation predicted in 38 mins.',
    leadTime: '38 minutes to crest',
    safeRoute: 'Guerrero Street Elevated Corridor or Van Ness Ave (Avoid 14th St Underpass)',
    nearestShelter: 'St. Jude Community Center (1.2 km away)',
    shelterCapacity: '120 beds available · Emergency food & medical staff active',
    actionProtocol: 'EVACUATE IMMEDIATELY to higher ground. Do NOT attempt to drive through standing water.'
  },
  'zone-b': {
    zoneName: 'Zone B - Industrial Corridor & Historic Masonry Sector',
    hazardType: 'earthquake',
    riskScore: 84,
    riskLevel: 'High',
    earlyWarning: 'USGS 5.4M fault rupture logged with 4 aftershocks. Elevated liquefaction risk across reclaimed soil layers.',
    leadTime: 'Immediate aftermath (continuous aftershocks)',
    safeRoute: 'Open grid corridors away from unreinforced brick facades and overhead power lines',
    nearestShelter: 'Westside High School Gymnasium (2.1 km away)',
    shelterCapacity: '250 beds available · Structural engineer cleared safe',
    actionProtocol: 'Drop, Cover, and Hold On during tremors. Evacuate multi-story unreinforced masonry buildings.'
  },
  'zone-c': {
    zoneName: 'Zone C - Hillside Timber Belt & Chemical Cache Perimeter',
    hazardType: 'fire',
    riskScore: 79,
    riskLevel: 'Severe',
    earlyWarning: 'Fast-moving timber fire with toxic industrial solvent plume moving NE at 12 km/h propelled by 45 km/h gusts.',
    leadTime: '45 minutes to residential perimeter',
    safeRoute: 'Southbound Coastal Highway 1 (Clear of smoke particulate plume)',
    nearestShelter: 'Civic Center Red Cross Sanctuary (3.4 km away)',
    shelterCapacity: '400 beds available · HEPA air filtration active',
    actionProtocol: 'Close all windows, switch ventilation to recirculate, wear N95/P100 respirators, evacuate zone.'
  },
  'zone-d': {
    zoneName: 'Zone D - High Ridge Staging Sanctuary',
    hazardType: 'safe',
    riskScore: 14,
    riskLevel: 'Safe',
    earlyWarning: 'Zero flood risk, stable granite geology, clear prevailing winds. Designated regional safe staging hub.',
    leadTime: 'No active threat',
    safeRoute: 'Internal arterial roads fully open and passable to all emergency vehicles',
    nearestShelter: 'High Ridge Staging Center (On-site)',
    shelterCapacity: '500+ beds · Command post, helipad, and supply warehouse operational',
    actionProtocol: 'Designated civilian gathering point and helicopter medical evacuation staging area.'
  }
};

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 DisasterOS AI Operational Intelligence Assistant ready.\n\nI continuously monitor real-time telemetry across Floods, Earthquakes, Fires, and Extreme Weather. Select any location zone above or ask questions to receive early warnings, safe evacuation corridors, and resource guidance.",
      sources: ['National Water Model', 'USGS Earthquake API', 'NOAA Doppler Stream', 'DisasterOS EOC'],
      confidence: 0.98,
      timestamp: new Date().toLocaleTimeString(),
      model: 'DisasterOS Decision Support'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLocationKey, setSelectedLocationKey] = useState<string>('zone-a');
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isGeminiActive, setIsGeminiActive] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('gemini-2.0-flash');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeZone = PRESET_LOCATIONS[selectedLocationKey];

  useEffect(() => {
    checkGeminiStatus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const checkGeminiStatus = async () => {
    try {
      const res = await api.getGeminiStatus();
      setIsGeminiActive(res.configured);
      if (res.model) setActiveModel(res.model);
    } catch {
      const localKey = localStorage.getItem('disasteros_gemini_api_key');
      setIsGeminiActive(Boolean(localKey));
    }
  };

  const handleSend = async (textToSend?: string) => {
    const qText = textToSend || input;
    if (!qText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: qText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await api.aiAssistant(qText, {
        history,
        role: 'operator'
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        sources: res.sources,
        confidence: res.confidence,
        model: res.model || (res.isGemini ? 'Google Gemini 2.0 Flash' : 'DisasterOS Heuristic Engine'),
        isGemini: res.isGemini,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `AI Disaster Assistant error: ${e.message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationCheck = (zoneKey: string) => {
    setSelectedLocationKey(zoneKey);
    const z = PRESET_LOCATIONS[zoneKey];
    handleSend(`Provide a complete disaster risk analysis, early warning, and safe evacuation advice for ${z.zoneName}.`);
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'AI Intelligence' },
          { label: 'AI Disaster Assistant' }
        ]}
        title="AI Disaster Assistant"
        description="Timely, location-specific intelligence analyzing floods, earthquakes, fires, and extreme weather to provide early warnings and accelerate emergency response."
        statusText={isGeminiActive ? `Gemini 2.0 Connected (${activeModel})` : "AI Predictive Engine Active"}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        
        {/* Focus Banner */}
        <div className="rounded-2xl border border-blue-500/30 bg-[#0D162B] p-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#38bdf8] flex items-center justify-center text-[#020617] shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-mono uppercase text-[#38bdf8] bg-[#38bdf8]/15 px-2 py-0.5 rounded-md border border-[#38bdf8]/30 font-bold">
                    Operational AI Assistant
                  </span>
                  <span className="text-[11px] text-[#55D6A7]">Multi-Modal Hazard Stream Active</span>
                </div>
                <h2 className="text-sm font-bold text-white mt-1">
                  Location-Specific Early Warnings & Fast Emergency Response
                </h2>
                <p className="text-xs text-[#9AA6BA] mt-0.5">
                  Solving the disaster information gap with continuous multi-hazard data fusion across floods, earthquakes, fires, and extreme weather.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setIsGeminiModalOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                  isGeminiActive 
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
                title="Configure Google Gemini API"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeminiActive ? 'text-emerald-400 animate-pulse' : 'text-[#38bdf8]'}`} />
                <span>{isGeminiActive ? `Gemini Active` : 'Connect Gemini API'}</span>
                <Settings className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              <Link
                to="/citizen/sos"
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>One-Tap SOS</span>
              </Link>
              <Link
                to="/operator/risk"
                className="px-3.5 py-1.5 rounded-xl bg-[#0A1022] hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/10"
              >
                <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Risk Matrix</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Location-Specific Assessment Selector */}
        <div className="rounded-2xl border border-white/10 bg-[#0D162B] p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#38bdf8]" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Location-Specific Threat & Early Warning Analyzer
              </h3>
            </div>
            <span className="text-[11px] text-[#9AA6BA]">Select a critical zone to run instant predictive AI analysis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.entries(PRESET_LOCATIONS).map(([k, loc]) => {
              const isSelected = selectedLocationKey === k;
              return (
                <button
                  key={k}
                  onClick={() => handleLocationCheck(k)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 shadow-md'
                      : 'border-white/10 bg-[#0A1022] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#9AA6BA] font-bold">
                      {loc.hazardType.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      loc.riskLevel === 'Extreme' ? 'bg-rose-500/20 text-rose-400' :
                      loc.riskLevel === 'High' ? 'bg-amber-500/20 text-amber-400' :
                      loc.riskLevel === 'Severe' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {loc.riskScore}/100
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 line-clamp-1">
                    {loc.zoneName.split(' - ')[0]}
                  </div>
                  <div className="text-[11px] text-[#9AA6BA] mt-0.5 line-clamp-1">
                    {loc.zoneName.split(' - ')[1]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Location Detail Panel */}
          {activeZone && (
            <div className="rounded-xl border border-white/10 bg-[#0A1022] p-4 text-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                  {activeZone.zoneName}
                </span>
                <span className="text-[11px] font-mono text-[#55D6A7]">
                  ⏱️ Lead Time: {activeZone.leadTime}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px]">
                <div className="p-3 rounded-lg bg-[#050817] border border-white/5 space-y-1">
                  <span className="text-[10.5px] font-mono text-amber-400 font-bold uppercase block">
                    ⚠️ Early Warning Telemetry
                  </span>
                  <p className="text-white/90 leading-relaxed">{activeZone.earlyWarning}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#050817] border border-white/5 space-y-1">
                  <span className="text-[10.5px] font-mono text-[#55D6A7] font-bold uppercase block">
                    🛡️ Safe Evacuation Route & Shelter
                  </span>
                  <p className="text-white/90 leading-relaxed">
                    <strong>Route:</strong> {activeZone.safeRoute}<br />
                    <strong>Shelter:</strong> {activeZone.nearestShelter} ({activeZone.shelterCapacity})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Disaster Category Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => handleSend("What are the flash flood evacuation procedures, water heights, and safe zones?")}
              className="p-2.5 rounded-xl bg-[#0A1022] border border-white/10 hover:border-[#38bdf8] text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Droplets className="w-4 h-4 text-[#38bdf8] shrink-0" />
              <div className="text-left">
                <span className="font-bold text-white block">🌊 Floods</span>
                <span className="text-[10px] text-[#9AA6BA]">Early warning & routes</span>
              </div>
            </button>
            <button
              onClick={() => handleSend("What are the earthquake fault updates, structural safety guidelines, and aftershock risks?")}
              className="p-2.5 rounded-xl bg-[#0A1022] border border-white/10 hover:border-amber-400 text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Activity className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold text-white block">🌋 Earthquakes</span>
                <span className="text-[10px] text-[#9AA6BA]">Faults & safety</span>
              </div>
            </button>
            <button
              onClick={() => handleSend("What are the wildfire perimeters, toxic smoke plumes, and air quality advisories?")}
              className="p-2.5 rounded-xl bg-[#0A1022] border border-white/10 hover:border-rose-400 text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Flame className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold text-white block">🔥 Fires</span>
                <span className="text-[10px] text-[#9AA6BA]">Plumes & evacuation</span>
              </div>
            </button>
            <button
              onClick={() => handleSend("What are the severe storm warnings, gale winds, and power line hazards?")}
              className="p-2.5 rounded-xl bg-[#0A1022] border border-white/10 hover:border-purple-400 text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Wind className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold text-white block">🌪️ Weather</span>
                <span className="text-[10px] text-[#9AA6BA]">Gale winds & surge</span>
              </div>
            </button>
          </div>
        </div>

        {/* Chat Messages Card */}
        <div className="rounded-2xl border border-white/10 p-5 bg-[#0D162B] shadow-xl min-h-[460px] flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto max-h-[480px] pr-1">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-[#38bdf8] flex items-center justify-center text-[#020617] shrink-0 shadow-md mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-2xl p-4 rounded-2xl ${
                    isAi
                      ? 'bg-[#0A1022] border border-white/10 text-white'
                      : 'bg-[#38bdf8] text-[#020617] font-medium shadow-md'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs">{m.text}</p>
                    
                    {/* Sources, Model & Confidence */}
                    {isAi && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 text-[10.5px] font-mono text-[#9AA6BA] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {m.isGemini ? (
                            <span className="flex items-center gap-1 text-[#38bdf8] font-bold">
                              <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                              Google {m.model || 'Gemini 2.0'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[#55D6A7]">
                              <ShieldCheck className="w-3 h-3" />
                              {m.model || 'DisasterOS Telemetry'}
                            </span>
                          )}
                          {m.sources && (
                            <span className="text-white/40">• {m.sources.slice(0, 2).join(' · ')}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {m.confidence && (
                            <span className="font-semibold text-[#55D6A7]">
                              {Math.round(m.confidence * 100)}% Confidence
                            </span>
                          )}
                          <span className="text-[10px] opacity-40">
                            {m.timestamp}
                          </span>
                        </div>
                      </div>
                    )}

                    {!isAi && (
                      <span className="block text-[10px] font-mono mt-1 text-black/60 text-right">
                        {m.timestamp}
                      </span>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-xl bg-white/10 text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      YOU
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 text-xs items-center text-[#9AA6BA] font-mono py-1">
                <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>
                  {isGeminiActive ? 'Synthesizing response with Google Gemini 2.0 Flash...' : 'Analyzing real-time multi-hazard telemetry & knowledge graph...'}
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Natural Language Input Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }} 
            className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Disaster Assistant about flood levels, earthquake aftershocks, fire routes, shelters..."
              className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8] transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#020617] font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>

      </div>

      {/* Gemini Configuration Modal */}
      <GeminiConfigModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onKeyUpdated={(configured, model) => {
          setIsGeminiActive(configured);
          if (model) setActiveModel(model);
        }}
      />
    </div>
  );
};
