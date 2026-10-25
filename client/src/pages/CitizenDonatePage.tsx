// DisasterOS Citizen Relief & Support (ReliefChain Ledger)
// Auditable charitable donations with verified distribution reports and optional Web3 attestation.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { emergencySound } from '../services/emergencySound';
import { ReliefCampaign, DonationContribution, AidDistribution } from '../types';
import {
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Building,
  Coins,
  FileText,
  ExternalLink,
  Receipt,
  Users,
  Search,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  Sparkles,
  QrCode,
  Lock,
  Smartphone,
  Check
} from 'lucide-react';
import { openRazorpayPayment } from '../services/razorpay';

export const CitizenDonatePage: React.FC = () => {
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<ReliefCampaign[]>([]);
  const [contributions, setContributions] = useState<DonationContribution[]>([]);
  const [distributions, setDistributions] = useState<AidDistribution[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<ReliefCampaign | null>(null);
  const [selectedTab, setSelectedTab] = useState<'campaigns' | 'my_donations' | 'transparency'>('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Donation Modal state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [donateAmount, setDonateAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'bank_transfer' | 'web3_usdc'>('upi');
  const [donorName, setDonorName] = useState(user?.fullName || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentReceipt, setRecentReceipt] = useState<any>(null);
  const [paymentConfig, setPaymentConfig] = useState<{ key_id: string; is_configured: boolean } | null>(null);

  // Load live ledger data
  const loadData = async () => {
    try {
      const campRes = await api.getCampaigns();
      setCampaigns(campRes.campaigns);
      if (campRes.campaigns.length > 0 && !selectedCampaign) {
        setSelectedCampaign(campRes.campaigns[0]);
      }

      const contribRes = await api.getContributions();
      setContributions(contribRes.contributions);

      const distRes = await api.getAidDistributions();
      setDistributions(distRes.distributions);

      const configRes = await api.getPaymentConfig();
      setPaymentConfig(configRes);
    } catch (err) {
      console.warn('[DonatePage] Error fetching ledger:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDonate = (campaign: ReliefCampaign) => {
    setSelectedCampaign(campaign);
    setShowDonateModal(true);
    setRecentReceipt(null);
    setDonateAmount(currency === 'INR' ? 500 : 50);
  };

  const handleCurrencyChange = (newCur: 'INR' | 'USD') => {
    setCurrency(newCur);
    setDonateAmount(newCur === 'INR' ? 500 : 50);
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || donateAmount <= 0) return;

    setIsSubmitting(true);

    // 1. Razorpay Payment Gateway Flow (for UPI & Card)
    if (paymentMethod === 'upi' || paymentMethod === 'card') {
      try {
        const order = await api.createPaymentOrder({
          amount: Number(donateAmount),
          currency,
          campaign_id: selectedCampaign.id,
          donor_name: isAnonymous ? "Anonymous Donor" : (donorName || "Civilian Donor"),
          donor_email: donorEmail || user?.email || "supporter@community.local"
        });

        await openRazorpayPayment({
          keyId: order.key_id,
          orderId: order.order_id,
          amount: order.amount,
          currency: order.currency,
          campaignTitle: selectedCampaign.title,
          donorName: isAnonymous ? "Anonymous Donor" : (donorName || "Civilian Donor"),
          donorEmail: donorEmail || user?.email || "supporter@community.local",
          isMock: order.is_mock,
          onSuccess: async (rzpRes) => {
            try {
              const verified = await api.verifyAndRecordPayment({
                razorpay_order_id: rzpRes.razorpay_order_id,
                razorpay_payment_id: rzpRes.razorpay_payment_id,
                razorpay_signature: rzpRes.razorpay_signature,
                campaign_id: selectedCampaign.id,
                amount: Number(donateAmount),
                currency,
                donor_name: isAnonymous ? "Anonymous Donor" : (donorName || "Civilian Donor"),
                donor_email: donorEmail || user?.email || "supporter@community.local",
                is_anonymous: isAnonymous,
                message,
                payment_method: paymentMethod
              });

              emergencySound.playStatusChime();
              setRecentReceipt(verified);
              loadData();
            } catch (err: any) {
              alert(`Payment verification failed: ${err.message}`);
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: (err: any) => {
            alert(`Payment could not be processed: ${err?.description || err?.message || 'Cancelled'}`);
            setIsSubmitting(false);
          },
          onDismiss: () => {
            setIsSubmitting(false);
          }
        });
      } catch (err: any) {
        alert(`Failed to initialize payment gateway: ${err.message}`);
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Direct Wire & Web3 USDC Fallback Flow
    try {
      const res = await api.submitDonation({
        campaign_id: selectedCampaign.id,
        amount: Number(donateAmount),
        payment_method: paymentMethod,
        donor_name: isAnonymous ? "Anonymous Donor" : (donorName || "Civilian Donor"),
        donor_email: donorEmail || user?.email || "donor@example.com",
        is_anonymous: isAnonymous,
        message
      });

      emergencySound.playStatusChime();
      setRecentReceipt(res);
      loadData();
    } catch (err: any) {
      alert(`Donation processing failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.beneficiary_community.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const myContributions = contributions.filter(c => 
    c.donor_email === (user?.email || 'citizen@example.com') ||
    c.donor_name === user?.fullName
  );

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-20 pt-16 sm:pt-20 selection:bg-[#38bdf8] selection:text-[#05070d]">
      
      {/* 1. Header Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-8 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                COMMUNITY RELIEF & AUDITABLE CHARITY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                VERIFIED LEDGER
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Donate & Support Rapid Recovery
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
              Every dollar contributed connects directly to emergency drinking water, trauma medicine, and emergency shelter. 
              Track financial allocations and field delivery attestations with 100% transparency.
            </p>
          </div>

          {/* Quick Ledger Stats */}
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-right">
              <div className="text-[10px] font-mono text-white/50 uppercase">Verified Raised</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                ${campaigns.reduce((acc, c) => acc + c.raised_amount, 0).toLocaleString()}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-right">
              <div className="text-[10px] font-mono text-white/50 uppercase">Aid Delivered</div>
              <div className="text-xl font-bold font-mono text-[#38bdf8]">
                {distributions.reduce((acc, d) => acc + d.recipient_count, 0)} Recipients
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-2 border-b border-white/10">
          <button
            onClick={() => setSelectedTab('campaigns')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              selectedTab === 'campaigns'
                ? 'text-[#38bdf8] border-[#38bdf8]'
                : 'text-white/60 border-transparent hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Active Relief Campaigns ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setSelectedTab('my_donations')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              selectedTab === 'my_donations'
                ? 'text-[#38bdf8] border-[#38bdf8]'
                : 'text-white/60 border-transparent hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>My Contribution History ({myContributions.length})</span>
          </button>

          <button
            onClick={() => setSelectedTab('transparency')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              selectedTab === 'transparency'
                ? 'text-[#38bdf8] border-[#38bdf8]'
                : 'text-white/60 border-transparent hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Delivery Reports & Proof ({distributions.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full mt-8">
        
        {/* TAB 1: ACTIVE CAMPAIGNS */}
        {selectedTab === 'campaigns' && (
          <div className="space-y-6">
            
            {/* Search and Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns by location, item, or community..."
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {['all', 'flood_relief', 'medical_aid', 'shelter_rebuild'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors shrink-0 cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-[#38bdf8] text-[#05070d]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((camp) => {
                const progressPct = Math.min(100, Math.round((camp.raised_amount / camp.target_amount) * 100));
                return (
                  <div
                    key={camp.id}
                    className="flex flex-col rounded-3xl bg-[#0A1022] border border-white/10 hover:border-[#38bdf8]/40 transition-all shadow-xl overflow-hidden group"
                  >
                    {/* Card Top Pill Bar */}
                    <div className="p-5 border-b border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-wider text-white/70">
                          {camp.category.replace('_', ' ')}
                        </span>
                        {camp.urgent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            URGENT
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-[#38bdf8] transition-colors leading-snug">
                        {camp.title}
                      </h3>
                      <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                        {camp.description}
                      </p>
                    </div>

                    {/* Progress & Target Section */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between text-xs">
                          <div>
                            <span className="text-lg font-extrabold font-mono text-white">
                              ${camp.raised_amount.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-white/50 ml-1">
                              raised of ${camp.target_amount.toLocaleString()}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-[#38bdf8]">{progressPct}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Intended Use & Organizer */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-[11px]">
                        <div className="text-white/40 uppercase tracking-wider font-mono text-[9.5px]">Intended Resource Delivery</div>
                        <div className="text-white/80 line-clamp-2">{camp.intended_use}</div>
                        <div className="pt-1 flex items-center justify-between text-white/50 text-[10px] border-t border-white/5 mt-1">
                          <span>Organizer: {camp.organizer_name}</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        </div>
                      </div>

                      {/* Donate CTA */}
                      <button
                        onClick={() => handleOpenDonate(camp)}
                        className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        <span>Support This Relief Fund</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MY DONATIONS */}
        {selectedTab === 'my_donations' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10">
              <h3 className="text-base font-bold text-white mb-1">Your Life-Saving Contributions</h3>
              <p className="text-xs text-white/60 mb-6">
                All donations are recorded on an immutable ledger with unique receipt hashes.
              </p>

              {myContributions.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <HeartHandshake className="w-12 h-12 text-white/20 mx-auto" />
                  <div className="text-sm font-semibold text-white/70">No contributions logged yet</div>
                  <p className="text-xs text-white/40 max-w-md mx-auto">
                    When you donate to verified relief campaigns, your receipts, tax records, and distribution tracking will appear here.
                  </p>
                  <button
                    onClick={() => setSelectedTab('campaigns')}
                    className="pill-button-primary text-xs py-2 px-4 font-bold"
                  >
                    Browse Active Campaigns
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/10 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-white/40 font-mono uppercase text-[10px] pb-3">
                        <th className="pb-3">Receipt Code</th>
                        <th className="pb-3">Campaign</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Payment Method</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {myContributions.map((c) => (
                        <tr key={c.id} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 font-mono text-[#38bdf8] font-bold">{c.receipt_number}</td>
                          <td className="py-3.5 text-white/80 font-medium">
                            {campaigns.find(camp => camp.id === c.campaign_id)?.title || c.campaign_id}
                          </td>
                          <td className="py-3.5 font-mono font-bold text-white">${c.amount.toLocaleString()} {c.currency}</td>
                          <td className="py-3.5 capitalize text-white/60 font-mono">{c.payment_method.replace('_', ' ')}</td>
                          <td className="py-3.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-white/40">{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSPARENCY & FIELD DELIVERY ATTESTATIONS */}
        {selectedTab === 'transparency' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Verified Aid Delivery Telemetry</h3>
                <p className="text-xs text-white/60">
                  Every disbursement must be accompanied by an on-scene distribution receipt signed by authorized responders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {distributions.map((dist) => (
                  <div
                    key={dist.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                        <PackageCheck className="w-3 h-3" />
                        DELIVERED
                      </span>
                      <span className="text-[11px] text-white/40 font-mono">
                        {new Date(dist.distributed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">{dist.item_or_service}</div>
                      <div className="text-xs text-[#38bdf8] font-mono">
                        Quantity: {dist.quantity} · Reached {dist.recipient_count} Individuals
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] space-y-1">
                      <div className="text-white/50">Delivery Location: <span className="text-white">{dist.location}</span></div>
                      <div className="text-white/50">Verified By: <span className="text-emerald-400">{dist.verified_by}</span></div>
                      {dist.beneficiary_feedback && (
                        <div className="text-white/70 italic pt-1 border-t border-white/5">"{dist.beneficiary_feedback}"</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. DONATE MODAL */}
      {showDonateModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A1022] border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold">
                  DIRECT RELIEF CONTRIBUTION
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedCampaign.title}
                </h3>
              </div>
              <button
                onClick={() => setShowDonateModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {recentReceipt ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Payment Confirmed & Verified!</h4>
                <p className="text-xs text-white/70">
                  Thank you! Your donation was successfully processed via Razorpay and recorded on the ReliefChain ledger.
                </p>
                <div className="p-3.5 rounded-xl bg-black/40 text-left space-y-1.5 font-mono text-[11px] border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white/60">Receipt ID:</span>
                    <span className="text-emerald-400 font-bold">{recentReceipt.receipt_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Amount Paid:</span>
                    <span className="text-white font-bold">{currency === 'INR' ? '₹' : '$'}{recentReceipt.contribution?.amount || donateAmount} {currency}</span>
                  </div>
                  {recentReceipt.payment_id && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Razorpay ID:</span>
                      <span className="text-[#38bdf8] font-bold truncate max-w-[180px]">{recentReceipt.payment_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/60">Gateway Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> SUCCESS (PAID)
                    </span>
                  </div>
                  <div className="pt-1 text-[10px] text-white/40 truncate">
                    Attestation: {recentReceipt.tx_hash}
                  </div>
                </div>
                <button
                  onClick={() => setShowDonateModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close & View Ledger Records
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitDonation} className="space-y-4">
                
                {/* Currency & Amount Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/80">Select Donation Amount</label>
                    <div className="inline-flex rounded-lg bg-white/10 p-0.5 border border-white/10 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => handleCurrencyChange('INR')}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          currency === 'INR' ? 'bg-[#38bdf8] text-[#05070d]' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        ₹ INR (UPI / Cards)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCurrencyChange('USD')}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          currency === 'USD' ? 'bg-[#38bdf8] text-[#05070d]' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        $ USD
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {(currency === 'INR' ? [250, 500, 1000, 2500] : [25, 50, 100, 250]).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonateAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                          donateAmount === amt
                            ? 'bg-[#38bdf8] text-[#05070d]'
                            : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {currency === 'INR' ? `₹${amt}` : `$${amt}`}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-2">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-white/40 text-sm">
                      {currency === 'INR' ? '₹' : '$'}
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={donateAmount}
                      onChange={(e) => setDonateAmount(Number(e.target.value))}
                      placeholder={`Custom ${currency} amount`}
                      className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] focus:outline-none rounded-xl pl-8 pr-4 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Payment Gateway Method Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/80">Payment Method</label>
                    <span className="text-[10px] font-mono text-sky-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Razorpay Secured
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl flex items-start gap-2 border transition-colors cursor-pointer text-left ${
                        paymentMethod === 'upi'
                          ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8] font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <QrCode className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div>UPI / QR Instant</div>
                        <div className="text-[10px] opacity-70 font-normal">GPay, PhonePe, Paytm</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl flex items-start gap-2 border transition-colors cursor-pointer text-left ${
                        paymentMethod === 'card'
                          ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8] font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div>Cards & NetBanking</div>
                        <div className="text-[10px] opacity-70 font-normal">Visa, RuPay, MC, Banks</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-2.5 rounded-xl flex items-start gap-2 border transition-colors cursor-pointer text-left ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8] font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Building className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div>Bank Wire / NEFT</div>
                        <div className="text-[10px] opacity-70 font-normal">Direct Institution Wire</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('web3_usdc')}
                      className={`p-2.5 rounded-xl flex items-start gap-2 border transition-colors cursor-pointer text-left ${
                        paymentMethod === 'web3_usdc'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <div>ReliefChain (USDC)</div>
                        <div className="text-[10px] opacity-70 font-normal">Web3 Ledger Hash</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Gateway Trust Pill */}
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-[10px] text-white/70 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-Bit SSL Encrypted via Razorpay</span>
                  </div>
                  <span className="text-[#38bdf8] font-bold">100% RELIEF DIRECT</span>
                </div>

                {/* Donor Details */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/80">Donor Details</label>
                    <label className="flex items-center gap-1.5 text-[11px] text-white/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded"
                      />
                      <span>Make donation anonymous</span>
                    </label>
                  </div>

                  {!isAnonymous && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Full Name"
                        className="bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="Email for Tax Receipt"
                        className="bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Encouragement message (optional)"
                    className="w-full bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || donateAmount <= 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-sky-950/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? 'Processing Secure Checkout...' 
                      : `Proceed with ${currency === 'INR' ? '₹' : '$'}${donateAmount} ${paymentMethod === 'upi' || paymentMethod === 'card' ? 'via Razorpay' : 'Donation'}`}
                  </span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
