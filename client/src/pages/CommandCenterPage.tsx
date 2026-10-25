// DisasterOS AI Tactical Operational Command Center
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDisaster } from '../context/DisasterContext';
import { DisasterMap } from '../components/map/DisasterMap';
import { Incident, IncidentStatus, SeverityLevel } from '../types';
import { 
  Radio, 
  AlertTriangle, 
  Users, 
  Boxes, 
  Activity, 
  Home, 
  ShieldAlert, 
  Filter, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  HeartPulse,
  Send,
  X,
  Layers,
  ChevronRight,
  Sliders,
  ShieldCheck,
  Check,
  PackageCheck
} from 'lucide-react';

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    disaster, 
    incidents, 
    rescueTeams, 
    hospitals, 
    shelters, 
    inventory, 
    missions, 
    refreshData,
    createIncident,
    updateIncidentStatus,
    allocateResource,
    releaseResource,
    dispatchMission,
    resetDemoData,
    isDemoMode
  } = useDisaster();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  
  // Selected Incident for Contextual Panel
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(() => incidents[0] || null);

  // Bottom drawer active tab
  const [bottomTab, setBottomTab] = useState<'teams' | 'hospitals' | 'inventory' | 'shelters'>('teams');

  // Create Incident Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('flood');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('critical');
  const [newLocation, setNewLocation] = useState('Embarcadero Pier 14');
  const [newLat, setNewLat] = useState(37.7950);
  const [newLng, setNewLng] = useState(-122.3980);
  const [newAffected, setNewAffected] = useState(25);
  const [newMedical, setNewMedical] = useState(true);
  const [newChildren, setNewChildren] = useState(true);
  const [newTrapped, setNewTrapped] = useState(4);

  // Resource Dispatch Inline Form
  const [selectedResourceType, setSelectedResourceType] = useState('Medical Trauma Kits');
  const [selectedQty, setSelectedQty] = useState(5);
  const [allocError, setAllocError] = useState<string | null>(null);
  const [allocSuccess, setAllocSuccess] = useState<string | null>(null);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => {
      const matchesSearch = 
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.address && i.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSeverity = severityFilter === 'all' || i.severity === severityFilter;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'unresolved' && i.status !== 'resolved') ||
        (statusFilter === 'resolved' && i.status === 'resolved');

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter]);

  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const availableTeamsCount = rescueTeams.filter(t => t.status === 'available').length;
  const totalBedsAvailable = hospitals.reduce((acc, h) => acc + h.available_beds, 0);

  // Handle Create Incident Submission
  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await createIncident({
      title: newTitle,
      description: newDesc,
      type: newType,
      severity: newSeverity,
      address: newLocation,
      latitude: newLat,
      longitude: newLng,
      affected_count: Number(newAffected),
      trapped_count: Number(newTrapped),
      medical_urgency: newMedical,
      has_children_elderly: newChildren
    });

    setSelectedIncident(created);
    setCreateModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
  };

  // Handle Resource Allocation to Active Incident
  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setAllocError(null);
    setAllocSuccess(null);

    const res = allocateResource(selectedIncident.id, selectedResourceType, Number(selectedQty));
    if (!res.success) {
      setAllocError(res.error || 'Allocation failed');
    } else {
      setAllocSuccess(`Successfully dispatched ${selectedQty} units to #${selectedIncident.tracking_code}`);
      setTimeout(() => setAllocSuccess(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050817] text-[#F5F7FB] min-h-[calc(100vh-4rem)]">
      
      {/* 1. TOP STATUS & SEARCH BAR */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Left: Operational Sector Breadcrumb & Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#63BDF5]/15 border border-[#63BDF5]/30 flex items-center justify-center text-[#63BDF5] shrink-0">
              <Radio className="w-4 h-4 animate-pulse shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
                  {disaster?.title || 'Tactical Incident Command Center'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#63BDF5]/20 text-[#63BDF5] border border-[#63BDF5]/30 shrink-0">
                  {isDemoMode ? 'SIMULATION MODE' : 'LIVE FEED'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#9AA6BA]">
                GRID: 37.7749° N, 122.4194° W · MULTI-FACTOR PRIORITIZATION ACTIVE
              </p>
            </div>
          </div>

          {/* Right: Search, Quick Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#9AA6BA] absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder="Search incidents, codes, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D162B] border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#9AA6BA] focus:outline-none focus:border-[#63BDF5]/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA6BA] hover:text-white text-xs shrink-0"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center bg-[#0D162B] rounded-full p-0.5 border border-white/10 text-xs shrink-0">
              {(['all', 'critical', 'high', 'medium'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer capitalize shrink-0 ${
                    severityFilter === sev 
                      ? 'bg-[#63BDF5] text-[#050817] font-bold' 
                      : 'text-[#9AA6BA] hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Create Incident CTA */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="pill-button-primary text-xs py-1.5 px-3.5 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="shrink-0 whitespace-nowrap">Report SOS</span>
            </button>

            {/* Reset Demo State Button */}
            <button
              onClick={resetDemoData}
              title="Reset state to initial simulated dataset"
              className="w-8 h-8 rounded-full bg-[#0D162B] border border-white/10 hover:border-[#63BDF5]/40 text-[#9AA6BA] hover:text-[#63BDF5] flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL TELEMETRY METRIC STRIP */}
      <div className="border-b border-white/[0.06] bg-[#050817] px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#9AA6BA]">ACTIVE INCIDENTS:</span>
            <span className="text-white font-bold">{incidents.length}</span>
            <span className="text-[#FF5D67]">({criticalCount} CRITICAL)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9AA6BA]">RESPONSE UNITS:</span>
            <span className="text-[#35D6E8] font-bold">{availableTeamsCount} / {rescueTeams.length} READY</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9AA6BA]">TRAUMA BEDS:</span>
            <span className="text-[#55D6A7] font-bold">{totalBedsAvailable} OPEN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9AA6BA]">LATENCY BUFFER:</span>
            <span className="text-[#63BDF5] font-bold">~3.8 MIN AVERAGE</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE (Map + Incident Queue + Contextual Detail Panel) */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive Leaflet Map (Col 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl flex-1 min-h-[420px] lg:min-h-[540px]">
            <DisasterMap
              height="100%"
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              enableMapClick={true}
              onLocationSelect={(lat, lng) => {
                setNewLat(lat);
                setNewLng(lng);
                setNewLocation(`Pinned Location (${lat}, ${lng})`);
                setCreateModalOpen(true);
              }}
            />
          </div>
        </div>

        {/* Right Column: Incident Queue & Prioritization (Col 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          
          {/* Queue Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Prioritized Incident Queue
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#63BDF5]/20 text-[#63BDF5]">
                {filteredIncidents.length}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#9AA6BA]">
              <span>SORT:</span>
              <span className="text-[#63BDF5] font-bold">PRIORITY SCORE &darr;</span>
            </div>
          </div>

          {/* Incident Queue Scrollable List */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9AA6BA] border border-dashed border-white/10 rounded-2xl">
                No incidents match the active filter criteria.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isCritical = inc.severity === 'critical';

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#0D162B] border-[#63BDF5] shadow-[0_0_20px_rgba(99,189,245,0.2)]'
                        : 'bg-[#0A1022]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#0D162B]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
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

                      {/* Score Badge */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-[#9AA6BA]">SCORE:</span>
                        <span className={`text-xs font-mono font-black ${
                          inc.priority_score > 90 ? 'text-[#FF5D67]' : inc.priority_score > 75 ? 'text-[#FFB454]' : 'text-[#63BDF5]'
                        }`}>
                          {inc.priority_score}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug mb-1">
                      {inc.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#9AA6BA] font-mono pt-1 border-t border-white/[0.04]">
                      <span className="truncate max-w-[200px]">📍 {inc.address || 'Active Sector'}</span>
                      <span className={`capitalize font-semibold ${
                        inc.status === 'resolved' ? 'text-[#55D6A7]' : inc.status === 'in_progress' ? 'text-[#35D6E8]' : 'text-[#FFB454]'
                      }`}>
                        {inc.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Contextual Detail Panel for Selected Incident */}
          {selectedIncident && (
            <div className="terra-card p-4 space-y-3.5 border-[#63BDF5]/30 bg-[#0D162B]">
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#63BDF5] font-bold">
                      #{selectedIncident.tracking_code}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-white/10 text-white">
                      {selectedIncident.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {selectedIncident.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-[#9AA6BA] block">Priority Score</span>
                  <span className="text-xl font-mono font-black text-[#FF5D67]">
                    {selectedIncident.priority_score}/100
                  </span>
                </div>
              </div>

              {/* Contributing factors explanation */}
              <div className="bg-[#050817]/70 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#63BDF5] font-bold block">
                  PRIORITIZATION FACTORS (RULE-BASED ENGINE)
                </span>
                <p className="text-[#F5F7FB] text-[11px] leading-relaxed">
                  {selectedIncident.ai_classification?.rationale || 'Evaluated based on entrapment telemetry, population density in danger perimeter, and life-safety urgency.'}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#9AA6BA]">
                    Affected: ~{selectedIncident.affected_count}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#9AA6BA]">
                    Trapped: {selectedIncident.trapped_count}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#9AA6BA]">
                    Medical Urgency: {selectedIncident.medical_urgency ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>

              {/* Status Transition Workflow Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9AA6BA] font-bold block">
                  STATUS LIFECYCLE (DEMO OPERATOR CONTROL)
                </span>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                  {(['submitted', 'verified', 'assigned', 'in_progress', 'resolved'] as IncidentStatus[]).map((st) => {
                    const isCurrent = selectedIncident.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => updateIncidentStatus(selectedIncident.id, st)}
                        className={`py-1.5 rounded-lg border font-bold capitalize transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#63BDF5] text-[#050817] border-[#63BDF5]'
                            : 'bg-[#050817] text-[#9AA6BA] border-white/10 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {st === 'in_progress' ? 'Active' : st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resource Dispatching Inline Form */}
              <div className="pt-2 border-t border-white/[0.08] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#35D6E8] font-bold block">
                  DISPATCH OPERATIONAL RESOURCES
                </span>
                
                {allocError && (
                  <div className="p-2 rounded-lg bg-[#FF5D67]/15 border border-[#FF5D67]/30 text-[11px] text-[#FF5D67]">
                    {allocError}
                  </div>
                )}

                {allocSuccess && (
                  <div className="p-2 rounded-lg bg-[#55D6A7]/15 border border-[#55D6A7]/30 text-[11px] text-[#55D6A7]">
                    {allocSuccess}
                  </div>
                )}

                <form onSubmit={handleAllocate} className="flex items-center gap-2">
                  <select
                    value={selectedResourceType}
                    onChange={(e) => setSelectedResourceType(e.target.value)}
                    className="flex-1 bg-[#050817] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#63BDF5]/50"
                  >
                    <option value="Medical Trauma Kits">Trauma Medical Kits (Level-A)</option>
                    <option value="Drinking Water">Drinking Water (10L Sealed)</option>
                    <option value="MRE Ration Packs">MRE Ration Packs (72-hr)</option>
                    <option value="Inflatable Tents">Inflatable Weather Tents</option>
                    <option value="Heavy Diesel Generators">Portable Diesel Generators</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Number(e.target.value))}
                    className="w-16 bg-[#050817] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-[#63BDF5]/50 font-mono"
                  />

                  <button
                    type="submit"
                    className="pill-button-primary text-xs py-1.5 px-3 cursor-pointer shrink-0"
                  >
                    <span>Dispatch</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM TABBED METRICS DRAWER (Teams, Hospitals, Shelters, Inventory) */}
      <div className="border-t border-white/[0.08] bg-[#0A1022] mt-4 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 text-xs">
            {[
              { id: 'teams', label: 'Response Units', count: rescueTeams.length, icon: Users },
              { id: 'hospitals', label: 'Trauma Centers', count: hospitals.length, icon: Activity },
              { id: 'shelters', label: 'Evacuation Shelters', count: shelters.length, icon: Home },
              { id: 'inventory', label: 'Depot Stocks', count: inventory.length, icon: Boxes },
            ].map(tab => {
              const isActive = bottomTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setBottomTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#63BDF5] text-[#050817] font-bold shadow-sm'
                      : 'text-[#9AA6BA] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-[#050817]/20 text-[#050817]' : 'bg-white/10 text-white'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          {bottomTab === 'teams' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {rescueTeams.map(team => (
                <div key={team.id} className="p-3 rounded-xl bg-[#0D162B] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#35D6E8] font-bold">{team.team_code}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono uppercase font-bold ${
                      team.status === 'available' ? 'bg-[#55D6A7]/20 text-[#55D6A7]' : 'bg-[#FFB454]/20 text-[#FFB454]'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white leading-tight">{team.name}</h5>
                  <p className="text-[10px] text-[#9AA6BA] font-mono">Lead: {team.lead_name}</p>
                </div>
              ))}
            </div>
          )}

          {bottomTab === 'hospitals' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hospitals.map(hosp => (
                <div key={hosp.id} className="p-3.5 rounded-xl bg-[#0D162B] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-[#FF5D67] font-bold">TRAUMA LEVEL {hosp.trauma_level}</span>
                    <span className="text-[#55D6A7] font-mono text-xs font-bold">{hosp.available_beds} beds free</span>
                  </div>
                  <h5 className="text-xs font-bold text-white leading-snug">{hosp.name}</h5>
                  <div className="flex items-center justify-between text-[11px] text-[#9AA6BA] font-mono pt-1 border-t border-white/5">
                    <span>ICU Available: {hosp.icu_available} / {hosp.icu_total}</span>
                    <span>Status: {hosp.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {bottomTab === 'shelters' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {shelters.map(shelt => {
                const freeBeds = shelt.capacity - shelt.current_occupancy;
                return (
                  <div key={shelt.id} className="p-3.5 rounded-xl bg-[#0D162B] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-[#55D6A7] font-bold">SHELTER REFUGE</span>
                      <span className="font-mono text-xs text-white font-bold">{freeBeds} places</span>
                    </div>
                    <h5 className="text-xs font-bold text-white leading-snug">{shelt.name}</h5>
                    <p className="text-[10px] text-[#9AA6BA] truncate">📍 {shelt.address}</p>
                  </div>
                );
              })}
            </div>
          )}

          {bottomTab === 'inventory' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {inventory.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-[#0D162B] border border-white/5 space-y-1">
                  <span className="text-[9.5px] font-mono uppercase text-[#9AA6BA] block">{item.category}</span>
                  <h5 className="text-xs font-bold text-white truncate">{item.item_name}</h5>
                  <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                    <span className="text-[#63BDF5] font-bold">{item.quantity_available}</span>
                    <span className="text-[#9AA6BA] text-[10px]">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. CREATE INCIDENT MODAL */}
      {createModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#050817]/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setCreateModalOpen(false)}
        >
          <div 
            className="bg-[#0D162B] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF5D67]" />
                <h3 className="text-base font-bold text-white">Report New Emergency Incident</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[#9AA6BA] hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#9AA6BA] mb-1">
                  Incident Title / Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marina Seawall Overflow & Stranded Transit"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#5E6D84] focus:outline-none focus:border-[#63BDF5]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9AA6BA] mb-1">
                    Hazard Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#63BDF5]/50"
                  >
                    <option value="flood">Flood / Inundation</option>
                    <option value="wildfire">Wildfire / Heat</option>
                    <option value="earthquake">Earthquake / Structural</option>
                    <option value="medical">Mass Casualty / Trauma</option>
                    <option value="infrastructure">Infrastructure Failure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9AA6BA] mb-1">
                    Severity Level
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#63BDF5]/50"
                  >
                    <option value="critical">Critical (Immediate Life-Threat)</option>
                    <option value="high">High (Severe Exposure)</option>
                    <option value="medium">Medium (Advisory / Monitoring)</option>
                    <option value="low">Low (Contained)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#9AA6BA] mb-1">
                  Location Address & Coordinates
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#5E6D84] focus:outline-none focus:border-[#63BDF5]/50 mb-2"
                />
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <input
                    type="number"
                    step="0.0001"
                    value={newLat}
                    onChange={(e) => setNewLat(Number(e.target.value))}
                    className="bg-[#050817] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={newLng}
                    onChange={(e) => setNewLng(Number(e.target.value))}
                    className="bg-[#050817] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    placeholder="Longitude"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9AA6BA] mb-1">
                    Est. Affected People
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newAffected}
                    onChange={(e) => setNewAffected(Number(e.target.value))}
                    className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#63BDF5]/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9AA6BA] mb-1">
                    Entrapped Persons
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newTrapped}
                    onChange={(e) => setNewTrapped(Number(e.target.value))}
                    className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#63BDF5]/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#9AA6BA] mb-1">
                  Distress Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide situational telemetry, hazard spread, or physical impediments..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#050817] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#5E6D84] focus:outline-none focus:border-[#63BDF5]/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMedical}
                    onChange={(e) => setNewMedical(e.target.checked)}
                    className="rounded border-white/20 text-[#63BDF5] focus:ring-0"
                  />
                  <span className="text-[#F5F7FB]">Acute Medical Trauma</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newChildren}
                    onChange={(e) => setNewChildren(e.target.checked)}
                    className="rounded border-white/20 text-[#63BDF5] focus:ring-0"
                  />
                  <span className="text-[#F5F7FB]">Children / Elderly Present</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="pill-button-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pill-button-primary text-xs py-2 px-5"
                >
                  Transmit & Prioritize SOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
