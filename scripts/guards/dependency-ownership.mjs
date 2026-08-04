// @fireux-script
// last_used: 2026-08-04
// usage_note: rejects shadow boundaries, undeclared imports or Nuxt modules, and split framework type identities.
// FILE: scripts/guards/dependency-ownership.mjs

import { builtinModules } from 'node:module'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { DEFAULT_APP_MODULES } from '../../packages/core/fireux-core/src/config/app/modules.ts'

const CODE_EXTENSIONS = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
  '.vue',
])

const STYLE_EXTENSIONS = new Set(['.css', '.sass', '.scss'])

const IGNORED_DIRECTORIES = new Set([
  '.data',
  '.firebase',
  '.git',
  '.nuxt',
  '.output',
  'coverage',
  'dist',
  'mirror',
  'node_modules',
  'public',
  'temp',
])

const BUILTINS = new Set(
  builtinModules.flatMap((name) => [name, name.replace(/^node:/, '')])
)

const APP_RESOLVED_BASELINE_MODULES = [
  '@nuxt/icon',
  '@nuxt/ui',
  '@vite-pwa/nuxt',
  'fireux-core',
  ...DEFAULT_APP_MODULES,
]

function childDirectories(directory) {
  if (!existsSync(directory)) return []

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(directory, entry.name))
}

function packageRoots(repoRoot) {
  const roots = []
  const packageFamilies = ['core', 'extensions', 'ecosystem']

  for (const family of packageFamilies) {
    const familyRoot = path.join(repoRoot, 'packages', family)
    for (const packageRoot of childDirectories(familyRoot)) {
      if (existsSync(path.join(packageRoot, 'package.json')))
        roots.push(packageRoot)

      if (family === 'ecosystem') {
        for (const appRoot of childDirectories(
          path.join(packageRoot, 'apps')
        )) {
          if (existsSync(path.join(appRoot, 'package.json')))
            roots.push(appRoot)
        }
      }
    }
  }

  for (const ecosystemRoot of childDirectories(
    path.join(repoRoot, 'projects')
  )) {
    for (const projectRoot of childDirectories(ecosystemRoot)) {
      if (existsSync(path.join(projectRoot, 'package.json')))
        roots.push(projectRoot)
    }
  }

  for (const toolRoot of childDirectories(path.join(repoRoot, 'tools'))) {
    if (existsSync(path.join(toolRoot, 'package.json'))) roots.push(toolRoot)
  }

  for (const entry of readdirSync(repoRoot, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      entry.name.startsWith('test-') &&
      existsSync(path.join(repoRoot, entry.name, 'package.json'))
    ) {
      roots.push(path.join(repoRoot, entry.name))
    }
  }

  return roots.sort((left, right) => left.localeCompare(right))
}

function readManifest(packageRoot) {
  const manifestPath = path.join(packageRoot, 'package.json')
  return JSON.parse(readFileSync(manifestPath, 'utf8'))
}

function declaredDependencies(manifest) {
  return new Set(
    [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ].flatMap((field) => Object.keys(manifest[field] ?? {}))
  )
}

function packageName(specifier) {
  if (specifier.startsWith('@')) {
    return specifier.split('/').slice(0, 2).join('/')
  }

  return specifier.split('/')[0] ?? specifier
}

function isLocalOrVirtualImport(specifier) {
  return (
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('#') ||
    specifier.startsWith('~') ||
    specifier.startsWith('@/') ||
    specifier.startsWith('@@/') ||
    specifier.startsWith('virtual:') ||
    specifier.startsWith('nitro:') ||
    /^[a-z][a-z0-9+.-]*:/i.test(specifier)
  )
}

function importedPackages(source) {
  const imports = new Set()
  const sourceFile = ts.createSourceFile(
    'dependency-owner.ts',
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX
  )

  function addSpecifier(node) {
    if (!node || !ts.isStringLiteralLike(node)) return
    const specifier = node.text
    if (!specifier || isLocalOrVirtualImport(specifier)) return
    if (specifier.startsWith('node:') || BUILTINS.has(specifier)) return
    imports.add(packageName(specifier))
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addSpecifier(node.moduleSpecifier)
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      addSpecifier(node.moduleReference.expression)
    } else if (ts.isCallExpression(node) && node.arguments.length === 1) {
      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')
      ) {
        addSpecifier(node.arguments[0])
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return imports
}

function importedStylePackages(source) {
  const imports = new Set()

  for (const match of source.matchAll(
    /@(?:forward|import|use)\s+(?:url\(\s*)?['"]([^'"]+)['"]/g
  )) {
    const specifier = match[1]
    if (!specifier || isLocalOrVirtualImport(specifier)) continue
    if (specifier.startsWith('sass:')) continue
    imports.add(packageName(specifier))
  }

  return imports
}

function sourceUnits(filePath) {
  const source = readFileSync(filePath, 'utf8')
  if (path.extname(filePath) !== '.vue') return [source]

  return [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .filter(Boolean)
}

function vueStyleUnits(filePath) {
  const source = readFileSync(filePath, 'utf8')

  return [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)]
    .map((match) => match[1])
    .filter(Boolean)
}

function walkFiles(directory, { nestedPackageRoots = new Set() } = {}) {
  if (!existsSync(directory)) return []
  if (statSync(directory).isFile()) return [directory]
  const files = []
  const pending = [directory]

  while (pending.length) {
    const current = pending.pop()
    if (!current) continue

    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue
        if (entryPath !== directory && nestedPackageRoots.has(entryPath))
          continue
        pending.push(entryPath)
        continue
      }

      if (entry.isFile()) files.push(entryPath)
    }
  }

  return files
}

function directImportViolations({
  repoRoot,
  ownerRoot,
  ownerLabel,
  manifest,
  nestedPackageRoots,
}) {
  const declared = declaredDependencies(manifest)
  const violations = []

  for (const filePath of walkFiles(ownerRoot, { nestedPackageRoots })) {
    const extension = path.extname(filePath)
    if (!CODE_EXTENSIONS.has(extension) && !STYLE_EXTENSIONS.has(extension))
      continue

    const sources = STYLE_EXTENSIONS.has(extension)
      ? [readFileSync(filePath, 'utf8')]
      : sourceUnits(filePath)

    for (const source of sources) {
      const imports = STYLE_EXTENSIONS.has(extension)
        ? importedStylePackages(source)
        : importedPackages(source)

      for (const importedPackage of imports) {
        if (importedPackage === manifest.name || declared.has(importedPackage))
          continue
        if (importedPackage === 'vscode' && manifest.engines?.vscode) continue
        violations.push({
          dependency: importedPackage,
          file: path.relative(repoRoot, filePath),
          owner: ownerLabel ?? (path.relative(repoRoot, ownerRoot) || '.'),
        })
      }
    }

    if (extension === '.vue') {
      for (const source of vueStyleUnits(filePath)) {
        for (const importedPackage of importedStylePackages(source)) {
          if (
            importedPackage === manifest.name ||
            declared.has(importedPackage)
          )
            continue
          violations.push({
            dependency: importedPackage,
            file: path.relative(repoRoot, filePath),
            owner: ownerLabel ?? (path.relative(repoRoot, ownerRoot) || '.'),
          })
        }
      }
    }
  }

  return violations
}

function propertyName(node) {
  if (!node) return undefined
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text
  return undefined
}

function objectProperty(object, name) {
  return object.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) && propertyName(property.name) === name
  )
}

function literalString(node) {
  return node && ts.isStringLiteralLike(node) ? node.text.trim() : ''
}

function fireuxConfigModuleNames(source) {
  const sourceFile = ts.createSourceFile(
    'nuxt.config.ts',
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  )
  let config

  function visit(node) {
    if (
      !config &&
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'defineFireuxConfig' &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      config = node.arguments[0]
      return
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  if (!config) return []

  const ecosystemProperty = objectProperty(config, 'ecosystem')
  const ecosystem = literalString(ecosystemProperty?.initializer)
  const modulesProperty = objectProperty(config, 'modules')
  const configured = []

  if (
    modulesProperty &&
    ts.isArrayLiteralExpression(modulesProperty.initializer)
  ) {
    for (const entry of modulesProperty.initializer.elements) {
      if (ts.isStringLiteralLike(entry)) configured.push(entry.text)
      if (
        ts.isArrayLiteralExpression(entry) &&
        ts.isStringLiteralLike(entry.elements[0])
      ) {
        configured.push(entry.elements[0].text)
      }
    }
  }

  return [
    ...APP_RESOLVED_BASELINE_MODULES,
    ...(ecosystem ? [`fireux-${ecosystem}`] : []),
    ...configured,
  ]
}

function nuxtModuleDependencyViolations({ repoRoot, ownerRoot, manifest }) {
  const configPath = path.join(ownerRoot, 'nuxt.config.ts')
  if (!existsSync(configPath)) return []

  const declared = declaredDependencies(manifest)
  const required = new Set(
    fireuxConfigModuleNames(readFileSync(configPath, 'utf8')).map(packageName)
  )

  return [...required]
    .filter((dependency) => dependency && !declared.has(dependency))
    .sort()
    .map((dependency) => ({
      dependency,
      file: path.relative(repoRoot, configPath),
      owner: path.relative(repoRoot, ownerRoot),
    }))
}

function nestedManifestViolations({ repoRoot, roots }) {
  const rootSet = new Set(roots)
  const violations = []

  for (const packageRoot of roots) {
    for (const filePath of walkFiles(packageRoot, {
      nestedPackageRoots: rootSet,
    })) {
      if (path.basename(filePath) !== 'package.json') continue
      if (filePath === path.join(packageRoot, 'package.json')) continue
      violations.push(path.relative(repoRoot, filePath))
    }
  }

  return violations
}

function rootSourceRoots(repoRoot) {
  return [
    path.join(repoRoot, 'eslint.config.js'),
    path.join(repoRoot, 'scripts'),
  ].filter((sourcePath) => {
    return existsSync(sourcePath)
  })
}

function h3TypeIdentityViolations(repoRoot) {
  const workspaceSource = readFileSync(
    path.join(repoRoot, 'pnpm-workspace.yaml'),
    'utf8'
  )
  const override = workspaceSource.match(
    /^\s{2}['"]?h3['"]?:\s*['"]?([^'"\s#]+)/m
  )?.[1]
  if (!override) {
    return ['pnpm-workspace.yaml must pin overrides.h3.']
  }

  const lockSource = readFileSync(path.join(repoRoot, 'pnpm-lock.yaml'), 'utf8')
  const lockedVersions = new Set(
    [...lockSource.matchAll(/^  h3@([^:()]+)(?:\([^)]*\))?:$/gm)].map(
      (match) => match[1]
    )
  )

  if (lockedVersions.size !== 1 || !lockedVersions.has(override)) {
    return [
      `pnpm-lock.yaml resolves H3 as [${[...lockedVersions].sort().join(', ') || 'none'}], expected only ${override}.`,
    ]
  }

  return []
}

function firebaseAdminSsrBoundaryViolations(repoRoot) {
  const vitePath = path.join(
    repoRoot,
    'packages/core/fireux-core/src/config/app/vite.ts'
  )
  const fallbackPath = path.join(
    repoRoot,
    'packages/core/fireux-nuxtfire/src/runtime/plugins/firebase-admin-fallback.server.ts'
  )
  const viteSource = readFileSync(vitePath, 'utf8')
  const fallbackSource = readFileSync(fallbackPath, 'utf8')
  const violations = []

  for (const subpath of [
    'firebase-admin/app',
    'firebase-admin/app-check',
    'firebase-admin/auth',
    'firebase-admin/firestore',
    'firebase-admin/storage',
  ]) {
    if (!viteSource.includes(`'${subpath}'`)) {
      violations.push(
        `fireux-core Vite config must alias ${subpath} to its CommonJS entrypoint.`
      )
    }
  }

  for (const required of [
    'createRequire(import.meta.url).resolve',
    'replacement: resolveDependency(packageName)',
  ]) {
    if (!viteSource.includes(required)) {
      violations.push(`fireux-core Vite config is missing ${required}.`)
    }
  }

  for (const required of [
    'createRequire(import.meta.url)',
    "require('firebase-admin/app')",
  ]) {
    if (!fallbackSource.includes(required)) {
      violations.push(`fireux-nuxtfire Admin fallback is missing ${required}.`)
    }
  }

  if (
    /import\s*\{[^}]*\b(?:applicationDefault|cert|getApps|initializeApp)\b[^}]*\}\s*from\s*['"]firebase-admin\/app['"]/s.test(
      fallbackSource
    )
  ) {
    violations.push(
      'fireux-nuxtfire Admin fallback must not use Firebase Admin runtime ESM bindings in Vite SSR.'
    )
  }

  return violations
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const roots = packageRoots(repoRoot)
  const rootSet = new Set(roots)
  const rootManifest = readManifest(repoRoot)
  const violations = []
  const nuxtModuleViolations = []

  for (const ownerRoot of roots) {
    const manifest = readManifest(ownerRoot)
    violations.push(
      ...directImportViolations({
        repoRoot,
        ownerRoot,
        ownerLabel: path.relative(repoRoot, ownerRoot),
        manifest,
        nestedPackageRoots: rootSet,
      })
    )
    nuxtModuleViolations.push(
      ...nuxtModuleDependencyViolations({ repoRoot, ownerRoot, manifest })
    )
  }

  for (const sourceRoot of rootSourceRoots(repoRoot)) {
    violations.push(
      ...directImportViolations({
        repoRoot,
        ownerRoot: sourceRoot,
        ownerLabel: '.',
        manifest: rootManifest,
        nestedPackageRoots: rootSet,
      })
    )
  }

  const nestedManifests = nestedManifestViolations({ repoRoot, roots })
  const rootRuntimeDependencies = Object.keys(rootManifest.dependencies ?? {})
  const typeIdentityViolations = h3TypeIdentityViolations(repoRoot)
  const firebaseAdminSsrViolations =
    firebaseAdminSsrBoundaryViolations(repoRoot)

  if (
    violations.length ||
    nuxtModuleViolations.length ||
    nestedManifests.length ||
    rootRuntimeDependencies.length ||
    typeIdentityViolations.length ||
    firebaseAdminSsrViolations.length
  ) {
    const lines = ['[guard] ❌ Dependency ownership drift detected:']

    if (violations.length) {
      lines.push(
        '',
        'Direct imports missing from their owning package manifest:',
        ...violations
          .sort((left, right) => left.file.localeCompare(right.file))
          .map(
            ({ dependency, file, owner }) =>
              `  - ${file}: ${dependency} (owner: ${owner}/package.json)`
          )
      )
    }

    if (nuxtModuleViolations.length) {
      lines.push(
        '',
        'Nuxt modules missing from their App manifest:',
        ...nuxtModuleViolations.map(
          ({ dependency, file, owner }) =>
            `  - ${file}: ${dependency} (owner: ${owner}/package.json)`
        )
      )
    }

    if (nestedManifests.length) {
      lines.push(
        '',
        'Shadow package boundaries inside authored package source:',
        ...nestedManifests.sort().map((file) => `  - ${file}`)
      )
    }

    if (rootRuntimeDependencies.length) {
      lines.push(
        '',
        'Private workspace-root runtime dependencies:',
        ...rootRuntimeDependencies
          .sort()
          .map((dependency) => `  - ${dependency}`)
      )
    }

    if (typeIdentityViolations.length) {
      lines.push(
        '',
        'Shared framework type identity:',
        ...typeIdentityViolations.map((violation) => `  - ${violation}`)
      )
    }

    if (firebaseAdminSsrViolations.length) {
      lines.push(
        '',
        'Firebase Admin SSR interop boundary:',
        ...firebaseAdminSsrViolations.map((violation) => `  - ${violation}`)
      )
    }

    lines.push(
      '',
      '[guard] Fix:',
      '- Declare every direct import in the package that owns the importing file.',
      '- Declare every baseline, ecosystem, and configured Nuxt module in the App package that resolves it.',
      '- Remove nested package.json files that create accidental source boundaries.',
      '- Keep the private workspace root tooling-only; root packages belong in devDependencies.',
      '- Keep H3 on one workspace override so Nitro and package event types share an identity.',
      '- Keep Firebase Admin server subpaths on the shared CommonJS boundary so Vite SSR cannot expose undefined ESM bindings.'
    )

    throw new Error(lines.join('\n'))
  }

  console.log(
    '[guard] ✅ imports and Nuxt modules have explicit owners, runtime subpaths are canonical, and H3 has one type identity'
  )
}
