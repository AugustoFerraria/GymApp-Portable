// src/screens/routines/ViewRoutineScreen.js
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Modal,
  Button,
} from 'react-native';
import { getRoutines, deleteRoutine } from '../../services/storageService';
import Background from '../../components/Background';

export default function ViewRoutineScreen({ navigation }) {
  const [routines, setRoutines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  useEffect(() => {
    (async () => {
      const arr = await getRoutines();
      setRoutines(arr);
    })();
  }, []);

  const openMenu = routine => {
    setSelectedRoutine(routine);
    setModalVisible(true);
  };

  const handleDelete = async id => {
    setModalVisible(false);
    const updated = await deleteRoutine(id);
    setRoutines(updated);
  };

  return (
    <Background>
      <FlatList
        data={routines}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openMenu(item)}
          >
            <Text style={styles.name}>{item.name}</Text>
            {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes rutinas aún</Text>
        }
      />

      {selectedRoutine && (
        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{selectedRoutine.name}</Text>
              <View style={styles.modalButtons}>
                <Button
                  title="Ver"
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Ejercicios', { routine: selectedRoutine });
                  }}
                />
                <Button
                  title="Editar"
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('EditarRutina', { routineId: selectedRoutine.id });
                  }}
                />
                <Button
                  title="Eliminar"
                  color="#FF4D4D"
                  onPress={() => handleDelete(selectedRoutine.id)}
                />
                <Button
                  title="Cancelar"
                  onPress={() => setModalVisible(false)}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  list:      { padding: 16 },
  card:      {
    backgroundColor: 'white',
    borderRadius:    8,
    padding:         16,
    marginBottom:    12,
    elevation:       2,
  },
  name:      { fontSize: 18, fontWeight: '600' },
  desc:      { marginTop: 4, color: '#666' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 32 },

  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  modalContainer: {
    width:          '80%',
    backgroundColor:'#fff',
    borderRadius:   8,
    padding:        20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtons: {
    marginTop: 10,
  },
});
