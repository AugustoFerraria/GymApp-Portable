import defaultExercises from './defaultExercises.json';
import storageClient from '../../../infrastructure/storage/storageClient';
import { STORAGE_KEYS } from '../../../infrastructure/storage/storageKeys';
import { enqueueStorageOperation } from '../../../infrastructure/storage/storageMutationQueue';
import { SORT_MODE } from '../constants/sortModes';

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function reorderByIds(items, ids) {
  const itemsById = new Map(items.map(item => [item.id, item]));
  const ordered = [];

  for (const id of normalizeArray(ids)) {
    const item = itemsById.get(id);
    if (item) ordered.push(item);
  }

  const orderedIds = new Set(normalizeArray(ids));
  for (const item of items) {
    if (!orderedIds.has(item.id)) ordered.push(item);
  }

  return ordered;
}

async function getCustomOrderIds() {
  const json = await storageClient.getItem(STORAGE_KEYS.exerciseCustomOrder);
  if (!json) return null;

  try {
    const ids = JSON.parse(json);
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

function setCustomOrderIds(ids) {
  return storageClient.setItem(
    STORAGE_KEYS.exerciseCustomOrder,
    JSON.stringify(ids)
  );
}

async function ensureSeededExercises() {
  const json = await storageClient.getItem(STORAGE_KEYS.exercises);
  if (json !== null) {
    try {
      const exercises = JSON.parse(json);
      if (Array.isArray(exercises)) return exercises;
    } catch {
      // Conserva el comportamiento previo: una colección inválida se reemplaza por defaults.
    }
  }

  await storageClient.setItem(
    STORAGE_KEYS.exercises,
    JSON.stringify(defaultExercises)
  );
  return defaultExercises;
}

/**
 * Devuelve siempre el orden CUSTOM persistido. Esta lectura también siembra y
 * reconcilia los datos, tal como hacía el servicio original.
 */
async function getExercisesUnlocked() {
  const exercises = await ensureSeededExercises();
  const storedIds = await getCustomOrderIds();

  if (!storedIds) {
    await setCustomOrderIds(exercises.map(exercise => exercise.id));
    return exercises;
  }

  const ordered = reorderByIds(exercises, storedIds);
  await setCustomOrderIds(ordered.map(exercise => exercise.id));
  await storageClient.setItem(STORAGE_KEYS.exercises, JSON.stringify(ordered));

  return ordered;
}

export function getExercises() {
  return enqueueStorageOperation(
    STORAGE_KEYS.exercises,
    getExercisesUnlocked
  );
}

export function saveExercise(exercise) {
  return enqueueStorageOperation(STORAGE_KEYS.exercises, async () => {
    const exercises = await getExercisesUnlocked();
    const nextExercises = [...exercises, exercise];

    await setCustomOrderIds(nextExercises.map(item => item.id));
    await storageClient.setItem(
      STORAGE_KEYS.exercises,
      JSON.stringify(nextExercises)
    );
  });
}

export function deleteExercise(exerciseId) {
  return enqueueStorageOperation(STORAGE_KEYS.exercises, async () => {
    const exercises = await getExercisesUnlocked();
    const filtered = exercises.filter(exercise => exercise.id !== exerciseId);

    await setCustomOrderIds(filtered.map(exercise => exercise.id));
    await storageClient.setItem(
      STORAGE_KEYS.exercises,
      JSON.stringify(filtered)
    );
    return filtered;
  });
}

export function updateExercise(updatedExercise) {
  return enqueueStorageOperation(STORAGE_KEYS.exercises, async () => {
    const exercises = await getExercisesUnlocked();
    const updated = exercises.map(exercise =>
      exercise.id === updatedExercise.id ? updatedExercise : exercise
    );

    await storageClient.setItem(
      STORAGE_KEYS.exercises,
      JSON.stringify(updated)
    );
    return updated;
  });
}

export function saveExercisesOrder(exercises) {
  return enqueueStorageOperation(STORAGE_KEYS.exercises, async () => {
    const normalized = normalizeArray(exercises);

    await storageClient.setItem(
      STORAGE_KEYS.exercises,
      JSON.stringify(normalized)
    );
    await setCustomOrderIds(normalized.map(exercise => exercise.id));
    return normalized;
  });
}

export async function getExercisesSortMode() {
  const mode = await storageClient.getItem(STORAGE_KEYS.exerciseSortMode);
  const isValid = Object.values(SORT_MODE).includes(mode);
  return isValid ? mode : SORT_MODE.CUSTOM;
}

export async function saveExercisesSortMode(mode) {
  const safeMode = Object.values(SORT_MODE).includes(mode)
    ? mode
    : SORT_MODE.CUSTOM;

  await storageClient.setItem(STORAGE_KEYS.exerciseSortMode, safeMode);
  return safeMode;
}
