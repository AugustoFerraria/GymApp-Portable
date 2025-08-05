// src/screens/routines/CreateRoutineScreen.js
import React, { useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import { getExercises, saveRoutine } from '../../services/storageService';

export default function CreateRoutineScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [allExercises, setAllExercises] = useState([]); // [{ label, value }]
  const [seleccion, setSeleccion] = useState(null);
  const [repsInput, setRepsInput] = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Botón '+' en el header
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

  // Carga ejercicios al enfocar pantalla
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
      return Alert.alert('Atención', 'Selecciona ejercicio y especifica repeticiones.');
    }
    if (routineExercises.some(e => e.id === seleccion)) {
      return Alert.alert('Atención', 'Ya agregaste ese ejercicio.');
    }
    const { label, value } = allExercises.find(e => e.value === seleccion);
    setRoutineExercises([
      ...routineExercises,
      { id: value, name: label, reps: parseInt(repsInput, 10) },
    ]);
    setSeleccion(null);
    setRepsInput('');
  };

  const handleRemove = id => {
    setRoutineExercises(routineExercises.filter(e => e.id !== id));
  };

  const handleCrear = async () => {
    if (!nombre.trim() || routineExercises.length === 0) {
      return Alert.alert('Atención', 'Falta nombre o ejercicios en la rutina.');
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

  const displayLabel = seleccion
    ? allExercises.find(e => e.value === seleccion)?.label
    : 'Selecciona ejercicio';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      nestedScrollEnabled
    >
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
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => setDropdownOpen(open => !open)}
        >
          <Text
            style={[
              styles.dropdownBtnText,
              !seleccion && { color: '#666' },
            ]}
          >
            {displayLabel}
          </Text>
          <Icon
            name={dropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            type="material"
            color="#666"
            size={24}
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <ScrollView
            style={styles.dropdownContainer}
            nestedScrollEnabled
          >
            {allExercises.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setSeleccion(opt.value);
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

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
        <Button
          title="Crear rutina"
          onPress={handleCrear}
          color="#FFD700"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },

  label: { fontSize: 16, marginVertical: 8 },

  input: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 16,
  },

  dropdownWrapper: {
    marginBottom: 16,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownBtnText: {
    fontSize: 16,
    color: '#000',
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 15,
    backgroundColor: '#fff',
    maxHeight: 250,
    marginTop: 4,
  },
  dropdownItem: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
  },
  cardText: { fontSize: 16 },
  remove: { color: '#FF4D4D', fontSize: 18 },

  createBtn: { marginTop: 30 },
});