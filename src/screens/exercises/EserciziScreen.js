// src/screens/exercises/EserciziScreen.js
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';

import Background from '../../components/Background';

export default function EserciziScreen({ navigation, route }) {
  const { routine } = route.params;
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    setExercises(routine?.exercises || []);
  }, [routine]);

  return (
    <Background>
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('DetalleEjercicio', { exercise: item })
            }
          >
            <Text style={styles.name}>{item.name}</Text>
            {item.reps != null && (
              <Text style={styles.reps}>Repeticiones: {item.reps}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
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
    backgroundColor: 'white',
    borderRadius:    8,
    padding:         16,
    marginBottom:    12,
    elevation:       2,
  },
  name:      { fontSize: 18, fontWeight: '600' },
  reps:      { marginTop: 4, color: '#666' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 32 },
});