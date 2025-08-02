// src/screens/routines/EditRoutineScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import {
  getExercises,
  getRoutines,
  updateRoutine,
} from '../../services/storageService';

export default function EditRoutineScreen({ route, navigation }) {
  const { routineId } = route.params;
  const [nombre, setNombre]               = useState('');
  const [descripcion, setDescripcion]     = useState('');
  const [allExercises, setAllExercises]   = useState([]);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [seleccion, setSeleccion]         = useState(null);
  const [repsInput, setRepsInput]         = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);

  useEffect(() => {
    (async () => {
      // cargamos lista de ejercicios para el dropdown
      const exArr = await getExercises();
      setAllExercises(exArr.map(e => ({ label: e.name, value: e.id })));

      // cargamos la rutina a editar
      const routines = await getRoutines();
      const rt = routines.find(r => r.id === routineId);
      if (!rt) {
        Alert.alert('Error','Rutina no encontrada');
        return navigation.goBack();
      }
      setNombre(rt.name);
      setDescripcion(rt.description || '');
      setRoutineExercises(rt.exercises);
    })();
  }, []);

  const handleAddExercise = () => {
    if (!seleccion || !repsInput) {
      return Alert.alert('Atención','Selecciona ejercicio y repeticiones');
    }
    if (routineExercises.some(e => e.id === seleccion)) {
      return Alert.alert('Atención','Ejercicio ya agregado');
    }
    const label = allExercises.find(e => e.value === seleccion)?.label || '';
    setRoutineExercises([
      ...routineExercises,
      { id: seleccion, name: label, reps: parseInt(repsInput,10) }
    ]);
    setSeleccion(null);
    setRepsInput('');
  };

  const handleRemove = id => {
    setRoutineExercises(routineExercises.filter(e => e.id !== id));
  };

  const handleSave = async () => {
    if (!nombre.trim() || routineExercises.length === 0) {
      return Alert.alert('Atención','Nombre y al menos un ejercicio son obligatorios');
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

  return (
    <View style={styles.container}>
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
        title="＋ Agregar ejercicio"
        onPress={handleAddExercise}
        color="#FFD700"
      />

      {routineExercises.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>Ejercicios:</Text>
          {routineExercises.map(e => (
            <View key={e.id} style={styles.card}>
              <Text>{e.name} — {e.reps} reps</Text>
              <TouchableOpacity onPress={() => handleRemove(e.id)}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <View style={styles.saveBtn}>
        <Button
          title="Guardar cambios"
          onPress={handleSave}
          color="#FFD700"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20 },
  label:     { fontSize:16, marginBottom:8 },
  input:     {
    borderColor:'#FFD700', borderWidth:1,
    borderRadius:5, padding:8, marginBottom:16,
    backgroundColor:'#fff'
  },
  picker:    { marginBottom:16, zIndex:1000 },
  card:      {
    flexDirection:'row', justifyContent:'space-between',
    alignItems:'center', backgroundColor:'#fff',
    padding:12, borderRadius:5, marginVertical:6,
  },
  remove:    { color:'#FF4D4D', fontSize:18 },
  saveBtn:   { marginTop:30 },
});