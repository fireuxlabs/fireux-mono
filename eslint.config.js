import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const baseRestrictedImportPatterns = [
  {
    group: ['fireux-core/src/*', 'fireux-core/src/**'],
    message:
      'Do not import internal source files from fireux-core; use exported runtime modules instead.',
  },
  {
    group: ['**/*.ts'],
    message:
      'Do not import with a .ts suffix; drop the extension (works better across tooling).',
  },
  {
    group: [
      // Outside a package, never deep-relative into other packages; use the package name.
      '../**/packages/*/*/*',
      '../**/packages/*/*/**',
      './**/packages/*/*/*',
      './**/packages/*/*/**',
      // Also forbid "root-ish" specifiers like "packages/core/...".
      'packages/*/*/*',
      'packages/*/*/**',
    ],
    message:
      'Do not deep-relative import into other workspace packages; import via the package name instead (e.g. fireux-core/runtime/*).',
  },
]

const makeNoRestrictedImportsRule = ({
  patterns = baseRestrictedImportPatterns,
  paths = [],
} = {}) => [
  'error',
  {
    ...(paths.length ? { paths } : {}),
    ...(patterns.length ? { patterns } : {}),
  },
]

const getPackages = () => {
  const roots = ['core', 'ecosystem', 'extensions']
  const result = []

  for (const root of roots) {
    const rootDir = path.join(__dirname, 'packages', root)
    if (!fs.existsSync(rootDir)) continue

    const children = fs
      .readdirSync(rootDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)

    for (const child of children) {
      const pkgDir = path.join(rootDir, child)
      const pkgJsonPath = path.join(pkgDir, 'package.json')
      if (!fs.existsSync(pkgJsonPath)) continue

      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
        const name = pkgJson?.name
        if (!name || typeof name !== 'string') continue
        result.push({
          name,
          dir: `packages/${root}/${child}`,
        })
      } catch {
        // Ignore invalid package.json files
      }
    }
  }

  return result
}

const makeSelfImportBanPatterns = (pkgName) => [
  ...baseRestrictedImportPatterns,
  {
    group: [pkgName, `${pkgName}/*`, `${pkgName}/**`],
    message: `Self-imports are forbidden inside ${pkgName}; use relative imports instead.`,
  },
]

const makeInternalAliasBanPatterns = (aliasPrefix) => [
  {
    group: [aliasPrefix, `${aliasPrefix}/*`, `${aliasPrefix}/**`],
    message:
      'Internal path aliases are package-scoped; outside the package, import via the package name instead.',
  },
]

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/dist/**',
      'build/**',
      '.nuxt/**',
      '.output/**',
      '**/.output/**',
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
      'no-restricted-imports': makeNoRestrictedImportsRule(),
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
      'no-restricted-imports': makeNoRestrictedImportsRule(),
    },
  },

  // Ban self-imports inside each workspace package (prevents drift back to "from '<pkg>/*'" internally)
  ...getPackages().map(({ name, dir }) => ({
    files: [`${dir}/**/*.{js,ts,vue}`],
    rules: {
      'no-restricted-imports': makeNoRestrictedImportsRule({
        patterns: makeSelfImportBanPatterns(name),
      }),
    },
  })),

  // Ban use of internal aliases outside each package (outside must use package imports)
  ...getPackages().map(({ name, dir }) => ({
    files: ['**/*.{js,ts,vue}'],
    ignores: [`${dir}/**`],
    rules: {
      'no-restricted-imports': makeNoRestrictedImportsRule({
        patterns: [...baseRestrictedImportPatterns, ...makeInternalAliasBanPatterns(`#${name}`)],
      }),
    },
  })),

  // Special-case: fireux-core exports additional internal aliases that must remain package-scoped
  {
    files: ['**/*.{js,ts,vue}'],
    ignores: ['packages/core/fireux-core/**'],
    rules: {
      'no-restricted-imports': makeNoRestrictedImportsRule({
        patterns: [
          ...baseRestrictedImportPatterns,
          ...makeInternalAliasBanPatterns('#fireux-core-runtime'),
          ...makeInternalAliasBanPatterns('#fireux-core-composables'),
          ...makeInternalAliasBanPatterns('#fireux-core-models'),
        ],
      }),
    },
  },

  // fireux-products: forbid relative Firestore manager imports; use fireux-core runtime path
  // (placed after global + package rules so it actually applies)
  {
    files: ['packages/extensions/fireux-products/src/runtime/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': makeNoRestrictedImportsRule({
        patterns: makeSelfImportBanPatterns('fireux-products'),
        paths: [
          {
            name: '../../operations/useFirestoreManager',
            message:
              'Import useFirestoreManager from fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager',
          },
          {
            name: '../../../operations/useFirestoreManager',
            message:
              'Import useFirestoreManager from fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager',
          },
          {
            name: '../../operations/useFirestoreManager.ts',
            message:
              'Import useFirestoreManager from fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager',
          },
          {
            name: '../../../operations/useFirestoreManager.ts',
            message:
              'Import useFirestoreManager from fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager',
          },
        ],
      }),
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
