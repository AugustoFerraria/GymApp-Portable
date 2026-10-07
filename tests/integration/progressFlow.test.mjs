import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { saveExercisesOrder, saveExercise, getExercises } from '../../src/features/exercises/data/exerciseRepository.js';
import { saveRoutine, getRoutines } from '../../src/features/routines/data/routineRepository.js';
import { addProgress, getProgress } from '../../src/features/progress/data/progressRepository.js';
import { getProgressDateRange, filterProgressByDateRange } from '../../src/features/progress/domain/progressDateRange.js';
import { resetStorage } from '../support/asyncStorage.mjs';

beforeEach(() => resetStorage());
test('ejercicio, rutina e historial se guardan sin interferir; gráfico y tabla usan el mismo período', async () => {
  await saveExercisesOrder([]);
  const exercise = { id: 'press', name: 'Pecho plano' };
  await saveExercise(exercise);
  const routine = { id: 'r1', name: 'Pecho', exercises: [{ exerciseId: exercise.id, sets: 3 }] };
  await saveRoutine(routine);
  for (const [month, weight] of [[7, 60], [9, 70], [10, 80]]) {
    await addProgress(exercise.id, { date: new Date(2026, month - 1, 6, 12).toISOString(), weight, reps: 8 });
  }
  assert.deepEqual(await getExercises(), [exercise]);
  assert.deepEqual(await getRoutines(), [routine]);
  const history = await getProgress(exercise.id);
  const range = getProgressDateRange('month', null, null, new Date(2026, 9, 6, 12));
  const visible = filterProgressByDateRange(history, range);
  const chart = [...visible].sort((a, b) => new Date(a.date) - new Date(b.date));
  const table = [...chart].reverse();
  assert.deepEqual(chart.map(entry => entry.weight), [70, 80]);
  assert.deepEqual(table.map(entry => entry.weight), [80, 70]);
  assert.deepEqual([...table].reverse(), chart);
  assert.equal(history.length, 3);
});

