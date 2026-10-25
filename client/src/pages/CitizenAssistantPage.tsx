// DisasterOS Citizen AI Safety & Disaster Preparedness Assistant
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDisaster } from '../context/DisasterContext';
import { api } from '../services/api';
import { GeminiConfigModal } from '../components/common/GeminiConfigModal';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowLeft,
  Settings,
  ShieldCheck,
  Radio,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
  sources?: string[];
  confidence?: number;
  model?: string;
  isGemini?: boolean;
}

export const CitizenAssistantPage: React.FC = () => {
  const { shelters, hospitals, disaster } = useDisaster();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello, I am your DisasterOS Civilian Safety Assistant. I am monitoring the active **${disaster?.title || 'Atmospheric River Inundation'}** crisis in real time.\n\nI can guide you on immediate evacuation procedures, where to find open safe shelters, flood/fire survival measures, and first aid tips while you await emergency responders. What emergency information do you need right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'DisasterOS Telemetry',
      suggestions: [
        'Where is the nearest safe evacuation shelter?',
        'What should I pack for immediate evacuation?',
        'What to do if floodwater enters my home?',
        'Is tap water safe to drink right now?'
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isGeminiActive, setIsGeminiActive] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('gemini-2.0-flash');

  useEffect(() => {
    checkGeminiStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

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
    const query = (textToSend || inputPrompt).trim();
    if (!query || isThinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsThinking(true);

    try {
      // Build conversation history for multi-turn Gemini reasoning
      const history = messages.slice(-10).map(m => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await api.aiAssistant(query, {
        history,
        context: {
          disaster,
          shelters,
          hospitals
        },
        role: 'citizen'
      });

      // Contextual suggested follow-ups
      const suggestions: string[] = [];
      const q = query.toLowerCase();
      if (q.includes('shelter') || q.includes('where to go') || q.includes('safe')) {
        suggestions.push('What should I pack for immediate evacuation?', 'What roads are flooded or blocked?');
      } else if (q.includes('pack') || q.includes('bag') || q.includes('prepare')) {
        suggestions.push('Where is the nearest safe evacuation shelter?', 'What to do if power goes out?');
      } else if (q.includes('flood') || q.includes('water') || q.includes('rising')) {
        suggestions.push('Is tap water safe to drink right now?', 'How can I signal first responders?');
      } else if (q.includes('hospital') || q.includes('medical') || q.includes('doctor')) {
        suggestions.push('Where can I get oxygen or prescription supplies?', 'Where is the nearest shelter?');
      } else {
        suggestions.push('Where is the nearest safe evacuation shelter?', 'What are the emergency shelter rules?');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        sources: res.sources,
        confidence: res.confidence,
        model: res.model || (res.isGemini ? 'Google Gemini 2.0 Flash' : 'DisasterOS Emergency Engine'),
        isGemini: res.isGemini,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Emergency Assistant service encountered a connection issue: ${err.message || 'Service unreachable'}.\n\nIf you are in immediate life-threatening peril, dial 911 or submit an emergency report via the **Emergency SOS** button right away.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            'Where is the nearest safe evacuation shelter?',
            'What should I pack for immediate evacuation?'
          ]
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-12 selection:bg-[#38bdf8] selection:text-[#020617]">
      
      {/* Top Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#55D6A7]/20 border border-[#55D6A7]/40 flex items-center justify-center text-[#55D6A7]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#55D6A7] font-bold">
                  CIVILIAN AI SAFETY COMPANION
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Disaster Preparedness & Evacuation Assistant
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gemini Status / Config Button */}
            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                isGeminiActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/20'
                  : 'bg-white/[0.05] border-white/15 text-white/80 hover:bg-white/[0.12]'
              }`}
              title="Configure Google Gemini API Key"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeminiActive ? 'text-emerald-400 animate-pulse' : 'text-[#38bdf8]'}`} />
              <span className="hidden sm:inline">
                {isGeminiActive ? `✨ Gemini Active (${activeModel})` : '✨ Connect Gemini API'}
              </span>
              <span className="sm:hidden">
                {isGeminiActive ? 'Gemini' : 'API Key'}
              </span>
              <Settings className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            <Link
              to="/citizen/dashboard"
              className="pill-button-secondary text-xs py-1.5 px-3.5 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 w-full mt-6 flex-1 flex flex-col">
        
        {/* Chat History Container */}
        <div className="terra-card flex-1 p-5 sm:p-6 bg-[#0D162B]/80 border border-white/10 rounded-3xl min-h-[520px] flex flex-col justify-between space-y-4">
          
          <div className="space-y-4 overflow-y-auto max-h-[620px] pr-1">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-[#55D6A7]/20 border border-[#55D6A7]/40 text-[#55D6A7] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#38bdf8] text-[#020617] font-medium'
                    : 'bg-[#05070d] border border-white/10 text-white/90 whitespace-pre-line'
                }`}>
                  <p>{msg.text}</p>
                  
                  {/* AI Metadata & Sources Footer */}
                  {msg.sender === 'ai' && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-[10.5px]">
                      <div className="flex items-center gap-2 text-white/50">
                        {msg.isGemini ? (
                          <span className="flex items-center gap-1 text-[#38bdf8] font-medium">
                            <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                            Google {msg.model || 'Gemini 2.0'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#55D6A7]">
                            <ShieldCheck className="w-3 h-3" />
                            {msg.model || 'DisasterOS Telemetry'}
                          </span>
                        )}

                        {msg.confidence && (
                          <span className="font-mono text-white/40">
                            • {(msg.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] opacity-40 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {/* Suggestions Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                      {msg.suggestions.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(s)}
                          className="px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-[11px] text-[#7dd3fc] cursor-pointer transition-colors"
                        >
                          {s} &rarr;
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.sender === 'user' && (
                    <span className="block text-[10px] opacity-50 mt-1.5 text-right font-mono">
                      {msg.timestamp}
                    </span>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#38bdf8] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-white/60 pl-11 py-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#55D6A7] animate-ping" />
                <span className="font-medium text-white/80">
                  {isGeminiActive ? 'Gemini 2.0 Flash is synthesizing emergency telemetry...' : 'Evaluating active crisis guidelines...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="pt-3 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about evacuation routes, open shelters, first aid, or storm safety..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="flex-1 bg-[#05070d] border border-white/15 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] transition-colors"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isThinking}
                className="btn-primary py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-40 cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            
            <div className="flex items-center justify-between text-[10.5px] text-white/40 mt-2 px-1 flex-wrap gap-2">
              <span>
                ⚡ Grounded in active DisasterOS emergency state. In life-threatening emergencies, dial 911 or click &ldquo;Report SOS&rdquo;.
              </span>
              <button
                onClick={() => setIsGeminiModalOpen(true)}
                className="text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isGeminiActive ? 'Gemini Connected' : 'Connect Gemini API Key'}</span>
              </button>
            </div>
          </div>
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
