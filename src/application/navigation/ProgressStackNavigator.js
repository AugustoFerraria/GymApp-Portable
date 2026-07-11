import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ManageProgressScreen from '../../features/progress/screens/ManageProgressScreen';
import ProgressScreen from '../../features/progress/screens/ProgressScreen';
import { PROGRESS_ROUTES } from '../../shared/navigation/routeNames';
import { useAppTheme } from '../../shared/theme/ThemeContext';

const Stack = createStackNavigator();

export default function ProgressStackNavigator() {
  const { isDark } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: isDark ? '#0B0F14' : '#FFFFFF' },
      }}
    >
      <Stack.Screen
        name={PROGRESS_ROUTES.HOME}
        component={ProgressScreen}
      />
      <Stack.Screen
        name={PROGRESS_ROUTES.MANAGE}
        component={ManageProgressScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#FFD700' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          title: 'Gestionar Progreso',
        }}
      />
    </Stack.Navigator>
  );
}