import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, ScrollView } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

const EditRoutineScreen = ({ route, navigation }) => {
  const { routineId } = route.params;
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [sets, setSets] = useState('');
  const [notes, setNotes] = useState('');
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token,
          },
        };
        const response = await axios.get(`http://localhost:3001/api/routines/${routineId}`, config);
        setRoutine(response.data);
      } catch (error) {
        console.error('Error fetching routine:', error);
      }
    };

    const fetchExercises = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token,
          },
        };
        const response = await axios.get('http://localhost:3001/api/exercises/all', config);
        setExercises(response.data.map(exercise => ({ label: exercise.name, value: exercise._id })));
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchRoutine();
    fetchExercises();
  }, [routineId]);

  const handleAddExercise = () => {
    if (selectedExercise && quantity) {
      setRoutine(prevRoutine => ({
        ...prevRoutine,
        exercises: [
          ...prevRoutine.exercises,
          { exerciseId: selectedExercise, quantity: parseInt(quantity, 10), sets: parseInt(sets, 10) || 1, notes: notes || '' }
        ],
      }));
      setSelectedExercise(null);
      setQuantity('');
      setSets('');
      setNotes('');
    }
  };

  const handleSaveRoutine = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.put(`http://localhost:3001/api/routines/${routineId}`, routine, config);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  };

  const handleRemoveExercise = (index) => {
    setRoutine(prevRoutine => ({
      ...prevRoutine,
      exercises: prevRoutine.exercises.filter((_, i) => i !== index)
    }));
  };

  if (!routine) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome della routine:</Text>
      <TextInput
        style={styles.input}
        value={routine.name}
        onChangeText={(text) => setRoutine({ ...routine, name: text })}
      />

      <Text style={styles.label}>Descrizione:</Text>
      <TextInput
        style={styles.input}
        value={routine.description}
        onChangeText={(text) => setRoutine({ ...routine, description: text })}
      />

      <Text style={styles.label}>Esercizi:</Text>
      <View style={styles.exerciseTable}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Esercizio</Text>
          <Text style={styles.tableHeaderText}>Ripetizioni</Text>
          <Text style={styles.tableHeaderText}>Serie</Text>
          <Text style={styles.tableHeaderText}>Note</Text>
          <Text style={styles.tableHeaderText}></Text> {/* Columna para el ícono */}
        </View>
        {routine.exercises.map((exercise, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCellText}>{exercise.exerciseId.name}</Text>
            <Text style={styles.tableCellText}>{exercise.quantity}</Text>
            <Text style={styles.tableCellText}>{exercise.sets}</Text>
            <Text style={styles.tableCellText}>{exercise.notes}</Text>
            <IconButton
              icon="delete"
              color="#FF0000"
              size={20}
              onPress={() => handleRemoveExercise(index)}
            />
          </View>
        ))}
      </View>

      <DropDownPicker
        open={openDropdown}
        value={selectedExercise}
        items={exercises}
        setOpen={setOpenDropdown}
        setValue={setSelectedExercise}
        placeholder="Seleziona esercizio"
        style={styles.dropdown}
      />
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Ripetizioni"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={sets}
        onChangeText={setSets}
        placeholder="Serie"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        placeholder="Note"
      />
      <Button mode="contained" onPress={handleAddExercise} style={styles.addButton}>
        Aggiungi esercizio
      </Button>

      <Button mode="contained" onPress={handleSaveRoutine} style={styles.saveButton}>
        Salva Routine
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  label: {
    fontSize: 16,
    color: '#151515',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    marginBottom: 16,
  },
  dropdown: {
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  exerciseTable: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    backgroundColor: "#FFD700",
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  tableCellText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    marginBottom: 16,
    backgroundColor: '#007BFF',
  },
  saveButton: {
    backgroundColor: '#FFD700',
  },
});

export default EditRoutineScreen;