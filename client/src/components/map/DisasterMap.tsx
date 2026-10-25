// DisasterOS AI Interactive Geospatial Operations Map
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useDisaster } from '../../context/DisasterContext';
import { Incident, Hospital, Shelter, RescueTeam, Warehouse, RoadHazard } from '../../types';
import { Filter, Layers, Navigation, AlertOctagon, MapPin, Radio, Shield, Activity, Home, Boxes, Key, CheckCircle2, X } from 'lucide-react';

// Custom SVG Leaflet Markers with dark theme rings & glows
const createIcon = (bg: string, emoji: string, glow = 'rgba(99,189,245,0.4)') => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="background-color: ${bg}; box-shadow: 0 0 14px ${glow}; border: 1.5px solid rgba(255,255,255,0.8);" 
           class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-transform hover:scale-125">
        ${emoji}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
};

// Specialized Animated Pulsing Radar Marker for Real SOS Signals
const createPulsingSOSIcon = (trackingCode: string, severity = 'critical') => {
  const isCritical = severity === 'critical';
  const color = isCritical ? '#FF5D67' : '#FFB454';

  return L.divIcon({
    className: 'pulsing-sos-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: ${color}; opacity: 0.4; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: ${color}; opacity: 0.85; box-shadow: 0 0 16px ${color};"></div>
        <div style="position: relative; width: 26px; height: 26px; border-radius: 9999px; background-color: #050817; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; border: 2px solid ${color};">
          🚨
        </div>
        <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background-color: #0D162B; color: #63BDF5; font-size: 9.5px; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.6); white-space: nowrap; border: 1px solid rgba(99,189,245,0.3);">
          #${trackingCode || 'SOS'}
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

const icons = {
  critical: createIcon('#FF5D67', '⚠️', 'rgba(255,93,103,0.6)'),
  high: createIcon('#FFB454', '⚡', 'rgba(255,180,84,0.6)'),
  medium: createIcon('#63BDF5', '🚨', 'rgba(99,189,245,0.6)'),
  resolved: createIcon('#55D6A7', '✓', 'rgba(85,214,167,0.6)'),
  team: createIcon('#35D6E8', '🚒', 'rgba(53,214,232,0.6)'),
  hospital: createIcon('#FF5D67', '🏥', 'rgba(255,93,103,0.5)'),
  shelter: createIcon('#55D6A7', '🏕️', 'rgba(85,214,167,0.5)'),
  warehouse: createIcon('#63BDF5', '🏭', 'rgba(99,189,245,0.4)'),
  hazard: createIcon('#FF5D67', '⛔', 'rgba(255,93,103,0.7)')
};

// Leaflet Map Controller to dynamically fly to target coordinates or incidents
function MapViewController({ 
  targetCenter, 
  targetZoom,
  selectedIncident,
  latestSOS
}: { 
  targetCenter?: [number, number]; 
  targetZoom?: number;
  selectedIncident?: Incident | null;
  latestSOS?: Incident | null;
}) {
  const map = useMap();

  useEffect(() => {
    const focusTarget = selectedIncident || latestSOS;
    if (focusTarget && Number.isFinite(focusTarget.latitude) && Number.isFinite(focusTarget.longitude)) {
      map.flyTo([Number(focusTarget.latitude), Number(focusTarget.longitude)], 15, {
        animate: true,
        duration: 1.2
      });
    } else if (targetCenter && Number.isFinite(targetCenter[0]) && Number.isFinite(targetCenter[1])) {
      map.flyTo(targetCenter, targetZoom || map.getZoom(), {
        animate: true,
        duration: 1.0
      });
    }
  }, [selectedIncident, latestSOS, targetCenter, targetZoom, map]);

  return null;
}

// Leaflet Map Event Listener for Click-to-Pin coordinates
function MapClickHandler({ 
  onLocationSelect 
}: { 
  onLocationSelect?: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
      }
    }
  });
  return null;
}

interface DisasterMapProps {
  height?: string;
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  activeRoutePolyline?: [number, number][];
  centerCoordinates?: [number, number];
  zoomLevel?: number;
  enableMapClick?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  previewLocation?: [number, number] | null;
  previewLabel?: string;
  showFocusControls?: boolean;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  height = '580px',
  selectedIncident,
  onSelectIncident,
  centerCoordinates,
  zoomLevel = 13,
  enableMapClick = false,
  onLocationSelect,
  previewLocation,
  showFocusControls = true
}) => {
  const { incidents, hospitals, shelters, rescueTeams, warehouses, hazards, latestSOS } = useDisaster();

  // Map Tile Mode: Google Maps Tactical Dark (Default), Satellite Hybrid, Streets, or Terrain
  const [mapMode, setMapMode] = useState<'dark' | 'satellite' | 'streets' | 'terrain'>('dark');

  // Google Maps API Key configuration
  const [googleApiKey, setGoogleApiKey] = useState<string>(() => {
    return localStorage.getItem('disasteros_google_maps_api_key') || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  });
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(googleApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempApiKey.trim();
    setGoogleApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem('disasteros_google_maps_api_key', cleanKey);
    } else {
      localStorage.removeItem('disasteros_google_maps_api_key');
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setApiKeyModalOpen(false);
    }, 1200);
  };

  const getGoogleTileUrl = (lyrs: 'm' | 's' | 'y' | 'p') => {
    const keyParam = googleApiKey.trim() ? `&key=${encodeURIComponent(googleApiKey.trim())}` : '';
    return `https://mt{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}${keyParam}`;
  };

  const [layers, setLayers] = useState({
    incidents: true,
    teams: true,
    hospitals: true,
    shelters: true,
    warehouses: true,
    hazards: true,
    zones: true
  });

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const activeFocus = previewLocation || (latestSOS ? [Number(latestSOS.latitude), Number(latestSOS.longitude)] : null);
  const defaultCenter: [number, number] = centerCoordinates || activeFocus || [37.7749, -122.4194];

  // Simulated Flood Hazard Zone Polygon
  const floodZoneCoordinates: [number, number][] = [
    [37.795, -122.435],
    [37.808, -122.410],
    [37.798, -122.390],
    [37.780, -122.420]
  ];

  // Wildfire danger zone circle center
  const fireZoneCenter: [number, number] = [37.7520, -122.3875];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#050817]">
      
      {/* Top Filter Bar Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#0D162B]/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-1.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="px-2 font-mono text-[10.5px] uppercase tracking-wider text-[#9AA6BA] flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#63BDF5]" />
          Layers:
        </span>
        <button
          onClick={() => toggleLayer('incidents')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            layers.incidents ? 'bg-[#FF5D67]/20 text-[#FF5D67] border border-[#FF5D67]/40 font-bold' : 'text-[#9AA6BA] hover:bg-white/5'
          }`}
        >
          🚨 Incidents ({incidents.length})
        </button>
        <button
          onClick={() => toggleLayer('teams')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            layers.teams ? 'bg-[#35D6E8]/20 text-[#35D6E8] border border-[#35D6E8]/40 font-bold' : 'text-[#9AA6BA] hover:bg-white/5'
          }`}
        >
          🚒 Teams ({rescueTeams.length})
        </button>
        <button
          onClick={() => toggleLayer('hospitals')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            layers.hospitals ? 'bg-[#FF5D67]/15 text-[#FF5D67] border border-[#FF5D67]/30 font-bold' : 'text-[#9AA6BA] hover:bg-white/5'
          }`}
        >
          🏥 Hospitals ({hospitals.length})
        </button>
        <button
          onClick={() => toggleLayer('shelters')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            layers.shelters ? 'bg-[#55D6A7]/20 text-[#55D6A7] border border-[#55D6A7]/40 font-bold' : 'text-[#9AA6BA] hover:bg-white/5'
          }`}
        >
          🏕️ Shelters ({shelters.length})
        </button>
        <button
          onClick={() => toggleLayer('zones')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            layers.zones ? 'bg-[#63BDF5]/20 text-[#63BDF5] border border-[#63BDF5]/40 font-bold' : 'text-[#9AA6BA] hover:bg-white/5'
          }`}
        >
          🌊 Hazard Zones
        </button>
      </div>

      {/* Top Right Controls & Google Maps Mode Switcher */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-wrap items-center justify-end gap-1.5">
        <div className="bg-[#0D162B]/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-1 flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMapMode('dark')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              mapMode === 'dark'
                ? 'bg-[#63BDF5] text-[#050817] shadow-sm'
                : 'text-[#9AA6BA] hover:text-white hover:bg-white/5'
            }`}
            title="Google Maps Midnight Tactical Dark Grid"
          >
            <span>🌌</span>
            <span>Dark Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setMapMode('satellite')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              mapMode === 'satellite'
                ? 'bg-[#63BDF5] text-[#050817] shadow-sm'
                : 'text-[#9AA6BA] hover:text-white hover:bg-white/5'
            }`}
            title="Google Maps High-Resolution Satellite & Aerial Hybrid"
          >
            <span>🛰️</span>
            <span>Satellite</span>
          </button>

          <button
            type="button"
            onClick={() => setMapMode('streets')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              mapMode === 'streets'
                ? 'bg-[#63BDF5] text-[#050817] shadow-sm'
                : 'text-[#9AA6BA] hover:text-white hover:bg-white/5'
            }`}
            title="Official Google Maps Streets & Highway Network"
          >
            <span>🗺️</span>
            <span>Streets</span>
          </button>

          <button
            type="button"
            onClick={() => setMapMode('terrain')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              mapMode === 'terrain'
                ? 'bg-[#63BDF5] text-[#050817] shadow-sm'
                : 'text-[#9AA6BA] hover:text-white hover:bg-white/5'
            }`}
            title="Google Maps Physical Topography & Elevation"
          >
            <span>⛰️</span>
            <span>Terrain</span>
          </button>
        </div>

        {/* Google Maps API Key Config Trigger Button */}
        <button
          type="button"
          onClick={() => {
            setTempApiKey(googleApiKey);
            setApiKeyModalOpen(true);
          }}
          className="bg-[#0D162B]/90 backdrop-blur-xl rounded-xl border border-white/10 hover:border-[#63BDF5]/50 shadow-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-[#9AA6BA] hover:text-white transition-all cursor-pointer shrink-0"
          title="Configure Google Maps API Integration"
        >
          <span className="w-2 h-2 rounded-full bg-[#55D6A7] animate-pulse shrink-0" />
          <span className="font-mono text-[11px] font-semibold text-[#63BDF5]">Google Maps</span>
          <Key className="w-3 h-3 text-[#9AA6BA] shrink-0" />
        </button>

        {showFocusControls && enableMapClick && (
          <span className="hidden sm:inline-block bg-[#0D162B]/90 text-[#63BDF5] text-[11px] font-mono font-medium px-2.5 py-1.5 rounded-xl border border-white/10">
            📍 Click map to pin coordinates
          </span>
        )}
      </div>

      {/* Google Maps API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0A1022] border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#63BDF5]/20 border border-[#63BDF5]/40 flex items-center justify-center text-[#63BDF5]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Maps API Configuration</h3>
                  <p className="text-[11px] text-[#9AA6BA]">Geospatial telemetry & multi-mode layer engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="text-[#9AA6BA] hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0D162B] p-3 rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#55D6A7] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Google Maps Live Tile Telemetry Active</span>
              </div>
              <p className="text-[#9AA6BA] leading-relaxed">
                All 3 map layers (Dark Grid, Satellite, Streets, and Terrain) stream directly from high-performance Google Maps servers with zero Carto watermarks.
              </p>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Google Cloud Platform API Key <span className="text-[#9AA6BA] font-normal">(Optional Enterprise)</span>
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="w-full bg-[#050817] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:border-[#63BDF5]"
                />
                <p className="text-[10.5px] text-[#9AA6BA] mt-1">
                  Leave blank to use pre-configured high-speed Google Maps tiles, or enter your official key to bind custom enterprise quotas.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempApiKey('');
                    localStorage.removeItem('disasteros_google_maps_api_key');
                    setGoogleApiKey('');
                    setApiKeyModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#9AA6BA] hover:text-white hover:bg-white/5"
                >
                  Reset Default
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-1.5 px-4 font-bold flex items-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Key</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Leaflet Map View */}
      <div style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Dynamic Map Camera Controller */}
          <MapViewController 
            targetCenter={centerCoordinates || previewLocation || undefined} 
            targetZoom={zoomLevel}
            selectedIncident={selectedIncident}
            latestSOS={latestSOS}
          />

          {/* Click Handler */}
          {enableMapClick && <MapClickHandler onLocationSelect={onLocationSelect} />}

          {/* 1. Google Maps Dark Grid (Midnight Tactical Theme - No Watermark) */}
          {mapMode === 'dark' && (
            <TileLayer
              key={`google-dark-${googleApiKey}`}
              attribution='Map data &copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google</a>'
              url={getGoogleTileUrl('m')}
              subdomains={['0', '1', '2', '3']}
              maxZoom={20}
              className="google-maps-dark-tiles"
            />
          )}

          {/* 2. Google Maps High-Resolution Satellite & Aerial Hybrid */}
          {mapMode === 'satellite' && (
            <TileLayer
              key={`google-satellite-${googleApiKey}`}
              attribution='Imagery &copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Earth</a>'
              url={getGoogleTileUrl('y')}
              subdomains={['0', '1', '2', '3']}
              maxZoom={20}
            />
          )}

          {/* 3. Official Google Maps Streets & Highway Network */}
          {mapMode === 'streets' && (
            <TileLayer
              key={`google-streets-${googleApiKey}`}
              attribution='Map data &copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
              url={getGoogleTileUrl('m')}
              subdomains={['0', '1', '2', '3']}
              maxZoom={20}
            />
          )}

          {/* 4. Google Maps Physical Topography & Elevation */}
          {mapMode === 'terrain' && (
            <TileLayer
              key={`google-terrain-${googleApiKey}`}
              attribution='Map data &copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
              url={getGoogleTileUrl('p')}
              subdomains={['0', '1', '2', '3']}
              maxZoom={20}
            />
          )}

          {/* Hazard Zones Polygon */}
          {layers.zones && (
            <Polygon
              positions={floodZoneCoordinates}
              pathOptions={{
                color: '#63BDF5',
                fillColor: '#35D6E8',
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-mono text-[#63BDF5] uppercase font-bold block">
                    EVACUATION ZONE A
                  </span>
                  <h4 className="text-xs font-bold text-white">Marina Waterfront Inundation</h4>
                  <p className="text-[11px] text-[#9AA6BA]">High tide storm surge overlay active.</p>
                </div>
              </Popup>
            </Polygon>
          )}

          {/* Incidents Markers */}
          {layers.incidents && incidents.map(inc => {
            const isSelected = selectedIncident?.id === inc.id;
            const isCritical = inc.severity === 'critical';
            const icon = isCritical
              ? createPulsingSOSIcon(inc.tracking_code, inc.severity)
              : inc.severity === 'high' ? icons.high : icons.medium;

            return (
              <Marker
                key={inc.id}
                position={[Number(inc.latitude), Number(inc.longitude)]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectIncident && onSelectIncident(inc)
                }}
              >
                <Popup>
                  <div className="p-2 space-y-2 min-w-[220px]">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#63BDF5] font-bold">#{inc.tracking_code}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                        inc.severity === 'critical' ? 'bg-[#FF5D67]/20 text-[#FF5D67]' : 'bg-[#FFB454]/20 text-[#FFB454]'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight">{inc.title}</h4>
                    <p className="text-[11px] text-[#9AA6BA] leading-snug line-clamp-2">{inc.description}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono">
                      <span className="text-[#35D6E8]">Urgency: {inc.priority_score}/100</span>
                      <button
                        onClick={() => onSelectIncident && onSelectIncident(inc)}
                        className="text-[#63BDF5] hover:underline font-bold"
                      >
                        Inspect &rarr;
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Rescue Teams */}
          {layers.teams && rescueTeams.map(team => (
            <Marker
              key={team.id}
              position={[Number(team.current_lat), Number(team.current_lng)]}
              icon={icons.team}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-mono text-[#35D6E8] uppercase font-bold block">{team.team_code}</span>
                  <h4 className="text-xs font-bold text-white">{team.name}</h4>
                  <p className="text-[11px] text-[#9AA6BA]">Lead: {team.lead_name} · Status: {team.status.toUpperCase()}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Hospitals */}
          {layers.hospitals && hospitals.map(hosp => (
            <Marker
              key={hosp.id}
              position={[Number(hosp.latitude), Number(hosp.longitude)]}
              icon={icons.hospital}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-mono text-[#FF5D67] uppercase font-bold block">TRAUMA LEVEL {hosp.trauma_level}</span>
                  <h4 className="text-xs font-bold text-white">{hosp.name}</h4>
                  <p className="text-[11px] text-[#9AA6BA]">Available Beds: {hosp.available_beds} / {hosp.total_beds} · ICU: {hosp.icu_available}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Shelters */}
          {layers.shelters && shelters.map(shelt => (
            <Marker
              key={shelt.id}
              position={[Number(shelt.latitude), Number(shelt.longitude)]}
              icon={icons.shelter}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-mono text-[#55D6A7] uppercase font-bold block">EMERGENCY SHELTER</span>
                  <h4 className="text-xs font-bold text-white">{shelt.name}</h4>
                  <p className="text-[11px] text-[#9AA6BA]">Open Capacity: {shelt.capacity - shelt.current_occupancy} of {shelt.capacity} beds</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Road Hazards */}
          {layers.hazards && hazards.map(haz => (
            <Marker
              key={haz.id}
              position={[Number(haz.latitude), Number(haz.longitude)]}
              icon={icons.hazard}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-mono text-[#FF5D67] uppercase font-bold block">ROAD IMPASSABLE</span>
                  <h4 className="text-xs font-bold text-white">{haz.road_name}</h4>
                  <p className="text-[11px] text-[#9AA6BA]">{haz.hazard_type}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
