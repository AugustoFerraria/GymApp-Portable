import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const directory = dirname(fileURLToPath(import.meta.url));
function findTests(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? findTests(path) : entry.name.endsWith('.test.mjs') ? [path] : [];
  });
}

const child = spawn(process.execPath, [
  '--import', new URL('./setup.mjs', import.meta.url).href,
  ...process.argv.slice(2),
  '--test', ...findTests(directory).sort(),
], { stdio: 'inherit' });
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
