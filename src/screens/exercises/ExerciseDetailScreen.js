// src/screens/exercises/ExerciseDetailScreen.js
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Background    from '../../components/Background';
import ToggleButton  from '../../components/ToggleButton';
import ErrorText     from '../../components/ErrorText';
import ProgressChart from '../../components/ProgressChart';

export default function ExerciseDetailScreen({ route }) {
  const { exercise } = route.params;
  const [viewMode, setViewMode] = useState('Repeticiones');
  const [data, setData]         = useState([]);
  const [error, setError]       = useState('');

  useEffect(() => {
    AsyncStorage.getItem(`exercise-${exercise.id}`)
      .then(json => (json ? JSON.parse(json) : []))
      .then(setData)
      .catch(() => setError('Error al cargar datos'));
  }, [exercise.id]);

  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.separator} />

        <ToggleButton
          options={['Peso', 'Repeticiones']}
          value={viewMode}
          onChange={setViewMode}
          style={styles.toggle}
        />

        <ProgressChart data={data} viewMode={viewMode} />

        {error ? (
          <ErrorText message={error} />
        ) : (
          <Button
            title={`AÑADIR ${viewMode.toUpperCase()}`}
            onPress={() => {}}
            color="#FFD700"
          />
        )}
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container:   { padding: 16, paddingBottom: 32 },
  title:       { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  separator:   { height: 1, backgroundColor: '#CCC', marginVertical: 12 },
  toggle:      { marginBottom: 24 },
  addButton:   { marginTop: 16 },
});