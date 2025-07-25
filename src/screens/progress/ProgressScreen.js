import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Button,
  Alert, ScrollView, Dimensions, TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

import { getExercises, getProgress, addProgress } from '../../services/storageService';
import ProgressChart from '../../components/ProgressChart';

const screenWidth = Dimensions.get('window').width - 40;

export default function ProgressScreen() {
  const navigation = useNavigation();
  const [weight, setWeight]                   = useState('');
  const [reps, setReps]                       = useState('');
  const [exercises, setExercises]             = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [data, setData]                       = useState([]);
  const [isWeightMode, setIsWeightMode]       = useState(true);
  const [error, setError]                     = useState('');

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const exArr = await getExercises();
        setExercises(exArr);
        if (selectedExercise) {
          const progArr = await getProgress(selectedExercise);
          setData(progArr);
        } else {
          setData([]);
        }
      })();
    }, [selectedExercise])
  );

  const handleAdd = async () => {
    const val = isWeightMode ? parseFloat(weight) : parseInt(reps,10);
    if (isNaN(val)||!selectedExercise){ Alert.alert('Por favor ingresa valor válido y selecciona ejercicio.'); return; }
    const entry = { date:new Date().toISOString(), ...(isWeightMode?{weight:val}:{reps:val}) };
    const updated = await addProgress(selectedExercise, entry);
    setData(updated); setWeight(''); setReps(''); setError('');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Progreso</Text>
      <TouchableOpacity style={styles.headerButton} onPress={()=>navigation.navigate('ManageProgress')}>
        <Icon name="edit" type="material" color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderChart = () => {
    if (!data.length) return <Text style={styles.noDataText}>No hay datos disponibles</Text>;
    return <ProgressChart data={data} viewMode={isWeightMode?'Peso':'Repeticiones'} />;
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.content}>
        <Picker selectedValue={selectedExercise} style={styles.picker} onValueChange={setSelectedExercise}>
          {exercises.map(ex=>(
            <Picker.Item key={ex.id} label={ex.name} value={ex.id} />
          ))}
        </Picker>
        <TextInput
          style={styles.input}
          placeholder={isWeightMode?'Peso (kg)':'Repeticiones'}
          keyboardType="numeric"
          value={isWeightMode?weight:reps}
          onChangeText={isWeightMode?setWeight:setReps}
        />
        <Button title={isWeightMode?'Agregar Peso':'Agregar Repeticiones'} onPress={handleAdd} color="#FFD700" />
        {error?<Text style={styles.errorText}>{error}</Text>:null}
        {renderChart()}
        <View style={styles.toggleContainer}>
          <Button title="Peso" onPress={()=>setIsWeightMode(true)} color={isWeightMode?'#FFD700':'gray'} />
          <Button title="Repeticiones" onPress={()=>setIsWeightMode(false)} color={!isWeightMode?'#FFD700':'gray'} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1, backgroundColor:'#fff' },
  header:         { height:85, backgroundColor:'#FFD700', flexDirection:'row', alignItems:'flex-end', paddingBottom: 15, paddingHorizontal:16 },
  headerTitle:    { flex:1, fontSize:20, fontWeight:'bold', color:'#fff' },
  headerButton:   { padding:8 },
  content:        { padding:16, paddingBottom:32 },
  picker:         { height:50, backgroundColor:'#fff', marginBottom:16 },
  input:          { borderBottomWidth:1, borderBottomColor:'#000', padding:8, marginBottom:16, fontSize:18, backgroundColor:'#fff' },
  noDataText:     { textAlign:'center', color:'#666', marginVertical:16 },
  errorText:      { color:'red', textAlign:'center', marginBottom:16 },
  toggleContainer:{ flexDirection:'row', justifyContent:'center', marginTop:16 },
});