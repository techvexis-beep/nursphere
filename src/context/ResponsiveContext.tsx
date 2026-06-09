import React, { createContext, useContext } from 'react';
import { useResponsive, ResponsiveConfig } from '../hooks/useResponsive';

const ResponsiveContext = createContext<ResponsiveConfig | null>(null);

export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const responsive = useResponsive();
  return (
    <ResponsiveContext.Provider value={responsive}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsiveCtx() {
  const ctx = useContext(ResponsiveContext);
  if (!ctx) throw new Error('useResponsiveCtx must be used within ResponsiveProvider');
  return ctx;
}
