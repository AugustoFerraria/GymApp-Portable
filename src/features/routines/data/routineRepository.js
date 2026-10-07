import storageClient from '../../../infrastructure/storage/storageClient';
import { STORAGE_KEYS } from '../../../infrastructure/storage/storageKeys';
import { enqueueStorageOperation } from '../../../infrastructure/storage/storageMutationQueue';
import { getExercises } from '../../exercises/data/exerciseRepository';

async function getRoutinesUnlocked() {
  const json = await storageClient.getItem(STORAGE_KEYS.routines);
  return json ? JSON.parse(json) : [];
}

async function resolveExerciseNames(routines) {
  if (!routines.length) return routines;

  // The catalog owns exercise names; routine entries only own their training settings.
  // Resolve on read, so old snapshots cannot undo a rename or require a migration.
  const exercisesById = new Map((await getExercises()).map(exercise => [exercise.id, exercise]));
  return routines.map(routine => {
    if (!Array.isArray(routine.exercises)) return routine;
    return {
      ...routine,
      exercises: routine.exercises.map(entry => {
        const exercise = exercisesById.get(entry.id);
        return exercise ? { ...entry, name: exercise.name } : entry;
      }),
    };
  });
}

export async function getRoutines() {
  const routines = await enqueueStorageOperation(STORAGE_KEYS.routines, getRoutinesUnlocked);
  return resolveExerciseNames(routines);
}

export function saveRoutine(routine) {
  return enqueueStorageOperation(STORAGE_KEYS.routines, async () => {
    const routines = await getRoutinesUnlocked();
    routines.push(routine);
    await storageClient.setItem(
      STORAGE_KEYS.routines,
      JSON.stringify(routines)
    );
  });
}

export function deleteRoutine(routineId) {
  return enqueueStorageOperation(STORAGE_KEYS.routines, async () => {
    const routines = await getRoutinesUnlocked();
    const filtered = routines.filter(routine => routine.id !== routineId);

    await storageClient.setItem(
      STORAGE_KEYS.routines,
      JSON.stringify(filtered)
    );
    return filtered;
  }).then(resolveExerciseNames);
}

export function updateRoutine(updatedRoutine) {
  return enqueueStorageOperation(STORAGE_KEYS.routines, async () => {
    const routines = await getRoutinesUnlocked();
    const updated = routines.map(routine =>
      routine.id === updatedRoutine.id ? updatedRoutine : routine
    );

    await storageClient.setItem(
      STORAGE_KEYS.routines,
      JSON.stringify(updated)
    );
    return updated;
  }).then(resolveExerciseNames);
}