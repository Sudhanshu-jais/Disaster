import React, { useState, useEffect } from 'react';
import { HeaderBand } from '../components/layout/HeaderBand';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { Search } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    api.getAuditLogs().then(res => setLogs(res.audit_logs || []));
  }, []);

  const filtered = logs.filter(l => {
    const matchesQ = 
      l.action.toLowerCase().includes(query.toLowerCase()) ||
      l.details.toLowerCase().includes(query.toLowerCase()) ||
      l.user_email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' || l.user_role === roleFilter;
    return matchesQ && matchesRole;
  });

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Compliance & Telemetry' },
          { label: 'Audit Trail' }
        ]}
        title="Immutable Operational Audit Log"
        description="Tamper-evident record of all emergency authority approvals, resource dispatches, mission progression, and triage state changes."
        statusText="Ledger Verified & Synced"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search audit actions, users, or details..."
              className="w-full bg-[#0A1022] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#9AA6BA]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="all">All Roles</option>
              <option value="authority">Authority</option>
              <option value="rescue_team">Rescue Team</option>
              <option value="warehouse">Warehouse</option>
              <option value="hospital">Hospital</option>
              <option value="citizen">Citizen</option>
              <option value="system">System / AI</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#0D162B] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-white/80">
              <thead className="bg-[#0A1022] text-[#9AA6BA] uppercase font-semibold text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-white/40 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-white truncate max-w-[150px]">
                      {l.user_email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-sans font-semibold capitalize border border-white/10">
                        {l.user_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#38bdf8]">{l.action}</td>
                    <td className="py-3 px-4 text-[#9AA6BA] uppercase">{l.entity_type}</td>
                    <td className="py-3 px-4 font-sans text-white/90">{l.details}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/40 font-sans">
                      No audit logs match your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
