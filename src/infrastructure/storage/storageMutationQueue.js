const pendingOperations = new Map();

/**
 * Serializa operaciones que leen y escriben la misma clave. La cola continúa
 * aunque una operación falle, pero cada caller recibe su error original.
 */
export function enqueueStorageOperation(key, operation) {
  const previous = pendingOperations.get(key) ?? Promise.resolve();
  const result = previous.then(operation);
  const tail = result.then(
    () => undefined,
    () => undefined
  );

  pendingOperations.set(key, tail);
  tail.then(() => {
    if (pendingOperations.get(key) === tail) {
      pendingOperations.delete(key);
    }
  });

  return result;
}
