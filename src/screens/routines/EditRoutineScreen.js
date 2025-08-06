// src/screens/routines/EditRoutineScreen.js
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
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
import {
  getExercises,
  getRoutines,
  updateRoutine,
} from '../../services/storageService';

export default function EditRoutineScreen({ route, navigation }) {
  const { routineId } = route.params;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [allExercises, setAllExercises] = useState([]);      // [{ label, value }]
  const [seleccion, setSeleccion] = useState(null);          // id del ejercicio elegido
  const [repsInput, setRepsInput] = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Header '+' para crear un ejercicio nuevo
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

  // Carga ejercicios y datos de la rutina una vez
  useEffect(() => {
    (async () => {
      const exArr = await getExercises();
      setAllExercises(exArr.map(e => ({ label: e.name, value: e.id })));

      const routines = await getRoutines();
      const rt = routines.find(r => r.id === routineId);
      if (!rt) {
        Alert.alert('Error', 'Rutina no encontrada');
        return navigation.goBack();
      }
      setNombre(rt.name);
      setDescripcion(rt.description || '');
      setRoutineExercises(rt.exercises);
    })();
  }, [navigation, routineId]);

  // Añadir ejercicio a la rutina
  const handleAddExercise = () => {
    if (!seleccion || !repsInput) {
      return Alert.alert('Atención', 'Selecciona ejercicio y repeticiones.');
    }
    if (routineExercises.some(e => e.id === seleccion)) {
      return Alert.alert('Atención', 'Ejercicio ya agregado');
    }
    const label = allExercises.find(e => e.value === seleccion)?.label || '';
    setRoutineExercises([
      ...routineExercises,
      { id: seleccion, name: label, reps: parseInt(repsInput, 10) },
    ]);
    setSeleccion(null);
    setRepsInput('');
  };

  // Quitar ejercicio
  const handleRemove = id => {
    setRoutineExercises(routineExercises.filter(e => e.id !== id));
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!nombre.trim() || routineExercises.length === 0) {
      return Alert.alert('Atención', 'Nombre y al menos un ejercicio son obligatorios');
    }
    const updated = {
      id:          routineId,
      name:        nombre.trim(),
      description: descripcion.trim(),
      exercises:   routineExercises,
    };
    await updateRoutine(updated);
    navigation.goBack();
  };

  // Etiqueta del dropdown: muestra selección o placeholder
  const displayLabel = seleccion
    ? allExercises.find(e => e.value === seleccion)?.label
    : 'Selecciona ejercicio';

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled>
      <Text style={styles.label}>Nombre:</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Descripción:</Text>
      <TextInput
        style={styles.input}
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
          <ScrollView style={styles.dropdownContainer} nestedScrollEnabled>
            {allExercises.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setSeleccion(opt.value);
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{opt.label}</Text>
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
        title="＋ Agregar ejercicio"
        onPress={handleAddExercise}
        color="#FFD700"
      />

      {routineExercises.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>Ejercicios:</Text>
          {routineExercises.map(e => (
            <View key={e.id} style={styles.card}>
              <Text style={styles.cardText}>
                {e.name} — {e.reps} reps
              </Text>
              <TouchableOpacity onPress={() => handleRemove(e.id)}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <View style={styles.saveBtn}>
        <Button title="Guardar cambios" onPress={handleSave} color="#FFD700" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, padding:20 },
  label:     { fontSize:16, marginBottom:8 },
  input:     {
    borderColor:   '#FFD700',
    borderWidth:   1,
    borderRadius:  10,
    backgroundColor:'#fff',
    padding:       8,
    marginBottom: 16,
  },

  dropdownWrapper: { marginBottom:16 },
  dropdownBtn: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    borderWidth:    1,
    borderColor:    '#FFD700',
    borderRadius:   10,
    backgroundColor:'#fff',
    paddingVertical:12,
    paddingHorizontal:12,
  },
  dropdownBtnText: { fontSize:16, color:'#000' },

  dropdownContainer: {
    borderWidth:    1,
    borderColor:    '#000',
    borderRadius:   15,
    backgroundColor:'#fff',
    maxHeight:      250,
    marginTop:      4,
  },
  dropdownItem: {
    paddingVertical:   20,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor:'#000',
  },
  dropdownItemText: {
    fontSize:16,
    color:'#000',
  },

  card: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent: 'space-between',
    borderWidth:    1,
    borderColor:    '#FFD700',
    borderRadius:   10,
    backgroundColor:'#fff',
    padding:        12,
    marginVertical: 6,
  },
  cardText: { fontSize:16 },
  remove:   { color:'#FF4D4D', fontSize:18 },

  saveBtn: { marginTop:30 },
});