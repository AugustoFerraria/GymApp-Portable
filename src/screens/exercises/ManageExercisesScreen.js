// src/screens/exercises/ManageExercisesScreen.js
import React, { useState, useCallback, useLayoutEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Vibration,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

// Paper (ya lo tenés en App.js)
import { Portal, Modal, RadioButton, Button } from 'react-native-paper';

import {
  getExercises,
  deleteExercise,
  saveExercisesOrder,
  SORT_MODE,
  getExercisesSortMode,
  saveExercisesSortMode,
} from '../../services/storageService';
import { ThemeContext } from '../../context/ThemeContext';

export default function ManageExercisesScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext);
  const [exercises, setExercises] = useState([]);
  const [sortMode, setSortMode] = useState(SORT_MODE.CUSTOM);

  // Modal
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState(SORT_MODE.CUSTOM);

  const vibrateConfirm = useCallback(() => {
    Vibration.vibrate([0, 35, 60, 35]);
  }, []);

  const sortByName = useCallback((list, mode) => {
    const sorted = [...list].sort((a, b) => {
      const an = (a?.name ?? '');
      const bn = (b?.name ?? '');
      const cmp = an.localeCompare(bn, undefined, { sensitivity: 'base' });
      return mode === SORT_MODE.AZ ? cmp : -cmp;
    });
    return sorted;
  }, []);

  const refreshExercises = useCallback(async () => {
    const mode = await getExercisesSortMode();
    setSortMode(mode);

    // getExercises SIEMPRE devuelve el orden CUSTOM sagrado (persistido)
    const customOrdered = await getExercises();

    if (mode === SORT_MODE.CUSTOM) {
      setExercises(customOrdered);
    } else if (mode === SORT_MODE.AZ) {
      setExercises(sortByName(customOrdered, SORT_MODE.AZ));
    } else {
      setExercises(sortByName(customOrdered, SORT_MODE.ZA));
    }
  }, [sortByName]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await refreshExercises();
      })();
    }, [refreshExercises])
  );

  const isDragEnabled = sortMode === SORT_MODE.CUSTOM && !isSortModalOpen;

  const openSortModal = useCallback(() => {
    setPendingMode(sortMode);
    setIsSortModalOpen(true);
  }, [sortMode]);

  const closeSortModal = useCallback(() => {
    setIsSortModalOpen(false);
  }, []);

  const applyPendingMode = useCallback(async () => {
    const modeToApply = pendingMode;

    // Persistimos modo (para que sobreviva cerrar la app)
    await saveExercisesSortMode(modeToApply);
    setSortMode(modeToApply);

    vibrateConfirm();

    const customOrdered = await getExercises(); // orden custom sagrado

    if (modeToApply === SORT_MODE.CUSTOM) {
      setExercises(customOrdered);
    } else if (modeToApply === SORT_MODE.AZ) {
      setExercises(sortByName(customOrdered, SORT_MODE.AZ));
    } else {
      setExercises(sortByName(customOrdered, SORT_MODE.ZA));
    }

    closeSortModal();
    await refreshExercises();
  }, [pendingMode, sortByName, closeSortModal, vibrateConfirm]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: 12, alignItems: 'center' }}>
            <Icon
              name="sort"
              type="material"
              color="#fff"
              size={26}
              containerStyle={{ opacity: isSortModalOpen ? 0.5 : 1 }}
              onPress={isSortModalOpen ? undefined : openSortModal}
            />
            <Text style={{ color: '#fff', fontSize: 10, marginTop: 2 }}>
              {sortMode === SORT_MODE.CUSTOM ? 'Custom' : sortMode === SORT_MODE.AZ ? 'A–Z' : 'Z–A'}
            </Text>
          </View>

          <Icon
            name="add"
            type="material"
            color="#fff"
            size={28}
            containerStyle={{ marginRight: 16 }}
            onPress={() => navigation.navigate('CrearEjercicio')}
          />
        </View>
      ),
      headerStyle: { backgroundColor: isDark ? '#0B0F14' : '#FFD700' },
    });
  }, [navigation, isDark, openSortModal, isSortModalOpen, sortMode]);

  const handleDragEnd = useCallback(
    async ({ data }) => {
      // Solo CUSTOM permite reordenar
      if (sortMode !== SORT_MODE.CUSTOM) return;

      setExercises(data);

      // Esto actualiza el orden CUSTOM sagrado en AsyncStorage (array + ids)
      await saveExercisesOrder(data);
    },
    [sortMode]
  );

  const handleDelete = useCallback(
    (item) => {
      Alert.alert('Eliminar ejercicio', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await deleteExercise(item.id);
            // deleteExercise ya actualiza el custom order sagrado
            await refreshExercises();
          },
        },
      ]);
    },
    [refreshExercises]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }) => {
      const cardBg = isDark ? '#131922' : '#FFFFFF';
      const cardActiveBg = isDark ? '#1F2937' : '#F3F4F6';
      const textColor = isDark ? '#FFFFFF' : '#111827';
      const descColor = isDark ? '#9AA4B2' : '#666666';

      return (
        <ScaleDecorator>
          <View style={[styles.card, { backgroundColor: isActive ? cardActiveBg : cardBg }]}>
            <TouchableOpacity
              onPressIn={isDragEnabled ? drag : undefined}
              style={[styles.dragHandle, { opacity: isDragEnabled ? 1 : 0.25 }]}
              disabled={!isDragEnabled}
            >
              <Icon name="drag-handle" type="material" color={isDark ? '#9AA4B2' : '#999'} size={24} />
            </TouchableOpacity>

            <View style={styles.cardContent}>
              <Text style={[styles.name, { color: textColor }]}>{item.name}</Text>
              {item.description ? (
                <Text style={[styles.desc, { color: descColor }]}>{item.description}</Text>
              ) : null}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditExercise', { exercise: item })}
                style={styles.iconSpacing}
              >
                <Icon name="edit" type="material" size={28} color="#2E86FF" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Icon name="delete" type="material" size={28} color="#FF4D4D" />
              </TouchableOpacity>
            </View>
          </View>
        </ScaleDecorator>
      );
    },
    [navigation, isDark, isDragEnabled, handleDelete]
  );

  const modalBg = isDark ? '#131922' : '#FFFFFF';
  const modalText = isDark ? '#FFFFFF' : '#111827';
  const modalSub = isDark ? '#9AA4B2' : '#6B7280';

  const modeHelpText =
    pendingMode === SORT_MODE.CUSTOM
      ? 'Custom: podés reordenar manualmente. Se conserva tu último orden.'
      : pendingMode === SORT_MODE.AZ
        ? 'A–Z: orden alfabético ascendente. No se puede reordenar manualmente.'
        : 'Z–A: orden alfabético descendente. No se puede reordenar manualmente.';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0B0F14' : '#FFFFFF' }]}>
      <DraggableFlatList
        data={exercises}
        onDragEnd={handleDragEnd}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        scrollEnabled={!isSortModalOpen}
        dragEnabled={isDragEnabled}
      />

      <Portal>
        <Modal
          visible={isSortModalOpen}
          onDismiss={closeSortModal}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: modalBg, borderColor: isDark ? '#1F2937' : '#E5E7EB' },
          ]}
        >
          <Text style={[styles.modalTitle, { color: modalText }]}>Ordenar ejercicios</Text>
          <Text style={[styles.modalHelp, { color: modalSub }]}>{modeHelpText}</Text>

          <RadioButton.Group onValueChange={setPendingMode} value={pendingMode}>
            <View style={styles.radioRow}>
              <RadioButton value={SORT_MODE.CUSTOM} />
              <Text style={[styles.radioLabel, { color: modalText }]}>Custom (reordenable)</Text>
            </View>

            <View style={styles.radioRow}>
              <RadioButton value={SORT_MODE.AZ} />
              <Text style={[styles.radioLabel, { color: modalText }]}>A–Z</Text>
            </View>

            <View style={styles.radioRow}>
              <RadioButton value={SORT_MODE.ZA} />
              <Text style={[styles.radioLabel, { color: modalText }]}>Z–A</Text>
            </View>
          </RadioButton.Group>

          <View style={styles.modalActions}>
            <Button mode="text" onPress={closeSortModal}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={applyPendingMode}>
              Aplicar
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  dragHandle: {
    padding: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  desc: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 16,
  },

  modalContainer: {
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalHelp: {
    fontSize: 12,
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  radioLabel: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 8,
  },
});