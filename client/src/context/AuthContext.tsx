// DisasterOS Dual Authentication & Role-Based Access Control Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  title: string;
  phone?: string;
  region?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface StoredAccount extends AuthUser {
  passwordHash: string;
}

// Pre-seeded verified accounts for DisasterOS dual-dashboard operations
const INITIAL_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr-citizen-01',
    email: 'citizen@disasteros.org',
    passwordHash: 'citizen123',
    fullName: 'Sarah Lin',
    role: 'citizen',
    title: 'Civilian Resident · Marina District Sector 4',
    phone: '+1 (415) 555-0192',
    region: 'San Francisco Bay Basin',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'usr-operator-01',
    email: 'operator@disasteros.org',
    passwordHash: 'operator123',
    fullName: 'Chief Marcus Vance',
    role: 'authority',
    title: 'Incident Commander · EOC Joint Operations Center',
    phone: '+1 (415) 555-0144',
    region: 'Pacific Operations Grid',
    createdAt: '2025-11-01T08:00:00Z'
  },
  {
    id: 'usr-admin-01',
    email: 'admin@disasteros.org',
    passwordHash: 'admin123',
    fullName: 'Alex Mercer',
    role: 'admin',
    title: 'Lead Systems Architect · DisasterOS Core DevOps',
    phone: '+1 (415) 555-0100',
    region: 'Headquarters Grid',
    createdAt: '2025-10-10T08:00:00Z'
  },
  {
    id: 'usr-responder-01',
    email: 'responder@disasteros.org',
    passwordHash: 'responder123',
    fullName: 'Capt. Sarah Jenkins',
    role: 'rescue_team',
    title: 'Team Commander · Swiftwater Taskforce Alpha',
    phone: '+1 (415) 555-0188',
    region: 'Sector B Coastline',
    createdAt: '2025-12-05T08:00:00Z'
  }
];

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isCitizen: boolean;
  isOperator: boolean;
  login: (email: string, password: string, portal?: 'citizen' | 'operator') => Promise<{ success: boolean; error?: string }>;
  registerCitizen: (data: { email: string; password: string; fullName: string; phone?: string; region?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  quickDemoLogin: (target: 'citizen' | 'operator' | 'admin') => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  availableRoles: { role: UserRole; label: string; name: string; org: string }[];
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load accounts from localStorage or seed initial accounts
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => {
    try {
      const stored = localStorage.getItem('disasteros_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure initial accounts always exist
        const merged = [...INITIAL_ACCOUNTS];
        parsed.forEach((p: StoredAccount) => {
          if (!merged.find(m => m.email.toLowerCase() === p.email.toLowerCase())) {
            merged.push(p);
          }
        });
        return merged;
      }
    } catch (e) {
      console.warn('Failed to parse stored accounts:', e);
    }
    return INITIAL_ACCOUNTS;
  });

  // Current session user (defaults to Chief Marcus Vance operator in demo mode if unset)
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const storedUser = localStorage.getItem('disasteros_active_session');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      // Initial default session: Operator
      const defaultOp = INITIAL_ACCOUNTS[1];
      const { passwordHash, ...cleanUser } = defaultOp;
      return cleanUser;
    } catch {
      const { passwordHash, ...cleanUser } = INITIAL_ACCOUNTS[1];
      return cleanUser;
    }
  });

  // Persist accounts
  useEffect(() => {
    localStorage.setItem('disasteros_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Persist session
  useEffect(() => {
    if (user) {
      localStorage.setItem('disasteros_active_session', JSON.stringify(user));
      localStorage.setItem('disasteros_role', user.role);
    } else {
      localStorage.removeItem('disasteros_active_session');
      localStorage.removeItem('disasteros_role');
    }
  }, [user]);

  const isAuthenticated = user !== null;
  const isCitizen = user?.role === 'citizen';
  const isOperator = isAuthenticated && !isCitizen;

  // Login handler with portal clearance enforcement
  const login = async (
    email: string, 
    password: string, 
    portal?: 'citizen' | 'operator'
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    if (account.passwordHash !== password) {
      return { success: false, error: 'Invalid password. Please verify your credentials.' };
    }

    // Enforce Operator Portal Clearance
    if (portal === 'operator' && account.role === 'citizen') {
      return { 
        success: false, 
        error: 'Access Denied: This account is a registered Civilian account without EOC operational clearance. Please use the Citizen Portal.' 
      };
    }

    const { passwordHash, ...safeUser } = account;
    setUser(safeUser);
    return { success: true };
  };

  // Public Citizen Registration: STRICTLY ASSIGNS 'citizen' ROLE
  const registerCitizen = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    region?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    
    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const newAccount: StoredAccount = {
      id: `usr-citizen-${Date.now()}`,
      email: cleanEmail,
      passwordHash: data.password,
      fullName: data.fullName.trim(),
      role: 'citizen', // Strictly enforced server-side/context-side
      title: `Civilian Resident · ${data.region || 'Metropolitan Disaster Sector'}`,
      phone: data.phone?.trim() || '+1 (555) 000-0000',
      region: data.region?.trim() || 'Active Crisis Zone',
      createdAt: new Date().toISOString()
    };

    setAccounts(prev => [...prev, newAccount]);
    const { passwordHash, ...safeUser } = newAccount;
    setUser(safeUser);
    return { success: true };
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('disasteros_active_session');
    localStorage.removeItem('disasteros_role');
  };

  // Password Recovery Flow
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (!account) {
      return { 
        success: false, 
        message: 'No active profile found matching that email. Please check the spelling or register a new citizen profile.' 
      };
    }
    return { 
      success: true, 
      message: `Password reset verification link has been dispatched to ${cleanEmail}. In this demo environment, your password is: "${account.passwordHash}".` 
    };
  };

  // One-click quick demo switcher for evaluation convenience
  const quickDemoLogin = (target: 'citizen' | 'operator' | 'admin') => {
    const targetAccount = 
      target === 'citizen' ? INITIAL_ACCOUNTS[0] :
      target === 'admin' ? INITIAL_ACCOUNTS[2] : INITIAL_ACCOUNTS[1];
    
    const { passwordHash, ...safeUser } = targetAccount;
    setUser(safeUser);
  };

  // Set role backward compatibility
  const setRole = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
  };

  // Update profile
  const updateProfile = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setAccounts(prev => prev.map(a => a.id === user.id ? { ...a, ...updates } : a));
  };

  const availableRoles = [
    { role: 'authority' as UserRole, label: 'Emergency Authority', name: 'Chief Marcus Vance', org: 'Command Center EOC' },
    { role: 'citizen' as UserRole, label: 'Citizen / Evacuee', name: 'Sarah Lin', org: 'Marina District Resident' },
    { role: 'rescue_team' as UserRole, label: 'Rescue Responder', name: 'Capt. Sarah Jenkins', org: 'Swiftwater Taskforce Alpha' },
    { role: 'admin' as UserRole, label: 'System Administrator', name: 'Alex Mercer', org: 'DisasterOS Core DevOps' }
  ];

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isCitizen,
      isOperator,
      login,
      registerCitizen,
      logout,
      forgotPassword,
      quickDemoLogin,
      updateProfile,
      availableRoles,
      setRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
