import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

import {
  getExercises,
  getProgress,
  addProgress,
} from '../../services/storageService';
import ProgressChart from '../../components/ProgressChart';

const screenWidth = Dimensions.get('window').width - 40;

export default function ProgressScreen() {
  const navigation = useNavigation();
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const exArr = await getExercises();
        setExercises(exArr);
        if (selectedExercise) {
          const progArr = await getProgress(selectedExercise);
          setData(progArr);
        } else {
          setData([]);
        }
      })();
    }, [selectedExercise])
  );

  const dataAsc = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const dataDesc = [...data].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const handleAdd = async () => {
    if (!selectedExercise) {
      Alert.alert('Atención', 'Debes seleccionar un ejercicio.');
      return;
    }
    const w = parseFloat(weight);
    if (weight.trim() === '' || isNaN(w)) {
      Alert.alert('Atención', 'Debes ingresar un peso válido.');
      return;
    }
    const r = parseInt(reps, 10);
    if (reps.trim() === '' || isNaN(r)) {
      Alert.alert('Atención', 'Debes ingresar un número de repeticiones válido.');
      return;
    }
    const entry = {
      date: new Date().toISOString(),
      weight: w,
      reps: r,
    };
    const updated = await addProgress(selectedExercise, entry);
    setData(updated);
    setWeight('');
    setReps('');
    setError('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progreso</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ManageProgress')}
        >
          <Icon name="edit" type="material" color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Picker
          selectedValue={selectedExercise}
          style={styles.picker}
          onValueChange={setSelectedExercise}
        >
          <Picker.Item label="Selecciona ejercicio" value="" />
          {exercises.map((ex) => (
            <Picker.Item key={ex.id} label={ex.name} value={ex.id} />
          ))}
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Peso (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Repeticiones"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
        />

        <Button title="Agregar registro" onPress={handleAdd} color="#FFD700" />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {dataAsc.length ? (
          <ProgressChart data={dataAsc} viewMode="Peso" />
        ) : (
          <Text style={styles.noDataText}>No hay datos disponibles</Text>
        )}

        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.tableCell, styles.tableHeader]}>Fecha</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Peso</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Reps</Text>
          </View>
          {dataDesc.map((entry) => (
            <View key={entry.date} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {new Date(entry.date).toLocaleDateString()}
              </Text>
              <Text style={styles.tableCell}>{entry.weight}</Text>
              <Text style={styles.tableCell}>{entry.reps}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 85,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButton: { padding: 8 },
  content: { padding: 16, paddingBottom: 32 },
  picker: { height: 50, backgroundColor: '#fff', marginBottom: 16 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    padding: 8,
    marginBottom: 16,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 16 },
  noDataText: { textAlign: 'center', color: '#666', marginVertical: 16 },
  table: { marginTop: 24, borderTopWidth: 1, borderColor: '#CCC' },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tableCell: { flex: 1, textAlign: 'center' },
  tableHeader: { fontWeight: 'bold' },
});