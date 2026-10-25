import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  ChevronDown, 
  Radio, 
  Droplets, 
  Activity, 
  Flame, 
  Wind, 
  Boxes
} from 'lucide-react';
import { PhotorealEarth } from '../components/globe/PhotorealEarth';

interface StoryCard {
  id: string;
  tag: string;
  tagColor: string;
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const DISASTER_SITUATIONS: StoryCard[] = [
  {
    id: 'flood',
    tag: 'PACIFIC BASIN · SAN FRANCISCO BAY',
    tagColor: '#38bdf8',
    badge: '🌊 ACTIVE INUNDATION · 4.2 FT',
    title: 'The Inundated Basin',
    description: 'Atmospheric river crests over coastal sea-wall embankment. Water standing at 4.2 feet with swiftwater rescue boat units active.',
    imageUrl: '/disasters/flood.jpg',
    link: '/command-center'
  },
  {
    id: 'wildfire',
    tag: 'CASCADIA TIMBER CORRIDOR',
    tagColor: '#fb923c',
    badge: '🔥 TIER-1 FIRESTORM · 290 AQI',
    title: 'The Diablo Firestorm',
    description: 'High-velocity 45 km/h gusts driving industrial solvent fire buffer toward residential perimeter. Ambient AQI reading 290.',
    imageUrl: '/disasters/wildfire.jpg',
    link: '/command-center'
  },
  {
    id: 'earthquake',
    tag: 'SUBDUCTION FAULT SECTOR',
    tagColor: '#f43f5e',
    badge: '⚡ 7.2 Mw SEISMIC RUPTURE',
    title: 'San Andreas Rupture',
    description: '7.2M seismic event causing masonry facade collapse and severed municipal gas main. USAR acoustic search teams active.',
    imageUrl: '/disasters/earthquake.jpg',
    link: '/command-center'
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDomain, setActiveDomain] = useState<'atmosphere' | 'hydrosphere' | 'geosphere' | 'biosphere' | 'infrastructure'>('atmosphere');
  const [hoveredStripe, setHoveredStripe] = useState<{ year: number; risk: number; label: string } | null>({
    year: 2026,
    risk: 94,
    label: 'Critical Multi-Hazard Response Index'
  });

  return (
    <div className="flex-1 flex flex-col bg-[#05070d] text-white selection:bg-[#38bdf8] selection:text-[#020617]">
      
      {/* 1. HERO SECTION (Exact Terra visual style, layout & 3D Earth) */}
      <section className="relative min-h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-10">
        
        {/* Radial glow spotlight behind Earth at 64% 58% */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60vmin_60vmin_at_64%_58%,rgba(56,189,248,0.12),transparent_70%)]" />

        {/* Photoreal Three.js Earth with day/night/specular blend & 23.5° axial tilt */}
        <PhotorealEarth />

        {/* Atmospheric Gradients */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#05070d]/80 via-[#05070d]/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#05070d] via-[#05070d]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#05070d]/60 to-transparent" />

        {/* Text Content Container: Safe top clearance guarantees zero clash with Navbar & Logo */}
        <div className="relative z-10 container-page w-full my-auto py-4">
          <div className="max-w-[32rem] sm:max-w-xl lg:max-w-[42rem]">
            
            {/* DisasterOS Headline with exact 4-line typography rhythm */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[70px] xl:text-[78px] font-black leading-[1.05] tracking-tight text-white">
              Disasters move<br />
              fast.<br />
              <span className="text-[#38bdf8]">
                Response must<br />
                move smarter.
              </span>
            </h1>

            {/* DisasterOS Supporting Copy */}
            <p className="mt-5 sm:mt-6 max-w-md text-sm sm:text-base lg:text-lg font-normal leading-relaxed text-white/70">
              An intelligent disaster-response platform connecting hazard awareness, emergency prioritization and critical resources in one operational view.
            </p>

            {/* DisasterOS Primary & Secondary Actions */}
            <div className="mt-7 sm:mt-9 flex flex-wrap items-center gap-3.5">
              <Link to="/map" className="btn-primary text-sm sm:text-base">
                <Globe className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#020617] shrink-0" />
                <span className="shrink-0 whitespace-nowrap">Explore Live Map</span>
              </Link>

              <Link to="/command-center" className="btn-ghost text-sm sm:text-base">
                <span className="shrink-0 whitespace-nowrap">Open Command Center</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Downward Chevron Scroll Indicator */}
        <div className="relative z-10 flex justify-center pt-2">
          <a 
            href="#crises" 
            aria-label="Scroll to begin" 
            className="group inline-flex items-center justify-center p-2 text-white/40 transition-colors hover:text-white/80"
          >
            <ChevronDown className="w-6 h-6 animate-bounce shrink-0" />
          </a>
        </div>
      </section>

      {/* 2. FRONTLINES SECTION: "Where it's happening now" */}
      <section id="crises" className="relative py-24 sm:py-32 bg-[#05070d]">
        <div className="container-page">
          <p className="eyebrow">Frontlines</p>
          
          <div className="mt-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Where it's happening now
            </h2>
            <Link 
              to="/incidents" 
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#7dd3fc] transition-colors hover:text-white"
            >
              All operational incidents &rarr;
            </Link>
          </div>

          {/* 3 Tall Rounded Disaster Situations Cards with Real Natural Disaster Photography */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DISASTER_SITUATIONS.map(card => (
              <div
                key={card.id}
                onClick={() => navigate(card.link)}
                className="group relative h-[480px] rounded-3xl p-7 flex flex-col justify-between overflow-hidden border border-white/[0.12] hover:border-[#38bdf8]/60 transition-all duration-500 cursor-pointer shadow-2xl bg-[#0A1022]"
              >
                {/* Natural Disaster Photography Background with Zoom on Hover */}
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Dark Vignette & Atmospheric Gradients to Guarantee High-Contrast Typography */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070d] via-[#05070d]/65 to-[#05070d]/25" />
                <div className="pointer-events-none absolute inset-0 bg-radial-at-c from-transparent via-transparent to-[#05070d]/70" />

                {/* Top Badge: Live Sensor/Hazard Telemetry */}
                <div className="relative z-10 flex items-center justify-between">
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-mono font-bold tracking-wider uppercase bg-[#05070d]/85 backdrop-blur-md border border-white/15 text-white shadow-lg"
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-ping shrink-0" style={{ backgroundColor: card.tagColor }} />
                    <span className="shrink-0">{card.badge}</span>
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 space-y-3">
                  <p 
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: card.tagColor }}
                  >
                    {card.tag}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-[#38bdf8] transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/75">
                    {card.description}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Inspect Situation Telemetry</span>
                    <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. IMPACT CALLOUT SECTION: "The crisis isn't fixed." */}
      <section className="relative py-28 sm:py-36 bg-[#05070d] text-center border-t border-white/[0.05]">
        <div className="container-page max-w-4xl space-y-6">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            The crisis isn't fixed.
          </h2>
          <p className="text-base sm:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            Every minute of coordination latency saved is a family protected, a levee fortified, and critical medical supply delivered. Start by seeing it clearly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link to="/map" className="btn-primary text-base">
              <Globe className="w-[18px] h-[18px] text-[#020617] shrink-0" />
              <span className="shrink-0 whitespace-nowrap">Explore Live Map</span>
            </Link>
            <Link to="/command-center" className="btn-ghost text-base">
              <span className="shrink-0 whitespace-nowrap">Open Command Center</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. THE EVIDENCE: "A decade of multi-hazard telemetry, in one image." */}
      <section className="relative py-24 sm:py-32 bg-[#05070d] border-t border-white/[0.05]">
        <div className="container-page space-y-12">
          
          <div className="space-y-3">
            <p className="eyebrow">The Telemetry</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              A decade of multi-hazard telemetry, in one image.
            </h2>

            {/* Interactive Telemetry Spectrum Bar */}
            <div className="pt-8">
              <div className="relative h-24 sm:h-28 w-full rounded-2xl overflow-hidden flex items-stretch border border-white/10 shadow-2xl bg-[#020617]">
                {Array.from({ length: 65 }).map((_, idx) => {
                  const year = 1965 + Math.round(idx * 0.95);
                  let bg = '#1d4ed8';
                  if (idx > 25 && idx <= 42) bg = '#0284c7';
                  if (idx > 42 && idx <= 52) bg = '#f59e0b';
                  if (idx > 52) bg = '#e11d48';

                  const risk = Math.min(100, Math.floor(35 + (idx * 0.95) + Math.sin(idx) * 6));

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredStripe({ 
                        year, 
                        risk, 
                        label: risk > 85 ? 'Critical Emergency Cascade Phase' : risk > 65 ? 'Elevated Severe Exposure Phase' : 'Baseline Moderate Vulnerability'
                      })}
                      className="flex-1 transition-all duration-150 hover:scale-y-110 hover:opacity-100 opacity-85 cursor-pointer"
                      style={{ backgroundColor: bg }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-white/50 mt-4">
                <span>1965 (Baseline)</span>
                <span className="text-[#38bdf8] font-bold text-center">
                  {hoveredStripe ? `Year ${hoveredStripe.year}: Multi-Factor Risk Index ${hoveredStripe.risk}/100 (${hoveredStripe.label})` : 'Hover the stripes to inspect telemetry records'}
                </span>
                <span>2026 (Operational Present)</span>
              </div>

              <p className="mt-4 text-xs text-white/50 max-w-xl">
                Each stripe represents multi-sensor hazard telemetry across flood gauges, seismic accelerometers, and MODIS satellite fire anomalies. Blue to deep red reveals intensifying crisis exposure.
              </p>
            </div>
          </div>

          {/* 5-Domain System: "The response is an engine of five parts." */}
          <div className="pt-12 border-t border-white/10 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                The response is an engine of five parts.
              </h3>
              <p className="text-sm leading-relaxed text-white/70">
                Atmosphere, hydrology, seismology, wildland boundaries and critical infrastructure are tightly interlocked. Intervene across any domain with instant geospatial telemetry.
              </p>
            </div>

            {/* Exact Pill Selector for 5 Domains */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: 'atmosphere', label: 'Atmosphere', icon: Wind },
                { id: 'hydrosphere', label: 'Hydrosphere', icon: Droplets },
                { id: 'geosphere', label: 'Geosphere', icon: Activity },
                { id: 'biosphere', label: 'Biosphere', icon: Flame },
                { id: 'infrastructure', label: 'Infrastructure', icon: Boxes },
              ].map(tab => {
                const isActive = activeDomain === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDomain(tab.id as any)}
                    className={`px-5 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/20 shadow-md'
                        : 'bg-white/[0.03] text-white/60 border border-white/5 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#38bdf8] shrink-0" />
                    <span className="shrink-0">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Two-Column Card Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="terra-card p-8 flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0">
                    {activeDomain === 'atmosphere' && <Wind className="w-6 h-6 shrink-0" />}
                    {activeDomain === 'hydrosphere' && <Droplets className="w-6 h-6 shrink-0" />}
                    {activeDomain === 'geosphere' && <Activity className="w-6 h-6 shrink-0" />}
                    {activeDomain === 'biosphere' && <Flame className="w-6 h-6 shrink-0" />}
                    {activeDomain === 'infrastructure' && <Boxes className="w-6 h-6 shrink-0" />}
                  </div>
                  <p className="text-base leading-relaxed text-white/75">
                    {activeDomain === 'atmosphere' && 'Doppler atmospheric river radar registers 84 km/h sustained gale winds and rapid barometric pressure drops.'}
                    {activeDomain === 'hydrosphere' && 'IoT river level gauges report extreme inundation crest in Zone A, with baseline streams rising 3.8ft above embankment.'}
                    {activeDomain === 'geosphere' && 'USGS seismic accelerometer stream records 7.2 Mw rupture with high liquefaction probability in coastal sediment districts.'}
                    {activeDomain === 'biosphere' && 'MODIS thermal anomaly satellites track fast-moving wildfire buffer expanding toward residential sector boundaries.'}
                    {activeDomain === 'infrastructure' && 'SCADA telemetry monitors municipal gas lines, hospital backup generators and evacuation corridor passability.'}
                  </p>
                </div>

                <div>
                  <div className="text-5xl font-black text-[#38bdf8] font-telemetry tracking-tight">
                    {activeDomain === 'atmosphere' && '984 hPa'}
                    {activeDomain === 'hydrosphere' && '42.4 mm/h'}
                    {activeDomain === 'geosphere' && '7.2 Mw'}
                    {activeDomain === 'biosphere' && '290 AQI'}
                    {activeDomain === 'infrastructure' && '99.4%'}
                  </div>
                  <span className="text-xs text-white/55 block mt-1">
                    {activeDomain === 'atmosphere' && 'Barometric Pressure · Severe Gust Inflow'}
                    {activeDomain === 'hydrosphere' && 'Precipitation Rate · Embankment Crest'}
                    {activeDomain === 'geosphere' && 'Seismic Intensity · San Andreas Fracture'}
                    {activeDomain === 'biosphere' && 'Ambient Particulate · Hazardous Buffer'}
                    {activeDomain === 'infrastructure' && 'Grid Stability · Automated Isolation'}
                  </span>
                </div>
              </div>

              <div className="terra-card p-8 space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                  OPERATIONAL PROTOCOLS & MITIGATION
                </p>
                <p className="text-sm leading-relaxed text-white/75">
                  Sub-second multi-sensor cross-validation triggers automated responder dispatch and life-safety evacuation corridors.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    activeDomain === 'atmosphere' 
                      ? 'Pre-positioning mobile emergency diesel generators at Level-1 trauma hospitals'
                      : activeDomain === 'hydrosphere'
                      ? 'Dispatching 3 swiftwater rescue boat taskforces along elevated viaduct corridor'
                      : activeDomain === 'geosphere'
                      ? 'Deploying USAR acoustic listening taskforces with hydraulic shoring units'
                      : activeDomain === 'biosphere'
                      ? 'Establishing Class-B fluoropolymer foam perimeter buffer perpendicular to wind direction'
                      : 'Isolating severed gas lines and dynamically re-routing ambulances across open highways',
                    'Transparent rule-based priority scoring calculates 0-100 incident urgency ranking',
                    'Zero-over-allocation warehouse reserve controls safeguard critical medical inventories'
                  ].map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/80">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8] mt-1.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-14 border-t border-white/10 bg-[#05070d] text-xs text-white/60">
        <div className="container-page space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">DisasterOS AI</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Link to="/map" className="hover:text-white transition-colors">Live Map</Link>
              <Link to="/incidents" className="hover:text-white transition-colors">Incidents</Link>
              <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
              <Link to="/shelters" className="hover:text-white transition-colors">Shelters</Link>
              <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
              <Link to="/command-center" className="text-[#38bdf8] hover:underline font-semibold">Command Center</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <p>&copy; {new Date().getFullYear()} DisasterOS AI. See the risk. Coordinate the response.</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#38bdf8]" />
              Every minute of coordination latency matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
