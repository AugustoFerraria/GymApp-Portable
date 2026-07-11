import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExercisePickerModal({
  visible,
  exercises,
  onSelect,
  onClose,
  cardBackground,
  modalBackground,
  borderColor,
  textColor,
  mutedColor,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: modalBackground, borderColor },
          ]}
        >
          <Text style={[styles.title, { color: textColor }]}>Selecciona ejercicio</Text>
          <FlatList
            data={exercises}
            keyExtractor={item => String(item.value)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  { backgroundColor: cardBackground, borderColor },
                ]}
                onPress={() => onSelect(item.value)}
              >
                <Text style={{ color: textColor }}>{item.label}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ color: mutedColor }}>Cerrar</Text>
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
  option: { borderWidth: 1, borderRadius: 10, padding: 12 },
  separator: { height: 8 },
  list: { paddingVertical: 8 },
  actions: { alignItems: 'flex-end' },
  closeButton: { padding: 8 },
});
