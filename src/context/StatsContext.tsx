import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';

type Stats = {
  studyMinutes: number;
  practiceQuestions: number;
  connections: number;
};

type StatsContextType = {
  stats: Stats;
  incrementQuestions: () => void;
  addConnection: () => void;
  removeConnection: () => void;
  startStudyTimer: () => void;
  stopStudyTimer: () => void;
};

const StatsContext = createContext<StatsContextType | null>(null);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>({ studyMinutes: 0, practiceQuestions: 0, connections: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTracking = useRef(false);

  const incrementQuestions = useCallback(() => {
    setStats(prev => ({ ...prev, practiceQuestions: prev.practiceQuestions + 1 }));
  }, []);

  const addConnection = useCallback(() => {
    setStats(prev => ({ ...prev, connections: prev.connections + 1 }));
  }, []);

  const removeConnection = useCallback(() => {
    setStats(prev => ({ ...prev, connections: Math.max(0, prev.connections - 1) }));
  }, []);

  const startStudyTimer = useCallback(() => {
    if (isTracking.current) return;
    isTracking.current = true;
    const previousUpdate = { minutes: 0 };

    timerRef.current = setInterval(() => {
      previousUpdate.minutes += 1;
      if (previousUpdate.minutes === 1) {
        setStats(prev => ({ ...prev, studyMinutes: prev.studyMinutes + 1 }));
        previousUpdate.minutes = 0;
      }
    }, 60000);
  }, []);

  const stopStudyTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isTracking.current = false;
  }, []);

  useEffect(() => {
    return () => { stopStudyTimer(); };
  }, [stopStudyTimer]);

  const value = useMemo(() => ({
    stats, incrementQuestions, addConnection, removeConnection, startStudyTimer, stopStudyTimer,
  }), [stats, incrementQuestions, addConnection, removeConnection, startStudyTimer, stopStudyTimer]);

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used within StatsProvider');
  return ctx;
}
