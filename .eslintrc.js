module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
  ignorePatterns: ['node_modules/*'],
  extends: ['eslint:recommended'],
  overrides: [
    {
      files: ['**/*.ts'],
      settings: {
        'import/resolver': {
          typescript: {},
          node: {
            extensions: ['.js', '.ts'],
          },
        },
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: './',
      },
      plugins: ['@typescript-eslint', 'import'],
      extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      rules: {
        'no-restricted-imports': ['error'],
        'linebreak-style': ['error', 'unix'],
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
              'object',
            ],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
        'import/default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/no-named-as-default': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/explicit-function-return-type': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/no-explicit-any': ['off'],
        'prettier/prettier': [
          'error',
          {},
          {
            usePrettierrc: true,
          },
        ],
      },
    },
  ],
};
