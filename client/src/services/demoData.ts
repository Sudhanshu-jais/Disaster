// DisasterOS AI Realistic Seed Demonstration Dataset
import { Incident, Disaster, Hospital, Shelter, Warehouse, InventoryItem, RescueTeam, Vehicle, Mission, RoadHazard, AlertNotification } from '../types';

export const DEMO_DISASTERS: Disaster[] = [
  {
    id: "dis-001",
    title: "Storm Zephyr & Coastal Flash Flooding",
    type: "flood",
    severity: "critical",
    status: "active",
    epicenter_lat: 37.7749,
    epicenter_lng: -122.4194,
    radius_km: 35.0,
    declared_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    description: "Category 3 atmospheric river storm with severe storm surges, overflowing riverbanks, and localized landslides across coastal sectors.",
    affected_population: 142000,
    weather_summary: "Rainfall: 42.4 mm/hr · Sustained Winds: 65 km/h · Barometric Pressure: 984 hPa"
  },
  {
    id: "dis-002",
    title: "Diablo Ridge Wildfire & Chemical Flare",
    type: "wildfire",
    severity: "critical",
    status: "active",
    epicenter_lat: 37.8816,
    epicenter_lng: -121.9142,
    radius_km: 24.0,
    declared_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    description: "Fast-moving brushfire pushed by 45 km/h gusts toward industrial solvent storage buffer with severe hazardous air quality index (AQI 290).",
    affected_population: 48500,
    weather_summary: "Dry winds 48 km/h · Humidity 14% · Ambient AQI 290 (Hazardous)"
  },
  {
    id: "dis-003",
    title: "7.2M San Andreas Rupture Advisory",
    type: "earthquake",
    severity: "critical",
    status: "active",
    epicenter_lat: 37.7126,
    epicenter_lng: -122.4842,
    radius_km: 50.0,
    declared_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    description: "Major subduction fault rupture. Intense liquefaction risks across unconsolidated soil districts and multiple structural distress reports.",
    affected_population: 310000,
    weather_summary: "Aftershock probability: 74% within 24h · Seismic intensity: MMI VIII"
  }
];

export const DEMO_INCIDENTS: Incident[] = [
  {
    id: "inc-101",
    tracking_code: "SOS-701",
    type: "flood",
    title: "Waterfront Viaduct Breach & Trapped Commuters",
    description: "Rapidly rising stormwater breached sea-wall embankment. 18 vehicles stranded in water up to 4.2 feet. Elderly bus passengers require swiftwater extraction.",
    latitude: 37.7985,
    longitude: -122.4012,
    address: "Marina Blvd & Embarcadero North Pier",
    status: "in_progress",
    severity: "critical",
    priority_score: 96,
    affected_count: 38,
    injured_count: 5,
    trapped_count: 14,
    has_children_elderly: true,
    medical_urgency: true,
    created_at: new Date(Date.now() - 42 * 60000).toISOString(),
    ai_classification: {
      category: "Hydrological Rapid Inundation",
      confidence: 0.96,
      recommended_response: ["Swiftwater Rescue Boat Unit", "Advanced Life Support Ambulance", "High-Clearance Transport"],
      rationale: "Rapid water rise rate (3.2 in/min) + stranded bus with elderly occupants produces critical urgency score."
    }
  },
  {
    id: "inc-102",
    tracking_code: "SOS-702",
    type: "fire",
    title: "Industrial Solvent Buffer Containment Breach",
    description: "Chemical warehouse peripheral tank engulfed in fire. Dense toxic smoke plume migrating toward residential block. Immediate 1.5km evacuation buffer required.",
    latitude: 37.7520,
    longitude: -122.3875,
    address: "Pier 70 Industrial Complex, Sector 4",
    status: "assigned",
    severity: "critical",
    priority_score: 91,
    affected_count: 240,
    injured_count: 8,
    trapped_count: 0,
    has_children_elderly: false,
    medical_urgency: true,
    created_at: new Date(Date.now() - 75 * 60000).toISOString(),
    ai_classification: {
      category: "Chemical Hazmat Thermal Flare",
      confidence: 0.94,
      recommended_response: ["Hazmat Foam Suppression Unit", "Trauma Evac Ambulance", "Mobile Air Quality Monitor"],
      rationale: "Toxic inhalation hazard within 1200m downwind corridor triggers maximum hazmat protocol."
    }
  },
  {
    id: "inc-103",
    tracking_code: "SOS-703",
    type: "earthquake",
    title: "Masonry Facade Collapse & Utility Line Severed",
    description: "Three-story brick building partially collapsed onto transit corridor. Gas main pressure anomaly detected. Acoustic sensors indicate 4 persons trapped under rear debris.",
    latitude: 37.7654,
    longitude: -122.4215,
    address: "16th St & Mission Commercial Corridor",
    status: "assigned",
    severity: "critical",
    priority_score: 94,
    affected_count: 22,
    injured_count: 7,
    trapped_count: 4,
    has_children_elderly: true,
    medical_urgency: true,
    created_at: new Date(Date.now() - 95 * 60000).toISOString(),
    ai_classification: {
      category: "Structural Collapse / Gas Hazard",
      confidence: 0.98,
      recommended_response: ["USAR Acoustic Search Team", "Gas Isolation Crew", "Trauma Medical Triage"],
      rationale: "Entrapped victims confirmed by acoustic telemetry with secondary ignition risk from gas rupture."
    }
  },
  {
    id: "inc-104",
    tracking_code: "SOS-704",
    type: "flood",
    title: "Creek Basin Flash Overflow at Residential Cul-de-Sac",
    description: "Mission Creek culvert blocked with debris. Baseline stream running 3 feet over roadway, cutting off 12 single-family residences. No injuries reported currently.",
    latitude: 37.7690,
    longitude: -122.4090,
    address: "Creekview Drive & 7th Street",
    status: "prioritized",
    severity: "high",
    priority_score: 78,
    affected_count: 45,
    injured_count: 0,
    trapped_count: 6,
    has_children_elderly: true,
    medical_urgency: false,
    created_at: new Date(Date.now() - 110 * 60000).toISOString(),
    ai_classification: {
      category: "Inundation Roadway Severance",
      confidence: 0.89,
      recommended_response: ["Heavy Debris Clearing Loader", "Swiftwater High-Axle Truck"],
      rationale: "Property isolation without acute trauma. Priority ranked moderate-high pending culvert clearance."
    }
  },
  {
    id: "inc-105",
    tracking_code: "SOS-705",
    type: "medical",
    title: "Neighborhood Clinic Emergency Generator Failure",
    description: "Substation power grid down. Emergency backup generator failed at urgent care facility with 6 oxygen-dependent patients needing battery replenishment.",
    latitude: 37.7830,
    longitude: -122.4170,
    address: "Civic Health Pavilion, 9th St",
    status: "verified",
    severity: "high",
    priority_score: 83,
    affected_count: 16,
    injured_count: 6,
    trapped_count: 0,
    has_children_elderly: true,
    medical_urgency: true,
    created_at: new Date(Date.now() - 130 * 60000).toISOString(),
    ai_classification: {
      category: "Critical Medical Infrastructure Failure",
      confidence: 0.95,
      recommended_response: ["Mobile Generator Staging Unit", "Patient Transfer Ambulances"],
      rationale: "Life-support power depletion buffer under 45 minutes."
    }
  },
  {
    id: "inc-106",
    tracking_code: "SOS-706",
    type: "infrastructure",
    title: "Hillside Mudslide Blocking Primary Evacuation Route",
    description: "Soil saturation caused 40-meter mudslide covering Highway 1 northbound lane. Traffic backed up 2 miles. Structural engineers evaluating slope stability.",
    latitude: 37.7410,
    longitude: -122.4780,
    address: "Great Highway Coastal Pass, Mile 4",
    status: "in_progress",
    severity: "medium",
    priority_score: 68,
    affected_count: 85,
    injured_count: 0,
    trapped_count: 0,
    has_children_elderly: false,
    medical_urgency: false,
    created_at: new Date(Date.now() - 180 * 60000).toISOString(),
    ai_classification: {
      category: "Geotechnical Slope Failure",
      confidence: 0.91,
      recommended_response: ["Highway Clearing Excavator", "Traffic Diversion Patrol"],
      rationale: "Evacuation route impediment; alternate detour available via 19th Ave."
    }
  }
];

export const DEMO_RESCUE_TEAMS: RescueTeam[] = [
  {
    id: "team-001",
    team_code: "USAR-ALPHA",
    name: "Urban Search & Heavy Rescue Taskforce Alpha",
    lead_name: "Capt. Marcus Vance",
    phone: "+1 (415) 555-0192",
    current_lat: 37.7710,
    current_lng: -122.4180,
    status: "on_scene",
    skills: ["Confined Space Extraction", "Acoustic Listening Arrays", "Hydraulic Shoring", "K-9 Search"],
    capacity: 12,
    active_mission: "mis-701"
  },
  {
    id: "team-002",
    team_code: "SWIFT-BRAVO",
    name: "Swiftwater & Flood Marine Rescue Unit",
    lead_name: "Lt. Elena Rostova",
    phone: "+1 (415) 555-0144",
    current_lat: 37.7950,
    current_lng: -122.4020,
    status: "dispatched",
    skills: ["Zodiac Jet Boats", "Helicopter Hoist Rescue", "High-Flow Evacuations"],
    capacity: 8,
    active_mission: "mis-702"
  },
  {
    id: "team-003",
    team_code: "HAZMAT-CHARLIE",
    name: "Industrial Chemical & Smoke Suppression Team",
    lead_name: "Cmdr. David Chen",
    phone: "+1 (415) 555-0188",
    current_lat: 37.7550,
    current_lng: -122.3900,
    status: "on_scene",
    skills: ["Class-B Foam Suppression", "Toxic Gas Scrubbing", "Atmospheric Modeling"],
    capacity: 10,
    active_mission: "mis-703"
  },
  {
    id: "team-004",
    team_code: "MED-DELTA",
    name: "Rapid Field Trauma & Triage Flight Group",
    lead_name: "Dr. Sarah Jenkins",
    phone: "+1 (415) 555-0131",
    current_lat: 37.7620,
    current_lng: -122.4450,
    status: "available",
    skills: ["Emergency Surgery", "Critical Care Flight", "Mass Casualty Triage"],
    capacity: 6,
    active_mission: null
  },
  {
    id: "team-005",
    team_code: "LOGISTICS-ECHO",
    name: "Emergency Power & Supply Transit Staging",
    lead_name: "Sgt. Javier Morales",
    phone: "+1 (415) 555-0167",
    current_lat: 37.7820,
    current_lng: -122.4120,
    status: "available",
    skills: ["Mobile Generators", "High-Clearance Supply Transport", "Temporary Comms Mast"],
    capacity: 14,
    active_mission: null
  }
];

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "veh-001",
    registration_number: "SF-EMS-401",
    type: "Ambulance",
    make_model: "Ford F-550 Type I ALS Trauma",
    capacity_payload_kg: 1800,
    passenger_capacity: 4,
    current_lat: 37.7715,
    current_lng: -122.4190,
    status: "on_mission",
    driver_name: "P. Gomez",
    fuel_percent: 86,
    assigned_team_id: "team-004"
  },
  {
    id: "veh-002",
    registration_number: "SF-BOAT-02",
    type: "Rescue Boat",
    make_model: "Zodiac Milpro MK4 HD Inflatable",
    capacity_payload_kg: 2400,
    passenger_capacity: 10,
    current_lat: 37.7960,
    current_lng: -122.4010,
    status: "on_mission",
    driver_name: "T. Olsen",
    fuel_percent: 92,
    assigned_team_id: "team-002"
  },
  {
    id: "veh-003",
    registration_number: "SF-HAZ-12",
    type: "Hazmat Tender",
    make_model: "Pierce Enforcer Heavy Rescue",
    capacity_payload_kg: 6500,
    passenger_capacity: 6,
    current_lat: 37.7540,
    current_lng: -122.3890,
    status: "on_mission",
    driver_name: "K. Reynolds",
    fuel_percent: 74,
    assigned_team_id: "team-003"
  },
  {
    id: "veh-004",
    registration_number: "SF-TRUCK-88",
    type: "High-Clearance Transport",
    make_model: "Oshkosh FMTV 6x6 Heavy Carrier",
    capacity_payload_kg: 5000,
    passenger_capacity: 20,
    current_lat: 37.7800,
    current_lng: -122.4150,
    status: "available",
    driver_name: "J. Miller",
    fuel_percent: 95,
    assigned_team_id: "team-005"
  }
];

export const DEMO_HOSPITALS: Hospital[] = [
  {
    id: "hosp-001",
    name: "Zuckerberg San Francisco General Hospital & Trauma Center",
    latitude: 37.7558,
    longitude: -122.4045,
    address: "1001 Potrero Ave",
    phone: "+1 (415) 206-8000",
    total_beds: 397,
    available_beds: 48,
    icu_total: 58,
    icu_available: 7,
    trauma_level: 1,
    has_helipad: true,
    generator_operational: true,
    blood_bank_status: "stable",
    status: "open",
    specialties: ["Level-1 Trauma", "Burn Unit", "Mass Decontamination"]
  },
  {
    id: "hosp-002",
    name: "UCSF Medical Center at Mission Bay",
    latitude: 37.7681,
    longitude: -122.3912,
    address: "1825 4th St",
    phone: "+1 (415) 514-6400",
    total_beds: 289,
    available_beds: 34,
    icu_total: 44,
    icu_available: 4,
    trauma_level: 2,
    has_helipad: true,
    generator_operational: true,
    blood_bank_status: "stable",
    status: "open",
    specialties: ["Pediatrics", "Cardiovascular", "Intensive Surgical"]
  },
  {
    id: "hosp-003",
    name: "California Pacific Medical Center (Van Ness Campus)",
    latitude: 37.7865,
    longitude: -122.4218,
    address: "1101 Van Ness Ave",
    phone: "+1 (415) 600-6000",
    total_beds: 274,
    available_beds: 12,
    icu_total: 36,
    icu_available: 2,
    trauma_level: 2,
    has_helipad: false,
    generator_operational: true,
    blood_bank_status: "low",
    status: "diverted",
    specialties: ["Orthopedic Trauma", "Hyperbaric Chamber"]
  }
];

export const DEMO_SHELTERS: Shelter[] = [
  {
    id: "shelt-001",
    name: "Bill Graham Civic Auditorium Emergency Sanctuary",
    latitude: 37.7780,
    longitude: -122.4172,
    address: "99 Grove St, Civic Center",
    capacity: 650,
    current_occupancy: 412,
    food_supplies_days: 7,
    water_supplies_days: 8,
    medical_staff_present: true,
    pet_friendly: true,
    status: "open"
  },
  {
    id: "shelt-002",
    name: "Kezar Pavilion West Sector Refuge",
    latitude: 37.7672,
    longitude: -122.4538,
    address: "755 Stanyan St",
    capacity: 350,
    current_occupancy: 180,
    food_supplies_days: 5,
    water_supplies_days: 6,
    medical_staff_present: true,
    pet_friendly: true,
    status: "open"
  },
  {
    id: "shelt-003",
    name: "St. Jude Mission Cultural Sanctuary",
    latitude: 37.7584,
    longitude: -122.4190,
    address: "2868 Mission St",
    capacity: 220,
    current_occupancy: 215,
    food_supplies_days: 3,
    water_supplies_days: 3,
    medical_staff_present: false,
    pet_friendly: false,
    status: "at_capacity"
  },
  {
    id: "shelt-004",
    name: "Marina Middle School Elevated Shelter",
    latitude: 37.8010,
    longitude: -122.4340,
    address: "3500 Fillmore St",
    capacity: 400,
    current_occupancy: 85,
    food_supplies_days: 6,
    water_supplies_days: 7,
    medical_staff_present: true,
    pet_friendly: true,
    status: "open"
  }
];

export const DEMO_WAREHOUSES: Warehouse[] = [
  {
    id: "wh-001",
    name: "Central Logistics Depot 01 - South Basin",
    code: "WH-SF-01",
    latitude: 37.7420,
    longitude: -122.3950,
    address: "1000 Evans Ave",
    contact_person: "Col. Gregory Scott",
    phone: "+1 (415) 555-0811",
    status: "operational"
  },
  {
    id: "wh-002",
    name: "Presidio Emergency Staging Depot",
    code: "WH-SF-02",
    latitude: 37.8012,
    longitude: -122.4650,
    address: "Building 102 Montgomery St",
    contact_person: "Maj. Linda Ramos",
    phone: "+1 (415) 555-0822",
    status: "operational"
  }
];

export const DEMO_INVENTORY: InventoryItem[] = [
  {
    id: "inv-001",
    warehouse_id: "wh-001",
    category: "Medical",
    item_name: "Field Trauma Medical Kits (Level-A)",
    unit: "Kits",
    quantity_available: 240,
    quantity_reserved: 60,
    minimum_threshold: 80,
    status: "healthy"
  },
  {
    id: "inv-002",
    warehouse_id: "wh-001",
    category: "Hydration",
    item_name: "Potable Drinking Water (10L Sealed Packs)",
    unit: "Packs",
    quantity_available: 1850,
    quantity_reserved: 600,
    minimum_threshold: 500,
    status: "healthy"
  },
  {
    id: "inv-003",
    warehouse_id: "wh-001",
    category: "Nutrition",
    item_name: "Emergency MRE Ration Packs (72-hr)",
    unit: "Boxes",
    quantity_available: 3100,
    quantity_reserved: 950,
    minimum_threshold: 1000,
    status: "healthy"
  },
  {
    id: "inv-004",
    warehouse_id: "wh-001",
    category: "Shelter",
    item_name: "Inflatable Weather-Proof Tents (8-Person)",
    unit: "Units",
    quantity_available: 120,
    quantity_reserved: 85,
    minimum_threshold: 50,
    status: "low"
  },
  {
    id: "inv-005",
    warehouse_id: "wh-002",
    category: "Power",
    item_name: "Portable Heavy Diesel Generators (15kW)",
    unit: "Units",
    quantity_available: 14,
    quantity_reserved: 10,
    minimum_threshold: 6,
    status: "low"
  },
  {
    id: "inv-006",
    warehouse_id: "wh-002",
    category: "Rescue",
    item_name: "Inflatable Swiftwater Rescue Rafts",
    unit: "Crafts",
    quantity_available: 18,
    quantity_reserved: 12,
    minimum_threshold: 8,
    status: "healthy"
  }
];

export const DEMO_MISSIONS: Mission[] = [
  {
    id: "mis-701",
    mission_code: "MIS-071",
    incident_id: "inc-103",
    team_id: "team-001",
    vehicle_id: "veh-001",
    target_hospital_id: "hosp-001",
    priority: "critical",
    status: "on_scene",
    objective: "Execute acoustic sweep and breach rear collapsed masonry wall for 4 trapped occupants.",
    assigned_at: new Date(Date.now() - 45 * 60000).toISOString(),
    notes: "Secondary gas line shutoff confirmed by municipal utility crew."
  },
  {
    id: "mis-702",
    mission_code: "MIS-072",
    incident_id: "inc-101",
    team_id: "team-002",
    vehicle_id: "veh-002",
    target_hospital_id: "hosp-002",
    target_shelter_id: "shelt-004",
    priority: "critical",
    status: "en_route",
    objective: "Deploy zodiac crafts to extract 18 stranded bus commuters from Marina viaduct floodwaters.",
    assigned_at: new Date(Date.now() - 28 * 60000).toISOString(),
    notes: "Water current registered at 4.2 knots; approaching from east dock."
  },
  {
    id: "mis-703",
    mission_code: "MIS-073",
    incident_id: "inc-102",
    team_id: "team-003",
    vehicle_id: "veh-003",
    priority: "critical",
    status: "on_scene",
    objective: "Establish 100m perimeter with fluoropolymer foam line to suppress thermal chemical flare.",
    assigned_at: new Date(Date.now() - 60 * 60000).toISOString(),
    notes: "Plume direction stable toward bay water; residential sector safe."
  }
];

export const DEMO_HAZARDS: RoadHazard[] = [
  {
    id: "haz-001",
    road_name: "Embarcadero Northbound Viaduct",
    hazard_type: "Coastal Storm Surge Flooding",
    latitude: 37.8010,
    longitude: -122.4040,
    is_passable: false,
    severity: "critical",
    reported_at: new Date(Date.now() - 60 * 60000).toISOString(),
    description: "Water depth 3.8 feet across 4 lanes. Traffic fully diverted inland."
  },
  {
    id: "haz-002",
    road_name: "16th Street Commercial Corridor",
    hazard_type: "Building Debris & Gas Closure",
    latitude: 37.7650,
    longitude: -122.4210,
    is_passable: false,
    severity: "critical",
    reported_at: new Date(Date.now() - 85 * 60000).toISOString(),
    description: "Structural rubble spread across both lanes. Emergency responders only."
  },
  {
    id: "haz-003",
    road_name: "Highway 1 Coastal Bluffs Pass",
    hazard_type: "Mudslide & Debris Flow",
    latitude: 37.7410,
    longitude: -122.4780,
    is_passable: false,
    severity: "high",
    reported_at: new Date(Date.now() - 150 * 60000).toISOString(),
    description: "Active geotechnical slide blocking northbound travel. Heavy equipment clearing."
  }
];

export const DEMO_ALERTS: AlertNotification[] = [
  {
    id: "alt-001",
    title: "MANDATORY EVACUATION: Marina & North Pier Waterfront",
    message: "Immediate evacuation ordered for Zone A. Sea-wall breach imminent with high tide crest in 35 mins. Proceed inland via Van Ness corridor to Bill Graham Sanctuary.",
    severity: "critical",
    type: "EVACUATION",
    affected_area: "Zone A - Marina Waterfront Basin",
    channels: ["SMS Broadcast", "WEA Siren", "Radio 1620 AM"],
    sent_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: "alt-002",
    title: "HAZMAT ADVISORY: Pier 70 Toxic Smoke Buffer",
    message: "Shelter in place for residents within 1.5km of Pier 70. Keep windows and air intake systems sealed until chemical flare is contained.",
    severity: "critical",
    type: "HAZMAT",
    affected_area: "Central Basin / Dogpatch East Sector",
    channels: ["Push Notification", "Siren Cluster 4"],
    sent_at: new Date(Date.now() - 65 * 60000).toISOString()
  }
];
