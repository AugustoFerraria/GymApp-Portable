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

  const bgGray = '#414141';
  const inputBg = '#fff';
  const textColor = isDark ? '#000' : '#000';
  const borderColor = isDark ? '#666' : '#ddd';

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
    <SafeAreaView style={[styles.safe, { backgroundColor: bgGray }]}>
      <View style={styles.container}>
        <TextInput
          placeholder="Nombre del ejercicio"
          placeholderTextColor="#666"
          value={nombre}
          onChangeText={setNombre}
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <TextInput
          placeholder="Descripción (opcional)"
          placeholderTextColor="#666"
          value={descripcion}
          onChangeText={setDescripcion}
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <Button title="Crear ejercicio" onPress={handleCrear} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});