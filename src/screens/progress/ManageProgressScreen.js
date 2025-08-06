// src/screens/progress/ManageProgressScreen.js
import React, { useState, useCallback, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import {
  getProgresses,
  getExercises,
  deleteProgress,
  updateProgress,
} from '../../services/storageService';
import { ThemeContext } from '../../context/ThemeContext';

export default function ManageProgressScreen() {
  const { isDark } = useContext(ThemeContext);
  const [allProgresses, setAllProgresses] = useState([]);
  const [exercises, setExercises]         = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [editingKey, setEditingKey]       = useState(null);
  const [editWeight, setEditWeight]       = useState('');
  const [editReps, setEditReps]           = useState('');

  // Colores dinámicos
  const bgScreen         = isDark ? '#414141' : '#fff';
  const filterBg         = isDark ? '#616161' : '#f9f9f9';
  const cardBg           = isDark ? '#616161' : '#fff';
  const labelColor       = isDark ? '#fff'   : '#000';
  const subTextColor     = isDark ? '#ccc'   : '#666';
  const inputBg          = isDark ? '#616161' : '#fff';
  const inputTextColor   = isDark ? '#fff'   : '#000';
  const placeholderColor = isDark ? '#ccc'   : '#666';
  const borderColor      = '#FFD700';

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setAllProgresses(await getProgresses());
        setExercises(await getExercises());
      })();
    }, [])
  );

  const makeKey = p => `${p.exerciseId}__${p.date}`;
  const displayed = allProgresses
    .filter(p => !selectedExercise || p.exerciseId === selectedExercise)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
            setAllProgresses(await deleteProgress(item));
          },
        },
      ]
    );
  };

  const handleEditStart = item => {
    const key = makeKey(item);
    setEditingKey(key);
    setEditWeight(String(item.weight));
    setEditReps(String(item.reps));
  };

  const handleEditSave = async item => {
    const w = parseFloat(editWeight);
    if (!editWeight.trim() || isNaN(w)) {
      return Alert.alert('Atención', 'Debes ingresar un peso válido.');
    }
    const r = parseInt(editReps, 10);
    if (!editReps.trim() || isNaN(r)) {
      return Alert.alert('Atención', 'Debes ingresar repeticiones válidas.');
    }
    setAllProgresses(await updateProgress(item, { weight: w, reps: r }));
    setEditingKey(null);
  };

  // Etiqueta del dropdown
  const displayLabel = selectedExercise
    ? exercises.find(e => e.id === selectedExercise)?.name
    : 'Todos los ejercicios';

  const renderItem = ({ item }) => {
    const key  = makeKey(item);
    const name = exercises.find(e => e.id === item.exerciseId)?.name || '—';
    const date = new Date(item.date).toLocaleDateString();
    const isEd = editingKey === key;

    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.title, { color: labelColor }]}>{name}</Text>
        <Text style={[styles.sub, { color: subTextColor }]}>{date}</Text>

        {isEd ? (
          <>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: inputTextColor }]}
              value={editWeight}
              onChangeText={setEditWeight}
              keyboardType="numeric"
              placeholder="Peso"
              placeholderTextColor={placeholderColor}
            />
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: inputTextColor }]}
              value={editReps}
              onChangeText={setEditReps}
              keyboardType="numeric"
              placeholder="Repeticiones"
              placeholderTextColor={placeholderColor}
            />
          </>
        ) : (
          <Text style={[styles.value, { color: labelColor }]}>
            {item.weight} kg — {item.reps} reps
          </Text>
        )}

        <View style={styles.actions}>
          {isEd ? (
            <>
              <TouchableOpacity onPress={() => handleEditSave(item)}>
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingKey(null)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => handleEditStart(item)}>
                <Text style={styles.btnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Text style={[styles.btnText, styles.deleteText]}>Eliminar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      {/* filtro con dropdown custom */}
      <View style={[styles.filters, { backgroundColor: filterBg }]}>
        <TouchableOpacity
          style={[
            styles.dropdownBtn,
            { backgroundColor: inputBg, borderColor }
          ]}
          onPress={() => setDropdownOpen(o => !o)}
        >
          <Text
            style={[
              styles.dropdownBtnText,
              { color: selectedExercise ? inputTextColor : placeholderColor }
            ]}
          >
            {displayLabel}
          </Text>
          <Icon
            name={dropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            type="material"
            color={placeholderColor}
            size={24}
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <ScrollView
            style={[styles.dropdownContainer, { backgroundColor: bgScreen, borderColor }]}
            nestedScrollEnabled
          >
            {exercises.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.dropdownItem, { backgroundColor: cardBg }]}
                onPress={() => {
                  setSelectedExercise(opt.id);
                  setDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: labelColor }]}>
                  {opt.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={makeKey}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: subTextColor }]}>
            No hay progresos
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1 },
  filters: { padding: 16 },
  list:    { padding: 16 },

  dropdownBtn: {
    flexDirection: 'row',
    justifyContent:  'space-between',
    alignItems:     'center',
    borderWidth:    1,
    borderRadius:   10,
    paddingVertical:12,
    paddingHorizontal:12,
  },
  dropdownBtnText: { fontSize:16 },
  dropdownContainer: {
    marginTop:4,
    borderWidth:1,
    borderRadius:15,
    maxHeight:350,
  },
  dropdownItem:     { paddingVertical:12, paddingHorizontal:12, borderBottomWidth:1, borderBottomColor:'#888' },
  dropdownItemText: { fontSize:16 },

  card:      { borderWidth:1, borderRadius:8, padding:12, marginBottom:12, elevation:2 },
  title:     { fontSize:18, fontWeight:'600' },
  sub:       { fontSize:14, marginVertical:4 },
  value:     { fontSize:16, marginVertical:8 },

  input:     { borderBottomWidth:1, borderBottomColor:'#888', marginVertical:8, paddingVertical:4, fontSize:16 },
  actions:   { flexDirection:'row', justifyContent:'flex-end', marginTop:8 },
  btnText:   { color:'#FFD700', marginLeft:12, fontWeight:'600' },
  deleteText:{ color:'#FF4D4D' },

  empty:     { textAlign:'center', marginTop:32 },
});