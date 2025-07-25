// src/screens/home/HomeScreen.js
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Platform,
  UIManager,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getRoutines, deleteRoutine } from '../../services/storageService';
import Background from '../../components/Background';
import { Icon } from 'react-native-elements';

// Habilitar animaciones en Android (legacy)
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Componente de tarjeta con animación propia
function RoutineCard({ item, expanded, onToggle, navigation, onDelete }) {
  const animation = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const height = animation.interpolate({
    inputRange: [0, 0.78],
    outputRange: [0, 140], // altura aproximada del menú
  });

  const opacity = animation;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={[styles.card, expanded && styles.cardExpanded]}
        onPress={() => onToggle(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon
              name="keyboard-arrow-down"
              type="material"
              color="#666"
              size={24}
            />
          </Animated.View>
        </View>
        {item.description && <Text style={styles.desc}>{item.description}</Text>}
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.menu,
          { height, opacity, overflow: 'hidden' },
        ]}
      >
        <TouchableOpacity
          style={[styles.menuButton, styles.viewButton]}
          onPress={() => {
            navigation.navigate('Ejercicios', { routine: item });
            onToggle(null);
          }}
        >
          <View style={styles.menuItem}>
            <Icon
              name="visibility"
              type="material"
              color="#007AFF"
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: '#007AFF' }]}>Ver</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.editButton]}
          onPress={() => {
            navigation.navigate('EditarRutina', { routineId: item.id });
            onToggle(null);
          }}
        >
          <View style={styles.menuItem}>
            <Icon
              name="edit"
              type="material"
              color="#007AFF"
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: '#007AFF' }]}>Editar</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.deleteButton]}
          onPress={() => onDelete(item.id)}
        >
          <View style={styles.menuItem}>
            <Icon
              name="delete"
              type="material"
              color="#FF4D4D"
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: '#FF4D4D' }]}>Eliminar</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [routines, setRoutines] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);

  // Recarga al enfocar
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const arr = await getRoutines();
        setRoutines(arr);
      })();
    }, [])
  );

  const handleDelete = async (id) => {
    const updated = await deleteRoutine(id);
    setRoutines(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Background>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          routines.length ? styles.list : styles.emptyList
        }
        renderItem={({ item }) => (
          <RoutineCard
            item={item}
            expanded={expandedId === item.id}
            onToggle={toggleExpand}
            navigation={navigation}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes rutinas aún</Text>
        }
      />
      <FAB.Group
        open={fabOpen}
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'plus',
            label: 'Nueva rutina',
            onPress: () => navigation.navigate('CrearRutina'),
          },
          {
            icon: 'dumbbell',
            label: 'Nuevo ejercicio',
            onPress: () => navigation.navigate('CrearEjercicio'),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
      />
    </Background>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  cardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  desc: {
    marginTop: 4,
    color: '#666',
  },
  menu: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  menuButton: {
    paddingVertical: 18,
    borderRadius: 6,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
  viewButton: {},
  editButton: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255,77,77,0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 8,
  },
  menuText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
});