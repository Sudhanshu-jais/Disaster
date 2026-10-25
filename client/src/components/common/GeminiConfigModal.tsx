import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle2, AlertTriangle, ExternalLink, X, Loader2, Trash2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';

interface GeminiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (configured: boolean, modelName?: string) => void;
}

export const GeminiConfigModal: React.FC<GeminiConfigModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<{
    configured: boolean;
    maskedKey: string | null;
    model: string;
    provider: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      const localKey = localStorage.getItem('disasteros_gemini_api_key') || '';
      setApiKey(localKey);
      setFeedback(null);
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const res = await api.getGeminiStatus();
      setStatus(res);
      if (res.configured && !feedback) {
        setFeedback({
          type: 'success',
          message: `Active model: ${res.model} (${res.provider})`
        });
      }
    } catch {
      // Backend status probe fallback
      const localKey = localStorage.getItem('disasteros_gemini_api_key');
      setStatus({
        configured: Boolean(localKey),
        maskedKey: localKey ? `${localKey.slice(0, 6)}...${localKey.slice(-4)}` : null,
        model: 'gemini-2.0-flash',
        provider: 'Google Gemini'
      });
    }
  };

  const handleSaveAndTest = async () => {
    if (!apiKey.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid Google Gemini API key.'
      });
      return;
    }

    setIsTesting(true);
    setFeedback({
      type: 'info',
      message: 'Connecting to Google Generative Language API (gemini-2.0-flash)...'
    });

    try {
      // Save locally first so API client sends header
      localStorage.setItem('disasteros_gemini_api_key', apiKey.trim());
      
      const res = await api.saveGeminiKey(apiKey.trim());
      setStatus(res.status || {
        configured: true,
        maskedKey: `${apiKey.trim().slice(0, 6)}...${apiKey.trim().slice(-4)}`,
        model: res.model || 'gemini-2.0-flash',
        provider: 'Google Gemini'
      });

      setFeedback({
        type: 'success',
        message: `Verified successfully! Connected to Google ${res.model || 'gemini-2.0-flash'}.`
      });

      if (onKeyUpdated) {
        onKeyUpdated(true, res.model || 'gemini-2.0-flash');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to verify key. Please check your Google AI Studio credentials.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveKey = async () => {
    localStorage.removeItem('disasteros_gemini_api_key');
    setApiKey('');
    try {
      await api.saveGeminiKey('');
    } catch {
      // Ignore
    }
    setStatus({
      configured: false,
      maskedKey: null,
      model: 'heuristic-engine',
      provider: 'DisasterOS Simulation Engine'
    });
    setFeedback({
      type: 'info',
      message: 'Gemini API key removed. Reverted to built-in emergency response heuristic engine.'
    });
    if (onKeyUpdated) {
      onKeyUpdated(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0A1022] border border-blue-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-blue-500/15 via-[#38bdf8]/10 to-transparent blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#38bdf8]/30 to-[#818cf8]/30 border border-[#38bdf8]/50 flex items-center justify-center text-[#38bdf8]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                  GOOGLE GEMINI INTEGRATION
                </span>
                <span className={`w-2 h-2 rounded-full ${status?.configured ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              </div>
              <h2 className="text-lg font-bold text-white">
                Configure Gemini AI Chatbot
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-4 relative z-10 text-xs sm:text-sm">
          <p className="text-white/70 leading-relaxed">
            Connect Google&apos;s latest <strong className="text-white">Gemini 2.0 Flash</strong> model to empower DisasterOS with intelligent, multi-turn emergency guidance grounded in live shelter capacity, hospital trauma beds, and road hazards.
          </p>

          {/* External Key Link Box */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-blue-200 text-xs">
              <Key className="w-4 h-4 text-[#38bdf8] shrink-0" />
              <span>Need an API key? Free in 30 seconds at Google AI Studio</span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 border border-[#38bdf8]/40 text-[#7dd3fc] font-semibold text-xs transition-colors shrink-0"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Input Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              {status?.configured && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Key Connected
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#05070d] border border-white/15 focus:border-[#38bdf8] rounded-2xl pl-4 pr-11 py-3 text-white placeholder-white/30 text-xs font-mono transition-colors focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                title={showKey ? 'Hide Key' : 'Show Key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : feedback.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
            }`}>
              {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {feedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              {feedback.type === 'info' && <Sparkles className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5 animate-spin" />}
              <span className="leading-snug">{feedback.message}</span>
            </div>
          )}

          {/* Fallback Notice */}
          {!status?.configured && !feedback && (
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white/60 text-[11.5px] leading-relaxed">
              💡 <strong>No Key? No Problem:</strong> DisasterOS includes a built-in context-aware emergency heuristic engine that answers questions using active shelter and hazard databases even without an external API key.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
          {status?.configured ? (
            <button
              onClick={handleRemoveKey}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Key</span>
            </button>
          ) : (
            <span className="text-[11px] text-white/40 font-mono">
              Mode: Heuristic Fallback
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndTest}
              disabled={isTesting || !apiKey.trim()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-[#020617] font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-40 cursor-pointer transition-all"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test & Save Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
