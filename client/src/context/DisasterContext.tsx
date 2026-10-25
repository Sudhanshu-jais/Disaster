// DisasterOS Realtime Operational State Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { syncIncidentDirectly, getSupabaseConfig } from '../services/supabase';
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
  AlertNotification,
  IncidentStatus
} from '../types';
import {
  DEMO_DISASTERS,
  DEMO_INCIDENTS,
  DEMO_RESCUE_TEAMS,
  DEMO_VEHICLES,
  DEMO_HOSPITALS,
  DEMO_SHELTERS,
  DEMO_WAREHOUSES,
  DEMO_INVENTORY,
  DEMO_MISSIONS,
  DEMO_HAZARDS,
  DEMO_ALERTS
} from '../services/demoData';

interface LiveEventNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
}

interface DisasterContextType {
  disaster: Disaster | null;
  incidents: Incident[];
  rescueTeams: RescueTeam[];
  vehicles: Vehicle[];
  hospitals: Hospital[];
  shelters: Shelter[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  missions: Mission[];
  hazards: RoadHazard[];
  alerts: AlertNotification[];
  liveNotifications: LiveEventNotification[];
  latestSOS: Incident | null;
  setLatestSOS: (inc: Incident | null) => void;
  isLoading: boolean;
  isConnected: boolean;
  isDemoMode: boolean;
  refreshData: () => Promise<void>;
  submitSOS: (data: Partial<Incident>) => Promise<any>;
  createIncident: (data: Partial<Incident>) => Promise<Incident>;
  updateIncidentStatus: (id: string, status: IncidentStatus) => Promise<void>;
  allocateResource: (incidentId: string, resourceType: string, quantity: number) => { success: boolean; error?: string };
  releaseResource: (incidentId: string, resourceType: string, quantity: number) => { success: boolean; error?: string };
  dispatchMission: (missionData: any) => Promise<any>;
  dismissNotification: (id: string) => void;
  startSimulationCascade: () => Promise<any>;
  resetDemoData: () => void;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

const STORAGE_KEY = 'disasteros_v2_operational_state';

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [disaster, setDisaster] = useState<Disaster | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_disaster`);
    return saved ? JSON.parse(saved) : DEMO_DISASTERS[0];
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_incidents`);
    return saved ? JSON.parse(saved) : DEMO_INCIDENTS;
  });

  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teams`);
    return saved ? JSON.parse(saved) : DEMO_RESCUE_TEAMS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
    return saved ? JSON.parse(saved) : DEMO_VEHICLES;
  });

  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_hospitals`);
    return saved ? JSON.parse(saved) : DEMO_HOSPITALS;
  });

  const [shelters, setShelters] = useState<Shelter[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shelters`);
    return saved ? JSON.parse(saved) : DEMO_SHELTERS;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_warehouses`);
    return saved ? JSON.parse(saved) : DEMO_WAREHOUSES;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : DEMO_INVENTORY;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_missions`);
    return saved ? JSON.parse(saved) : DEMO_MISSIONS;
  });

  const [hazards, setHazards] = useState<RoadHazard[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_hazards`);
    return saved ? JSON.parse(saved) : DEMO_HAZARDS;
  });

  const [alerts, setAlerts] = useState<AlertNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
    return saved ? JSON.parse(saved) : DEMO_ALERTS;
  });

  const [latestSOS, setLatestSOS] = useState<Incident | null>(null);
  const [liveNotifications, setLiveNotifications] = useState<LiveEventNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_disaster`, JSON.stringify(disaster));
    localStorage.setItem(`${STORAGE_KEY}_incidents`, JSON.stringify(incidents));
    localStorage.setItem(`${STORAGE_KEY}_teams`, JSON.stringify(rescueTeams));
    localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
    localStorage.setItem(`${STORAGE_KEY}_hospitals`, JSON.stringify(hospitals));
    localStorage.setItem(`${STORAGE_KEY}_shelters`, JSON.stringify(shelters));
    localStorage.setItem(`${STORAGE_KEY}_warehouses`, JSON.stringify(warehouses));
    localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
    localStorage.setItem(`${STORAGE_KEY}_missions`, JSON.stringify(missions));
    localStorage.setItem(`${STORAGE_KEY}_hazards`, JSON.stringify(hazards));
    localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
  }, [disaster, incidents, rescueTeams, vehicles, hospitals, shelters, warehouses, inventory, missions, hazards, alerts]);

  const addNotification = (
    title: string, 
    message: string, 
    severity: 'critical' | 'high' | 'medium' | 'info' = 'info', 
    type = 'EVENT'
  ) => {
    const notif: LiveEventNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      severity,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setLiveNotifications((prev) => [notif, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const refreshData = useCallback(async () => {
    try {
      const [
        disastersRes,
        incidentsRes,
        teamsRes,
        vehiclesRes,
        hospRes,
        sheltersRes,
        whRes,
        invRes,
        missionsRes,
        hazardsRes,
        alertsRes
      ] = await Promise.all([
        api.getDisasters().catch(() => null),
        api.getIncidents().catch(() => null),
        api.getRescueTeams().catch(() => null),
        api.getVehicles().catch(() => null),
        api.getHospitals().catch(() => null),
        api.getShelters().catch(() => null),
        api.getWarehouses().catch(() => null),
        api.getInventory().catch(() => null),
        api.getMissions().catch(() => null),
        api.getRoadHazards().catch(() => null),
        api.getAlerts().catch(() => null)
      ]);

      if (disastersRes?.disasters?.length) {
        setDisaster(disastersRes.disasters[0]);
        setIsDemoMode(false);
      }
      if (incidentsRes?.incidents?.length) setIncidents(incidentsRes.incidents);
      if (teamsRes?.rescue_teams?.length) setRescueTeams(teamsRes.rescue_teams);
      if (vehiclesRes?.vehicles?.length) setVehicles(vehiclesRes.vehicles);
      if (hospRes?.hospitals?.length) setHospitals(hospRes.hospitals);
      if (sheltersRes?.shelters?.length) setShelters(sheltersRes.shelters);
      if (whRes?.warehouses?.length) setWarehouses(whRes.warehouses);
      if (invRes?.inventory?.length) setInventory(invRes.inventory);
      if (missionsRes?.missions?.length) setMissions(missionsRes.missions);
      if (hazardsRes?.road_hazards?.length) setHazards(hazardsRes.road_hazards);
      if (alertsRes?.alerts?.length) setAlerts(alertsRes.alerts);
    } catch {
      // Keep demo data safely
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    socket.connect();

    const unsubStatus = socket.on('STATUS_CHANGE', ({ connected }) => {
      setIsConnected(connected);
      if (connected) setIsDemoMode(false);
    });

    const unsubSOS = socket.on('SOS_CREATED', (payload) => {
      const inc = payload.incident || payload;
      setIncidents((prev) => [inc, ...prev.filter((i) => i.id !== inc.id)]);
      addNotification(
        `🚨 Live SOS Received: #${inc.tracking_code}`,
        `${inc.title} · Urgency: ${inc.priority_score}/100`,
        'critical',
        'SOS_CREATED'
      );
    });

    const unsubIncUpdated = socket.on('INCIDENT_UPDATED', (updatedInc) => {
      setIncidents((prev) => prev.map((i) => (i.id === updatedInc.id ? { ...i, ...updatedInc } : i)));
    });

    return () => {
      unsubStatus();
      unsubSOS();
      unsubIncUpdated();
    };
  }, [refreshData]);

  const submitSOS = async (data: Partial<Incident>) => {
    const trackingCode = `SOS-${Math.floor(100 + Math.random() * 900)}`;
    const newInc: Incident = {
      id: `inc-${Date.now()}`,
      tracking_code: trackingCode,
      type: data.type || 'flood',
      title: data.title || 'Emergency Assistance Requested',
      description: data.description || 'Citizen submitted emergency request via DisasterOS AI portal.',
      latitude: data.latitude || 37.7749,
      longitude: data.longitude || -122.4194,
      address: data.address || 'Active Sector Incident Location',
      status: 'submitted',
      severity: data.severity || 'high',
      priority_score: data.priority_score || 85,
      affected_count: data.affected_count || 1,
      injured_count: data.injured_count || 0,
      trapped_count: data.trapped_count || 0,
      has_children_elderly: !!data.has_children_elderly,
      medical_urgency: !!data.medical_urgency,
      created_at: new Date().toISOString(),
      ai_classification: {
        category: `${data.type?.toUpperCase() || 'GENERAL'} EMERGENCY`,
        confidence: 0.92,
        recommended_response: ['Rapid Response Unit', 'Field Medical Evaluation'],
        rationale: 'Citizen GPS-verified emergency transmission.'
      }
    };

    setIncidents(prev => [newInc, ...prev]);
    setLatestSOS(newInc);
    addNotification(
      `🚨 New Citizen SOS Transmitted: #${trackingCode}`,
      `${newInc.title} (GPS: ${Number(newInc.latitude).toFixed(4)}, ${Number(newInc.longitude).toFixed(4)})`,
      'critical',
      'SOS_CREATED'
    );

    // Also attempt remote submission
    api.submitSOS(data).catch(() => {});
    syncIncidentDirectly(newInc).catch(() => {});

    return { success: true, incident: newInc, tracking_code: trackingCode };
  };

  const createIncident = async (data: Partial<Incident>): Promise<Incident> => {
    // Multi-factor transparent priority scoring
    let baseScore = 50;
    if (data.severity === 'critical') baseScore += 35;
    else if (data.severity === 'high') baseScore += 20;
    else if (data.severity === 'medium') baseScore += 10;

    if (data.medical_urgency) baseScore += 10;
    if (data.has_children_elderly) baseScore += 5;
    if ((data.trapped_count || 0) > 0) baseScore += 10;
    const finalScore = Math.min(100, Math.max(10, baseScore));

    const trackingCode = `INC-${Math.floor(200 + Math.random() * 800)}`;
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      tracking_code: trackingCode,
      type: data.type || 'flood',
      title: data.title || 'Reported Emergency Incident',
      description: data.description || 'Field telemetry report logged into DisasterOS AI.',
      latitude: data.latitude || 37.7749,
      longitude: data.longitude || -122.4194,
      address: data.address || 'San Francisco Sector Grid',
      status: 'submitted',
      severity: data.severity || 'high',
      priority_score: finalScore,
      affected_count: data.affected_count || 5,
      injured_count: data.injured_count || 0,
      trapped_count: data.trapped_count || 0,
      has_children_elderly: !!data.has_children_elderly,
      medical_urgency: !!data.medical_urgency,
      created_at: new Date().toISOString(),
      ai_classification: {
        category: `${data.type?.toUpperCase() || 'FIELD'} HAZARD`,
        confidence: 0.95,
        recommended_response: ['Standard Triage Patrol'],
        rationale: `Rule-based multi-factor score: ${finalScore}/100.`
      }
    };

    setIncidents(prev => [newIncident, ...prev]);
    addNotification(
      `Incident Created: #${trackingCode}`,
      `${newIncident.title} · Priority Score ${finalScore}/100`,
      'info',
      'INCIDENT_CREATED'
    );

    return newIncident;
  };

  const updateIncidentStatus = async (id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status, updated_at: new Date().toISOString() } : inc));
    addNotification(
      `Incident Status Updated`,
      `Incident transitioned to ${status.toUpperCase().replace('_', ' ')}`,
      'info',
      'STATUS_UPDATED'
    );
    api.updateIncident(id, { status }).catch(() => {});
  };

  const allocateResource = (incidentId: string, resourceType: string, quantity: number): { success: boolean; error?: string } => {
    // Check available inventory
    const targetItem = inventory.find(i => 
      i.item_name.toLowerCase().includes(resourceType.toLowerCase()) || 
      i.category.toLowerCase().includes(resourceType.toLowerCase())
    );

    if (targetItem) {
      if (targetItem.quantity_available < quantity) {
        return { 
          success: false, 
          error: `Insufficient inventory: Only ${targetItem.quantity_available} ${targetItem.unit} available (requested: ${quantity}). Over-allocation prevented.` 
        };
      }

      setInventory(prev => prev.map(item => {
        if (item.id === targetItem.id) {
          const newAvail = item.quantity_available - quantity;
          const newRes = item.quantity_reserved + quantity;
          return {
            ...item,
            quantity_available: newAvail,
            quantity_reserved: newRes,
            status: newAvail === 0 ? 'out_of_stock' : newAvail <= item.minimum_threshold ? 'critical' : 'healthy'
          };
        }
        return item;
      }));

      addNotification(
        `Resource Allocated`,
        `Dispatched ${quantity} ${targetItem.unit} of ${targetItem.item_name} to incident #${incidentId}`,
        'info',
        'RESOURCE_DISPATCH'
      );
      return { success: true };
    }

    // Check rescue team availability
    const targetTeam = rescueTeams.find(t => t.id === resourceType || t.status === 'available');
    if (targetTeam) {
      setRescueTeams(prev => prev.map(t => t.id === targetTeam.id ? { ...t, status: 'dispatched', active_mission: `mis-${incidentId}` } : t));
      addNotification(
        `Rescue Team Dispatched`,
        `${targetTeam.name} dispatched to Incident #${incidentId}`,
        'info',
        'TEAM_DISPATCH'
      );
      return { success: true };
    }

    return { success: false, error: 'Resource type not found in operational staging inventory.' };
  };

  const releaseResource = (incidentId: string, resourceType: string, quantity: number): { success: boolean; error?: string } => {
    const targetItem = inventory.find(i => 
      i.item_name.toLowerCase().includes(resourceType.toLowerCase()) || 
      i.category.toLowerCase().includes(resourceType.toLowerCase())
    );

    if (targetItem) {
      setInventory(prev => prev.map(item => {
        if (item.id === targetItem.id) {
          const newRes = Math.max(0, item.quantity_reserved - quantity);
          const newAvail = item.quantity_available + quantity;
          return {
            ...item,
            quantity_available: newAvail,
            quantity_reserved: newRes,
            status: newAvail > item.minimum_threshold ? 'healthy' : 'low'
          };
        }
        return item;
      }));
      return { success: true };
    }

    return { success: true };
  };

  const dispatchMission = async (missionData: any) => {
    const newMission: Mission = {
      id: `mis-${Date.now()}`,
      mission_code: `MIS-${Math.floor(100 + Math.random() * 900)}`,
      incident_id: missionData.incident_id || incidents[0]?.id || 'inc-101',
      team_id: missionData.team_id || rescueTeams[0]?.id || 'team-001',
      vehicle_id: missionData.vehicle_id || vehicles[0]?.id || 'veh-001',
      priority: missionData.priority || 'high',
      status: 'dispatched',
      objective: missionData.objective || 'Coordinate perimeter containment and emergency triage.',
      assigned_at: new Date().toISOString()
    };

    setMissions(prev => [newMission, ...prev]);
    // Update team status
    setRescueTeams(prev => prev.map(t => t.id === newMission.team_id ? { ...t, status: 'dispatched', active_mission: newMission.id } : t));

    addNotification(
      `🚁 Mission Dispatched: ${newMission.mission_code}`,
      newMission.objective,
      'info',
      'MISSION_DISPATCH'
    );

    return { success: true, mission: newMission };
  };

  const startSimulationCascade = async () => {
    addNotification(
      '🌊 Atmospheric Surge Cascade Active',
      'IoT river level gauges breached threshold (+42mm/h). Telemetry stream active.',
      'critical',
      'SIMULATION'
    );
    return { success: true };
  };

  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_disaster`);
    localStorage.removeItem(`${STORAGE_KEY}_incidents`);
    localStorage.removeItem(`${STORAGE_KEY}_teams`);
    localStorage.removeItem(`${STORAGE_KEY}_vehicles`);
    localStorage.removeItem(`${STORAGE_KEY}_hospitals`);
    localStorage.removeItem(`${STORAGE_KEY}_shelters`);
    localStorage.removeItem(`${STORAGE_KEY}_warehouses`);
    localStorage.removeItem(`${STORAGE_KEY}_inventory`);
    localStorage.removeItem(`${STORAGE_KEY}_missions`);
    localStorage.removeItem(`${STORAGE_KEY}_hazards`);
    localStorage.removeItem(`${STORAGE_KEY}_alerts`);

    setDisaster(DEMO_DISASTERS[0]);
    setIncidents(DEMO_INCIDENTS);
    setRescueTeams(DEMO_RESCUE_TEAMS);
    setVehicles(DEMO_VEHICLES);
    setHospitals(DEMO_HOSPITALS);
    setShelters(DEMO_SHELTERS);
    setWarehouses(DEMO_WAREHOUSES);
    setInventory(DEMO_INVENTORY);
    setMissions(DEMO_MISSIONS);
    setHazards(DEMO_HAZARDS);
    setAlerts(DEMO_ALERTS);

    addNotification(
      'System State Reset',
      'Restored standard operational demo scenarios and sensor telemetry.',
      'info',
      'SYSTEM_RESET'
    );
  };

  return (
    <DisasterContext.Provider
      value={{
        disaster,
        incidents,
        rescueTeams,
        vehicles,
        hospitals,
        shelters,
        warehouses,
        inventory,
        missions,
        hazards,
        alerts,
        liveNotifications,
        latestSOS,
        setLatestSOS,
        isLoading,
        isConnected,
        isDemoMode,
        refreshData,
        submitSOS,
        createIncident,
        updateIncidentStatus,
        allocateResource,
        releaseResource,
        dispatchMission,
        dismissNotification,
        startSimulationCascade,
        resetDemoData
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) throw new Error('useDisaster must be used within a DisasterProvider');
  return context;
};
