// App.js
import React, { useContext, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme as RNDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator }  from '@react-navigation/bottom-tabs';
import { createStackNavigator }       from '@react-navigation/stack';
import { Provider as PaperProvider }  from 'react-native-paper';
import { Icon }                      from 'react-native-elements';

import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';

import HomeScreen               from './src/screens/home/HomeScreen';
import CreateRoutineScreen      from './src/screens/routines/CreateRoutineScreen';
import ViewRoutineScreen        from './src/screens/routines/ViewRoutineScreen';
import EditRoutineScreen        from './src/screens/routines/EditRoutineScreen';
import ExerciseScreen           from './src/screens/exercises/ExerciseScreen';
import CreateExerciseScreen     from './src/screens/exercises/CreateExerciseScreen';
import ExerciseDetailScreen     from './src/screens/exercises/ExerciseDetailScreen';
import ManageProgressScreen     from './src/screens/progress/ManageProgressScreen';
import ProgressScreen           from './src/screens/progress/ProgressScreen';
import ManageExercisesScreen    from './src/screens/exercises/ManageExercisesScreen';
import EditExerciseScreen       from './src/screens/exercises/EditExerciseScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function RutinasStack() {
  const { isDark } = useContext(ThemeContext);
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle:      { backgroundColor: '#FFD700' },
        headerTintColor:  '#fff',
        headerTitleAlign: 'center',
        cardStyle:        { backgroundColor: isDark ? '#0B0F14' : '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Home"             component={HomeScreen}             options={{ title: 'Mis Rutinas' }} />
      <Stack.Screen name="CrearRutina"      component={CreateRoutineScreen}    options={{ title: 'Nueva rutina' }} />
      <Stack.Screen name="VerRutina"        component={ViewRoutineScreen}      options={{ title: 'Ver rutina' }} />
      <Stack.Screen name="EditarRutina"     component={EditRoutineScreen}      options={{ title: 'Editar rutina' }} />
      <Stack.Screen name="Ejercicios"       component={ExerciseScreen}         options={{ title: 'Ejercicios' }} />
      <Stack.Screen name="CrearEjercicio"   component={CreateExerciseScreen}   options={{ title: 'Nuevo ejercicio' }} />
      <Stack.Screen name="ManageExercises"  component={ManageExercisesScreen}  options={{ title: 'Ejercicios' }} />
      <Stack.Screen name="EditExercise"     component={EditExerciseScreen}     options={{ title: 'Editar ejercicio' }} />
      <Stack.Screen name="DetalleEjercicio" component={ExerciseDetailScreen}   options={{ title: 'Detalle ejercicio' }} />
    </Stack.Navigator>
  );
}

function ProgresoStack() {
  const { isDark } = useContext(ThemeContext);
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: isDark ? '#0B0F14' : '#FFFFFF' } }}
    >
      <Stack.Screen name="ProgresoMain" component={ProgressScreen} />
      <Stack.Screen
        name="ManageProgress"
        component={ManageProgressScreen}
        options={{
          headerShown:      true,
          headerStyle:      { backgroundColor: '#FFD700' },
          headerTintColor:  '#fff',
          headerTitleAlign: 'center',
          title:            'Gestionar Progreso',
        }}
      />
    </Stack.Navigator>
  );
}

function Root() {
  const { isDark, loadingTheme } = useContext(ThemeContext);

  const navigationTheme = useMemo(() => (
    isDark
      ? {
          ...RNDarkTheme,
          colors: {
            ...RNDarkTheme.colors,
            background: '#0B0F14',
            card:       '#131922',
            text:       '#FFFFFF',
            border:     '#1F2937',
            primary:    '#FFD700',
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: '#FFFFFF',
            card:       '#FFFFFF',
            text:       '#111827',
            border:     '#DDDDDD',
            primary:    '#FFD700',
          },
        }
  ), [isDark]);

  if (loadingTheme) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0B0F14' : '#FFFFFF' }}>
        <ActivityIndicator color="#FFD700" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown:             false,
          tabBarActiveTintColor:   '#FFD700',
          tabBarInactiveTintColor: isDark ? '#9AA4B2' : 'gray',
          tabBarStyle:             { backgroundColor: isDark ? '#131922' : '#FFFFFF' },
          tabBarIcon: ({ color, size }) => {
            const icons = { Rutinas: 'format-list-bulleted', Progreso: 'show-chart' };
            return <Icon name={icons[route.name]} type="material" color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen name="Rutinas"  component={RutinasStack}  options={{ title: 'Rutinas' }} />
        <Tab.Screen name="Progreso" component={ProgresoStack} options={{ title: 'Progreso' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </PaperProvider>
  );
}