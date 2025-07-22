import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Input } from 'react-native-elements';

const InputField = ({ label, placeholder, value, onChangeText, secureTextEntry, error, keyboardType, required }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.asterisk}>*</Text>}
      </Text>
      <Input
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        errorMessage={error}
        keyboardType={keyboardType}
        inputStyle={styles.input}
        containerStyle={styles.inputContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  asterisk: {
    color: 'red',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingLeft: 10,
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
});

export default InputField;