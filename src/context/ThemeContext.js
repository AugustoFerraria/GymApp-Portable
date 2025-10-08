// src/context/ThemeContext.js
import React, { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext({
  isDark: false,
  loadingTheme: true,
  toggleTheme: () => {},
  setDark: (_bool) => {},
});

const THEME_KEY = 'theme_preference_isDark';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState(true);

  // Rehidratar preferencia al iniciar
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved !== null) setIsDark(saved === 'true');
      } finally {
        setLoadingTheme(false);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const setDark = useCallback((bool) => {
    const desired = Boolean(bool);
    setIsDark(prev => {
      if (prev !== desired) {
        AsyncStorage.setItem(THEME_KEY, String(desired)).catch(() => {});
      }
      return desired;
    });
  }, []);

  const value = useMemo(
    () => ({ isDark, loadingTheme, toggleTheme, setDark }),
    [isDark, loadingTheme, toggleTheme, setDark]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}