import React, { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { TAB_ROUTES } from '../../shared/navigation/routeNames';
import { useAppTheme } from '../../shared/theme/ThemeContext';
import ProgressStackNavigator from './ProgressStackNavigator';
import RoutinesStackNavigator from './RoutinesStackNavigator';
import { createNavigationTheme } from './navigationTheme';

const Tab = createBottomTabNavigator();

const TAB_ICONS = Object.freeze({
  [TAB_ROUTES.ROUTINES]: 'format-list-bulleted',
  [TAB_ROUTES.PROGRESS]: 'show-chart',
});

export default function AppNavigator() {
  const { isDark, loadingTheme } = useAppTheme();
  const navigationTheme = useMemo(
    () => createNavigationTheme(isDark),
    [isDark]
  );

  if (loadingTheme) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? '#0B0F14' : '#FFFFFF',
        }}
      >
        <ActivityIndicator color="#FFD700" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: isDark ? '#9AA4B2' : 'gray',
          tabBarStyle: { backgroundColor: isDark ? '#131922' : '#FFFFFF' },
          tabBarIcon: ({ color, size }) => (
            <Icon
              name={TAB_ICONS[route.name]}
              color={color}
              size={size}
            />
          ),
        })}
      >
        <Tab.Screen
          name={TAB_ROUTES.ROUTINES}
          component={RoutinesStackNavigator}
          options={{ title: 'Rutinas' }}
        />
        <Tab.Screen
          name={TAB_ROUTES.PROGRESS}
          component={ProgressStackNavigator}
          options={{ title: 'Progreso' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
