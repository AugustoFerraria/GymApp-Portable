import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import {
  getExercises,
  saveExercisesOrder,
  updateExercise,
  deleteExercise,
} from '../../src/features/exercises/data/exerciseRepository.js';
import {
  getRoutines,
  saveRoutine,
  updateRoutine,
  deleteRoutine,
} from '../../src/features/routines/data/routineRepository.js';
import { STORAGE_KEYS } from '../../src/infrastructure/storage/storageKeys.js';
import storage, { calls, resetStorage } from '../support/asyncStorage.mjs';

beforeEach(() => resetStorage());

const exercise = { id: 'curl', name: 'Curl original', description: 'Mancuernas' };
const renamed = { ...exercise, name: 'Curl actualizado' };
const routine = {
  id: 'arms',
  name: 'Brazos',
  description: 'Rutina de brazos',
  exercises: [
    { id: exercise.id, name: exercise.name, series: 3, reps: 10 },
    { id: 'press', name: 'Press', series: 4, reps: 8 },
  ],
};

async function seed() {
  await saveExercisesOrder([exercise, { id: 'press', name: 'Press' }]);
  await saveRoutine(routine);
}

test('renombrar un ejercicio actualiza su nombre en todas las rutinas sin cambiar los demás campos', async () => {
  await seed();
  await saveRoutine({ ...routine, id: 'arms2' });
  await updateExercise(renamed);
  const routines = await getRoutines();
  for (const result of routines) {
    assert.equal(result.exercises[0].name, renamed.name);
    assert.deepEqual(result.exercises[0], { ...routine.exercises[0], name: renamed.name });
    assert.deepEqual(result.exercises[1], routine.exercises[1]);
    assert.equal(result.name, routine.name);
    assert.equal(result.description, routine.description);
  }
  assert.equal(routines.length, 2);
});

test('corrige nombres antiguos al leer, sin modificar los datos guardados de la rutina', async () => {
  await saveExercisesOrder([renamed]);
  await saveRoutine(routine);
  const stored = await storage.getItem(STORAGE_KEYS.routines);
  assert.equal((await getRoutines())[0].exercises[0].name, renamed.name);
  assert.equal(await storage.getItem(STORAGE_KEYS.routines), stored);
});

test('guardar una edición con un nombre viejo no revierte el nombre del catálogo', async () => {
  await seed();
  await updateExercise(renamed);
  const staleDraft = { ...routine, exercises: [{ ...routine.exercises[0], series: 5 }, routine.exercises[1]] };
  await updateRoutine(staleDraft);
  const current = (await getRoutines())[0];
  assert.equal(current.exercises[0].name, renamed.name);
  assert.equal(current.exercises[0].series, 5);
  assert.equal((await getExercises()).find(item => item.id === exercise.id).name, renamed.name);
});

test('si el ejercicio fue eliminado conserva el nombre y la configuración de la rutina', async () => {
  await seed();
  await deleteExercise(exercise.id);
  assert.deepEqual((await getRoutines())[0].exercises, routine.exercises);
});

test('las rutinas vacías o sin ejercicios siguen siendo legibles', async () => {
  await saveExercisesOrder([]);
  const empty = { id: 'empty', name: 'Vacía', exercises: [] };
  const legacy = { id: 'legacy', name: 'Sin campo exercises' };
  await saveRoutine(empty);
  await saveRoutine(legacy);
  assert.deepEqual(await getRoutines(), [empty, legacy]);
});

test('leer sin rutinas no siembra ni consulta el catálogo de ejercicios', async () => {
  assert.deepEqual(await getRoutines(), []);
  assert.deepEqual(calls.map(call => call.key), [STORAGE_KEYS.routines]);
});

test('los resultados de editar y borrar rutinas también muestran el nombre vigente', async () => {
  await seed();
  await saveRoutine({ ...routine, id: 'arms2' });
  await updateExercise(renamed);
  const edited = await updateRoutine({ ...routine, name: 'Brazos editada' });
  assert.ok(edited.every(item => item.exercises[0].name === renamed.name));
  const remaining = await deleteRoutine('arms2');
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].exercises[0].name, renamed.name);
});