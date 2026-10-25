import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { Incident, IncidentStatus, SeverityLevel } from '../types';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Radio, 
  Navigation,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { incidents, updateIncidentStatus, createIncident } = useDisaster();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New incident form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('flood');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('critical');
  const [newLocation, setNewLocation] = useState('San Francisco Waterfront');
  const [newAffected, setNewAffected] = useState(30);

  const filtered = incidents.filter(i => {
    const matchesSearch = 
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tracking_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || i.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createIncident({
      title: newTitle,
      description: newDesc,
      type: newType,
      severity: newSeverity,
      address: newLocation,
      affected_count: Number(newAffected)
    });

    setCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#63BDF5] font-bold">
                INCIDENT TRIAGE MANAGEMENT
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Emergency Incidents & Life-Safety Queue
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="pill-button-primary text-xs py-2 px-4 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="shrink-0 whitespace-nowrap">Report SOS Incident</span>
            </button>
            <button
              onClick={() => navigate('/command-center')}
              className="pill-button-secondary text-xs py-2 px-4 cursor-pointer shrink-0"
            >
              <span className="shrink-0 whitespace-nowrap">Command Center</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        
        {/* Search & Filter Controls */}
        <div className="terra-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9AA6BA] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by distress title, tracking code (#SOS-701), or street..."
              className="w-full bg-[#050817] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-[#5E6D84] focus:outline-none focus:border-[#63BDF5]/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-[#050817] p-1 rounded-full border border-white/10 text-xs">
              <span className="text-[10px] font-mono text-[#9AA6BA] px-2">SEVERITY:</span>
              {['all', 'critical', 'high', 'medium'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize cursor-pointer transition-all ${
                    severityFilter === sev 
                      ? 'bg-[#63BDF5] text-[#050817] font-bold' 
                      : 'text-[#9AA6BA] hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[#050817] p-1 rounded-full border border-white/10 text-xs">
              <span className="text-[10px] font-mono text-[#9AA6BA] px-2">STATUS:</span>
              {['all', 'submitted', 'assigned', 'in_progress', 'resolved'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize cursor-pointer transition-all ${
                    statusFilter === st 
                      ? 'bg-[#63BDF5] text-[#050817] font-bold' 
                      : 'text-[#9AA6BA] hover:text-white'
                  }`}
                >
                  {st === 'in_progress' ? 'Active' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full terra-card p-12 text-center text-sm text-[#9AA6BA] space-y-2">
              <p>No incidents match the active search and filter parameters.</p>
              <button
                onClick={() => { setSearchQuery(''); setSeverityFilter('all'); setStatusFilter('all'); }}
                className="text-[#63BDF5] hover:underline text-xs"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filtered.map((inc) => {
              const isCritical = inc.severity === 'critical';

              return (
                <div
                  key={inc.id}
                  className="terra-card p-5 flex flex-col justify-between space-y-4 hover:border-[#63BDF5]/40 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isCritical
                            ? 'bg-[#FF5D67]/20 text-[#FF5D67] border border-[#FF5D67]/40'
                            : inc.severity === 'high'
                            ? 'bg-[#FFB454]/20 text-[#FFB454] border border-[#FFB454]/40'
                            : 'bg-[#63BDF5]/20 text-[#63BDF5] border border-[#63BDF5]/40'
                        }`}>
                          {inc.severity}
                        </span>
                        <span className="font-mono text-xs text-[#63BDF5] font-bold">
                          #{inc.tracking_code}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-mono">
                        <span className="text-[#9AA6BA]">SCORE:</span>
                        <span className="font-black text-white">{inc.priority_score}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {inc.title}
                    </h3>

                    <p className="text-xs text-[#9AA6BA] leading-relaxed line-clamp-3">
                      {inc.description}
                    </p>

                    <div className="text-[11px] font-mono text-[#9AA6BA] space-y-1 pt-1 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#35D6E8] shrink-0" />
                        <span className="truncate">{inc.address || 'Active Sector Grid'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#5E6D84]">
                        <span>AFFECTED: ~{inc.affected_count}</span>
                        <span>TRAPPED: {inc.trapped_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Lifecycle Buttons */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-1.5">
                    <span className="text-[9.5px] font-mono uppercase text-[#9AA6BA] block">
                      STATUS PROGRESSION
                    </span>
                    <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                      {(['submitted', 'verified', 'assigned', 'in_progress', 'resolved'] as IncidentStatus[]).map(st => {
                        const isCurrent = inc.status === st;
                        return (
                          <button
                            key={st}
                            onClick={() => updateIncidentStatus(inc.id, st)}
                            className={`py-1 rounded font-bold capitalize transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-[#63BDF5] text-[#050817] shadow-sm'
                                : 'bg-[#050817] text-[#9AA6BA] hover:text-white'
                            }`}
                          >
                            {st === 'in_progress' ? 'Active' : st.slice(0, 5)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#050817]/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setCreateModalOpen(false)}
        >
          <div 
            className="bg-[#0D162B] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Create New Emergency Incident</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-[#9AA6BA] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#9AA6BA] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Marina Seawall Breach & Water Surge"
                  className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#63BDF5]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#9AA6BA] mb-1">Hazard Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="flood">Flood</option>
                    <option value="wildfire">Wildfire</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="medical">Medical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#9AA6BA] mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9AA6BA] mb-1">Address Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9AA6BA] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Field incident details..."
                  className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="pill-button-secondary text-xs py-2 px-4">Cancel</button>
                <button type="submit" className="pill-button-primary text-xs py-2 px-5">Submit SOS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
