// src/screens/exercises/ManageExercisesScreen.js
import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  getExercises,
  deleteExercise
} from '../../services/storageService';
import { Icon } from 'react-native-elements';

export default function ManageExercisesScreen() {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState([]);

  // Botón + en el header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name="add"
          type="material"
          color="#fff"
          size={28}
          containerStyle={{ marginRight: 16 }}
          onPress={() => navigation.navigate('CrearEjercicio')}
        />
      )
    });
  }, [navigation]);

  // Carga ejercicios al enfocar
  useFocusEffect(useCallback(() => {
    (async () => {
      const arr = await getExercises();
      setExercises(arr);
    })();
  }, []));

  const onDelete = (id) => {
    Alert.alert(
      'Eliminar ejercicio',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteExercise(id);
            setExercises(updated);
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.desc}>{item.description}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditExercise', { exercise: item })}
        >
          <Icon
            name="edit"
            type="material"
            size={28}
            color="#007AFF"
            containerStyle={styles.iconSpacing}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Icon
            name="delete"
            type="material"
            size={28}
            color="#FF4D4D"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={exercises}
      keyExtractor={e => e.id}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
      ListEmptyComponent={<Text style={styles.empty}>No hay ejercicios</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    minHeight: 80,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  desc: {
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
});