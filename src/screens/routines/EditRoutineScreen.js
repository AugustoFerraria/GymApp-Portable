// src/screens/routines/EditRoutineScreen.js
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useContext,
} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import { getExercises, getRoutines, updateRoutine } from '../../services/storageService';
import { ThemeContext } from '../../context/ThemeContext';

export default function EditRoutineScreen({ route, navigation }) {
  const { routineId } = route.params;
  const { isDark } = useContext(ThemeContext);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [allExercises, setAllExercises] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [repsInput, setRepsInput] = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const bgScreen    = isDark ? '#414141' : '#fff';
  const cardBg      = isDark ? '#616161' : '#fff';
  const labelColor  = isDark ? '#fff' : '#000';
  const borderColor = '#FFD700';
  const inputBg       = isDark ? '#616161' : '#fff';
  const inputColor= isDark ? '#fff'   : '#000';
  const placeholder = isDark ? '#ccc' : '#666';

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

  useEffect(() => {
    (async () => {
      const exArr = await getExercises();
      setAllExercises(exArr.map(e => ({ label: e.name, value: e.id })));
      const routines = await getRoutines();
      const rt = routines.find(r => r.id === routineId);
      if (!rt) {
        Alert.alert('Error', 'Rutina no encontrada');
        navigation.goBack();
      } else {
        setNombre(rt.name);
        setDescripcion(rt.description || '');
        setRoutineExercises(rt.exercises);
      }
    })();
  }, [navigation, routineId]);

  const handleAddExercise = () => {
    if (!seleccion || !repsInput) {
      return Alert.alert('Atención', 'Selecciona ejercicio y repeticiones.');
    }
    if (routineExercises.some(e => e.id === seleccion)) {
      return Alert.alert('Atención', 'Ejercicio ya agregado');
    }
    const { label, value } = allExercises.find(e => e.value === seleccion);
    setRoutineExercises([
      ...routineExercises,
      { id: value, name: label, reps: parseInt(repsInput, 10) },
    ]);
    setSeleccion(null);
    setRepsInput('');
  };

  const handleRemove = id =>
    setRoutineExercises(routineExercises.filter(e => e.id !== id));

  const handleSave = async () => {
    if (!nombre.trim() || routineExercises.length === 0) {
      return Alert.alert(
        'Atención',
        'Nombre y al menos un ejercicio son obligatorios'
      );
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

  const displayLabel = seleccion
    ? allExercises.find(e => e.value === seleccion)?.label
    : 'Selecciona ejercicio';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: bgScreen }]}
      >
        <Text style={[styles.label, { color: labelColor }]}>Nombre:</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: inputColor },
          ]}
          placeholder="Nombre"
          placeholderTextColor={placeholder}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={[styles.label, { color: labelColor }]}>Descripción:</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: inputColor },
          ]}
          placeholder="Descripción (opcional)"
          placeholderTextColor={placeholder}
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          Agregar ejercicio:
        </Text>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[
              styles.dropdownBtn,
              { backgroundColor: inputBg, borderColor },
            ]}
            onPress={() => setDropdownOpen(o => !o)}
          >
            <Text
              style={[
                styles.dropdownBtnText,
                { color: seleccion ? inputColor : placeholder },
              ]}
            >
              {displayLabel}
            </Text>
            <Icon
              name={dropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              type="material"
              color={placeholder}
              size={24}
            />
          </TouchableOpacity>

          {dropdownOpen && (
            <ScrollView
              style={[
                styles.dropdownContainer,
                { backgroundColor: bgScreen, borderColor },
              ]}
            >
              {allExercises.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.dropdownItem,
                    { backgroundColor: cardBg },
                  ]}
                  onPress={() => {
                    setSeleccion(opt.value);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: labelColor },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <TextInput
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor, color: inputColor },
          ]}
          placeholder="Repeticiones"
          placeholderTextColor={placeholder}
          keyboardType="numeric"
          value={repsInput}
          onChangeText={setRepsInput}
        />

        <View style={styles.btnWrapper}>
          <Button
            title="＋ Agregar ejercicio"
            onPress={handleAddExercise}
            color="#FFD700"
          />
        </View>

        {routineExercises.length > 0 && (
          <>
            <Text
              style={[styles.label, { color: labelColor, marginTop: 20 }]}
            >
              Ejercicios:
            </Text>
            {routineExercises.map(e => (
              <View
                key={e.id}
                style={[
                  styles.card,
                  { backgroundColor: cardBg, borderColor },
                ]}
              >
                <Text style={[styles.cardText, { color: labelColor }]}>
                  {e.name} — {e.reps} reps
                </Text>
                <TouchableOpacity onPress={() => handleRemove(e.id)}>
                  <Text style={styles.remove}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <View style={styles.saveBtn}>
          <Button
            title="Guardar cambios"
            onPress={handleSave}
            color="#FFD700"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20 },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginBottom: 16,
  },
  dropdownWrapper: { marginBottom: 16 },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownBtnText: { fontSize: 16 },
  dropdownContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 15,
    maxHeight: 250,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#888',
  },
  dropdownItemText: { fontSize: 16 },
  btnWrapper: { marginTop: 8, marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  cardText: { fontSize: 16 },
  remove: { color: '#FF4D4D', fontSize: 18 },
  saveBtn: { marginTop: 30 },
});