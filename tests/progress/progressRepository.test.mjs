import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import * as repository from '../../src/features/progress/data/progressRepository.js';
import { STORAGE_KEYS as keys } from '../../src/infrastructure/storage/storageKeys.js';
import storage, { resetStorage, failNext } from '../support/asyncStorage.mjs';

beforeEach(() => resetStorage());
const first = { exerciseId: 'e1', date: '2026-10-06T12:00:00.123Z', weight: 80, reps: 8, failure: false };
const second = { ...first, exerciseId: 'e2' };
test('devuelve listas vacías cuando no hay registros', async () => {
  assert.deepEqual(await repository.getProgresses(), []);
  assert.deepEqual(await repository.getProgress('e1'), []);
});
test('guarda todos los campos y filtra por ejercicio', async () => {
  await repository.saveProgress(first);
  await repository.saveProgress(second);
  assert.deepEqual(await repository.getProgresses(), [first, second]);
  assert.deepEqual(await repository.getProgress('e1'), [first]);
  assert.deepEqual(await repository.getProgress('missing'), []);
});
test('agregar devuelve únicamente el historial del ejercicio elegido', async () => {
  await repository.saveProgress(second);
  const { exerciseId, ...entry } = first;
  assert.deepEqual(await repository.addProgress(exerciseId, entry), [first]);
  assert.deepEqual(await repository.getProgresses(), [second, first]);
});
test('edita un registro sin cambiar otro ejercicio ni otra fecha', async () => {
  const later = { ...first, date: '2026-10-07T12:00:00.123Z' };
  await Promise.all([first, second, later].map(repository.saveProgress));
  const updates = { weight: 85, reps: 6, failure: true };
  assert.deepEqual(await repository.updateProgress(first, updates), [{ ...first, ...updates }, second, later]);
});
test('borra por peso y distingue registros del mismo día', async () => {
  const otherWeight = { ...first, weight: 70 };
  await Promise.all([first, second, otherWeight].map(repository.saveProgress));
  assert.deepEqual(await repository.deleteProgress(first), [second, otherWeight]);
});
test('borra por repeticiones cuando el registro no tiene peso', async () => {
  const entry = { exerciseId: 'e1', date: first.date, reps: 10 };
  const other = { ...entry, reps: 12 };
  await Promise.all([entry, other].map(repository.saveProgress));
  assert.deepEqual(await repository.deleteProgress(entry), [other]);
});
test('editar y borrar registros inexistentes conserva el historial', async () => {
  await repository.saveProgress(first);
  const missing = { ...first, exerciseId: 'missing' };
  assert.deepEqual(await repository.updateProgress(missing, { weight: 100 }), [first]);
  assert.deepEqual(await repository.deleteProgress(missing), [first]);
});
test('agregados simultáneos no pierden registros', async () => {
  await Promise.all(Array.from({ length: 12 }, (_, reps) => repository.addProgress('e1', { date: first.date, reps })));
  assert.deepEqual((await repository.getProgress('e1')).map(item => item.reps), Array.from({ length: 12 }, (_, index) => index));
});
test('propaga errores y no bloquea operaciones posteriores', async () => {
  const error = new Error('Storage unavailable');
  failNext('getItem', error);
  await assert.rejects(repository.getProgresses(), caught => caught === error);
  await repository.saveProgress(first);
  assert.deepEqual(await repository.getProgresses(), [first]);
});
test('informa datos corruptos sin borrarlos', async () => {
  resetStorage({ [keys.progresses]: 'broken json' });
  await assert.rejects(repository.getProgresses(), SyntaxError);
  assert.equal(await storage.getItem(keys.progresses), 'broken json');
});

