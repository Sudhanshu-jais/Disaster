// DisasterOS Citizen Profile & Settings
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDisaster } from '../context/DisasterContext';
import { api } from '../services/api';
import { 
  User, 
  Users,
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Bell, 
  Lock, 
  LogOut, 
  FileText, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const CitizenProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { incidents } = useDisaster();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [region, setRegion] = useState(user?.region || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [evacNotifs, setEvacNotifs] = useState(true);
  const [weatherWarnings, setWeatherWarnings] = useState(true);

  // My incidents
  const myIncidents = incidents.filter(i => 
    i.tracking_code.includes('SOS') || i.affected_count < 10
  );

  // Emergency Contacts state
  const [contacts, setContacts] = useState<any[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Family');

  React.useEffect(() => {
    api.getEmergencyContacts().then((res: any) => setContacts(res.contacts || [])).catch(() => {});
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    const updated = [
      ...contacts,
      {
        id: `ec-${Date.now()}`,
        name: newContactName,
        phone: newContactPhone,
        relationship: newContactRel,
        notify_sms: true,
        notify_email: true,
        share_live_location: true
      }
    ];
    setContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
    await api.updateEmergencyContacts(updated).catch(() => {});
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRemoveContact = async (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    await api.updateEmergencyContacts(updated).catch(() => {});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      phone,
      region
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 bg-[#05070d] text-white flex flex-col pb-16 selection:bg-[#38bdf8] selection:text-[#020617]">
      
      {/* Top Banner */}
      <div className="bg-[#0A1022] border-b border-white/[0.08] px-4 py-5 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                CIVILIAN PROFILE & EMERGENCY PREFERENCES
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              My Citizen Account
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="pill-button-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-[#FF5D67] hover:text-[#ff434e] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 w-full mt-8 space-y-8">
        
        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#55D6A7]/15 border border-[#55D6A7]/40 flex items-center gap-2 text-xs text-[#55D6A7] animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile and emergency contact preferences updated successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Account Details Form */}
          <div className="md:col-span-2 terra-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{user?.fullName || 'Resident'}</h3>
                  <span className="text-xs font-mono text-[#38bdf8]">{user?.email}</span>
                </div>
              </div>
              <span className="text-[10.5px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/15">
                CIVILIAN ROLE
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Emergency Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Geographic District</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-[#05070d] border border-white/15 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Preferences & Privacy */}
          <div className="space-y-6">
            <div className="terra-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Bell className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-sm font-bold text-white">Emergency Directives</h3>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>SMS Evacuation Alerts</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#38bdf8] rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>Evacuation Order Push Directives</span>
                  <input
                    type="checkbox"
                    checked={evacNotifs}
                    onChange={(e) => setEvacNotifs(e.target.checked)}
                    className="w-4 h-4 accent-[#38bdf8] rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>Severe Atmospheric River Warnings</span>
                  <input
                    type="checkbox"
                    checked={weatherWarnings}
                    onChange={(e) => setWeatherWarnings(e.target.checked)}
                    className="w-4 h-4 accent-[#38bdf8] rounded"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 space-y-2 text-xs text-[#7dd3fc]">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                <span>Civilian Data Governance</span>
              </div>
              <p className="leading-relaxed text-[11px] text-white/70">
                Your geolocation and submitted SOS telemetry are shared only with verified emergency first responders and rescue coordinators.
              </p>
            </div>
          </div>
        </div>

        {/* Trusted Emergency Contacts Manager */}
        <div className="p-6 rounded-3xl bg-[#0A1022] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#38bdf8]" />
                <span>Trusted Emergency Contacts ({contacts.length})</span>
              </h3>
              <p className="text-xs text-white/60">
                These contacts receive temporary expiring tracking links and status updates when you activate SOS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map((c) => (
              <div key={c.id || c.name} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{c.name} ({c.relationship})</div>
                  <div className="text-[11px] font-mono text-white/50">{c.phone}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Live Location Sharing: Enabled</div>
                </div>
                <button
                  onClick={() => handleRemoveContact(c.id)}
                  className="text-white/40 hover:text-rose-400 text-xs p-1"
                  title="Remove contact"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddContact} className="pt-2 flex flex-col sm:flex-row items-center gap-2 text-xs">
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Contact Name"
              className="flex-1 bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-white"
            />
            <input
              type="tel"
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              placeholder="Phone Number"
              className="flex-1 bg-white/[0.06] border border-white/15 focus:border-[#38bdf8] rounded-xl px-3 py-2 text-white"
            />
            <select
              value={newContactRel}
              onChange={(e) => setNewContactRel(e.target.value)}
              className="bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-white"
            >
              <option value="Family">Family</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Neighbor">Neighbor</option>
              <option value="Doctor">Doctor</option>
            </select>
            <button
              type="submit"
              className="pill-button-primary text-xs py-2 px-4 font-bold shrink-0 cursor-pointer"
            >
              + Add Contact
            </button>
          </form>
        </div>

        {/* My SOS Reports History */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              My Submitted SOS Incident History ({myIncidents.length})
            </h3>
            <Link to="/citizen/sos" className="text-xs text-[#38bdf8] hover:underline font-semibold">
              + File New SOS Report
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myIncidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => navigate(`/citizen/track/${inc.tracking_code}`)}
                className="p-4 rounded-2xl bg-[#0D162B] border border-white/10 hover:border-[#38bdf8]/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#38bdf8]">
                      #{inc.tracking_code}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#38bdf8] transition-colors">
                    {inc.title}
                  </h4>
                  <span className="text-[11px] text-white/50">{inc.address}</span>
                </div>

                <span className="pill-button-secondary text-xs py-1 px-3 group-hover:bg-[#38bdf8] group-hover:text-[#020617] group-hover:border-[#38bdf8] transition-colors">
                  Track &rarr;
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
