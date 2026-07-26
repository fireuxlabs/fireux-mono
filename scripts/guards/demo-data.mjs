// @fireux-script
// last_used: 2026-07-25
// usage_note: enforces owner-local, deferred, read-only Demo World consumers.
// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: lock fixture ownership and lazy console consumption.
// Concurrent edit — 2026-07-22 12:38 CEST — Product Demo contract pass: admit one named project adapter and the public route namespace.
// Concurrent edit — 2026-07-22 13:03 CEST — Product Demo dependency pass: enforce pure adapters and project-declared package Demo owners.
// FILE: scripts/guards/demo-data.mjs

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import {
  GENERATED_DIRECTORY_NAMES,
  LOCAL_ONLY_ROOT_PATHS,
} from './_lib/filesystem-policy.mjs'

const SOURCE_EXTENSIONS = new Set([
  '.cjs',
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.vue',
])

const SKIP_DIRECTORIES = new Set([
  '.git',
  ...GENERATED_DIRECTORY_NAMES,
  ...LOCAL_ONLY_ROOT_PATHS,
])

const NON_DEMO_FIXTURE_SEGMENTS = new Set([
  'dev',
  'development',
  'simulation',
  'simulations',
  'test',
  'tests',
])

const FORBIDDEN_DEMO_DEPENDENCY_SEGMENTS = new Set([
  'admin',
  'mutation',
  'mutations',
  'public',
  'server',
])

const FORBIDDEN_DEMO_VALUE_MODULES = [
  '@firebase/firestore',
  '@firebase/storage',
  'firebase-admin',
  'firebase/firestore',
  'firebase/storage',
  'vuefire',
]

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function repoRelative(repoRoot, file) {
  return toPosix(path.relative(repoRoot, file))
}

function canonicalDemoRoot(relativePath) {
  const packageMatch = relativePath.match(
    /^(packages\/(?:core|ecosystem|extensions)\/[^/]+\/src\/runtime\/demo)(?:\/|$)/
  )
  if (packageMatch?.[1]) return packageMatch[1]

  const projectMatch = relativePath.match(
    /^(projects\/[^/]+\/[^/]+\/app\/demo)(?:\/|$)/
  )
  return projectMatch?.[1] ?? null
}

function isProductDemoRouteDirectory(relativePath) {
  return /^(projects\/[^/]+\/[^/]+\/app\/pages\/demo)(?:\/|$)/.test(
    relativePath
  )
}

function ownerRoot(relativePath) {
  const packageMatch = relativePath.match(
    /^(packages\/(?:core|ecosystem|extensions)\/[^/]+)(?:\/|$)/
  )
  if (packageMatch?.[1]) return packageMatch[1]

  const projectMatch = relativePath.match(/^(projects\/[^/]+\/[^/]+)(?:\/|$)/)
  return projectMatch?.[1] ?? null
}

function walkRepository(repoRoot) {
  const files = []
  const demoDirectories = []
  const pending = [repoRoot]

  while (pending.length) {
    const current = pending.pop()
    if (!current) continue

    let entries = []
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue

      const absolutePath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (SKIP_DIRECTORIES.has(entry.name)) continue
        if (entry.name.toLowerCase() === 'demo') {
          demoDirectories.push(absolutePath)
        }
        pending.push(absolutePath)
        continue
      }

      if (!entry.isFile()) continue
      if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue
      files.push(absolutePath)
    }
  }

  return { demoDirectories, files }
}

function readPackageName(packagePath) {
  if (!existsSync(packagePath)) return ''
  try {
    const parsed = JSON.parse(readFileSync(packagePath, 'utf8'))
    return typeof parsed.name === 'string' ? parsed.name.trim() : ''
  } catch {
    return ''
  }
}

function readDeclaredDependencies(packagePath) {
  if (!existsSync(packagePath)) return new Set()
  try {
    const parsed = JSON.parse(readFileSync(packagePath, 'utf8'))
    return new Set(
      [
        'dependencies',
        'devDependencies',
        'optionalDependencies',
        'peerDependencies',
      ].flatMap((field) => Object.keys(parsed[field] ?? {}))
    )
  } catch {
    return new Set()
  }
}

function childDirectoryNames(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
}

function packageOwners(repoRoot) {
  const owners = new Map()

  for (const family of ['core', 'ecosystem', 'extensions']) {
    const familyRoot = path.join(repoRoot, 'packages', family)
    for (const packageDirectory of childDirectoryNames(familyRoot)) {
      const root = `packages/${family}/${packageDirectory}`
      const name = readPackageName(path.join(repoRoot, root, 'package.json'))
      if (name) owners.set(name, root)
    }
  }

  const projectsRoot = path.join(repoRoot, 'projects')
  for (const projectFamily of childDirectoryNames(projectsRoot)) {
    const familyRoot = path.join(projectsRoot, projectFamily)
    for (const projectDirectory of childDirectoryNames(familyRoot)) {
      const root = `projects/${projectFamily}/${projectDirectory}`
      const name = readPackageName(path.join(repoRoot, root, 'package.json'))
      if (name) owners.set(name, root)
    }
  }

  return owners
}

function isTypeOnlyImport(node) {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause
    if (!clause) return false
    if (clause.isTypeOnly) return true
    if (clause.name) return false
    if (!clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
      return false
    }
    return (
      clause.namedBindings.elements.length > 0 &&
      clause.namedBindings.elements.every((element) => element.isTypeOnly)
    )
  }

  return ts.isExportDeclaration(node) && node.isTypeOnly
}

function collectImports(source, fileName, lineOffset = 0) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const imports = []

  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      const position = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile)
      )
      imports.push({
        kind: 'static',
        line: position.line + 1 + lineOffset,
        specifier: node.moduleSpecifier.text,
        typeOnly: isTypeOnlyImport(node),
      })
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      const position = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile)
      )
      imports.push({
        kind: 'dynamic',
        line: position.line + 1 + lineOffset,
        specifier: node.arguments[0].text,
        typeOnly: false,
      })
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'require' &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      const position = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile)
      )
      imports.push({
        kind: 'static',
        line: position.line + 1 + lineOffset,
        specifier: node.arguments[0].text,
        typeOnly: false,
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return imports
}

function importsForFile(file, source) {
  if (!file.endsWith('.vue')) return collectImports(source, file)

  const imports = []
  const scriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  for (const match of source.matchAll(scriptPattern)) {
    const script = match[1] ?? ''
    const scriptStart = (match.index ?? 0) + match[0].indexOf(script)
    const lineOffset = source.slice(0, scriptStart).split('\n').length - 1
    imports.push(...collectImports(script, file, lineOffset))
  }
  return imports
}

function hasDemoSegment(specifier) {
  return /(^|\/)demo(?:\/|$)/i.test(specifier.replaceAll('\\', '/'))
}

function pathSegments(value) {
  return value
    .replaceAll('\\', '/')
    .split('/')
    .map((segment) => segment.toLowerCase())
    .filter(Boolean)
}

function forbiddenBoundary(value) {
  return pathSegments(value).find((segment) =>
    FORBIDDEN_DEMO_DEPENDENCY_SEGMENTS.has(segment)
  )
}

function resolveImport(relativeImporter, specifier, owners) {
  const importerOwner = ownerRoot(relativeImporter)
  if (!importerOwner) return null

  if (specifier.startsWith('.')) {
    return {
      owner: ownerRoot(
        path.posix.normalize(
          path.posix.join(path.posix.dirname(relativeImporter), specifier)
        )
      ),
      relativePath: path.posix.normalize(
        path.posix.join(path.posix.dirname(relativeImporter), specifier)
      ),
    }
  }

  if (specifier.startsWith('~/') || specifier.startsWith('@/')) {
    if (!importerOwner.startsWith('projects/')) return null
    const relativePath = `${importerOwner}/app/${specifier.slice(2)}`
    return { owner: importerOwner, relativePath }
  }

  for (const [packageName, packageOwner] of owners) {
    if (specifier !== packageName && !specifier.startsWith(`${packageName}/`)) {
      continue
    }

    const suffix = specifier.slice(packageName.length).replace(/^\//, '')
    const sourcePrefix = packageOwner.startsWith('packages/') ? 'src/' : ''
    return {
      owner: packageOwner,
      packageName,
      relativePath: `${packageOwner}/${sourcePrefix}${suffix}`.replace(
        /\/$/,
        ''
      ),
    }
  }

  return null
}

function isConsoleAdapter(relativePath) {
  return /\/(?:src\/runtime|app)\/composables\/fireux\/console\//.test(
    `/${relativePath}`
  )
}

function consoleCoreFamily(relativePath, source) {
  const match = relativePath.match(
    /\/(?:src\/runtime|app)\/composables\/fireux\/console\/([^/]+)\/core\/use([A-Z][A-Za-z0-9]*)Console\.(?:js|ts)$/
  )
  if (!match) return null

  const family = match[1]
  return new RegExp(`useConsole\\(\\s*['"]${family}['"]\\s*\\)`).test(source)
    ? { family, typeName: match[2] }
    : null
}

function isProductDemoAdapter(relativePath) {
  return /^projects\/[^/]+\/[^/]+\/app\/composables\/product-demo\/use(?:[A-Z][A-Za-z0-9]*)?ProductDemo\.(?:js|ts)$/.test(
    relativePath
  )
}

function productDemoMayLoad(importer, resolved, declaredDependencies) {
  if (!resolved || !canonicalDemoRoot(resolved.relativePath)) return false

  const importerOwner = ownerRoot(importer)
  if (!importerOwner?.startsWith('projects/')) return false
  if (resolved.owner === importerOwner) return true

  return Boolean(
    resolved.owner?.startsWith('packages/') &&
      resolved.packageName &&
      declaredDependencies.has(resolved.packageName)
  )
}

function isForbiddenDemoValueModule(specifier) {
  return FORBIDDEN_DEMO_VALUE_MODULES.some(
    (moduleName) =>
      specifier === moduleName || specifier.startsWith(`${moduleName}/`)
  )
}

function formatViolations(violations) {
  return [
    '[guard] ❌ Demo World Spine violations:',
    ...violations
      .sort((left, right) =>
        `${left.file}:${left.line ?? 0}:${left.code}`.localeCompare(
          `${right.file}:${right.line ?? 0}:${right.code}`
        )
      )
      .flatMap((violation) => [
        `  - ${violation.file}${violation.line ? `:${violation.line}` : ''}`,
        `      [${violation.code}] ${violation.message}`,
      ]),
    '',
    '[guard] Fix:',
    '- Keep reusable Demo modules under their package src/runtime/demo; keep app-only Demo modules under app/demo.',
    '- Load Demo through a dynamic import inside an owning console adapter or a project app/composables/product-demo/use*ProductDemo adapter.',
    '- Declare every package Demo owner in the importing project package.json.',
    '- Keep public Product Demo pages under the reserved project app/pages/demo route namespace; pages must consume the named adapter, not fixtures directly.',
    '- Keep Demo modules pure and read-only; import real model/types, never public/server/admin/mutation or Firebase/Storage runtime dependencies.',
    '- Keep test, simulation, and dev fixture families outside Demo.',
  ].join('\n')
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const { demoDirectories, files } = walkRepository(repoRoot)
  const owners = packageOwners(repoRoot)
  const violations = []
  const productDemoAdapters = new Map()
  const productDemoDependencies = new Map()

  for (const file of files) {
    const relativeFile = repoRelative(repoRoot, file)
    if (!isProductDemoAdapter(relativeFile)) continue

    const owner = ownerRoot(relativeFile)
    if (!owner) continue
    if (!productDemoDependencies.has(owner)) {
      productDemoDependencies.set(
        owner,
        readDeclaredDependencies(path.join(repoRoot, owner, 'package.json'))
      )
    }
    const existing = productDemoAdapters.get(owner)
    if (existing) {
      violations.push({
        code: 'product-demo-adapter',
        file: relativeFile,
        message: `Product Demo must use one named project adapter; ${existing} already owns this project boundary.`,
      })
      continue
    }
    productDemoAdapters.set(owner, relativeFile)
  }

  for (const directory of demoDirectories) {
    const relativeDirectory = repoRelative(repoRoot, directory)
    if (
      !canonicalDemoRoot(relativeDirectory) &&
      !isProductDemoRouteDirectory(relativeDirectory)
    ) {
      violations.push({
        code: 'owner-path',
        file: relativeDirectory,
        message:
          'Demo is outside an owning package src/runtime/demo, project app/demo, or project app/pages/demo route namespace.',
      })
    }
  }

  for (const file of files) {
    const relativeFile = repoRelative(repoRoot, file)
    const demoRoot = canonicalDemoRoot(relativeFile)
    const productDemoAdapter = isProductDemoAdapter(relativeFile)
    const source = readFileSync(file, 'utf8')
    const imports = importsForFile(file, source)
    const consoleCore = consoleCoreFamily(relativeFile, source)
    const kitchenDemo =
      relativeFile.startsWith(
        'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/'
      )

    if (
      kitchenDemo &&
      (
        relativeFile.endsWith('/catalogue.ts') ||
        /\bKitchenDemoCatalogue\b/.test(source) ||
        /\.catalogues\b/.test(source)
      )
    ) {
      violations.push({
        code: 'kitchen-operation-vocabulary',
        file: relativeFile,
        message:
          'Kitchen Demo fixtures must follow Menu, Dish, Recipe, and Mise operation vocabulary; Catalogue belongs to the Supplier family.',
      })
    }

    if (
      consoleCore &&
      !new RegExp(`use${consoleCore.typeName}ConsoleDemoData\\s*\\(`).test(
        source
      )
    ) {
      violations.push({
        code: 'console-shape',
        file: relativeFile,
        message: `The ${consoleCore.family} Console accepts the shared Demo source but does not consume its owner-local Demo adapter.`,
      })
    }

    if (demoRoot) {
      const demoRelativeSegments = pathSegments(
        relativeFile.slice(demoRoot.length + 1).replace(/\.[^.]+$/, '')
      )
      const misplacedFamily = demoRelativeSegments.find((segment) =>
        NON_DEMO_FIXTURE_SEGMENTS.has(segment)
      )
      if (misplacedFamily) {
        violations.push({
          code: 'fixture-family',
          file: relativeFile,
          message: `${misplacedFamily} fixtures are a separate family and must stay outside Demo.`,
        })
      }

      for (const imported of imports) {
        if (imported.typeOnly) continue

        const resolved = resolveImport(relativeFile, imported.specifier, owners)
        const boundary = forbiddenBoundary(
          resolved?.relativePath ?? imported.specifier
        )
        if (boundary) {
          violations.push({
            code: 'fixture-dependency',
            file: relativeFile,
            line: imported.line,
            message: `Demo value-imports the ${boundary} boundary (${imported.specifier}).`,
          })
        }

        if (isForbiddenDemoValueModule(imported.specifier)) {
          violations.push({
            code: 'remote-dependency',
            file: relativeFile,
            line: imported.line,
            message: `Demo must not load Firebase, Storage, Admin, or VueFire runtime code (${imported.specifier}).`,
          })
        }

        if (!hasDemoSegment(imported.specifier)) continue
        if (!resolved || resolved.owner !== ownerRoot(relativeFile)) {
          violations.push({
            code: 'cross-owner',
            file: relativeFile,
            line: imported.line,
            message: `Demo may compose only owner-local Demo modules (${imported.specifier}).`,
          })
        }
      }

      continue
    }

    for (const imported of imports) {
      if (imported.typeOnly) continue

      const resolved = resolveImport(relativeFile, imported.specifier, owners)
      if (productDemoAdapter) {
        const importedBoundary = forbiddenBoundary(
          resolved?.relativePath ?? imported.specifier
        )
        if (importedBoundary) {
          violations.push({
            code: 'product-demo-dependency',
            file: relativeFile,
            line: imported.line,
            message: `Product Demo value-imports the ${importedBoundary} boundary (${imported.specifier}).`,
          })
        }

        if (isForbiddenDemoValueModule(imported.specifier)) {
          violations.push({
            code: 'product-demo-remote-dependency',
            file: relativeFile,
            line: imported.line,
            message: `Product Demo must not load Firebase, Storage, Admin, or VueFire runtime code (${imported.specifier}).`,
          })
        }
      }

      if (!hasDemoSegment(imported.specifier)) continue

      if (imported.kind === 'static') {
        violations.push({
          code: 'eager-import',
          file: relativeFile,
          line: imported.line,
          message: `Static Demo import loads fixtures into the normal runtime (${imported.specifier}).`,
        })
        continue
      }

      const boundary = forbiddenBoundary(relativeFile)
      const consoleAdapter = isConsoleAdapter(relativeFile)
      if (boundary || (!consoleAdapter && !productDemoAdapter)) {
        violations.push({
          code: 'consumer-boundary',
          file: relativeFile,
          line: imported.line,
          message: boundary
            ? `The ${boundary} boundary must not load Demo (${imported.specifier}).`
            : `Dynamic Demo imports belong only in console composable adapters or a named project Product Demo adapter (${imported.specifier}).`,
        })
        continue
      }

      if (productDemoAdapter) {
        const declaredDependencies =
          productDemoDependencies.get(ownerRoot(relativeFile)) ?? new Set()
        if (!productDemoMayLoad(relativeFile, resolved, declaredDependencies)) {
          violations.push({
            code: 'product-demo-owner',
            file: relativeFile,
            line: imported.line,
            message: `Product Demo adapters may load only their project's Demo World or Demo Worlds owned by packages declared in the project package.json (${imported.specifier}).`,
          })
        }
        continue
      }

      if (
        !resolved ||
        !canonicalDemoRoot(resolved.relativePath) ||
        resolved.owner !== ownerRoot(relativeFile)
      ) {
        violations.push({
          code: 'cross-owner',
          file: relativeFile,
          line: imported.line,
          message: `Console adapters may load only their owner's Demo modules (${imported.specifier}).`,
        })
      }
    }
  }

  const kitchenScenariosFile =
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/scenarios.ts'
  const kitchenDemoStructure = [
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/core/fixtures.ts',
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/core/types.ts',
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/operations/Ingredients/index.ts',
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/operations/Menus/index.ts',
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/presentation/index.ts',
  ]
  for (const requiredFile of kitchenDemoStructure) {
    if (!existsSync(path.join(repoRoot, requiredFile))) {
      violations.push({
        code: 'kitchen-owner-structure',
        file: requiredFile,
        message:
          'Kitchen Demo owner seams must use core/, exact operations/<Operation>/, and optional presentation/ folders.',
      })
    }
  }

  const kitchenScenariosPath = path.join(repoRoot, kitchenScenariosFile)
  if (existsSync(kitchenScenariosPath)) {
    const source = readFileSync(kitchenScenariosPath, 'utf8')
    for (const required of [
      'kitchenDemoScenarioDescriptors',
      'maturity:',
      'operationCoverage:',
      'presentation:',
      'Every Kitchen Demo scenario requires one maturity descriptor.',
    ]) {
      if (!source.includes(required)) {
        violations.push({
          code: 'kitchen-scenario-maturity',
          file: kitchenScenariosFile,
          message:
            'Every Kitchen Demo scenario must be explicitly classified as operational or presentation-only.',
        })
        break
      }
    }
  }

  const miseboxProductDemoFile =
    'projects/misebox/misebox-app/app/composables/product-demo/useMiseboxProductDemo.ts'
  const miseboxProductDemoPath = path.join(repoRoot, miseboxProductDemoFile)
  if (existsSync(miseboxProductDemoPath)) {
    const source = readFileSync(miseboxProductDemoPath, 'utf8')
    for (const required of [
      "import('fireux-suppliers/runtime/demo/supplier/scenarios')",
      "import('fireux-kitchens/runtime/utils/kitchen/demo-dishes')",
      'buildKitchenDemoDishesOperation',
      'supplierModule.supplierDemoScenarios',
      'loadIngredientRoots',
      'ingredientRoots: consoleIngredientRoots',
      'consoleDishOperation.items',
      'totalSalesMinor',
    ]) {
      if (!source.includes(required)) {
        violations.push({
          code: 'demo-world-composition',
          file: miseboxProductDemoFile,
          message:
            'Misebox Product Demo must compose all Kitchen scenarios with Supplier-owned ingredients through stable relationships.',
        })
        break
      }
    }
    for (const forbidden of [
      'consoleSupplyLineByIngredientId',
      'consoleDishFinanceByDishId',
      'assertProductDemoDishFinance',
      'estimateKitchenDishFinance',
      'duplicateConsoleDishSpecIds',
      'consoleScenario.ingredients',
    ]) {
      if (source.includes(forbidden)) {
        violations.push({
          code: 'demo-world-composition',
          file: miseboxProductDemoFile,
          message:
            'Misebox Product Demo must consume the Kitchen-owned Dishes operation projection instead of rebuilding Dish relationships or finance.',
        })
        break
      }
    }
  }

  const kitchenDishOperationAdapterFile =
    'packages/extensions/fireux-kitchens/src/runtime/utils/kitchen/demo-dishes.ts'
  const kitchenDishOperationAdapterPath = path.join(
    repoRoot,
    kitchenDishOperationAdapterFile
  )
  if (existsSync(kitchenDishOperationAdapterPath)) {
    const source = readFileSync(kitchenDishOperationAdapterPath, 'utf8')
    for (const required of [
      'buildKitchenDemoDishesOperation',
      'estimateKitchenDishFinance',
      'supplierIngredientLinks',
      'preferred_product_id',
      'quantitySold',
      'totalSalesMinor',
      'financeArithmeticReconciles',
      'financePercentagesReconcile',
    ]) {
      if (!source.includes(required)) {
        violations.push({
          code: 'kitchen-dish-operation-projection',
          file: kitchenDishOperationAdapterFile,
          message:
            'Kitchen owns the fail-closed Demo Dishes operation projection shared by Console Demo and Product Demo.',
        })
        break
      }
    }
  } else {
    violations.push({
      code: 'kitchen-dish-operation-projection',
      file: kitchenDishOperationAdapterFile,
      message:
        'Kitchen must own the Demo Dishes operation projection shared by Console Demo and Product Demo.',
    })
  }

  const kitchenConsoleDishesOperationFile =
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes.ts'
  const kitchenConsoleDishesOperationPath = path.join(
    repoRoot,
    kitchenConsoleDishesOperationFile
  )
  if (
    !existsSync(kitchenConsoleDishesOperationPath)
    || !readFileSync(kitchenConsoleDishesOperationPath, 'utf8').includes(
      'buildKitchenDemoDishesOperation'
    )
  ) {
    violations.push({
      code: 'kitchen-dish-operation-projection',
      file: kitchenConsoleDishesOperationFile,
      message:
        'Kitchen Console Dishes must compose and expose the shared owner-local Demo operation projection.',
    })
  }

  const kitchenDishCollectionFile =
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/dish/fetch/useKitchenDishCollection.ts'
  const kitchenDishCollectionPath = path.join(repoRoot, kitchenDishCollectionFile)
  const kitchenConsoleDishesFile =
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes.ts'
  const kitchenConsoleDishesPath = path.join(repoRoot, kitchenConsoleDishesFile)
  const kitchenDishRecordsFile =
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/operations/Dishes/index.ts'
  const kitchenDishRecordsPath = path.join(repoRoot, kitchenDishRecordsFile)
  if (
    !existsSync(kitchenDishRecordsPath)
    || !existsSync(kitchenDishCollectionPath)
    || !existsSync(kitchenConsoleDishesPath)
  ) {
    violations.push({
      code: 'kitchen-dish-record-provider',
      file: kitchenDishRecordsFile,
      message:
        'Kitchen Demo Dishes must expose canonical file-backed records through the shared Dish collection contract.',
    })
  } else {
    const collectionSource = readFileSync(kitchenDishCollectionPath, 'utf8')
    const consoleSource = readFileSync(kitchenConsoleDishesPath, 'utf8')
    const recordsSource = readFileSync(
      kitchenDishRecordsPath,
      'utf8'
    )
    if (
      !collectionSource.includes('recordProvider')
      || !collectionSource.includes('normalizeDish(entry)')
      || !consoleSource.includes('records: demoDishRecords')
      || consoleSource.includes('dishOperation.dishes')
      || !recordsSource.includes('kitchenDemoDishRecordsByKitchenId')
      || !recordsSource.includes('readonly Dish[]')
    ) {
      violations.push({
        code: 'kitchen-dish-record-provider',
        file: kitchenConsoleDishesFile,
        message:
          'Live and Demo base Dishes must differ only at the raw-record provider and share canonical Dish normalization and collection state.',
      })
    }
  }

  const kitchenConsoleCoreFile =
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/core/useKitchenConsole.ts'
  const kitchenConsoleTargetFile =
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/index/useKitchenConsoleTargetCollection.ts'
  const kitchenConsoleCorePath = path.join(repoRoot, kitchenConsoleCoreFile)
  const kitchenConsoleTargetPath = path.join(repoRoot, kitchenConsoleTargetFile)
  if (
    !existsSync(kitchenConsoleCorePath)
    || !existsSync(kitchenConsoleTargetPath)
    || !readFileSync(kitchenConsoleCorePath, 'utf8').includes(
      "enabled: computed(() => kitchenSource.value === 'live')"
    )
    || !readFileSync(kitchenConsoleTargetPath, 'utf8').includes(
      'enabled?: MaybeRefOrGetter<boolean>'
    )
    || !readFileSync(kitchenConsoleTargetPath, 'utf8').includes(
      '!enabled.value ||'
    )
  ) {
    violations.push({
      code: 'kitchen-demo-live-target',
      file: kitchenConsoleCoreFile,
      message:
        'Kitchen Console Demo must deactivate the authenticated Live target provider before it can issue a request.',
    })
  }

  if (violations.length) throw new Error(formatViolations(violations))

  console.log(
    '[guard] ✅ Demo World is owner-owned, deferred, narrowly consumed, and read-only'
  )
}
