import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { getThemePreference, saveThemePreference } from '../../src/shared/theme/themePreferenceRepository.js';
import { STORAGE_KEYS } from '../../src/infrastructure/storage/storageKeys.js';
import storage, { resetStorage, failNext } from '../support/asyncStorage.mjs';

beforeEach(() => resetStorage());
test('no tener preferencia es distinto de elegir el tema claro', async () => {
  assert.equal(await getThemePreference(), null);
  await saveThemePreference(false);
  assert.equal(await getThemePreference(), false);
});
test('guarda y recupera ambas preferencias', async () => {
  for (const preference of [true, false]) {
    await saveThemePreference(preference);
    assert.equal(await getThemePreference(), preference);
    assert.equal(await storage.getItem(STORAGE_KEYS.themePreference), String(preference));
  }
});
test('normaliza los valores antes de guardarlos', async () => {
  await saveThemePreference(undefined);
  assert.equal(await getThemePreference(), false);
  await saveThemePreference(1);
  assert.equal(await getThemePreference(), true);
});
test('propaga los errores al guardar la preferencia', async () => {
  failNext('setItem');
  await assert.rejects(saveThemePreference(true), /Simulated storage failure/);
  assert.equal(await getThemePreference(), null);
});

