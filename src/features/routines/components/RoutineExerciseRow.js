import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

export default function RoutineExerciseRow({
  item,
  drag,
  isActive,
  backgroundColor,
  borderColor,
  textColor,
  mutedColor,
  repetitionsLabel,
  onEdit,
  onRemove,
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          opacity: isActive ? 0.92 : 1,
        },
      ]}
    >
      <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
        <Icon name="drag-handle" color={mutedColor} size={24} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.cardText, { color: textColor }]}>
          {item.name} — {item.series} series – {item.reps} {repetitionsLabel}
        </Text>
      </View>

      <TouchableOpacity onPress={() => onEdit(item)} style={styles.editButton}>
        <Icon name="edit" color="#2E86FF" size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeButton}>
        <Text style={styles.remove}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  dragHandle: { paddingRight: 8 },
  content: { flex: 1, paddingRight: 8 },
  cardText: { fontSize: 16 },
  editButton: { paddingHorizontal: 6 },
  removeButton: { paddingLeft: 6 },
  remove: { color: '#FF4D4D', fontSize: 18 },
});