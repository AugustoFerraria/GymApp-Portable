import React, { useState, useCallback, useEffect } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { deleteRoutine, getRoutines } from '../data/routineRepository';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { ROUTINE_ROUTES } from '../../../shared/navigation/routeNames';
import { useAppTheme } from '../../../shared/theme/ThemeContext';
import RoutineCard from '../components/RoutineCard';

export default function RoutinesScreen() {
  const navigation = useNavigation();
  const { isDark, toggleTheme } = useAppTheme();

  const [routines, setRoutines] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
          <Icon
            name={isDark ? 'wb-sunny' : 'dark-mode'}
            color="#fff"
            size={24}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDark, toggleTheme]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const arr = await getRoutines();
        setRoutines(arr);
      })();
    }, [])
  );

  const handleDelete = async (id) => {
    const updated = await deleteRoutine(id);
    setRoutines(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleView = useCallback((routine) => {
    navigation.navigate(ROUTINE_ROUTES.EXERCISES, { routine });
  }, [navigation]);

  const handleEdit = useCallback((routineId) => {
    navigation.navigate(ROUTINE_ROUTES.EDIT, { routineId });
  }, [navigation]);

  const emptyColor = isDark ? '#9AA4B2' : '#666666';

  return (
    <ScreenBackground>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={routines.length ? styles.list : styles.emptyList}
        renderItem={({ item }) => (
          <RoutineCard
            item={item}
            expanded={expandedId === item.id}
            onToggle={toggleExpand}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: emptyColor }]}>
            No tienes rutinas aún
          </Text>
        }
      />

      <FAB.Group
        open={fabOpen}
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'plus',
            label: 'Nueva rutina',
            onPress: () => navigation.navigate(ROUTINE_ROUTES.CREATE),
          },
          {
            icon: 'dumbbell',
            label: 'Ejercicios',
            onPress: () => navigation.navigate(ROUTINE_ROUTES.MANAGE_EXERCISES),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  list:         { padding: 16 },
  emptyList:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  emptyText:    { textAlign: 'center', marginTop: 32 },
});
