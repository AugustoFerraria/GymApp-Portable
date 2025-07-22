// src/screens/home/HomeScreen.js

import React, { useState, useEffect } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAB } from 'react-native-paper';

import Background from '../../components/Background';

export default function HomeScreen({ navigation }) {
  const [routines, setRoutines] = useState([]);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('routines')
      .then(json => (json ? JSON.parse(json) : []))
      .then(setRoutines)
      .catch(console.warn);
  }, []);

  const renderRoutine = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Ejercicios', { routine: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Background>
      <FlatList
        data={routines}
        keyExtractor={item => item.id}
        contentContainerStyle={
          routines.length ? styles.list : styles.emptyList
        }
        renderItem={renderRoutine}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
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
            onPress: () => navigation.navigate('CrearRutina'),
          },
          {
            icon: 'dumbbell',
            label: 'Nuevo ejercicio',
            onPress: () => navigation.navigate('CrearEjercicio'),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        onPress={() => {
          /* Si quieres cerrar manualmente: setFabOpen(false) */
        }}
      />
    </Background>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyList: {
    flex:            1,
    justifyContent: 'center',
    alignItems:     'center',
    padding:         16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius:    8,
    padding:         16,
    marginBottom:    12,
    elevation:       2,
  },
  name: {
    fontSize:     18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize:    16,
    color:      '#666',
    textAlign: 'center',
  },
});