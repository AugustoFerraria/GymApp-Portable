import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import storageClient from '../../src/infrastructure/storage/storageClient.js';
import { STORAGE_KEYS } from '../../src/infrastructure/storage/storageKeys.js';
import { enqueueStorageOperation as enqueue } from '../../src/infrastructure/storage/storageMutationQueue.js';
import { resetStorage, calls, failNext } from '../support/asyncStorage.mjs';

beforeEach(() => resetStorage());
test('el adaptador delega las lecturas y escrituras con los valores originales', async () => {
  assert.equal(await storageClient.getItem('sample'), null);
  await storageClient.setItem('sample', 'value');
  assert.equal(await storageClient.getItem('sample'), 'value');
  assert.deepEqual(calls.map(call => call.operation), ['getItem', 'setItem', 'getItem']);
  assert.equal(calls[1].value, 'value');
});
test('el adaptador no oculta errores nativos', async () => {
  const error = new Error('Read failed');
  failNext('getItem', error);
  await assert.rejects(storageClient.getItem('sample'), caught => caught === error);
});
test('las claves de almacenamiento son únicas e inmutables', () => {
  assert.equal(new Set(Object.values(STORAGE_KEYS)).size, Object.keys(STORAGE_KEYS).length);
  assert.equal(Object.isFrozen(STORAGE_KEYS), true);
});
test('serializa operaciones de la misma clave', async () => {
  const events = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const first = enqueue('serial', async () => { events.push('first start'); await gate; events.push('first end'); return 1; });
  const second = enqueue('serial', () => { events.push('second'); return 2; });
  await Promise.resolve();
  assert.deepEqual(events, ['first start']);
  release();
  assert.deepEqual(await Promise.all([first, second]), [1, 2]);
  assert.deepEqual(events, ['first start', 'first end', 'second']);
});
test('una clave bloqueada no detiene operaciones de otras claves', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const blocked = enqueue('slow', () => gate);
  try { assert.equal(await enqueue('independent', () => 'done'), 'done'); }
  finally { release(); await blocked; }
});
test('un error conserva su identidad y no detiene la cola', async () => {
  const error = new Error('Operation failed');
  const failed = enqueue('recover', () => { throw error; });
  const recovered = enqueue('recover', () => 'recovered');
  await assert.rejects(failed, caught => caught === error);
  assert.equal(await recovered, 'recovered');
  assert.equal(await enqueue('recover', () => 'next'), 'next');
});

