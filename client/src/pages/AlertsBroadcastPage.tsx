// DisasterOS Emergency Alert Broadcast Console (Operator)
import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { HeaderBand } from '../components/layout/HeaderBand';
import { api } from '../services/api';
import { emergencySound } from '../services/emergencySound';
import { 
  Radio, 
  Send, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  MapPin,
  Clock,
  Layers,
  Flame,
  Waves,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlertPreset {
  id: string;
  name: string;
  title: string;
  message: string;
  severity: string;
  affectedArea: string;
  channels: string[];
}

const ALERT_PRESETS: AlertPreset[] = [
  {
    id: 'flood-evac',
    name: '🌊 Flash Flood Evacuation Order',
    title: 'Flash Flood Immediate Evacuation Warning - Marina Basin & Waterfront',
    message: 'Rapid storm surge cresting seawall. Low-lying residents in Waterfront Sectors A & B must evacuate immediately to Presidio Community Gymnasium via Van Ness Ave. Avoid 14th St underpass.',
    severity: 'critical',
    affectedArea: 'Zone A Waterfront & Marina Basin',
    channels: ['push', 'sms', 'siren', 'wea']
  },
  {
    id: 'road-closure',
    name: '🚧 Major Road Corridor Closure',
    title: 'Critical Transit Hazard: Lower Mission Underpass Submerged',
    message: 'Standing water exceeds 4ft at 14th St corridor. All vehicle traffic blocked. Emergency responder detours active via Guerrero Elevated Highway.',
    severity: 'severe',
    affectedArea: 'Mission District Corridor',
    channels: ['push', 'sms']
  },
  {
    id: 'boil-water',
    name: '💧 Drinking Water Boil Advisory',
    title: 'Precautionary Boil Water Advisory Issued for Central District',
    message: 'Municipal storm run-off has compromised secondary feeder pipes. Boil all municipal tap water for 1 full minute prior to consumption or infant care.',
    severity: 'warning',
    affectedArea: 'Central & Civic Districts',
    channels: ['push']
  },
  {
    id: 'all-clear',
    name: '✅ Safe Haven Threat Downgrade',
    title: 'Water Level Crest Passed - Re-Entry Inspection Underway',
    message: 'Primary storm surge has subsided. Flood waters receding along Marina shoreline. Residents may check safe route updates before departing shelters.',
    severity: 'info',
    affectedArea: 'Zone A Waterfront',
    channels: ['push']
  }
];

export const AlertsBroadcastPage: React.FC = () => {
  const { alerts, refreshData } = useDisaster();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('critical');
  const [affectedArea, setAffectedArea] = useState('Zone A Waterfront & Marina Basin');
  const [channels, setChannels] = useState<string[]>(['push', 'sms', 'siren']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSirenActive, setIsSirenActive] = useState(false);

  const applyPreset = (preset: AlertPreset) => {
    setTitle(preset.title);
    setMessage(preset.message);
    setSeverity(preset.severity);
    setAffectedArea(preset.affectedArea);
    setChannels(preset.channels);
    setSuccessBanner(`Loaded template: ${preset.name}`);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const toggleChannel = (ch: string) => {
    setChannels(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleToggleSiren = () => {
    if (isSirenActive) {
      emergencySound.stop();
      setIsSirenActive(false);
    } else {
      emergencySound.playEmergencySiren(5);
      setIsSirenActive(true);
      setTimeout(() => setIsSirenActive(false), 5000);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMessage('Please provide an alert headline and transmission message body.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessBanner(null);

    try {
      await api.createAlert({
        title: title.trim(),
        message: message.trim(),
        severity,
        affected_area: affectedArea.trim(),
        channels,
        type: severity === 'critical' ? 'evacuation' : 'disaster_warning'
      });

      // If siren channel selected, trigger audio
      if (channels.includes('siren')) {
        emergencySound.playEmergencySiren(4);
      } else {
        emergencySound.playStatusChime();
      }

      await refreshData();
      setSuccessBanner(`🚨 Emergency directive "${title}" successfully broadcasted to cell towers and web clients!`);
      setTitle('');
      setMessage('');
    } catch (e: any) {
      setErrorMessage(`Broadcast transmission failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Operations', path: '/operator/operations' },
          { label: 'Communications' },
          { label: 'Public Alerts Broadcast' }
        ]}
        title="Public Emergency Alert & Civil Defense Siren Broadcast"
        description="Multi-channel siren, mobile push notification, and SMS emergency broadcast transmitter with live WebSocket distribution."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        
        {/* Quick Presets Bar */}
        <div className="bg-[#0A1022] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
            <span className="text-xs font-mono uppercase text-[#38bdf8] font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Emergency Broadcast Presets (Click to autofill directive)
            </span>
            <Link
              to="/citizen/alerts"
              className="text-xs text-white/60 hover:text-white flex items-center gap-1 underline font-mono"
            >
              <span>View Public Civilian Feed</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {ALERT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#38bdf8]/40 text-left transition-all cursor-pointer text-xs"
              >
                <div className="font-bold text-white truncate">{p.name}</div>
                <div className="text-[10.5px] text-white/50 truncate mt-0.5">{p.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Banners */}
        {successBanner && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Broadcast Composer */}
          <div className="lg:col-span-7 bg-[#0D162B] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Compose Civil Defense Alert Transmission
                </h3>
              </div>

              {/* Siren Audio Test */}
              <button
                type="button"
                onClick={handleToggleSiren}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSirenActive
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-white/5 hover:bg-white/10 text-rose-300 border border-rose-500/30'
                }`}
                title={isSirenActive ? "Stop Siren" : "Test Civil Defense Siren Audio"}
              >
                {isSirenActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSirenActive ? 'Stop Siren' : 'Test Siren'}</span>
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Alert Headline / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Immediate Evacuation Warning - Low-Lying Marina Basin"
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">Severity & Threat Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  >
                    <option value="critical">Critical (Level 4 Life-Safety Evacuation)</option>
                    <option value="severe">Severe Warning (Level 3 Hazard)</option>
                    <option value="warning">Moderate Advisory (Level 2)</option>
                    <option value="info">Informational Bulletin (Level 1)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">Target Geographic Zone</label>
                  <input
                    type="text"
                    value={affectedArea}
                    onChange={(e) => setAffectedArea(e.target.value)}
                    placeholder="e.g. Zone A Waterfront & Marina Basin"
                    className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Transmission Directive Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Detail exact evacuation corridors, open shelters with beds, impassable flooded roads, and recommended precautions..."
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8] resize-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-2">Multi-Channel Transmission Distribution</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { id: 'push', label: '📱 Cell Push Broadcast' },
                    { id: 'sms', label: '💬 Emergency SMS' },
                    { id: 'siren', label: '🚨 Civil Defense Siren' },
                    { id: 'wea', label: '📡 NOAA Weather Radio / EAS' }
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChannel(ch.id)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        channels.includes(ch.id)
                          ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8]'
                          : 'border-white/15 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-white/40 font-mono">
                  Transmits live to all connected web clients via WebSocket
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !title || !message}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-rose-900/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Transmitting Directive...' : 'Transmit Emergency Alert'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Feed */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Active Directives ({alerts.length})</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono">Live Stream</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {alerts.map(a => {
                const isCrit = a.severity === 'critical';
                return (
                  <div 
                    key={a.id} 
                    className={`border rounded-2xl p-4 space-y-2.5 transition-all ${
                      isCrit 
                        ? 'bg-rose-950/20 border-rose-500/40' 
                        : 'bg-[#0D162B] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        isCrit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {a.severity}
                      </span>
                      <span className="text-[10.5px] text-white/40 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(a.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{a.title}</h4>
                    <p className="text-xs text-white/80 leading-relaxed">{a.message}</p>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono">
                      <span className="truncate">Zone: <strong className="text-white">{a.affected_area}</strong></span>
                      <span className="uppercase text-[9.5px]">[{a.channels?.join(', ')}]</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
