import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeaderBand } from '../components/layout/HeaderBand';
import { api } from '../services/api';
import { HeartHandshake, UserPlus, CheckCircle2, PlusCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NgoVolunteersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ngos, setNgos] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['first_aid']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isNgoOrVolunteer = user?.role === 'ngo' || user?.role === 'volunteer';

  const fetchData = async () => {
    try {
      const [ngoRes, volRes] = await Promise.all([api.getNgos(), api.getVolunteers()]);
      setNgos(ngoRes.ngos || []);
      setVolunteers(volRes.volunteers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnrollVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setIsSubmitting(true);
    try {
      await api.registerVolunteer({
        full_name: fullName,
        phone,
        skills: selectedSkills,
        assigned_ngo_id: ngos[0]?.id
      });
      setNotice(`Volunteer "${fullName}" registered and added to active humanitarian registry!`);
      setEnrollModalOpen(false);
      setFullName('');
      setPhone('');
      await fetchData();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTask = async (volunteerId: string, currentTask: string | null) => {
    const newTask = currentTask ? null : 'Distribute Emergency Rations & Water at Marina Shelter';
    try {
      await api.assignVolunteerTask(volunteerId, newTask);
      await fetchData();
    } catch (err: any) {
      alert(`Task assignment failed: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 bg-[#050817] text-[#F5F7FB] flex flex-col pb-16">
      <HeaderBand
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Community' },
          { label: 'NGOs & Volunteers' }
        ]}
        title="NGO Humanitarian Network & Volunteer Task Matching"
        description="Coordinates accredited non-governmental disaster relief agencies, certified volunteer skills, and humanitarian distributions."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">

        {/* ROLE WORKSPACE: NGO / VOLUNTEER OPERATOR */}
        {isNgoOrVolunteer && (
          <div className="bg-[#0D162B] border border-purple-500/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/40">
                    Civilian Relief Operations
                  </span>
                  <span className="text-xs font-bold text-purple-300">Red Cross & Community Responders</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-purple-400" />
                  Humanitarian Coordination Desk
                </h2>
                <p className="text-xs text-[#9AA6BA]">
                  {volunteers.length} registered specialists · {volunteers.filter(v => v.availability_status === 'available').length} ready for immediate shelter & aid deployment
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnrollModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register Specialist Volunteer
                </button>
                <button
                  onClick={() => navigate('/operator/shelters')}
                  className="px-3.5 py-2 rounded-xl bg-[#0A1022] border border-purple-500/40 hover:bg-purple-500/20 text-purple-300 text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  View Shelters
                </button>
              </div>
            </div>

            {notice && (
              <div className="p-2.5 rounded-xl bg-[#55D6A7]/15 border border-[#55D6A7]/30 text-xs font-bold text-[#55D6A7] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#55D6A7]" />
                <span>{notice}</span>
              </div>
            )}
          </div>
        )}

        {/* NGOs Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Verified Humanitarian Aid Agencies ({ngos.length})
            </h3>
            <span className="text-xs text-[#55D6A7]">Accredited Relief Partners</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ngos.map(ngo => (
              <div key={ngo.id} className="bg-[#0D162B] border border-white/10 rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-white">{ngo.name}</h4>
                  <span className="text-[10px] font-bold text-[#55D6A7] bg-[#55D6A7]/20 px-2 py-0.5 rounded-full border border-[#55D6A7]/30">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-[#9AA6BA]">Contact: {ngo.contact_person} ({ngo.phone})</p>
                <div className="flex flex-wrap gap-1">
                  {ngo.specialties?.map((s: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-md font-medium border border-white/5">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/10 text-xs text-purple-400 font-semibold flex items-center justify-between">
                  <span>{ngo.available_units} Field Aid Units Ready</span>
                  <button
                    onClick={() => {
                      setNotice(`Aid coordination channel linked with ${ngo.name}!`);
                      setTimeout(() => setNotice(null), 3000);
                    }}
                    className="text-[11px] text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    Coordinate Aid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteers Section */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Registered Specialist Volunteers ({volunteers.length})
            </h3>
            <button
              onClick={() => setEnrollModalOpen(true)}
              className="text-xs text-[#38bdf8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Enroll Volunteer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {volunteers.map(vol => (
              <div key={vol.id} className="bg-[#0D162B] border border-white/10 rounded-2xl p-4 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{vol.full_name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    vol.availability_status === 'available' ? 'bg-[#55D6A7]/20 text-[#55D6A7] border border-[#55D6A7]/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {vol.availability_status}
                  </span>
                </div>
                <p className="text-[11px] text-[#9AA6BA]">Phone: {vol.phone}</p>
                <div className="flex flex-wrap gap-1">
                  {vol.skills?.map((sk: string, i: number) => (
                    <span key={i} className="text-[10px] bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 px-1.5 py-0.5 rounded font-medium">
                      {sk.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                {vol.assigned_task ? (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-white/80 truncate max-w-[150px] font-medium" title={vol.assigned_task}>
                      {vol.assigned_task}
                    </span>
                    <button
                      onClick={() => handleAssignTask(vol.id, vol.assigned_task)}
                      className="text-[#55D6A7] font-bold hover:underline shrink-0 cursor-pointer"
                    >
                      Complete
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-white/40 italic">No task assigned</span>
                    <button
                      onClick={() => handleAssignTask(vol.id, null)}
                      className="text-purple-400 font-bold hover:underline cursor-pointer"
                    >
                      Assign Task
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Enroll Volunteer Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D162B] rounded-2xl border border-white/15 p-6 max-w-sm w-full shadow-2xl space-y-4 text-white">
            <h3 className="text-base font-bold text-white">
              Register Community Volunteer
            </h3>

            <form onSubmit={handleEnrollVolunteer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Gonzalez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Primary Skill Domain</label>
                <select
                  onChange={(e) => setSelectedSkills([e.target.value])}
                  className="w-full bg-[#0A1022] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                >
                  <option value="first_aid">Certified First Aid / CPR</option>
                  <option value="translation">Multilingual Translation</option>
                  <option value="water_rescue">Water Safety & Life Guarding</option>
                  <option value="food_distribution">Logistics & Meal Distribution</option>
                  <option value="counseling">Crisis Trauma Counseling</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white/70 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Specialist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
