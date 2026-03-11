import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultExercises from '../../assets/defaultExercises.json';

const EXERCISES_KEY = 'mis_ejercicios';
const ROUTINES_KEY = 'mis_rutinas';
const PROGRESSES_KEY = 'mis_progresos';


const EXERCISES_CUSTOM_ORDER_KEY = 'mis_ejercicios_custom_order';
const EXERCISES_SORT_MODE_KEY = 'mis_ejercicios_sort_mode';

export const SORT_MODE = {
  CUSTOM: 'CUSTOM',
  AZ: 'AZ',
  ZA: 'ZA',
};

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function reorderByIds(items, ids) {
  const map = new Map(items.map(i => [i.id, i]));
  const ordered = [];

  // 1) Primero, lo que está en ids, en ese orden
  for (const id of normalizeArray(ids)) {
    const it = map.get(id);
    if (it) ordered.push(it);
  }

  // 2) Luego, cualquier item nuevo que no esté en ids (conservando orden actual)
  const idSet = new Set(normalizeArray(ids));
  for (const it of items) {
    if (!idSet.has(it.id)) ordered.push(it);
  }

  return ordered;
}

async function getCustomOrderIds() {
  const json = await AsyncStorage.getItem(EXERCISES_CUSTOM_ORDER_KEY);
  if (!json) return null;
  try {
    const ids = JSON.parse(json);
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

async function setCustomOrderIds(ids) {
  await AsyncStorage.setItem(EXERCISES_CUSTOM_ORDER_KEY, JSON.stringify(ids));
}

async function ensureSeededExercises() {
  const json = await AsyncStorage.getItem(EXERCISES_KEY);
  if (json !== null) {
    try {
      const arr = JSON.parse(json);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    } catch {
    }
  }

  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(defaultExercises));
  return defaultExercises;
}

/**
 * — Ejercicios —
 * Fuente de verdad: siempre devolvemos ejercicios en orden CUSTOM persistido.
 * Si no existe orden custom aún, se inicializa con el orden actual de los ejercicios.
 */
export async function getExercises() {
  const arr = await ensureSeededExercises();
  const storedIds = await getCustomOrderIds();

  // Si no había orden custom, inicializarlo con el orden actual (o seeded)
  if (!storedIds) {
    const initialIds = arr.map(e => e.id);
    await setCustomOrderIds(initialIds);
    return arr;
  }

  // Reconciliar: aplicar ids guardados y agregar nuevos al final
  const ordered = reorderByIds(arr, storedIds);
  const nextIds = ordered.map(e => e.id);

  // Si cambió (nuevos/eliminados/reparación), persistimos ambos para consistencia
  await setCustomOrderIds(nextIds);
  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(ordered));

  return ordered;
}

/**
 * Guardar un ejercicio nuevo:
 * - Se agrega al array de ejercicios
 * - Se agrega su id al final del orden CUSTOM persistido
 */
export async function saveExercise(exercise) {
  const arr = await getExercises(); // ya viene en orden custom
  const newArr = [...arr, exercise];

  // actualizar custom order (append)
  const ids = newArr.map(e => e.id);
  await setCustomOrderIds(ids);

  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(newArr));
}

/**
 * Eliminar ejercicio:
 * - Elimina del array
 * - Elimina su id del orden CUSTOM persistido
 */
export async function deleteExercise(exerciseId) {
  const arr = await getExercises();
  const filtered = arr.filter(e => e.id !== exerciseId);

  const ids = filtered.map(e => e.id);
  await setCustomOrderIds(ids);

  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(filtered));
  return filtered;
}

/**
 * Actualizar ejercicio (no cambia orden)
 */
export async function updateExercise(updated) {
  const arr = await getExercises();
  const newArr = arr.map(e => (e.id === updated.id ? updated : e));
  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(newArr));
  return newArr;
}

/**
 * Guardar orden de ejercicios:
 * IMPORTANTE: esto representa el orden CUSTOM del usuario.
 * Se persiste tanto la lista como el array de IDs de custom order.
 */
export async function saveExercisesOrder(exercisesArray) {
  const arr = normalizeArray(exercisesArray);
  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(arr));
  await setCustomOrderIds(arr.map(e => e.id));
  return arr;
}

/**
 * NUEVO: modo de orden persistido (CUSTOM/AZ/ZA)
 */
export async function getExercisesSortMode() {
  const v = await AsyncStorage.getItem(EXERCISES_SORT_MODE_KEY);
  if (v === SORT_MODE.AZ || v === SORT_MODE.ZA || v === SORT_MODE.CUSTOM) return v;
  return SORT_MODE.CUSTOM;
}

export async function saveExercisesSortMode(mode) {
  const safe =
    mode === SORT_MODE.AZ || mode === SORT_MODE.ZA || mode === SORT_MODE.CUSTOM
      ? mode
      : SORT_MODE.CUSTOM;
  await AsyncStorage.setItem(EXERCISES_SORT_MODE_KEY, safe);
  return safe;
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

// — Progresos por ejercicio —
export async function getProgress(exerciseId) {
  const all = await getProgresses();
  return all.filter(p => p.exerciseId === exerciseId);
}

export async function addProgress(exerciseId, entry) {
  const progress = { exerciseId, ...entry };
  await saveProgress(progress);
  return getProgress(exerciseId);
}

// — Eliminar y actualizar progreso —
export async function deleteProgress(progressEntry) {
  const all = await getProgresses();
  const filtered = all.filter(p => {
    if (p.exerciseId !== progressEntry.exerciseId) return true;
    if (p.date !== progressEntry.date) return true;
    if (progressEntry.weight != null) {
      return p.weight !== progressEntry.weight;
    }
    return p.reps !== progressEntry.reps;
  });
  await AsyncStorage.setItem(PROGRESSES_KEY, JSON.stringify(filtered));
  return filtered;
}

export async function updateProgress(progressEntry, newValues) {
  const all = await getProgresses();
  const updatedAll = all.map(p => {
    if (
      p.exerciseId === progressEntry.exerciseId &&
      p.date === progressEntry.date &&
      ((progressEntry.weight != null && p.weight === progressEntry.weight) ||
        (progressEntry.reps != null && p.reps === progressEntry.reps))
    ) {
      return { ...p, ...newValues };
    }
    return p;
  });
  await AsyncStorage.setItem(PROGRESSES_KEY, JSON.stringify(updatedAll));
  return updatedAll;
}

// — Rutinas: eliminar y actualizar —
export async function deleteRoutine(routineId) {
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
    (r.id === updatedRoutine.id ? updatedRoutine : r));
  await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(newArr));
  return newArr;
}