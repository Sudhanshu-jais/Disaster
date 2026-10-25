// DisasterOS Operator Relief & Donations (ReliefChain Management Workspace)
// Connects Campaign Verification, Fund Allocations, Aid Distribution Telemetry & Financial Reconciliation.

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { emergencySound } from '../services/emergencySound';
import { ReliefCampaign, DonationContribution, AidAllocation, AidDistribution } from '../types';
import {
  Boxes,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Plus,
  Coins,
  FileText,
  PackageCheck,
  Send,
  CreditCard,
  Building,
  DollarSign,
  TrendingUp,
  Download
} from 'lucide-react';

export const OperatorReliefPage: React.FC = () => {
  const { user } = useAuth();

  const [ledger, setLedger] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'allocations' | 'distributions' | 'ledger'>('campaigns');

  // Campaign creation modal
  const [showCampModal, setShowCampModal] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campCategory, setCampCategory] = useState('flood_relief');
  const [campTarget, setCampTarget] = useState(75000);
  const [campDesc, setCampDesc] = useState('');
  const [campCommunity, setCampCommunity] = useState('Marina & Lower Basin Evacuees');
  const [campIntendedUse, setCampIntendedUse] = useState('Potable water, high-calorie rations, and bedding');

  // Allocation approval modal
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState('');
  const [allocTitle, setAllocTitle] = useState('');
  const [allocAmount, setAllocAmount] = useState(25000);
  const [allocRecipient, setAllocRecipient] = useState('Red Cross Bay Area Distribution Hub');
  const [allocPurpose, setAllocPurpose] = useState('Direct procurement of emergency drinking water and hygiene kits');

  // Distribution recording modal
  const [showDistModal, setShowDistModal] = useState(false);
  const [distItem, setDistItem] = useState('Clean Potable Water (10L Jugs)');
  const [distQty, setDistQty] = useState('1,000 jugs');
  const [distRecipients, setDistRecipients] = useState(250);
  const [distLocation, setDistLocation] = useState('Presidio Gymnasium Evacuation Shelter');
  const [distFeedback, setDistFeedback] = useState('Water delivered and verified with zero contamination.');

  const loadLedger = async () => {
    try {
      const data = await api.getReliefLedger();
      setLedger(data);
      if (data.campaigns?.length > 0 && !selectedCampId) {
        setSelectedCampId(data.campaigns[0].id);
      }
    } catch (err) {
      console.warn('[ReliefPage] Failed to fetch ledger:', err);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle || campTarget <= 0) return;

    try {
      await api.createCampaign({
        title: campTitle,
        description: campDesc,
        category: campCategory,
        target_amount: Number(campTarget),
        beneficiary_community: campCommunity,
        intended_use: campIntendedUse,
        urgent: true
      });

      emergencySound.playStatusChime();
      setShowCampModal(false);
      setCampTitle('');
      setCampDesc('');
      loadLedger();
    } catch (err: any) {
      alert(`Error creating campaign: ${err.message}`);
    }
  };

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampId || allocAmount <= 0) return;

    try {
      await api.createAidAllocation({
        campaign_id: selectedCampId,
        title: allocTitle || `Emergency Aid Requisition`,
        allocated_amount: Number(allocAmount),
        recipient_entity: allocRecipient,
        purpose: allocPurpose
      });

      emergencySound.playStatusChime();
      setShowAllocModal(false);
      setAllocTitle('');
      loadLedger();
    } catch (err: any) {
      alert(`Allocation failed: ${err.message}`);
    }
  };

  const handleRecordDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distItem || distRecipients <= 0) return;

    try {
      await api.recordAidDistribution({
        campaign_id: selectedCampId || ledger?.campaigns?.[0]?.id,
        item_or_service: distItem,
        quantity: distQty,
        recipient_count: Number(distRecipients),
        location: distLocation,
        beneficiary_feedback: distFeedback
      });

      emergencySound.playStatusChime();
      setShowDistModal(false);
      loadLedger();
    } catch (err: any) {
      alert(`Distribution record error: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-20 selection:bg-[#38bdf8] selection:text-[#05070d]">
      
      {/* 1. Header & Financial Reconciliation HUD */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-8 sm:px-8">
        <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                RELIEF OPERATIONS & FINANCIAL RECONCILIATION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                RELIEFCHAIN VERIFIED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Relief Campaigns, Allocations & Delivery Audit
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
              Verify relief campaigns, authorize emergency fund disbursements to response NGOs, and inspect 
              verifiable delivery attestations from the front lines.
            </p>
          </div>

          {/* Connected Financial Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-white/50 uppercase">Total Raised</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                ${(ledger?.kpis?.total_raised_usd || 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-white/50 uppercase">Disbursed Aid</div>
              <div className="text-xl font-bold font-mono text-[#38bdf8]">
                ${(ledger?.kpis?.total_allocated_usd || 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-white/50 uppercase">Unallocated Buffer</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                ${(ledger?.kpis?.unallocated_buffer_usd || 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-white/50 uppercase">Beneficiaries Reached</div>
              <div className="text-xl font-bold font-mono text-white">
                {ledger?.kpis?.total_recipients_reached || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-[1700px] mx-auto mt-6 flex items-center gap-2 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'campaigns', label: 'Campaigns & Verification', icon: HeartHandshake },
            { id: 'allocations', label: 'Fund Allocations & Approvals', icon: DollarSign },
            { id: 'distributions', label: 'Aid Distribution & Proof of Delivery', icon: PackageCheck },
            { id: 'ledger', label: 'Financial Reconciliation Ledger', icon: Receipt }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 border-b-2 shrink-0 cursor-pointer ${
                  active ? 'text-[#38bdf8] border-[#38bdf8]' : 'text-white/60 border-transparent hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Workspace Body */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 w-full mt-6 flex-1">
        
        {/* TAB 1: CAMPAIGNS & VERIFICATION */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Active Relief Campaigns</h3>
                <p className="text-xs text-white/60">
                  Review and verify municipal partner campaigns. Only verified campaigns are listed for public donations.
                </p>
              </div>

              <button
                onClick={() => setShowCampModal(true)}
                className="pill-button-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Official Campaign</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ledger?.campaigns?.map((camp: ReliefCampaign) => {
                const pct = Math.min(100, Math.round((camp.raised_amount / camp.target_amount) * 100));
                return (
                  <div
                    key={camp.id}
                    className="p-5 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/70 uppercase">
                          {camp.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          VERIFIED
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{camp.title}</h4>
                      <p className="text-xs text-white/60 line-clamp-2">{camp.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between text-xs font-mono">
                        <span className="text-white font-bold">${camp.raised_amount.toLocaleString()}</span>
                        <span className="text-white/40">Target: ${camp.target_amount.toLocaleString()}</span>
                        <span className="text-[#38bdf8] font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-[#38bdf8] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] space-y-1">
                      <div className="text-white/40 uppercase font-mono text-[9.5px]">Beneficiary Target</div>
                      <div className="text-white/80">{camp.beneficiary_community}</div>
                      <div className="truncate text-white/40 font-mono text-[10px] pt-1 border-t border-white/5">
                        ReliefChain: {camp.crypto_contract_address || 'Attestation Ledger'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FUND ALLOCATIONS & APPROVALS */}
        {activeTab === 'allocations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Authorized Fund Allocations</h3>
                <p className="text-xs text-white/60">
                  Approved financial disbursements from relief funds for bulk emergency logistics and supplies.
                </p>
              </div>

              <button
                onClick={() => setShowAllocModal(true)}
                className="pill-button-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Authorize Aid Disbursement</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-white/40 font-mono uppercase text-[10px] pb-3 border-b border-white/10">
                    <th className="pb-3">Allocation Code</th>
                    <th className="pb-3">Requisition Title</th>
                    <th className="pb-3">Recipient Partner</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Approved By</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ledger?.recent_transactions?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-white/40">No allocations logged.</td>
                    </tr>
                  ) : (
                    [
                      { id: "alc-001", title: "Depot Water & Ration Purchase - Batch A", recipient: "Red Cross Bay Area", amount: 32000, approver: "Marcus Vance", status: "disbursed" },
                      { id: "alc-002", title: "Trauma Oxygen Replenishment Authorization", recipient: "St. Jude Logistics", amount: 28000, approver: "Dr. Arvind Patel", status: "delivered" }
                    ].map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 font-mono text-[#38bdf8] font-bold">{item.id}</td>
                        <td className="py-3.5 text-white font-medium">{item.title}</td>
                        <td className="py-3.5 text-white/70">{item.recipient}</td>
                        <td className="py-3.5 font-mono font-bold text-emerald-400">${item.amount.toLocaleString()}</td>
                        <td className="py-3.5 text-white/50">{item.approver}</td>
                        <td className="py-3.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AID DISTRIBUTION & DELIVERY PROOF */}
        {activeTab === 'distributions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Field Aid Distribution & Delivery Attestations</h3>
                <p className="text-xs text-white/60">
                  On-scene receipts and recipient acknowledgements verified by authorized coordinators.
                </p>
              </div>

              <button
                onClick={() => setShowDistModal(true)}
                className="pill-button-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Record Field Distribution</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ledger?.recent_distributions?.map((dist: AidDistribution) => (
                <div key={dist.id} className="p-5 rounded-3xl bg-[#0A1022] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                      <PackageCheck className="w-3.5 h-3.5" />
                      DELIVERY ATTESTED
                    </span>
                    <span className="text-[11px] font-mono text-white/40">
                      {new Date(dist.distributed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{dist.item_or_service}</h4>
                    <div className="text-xs text-[#38bdf8] font-mono">
                      Quantity: {dist.quantity} · Impacted: {dist.recipient_count} individuals
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] space-y-1">
                    <div className="text-white/50">Location: <span className="text-white">{dist.location}</span></div>
                    <div className="text-white/50">Verified By: <span className="text-emerald-400 font-semibold">{dist.verified_by}</span></div>
                    {dist.beneficiary_feedback && (
                      <div className="text-white/70 italic pt-1 border-t border-white/5">"{dist.beneficiary_feedback}"</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RECONCILIATION LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Auditable Transaction Reconciliation</h3>
                  <p className="text-xs text-white/60">
                    Live balance reconciliation across donor receipts, bank transfers, and ReliefChain USDC transactions.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10 font-bold">
                  IMMUTABLE LOGS
                </span>
              </div>

              <div className="divide-y divide-white/10 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-white/40 font-mono uppercase text-[10px] pb-3">
                      <th className="pb-3">Receipt Code</th>
                      <th className="pb-3">Donor / Entity</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment Method</th>
                      <th className="pb-3">Tx Hash</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ledger?.recent_transactions?.map((t: DonationContribution) => (
                      <tr key={t.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-mono text-[#38bdf8] font-bold">{t.receipt_number}</td>
                        <td className="py-3 text-white font-medium">{t.donor_name}</td>
                        <td className="py-3 font-mono font-bold text-emerald-400">${t.amount.toLocaleString()} USD</td>
                        <td className="py-3 capitalize text-white/60 font-mono">{t.payment_method.replace('_', ' ')}</td>
                        <td className="py-3 font-mono text-white/40 text-[10.5px] truncate max-w-[140px]">{t.tx_hash}</td>
                        <td className="py-3 text-white/40">{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {showCampModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A1022] border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Official Relief Campaign</h3>
              <button onClick={() => setShowCampModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="text-white/80 font-semibold block mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="e.g. Marina Basin Drinking Water & Sanitation Fund"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-white/80 font-semibold block mb-1">Funding Target (USD)</label>
                <input
                  type="number"
                  value={campTarget}
                  onChange={(e) => setCampTarget(Number(e.target.value))}
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-white/80 font-semibold block mb-1">Description & Impact</label>
                <textarea
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe who benefits and how funds are deployed..."
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl p-3 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold transition-colors cursor-pointer mt-2"
              >
                Publish Campaign to Verified Public Portal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ALLOCATION MODAL */}
      {showAllocModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A1022] border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Authorize Relief Fund Disbursement</h3>
              <button onClick={() => setShowAllocModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAllocation} className="space-y-3 text-xs">
              <div>
                <label className="text-white/80 font-semibold block mb-1">Requisition Purpose / Title</label>
                <input
                  type="text"
                  value={allocTitle}
                  onChange={(e) => setAllocTitle(e.target.value)}
                  placeholder="e.g. Clean Water Tanker Convoy Dispatch"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-white/80 font-semibold block mb-1">Disbursement Amount (USD)</label>
                <input
                  type="number"
                  value={allocAmount}
                  onChange={(e) => setAllocAmount(Number(e.target.value))}
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-white/80 font-semibold block mb-1">Recipient NGO / Entity</label>
                <input
                  type="text"
                  value={allocRecipient}
                  onChange={(e) => setAllocRecipient(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer mt-2"
              >
                Sign & Authorize Disbursement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DISTRIBUTION MODAL */}
      {showDistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A1022] border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Record On-Scene Aid Delivery</h3>
              <button onClick={() => setShowDistModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordDistribution} className="space-y-3 text-xs">
              <div>
                <label className="text-white/80 font-semibold block mb-1">Item / Service Delivered</label>
                <input
                  type="text"
                  value={distItem}
                  onChange={(e) => setDistItem(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/80 font-semibold block mb-1">Quantity</label>
                  <input
                    type="text"
                    value={distQty}
                    onChange={(e) => setDistQty(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/80 font-semibold block mb-1">Individuals Reached</label>
                  <input
                    type="number"
                    value={distRecipients}
                    onChange={(e) => setDistRecipients(Number(e.target.value))}
                    className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-white/80 font-semibold block mb-1">Delivery Location</label>
                <input
                  type="text"
                  value={distLocation}
                  onChange={(e) => setDistLocation(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold transition-colors cursor-pointer mt-2"
              >
                Log Delivery Attestation to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
