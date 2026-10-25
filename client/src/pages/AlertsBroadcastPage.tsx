import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { HeaderBand } from '../components/layout/HeaderBand';
import { api } from '../services/api';
import { Radio, Send } from 'lucide-react';

export const AlertsBroadcastPage: React.FC = () => {
  const { alerts, refreshData } = useDisaster();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('critical');
  const [affectedArea, setAffectedArea] = useState('Sector 4 - Marina Basin');
  const [channels, setChannels] = useState<string[]>(['push', 'sms']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleChannel = (ch: string) => {
    setChannels(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setIsSubmitting(true);
    try {
      await api.createAlert({
        title,
        message,
        severity,
        affected_area: affectedArea,
        channels
      });
      refreshData();
      setTitle('');
      setMessage('');
      alert('Emergency Broadcast dispatched to active communication towers.');
    } catch (e: any) {
      alert(`Broadcast failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Communications' },
          { label: 'Emergency Alerts' }
        ]}
        title="Public Emergency Alert & Evacuation Broadcast"
        description="Multi-channel siren, push notifications, and SMS emergency broadcast transmitter."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Broadcast Composer */}
        <div className="lg:col-span-6 bg-[#0D162B] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Radio className="w-4 h-4 text-[#38bdf8]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Compose Emergency Broadcast
            </h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/80 block mb-1">Alert Headline / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Flood Evacuation Order - Low-Lying Marina Basin"
                className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                >
                  <option value="critical">Critical (Life Safety)</option>
                  <option value="severe">Severe Warning</option>
                  <option value="warning">Moderate Advisory</option>
                  <option value="info">Informational</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Target Geographic Zone</label>
                <input
                  type="text"
                  value={affectedArea}
                  onChange={(e) => setAffectedArea(e.target.value)}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/80 block mb-1">Transmission Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Include safe evacuation routes, shelter locations, and emergency precautions..."
                className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8] resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/80 block mb-2">Transmission Channels</label>
              <div className="flex flex-wrap gap-2 text-xs">
                {['push', 'sms', 'siren', 'wea'].map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`px-3 py-1.5 rounded-lg border font-medium uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                      channels.includes(ch)
                        ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8] font-bold'
                        : 'border-white/15 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-[#9AA6BA]">Broadcasting requires Emergency Authority clearance</span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Transmitting...' : 'Transmit Alert'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Broadcast History */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Broadcast Feed ({alerts.length})
          </h3>

          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className="bg-[#0D162B] border border-white/10 rounded-2xl p-4 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {a.severity.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-white/40 font-mono">
                    {new Date(a.sent_at).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{a.title}</h4>
                <p className="text-xs text-[#9AA6BA] leading-relaxed">{a.message}</p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                  <span>Zone: <strong className="text-white">{a.affected_area}</strong></span>
                  <span className="uppercase text-[10px] font-medium font-mono">Channels: {a.channels?.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
