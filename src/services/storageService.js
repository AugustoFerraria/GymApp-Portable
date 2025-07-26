import AsyncStorage from '@react-native-async-storage/async-storage';

const EXERCISES_KEY   = 'mis_ejercicios';
const ROUTINES_KEY    = 'mis_rutinas';
const PROGRESSES_KEY  = 'mis_progresos';

// — Ejercicios —
export async function getExercises() {
  const json = await AsyncStorage.getItem(EXERCISES_KEY);
  return json ? JSON.parse(json) : [];
}
export async function saveExercise(exercise) {
  const arr = await getExercises();
  arr.push(exercise);
  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(arr));
}

// — Rutinas —
export async function getRoutines() {
  const json = await AsyncStorage.getItem(ROUTINES_KEY);
  return json ? JSON.parse(json) : [];
}
export async function saveRoutine(routine) {
  const arr = await getRoutines();
  arr.push(routine);
  await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(arr));
}

// — Progresos globales —
export async function getProgresses() {
  const json = await AsyncStorage.getItem(PROGRESSES_KEY);
  return json ? JSON.parse(json) : [];
}
export async function saveProgress(progress) {
  const arr = await getProgresses();
  arr.push(progress);
  await AsyncStorage.setItem(PROGRESSES_KEY, JSON.stringify(arr));
}

// — Para ProgressScreen —
export async function getProgress(exerciseId) {
  const all = await getProgresses();
  return all.filter(p => p.exerciseId === exerciseId);
}
export async function addProgress(exerciseId, entry) {
  const progress = { exerciseId, ...entry };
  await saveProgress(progress);
  return getProgress(exerciseId);
}

// — Nuevas funciones para ManageProgressScreen —

// Elimina un progreso concreto (coincidiendo por ejercicioId + date + valor)
export async function deleteProgress(progressEntry) {
  const all = await getProgresses();
  const filtered = all.filter(p => {
    if (p.exerciseId !== progressEntry.exerciseId) return true;
    if (p.date !== progressEntry.date) return true;
    // comparar peso/reps
    if (progressEntry.weight != null) {
      return p.weight !== progressEntry.weight;
    } else {
      return p.reps !== progressEntry.reps;
    }
  });
  await AsyncStorage.setItem(PROGRESSES_KEY, JSON.stringify(filtered));
  return filtered;
}

// Actualiza un progreso concreto (mantiene la misma date, cambia peso/reps)
export async function updateProgress(progressEntry, newValues) {
  const all = await getProgresses();
  const updatedAll = all.map(p => {
    if (
      p.exerciseId === progressEntry.exerciseId &&
      p.date === progressEntry.date &&
      ((progressEntry.weight != null && p.weight === progressEntry.weight) ||
       (progressEntry.reps   != null && p.reps   === progressEntry.reps))
    ) {
      return { ...p, ...newValues };
    }
    return p;
  });
  await AsyncStorage.setItem(PROGRESSES_KEY, JSON.stringify(updatedAll));
  return updatedAll;
}

export async function deleteRoutine(routineId) {
  const ROUTINES_KEY = 'mis_rutinas';
  const json = await AsyncStorage.getItem(ROUTINES_KEY);
  const arr = json ? JSON.parse(json) : [];
  const filtered = arr.filter(r => r.id !== routineId);
  await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(filtered));
  return filtered;
}

export async function updateRoutine(updatedRoutine) {
  const json = await AsyncStorage.getItem(ROUTINES_KEY);
  const arr  = json ? JSON.parse(json) : [];
  const newArr = arr.map(r =>
    r.id === updatedRoutine.id ? updatedRoutine : r
  );
  await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(newArr));
  return newArr;
}