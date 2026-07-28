// @fireux-script
// last_used: 2026-07-27
// usage_note: guard component naming, resolved imports, and prop-driven Cards authority.
// FILE: scripts/guards/components.mjs
// Component registration guard.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const COMPONENT_PATH_MARKERS = ['/src/runtime/components/', '/app/components/']
const IMPORT_EXTENSIONS = [
  '',
  '.ts',
  '.d.ts',
  '.vue',
  '.mjs',
  '.js',
  '.json',
  '.css',
  '.scss',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.md',
]
const IMPORT_INDEX_FILES = ['index.ts', 'index.vue', 'index.mjs', 'index.js']
const RELATIVE_IMPORT_RE =
  /(?:from\s+|import\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\1/g
const CARD_VARIANT_NAMES = new Set(['Cell.vue', 'Pill.vue', 'Preview.vue'])
const LEGACY_CARD_PROFILE_PATHS = new Set([
  'packages/core/fireux-core/src/runtime/components/App/Cards/Profile.vue',
  'packages/core/fireux-core/src/runtime/components/Ecosystem/Cards/Profile.vue',
  'packages/core/fireux-core/src/runtime/components/User/Cards/Profile.vue',
  'packages/extensions/fireux-blogs/src/runtime/components/Blog/Cards/Profile.vue',
  'packages/extensions/fireux-companies/src/runtime/components/Company/Cards/Profile.vue',
  'packages/extensions/fireux-jobs/src/runtime/components/Agent/Cards/Profile.vue',
  'packages/extensions/fireux-jobs/src/runtime/components/Job/Cards/Profile.vue',
  'packages/extensions/fireux-jobs/src/runtime/components/Professional/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/Chef/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Dishes/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Menus/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Mise/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Suppliers/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/Driver/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/Ingredient/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/Cards/Profile.vue',
  'packages/extensions/fireux-places/src/runtime/components/Place/Cards/Profile.vue',
  'packages/extensions/fireux-products/src/runtime/components/Product/Cards/Profile.vue',
  'packages/extensions/fireux-properties/src/runtime/components/Portfolio/Cards/Profile.vue',
  'packages/extensions/fireux-suppliers/src/runtime/components/Supplier/Cards/Profile.vue',
])
const CARD_SUPPORT_PATHS = new Set([
  'packages/extensions/fireux-blogs/src/runtime/components/Blog/Cards/Story.vue',
  'packages/extensions/fireux-places/src/runtime/components/Place/Cards/Dropdown/Fireux.vue',
  'packages/extensions/fireux-places/src/runtime/components/Place/Cards/Dropdown/Google.vue',
  'packages/extensions/fireux-places/src/runtime/components/Place/Cards/Dropdown/Selected.vue',
])
const CARD_DATA_AUTHORITY_RE =
  /\b(?:useAsyncData|useFetch|\$fetch|useFirestore|useCollection|useDocument|onSnapshot|getDoc|getDocs|use[A-Z][A-Za-z0-9]*(?:Collection|Fetch))\s*\(/
const CARD_STORAGE_IMPORT_RE =
  /from\s+["'](?:firebase\/firestore|vuefire)["']/
const CARD_ANATOMY_RE = new Map([
  ['Cell.vue', /\b(?:card--cell|fx-card--cell)\b/],
  ['Pill.vue', /class\s*=\s*["'][^"']*\bpill\b/],
  ['Preview.vue', /class\s*=\s*["'][^"']*\bpreview\b/],
])

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    scan(rootPath, violations, repoRoot)
  }

  validateMiseboxCardSpecimen(repoRoot, violations)

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ component naming drift detected:',
        ...violations
          .sort((a, b) => a.localeCompare(b))
          .map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Package-provided UI belongs under runtime/components/**.',
        '- Use Nuxt path-based component names from runtime/components/**.',
        '- Do not reintroduce organisms folders or Organisms* component names.',
        '- Keep component relative imports pointed at real files after moves.',
        '- Cards are prop/view-model-driven Cell, Pill, or Preview presentation.',
        '- Keep fetching/storage in Collection, Index, Read, Detail, or controller surfaces.',
        '- Legacy Cards/Profile paths are frozen migration debt; add no new ones.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ component naming valid')
}

function validateMiseboxCardSpecimen(repoRoot, violations) {
  const specimenPath = path.join(
    repoRoot,
    'projects/misebox/misebox-app/app/components/Misebox/PowerCards.vue'
  )
  if (!existsSync(specimenPath)) return

  const source = readFileSync(specimenPath, 'utf8')
  for (const match of source.matchAll(
    /<([A-Z][A-Za-z0-9]*Cards[A-Za-z0-9]*)\b/g
  )) {
    const componentName = match[1]
    if (/(?:CardsCell|CardsPill|CardsPreview)$/.test(componentName)) continue
    violations.push(
      `${path.relative(repoRoot, specimenPath)} (${componentName} is not a canonical dumb Card specimen)`
    )
  }
}

function scan(dir, violations, repoRoot) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue

    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (
        entry.toLowerCase() === 'organisms' &&
        isComponentTreePath(fullPath)
      ) {
        violations.push(path.relative(repoRoot, fullPath))
        continue
      }
      scan(fullPath, violations, repoRoot)
      continue
    }

    if (!/\.(ts|vue)$/.test(entry)) continue

    const source = readFileSync(fullPath, 'utf8')
    if (
      source.includes('runtime/components/organisms') ||
      source.includes('components/organisms') ||
      source.includes('/Organisms/') ||
      source.includes('/organisms/') ||
      /\bOrganisms[A-Z]/.test(source)
    ) {
      violations.push(path.relative(repoRoot, fullPath))
    }

    validateRelativeImports(fullPath, source, violations, repoRoot)
    validateCardFamily(fullPath, source, violations, repoRoot)
  }
}

function validateCardFamily(filePath, source, violations, repoRoot) {
  const normalized = filePath.split(path.sep).join('/')
  if (!normalized.includes('/Cards/')) return

  const relative = path.relative(repoRoot, filePath).split(path.sep).join('/')
  const fileName = path.basename(filePath)
  const classified =
    CARD_VARIANT_NAMES.has(fileName) ||
    LEGACY_CARD_PROFILE_PATHS.has(relative) ||
    CARD_SUPPORT_PATHS.has(relative)

  if (!classified) {
    violations.push(
      `${relative} (unclassified Cards component; use Cell/Pill/Preview or move it to its owning Profile/Detail/operational family)`
    )
  }

  const anatomyPattern = CARD_ANATOMY_RE.get(fileName)
  if (
    anatomyPattern &&
    !anatomyPattern.test(source) &&
    !source.includes('PublicProfileDirectoryCard')
  ) {
    violations.push(
      `${relative} (${fileName.replace('.vue', '')} must consume its shared Core card anatomy)`
    )
  }

  if (!/\bdefineProps\s*</.test(source) && !/\bdefineProps\s*\(/.test(source)) {
    violations.push(`${relative} (Cards components must declare prop input)`)
  }

  if (
    CARD_DATA_AUTHORITY_RE.test(source) ||
    CARD_STORAGE_IMPORT_RE.test(source)
  ) {
    violations.push(
      `${relative} (Cards components must not fetch or own storage authority)`
    )
  }
}

function validateRelativeImports(filePath, source, violations, repoRoot) {
  if (!isComponentSourceFile(filePath)) return

  RELATIVE_IMPORT_RE.lastIndex = 0
  let match

  while ((match = RELATIVE_IMPORT_RE.exec(source))) {
    const specifier = stripImportQuery(match[2])
    const target = path.resolve(path.dirname(filePath), specifier)

    if (!targetExists(target)) {
      violations.push(
        `${path.relative(repoRoot, filePath)} (missing relative import: ${match[2]})`
      )
    }
  }
}

function isComponentSourceFile(filePath) {
  return isComponentTreePath(filePath)
}

function isComponentTreePath(filePath) {
  const normalized = filePath.split(path.sep).join('/')
  return COMPONENT_PATH_MARKERS.some((marker) => normalized.includes(marker))
}

function stripImportQuery(specifier) {
  return specifier.split(/[?#]/)[0]
}

function targetExists(target) {
  if (IMPORT_EXTENSIONS.some((extension) => existsSync(target + extension))) {
    return true
  }

  return (
    existsSync(target) &&
    statSync(target).isDirectory() &&
    IMPORT_INDEX_FILES.some((fileName) => existsSync(path.join(target, fileName)))
  )
}
