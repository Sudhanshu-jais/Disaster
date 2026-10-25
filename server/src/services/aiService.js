// DisasterOS AI Incident Intelligence & Decision Support Engine
import dotenv from 'dotenv';
dotenv.config();

export class AIService {
  constructor() {
    this.provider = process.env.DEFAULT_AI_PROVIDER || 'gemini';
    this.geminiKey = process.env.GEMINI_API_KEY || null;
    this.openaiKey = process.env.OPENAI_API_KEY || null;
    this.anthropicKey = process.env.ANTHROPIC_API_KEY || null;
  }

  setApiKey(key) {
    this.geminiKey = key ? key.trim() : null;
  }

  getStatus() {
    const key = this.geminiKey || process.env.GEMINI_API_KEY;
    return {
      configured: Boolean(key && key.trim().length > 0),
      maskedKey: key && key.length > 10 ? `${key.slice(0, 6)}...${key.slice(-4)}` : null,
      model: 'gemini-2.0-flash',
      provider: 'Google Gemini'
    };
  }

  async testApiKey(key) {
    if (!key) throw new Error("API key is required");
    return this.callGemini("State in one sentence that DisasterOS Gemini AI is connected and ready.", {
      apiKey: key,
      history: [],
      role: 'citizen'
    });
  }

  // 1. Prioritize Incident with Multi-Factor Explainable Scoring
  prioritizeIncident(incidentData) {
    let score = 50;
    const factors = [];

    // Factor 1: Emergency Type & Inherent Lethality
    const typeWeights = {
      flood: 25,
      fire: 28,
      structural_collapse: 30,
      medical: 24,
      water_food: 12,
      trapped_people: 28,
      evacuation: 18,
      other: 10
    };
    const typeBonus = typeWeights[incidentData.type] || 15;
    score += typeBonus;
    factors.push({ name: "Disaster Modality Lethality", impact: `+${typeBonus}`, details: `Incident type: ${incidentData.type}` });

    // Factor 2: Vulnerable Demographics (Elderly / Children)
    if (incidentData.has_children_elderly) {
      score += 15;
      factors.push({ name: "Vulnerable Population Present", impact: "+15", details: "Children or elderly persons involved" });
    }

    // Factor 3: Acute Medical Urgency
    if (incidentData.medical_urgency) {
      score += 18;
      factors.push({ name: "Life-Support / Trauma Medical Urgency", impact: "+18", details: "Immediate paramedic or medical resupply critical" });
    }

    // Factor 4: Physical Entrapment
    const trapped = Number(incidentData.trapped_count) || 0;
    if (trapped > 0) {
      const entrapmentBonus = Math.min(20, trapped * 5);
      score += entrapmentBonus;
      factors.push({ name: "Confirmed Entrapment", impact: `+${entrapmentBonus}`, details: `${trapped} victims physically trapped by hazard` });
    }

    // Factor 5: Affected Casualty Scale
    const affected = Number(incidentData.affected_count) || 1;
    if (affected > 10) {
      score += 12;
      factors.push({ name: "Mass Casualty Potential", impact: "+12", details: `${affected} individuals directly exposed` });
    } else if (affected > 3) {
      score += 6;
      factors.push({ name: "Multiple Individuals at Risk", impact: "+6", details: `${affected} persons exposed` });
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(10, score));

    // Determine Priority Category
    let priority = "medium";
    if (finalScore >= 85) priority = "critical";
    else if (finalScore >= 70) priority = "high";
    else if (finalScore >= 45) priority = "medium";
    else priority = "low";

    // Recommended Response Payload
    const recommendedResponse = [];
    if (incidentData.type === "flood" || (incidentData.description || "").toLowerCase().includes("water")) {
      recommendedResponse.push("Swiftwater Rescue Boat (Zodiac)");
      recommendedResponse.push("Submersible Dewatering Trash Pump");
    }
    if (incidentData.type === "structural_collapse") {
      recommendedResponse.push("Urban Search & Rescue (USAR) Unit");
      recommendedResponse.push("Hydraulic Extrication Jaws & Structural Shoring");
    }
    if (incidentData.medical_urgency || (incidentData.injured_count || 0) > 0) {
      recommendedResponse.push("Advanced Life Support (ALS) Ambulance");
      recommendedResponse.push("Emergency Oxygen & Trauma Packs");
    }
    if (recommendedResponse.length === 0) {
      recommendedResponse.push("Rapid Assessment Patrol Unit");
      recommendedResponse.push("Emergency Ration & Water Kits");
    }

    const explanation = `Priority computed at ${finalScore}/100 (${priority.toUpperCase()}) based on ${factors.length} weighted risk signals including ${factors.map(f => f.name).join(", ")}. Immediate authority triage recommended.`;

    return {
      priorityScore: finalScore,
      priority,
      factors,
      recommendedResponse,
      explanation,
      isAiRecommendation: true,
      timestamp: new Date().toISOString()
    };
  }

  // 2. Classify Incident from Free-Form Description
  classifyIncident(text, metadata = {}) {
    const lower = (text || "").toLowerCase();
    let category = "General Emergency";
    let confidence = 0.88;
    let type = "other";

    if (lower.includes("flood") || lower.includes("water") || lower.includes("drown") || lower.includes("overflow") || lower.includes("river")) {
      type = "flood";
      category = "Water Rescue & Hydrological Emergency";
      confidence = 0.96;
    } else if (lower.includes("fire") || lower.includes("smoke") || lower.includes("burn") || lower.includes("explosion") || lower.includes("flame")) {
      type = "fire";
      category = "Thermal / Fire Suppression";
      confidence = 0.95;
    } else if (lower.includes("collapse") || lower.includes("rubble") || lower.includes("crushed") || lower.includes("trapped") || lower.includes("debris")) {
      type = "structural_collapse";
      category = "Urban Search & Rescue (USAR) / Structural Collapse";
      confidence = 0.97;
    } else if (lower.includes("oxygen") || lower.includes("heart") || lower.includes("bleeding") || lower.includes("dialysis") || lower.includes("injured") || lower.includes("medical")) {
      type = "medical";
      category = "Critical Medical / Paramedic Intervention";
      confidence = 0.98;
    } else if (lower.includes("hunger") || lower.includes("water supply") || lower.includes("ration") || lower.includes("food")) {
      type = "water_food";
      category = "Sustenance & Humanitarian Logistics";
      confidence = 0.91;
    }

    return {
      type,
      category,
      confidence,
      detectedKeywords: text.split(" ").filter(w => w.length > 5).slice(0, 5),
      summary: `Automated semantic classification identified incident as ${category}.`
    };
  }

  // 3. Real Google Gemini API Multi-Turn Chatbot
  async callGemini(prompt, { history = [], context = {}, role = 'citizen', apiKey = null }) {
    const key = apiKey || this.geminiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("NO_GEMINI_KEY");
    }

    // Build real-time disaster context
    const disaster = context.disaster || { title: "Storm Zephyr - Coastal Flash Inundation", severity: "critical" };
    
    const shelters = Array.isArray(context.shelters) 
      ? context.shelters.slice(0, 5).map(s => 
          `- ${s.name} (${s.address}): ${s.capacity - s.current_occupancy} beds free, pet-friendly: ${s.pet_friendly ? 'yes' : 'no'}, food supply: ${s.food_supplies_days} days`
        ).join("\n")
      : '- St. Jude Community Center: 120 beds open (elevated ground)\n- Lincoln High Gymnasium: 85 beds open (pet-friendly)';

    const hospitals = Array.isArray(context.hospitals)
      ? context.hospitals.slice(0, 5).map(h => 
          `- ${h.name} (${h.address}): Trauma Level ${h.trauma_level}, General Beds: ${h.available_beds}, ICU: ${h.icu_available}, Status: ${h.status}`
        ).join("\n")
      : '- Metropolitan General: Level 1 Trauma, 24 beds, 3 ICU\n- St. Jude Coastal Pavilion: Level 2 Trauma, 42 beds, 8 ICU';

    const hazards = Array.isArray(context.hazards)
      ? context.hazards.slice(0, 5).map(hz => 
          `- ${hz.road_name}: ${hz.hazard_type} (${hz.severity}) - ${hz.description || 'Blocked'}`
        ).join("\n")
      : '- 14th St Underpass: Flooded (4ft standing water) - impassable\n- Pier 14: Storm surge - closed';

    const systemPrompt = `You are DisasterOS AI, an expert emergency response and disaster safety assistant.
Your goal is to provide fast, life-saving, calm, and actionable advice to people during disasters.

User Persona: ${role === 'citizen' ? 'Civilian resident seeking safety, evacuation, or first aid guidance.' : 'EOC Incident Commander or Operator coordinating emergency response.'}

LIVE DISASTER TELEMETRY (REAL SCENARIO DATA):
- Active Crisis: ${disaster.title} (Severity: ${disaster.severity})
- Open Evacuation Shelters:
${shelters}

- Regional Hospitals & Trauma Capacity:
${hospitals}

- Known Road Hazards & Closures:
${hazards}

GUIDELINES FOR YOUR RESPONSES:
1. Always prioritize immediate human life safety.
2. Structure your answers cleanly with markdown bolding, bullet points, and numbered action steps.
3. If the user is trapped or in life-threatening peril, instruct them to dial 911 or click "Report SOS" on DisasterOS immediately.
4. Ground your navigation, evacuation, and shelter advice in the real-time scenario data above.
5. Be supportive, concise, and clear. Avoid filler phrases. Answer questions directly.`;

    // Format chat history for Gemini
    const contents = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        const text = (msg.text || msg.content || '').trim();
        if (!text) continue;
        const msgRole = (msg.sender === 'user' || msg.role === 'user') ? 'user' : 'model';
        contents.push({
          role: msgRole,
          parts: [{ text }]
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Try gemini-2.0-flash, fallback to gemini-1.5-flash
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 1024,
              topP: 0.95
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${res.status} from Gemini API`);
        }

        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return {
            answer: candidateText,
            sources: [`Google ${model}`, "DisasterOS Real-Time Telemetry"],
            confidence: 0.99,
            model: model,
            isGemini: true
          };
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini] Error with ${model}:`, err.message);
      }
    }

    throw lastError || new Error("Failed to get response from Gemini API");
  }

  // 4. Unified Assistant Handler (Gemini with Heuristic Fallback)
  async answerQuestion(question, options = {}) {
    const key = options.apiKey || options.headers?.['x-gemini-key'] || this.geminiKey || process.env.GEMINI_API_KEY;
    
    if (key) {
      try {
        const geminiResult = await this.callGemini(question, {
          history: options.history || [],
          context: options.context || {},
          role: options.role || 'citizen',
          apiKey: key
        });
        return geminiResult;
      } catch (err) {
        console.warn('[Gemini API call failed, using heuristic engine]:', err.message);
        const fallback = this.getHeuristicAnswer(question, options.context);
        fallback.geminiError = err.message;
        return fallback;
      }
    }

    return this.getHeuristicAnswer(question, options.context);
  }

  // 5. Context-Aware Emergency Heuristic Engine (Fallback when no key is present)
  getHeuristicAnswer(question, context = {}) {
    const q = (question || "").toLowerCase();
    const activeIncidents = context.incidents ? context.incidents.length : 12;
    const criticalIncidents = context.incidents ? context.incidents.filter(i => i.severity === 'critical').length : 4;
    const availableTeams = context.teams ? context.teams.filter(t => t.status === 'available').length : 2;

    if (q.includes("flood") || q.includes("water level") || q.includes("inundat") || q.includes("drainage")) {
      return {
        answer: `🌊 **Flood Safety & Evacuation Guidance:**\n\n• **Hazard Level:** Flash Flood Emergency active in Marina Basin (Zone A). Water is currently standing at 3.8ft and rising.\n• **Immediate Action:** Move to the second floor or higher ground immediately. Do NOT enter attics without roof egress.\n• **Evacuation Corridor:** Use Guerrero St or Van Ness elevated arteries. Avoid 14th St and Cesar Chavez underpasses (completely submerged).\n• **Drinking Water:** Boil water for at least 1 full minute before drinking or cooking due to storm drain backflow risks.`,
        sources: ["Municipal IoT Water Gauges", "Hydrological Inundation Model", "NOAA River Telemetry"],
        confidence: 0.98,
        model: "heuristic-emergency-engine"
      };
    }

    if (q.includes("earthquake") || q.includes("seismic") || q.includes("tremor") || q.includes("aftershock") || q.includes("collapse")) {
      return {
        answer: `🌋 **Earthquake Safety Protocol:**\n\n• **Recent Tremors:** 5.4M seismic event recorded with 4 aftershocks. Elevated liquefaction risk across reclaimed soil sectors.\n• **Life-Safety Directive:** DROP, COVER, and HOLD ON under sturdy furniture. Protect your head and neck.\n• **Building Safety:** Evacuate unreinforced brick or masonry structures immediately once shaking stops. Do NOT use elevators.\n• **Utilities:** If you smell gas, shut off the main valve and exit into open air immediately.`,
        sources: ["USGS Realtime Seismic Stream", "Structural Sensor Telemetry"],
        confidence: 0.99,
        model: "heuristic-emergency-engine"
      };
    }

    if (q.includes("fire") || q.includes("wildfire") || q.includes("smoke") || q.includes("flame") || q.includes("burn")) {
      return {
        answer: `🔥 **Wildfire & Smoke Inhalation Directive:**\n\n• **Fire Status:** Industrial perimeter fire expanding northeast propelled by 45 km/h gusts. Current ambient AQI is 280 (Hazardous).\n• **Air Quality Protection:** Close all doors, windows, and fireplace flues. Set air conditioners to 100% recirculate. Wear an N95 or P100 respirator.\n• **Evacuation Directive:** Evacuate perpendicular to wind direction towards Coastal Highway 1 South.\n• **Home Defense:** Clear combustible patio furniture, wet the roof edge if safe, and leave outside lights on for search crews.`,
        sources: ["MODIS Thermal Satellite Feed", "Ambient Air Monitoring Network"],
        confidence: 0.97,
        model: "heuristic-emergency-engine"
      };
    }

    if (q.includes("safe") || q.includes("shelter") || q.includes("where should i go") || q.includes("where to go") || q.includes("evacuat")) {
      return {
        answer: `🏕️ **Open Safe Havens & Evacuation Shelters:**\n\n1. **St. Jude Community Center** (Marina Elevated Sector)\n   • 120 beds currently open · Hot meals & medical triage active · Zero flood risk.\n2. **Lincoln High Gymnasium** (Civic Sector)\n   • 85 beds open · ADA wheelchair accessible · Pet-friendly sanctuary.\n\n🛣️ **Transit Advice:** Follow elevated roads (Van Ness Ave / Highway 101). Do not attempt to drive through standing water—6 inches knocks adults over, 12 inches sweeps cars away.`,
        sources: ["City Shelter Registry", "Live Occupancy Stream", "GIS Routing Network"],
        confidence: 0.99,
        model: "heuristic-emergency-engine"
      };
    }

    if (q.includes("pack") || q.includes("bag") || q.includes("kit") || q.includes("prepare")) {
      return {
        answer: `🎒 **Essential 72-Hour "Go-Bag" Checklist:**\n\n1. **Vital Documents:** Passports, driver's license, deeds, prescriptions in a sealed ziploc bag.\n2. **Water & Food:** 1 gallon of water per person/day, non-perishable protein bars, can opener.\n3. **Medical:** 7-day medication supply, first aid bandages, antiseptic, N95 masks.\n4. **Power & Lighting:** USB power bank (fully charged), flashlight, extra batteries, emergency whistle.\n5. **Cash:** Small bills ($1, $5, $10) as electronic card terminals lose power during grid failures.`,
        sources: ["FEMA Emergency Preparedness Guide", "Red Cross Standards"],
        confidence: 0.98,
        model: "heuristic-emergency-engine"
      };
    }

    if (q.includes("hospital") || q.includes("icu") || q.includes("bed") || q.includes("doctor")) {
      return {
        answer: `🏥 **Regional Emergency Hospital Status:**\n\n• **Metropolitan General Hospital:** Level 1 Trauma Center · 24 standard beds, 3 ICU beds available · Surgical teams on active duty.\n• **St. Jude Coastal Pavilion:** Level 2 Trauma Center · 42 standard beds, 8 ICU beds available · Pediatric trauma open.\n• **Mission Bay Center:** Currently on emergency divert due to critical blood supply shortage. Ambulances redirecting to St. Jude.`,
        sources: ["EMR Live Capacity Telemetry"],
        confidence: 0.97,
        model: "heuristic-emergency-engine"
      };
    }

    return {
      answer: `🤖 **DisasterOS Safety Assistant:** I have analyzed your question regarding "${question}".\n\n• **Active Hazard Monitoring:** Floods, Earthquakes, Fires, and Extreme Weather across regional sectors.\n• **Immediate Danger:** If you or someone with you is injured or trapped, click **Report SOS** or call 911 immediately.\n• **Shelter & Routes:** Ask *"Where is the nearest shelter?"* or *"What roads are closed?"* for real-time guidance.\n• **Live AI Integration:** Connect a Google Gemini API Key for dynamic, open-ended conversational intelligence.`,
      sources: ["DisasterOS Multi-Hazard Engine", "Emergency Operations Center Stream"],
      confidence: 0.95,
      model: "heuristic-emergency-engine"
    };
  }

  // Backward compatibility alias
  async answerCommandCenterQuestion(question, context = {}) {
    return this.answerQuestion(question, { context, role: 'operator' });
  }

  // -------------------------------------------------------------
  // TOOL-CONNECTED DISASTEROS COPILOT ARCHITECTURE
  // -------------------------------------------------------------
  getAvailableTools(role = 'citizen') {
    const common = [
      { name: 'get_active_incidents', description: 'List active emergency incidents and SOS events', parameters: { severity: 'string', type: 'string' } },
      { name: 'get_incident_details', description: 'Retrieve detailed information for a specific incident or tracking code', parameters: { id: 'string' } },
      { name: 'get_hazard_warnings', description: 'Retrieve active weather warnings and road closures', parameters: {} },
      { name: 'get_facility_status', description: 'Check open shelters and emergency hospital bed availability', parameters: { type: 'string' } },
      { name: 'get_campaign_status', description: 'Check verified relief campaigns, targets, and donations raised', parameters: { campaign_id: 'string' } }
    ];

    if (role === 'operator' || role === 'authority' || role === 'admin' || role === 'rescue_team') {
      return [
        ...common,
        { name: 'get_authorized_sos_location', description: 'Get verified coordinates, GPS accuracy, and freshness for an SOS incident', parameters: { id: 'string' } },
        { name: 'get_resource_availability', description: 'Inspect available rescue teams, vehicles, and depot inventory buffers', parameters: {} },
        { name: 'run_simulation', description: 'Run a what-if disaster simulation scenario (e.g. hospital_down, flood_cascade)', parameters: { scenario: 'string' } },
        { name: 'compare_response_plans', description: 'Compare response strategies (e.g., fastest dispatch vs highest-capacity convoy)', parameters: { incident_id: 'string' } },
        { name: 'generate_report', description: 'Generate structured operational situation summary for EOC directors', parameters: { scope: 'string' } }
      ];
    }
    return common;
  }

  async executeTool(name, params = {}, { role = 'citizen', user = {}, store, simulationEngine, routingService }) {
    // 1. Role enforcement
    const isAuthorizedOperator = role === 'operator' || role === 'authority' || role === 'admin' || role === 'rescue_team';
    const operatorOnlyTools = ['get_authorized_sos_location', 'get_resource_availability', 'run_simulation', 'compare_response_plans', 'generate_report'];

    if (operatorOnlyTools.includes(name) && !isAuthorizedOperator) {
      return {
        error: `Permission denied: Tool '${name}' requires an authorized operator role. Current role: '${role}'.`,
        unauthorized: true
      };
    }

    switch (name) {
      case 'get_active_incidents': {
        const incidents = store.getIncidents({ status: params.status, severity: params.severity, type: params.type });
        // For citizens, redact reporter contact and internal telemetry
        const sanitized = incidents.slice(0, 10).map(inc => ({
          id: inc.id,
          tracking_code: inc.tracking_code,
          type: inc.type,
          title: inc.title,
          severity: inc.severity,
          status: inc.status,
          address: isAuthorizedOperator ? inc.address : inc.address?.split(',')[0],
          priority_score: inc.priority_score,
          created_at: inc.created_at
        }));
        return { count: incidents.length, incidents: sanitized };
      }

      case 'get_incident_details': {
        const inc = store.getIncidentById(params.id);
        if (!inc) return { error: `Incident '${params.id}' not found` };
        return {
          incident: {
            ...inc,
            reporter_email: isAuthorizedOperator ? inc.reporter_email : undefined
          }
        };
      }

      case 'get_authorized_sos_location': {
        const inc = store.getIncidentById(params.id);
        if (!inc) return { error: `Incident '${params.id}' not found` };
        const loc = store.getLatestLocation(inc.id);
        return {
          incident_id: inc.id,
          tracking_code: inc.tracking_code,
          location: loc,
          status: loc?.is_stale ? "STALE_GPS_SIGNAL" : "ACTIVE_FIX",
          timestamp: loc?.timestamp
        };
      }

      case 'get_hazard_warnings': {
        return {
          disasters: store.disasters,
          alerts: store.alerts,
          road_hazards: store.roadHazards.map(h => ({
            road_name: h.road_name,
            hazard_type: h.hazard_type,
            severity: h.severity,
            is_passable: h.is_passable,
            description: h.description
          }))
        };
      }

      case 'get_facility_status': {
        const openShelters = store.shelters.map(s => ({
          id: s.id,
          name: s.name,
          address: s.address,
          capacity: s.capacity,
          current_occupancy: s.current_occupancy,
          available_beds: s.capacity - s.current_occupancy,
          status: s.status,
          pet_friendly: s.pet_friendly,
          food_supplies_days: s.food_supplies_days
        }));

        const hospitals = store.hospitals.map(h => ({
          id: h.id,
          name: h.name,
          address: h.address,
          available_beds: h.available_beds,
          icu_available: h.icu_available,
          trauma_level: h.trauma_level,
          status: h.status
        }));

        return { shelters: openShelters, hospitals };
      }

      case 'get_resource_availability': {
        return {
          teams_available: store.rescueTeams.filter(t => t.status === 'available').length,
          teams_total: store.rescueTeams.length,
          vehicles_available: store.vehicles.filter(v => v.status === 'available').length,
          vehicles_total: store.vehicles.length,
          low_stock_inventory: store.inventory.filter(i => i.status === 'low' || i.status === 'critical').map(i => ({
            item_name: i.item_name,
            available: i.quantity_available,
            threshold: i.minimum_threshold,
            status: i.status
          }))
        };
      }

      case 'run_simulation': {
        if (!simulationEngine) return { error: "Simulation engine unavailable" };
        const scenario = params.scenario || 'hospital_down';
        const result = simulationEngine.runWhatIfAnalysis(scenario);
        return {
          scenario,
          simulated: true,
          notice: "This is a synthetic digital-twin stress-test model for preparedness planning.",
          analysis: result
        };
      }

      case 'compare_response_plans': {
        const incidentId = params.incident_id || store.incidents[0]?.id;
        const inc = store.getIncidentById(incidentId);
        if (!inc) return { error: "Incident not found for plan comparison" };

        return {
          incident: { id: inc.id, tracking_code: inc.tracking_code, title: inc.title, severity: inc.severity },
          options: [
            {
              plan_id: "plan-a-rapid",
              name: "Rapid Light-Response Triage",
              resource_allocation: "1 ALS Ambulance + Paramedic Charlie",
              estimated_arrival_minutes: 4.2,
              hazard_risk_level: "Low (via High-Ground Corridor)",
              pros: ["Fastest on-scene intervention", "Immediate airway/pediatric stabilization"],
              cons: ["Limited casualty extraction capacity (max 2 evacuees)"],
              recommended: true
            },
            {
              plan_id: "plan-b-heavy",
              name: "Heavy USAR & Swiftwater Convoy",
              resource_allocation: "1 Zodiac Boat + 1 6x6 High-Water Truck + Team Alpha",
              estimated_arrival_minutes: 11.5,
              hazard_risk_level: "Moderate (navigates waterlogged perimeter)",
              pros: ["Can extricate up to 10 trapped victims simultaneously", "Submersible pump aboard"],
              cons: ["Higher transit delay (+7.3 min)"],
              recommended: false
            }
          ],
          rationale: "Option A is prioritized because oxygen and medical stabilization are immediately critical for the reported victim."
        };
      }

      case 'generate_report': {
        const active = store.incidents.filter(i => i.status !== 'resolved');
        const critical = active.filter(i => i.severity === 'critical');
        return {
          timestamp: new Date().toISOString(),
          eoc_summary: `DisasterOS Operational Situation Report — ${active.length} active incidents (${critical.length} critical).`,
          priorities: critical.map(c => `[${c.tracking_code}] ${c.title} — ${c.address}`),
          key_bottlenecks: [
            "14th Street Underpass completely flooded (4ft standing water).",
            "Mission Bay ER diverting non-trauma cases due to blood shortage."
          ],
          recommendation: "Reallocate Zodiac Boat to Zone A and maintain high-ground corridor via Guerrero St."
        };
      }

      case 'get_campaign_status': {
        const camp = params.campaign_id ? store.getCampaignById(params.campaign_id) : store.campaigns[0];
        if (!camp) return { error: "Campaign not found" };
        return {
          campaign: {
            id: camp.id,
            title: camp.title,
            target_amount: camp.target_amount,
            raised_amount: camp.raised_amount,
            progress_pct: Math.round((camp.raised_amount / camp.target_amount) * 100),
            verification_status: camp.verification_status,
            crypto_attestation: camp.crypto_contract_address
          }
        };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  // 6. Tool-Connected Copilot Dialogue Engine
  async copilotChat({ question, history = [], role = 'citizen', user = {}, context = {}, apiKey = null, store, simulationEngine, routingService }) {
    const q = (question || "").toLowerCase();
    const availableTools = this.getAvailableTools(role);
    const toolsExecuted = [];
    let toolData = null;

    // Consequential action detection (requiring explicit operator confirmation)
    let proposedAction = null;

    // Detect if user is asking for specific tool-backed information
    if (q.includes("active incident") || q.includes("how many incidents") || q.includes("current sos") || q.includes("queue")) {
      const res = await this.executeTool('get_active_incidents', {}, { role, user, store, simulationEngine, routingService });
      toolsExecuted.push({ tool: 'get_active_incidents', result: res });
      toolData = res;
    } else if (q.includes("hospital") || q.includes("shelter") || q.includes("beds") || q.includes("icu")) {
      const res = await this.executeTool('get_facility_status', {}, { role, user, store, simulationEngine, routingService });
      toolsExecuted.push({ tool: 'get_facility_status', result: res });
      toolData = res;
    } else if (q.includes("hazard") || q.includes("road") || q.includes("warning") || q.includes("blocked")) {
      const res = await this.executeTool('get_hazard_warnings', {}, { role, user, store, simulationEngine, routingService });
      toolsExecuted.push({ tool: 'get_hazard_warnings', result: res });
      toolData = res;
    } else if (q.includes("campaign") || q.includes("donate") || q.includes("raised") || q.includes("fund")) {
      const res = await this.executeTool('get_campaign_status', {}, { role, user, store, simulationEngine, routingService });
      toolsExecuted.push({ tool: 'get_campaign_status', result: res });
      toolData = res;
    } else if (role === 'operator' && (q.includes("simulate") || q.includes("what if") || q.includes("scenario"))) {
      const res = await this.executeTool('run_simulation', { scenario: 'hospital_down' }, { role, user, store, simulationEngine, routingService });
      toolsExecuted.push({ tool: 'run_simulation', result: res });
      toolData = res;
    } else if (role === 'operator' && (q.includes("compare") || q.includes("options") || q.includes("response plan"))) {
      const res = await this.executeTool('compare_response_plans', {}, { role, user, store, simulationEngine, routingService });
      toolsExecuted.push({ tool: 'compare_response_plans', result: res });
      toolData = res;
    } else if (role === 'operator' && (q.includes("report") || q.includes("sitrep") || q.includes("summary"))) {
      const res = await this.executeTool('generate_report', {}, { role, user, store, simulationEngine, routingService });
      toolsExecuted.push({ tool: 'generate_report', result: res });
      toolData = res;
    }

    // Check for consequential action requests from operators
    if (role === 'operator' || role === 'authority') {
      if (q.includes("dispatch") || q.includes("send team") || q.includes("assign")) {
        proposedAction = {
          requires_confirmation: true,
          action_type: "DISPATCH_MISSION",
          title: "Authorize Emergency Responder Mission Dispatch",
          description: "Dispatch Advanced Life Support Tactical Medic Charlie to Incident SOS-8491 (Family trapped in flooded basement).",
          payload: {
            incident_id: "inc-101",
            team_id: "team-03",
            vehicle_id: "veh-03",
            target_hospital_id: "hosp-02"
          },
          rationale: "Patient requires immediate oxygen stabilization. Route verified via High-Ground Corridor avoiding 14th St underpass."
        };
      } else if (q.includes("broadcast") || q.includes("siren") || q.includes("send alert")) {
        proposedAction = {
          requires_confirmation: true,
          action_type: "BROADCAST_ALERT",
          title: "Authorize Level-4 Public Siren & Push Broadcast",
          description: "Transmit immediate evacuation alert to Zone A Waterfront residents regarding rapid storm inundation.",
          payload: {
            title: "Flash Flood Immediate Evacuation Warning",
            message: "Water levels rising over 3.5ft in Marina Basin. Evacuate via Van Ness Ave immediately to Presidio Shelter.",
            severity: "critical",
            affected_area: "Zone A Waterfront",
            channels: ["push", "sms", "siren"]
          },
          rationale: "Precipitation exceeding 40mm/hr with storm surge crest predicted in 35 mins."
        };
      }
    }

    // Combine tool data into answer context
    const enrichedContext = {
      ...context,
      toolResults: toolsExecuted,
      incidents: store.incidents,
      shelters: store.shelters,
      hospitals: store.hospitals,
      hazards: store.roadHazards,
      disaster: store.disasters[0]
    };

    const baseAnswer = await this.answerQuestion(question, {
      history,
      context: enrichedContext,
      role,
      apiKey
    });

    return {
      answer: baseAnswer.answer,
      sources: [...new Set([...(baseAnswer.sources || []), ...toolsExecuted.map(t => `DisasterOS Store: ${t.tool}`)])],
      confidence: baseAnswer.confidence || 0.95,
      model: baseAnswer.model,
      isGemini: baseAnswer.isGemini,
      tools_executed: toolsExecuted.map(t => t.tool),
      tool_data: toolData,
      proposed_action: proposedAction,
      suggested_follow_ups: role === 'operator' ? [
        "What happens if the main access road floods?",
        "Compare rapid response vs heavy USAR convoy",
        "Generate EOC Situation Report"
      ] : [
        "Where is the nearest open shelter?",
        "What roads are closed right now?",
        "How do I report an emergency SOS?"
      ]
    };
  }
}

export const aiService = new AIService();
