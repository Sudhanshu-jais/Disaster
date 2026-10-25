// DisasterOS Data Store (Unified Reactive In-Memory & Supabase-compatible store)
import { v4 as uuidv4 } from 'uuid';
import {
  seedDisasters,
  seedZones,
  seedIncidents,
  seedWarehouses,
  seedInventory,
  seedRescueTeams,
  seedVehicles,
  seedHospitals,
  seedShelters,
  seedRoadHazards,
  seedMissions,
  seedNgos,
  seedVolunteers,
  seedAuditLogs,
  seedCampaigns,
  seedContributions,
  seedAidAllocations,
  seedAidDistributions,
  seedImprovementPlans,
  seedEmergencyContacts
} from './seedData.js';

class DisasterOSStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.disasters = JSON.parse(JSON.stringify(seedDisasters));
    this.zones = JSON.parse(JSON.stringify(seedZones));
    this.incidents = JSON.parse(JSON.stringify(seedIncidents));
    this.warehouses = JSON.parse(JSON.stringify(seedWarehouses));
    this.inventory = JSON.parse(JSON.stringify(seedInventory));
    this.rescueTeams = JSON.parse(JSON.stringify(seedRescueTeams));
    this.vehicles = JSON.parse(JSON.stringify(seedVehicles));
    this.hospitals = JSON.parse(JSON.stringify(seedHospitals));
    this.shelters = JSON.parse(JSON.stringify(seedShelters));
    this.roadHazards = JSON.parse(JSON.stringify(seedRoadHazards));
    this.missions = JSON.parse(JSON.stringify(seedMissions));
    this.ngos = JSON.parse(JSON.stringify(seedNgos));
    this.volunteers = JSON.parse(JSON.stringify(seedVolunteers));
    this.auditLogs = JSON.parse(JSON.stringify(seedAuditLogs));
    this.alerts = [
      {
        id: "alert-001",
        title: "Flash Flood Warning - Zone A Waterfront",
        message: "Rapid storm surge inundation detected in Marina & Waterfront basin. Evacuation routes active toward Presidio Gymnasium.",
        severity: "critical",
        type: "evacuation",
        affected_area: "Zone A Waterfront & Marina",
        channels: ["push", "sms", "siren"],
        sent_at: new Date(Date.now() - 45 * 60000).toISOString()
      },
      {
        id: "alert-002",
        title: "Road Closure Alert: Mission & 14th Underpass",
        message: "Underpass is flooded and closed. Emergency vehicles must reroute via Guerrero or Van Ness Ave.",
        severity: "severe",
        type: "road_closure",
        affected_area: "Mission District Transit Corridor",
        channels: ["push"],
        sent_at: new Date(Date.now() - 35 * 60000).toISOString()
      }
    ];
    this.users = [
      { id: "usr-01", email: "authority@disasteros.gov", role: "authority", full_name: "Chief Director Marcus Vance", organization: "Emergency Operations Center" },
      { id: "usr-02", email: "citizen@example.com", role: "citizen", full_name: "Sarah Lin", organization: "Local Resident" },
      { id: "usr-03", email: "responder@disasteros.gov", role: "rescue_team", full_name: "Capt. Sarah Jenkins", organization: "Swiftwater Taskforce" },
      { id: "usr-04", email: "hospital@disasteros.gov", role: "hospital", full_name: "Dr. Arvind Patel", organization: "Metro Trauma Center" },
      { id: "usr-05", email: "warehouse@disasteros.gov", role: "warehouse", full_name: "Elena Rostova", organization: "North Depot Logistics" },
      { id: "usr-06", email: "admin@disasteros.gov", role: "admin", full_name: "System Administrator", organization: "DisasterOS Core" }
    ];

    // Relief, Donations & Ledger
    this.campaigns = JSON.parse(JSON.stringify(seedCampaigns));
    this.contributions = JSON.parse(JSON.stringify(seedContributions));
    this.aidAllocations = JSON.parse(JSON.stringify(seedAidAllocations));
    this.aidDistributions = JSON.parse(JSON.stringify(seedAidDistributions));

    // Resilience & Improvement Tracking
    this.improvementPlans = JSON.parse(JSON.stringify(seedImprovementPlans));

    // Live SOS, Tracking & Nearby Alerts
    this.emergencyContacts = JSON.parse(JSON.stringify(seedEmergencyContacts));
    this.locationHistory = new Map(); // incident_id -> [{ lat, lng, accuracy, timestamp, is_stale }]
    this.trackingTokens = new Map(); // token -> { incident_id, created_by, expires_at, is_revoked }
    this.nearbyAlerts = [];
    this.nearbyResponses = [];
  }

  // --- Audit Logging ---
  addAuditLog(entry) {
    const log = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user_email: entry.user_email || "system@disasteros.gov",
      user_role: entry.user_role || "system",
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      details: entry.details,
      metadata: entry.metadata || {}
    };
    this.auditLogs.unshift(log);
    return log;
  }

  // --- Incidents / SOS ---
  getIncidents(filters = {}) {
    let result = [...this.incidents];
    if (filters.status) result = result.filter(i => i.status === filters.status);
    if (filters.severity) result = result.filter(i => i.severity === filters.severity);
    if (filters.type) result = result.filter(i => i.type === filters.type);
    return result;
  }

  getIncidentById(id) {
    return this.incidents.find(i => i.id === id || i.tracking_code === id);
  }

  createIncident(data) {
    const id = uuidv4();
    const tracking_code = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIncident = {
      id,
      tracking_code,
      type: data.type || "flood",
      title: data.title || "Emergency Assistance Request",
      description: data.description || "",
      latitude: Number(data.latitude) || 37.7749,
      longitude: Number(data.longitude) || -122.4194,
      address: data.address || "Reported Location",
      status: data.status || "submitted",
      severity: data.severity || "high",
      priority_score: data.priority_score || 70,
      affected_count: Number(data.affected_count) || 1,
      injured_count: Number(data.injured_count) || 0,
      trapped_count: Number(data.trapped_count) || 0,
      has_children_elderly: Boolean(data.has_children_elderly),
      medical_urgency: Boolean(data.medical_urgency),
      created_at: new Date().toISOString(),
      ai_classification: data.ai_classification || null
    };

    this.incidents.unshift(newIncident);
    this.addAuditLog({
      action: "SOS_SUBMITTED",
      entity_type: "incident",
      entity_id: newIncident.id,
      details: `New emergency SOS created with tracking code ${newIncident.tracking_code}`,
      user_email: data.reporter_email || "citizen@emergency.local",
      user_role: "citizen"
    });
    return newIncident;
  }

  updateIncident(id, updates, user = {}) {
    const index = this.incidents.findIndex(i => i.id === id);
    if (index === -1) return null;
    const old = this.incidents[index];
    this.incidents[index] = { ...old, ...updates, updated_at: new Date().toISOString() };
    
    this.addAuditLog({
      action: "INCIDENT_UPDATED",
      entity_type: "incident",
      entity_id: id,
      details: `Incident ${id} updated status from '${old.status}' to '${this.incidents[index].status}'`,
      user_email: user.email || "authority@disasteros.gov",
      user_role: user.role || "authority"
    });
    return this.incidents[index];
  }

  // --- Inventory & Warehouses ---
  updateInventoryStock(inventoryId, quantityChange, type = "dispatch", reason = "", user = {}) {
    const item = this.inventory.find(i => i.id === inventoryId);
    if (!item) return null;
    const previousAvailable = item.quantity_available;
    item.quantity_available = Math.max(0, item.quantity_available + quantityChange);
    
    // Auto status recalculation
    if (item.quantity_available === 0) item.status = "out_of_stock";
    else if (item.quantity_available <= item.minimum_threshold * 0.5) item.status = "critical";
    else if (item.quantity_available <= item.minimum_threshold) item.status = "low";
    else item.status = "healthy";

    this.addAuditLog({
      action: `INVENTORY_${type.toUpperCase()}`,
      entity_type: "inventory",
      entity_id: inventoryId,
      details: `${item.item_name} adjusted by ${quantityChange} (${previousAvailable} -> ${item.quantity_available}). Reason: ${reason}`,
      user_email: user.email || "warehouse@disasteros.gov",
      user_role: user.role || "warehouse"
    });
    return item;
  }

  // --- Missions ---
  createMission(missionData, user = {}) {
    const id = `mis-${Date.now().toString().slice(-4)}`;
    const mission_code = `MIS-${Math.floor(100 + Math.random() * 900)}`;
    const newMission = {
      id,
      mission_code,
      incident_id: missionData.incident_id,
      team_id: missionData.team_id,
      vehicle_id: missionData.vehicle_id,
      target_hospital_id: missionData.target_hospital_id || null,
      target_shelter_id: missionData.target_shelter_id || null,
      priority: missionData.priority || "high",
      status: "assigned",
      objective: missionData.objective || "Deploy emergency responders",
      assigned_at: new Date().toISOString(),
      notes: missionData.notes || ""
    };

    this.missions.unshift(newMission);

    // Update assigned team and vehicle status
    if (missionData.team_id) {
      const team = this.rescueTeams.find(t => t.id === missionData.team_id);
      if (team) team.status = "dispatched";
    }
    if (missionData.vehicle_id) {
      const veh = this.vehicles.find(v => v.id === missionData.vehicle_id);
      if (veh) veh.status = "on_mission";
    }

    // Update incident status to assigned
    if (missionData.incident_id) {
      this.updateIncident(missionData.incident_id, { status: "assigned" }, user);
    }

    this.addAuditLog({
      action: "MISSION_CREATED",
      entity_type: "mission",
      entity_id: id,
      details: `Mission ${mission_code} created and assigned to team ${missionData.team_id}`,
      user_email: user.email || "authority@disasteros.gov",
      user_role: user.role || "authority"
    });

    return newMission;
  }

  updateMission(id, updates, user = {}) {
    const index = this.missions.findIndex(m => m.id === id);
    if (index === -1) return null;
    const old = this.missions[index];
    this.missions[index] = { ...old, ...updates };

    if (updates.status === "completed") {
      this.missions[index].completed_at = new Date().toISOString();
      // Free up team and vehicle
      if (old.team_id) {
        const team = this.rescueTeams.find(t => t.id === old.team_id);
        if (team) team.status = "available";
      }
      if (old.vehicle_id) {
        const veh = this.vehicles.find(v => v.id === old.vehicle_id);
        if (veh) veh.status = "available";
      }
      // Update incident to resolved
      if (old.incident_id) {
        this.updateIncident(old.incident_id, { status: "resolved" }, user);
      }
    }

    this.addAuditLog({
      action: "MISSION_UPDATED",
      entity_type: "mission",
      entity_id: id,
      details: `Mission ${id} status updated to '${updates.status}'`,
      user_email: user.email || "responder@disasteros.gov",
      user_role: user.role || "rescue_team"
    });

    return this.missions[index];
  }

  // --- Live SOS Telemetry & Location Sharing ---
  recordLocationUpdate(incidentId, data = {}) {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return null;

    const lat = Number(data.latitude || data.lat);
    const lng = Number(data.longitude || data.lng);
    const accuracy = Number(data.accuracy || 15);
    const altitude = data.altitude ? Number(data.altitude) : null;
    const speed = data.speed ? Number(data.speed) : null;
    const heading = data.heading ? Number(data.heading) : null;
    const battery = data.battery_level !== undefined ? Number(data.battery_level) : null;
    const timestamp = new Date().toISOString();

    const telemetry = {
      incident_id: incident.id,
      tracking_code: incident.tracking_code,
      latitude: lat,
      longitude: lng,
      accuracy,
      altitude,
      speed,
      heading,
      battery_level: battery,
      timestamp,
      is_stale: false
    };

    // Update incident coordinate fix
    incident.latitude = lat;
    incident.longitude = lng;
    incident.last_location_update = timestamp;
    incident.location_accuracy_meters = accuracy;

    if (!this.locationHistory.has(incident.id)) {
      this.locationHistory.set(incident.id, []);
    }
    const history = this.locationHistory.get(incident.id);
    history.push(telemetry);
    if (history.length > 50) history.shift(); // retain last 50 points

    return telemetry;
  }

  getLatestLocation(incidentId) {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return null;

    const history = this.locationHistory.get(incident.id) || [];
    const latest = history.length > 0 ? history[history.length - 1] : {
      incident_id: incident.id,
      tracking_code: incident.tracking_code,
      latitude: incident.latitude,
      longitude: incident.longitude,
      accuracy: incident.location_accuracy_meters || 25,
      timestamp: incident.last_location_update || incident.created_at,
      is_stale: false
    };

    // Stale check: older than 90 seconds
    const ageSeconds = (Date.now() - new Date(latest.timestamp).getTime()) / 1000;
    latest.is_stale = ageSeconds > 90;
    latest.age_seconds = Math.round(ageSeconds);
    return latest;
  }

  getLocationHistory(incidentId) {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return [];
    return this.locationHistory.get(incident.id) || [];
  }

  createTrackingToken(incidentId, createdBy = "citizen@example.com", expiresInHours = 24) {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return null;

    const token = `tr_${uuidv4().replace(/-/g, '').slice(0, 20)}`;
    const expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString();

    const record = {
      token,
      incident_id: incident.id,
      tracking_code: incident.tracking_code,
      created_by: createdBy,
      expires_at: expiresAt,
      is_revoked: false,
      created_at: new Date().toISOString()
    };

    this.trackingTokens.set(token, record);
    return record;
  }

  verifyTrackingToken(token) {
    if (!token) return null;
    const record = this.trackingTokens.get(token);
    if (!record) return null;
    if (record.is_revoked) return { valid: false, reason: "Token has been revoked by the reporter" };
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return { valid: false, reason: "Tracking invitation has expired" };
    }
    return { valid: true, record };
  }

  revokeTrackingToken(token, user = {}) {
    const record = this.trackingTokens.get(token);
    if (!record) return false;
    record.is_revoked = true;
    record.revoked_at = new Date().toISOString();
    record.revoked_by = user.email || "citizen@example.com";

    this.addAuditLog({
      action: "TRACKING_TOKEN_REVOKED",
      entity_type: "tracking_token",
      entity_id: token,
      details: `Live tracking link revoked for SOS ${record.tracking_code}`,
      user_email: user.email || record.created_by,
      user_role: "citizen"
    });
    return true;
  }

  // --- Nearby Emergency Alert Network ---
  createNearbyAlert(data, user = {}) {
    const alertId = `nalert-${Date.now().toString().slice(-4)}`;
    const radius = Number(data.radius_km || 1.5); // between 1.0 and 2.0 km
    const expiresAt = new Date(Date.now() + 4 * 3600000).toISOString(); // 4h window

    const alert = {
      id: alertId,
      incident_id: data.incident_id || null,
      tracking_code: data.tracking_code || null,
      latitude: Number(data.latitude || 37.7749),
      longitude: Number(data.longitude || -122.4194),
      radius_km: radius,
      title: data.title || "Nearby Emergency Assistance Requested",
      message: data.message || "A person has reported an incident in your immediate area. Safe volunteers can offer assistance.",
      severity: data.severity || "high",
      status: "active",
      sound_type: "siren_pulse",
      opted_in_recipients_count: Math.floor(12 + Math.random() * 28),
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      created_by: user.email || "system@disasteros.gov"
    };

    this.nearbyAlerts.unshift(alert);
    this.addAuditLog({
      action: "NEARBY_ALERT_BROADCAST",
      entity_type: "nearby_alert",
      entity_id: alertId,
      details: `Nearby consent-based alert broadcast within ${radius}km radius. ${alert.opted_in_recipients_count} opted-in civilians notified.`,
      user_email: user.email || "system@disasteros.gov",
      user_role: user.role || "authority"
    });

    return alert;
  }

  respondToNearbyAlert(alertId, responseData = {}) {
    const alert = this.nearbyAlerts.find(a => a.id === alertId);
    if (!alert) return null;

    const response = {
      id: `resp-${Date.now().toString().slice(-4)}`,
      alert_id: alertId,
      user_email: responseData.user_email || "volunteer@community.local",
      user_name: responseData.user_name || "Community Volunteer",
      response_type: responseData.response_type || "can_assist", // can_assist | safe | report_abuse
      note: responseData.note || "",
      timestamp: new Date().toISOString()
    };

    this.nearbyResponses.unshift(response);
    return response;
  }

  // --- Emergency Contacts ---
  getEmergencyContacts(userEmail = "citizen@example.com") {
    return this.emergencyContacts.filter(c => c.user_email === userEmail || !c.user_email);
  }

  updateEmergencyContacts(userEmail, contacts = [], user = {}) {
    this.emergencyContacts = this.emergencyContacts.filter(c => c.user_email !== userEmail);
    const updated = contacts.map(c => ({
      id: c.id || `ec-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      user_email: userEmail,
      name: c.name,
      relationship: c.relationship || "Contact",
      phone: c.phone,
      email: c.email || "",
      notify_sms: Boolean(c.notify_sms),
      notify_email: Boolean(c.notify_email),
      share_live_location: Boolean(c.share_live_location)
    }));
    this.emergencyContacts.push(...updated);

    this.addAuditLog({
      action: "EMERGENCY_CONTACTS_UPDATED",
      entity_type: "contacts",
      entity_id: userEmail,
      details: `User updated ${updated.length} emergency contacts`,
      user_email: userEmail,
      user_role: "citizen"
    });

    return updated;
  }

  // --- Relief & Donations (ReliefChain Ledger) ---
  getCampaigns(filters = {}) {
    let result = [...this.campaigns];
    if (filters.category) result = result.filter(c => c.category === filters.category);
    if (filters.urgent !== undefined) result = result.filter(c => c.urgent === (filters.urgent === 'true' || filters.urgent === true));
    return result;
  }

  getCampaignById(id) {
    return this.campaigns.find(c => c.id === id);
  }

  createCampaign(data, user = {}) {
    const id = `camp-${Date.now().toString().slice(-4)}`;
    const newCamp = {
      id,
      title: data.title,
      description: data.description,
      category: data.category || "flood_relief",
      target_amount: Number(data.target_amount) || 50000,
      raised_amount: 0,
      currency: "USD",
      organizer_name: user.full_name || data.organizer_name || "Emergency Coordinator",
      organizer_role: user.role || "authority",
      organizer_verified: true,
      verification_status: "verified",
      urgent: Boolean(data.urgent),
      beneficiary_community: data.beneficiary_community || "Civic Crisis Sector",
      intended_use: data.intended_use || "Emergency rations, clean water, and shelter kits",
      relief_items_needed: data.relief_items_needed || [],
      updates: [],
      created_at: new Date().toISOString(),
      crypto_contract_address: `0x${uuidv4().replace(/-/g, '').slice(0, 16)} (ReliefChain)`,
      audit_score: 95
    };

    this.campaigns.unshift(newCamp);
    this.addAuditLog({
      action: "RELIEF_CAMPAIGN_CREATED",
      entity_type: "campaign",
      entity_id: id,
      details: `Campaign '${newCamp.title}' created with target $${newCamp.target_amount}`,
      user_email: user.email || "authority@disasteros.gov",
      user_role: user.role || "authority"
    });

    return newCamp;
  }

  createContribution(data) {
    const campaign = this.getCampaignById(data.campaign_id);
    if (!campaign) return null;

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) return null;

    const id = `cnt-${Date.now().toString().slice(-4)}`;
    const txHash = data.payment_method === 'web3_usdc' 
      ? `0x${uuidv4().replace(/-/g, '')}`
      : `rc-tx-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const contribution = {
      id,
      campaign_id: campaign.id,
      donor_name: data.is_anonymous ? "Anonymous Supporter" : (data.donor_name || "Kind Citizen"),
      donor_email: data.donor_email || "supporter@community.local",
      amount,
      currency: campaign.currency || "USD",
      payment_method: data.payment_method || "card",
      status: "completed",
      tx_hash: txHash,
      receipt_number: receiptNumber,
      is_anonymous: Boolean(data.is_anonymous),
      message: data.message || "",
      created_at: new Date().toISOString()
    };

    this.contributions.unshift(contribution);
    campaign.raised_amount += amount;

    this.addAuditLog({
      action: "DONATION_RECEIVED",
      entity_type: "contribution",
      entity_id: id,
      details: `Donation of $${amount} to '${campaign.title}' via ${contribution.payment_method}. Receipt: ${receiptNumber}`,
      user_email: contribution.donor_email,
      user_role: "citizen"
    });

    return contribution;
  }

  createAidAllocation(data, user = {}) {
    const campaign = this.getCampaignById(data.campaign_id);
    if (!campaign) return null;

    const amount = Number(data.allocated_amount);
    const id = `alc-${Date.now().toString().slice(-4)}`;

    const allocation = {
      id,
      campaign_id: campaign.id,
      title: data.title,
      allocated_amount: amount,
      recipient_entity: data.recipient_entity,
      purpose: data.purpose,
      approved_by: `${user.full_name || 'Chief Director Marcus Vance'} (${user.role || 'authority'})`,
      approved_at: new Date().toISOString(),
      status: "disbursed",
      evidence_notes: data.evidence_notes || "Verified against emergency relief requisition order."
    };

    this.aidAllocations.unshift(allocation);
    this.addAuditLog({
      action: "AID_ALLOCATED",
      entity_type: "aid_allocation",
      entity_id: id,
      details: `Fund allocation of $${amount} approved for ${allocation.recipient_entity} under campaign '${campaign.title}'`,
      user_email: user.email || "authority@disasteros.gov",
      user_role: user.role || "authority"
    });

    return allocation;
  }

  createAidDistribution(data, user = {}) {
    const id = `dst-${Date.now().toString().slice(-4)}`;
    const distribution = {
      id,
      allocation_id: data.allocation_id || "alc-001",
      campaign_id: data.campaign_id || "camp-001",
      item_or_service: data.item_or_service,
      quantity: data.quantity,
      recipient_count: Number(data.recipient_count) || 1,
      location: data.location,
      distributed_at: new Date().toISOString(),
      verified_by: `${user.full_name || 'Relief Officer'} (${user.role || 'ngo'})`,
      proof_document_url: data.proof_document_url || "evidence/field_distribution_attestation.pdf",
      status: "delivered",
      beneficiary_feedback: data.beneficiary_feedback || "Aid received and verified in good condition."
    };

    this.aidDistributions.unshift(distribution);
    this.addAuditLog({
      action: "AID_DISTRIBUTED",
      entity_type: "aid_distribution",
      entity_id: id,
      details: `Distribution recorded: ${distribution.quantity} of ${distribution.item_or_service} to ${distribution.recipient_count} recipients at ${distribution.location}`,
      user_email: user.email || "ngo@disasteros.gov",
      user_role: user.role || "ngo"
    });

    return distribution;
  }

  // --- Resilience Improvement Plans ---
  getImprovementPlans(filters = {}) {
    let result = [...this.improvementPlans];
    if (filters.status) result = result.filter(p => p.status === filters.status);
    if (filters.priority) result = result.filter(p => p.priority === filters.priority);
    return result;
  }

  createImprovementPlan(data, user = {}) {
    const id = `imp-${Date.now().toString().slice(-4)}`;
    const plan = {
      id,
      weakness: data.weakness,
      evidence: data.evidence,
      mitigation: data.mitigation,
      priority: data.priority || "high",
      responsible_role: data.responsible_role || "logistics_director",
      responsible_owner: data.responsible_owner || "Infrastructure Engineering Team",
      deadline: data.deadline || "2026-12-31",
      progress_pct: Number(data.progress_pct) || 0,
      status: data.status || "identified",
      completion_evidence: data.completion_evidence || "",
      reassessment_result: data.reassessment_result || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.improvementPlans.unshift(plan);
    this.addAuditLog({
      action: "IMPROVEMENT_PLAN_CREATED",
      entity_type: "improvement_plan",
      entity_id: id,
      details: `New resilience improvement plan logged: '${plan.weakness}' (Priority: ${plan.priority})`,
      user_email: user.email || "authority@disasteros.gov",
      user_role: user.role || "authority"
    });

    return plan;
  }

  updateImprovementPlan(id, updates = {}, user = {}) {
    const index = this.improvementPlans.findIndex(p => p.id === id);
    if (index === -1) return null;
    const old = this.improvementPlans[index];

    this.improvementPlans[index] = {
      ...old,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.addAuditLog({
      action: "IMPROVEMENT_PLAN_UPDATED",
      entity_type: "improvement_plan",
      entity_id: id,
      details: `Resilience plan ${id} updated to progress ${this.improvementPlans[index].progress_pct}% (${this.improvementPlans[index].status})`,
      user_email: user.email || "authority@disasteros.gov",
      user_role: user.role || "authority"
    });

    return this.improvementPlans[index];
  }
}

export const store = new DisasterOSStore();
