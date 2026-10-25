// DisasterOS Floating AI Copilot & Safety Assistant
// Connected to server-side authorized tools with consequential action confirmation.

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDisaster } from '../../context/DisasterContext';
import { api } from '../../services/api';
import { emergencySound } from '../../services/emergencySound';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Loader2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Layers,
  Volume2,
  VolumeX,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  confidence?: number;
  model?: string;
  isGemini?: boolean;
  tools_executed?: string[];
  tool_data?: any;
  proposed_action?: {
    requires_confirmation: boolean;
    action_type: string;
    title: string;
    description: string;
    payload: any;
    rationale: string;
  } | null;
  action_status?: 'pending' | 'confirmed' | 'cancelled';
}

export const FloatingCopilot: React.FC = () => {
  const { user, isCitizen, isOperator } = useAuth();
  const { incidents, shelters, hospitals, hazards, disaster } = useDisaster();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRole = isOperator ? 'operator' : 'citizen';

  // Seed initial greeting message based on role
  useEffect(() => {
    if (messages.length === 0) {
      if (isOperator) {
        setMessages([
          {
            id: 'init-op',
            sender: 'assistant',
            text: `👋 **DisasterOS Copilot Ready.** Connected to the live Emergency Operations Center data engine.\n\nI can assist you with:\n• Incident queue prioritization & triage\n• Consequence analysis (e.g. flooded road impacts on hospitals)\n• Response strategy comparisons\n• Drafting public siren bulletins & sitreps\n\nHow can I support your operational decisions right now?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: ['EOC Telemetry Stream', 'Incident Management Database'],
            confidence: 0.99,
            model: 'DisasterOS-Engine'
          }
        ]);
      } else {
        setMessages([
          {
            id: 'init-cit',
            sender: 'assistant',
            text: `👋 **DisasterOS Safety Assistant.** I am here to help you stay safe during active emergencies.\n\n• Ask about **open shelters, evacuation routes, or hospital status**\n• Understand **official alerts and water boiling advisories**\n• Check instructions on **reporting an emergency SOS**\n\n*If you are in immediate physical danger, please click **Get Help** or call 911 immediately.*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: ['Official Regional Warnings', 'Shelter & Hospital Telemetry'],
            confidence: 0.99,
            model: 'DisasterOS-Safety-Core'
          }
        ]);
      }
    }
  }, [isOperator]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Dynamic suggested prompts based on current location and role
  const getSuggestedPrompts = () => {
    const path = location.pathname;
    if (isOperator) {
      if (path.includes('/operations')) {
        return [
          "Summarize top 3 critical SOS incidents",
          "What happens if the main access road floods?",
          "Check low-stock inventory buffers"
        ];
      }
      if (path.includes('/resilience')) {
        return [
          "Explain single points of failure in current scenario",
          "Compare rapid triage vs heavy USAR convoy",
          "Show progress on critical road drainage mitigation"
        ];
      }
      if (path.includes('/relief')) {
        return [
          "What is the total raised across verified campaigns?",
          "Are there unallocated relief funds available?",
          "Show latest delivered aid receipts"
        ];
      }
      return [
        "What requires attention first right now?",
        "What happens if 14th St underpass floods?",
        "Generate EOC Situation Report"
      ];
    } else {
      if (path.includes('/map')) {
        return [
          "Where is the nearest safe shelter with open beds?",
          "Which roads are currently flooded or blocked?",
          "Is St. Jude Coastal Pavilion accepting patients?"
        ];
      }
      if (path.includes('/sos') || path.includes('/help')) {
        return [
          "How does live location sharing work?",
          "Who can see my emergency tracking link?",
          "What happens after I submit an SOS?"
        ];
      }
      if (path.includes('/donate')) {
        return [
          "Which relief campaign is most urgent right now?",
          "How is my donation verified on ReliefChain?",
          "Can I donate without a crypto wallet?"
        ];
      }
      return [
        "Where is the nearest open shelter?",
        "Is my tap water safe to drink right now?",
        "What should I pack in an emergency go-bag?"
      ];
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsgId = `usr-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.copilotChat({
        question: text,
        role: currentRole,
        history: newMessages.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        })),
        context: {
          current_path: location.pathname,
          active_incidents_count: incidents.length,
          disaster_title: disaster?.title
        }
      });

      if (soundEnabled) {
        emergencySound.playStatusChime();
      }

      setMessages([
        ...newMessages,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: response.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: response.sources,
          confidence: response.confidence,
          model: response.model,
          isGemini: response.isGemini,
          tools_executed: response.tools_executed,
          tool_data: response.tool_data,
          proposed_action: response.proposed_action,
          action_status: response.proposed_action ? 'pending' : undefined
        }
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Service Notice:** Unable to reach AI intelligence engine (${err.message}). Grounded emergency telemetry remains accessible directly through the dashboard.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: ['Local Fallback Mode'],
          confidence: 0.8
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Consequential Action Confirmation Flow
  const handleConfirmAction = async (msgId: string, action: any) => {
    try {
      if (action.action_type === 'DISPATCH_MISSION') {
        await api.createMission({
          incident_id: action.payload.incident_id,
          team_id: action.payload.team_id,
          vehicle_id: action.payload.vehicle_id,
          target_hospital_id: action.payload.target_hospital_id,
          objective: "AI Copilot Recommended Emergency Triage Dispatch"
        });
      } else if (action.action_type === 'BROADCAST_ALERT') {
        await api.createAlert(action.payload);
      }

      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return { ...m, action_status: 'confirmed' };
        }
        return m;
      }));

      if (soundEnabled) {
        emergencySound.playStatusChime();
      }
    } catch (err: any) {
      alert(`Action execution error: ${err.message}`);
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { ...m, action_status: 'cancelled' };
      }
      return m;
    }));
  };

  const toggleToolExpanded = (msgId: string) => {
    setExpandedTools(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl backdrop-blur-xl border transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-white text-[#05070d] border-white scale-95'
            : isOperator
            ? 'bg-[#1d4ed8] hover:bg-[#2563eb] text-white border-blue-400/40 shadow-blue-500/20 hover:scale-105'
            : 'bg-[#0f172a] hover:bg-[#1e293b] text-[#38bdf8] border-[#38bdf8]/40 shadow-cyan-500/20 hover:scale-105'
        }`}
        aria-label="Toggle DisasterOS Copilot"
      >
        <span className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <Bot className="w-5 h-5 text-current shrink-0" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#55D6A7] animate-ping" />
            </>
          )}
        </span>
        <span className="text-xs font-bold font-sans tracking-wide">
          {isOpen ? 'Close' : isOperator ? 'DisasterOS Copilot' : 'Safety Assistant'}
        </span>
      </button>

      {/* 2. COPILOT SIDE DRAWER / PANEL */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="copilot-panel-title"
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0A1022]/98 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${
                isOperator 
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' 
                  : 'bg-cyan-600/20 border-cyan-500/40 text-cyan-400'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="copilot-panel-title" className="text-sm font-bold text-white">
                    {isOperator ? 'DisasterOS Copilot' : 'AI Safety Assistant'}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    GROUNDED
                  </span>
                </div>
                <p className="text-[11px] text-white/50">
                  {isOperator ? 'Tool-Connected Emergency Operations Intelligence' : 'Calm, verified citizen safety & evacuation support'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                title={soundEnabled ? "Audio chimes active" : "Audio muted"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setMessages([]);
                }}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white/[0.05] border border-white/10 text-white/90 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert prose-xs">
                    {msg.text}
                  </div>

                  {/* Tool Execution Pill */}
                  {msg.tools_executed && msg.tools_executed.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <button
                        onClick={() => toggleToolExpanded(msg.id)}
                        className="text-[10px] font-mono text-[#38bdf8] hover:underline flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-[#38bdf8]" />
                        <span>Executed: {msg.tools_executed.join(', ')}</span>
                        {expandedTools[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {expandedTools[msg.id] && msg.tool_data && (
                        <div className="mt-2 p-2 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-white/70 max-h-40 overflow-y-auto">
                          <pre>{JSON.stringify(msg.tool_data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Consequential Action Confirmation Card */}
                  {msg.proposed_action && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Action Requires Authorization</span>
                      </div>
                      <div className="text-[11px] font-semibold text-white">
                        {msg.proposed_action.title}
                      </div>
                      <div className="text-[10.5px] text-white/70">
                        {msg.proposed_action.description}
                      </div>

                      {msg.action_status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleConfirmAction(msg.id, msg.proposed_action)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors"
                          >
                            Authorize & Execute
                          </button>
                          <button
                            onClick={() => handleCancelAction(msg.id)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {msg.action_status === 'confirmed' && (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Action authorized and successfully dispatched!</span>
                        </div>
                      )}

                      {msg.action_status === 'cancelled' && (
                        <div className="text-white/40 text-[11px]">
                          Action cancelled by operator.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sources Grounding Tag */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 text-[9.5px] text-white/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Grounded in: {msg.sources.join(' · ')}</span>
                    </div>
                  )}
                </div>

                <span className="text-[9.5px] text-white/30 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white/60 text-xs w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-[#38bdf8]" />
                <span>Querying application state & verifying facts...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {getSuggestedPrompts().map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[10.5px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-[#080D1A]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isOperator ? "Ask Copilot or request action analysis..." : "Ask a safety or shelter question..."}
                disabled={isLoading}
                className="flex-1 bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
