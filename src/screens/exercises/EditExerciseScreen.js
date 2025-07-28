import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, StyleSheet, Alert
} from 'react-native';
import { updateExercise } from '../../services/storageService';

export default function EditExerciseScreen({ route, navigation }) {
  const { exercise } = route.params;
  const [name, setName]         = useState('');
  const [description, setDesc]  = useState('');

  useEffect(() => {
    setName(exercise.name);
    setDesc(exercise.description || '');
  }, [exercise]);

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atención', 'El nombre es obligatorio.');
      return;
    }
    const updated = { ...exercise, name: name.trim(), description: description.trim() };
    await updateExercise(updated);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDesc}
        style={styles.input}
      />
      <Button title="Guardar cambios" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 16, justifyContent:'center' },
  input:     {
    borderWidth:1, borderColor:'#ddd',
    padding:8, marginBottom:12, borderRadius:4
  }
});