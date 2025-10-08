// src/screens/exercises/CreateExerciseScreen.js
import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { saveExercise } from '../../services/storageService';
import { ThemeContext } from '../../context/ThemeContext';

export default function CreateExerciseScreen({ navigation, route }) {
  const { isDark } = useContext(ThemeContext);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const bgScreen       = isDark ? '#0B0F14' : '#FFFFFF';
  const inputBg        = isDark ? '#131922' : '#FFFFFF';
  const textColor      = isDark ? '#FFFFFF' : '#111827';
  const placeholder    = isDark ? '#9AA4B2' : '#666666';
  const borderColor    = isDark ? '#1F2937' : '#DDDDDD';

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
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      <View style={styles.container}>
        <TextInput
          placeholder="Nombre del ejercicio"
          placeholderTextColor={placeholder}
          value={nombre}
          onChangeText={setNombre}
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <TextInput
          placeholder="Descripción (opcional)"
          placeholderTextColor={placeholder}
          value={descripcion}
          onChangeText={setDescripcion}
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <Button title="Crear ejercicio" onPress={handleCrear} color="#FFD700" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: {
    height: 44,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
  },
});