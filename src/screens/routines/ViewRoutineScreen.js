import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRoutines } from '../../services/storageService';

const ViewRoutineScreen = ({ route }) => {
  const { routineId } = route.params;
  const [rutina, setRutina] = useState(null);

  useEffect(() => {
    (async () => {
      const all = await getRoutines();
      setRutina(all.find(r => r.id === routineId));
    })();
  }, []);

  if (!rutina) return <Text>Cargando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{rutina.name}</Text>
      {rutina.description ? <Text>{rutina.description}</Text> : null}
      <Text style={styles.subTitle}>Ejercicios:</Text>
      {rutina.exercises.map((eid) => (
        <Text key={eid}>• {eid}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subTitle: { fontSize: 20, marginTop: 16, marginBottom: 4 },
});

export default ViewRoutineScreen;