/// <reference types="vitest" />
/// <reference types="vite/client" />
// noinspection JSAnnotator

import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			reporter: ['text', 'lcov', 'html'],
			exclude: [...configDefaults.exclude, 'test', '**/*.test.ts'],
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
});
