import js from '@eslint/js';
import globals from 'globals';

export default [
	{
		ignores: ['src/test/webapp/**/*'],
	},
	js.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				QUnit: true,
				tests: true,
			},
		},
		rules: {
			'no-var': 'error',
			'prefer-const': 'error',
			'quotes': ['error', 'single', { 'avoidEscape': true }],
		},
	},
];