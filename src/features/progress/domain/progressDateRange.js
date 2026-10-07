export const PROGRESS_PERIODS = Object.freeze([
  { value: 'all', label: 'Todos los tiempos' },
  { value: 'year', label: '1 año', months: 12 },
  { value: 'sixMonths', label: '6 meses', months: 6 },
  { value: 'twoMonths', label: '2 meses', months: 2 },
  { value: 'month', label: '1 mes', months: 1 },
  { value: 'custom', label: 'Personalizado' },
]);

export function getProgressDateRange(period, start, end, now = new Date()) {
  if (period === 'all') return null;

  let from;
  let to;
  if (period === 'custom') {
    if (!start || !end) return null;
    from = new Date(start);
    to = new Date(end);
  } else {
    const months = PROGRESS_PERIODS.find(option => option.value === period)?.months;
    if (!months) return null;
    to = new Date(now);
    from = new Date(now);
    const day = from.getDate();
    from.setDate(1);
    from.setMonth(from.getMonth() - months);
    const lastDay = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
    from.setDate(Math.min(day, lastDay));
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { start: from, end: to };
}

export function filterProgressByDateRange(data, range) {
  if (!range) return data;
  return data.filter(entry => {
    if (!entry?.date) return false;
    const date = new Date(entry.date);
    return date >= range.start && date <= range.end;
  });
}

export function hasProgressChartData(data, range) {
  return filterProgressByDateRange(data, range).some(
    entry => typeof entry.weight === 'number' && !Number.isNaN(entry.weight)
  );
}

export function getAvailableProgressPeriods(data, now = new Date()) {
  return Object.fromEntries(PROGRESS_PERIODS.map(option => [
    option.value,
    // The calendar stays available to choose dates; validate the range on Apply.
    option.value === 'custom' || hasProgressChartData(data, getProgressDateRange(option.value, null, null, now)),
  ]));
}

// Original header-calendar behavior: keep the catalog order, but only include
// exercises with at least one record inside the selected interval.
export function getExercisesWithProgressInRange(exercises, progresses, range) {
  if (!range) return exercises;
  const eligibleIds = new Set(
    filterProgressByDateRange(progresses, range).map(progress => progress.exerciseId)
  );
  return exercises.filter(exercise => eligibleIds.has(exercise.id));
}
