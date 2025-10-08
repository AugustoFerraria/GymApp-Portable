// src/screens/routines/ViewRoutineScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Modal,
  Button,
} from 'react-native';
import { getRoutines, deleteRoutine } from '../../services/storageService';
import { ThemeContext } from '../../context/ThemeContext';

export default function ViewRoutineScreen({ navigation }) {
  const { isDark } = useContext(ThemeContext);
  const [routines, setRoutines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  useEffect(() => {
    (async () => {
      setRoutines(await getRoutines());
    })();
  }, []);

  const openMenu = routine => {
    setSelectedRoutine(routine);
    setModalVisible(true);
  };
  const handleDelete = async id => {
    setModalVisible(false);
    setRoutines(await deleteRoutine(id));
  };

  const bgScreen    = isDark ? '#0B0F14' : '#FFFFFF';
  const cardBg      = isDark ? '#131922' : '#FFFFFF';
  const labelColor  = isDark ? '#FFFFFF' : '#111827';
  const descColor   = isDark ? '#9AA4B2' : '#666666';
  const modalBg     = isDark ? '#1A1F29' : '#FFFFFF';
  const modalText   = isDark ? '#FFFFFF' : '#111827';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      <FlatList
        data={routines}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg }]}
            onPress={() => openMenu(item)}
          >
            <Text style={[styles.name, { color: labelColor }]}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={[styles.desc, { color: descColor }]}>
                {item.description}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: descColor }]}>
            No tienes rutinas aún
          </Text>
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
            <View style={[styles.modalContainer, { backgroundColor: modalBg }]}>
              <Text style={[styles.modalTitle, { color: modalText }]}>
                {selectedRoutine.name}
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  title="Ver"
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Ejercicios', {
                      routine: selectedRoutine,
                    });
                  }}
                />
                <Button
                  title="Editar"
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('EditarRutina', {
                      routineId: selectedRoutine.id,
                    });
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16 },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: '600' },
  desc: { marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 32 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtons: { marginTop: 10 },
});