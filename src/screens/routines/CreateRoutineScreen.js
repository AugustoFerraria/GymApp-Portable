// src/screens/routines/CreateRoutineScreen.js
import React, { useState, useLayoutEffect, useCallback } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import {
  getExercises,
  saveRoutine
} from '../../services/storageService';

export default function CreateRoutineScreen({ navigation }) {
  const [nombre, setNombre]                     = useState('');
  const [descripcion, setDescripcion]           = useState('');
  const [allExercises, setAllExercises]         = useState([]);
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const [seleccion, setSeleccion]               = useState(null);
  const [repsInput, setRepsInput]               = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);

  // 1) Botón "+" en el header para crear ejercicio
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
      ),
    });
  }, [navigation]);

  // 2) Cargar ejercicios siempre que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const arr = await getExercises();
        setAllExercises(arr.map(e => ({ label: e.name, value: e.id })));
      })();
    }, [])
  );

  const handleAddExercise = () => {
    if (!seleccion || !repsInput) {
      Alert.alert('Atención', 'Selecciona ejercicio y especifica repeticiones.');
      return;
    }
    if (routineExercises.some(e => e.id === seleccion)) {
      Alert.alert('Atención', 'Ya agregaste ese ejercicio.');
      return;
    }
    const label = allExercises.find(e => e.value === seleccion)?.label || '';
    setRoutineExercises([
      ...routineExercises,
      { id: seleccion, name: label, reps: parseInt(repsInput, 10) },
    ]);
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
      exercises: routineExercises,
    };
    await saveRoutine(nueva);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre de la rutina:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Día de pecho"
        placeholderTextColor="#666"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Descripción (opcional):</Text>
      <TextInput
        style={styles.input}
        placeholder="Detalles..."
        placeholderTextColor="#666"
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
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={repsInput}
        onChangeText={setRepsInput}
      />

      <Button
        title="＋ Agregar a la rutina"
        onPress={handleAddExercise}
        color="#FFD700"
      />

      {routineExercises.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>
            Ejercicios en rutina:
          </Text>
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
  label:     { fontSize: 16, marginVertical: 8 },
  input: {
    borderColor:      '#FFD700',
    borderWidth:      1,
    borderRadius:     5,
    padding:          8,
    marginBottom:     16,
    backgroundColor:  '#fff',
  },
  picker:       { marginBottom: 16, zIndex: 1000 },
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: '#fff',
    borderRadius:    5,
    padding:         12,
    marginVertical:  6,
    elevation:       1,
  },
  cardText: { fontSize: 16 },
  remove:   { color: '#FF4D4D', fontSize: 18 },
  createBtn:{ marginTop: 30 },
});