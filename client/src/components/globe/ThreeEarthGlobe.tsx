import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, ZoomIn, ZoomOut, RotateCcw, ArrowRight, Navigation } from 'lucide-react';

interface DisasterMarkerData {
  id: string;
  name: string;
  type: 'flood' | 'wildfire' | 'earthquake' | 'storm';
  severity: 'critical' | 'severe' | 'advisory';
  lat: number;
  lng: number;
  location: string;
  affected: string;
  status: string;
  leadTime: string;
}

const GLOBAL_MARKERS: DisasterMarkerData[] = [
  {
    id: 'inc-101',
    name: 'Coastal Viaduct Flash Inundation',
    type: 'flood',
    severity: 'critical',
    lat: 37.7985,
    lng: -122.4012,
    location: 'Pacific Rim · San Francisco Bay',
    affected: '38,000+ residents',
    status: 'Swiftwater Boats Deployed',
    leadTime: 'Peak Inundation: 38 min'
  },
  {
    id: 'inc-102',
    name: 'Siskiyou Timber Wildfire Corridor',
    type: 'wildfire',
    severity: 'severe',
    lat: 41.3148,
    lng: -122.3114,
    location: 'Cascadia Range · Northern Sector',
    affected: '14,200 residents',
    status: 'Foam Barrier Staged',
    leadTime: 'Perimeter Advance: 2.4 km/h'
  },
  {
    id: 'inc-103',
    name: '7.4M Subduction Fault Rupture',
    type: 'earthquake',
    severity: 'critical',
    lat: 35.6762,
    lng: 139.6503,
    location: 'Honshu Coastal Trench · Japan',
    affected: '120,000+ residents',
    status: 'USAR Acoustic Sweeps Active',
    leadTime: 'Liquefaction Advisory Active'
  },
  {
    id: 'inc-104',
    name: 'Mediterranean Forest Thermal Flare',
    type: 'wildfire',
    severity: 'severe',
    lat: 38.2466,
    lng: 23.7275,
    location: 'Attica Corridor · Greece',
    affected: '8,500 residents',
    status: 'Aerial Drops Coordinated',
    leadTime: 'Buffer Containment: 65%'
  },
  {
    id: 'inc-105',
    name: 'Sunda Strait River Basin Surge',
    type: 'flood',
    severity: 'advisory',
    lat: -6.2088,
    lng: 106.8456,
    location: 'Ciliwung River Basin · Jakarta',
    affected: '45,000 residents',
    status: 'Pumping Stations Max Load',
    leadTime: 'Flood Crest: 2.1h'
  },
  {
    id: 'inc-106',
    name: 'Atlantic Tropical Gale Staging',
    type: 'storm',
    severity: 'critical',
    lat: 18.2208,
    lng: -66.5901,
    location: 'Caribbean Coastal Shelf · Puerto Rico',
    affected: '95,000 residents',
    status: 'Evacuation Corridors Open',
    leadTime: 'Gale Inflow: 45 min'
  }
];

// Helper: Convert Lat/Lng to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const ThreeEarthGlobe: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedMarker, setSelectedMarker] = useState<DisasterMarkerData | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [telemetryHover, setTelemetryHover] = useState<string>('37.7749° N, 122.4194° W');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const markerMeshesRef = useRef<{ mesh: THREE.Mesh; data: DisasterMarkerData }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0.0012, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setAutoRotate(false);
    }
  }, []);

  const handleMarkerClick = useCallback((marker: DisasterMarkerData) => {
    setSelectedMarker(marker);
    setTelemetryHover(`${marker.lat.toFixed(4)}° N, ${Math.abs(marker.lng).toFixed(4)}° W`);

    if (globeGroupRef.current) {
      const targetPhi = (90 - marker.lat) * (Math.PI / 180);
      const targetTheta = -(marker.lng * (Math.PI / 180)) - Math.PI / 2;
      globeGroupRef.current.rotation.y = targetTheta;
      globeGroupRef.current.rotation.x = (targetPhi - Math.PI / 2) * 0.3;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    // Camera positioned to view majestic large Earth from slight distance
    camera.position.set(0, 0, 4.3);
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Globe Master Group
    const globeGroup = new THREE.Group();
    // Tilt to show Europe, Asia, and Pacific Rim like the reference screenshot
    globeGroup.rotation.x = 0.32;
    globeGroup.rotation.y = -1.25;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 4. Photorealistic Earth Sphere Mesh
    const earthRadius = 1.95; // Large, impressive scale matching Image 2
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    
    // Load local high-resolution NASA textures
    const earthMap = textureLoader.load('/textures/earth-blue-marble.jpg');
    const bumpMap = textureLoader.load('/textures/earth-topology.png');
    
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthMap,
      bumpMap: bumpMap,
      bumpScale: 0.04,
      roughness: 0.62,
      metalness: 0.1
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // 5. Cloud Layer Sphere
    // Subtle procedural cloud canvas
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 1024;
    cloudCanvas.height = 512;
    const cCtx = cloudCanvas.getContext('2d');
    if (cCtx) {
      cCtx.clearRect(0, 0, 1024, 512);
      cCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 35; i++) {
        const cx = Math.random() * 1024;
        const cy = 120 + Math.random() * 280;
        const rx = 100 + Math.random() * 160;
        const ry = 18 + Math.random() * 32;
        const grad = cCtx.createRadialGradient(cx, cy, 2, cx, cy, rx);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        cCtx.fillStyle = grad;
        cCtx.beginPath();
        cCtx.ellipse(cx, cy, rx, ry, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
        cCtx.fill();
      }
    }
    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    cloudTexture.wrapS = THREE.RepeatWrapping;

    const cloudGeometry = new THREE.SphereGeometry(earthRadius * 1.012, 48, 48);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      roughness: 1.0
    });
    const cloudsMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 6. Atmospheric Glow Rim Shader (Terra Aesthetic Cyan/Sky-Blue Aura)
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.15, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(0.34, 0.76, 0.97, 1.0) * intensity * 1.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // 7. Lighting (Sunlight matching Image 2 angle)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 3.8, 3.5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0e172e, 1.2);
    scene.add(ambientLight);

    const rimBlueLight = new THREE.DirectionalLight(0x56c2f7, 1.8);
    rimBlueLight.position.set(-5, -2, -3);
    scene.add(rimBlueLight);

    // 8. Interactive Disaster Hotspot Markers
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markerMeshesRef.current = [];

    GLOBAL_MARKERS.forEach(data => {
      const pos = latLngToVector3(data.lat, data.lng, earthRadius * 1.015);

      let colorHex = 0xff5d67; // Red - Critical
      if (data.severity === 'severe') colorHex = 0xffb454;
      if (data.severity === 'advisory') colorHex = 0x56c2f7;

      // Core Sphere
      const markerGeom = new THREE.SphereGeometry(0.045, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const markerMesh = new THREE.Mesh(markerGeom, markerMat);
      markerMesh.position.copy(pos);
      markersGroup.add(markerMesh);

      // Sonar Pulse Ring
      const ringGeom = new THREE.RingGeometry(0.05, 0.08, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      markersGroup.add(ringMesh);

      markerMeshesRef.current.push({ mesh: markerMesh, data });
    });

    // 9. Pointer Events & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getPointerCoords = (e: MouseEvent | Touch) => {
      const rect = renderer.domElement.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
        clientX: e.clientX,
        clientY: e.clientY
      };
    };

    const handlePointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const { x, y, clientX, clientY } = getPointerCoords(e);
      mouse.x = x;
      mouse.y = y;

      if (isDraggingRef.current && globeGroupRef.current) {
        const deltaX = clientX - previousMousePositionRef.current.x;
        const deltaY = clientY - previousMousePositionRef.current.y;

        velocityRef.current = {
          x: deltaX * 0.0035,
          y: deltaY * 0.0035
        };

        globeGroupRef.current.rotation.y += velocityRef.current.x;
        globeGroupRef.current.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroupRef.current.rotation.x + velocityRef.current.y));

        previousMousePositionRef.current = { x: clientX, y: clientY };
      } else {
        raycaster.setFromCamera(mouse, camera);
        const markerMeshes = markerMeshesRef.current.map(m => m.mesh);
        const intersects = raycaster.intersectObjects(markerMeshes);

        if (intersects.length > 0) {
          container.style.cursor = 'pointer';
          const match = markerMeshesRef.current.find(m => m.mesh === intersects[0].object);
          if (match) {
            setTelemetryHover(`${match.data.lat.toFixed(4)}° N, ${Math.abs(match.data.lng).toFixed(4)}° W · ${match.data.name}`);
          }
        } else {
          container.style.cursor = 'grab';
        }
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        const totalMove = Math.abs(e.clientX - previousMousePositionRef.current.x) + Math.abs(e.clientY - previousMousePositionRef.current.y);

        if (totalMove < 5) {
          const { x, y } = getPointerCoords(e);
          mouse.x = x;
          mouse.y = y;
          raycaster.setFromCamera(mouse, camera);
          const markerMeshes = markerMeshesRef.current.map(m => m.mesh);
          const intersects = raycaster.intersectObjects(markerMeshes);

          if (intersects.length > 0) {
            const match = markerMeshesRef.current.find(m => m.mesh === intersects[0].object);
            if (match) {
              handleMarkerClick(match.data);
            }
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomFactor = e.deltaY * 0.0016;
      cameraRef.current.position.z = Math.max(3.2, Math.min(6.5, cameraRef.current.position.z + zoomFactor));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1 && globeGroupRef.current) {
        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;
        const deltaX = clientX - previousMousePositionRef.current.x;
        const deltaY = clientY - previousMousePositionRef.current.y;

        globeGroupRef.current.rotation.y += deltaX * 0.004;
        globeGroupRef.current.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroupRef.current.rotation.x + deltaY * 0.004));

        previousMousePositionRef.current = { x: clientX, y: clientY };
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.02;

      if (globeGroupRef.current) {
        if (!isDraggingRef.current) {
          if (autoRotate) {
            globeGroupRef.current.rotation.y += 0.0012;
          } else {
            velocityRef.current.x *= 0.95;
            velocityRef.current.y *= 0.95;
            globeGroupRef.current.rotation.y += velocityRef.current.x;
            globeGroupRef.current.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroupRef.current.rotation.x + velocityRef.current.y));
          }
        }
      }

      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0005;
      }

      // Sonar pulse scale
      const pulse = 1 + 0.35 * Math.sin(time * 3);
      markersGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
          child.scale.set(pulse, pulse, 1);
          if (child.material instanceof THREE.Material) {
            (child.material as THREE.MeshBasicMaterial).opacity = 0.8 - (pulse - 1) * 1.5;
          }
        }
      });

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      domElement.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      earthMap.dispose();
      bumpMap.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      cloudTexture.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [autoRotate, handleMarkerClick]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -0.4 : 0.4;
    cameraRef.current.position.z = Math.max(3.2, Math.min(6.5, cameraRef.current.position.z + delta));
  };

  const handleResetView = () => {
    if (globeGroupRef.current && cameraRef.current) {
      globeGroupRef.current.rotation.x = 0.32;
      globeGroupRef.current.rotation.y = -1.25;
      cameraRef.current.position.set(0, 0, 4.3);
      setSelectedMarker(null);
    }
  };

  return (
    <div className="w-full h-full relative select-none overflow-hidden">
      
      {/* 3D WebGL Canvas filling the full container */}
      <div 
        ref={containerRef} 
        className="w-full h-full relative cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Discreet Globe Controls (Play/Pause, Zoom, Reset) */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="w-8 h-8 rounded-full bg-[#050817]/70 backdrop-blur-md border border-white/10 hover:border-[#56C2F7]/50 text-[#94A3B8] hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title={autoRotate ? 'Pause Rotation' : 'Resume Rotation'}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <button
          onClick={() => handleZoom('in')}
          className="w-8 h-8 rounded-full bg-[#050817]/70 backdrop-blur-md border border-white/10 hover:border-[#56C2F7]/50 text-[#94A3B8] hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="w-8 h-8 rounded-full bg-[#050817]/70 backdrop-blur-md border border-white/10 hover:border-[#56C2F7]/50 text-[#94A3B8] hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleResetView}
          className="w-8 h-8 rounded-full bg-[#050817]/70 backdrop-blur-md border border-white/10 hover:border-[#56C2F7]/50 text-[#94A3B8] hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected Marker Popup Card */}
      {selectedMarker && (
        <div className="absolute bottom-6 right-6 z-30 max-w-xs w-full bg-[#0A1022]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
              selectedMarker.severity === 'critical' ? 'bg-[#FF5D67]/20 text-[#FF5D67]' : 'bg-[#FFB454]/20 text-[#FFB454]'
            }`}>
              {selectedMarker.severity.toUpperCase()} · {selectedMarker.type.toUpperCase()}
            </span>
            <button onClick={() => setSelectedMarker(null)} className="text-[#94A3B8] hover:text-white text-xs">✕</button>
          </div>

          <h4 className="text-sm font-bold text-white mb-1 leading-snug">{selectedMarker.name}</h4>
          <p className="text-[11px] text-[#94A3B8] flex items-center gap-1 mb-3">
            <Navigation className="w-3 h-3 text-[#56C2F7]" />
            {selectedMarker.location}
          </p>

          <button
            onClick={() => navigate('/command-center')}
            className="w-full bg-[#56C2F7] hover:bg-[#6ed0fa] text-[#050817] font-bold text-xs py-2 rounded-full flex items-center justify-center gap-1 shadow-[0_0_16px_rgba(86,194,247,0.4)] transition-all cursor-pointer"
          >
            <span>Open in Command Center</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
