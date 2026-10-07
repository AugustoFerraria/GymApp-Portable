import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sortExercises } from '../../src/features/exercises/domain/sortExercises.js';
import { SORT_MODE } from '../../src/features/exercises/constants/sortModes.js';

const exercises = [{ id: '1', name: 'Sentadilla' }, { id: '2', name: 'curl' }, { id: '3', name: 'Ábdominales' }];
test('el orden personalizado conserva el array y su orden', () => {
  assert.equal(sortExercises(exercises, SORT_MODE.CUSTOM), exercises);
});
test('A-Z y Z-A ordenan sin modificar los datos originales', () => {
  const before = structuredClone(exercises);
  assert.deepEqual(sortExercises(exercises, SORT_MODE.AZ).map(item => item.id), ['3', '2', '1']);
  assert.deepEqual(sortExercises(exercises, SORT_MODE.ZA).map(item => item.id), ['1', '2', '3']);
  assert.deepEqual(exercises, before);
});
test('ignora mayúsculas y acentos, conservando el orden de los equivalentes', () => {
  const data = [{ name: 'Ábdominales', id: 1 }, { name: 'abdominales', id: 2 }];
  assert.deepEqual(sortExercises(data, SORT_MODE.AZ), data);
});
test('admite listas vacías y ejercicios sin nombre', () => {
  assert.deepEqual(sortExercises([], SORT_MODE.AZ), []);
  assert.deepEqual(sortExercises([{ name: 'Remo' }, {}], SORT_MODE.AZ), [{}, { name: 'Remo' }]);
});

