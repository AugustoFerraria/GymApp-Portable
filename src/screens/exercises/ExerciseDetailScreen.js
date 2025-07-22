import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';

import Background   from '../../components/Background';
import ToggleButton from '../../components/ToggleButton';
import ErrorText    from '../../components/ErrorText';
import ProgressChart from '../../components/ProgressChart';

export default function ExerciseDetailScreen({ route, navigation }) {
  // Ahora route.params siempre trae el objeto exercise
  const { exercise } = route.params;

  const [viewMode, setViewMode] = useState('Repeticiones');
  const [data, setData]       = useState([]);
  const [error, setError]     = useState('');

  useEffect(() => {
    // Cargamos los datos guardados para este ejercicio
    AsyncStorage.getItem(`exercise-${exercise.id}`)
      .then(json => (json ? JSON.parse(json) : []))
      .then(setData)
      .catch(() => setError('Error al cargar los datos'));
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

        {/* Aquí se muestra el ProgressChart sin problema de import */}
        <ProgressChart data={data} viewMode={viewMode} />

        {error ? (
          <ErrorText message={error} />
        ) : (
          <Button
            mode="contained"
            style={styles.addButton}
            onPress={() =>
              navigation.navigate('CrearEjercicio', {
                exercise,
                viewMode,
                existingData: data,
              })
            }
          >
            AÑADIR {viewMode.toUpperCase()}
          </Button>
        )}
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    padding:       16,
    paddingBottom: 32,
  },
  title: {
    fontSize:     22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  separator: {
    height:          1,
    backgroundColor: '#CCC',
    marginVertical:  12,
  },
  toggle: {
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#FFD700',
    borderRadius:    8,
    height:          48,
    justifyContent:  'center',
    marginVertical:  16,
  },
});