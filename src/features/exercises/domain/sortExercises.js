import { SORT_MODE } from '../constants/sortModes';

export function sortExercises(exercises, mode) {
  if (mode === SORT_MODE.CUSTOM) return exercises;

  return [...exercises].sort((a, b) => {
    const firstName = a?.name ?? '';
    const secondName = b?.name ?? '';
    const comparison = firstName.localeCompare(secondName, undefined, {
      sensitivity: 'base',
    });

    return mode === SORT_MODE.AZ ? comparison : -comparison;
  });
}