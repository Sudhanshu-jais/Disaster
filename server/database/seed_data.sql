-- =============================================================================
-- DISASTEROS SUPABASE SEED DATA
-- Insert initial realistic disaster response operational dataset
-- Uses valid hexadecimal UUIDs [0-9a-f] compatible with PostgreSQL
-- =============================================================================

-- 1. Disasters
INSERT INTO disasters (id, title, type, severity, status, epicenter_lat, epicenter_lng, radius_km, metadata)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Storm Zephyr & Coastal Flash Flooding', 'flood', 'critical', 'active', 37.7749, -122.4194, 35.0, '{"description": "Category 3 atmospheric river storm with severe storm surges and localized landslides."}'::jsonb),
  ('a0000000-0000-0000-0000-000000000002', 'Seismic Tremor & Structural Distress Zone', 'earthquake', 'medium', 'monitoring', 37.8044, -122.2712, 18.0, '{"description": "Magnitude 4.8 seismic tremor with minor aftershocks affecting older commercial buildings."}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Warehouses
INSERT INTO warehouses (id, name, code, latitude, longitude, address, contact_person, phone, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Central Logistics Depot & Supply Hub', 'WH-MAIN-01', 37.7650, -122.4050, '1200 16th Street, Potrero Hill', 'Elena Rostova', '+1-415-555-0144', 'operational'),
  ('b0000000-0000-0000-0000-000000000002', 'North Harbor Emergency Auxiliary Reserve', 'WH-NORTH-02', 37.8050, -122.4150, 'Pier 39 Logistics Warehouse', 'Marcus Brody', '+1-415-555-0177', 'operational'),
  ('b0000000-0000-0000-0000-000000000003', 'Sunset District Community Cache', 'WH-WEST-03', 37.7500, -122.4800, '2400 Irving Street', 'Clara Hughes', '+1-415-555-0199', 'operational')
ON CONFLICT (id) DO NOTHING;

-- 3. Inventory
INSERT INTO inventory (id, warehouse_id, category, item_name, unit, quantity_available, quantity_reserved, minimum_threshold, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'water', 'Clean Potable Water (10L Jugs)', 'jugs', 450, 50, 100, 'healthy'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'medical', 'Trauma Surgical Packs & Bandages', 'kits', 85, 10, 30, 'healthy'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'food', 'Ready-To-Eat Emergency Meal Kits (MRE)', 'cases', 800, 200, 250, 'healthy'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'shelter_kits', 'Fleece Thermal Hypothermia Blankets', 'units', 300, 40, 50, 'healthy')
ON CONFLICT (id) DO NOTHING;

-- 4. Rescue Teams
INSERT INTO rescue_teams (id, team_code, name, lead_name, phone, current_lat, current_lng, status, skills, capacity)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'RT-SWIFT-01', 'Swiftwater Taskforce Alpha', 'Capt. Sarah Jenkins', '+1-415-555-0101', 37.7780, -122.4150, 'available', ARRAY['swiftwater_rescue', 'boat_operation', 'paramedic'], 6),
  ('d0000000-0000-0000-0000-000000000002', 'RT-USAR-02', 'Urban Search & Extraction Squad', 'Lt. Carlos Mendez', '+1-415-555-0102', 37.7580, -122.4010, 'available', ARRAY['structural_collapse', 'heavy_extraction', 'canine_search'], 8),
  ('d0000000-0000-0000-0000-000000000003', 'RT-MED-03', 'Tactical Triage Unit Echo', 'Dr. Rachel Kim', '+1-415-555-0103', 37.7850, -122.4320, 'available', ARRAY['triage', 'advanced_life_support', 'pediatric_care'], 5)
ON CONFLICT (id) DO NOTHING;

-- 5. Hospitals
INSERT INTO hospitals (id, name, latitude, longitude, address, phone, total_beds, available_beds, icu_total, icu_available, trauma_level, has_helipad, status)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Metropolitan Trauma & Surgical Center', 37.7558, -122.4045, '1001 Potrero Ave', '+1-415-206-8000', 450, 48, 60, 6, 1, true, 'open'),
  ('e0000000-0000-0000-0000-000000000002', 'St. Jude Emergency Medical Center', 37.7865, -122.4342, '350 Parnassus Ave', '+1-415-353-1000', 320, 18, 45, 2, 2, true, 'open'),
  ('e0000000-0000-0000-0000-000000000003', 'Bayview Community Memorial Hospital', 37.7680, -122.3910, '1301 Third Street', '+1-415-821-5000', 180, 12, 20, 3, 3, false, 'open')
ON CONFLICT (id) DO NOTHING;

-- 6. Shelters
INSERT INTO shelters (id, name, latitude, longitude, address, capacity, current_occupancy, food_supplies_days, water_supplies_days, medical_staff_present, pet_friendly, status)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Civic Auditorium Evacuation Center', 37.7795, -122.4175, '99 Grove Street', 600, 320, 8, 10, true, true, 'open'),
  ('f0000000-0000-0000-0000-000000000002', 'Marina Middle School Gymnasium Safe Haven', 37.7980, -122.4550, '3500 Fillmore Street', 350, 210, 5, 6, true, false, 'open'),
  ('f0000000-0000-0000-0000-000000000003', 'Presidio Community Safe Refuge', 37.7660, -122.4200, '63 Funston Ave', 250, 85, 12, 14, true, true, 'open')
ON CONFLICT (id) DO NOTHING;
