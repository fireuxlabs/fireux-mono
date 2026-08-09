#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: blocking source guard for canonical slug/id routing.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const SEARCH_ROOTS = ['packages', 'projects']
const SELF_PATH = 'scripts/check-slug-canon.mjs'
const CANONICAL_SLUG_QUERY_FILES = new Set([
  'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/route-identity.ts',
])
const SKIP_DIRS = new Set([
  '.git',
  '.nuxt',
  '.output',
  '.data',
  'node_modules',
  'dist',
  'build',
  'coverage',
])
const SKIP_REL_PREFIXES = []
const EXTENSIONS = new Set(['.js', '.mjs', '.ts', '.tsx', '.vue', '.md'])

const rules = [
  {
    id: 'slug-field-query',
    message:
      'Public slug reads should use document id, not slug field queries.',
    patterns: [
      /where\s*\(\s*['"`]slug['"`]/,
      /queryOneByField\s*\([^)]*['"`]slug['"`]/,
      /firestoreQueryOneByField\s*\([^)]*['"`]slug['"`]/,
    ],
  },
  {
    id: 'slug-id-fallback',
    message:
      'Public route identity must not silently fall back between slug and id.',
    patterns: [
      /\bconst\s+slug\s*=\s*[\w.]+\.slug\s*\|\|\s*[\w.]+\.id\b/,
      /\breturn\s+slug\s*\|\|\s*id\b/,
      /\bto:\s*slug\s*\|\|\s*id\b/,
      /encodeURIComponent\(slug\s*\|\|\s*id\)/,
      /\/products\/\$\{[\w.]+\.slug\s*\|\|\s*[\w.]+\.id\}/,
      /updates\??\.slug\s*\|\|\s*\w+/,
    ],
  },
  {
    id: 'local-slug-helper',
    message: 'Use shared slug utilities instead of local slug helpers.',
    patterns: [
      /function\s+(toSlug|slugify|formatSlug|generateSlug)\s*\(/,
      /const\s+(toSlug|slugify|formatSlug|generateSlug)\s*=/,
      /isValidSlug\s*\(/,
    ],
  },
  {
    id: 'slug-claim-index',
    message:
      'Slug claim/index systems are not canonical for FireUX slug-id routing.',
    patterns: [
      /slug_claims/,
      /slug_to_id/i,
      /slug[-_ ]to[-_ ]id[-_ ](index|lookup|map|mapping)/i,
      /slug[-_ ]index/i,
      /slug-alias/,
      /alias-slug/,
    ],
  },
]

function shouldSkipDir(dirPath) {
  const name = path.basename(dirPath)
  if (SKIP_DIRS.has(name)) return true

  const rel = path.relative(root, dirPath).split(path.sep).join('/')
  return SKIP_REL_PREFIXES.some(
    (prefix) => rel === prefix || rel.startsWith(`${prefix}/`)
  )
}

function shouldReadFile(filePath) {
  return EXTENSIONS.has(path.extname(filePath))
}

function collectFiles(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry)
    let stats
    try {
      stats = statSync(fullPath)
    } catch {
      continue
    }
    if (stats.isDirectory()) {
      if (shouldSkipDir(fullPath)) continue
      collectFiles(fullPath, out)
      continue
    }
    if (stats.isFile() && shouldReadFile(fullPath)) {
      out.push(fullPath)
    }
  }
  return out
}

const files = SEARCH_ROOTS.flatMap((entry) =>
  collectFiles(path.join(root, entry))
)
const findings = []

for (const file of files) {
  const rel = path.relative(root, file)
  if (rel === SELF_PATH) continue
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((line, index) => {
    for (const rule of rules) {
      if (!rule.patterns.some((pattern) => pattern.test(line))) continue
      if (
        rule.id === 'slug-field-query' &&
        CANONICAL_SLUG_QUERY_FILES.has(rel)
      ) continue
      const finding = {
        rule: rule.id,
        message: rule.message,
        file: rel,
        line: index + 1,
        text: line.trim(),
      }
      findings.push(finding)
    }
  })
}

function printFinding(finding) {
  console.log(`${finding.file}:${finding.line} [${finding.rule}]`)
  console.log(`  ${finding.message}`)
  console.log(`  ${finding.text}`)
}

if (findings.length) {
  console.log(`Slug canon check found ${findings.length} finding(s).\n`)
  findings.forEach((finding, index) => {
    if (index > 0) console.log('')
    printFinding(finding)
  })
}

if (!findings.length) {
  console.log('Slug canon check passed.')
}

if (findings.length) {
  process.exitCode = 1
}
