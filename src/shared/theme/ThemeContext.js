import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getThemePreference,
  saveThemePreference,
} from './themePreferenceRepository';

export const ThemeContext = createContext({
  isDark: false,
  loadingTheme: true,
  toggleTheme: () => {},
  setDark: (_bool) => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState(true);

  // Rehidratar preferencia al iniciar
  useEffect(() => {
    (async () => {
      try {
        const saved = await getThemePreference();
        if (saved !== null) setIsDark(saved);
      } finally {
        setLoadingTheme(false);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      saveThemePreference(next).catch(() => {});
      return next;
    });
  }, []);

  const setDark = useCallback((bool) => {
    const desired = Boolean(bool);
    setIsDark(prev => {
      if (prev !== desired) {
        saveThemePreference(desired).catch(() => {});
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

export function useAppTheme() {
  return useContext(ThemeContext);
}
