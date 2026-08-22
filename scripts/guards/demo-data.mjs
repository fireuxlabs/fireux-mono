// @fireux-script
// last_used: 2026-07-29
// usage_note: enforces owner-local, deferred, typed, read-only Demo World consumers.
// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: lock fixture ownership and lazy workspace consumption.
// Concurrent edit — 2026-07-22 12:38 CEST — Product Demo contract pass: admit one named project adapter and the public route namespace.
// Concurrent edit — 2026-07-22 13:03 CEST — Product Demo dependency pass: enforce pure adapters and project-declared package Demo owners.
// FILE: scripts/guards/demo-data.mjs

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
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
    /^(packages\/(?:core|ecosystem|extensions)\/[^/]+\/src\/runtime\/(?:[^/]+\/)?demo)(?:\/|$)/
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

function isDemoAssetDirectory(relativePath) {
  return /\/(?:assets|public|static)(?:\/|$)/.test(`/${relativePath}`)
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

function isWorkspaceAdapter(relativePath) {
  return /\/(?:src\/runtime\/(?:[^/]+\/)?composables\/(?:fireux\/)?workspace|app\/composables\/fireux\/workspace)\//.test(
    `/${relativePath}`
  )
}

function workspaceDemoRelationshipMayLoad(importer, resolved) {
  return (
    importer ===
      'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/core/useSupplierWorkspaceDemoData.ts' &&
    resolved?.relativePath ===
      'packages/extensions/fireux-companies/src/runtime/place/demo/company/scenarios'
  )
}

function workspaceCoreFamily(relativePath, source) {
  const match = relativePath.match(
    /\/(?:src\/runtime\/(?:[^/]+\/)?composables\/(?:fireux\/)?workspace|app\/composables\/fireux\/workspace)\/([^/]+)\/core\/use([A-Z][A-Za-z0-9]*)Workspace\.(?:js|ts)$/
  )
  if (!match) return null

  const family = match[1]
  return new RegExp(`useWorkspace\\(\\s*['"]${family}['"]\\s*\\)`).test(source)
    ? { family, typeName: match[2] }
    : null
}

function isProductDemoAdapter(relativePath) {
  return /^projects\/[^/]+\/[^/]+\/app\/composables\/product-demo\/use(?:[A-Z][A-Za-z0-9]*)?ProductDemo\.(?:js|ts)$/.test(
    relativePath
  )
}

function isProductDemoLoader(relativePath) {
  return /^projects\/[^/]+\/[^/]+\/app\/composables\/product-demo\/load(?:[A-Z][A-Za-z0-9]*)?ProductDemo\.(?:js|ts)$/.test(
    relativePath
  )
}

function productDemoAdapterForLoader(relativePath) {
  const fileName = path.posix.basename(relativePath)
  if (!fileName.startsWith('load')) return ''
  return path.posix.join(
    path.posix.dirname(relativePath),
    fileName.replace(/^load/, 'use')
  )
}

function productDemoAdapterSourceFiles(relativePath) {
  const fileName = path.posix.basename(relativePath)
  const loaderName = fileName.replace(/^use/, 'load')
  return [
    relativePath,
    path.posix.join(path.posix.dirname(relativePath), loaderName),
  ]
}

function readSourceFamily(repoRoot, relativePaths) {
  return [...new Set(relativePaths)]
    .map((relativePath) => path.join(repoRoot, relativePath))
    .filter((absolutePath) => existsSync(absolutePath))
    .map((absolutePath) => readFileSync(absolutePath, 'utf8'))
    .join('\n')
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
    '- Keep reusable shared Demo modules under package src/runtime/demo and Entity-owned Demo modules under src/runtime/<entity>/demo; keep app-only Demo modules under app/demo.',
    '- Load Demo through a dynamic import inside an owning workspace adapter or a project app/composables/product-demo/use*ProductDemo adapter.',
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
    const source = readSourceFamily(
      repoRoot,
      productDemoAdapterSourceFiles(relativeFile)
    )
    const surface = source.match(
      /\bconst productDemoSurface = ['"]([a-z0-9-]+)['"] as const\b/
    )?.[1]
    const dataSource = source.match(
      /\bconst productDemoDataSource = ['"]([^'"]+)['"] as const\b/
    )?.[1]
    if (!surface || dataSource !== 'demo') {
      violations.push({
        code: 'product-demo-adapter',
        file: relativeFile,
        message:
          'Every Product Demo adapter must declare one stable productDemoSurface and the demo data source.',
      })
      continue
    }
    if (!productDemoDependencies.has(owner)) {
      productDemoDependencies.set(
        owner,
        readDeclaredDependencies(path.join(repoRoot, owner, 'package.json'))
      )
    }
    const adapterKey = `${owner}:${surface}`
    const existing = productDemoAdapters.get(adapterKey)
    if (existing) {
      violations.push({
        code: 'product-demo-adapter',
        file: relativeFile,
        message: `Product Demo surface ${surface} already belongs to ${existing}.`,
      })
      continue
    }
    productDemoAdapters.set(adapterKey, relativeFile)
  }

  for (const directory of demoDirectories) {
    const relativeDirectory = repoRelative(repoRoot, directory)
    if (
      !canonicalDemoRoot(relativeDirectory) &&
      !isProductDemoRouteDirectory(relativeDirectory) &&
      !isDemoAssetDirectory(relativeDirectory)
    ) {
      violations.push({
        code: 'owner-path',
        file: relativeDirectory,
        message:
          'Demo is outside an owning package src/runtime/demo, Entity src/runtime/<entity>/demo, project app/demo, or project app/pages/demo route namespace.',
      })
    }
    const pending = [directory]
    while (pending.length) {
      const current = pending.pop()
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        if (entry.isSymbolicLink()) continue
        const absolutePath = path.join(current, entry.name)
        if (entry.isDirectory()) {
          pending.push(absolutePath)
          continue
        }
        if (
          entry.isFile() &&
          /\.(?:jpe?g|png|webp|gif|avif)$/i.test(entry.name)
        ) {
          violations.push({
            code: 'demo-media-local-binary',
            file: repoRelative(repoRoot, absolutePath),
            message:
              'Demo-owned image binaries live in the owning App Demo prefix in Firebase Storage, not beside fixture source.',
          })
        }
      }
    }
  }

  for (const file of files) {
    const relativeFile = repoRelative(repoRoot, file)
    const demoRoot = canonicalDemoRoot(relativeFile)
    const productDemoAdapter = isProductDemoAdapter(relativeFile)
    const productDemoLoader =
      isProductDemoLoader(relativeFile) &&
      existsSync(path.join(repoRoot, productDemoAdapterForLoader(relativeFile)))
    const source = readFileSync(file, 'utf8')
    const imports = importsForFile(file, source)
    const workspaceCore = workspaceCoreFamily(relativeFile, source)
    const kitchenDemo = relativeFile.startsWith(
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/'
    )

    if (
      kitchenDemo &&
      (relativeFile.endsWith('/catalogue.ts') ||
        /\bKitchenDemoCatalogue\b/.test(source) ||
        /\.catalogues\b/.test(source))
    ) {
      violations.push({
        code: 'kitchen-operation-vocabulary',
        file: relativeFile,
        message:
          'Kitchen Demo fixtures must follow Menu, Dish, Recipe, and Mise operation vocabulary; Catalogue belongs to the Supplier family.',
      })
    }

    if (
      workspaceCore &&
      !new RegExp(
        `use${workspaceCore.typeName}WorkspaceDemo(?:Data|Targets)\\s*\\(`
      ).test(source)
    ) {
      violations.push({
        code: 'workspace-shape',
        file: relativeFile,
        message: `The ${workspaceCore.family} Workspace accepts the shared Demo source but does not consume its owner-local Demo adapter.`,
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
      if (productDemoAdapter || productDemoLoader) {
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
      const workspaceAdapter = isWorkspaceAdapter(relativeFile)
      if (
        boundary ||
        (!workspaceAdapter && !productDemoAdapter && !productDemoLoader)
      ) {
        violations.push({
          code: 'consumer-boundary',
          file: relativeFile,
          line: imported.line,
          message: boundary
            ? `The ${boundary} boundary must not load Demo (${imported.specifier}).`
            : `Dynamic Demo imports belong only in workspace composable adapters or a named project Product Demo adapter (${imported.specifier}).`,
        })
        continue
      }

      if (productDemoAdapter || productDemoLoader) {
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
        (!resolved ||
          !canonicalDemoRoot(resolved.relativePath) ||
          resolved.owner !== ownerRoot(relativeFile)) &&
        !workspaceDemoRelationshipMayLoad(relativeFile, resolved)
      ) {
        violations.push({
          code: 'cross-owner',
          file: relativeFile,
          line: imported.line,
          message: `Workspace adapters may load only their owner's Demo modules or an exact guarded relationship owner (${imported.specifier}).`,
        })
      }
    }
  }

  const kitchenScenariosFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/scenarios.ts'
  const kitchenDemoStructure = [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/core/fixtures.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/core/types.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations/Ingredients/index.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations/Menus/index.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations/Orders/history.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/presentation/index.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/team.ts',
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
    const source = readSourceFamily(repoRoot, [
      kitchenScenariosFile,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/scenario/operation-validation.ts',
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/scenario/service-validation.ts',
    ])
    for (const required of [
      'kitchenDemoScenarioDescriptors',
      'maturity:',
      'operationCoverage:',
      'presentation:',
      'deanosKitchenDemoTarget.kitchen',
      'deanosKitchenDemoTarget.place',
      'input.access.teamIds',
      "order.status === 'completed'",
      'seenFinanceOrderIds',
      'transaction.closedByTeamMemberId',
      "transaction.source.kind !== 'completed_order'",
      'transaction.source.id !== sourceOrder.id',
      'transaction.occurredAt !== sourceOrder.completedAt',
      'transaction.signedAmountMinor !== sourceOrder.pricing.totalMinor',
      'order.pricing.total.amount_minor !== transaction.grossSalesMinor',
      'Every Kitchen Demo scenario requires one maturity descriptor.',
    ]) {
      if (!source.includes(required)) {
        violations.push({
          code: 'kitchen-scenario-integrity',
          file: kitchenScenariosFile,
          message:
            'Kitchen Demo scenarios must retain maturity, canonical target identity, and reconciled Order/Team/Finance relationships.',
        })
        break
      }
    }

    const jitiExecutable = path.join(
      repoRoot,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'jiti.CMD' : 'jiti'
    )
    if (!existsSync(jitiExecutable)) {
      violations.push({
        code: 'kitchen-scenario-execution',
        file: kitchenScenariosFile,
        message:
          'Kitchen Demo scenario validation requires the workspace jiti executable.',
      })
    } else {
      const execution = spawnSync(jitiExecutable, [kitchenScenariosPath], {
        cwd: repoRoot,
        encoding: 'utf8',
      })
      if (execution.error || execution.status !== 0) {
        const detail = String(
          execution.stderr || execution.stdout || execution.error || ''
        )
          .trim()
          .split('\n')
          .slice(0, 8)
          .join('\n')
        violations.push({
          code: 'kitchen-scenario-execution',
          file: kitchenScenariosFile,
          message: [
            'Kitchen Demo scenarios must execute their relationship and arithmetic validators successfully.',
            detail,
          ]
            .filter(Boolean)
            .join('\n'),
        })
      }
    }
  }

  const familyScenarioContracts = [
    {
      code: 'company-demo-place-pair',
      file: 'packages/extensions/fireux-companies/src/runtime/place/demo/company/scenarios.ts',
      markers: [
        "place: CompanyDemoTarget['place']",
        'resolvedPlace: Place',
        'normalizePlace(seed.id, place)',
        'item.resolvedPlace.id !== placeId',
        '!item.place.image_url',
        'companyId !== placeId',
        'Object.keys(item.company)',
        'companyDemoTargets',
      ],
      message:
        'Company Demo must retain stamps-only Company roots paired with same-id sparse Place roots.',
    },
    {
      code: 'supplier-demo-target-pair',
      file: 'packages/extensions/fireux-suppliers/src/runtime/supplier/demo/scenarios.ts',
      sourceFiles: [
        'packages/extensions/fireux-suppliers/src/runtime/supplier/demo/scenarios.ts',
        'packages/extensions/fireux-suppliers/src/runtime/supplier/demo/scenario-types.ts',
        'packages/extensions/fireux-suppliers/src/runtime/supplier/demo/scenario-builders.ts',
        'packages/extensions/fireux-suppliers/src/runtime/supplier/demo/scenario-validation.ts',
      ],
      markers: [
        "management: { mode: 'workspace' }",
        'company_id: input.companyId',
        'status: input.status',
        'scenario.supplier.visibility !== true',
        "'place_id' in scenario.supplier",
        'const companyIds = supplierDemoScenarios.map',
      ],
      message:
        'Supplier Demo must retain root Suppliers, independent Company links, no direct Place edge, and owner-shaped child records.',
    },
    {
      code: 'properties-demo-target-pair',
      file: 'packages/extensions/fireux-properties/src/runtime/demo/properties/scenarios.ts',
      markers: [
        'portfolio: PortfolioDemoTarget | null',
        'place: PropertyPlaceSeed',
        'target.place.id !== target.property.place_id',
        "'entity_families' in target.place",
        'validateRoot(scenario, target.property)',
        "const buenohostAppId = 'buenohost'",
      ],
      message:
        'Portfolio Demo must retain its root relationship without a direct Place; Property Demo must retain its root and linked sparse residential Place.',
    },
    {
      code: 'reservation-demo-relationship',
      file: 'packages/extensions/fireux-reservations/src/runtime/property/demo/reservations.ts',
      markers: [
        "const demoAppId = 'buenohost'",
        "const demoPropertyId = 'alpine-stay'",
        "status: 'checked_in'",
        'reservation.created.app_id !== demoAppId',
        'previous.departure_date > reservation.arrival_date',
      ],
      message:
        'Reservation Demo must retain one current, non-overlapping Property/App lifecycle.',
    },
    {
      code: 'blank-demo-target-pair',
      file: 'projects/fireux/fireux-blank/app/demo/blank/scenarios.ts',
      markers: [
        'blank: Blank',
        'appSupport: AppBlank',
        'scenario.appSupport.blank_id !== scenario.blank.id',
        'Object.keys(scenario.appSupport).sort()',
      ],
      message:
        'Blank Demo must retain one same-App Blank/AppBlank pair rather than fixture a flattened surface.',
    },
    {
      code: 'project-demo-relationships',
      file: 'packages/core/fireux-core/src/runtime/project/demo/scenarios.ts',
      markers: [
        'appId: string',
        "appId: 'fireux-app'",
        "scenario.project.id || '').trim()",
        'app.project_id !== projectId',
        '!ecosystemIds.has(childEcosystemId)',
        "'operator_ids' in app",
      ],
      message:
        'Project Demo must retain model-shaped Project/App/Ecosystem relationships without App support.',
    },
  ]
  const familyScenarioJitiExecutable = path.join(
    repoRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'jiti.CMD' : 'jiti'
  )
  for (const contract of familyScenarioContracts) {
    const scenarioPath = path.join(repoRoot, contract.file)
    if (!existsSync(scenarioPath)) {
      violations.push({
        code: contract.code,
        file: contract.file,
        message: contract.message,
      })
      continue
    }

    const source = readSourceFamily(
      repoRoot,
      contract.sourceFiles ?? [contract.file]
    )
    if (!contract.markers.every((marker) => source.includes(marker))) {
      violations.push({
        code: contract.code,
        file: contract.file,
        message: contract.message,
      })
      continue
    }

    if (!existsSync(familyScenarioJitiExecutable)) {
      violations.push({
        code: `${contract.code}-execution`,
        file: contract.file,
        message: `${contract.message} The workspace jiti executable is required.`,
      })
      continue
    }

    const execution = spawnSync(familyScenarioJitiExecutable, [scenarioPath], {
      cwd: repoRoot,
      encoding: 'utf8',
    })
    if (execution.error || execution.status !== 0) {
      const detail = String(
        execution.stderr || execution.stdout || execution.error || ''
      )
        .trim()
        .split('\n')
        .slice(0, 8)
        .join('\n')
      violations.push({
        code: `${contract.code}-execution`,
        file: contract.file,
        message: [contract.message, detail].filter(Boolean).join('\n'),
      })
    }
  }

  const supplierDemoWorldFile =
    'packages/extensions/fireux-suppliers/src/runtime/supplier/utils/supplier-demo-world.ts'
  const supplierDemoWorldPath = path.join(repoRoot, supplierDemoWorldFile)
  const supplierDemoWorldSource = existsSync(supplierDemoWorldPath)
    ? readFileSync(supplierDemoWorldPath, 'utf8')
    : ''
  if (
    ![
      'projectSupplierDemoWorld',
      'companyTarget.resolvedPlace',
      'clean(target.place.id) !== companyId',
      'clean(target.resolvedPlace.id) !== companyId',
      "'place_id' in scenario.supplier",
      'companyPlace: companyTarget.resolvedPlace',
    ].every((marker) => supplierDemoWorldSource.includes(marker))
  ) {
    violations.push({
      code: 'supplier-demo-world-projection',
      file: supplierDemoWorldFile,
      message:
        'Supplier Demo must compose Supplier with the same-id canonical Company Place without copying a direct Place edge.',
    })
  }
  if (existsSync(familyScenarioJitiExecutable)) {
    const checkDirectory = mkdtempSync(
      path.join(tmpdir(), 'fireux-supplier-demo-world-')
    )
    const checkFile = path.join(checkDirectory, 'check.ts')
    const sourcePath = (relativePath) =>
      JSON.stringify(path.join(repoRoot, relativePath))
    writeFileSync(
      checkFile,
      [
        `import { companyDemoTargets } from ${sourcePath(
          'packages/extensions/fireux-companies/src/runtime/place/demo/company/scenarios.ts'
        )}`,
        `import { supplierDemoScenarios } from ${sourcePath(
          'packages/extensions/fireux-suppliers/src/runtime/supplier/demo/scenarios.ts'
        )}`,
        `import { projectSupplierDemoWorld } from ${sourcePath(
          'packages/extensions/fireux-suppliers/src/runtime/supplier/utils/supplier-demo-world.ts'
        )}`,
        `import { deanosKitchenDemoScenario } from ${sourcePath(
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/scenarios.ts'
        )}`,
        `import { buildKitchenDemoSuppliersOperation } from ${sourcePath(
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-suppliers.ts'
        )}`,
        'const world = projectSupplierDemoWorld({ scenarios: supplierDemoScenarios, companyTargets: companyDemoTargets })',
        'const operation = buildKitchenDemoSuppliersOperation({ links: deanosKitchenDemoScenario.supplierIngredientLinks, supplierScenarios: world })',
        'const linkedIngredientCount = operation.items.reduce((total, item) => total + item.linkedIngredientCount, 0)',
        'if (world.length !== 3 || operation.items.length !== 3 || linkedIngredientCount !== 68) throw new Error("Deanos Supplier Demo coverage is incomplete.")',
      ].join('\n'),
      'utf8'
    )
    try {
      const execution = spawnSync(familyScenarioJitiExecutable, [checkFile], {
        cwd: repoRoot,
        encoding: 'utf8',
      })
      if (execution.error || execution.status !== 0) {
        const detail = String(
          execution.stderr || execution.stdout || execution.error || ''
        )
          .trim()
          .split('\n')
          .slice(0, 8)
          .join('\n')
        violations.push({
          code: 'supplier-demo-world-execution',
          file: supplierDemoWorldFile,
          message: [
            'Supplier Demo must resolve three linked Company/Place targets and all 68 Deanos ingredient links.',
            detail,
          ]
            .filter(Boolean)
            .join('\n'),
        })
      }
    } finally {
      rmSync(checkDirectory, { recursive: true, force: true })
    }
  }

  const demoMediaManifestFile = 'scripts/data/misebox-demo-media/manifest.json'
  const demoMediaManifestPath = path.join(repoRoot, demoMediaManifestFile)
  const demoMediaContractFile =
    'packages/extensions/fireux-demo/src/runtime/media/misebox.ts'
  const demoMediaPublisherFile = 'scripts/publish-misebox-demo-media.mjs'
  const expectedDemoMediaObjects = []
  let demoMediaManifest = null
  try {
    demoMediaManifest = JSON.parse(readFileSync(demoMediaManifestPath, 'utf8'))
    const target = demoMediaManifest.target ?? {}
    const manifestKeys = Object.keys(demoMediaManifest).sort()
    const expectedManifestKeys = [
      'format',
      'object_contract',
      'objects',
      'policy',
      'sources',
      'target',
    ]
    if (
      manifestKeys.length !== expectedManifestKeys.length ||
      manifestKeys.some((key, index) => key !== expectedManifestKeys[index]) ||
      demoMediaManifest.format !== 'fireux-misebox-demo-media-manifest/2' ||
      demoMediaManifest.object_contract !== 'fireux-misebox-demo-media/1' ||
      demoMediaManifest.policy !==
        'Firebase Storage is authoritative; repository stores metadata only; create or reuse exact immutable objects; never overwrite, delete, or write Firestore' ||
      target.app_id !== 'misebox-app' ||
      target.project_id !== 'misebox-78f9c' ||
      target.database_id !== 'misebox' ||
      target.storage_bucket !== 'misebox-78f9c.appspot.com' ||
      target.object_prefix !== 'demo/misebox-app' ||
      typeof target.download_token !== 'string' ||
      !target.download_token ||
      !demoMediaManifest.sources ||
      typeof demoMediaManifest.sources !== 'object' ||
      Array.isArray(demoMediaManifest.sources) ||
      !demoMediaManifest.objects ||
      typeof demoMediaManifest.objects !== 'object' ||
      Array.isArray(demoMediaManifest.objects)
    ) {
      throw new Error('The fixed target or inventory counts are invalid.')
    }

    const sourceEntries = Object.entries(demoMediaManifest.sources).sort(
      ([left], [right]) => left.localeCompare(right)
    )
    const objectEntries = Object.entries(demoMediaManifest.objects).sort(
      ([left], [right]) => left.localeCompare(right)
    )
    if (
      sourceEntries.length !== 72 ||
      objectEntries.length !== 78 ||
      sourceEntries.some(([relativePath, descriptor]) => {
        const expectedContentType = relativePath.endsWith('.png')
          ? 'image/png'
          : 'image/jpeg'
        return (
          !/^[a-z0-9][a-z0-9./-]*\.(?:jpg|png)$/.test(relativePath) ||
          !descriptor ||
          typeof descriptor !== 'object' ||
          Array.isArray(descriptor) ||
          Object.keys(descriptor).sort().join(',') !==
            'bytes,content_type,sha256' ||
          !Number.isInteger(descriptor.bytes) ||
          descriptor.bytes <= 0 ||
          descriptor.content_type !== expectedContentType ||
          !/^[a-f0-9]{64}$/.test(String(descriptor.sha256))
        )
      }) ||
      objectEntries.some(
        ([relativePath, sourcePath]) =>
          !/^[a-z0-9][a-z0-9./-]*\.(?:jpg|png)$/.test(relativePath) ||
          !/^[a-z0-9][a-z0-9./-]*\.(?:jpg|png)$/.test(String(sourcePath)) ||
          !Object.hasOwn(demoMediaManifest.sources, sourcePath) ||
          (relativePath.endsWith('.png') ? 'image/png' : 'image/jpeg') !==
            demoMediaManifest.sources[sourcePath].content_type
      )
    ) {
      throw new Error('The Demo media source/object inventory is invalid.')
    }
    expectedDemoMediaObjects.push(
      ...objectEntries.map(([relativePath]) => relativePath)
    )
    if (
      expectedDemoMediaObjects.length !== 78 ||
      new Set(expectedDemoMediaObjects).size !==
        expectedDemoMediaObjects.length ||
      new Set(sourceEntries.map(([, descriptor]) => descriptor.sha256)).size !==
        72 ||
      new Set(objectEntries.map(([, sourcePath]) => sourcePath)).size !==
        sourceEntries.length
    ) {
      throw new Error('The Demo media object inventory is incomplete.')
    }

    const contractSource = readFileSync(
      path.join(repoRoot, demoMediaContractFile),
      'utf8'
    )
    const publisherSource = readFileSync(
      path.join(repoRoot, demoMediaPublisherFile),
      'utf8'
    )
    if (
      ![
        target.project_id,
        target.storage_bucket,
        target.object_prefix,
        target.download_token,
        'miseboxDemoMediaUrl',
      ].every((marker) => contractSource.includes(marker)) ||
      ![
        'preconditionOpts: { ifGenerationMatch: 0 }',
        'fireuxDemoMediaSha256',
        'fireuxDemoMediaContract',
        'fireuxDemoMediaSource',
        'preflightExternalSources',
        'realpath',
        'bucket.getFiles({ prefix: objectPrefix })',
        'unexpected_objects',
        '--confirm-source',
        '--source-directory must stay outside the repository',
        'Post-upload remote inventory is incomplete.',
        'Firebase Storage is authoritative',
      ].every((marker) => publisherSource.includes(marker)) ||
      publisherSource.includes('asset_directory') ||
      publisherSource.includes('firebase-admin/firestore') ||
      publisherSource.includes('getFirestore(')
    ) {
      throw new Error(
        'The pure URL contract or create-only Storage publisher is incomplete.'
      )
    }
  } catch (error) {
    violations.push({
      code: 'demo-media-manifest',
      file: demoMediaManifestFile,
      message: `Demo media requires one exact Storage-authoritative 78-object/72-payload Misebox manifest and create-only external-source publisher. ${
        error instanceof Error ? error.message : String(error)
      }`,
    })
  }

  const demoMediaDataDirectory = path.dirname(demoMediaManifestPath)
  for (const entry of readdirSync(demoMediaDataDirectory, {
    withFileTypes: true,
  })) {
    if (entry.name !== 'manifest.json' || !entry.isFile()) {
      violations.push({
        code: 'demo-media-local-mirror',
        file: repoRelative(
          repoRoot,
          path.join(demoMediaDataDirectory, entry.name)
        ),
        message:
          'The Demo media data directory keeps manifest metadata only; Firebase Storage owns the image binaries.',
      })
    }
  }

  const forbiddenDemoMediaBinaryRoots = [
    'packages/extensions/fireux-kitchens/src/runtime/public/img/showcase/menu',
    'packages/extensions/fireux-suppliers/src/runtime/public/img/showcase/suppliers',
    'packages/extensions/fireux-companies/src/runtime/public/img/showcase/places',
  ]
  for (const relativeRoot of forbiddenDemoMediaBinaryRoots) {
    const absoluteRoot = path.join(repoRoot, relativeRoot)
    if (!existsSync(absoluteRoot)) continue
    const pending = [absoluteRoot]
    while (pending.length) {
      const current = pending.pop()
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const absolutePath = path.join(current, entry.name)
        if (entry.isDirectory()) {
          pending.push(absolutePath)
          continue
        }
        if (
          entry.isFile() &&
          /\.(?:jpe?g|png|webp|gif|avif)$/i.test(entry.name)
        ) {
          violations.push({
            code: 'demo-media-local-binary',
            file: repoRelative(repoRoot, absolutePath),
            message:
              'Demo-owned image binaries live in Firebase Storage under the guarded Demo prefix; the repository keeps metadata only.',
          })
        }
      }
    }
  }

  const legacyDemoMediaPrefixes = [
    `/${'img'}/showcase/menu`,
    `/${'img'}/showcase/suppliers`,
    `/${'img'}/showcase/places`,
  ]
  for (const file of files) {
    const relativeFile = repoRelative(repoRoot, file)
    if (relativeFile === 'scripts/guards/demo-data.mjs') continue
    const source = readFileSync(file, 'utf8')
    const legacyPrefix = legacyDemoMediaPrefixes.find((prefix) =>
      source.includes(prefix)
    )
    if (legacyPrefix) {
      violations.push({
        code: 'demo-media-local-url',
        file: relativeFile,
        message: `Demo-owned media must use the immutable Misebox Storage contract, not ${legacyPrefix}.`,
      })
    }
  }

  if (
    expectedDemoMediaObjects.length === 78 &&
    existsSync(familyScenarioJitiExecutable)
  ) {
    const checkDirectory = mkdtempSync(
      path.join(tmpdir(), 'fireux-demo-media-')
    )
    const checkFile = path.join(checkDirectory, 'check.ts')
    const absoluteSource = (relativePath) =>
      JSON.stringify(path.join(repoRoot, relativePath))
    writeFileSync(
      checkFile,
      [
        `import { miseboxDemoMediaContract } from ${absoluteSource(
          demoMediaContractFile
        )}`,
        `import { kitchenDemoScenarios } from ${absoluteSource(
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/scenarios.ts'
        )}`,
        `import { companyDemoTargets } from ${absoluteSource(
          'packages/extensions/fireux-companies/src/runtime/place/demo/company/scenarios.ts'
        )}`,
        `import { supplierDemoScenarios } from ${absoluteSource(
          'packages/extensions/fireux-suppliers/src/runtime/supplier/demo/scenarios.ts'
        )}`,
        `const expected = new Set(${JSON.stringify(expectedDemoMediaObjects)})`,
        'const found: string[] = []',
        'const objectPath = (value: unknown, owner: string) => {',
        '  const url = new URL(String(value || ""))',
        '  const prefix = `/v0/b/${miseboxDemoMediaContract.storageBucket}/o/`',
        '  if (url.protocol !== "https:" || url.hostname !== "firebasestorage.googleapis.com" || url.username || url.password || url.hash || !url.pathname.startsWith(prefix)) throw new Error(`Invalid Demo media URL: ${value}`)',
        '  if ([...url.searchParams.keys()].sort().join(",") !== "alt,token" || url.searchParams.get("alt") !== "media" || url.searchParams.get("token") !== miseboxDemoMediaContract.downloadToken) throw new Error(`Invalid Demo media query: ${value}`)',
        '  const fullPath = decodeURIComponent(url.pathname.slice(prefix.length))',
        '  const root = `${miseboxDemoMediaContract.objectPrefix}/`',
        '  if (!fullPath.startsWith(root)) throw new Error(`Invalid Demo media object root: ${fullPath}`)',
        '  const relative = fullPath.slice(root.length)',
        '  if (!relative.startsWith(owner)) throw new Error(`Demo media owner mismatch: ${relative} != ${owner}`)',
        '  found.push(relative)',
        '  return relative',
        '}',
        'for (const scenario of kitchenDemoScenarios) {',
        '  const kitchenId = String(scenario.kitchen.id || "")',
        '  const placeId = String(scenario.place.id || "")',
        '  objectPath(scenario.place.logo_image, `places/${placeId}/`)',
        '  for (const dish of scenario.dishes) objectPath(dish.image, `kitchens/${kitchenId}/`)',
        '  for (const value of [scenario.place.image_url, scenario.place.cover_image, ...(scenario.place.gallery_images || [])].filter(Boolean)) objectPath(value, `places/${placeId}/`)',
        '}',
        'for (const target of companyDemoTargets) if (target.place.logo_image) objectPath(target.place.logo_image, `suppliers/${target.place.id.replace(/-hq$/, "")}/`)',
        'for (const target of companyDemoTargets) objectPath(target.place.image_url, `places/${target.place.id}/`)',
        'const templateAssets = ["apps/deanos/img/app/logo.png", "apps/deanos/img/app/wordmark-light.png", "apps/deanos/img/app/wordmark-dark.png", "apps/deanos/img/app/cover.png", "apps/deanos/img/app/thumbnail.png"]',
        'for (const value of templateAssets) found.push(value)',
        'const actual = new Set(found)',
        'if (found.length !== 80 || actual.size !== 78 || actual.size !== expected.size || [...actual].some(value => !expected.has(value))) throw new Error(`Demo media fixture inventory mismatch: ${found.length}/${actual.size}/${expected.size}`)',
      ].join('\n'),
      'utf8'
    )
    try {
      const execution = spawnSync(familyScenarioJitiExecutable, [checkFile], {
        cwd: repoRoot,
        encoding: 'utf8',
      })
      if (execution.error || execution.status !== 0) {
        const detail = String(
          execution.stderr || execution.stdout || execution.error || ''
        )
          .trim()
          .split('\n')
          .slice(0, 8)
          .join('\n')
        violations.push({
          code: 'demo-media-fixtures',
          file: demoMediaContractFile,
          message: [
            'Every Kitchen, Dish, Supplier, and Place Demo image must resolve to one owner-relative immutable Misebox Storage object.',
            detail,
          ]
            .filter(Boolean)
            .join('\n'),
        })
      }
    } finally {
      rmSync(checkDirectory, { recursive: true, force: true })
    }
  }

  const supplierPackagePath = path.join(
    repoRoot,
    'packages/extensions/fireux-suppliers/package.json'
  )
  if (!readDeclaredDependencies(supplierPackagePath).has('fireux-companies')) {
    violations.push({
      code: 'supplier-demo-company-dependency',
      file: 'packages/extensions/fireux-suppliers/package.json',
      message:
        'Supplier must declare the Company owner used for its guarded Company/Place Demo relationship.',
    })
  }

  for (const contract of [
    {
      code: 'supplier-demo-app-filter',
      file: 'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/core/useSupplierWorkspaceDemoData.ts',
      markers: [
        "scenario.appId !== String(appId || '').trim()",
        "import('fireux-companies/runtime/place/demo/company/scenarios')",
        'projectSupplierDemoWorld({',
        'companyTargets: companyModule.companyDemoTargets',
        'companyPlace: scenario.companyPlace',
      ],
      message:
        'Supplier Workspace Demo must filter by runtime App and compose Supplier with the exact linked Company/Place projection.',
    },
    {
      code: 'properties-demo-app-filter',
      file: 'packages/extensions/fireux-properties/src/runtime/composables/fireux/workspace/shared/usePropertiesWorkspaceDemoData.ts',
      markers: [
        '.filter((scenario) => scenario.appId === currentAppId)',
        'portfolio: scenario.portfolio.portfolio',
        'source: target.property',
        'target.place.id',
        'places,',
      ],
      message:
        'Property and Portfolio Workspace Demo must filter by runtime App and compose root/Place sources.',
    },
    {
      code: 'blank-demo-app-filter',
      file: 'projects/fireux/fireux-blank/app/composables/fireux/workspace/blank/core/useBlankWorkspaceDemoData.ts',
      markers: [
        'scenario.appId !== currentAppId',
        'composeBlankSurface({',
        'appSupport: scenario.appSupport',
      ],
      message:
        'Blank Workspace Demo must filter by runtime App and project the canonical root/support pair.',
    },
  ]) {
    const contractPath = path.join(repoRoot, contract.file)
    const source = existsSync(contractPath)
      ? readFileSync(contractPath, 'utf8')
      : ''
    if (!contract.markers.every((marker) => source.includes(marker))) {
      violations.push({
        code: contract.code,
        file: contract.file,
        message: contract.message,
      })
    }
  }

  const miseboxProductDemoFile =
    'projects/misebox/misebox-app/app/composables/product-demo/useMiseboxProductDemo.ts'
  const miseboxProductDemoPath = path.join(repoRoot, miseboxProductDemoFile)
  if (existsSync(miseboxProductDemoPath)) {
    const source = readSourceFamily(repoRoot, [
      miseboxProductDemoFile,
      'projects/misebox/misebox-app/app/composables/product-demo/loadMiseboxProductDemo.ts',
      'projects/misebox/misebox-app/app/composables/product-demo/projectMiseboxProductDemoWorkspaceFoundations.ts',
    ])
    for (const required of [
      "import('fireux-companies/runtime/place/demo/company/scenarios')",
      "import('fireux-suppliers/runtime/supplier/demo/scenarios')",
      "import('fireux-kitchens/runtime/kitchen/utils/demo-dishes')",
      "import('fireux-kitchens/runtime/kitchen/utils/demo-suppliers')",
      "import('fireux-kitchens/runtime/kitchen/utils/demo-finance')",
      "import('fireux-kitchens/runtime/kitchen/utils/demo-menu-cascade')",
      'buildKitchenDemoDishesOperation',
      'buildKitchenDemoSuppliersOperation',
      'projectSupplierDemoWorld',
      'projectKitchenDemoFinanceSummary',
      'companyModule.companyDemoTargets',
      'supplierModule.supplierDemoScenarios',
      'const supplierDemoWorld = projectSupplierDemoWorld({',
      'supplierScenarios: supplierDemoWorld',
      'loadIngredientRoots',
      'ingredientRoots: workspaceIngredientRoots',
      'workspaceScenario.kitchenIngredients',
      'workspaceScenario.kitchen.identity.display_name',
      'ingredients: workspaceIngredients',
      'finance: {',
      'periods: workspaceFinancePeriods',
      'kitchenName:',
      'workspaceScenario.miseTasks',
      'projectKitchenMiseTasks',
      'miseTasks: projectKitchenMiseTasks(',
      'workspaceScenario.miseTasks,',
      'workspaceScenario.stations',
      'workspaceScenario.orders',
      'orders: workspaceScenario.orders.map',
      'customer: {}',
      'stations: workspaceStations',
      'suppliers: workspaceSupplierOperation.items',
      'configuredCount: workspaceTableCount',
      'projectKitchenDemoMenuCascade',
      'projectKitchenDemoMiseTaskMenuIds',
      'modeByMenuId: workspaceScenario.menuModes',
      'defaultInService:',
      'menuIds:',
      'workspaceDishOperation.items',
      'totalSalesMinor',
    ]) {
      if (!source.includes(required)) {
        violations.push({
          code: 'demo-world-composition',
          file: miseboxProductDemoFile,
          message:
            'Misebox Product Demo must compose Kitchen scenarios through stable Supplier relationships and canonical Ingredient roots.',
        })
        break
      }
    }
    if (
      source.includes('mise: workspaceScenario.miseRequirements') ||
      source.includes(
        'miseTasks: projectKitchenMiseTasks(workspaceScenario.miseRequirements'
      )
    ) {
      violations.push({
        code: 'demo-world-mise-projection',
        file: miseboxProductDemoFile,
        message:
          'The landing Mise operation must project real KitchenMiseTask records; production requirements remain a derived Dish graph.',
      })
    }
    for (const forbidden of [
      'workspaceSupplyLineByIngredientId',
      'workspaceDishFinanceByDishId',
      'assertProductDemoDishFinance',
      'estimateKitchenDishFinance',
      'duplicateWorkspaceDishSpecIds',
      'workspaceScenario.ingredients',
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

  const miseboxPowerCardsFile =
    'projects/misebox/misebox-app/app/components/Misebox/PowerCards.vue'
  const miseboxPowerCardsPath = path.join(repoRoot, miseboxPowerCardsFile)
  const miseboxPowerCardsDemoFile =
    'projects/misebox/misebox-app/app/composables/product-demo/useMiseboxPowerCardsProductDemo.ts'
  const miseboxPowerCardsDemoPath = path.join(
    repoRoot,
    miseboxPowerCardsDemoFile
  )
  const miseboxPowerCardNames = [
    'One',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Ten',
  ]
  const miseboxPowerCardChildren = miseboxPowerCardNames.map(
    (number) =>
      `projects/misebox/misebox-app/app/components/Misebox/PowerCard${number}.vue`
  )
  if (
    !existsSync(miseboxPowerCardsPath) ||
    ![
      'useMiseboxPowerCardsProductDemo()',
      'data: orbit',
      '<MiseboxElementWindow',
    ].every((marker) =>
      readFileSync(miseboxPowerCardsPath, 'utf8').includes(marker)
    )
  ) {
    violations.push({
      code: 'product-demo-power-cards',
      file: miseboxPowerCardsFile,
      message:
        'Misebox PowerCards must consume the named Demo-only card-window projection.',
    })
  }
  const miseboxPowerCardsDemoSource = existsSync(miseboxPowerCardsDemoPath)
    ? readFileSync(miseboxPowerCardsDemoPath, 'utf8')
    : ''
  if (
    ![
      "dataSource: 'demo'",
      "import('fireux-kitchens/runtime/kitchen/demo/scenarios')",
      "import('fireux-companies/runtime/place/demo/company/scenarios')",
      "import('fireux-suppliers/runtime/supplier/demo/scenarios')",
      'projectSupplierDemoWorld({',
      'companyTargets: companyModule.companyDemoTargets',
      'projectKitchenCell(projectKitchenSurface({',
      'manifest.presentation.currencyCode',
    ].every((marker) => miseboxPowerCardsDemoSource.includes(marker)) ||
    ['useRequestFetch(', 'useFetch(', '$fetch(', '/api/', 'firebase'].some(
      (marker) => miseboxPowerCardsDemoSource.includes(marker)
    )
  ) {
    violations.push({
      code: 'product-demo-power-cards-source',
      file: miseboxPowerCardsDemoFile,
      message:
        'The Misebox Demo card window must use a network-free data envelope, permit only declared immutable Demo image GETs, remain fixture-backed, and fail closed without a Live fallback.',
    })
  }
  for (const file of miseboxPowerCardChildren) {
    const filePath = path.join(repoRoot, file)
    const source = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
    if (
      !source.includes("MiseboxPowerCardsProductDemo['cards']") ||
      !source.includes('defineProps<') ||
      ['deanos-kitchen', 'deanos-main-menu', 'Alpine Foods'].some((value) =>
        source.includes(value)
      )
    ) {
      violations.push({
        code: 'product-demo-power-cards',
        file,
        message:
          'PowerCard children must receive typed Demo-only props and must not own shadow fixtures.',
      })
    }
  }

  const kitchenDemoMenuCascadeFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-menu-cascade.ts'
  const kitchenDemoMenuCascadePath = path.join(
    repoRoot,
    kitchenDemoMenuCascadeFile
  )
  if (existsSync(kitchenDemoMenuCascadePath)) {
    const source = readFileSync(kitchenDemoMenuCascadePath, 'utf8')
    for (const required of [
      'projectKitchenDemoMenuCascade',
      "mode === 'on'",
      "mode === 'order_led'",
      'menuItemComponentDeltas',
      'prepItem.input.ingredientId',
      'recipe?.ingredients',
      'neededForService',
      'projectKitchenDemoMiseTaskMenuIds',
    ]) {
      if (!source.includes(required)) {
        violations.push({
          code: 'kitchen-demo-menu-cascade',
          file: kitchenDemoMenuCascadeFile,
          message:
            'Kitchen must own one non-destructive Demo Menu service cascade across Dishes, Recipes, Ingredients, Prep and Mise.',
        })
        break
      }
    }
  } else {
    violations.push({
      code: 'kitchen-demo-menu-cascade',
      file: kitchenDemoMenuCascadeFile,
      message:
        'Kitchen must own the Demo Menu service cascade used by Workspace and Product Demo.',
    })
  }

  const kitchenDemoMenuAvailabilityFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations/Menus/availability.ts'
  const kitchenDemoMenuAvailabilityPath = path.join(
    repoRoot,
    kitchenDemoMenuAvailabilityFile
  )
  if (
    !existsSync(kitchenDemoMenuAvailabilityPath) ||
    ![
      "[deanosKitchenDemoIdentity.menuId]: 'on'",
      "[deanosPartyMenuDemoIdentity.menuId]: 'order_led'",
      "[deanosXmasMenuDemoIdentity.menuId]: 'off'",
    ].every((marker) =>
      readFileSync(kitchenDemoMenuAvailabilityPath, 'utf8').includes(marker)
    )
  ) {
    violations.push({
      code: 'kitchen-demo-menu-availability',
      file: kitchenDemoMenuAvailabilityFile,
      message:
        'Deanos summer defaults must keep Main on, Party order-led, and Xmas off without changing Menu publication.',
    })
  }

  const kitchenDemoMenuServiceFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenMenuServiceSelection.ts'
  const kitchenWorkspaceDemoMenuServiceFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspaceDemoMenuService.ts'
  for (const [file, markers] of [
    [
      kitchenDemoMenuServiceFile,
      [
        'useState<Record<string, Record<string, boolean>>>',
        'useKitchenMenuServiceSelection',
        'defaultInService',
        'setMenuInService',
        'does not write Firestore',
      ],
    ],
    [
      kitchenWorkspaceDemoMenuServiceFile,
      [
        'useKitchenMenuServiceSelection',
        'projectKitchenDemoMenuCascade',
        'isEntityInService',
        'isTaskInService',
      ],
    ],
  ]) {
    const filePath = path.join(repoRoot, file)
    const source = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
    if (!markers.every((marker) => source.includes(marker))) {
      violations.push({
        code: 'kitchen-demo-menu-service-state',
        file,
        message:
          'Workspace and landing must share route-stable local Demo Menu service state without persistence.',
      })
    }
  }

  for (const file of [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Menus/useKitchenWorkspaceMenus.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Dishes/useKitchenWorkspaceDishes.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Ingredients/useKitchenWorkspaceIngredients.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Recipes/useKitchenWorkspaceRecipes.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Mise/useKitchenWorkspaceMise.ts',
  ]) {
    const source = readFileSync(path.join(repoRoot, file), 'utf8')
    if (!source.includes('useKitchenWorkspaceDemoMenuService')) {
      violations.push({
        code: 'kitchen-demo-menu-service-consumer',
        file,
        message:
          'Every affected Demo Workspace operation must consume the shared Menu service projection.',
      })
    }
  }

  const kitchenMiseModelFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/mise.ts'
  const kitchenMisePresentationFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/mise-presentation.ts'
  const kitchenDemoOperationsFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations.ts'
  for (const [file, markers] of [
    [
      kitchenMiseModelFile,
      [
        'KITCHEN_MISE_WORKFLOW_STAGES',
        "'wash'",
        "'cut_portion'",
        "'make'",
        "'cook_chill'",
        "'set_stations'",
        "'final_checks'",
      ],
    ],
    [
      kitchenMisePresentationFile,
      [
        'groupKitchenMiseTaskSummariesByWorkflow',
        'checklistDoneCount',
        "'unsorted'",
      ],
    ],
    [
      kitchenDemoOperationsFile,
      [
        'wash-main-service-produce',
        'shape-main-patties',
        'set-grill-station',
        'final-allergen-check',
        'deanosPartyMenuDemoIdentity',
        'deanosXmasMenuDemoIdentity',
      ],
    ],
  ]) {
    const source =
      file === kitchenDemoOperationsFile
        ? readSourceFamily(repoRoot, [
            file,
            'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations/mise/deanos-preparation.ts',
            'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations/mise/deanos-service.ts',
          ])
        : readFileSync(path.join(repoRoot, file), 'utf8')
    if (!markers.every((marker) => source.includes(marker))) {
      violations.push({
        code: 'kitchen-mise-workflow',
        file,
        message:
          'Kitchen Mise must remain process-first, checklist-capable, and visibly season-scoped in Demo.',
      })
    }
  }

  const kitchenDishOperationAdapterFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-dishes.ts'
  const kitchenDishOperationAdapterPath = path.join(
    repoRoot,
    kitchenDishOperationAdapterFile
  )
  if (existsSync(kitchenDishOperationAdapterPath)) {
    const source = readSourceFamily(repoRoot, [
      kitchenDishOperationAdapterFile,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-dishes-supply.ts',
    ])
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
            'Kitchen owns the fail-closed Demo Dishes operation projection shared by Workspace Demo and Product Demo.',
        })
        break
      }
    }
  } else {
    violations.push({
      code: 'kitchen-dish-operation-projection',
      file: kitchenDishOperationAdapterFile,
      message:
        'Kitchen must own the Demo Dishes operation projection shared by Workspace Demo and Product Demo.',
    })
  }

  const kitchenSupplierOperationAdapterFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-suppliers.ts'
  const kitchenSupplierOperationAdapterPath = path.join(
    repoRoot,
    kitchenSupplierOperationAdapterFile
  )
  if (existsSync(kitchenSupplierOperationAdapterPath)) {
    const source = readFileSync(kitchenSupplierOperationAdapterPath, 'utf8')
    for (const required of [
      'selectKitchenDemoSupplierScenarios',
      'buildKitchenDemoSuppliersOperation',
      'KitchenSupplierIngredient',
      'linkedIngredientCount',
      'company_place?.logo_image',
      'catalogueCount',
      'coverage is unresolved',
    ]) {
      if (!source.includes(required)) {
        violations.push({
          code: 'kitchen-supplier-operation-projection',
          file: kitchenSupplierOperationAdapterFile,
          message:
            'Kitchen must project its usage links through Supplier-owned Demo identity and coverage.',
        })
        break
      }
    }
  } else {
    violations.push({
      code: 'kitchen-supplier-operation-projection',
      file: kitchenSupplierOperationAdapterFile,
      message:
        'Kitchen must own the Demo Supplier operation projection shared by Workspace Demo and Product Demo.',
    })
  }

  const kitchenWorkspaceSupplyWorkspaceFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Suppliers/useKitchenWorkspaceSupplyWorkspace.ts'
  const kitchenWorkspaceSupplyWorkspacePath = path.join(
    repoRoot,
    kitchenWorkspaceSupplyWorkspaceFile
  )
  if (
    !existsSync(kitchenWorkspaceSupplyWorkspacePath) ||
    !readFileSync(kitchenWorkspaceSupplyWorkspacePath, 'utf8').includes(
      'selectKitchenDemoSupplierScenarios'
    )
  ) {
    violations.push({
      code: 'kitchen-supplier-operation-projection',
      file: kitchenWorkspaceSupplyWorkspaceFile,
      message:
        'Kitchen Workspace Suppliers and Product Demo must share the owner-local Supplier selection seam.',
    })
  }

  const kitchenFinanceProjectionFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-finance.ts'
  const kitchenFinanceProjectionPath = path.join(
    repoRoot,
    kitchenFinanceProjectionFile
  )
  if (existsSync(kitchenFinanceProjectionPath)) {
    const source = readSourceFamily(repoRoot, [
      kitchenFinanceProjectionFile,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-finance-items.ts',
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-finance-rollups.ts',
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/demo-finance-validation.ts',
    ])
    for (const required of [
      'projectKitchenDemoFinanceReport',
      'dailyGrossSales',
      'previousGrossSalesMinor',
      'grossSalesChangePercent',
      'groupTrend',
      'groupItems',
      'groupWeekdays',
      'financialCurrencyMinorUnitDigits',
      'averageSaleMinor',
      'itemQuantity',
      'itemSalesMinor',
      'deliveryFeesMinor',
      'lineGrossMinor',
      'Math.round',
    ]) {
      if (!source.includes(required)) {
        violations.push({
          code: 'kitchen-finance-demo-projection',
          file: kitchenFinanceProjectionFile,
          message:
            'Kitchen must own the shared aggregate-only Demo Finance arithmetic.',
        })
        break
      }
    }
  } else {
    violations.push({
      code: 'kitchen-finance-demo-projection',
      file: kitchenFinanceProjectionFile,
      message:
        'Kitchen must own the shared aggregate-only Demo Finance projection.',
    })
  }

  const kitchenWorkspaceDishesOperationFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Dishes/useKitchenWorkspaceDishes.ts'
  const kitchenWorkspaceDishesOperationPath = path.join(
    repoRoot,
    kitchenWorkspaceDishesOperationFile
  )
  if (
    !existsSync(kitchenWorkspaceDishesOperationPath) ||
    !readFileSync(kitchenWorkspaceDishesOperationPath, 'utf8').includes(
      'buildKitchenDemoDishesOperation'
    )
  ) {
    violations.push({
      code: 'kitchen-dish-operation-projection',
      file: kitchenWorkspaceDishesOperationFile,
      message:
        'Kitchen Workspace Dishes must compose and expose the shared owner-local Demo operation projection.',
    })
  }

  const kitchenDishCollectionFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/dish/fetch/useKitchenDishCollection.ts'
  const kitchenDishCollectionPath = path.join(
    repoRoot,
    kitchenDishCollectionFile
  )
  const kitchenWorkspaceDishesFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Dishes/useKitchenWorkspaceDishes.ts'
  const kitchenWorkspaceDishesPath = path.join(repoRoot, kitchenWorkspaceDishesFile)
  const kitchenDishRecordsFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations/Dishes/index.ts'
  const kitchenDishRecordsPath = path.join(repoRoot, kitchenDishRecordsFile)
  if (
    !existsSync(kitchenDishRecordsPath) ||
    !existsSync(kitchenDishCollectionPath) ||
    !existsSync(kitchenWorkspaceDishesPath)
  ) {
    violations.push({
      code: 'kitchen-dish-record-provider',
      file: kitchenDishRecordsFile,
      message:
        'Kitchen Demo Dishes must expose canonical file-backed records through the shared Dish collection contract.',
    })
  } else {
    const collectionSource = readFileSync(kitchenDishCollectionPath, 'utf8')
    const workspaceSource = readFileSync(kitchenWorkspaceDishesPath, 'utf8')
    const recordsSource = readFileSync(kitchenDishRecordsPath, 'utf8')
    if (
      !collectionSource.includes('recordProvider') ||
      !collectionSource.includes('normalizeDish(entry)') ||
      !workspaceSource.includes('records: demoDishRecords') ||
      workspaceSource.includes('dishOperation.dishes') ||
      !recordsSource.includes('kitchenDemoDishRecordsByKitchenId') ||
      !recordsSource.includes('readonly Dish[]')
    ) {
      violations.push({
        code: 'kitchen-dish-record-provider',
        file: kitchenWorkspaceDishesFile,
        message:
          'Live and Demo base Dishes must differ only at the raw-record provider and share canonical Dish normalization and collection state.',
      })
    }
  }

  const kitchenWorkspaceCoreFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspace.ts'
  const kitchenWorkspaceTargetFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceTargetCollection.ts'
  const kitchenWorkspaceCorePath = path.join(repoRoot, kitchenWorkspaceCoreFile)
  const kitchenWorkspaceTargetPath = path.join(repoRoot, kitchenWorkspaceTargetFile)
  const kitchenWorkspaceCoreSource = existsSync(kitchenWorkspaceCorePath)
    ? readFileSync(kitchenWorkspaceCorePath, 'utf8')
    : ''
  const kitchenWorkspaceTargetSource = existsSync(kitchenWorkspaceTargetPath)
    ? readFileSync(kitchenWorkspaceTargetPath, 'utf8')
    : ''
  if (
    !/useKitchenWorkspaceTargetCollection\(\{\s*enabled:\s*true,\s*\}\)/.test(
      kitchenWorkspaceCoreSource
    ) ||
    !kitchenWorkspaceCoreSource.includes("workspaceData('live', kitchen)") ||
    !kitchenWorkspaceCoreSource.includes("workspaceData('demo', kitchen)") ||
    !kitchenWorkspaceTargetSource.includes(
      'enabled?: MaybeRefOrGetter<boolean>'
    ) ||
    !kitchenWorkspaceTargetSource.includes('enabled: options.enabled')
  ) {
    violations.push({
      code: 'kitchen-demo-live-target',
      file: kitchenWorkspaceCoreFile,
      message:
        'Kitchen Demo and Live targets must feed one shared family runtime without creating page-specific target providers.',
    })
  }

  if (violations.length) throw new Error(formatViolations(violations))

  console.log(
    '[guard] ✅ Demo World is owner-owned, deferred, narrowly consumed, and read-only'
  )
}
