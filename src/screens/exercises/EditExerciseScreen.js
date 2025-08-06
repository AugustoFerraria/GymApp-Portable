// src/screens/exercises/EditExerciseScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { updateExercise } from '../../services/storageService';
import { ThemeContext } from '../../context/ThemeContext';

export default function EditExerciseScreen({ route, navigation }) {
  const { exercise } = route.params;
  const { isDark } = useContext(ThemeContext);

  const [name, setName] = useState('');
  const [description, setDesc] = useState('');

  const bgGray = '#414141';
  const inputBg = '#fff';
  const textColor = isDark ? '#000' : '#000';
  const borderColor = isDark ? '#666' : '#ddd';

  useEffect(() => {
    setName(exercise.name);
    setDesc(exercise.description || '');
  }, [exercise]);

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atención', 'El nombre es obligatorio.');
      return;
    }
    const updated = {
      ...exercise,
      name: name.trim(),
      description: description.trim(),
    };
    await updateExercise(updated);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgGray }]}>
      <View style={styles.container}>
        <TextInput
          placeholder="Nombre"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <TextInput
          placeholder="Descripción (opcional)"
          placeholderTextColor="#666"
          value={description}
          onChangeText={setDesc}
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <Button title="Guardar cambios" onPress={onSave} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
});