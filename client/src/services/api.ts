// DisasterOS Frontend API Client
import { 
  Incident, 
  Disaster, 
  Hospital, 
  Shelter, 
  Warehouse, 
  InventoryItem, 
  RescueTeam, 
  Vehicle, 
  Mission, 
  RoadHazard, 
  AuditLog, 
  AlertNotification,
  ReliefCampaign,
  DonationContribution,
  AidAllocation,
  AidDistribution,
  ImprovementPlan,
  LocationTelemetry,
  TrackingTokenRecord,
  EmergencyContact,
  NearbyAlert,
  NearbyAlertResponse
} from '../types';

const BASE_URL = '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const role = localStorage.getItem('disasteros_role') || 'authority';
    const email = localStorage.getItem('disasteros_email') || `${role}@disasteros.gov`;
    const token = localStorage.getItem('disasteros_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-demo-role': role,
      'x-demo-email': email
    };

    const sbUrl = localStorage.getItem('disasteros_supabase_url');
    const sbKey = localStorage.getItem('disasteros_supabase_anon_key');
    if (sbUrl) headers['x-supabase-url'] = sbUrl;
    if (sbKey) headers['x-supabase-key'] = sbKey;

    const geminiKey = localStorage.getItem('disasteros_gemini_api_key');
    if (geminiKey) headers['x-gemini-key'] = geminiKey;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `HTTP ${res.status}: Request failed`);
    }
    return res.json();
  }

  // System
  getHealth() { return this.request<{ status: string; active_incidents: number; timestamp: string }>('/health'); }

  // Disasters
  getDisasters() { return this.request<{ disasters: Disaster[]; zones: any[] }>('/disasters'); }

  // Incidents & SOS
  getIncidents(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ incidents: Incident[]; count: number }>(`/incidents${query ? `?${query}` : ''}`);
  }

  getIncidentById(id: string) { return this.request<{ incident: Incident }>(`/incidents/${id}`); }

  submitSOS(data: Partial<Incident>) {
    return this.request<{ success: boolean; incident: Incident; tracking_code: string; priority: any }>('/sos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  trackSOS(code: string) {
    return this.request<{ incident: Incident; mission: Mission | null }>(`/sos/${code}`);
  }

  updateIncident(id: string, updates: Partial<Incident>) {
    return this.request<{ incident: Incident }>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // AI Intelligence
  aiPrioritize(incidentData: any) {
    return this.request<any>('/ai/prioritize', {
      method: 'POST',
      body: JSON.stringify(incidentData)
    });
  }

  aiAllocate(incidentId: string) {
    return this.request<any>('/ai/allocate', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId })
    });
  }

  aiAssistant(question: string, options: { history?: Array<{ sender?: string; role?: string; text?: string; content?: string }>; context?: any; role?: 'citizen' | 'operator'; apiKey?: string } = {}) {
    return this.request<{ answer: string; sources: string[]; confidence: number; model?: string; isGemini?: boolean; geminiError?: string }>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ question, ...options })
    });
  }

  getGeminiStatus() {
    return this.request<{ configured: boolean; maskedKey: string | null; model: string; provider: string }>('/ai/gemini-status');
  }

  saveGeminiKey(apiKey: string) {
    return this.request<{ success: boolean; message: string; model?: string; status?: any }>('/ai/gemini-config', {
      method: 'POST',
      body: JSON.stringify({ apiKey })
    });
  }

  getDynamicReallocations() {
    return this.request<{ count: number; recommendations: any[] }>('/ai/dynamic-reallocation');
  }

  // Resources & Logistics
  getWarehouses() { return this.request<{ warehouses: Warehouse[] }>('/warehouses'); }
  getInventory(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ inventory: InventoryItem[]; count: number }>(`/inventory${query ? `?${query}` : ''}`);
  }
  dispatchInventory(data: { inventory_id: string; quantity: number; reason: string }) {
    return this.request<{ success: boolean; item: InventoryItem }>('/inventory/dispatch', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  replenishInventory(data: { inventory_id: string; quantity: number; reason: string }) {
    return this.request<{ success: boolean; item: InventoryItem }>('/inventory/replenish', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getVehicles() { return this.request<{ vehicles: Vehicle[] }>('/vehicles'); }
  updateVehicle(id: string, updates: Partial<Vehicle>) {
    return this.request<{ vehicle: Vehicle }>(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  getRescueTeams() { return this.request<{ rescue_teams: RescueTeam[] }>('/rescue-teams'); }
  updateRescueTeam(id: string, updates: Partial<RescueTeam>) {
    return this.request<{ rescue_team: RescueTeam }>(`/rescue-teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
  updateTeamStatus(teamId: string, status: any) {
    return this.updateRescueTeam(teamId, { status });
  }
  
  // Missions
  getMissions() { return this.request<{ missions: Mission[] }>('/missions'); }
  createMission(missionData: any) {
    return this.request<{ success: boolean; mission: Mission }>('/missions', {
      method: 'POST',
      body: JSON.stringify(missionData)
    });
  }
  updateMission(id: string, updates: Partial<Mission>) {
    return this.request<{ mission: Mission }>(`/missions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
  updateMissionStatus(missionId: string, status: any) {
    return this.updateMission(missionId, { status });
  }

  // Facilities
  getHospitals() { return this.request<{ hospitals: Hospital[] }>('/hospitals'); }
  updateHospitalCapacity(id: string, capacity: { available_beds?: number; icu_available?: number; status?: string }) {
    return this.request<{ hospital: Hospital }>(`/hospitals/${id}/capacity`, {
      method: 'PATCH',
      body: JSON.stringify(capacity)
    });
  }

  getShelters() { return this.request<{ shelters: Shelter[] }>('/shelters'); }
  updateShelterOccupancy(id: string, data: { current_occupancy?: number; status?: string }) {
    return this.request<{ shelter: Shelter }>(`/shelters/${id}/occupancy`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Routes & Hazards
  calculateRoute(startLat: number, startLng: number, destLat: number, destLng: number, vehicleType = 'ambulance') {
    return this.request<any>(`/routes/calculate?startLat=${startLat}&startLng=${startLng}&destLat=${destLat}&destLng=${destLng}&vehicleType=${vehicleType}`);
  }
  calculateHazardRoute(params: { origin: [number, number]; destination: [number, number]; vehicle_type?: string }) {
    return this.calculateRoute(params.origin[0], params.origin[1], params.destination[0], params.destination[1], params.vehicle_type || 'ambulance');
  }
  getRoadHazards() { return this.request<{ road_hazards: RoadHazard[] }>('/road-conditions'); }
  reportRoadHazard(data: any) {
    return this.request<any>('/road-conditions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Volunteers & NGOs
  getNgos() { return this.request<{ ngos: any[] }>('/ngos'); }
  getVolunteers() { return this.request<{ volunteers: any[] }>('/volunteers'); }
  registerVolunteer(data: any) {
    return this.request<any>('/volunteers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  updateVolunteer(id: string, updates: any) {
    return this.request<{ volunteer: any }>(`/volunteers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
  assignVolunteerTask(volunteerId: string, task: string | null) {
    return this.updateVolunteer(volunteerId, { assigned_task: task });
  }

  // Alerts
  getAlerts() { return this.request<{ alerts: AlertNotification[] }>('/alerts'); }
  createAlert(data: any) {
    return this.request<{ alert: AlertNotification }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Simulation
  getWhatIf(scenario: string) { return this.request<any>(`/simulation/what-if?scenario=${scenario}`); }
  startFloodSimulation() { return this.request<any>('/simulation/start-flood', { method: 'POST' }); }
  stopSimulation() { return this.request<any>('/simulation/stop', { method: 'POST' }); }

  // Risk & Analytics
  getRiskAnalysis() { return this.request<any>('/risk/analysis'); }
  getAnalytics() { return this.request<any>('/analytics'); }
  getAuditLogs() { return this.request<{ audit_logs: AuditLog[] }>('/audit-logs'); }
  getExternalWeather() { return this.request<any>('/external/weather'); }

  // Supabase Cloud Integration
  getSupabaseStatus() { return this.request<any>('/supabase/status'); }
  saveSupabaseConfig(url: string, key: string) {
    return this.request<any>('/supabase/config', {
      method: 'POST',
      body: JSON.stringify({ url, key })
    });
  }
  testSupabase(url: string, key: string) {
    return this.request<any>('/supabase/test', {
      method: 'POST',
      body: JSON.stringify({ url, key })
    });
  }
  syncSupabase() { return this.request<any>('/supabase/sync', { method: 'POST' }); }

  // Live SOS Location Telemetry & Expiring Tracking Links
  recordSOSLocation(id: string, telemetry: { latitude: number; longitude: number; accuracy?: number; altitude?: number; speed?: number; heading?: number; battery_level?: number }) {
    return this.request<{ success: boolean; telemetry: LocationTelemetry }>(`/sos/${id}/location`, {
      method: 'POST',
      body: JSON.stringify(telemetry)
    });
  }

  getSOSLocation(id: string) {
    return this.request<{ location: LocationTelemetry }>(`/sos/${id}/location`);
  }

  getSOSLocationHistory(id: string) {
    return this.request<{ history: LocationTelemetry[] }>(`/sos/${id}/location-history`);
  }

  createTrackingToken(id: string, expiresInHours = 24) {
    return this.request<{ success: boolean; token: string; expires_at: string }>(`/sos/${id}/tracking-token`, {
      method: 'POST',
      body: JSON.stringify({ expires_in_hours: expiresInHours })
    });
  }

  verifyTrackingToken(token: string) {
    return this.request<{ valid: boolean; incident: Partial<Incident>; location: LocationTelemetry; mission_status: string | null }>(`/tracking/verify/${token}`);
  }

  revokeTrackingToken(token: string) {
    return this.request<{ success: boolean; message: string }>(`/tracking/revoke/${token}`, {
      method: 'POST'
    });
  }

  // Emergency Contacts
  getEmergencyContacts() {
    return this.request<{ contacts: EmergencyContact[] }>('/user/contacts');
  }

  updateEmergencyContacts(contacts: EmergencyContact[]) {
    return this.request<{ success: boolean; contacts: EmergencyContact[] }>('/user/contacts', {
      method: 'POST',
      body: JSON.stringify({ contacts })
    });
  }

  notifyEmergencyContacts(id: string) {
    return this.request<{ success: boolean; contacts_notified_count: number; delivery_report: any[]; notice: string }>(`/sos/${id}/notify-contacts`, {
      method: 'POST'
    });
  }

  // Nearby Emergency Alert Network
  getNearbyAlerts() {
    return this.request<{ alerts: NearbyAlert[] }>('/nearby-alerts');
  }

  createNearbyAlert(data: { incident_id?: string; tracking_code?: string; latitude: number; longitude: number; radius_km?: number; title: string; message: string; severity?: string }) {
    return this.request<{ success: boolean; alert: NearbyAlert }>('/nearby-alerts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  respondToNearbyAlert(id: string, response: { user_email?: string; user_name?: string; response_type: string; note?: string }) {
    return this.request<{ success: boolean; response: NearbyAlertResponse }>(`/nearby-alerts/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(response)
    });
  }

  // Relief & Donations (ReliefChain)
  getCampaigns(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ campaigns: ReliefCampaign[]; count: number }>(`/relief/campaigns${query ? `?${query}` : ''}`);
  }

  getCampaignById(id: string) {
    return this.request<{ campaign: ReliefCampaign; contributions: DonationContribution[]; allocations: AidAllocation[]; distributions: AidDistribution[] }>(`/relief/campaigns/${id}`);
  }

  createCampaign(data: Partial<ReliefCampaign>) {
    return this.request<{ success: boolean; campaign: ReliefCampaign }>('/relief/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  submitDonation(data: { campaign_id: string; amount: number; payment_method: string; donor_name?: string; donor_email?: string; is_anonymous?: boolean; message?: string }) {
    return this.request<{ success: boolean; message: string; contribution: DonationContribution; receipt_number: string; tx_hash: string }>('/relief/contribute', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getContributions(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ contributions: DonationContribution[]; count: number }>(`/relief/contributions${query ? `?${query}` : ''}`);
  }

  createAidAllocation(data: { campaign_id: string; title: string; allocated_amount: number; recipient_entity: string; purpose: string; evidence_notes?: string }) {
    return this.request<{ success: boolean; allocation: AidAllocation }>('/relief/allocations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getAidAllocations(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ allocations: AidAllocation[]; count: number }>(`/relief/allocations${query ? `?${query}` : ''}`);
  }

  recordAidDistribution(data: { allocation_id?: string; campaign_id?: string; item_or_service: string; quantity: string; recipient_count: number; location: string; proof_document_url?: string; beneficiary_feedback?: string }) {
    return this.request<{ success: boolean; distribution: AidDistribution }>('/relief/distributions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getAidDistributions(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ distributions: AidDistribution[]; count: number }>(`/relief/distributions${query ? `?${query}` : ''}`);
  }

  getReliefLedger() {
    return this.request<{
      kpis: {
        total_campaigns: number;
        verified_campaigns: number;
        total_raised_usd: number;
        total_allocated_usd: number;
        unallocated_buffer_usd: number;
        total_recipients_reached: number;
        web3_attestation_records: number;
      };
      campaigns: ReliefCampaign[];
      recent_transactions: DonationContribution[];
      recent_distributions: AidDistribution[];
    }>('/relief/ledger');
  }

  // Resilience & Improvement Plans
  getImprovementPlans(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ plans: ImprovementPlan[]; count: number }>(`/resilience/plans${query ? `?${query}` : ''}`);
  }

  createImprovementPlan(data: Partial<ImprovementPlan>) {
    return this.request<{ success: boolean; plan: ImprovementPlan }>('/resilience/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateImprovementPlan(id: string, updates: Partial<ImprovementPlan>) {
    return this.request<{ success: boolean; plan: ImprovementPlan }>(`/resilience/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  getResilienceConsequences() {
    return this.request<{
      scenario_title: string;
      nodes: Array<{ id: string; label: string; type: string; status: string; zone?: string; dependency?: string }>;
      edges: Array<{ source: string; target: string; relation: string }>;
      single_points_of_failure: Array<{ asset: string; impact: string; recommendation: string }>;
      overall_resilience_score: number;
      readiness_breakdown: Record<string, string>;
    }>('/resilience/consequences');
  }

  // Tool-Connected Copilot
  getCopilotTools() {
    return this.request<{ tools: Array<{ name: string; description: string; parameters: any }>; role: string }>('/ai/copilot/tools');
  }

  executeCopilotTool(tool: string, params: any = {}) {
    return this.request<any>('/ai/copilot/execute-tool', {
      method: 'POST',
      body: JSON.stringify({ tool, params })
    });
  }

  copilotChat(options: { question: string; history?: any[]; role?: string; context?: any; apiKey?: string }) {
    return this.request<{
      answer: string;
      sources: string[];
      confidence: number;
      model?: string;
      isGemini?: boolean;
      tools_executed: string[];
      tool_data?: any;
      proposed_action?: {
        requires_confirmation: boolean;
        action_type: string;
        title: string;
        description: string;
        payload: any;
        rationale: string;
      } | null;
      suggested_follow_ups: string[];
    }>('/ai/copilot/chat', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }
}

export const api = new ApiClient();
