import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import * as repository from '../../src/features/routines/data/routineRepository.js';
import { STORAGE_KEYS as keys } from '../../src/infrastructure/storage/storageKeys.js';
import storage, { resetStorage, failNext } from '../support/asyncStorage.mjs';

beforeEach(() => resetStorage());
const first = { id: 'r1', name: 'Pecho', exercises: [{ exerciseId: 'e1', sets: 3, reps: 10 }] };
const second = { id: 'r2', name: 'Espalda', exercises: [] };
test('un almacenamiento vacío devuelve una lista vacía', async () => {
  assert.deepEqual(await repository.getRoutines(), []);
});
test('crea, lee, edita y elimina rutinas conservando sus ejercicios', async () => {
  await repository.saveRoutine(first);
  await repository.saveRoutine(second);
  assert.deepEqual(await repository.getRoutines(), [first, second]);
  const updated = { ...first, name: 'Pecho y hombros' };
  assert.deepEqual(await repository.updateRoutine(updated), [updated, second]);
  assert.deepEqual(await repository.deleteRoutine('r2'), [updated]);
  assert.deepEqual(JSON.parse(await storage.getItem(keys.routines)), [updated]);
});
test('editar o borrar un id inexistente no elimina otras rutinas', async () => {
  await repository.saveRoutine(first);
  assert.deepEqual(await repository.updateRoutine({ id: 'missing' }), [first]);
  assert.deepEqual(await repository.deleteRoutine('missing'), [first]);
});
test('los guardados simultáneos no pierden rutinas', async () => {
  await Promise.all([repository.saveRoutine(first), repository.saveRoutine(second)]);
  assert.deepEqual(await repository.getRoutines(), [first, second]);
});
test('propaga errores de escritura y permite un guardado posterior', async () => {
  const error = new Error('Disk unavailable');
  failNext('setItem', error);
  await assert.rejects(repository.saveRoutine(first), caught => caught === error);
  await repository.saveRoutine(second);
  assert.deepEqual(await repository.getRoutines(), [second]);
});
test('informa JSON corrupto sin sobrescribirlo; la cola se recupera', async () => {
  resetStorage({ [keys.routines]: 'broken json' });
  await assert.rejects(repository.getRoutines(), SyntaxError);
  assert.equal(await storage.getItem(keys.routines), 'broken json');
  await storage.setItem(keys.routines, '[]');
  await repository.saveRoutine(first);
  assert.deepEqual(await repository.getRoutines(), [first]);
});

