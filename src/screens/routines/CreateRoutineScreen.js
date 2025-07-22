import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView, Alert
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { getExercises, saveRoutine } from '../../services/storageService';

const CreateRoutineScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ejercicios, setEjercicios] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    (async () => {
      const arr = await getExercises();
      setEjercicios(arr.map(e => ({ label: e.name, value: e.id })));
    })();
  }, []);

  const handleCrear = async () => {
    if (!nombre || !seleccion) {
      Alert.alert('Atención', 'Falta nombre o ejercicio.');
      return;
    }
    const nueva = {
      id: Date.now().toString(),
      name: nombre,
      description: descripcion,
      exercises: [seleccion],
    };
    await saveRoutine(nueva);
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

      <Text style={styles.label}>Ejercicio principal:</Text>
      <DropDownPicker
        open={dropdownOpen}
        value={seleccion}
        items={ejercicios}
        setOpen={setDropdownOpen}
        setValue={setSeleccion}
        style={styles.picker}
      />

      <Button title="Crear rutina" onPress={handleCrear} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    borderColor: '#FFD700', borderWidth: 1,
    borderRadius: 5, padding: 8, marginBottom: 16
  },
  picker: { marginBottom: 16 },
});

export default CreateRoutineScreen;