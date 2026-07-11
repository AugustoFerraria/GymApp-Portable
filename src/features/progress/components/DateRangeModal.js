import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import DatePicker from "./DatePicker";

export default function DateRangeModal({
  visible,
  onDismiss,
  isDark,
  labelColor,
  borderColor,
  inputBg,
  tempStart,
  tempEnd,
  showStartPicker,
  showEndPicker,
  formatDate,
  onOpenStartPicker,
  onOpenEndPicker,
  onStartPickerChange,
  onEndPickerChange,
  onCancel,
  onApply,
}) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        dismissable={false}
        dismissableBackButton={false}
        theme={{ colors: { backdrop: "transparent" } }}
        contentContainerStyle={[
          styles.modalContainer,
          {
            backgroundColor: isDark ? "#131922" : "#FFFFFF",
            borderColor: isDark ? "#1F2937" : "#E5E7EB",
          },
        ]}
      >
        <Text style={[styles.modalTitle, { color: labelColor }]}>
          Filtrar por rango de fechas
        </Text>

        <Text style={[styles.modalHelp, { color: isDark ? "#9AA4B2" : "#6B7280" }]}>
          Elegí un “desde” y “hasta”. Luego verás solo ejercicios con registros en ese rango.
        </Text>

        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.dateBtn, { borderColor, backgroundColor: inputBg }]}
            onPress={onOpenStartPicker}
          >
            <Text style={{ color: labelColor }}>Desde:</Text>
            <Text style={{ color: labelColor, fontWeight: "700" }}>
              {formatDate(tempStart)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateBtn, { borderColor, backgroundColor: inputBg }]}
            onPress={onOpenEndPicker}
          >
            <Text style={{ color: labelColor }}>Hasta:</Text>
            <Text style={{ color: labelColor, fontWeight: "700" }}>
              {formatDate(tempEnd)}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DatePicker
            value={tempStart ?? new Date()}
            onChange={onStartPickerChange}
            label="Fecha desde"
            isDark={isDark}
            borderColor={borderColor}
            textColor={labelColor}
          />
        )}

        {showEndPicker && (
          <DatePicker
            value={tempEnd ?? new Date()}
            onChange={onEndPickerChange}
            label="Fecha hasta"
            isDark={isDark}
            borderColor={borderColor}
            textColor={labelColor}
          />
        )}

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalBtn, { backgroundColor: "transparent", borderColor }]}
            onPress={onCancel}
          >
            <Text style={{ color: labelColor }}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalBtn, { backgroundColor: "#FFD700", borderColor: "#FFD700" }]}
            onPress={onApply}
          >
            <Text style={{ color: "#111827", fontWeight: "700" }}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  modalHelp: {
    fontSize: 12,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  dateBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  modalBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
});
