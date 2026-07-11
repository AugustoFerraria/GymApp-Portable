import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import ExerciseForm from '../components/ExerciseForm';
import { saveExercise } from '../data/exerciseRepository';

export default function CreateExerciseScreen({ navigation, route }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = useRef(false);

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Alert.alert('Atención', 'El nombre es obligatorio.');
      return;
    }
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setSubmitting(true);
    const nuevo = {
      id: Date.now().toString(),
      name: nombre,
      description: descripcion,
    };
    try {
      await saveExercise(nuevo);
      route.params?.onGoBack();
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el ejercicio. Intenta nuevamente.');
    } finally {
      isSubmitting.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ExerciseForm
      name={nombre}
      description={descripcion}
      onChangeName={setNombre}
      onChangeDescription={setDescripcion}
      onSubmit={handleCrear}
      submitLabel="Crear ejercicio"
      namePlaceholder="Nombre del ejercicio"
      inputHeight={44}
      disabled={submitting}
    />
  );
}
