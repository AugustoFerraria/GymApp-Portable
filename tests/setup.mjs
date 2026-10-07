import { register } from 'node:module';

// Only the test process uses this loader. Expo and production code are unchanged.
register('./support/loader.mjs', import.meta.url);

