import storageClient from '../../../infrastructure/storage/storageClient';
import { STORAGE_KEYS } from '../../../infrastructure/storage/storageKeys';
import { enqueueStorageOperation } from '../../../infrastructure/storage/storageMutationQueue';

async function getRoutinesUnlocked() {
  const json = await storageClient.getItem(STORAGE_KEYS.routines);
  return json ? JSON.parse(json) : [];
}

export function getRoutines() {
  return enqueueStorageOperation(STORAGE_KEYS.routines, getRoutinesUnlocked);
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
  });
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
  });
}
