import storageClient from '../../../infrastructure/storage/storageClient';
import { STORAGE_KEYS } from '../../../infrastructure/storage/storageKeys';
import { enqueueStorageOperation } from '../../../infrastructure/storage/storageMutationQueue';

async function getProgressesUnlocked() {
  const json = await storageClient.getItem(STORAGE_KEYS.progresses);
  return json ? JSON.parse(json) : [];
}

export function getProgresses() {
  return enqueueStorageOperation(
    STORAGE_KEYS.progresses,
    getProgressesUnlocked
  );
}

export function saveProgress(progress) {
  return enqueueStorageOperation(STORAGE_KEYS.progresses, async () => {
    const progresses = await getProgressesUnlocked();
    progresses.push(progress);
    await storageClient.setItem(
      STORAGE_KEYS.progresses,
      JSON.stringify(progresses)
    );
  });
}

export async function getProgress(exerciseId) {
  const progresses = await getProgresses();
  return progresses.filter(progress => progress.exerciseId === exerciseId);
}

export function addProgress(exerciseId, entry) {
  return enqueueStorageOperation(STORAGE_KEYS.progresses, async () => {
    const progresses = await getProgressesUnlocked();
    progresses.push({ exerciseId, ...entry });
    await storageClient.setItem(
      STORAGE_KEYS.progresses,
      JSON.stringify(progresses)
    );
    const persistedProgresses = await getProgressesUnlocked();
    return persistedProgresses.filter(
      progress => progress.exerciseId === exerciseId
    );
  });
}

export function deleteProgress(progressEntry) {
  return enqueueStorageOperation(STORAGE_KEYS.progresses, async () => {
    const progresses = await getProgressesUnlocked();
    const filtered = progresses.filter(progress => {
      if (progress.exerciseId !== progressEntry.exerciseId) return true;
      if (progress.date !== progressEntry.date) return true;
      if (progressEntry.weight != null) {
        return progress.weight !== progressEntry.weight;
      }
      return progress.reps !== progressEntry.reps;
    });

    await storageClient.setItem(
      STORAGE_KEYS.progresses,
      JSON.stringify(filtered)
    );
    return filtered;
  });
}

export function updateProgress(progressEntry, newValues) {
  return enqueueStorageOperation(STORAGE_KEYS.progresses, async () => {
    const progresses = await getProgressesUnlocked();
    const updated = progresses.map(progress => {
      const isSameEntry =
        progress.exerciseId === progressEntry.exerciseId &&
        progress.date === progressEntry.date &&
        ((progressEntry.weight != null && progress.weight === progressEntry.weight) ||
          (progressEntry.reps != null && progress.reps === progressEntry.reps));

      return isSameEntry ? { ...progress, ...newValues } : progress;
    });

    await storageClient.setItem(
      STORAGE_KEYS.progresses,
      JSON.stringify(updated)
    );
    return updated;
  });
}
