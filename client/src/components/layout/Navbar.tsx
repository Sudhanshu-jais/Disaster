// DisasterOS Streamlined Role-Specific Navigation Bar
// Strictly implements the 5 Citizen items and 5 Operator items with evaluator switcher and tactical tool hub.

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Map, 
  LifeBuoy, 
  HeartHandshake, 
  User, 
  Activity, 
  ShieldAlert, 
  Layers, 
  Boxes, 
  Sliders, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Compass,
  Radio,
  Truck,
  HeartPulse,
  Sparkles,
  ChevronDown,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useDisaster } from '../../context/DisasterContext';
import { PublicAlertsDrawer } from '../alerts/PublicAlertsDrawer';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCitizen, isOperator, logout, quickDemoLogin } = useAuth();
  const { alerts } = useDisaster();
  const { theme, toggleTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const currentPath = location.pathname;

  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical').length;

  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close tools dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // CITIZEN NAVIGATION (Strictly 5 Primary Items)
  const citizenNavItems = [
    { path: '/citizen/dashboard', altPath: '/citizen/home', label: 'Home', icon: Home },
    { path: '/citizen/map', label: 'Safety Map', icon: Map },
    { path: '/citizen/sos', altPath: '/citizen/help', label: 'Get Help', icon: LifeBuoy, isEmergency: true },
    { path: '/citizen/donate', label: 'Donate & Support', icon: HeartHandshake },
    { path: '/citizen/profile', altPath: '/citizen/account', label: 'My Account', icon: User }
  ];

  // OPERATOR NAVIGATION (Strictly 5 Primary Items)
  const operatorNavItems = [
    { path: '/operator/dashboard', altPath: '/operator/overview', label: 'Overview', icon: Activity },
    { path: '/operator/operations', label: 'Operations', icon: Layers },
    { path: '/operator/resilience', label: 'Resilience', icon: Compass },
    { path: '/operator/relief', label: 'Relief & Donations', icon: Boxes },
    { path: '/operator/management', altPath: '/operator/settings', label: 'Management', icon: Sliders }
  ];

  // OPERATOR ADVANCED TACTICAL TOOLS (Deep Links to all feature screens)
  const operatorTools = [
    { path: '/map', label: 'Tactical GIS Map', icon: Map, desc: 'Live multi-sensor satellite & hazard map' },
    { path: '/incidents', label: 'Incident Triage Queue', icon: LifeBuoy, desc: 'Prioritized live civilian SOS queue' },
    { path: '/allocation', label: 'Smart Allocation Matrix', icon: Boxes, desc: 'Multi-factor resource allocation' },
    { path: '/vehicles', label: 'Fleet & Logistics Telemetry', icon: Truck, desc: 'Ambulances, zodiac boats & aircraft' },
    { path: '/warehouses', label: 'Forward Warehouses', icon: Boxes, desc: 'Medical reserves & emergency supply caches' },
    { path: '/hospitals', label: 'Hospital Emergency Buffers', icon: HeartPulse, desc: 'Trauma bed & ICU surge capacity' },
    { path: '/shelters', label: 'Safe Havens & Shelters', icon: Home, desc: 'Evacuation centers & occupancy tracking' },
    { path: '/routes', label: 'Safe Road Corridors', icon: Compass, desc: 'Passable detours avoiding flood hazards' },
    { path: '/simulation', label: 'Digital-Twin Simulation', icon: Activity, desc: 'Stress-test scenarios & cascading impact' },
    { path: '/risk-analysis', label: 'Hazard Risk Analysis', icon: ShieldAlert, desc: 'Multi-hazard telemetry index' },
    { path: '/analytics', label: 'Operational Analytics', icon: Activity, desc: 'Coordination latency & response stats' },
    { path: '/alerts', label: 'Emergency Siren Broadcast', icon: Radio, desc: 'Cell broadcast & civil defense sirens' },
    { path: '/audit-logs', label: 'Immutable Audit Trail', icon: Sliders, desc: 'Cryptographically hashed event logs' }
  ];

  // CITIZEN AUXILIARY TOOLS
  const citizenTools = [
    { path: '/citizen/track', label: 'Live Rescue Tracker', icon: LifeBuoy, desc: 'Track your dispatched rescue mission' },
    { path: '/citizen/alerts', label: 'Public Siren Advisories', icon: Radio, desc: 'Official regional evacuation warnings' },
    { path: '/citizen/assistant', label: 'AI Safety Assistant', icon: Sparkles, desc: 'Conversational emergency guidance' }
  ];

  const isItemActive = (item: { path: string; altPath?: string }) => {
    return currentPath === item.path || 
      (item.altPath && currentPath === item.altPath) || 
      currentPath.startsWith(item.path);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-[#05070d]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-3">
          
          {/* 1. Brand Logo */}
          <Link 
            to={isCitizen ? '/citizen/dashboard' : '/operator/dashboard'} 
            className="group flex items-center transition-transform duration-300 hover:scale-[1.02] shrink-0" 
            aria-label="DisasterOS home"
          >
            <span className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0 overflow-visible">
                <defs>
                  <linearGradient id="logoStroke-nav" x1="5" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5cc2ff" />
                    <stop offset="0.6" stopColor="#38bdf8" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="12.6" stroke="url(#logoStroke-nav)" strokeWidth="1.7" />
                <ellipse cx="16" cy="16" rx="6.6" ry="12.6" stroke="url(#logoStroke-nav)" strokeWidth="1.5" />
                <path d="M16 3.4 V28.6" stroke="url(#logoStroke-nav)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3.4 16 H28.6" stroke="url(#logoStroke-nav)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="21" cy="11" r="2.2" fill="#fb923c" />
              </svg>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                Disaster<span className="text-[#38bdf8]">OS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 shrink-0">
                  AI
                </span>
              </span>
            </span>
          </Link>

          {/* 2. Main Desktop Navigation (Strictly 5 items per role + Tools Hub) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            
            {/* PUBLIC NAVIGATION (Logged out fallback) */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    currentPath === '/' ? 'text-[#38bdf8] font-bold bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/citizen/map"
                  className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    currentPath.startsWith('/citizen/map') ? 'text-[#38bdf8] font-bold bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Safety Map
                </Link>
                <Link
                  to="/citizen/sos"
                  className="px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-rose-300 hover:text-white hover:bg-white/5 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Get Help</span>
                </Link>
                <Link
                  to="/citizen/donate"
                  className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    currentPath.startsWith('/citizen/donate') ? 'text-[#38bdf8] font-bold bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Donate & Support
                </Link>
              </>
            )}

            {/* CITIZEN 5 PRIMARY ITEMS */}
            {isCitizen && (
              <>
                {citizenNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);
                  if (item.isEmergency) {
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 ${
                          active
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                        active
                          ? 'text-[#38bdf8] bg-white/10 font-bold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#38bdf8]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}

            {/* OPERATOR 5 PRIMARY ITEMS */}
            {isOperator && (
              <>
                {operatorNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                        active
                          ? 'text-[#38bdf8] bg-white/10 font-bold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#38bdf8]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* TACTICAL TOOLS DROPDOWN (Direct access to all 12 deep feature tools) */}
                <div className="relative" ref={toolsDropdownRef}>
                  <button
                    onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                    className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      toolsDropdownOpen ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>Tactical Tools</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {toolsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#0A1022]/98 backdrop-blur-2xl border border-white/15 shadow-2xl p-2.5 grid grid-cols-1 gap-1 z-50 animate-in fade-in slide-in-from-top-2">
                      {/* White / Dark Mode Option directly in the Tactical Tools Menu */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleTheme();
                          setToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-white transition-all cursor-pointer mb-1 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <Moon className="w-4 h-4 text-sky-400 shrink-0" />
                          )}
                          <div className="text-left">
                            <div className="font-bold text-white text-xs">
                              {theme === 'dark' ? '☀️ Switch to White Mode' : '🌙 Switch to Dark Mode'}
                            </div>
                            <div className="text-[10px] text-white/60">
                              {theme === 'dark' ? 'Daylight clean UI theme' : 'Midnight tactical UI theme'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#38bdf8] font-bold shrink-0">
                          {theme === 'dark' ? 'WHITE' : 'DARK'}
                        </span>
                      </button>

                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold px-2 py-1">
                        Operational Intelligence Modules
                      </div>
                      <div className="max-h-[420px] overflow-y-auto space-y-1 pr-1">
                        {operatorTools.map((tool) => {
                          const Icon = tool.icon;
                          const active = currentPath.startsWith(tool.path);
                          return (
                            <Link
                              key={tool.path}
                              to={tool.path}
                              onClick={() => setToolsDropdownOpen(false)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                                active ? 'bg-[#38bdf8]/15 text-[#38bdf8]' : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <div className="p-1 rounded-lg bg-white/5 text-[#38bdf8] mt-0.5 shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate">{tool.label}</div>
                                <div className="text-[10px] text-white/50 truncate">{tool.desc}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct White / Dark Mode Option in Menu Bar */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    theme === 'dark'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                      : 'bg-sky-100 border-sky-300 text-sky-800 hover:bg-sky-200'
                  }`}
                  title={theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>White Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </>
            )}

          </nav>

          {/* 3. Right: Persona Switcher, Active Profile & Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Guest White / Dark Mode Switch */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Theme'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    theme === 'dark'
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-sky-100 border-sky-300 text-sky-800 hover:bg-sky-200'
                  }`}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>White Mode ☀️</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-sky-600" />
                      <span>Dark Mode 🌙</span>
                    </>
                  )}
                </button>
                <Link
                  to="/citizen/sos"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF5D67] text-white text-xs font-bold shadow-md hover:bg-[#ff434e] transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Get Help</span>
                </Link>
                <Link
                  to="/login"
                  className="btn-primary text-xs py-1.5 sm:py-2 px-3 sm:px-4 font-semibold shrink-0"
                >
                  <span>Portal Sign In</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5">
                
                {/* Evaluator Quick Role Switcher Pill */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCitizen) {
                      quickDemoLogin('operator');
                      navigate('/operator/dashboard');
                    } else {
                      quickDemoLogin('citizen');
                      navigate('/citizen/dashboard');
                    }
                  }}
                  title={isCitizen ? 'Switch to Operator EOC Portal' : 'Switch to Citizen Civilian Portal'}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/[0.06] hover:bg-white/15 border border-white/15 text-white/90 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                  <span>{isCitizen ? 'Switch to Operator 🛡️' : 'Switch to Citizen 👤'}</span>
                </button>

                {/* Highly Prominent White / Dark Mode Pill Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Theme'}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                    theme === 'dark' 
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200 shadow-md shadow-amber-950/30'
                      : 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100 shadow-sm'
                  }`}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span className="text-amber-200">White Mode ☀️</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-sky-900">Dark Mode 🌙</span>
                    </>
                  )}
                </button>

                {/* Emergency Public Alerts Bell Button */}
                <button
                  type="button"
                  onClick={() => setIsAlertDrawerOpen(true)}
                  className={`relative p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    criticalAlertsCount > 0
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30 shadow-lg shadow-rose-950/50'
                      : alerts.length > 0
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${alerts.length} Active Public Emergency Directives`}
                  aria-label="Public Emergency Directives"
                >
                  <Bell className={`w-4 h-4 ${criticalAlertsCount > 0 ? 'animate-bounce text-rose-400' : ''}`} />
                  {alerts.length > 0 && (
                    <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center text-white ${
                      criticalAlertsCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
                    }`}>
                      {alerts.length}
                    </span>
                  )}
                </button>

                {/* Active User Badge */}
                <Link
                  to={isCitizen ? '/citizen/profile' : '/operator/management'}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-[#0D162B] border border-white/15 hover:border-[#38bdf8]/50 text-white shrink-0 transition-colors"
                  title={`Logged in as ${user?.fullName || 'User'} (${user?.role})`}
                >
                  {isCitizen ? (
                    <Users className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-[#55D6A7] shrink-0" />
                  )}
                  <span className="max-w-[100px] sm:max-w-[130px] truncate">{user?.fullName || 'User'}</span>
                  <span className="text-[10px] font-mono text-white/50 uppercase">
                    [{isCitizen ? 'Citizen' : 'Operator'}]
                  </span>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-1.5 sm:p-2 rounded-full text-white/50 hover:text-[#FF5D67] hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
                  title="Sign out of DisasterOS"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 lg:hidden shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#05070d]/98 border-b border-white/10 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
          
          {/* Quick Theme Switch Row in Mobile Drawer */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs font-semibold text-white/80">Theme Mode</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>White Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-600" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>
          
          {/* Unauthenticated Mobile Links */}
          {!isAuthenticated && (
            <div className="flex flex-col space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-sm text-white/80 hover:bg-white/5">Overview</Link>
              <Link to="/citizen/map" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-sm text-white/80 hover:bg-white/5">Safety Map</Link>
              <Link to="/citizen/sos" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-sm font-bold text-rose-400 bg-rose-500/10">Get Help</Link>
              <Link to="/citizen/donate" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-sm text-white/80 hover:bg-white/5">Donate & Support</Link>
            </div>
          )}

          {/* Citizen Mobile 5 Items + Tools */}
          {isCitizen && (
            <div className="flex flex-col space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold px-2 py-1">
                Citizen Portal Navigation
              </div>
              {citizenNavItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-semibold ${
                      active ? 'bg-[#38bdf8]/15 text-[#38bdf8]' : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#38bdf8]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-white/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold px-2 py-1">
                  Citizen Resources
                </div>
                {citizenTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>{tool.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Operator Mobile 5 Items + Tactical Tools Hub */}
          {isOperator && (
            <div className="flex flex-col space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold px-2 py-1">
                Operator EOC Primary Workspaces
              </div>
              {operatorNavItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-semibold ${
                      active ? 'bg-[#38bdf8]/15 text-[#38bdf8]' : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#38bdf8]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-white/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold px-2 py-1">
                  Tactical Operational Tools
                </div>
                <div className="grid grid-cols-1 gap-1 pt-1">
                  {operatorTools.map((tool) => {
                    const Icon = tool.icon;
                    const active = currentPath.startsWith(tool.path);
                    return (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl text-xs ${
                          active ? 'bg-[#38bdf8]/15 text-[#38bdf8]' : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>{tool.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>

    {/* Public Alerts Slideout Drawer */}
    <PublicAlertsDrawer 
      isOpen={isAlertDrawerOpen} 
      onClose={() => setIsAlertDrawerOpen(false)} 
    />
  </>
  );
};
