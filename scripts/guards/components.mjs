// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
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

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    scan(rootPath, violations, repoRoot)
  }

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
      ].join('\n')
    )
  }

  console.log('[guard] ✅ component naming valid')
}

function scan(dir, violations, repoRoot) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue

    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (fullPath.endsWith(path.join('src', 'runtime', 'components', 'organisms'))) {
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
