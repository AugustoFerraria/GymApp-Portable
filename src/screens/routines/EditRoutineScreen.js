// src/screens/routines/EditRoutineScreen.js
import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { getExercises, getRoutines, updateRoutine } from '../../services/storageService';
import { ThemeContext } from '../../context/ThemeContext';

export default function EditRoutineScreen({ route, navigation }) {
  const { routineId } = route.params;
  const { isDark }    = useContext(ThemeContext);

  const [nombre, setNombre]                     = useState('');
  const [descripcion, setDescripcion]           = useState('');
  const [allExercises, setAllExercises]         = useState([]); // [{label, value}]
  const [seleccion, setSeleccion]               = useState(null);
  const [seriesInput, setSeriesInput]           = useState('');
  const [repsInput, setRepsInput]               = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);

  // Modales
  const [selectVisible, setSelectVisible] = useState(false);
  const [editVisible, setEditVisible]     = useState(false);

  // Edición de ítem
  const [editingItem, setEditingItem] = useState(null);
  const [editSeries, setEditSeries]   = useState('');
  const [editReps, setEditReps]       = useState('');

  // Colores
  const bgScreen = isDark ? "#0B0F14" : "#FFFFFF";
  const cardBg = isDark ? "#131922" : "#FFFFFF";
  const labelColor = isDark ? "#E6E6E6" : "#111827";
  const borderColor = "#FFD700";
  const inputBg = isDark ? "#1A1F29" : "#FFFFFF";
  const inputColor = isDark ? "#F3F4F6" : "#111827";
  const placeholder = isDark ? "#fff" : "#666666";

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle:     { backgroundColor: '#FFD700' },
      headerTintColor: '#fff',
      headerRight: () => (
        <Icon
          name="add"
          type="material"
          color="#fff"
          size={28}
          containerStyle={{ marginRight: 16 }}
          onPress={() => navigation.navigate('CrearEjercicio')}
        />
      ),
    });
  }, [navigation]);

  // Cargar datos
  useEffect(() => {
    (async () => {
      const exArr = await getExercises();
      setAllExercises(exArr.map(e => ({ label: e.name, value: e.id })));

      const routines = await getRoutines();
      const rt = routines.find(r => r.id === routineId);
      if (!rt) {
        Alert.alert('Error', 'Rutina no encontrada');
        navigation.goBack();
        return;
      }
      setNombre(rt.name);
      setDescripcion(rt.description || '');
      setRoutineExercises(rt.exercises);
    })();
  }, [navigation, routineId]);

  const displayLabel = seleccion
    ? allExercises.find(e => e.value === seleccion)?.label
    : 'Selecciona ejercicio';

  const handleAddExercise = () => {
    const s = parseInt(seriesInput, 10);
    const r = parseInt(repsInput, 10);
    if (!seleccion || isNaN(s) || s <= 0 || isNaN(r) || r <= 0) {
      return Alert.alert('Atención', 'Selecciona ejercicio, series y repeticiones válidas.');
    }
    if (routineExercises.some(e => e.id === seleccion)) {
      return Alert.alert('Atención', 'Ese ejercicio ya está en la rutina.');
    }
    const { label } = allExercises.find(e => e.value === seleccion);
    setRoutineExercises(prev => [...prev, { id: seleccion, name: label, series: s, reps: r }]);
    setSeleccion(null);
    setSeriesInput('');
    setRepsInput('');
  };

  const handleRemove = (id) =>
    setRoutineExercises(prev => prev.filter(e => e.id !== id));

  const openEdit = (item) => {
    setEditingItem(item);
    setEditSeries(String(item.series ?? ''));
    setEditReps(String(item.reps ?? ''));
    setEditVisible(true);
  };

  const saveEdit = () => {
    const s = parseInt(editSeries, 10);
    const r = parseInt(editReps, 10);
    if (isNaN(s) || s <= 0 || isNaN(r) || r <= 0) {
      return Alert.alert('Atención', 'Series y repeticiones deben ser válidas.');
    }
    setRoutineExercises(prev => prev.map(x => (x.id === editingItem.id ? { ...x, series: s, reps: r } : x)));
    setEditVisible(false);
    setEditingItem(null);
  };

  const onDragEnd = useCallback(({ data }) => {
    setRoutineExercises(data);
  }, []);

  const renderRow = ({ item, drag, isActive }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor, opacity: isActive ? 0.92 : 1 },
      ]}
    >
      <TouchableOpacity onLongPress={drag} style={{ paddingRight: 8 }}>
        <Icon name="drag-handle" type="material" color={placeholder} />
      </TouchableOpacity>

      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={[styles.cardText, { color: labelColor }]}>
          {item.name} — {item.series} series – {item.reps} reps
        </Text>
      </View>

      <TouchableOpacity onPress={() => openEdit(item)} style={{ paddingHorizontal: 6 }}>
        <Icon name="edit" type="material" color="#2E86FF" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleRemove(item.id)} style={{ paddingLeft: 6 }}>
        <Text style={styles.remove}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSave = async () => {
    if (!nombre.trim() || routineExercises.length === 0) {
      return Alert.alert('Atención', 'Nombre y al menos un ejercicio son obligatorios.');
    }
    const updated = {
      id:          routineId,
      name:        nombre.trim(),
      description: descripcion.trim(),
      exercises:   routineExercises,
    };
    await updateRoutine(updated);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      <DraggableFlatList
        data={routineExercises}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRow}
        onDragEnd={onDragEnd}
        activationDistance={6}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={[styles.container, { backgroundColor: bgScreen }]}>
            <Text style={[styles.label, { color: labelColor }]}>Nombre:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor, color: inputColor }]}
              placeholder="Nombre"
              placeholderTextColor={placeholder}
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={[styles.label, { color: labelColor }]}>Descripción:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor, color: inputColor }]}
              placeholder="Descripción (opcional)"
              placeholderTextColor={placeholder}
              value={descripcion}
              onChangeText={setDescripcion}
            />

            <Text style={[styles.label, { color: labelColor }]}>Agregar ejercicio:</Text>

            {/* Selector mediante Modal */}
            <TouchableOpacity
              style={[styles.dropdownBtn, { backgroundColor: inputBg, borderColor }]}
              onPress={() => setSelectVisible(true)}
            >
              <Text style={{ color: seleccion ? inputColor : placeholder }}>
                {displayLabel}
              </Text>
              <Icon name="keyboard-arrow-down" type="material" color={placeholder} size={24} />
            </TouchableOpacity>

            <View style={styles.row}>
              <TextInput
                style={[styles.smallInput, { backgroundColor: inputBg, borderColor, color: inputColor }]}
                placeholder="Series"
                placeholderTextColor={placeholder}
                keyboardType="numeric"
                value={seriesInput}
                onChangeText={setSeriesInput}
              />
              <TextInput
                style={[styles.smallInput, { backgroundColor: inputBg, borderColor, color: inputColor }]}
                placeholder="Reps"
                placeholderTextColor={placeholder}
                keyboardType="numeric"
                value={repsInput}
                onChangeText={setRepsInput}
              />
            </View>

            <View style={styles.btnWrapper}>
              <Button title="＋ Agregar ejercicio" onPress={handleAddExercise} color={borderColor} />
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={[styles.container, { backgroundColor: bgScreen }]}>
            <View style={styles.saveBtn}>
              <Button title="Guardar cambios" onPress={handleSave} color={borderColor} />
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* Modal de selección de ejercicio */}
      <Modal visible={selectVisible} transparent animationType="fade" onRequestClose={() => setSelectVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: inputBg, borderColor }]}>
            <Text style={[styles.modalTitle, { color: labelColor }]}>Selecciona ejercicio</Text>
            <FlatList
              data={allExercises}
              keyExtractor={(it) => String(it.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, { backgroundColor: cardBg, borderColor }]}
                  onPress={() => { setSeleccion(item.value); setSelectVisible(false); }}
                >
                  <Text style={{ color: labelColor }}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingVertical: 8 }}
              keyboardShouldPersistTaps="handled"
            />
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => setSelectVisible(false)} style={{ padding: 8 }}>
                <Text style={{ color: placeholder }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de edición */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: inputBg, borderColor }]}>
            <Text style={[styles.modalTitle, { color: labelColor }]}>Editar ejercicio</Text>
            <Text style={{ color: labelColor, marginBottom: 8 }}>{editingItem?.name}</Text>

            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor, color: inputColor }]}
              placeholder="Series"
              placeholderTextColor={placeholder}
              keyboardType="numeric"
              value={editSeries}
              onChangeText={setEditSeries}
            />
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor, color: inputColor }]}
              placeholder="Repeticiones"
              placeholderTextColor={placeholder}
              keyboardType="numeric"
              value={editReps}
              onChangeText={setEditReps}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={{ padding: 8 }}>
                <Text style={{ color: placeholder }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={{ padding: 8 }}>
                <Text style={{ color: '#2E86FF', fontWeight: '700' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1 },
  container:       { padding: 20 },
  label:           { fontSize: 16, marginBottom: 8 },
  input:           { borderWidth: 1, borderRadius: 10, padding: 8, marginBottom: 16 },
  dropdownBtn:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 12, marginBottom: 12 },
  row:             { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  smallInput:      { flex: 1, borderWidth: 1, borderRadius: 10, padding: 8, marginRight: 8 },
  btnWrapper:      { marginTop: 8, marginBottom: 16 },
  card:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, padding: 12, marginVertical: 6 },
  cardText:        { fontSize: 16 },
  remove:          { color: '#FF4D4D', fontSize: 18 },
  saveBtn:         { marginTop: 10 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalCard:     { borderWidth: 1, borderRadius: 12, padding: 16, maxHeight: '80%' },
  modalTitle:    { fontSize: 18, fontWeight: '700', marginBottom: 8 },

  optionItem: { borderWidth: 1, borderRadius: 10, padding: 12 },
});