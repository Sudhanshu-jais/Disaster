import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDisaster } from '../../context/DisasterContext';
import { useAuth } from '../../context/AuthContext';
import { emergencySound } from '../../services/emergencySound';
import { 
  X, 
  AlertTriangle, 
  Radio, 
  Volume2, 
  VolumeX, 
  Megaphone, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Copy, 
  Check, 
  LifeBuoy, 
  Compass, 
  ExternalLink,
  Share2,
  ChevronRight
} from 'lucide-react';

interface PublicAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicAlertsDrawer: React.FC<PublicAlertsDrawerProps> = ({ isOpen, onClose }) => {
  const { alerts, disaster } = useDisaster();
  const { isOperator } = useAuth();
  
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleSiren = () => {
    if (isSirenActive) {
      emergencySound.stop();
      setIsSirenActive(false);
    } else {
      emergencySound.playEmergencySiren(8);
      setIsSirenActive(true);
      setTimeout(() => setIsSirenActive(false), 8000);
    }
  };

  const handleReadAloud = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[10100] overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#070b14] border-l border-white/10 text-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-[#0A1022] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                    EAS BROADCAST FEED
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                </div>
                <h2 className="text-base font-extrabold text-white">
                  Public Emergency Alerts
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Close alert drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Siren & Audio Bar */}
          <div className="px-5 py-3 bg-[#0D162B] border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Tower Sync (100%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSiren}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSirenActive
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg'
                    : 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300'
                }`}
                title={isSirenActive ? "Silence Alarm" : "Sound Emergency Siren Audio"}
              >
                {isSirenActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSirenActive ? 'Silence Siren' : 'Test Siren'}</span>
              </button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-white/40 space-y-2">
                <ShieldAlert className="w-8 h-8 mx-auto text-emerald-400/50" />
                <p className="font-semibold text-white/70">No Active Civil Defense Alerts</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  Regional sectors are currently monitoring nominal conditions under DisasterOS watch telemetry.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isCrit = alert.severity === 'critical';
                const shareText = `[DisasterOS Official Alert] ${alert.title}\nSeverity: ${alert.severity.toUpperCase()}\nArea: ${alert.affected_area}\nDetails: ${alert.message}`;

                return (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border p-4 space-y-3 transition-all ${
                      isCrit
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-100'
                        : 'bg-white/[0.03] border-white/10 text-white/90'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                          isCrit
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>

                      <span className="text-[10px] text-white/40 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>

                    {/* Title & Message */}
                    <div>
                      <h3 className="font-bold text-white text-sm leading-snug">
                        {alert.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-white/80 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>

                    {/* Affected Sector */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#38bdf8] font-mono bg-white/[0.04] p-2 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Zone: {alert.affected_area}</span>
                    </div>

                    {/* Channel Indicators */}
                    {alert.channels && alert.channels.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono pt-1">
                        <span>Channels:</span>
                        {alert.channels.map(ch => (
                          <span key={ch} className="px-1.5 py-0.5 rounded bg-white/5 uppercase border border-white/10">
                            {ch}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReadAloud(`${alert.title}. ${alert.message}`)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Read this alert aloud"
                        >
                          <Megaphone className="w-3 h-3 text-[#38bdf8]" />
                          <span>Voice</span>
                        </button>
                        <button
                          onClick={() => handleCopy(alert.id, shareText)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy alert for offline SMS/text"
                        >
                          {copiedId === alert.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === alert.id ? 'Copied' : 'Share'}</span>
                        </button>
                      </div>

                      <Link
                        to="/citizen/map"
                        onClick={onClose}
                        className="text-[11px] font-semibold text-[#38bdf8] hover:underline flex items-center gap-1"
                      >
                        <span>Safe Corridors</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Quick Links */}
          <div className="p-4 border-t border-white/10 bg-[#0A1022] space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/citizen/sos"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-center text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-rose-900/30"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Report SOS</span>
              </Link>
              <Link
                to="/citizen/alerts"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-center text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
              >
                <Radio className="w-4 h-4 text-[#38bdf8]" />
                <span>All Directives</span>
              </Link>
            </div>

            {isOperator && (
              <Link
                to="/operator/alerts"
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/30 text-[#7dd3fc] font-bold text-center text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Authorized Operator Broadcast Console</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
