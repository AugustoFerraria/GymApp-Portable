// src/screens/progress/ProgressScreen.js
import React, { useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import {
  getExercises,
  getProgress,
  addProgress,
} from "../../services/storageService";
import ProgressChart from "../../components/ProgressChart";
import { ThemeContext } from "../../context/ThemeContext";

const screenWidth = Dimensions.get("window").width - 40;

export default function ProgressScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext);

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [toFailure, setToFailure] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
// dinámicos (tema más oscuro)
const bgScreen         = isDark ? "#0B0F14" : "#FFFFFF";   // fondo principal
const cardBg           = isDark ? "#131922" : "#FFFFFF";   // tarjetas más oscuras
const labelColor       = isDark ? "#fff" : "#111827";   // texto claro sobre oscuro
const inputBg          = isDark ? "#363636ff" : "#FFFFFF";   // fondo de inputs
const inputTextColor   = isDark ? "#fff" : "#111827";   // texto de inputs
const placeholderColor = isDark ? "#fff" : "#666666";   // placeholder gris frío
const borderColor      = "#FFD700";                        // mantienes acento dorado


  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const exArr = await getExercises();
        setExercises(exArr);
        if (selectedExercise) {
          setData(await getProgress(selectedExercise));
        } else {
          setData([]);
        }
      })();
    }, [selectedExercise])
  );

  const handleAdd = async () => {
    if (!selectedExercise) {
      Alert.alert("Atención", "Debes seleccionar un ejercicio.");
      return;
    }
    const w = parseFloat(weight);
    if (!weight.trim() || isNaN(w)) {
      Alert.alert("Atención", "Debes ingresar un peso válido.");
      return;
    }
    const r = parseInt(reps, 10);
    if (!reps.trim() || isNaN(r)) {
      Alert.alert(
        "Atención",
        "Debes ingresar un número de repeticiones válido."
      );
      return;
    }

    const entry = {
      date: new Date().toISOString(),
      weight: w,
      reps: r,
      failure: toFailure,
    };
    const updated = await addProgress(selectedExercise, entry);
    setData(updated);
    setWeight("");
    setReps("");
    setToFailure(false);
    setError("");
  };

  const displayLabel = selectedExercise
    ? exercises.find((e) => e.id === selectedExercise)?.name
    : "Selecciona ejercicio";

  const dataAsc = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const dataDesc = [...data].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progreso</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("ManageProgress")}
        >
          <Icon name="edit" type="material" color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: bgScreen }]}
      >
        {/* dropdown */}
        <Text style={[styles.label, { color: labelColor }]}>Ejercicio:</Text>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[
              styles.dropdownBtn,
              { backgroundColor: inputBg, borderColor },
            ]}
            onPress={() => setDropdownOpen((o) => !o)}
          >
            <Text
              style={[
                styles.dropdownBtnText,
                { color: selectedExercise ? inputTextColor : placeholderColor },
              ]}
            >
              {displayLabel}
            </Text>
            <Icon
              name={dropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              type="material"
              color={placeholderColor}
              size={24}
            />
          </TouchableOpacity>
          {dropdownOpen && (
            <ScrollView
              style={[
                styles.dropdownContainer,
                { backgroundColor: bgScreen, borderColor },
              ]}
              nestedScrollEnabled
            >
              {exercises.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.dropdownItem, { backgroundColor: cardBg }]}
                  onPress={() => {
                    setSelectedExercise(opt.id);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[styles.dropdownItemText, { color: labelColor }]}
                  >
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* inputs */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              color: inputTextColor,
              borderColor: borderColor,
            },
          ]}
          placeholder="Peso (kg)"
          placeholderTextColor={placeholderColor}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              color: inputTextColor,
              borderColor: borderColor,
            },
          ]}
          placeholder="Repeticiones"
          placeholderTextColor={placeholderColor}
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
        />

        {/* Switch de “fallo”*/}
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: labelColor }]}>
            Llegó al fallo
          </Text>
          <Switch
            value={toFailure}
            onValueChange={setToFailure}
            trackColor={{ false: isDark ? "#777" : "#ccc", true: "#ff0000a2" }}
            thumbColor={toFailure ? "#fff" : isDark ? "#eee" : "#fff"}
          />
        </View>

        <View style={styles.btnWrapper}>
          <Button
            title="Agregar registro"
            onPress={handleAdd}
            color="#FFD700"
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* chart */}
        {dataAsc.length ? (
          <ProgressChart data={dataAsc} viewMode="Peso" />
        ) : (
          <Text style={[styles.noDataText, { color: placeholderColor }]}>
            No hay datos disponibles
          </Text>
        )}

        {/* tabla */}
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
          {dataDesc.map((entry) => (
            <View
              key={entry.date}
              style={[
                styles.tableRow,
                { backgroundColor: isDark ? "#363636ff" : "#fff" },
              ]}
            >
              <Text style={[styles.tableCell, { color: labelColor }]}>
                {new Date(entry.date).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCell, { color: labelColor }]}>
                {entry.weight}
              </Text>
              <Text style={[styles.tableCell, { color: labelColor }]}>
                {entry.reps}
              </Text>
              <Text style={[styles.tableCell, { color: labelColor }]}>
                {entry.failure ? "Sí" : "No"} {/* muestra estado */}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 56,
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerButton: { padding: 8 },

  content: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 16, marginBottom: 8 },

  dropdownWrapper: { marginBottom: 16 },
  dropdownBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownBtnText: { fontSize: 16 },
  dropdownContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 15,
    maxHeight: 350,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#000000ff",
  },
  dropdownItemText: { fontSize: 16 },

  input: { borderWidth: 1, borderRadius: 5, padding: 8, marginBottom: 16 },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchLabel: { fontSize: 16 },
  btnWrapper: { marginBottom: 16 },
  errorText: { color: "red", textAlign: "center", marginBottom: 16 },
  noDataText: { textAlign: "center", marginVertical: 16 },

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
