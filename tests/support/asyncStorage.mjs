const values = new Map();
const failures = new Map();
export const calls = [];

export function resetStorage(initialValues = {}) {
  values.clear();
  failures.clear();
  calls.length = 0;
  for (const [key, value] of Object.entries(initialValues)) values.set(key, value);
}

export function failNext(operation, error = new Error('Simulated storage failure')) {
  failures.set(operation, error);
}

function record(operation, key, value) {
  calls.push({ operation, key, value });
  if (failures.has(operation)) {
    const error = failures.get(operation);
    failures.delete(operation);
    throw error;
  }
}

export default {
  async getItem(key) {
    record('getItem', key);
    return values.get(key) ?? null;
  },
  async setItem(key, value) {
    record('setItem', key, value);
    values.set(key, value);
  },
};

