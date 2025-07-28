// src/screens/exercises/ExerciseDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Background from '../../components/Background';
import { getExercises } from '../../services/storageService';

export default function ExerciseDetailScreen({ route }) {
  const { exercise } = route.params;    // solo trae id, name, reps
  const [description, setDescription] = useState('');

  useEffect(() => {
    (async () => {
      const all = await getExercises();
      const found = all.find(e => e.id === exercise.id);
      setDescription(found?.description || '');
    })();
  }, [exercise.id]);

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>
          {exercise.name}
        </Text>

        <View style={styles.separator} />

        <Text style={styles.description}>
          {description.trim().length
            ? description
            : '— Sin descripción —'
          }
        </Text>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 16,
  },
  description: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});