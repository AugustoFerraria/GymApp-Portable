import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProgresses, getExercises, deleteProgress, updateProgress } from '../../services/storageService';

export default function ManageProgressScreen() {
  const [allProgresses, setAllProgresses]   = useState([]);
  const [exercises, setExercises]           = useState([]);
  const [editingKey, setEditingKey]         = useState(null);
  const [editValue, setEditValue]           = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [filterMode, setFilterMode]         = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setAllProgresses(await getProgresses());
        setExercises(await getExercises());
      })();
    }, [])
  );

  const makeKey = p => `${p.exerciseId}__${p.date}__${p.weight??p.reps}`;
  const displayed = allProgresses
    .filter(p=>!selectedExercise||p.exerciseId===selectedExercise)
    .filter(p=>filterMode==='all'||(filterMode==='Peso'?p.weight!=null:p.reps!=null));

  const handleDelete = item => {
    Alert.alert('Confirmar','Eliminar progreso?',[
      {text:'Cancelar',style:'cancel'},
      {text:'Eliminar',style:'destructive',onPress:async()=>{
        const upd = await deleteProgress(item);
        setAllProgresses(upd);
      }}
    ]);
  };

  const handleEditStart = item => {
    setEditingKey(makeKey(item));
    setEditValue(String(item.weight??item.reps));
  };
  const handleEditSave = async item => {
    const num = parseFloat(editValue);
    if(isNaN(num)){ return Alert.alert('Valor inválido'); }
    const newVals = item.weight!=null?{weight:num}:{reps:num};
    const upd = await updateProgress(item,newVals);
    setAllProgresses(upd);
    setEditingKey(null);
  };

  const renderItem = ({item})=>{
    const key = makeKey(item);
    const exName = exercises.find(e=>e.id===item.exerciseId)?.name||'—';
    const dateStr = new Date(item.date).toLocaleDateString();
    const valStr = item.weight!=null?`${item.weight} kg`:`${item.reps} reps`;
    const isEd = editingKey===key;
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{exName}</Text>
        <Text style={styles.sub}>{dateStr}</Text>
        {isEd?(
          <TextInput
            style={styles.input}
            value={editValue}
            onChangeText={setEditValue}
            keyboardType="numeric"
          />
        ):(
          <Text style={styles.value}>{valStr}</Text>
        )}
        <View style={styles.actions}>
          {isEd?(
            <>
              <TouchableOpacity onPress={()=>handleEditSave(item)}><Text style={styles.btnText}>Guardar</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>setEditingKey(null)}><Text style={styles.btnText}>Cancelar</Text></TouchableOpacity>
            </>
          ):(
            <>
              <TouchableOpacity onPress={()=>handleEditStart(item)}><Text style={styles.btnText}>Editar</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>handleDelete(item)}><Text style={styles.btnText}>Eliminar</Text></TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Picker
          selectedValue={selectedExercise}
          style={styles.picker}
          onValueChange={setSelectedExercise}
        >
          <Picker.Item label="Todos los ejercicios" value="" />
          {exercises.map(e=><Picker.Item key={e.id} label={e.name} value={e.id}/> )}
        </Picker>
        <View style={styles.modeButtons}>
          {['all','Peso','Repeticiones'].map(m=>(
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn,filterMode===m&&styles.modeBtnActive]}
              onPress={()=>setFilterMode(m)}
            >
              <Text style={[styles.modeText,filterMode===m&&styles.modeTextActive]}>{m==='all'?'Todos':m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={displayed}
        keyExtractor={item=>makeKey(item)}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay registros</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#fff' },
  filters:   { padding:16, backgroundColor:'#f9f9f9' },
  picker:    { height:50,backgroundColor:'#fff',marginBottom:8 },
  modeButtons:{ flexDirection:'row',justifyContent:'space-around' },
  modeBtn:     { padding:6, paddingHorizontal:12, borderRadius:4, backgroundColor:'#ededed' },
  modeBtnActive:{ backgroundColor:'#FFD700' },
  modeText:    { color:'#333' },
  modeTextActive:{ color:'#fff' },
  list:        { padding:16 },
  card:        { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:12, elevation:2 },
  title:       { fontSize:18, fontWeight:'600' },
  sub:         { fontSize:14, color:'#666', marginVertical:4 },
  value:       { fontSize:16, marginVertical:8 },
  input:       { borderBottomWidth:1, borderBottomColor:'#000', fontSize:16, marginVertical:8 },
  actions:     { flexDirection:'row', justifyContent:'flex-end', marginTop:8 },
  btnText:     { color:'#FFD700', marginLeft:12 },
  empty:       { textAlign:'center', color:'#666', marginTop:32 },
});