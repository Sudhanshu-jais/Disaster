import React, { useMemo } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, Clock, Users, ShieldCheck, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SEVERITY_COLORS = {
  critical: '#FF5D67',
  high: '#FFB454',
  medium: '#63BDF5',
  low: '#55D6A7'
};

const CATEGORY_COLORS = ['#63BDF5', '#35D6E8', '#FFB454', '#FF5D67', '#A78BFA'];

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { incidents, rescueTeams, inventory, shelters, hospitals } = useDisaster();

  // 1. Calculate Incident Categories Distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(i => {
      const type = (i.type || 'other').toUpperCase();
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  // 2. Calculate Severity Breakdown
  const severityData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    incidents.forEach(i => {
      if (counts[i.severity] !== undefined) {
        counts[i.severity]++;
      } else {
        counts[i.severity] = 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name.toUpperCase(),
      count,
      color: (SEVERITY_COLORS as any)[name] || '#63BDF5'
    }));
  }, [incidents]);

  // 3. Calculate Status Progression
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      submitted: 0,
      verified: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0
    };
    incidents.forEach(i => {
      if (counts[i.status] !== undefined) counts[i.status]++;
    });
    return [
      { status: 'Submitted', count: counts.submitted },
      { status: 'Verified', count: counts.verified },
      { status: 'Assigned', count: counts.assigned },
      { status: 'In Progress', count: counts.in_progress },
      { status: 'Resolved', count: counts.resolved },
    ];
  }, [incidents]);

  // 4. Resource Utilization Breakdown
  const inventoryData = useMemo(() => {
    return inventory.map(item => ({
      name: item.category,
      available: item.quantity_available,
      reserved: item.quantity_reserved
    }));
  }, [inventory]);

  const totalPeopleAffected = incidents.reduce((acc, i) => acc + (i.affected_count || 0), 0);
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const deployedTeams = rescueTeams.filter(t => t.status !== 'available').length;
  const totalShelterPlaces = shelters.reduce((acc, s) => acc + (s.capacity - s.current_occupancy), 0);

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      
      {/* Top Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#63BDF5] font-bold">
                OPERATIONAL PERFORMANCE METRICS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Disaster Response Analytics & Resource Telemetry
            </h1>
          </div>

          <button
            onClick={() => navigate('/command-center')}
            className="pill-button-secondary text-xs py-2 px-4 self-start sm:self-auto cursor-pointer shrink-0"
          >
            <span className="shrink-0 whitespace-nowrap">Command Center</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="terra-card p-5">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#9AA6BA] block mb-1">Est. Population In Danger</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-telemetry">{totalPeopleAffected.toLocaleString()}</div>
            <span className="text-xs text-[#63BDF5] mt-1 block">Across active incident sectors</span>
          </div>

          <div className="terra-card p-5 border-[#FF5D67]/30 bg-gradient-to-b from-[#FF5D67]/10 to-transparent">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#FF5D67] font-bold block mb-1">Critical Urgency Incidents</span>
            <div className="text-2xl sm:text-3xl font-black text-[#FF5D67] font-telemetry">{criticalCount}</div>
            <span className="text-xs text-[#FF5D67] mt-1 block">Life-threat priority &gt; 90/100</span>
          </div>

          <div className="terra-card p-5">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#9AA6BA] block mb-1">Response Units In Action</span>
            <div className="text-2xl sm:text-3xl font-black text-[#35D6E8] font-telemetry">{deployedTeams} / {rescueTeams.length}</div>
            <span className="text-xs text-[#9AA6BA] mt-1 block">Active deployments logged</span>
          </div>

          <div className="terra-card p-5">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#9AA6BA] block mb-1">Open Shelter Capacity</span>
            <div className="text-2xl sm:text-3xl font-black text-[#55D6A7] font-telemetry">{totalShelterPlaces}</div>
            <span className="text-xs text-[#55D6A7] mt-1 block">Ready for emergency intake</span>
          </div>
        </div>

        {/* Charts Row 1: Category Pie + Severity Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Incident Hazard Categories */}
          <div className="terra-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Incident Hazard Distribution
              </h3>
              <span className="text-xs font-mono text-[#9AA6BA]">{incidents.length} Total</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="#050817" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D162B', borderColor: 'rgba(99,189,245,0.3)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              {categoryData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                  <span className="text-[#9AA6BA]">{entry.name}:</span>
                  <span className="text-white font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="terra-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Severity Level Distribution
              </h3>
              <span className="text-xs font-mono text-[#FF5D67]">Multi-Factor Ranks</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#9AA6BA" fontSize={11} />
                  <YAxis stroke="#9AA6BA" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D162B', borderColor: 'rgba(99,189,245,0.3)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[#9AA6BA] text-center">
              Evaluated strictly by rule-based priority engine (Severity + Urgency + Entrapment count).
            </p>
          </div>
        </div>

        {/* Charts Row 2: Status Lifecycle Pipeline + Inventory Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Incident Status Progression */}
          <div className="terra-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Incident Lifecycle Pipeline
              </h3>
              <span className="text-xs font-mono text-[#35D6E8]">Workflow Progression</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="#9AA6BA" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="status" stroke="#9AA6BA" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D162B', borderColor: 'rgba(99,189,245,0.3)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#63BDF5" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Staging Inventory Reserved vs Available */}
          <div className="terra-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Staging Inventory Allocation
              </h3>
              <span className="text-xs font-mono text-[#55D6A7]">Available vs Reserved</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#9AA6BA" fontSize={11} />
                  <YAxis stroke="#9AA6BA" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D162B', borderColor: 'rgba(99,189,245,0.3)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="available" fill="#55D6A7" radius={[4, 4, 0, 0]} name="Available" />
                  <Bar dataKey="reserved" fill="#FFB454" radius={[4, 4, 0, 0]} name="Reserved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
