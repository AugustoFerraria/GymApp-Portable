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

  const bgScreen    = isDark ? '#0B0F14' : '#FFFFFF';
  const inputBg     = isDark ? '#131922' : '#FFFFFF';
  const textColor   = isDark ? '#FFFFFF' : '#111827';
  const placeholder = isDark ? '#9AA4B2' : '#666666';
  const borderColor = isDark ? '#1F2937' : '#DDDDDD';

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
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      <View style={styles.container}>
        <TextInput
          placeholder="Nombre"
          placeholderTextColor={placeholder}
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <TextInput
          placeholder="Descripción (opcional)"
          placeholderTextColor={placeholder}
          value={description}
          onChangeText={setDesc}
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <Button title="Guardar cambios" onPress={onSave} color="#FFD700" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});