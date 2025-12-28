// FILE: scripts/guards/canon.mjs
// FireUX Canon Guard
//
// Enforces repo-wide FireUX canon rules that prevent drift:
// - No legacy/back-compat shims
// - No legacy composable paths (e.g. firestore/products/product)
// - Firestore object folders are lowercase (objects/<thing>)
//
// Called by scripts/guard.mjs.
// MUST NOT be run directly.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.nuxt',
  '.output',
  '.git',
  '.turbo',
  '.next',
  '.pnpm',
])

const SCAN_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.d.ts',
  '.vue',
])

function isDirectory(p) {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

function walkFiles(rootDir) {
  const out = []
  const stack = [rootDir]

  while (stack.length) {
    const current = stack.pop()
    if (!current) continue

    let entries = []
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue

      const fullPath = path.join(current, entry.name)

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) stack.push(fullPath)
        continue
      }

      if (!entry.isFile()) continue

      const ext = path.extname(entry.name)
      if (!SCAN_EXTS.has(ext)) continue

      out.push(fullPath)
    }
  }

  return out
}

function findAllMatches(text, re) {
  const matches = []
  let m
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(text))) {
    matches.push({ index: m.index, match: m[0] })
  }
  return matches
}

function lineInfo(text, index) {
  const upTo = text.slice(0, index)
  const line = upTo.split('\n').length
  return { line }
}

function toRepoRelative(repoRoot, absPath) {
  return path.relative(repoRoot, absPath)
}

function checkObjectFolderCasing(repoRoot) {
  const violations = []

  const packagesRoot = path.join(repoRoot, 'packages')
  if (!existsSync(packagesRoot)) return violations

  const pkgGroups = readdirSync(packagesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)

  for (const group of pkgGroups) {
    const groupDir = path.join(packagesRoot, group)
    const pkgs = readdirSync(groupDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d) => path.join(groupDir, d.name))

    for (const pkgPath of pkgs) {
      const objectsDir = path.join(
        pkgPath,
        'src',
        'runtime',
        'composables',
        'fireux',
        'firestore',
        'objects'
      )

      if (!isDirectory(objectsDir)) continue

      const children = readdirSync(objectsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)

      for (const name of children) {
        const first = name[0]
        if (first && first.toUpperCase() === first && first.toLowerCase() !== first) {
          violations.push(
            `- Uppercase object folder: ${toRepoRelative(
              repoRoot,
              path.join(objectsDir, name)
            )}`
          )
        }
      }

      const legacyProductsDir = path.join(
        pkgPath,
        'src',
        'runtime',
        'composables',
        'fireux',
        'firestore',
        'products',
        'product'
      )

      if (isDirectory(legacyProductsDir)) {
        violations.push(
          `- Legacy product composables dir exists: ${toRepoRelative(
            repoRoot,
            legacyProductsDir
          )}`
        )
      }
    }
  }

  return violations
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()

  const violations = []

  // 1) Structural checks (directories)
  violations.push(...checkObjectFolderCasing(repoRoot))

  // 2) Content checks (imports/markers)
  const scanRoots = [path.join(repoRoot, 'packages'), path.join(repoRoot, 'projects')]
    .filter((p) => existsSync(p))

  const files = scanRoots.flatMap((p) => walkFiles(p))

  const reBackCompat = /Back-compat shim/gi
  const reLegacyProductPath = /firestore\/products\/product/gi
  const reUppercaseObjectImport = /firestore\/objects\/[A-Z]/g

  for (const file of files) {
    let raw = ''
    try {
      raw = readFileSync(file, 'utf8')
    } catch {
      continue
    }

    for (const hit of findAllMatches(raw, reBackCompat)) {
      const { line } = lineInfo(raw, hit.index)
      violations.push(
        `- Back-compat shim marker in ${toRepoRelative(repoRoot, file)}:${line}`
      )
    }

    for (const hit of findAllMatches(raw, reLegacyProductPath)) {
      const { line } = lineInfo(raw, hit.index)
      violations.push(
        `- Legacy composable path "firestore/products/product" in ${toRepoRelative(
          repoRoot,
          file
        )}:${line}`
      )
    }

    for (const hit of findAllMatches(raw, reUppercaseObjectImport)) {
      const { line } = lineInfo(raw, hit.index)
      violations.push(
        `- Uppercase object path segment in ${toRepoRelative(repoRoot, file)}:${line} ("${hit.match}")`
      )
    }
  }

  if (violations.length) {
    const lines = [
      '[guard] ❌ FireUX canon violations detected:',
      ...violations,
      '',
      '[guard] Fix:',
      '- Remove any legacy/back-compat shims (no double paths)',
      '- Ensure Firestore objects live under: composables/fireux/firestore/objects/<thing> (lowercase)',
      '- Do not create composables under: firestore/products/product',
    ]

    throw new Error(lines.join('\n'))
  }

  console.log('[guard] ✅ canon conventions valid')
}
