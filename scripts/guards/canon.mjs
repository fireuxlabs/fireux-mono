// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
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
  'build',
  '.cache',
  '.data',
  '.firebase',
  '.nitro',
  '.nuxt',
  '.nyc_output',
  '.output',
  '.pnpm-store',
  'coverage',
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
    label: 'useRuntime*Console',
    re: /\buseRuntime[A-Z][A-Za-z0-9_]*Console\b/g,
  },
  {
    label: '*Facade*',
    re: /\b[A-Za-z0-9_]*Facade[A-Za-z0-9_]*\b/g,
  },
]

const FIRESTORE_ENTITY_STACK_ALLOWED_CHILDREN = new Set([
  'fetch',
  'mutations',
  'seo',
  'utils',
])

const CONSOLE_ENTITY_STACK_ALLOWED_CHILDREN = new Set([
  'core',
  'identity',
  'index',
  'operations',
  'overview',
  'team',
])

const FIRESTORE_ENTITY_STACK_EXCEPTION_CHILDREN = new Map([
  [
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles',
    new Set(['Agent', 'Professional']),
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles',
    new Set(['Chef', 'Customer', 'Driver']),
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
      'document',
      'property',
      'unit',
    ]),
  ],
])

const KNOWN_ENTITY_AUTHORING_RUNTIME_SLICES_BY_ENTITY = new Map([
  [
    'blog',
    new Set([
      'editor',
    ]),
  ],
])

const ALLOWED_FORBIDDEN_CONTEXT =
  /\b(avoid|do not|must not|non-canon|forbidden|mixed-bucket|cannot return)\b/i

const COLLECTION_MANAGER_PROP_RE = /\bcollection\??\s*:/g

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

function isDevOrMigrationRuntimeFile(repoRoot, file) {
  const rel = toRepoRelative(repoRoot, file)
  return (
    rel.includes('/runtime/composables/dev/') ||
    rel.includes('/runtime/components/dev/') ||
    rel.includes('/runtime/pages/dev/') ||
    rel.includes('/scripts/migrations/') ||
    rel.includes('/migrations/') ||
    /(^|\/)migrate[-_]/.test(rel)
  )
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

function checkCollectionManagerContract(repoRoot) {
  const violations = []
  const sourceRoots = [
    path.join(repoRoot, 'packages'),
    path.join(repoRoot, 'projects'),
  ].filter((p) => existsSync(p))

  for (const root of sourceRoots) {
    for (const file of walkFiles(root, new Set(['.vue']))) {
      const normalized = toRepoRelative(repoRoot, file).split(path.sep).join('/')
      if (!normalized.endsWith('/Collection/Manager.vue')) continue

      let raw = ''
      try {
        raw = readFileSync(file, 'utf8')
      } catch {
        continue
      }

      if (!COLLECTION_MANAGER_PROP_RE.test(raw)) continue
      COLLECTION_MANAGER_PROP_RE.lastIndex = 0

      violations.push(
        `- Collection manager must fetch its own public/root collection, not accept a collection prop: ${normalized}`
      )
    }
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

      const knownEntityAuthoringSlices =
        KNOWN_ENTITY_AUTHORING_RUNTIME_SLICES_BY_ENTITY.get(entity) ?? new Set()

      if (knownEntityAuthoringSlices.has(child)) {
        violations.push(
          `- Entity authoring runtime belongs under composables/fireux/${entity}, not Firestore: ${childRel}`
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
      `- Product authoring runtime belongs to the Product family, not Firestore: ${toRepoRelative(
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
        if (CONSOLE_ENTITY_STACK_ALLOWED_CHILDREN.has(child)) continue

        violations.push(
          `- Console entity root may only contain spine buckets core/, index/, overview/, identity/, team/, and operations/: ${toRepoRelative(
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
        /^useRuntime[A-Z][A-Za-z0-9_]*Console$/.test(fileBase) ||
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
  violations.push(...checkCollectionManagerContract(repoRoot))
  violations.push(...checkForbiddenKitchenBucketNames(repoRoot))

  // 2) Content checks (imports/markers)
  const scanRoots = [path.join(repoRoot, 'packages'), path.join(repoRoot, 'projects')]
    .filter((p) => existsSync(p))

  const files = scanRoots.flatMap((p) => walkFiles(p))

  const reBackCompat = /Back-compat shim/gi
  const reLegacyProductPath = /firestore\/products\/product/gi
  const reUppercaseObjectImport = /firestore\/objects\/[A-Z]/g
  const forbiddenRuntimeSmells = [
    { label: 'fallback chain', re: /fallback chain/gi },
    { label: 'legacy route', re: /legacy route/gi },
    { label: 'old-shape', re: /old[- ]shape/gi },
    { label: 'try old path', re: /try old path/gi },
    { label: 'Core brand fallback asset export', re: /CORE_BRAND_FALLBACK_ASSETS/g },
    { label: 'fallbackDescription helper', re: /fallbackDescription/g },
    { label: 'Clearbit logo provider', re: /logo\.clearbit\.com/gi },
    { label: 'Unavatar logo provider', re: /unavatar\.io/gi },
    { label: 'Google favicon provider', re: /google\.com\/s2\/favicons/gi },
    { label: 'Picsum placeholder provider', re: /picsum\.photos/gi },
  ]

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

    if (!isDevOrMigrationRuntimeFile(repoRoot, file)) {
      for (const smell of forbiddenRuntimeSmells) {
        for (const hit of findAllMatches(raw, smell.re)) {
          const { line } = lineInfo(raw, hit.index)
          violations.push(
            `- Forbidden fallback/legacy runtime smell "${smell.label}" in ${toRepoRelative(
              repoRoot,
              file
            )}:${line}`
          )
        }
      }
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
      '- Keep usual Firestore entity stacks boring: root useX.ts plus fetch/, mutations/, seo/, utils/',
      '- Put console entity seams under: composables/fireux/console/<entity>/{core,index,overview,identity}/',
      '- Put console operation buckets under: composables/fireux/console/<entity>/operations/',
      '- Keep console operation buckets flexible, but do not add vague architecture buckets such as runtime-*, facade, stack, manager, processor, handler, or resolver',
      '- Keep XCollectionManager for public/root browse only; scoped/admin/console/custom lists need named scoped surfaces or cards, not collection props',
    ]

    throw new Error(lines.join('\n'))
  }

  if (warnings.length) {
    console.log('[guard] ⚠️ Firestore entity stack audit findings (report-only):')
    for (const warning of warnings) console.log(warning)
  }

  console.log('[guard] ✅ canon conventions valid')
}
