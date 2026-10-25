// DisasterOS Dynamic Resource Reallocation & Depots Transfer Engine
import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { useAuth } from '../context/AuthContext';
import { 
  Workflow, 
  AlertTriangle, 
  Boxes, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Layers, 
  ArrowLeftRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TransferRecord {
  id: string;
  sourceDepot: string;
  targetSector: string;
  resource: string;
  quantity: number;
  reason: string;
  urgency: 'critical' | 'high' | 'routine';
  approver: string;
  timestamp: string;
  status: 'transferred' | 'en_route' | 'pending';
}

export const ResourceReallocationPage: React.FC = () => {
  const { inventory, incidents, warehouses } = useDisaster();
  const { user } = useAuth();

  const [transfers, setTransfers] = useState<TransferRecord[]>([
    {
      id: 'tx-801',
      sourceDepot: 'Central Logistics Depot (Pier 27)',
      targetSector: 'Marina Sector A Swiftwater Inundation (#SOS-781)',
      resource: 'Swiftwater Zodiac Inflatable Boats',
      quantity: 4,
      reason: 'Critical levee breach cresting above 4ft; prioritized over routine patrol',
      urgency: 'critical',
      approver: 'Chief Marcus Vance (EOC Incident Commander)',
      timestamp: '12 mins ago',
      status: 'en_route'
    },
    {
      id: 'tx-802',
      sourceDepot: 'South Basin Auxiliary Warehouse',
      targetSector: 'Metropolitan Trauma Hospital Surge',
      resource: 'Advanced Trauma Surgical Packs',
      quantity: 25,
      reason: 'Mass-casualty triage influx from seismic facade collapse',
      urgency: 'critical',
      approver: 'Chief Marcus Vance (EOC Incident Commander)',
      timestamp: '35 mins ago',
      status: 'transferred'
    },
    {
      id: 'tx-803',
      sourceDepot: 'Presidio Strategic Supply Depot',
      targetSector: 'Marina High School Gymnasium Shelter',
      resource: '5-Gallon Potable Drinking Water Rations',
      quantity: 120,
      reason: 'Civilian shelter occupancy exceeded 85% intake threshold',
      urgency: 'high',
      approver: 'Elena Rostova (Warehouse Logistics Officer)',
      timestamp: '1 hour ago',
      status: 'transferred'
    }
  ]);

  // Form state for creating dynamic transfer
  const [selectedSource, setSelectedSource] = useState('Central Logistics Depot (Pier 27)');
  const [selectedTarget, setSelectedTarget] = useState('Marina Sector A Swiftwater Inundation (#SOS-781)');
  const [selectedResource, setSelectedResource] = useState('Medical Trauma Kits');
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState('Prevent stock depletion under active flood surge');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: TransferRecord = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      sourceDepot: selectedSource,
      targetSector: selectedTarget,
      resource: selectedResource,
      quantity,
      reason,
      urgency: 'high',
      approver: `${user?.fullName || 'EOC Commander'} (${user?.title || 'Operator'})`,
      timestamp: 'Just now',
      status: 'en_route'
    };

    setTransfers(prev => [newTx, ...prev]);
    setSuccessNotice(`Reallocation order #${newTx.id} authorized: Dispatched ${quantity} units of ${selectedResource}.`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16 selection:bg-[#63BDF5] selection:text-[#050817]">
      
      {/* Header */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#63BDF5] font-bold">
                OPERATIONAL LOGISTICS REALLOCATION
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#55D6A7] animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Dynamic Multi-Depot Resource Reallocation
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/operator/allocation"
              className="pill-button-secondary text-xs py-2 px-3.5 cursor-pointer"
            >
              <span>Smart Allocation</span>
            </Link>
            <Link
              to="/operator/dashboard"
              className="pill-button-primary text-xs py-2 px-4 cursor-pointer font-bold"
            >
              <span>Command Center</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        
        {/* Notice */}
        {successNotice && (
          <div className="p-3.5 rounded-2xl bg-[#55D6A7]/15 border border-[#55D6A7]/40 flex items-center gap-2.5 text-xs text-[#55D6A7] animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Dynamic Conflict Detection Card */}
        <div className="p-5 rounded-3xl bg-[#0D162B] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB454]/15 border border-[#FFB454]/30 flex items-center justify-center text-[#FFB454] shrink-0 mt-0.5">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10.5px] font-mono uppercase text-[#FFB454] font-bold tracking-wider">
                AUTOMATED CONFLICT & SHORTAGE MONITOR
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Supply Chain Balancing Engine Active
              </h3>
              <p className="text-xs text-[#9AA6BA] mt-0.5">
                Zero-over-allocation safeguards verify minimum reserve thresholds across all 3 primary depots before approving transfers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs text-[#55D6A7] bg-[#55D6A7]/10 px-3 py-1 rounded-full border border-[#55D6A7]/30">
              ✓ ZERO CONFLICTS DETECTED
            </span>
          </div>
        </div>

        {/* Reallocation Form and History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Authorize Reallocation Order */}
          <div className="terra-card p-6 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Authorize Dynamic Reallocation</h3>
              <p className="text-xs text-[#9AA6BA]">Transfer strategic reserves between depots and high-priority sectors</p>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9AA6BA] font-semibold mb-1">Source Depot / Warehouse</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-[#050817] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#63BDF5]"
                >
                  <option>Central Logistics Depot (Pier 27)</option>
                  <option>South Basin Auxiliary Warehouse</option>
                  <option>Presidio Strategic Supply Depot</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9AA6BA] font-semibold mb-1">Destination Sector / Incident</label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full bg-[#050817] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#63BDF5]"
                >
                  <option>Marina Sector A Swiftwater Inundation (#SOS-781)</option>
                  <option>Metropolitan Trauma Hospital Surge</option>
                  <option>Marina High School Gymnasium Shelter</option>
                  <option>Diablo Ridge Fireline Buffer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AA6BA] font-semibold mb-1">Resource</label>
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    className="w-full bg-[#050817] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#63BDF5]"
                  >
                    <option>Medical Trauma Kits</option>
                    <option>Potable Water Rations</option>
                    <option>Swiftwater Zodiac Boats</option>
                    <option>Industrial Sump Pumps</option>
                    <option>Emergency Generators</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9AA6BA] font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-[#050817] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#63BDF5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9AA6BA] font-semibold mb-1">Justification & Reallocation Rationale</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#050817] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#63BDF5]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-primary text-xs py-2 px-4 font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Authorize & Dispatch Reallocation</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Transfer Log & Audit Trail */}
          <div className="lg:col-span-2 terra-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Reallocation Log & Chain-of-Custody</h3>
                <p className="text-xs text-[#9AA6BA]">Approved emergency transfers with authorized officer endorsements</p>
              </div>
              <span className="text-xs font-mono text-[#63BDF5]">
                {transfers.length} Records
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {transfers.map(tx => (
                <div key={tx.id} className="p-4 rounded-2xl bg-[#050817] border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#63BDF5] bg-[#63BDF5]/15 px-2 py-0.5 rounded border border-[#63BDF5]/30">
                        #{tx.id}
                      </span>
                      <span className="font-semibold text-white">{tx.quantity}x {tx.resource}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#55D6A7] uppercase bg-[#55D6A7]/10 px-2 py-0.5 rounded-full">
                      {tx.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] text-[#9AA6BA] pt-1">
                    <div>
                      <span className="text-white/40 block text-[10px]">Source Depot:</span>
                      <span className="text-white">{tx.sourceDepot}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px]">Target Destination:</span>
                      <span className="text-[#35D6E8]">{tx.targetSector}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/70 italic pt-1 border-t border-white/5">
                    "{tx.reason}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 font-mono">
                    <span>Approved by: {tx.approver}</span>
                    <span>{tx.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
