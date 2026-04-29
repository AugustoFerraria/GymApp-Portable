// src/screens/progress/ProgressScreen.js
import React, { useState, useContext, useCallback, useMemo } from "react";
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
  Platform,
  Vibration,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MaterialIcons as Icon } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Portal, Modal } from "react-native-paper";

import {
  getExercises,
  getProgresses,
  addProgress,
  getExercisesSortMode,
  SORT_MODE,
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

  const [allExercises, setAllExercises] = useState([]);
  const [dropdownExercises, setDropdownExercises] = useState([]);

  const [selectedExercise, setSelectedExercise] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Filtro por fechas
  const [filterStart, setFilterStart] = useState(null); // Date | null
  const [filterEnd, setFilterEnd] = useState(null);     // Date | null
  const isFilterActive = !!filterStart && !!filterEnd;

  // Modal de rango
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [tempStart, setTempStart] = useState(null);
  const [tempEnd, setTempEnd] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // — Estilos dinámicos —
  const bgScreen         = isDark ? "#0B0F14" : "#FFFFFF";
  const cardBg           = isDark ? "#131922" : "#FFFFFF";
  const labelColor       = isDark ? "#fff" : "#111827";
  const inputBg          = isDark ? "#363636ff" : "#FFFFFF";
  const inputTextColor   = isDark ? "#fff" : "#111827";
  const placeholderColor = isDark ? "#fff" : "#666666";
  const borderColor      = "#FFD700";

  const sortByName = useCallback((list, mode) => {
    const sorted = [...list].sort((a, b) => {
      const an = (a?.name ?? "");
      const bn = (b?.name ?? "");
      const cmp = an.localeCompare(bn, undefined, { sensitivity: "base" });
      return mode === SORT_MODE.AZ ? cmp : -cmp;
    });
    return sorted;
  }, []);

  const normalizeDayBounds = useCallback((start, end) => {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    return { s, e };
  }, []);

  const isWithinRange = useCallback((isoDate) => {
    if (!isFilterActive) return true;
    const { s, e } = normalizeDayBounds(filterStart, filterEnd);
    const d = new Date(isoDate);
    return d >= s && d <= e;
  }, [isFilterActive, filterStart, filterEnd, normalizeDayBounds]);

  const refresh = useCallback(async () => {
    const mode = await getExercisesSortMode();

    // Base: SIEMPRE custom sagrado
    const customOrdered = await getExercises();

    // Vista: respeta el modo global
    const viewExercises =
      mode === SORT_MODE.CUSTOM ? customOrdered : sortByName(customOrdered, mode);

    setAllExercises(viewExercises);

    const allProg = await getProgresses();

    // Dropdown: si hay filtro, solo ejercicios que tengan registros en rango; manteniendo el orden de viewExercises
    let eligible = viewExercises;
    if (isFilterActive) {
      const eligibleIds = new Set(
        allProg
          .filter(p => p?.date && isWithinRange(p.date))
          .map(p => p.exerciseId)
      );
      eligible = viewExercises.filter(e => eligibleIds.has(e.id));
    }
    setDropdownExercises(eligible);

    // Si el seleccionado no está en el nuevo dropdown, limpiar
    const stillValid = eligible.some(e => e.id === selectedExercise);
    if (selectedExercise && !stillValid) {
      setSelectedExercise("");
      setData([]);
      setDropdownOpen(false);
      return;
    }

    // Data del ejercicio seleccionado (filtrada por rango si aplica)
    if (selectedExercise) {
      const allForExercise = allProg.filter(p => p.exerciseId === selectedExercise);
      const filteredForExercise = isFilterActive
        ? allForExercise.filter(p => p?.date && isWithinRange(p.date))
        : allForExercise;

      setData(filteredForExercise);
    } else {
      setData([]);
    }
  }, [isFilterActive, isWithinRange, selectedExercise, sortByName]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await refresh();
      })();
    }, [refresh])
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
      Alert.alert("Atención", "Debes ingresar un número de repeticiones válido.");
      return;
    }

    const entry = {
      date: new Date().toISOString(),
      weight: w,
      reps: r,
      failure: toFailure,
    };

    const updatedAll = await addProgress(selectedExercise, entry);
    const nextData = isFilterActive
      ? updatedAll.filter(p => p?.date && isWithinRange(p.date))
      : updatedAll;

    setData(nextData);

    // Si hay filtro activo, el dropdown de ejercicios elegibles puede cambiar; refrescamos para consistencia
    if (isFilterActive) {
      await refresh();
    }

    setWeight("");
    setReps("");
    setToFailure(false);
    setError("");
  };

  const displayLabel = selectedExercise
    ? allExercises.find(e => e.id === selectedExercise)?.name
    : (dropdownExercises.length ? "Selecciona ejercicio" : (isFilterActive ? "Sin ejercicios en rango" : "Selecciona ejercicio"));

  const dataAsc = useMemo(
    () => [...data].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [data]
  );
  const dataDesc = useMemo(
    () => [...data].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [data]
  );

  // — Modal rango —
  const openRangeModal = useCallback(() => {
    setDropdownOpen(false);
    setTempStart(filterStart ?? new Date());
    setTempEnd(filterEnd ?? new Date());
    setIsRangeModalOpen(true);
  }, [filterStart, filterEnd]);

  const closeRangeModal = useCallback(() => {
    setIsRangeModalOpen(false);
    setShowStartPicker(false);
    setShowEndPicker(false);
  }, []);

  const applyRange = useCallback(async () => {
    if (!tempStart || !tempEnd) {
      Alert.alert("Atención", "Seleccioná fecha desde y hasta.");
      return;
    }
    const s = new Date(tempStart);
    const e = new Date(tempEnd);

    if (e < s) {
      Alert.alert("Atención", "La fecha 'hasta' no puede ser anterior a 'desde'.");
      return;
    }

    setFilterStart(s);
    setFilterEnd(e);
    Vibration.vibrate([0, 35, 60, 35]);

    closeRangeModal();
    await refresh();
  }, [tempStart, tempEnd, closeRangeModal, refresh]);

  const clearRangeFilter = useCallback(async () => {
    setFilterStart(null);
    setFilterEnd(null);
    setDropdownOpen(false);
    Vibration.vibrate([0, 25]);
    await refresh();
  }, [refresh]);

  const onPressCalendar = useCallback(() => {
    if (isFilterActive) clearRangeFilter();
    else openRangeModal();
  }, [isFilterActive, clearRangeFilter, openRangeModal]);

  const formatDate = useCallback((d) => {
    if (!d) return "--/--/----";
    return new Date(d).toLocaleDateString();
  }, []);

  const rangeLabel = isFilterActive ? `${formatDate(filterStart)} - ${formatDate(filterEnd)}` : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgScreen }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progreso</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate("ManageProgress")}
          >
            <Icon name="edit" type="material" color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={onPressCalendar}>
            <Icon
              name={isFilterActive ? "close" : "date-range"}
              type="material"
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {isFilterActive && (
        <View style={[styles.filterBar, { backgroundColor: isDark ? "#131922" : "#f2f2f2" }]}>
          <Text style={{ color: labelColor, fontSize: 12 }}>
            Filtrando por fechas: {rangeLabel}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: bgScreen }]}>
        <Text style={[styles.label, { color: labelColor }]}>Ejercicio:</Text>

        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[styles.dropdownBtn, { backgroundColor: inputBg, borderColor }]}
            onPress={() => {
              if (!dropdownExercises.length) return;
              setDropdownOpen(o => !o);
            }}
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
              style={[styles.dropdownContainer, { backgroundColor: bgScreen, borderColor }]}
              nestedScrollEnabled
            >
              {dropdownExercises.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.dropdownItem, { backgroundColor: cardBg }]}
                  onPress={() => {
                    setSelectedExercise(opt.id);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: labelColor }]}>
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputTextColor, borderColor }]}
          placeholder="Peso (kg)"
          placeholderTextColor={placeholderColor}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputTextColor, borderColor }]}
          placeholder="Repeticiones"
          placeholderTextColor={placeholderColor}
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
        />

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: labelColor }]}>Llegó al fallo</Text>
          <Switch
            value={toFailure}
            onValueChange={setToFailure}
            trackColor={{ false: isDark ? "#777" : "#ccc", true: "#ff0000a2" }}
            thumbColor={toFailure ? "#fff" : isDark ? "#eee" : "#fff"}
          />
        </View>

        <View style={styles.btnWrapper}>
          <Button title="Agregar registro" onPress={handleAdd} color="#FFD700" />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {dataAsc.length ? (
          <ProgressChart data={dataAsc} viewMode="Peso" />
        ) : (
          <Text style={[styles.noDataText, { color: placeholderColor }]}>
            No hay datos disponibles
          </Text>
        )}

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

          {dataDesc.map(entry => (
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
      </ScrollView>

      {/* Modal rango de fechas (SIN oscurecer fondo) */}
      <Portal>
        <Modal
          visible={isRangeModalOpen}
          onDismiss={closeRangeModal}
          dismissable={false}
          dismissableBackButton={false}
          backdropColor="transparent"
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
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={{ color: labelColor }}>Desde:</Text>
              <Text style={{ color: labelColor, fontWeight: "700" }}>
                {formatDate(tempStart)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateBtn, { borderColor, backgroundColor: inputBg }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={{ color: labelColor }}>Hasta:</Text>
              <Text style={{ color: labelColor, fontWeight: "700" }}>
                {formatDate(tempEnd)}
              </Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={tempStart ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, selected) => {
                if (Platform.OS !== "ios") setShowStartPicker(false);
                if (event?.type === "set" && selected) setTempStart(selected);
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={tempEnd ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, selected) => {
                if (Platform.OS !== "ios") setShowEndPicker(false);
                if (event?.type === "set" && selected) setTempEnd(selected);
              }}
            />
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "transparent", borderColor }]}
              onPress={closeRangeModal}
            >
              <Text style={{ color: labelColor }}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#FFD700", borderColor: "#FFD700" }]}
              onPress={applyRange}
            >
              <Text style={{ color: "#111827", fontWeight: "700" }}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
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
  headerActions: { flexDirection: "row" },
  headerButton: { padding: 8 },

  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#00000022",
  },

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