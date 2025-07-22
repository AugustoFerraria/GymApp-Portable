import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ToggleButton = ({ selectedOption, onSelectOption }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          selectedOption === 'Peso' ? styles.selected : styles.unselected,
        ]}
        onPress={() => onSelectOption('Peso')}
      >
        <Text
          style={[
            styles.buttonText,
            selectedOption === 'Peso' ? styles.selectedText : styles.unselectedText,
          ]}
        >
          Peso
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          selectedOption === 'Reps' ? styles.selected : styles.unselected,
        ]}
        onPress={() => onSelectOption('Reps')}
      >
        <Text
          style={[
            styles.buttonText,
            selectedOption === 'Reps' ? styles.selectedText : styles.unselectedText,
          ]}
        >
          Reps
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#FFD700',
  },
  unselected: {
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 16,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: '#000000',
  },
});

export default ToggleButton;