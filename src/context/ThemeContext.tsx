import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, DarkColors } from '../constants/theme';

type ThemeContextType = {
  isDark: boolean;
  toggleDark: () => void;
  colors: typeof Colors;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(systemScheme === 'dark');
  }, [systemScheme]);

  const toggleDark = useCallback(() => setIsDark(prev => !prev), []);

  const value = useMemo(() => ({
    isDark,
    toggleDark,
    colors: isDark ? DarkColors : Colors,
  }), [isDark, toggleDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
