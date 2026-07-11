import React from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RoutineExerciseEditModal({
  visible,
  exercise,
  series,
  repetitions,
  onSeriesChange,
  onRepetitionsChange,
  onSave,
  onClose,
  backgroundColor,
  borderColor,
  textColor,
  mutedColor,
  inputColor,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor, borderColor }]}>
          <Text style={[styles.title, { color: textColor }]}>Editar ejercicio</Text>
          <Text style={[styles.exerciseName, { color: textColor }]}>
            {exercise?.name}
          </Text>

          <TextInput
            style={[
              styles.input,
              { backgroundColor, borderColor, color: inputColor },
            ]}
            placeholder="Series"
            placeholderTextColor={mutedColor}
            keyboardType="numeric"
            value={series}
            onChangeText={onSeriesChange}
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor, borderColor, color: inputColor },
            ]}
            placeholder="Repeticiones"
            placeholderTextColor={mutedColor}
            keyboardType="numeric"
            value={repetitions}
            onChangeText={onRepetitionsChange}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.actionButton}>
              <Text style={{ color: mutedColor }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} style={styles.actionButton}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  exerciseName: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginBottom: 16,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  actionButton: { padding: 8 },
  saveText: { color: '#2E86FF', fontWeight: '700' },
});
