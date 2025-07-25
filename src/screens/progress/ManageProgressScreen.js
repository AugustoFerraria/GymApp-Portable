import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getProgresses,
  getExercises,
  deleteProgress,
  updateProgress,
} from '../../services/storageService';

export default function ManageProgressScreen() {
  const [progresses, setProgresses] = useState([]);
  const [exMap, setExMap]           = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue]   = useState('');

  // Carga datos al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const progs = await getProgresses();
        setProgresses(progs);
        const exArr = await getExercises();
        const map = {};
        exArr.forEach(ex => { map[ex.id] = ex.name; });
        setExMap(map);
      })();
    }, [])
  );

  // Genera una clave única para cada progreso
  const makeKey = p => `${p.exerciseId}__${p.date}`;

  const handleDelete = item => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Eliminar este progreso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteProgress(item);
            setProgresses(updated);
          },
        },
      ]
    );
  };

  const handleStartEdit = item => {
    setEditingKey(makeKey(item));
    setEditValue(
      item.weight != null
        ? String(item.weight)
        : String(item.reps)
    );
  };

  const handleSaveEdit = async item => {
    const newNum = parseFloat(editValue);
    if (isNaN(newNum)) {
      Alert.alert('Valor inválido');
      return;
    }
    const newValues = item.weight != null
      ? { weight: newNum }
      : { reps: newNum };
    const allUpdated = await updateProgress(item, newValues);
    setProgresses(allUpdated);
    setEditingKey(null);
    setEditValue('');
  };

  const renderItem = ({ item }) => {
    const key     = makeKey(item);
    const exName  = exMap[item.exerciseId] || 'Sin nombre';
    const dateStr = new Date(item.date).toLocaleDateString();
    const valStr  = item.weight != null
      ? `${item.weight} kg`
      : `${item.reps} reps`;
    const isEditing = editingKey === key;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{exName}</Text>
        <Text style={styles.sub}>{dateStr}</Text>

        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editValue}
            onChangeText={setEditValue}
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.value}>{valStr}</Text>
        )}

        <View style={styles.actions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => handleSaveEdit(item)}
              >
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingKey(null)}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleStartEdit(item)}
              >
                <Text style={styles.btnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.btnText}>Eliminar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={progresses}
      keyExtractor={item => makeKey(item)}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay progresos guardados</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius:    8,
    padding:         12,
    marginBottom:    12,
    elevation:       2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  sub: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  value: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontSize: 16,
    marginVertical: 8,
  },
  actions: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    marginTop:      8,
  },
  editBtn: {
    marginRight: 12,
  },
  delBtn: {
    marginRight: 0,
  },
  saveBtn: {
    marginRight: 12,
  },
  cancelBtn: {},
  btnText: {
    color: '#FFD700',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color:     '#666',
    marginTop: 32,
    fontSize:  16,
  },
});