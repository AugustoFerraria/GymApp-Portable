import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

import {
  getExercises,
  getProgress,
  addProgress
} from '../../services/storageService';
import ProgressChart from '../../components/ProgressChart';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const [weight, setWeight]     = useState('');
  const [reps, setReps]         = useState('');
  const [exercises, setExercises]         = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [data, setData]         = useState([]);
  const [isWeightMode, setIsWeightMode] = useState(true);
  const [error, setError]       = useState('');

  // Al ganar foco o cambiar ejercicio, recarga ejercicios y progresos
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const exArr = await getExercises();
          setExercises(exArr);

          if (selectedExercise) {
            const progArr = await getProgress(selectedExercise);
            setData(progArr);
          } else {
            setData([]);
          }
        } catch (e) {
          console.warn(e);
          setError('Error al cargar datos');
        }
      })();
    }, [selectedExercise])
  );

  const handleAdd = async () => {
    const value = isWeightMode ? parseFloat(weight) : parseInt(reps, 10);
    if (isNaN(value) || !selectedExercise) {
      Alert.alert('Por favor ingresa un valor válido y selecciona un ejercicio.');
      return;
    }
    try {
      const entry = {
        date: new Date().toISOString(),
        ...(isWeightMode ? { weight: value } : { reps: value }),
      };
      const updated = await addProgress(selectedExercise, entry);
      setData(updated);
      setWeight('');
      setReps('');
      setError('');
    } catch (e) {
      console.warn(e);
      setError('Error al guardar los datos');
    }
  };

  const renderChart = () => {
    if (!data.length) {
      return <Text style={styles.noDataText}>No hay datos disponibles</Text>;
    }
    return (
      <ProgressChart
        data={data}
        viewMode={isWeightMode ? 'Peso' : 'Repeticiones'}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Marco amarillo superior */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progreso</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Selector de ejercicio */}
        <Picker
          selectedValue={selectedExercise}
          style={styles.picker}
          onValueChange={val => setSelectedExercise(val)}
        >
          <Picker.Item label="Selecciona ejercicio" value="" />
          {exercises.map(ex => (
            <Picker.Item key={ex.id} label={ex.name} value={ex.id} />
          ))}
        </Picker>

        {/* Input para peso o repeticiones */}
        <TextInput
          style={styles.input}
          placeholder={isWeightMode ? 'Peso (kg)' : 'Repeticiones'}
          keyboardType="numeric"
          value={isWeightMode ? weight : reps}
          onChangeText={isWeightMode ? setWeight : setReps}
        />

        <Button
          title={isWeightMode ? 'Agregar Peso' : 'Agregar Repeticiones'}
          onPress={handleAdd}
          color="#FFD700"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Gráfico de progreso */}
        {renderChart()}

        {/* Toggle peso / repeticiones */}
        <View style={styles.toggleContainer}>
          <Button
            title="Peso"
            onPress={() => setIsWeightMode(true)}
            color={isWeightMode ? '#FFD700' : 'gray'}
          />
          <Button
            title="Repeticiones"
            onPress={() => setIsWeightMode(false)}
            color={!isWeightMode ? '#FFD700' : 'gray'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 100,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    padding: 8,
    marginBottom: 16,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});