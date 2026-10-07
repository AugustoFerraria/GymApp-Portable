import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getAvailableProgressPeriods,
  getProgressDateRange,
  hasProgressChartData,
} from '../../src/features/progress/domain/progressDateRange.js';

const now = new Date(2026, 9, 7, 12);
const entry = date => ({ date: date.toISOString(), weight: 12.5, reps: 10 });

test('deshabilita los períodos sin registros para el gráfico', () => {
  const data = [entry(new Date(2026, 6, 7, 12))];
  assert.deepEqual(getAvailableProgressPeriods(data, now), {
    all: true, year: true, sixMonths: true, twoMonths: false, month: false, custom: true,
  });
});

test('con registros recientes todos los períodos quedan habilitados', () => {
  const data = [entry(new Date(2026, 9, 7, 12))];
  assert.ok(Object.values(getAvailableProgressPeriods(data, now)).every(Boolean));
});

test('All sigue disponible aunque todos los registros sean de hace más de un año', () => {
  const data = [entry(new Date(2020, 0, 1, 12))];
  assert.deepEqual(getAvailableProgressPeriods(data, now), {
    all: true, year: false, sixMonths: false, twoMonths: false, month: false, custom: true,
  });
});

test('sin datos ningún período fijo está habilitado y el calendario puede elegir fechas', () => {
  assert.deepEqual(getAvailableProgressPeriods([], now), {
    all: false, year: false, sixMonths: false, twoMonths: false, month: false, custom: true,
  });
});

test('un rango personalizado vacío no es aplicable; los límites completos sí cuentan', () => {
  const range = getProgressDateRange('custom', new Date(2026, 9, 7), new Date(2026, 9, 7));
  assert.equal(hasProgressChartData([entry(new Date(2026, 9, 6, 23, 59, 59, 999))], range), false);
  assert.equal(hasProgressChartData([entry(new Date(2026, 9, 8, 0))], range), false);
  assert.equal(hasProgressChartData([entry(new Date(2026, 9, 7, 0))], range), true);
  assert.equal(hasProgressChartData([entry(new Date(2026, 9, 7, 23, 59, 59, 999))], range), true);
});

test('solo cuentan valores de peso renderizables; cero y decimales son válidos', () => {
  const range = getProgressDateRange('month', null, null, now);
  const base = entry(now);
  assert.equal(hasProgressChartData([{ ...base, weight: '12.5' }, { ...base, weight: NaN }, { date: base.date }], range), false);
  assert.equal(hasProgressChartData([{ ...base, weight: 0 }], range), true);
  assert.equal(hasProgressChartData([base], range), true);
  assert.equal(base.weight, 12.5);
});