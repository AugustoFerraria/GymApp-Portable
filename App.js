// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator }  from '@react-navigation/bottom-tabs';
import { createStackNavigator }       from '@react-navigation/stack';
import { Provider as PaperProvider }  from 'react-native-paper';
import { Icon }                      from 'react-native-elements';

import HomeScreen               from './src/screens/home/HomeScreen';
import CreateRoutineScreen      from './src/screens/routines/CreateRoutineScreen';
import ViewRoutineScreen        from './src/screens/routines/ViewRoutineScreen';
import EditRoutineScreen        from './src/screens/routines/EditRoutineScreen';
import EserciziScreen           from './src/screens/exercises/EserciziScreen';
import CreateExerciseScreen     from './src/screens/exercises/CreateExerciseScreen';
import ExerciseDetailScreen     from './src/screens/exercises/ExerciseDetailScreen';
import ManageExercisesScreen    from './src/screens/exercises/ManageExercisesScreen';
import EditExerciseScreen       from './src/screens/exercises/EditExerciseScreen';
import ProgressScreen           from './src/screens/progress/ProgressScreen';
import ManageProgressScreen     from './src/screens/progress/ManageProgressScreen';

import { getExercises }         from './src/services/storageService';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function RutinasStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle:      { backgroundColor: '#FFD700' },
        headerTintColor:  '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="Home"           component={HomeScreen}            options={{ title: 'Mis Rutinas' }} />
      <Stack.Screen name="CrearRutina"    component={CreateRoutineScreen}   options={{ title: 'Nueva rutina' }} />
      <Stack.Screen name="VerRutina"      component={ViewRoutineScreen}     options={{ title: 'Ver rutina' }} />
      <Stack.Screen name="EditarRutina"   component={EditRoutineScreen}     options={{ title: 'Editar rutina' }} />
      <Stack.Screen name="Ejercicios"     component={EserciziScreen}        options={{ title: 'Ejercicios' }} />
      <Stack.Screen name="CrearEjercicio" component={CreateExerciseScreen}  options={{ title: 'Nuevo ejercicio' }} />
      <Stack.Screen name="ManageExercises" component={ManageExercisesScreen} options={{ title: 'Ejercicios' }} />
      <Stack.Screen name="EditExercise"   component={EditExerciseScreen}    options={{ title: 'Editar ejercicio' }} />
      <Stack.Screen name="DetalleEjercicio" component={ExerciseDetailScreen} options={{ title: 'Detalle ejercicio' }} />
    </Stack.Navigator>
  );
}

function ProgresoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
  // Sembrar ejercicios por defecto al inicio
  useEffect(() => {
    getExercises();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown:            false,
            tabBarActiveTintColor:   '#FFD700',
            tabBarInactiveTintColor: 'gray',
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
    </PaperProvider>
  );
}
