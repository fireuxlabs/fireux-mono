// @fireux-script
// last_used: 2026-07-20
// usage_note: rejects shadow package boundaries and undeclared direct imports.
// Concurrent edit — 2026-07-20 22:24 CEST — Repo Efficiency Pass 5 of 6: enforce explicit dependency ownership.
// FILE: scripts/guards/dependency-ownership.mjs

import { builtinModules } from 'node:module'
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

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
      if (existsSync(path.join(packageRoot, 'package.json'))) roots.push(packageRoot)

      if (family === 'ecosystem') {
        for (const appRoot of childDirectories(path.join(packageRoot, 'apps'))) {
          if (existsSync(path.join(appRoot, 'package.json'))) roots.push(appRoot)
        }
      }
    }
  }

  for (const ecosystemRoot of childDirectories(path.join(repoRoot, 'projects'))) {
    for (const projectRoot of childDirectories(ecosystemRoot)) {
      if (existsSync(path.join(projectRoot, 'package.json'))) roots.push(projectRoot)
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
    ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
      .flatMap((field) => Object.keys(manifest[field] ?? {}))
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
    specifier.startsWith('nitro:')
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

function sourceUnits(filePath) {
  const source = readFileSync(filePath, 'utf8')
  if (path.extname(filePath) !== '.vue') return [source]

  return [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .filter(Boolean)
}

function walkFiles(directory, { nestedPackageRoots = new Set() } = {}) {
  if (!existsSync(directory)) return []
  const files = []
  const pending = [directory]

  while (pending.length) {
    const current = pending.pop()
    if (!current) continue

    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue
        if (entryPath !== directory && nestedPackageRoots.has(entryPath)) continue
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
    if (!CODE_EXTENSIONS.has(path.extname(filePath))) continue

    for (const source of sourceUnits(filePath)) {
      for (const importedPackage of importedPackages(source)) {
        if (importedPackage === manifest.name || declared.has(importedPackage)) continue
        if (importedPackage === 'vscode' && manifest.engines?.vscode) continue
        violations.push({
          dependency: importedPackage,
          file: path.relative(repoRoot, filePath),
          owner: ownerLabel ?? (path.relative(repoRoot, ownerRoot) || '.'),
        })
      }
    }
  }

  return violations
}

function nestedManifestViolations({ repoRoot, roots }) {
  const rootSet = new Set(roots)
  const violations = []

  for (const packageRoot of roots) {
    for (const filePath of walkFiles(packageRoot, { nestedPackageRoots: rootSet })) {
      if (path.basename(filePath) !== 'package.json') continue
      if (filePath === path.join(packageRoot, 'package.json')) continue
      violations.push(path.relative(repoRoot, filePath))
    }
  }

  return violations
}

function rootSourceRoots(repoRoot) {
  return [path.join(repoRoot, 'scripts')].filter((directory) => {
    return existsSync(directory) && statSync(directory).isDirectory()
  })
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const roots = packageRoots(repoRoot)
  const rootSet = new Set(roots)
  const rootManifest = readManifest(repoRoot)
  const violations = []

  for (const ownerRoot of roots) {
    violations.push(
      ...directImportViolations({
        repoRoot,
        ownerRoot,
        ownerLabel: path.relative(repoRoot, ownerRoot),
        manifest: readManifest(ownerRoot),
        nestedPackageRoots: rootSet,
      })
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

  if (violations.length || nestedManifests.length || rootRuntimeDependencies.length) {
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
        ...rootRuntimeDependencies.sort().map((dependency) => `  - ${dependency}`)
      )
    }

    lines.push(
      '',
      '[guard] Fix:',
      '- Declare every direct import in the package that owns the importing file.',
      '- Remove nested package.json files that create accidental source boundaries.',
      '- Keep the private workspace root tooling-only; root packages belong in devDependencies.'
    )

    throw new Error(lines.join('\n'))
  }

  console.log('[guard] ✅ direct dependencies have explicit package owners')
}
