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
            "CallExpression[callee.name='addImportsDir'] Literal[value=/runtime\\/models|\\.\\/runtime\\/models|\\.\\.\\/runtime\\/models/]",
          message:
            'addImportsDir(runtime/models) is disallowed; models are explicit imports only via #*-models/*.',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: (fileName) =>
        fileName.endsWith('.vue')
          ? require('vue-eslint-parser')
          : require('@typescript-eslint/parser'),
      parserOptions: {
        extraFileExtensions: ['.vue'],
        ecmaVersion: 2022,
        sourceType: 'module',
        project: false,
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['fireux-core/*', 'fireux-core/**'],
              message:
                'Do not import subpaths from fireux-core. Use module auto-imports or public API only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: false,
      },
    },
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
