import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

import {
  getProgresses,
  getExercises,
  deleteProgress,
  updateProgress,
} from '../../services/storageService';

export default function ManageProgressScreen() {
  const [allProgresses, setAllProgresses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const progs = await getProgresses();
        setAllProgresses(progs);
        const exArr = await getExercises();
        setExercises(exArr);
      })();
    }, [])
  );

  const makeKey = (p) => `${p.exerciseId}__${p.date}`;

  const displayed = allProgresses
    .filter((p) => !selectedExercise || p.exerciseId === selectedExercise)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = (item) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Eliminar este progreso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteProgress(item);
            setAllProgresses(updated);
          },
        },
      ]
    );
  };

  const handleEditStart = (item) => {
    const key = makeKey(item);
    setEditingKey(key);
    setEditWeight(String(item.weight));
    setEditReps(String(item.reps));
  };

  const handleEditSave = async (item) => {
    const w = parseFloat(editWeight);
    if (editWeight.trim() === '' || isNaN(w)) {
      Alert.alert('Atención', 'Debes ingresar un peso válido.');
      return;
    }
    const r = parseInt(editReps, 10);
    if (editReps.trim() === '' || isNaN(r)) {
      Alert.alert('Atención', 'Debes ingresar repeticiones válidas.');
      return;
    }
    const updatedArr = await updateProgress(item, { weight: w, reps: r });
    setAllProgresses(updatedArr);
    setEditingKey(null);
  };

  const renderItem = ({ item }) => {
    const key = makeKey(item);
    const exName =
      exercises.find((e) => e.id === item.exerciseId)?.name || '—';
    const dateStr = new Date(item.date).toLocaleDateString();
    const isEd = editingKey === key;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{exName}</Text>
        <Text style={styles.sub}>{dateStr}</Text>

        {isEd ? (
          <>
            <TextInput
              style={styles.input}
              value={editWeight}
              onChangeText={setEditWeight}
              keyboardType="numeric"
              placeholder="Peso"
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              value={editReps}
              onChangeText={setEditReps}
              keyboardType="numeric"
              placeholder="Repeticiones"
              placeholderTextColor="#666"
            />
          </>
        ) : (
          <Text style={styles.value}>
            {item.weight} kg — {item.reps} reps
          </Text>
        )}

        <View style={styles.actions}>
          {isEd ? (
            <>
              <TouchableOpacity onPress={() => handleEditSave(item)}>
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingKey(null)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => handleEditStart(item)}>
                <Text style={styles.btnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Text style={[styles.btnText, styles.deleteText]}>Eliminar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Picker
          selectedValue={selectedExercise}
          style={styles.picker}
          onValueChange={setSelectedExercise}
        >
          <Picker.Item label="Todos los ejercicios" value="" />
          {exercises.map((e) => (
            <Picker.Item key={e.id} label={e.name} value={e.id} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => makeKey(item)}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay progresos</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filters: { padding: 16, backgroundColor: '#f9f9f9' },
  picker: { height: 50, backgroundColor: '#fff', marginBottom: 8 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 14, color: '#666', marginVertical: 4 },
  value: { fontSize: 16, marginVertical: 8 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontSize: 16,
    marginVertical: 8,
    paddingVertical: 4,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  btnText: { color: '#FFD700', marginLeft: 12, fontWeight: '600' },
  deleteText: { color: '#FF4D4D' },
  empty: { textAlign: 'center', color: '#666', marginTop: 32 },
});