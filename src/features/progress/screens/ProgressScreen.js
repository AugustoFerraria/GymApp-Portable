import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Vibration,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from '@expo/vector-icons';

import {
  getExercises,
  getExercisesSortMode,
} from "../../exercises/data/exerciseRepository";
import { SORT_MODE } from "../../exercises/constants/sortModes";
import { sortExercises } from "../../exercises/domain/sortExercises";
import { PROGRESS_ROUTES } from "../../../shared/navigation/routeNames";
import { useAppTheme } from "../../../shared/theme/ThemeContext";
import DateRangeModal from "../components/DateRangeModal";
import ProgressChart from "../components/ProgressChart";
import ProgressTable from "../components/ProgressTable";
import ProgressPeriodSelector from "../components/ProgressPeriodSelector";
import { filterProgressByDateRange, getProgressDateRange } from "../domain/progressDateRange";
import { addProgress, getProgresses } from "../data/progressRepository";

export default function ProgressScreen() {
  const navigation = useNavigation();
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [toFailure, setToFailure] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = useRef(false);

  const [allExercises, setAllExercises] = useState([]);
  const [dropdownExercises, setDropdownExercises] = useState([]);

  const [selectedExercise, setSelectedExercise] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Filtro por fechas
  const [filterStart, setFilterStart] = useState(null); // Date | null
  const [filterEnd, setFilterEnd] = useState(null);     // Date | null
  const [period, setPeriod] = useState('all');

  // Modal de rango
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [tempStart, setTempStart] = useState(null);
  const [tempEnd, setTempEnd] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const refreshRequestId = useRef(0);

  // — Estilos dinámicos —
  const bgScreen         = isDark ? "#0B0F14" : "#FFFFFF";
  const cardBg           = isDark ? "#131922" : "#FFFFFF";
  const labelColor       = isDark ? "#fff" : "#111827";
  const inputBg          = isDark ? "#363636ff" : "#FFFFFF";
  const inputTextColor   = isDark ? "#fff" : "#111827";
  const placeholderColor = isDark ? "#fff" : "#666666";
  const borderColor      = "#FFD700";

  const refresh = useCallback(async () => {
    const requestId = ++refreshRequestId.current;

    try {
      const mode = await getExercisesSortMode();

      // Base: SIEMPRE custom sagrado
      const customOrdered = await getExercises();

      // Vista: respeta el modo global
      const viewExercises =
        mode === SORT_MODE.CUSTOM
          ? customOrdered
          : sortExercises(customOrdered, mode);

      const allProg = await getProgresses();
      if (requestId !== refreshRequestId.current) return;

      setAllExercises(viewExercises);

      setDropdownExercises(viewExercises);

      // Si el seleccionado no está en el nuevo dropdown, limpiar.
      const stillValid = viewExercises.some(
        exercise => exercise.id === selectedExercise
      );
      if (selectedExercise && !stillValid) {
        setSelectedExercise("");
        setData([]);
        setDropdownOpen(false);
        setError("");
        return;
      }

      // Keep the full history; chart and table share the same derived date filter.
      if (selectedExercise) {
        const allForExercise = allProg.filter(
          progress => progress.exerciseId === selectedExercise
        );
        setData(allForExercise);
      } else {
        setData([]);
      }
      setError("");
    } catch {
      if (requestId === refreshRequestId.current) {
        setError("No se pudieron cargar los datos de progreso.");
      }
    }
  }, [selectedExercise]);

  useFocusEffect(
    useCallback(() => {
      refresh();

      return () => {
        refreshRequestId.current += 1;
      };
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
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setSubmitting(true);

    const entry = {
      date: new Date().toISOString(),
      weight: w,
      reps: r,
      failure: toFailure,
    };

    try {
      const updatedAll = await addProgress(selectedExercise, entry);
      setData(updatedAll);

      setWeight("");
      setReps("");
      setToFailure(false);
      setError("");
    } catch {
      Alert.alert("Error", "No se pudo guardar el progreso. Intenta nuevamente.");
    } finally {
      isSubmitting.current = false;
      setSubmitting(false);
    }
  };

  const displayLabel = selectedExercise
    ? allExercises.find(e => e.id === selectedExercise)?.name
    : "Selecciona ejercicio";

  const dateRange = useMemo(
    () => getProgressDateRange(period, filterStart, filterEnd),
    [period, filterStart, filterEnd, data]
  );
  const visibleData = useMemo(
    () => filterProgressByDateRange(data, dateRange),
    [data, dateRange]
  );

  const dataAsc = useMemo(
    () => [...visibleData].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [visibleData]
  );
  const dataDesc = useMemo(
    () => [...dataAsc].reverse(),
    [dataAsc]
  );

  // — Modal rango —
  const openRangeModal = useCallback(() => {
    setDropdownOpen(false);
    setTempStart(filterStart ?? new Date());
    setTempEnd(filterEnd ?? new Date());
    setShowStartPicker(false);
    setShowEndPicker(false);
    setIsRangeModalOpen(true);
  }, [filterStart, filterEnd]);

  const closeRangeModal = useCallback(() => {
    setIsRangeModalOpen(false);
    setShowStartPicker(false);
    setShowEndPicker(false);
  }, []);

  const applyRange = useCallback(() => {
    if (!tempStart || !tempEnd) {
      Alert.alert("Atención", "Seleccioná fecha desde y hasta.");
      return;
    }
    const s = new Date(tempStart);
    const e = new Date(tempEnd);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    if (e < s) {
      Alert.alert("Atención", "La fecha 'hasta' no puede ser anterior a 'desde'.");
      return;
    }

    setFilterStart(s);
    setFilterEnd(e);
    setPeriod('custom');
    Vibration.vibrate([0, 35, 60, 35]);

    closeRangeModal();
  }, [tempStart, tempEnd, closeRangeModal]);

  const selectPeriod = useCallback((nextPeriod) => {
    if (nextPeriod === 'custom') {
      openRangeModal();
      return;
    }
    setPeriod(nextPeriod);
    setDropdownOpen(false);
    Vibration.vibrate([0, 25]);
  }, [openRangeModal]);

  const formatDate = useCallback((d) => {
    if (!d) return "--/--/----";
    return new Date(d).toLocaleDateString();
  }, []);

  const rangeLabel = dateRange ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` : null;

  return (
    <View style={[styles.safe, { backgroundColor: bgScreen }]}>
      <View style={[styles.header, { height: 56 + insets.top, paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Progreso</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Gestionar progreso"
            onPress={() => navigation.navigate(PROGRESS_ROUTES.MANAGE)}
          >
            <Icon name="edit" color="#fff" size={24} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={openRangeModal} accessibilityRole="button" accessibilityLabel="Elegir rango de fechas">
            <Icon
              name="date-range"
              color="#fff"
              size={24}
            />
          </TouchableOpacity>
        </View>
      </View>

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
          <Button
            title="Agregar registro"
            onPress={handleAdd}
            color="#FFD700"
            disabled={submitting}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <ProgressChart
          key={selectedExercise}
          animationKey={`${selectedExercise}-${period}-${rangeLabel ?? 'all'}`}
          data={dataAsc}
          viewMode="Peso"
          isDark={isDark}
          emptyMessage={selectedExercise ? 'No hay registros en este período' : 'Selecciona un ejercicio para ver su progreso'}
          periodSelector={
            <ProgressPeriodSelector
              period={period}
              onSelect={selectPeriod}
              rangeLabel={rangeLabel}
              isDark={isDark}
            />
          }
        />

        <ProgressTable data={dataDesc} isDark={isDark} labelColor={labelColor} />
      </ScrollView>

      {/* Modal rango de fechas (SIN oscurecer fondo) */}
      <DateRangeModal
        visible={isRangeModalOpen}
        onDismiss={closeRangeModal}
        isDark={isDark}
        labelColor={labelColor}
        borderColor={borderColor}
        inputBg={inputBg}
        tempStart={tempStart}
        tempEnd={tempEnd}
        showStartPicker={showStartPicker}
        showEndPicker={showEndPicker}
        formatDate={formatDate}
        onOpenStartPicker={() => setShowStartPicker(true)}
        onOpenEndPicker={() => setShowEndPicker(true)}
        onStartPickerChange={(event, selected) => {
          if (Platform.OS !== "ios") setShowStartPicker(false);
          if (event?.type === "set" && selected) setTempStart(selected);
        }}
        onEndPickerChange={(event, selected) => {
          if (Platform.OS !== "ios") setShowEndPicker(false);
          if (event?.type === "set" && selected) setTempEnd(selected);
        }}
        onCancel={closeRangeModal}
        onApply={applyRange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerActions: { flexDirection: "row" },
  headerButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
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

});
