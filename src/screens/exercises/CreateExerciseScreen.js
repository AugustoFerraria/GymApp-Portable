import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { saveExercise } from '../../services/storageService';;

const CreateExerciseScreen = ({ navigation, route }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Alert.alert('Atención', 'El nombre es obligatorio.');
      return;
    }
    const nuevo = {
      id: Date.now().toString(),
      name: nombre,
      description: descripcion,
    };
    await saveExercise(nuevo);
    route.params?.onGoBack(); 
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre del ejercicio"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.input}
      />
      <Button title="Crear ejercicio" onPress={handleCrear} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: {
    height: 40, 
    backgroundColor: '#fff', 
    borderColor: '#ddd', 
    borderWidth: 1, 
    marginBottom: 12, 
    paddingHorizontal: 8
  },
});

export default CreateExerciseScreen;