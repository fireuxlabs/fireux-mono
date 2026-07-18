// @fireux-script
// last_used: 2026-07-18
// usage_note: enforces the shared Nuxt UI and FireUX CSS spine.
// FILE: scripts/guards/css-system.mjs

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const STYLE_EXTENSIONS = new Set([
  '.css',
  '.less',
  '.pcss',
  '.postcss',
  '.sass',
  '.scss',
  '.styl',
  '.vue',
])
const AUTHORED_TEXT_EXTENSIONS = new Set([
  ...STYLE_EXTENSIONS,
  '.cjs',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
])

const OBSOLETE_VARIABLE_RE =
  /--(?:text-primary|text-secondary|ui-border-subtle|ui-surface)(?![A-Za-z0-9_-])/g
const DERIVED_RADIUS_DECLARATION_RE =
  /--radius-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)\s*:/g
const DERIVED_RADIUS_REFERENCE_RE =
  /var\(\s*--radius-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)\b/g
const LEGACY_ENTITY_CARD_RECIPE = [
  'flex',
  'w-full',
  'items-start',
  'gap-3',
  'rounded-lg',
  'border',
  'border-gray-200/60',
  'bg-white/70',
  'p-3',
  'shadow-sm',
  'transition',
  'hover:-translate-y-0.5',
  'hover:shadow-md',
  'dark:border-gray-800/60',
  'dark:bg-gray-900/40',
]
const LEGACY_ENTITY_CARD_RE = new RegExp(
  LEGACY_ENTITY_CARD_RECIPE.map(escapeRegex).join('\\s+'),
  'g'
)
const LEGACY_INSET_PANEL_RE = /rounded\s+border\s+border-default\s+p-3/g
const LEGACY_SEMANTIC_COLOR_PAIRS = [
  {
    pattern: /text-gray-900\s+dark:text-white/g,
    replacement: 'text-highlighted',
  },
  {
    pattern: /text-gray-600\s+dark:text-gray-300/g,
    replacement: 'text-toned',
  },
  {
    pattern: /text-gray-500\s+dark:text-gray-400/g,
    replacement: 'text-muted',
  },
]
const LEGACY_GENERIC_SURFACE_PAIRS = [
  {
    pattern: /border-gray-200\/60\s+bg-white\/70/g,
    replacement: 'border-default bg-default/70',
  },
  {
    pattern: /dark:border-gray-800\/50\s+dark:bg-gray-900\/40/g,
    replacement: 'border-default bg-default/70',
  },
  {
    pattern: /border-gray-200\/70\s+bg-white\/80/g,
    replacement: 'border-default bg-default/80',
  },
  {
    pattern: /dark:border-gray-800\/70\s+dark:bg-gray-900\/60/g,
    replacement: 'border-default bg-default/80',
  },
  {
    pattern: /dark:border-gray-800\/70\s+dark:bg-gray-900\/70/g,
    replacement: 'border-default bg-default/80',
  },
]

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = {
    obsoleteVariables: [],
    radiusDeclarations: [],
    radiusReferences: [],
    legacyEntityCards: [],
    legacyInsetPanels: [],
    legacySemanticColors: [],
    legacyGenericSurfaces: [],
  }

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    scan(rootPath, repoRoot, violations)
  }

  if (hasViolations(violations)) {
    throw new Error(formatViolations(violations))
  }

  console.log('[guard] ✅ CSS system spine valid')
}

function scan(dir, repoRoot, violations) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        scan(path.join(dir, entry.name), repoRoot, violations)
      }
      continue
    }

    if (!entry.isFile()) continue

    const filePath = path.join(dir, entry.name)
    const extension = path.extname(entry.name).toLowerCase()
    if (!AUTHORED_TEXT_EXTENSIONS.has(extension)) continue

    const source = readFileSync(filePath, 'utf8')
    const relativePath = path.relative(repoRoot, filePath)

    collectMatches({
      source,
      pattern: OBSOLETE_VARIABLE_RE,
      target: violations.obsoleteVariables,
      relativePath,
      label: (match) => match[0],
    })

    collectMatches({
      source,
      pattern: DERIVED_RADIUS_REFERENCE_RE,
      target: violations.radiusReferences,
      relativePath,
      label: (match) => match[0],
    })

    if (STYLE_EXTENSIONS.has(extension)) {
      collectMatches({
        source,
        pattern: DERIVED_RADIUS_DECLARATION_RE,
        target: violations.radiusDeclarations,
        relativePath,
        label: (match) => match[0].replace(/\s*:$/, ''),
      })
    }

    collectMatches({
      source,
      pattern: LEGACY_ENTITY_CARD_RE,
      target: violations.legacyEntityCards,
      relativePath,
      label: () => 'legacy inline entity-card recipe',
    })

    collectMatches({
      source,
      pattern: LEGACY_INSET_PANEL_RE,
      target: violations.legacyInsetPanels,
      relativePath,
      label: () => 'legacy inline inset-panel recipe',
    })

    for (const colorPair of LEGACY_SEMANTIC_COLOR_PAIRS) {
      collectMatches({
        source,
        pattern: colorPair.pattern,
        target: violations.legacySemanticColors,
        relativePath,
        label: (match) => `${match[0].replace(/\s+/g, ' ')} -> ${colorPair.replacement}`,
      })
    }

    for (const surfacePair of LEGACY_GENERIC_SURFACE_PAIRS) {
      collectMatches({
        source,
        pattern: surfacePair.pattern,
        target: violations.legacyGenericSurfaces,
        relativePath,
        label: (match) => `${match[0].replace(/\s+/g, ' ')} -> ${surfacePair.replacement}`,
      })
    }
  }
}

function collectMatches({ source, pattern, target, relativePath, label }) {
  pattern.lastIndex = 0
  let match

  while ((match = pattern.exec(source))) {
    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: label(match),
    })
  }
}

function hasViolations(violations) {
  return Object.values(violations).some((entries) => entries.length > 0)
}

function formatViolations(violations) {
  const lines = ['[guard] ❌ CSS system spine drift detected:']

  appendGroup(
    lines,
    'Obsolete CSS variable references:',
    violations.obsoleteVariables
  )
  appendGroup(
    lines,
    'Nuxt UI-derived radius variables redeclared:',
    violations.radiusDeclarations
  )
  appendGroup(
    lines,
    'Non-runtime radius variables referenced:',
    violations.radiusReferences
  )
  appendGroup(
    lines,
    'Legacy entity-card recipe repeated inline:',
    violations.legacyEntityCards
  )
  appendGroup(
    lines,
    'Legacy inset-panel recipe repeated inline:',
    violations.legacyInsetPanels
  )
  appendGroup(
    lines,
    'Legacy hard-coded semantic text color pairs:',
    violations.legacySemanticColors
  )
  appendGroup(
    lines,
    'Legacy generic surface color pairs:',
    violations.legacyGenericSurfaces
  )

  lines.push(
    '',
    '[guard] Fix:',
    '- Use current Nuxt UI semantic variables (`--ui-text*`, `--ui-border*`, `--ui-bg*`).',
    '- Set `--ui-radius` as the radius authority; use `rounded-*` utilities in templates and calculate from `--ui-radius` in authored CSS.',
    '- Compose the shared `.fx-card--cell` recipe instead of repeating the audited class string.',
    '- Use `.fx-inset-panel` for the audited nested bordered-panel recipe.',
    '- Replace the guarded gray/dark text pairs with `text-highlighted`, `text-toned`, or `text-muted`.',
    '- Replace the guarded generic surface pairs with `border-default` and `bg-default/*`.',
    '- One-off Tailwind for local layout or pixel-perfect deltas remains allowed.'
  )

  return lines.join('\n')
}

function appendGroup(lines, heading, entries) {
  if (!entries.length) return

  lines.push('', heading)
  for (const entry of entries.sort(compareEntries)) {
    lines.push(`  - ${entry.path}:${entry.line} (${entry.label})`)
  }
}

function compareEntries(a, b) {
  return (
    a.path.localeCompare(b.path) ||
    a.line - b.line ||
    a.label.localeCompare(b.label)
  )
}

function lineNumberAt(source, index) {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source.charCodeAt(cursor) === 10) line += 1
  }
  return line
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
