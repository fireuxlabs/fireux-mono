import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.nuxt/**',
      '.output/**',
      'coverage/**',
    ],
  },
  // Disallow auto-importing models via addImportsDir in config files
  {
    files: ['**/src/config/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name='addImportsDir'] Literal[value='runtime/models'], CallExpression[callee.name='addImportsDir'] Literal[value='./runtime/models'], CallExpression[callee.name='addImportsDir'] Literal[value='../runtime/models']",
          message:
            'addImportsDir(runtime/models) is disallowed; models are explicit imports only via #*-models/*.',
        },
      ],
    },
  },
  // Vue SFCs
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        ecmaVersion: 2022,
        sourceType: 'module',
        project: false,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['fireux-core/src/*', 'fireux-core/src/**'],
              message:
                'Do not import internal source files from fireux-core; use exported runtime modules instead.',
            },
          ],
        },
      ],
    },
  },
  // TS/JS files
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: false,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['fireux-core/src/*', 'fireux-core/src/**'],
              message:
                'Do not import internal source files from fireux-core; use exported runtime modules instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: false,
      },
    },
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
