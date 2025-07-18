/**
 * ESLint Plugin for FireUX Unified Structure Enforcement
 * Custom rules to maintain consistent folder structure across package/runtime and app/ levels
 * Both follow the same Nuxt conventional structure pattern
 */

const path = require('path')

module.exports = {
  rules: {
    // Rule: Ensure unified structure pattern compliance
    'unified-structure-compliance': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Ensure files are in correct unified structure directories',
          category: 'Structure',
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename()

            // Check if file is in a structure directory
            if (this.isInStructureDirectory(filename)) {
              const level = this.getStructureLevel(filename)
              const directory = this.getStructureDirectory(filename)

              if (!this.isValidStructureDirectory(directory)) {
                context.report({
                  node,
                  message: `File should be in standard Nuxt directory at ${level} level. Found: ${directory}`,
                })
              }
            }
          },
        }
      },

      isInStructureDirectory(filename) {
        return filename.includes('/src/runtime/') || filename.includes('/app/')
      },

      getStructureLevel(filename) {
        if (filename.includes('/src/runtime/')) return 'package runtime'
        if (filename.includes('/app/')) return 'app'
        return 'unknown'
      },

      getStructureDirectory(filename) {
        const parts = filename.split('/')
        const runtimeIndex = parts.indexOf('runtime')
        const appIndex = parts.indexOf('app')

        if (runtimeIndex !== -1 && runtimeIndex + 1 < parts.length) {
          return parts[runtimeIndex + 1]
        }
        if (appIndex !== -1 && appIndex + 1 < parts.length) {
          return parts[appIndex + 1]
        }
        return null
      },

      isValidStructureDirectory(directory) {
        const validDirs = [
          'components',
          'composables',
          'pages',
          'layouts',
          'middleware',
          'plugins',
          'types',
          'models',
          'config',
        ]
        return validDirs.includes(directory)
      },
    },
    // Rule: Route functions must be in app/routes/ directories
    'routes-in-routes-dir': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Route functions must be in app/routes/ directories',
          category: 'Structure',
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        return {
          ExportNamedDeclaration(node) {
            const filename = context.getFilename()

            // Check if this is a route function
            if (node.declaration && node.declaration.id) {
              const exportName = node.declaration.id.name

              if (exportName.toLowerCase().includes('route')) {
                // Check if it's in the correct directory
                if (!filename.includes('/app/routes/')) {
                  context.report({
                    node,
                    message: `Route function '${exportName}' should be in app/routes/ directory`,
                  })
                }
              }
            }
          },
        }
      },
    },

    // Rule: Component prefixes must match package
    'component-prefixes': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Components must have correct prefixes based on package',
          category: 'Structure',
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename()

            if (filename.endsWith('.vue')) {
              const packageName = this.getPackageName(filename)
              const componentName = path.basename(filename, '.vue')
              const expectedPrefix = this.getExpectedPrefix(packageName)

              if (expectedPrefix && !componentName.startsWith(expectedPrefix)) {
                context.report({
                  node,
                  message: `Component '${componentName}' should start with '${expectedPrefix}' prefix`,
                })
              }
            }
          },
        }
      },

      getPackageName(filename) {
        if (filename.includes('fireux-core')) return 'core'
        if (filename.includes('fireux-jobs')) return 'jobs'
        if (filename.includes('fireux-misebox')) return 'misebox'
        if (filename.includes('fireux-places')) return 'places'
        if (filename.includes('fireux-cleanbox')) return 'cleanbox'
        return null
      },

      getExpectedPrefix(packageName) {
        const prefixes = {
          core: 'Fire',
          jobs: 'Job',
          misebox: 'Mise',
          places: 'Place',
          cleanbox: 'Clean',
        }
        return prefixes[packageName]
      },
    },

    // Rule: Utils must be properly categorized
    'utils-categorization': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Utils must be in categorized directories, not generic utils/',
          category: 'Structure',
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename()

            // Check if file is in a generic utils directory
            if (
              filename.includes('/composables/utils/') &&
              !filename.includes('/app/utils/') &&
              !filename.includes('/firestore/') &&
              !filename.includes('/effects/')
            ) {
              context.report({
                node,
                message:
                  'Utils should be categorized in app/utils/, entity/utils/, or effects/utils/, not generic utils/',
              })
            }
          },
        }
      },
    },

    // Rule: Models must have .model.ts suffix
    'model-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Model files must have .model.ts suffix',
          category: 'Structure',
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename()

            if (
              filename.includes('/models/') &&
              filename.endsWith('.ts') &&
              !filename.endsWith('.model.ts') &&
              !filename.endsWith('index.ts') &&
              !filename.includes('/utils/')
            ) {
              context.report({
                node,
                message: 'Model files should have .model.ts suffix',
              })
            }
          },
        }
      },
    },

    // Rule: No deep relative imports across packages
    'no-cross-package-relative-imports': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Use workspace imports instead of deep relative paths across packages',
          category: 'Structure',
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const importPath = node.source.value

            // Check for excessive relative imports (likely cross-package)
            if (importPath.includes('../../../../../../')) {
              context.report({
                node,
                message:
                  'Use workspace imports (fireux-core, fireux-jobs, etc.) instead of deep relative paths',
              })
            }
          },
        }
      },
    },
  },

  configs: {
    recommended: {
      plugins: ['fireux-structure'],
      rules: {
        'fireux-structure/unified-structure-compliance': 'warn',
        'fireux-structure/routes-in-routes-dir': 'error',
        'fireux-structure/component-prefixes': 'warn',
        'fireux-structure/utils-categorization': 'error',
        'fireux-structure/model-naming': 'warn',
        'fireux-structure/no-cross-package-relative-imports': 'error',
      },
    },
  },
}
