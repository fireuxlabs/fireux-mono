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

const DOC_SCAN_EXTS = new Set([...SCAN_EXTS, '.md'])

const FORBIDDEN_KITCHEN_BUCKET_TERMS = [
  'firestore/runtime-kitchen',
  'runtime-kitchen',
  'RuntimeKitchen',
  'runtimeKitchen',
  'useRuntimeKitchen',
  'useKitchenMenuStackCreate',
  'useKitchenMenuStackFetch',
]

const FORBIDDEN_FIRESTORE_ARCHITECTURE_SEGMENTS = new Set([
  'facade',
  'stack',
  'manager',
  'processor',
  'handler',
])

const ALLOWED_FORBIDDEN_CONTEXT =
  /\b(avoid|do not|must not|non-canon|forbidden|mixed-bucket|cannot return)\b/i

function isDirectory(p) {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

function walkFiles(rootDir, exts = SCAN_EXTS) {
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
      if (!exts.has(ext)) continue

      out.push(fullPath)
    }
  }

  return out
}

function walkDirs(rootDir) {
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
      if (!entry.isDirectory()) continue
      if (SKIP_DIRS.has(entry.name)) continue

      const fullPath = path.join(current, entry.name)
      out.push(fullPath)
      stack.push(fullPath)
    }
  }

  return out
}

function shouldSkipKitchenBucketScan(repoRoot, absPath) {
  const rel = toRepoRelative(repoRoot, absPath)
  const parts = rel.split(path.sep)

  if (parts.includes('changelog')) return true
  if (rel.startsWith(`docs${path.sep}ai${path.sep}`)) return true
  if (rel.startsWith(`docs${path.sep}reports${path.sep}`)) return true

  return false
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

function scanKitchenBucketTerms(repoRoot, absPath) {
  const violations = []
  if (shouldSkipKitchenBucketScan(repoRoot, absPath)) return violations

  let raw = ''
  try {
    raw = readFileSync(absPath, 'utf8')
  } catch {
    return violations
  }

  const lines = raw.split('\n')
  lines.forEach((lineText, index) => {
    if (ALLOWED_FORBIDDEN_CONTEXT.test(lineText)) return

    for (const term of FORBIDDEN_KITCHEN_BUCKET_TERMS) {
      if (!lineText.includes(term)) continue
      violations.push(
        `- Forbidden kitchen bucket term "${term}" in ${toRepoRelative(
          repoRoot,
          absPath
        )}:${index + 1}`
      )
    }
  })

  return violations
}

function checkForbiddenKitchenBucketNames(repoRoot) {
  const violations = []
  const forbiddenDir = path.join(
    repoRoot,
    'packages',
    'extensions',
    'fireux-kitchens',
    'src',
    'runtime',
    'composables',
    'fireux',
    'firestore',
    'runtime-kitchen'
  )

  if (isDirectory(forbiddenDir)) {
    violations.push(
      `- Forbidden mixed-bucket directory exists: ${toRepoRelative(
        repoRoot,
        forbiddenDir
      )}`
    )
  }

  const scanTargets = [
    path.join(repoRoot, 'packages', 'extensions', 'fireux-kitchens', 'src'),
    path.join(repoRoot, 'packages', 'extensions', 'fireux-kitchens', 'docs'),
    path.join(repoRoot, 'packages', 'core', 'fireux-docs', 'src', 'runtime'),
    path.join(repoRoot, 'docs', 'fireux-canon.md'),
    path.join(repoRoot, 'docs', 'runtime-contract.md'),
    path.join(repoRoot, 'docs', 'seo-canon.md'),
  ].filter((p) => existsSync(p))

  for (const target of scanTargets) {
    if (isDirectory(target)) {
      for (const file of walkFiles(target, DOC_SCAN_EXTS)) {
        violations.push(...scanKitchenBucketTerms(repoRoot, file))
      }
      continue
    }

    violations.push(...scanKitchenBucketTerms(repoRoot, target))
  }

  return violations
}

function findSegmentSequence(parts, sequence) {
  for (let index = 0; index <= parts.length - sequence.length; index += 1) {
    const slice = parts.slice(index, index + sequence.length)
    if (slice.every((part, offset) => part === sequence[offset])) return index
  }
  return -1
}

function checkForbiddenFirestoreStackFolders(repoRoot) {
  const violations = []
  const packagesRoot = path.join(repoRoot, 'packages')
  if (!existsSync(packagesRoot)) return violations

  const firestoreSequence = [
    'src',
    'runtime',
    'composables',
    'fireux',
    'firestore',
  ]

  for (const dir of walkDirs(packagesRoot)) {
    const rel = toRepoRelative(repoRoot, dir)
    const parts = rel.split(path.sep)
    const firestoreIndex = findSegmentSequence(parts, firestoreSequence)
    if (firestoreIndex < 0) continue

    const afterFirestore = parts.slice(firestoreIndex + firestoreSequence.length)
    if (!afterFirestore.length) continue

    const segment = afterFirestore[afterFirestore.length - 1]
    const normalized = segment.toLowerCase()

    if (normalized.startsWith('runtime-')) {
      violations.push(
        `- Forbidden Firestore runtime bucket: ${rel}`
      )
      continue
    }

    if (FORBIDDEN_FIRESTORE_ARCHITECTURE_SEGMENTS.has(normalized)) {
      violations.push(
        `- Forbidden architecture bucket under Firestore entity stack: ${rel}`
      )
    }
  }

  return violations
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()

  const violations = []

  // 1) Structural checks (directories)
  violations.push(...checkObjectFolderCasing(repoRoot))
  violations.push(...checkForbiddenFirestoreStackFolders(repoRoot))
  violations.push(...checkForbiddenKitchenBucketNames(repoRoot))

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
      '- Do not create mixed-bucket kitchen paths such as firestore/runtime-kitchen',
      '- Keep usual Firestore entity stacks boring: fetch/, mutations/, utils/',
      '- Put console operation buckets under: composables/fireux/console/<entity>/',
    ]

    throw new Error(lines.join('\n'))
  }

  console.log('[guard] ✅ canon conventions valid')
}
