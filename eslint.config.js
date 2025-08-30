module.exports = [
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-restricted-imports': [
        'error',
        {
          'patterns': [
            {
              'group': ['**/packages/*/*/src/**'],
              'message': 'Use package exports instead of deep imports into /src. For fireux-core, use: fireux-core/config/*, fireux-core/runtime/*, fireux-core/models/*, fireux-core/server/*'
            }
          ]
        }
      ]
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: require('vue-eslint-parser'),
      parserOptions: {
        parser: require('@typescript-eslint/parser'),
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      vue: require('eslint-plugin-vue'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-restricted-imports': [
        'error',
        {
          'patterns': [
            {
              'group': ['**/packages/*/*/src/**'],
              'message': 'Use package exports instead of deep imports into /src. For fireux-core, use: fireux-core/config/*, fireux-core/runtime/*, fireux-core/models/*, fireux-core/server/*'
            }
          ]
        }
      ]
    },
  },
]
