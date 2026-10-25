// DisasterOS TypeScript Data Types

export type UserRole = 
  | 'citizen'
  | 'authority'
  | 'rescue_team'
  | 'hospital'
  | 'warehouse'
  | 'logistics'
  | 'ngo'
  | 'volunteer'
  | 'admin';

export type IncidentStatus = 
  | 'submitted'
  | 'verified'
  | 'prioritized'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: string;
  tracking_code: string;
  type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: IncidentStatus;
  severity: SeverityLevel;
  priority_score: number;
  affected_count: number;
  injured_count: number;
  trapped_count: number;
  has_children_elderly: boolean;
  medical_urgency: boolean;
  created_at: string;
  updated_at?: string;
  ai_classification?: {
    category: string;
    confidence: number;
    recommended_response?: string[];
    rationale?: string;
  };
}

export interface Disaster {
  id: string;
  title: string;
  type: string;
  severity: SeverityLevel;
  status: string;
  epicenter_lat: number;
  epicenter_lng: number;
  radius_km: number;
  declared_at: string;
  description: string;
  affected_population: number;
  weather_summary?: string;
}

export interface DisasterZone {
  id: string;
  disaster_id: string;
  name: string;
  risk_level: string;
  estimated_population: number;
  is_evacuation_ordered: boolean;
  coordinates: [number, number][];
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  contact_person: string;
  phone: string;
  status: string;
}

export interface InventoryItem {
  id: string;
  warehouse_id: string;
  category: string;
  item_name: string;
  unit: string;
  quantity_available: number;
  quantity_reserved: number;
  minimum_threshold: number;
  status: 'healthy' | 'low' | 'critical' | 'out_of_stock';
}

export interface RescueTeam {
  id: string;
  team_code: string;
  name: string;
  lead_name: string;
  phone: string;
  current_lat: number;
  current_lng: number;
  status: 'available' | 'dispatched' | 'on_scene' | 'returning' | 'rest';
  skills: string[];
  capacity: number;
  active_mission?: string | null;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  type: string;
  make_model: string;
  capacity_payload_kg: number;
  passenger_capacity: number;
  current_lat: number;
  current_lng: number;
  status: 'available' | 'assigned' | 'en_route' | 'on_mission' | 'maintenance' | 'offline';
  driver_name: string;
  fuel_percent: number;
  assigned_team_id?: string | null;
}

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  total_beds: number;
  available_beds: number;
  icu_total: number;
  icu_available: number;
  trauma_level: number;
  has_helipad: boolean;
  generator_operational: boolean;
  blood_bank_status: string;
  status: 'open' | 'diverted' | 'full' | 'damaged';
  specialties?: string[];
}

export interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  capacity: number;
  current_occupancy: number;
  food_supplies_days: number;
  water_supplies_days: number;
  medical_staff_present: boolean;
  pet_friendly: boolean;
  status: 'open' | 'at_capacity' | 'closed';
}

export interface Mission {
  id: string;
  mission_code: string;
  incident_id: string;
  team_id: string;
  vehicle_id: string;
  target_hospital_id?: string | null;
  target_shelter_id?: string | null;
  priority: string;
  status: 'assigned' | 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'aborted';
  objective: string;
  assigned_at: string;
  completed_at?: string;
  notes?: string;
}

export interface RoadHazard {
  id: string;
  road_name: string;
  hazard_type: string;
  latitude: number;
  longitude: number;
  is_passable: boolean;
  severity: string;
  reported_at: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: string;
  type: string;
  affected_area: string;
  channels: string[];
  sent_at: string;
}

// -------------------------------------------------------------
// RELIEF & DONATIONS / RELIEFCHAIN TYPES
// -------------------------------------------------------------
export interface ReliefCampaign {
  id: string;
  title: string;
  description: string;
  category: 'flood_relief' | 'medical_aid' | 'food_sustenance' | 'shelter_rebuild' | string;
  target_amount: number;
  raised_amount: number;
  currency: string;
  organizer_name: string;
  organizer_role: string;
  organizer_verified: boolean;
  verification_status: 'verified' | 'pending' | 'review';
  urgent: boolean;
  beneficiary_community: string;
  intended_use: string;
  relief_items_needed?: Array<{ name: string; target: number; fulfilled: number }>;
  updates?: Array<{ id: string; date: string; title: string; content: string; verified_by?: string }>;
  created_at: string;
  crypto_contract_address?: string;
  audit_score?: number;
}

export interface DonationContribution {
  id: string;
  campaign_id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'upi' | 'bank_transfer' | 'web3_usdc' | string;
  status: 'completed' | 'processing' | 'failed';
  tx_hash: string;
  receipt_number: string;
  is_anonymous: boolean;
  message?: string;
  created_at: string;
}

export interface AidAllocation {
  id: string;
  campaign_id: string;
  title: string;
  allocated_amount: number;
  recipient_entity: string;
  purpose: string;
  approved_by: string;
  approved_at: string;
  status: 'allocated' | 'disbursed' | 'delivered';
  evidence_notes?: string;
}

export interface AidDistribution {
  id: string;
  allocation_id: string;
  campaign_id: string;
  item_or_service: string;
  quantity: string;
  recipient_count: number;
  location: string;
  distributed_at: string;
  verified_by: string;
  proof_document_url?: string;
  status: 'delivered' | 'in_transit';
  beneficiary_feedback?: string;
}

// -------------------------------------------------------------
// RESILIENCE IMPROVEMENT & DEPENDENCY TYPES
// -------------------------------------------------------------
export interface ImprovementPlan {
  id: string;
  weakness: string;
  evidence: string;
  mitigation: string;
  priority: 'critical' | 'high' | 'medium';
  responsible_role: string;
  responsible_owner: string;
  deadline: string;
  progress_pct: number;
  status: 'identified' | 'in_progress' | 'mitigated' | 'verified';
  completion_evidence?: string;
  reassessment_result?: string;
  created_at: string;
  updated_at?: string;
}

// -------------------------------------------------------------
// LIVE SOS & NEARBY EMERGENCY ALERT TYPES
// -------------------------------------------------------------
export interface LocationTelemetry {
  incident_id: string;
  tracking_code: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  battery_level?: number | null;
  timestamp: string;
  is_stale: boolean;
  age_seconds?: number;
}

export interface TrackingTokenRecord {
  token: string;
  incident_id: string;
  tracking_code: string;
  created_by: string;
  expires_at: string;
  is_revoked: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id?: string;
  user_email?: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notify_sms: boolean;
  notify_email: boolean;
  share_live_location: boolean;
}

export interface NearbyAlert {
  id: string;
  incident_id?: string | null;
  tracking_code?: string | null;
  latitude: number;
  longitude: number;
  radius_km: number;
  title: string;
  message: string;
  severity: string;
  status: 'active' | 'resolved' | 'expired' | 'cancelled';
  sound_type: string;
  opted_in_recipients_count: number;
  created_at: string;
  expires_at: string;
  created_by?: string;
}

export interface NearbyAlertResponse {
  id: string;
  alert_id: string;
  user_email: string;
  user_name: string;
  response_type: 'can_assist' | 'safe' | 'report_abuse' | string;
  note?: string;
  timestamp: string;
}
