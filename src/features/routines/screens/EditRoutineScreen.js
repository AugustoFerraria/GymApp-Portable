import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { getExercises } from '../../exercises/data/exerciseRepository';
import { ROUTINE_ROUTES } from '../../../shared/navigation/routeNames';
import { useAppTheme } from '../../../shared/theme/ThemeContext';
import ExercisePickerModal from '../components/ExercisePickerModal';
import RoutineExerciseEditModal from '../components/RoutineExerciseEditModal';
import RoutineExerciseRow from '../components/RoutineExerciseRow';
import { getRoutines, updateRoutine } from '../data/routineRepository';

export default function EditRoutineScreen({ route, navigation }) {
  const { routineId } = route.params;
  const { isDark } = useAppTheme();

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
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = useRef(false);

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
          color="#fff"
          size={28}
          style={{ marginRight: 16 }}
          onPress={() => navigation.navigate(ROUTINE_ROUTES.CREATE_EXERCISE)}
        />
      ),
    });
  }, [navigation]);

  // Refrescar el catálogo al volver de crear un ejercicio.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const exercises = await getExercises();
        if (isActive) {
          setAllExercises(
            exercises.map(exercise => ({
              label: exercise.name,
              value: exercise.id,
            }))
          );
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Cargar la rutina que se está editando.
  useEffect(() => {
    let isActive = true;

    (async () => {
      const routines = await getRoutines();
      const rt = routines.find(r => r.id === routineId);
      if (!isActive) return;

      if (!rt) {
        Alert.alert('Error', 'Rutina no encontrada');
        navigation.goBack();
        return;
      }
      setNombre(rt.name);
      setDescripcion(rt.description || '');
      setRoutineExercises(rt.exercises);
    })();

    return () => {
      isActive = false;
    };
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
    <RoutineExerciseRow
      item={item}
      drag={drag}
      isActive={isActive}
      backgroundColor={cardBg}
      borderColor={borderColor}
      textColor={labelColor}
      mutedColor={placeholder}
      repetitionsLabel="reps"
      onEdit={openEdit}
      onRemove={handleRemove}
    />
  );

  const handleSave = async () => {
    if (!nombre.trim() || routineExercises.length === 0) {
      return Alert.alert('Atención', 'Nombre y al menos un ejercicio son obligatorios.');
    }
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setSubmitting(true);
    const updated = {
      id:          routineId,
      name:        nombre.trim(),
      description: descripcion.trim(),
      exercises:   routineExercises,
    };
    try {
      await updateRoutine(updated);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la rutina. Intenta nuevamente.');
    } finally {
      isSubmitting.current = false;
      setSubmitting(false);
    }
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
              <Icon name="keyboard-arrow-down" color={placeholder} size={24} />
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
              <Button
                title="Guardar cambios"
                onPress={handleSave}
                color={borderColor}
                disabled={submitting}
              />
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <ExercisePickerModal
        visible={selectVisible}
        exercises={allExercises}
        onSelect={exerciseId => {
          setSeleccion(exerciseId);
          setSelectVisible(false);
        }}
        onClose={() => setSelectVisible(false)}
        cardBackground={cardBg}
        modalBackground={inputBg}
        borderColor={borderColor}
        textColor={labelColor}
        mutedColor={placeholder}
      />

      <RoutineExerciseEditModal
        visible={editVisible}
        exercise={editingItem}
        series={editSeries}
        repetitions={editReps}
        onSeriesChange={setEditSeries}
        onRepetitionsChange={setEditReps}
        onSave={saveEdit}
        onClose={() => setEditVisible(false)}
        backgroundColor={inputBg}
        borderColor={borderColor}
        textColor={labelColor}
        mutedColor={placeholder}
        inputColor={inputColor}
      />
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
  saveBtn:         { marginTop: 10 },
});