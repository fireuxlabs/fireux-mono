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

const FORBIDDEN_CONSOLE_ARCHITECTURE_SEGMENTS = new Set([
  'facade',
  'stack',
  'manager',
  'processor',
  'handler',
  'resolver',
])

const FORBIDDEN_CONSOLE_COMPOSABLE_PATTERNS = [
  {
    label: 'useChildEntityConsoleResolver',
    re: /\buseChildEntityConsoleResolver\b/g,
  },
  {
    label: 'useConsoleChildResolver',
    re: /\buseConsoleChildResolver\b/g,
  },
  {
    label: 'useRuntime*',
    re: /\buseRuntime[A-Z][A-Za-z0-9_]*\b/g,
  },
  {
    label: '*Facade*',
    re: /\b[A-Za-z0-9_]*Facade[A-Za-z0-9_]*\b/g,
  },
]

const FIRESTORE_ENTITY_STACK_ALLOWED_CHILDREN = new Set([
  'fetch',
  'mutations',
  'utils',
])

const FIRESTORE_ENTITY_STACK_EXCEPTION_CHILDREN = new Map([
  [
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles',
    new Set(['Agent', 'Professional']),
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles',
    new Set(['Chef']),
  ],
  [
    'packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product',
    new Set(['price']),
  ],
])

const KNOWN_CONSOLE_OPERATION_SLICES_BY_ENTITY = new Map([
  [
    'kitchen',
    new Set([
      'ingredients',
      'menu',
      'mise',
      'orders',
      'station',
      'suppliers',
      'team',
    ]),
  ],
  [
    'portfolio',
    new Set([
      'client',
      'property',
      'unit',
    ]),
  ],
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

function listChildDirectories(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name))
      .map((entry) => entry.name)
      .sort()
  } catch {
    return []
  }
}

function findFirestoreEntityStackRoots(repoRoot) {
  const roots = []
  const coreFirestoreRoot = path.join(
    repoRoot,
    'packages',
    'core',
    'fireux-core',
    'src',
    'runtime',
    'composables',
    'fireux',
    'firestore',
    'core'
  )

  if (isDirectory(coreFirestoreRoot)) {
    for (const child of listChildDirectories(coreFirestoreRoot)) {
      roots.push(path.join(coreFirestoreRoot, child))
    }
  }

  const extensionsRoot = path.join(repoRoot, 'packages', 'extensions')
  if (!isDirectory(extensionsRoot)) return roots

  for (const extensionName of listChildDirectories(extensionsRoot)) {
    const firestoreRoot = path.join(
      extensionsRoot,
      extensionName,
      'src',
      'runtime',
      'composables',
      'fireux',
      'firestore'
    )

    if (!isDirectory(firestoreRoot)) continue

    for (const child of listChildDirectories(firestoreRoot)) {
      roots.push(path.join(firestoreRoot, child))
    }
  }

  return roots
}

function checkFirestoreEntityStackShape(repoRoot) {
  const violations = []
  const warnings = []

  for (const entityRoot of findFirestoreEntityStackRoots(repoRoot)) {
    const relRoot = toRepoRelative(repoRoot, entityRoot)
    const entity = path.basename(entityRoot)
    const allowedExceptionChildren =
      FIRESTORE_ENTITY_STACK_EXCEPTION_CHILDREN.get(relRoot) ?? new Set()

    for (const child of listChildDirectories(entityRoot)) {
      if (FIRESTORE_ENTITY_STACK_ALLOWED_CHILDREN.has(child)) continue
      if (allowedExceptionChildren.has(child)) continue

      const childRel = `${relRoot}/${child}`
      const knownConsoleSlices =
        KNOWN_CONSOLE_OPERATION_SLICES_BY_ENTITY.get(entity) ?? new Set()

      if (knownConsoleSlices.has(child)) {
        violations.push(
          `- Console operation folder belongs under composables/fireux/console/${entity}: ${childRel}`
        )
        continue
      }

      warnings.push(
        `- Non-standard Firestore entity stack folder: ${childRel}`
      )
    }
  }

  return { violations, warnings }
}

function checkProductsFirestoreStackShape(repoRoot) {
  const violations = []
  const productRoot = path.join(
    repoRoot,
    'packages',
    'extensions',
    'fireux-products',
    'src',
    'runtime',
    'composables',
    'fireux',
    'firestore',
    'product'
  )

  const forbiddenRootChildren = ['state', 'onboarding']
  for (const child of forbiddenRootChildren) {
    const childPath = path.join(productRoot, child)
    if (!isDirectory(childPath)) continue
    violations.push(
      `- Product UI/runtime state belongs under composables/fireux/app, not Firestore: ${toRepoRelative(
        repoRoot,
        childPath
      )}`
    )
  }

  const priceRoot = path.join(productRoot, 'price')
  if (isDirectory(priceRoot)) {
    for (const child of listChildDirectories(priceRoot)) {
      if (child === 'fetch') continue
      const childPath = path.join(priceRoot, child)
      violations.push(
        `- ProductPrice Firestore child exception only allows fetch/: ${toRepoRelative(
          repoRoot,
          childPath
        )}`
      )
    }
  }

  return violations
}

function checkForbiddenEntityConsoleAppBuckets(repoRoot) {
  const violations = []
  const appConsoleRoots = [
    path.join(repoRoot, 'packages'),
    path.join(repoRoot, 'projects'),
  ].filter((p) => existsSync(p))

  for (const root of appConsoleRoots) {
    for (const dir of walkDirs(root)) {
      const rel = toRepoRelative(repoRoot, dir)
      const parts = rel.split(path.sep)
      const appIndex = findSegmentSequence(parts, [
        'composables',
        'fireux',
        'app',
      ])
      if (appIndex < 0) continue

      const bucket = parts[appIndex + 3]
      if (!bucket || !bucket.endsWith('-console')) continue
      if (bucket === 'console') continue

      violations.push(
        `- Domain console composables belong under composables/fireux/console/<entity>, not app/${bucket}: ${rel}`
      )
    }
  }

  return violations
}

function findConsoleOperationStackRoots(repoRoot) {
  const roots = []
  const coreConsoleRoot = path.join(
    repoRoot,
    'packages',
    'core',
    'fireux-core',
    'src',
    'runtime',
    'composables',
    'fireux',
    'console'
  )

  if (isDirectory(coreConsoleRoot)) roots.push(coreConsoleRoot)

  const extensionsRoot = path.join(repoRoot, 'packages', 'extensions')
  if (!isDirectory(extensionsRoot)) return roots

  for (const extensionName of listChildDirectories(extensionsRoot)) {
    const consoleRoot = path.join(
      extensionsRoot,
      extensionName,
      'src',
      'runtime',
      'composables',
      'fireux',
      'console'
    )

    if (isDirectory(consoleRoot)) roots.push(consoleRoot)
  }

  const projectsRoot = path.join(repoRoot, 'projects')
  if (!isDirectory(projectsRoot)) return roots

  for (const ecosystemName of listChildDirectories(projectsRoot)) {
    const ecosystemRoot = path.join(projectsRoot, ecosystemName)
    for (const projectName of listChildDirectories(ecosystemRoot)) {
      const consoleRoot = path.join(
        ecosystemRoot,
        projectName,
        'app',
        'composables',
        'fireux',
        'console'
      )

      if (isDirectory(consoleRoot)) roots.push(consoleRoot)
    }
  }

  return roots
}

function checkConsoleOperationStackShape(repoRoot) {
  const violations = []

  for (const consoleRoot of findConsoleOperationStackRoots(repoRoot)) {
    for (const entity of listChildDirectories(consoleRoot)) {
      const entityRoot = path.join(consoleRoot, entity)
      for (const child of listChildDirectories(entityRoot)) {
        if (child === 'operations') continue

        violations.push(
          `- Console entity root may only contain seam files and operations/: ${toRepoRelative(
            repoRoot,
            path.join(entityRoot, child)
          )}`
        )
      }
    }

    for (const dir of walkDirs(consoleRoot)) {
      const rel = toRepoRelative(repoRoot, dir)
      const segment = path.basename(dir)
      const normalized = segment.toLowerCase()

      if (normalized.startsWith('runtime-')) {
        violations.push(
          `- Forbidden runtime bucket under console operation stack: ${rel}`
        )
        continue
      }

      if (FORBIDDEN_CONSOLE_ARCHITECTURE_SEGMENTS.has(normalized)) {
        violations.push(
          `- Forbidden architecture bucket under console operation stack: ${rel}`
        )
      }
    }

    for (const file of walkFiles(consoleRoot)) {
      const rel = toRepoRelative(repoRoot, file)
      const fileBase = path.basename(file, path.extname(file))

      if (
        fileBase === 'useChildEntityConsoleResolver' ||
        fileBase === 'useConsoleChildResolver' ||
        fileBase.startsWith('useRuntime') ||
        fileBase.includes('Facade')
      ) {
        violations.push(
          `- Forbidden generic console composable file under console operation stack: ${rel}`
        )
      }

      let raw = ''
      try {
        raw = readFileSync(file, 'utf8')
      } catch {
        continue
      }

      for (const pattern of FORBIDDEN_CONSOLE_COMPOSABLE_PATTERNS) {
        for (const hit of findAllMatches(raw, pattern.re)) {
          const { line } = lineInfo(raw, hit.index)
          violations.push(
            `- Forbidden generic console composable "${hit.match}" under console operation stack: ${rel}:${line}`
          )
        }
      }
    }
  }

  return violations
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()

  const violations = []
  const warnings = []

  // 1) Structural checks (directories)
  violations.push(...checkObjectFolderCasing(repoRoot))
  violations.push(...checkForbiddenFirestoreStackFolders(repoRoot))
  const firestoreStackShape = checkFirestoreEntityStackShape(repoRoot)
  violations.push(...firestoreStackShape.violations)
  warnings.push(...firestoreStackShape.warnings)
  violations.push(...checkProductsFirestoreStackShape(repoRoot))
  violations.push(...checkForbiddenEntityConsoleAppBuckets(repoRoot))
  violations.push(...checkConsoleOperationStackShape(repoRoot))
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
      '- Put console entity seams under: composables/fireux/console/<entity>/',
      '- Put console operation buckets under: composables/fireux/console/<entity>/operations/',
      '- Keep console operation buckets flexible, but do not add vague architecture buckets such as runtime-*, facade, stack, manager, processor, handler, or resolver',
    ]

    throw new Error(lines.join('\n'))
  }

  if (warnings.length) {
    console.log('[guard] ⚠️ Firestore entity stack audit findings (report-only):')
    for (const warning of warnings) console.log(warning)
  }

  console.log('[guard] ✅ canon conventions valid')
}
