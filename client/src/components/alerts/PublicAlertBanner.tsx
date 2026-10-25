import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDisaster } from '../../context/DisasterContext';
import { emergencySound } from '../../services/emergencySound';
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Radio, 
  ChevronRight, 
  ChevronLeft,
  X, 
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Minimize2,
  Megaphone
} from 'lucide-react';

interface PublicAlertBannerProps {
  onOpenDrawer?: () => void;
}

export const PublicAlertBanner: React.FC<PublicAlertBannerProps> = ({ onOpenDrawer }) => {
  const { alerts } = useDisaster();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Filter for critical or severe alerts
  const activeAlerts = alerts.filter(a => 
    a.severity === 'critical' || a.severity === 'severe' || a.severity === 'high'
  );

  const currentAlert = activeAlerts[currentIndex] || activeAlerts[0] || alerts[0];

  useEffect(() => {
    // Reset index if alert list shrinks
    if (currentIndex >= activeAlerts.length && activeAlerts.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeAlerts.length, currentIndex]);

  if (!currentAlert || activeAlerts.length === 0) {
    return null;
  }

  const isCritical = currentAlert.severity === 'critical';

  const handleToggleSiren = () => {
    if (isSirenActive) {
      emergencySound.stop();
      setIsSirenActive(false);
    } else {
      emergencySound.playEmergencySiren(6);
      setIsSirenActive(true);
      setTimeout(() => setIsSirenActive(false), 6000);
    }
  };

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Official Disaster Advisory. ${currentAlert.title}. ${currentAlert.message}. Affected Area: ${currentAlert.affected_area}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // If minimized by the user, show a floating compact emergency badge
  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 z-40 animate-in fade-in duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 ${
            isCritical
              ? 'bg-[#FF5D67]/90 text-white border-white/20 animate-pulse'
              : 'bg-amber-600/90 text-white border-white/20'
          }`}
          title="Expand Active Public Alert Warning"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
            {activeAlerts.length} Active {isCritical ? 'Critical' : ''} Alert
          </span>
          <Maximize2 className="w-3 h-3 ml-1 opacity-70" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full border-b transition-colors relative z-30 ${
        isCritical
          ? 'bg-gradient-to-r from-rose-950/90 via-red-900/95 to-rose-950/90 border-rose-500/40 text-white'
          : 'bg-gradient-to-r from-amber-950/90 via-amber-900/90 to-amber-950/90 border-amber-500/40 text-amber-100'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        
        {/* Left: Severity Tag & Alert Info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCritical ? 'bg-rose-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isCritical ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              isCritical
                ? 'bg-rose-500/30 text-rose-200 border-rose-400/50'
                : 'bg-amber-500/30 text-amber-200 border-amber-400/50'
            }`}>
              {isCritical ? 'CIVIL DEFENSE WARNING' : 'ADVISORY DIRECTIVE'}
            </span>
          </div>

          {/* Alert Title & Location */}
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <strong className="text-white font-bold truncate">
              {currentAlert.title}
            </strong>
            <span className="text-white/60 hidden md:inline truncate">
              — {currentAlert.affected_area}
            </span>
          </div>

          {/* Multi-alert page counter */}
          {activeAlerts.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 shrink-0 ml-1 text-[10px] text-white/60">
              <button
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeAlerts.length - 1))}
                className="p-0.5 hover:text-white transition-colors"
                title="Previous alert"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono">{currentIndex + 1}/{activeAlerts.length}</span>
              <button
                onClick={() => setCurrentIndex((prev) => (prev < activeAlerts.length - 1 ? prev + 1 : 0))}
                className="p-0.5 hover:text-white transition-colors"
                title="Next alert"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Audio Siren, Speech & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Audio Siren Toggle */}
          <button
            onClick={handleToggleSiren}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSirenActive
                ? 'bg-white text-rose-900 shadow-md animate-pulse font-bold'
                : 'bg-black/30 hover:bg-black/50 text-white/90 border border-white/20'
            }`}
            title={isSirenActive ? "Stop Siren Audio" : "Sound Civil Defense Siren"}
          >
            {isSirenActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rose-300" />}
            <span className="hidden sm:inline">{isSirenActive ? 'Stop Siren' : 'Sound Siren'}</span>
          </button>

          {/* Speech Synthesizer: Listen to broadcast */}
          <button
            onClick={handleReadAloud}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-black/30 hover:bg-black/50 text-white/80 border border-white/20'
            }`}
            title={isSpeaking ? "Stop Voice Reading" : "Listen to Audio Advisory"}
          >
            <Megaphone className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden md:inline">{isSpeaking ? 'Mute Voice' : 'Listen'}</span>
          </button>

          {/* View Directives Button */}
          {onOpenDrawer ? (
            <button
              onClick={onOpenDrawer}
              className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Directives</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <Link
              to="/citizen/alerts"
              className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>View Directives</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}

          {/* Minimize / Close Pill */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-full hover:bg-black/30 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Minimize alert banner"
            aria-label="Minimize alert banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
