import {
  DarkTheme as ReactNavigationDarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

export function createNavigationTheme(isDark) {
  const baseTheme = isDark ? ReactNavigationDarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: isDark ? '#0B0F14' : '#FFFFFF',
      card: isDark ? '#131922' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#111827',
      border: isDark ? '#1F2937' : '#DDDDDD',
      primary: '#FFD700',
    },
  };
}