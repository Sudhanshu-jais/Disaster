import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DisasterProvider } from './context/DisasterContext';
import { Navbar } from './components/layout/Navbar';
import { NotificationToast } from './components/layout/NotificationToast';
import { FloatingCopilot } from './components/common/FloatingCopilot';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Citizen Dashboard Pages (5 Primary Pillars)
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { CitizenMapPage } from './pages/CitizenMapPage';
import { CitizenSOSPage } from './pages/CitizenSOSPage';
import { CitizenDonatePage } from './pages/CitizenDonatePage';
import { CitizenProfilePage } from './pages/CitizenProfilePage';
import { TrackSOSPage } from './pages/TrackSOSPage';

// Operator Dashboard Workspaces (5 Primary Pillars)
import { CommandCenterPage } from './pages/CommandCenterPage';
import { OperatorOperationsPage } from './pages/OperatorOperationsPage';
import { OperatorResiliencePage } from './pages/OperatorResiliencePage';
import { OperatorReliefPage } from './pages/OperatorReliefPage';
import { OperatorManagementPage } from './pages/OperatorManagementPage';

// Route Guard to enforce Citizen vs Operator permissions
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireRole?: 'citizen' | 'operator';
}> = ({ children, requireRole }) => {
  const { isAuthenticated, isCitizen } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={`/login?portal=${requireRole || 'citizen'}`} replace />;
  }

  if (requireRole === 'operator' && isCitizen) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Animated Routes wrapper for smooth page transitions and navbar spacing
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div key={location.pathname} className={`flex-1 flex flex-col ${isLanding ? '' : 'pt-16 sm:pt-20'}`}>
      <Routes location={location}>
        {/* Public Landing & Authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ------------------------------------------------------------- */}
        {/* 1. CITIZEN DASHBOARD EXPERIENCE (STRICTLY 5 PRIMARY ITEMS)    */}
        {/* ------------------------------------------------------------- */}
        <Route path="/citizen" element={<Navigate to="/citizen/dashboard" replace />} />
        <Route path="/citizen/home" element={<Navigate to="/citizen/dashboard" replace />} />
        
        {/* 1. Home */}
        <Route 
          path="/citizen/dashboard" 
          element={
            <ProtectedRoute requireRole="citizen">
              <CitizenDashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* 2. Safety Map */}
        <Route 
          path="/citizen/map" 
          element={
            <ProtectedRoute requireRole="citizen">
              <CitizenMapPage />
            </ProtectedRoute>
          } 
        />

        {/* 3. Get Help (SOS) */}
        <Route 
          path="/citizen/sos" 
          element={
            <ProtectedRoute requireRole="citizen">
              <CitizenSOSPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/citizen/help" element={<Navigate to="/citizen/sos" replace />} />

        {/* 4. Donate & Support */}
        <Route 
          path="/citizen/donate" 
          element={
            <ProtectedRoute requireRole="citizen">
              <CitizenDonatePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/citizen/support" element={<Navigate to="/citizen/donate" replace />} />

        {/* 5. My Account */}
        <Route 
          path="/citizen/profile" 
          element={
            <ProtectedRoute requireRole="citizen">
              <CitizenProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/citizen/account" element={<Navigate to="/citizen/profile" replace />} />

        {/* Auxiliary Citizen Tracking Pages */}
        <Route 
          path="/citizen/track" 
          element={
            <ProtectedRoute requireRole="citizen">
              <TrackSOSPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/citizen/track/:code" 
          element={
            <ProtectedRoute requireRole="citizen">
              <TrackSOSPage />
            </ProtectedRoute>
          } 
        />

        {/* ------------------------------------------------------------- */}
        {/* 2. OPERATOR DASHBOARD EXPERIENCE (STRICTLY 5 PRIMARY ITEMS)   */}
        {/* ------------------------------------------------------------- */}
        <Route path="/operator" element={<Navigate to="/operator/dashboard" replace />} />
        <Route path="/operator/overview" element={<Navigate to="/operator/dashboard" replace />} />

        {/* 1. Overview */}
        <Route 
          path="/operator/dashboard" 
          element={
            <ProtectedRoute requireRole="operator">
              <CommandCenterPage />
            </ProtectedRoute>
          } 
        />

        {/* 2. Operations Workspace */}
        <Route 
          path="/operator/operations" 
          element={
            <ProtectedRoute requireRole="operator">
              <OperatorOperationsPage />
            </ProtectedRoute>
          } 
        />

        {/* 3. Resilience Workspace */}
        <Route 
          path="/operator/resilience" 
          element={
            <ProtectedRoute requireRole="operator">
              <OperatorResiliencePage />
            </ProtectedRoute>
          } 
        />

        {/* 4. Relief & Donations Workspace */}
        <Route 
          path="/operator/relief" 
          element={
            <ProtectedRoute requireRole="operator">
              <OperatorReliefPage />
            </ProtectedRoute>
          } 
        />

        {/* 5. Management Workspace */}
        <Route 
          path="/operator/management" 
          element={
            <ProtectedRoute requireRole="operator">
              <OperatorManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/operator/settings" element={<Navigate to="/operator/management" replace />} />

        {/* ------------------------------------------------------------- */}
        {/* BACKWARD COMPATIBILITY REDIRECTS FOR DEEP LINKS               */}
        {/* ------------------------------------------------------------- */}
        <Route path="/command-center" element={<Navigate to="/operator/dashboard" replace />} />
        <Route path="/dashboard" element={<Navigate to="/operator/dashboard" replace />} />
        <Route path="/operator/incidents" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/map" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/allocation" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/reallocation" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/teams" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/fleet" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/hospitals" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/shelters" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/warehouses" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/routes" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/alerts" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/operator/simulation" element={<Navigate to="/operator/resilience" replace />} />
        <Route path="/operator/risk" element={<Navigate to="/operator/resilience" replace />} />
        <Route path="/operator/analytics" element={<Navigate to="/operator/dashboard" replace />} />
        <Route path="/operator/audit" element={<Navigate to="/operator/management" replace />} />
        
        <Route path="/map" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/incidents" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/resources" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/allocation" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/shelters" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/analytics" element={<Navigate to="/operator/dashboard" replace />} />
        <Route path="/sos" element={<Navigate to="/citizen/sos" replace />} />
        <Route path="/alerts" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/simulation" element={<Navigate to="/operator/resilience" replace />} />
        <Route path="/warehouses" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/rescue-teams" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/logistics" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/vehicles" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/hospitals" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/routes" element={<Navigate to="/operator/operations" replace />} />
        <Route path="/audit-logs" element={<Navigate to="/operator/management" replace />} />
        <Route path="/settings" element={<Navigate to="/operator/management" replace />} />
        <Route path="/profile" element={<Navigate to="/citizen/profile" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DisasterProvider>
          <div className="min-h-screen bg-[#05070d] text-[#F5F7FB] flex flex-col font-sans antialiased selection:bg-[#38bdf8] selection:text-[#05070d]">
            <Navbar />
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[#05070d]">
              <AnimatedRoutes />
            </main>
            <FloatingCopilot />
            <NotificationToast />
          </div>
        </DisasterProvider>
      </AuthProvider>
    </Router>
  );
}
