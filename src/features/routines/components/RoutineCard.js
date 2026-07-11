import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../../../shared/theme/ThemeContext';

export default function RoutineCard({
  item,
  expanded,
  onToggle,
  onView,
  onEdit,
  onDelete,
}) {
  const animation = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const { isDark } = useAppTheme();

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
    outputRange: [0, 140],
  });
  const opacity = animation;

  const cardBg = isDark ? '#131922' : '#FFFFFF';
  const menuBg = isDark ? '#1A1F29' : '#F9F9F9';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const descColor = isDark ? '#9AA4B2' : '#666666';
  const arrowCol = isDark ? '#9AA4B2' : '#666666';

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={[
          styles.card,
          expanded && styles.cardExpanded,
          { backgroundColor: cardBg },
        ]}
        onPress={() => onToggle(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.name, { color: textColor }]}>{item.name}</Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon
              name="keyboard-arrow-down"
              color={arrowCol}
              size={24}
            />
          </Animated.View>
        </View>
        {item.description && (
          <Text style={[styles.desc, { color: descColor }]}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.menu,
          { backgroundColor: menuBg, height, opacity, overflow: 'hidden' },
        ]}
      >
        <TouchableOpacity
          style={[styles.menuButton, styles.viewButton]}
          onPress={() => {
            onView(item);
            onToggle(null);
          }}
        >
          <View style={styles.menuItem}>
            <Icon name="visibility" color="#2E86FF" size={24} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: '#2E86FF' }]}>Ver</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.editButton]}
          onPress={() => {
            onEdit(item.id);
            onToggle(null);
          }}
        >
          <View style={styles.menuItem}>
            <Icon name="edit" color="#2E86FF" size={24} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: '#2E86FF' }]}>Editar</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.deleteButton]}
          onPress={() => onDelete(item.id)}
        >
          <View style={styles.menuItem}>
            <Icon name="delete" color="#FF4D4D" size={24} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: '#FF4D4D' }]}>Eliminar</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { marginBottom: 12 },
  card: { borderRadius: 8, padding: 16, elevation: 2 },
  cardExpanded: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: '600' },
  desc: { marginTop: 4 },
  menu: { borderRadius: 8 },
  menuButton: { paddingVertical: 18, borderRadius: 6, alignSelf: 'stretch', paddingHorizontal: 16 },
  viewButton: {},
  editButton: { backgroundColor: 'rgba(46,134,255,0.1)' },
  deleteButton: { backgroundColor: 'rgba(255,77,77,0.1)' },
  menuItem: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { marginRight: 8 },
  menuText: { fontSize: 16 },
});