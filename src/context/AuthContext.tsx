import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  year: string;
  institution: string;
  studyHours: number;
  practiceQuestions: number;
  connections: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string, role?: string, year?: string, institution?: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);

    if (!email.includes('@') || password.length < 6) {
      return 'Invalid email or password (min 6 chars).';
    }

    const name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
    const formatted = name.replace(/\b\w/g, (c) => c.toUpperCase()).trim() || 'User';
    const initials = formatted.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();

    setUser({
      id: Date.now().toString(),
      name: formatted,
      email,
      avatar: initials,
      role: 'Nursing Student',
      year: '',
      institution: '',
      studyHours: 0,
      practiceQuestions: 0,
      connections: 0,
    });
    return null;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role?: string, year?: string, institution?: string): Promise<string | null> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);

    if (!name.trim()) return 'Name is required.';
    if (!email.includes('@')) return 'Invalid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (!role) return 'Please select your role.';
    if (!institution?.trim()) return 'Please enter your institution.';

    const initials = name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
    setUser({
      id: Date.now().toString(),
      name: name.trim(),
      email,
      avatar: initials,
      role,
      year: year || '',
      institution: institution.trim(),
      studyHours: 0,
      practiceQuestions: 0,
      connections: 0,
    });
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isLoading, login, signup, logout }), [user, isLoading, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
