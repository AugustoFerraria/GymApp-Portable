import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '../../shared/theme/ThemeContext';

export default function AppProviders({ children }) {
  return (
    <PaperProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </PaperProvider>
  );
}
