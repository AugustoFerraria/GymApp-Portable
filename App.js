// App.js
import React, { useState, useCallback } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme as RNDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator }  from '@react-navigation/bottom-tabs';
import { createStackNavigator }       from '@react-navigation/stack';
import { Provider as PaperProvider }  from 'react-native-paper';
import { Icon }                      from 'react-native-elements';

import { ThemeContext }              from './src/context/ThemeContext';

import HomeScreen               from './src/screens/home/HomeScreen';
import CreateRoutineScreen      from './src/screens/routines/CreateRoutineScreen';
import ViewRoutineScreen        from './src/screens/routines/ViewRoutineScreen';
import EditRoutineScreen        from './src/screens/routines/EditRoutineScreen';
import EserciziScreen           from './src/screens/exercises/EserciziScreen';
import CreateExerciseScreen     from './src/screens/exercises/CreateExerciseScreen';
import ExerciseDetailScreen     from './src/screens/exercises/ExerciseDetailScreen';
import ManageProgressScreen     from './src/screens/progress/ManageProgressScreen';
import ProgressScreen           from './src/screens/progress/ProgressScreen';
import ManageExercisesScreen    from './src/screens/exercises/ManageExercisesScreen';
import EditExerciseScreen       from './src/screens/exercises/EditExerciseScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de Rutinas
function RutinasStack() {
  const { isDark } = React.useContext(ThemeContext);
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle:      { backgroundColor: '#FFD700' },
        headerTintColor:  '#fff',
        headerTitleAlign: 'center',
        cardStyle:        { backgroundColor: isDark ? '#414141' : '#fff' },
      }}
    >
      <Stack.Screen name="Home"           component={HomeScreen}           options={{ title: 'Mis Rutinas' }} />
      <Stack.Screen name="CrearRutina"    component={CreateRoutineScreen}  options={{ title: 'Nueva rutina' }} />
      <Stack.Screen name="VerRutina"      component={ViewRoutineScreen}    options={{ title: 'Ver rutina' }} />
      <Stack.Screen name="EditarRutina"   component={EditRoutineScreen}    options={{ title: 'Editar rutina' }} />
      <Stack.Screen name="Ejercicios"     component={EserciziScreen}       options={{ title: 'Ejercicios' }} />
      <Stack.Screen name="CrearEjercicio" component={CreateExerciseScreen} options={{ title: 'Nuevo ejercicio' }} />
      <Stack.Screen name="ManageExercises" component={ManageExercisesScreen} options={{ title: 'Ejercicios' }} />
      <Stack.Screen name="EditExercise"   component={EditExerciseScreen}    options={{ title: 'Editar ejercicio' }} />
      <Stack.Screen name="DetalleEjercicio" component={ExerciseDetailScreen} options={{ title: 'Detalle ejercicio' }} />
    </Stack.Navigator>
  );
}

// Stack de Progreso
function ProgresoStack() {
  const { isDark } = React.useContext(ThemeContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: isDark ? '#414141' : '#fff' } }}>
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

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => setIsDark(d => !d), []);

  // Combina el DarkTheme de React Navigation con nuestro color de fondo
  const navigationTheme = isDark
    ? {
        ...RNDarkTheme,
        colors: {
          ...RNDarkTheme.colors,
          background: '#414141',
          card:       '#414141',
          text:       '#fff',
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#fff',
          card:       '#fff',
          text:       '#000',
        },
      };

  return (
    <PaperProvider>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <NavigationContainer theme={navigationTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown:           false,
              tabBarActiveTintColor: '#FFD700',
              tabBarInactiveTintColor: isDark ? '#888' : 'gray',
              tabBarStyle:           { backgroundColor: isDark ? '#414141' : '#fff' },
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
      </ThemeContext.Provider>
    </PaperProvider>
  );
}