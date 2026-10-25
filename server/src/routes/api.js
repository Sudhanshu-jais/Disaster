// DisasterOS Master REST API Router
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../database/store.js';
import { eventBus } from '../services/eventBus.js';
import { aiService } from '../services/aiService.js';
import { allocationEngine } from '../services/allocationEngine.js';
import { routingService } from '../services/routingService.js';
import { simulationEngine } from '../services/simulationEngine.js';
import { externalApis } from '../services/externalApis.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getSupabaseConfig, setRuntimeSupabaseConfig, testSupabaseConnection, syncStoreToSupabase, syncEntityToSupabase } from '../database/supabase.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'disasteros_secret_development_key_2026';

// Transparently capture frontend Supabase credentials if sent via headers
router.use((req, res, next) => {
  const headerUrl = req.headers['x-supabase-url'];
  const headerKey = req.headers['x-supabase-key'];
  if (headerUrl && headerKey) {
    const current = getSupabaseConfig();
    if (!current.isConfigured || current.url !== headerUrl) {
      setRuntimeSupabaseConfig(headerUrl, headerKey);
    }
  }
  next();
});

// -------------------------------------------------------------
// 1. HEALTH & SYSTEM DIAGNOSTICS (Section 44)
// -------------------------------------------------------------
router.get('/health', async (req, res) => {
  const supabaseCfg = getSupabaseConfig();
  res.json({
    status: "ok",
    database: supabaseCfg.isConfigured ? "supabase_hybrid" : "embedded_store",
    supabase: {
      configured: supabaseCfg.isConfigured,
      url: supabaseCfg.url ? `${supabaseCfg.url.slice(0, 24)}...` : null
    },
    realtime: "active",
    ai_engine: "ready",
    active_incidents: store.incidents.length,
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 1.1 SUPABASE CLOUD DATABASE ENDPOINTS
// -------------------------------------------------------------
router.get('/supabase/status', async (req, res) => {
  const result = await testSupabaseConnection();
  const config = getSupabaseConfig();
  res.json({
    ...result,
    url: config.url ? `${config.url.slice(0, 24)}...` : null,
    isConfigured: config.isConfigured
  });
});

router.post('/supabase/config', async (req, res) => {
  const { url, key } = req.body;
  if (!url || !key) {
    return res.status(400).json({ error: 'Supabase URL and API Key are required' });
  }
  setRuntimeSupabaseConfig(url, key);
  const testRes = await testSupabaseConnection(url, key);
  
  // Auto-sync in background if test was successful
  if (testRes.connected) {
    syncStoreToSupabase(store).catch(e => console.warn('[Auto-sync error]', e.message));
  }
  
  res.json({
    success: true,
    message: 'Supabase credentials successfully saved to server environment',
    test: testRes
  });
});

router.post('/supabase/test', async (req, res) => {
  const { url, key } = req.body;
  if (url && key) {
    setRuntimeSupabaseConfig(url, key);
  }
  const result = await testSupabaseConnection(url, key);
  res.json(result);
});

router.post('/supabase/sync', async (req, res) => {
  const result = await syncStoreToSupabase(store);
  res.json(result);
});

// -------------------------------------------------------------
// 2. AUTHENTICATION & USER ROLES (Section 5)
// -------------------------------------------------------------
router.post('/auth/login', (req, res) => {
  const { email, role } = req.body;
  const userRole = role || 'authority';
  const userEmail = email || `${userRole}@disasteros.gov`;
  
  const token = jwt.sign(
    { id: `usr-${Date.now()}`, email: userEmail, role: userRole },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  store.addAuditLog({
    action: "USER_LOGGED_IN",
    entity_type: "user",
    entity_id: userEmail,
    details: `User authenticated with role '${userRole}'`,
    user_email: userEmail,
    user_role: userRole
  });

  res.json({
    token,
    user: {
      email: userEmail,
      role: userRole,
      full_name: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Operator`
    }
  });
});

router.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// -------------------------------------------------------------
// 3. DISASTERS & RISK ZONES (Section 6 & 10)
// -------------------------------------------------------------
router.get('/disasters', (req, res) => {
  res.json({ disasters: store.disasters, zones: store.zones });
});

router.get('/disasters/:id', (req, res) => {
  const disaster = store.disasters.find(d => d.id === req.params.id);
  if (!disaster) return res.status(404).json({ error: "Disaster record not found" });
  const zones = store.zones.filter(z => z.disaster_id === req.params.id);
  res.json({ disaster, zones });
});

// -------------------------------------------------------------
// 4. CITIZEN SOS & INCIDENTS (Section 12 & 13)
// -------------------------------------------------------------
router.get('/incidents', (req, res) => {
  const { status, severity, type } = req.query;
  const incidents = store.getIncidents({ status, severity, type });
  res.json({ incidents, count: incidents.length });
});

router.get('/incidents/:id', (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });
  res.json({ incident });
});

// CITIZEN SOS INGRESS WORKFLOW (Connected Pipeline)
router.post('/sos', async (req, res) => {
  const data = req.body;
  
  // 1. AI semantic classification
  const classification = aiService.classifyIncident(data.description || data.title, data);
  const type = data.type || classification.type;

  // 2. AI Explainable Prioritization
  const priorityResult = aiService.prioritizeIncident({ ...data, type });

  // 3. Persist in store
  const createdIncident = store.createIncident({
    ...data,
    type,
    severity: priorityResult.priority,
    priority_score: priorityResult.priorityScore,
    ai_classification: {
      category: classification.category,
      confidence: classification.confidence,
      recommended_response: priorityResult.recommendedResponse,
      rationale: priorityResult.explanation
    }
  });

  // 4. Real-time broadcast to Command Center & Responders
  eventBus.broadcast('SOS_CREATED', {
    incident: createdIncident,
    priority: priorityResult
  });

  // 4.1 Sync to Supabase Cloud Database (with resilience)
  const sbResult = await syncEntityToSupabase('incidents', {
    id: createdIncident.id,
    tracking_code: createdIncident.tracking_code,
    type: createdIncident.type,
    title: createdIncident.title,
    description: createdIncident.description,
    latitude: createdIncident.latitude,
    longitude: createdIncident.longitude,
    address: createdIncident.address,
    status: createdIncident.status,
    severity: createdIncident.severity,
    priority_score: createdIncident.priority_score,
    affected_count: createdIncident.affected_count || 1,
    injured_count: createdIncident.injured_count || 0,
    trapped_count: createdIncident.trapped_count || 0,
    has_children_elderly: Boolean(createdIncident.has_children_elderly),
    medical_urgency: Boolean(createdIncident.medical_urgency)
  });

  // 5. Emit dynamic reallocation check if critical
  if (priorityResult.priority === 'critical') {
    eventBus.broadcast('INCIDENT_ESCALATED', {
      incident_id: createdIncident.id,
      tracking_code: createdIncident.tracking_code,
      priority_score: priorityResult.priorityScore
    });
  }

  res.status(201).json({
    success: true,
    message: "SOS Emergency Signal Dispatched to Command Center",
    incident: createdIncident,
    tracking_code: createdIncident.tracking_code,
    priority: priorityResult,
    supabase: sbResult
  });
});

router.get('/sos/:code', (req, res) => {
  const incident = store.getIncidentById(req.params.code);
  if (!incident) return res.status(404).json({ error: "SOS Tracking code not found" });
  
  // Find associated mission if any
  const mission = store.missions.find(m => m.incident_id === incident.id);
  const location = store.getLatestLocation(incident.id);
  res.json({ incident, mission: mission || null, location });
});

// Live GPS Location Telemetry Ingress & Staleness Tracking
router.post('/sos/:id/location', (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const telemetry = store.recordLocationUpdate(incident.id, req.body);
  if (!telemetry) return res.status(400).json({ error: "Invalid location coordinates" });

  // Broadcast to Command Center and assigned responders in real-time
  eventBus.broadcast('SOS_LOCATION_UPDATE', {
    incident_id: incident.id,
    tracking_code: incident.tracking_code,
    telemetry
  });

  res.json({ success: true, telemetry });
});

router.get('/sos/:id/location', (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const location = store.getLatestLocation(incident.id);
  res.json({ location });
});

router.get('/sos/:id/location-history', (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const history = store.getLocationHistory(incident.id);
  res.json({ history });
});

// Secure Expiring Tracking Links for Trusted Contacts
router.post('/sos/:id/tracking-token', authenticate, (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const hours = Number(req.body.expires_in_hours) || 24;
  const tokenRecord = store.createTrackingToken(incident.id, req.user?.email || "citizen@example.com", hours);
  res.json({ success: true, ...tokenRecord });
});

// Public verify for authorized expiring tracking tokens (contact access)
router.get('/tracking/verify/:token', (req, res) => {
  const verification = store.verifyTrackingToken(req.params.token);
  if (!verification || !verification.valid) {
    return res.status(403).json({ error: verification?.reason || "Invalid tracking token" });
  }

  const incident = store.getIncidentById(verification.record.incident_id);
  const location = store.getLatestLocation(verification.record.incident_id);
  const mission = store.missions.find(m => m.incident_id === incident?.id);

  res.json({
    valid: true,
    incident: incident ? {
      tracking_code: incident.tracking_code,
      type: incident.type,
      title: incident.title,
      status: incident.status,
      created_at: incident.created_at
    } : null,
    location,
    mission_status: mission?.status || null
  });
});

router.post('/tracking/revoke/:token', authenticate, (req, res) => {
  const success = store.revokeTrackingToken(req.params.token, req.user);
  if (!success) return res.status(404).json({ error: "Token not found" });
  res.json({ success: true, message: "Tracking token successfully revoked" });
});

// Emergency Contacts
router.get('/user/contacts', (req, res) => {
  const email = req.headers['x-demo-email'] || "citizen@example.com";
  const contacts = store.getEmergencyContacts(email);
  res.json({ contacts });
});

router.post('/user/contacts', (req, res) => {
  const email = req.headers['x-demo-email'] || "citizen@example.com";
  const updated = store.updateEmergencyContacts(email, req.body.contacts || [], req.user || { email });
  res.json({ success: true, contacts: updated });
});

router.post('/sos/:id/notify-contacts', (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const email = incident.reporter_email || "citizen@example.com";
  const contacts = store.getEmergencyContacts(email);

  // Honest delivery status report
  const notified = contacts.map(c => ({
    name: c.name,
    relationship: c.relationship,
    phone: c.phone,
    email: c.email,
    sms_status: c.notify_sms ? "dispatched_simulated" : "skipped",
    email_status: c.notify_email ? "dispatched_simulated" : "skipped",
    location_shared: c.share_live_location
  }));

  res.json({
    success: true,
    contacts_notified_count: notified.length,
    delivery_report: notified,
    notice: "SMS & Email gateways simulated in development mode without external Twilio/Resend credentials."
  });
});

// Nearby Emergency Alert Network
router.get('/nearby-alerts', (req, res) => {
  res.json({ alerts: store.nearbyAlerts });
});

router.post('/nearby-alerts', (req, res) => {
  const alert = store.createNearbyAlert(req.body, req.user || {});
  eventBus.broadcast('NEARBY_ALERT_BROADCAST', alert);
  res.status(201).json({ success: true, alert });
});

router.post('/nearby-alerts/:id/respond', (req, res) => {
  const response = store.respondToNearbyAlert(req.params.id, req.body);
  if (!response) return res.status(404).json({ error: "Nearby alert not found" });

  eventBus.broadcast('NEARBY_ALERT_RESPONSE', response);
  res.json({ success: true, response });
});

router.patch('/incidents/:id', authenticate, (req, res) => {
  const updated = store.updateIncident(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ error: "Incident not found" });
  
  eventBus.broadcast('INCIDENT_UPDATED', updated);
  syncEntityToSupabase('incidents', updated);
  res.json({ incident: updated });
});

// -------------------------------------------------------------
// 5. AI ENGINE ENDPOINTS (Section 13, 14, 15)
// -------------------------------------------------------------
router.post('/ai/prioritize', (req, res) => {
  const result = aiService.prioritizeIncident(req.body);
  res.json(result);
});

router.post('/ai/classify', (req, res) => {
  const result = aiService.classifyIncident(req.body.text || req.body.description, req.body);
  res.json(result);
});

router.post('/ai/allocate', (req, res) => {
  const { incident_id } = req.body;
  if (!incident_id) return res.status(400).json({ error: "incident_id is required" });
  const recommendation = allocationEngine.recommendAllocation(incident_id);
  if (!recommendation) return res.status(404).json({ error: "Incident not found for allocation" });
  res.json(recommendation);
});

router.get('/ai/dynamic-reallocation', (req, res) => {
  const reallocations = allocationEngine.checkDynamicReallocation();
  res.json({ count: reallocations.length, recommendations: reallocations });
});

// Google Gemini Status & Runtime Configuration
router.get('/ai/gemini-status', (req, res) => {
  const headerKey = req.headers['x-gemini-key'];
  if (headerKey && !aiService.geminiKey) {
    return res.json({
      configured: true,
      maskedKey: headerKey.length > 10 ? `${headerKey.slice(0, 6)}...${headerKey.slice(-4)}` : 'Client Key',
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      provider: 'Google Gemini (Header Configured)'
    });
  }
  res.json(aiService.getStatus());
});

router.post('/ai/gemini-config', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    aiService.setApiKey(null);
    return res.json({ success: true, message: "Gemini API key cleared. Operating in heuristic simulation mode.", configured: false });
  }

  try {
    const testResult = await aiService.testApiKey(apiKey.trim());
    aiService.setApiKey(apiKey.trim());
    res.json({
      success: true,
      message: "Gemini API key successfully verified & active!",
      model: testResult.model || process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      status: aiService.getStatus()
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: `Gemini verification failed: ${err.message}. Please check that your Google AI Studio API key is active.`
    });
  }
});

router.post('/ai/assistant', async (req, res) => {
  const { question, history, context, role, apiKey } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  const activeKey = apiKey || req.headers['x-gemini-key'];
  
  const fullContext = {
    incidents: store.incidents,
    teams: store.rescueTeams,
    warehouses: store.warehouses,
    shelters: store.shelters || [],
    hospitals: store.hospitals || [],
    hazards: store.roadHazards || [],
    ...(context || {})
  };

  const answer = await aiService.answerQuestion(question, {
    history: history || [],
    context: fullContext,
    role: role || 'citizen',
    apiKey: activeKey
  });

  res.json(answer);
});

// Tool-Connected Copilot Architecture
router.get('/ai/copilot/tools', (req, res) => {
  const role = req.headers['x-demo-role'] || 'citizen';
  const tools = aiService.getAvailableTools(role);
  res.json({ tools, role });
});

router.post('/ai/copilot/execute-tool', async (req, res) => {
  const { tool, params } = req.body;
  const role = req.headers['x-demo-role'] || 'citizen';
  const email = req.headers['x-demo-email'] || `${role}@disasteros.gov`;

  const result = await aiService.executeTool(tool, params || {}, {
    role,
    user: { email, role },
    store,
    simulationEngine,
    routingService
  });

  if (result.unauthorized) {
    return res.status(403).json(result);
  }

  res.json(result);
});

router.post('/ai/copilot/chat', async (req, res) => {
  const { question, history, context, role, apiKey } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  const activeRole = role || req.headers['x-demo-role'] || 'citizen';
  const activeEmail = req.headers['x-demo-email'] || `${activeRole}@disasteros.gov`;
  const activeKey = apiKey || req.headers['x-gemini-key'];

  const copilotResponse = await aiService.copilotChat({
    question,
    history: history || [],
    role: activeRole,
    user: { email: activeEmail, role: activeRole },
    context: context || {},
    apiKey: activeKey,
    store,
    simulationEngine,
    routingService
  });

  res.json(copilotResponse);
});

// -------------------------------------------------------------
// 6. RESOURCE MANAGEMENT & WAREHOUSES (Section 17)
// -------------------------------------------------------------
router.get('/warehouses', (req, res) => {
  res.json({ warehouses: store.warehouses });
});

router.get('/inventory', (req, res) => {
  const { warehouse_id, category, status } = req.query;
  let items = [...store.inventory];
  if (warehouse_id) items = items.filter(i => i.warehouse_id === warehouse_id);
  if (category) items = items.filter(i => i.category === category);
  if (status) items = items.filter(i => i.status === status);
  res.json({ inventory: items, count: items.length });
});

router.post('/inventory/dispatch', authenticate, (req, res) => {
  const { inventory_id, quantity, reason, mission_id } = req.body;
  const item = store.updateInventoryStock(inventory_id, -Math.abs(Number(quantity) || 1), "dispatch", reason, req.user);
  if (!item) return res.status(404).json({ error: "Inventory item not found" });

  eventBus.broadcast('INVENTORY_UPDATED', { item, change: -quantity });
  res.json({ success: true, item });
});

router.post('/inventory/replenish', authenticate, (req, res) => {
  const { inventory_id, quantity, reason } = req.body;
  const item = store.updateInventoryStock(inventory_id, Math.abs(Number(quantity) || 50), "replenish", reason, req.user);
  if (!item) return res.status(404).json({ error: "Inventory item not found" });

  eventBus.broadcast('INVENTORY_UPDATED', { item, change: quantity });
  res.json({ success: true, item });
});

// -------------------------------------------------------------
// 7. VEHICLES & LOGISTICS FLEET (Section 18)
// -------------------------------------------------------------
router.get('/vehicles', (req, res) => {
  res.json({ vehicles: store.vehicles });
});

router.patch('/vehicles/:id', authenticate, (req, res) => {
  const index = store.vehicles.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Vehicle not found" });
  store.vehicles[index] = { ...store.vehicles[index], ...req.body, updated_at: new Date().toISOString() };
  
  eventBus.broadcast('VEHICLE_STATUS_CHANGED', store.vehicles[index]);
  syncEntityToSupabase('vehicles', store.vehicles[index]);
  res.json({ vehicle: store.vehicles[index] });
});

// -------------------------------------------------------------
// 8. RESCUE TEAMS & MISSIONS (Section 22 & 15)
// -------------------------------------------------------------
router.get('/rescue-teams', (req, res) => {
  res.json({ rescue_teams: store.rescueTeams });
});

router.patch('/rescue-teams/:id', authenticate, (req, res) => {
  const team = store.rescueTeams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: "Rescue team not found" });
  if (req.body.status) team.status = req.body.status;
  if (req.body.lead_name) team.lead_name = req.body.lead_name;
  if (req.body.phone) team.phone = req.body.phone;
  if (req.body.capacity !== undefined) team.capacity = Number(req.body.capacity);
  eventBus.broadcast('TEAM_STATUS_CHANGED', team);
  syncEntityToSupabase('rescue_teams', team);
  res.json({ rescue_team: team });
});

router.get('/missions', (req, res) => {
  res.json({ missions: store.missions });
});

// Authority Approves Allocation & Dispatches Mission
router.post('/missions', authenticate, (req, res) => {
  const newMission = store.createMission(req.body, req.user);
  
  eventBus.broadcast('MISSION_CREATED', newMission);
  eventBus.broadcast('RESOURCE_ALLOCATED', {
    team_id: newMission.team_id,
    vehicle_id: newMission.vehicle_id,
    mission_id: newMission.id
  });
  syncEntityToSupabase('missions', newMission);

  res.status(201).json({ success: true, mission: newMission });
});

router.patch('/missions/:id', authenticate, (req, res) => {
  const updated = store.updateMission(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ error: "Mission not found" });

  eventBus.broadcast('MISSION_UPDATED', updated);
  if (updated.status === 'completed') {
    eventBus.broadcast('MISSION_COMPLETED', updated);
  }
  syncEntityToSupabase('missions', updated);

  res.json({ mission: updated });
});

// -------------------------------------------------------------
// 9. HOSPITALS & SHELTERS (Section 20 & 21)
// -------------------------------------------------------------
router.get('/hospitals', (req, res) => {
  res.json({ hospitals: store.hospitals });
});

router.patch('/hospitals/:id/capacity', authenticate, (req, res) => {
  const hospital = store.hospitals.find(h => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: "Hospital not found" });
  
  if (req.body.available_beds !== undefined) hospital.available_beds = Number(req.body.available_beds);
  if (req.body.icu_available !== undefined) hospital.icu_available = Number(req.body.icu_available);
  if (req.body.status) hospital.status = req.body.status;
  
  eventBus.broadcast('HOSPITAL_CAPACITY_CHANGED', hospital);
  syncEntityToSupabase('hospitals', hospital);
  res.json({ hospital });
});

router.get('/shelters', (req, res) => {
  res.json({ shelters: store.shelters });
});

router.patch('/shelters/:id/occupancy', authenticate, (req, res) => {
  const shelter = store.shelters.find(s => s.id === req.params.id);
  if (!shelter) return res.status(404).json({ error: "Shelter not found" });
  
  if (req.body.current_occupancy !== undefined) shelter.current_occupancy = Number(req.body.current_occupancy);
  if (req.body.status) shelter.status = req.body.status;
  
  eventBus.broadcast('SHELTER_CAPACITY_CHANGED', shelter);
  syncEntityToSupabase('shelters', shelter);
  res.json({ shelter });
});

// -------------------------------------------------------------
// 10. HAZARD ROUTING & ROAD CONDITIONS (Section 19)
// -------------------------------------------------------------
router.get('/routes/calculate', (req, res) => {
  const { startLat, startLng, destLat, destLng, vehicleType } = req.query;
  const result = routingService.calculateEmergencyRoute(
    Number(startLat) || 37.7749,
    Number(startLng) || -122.4194,
    Number(destLat) || 37.7925,
    Number(destLng) || -122.4180,
    vehicleType || 'ambulance'
  );
  res.json(result);
});

router.get('/road-conditions', (req, res) => {
  res.json({ road_hazards: store.roadHazards });
});

router.post('/road-conditions', authenticate, (req, res) => {
  const newHazard = {
    id: `road-${Date.now().toString().slice(-4)}`,
    road_name: req.body.road_name || "Unidentified Segment",
    hazard_type: req.body.hazard_type || "flooded",
    latitude: Number(req.body.latitude) || 37.7749,
    longitude: Number(req.body.longitude) || -122.4194,
    is_passable: Boolean(req.body.is_passable),
    severity: req.body.severity || "impassable",
    reported_at: new Date().toISOString(),
    description: req.body.description || ""
  };
  store.roadHazards.unshift(newHazard);
  eventBus.broadcast('ROAD_BLOCKED', newHazard);
  res.status(201).json({ hazard: newHazard });
});

// -------------------------------------------------------------
// 11. NGOS & VOLUNTEERS (Section 23)
// -------------------------------------------------------------
router.get('/ngos', (req, res) => {
  res.json({ ngos: store.ngos });
});

router.get('/volunteers', (req, res) => {
  res.json({ volunteers: store.volunteers });
});

router.post('/volunteers', (req, res) => {
  const newVolunteer = {
    id: `vol-${Date.now().toString().slice(-4)}`,
    full_name: req.body.full_name,
    phone: req.body.phone,
    skills: req.body.skills || [],
    availability_status: "available",
    assigned_task: null
  };
  store.volunteers.push(newVolunteer);
  res.status(201).json({ volunteer: newVolunteer });
});

router.patch('/volunteers/:id', authenticate, (req, res) => {
  const vol = store.volunteers.find(v => v.id === req.params.id);
  if (!vol) return res.status(404).json({ error: "Volunteer not found" });
  if (req.body.availability_status) vol.availability_status = req.body.availability_status;
  if (req.body.assigned_task !== undefined) vol.assigned_task = req.body.assigned_task;
  res.json({ volunteer: vol });
});

// -------------------------------------------------------------
// 12. ALERTS & NOTIFICATIONS (Section 24)
// -------------------------------------------------------------
router.get('/alerts', (req, res) => {
  res.json({ alerts: store.alerts });
});

router.post('/alerts', authenticate, (req, res) => {
  const alert = {
    id: `alert-${Date.now().toString().slice(-4)}`,
    title: req.body.title,
    message: req.body.message,
    severity: req.body.severity || "severe",
    type: req.body.type || "disaster_warning",
    affected_area: req.body.affected_area || "Citywide",
    channels: req.body.channels || ["push"],
    sent_at: new Date().toISOString()
  };
  store.alerts.unshift(alert);
  eventBus.broadcast('WEATHER_ALERT', alert);
  res.status(201).json({ alert });
});

// -------------------------------------------------------------
// 13. WHAT-IF SIMULATION & HACKATHON CASCADE (Section 31 & 32)
// -------------------------------------------------------------
router.get('/simulation/what-if', (req, res) => {
  const { scenario } = req.query;
  const analysis = simulationEngine.runWhatIfAnalysis(scenario || 'hospital_down', req.query);
  res.json(analysis);
});

router.post('/simulation/start-flood', (req, res) => {
  const sim = simulationEngine.startFloodSimulation();
  res.json({ success: true, message: "Interactive Flood Simulation Cascade Initiated", simulation: sim });
});

router.post('/simulation/stop', (req, res) => {
  simulationEngine.stopSimulation();
  res.json({ success: true, message: "Simulation stopped" });
});

// -------------------------------------------------------------
// 14. RISK PREDICTION & VULNERABILITY (Section 30)
// -------------------------------------------------------------
router.get('/risk/analysis', async (req, res) => {
  const weather = await externalApis.getWeather();
  const earthquakes = await externalApis.getEarthquakes();
  
  const riskAnalysis = {
    overall_threat_level: "HIGH",
    composite_risk_score: 88,
    disaster_modalities: {
      floods: {
        status: "Active Alert",
        severity: "Extreme",
        score: 92,
        high_risk_zone: "Zone A - Marina Basin & Mission Lower Arterial",
        early_warning: "Water levels rising at 2.4 in/hr. Peak crest predicted in 38 mins.",
        lead_time_min: 38
      },
      earthquakes: {
        status: "Elevated Watch",
        severity: "High",
        score: 84,
        high_risk_zone: "Zone B - Fault Fracture & Masonry Historic District",
        early_warning: "5.4M initial rupture logged with 4 aftershocks (2.8M - 3.6M). Liquefaction watch active.",
        lead_time_min: 15
      },
      fires: {
        status: "High Advisory",
        severity: "Severe",
        score: 79,
        high_risk_zone: "Zone C - Hillside Timber Belt & Chemical Buffer",
        early_warning: "Industrial chemical fire plume moving NE at 12 km/h. Smoke particulate AQI 280.",
        lead_time_min: 45
      },
      extreme_weather: {
        status: "Severe Warning",
        severity: "Critical",
        score: 89,
        high_risk_zone: "Zone A & Coastal Sector Grid",
        early_warning: "Storm Zephyr sustained winds 84 km/h with 108 km/h gale gusts. Structural debris risk.",
        lead_time_min: 25
      }
    },
    active_threats: [
      { name: "Rapid Hydrological Flash Flooding", level: "Extreme", zone: "Zone A - Marina Waterfront", factor: "Heavy sustained precipitation (38.4 mm/hr) + storm surge" },
      { name: "Fault Fracture & Seismic Aftershock Shockwave", level: "High", zone: "Zone B - Industrial & Unreinforced Masonry", factor: "5.4M event + active aftershock cluster" },
      { name: "Urban Chemical Fire & Wildfire Embers", level: "Severe", zone: "Zone C - Hillside Timber Belt", factor: "Wind-assisted perimeter expansion at 12 km/h" },
      { name: "Atmospheric River & Extreme Gale Weather", level: "Critical", zone: "Regional Coastal Belt", factor: "Barometric drop (982 hPa) with 108 km/h gusts" }
    ],
    infrastructure_readiness: {
      power_grid: "78% Operational (Substation 4 submerged)",
      potable_water: "82% Operational (Folsom Main Under Repair)",
      emergency_shelter_capacity: `${store.shelters.reduce((acc, s) => acc + (s.capacity - s.current_occupancy), 0)} spaces available`
    },
    external_telemetry: {
      weather,
      earthquakes: earthquakes.events?.slice(0, 3)
    }
  };
  res.json(riskAnalysis);
});

// -------------------------------------------------------------
// 15. ANALYTICS & AUDIT LOGS (Section 33 & 34)
// -------------------------------------------------------------
router.get('/analytics', (req, res) => {
  const totalIncidents = store.incidents.length;
  const resolvedCount = store.incidents.filter(i => i.status === 'resolved').length;
  const criticalCount = store.incidents.filter(i => i.severity === 'critical').length;
  const inProgressCount = store.incidents.filter(i => i.status === 'in_progress' || i.status === 'assigned').length;

  const typeDistribution = [
    { name: "Flood", count: store.incidents.filter(i => i.type === 'flood').length },
    { name: "Medical", count: store.incidents.filter(i => i.type === 'medical').length },
    { name: "Structural", count: store.incidents.filter(i => i.type === 'structural_collapse').length },
    { name: "Fire/Hazmat", count: store.incidents.filter(i => i.type === 'fire').length },
    { name: "Water/Food", count: store.incidents.filter(i => i.type === 'water_food').length }
  ];

  const hospitalCapacity = store.hospitals.map(h => ({
    name: h.name.split(' ')[0],
    total_beds: h.total_beds,
    available_beds: h.available_beds,
    icu_available: h.icu_available
  }));

  const shelterOccupancy = store.shelters.map(s => ({
    name: s.name.split(' ')[0],
    capacity: s.capacity,
    occupied: s.current_occupancy,
    rate: Math.round((s.current_occupancy / s.capacity) * 100)
  }));

  res.json({
    kpis: {
      active_incidents: totalIncidents - resolvedCount,
      critical_sos: criticalCount,
      average_response_minutes: 8.4,
      total_rescued: 43,
      teams_deployed: store.rescueTeams.filter(t => t.status !== 'available').length,
      hospital_beds_free: store.hospitals.reduce((acc, h) => acc + h.available_beds, 0),
      shelter_spaces_free: store.shelters.reduce((acc, s) => acc + (s.capacity - s.current_occupancy), 0)
    },
    type_distribution: typeDistribution,
    hospital_capacity: hospitalCapacity,
    shelter_occupancy: shelterOccupancy,
    recent_trend: [
      { time: "08:00", incidents: 3, resolved: 1 },
      { time: "10:00", incidents: 7, resolved: 2 },
      { time: "12:00", incidents: 14, resolved: 5 },
      { time: "14:00", incidents: 19, resolved: 9 },
      { time: "16:00", incidents: 22, resolved: 12 }
    ]
  });
});

router.get('/audit-logs', (req, res) => {
  res.json({ audit_logs: store.auditLogs });
});

// -------------------------------------------------------------
// 15.1 RELIEFCHAIN & DONATIONS LEDGER
// -------------------------------------------------------------
router.get('/relief/campaigns', (req, res) => {
  const { category, urgent } = req.query;
  const campaigns = store.getCampaigns({ category, urgent });
  res.json({ campaigns, count: campaigns.length });
});

router.get('/relief/campaigns/:id', (req, res) => {
  const campaign = store.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });
  const contributions = store.contributions.filter(c => c.campaign_id === campaign.id);
  const allocations = store.aidAllocations.filter(a => a.campaign_id === campaign.id);
  const distributions = store.aidDistributions.filter(d => d.campaign_id === campaign.id);
  res.json({ campaign, contributions, allocations, distributions });
});

router.post('/relief/campaigns', authenticate, (req, res) => {
  const campaign = store.createCampaign(req.body, req.user);
  eventBus.broadcast('CAMPAIGN_CREATED', campaign);
  res.status(201).json({ success: true, campaign });
});

router.post('/relief/contribute', (req, res) => {
  const contribution = store.createContribution(req.body);
  if (!contribution) return res.status(400).json({ error: "Invalid donation amount or campaign ID" });

  eventBus.broadcast('DONATION_RECEIVED', contribution);
  res.status(201).json({
    success: true,
    message: "Thank you for your life-saving contribution!",
    contribution,
    receipt_number: contribution.receipt_number,
    tx_hash: contribution.tx_hash
  });
});

router.get('/relief/contributions', (req, res) => {
  const { campaign_id, donor_email } = req.query;
  let items = [...store.contributions];
  if (campaign_id) items = items.filter(c => c.campaign_id === campaign_id);
  if (donor_email) items = items.filter(c => c.donor_email === donor_email);
  res.json({ contributions: items, count: items.length });
});

router.post('/relief/allocations', authenticate, (req, res) => {
  const allocation = store.createAidAllocation(req.body, req.user);
  if (!allocation) return res.status(400).json({ error: "Invalid allocation parameters or campaign ID" });

  eventBus.broadcast('AID_ALLOCATED', allocation);
  res.status(201).json({ success: true, allocation });
});

router.get('/relief/allocations', (req, res) => {
  const { campaign_id } = req.query;
  let items = [...store.aidAllocations];
  if (campaign_id) items = items.filter(a => a.campaign_id === campaign_id);
  res.json({ allocations: items, count: items.length });
});

router.post('/relief/distributions', authenticate, (req, res) => {
  const distribution = store.createAidDistribution(req.body, req.user);
  eventBus.broadcast('AID_DISTRIBUTED', distribution);
  res.status(201).json({ success: true, distribution });
});

router.get('/relief/distributions', (req, res) => {
  const { campaign_id, allocation_id } = req.query;
  let items = [...store.aidDistributions];
  if (campaign_id) items = items.filter(d => d.campaign_id === campaign_id);
  if (allocation_id) items = items.filter(d => d.allocation_id === allocation_id);
  res.json({ distributions: items, count: items.length });
});

router.get('/relief/ledger', (req, res) => {
  const totalRaised = store.contributions.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalAllocated = store.aidAllocations.reduce((acc, a) => acc + (a.allocated_amount || 0), 0);
  const totalRecipients = store.aidDistributions.reduce((acc, d) => acc + (d.recipient_count || 0), 0);

  res.json({
    kpis: {
      total_campaigns: store.campaigns.length,
      verified_campaigns: store.campaigns.filter(c => c.verification_status === 'verified').length,
      total_raised_usd: totalRaised,
      total_allocated_usd: totalAllocated,
      unallocated_buffer_usd: Math.max(0, totalRaised - totalAllocated),
      total_recipients_reached: totalRecipients,
      web3_attestation_records: store.contributions.filter(c => c.payment_method === 'web3_usdc').length + 2
    },
    campaigns: store.campaigns,
    recent_transactions: store.contributions.slice(0, 10),
    recent_distributions: store.aidDistributions.slice(0, 10)
  });
});

// -------------------------------------------------------------
// 15.2 RESILIENCE IMPROVEMENT PLANS & DEPENDENCY SCENARIOS
// -------------------------------------------------------------
router.get('/resilience/plans', (req, res) => {
  const { status, priority } = req.query;
  const plans = store.getImprovementPlans({ status, priority });
  res.json({ plans, count: plans.length });
});

router.post('/resilience/plans', authenticate, (req, res) => {
  const plan = store.createImprovementPlan(req.body, req.user);
  eventBus.broadcast('IMPROVEMENT_PLAN_CREATED', plan);
  res.status(201).json({ success: true, plan });
});

router.patch('/resilience/plans/:id', authenticate, (req, res) => {
  const updated = store.updateImprovementPlan(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ error: "Improvement plan not found" });

  eventBus.broadcast('IMPROVEMENT_PLAN_UPDATED', updated);
  res.json({ success: true, plan: updated });
});

router.get('/resilience/consequences', (req, res) => {
  // Cascading infrastructure dependency graph
  const nodes = [
    { id: "node-storm", label: "Storm Surge / Heavy Rainfall (42mm/hr)", type: "hazard", status: "active", zone: "Zone A Waterfront" },
    { id: "node-underpass", label: "14th St Underpass (Flooded 4.2ft)", type: "road", status: "impassable", dependency: "node-storm" },
    { id: "node-north-depot", label: "North Forward Cache Depot", type: "depot", status: "isolated", dependency: "node-underpass" },
    { id: "node-hosp-stjude", label: "St. Jude Coastal Medical Pavilion", type: "hospital", status: "strained", dependency: "node-north-depot" },
    { id: "node-substation", label: "Substation 4 (Submerged)", type: "power", status: "offline", dependency: "node-storm" },
    { id: "node-folsom-main", label: "Folsom Potable Water Main", type: "water", status: "pressure_drop", dependency: "node-substation" },
    { id: "node-shelter-presidio", label: "Presidio Community Shelter", type: "shelter", status: "operating_at_capacity", dependency: "node-folsom-main" }
  ];

  const edges = [
    { source: "node-storm", target: "node-underpass", relation: "Inundates Arterial Access" },
    { source: "node-underpass", target: "node-north-depot", relation: "Blocks Transit to Cache Depot" },
    { source: "node-north-depot", target: "node-hosp-stjude", relation: "Delays Oxygen & Trauma Restock" },
    { source: "node-storm", target: "node-substation", relation: "Submerges Grid Transformers" },
    { source: "node-substation", target: "node-folsom-main", relation: "Cuts Off Water Booster Pump Power" },
    { source: "node-folsom-main", target: "node-shelter-presidio", relation: "Requires Trucked Water Logistics" }
  ];

  const singlePointsOfFailure = [
    {
      asset: "14th St Underpass",
      impact: "Single ground route between North Depot and downtown trauma centers. Failure forces +14 minute detour.",
      recommendation: "Elevated High-Ground corridor via Guerrero & Van Ness Ave."
    },
    {
      asset: "Substation 4 Backup Transfer Switch",
      impact: "Feeds potable water booster stations. Failure drops municipal water pressure below sanitization limits.",
      recommendation: "Deploy mobile 150kW diesel pump generator to Folsom Station."
    }
  ];

  res.json({
    scenario_title: "Atmospheric River Inundation & Cascading Infrastructure Dependencies",
    nodes,
    edges,
    single_points_of_failure: singlePointsOfFailure,
    overall_resilience_score: 72,
    readiness_breakdown: {
      evacuation_corridors: "68% (1 critical underpass blocked)",
      hospital_bed_buffer: "84% (42 beds, 8 ICU available)",
      water_potability: "76% (Boil notice active for lower basin)",
      backup_generation: "92% (Hospital diesel reserves at 3.5 days)"
    }
  });
});

// -------------------------------------------------------------
// 16. EXTERNAL APIS (Section 25)
// -------------------------------------------------------------
router.get('/external/weather', async (req, res) => {
  const data = await externalApis.getWeather();
  res.json(data);
});

router.get('/external/earthquakes', async (req, res) => {
  const data = await externalApis.getEarthquakes();
  res.json(data);
});

router.get('/external/gdacs', async (req, res) => {
  const data = await externalApis.getGlobalDisasterAlerts();
  res.json(data);
});

// -------------------------------------------------------------
// 17. API DOCUMENTATION SITEMAP (Section 42)
// -------------------------------------------------------------
router.get('/docs', (req, res) => {
  res.json({
    name: "DisasterOS Intelligent Operations Platform API",
    version: "1.0.0",
    specification: "OpenAPI 3.0 Compatible",
    endpoints: [
      { path: "/api/health", method: "GET", description: "System health check" },
      { path: "/api/auth/login", method: "POST", description: "JWT session generation" },
      { path: "/api/sos", method: "POST", description: "Citizen SOS ingress & AI classification" },
      { path: "/api/incidents", method: "GET", description: "Query active incident feed" },
      { path: "/api/ai/prioritize", method: "POST", description: "Explainable multi-factor scoring" },
      { path: "/api/ai/allocate", method: "POST", description: "Smart resource matching engine" },
      { path: "/api/ai/assistant", method: "POST", description: "Natural language command center intelligence" },
      { path: "/api/missions", method: "POST", description: "Dispatch approval & responder mission creation" },
      { path: "/api/warehouses", method: "GET", description: "Warehouse listings" },
      { path: "/api/inventory", method: "GET", description: "Real-time supplies and threshold alerts" },
      { path: "/api/routes/calculate", method: "GET", description: "Hazard-avoiding emergency routing" },
      { path: "/api/simulation/start-flood", method: "POST", description: "Start interactive hackathon flood cascade" },
      { path: "/api/risk/analysis", method: "GET", description: "Predictive composite risk index" },
      { path: "/api/analytics", method: "GET", description: "Command center KPIs & distributions" },
      { path: "/api/audit-logs", method: "GET", description: "Immutable state mutation log" }
    ]
  });
});

export default router;
