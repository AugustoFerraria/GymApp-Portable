// src/screens/exercises/ManageExercisesScreen.js
import React, { useState, useCallback, useLayoutEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import {
  getExercises,
  deleteExercise,
  saveExercisesOrder,
} from '../../services/storageService';
import { ThemeContext } from '../../context/ThemeContext';

export default function ManageExercisesScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext);
  const [exercises, setExercises] = useState([]);

  // Carga ejercicios al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const arr = await getExercises();
        setExercises(arr);
      })();
    }, [])
  );

  // Botón "+" en el header
  useLayoutEffect(() => {
    navigation.setOptions({
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
      headerStyle: { backgroundColor: isDark ? '#414141' : '#FFD700' },
    });
  }, [navigation, isDark]);

  // Guardar orden al soltar
  const handleDragEnd = useCallback(
    async ({ data }) => {
      setExercises(data);
      await saveExercisesOrder(data);
    },
    []
  );

  // Render de cada fila
  const renderItem = useCallback(
    ({ item, drag, isActive }) => {
      const cardBg = isDark ? '#414141' : '#fff';
      const cardActiveBg = isDark ? '#575757' : '#f0f0f0';
      const textColor = isDark ? '#fff' : '#000';
      const descColor = isDark ? '#ccc' : '#666';

      return (
        <ScaleDecorator>
          <View
            style={[
              styles.card,
              { backgroundColor: isActive ? cardActiveBg : cardBg },
            ]}
          >
            <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
              <Icon name="drag-handle" type="material" color="#999" size={24} />
            </TouchableOpacity>

            <View style={styles.cardContent}>
              <Text style={[styles.name, { color: textColor }]}>{item.name}</Text>
              {item.description ? (
                <Text style={[styles.desc, { color: descColor }]}>
                  {item.description}
                </Text>
              ) : null}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EditExercise', { exercise: item })
                }
                style={styles.iconSpacing}
              >
                <Icon name="edit" type="material" size={28} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Eliminar ejercicio',
                    '¿Estás seguro?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Borrar',
                        style: 'destructive',
                        onPress: async () => {
                          const updated = await deleteExercise(item.id);
                          setExercises(updated);
                        },
                      },
                    ]
                  )
                }
              >
                <Icon name="delete" type="material" size={28} color="#FF4D4D" />
              </TouchableOpacity>
            </View>
          </View>
        </ScaleDecorator>
      );
    },
    [navigation, isDark]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#414141' : '#fff' }]}>
      <DraggableFlatList
        data={exercises}
        onDragEnd={handleDragEnd}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
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
});