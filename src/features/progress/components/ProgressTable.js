import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProgressTable({ data, isDark, labelColor }) {
  return (
    <View style={styles.table}>
      <View
        style={[
          styles.tableRowHeader,
          { backgroundColor: isDark ? "#000000ff" : "#f0f0f0" },
        ]}
      >
        <Text style={[styles.tableCell, { color: "#fff" }]}>Fecha</Text>
        <Text style={[styles.tableCell, { color: "#fff" }]}>Peso</Text>
        <Text style={[styles.tableCell, { color: "#fff" }]}>Reps</Text>
        <Text style={[styles.tableCell, { color: "#fff" }]}>Fallo</Text>
      </View>

      {data.map(entry => (
        <View
          key={`${entry.exerciseId ?? ""}-${entry.date}`}
          style={[styles.tableRow, { backgroundColor: isDark ? "#363636ff" : "#fff" }]}
        >
          <Text style={[styles.tableCell, { color: labelColor }]}>
            {new Date(entry.date).toLocaleDateString()}
          </Text>
          <Text style={[styles.tableCell, { color: labelColor }]}>{entry.weight}</Text>
          <Text style={[styles.tableCell, { color: labelColor }]}>{entry.reps}</Text>
          <Text style={[styles.tableCell, { color: labelColor }]}>
            {entry.failure ? "Sí" : "No"}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: { marginTop: 24, borderTopWidth: 1, borderColor: "#CCC" },
  tableRowHeader: { flexDirection: "row", paddingVertical: 8 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#000000ff",
  },
  tableCell: { flex: 1, textAlign: "center" },
});
