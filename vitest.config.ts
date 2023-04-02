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
			src: ['src/**/*.ts'],
			exclude: [
				...configDefaults.exclude,
				'test',
				'**/*.test.ts',
				'src/types/errors.ts',
				'src/utils/constants.ts',
			],
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
});
