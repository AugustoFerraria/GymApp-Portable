import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import ExerciseForm from '../components/ExerciseForm';
import { updateExercise } from '../data/exerciseRepository';

export default function EditExerciseScreen({ route, navigation }) {
  const { exercise } = route.params;

  const [name, setName] = useState('');
  const [description, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = useRef(false);

  useEffect(() => {
    setName(exercise.name);
    setDesc(exercise.description || '');
  }, [exercise]);

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atención', 'El nombre es obligatorio.');
      return;
    }
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setSubmitting(true);
    const updated = {
      ...exercise,
      name: name.trim(),
      description: description.trim(),
    };
    try {
      await updateExercise(updated);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el ejercicio. Intenta nuevamente.');
    } finally {
      isSubmitting.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ExerciseForm
      name={name}
      description={description}
      onChangeName={setName}
      onChangeDescription={setDesc}
      onSubmit={onSave}
      submitLabel="Guardar cambios"
      namePlaceholder="Nombre"
      disabled={submitting}
    />
  );
}