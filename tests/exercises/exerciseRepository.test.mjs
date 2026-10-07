import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import * as repository from '../../src/features/exercises/data/exerciseRepository.js';
import defaults from '../../src/features/exercises/data/defaultExercises.json';
import { SORT_MODE } from '../../src/features/exercises/constants/sortModes.js';
import { STORAGE_KEYS as keys } from '../../src/infrastructure/storage/storageKeys.js';
import storage, { resetStorage } from '../support/asyncStorage.mjs';

beforeEach(() => resetStorage());
const samples = [{ id: 'a', name: 'Remo' }, { id: 'b', name: 'Curl' }];
test('siembra el catálogo inicial y guarda el orden personalizado', async () => {
  assert.deepEqual(await repository.getExercises(), defaults);
  assert.deepEqual(JSON.parse(await storage.getItem(keys.exercises)), defaults);
  assert.deepEqual(JSON.parse(await storage.getItem(keys.exerciseCustomOrder)), defaults.map(item => item.id));
});
test('no vuelve a sembrar una lista vacía guardada por el usuario', async () => {
  resetStorage({ [keys.exercises]: '[]' });
  assert.deepEqual(await repository.getExercises(), []);
});
test('recupera un catálogo corrupto o que no sea un array', async () => {
  for (const invalid of ['broken json', '{}', 'null']) {
    resetStorage({ [keys.exercises]: invalid });
    assert.deepEqual(await repository.getExercises(), defaults);
  }
});
test('reconcilia el orden, descarta ids eliminados e incorpora ejercicios nuevos', async () => {
  resetStorage({ [keys.exercises]: JSON.stringify(samples), [keys.exerciseCustomOrder]: '["b","deleted"]' });
  assert.deepEqual((await repository.getExercises()).map(item => item.id), ['b', 'a']);
  assert.equal(await storage.getItem(keys.exerciseCustomOrder), '["b","a"]');
});
test('un orden guardado inválido se reconstruye con el catálogo', async () => {
  for (const invalid of ['broken json', '{}']) {
    resetStorage({ [keys.exercises]: JSON.stringify(samples), [keys.exerciseCustomOrder]: invalid });
    assert.deepEqual(await repository.getExercises(), samples);
    assert.equal(await storage.getItem(keys.exerciseCustomOrder), '["a","b"]');
  }
});
test('crear, editar y borrar conserva los demás ejercicios y su orden', async () => {
  await repository.saveExercisesOrder(samples);
  await repository.saveExercise({ id: 'c', name: 'Press' });
  const changed = { id: 'b', name: 'Curl actualizado', description: 'Mancuernas' };
  assert.deepEqual(await repository.updateExercise(changed), [samples[0], changed, { id: 'c', name: 'Press' }]);
  assert.deepEqual(await repository.deleteExercise('c'), [samples[0], changed]);
  assert.equal(await storage.getItem(keys.exerciseCustomOrder), '["a","b"]');
});
test('guarda un nuevo orden y normaliza entradas que no sean arrays', async () => {
  assert.deepEqual(await repository.saveExercisesOrder([...samples].reverse()), [...samples].reverse());
  assert.deepEqual(await repository.getExercises(), [...samples].reverse());
  assert.deepEqual(await repository.saveExercisesOrder(null), []);
  assert.deepEqual(await repository.getExercises(), []);
});
test('valida y persiste todos los modos de orden', async () => {
  assert.equal(await repository.getExercisesSortMode(), SORT_MODE.CUSTOM);
  for (const mode of Object.values(SORT_MODE)) {
    assert.equal(await repository.saveExercisesSortMode(mode), mode);
    assert.equal(await repository.getExercisesSortMode(), mode);
  }
  assert.equal(await repository.saveExercisesSortMode('invalid'), SORT_MODE.CUSTOM);
  await storage.setItem(keys.exerciseSortMode, 'invalid');
  assert.equal(await repository.getExercisesSortMode(), SORT_MODE.CUSTOM);
});
test('altas simultáneas no pierden ejercicios ni ids del orden', async () => {
  await repository.saveExercisesOrder([]);
  await Promise.all(samples.map(repository.saveExercise));
  assert.deepEqual(await repository.getExercises(), samples);
  assert.equal(await storage.getItem(keys.exerciseCustomOrder), '["a","b"]');
});

