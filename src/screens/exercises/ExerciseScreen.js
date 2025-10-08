// src/screens/exercises/ExerciseScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Background from '../../components/Background';
import { ThemeContext } from '../../context/ThemeContext';

export default function ExerciseScreen({ navigation, route }) {
  const { routine } = route.params;
  const [exercises, setExercises] = useState([]);
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    setExercises(routine?.exercises || []);
  }, [routine]);

    // colores dinámicos
  const cardBg    = isDark ? '#131922' : '#FFFFFF';
  const nameColor = isDark ? '#FFFFFF' : '#111827';
  const subColor  = isDark ? '#9AA4B2' : '#666666';

  return (
    <Background>
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg }]}
            onPress={() =>
              navigation.navigate('DetalleEjercicio', { exercise: item })
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
    </Background>
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