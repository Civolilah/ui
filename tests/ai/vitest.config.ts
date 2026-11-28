import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['tests/ai/**/*.eval.ts'],
    setupFiles: ['tests/ai/setup.ts'],
    testTimeout: 60000,
  },
});
