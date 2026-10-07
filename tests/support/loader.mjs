import { readFile, access } from 'node:fs/promises';

const sourceRoot = new URL('../../src/', import.meta.url).href;
const storageMock = new URL('./asyncStorage.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@react-native-async-storage/async-storage') {
    return { url: storageMock, shortCircuit: true };
  }
  // Metro accepts extensionless relative imports; Node needs the .js extension.
  if (context.parentURL?.startsWith(sourceRoot) && specifier.startsWith('.')) {
    const candidate = new URL(`${specifier}.js`, context.parentURL);
    try {
      await access(candidate);
      return { url: candidate.href, shortCircuit: true };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith(sourceRoot) && (url.endsWith('.js') || url.endsWith('.json'))) {
    const source = await readFile(new URL(url), 'utf8');
    return {
      format: 'module',
      source: url.endsWith('.json') ? `export default ${JSON.stringify(JSON.parse(source))};` : source,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}

