// DisasterOS Interactive Emergency GPS Location Picker Map
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, MapPin, Satellite, Navigation, Crosshair, Layers, Check } from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';

interface EmergencyLocationPickerMapProps {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  onLocationChange: (lat: number, lng: number) => void;
  isDetectingLocation?: boolean;
  onDetectLocation?: () => void;
  height?: string;
}

// Custom Pulsing Distress Radar Marker
const createDistressPinIcon = () => {
  return L.divIcon({
    className: 'emergency-distress-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: #FF5D67; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: #FF5D67; opacity: 0.85; box-shadow: 0 0 16px #FF5D67;"></div>
        <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background-color: #050817; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white;">
          🚨
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

// Subtle Shelter Marker
const createShelterIcon = () => {
  return L.divIcon({
    className: 'shelter-ref-marker',
    html: `
      <div style="background-color: #55D6A7; box-shadow: 0 0 10px rgba(85,214,167,0.5); border: 1.5px solid white;" 
           class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
        🏕️
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Camera Controller that re-centers when coordinates change
const MapViewController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

// Map Click Listener to reposition the distress pin
const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
    }
  });
  return null;
};

export const EmergencyLocationPickerMap: React.FC<EmergencyLocationPickerMapProps> = ({
  latitude,
  longitude,
  accuracyMeters,
  onLocationChange,
  isDetectingLocation = false,
  onDetectLocation,
  height = '260px'
}) => {
  const { shelters } = useDisaster();
  const [mapMode, setMapMode] = useState<'dark' | 'satellite'>('dark');
  const markerRef = useRef<L.Marker | null>(null);

  const centerCoordinates: [number, number] = useMemo(() => [latitude, longitude], [latitude, longitude]);
  const distressIcon = useMemo(() => createDistressPinIcon(), []);
  const shelterIcon = useMemo(() => createShelterIcon(), []);

  // Handle marker drag
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onLocationChange(Number(newPos.lat.toFixed(4)), Number(newPos.lng.toFixed(4)));
        }
      }
    }),
    [onLocationChange]
  );

  return (
    <div className="space-y-2">
      {/* Map Container Box */}
      <div 
        className="relative w-full rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-[#05070d] isolate z-0"
        style={{ height }}
      >
        <MapContainer
          center={centerCoordinates}
          zoom={16}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapViewController center={centerCoordinates} />
          <MapClickHandler onClick={onLocationChange} />

          {/* Tile Layer: Tactical Dark vs Google Satellite Hybrid */}
          {mapMode === 'dark' ? (
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com">Google</a>'
              url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['0', '1', '2', '3']}
              maxZoom={20}
              className="google-maps-dark-tiles"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com">Google Earth</a>'
              url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={['0', '1', '2', '3']}
              maxZoom={20}
            />
          )}

          {/* Accuracy Buffer Circle */}
          <Circle
            center={centerCoordinates}
            radius={Math.max(accuracyMeters, 15)}
            pathOptions={{
              color: '#38bdf8',
              fillColor: '#38bdf8',
              fillOpacity: 0.18,
              weight: 1.5,
              dashArray: '4, 4'
            }}
          />

          {/* Draggable Distress Pin */}
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={centerCoordinates}
            ref={markerRef}
            icon={distressIcon}
          />

          {/* Nearby Reference Shelters */}
          {shelters.slice(0, 3).map((s) => (
            <Marker
              key={s.id}
              position={[Number(s.latitude), Number(s.longitude)]}
              icon={shelterIcon}
            />
          ))}
        </MapContainer>

        {/* Top-Left Floating Controls: Mode Switcher */}
        <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center gap-1.5 bg-[#0A1022]/90 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-lg text-[10.5px]">
          <button
            type="button"
            onClick={() => setMapMode('dark')}
            className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              mapMode === 'dark'
                ? 'bg-[#38bdf8] text-[#020617]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Tactical
          </button>
          <button
            type="button"
            onClick={() => setMapMode('satellite')}
            className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              mapMode === 'satellite'
                ? 'bg-[#38bdf8] text-[#020617]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>Satellite</span>
          </button>
        </div>

        {/* Top-Right Floating Control: Auto-Detect GPS Button */}
        {onDetectLocation && (
          <div className="absolute top-2.5 right-2.5 z-[1000]">
            <button
              type="button"
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="px-2.5 py-1 rounded-xl bg-[#0A1022]/90 hover:bg-[#0A1022] backdrop-blur-md border border-white/20 text-[#38bdf8] text-[11px] font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              title="Snap to live device GPS"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Fixing...' : 'Snap GPS'}</span>
            </button>
          </div>
        )}

        {/* Bottom Helper Bar Overlay */}
        <div className="absolute bottom-2 inset-x-2 z-[1000] pointer-events-none flex items-center justify-between">
          <div className="bg-[#0A1022]/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-[10px] font-mono text-white/80 shadow-md flex items-center gap-1.5">
            <Crosshair className="w-3 h-3 text-rose-400 shrink-0" />
            <span>Click map or drag 🚨 pin to pinpoint your floor/egress</span>
          </div>
        </div>
      </div>

      {/* GPS Coordinate Telemetry Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-white/60 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold">Coordinates:</span>
          <span>{latitude.toFixed(4)}°N, {Math.abs(longitude).toFixed(4)}°W</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8] font-bold">Accuracy: ±{accuracyMeters}m</span>
          <span className="text-white/40">· Dual-Band Lock</span>
        </div>
      </div>
    </div>
  );
};
