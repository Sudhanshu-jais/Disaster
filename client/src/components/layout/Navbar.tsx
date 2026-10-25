// DisasterOS Streamlined Role-Specific Navigation Bar
// Strictly implements the 5 Citizen items and 5 Operator items with evaluator switcher.

import React, { useState, useEffect } from 'react';
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
  Radio
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCitizen, isOperator, logout, quickDemoLogin } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPath = location.pathname;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // CITIZEN NAVIGATION (Strictly 5 items)
  const citizenNavItems = [
    { path: '/citizen/dashboard', altPath: '/citizen/home', label: 'Home', icon: Home },
    { path: '/citizen/map', label: 'Safety Map', icon: Map },
    { path: '/citizen/sos', altPath: '/citizen/help', label: 'Get Help', icon: LifeBuoy, isEmergency: true },
    { path: '/citizen/donate', label: 'Donate & Support', icon: HeartHandshake },
    { path: '/citizen/profile', altPath: '/citizen/account', label: 'My Account', icon: User }
  ];

  // OPERATOR NAVIGATION (Strictly 5 items)
  const operatorNavItems = [
    { path: '/operator/dashboard', altPath: '/operator/overview', label: 'Overview', icon: Activity },
    { path: '/operator/operations', label: 'Operations', icon: Layers },
    { path: '/operator/resilience', label: 'Resilience', icon: Compass },
    { path: '/operator/relief', label: 'Relief & Donations', icon: Boxes },
    { path: '/operator/management', altPath: '/operator/settings', label: 'Management', icon: Sliders }
  ];

  const isItemActive = (item: { path: string; altPath?: string }) => {
    return currentPath === item.path || 
      (item.altPath && currentPath === item.altPath) || 
      currentPath.startsWith(item.path);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-[#05070d]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl">
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          
          {/* 1. Brand Logo */}
          <Link 
            to={isCitizen ? '/citizen/dashboard' : isOperator ? '/operator/dashboard' : '/'} 
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

          {/* 2. Main Desktop Navigation (Strictly 5 items per role) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            
            {/* PUBLIC NAVIGATION (Logged out) */}
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
              </>
            )}

          </nav>

          {/* 3. Right: Persona Switcher, Active Profile & Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
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

      {/* 4. Mobile Drawer Menu (Faithful to the 5 Primary items) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#05070d]/98 border-b border-white/10 px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto">
          
          {/* Unauthenticated Mobile Links */}
          {!isAuthenticated && (
            <div className="flex flex-col space-y-1">
              <Link to="/" className="p-2 rounded-lg text-sm text-white/80 hover:bg-white/5">Overview</Link>
              <Link to="/citizen/map" className="p-2 rounded-lg text-sm text-white/80 hover:bg-white/5">Safety Map</Link>
              <Link to="/citizen/sos" className="p-2 rounded-lg text-sm font-bold text-rose-400 bg-rose-500/10">Get Help</Link>
              <Link to="/citizen/donate" className="p-2 rounded-lg text-sm text-white/80 hover:bg-white/5">Donate & Support</Link>
            </div>
          )}

          {/* Citizen Mobile 5 Items */}
          {isCitizen && (
            <div className="flex flex-col space-y-1">
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
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-semibold ${
                      active ? 'bg-[#38bdf8]/15 text-[#38bdf8]' : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#38bdf8]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Operator Mobile 5 Items */}
          {isOperator && (
            <div className="flex flex-col space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold px-2 py-1">
                Operator EOC Navigation
              </div>
              {operatorNavItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-semibold ${
                      active ? 'bg-[#38bdf8]/15 text-[#38bdf8]' : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#38bdf8]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
