import React from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../shared/theme/ThemeContext';

export default function ExerciseForm({
  name,
  description,
  onChangeName,
  onChangeDescription,
  onSubmit,
  submitLabel,
  namePlaceholder,
  inputHeight,
  disabled = false,
}) {
  const { isDark } = useAppTheme();

  const bgScreen = isDark ? '#0B0F14' : '#FFFFFF';
  const inputBg = isDark ? '#131922' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const placeholderColor = isDark ? '#9AA4B2' : '#666666';
  const borderColor = isDark ? '#1F2937' : '#DDDDDD';
  const inputSizeStyle = inputHeight
    ? { height: inputHeight }
    : styles.autoHeightInput;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      <View style={styles.container}>
        <TextInput
          placeholder={namePlaceholder}
          placeholderTextColor={placeholderColor}
          value={name}
          onChangeText={onChangeName}
          style={[
            styles.input,
            inputSizeStyle,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <TextInput
          placeholder="Descripción (opcional)"
          placeholderTextColor={placeholderColor}
          value={description}
          onChangeText={onChangeDescription}
          style={[
            styles.input,
            inputSizeStyle,
            { backgroundColor: inputBg, borderColor, color: textColor },
          ]}
        />
        <Button
          title={submitLabel}
          onPress={onSubmit}
          color="#FFD700"
          disabled={disabled}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  autoHeightInput: {
    paddingVertical: 10,
  },
});
