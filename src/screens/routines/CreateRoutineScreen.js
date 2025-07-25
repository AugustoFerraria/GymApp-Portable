import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExercises, saveRoutine } from '../../services/storageService';

export default function CreateRoutineScreen({ navigation }) {
  const [nombre, setNombre]                   = useState('');
  const [descripcion, setDescripcion]         = useState('');
  const [allExercises, setAllExercises]       = useState([]);
  const [dropdownOpen, setDropdownOpen]       = useState(false);
  const [seleccion, setSeleccion]             = useState(null);
  const [repsInput, setRepsInput]             = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);

  useEffect(() => {
    (async () => {
      const arr = await getExercises();
      // DropDownPicker espera items { label, value }
      setAllExercises(arr.map(e => ({ label: e.name, value: e.id })));
    })();
  }, []);

  const handleAddExercise = () => {
    if (!seleccion || !repsInput) {
      Alert.alert('Atención', 'Selecciona ejercicio y especifica repeticiones.');
      return;
    }
    const exists = routineExercises.find(e => e.id === seleccion);
    if (exists) {
      Alert.alert('Atención', 'Ya agregaste ese ejercicio.');
      return;
    }
    const exLabel = allExercises.find(e => e.value === seleccion)?.label || '';
    setRoutineExercises([
      ...routineExercises,
      { id: seleccion, name: exLabel, reps: parseInt(repsInput, 10) },
    ]);
    // limpiar selección
    setSeleccion(null);
    setRepsInput('');
  };

  const handleRemove = id => {
    setRoutineExercises(routineExercises.filter(e => e.id !== id));
  };

  const handleCrear = async () => {
    if (!nombre.trim() || routineExercises.length === 0) {
      Alert.alert('Atención', 'Falta nombre o ejercicios en la rutina.');
      return;
    }
    const nueva = {
      id: Date.now().toString(),
      name: nombre.trim(),
      description: descripcion.trim(),
      exercises: routineExercises, // [{id,name,reps}, ...]
    };
    await saveRoutine(nueva);
    // guardar detalles para EserciziScreen
    await AsyncStorage.setItem(
      `routine-${nueva.id}`,
      JSON.stringify({ exercises: routineExercises })
    );
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre de la rutina:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Pierna intensa"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Descripción (opcional):</Text>
      <TextInput
        style={styles.input}
        placeholder="Detalles..."
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <Text style={styles.label}>Agregar ejercicio:</Text>
      <DropDownPicker
        open={dropdownOpen}
        value={seleccion}
        items={allExercises}
        setOpen={setDropdownOpen}
        setValue={setSeleccion}
        containerStyle={styles.picker}
      />

      <TextInput
        style={styles.input}
        placeholder="Repeticiones"
        keyboardType="numeric"
        value={repsInput}
        onChangeText={setRepsInput}
      />

      <Button title="＋ Agregar a la rutina" onPress={handleAddExercise} color="#FFD700" />

      {/* Lista de ejercicios añadidos */}
      {routineExercises.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>Ejercicios en rutina:</Text>
          {routineExercises.map(e => (
            <View key={e.id} style={styles.card}>
              <Text style={styles.cardText}>
                {e.name} — {e.reps} repeticiones
              </Text>
              <TouchableOpacity onPress={() => handleRemove(e.id)}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <View style={styles.createBtn}>
        <Button title="Crear rutina" onPress={handleCrear} color="#FFD700" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label:    { fontSize: 16, marginVertical: 8 },
  input: {
    borderColor:   '#FFD700',
    borderWidth:   1,
    borderRadius:  5,
    padding:       8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: { marginBottom: 16, zIndex: 1000 },
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius:    5,
    padding:         12,
    marginVertical:  6,
    elevation:       1,
  },
  cardText: { fontSize: 16 },
  remove:   { color: '#FF4D4D', fontSize: 18 },
  createBtn: { marginTop: 30 },
});