import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterProgressByDateRange, getProgressDateRange } from '../../src/features/progress/domain/progressDateRange.js';

const localDate = (year, month, day, hour = 12) => new Date(year, month - 1, day, hour);
const dayParts = date => [date.getFullYear(), date.getMonth() + 1, date.getDate()];

test('all time keeps the complete history without changing its order', () => {
  const data = [{ date: '2020-01-01T12:00:00Z' }, { date: '2026-10-06T12:00:00Z' }];
  assert.equal(getProgressDateRange('all'), null);
  assert.equal(filterProgressByDateRange(data, null), data);
});

test('presets use calendar months ending today, including year transitions', () => {
  const now = localDate(2026, 10, 6);
  for (const [period, expected] of [
    ['year', [2025, 10, 6]],
    ['sixMonths', [2026, 4, 6]],
    ['twoMonths', [2026, 8, 6]],
    ['month', [2026, 9, 6]],
  ]) {
    const range = getProgressDateRange(period, null, null, now);
    assert.deepEqual(dayParts(range.start), expected);
    assert.deepEqual(dayParts(range.end), [2026, 10, 6]);
    assert.equal(range.start.getHours(), 0);
    assert.equal(range.end.getHours(), 23);
    assert.equal(range.end.getMilliseconds(), 999);
  }
  assert.deepEqual(dayParts(now), [2026, 10, 6]);
});

test('month ends and leap days are clamped rather than overflowing into the next month', () => {
  for (const [period, now, expected] of [
    ['month', localDate(2026, 3, 31), [2026, 2, 28]],
    ['month', localDate(2024, 3, 31), [2024, 2, 29]],
    ['year', localDate(2024, 2, 29), [2023, 2, 28]],
  ]) {
    assert.deepEqual(dayParts(getProgressDateRange(period, null, null, now).start), expected);
  }
});

test('custom ranges include both whole days and exclude missing or invalid dates', () => {
  const start = localDate(2026, 9, 10);
  const end = localDate(2026, 9, 12);
  const range = getProgressDateRange('custom', start, end);
  const entries = [
    { id: 'before', date: new Date(2026, 8, 9, 23, 59, 59, 999).toISOString() },
    { id: 'start', date: new Date(2026, 8, 10, 0).toISOString() },
    { id: 'middle', date: localDate(2026, 9, 11).toISOString() },
    { id: 'end', date: new Date(2026, 8, 12, 23, 59, 59, 999).toISOString() },
    { id: 'after', date: new Date(2026, 8, 13, 0).toISOString() },
    { id: 'invalid', date: 'invalid' },
    { id: 'missing' },
  ];
  assert.deepEqual(filterProgressByDateRange(entries, range).map(entry => entry.id), ['start', 'middle', 'end']);
  assert.equal(start.getHours(), 12);
  assert.equal(end.getHours(), 12);
});

test('a single-day range includes its last millisecond and empty periods stay empty', () => {
  const date = localDate(2026, 10, 6);
  const range = getProgressDateRange('custom', date, date);
  const entry = { date: new Date(2026, 9, 6, 23, 59, 59, 999).toISOString() };
  assert.deepEqual(filterProgressByDateRange([entry], range), [entry]);
  assert.deepEqual(filterProgressByDateRange([{ date: localDate(2020, 1, 1).toISOString() }], range), []);
});
