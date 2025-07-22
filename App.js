// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }  from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Icon } from 'react-native-elements';

import HomeScreen from './src/screens/home/HomeScreen';
import EserciziScreen from './src/screens/exercises/EserciziScreen';
import CreateExerciseScreen from './src/screens/exercises/CreateExerciseScreen';
import ExerciseDetailScreen from './src/screens/exercises/ExerciseDetailScreen';
import CreateRoutineScreen from './src/screens/routines/CreateRoutineScreen';
import ViewRoutineScreen from './src/screens/routines/ViewRoutineScreen';
import EditRoutineScreen from './src/screens/routines/EditRoutineScreen';
import ProgressScreen from './src/screens/progress/ProgressScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function RutinasStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle:     { backgroundColor: '#FFD700' },
        headerTintColor: '#fff',
        headerTitleAlign:'center',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Stack.Screen
        name="Ejercicios"
        component={EserciziScreen}
        options={{ title: 'Ejercicios' }}
      />
      <Stack.Screen
        name="CrearEjercicio"
        component={CreateExerciseScreen}
        options={{ title: 'Nuevo ejercicio' }}
      />
      <Stack.Screen
        name="DetalleEjercicio"
        component={ExerciseDetailScreen}
        options={{ title: 'Detalle ejercicio' }}
      />
      <Stack.Screen
        name="CrearRutina"
        component={CreateRoutineScreen}
        options={{ title: 'Nueva rutina' }}
      />
      <Stack.Screen
        name="VerRutina"
        component={ViewRoutineScreen}
        options={{ title: 'Ver rutina' }}
      />
      <Stack.Screen
        name="EditarRutina"
        component={EditRoutineScreen}
        options={{ title: 'Editar rutina' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown:       false,
            tabBarActiveTintColor:   '#FFD700',
            tabBarInactiveTintColor: 'gray',
            tabBarIcon: ({ color, size }) => {
              const icons = {
                Rutinas:  'format-list-bulleted',
                Progreso: 'show-chart',
              };
              return <Icon name={icons[route.name]} type="material" color={color} size={size} />;
            },
          })}
        >
          <Tab.Screen
            name="Rutinas"
            component={RutinasStack}
            options={{ title: 'Rutinas' }}
          />
          <Tab.Screen
            name="Progreso"
            component={ProgressScreen}
            options={{ title: 'Progreso' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}