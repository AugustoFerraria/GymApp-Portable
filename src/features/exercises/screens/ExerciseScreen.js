import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import { ROUTINE_ROUTES } from '../../../shared/navigation/routeNames';
import { useAppTheme } from '../../../shared/theme/ThemeContext';

export default function ExerciseScreen({ navigation, route }) {
  const { routine } = route.params;
  const [exercises, setExercises] = useState([]);
  const { isDark } = useAppTheme();

  useEffect(() => {
    setExercises(routine?.exercises || []);
  }, [routine]);

    // colores dinámicos
  const cardBg    = isDark ? '#131922' : '#FFFFFF';
  const nameColor = isDark ? '#FFFFFF' : '#111827';
  const subColor  = isDark ? '#9AA4B2' : '#666666';

  return (
    <ScreenBackground>
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg }]}
            onPress={() =>
              navigation.navigate(ROUTINE_ROUTES.EXERCISE_DETAIL, { exercise: item })
            }
          >
            <Text style={[styles.name, { color: nameColor }]}>
              {item.name}
            </Text>
            <Text style={[styles.sub,  { color: subColor }]}>
              {item.series} series – {item.reps} repeticiones
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: subColor }]}>
            Esta rutina no tiene ejercicios aún
          </Text>
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  list:      { padding: 16 },
  card:      {
    borderRadius:  8,
    padding:       16,
    marginBottom:  12,
    elevation:     2,
  },
  name:      { fontSize: 18, fontWeight: '600' },
  sub:       { marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 32 },
});
