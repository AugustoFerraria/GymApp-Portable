import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreateExerciseScreen from '../../features/exercises/screens/CreateExerciseScreen';
import EditExerciseScreen from '../../features/exercises/screens/EditExerciseScreen';
import ExerciseDetailScreen from '../../features/exercises/screens/ExerciseDetailScreen';
import ExerciseScreen from '../../features/exercises/screens/ExerciseScreen';
import ManageExercisesScreen from '../../features/exercises/screens/ManageExercisesScreen';
import CreateRoutineScreen from '../../features/routines/screens/CreateRoutineScreen';
import EditRoutineScreen from '../../features/routines/screens/EditRoutineScreen';
import RoutinesScreen from '../../features/routines/screens/RoutinesScreen';
import ViewRoutineScreen from '../../features/routines/screens/ViewRoutineScreen';
import { ROUTINE_ROUTES } from '../../shared/navigation/routeNames';
import { useAppTheme } from '../../shared/theme/ThemeContext';

const Stack = createStackNavigator();

export default function RoutinesStackNavigator() {
  const { isDark } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName={ROUTINE_ROUTES.HOME}
      screenOptions={{
        headerStyle: { backgroundColor: '#FFD700' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        cardStyle: { backgroundColor: isDark ? '#0B0F14' : '#FFFFFF' },
      }}
    >
      <Stack.Screen
        name={ROUTINE_ROUTES.HOME}
        component={RoutinesScreen}
        options={{ title: 'Mis Rutinas' }}
      />
      <Stack.Screen
        name={ROUTINE_ROUTES.CREATE}
        component={CreateRoutineScreen}
        options={{ title: 'Nueva rutina' }}
      />
      <Stack.Screen
        name={ROUTINE_ROUTES.VIEW}
        component={ViewRoutineScreen}
        options={{ title: 'Ver rutina' }}
      />
      <Stack.Screen
        name={ROUTINE_ROUTES.EDIT}
        component={EditRoutineScreen}
        options={{ title: 'Editar rutina' }}
      />
      <Stack.Screen
        name={ROUTINE_ROUTES.EXERCISES}
        component={ExerciseScreen}
        options={{ title: 'Ejercicios' }}
      />
      <Stack.Screen
        name={ROUTINE_ROUTES.CREATE_EXERCISE}
        component={CreateExerciseScreen}
        options={{ title: 'Nuevo ejercicio' }}
      />
      <Stack.Screen
        name={ROUTINE_ROUTES.MANAGE_EXERCISES}
        component={ManageExercisesScreen}
        options={{ title: 'Ejercicios' }}
      />
      <Stack.Screen
        name={ROUTINE_ROUTES.EDIT_EXERCISE}
        component={EditExerciseScreen}
        options={{ title: 'Editar ejercicio' }}
      />
      <Stack.Screen
        name={ROUTINE_ROUTES.EXERCISE_DETAIL}
        component={ExerciseDetailScreen}
        options={{ title: 'Detalle ejercicio' }}
      />
    </Stack.Navigator>
  );
}
