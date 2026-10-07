import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { saveExercisesOrder, saveExercise, getExercises } from '../../src/features/exercises/data/exerciseRepository.js';
import { saveRoutine, getRoutines } from '../../src/features/routines/data/routineRepository.js';
import { addProgress, getProgress, getProgresses } from '../../src/features/progress/data/progressRepository.js';
import { getProgressDateRange, filterProgressByDateRange, getExercisesWithProgressInRange } from '../../src/features/progress/domain/progressDateRange.js';
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

test('calendario superior: ejercicios e historial se filtran; al quitarlo vuelve el catálogo completo', async () => {
  const exercises = [{ id: 'press', name: 'Press' }, { id: 'curl', name: 'Curl' }, { id: 'unused', name: 'Sin registros' }];
  await saveExercisesOrder(exercises);
  await addProgress('press', { date: new Date(2026, 8, 10, 0).toISOString(), weight: 80 });
  await addProgress('press', { date: new Date(2026, 8, 12, 23, 59, 59, 999).toISOString(), weight: 85 });
  await addProgress('press', { date: new Date(2026, 9, 6, 12).toISOString(), weight: 90 });
  await addProgress('curl', { date: new Date(2026, 9, 6, 12).toISOString(), weight: 20 });
  const catalog = await getExercises();
  const history = await getProgresses();
  const headerRange = getProgressDateRange('custom', new Date(2026, 8, 10), new Date(2026, 8, 12));
  assert.deepEqual(getExercisesWithProgressInRange(catalog, history, headerRange), [exercises[0]]);
  const selectedHistory = await getProgress('press');
  assert.deepEqual(filterProgressByDateRange(selectedHistory, headerRange).map(entry => entry.weight), [80, 85]);
  assert.deepEqual(getExercisesWithProgressInRange(catalog, history, null), exercises);
  assert.equal((await getProgresses()).length, 4);
});

test('selector del gráfico: los períodos y rangos personalizados no restringen ejercicios', async () => {
  const exercises = [{ id: 'press', name: 'Press' }, { id: 'curl', name: 'Curl' }];
  await saveExercisesOrder(exercises);
  await addProgress('press', { date: new Date(2026, 8, 10, 12).toISOString(), weight: 80 });
  await addProgress('press', { date: new Date(2026, 9, 6, 12).toISOString(), weight: 90 });
  const history = await getProgress('press');
  for (const [chartRange, expectedWeights] of [
    [getProgressDateRange('month', null, null, new Date(2026, 9, 7)), [80, 90]],
    [getProgressDateRange('custom', new Date(2026, 8, 10), new Date(2026, 8, 10)), [80]],
  ]) {
    assert.deepEqual(getExercisesWithProgressInRange(await getExercises(), await getProgresses(), null), exercises);
    assert.deepEqual(filterProgressByDateRange(history, chartRange).map(entry => entry.weight), expectedWeights);
  }
});
