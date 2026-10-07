import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  filterProgressByDateRange,
  getExercisesWithProgressInRange,
  getProgressDateRange,
} from '../../src/features/progress/domain/progressDateRange.js';

const exercises = [
  { id: 'remo', name: 'Remo' },
  { id: 'press', name: 'Pecho plano' },
  { id: 'curl', name: 'Curl' },
  { id: 'unused', name: 'Sin registros' },
];
const date = (day, hour = 12, minute = 0, second = 0, ms = 0) =>
  new Date(2026, 8, day, hour, minute, second, ms).toISOString();
const range = getProgressDateRange('custom', new Date(2026, 8, 10), new Date(2026, 8, 12));
const progresses = [
  { exerciseId: 'press', date: date(10), weight: 80 },
  { exerciseId: 'press', date: date(11), weight: 85 },
  { exerciseId: 'remo', date: date(12), weight: 60 },
  { exerciseId: 'curl', date: date(9), weight: 15 },
];

test('el calendario superior limita ejercicios y conserva el orden del catálogo', () => {
  assert.deepEqual(getExercisesWithProgressInRange(exercises, progresses, range), exercises.slice(0, 2));
  assert.deepEqual(exercises.map(exercise => exercise.id), ['remo', 'press', 'curl', 'unused']);
});

test('incluye los límites completos y descarta fechas inválidas o ejercicios eliminados', () => {
  const entries = [
    { exerciseId: 'press', date: date(10, 0) },
    { exerciseId: 'remo', date: date(12, 23, 59, 59, 999) },
    { exerciseId: 'curl', date: date(13, 0) },
    { exerciseId: 'curl', date: date(9, 23, 59, 59, 999) },
    { exerciseId: 'unused', date: 'invalid' },
    { exerciseId: 'unused' },
    { exerciseId: 'deleted', date: date(11) },
  ];
  assert.deepEqual(getExercisesWithProgressInRange(exercises, entries, range), exercises.slice(0, 2));
});

test('sin filtro superior el catálogo completo permanece disponible incluso sin registros', () => {
  assert.equal(getExercisesWithProgressInRange(exercises, progresses, null), exercises);
  assert.equal(getExercisesWithProgressInRange(exercises, [], null), exercises);
});

test('un intervalo sin registros no ofrece ejercicios elegibles', () => {
  const emptyRange = getProgressDateRange('custom', new Date(2020, 0, 1), new Date(2020, 0, 2));
  assert.deepEqual(getExercisesWithProgressInRange(exercises, progresses, emptyRange), []);
});

test('el historial del ejercicio elegido usa el mismo intervalo del desplegable', () => {
  const history = [
    ...progresses,
    { exerciseId: 'press', date: date(9), weight: 70 },
    { exerciseId: 'press', date: date(13), weight: 90 },
  ];
  const visible = filterProgressByDateRange(history.filter(entry => entry.exerciseId === 'press'), range);
  assert.deepEqual(visible.map(entry => entry.weight), [80, 85]);
  assert.equal(history.length, 6);
});