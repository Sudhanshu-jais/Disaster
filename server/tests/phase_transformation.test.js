// DisasterOS Phase Transformation Verification Test
import { store } from '../src/database/store.js';
import { aiService } from '../src/services/aiService.js';
import { simulationEngine } from '../src/services/simulationEngine.js';
import { routingService } from '../src/services/routingService.js';

console.log("\n--- STARTING DISASTEROS TRANSFORMATION CAPABILITIES TEST ---\n");

// 1. Test Live SOS Location Telemetry & Staleness
console.log("[1/6] Testing Live SOS Location Telemetry & Staleness...");
const incident = store.incidents[0];
const update = store.recordLocationUpdate(incident.id, {
  latitude: 37.7930,
  longitude: -122.4185,
  accuracy: 8.5,
  battery_level: 85
});
if (!update || update.accuracy !== 8.5) throw new Error("Location update failed");
const latestLoc = store.getLatestLocation(incident.id);
if (!latestLoc || latestLoc.is_stale !== false) throw new Error("Latest location retrieval failed");
console.log(`✓ Recorded GPS fix (${latestLoc.latitude}, ${latestLoc.longitude}) with accuracy ${latestLoc.accuracy}m (Stale: ${latestLoc.is_stale})`);

// 2. Test Expiring Tracking Token for Emergency Contacts
console.log("\n[2/6] Testing Expiring Tracking Tokens...");
const tokenRecord = store.createTrackingToken(incident.id, "citizen@example.com", 24);
if (!tokenRecord || !tokenRecord.token) throw new Error("Failed to create tracking token");
const verifyRes = store.verifyTrackingToken(tokenRecord.token);
if (!verifyRes || !verifyRes.valid) throw new Error("Tracking token verification failed");
console.log(`✓ Created and verified tracking token ${tokenRecord.token.slice(0, 10)}... (Expires: ${tokenRecord.expires_at})`);

// 3. Test Consent-Based Nearby Emergency Alert Network
console.log("\n[3/6] Testing Nearby Emergency Alert Network...");
const nearbyAlert = store.createNearbyAlert({
  incident_id: incident.id,
  tracking_code: incident.tracking_code,
  latitude: 37.7925,
  longitude: -122.4180,
  radius_km: 1.5,
  title: "Flash Flood Nearby Assistance",
  message: "Family trapped in basement apartment. Safe nearby assistance requested."
});
if (!nearbyAlert || nearbyAlert.radius_km !== 1.5) throw new Error("Failed to create nearby alert");
const alertResponse = store.respondToNearbyAlert(nearbyAlert.id, {
  user_email: "volunteer@example.com",
  response_type: "can_assist",
  note: "I have a kayak and first-aid kit, standing by on higher ground"
});
if (!alertResponse || alertResponse.response_type !== 'can_assist') throw new Error("Failed to respond to alert");
console.log(`✓ Nearby alert created (${nearbyAlert.opted_in_recipients_count} notified in ${nearbyAlert.radius_km}km). Response recorded.`);

// 4. Test ReliefChain & Donations Ledger
console.log("\n[4/6] Testing ReliefChain Ledger & Aid Allocation...");
const campaigns = store.getCampaigns();
if (campaigns.length === 0) throw new Error("No campaigns found");
const targetCamp = campaigns[0];
const initialRaised = targetCamp.raised_amount;
const donation = store.createContribution({
  campaign_id: targetCamp.id,
  donor_name: "Verification Suite",
  donor_email: "test@disasteros.gov",
  amount: 500,
  payment_method: "web3_usdc"
});
if (!donation || donation.amount !== 500 || !donation.tx_hash) throw new Error("Donation creation failed");
if (targetCamp.raised_amount !== initialRaised + 500) throw new Error("Campaign raised amount did not update");

const allocation = store.createAidAllocation({
  campaign_id: targetCamp.id,
  title: "Emergency Water Purification Tablets",
  allocated_amount: 1500,
  recipient_entity: "Civic Center Hub",
  purpose: "Purchase of 500 pack chlorine tablets"
}, { full_name: "Chief Director Marcus Vance", role: "authority" });
if (!allocation || allocation.allocated_amount !== 1500) throw new Error("Aid allocation failed");

const distribution = store.createAidDistribution({
  allocation_id: allocation.id,
  campaign_id: targetCamp.id,
  item_or_service: "Water Purification Tablets",
  quantity: "500 packs",
  recipient_count: 250,
  location: "Civic Center Shelter"
}, { full_name: "Rachel Simmons", role: "ngo" });
if (!distribution || distribution.recipient_count !== 250) throw new Error("Aid distribution failed");
console.log(`✓ Donation $500 received (Receipt: ${donation.receipt_number}, Tx: ${donation.tx_hash.slice(0, 16)}...). Allocation & Distribution recorded.`);

// 5. Test Resilience Improvement Plans
console.log("\n[5/6] Testing Resilience Improvement Plans & Cascading Consequences...");
const plans = store.getImprovementPlans();
if (plans.length === 0) throw new Error("No improvement plans found");
const plan = plans[0];
const updatedPlan = store.updateImprovementPlan(plan.id, { progress_pct: 75, status: "in_progress" });
if (updatedPlan.progress_pct !== 75) throw new Error("Failed to update improvement plan");
console.log(`✓ Resilience Plan '${plan.id}' progress updated to ${updatedPlan.progress_pct}% (${updatedPlan.status})`);

// 6. Test Tool-Connected Copilot Architecture
console.log("\n[6/6] Testing Tool-Connected Copilot Architecture & Role Guardrails...");
const citizenTools = aiService.getAvailableTools('citizen');
const operatorTools = aiService.getAvailableTools('operator');
if (citizenTools.length >= operatorTools.length) throw new Error("Operator should have privileged tools");

// Test Citizen calling an unauthorized tool
const blockedCall = await aiService.executeTool('run_simulation', {}, {
  role: 'citizen',
  store,
  simulationEngine,
  routingService
});
if (!blockedCall.unauthorized) throw new Error("Citizen was not blocked from operator simulation tool!");

// Test Operator calling simulation tool
const allowedCall = await aiService.executeTool('run_simulation', { scenario: 'hospital_down' }, {
  role: 'operator',
  store,
  simulationEngine,
  routingService
});
if (allowedCall.unauthorized || !allowedCall.simulated) throw new Error("Operator was blocked from simulation tool!");

// Test Copilot dialogue with grounded tool calling
const copilotRes = await aiService.copilotChat({
  question: "How many active incidents are there and what is the situation?",
  role: 'operator',
  user: { email: "authority@disasteros.gov", role: "authority" },
  store,
  simulationEngine,
  routingService
});
if (!copilotRes.tools_executed.includes('get_active_incidents')) {
  throw new Error("Copilot did not execute get_active_incidents tool!");
}
console.log(`✓ Copilot executed tools: [${copilotRes.tools_executed.join(', ')}] with ${copilotRes.confidence * 100}% confidence.`);

console.log("\n=======================================================");
console.log("🎉 ALL TRANSFORMATION CAPABILITIES VERIFIED 100%!");
console.log("=======================================================\n");
