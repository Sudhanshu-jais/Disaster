import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { useAuth } from '../context/AuthContext';
import { HeaderBand } from '../components/layout/HeaderBand';
import { StatusBadge } from '../components/common/StatusBadge';
import { InventoryItem } from '../types';
import { api } from '../services/api';
import { Boxes, AlertTriangle, Send, RefreshCw, CheckCircle2 } from 'lucide-react';

export const WarehousesPage: React.FC = () => {
  const { warehouses, inventory, refreshData } = useDisaster();
  const { user } = useAuth();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Quick Action Modal states
  const [selectedItemForAction, setSelectedItemForAction] = useState<InventoryItem | null>(null);
  const [actionType, setActionType] = useState<'dispatch' | 'replenish'>('dispatch');
  const [actionQuantity, setActionQuantity] = useState<number>(10);
  const [actionReason, setActionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  const isWarehouseOperator = user?.role === 'warehouse';
  const myDepot = warehouses.find(w => w.name.includes('Central') || w.code.includes('WH-MAIN')) || warehouses[0];

  const filteredItems = inventory.filter(item => {
    const matchWh = selectedWarehouseId === 'all' || item.warehouse_id === selectedWarehouseId;
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchWh && matchCat;
  });

  const lowStockItems = inventory.filter(i => i.status === 'low' || i.status === 'critical');

  const handleQuickDispatch = async (itemNameSubstring: string, qty: number, label: string) => {
    const item = inventory.find(i => i.item_name.toLowerCase().includes(itemNameSubstring.toLowerCase()));
    if (!item) {
      alert(`Item "${itemNameSubstring}" not found in inventory.`);
      return;
    }

    try {
      await api.dispatchInventory({
        inventory_id: item.id,
        quantity: Math.min(qty, item.quantity_available),
        reason: `Rapid Deployment Preset: ${label}`
      });
      await refreshData();
      setQuickNotice(`Dispatched ${qty} ${item.unit} of ${item.item_name}!`);
      setTimeout(() => setQuickNotice(null), 3500);
    } catch (err: any) {
      alert(`Quick dispatch error: ${err.message}`);
    }
  };

  const handleQuickReplenishAllLow = async () => {
    if (lowStockItems.length === 0) {
      alert('All inventory lines are currently above safe minimum thresholds.');
      return;
    }

    try {
      for (const item of lowStockItems) {
        await api.dispatchInventory({
          inventory_id: item.id,
          quantity: -100,
          reason: 'Emergency Depot Automated Stock Replenishment'
        });
      }
      await refreshData();
      setQuickNotice(`Replenished ${lowStockItems.length} low-stock inventory lines (+100 each)!`);
      setTimeout(() => setQuickNotice(null), 4000);
    } catch (err: any) {
      alert(`Replenish error: ${err.message}`);
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;
    setIsSubmitting(true);
    try {
      if (actionType === 'dispatch') {
        await api.dispatchInventory({
          inventory_id: selectedItemForAction.id,
          quantity: actionQuantity,
          reason: actionReason || 'Emergency Tactical Field Dispatch'
        });
      } else {
        await api.dispatchInventory({
          inventory_id: selectedItemForAction.id,
          quantity: -Math.abs(actionQuantity),
          reason: actionReason || 'Stock Replenishment'
        });
      }
      await refreshData();
      setSelectedItemForAction(null);
      setActionReason('');
    } catch (err: any) {
      alert(`Transaction failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Logistics' },
          { label: 'Warehouses & Inventory' }
        ]}
        title="Emergency Warehouses & Stock Telemetry"
        description="Live tracking of medical trauma packs, potable water jugs, emergency rations, and water rescue pumps."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">

        {/* ROLE WORKSPACE: WAREHOUSE DEPOT QUARTERMASTER */}
        {isWarehouseOperator && myDepot && (
          <div className="bg-[#0D162B] border border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                    Depot Quartermaster Console
                  </span>
                  <span className="text-xs font-bold text-indigo-300">Officer Elena Rostova</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-indigo-400" />
                  {myDepot.name} ({myDepot.code})
                </h2>
                <p className="text-xs text-[#9AA6BA]">
                  Location: <strong className="text-white">{myDepot.address}</strong> · Contact: <strong className="text-white">{myDepot.contact_person}</strong> · Inventory Lines: <strong className="text-white">{inventory.filter(i => i.warehouse_id === myDepot.id).length} Active</strong>
                </p>
              </div>

              {/* 1-Click Fast Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleQuickDispatch('water', 50, '50 Water Jugs to Responders')}
                  className="px-3 py-1.5 rounded-lg bg-[#0A1022] border border-indigo-500/40 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  Dispatch 50 Water
                </button>
                <button
                  onClick={() => handleQuickDispatch('trauma', 25, '25 Trauma First Aid Kits')}
                  className="px-3 py-1.5 rounded-lg bg-[#0A1022] border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  Dispatch 25 Trauma Kits
                </button>
                <button
                  onClick={handleQuickReplenishAllLow}
                  className="px-3 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#020617] text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Replenish Low Stock (+100)
                </button>
              </div>
            </div>

            {/* Quick Notice Banner */}
            {quickNotice && (
              <div className="p-2.5 rounded-xl bg-[#55D6A7]/15 border border-[#55D6A7]/30 text-xs font-bold text-[#55D6A7] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#55D6A7]" />
                <span>{quickNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* Low Stock Warning Banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-[#0D162B] border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-white">{lowStockItems.length} inventory categories</strong> are below emergency safety threshold!
              </span>
            </div>
            <button
              onClick={handleQuickReplenishAllLow}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 cursor-pointer shadow-sm"
            >
              One-Click Replenish All
            </button>
          </div>
        )}

        {/* Warehouses Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map(wh => {
            const count = inventory.filter(i => i.warehouse_id === wh.id).length;
            const isSelected = selectedWarehouseId === wh.id;
            const isMine = isWarehouseOperator && myDepot?.id === wh.id;

            return (
              <div
                key={wh.id}
                onClick={() => setSelectedWarehouseId(isSelected ? 'all' : wh.id)}
                className={`bg-[#0D162B] border rounded-2xl p-4 cursor-pointer transition-all ${
                  isMine ? 'border-indigo-400 ring-2 ring-indigo-400/30' : ''
                } ${
                  isSelected ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/30 bg-[#0A1022]' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-2 py-0.5 rounded-md border border-[#38bdf8]/30">
                      {wh.code}
                    </span>
                    {isMine && (
                      <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded">
                        ASSIGNED
                      </span>
                    )}
                  </div>
                  <StatusBadge status={wh.status} />
                </div>
                <h3 className="text-sm font-bold text-white">{wh.name}</h3>
                <p className="text-xs text-[#9AA6BA] mt-1">{wh.address}</p>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                  <span>Contact: {wh.contact_person}</span>
                  <span className="font-semibold text-[#38bdf8]">{count} items tracked</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="bg-[#0D162B] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#9AA6BA]">Filter Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0A1022] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="all">All Categories</option>
              <option value="water">Potable Water</option>
              <option value="food">Rations / Food</option>
              <option value="medical">Medical / Oxygen</option>
              <option value="rescue_gear">Rescue Equipment</option>
              <option value="shelter_kits">Shelter Supplies</option>
              <option value="fuel">Fuel Reserves</option>
            </select>
          </div>

          <div className="text-xs text-[#9AA6BA]">
            Showing <strong className="text-white">{filteredItems.length}</strong> items across designated supply depots
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="bg-[#0D162B] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-white/80">
              <thead className="bg-[#0A1022] text-[#9AA6BA] uppercase font-semibold text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Reserved</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{item.item_name}</td>
                    <td className="py-3 px-4 capitalize text-[#9AA6BA]">{item.category.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-bold text-white">{item.quantity_available} {item.unit}</td>
                    <td className="py-3 px-4 text-white/50">{item.quantity_reserved} {item.unit}</td>
                    <td className="py-3 px-4 text-white/40">{item.minimum_threshold} {item.unit}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'healthy' ? 'bg-[#55D6A7]/20 text-[#55D6A7] border border-[#55D6A7]/30' :
                        item.status === 'low' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedItemForAction(item);
                          setActionType('dispatch');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[#38bdf8]/40 bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 text-[#38bdf8] text-[11px] font-semibold cursor-pointer"
                      >
                        Dispatch
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItemForAction(item);
                          setActionType('replenish');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Transaction Modal */}
      {selectedItemForAction && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D162B] rounded-2xl border border-white/15 p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <h3 className="text-base font-bold text-white capitalize">
              {actionType} Inventory: {selectedItemForAction.item_name}
            </h3>
            <p className="text-xs text-[#9AA6BA]">
              Current stock: <strong className="text-white">{selectedItemForAction.quantity_available} {selectedItemForAction.unit}</strong>
            </p>

            <form onSubmit={handleTransaction} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Quantity ({selectedItemForAction.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={actionType === 'dispatch' ? selectedItemForAction.quantity_available : 5000}
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(Number(e.target.value))}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Reason / Mission Reference</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Field emergency medical dispatch"
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForAction(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white/70 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#020617] text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
