import React from 'react';
import { Text, StyleSheet } from 'react-native';

const ErrorText = ({ error }) => {
  return error ? <Text style={styles.errorText}>{error}</Text> : null;
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
});

export default ErrorText;