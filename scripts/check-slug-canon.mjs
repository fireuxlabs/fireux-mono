#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const reportOnly = process.argv.includes('--report')

const SEARCH_ROOTS = ['packages', 'projects', 'docs', 'scripts']
const SELF_PATH = 'scripts/check-slug-canon.mjs'
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
const SKIP_REL_PREFIXES = [
  'docs/ai',
]
const EXTENSIONS = new Set([
  '.js',
  '.mjs',
  '.ts',
  '.tsx',
  '.vue',
  '.md',
])

const rules = [
  {
    id: 'slug-field-query',
    message: 'Public slug reads should use document id, not slug field queries.',
    patterns: [
      /where\s*\(\s*['"`]slug['"`]/,
      /queryOneByField\s*\([^)]*['"`]slug['"`]/,
      /firestoreQueryOneByField\s*\([^)]*['"`]slug['"`]/,
    ],
  },
  {
    id: 'slug-id-fallback',
    message: 'Public route identity must not silently fall back between slug and id.',
    patterns: [
      /\bslug\s*\|\|\s*id\b/,
      /\bid\s*\|\|\s*slug\b/,
      /\b[\w.]+\.slug\s*\|\|\s*[\w.]+\.id\b/,
      /\b[\w.]+\.id\s*\|\|\s*[\w.]+\.slug\b/,
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
    message: 'Slug claim/index systems are not canonical for FireUX slug-id routing.',
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

const allowText = [
  'compatibility',
  'compatibility-only',
  'migration',
  'migrate',
  'temporary',
  'temp',
  'non-canonical',
  'not canonical',
  'must not',
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
      const stats = statSync(fullPath)
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

function hasAllowText(line) {
  const normalized = line.toLowerCase()
  return allowText.some((token) => normalized.includes(token))
}

function isAllowedContext(rel, lines, index) {
  if (rel === SELF_PATH) return true

  const context = lines
    .slice(Math.max(0, index - 3), Math.min(lines.length, index + 4))
    .join('\n')
    .toLowerCase()

  return hasAllowText(context)
}

const files = SEARCH_ROOTS.flatMap((entry) => collectFiles(path.join(root, entry)))
const findings = []
const allowedFindings = []

for (const file of files) {
  const rel = path.relative(root, file)
  if (rel === SELF_PATH) continue
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((line, index) => {
    for (const rule of rules) {
      if (!rule.patterns.some((pattern) => pattern.test(line))) continue
      const finding = {
        rule: rule.id,
        message: rule.message,
        file: rel,
        line: index + 1,
        text: line.trim(),
      }
      if (
        isAllowedContext(rel, lines, index) ||
        rel.includes('/migrations/') ||
        rel.includes('scripts/migrate')
      ) {
        allowedFindings.push(finding)
      } else {
        findings.push(finding)
      }
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

if (allowedFindings.length) {
  if (findings.length) console.log('')
  console.log(
    `Slug canon check noted ${allowedFindings.length} compatibility/migration finding(s).`
  )
  if (reportOnly) {
    console.log('')
    allowedFindings.forEach((finding, index) => {
      if (index > 0) console.log('')
      printFinding(finding)
    })
  }
}

if (!findings.length) {
  console.log('Slug canon check passed.')
}

if (findings.length && !reportOnly) {
  process.exitCode = 1
}
