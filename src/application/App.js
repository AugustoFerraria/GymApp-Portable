import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import AppProviders from './providers/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
