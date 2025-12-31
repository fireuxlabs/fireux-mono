#!/usr/bin/env node
// FILE: scripts/generate-cta-innards.mjs
//
// Generates: temp/temp-cta.md
// Repo-truth snapshot (runtime only): CTA innards (raw file contents).

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

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

function isDirectory(p) {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

function walkFiles(rootDir, predicate) {
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
      if (predicate(fullPath)) out.push(fullPath)
    }
  }

  return out
}

function toRepoRelative(absPath) {
  return path.relative(repoRoot, absPath).replaceAll(path.sep, '/')
}

function readText(absPath) {
  try {
    return readFileSync(absPath, 'utf8')
  } catch {
    return ''
  }
}

function parseSectionAndEntity(absFile) {
  const rel = toRepoRelative(absFile)
  const parts = rel.split('/')

  let section = 'Other'
  if (parts[0] === 'packages' && parts.length >= 3) {
    if (parts[1] === 'core') section = 'Core'
    else if (parts[1] === 'ecosystem') section = 'Ecosystem'
    else if (parts[1] === 'extensions') section = 'Extensions'
    else section = 'Packages'
  }

  const orgIdx = parts.lastIndexOf('organisms')
  let entity = path.basename(absFile, '.vue')

  if (orgIdx !== -1) {
    const after = parts.slice(orgIdx + 1)

    if (after[0] === 'profiles' && after[1]) entity = after[1]
    else if (after[0] === 'objects' && after[1]) entity = after[1]
    else if (after[0]) entity = after[0]
  }

  return { section, entity }
}

function sortKeyFor(absFile) {
  const rel = toRepoRelative(absFile)
  const { section, entity } = parseSectionAndEntity(absFile)

  const sectionOrder = new Map([
    ['Core', 0],
    ['Ecosystem', 1],
    ['Extensions', 2],
    ['Packages', 3],
    ['Other', 4],
  ])

  const entityOrder = new Map([
    // Core
    ['App', 0],
    ['User', 1],

    // Ecosystem
    ['Chef', 10],
    ['Supplier', 11],

    // Extensions
    ['Blog', 20],
    ['Job', 21],
    ['Agent', 22],
    ['Professional', 23],
    ['Product', 24],
  ])

  const s = sectionOrder.get(section) ?? 999
  const e = entityOrder.get(entity) ?? 999

  return `${String(s).padStart(3, '0')}:${String(e).padStart(3, '0')}:${rel}`
}

function findCtaVueFiles() {
  const packagesRoot = path.join(repoRoot, 'packages')
  if (!isDirectory(packagesRoot)) return []

  const abs = walkFiles(packagesRoot, (p) => {
    const rel = toRepoRelative(p)
    if (!rel.includes('/src/runtime/components/organisms/')) return false
    if (!rel.endsWith('/CTA.vue')) return false
    return true
  })

  abs.sort((a, b) => sortKeyFor(a).localeCompare(sortKeyFor(b)))
  return abs
}

function buildMarkdown({ ctaFiles }) {

  const lines = []
  lines.push('# CTA Innards (Runtime)')
  lines.push('')
  lines.push('Repo-truth snapshot (runtime only). Auto-generated.')
  lines.push('')
  lines.push(`- Included \`CTA.vue\` files: ${ctaFiles.length}`)
  lines.push('')
  lines.push('---')

  for (const absFile of ctaFiles) {
    const rel = toRepoRelative(absFile)
    const { section, entity } = parseSectionAndEntity(absFile)

    lines.push('')
    lines.push(`## ${section} — ${entity} CTA`)
    lines.push('')
    lines.push(`Path: \`${rel}\``)
    lines.push('')
    lines.push('```vue')
    lines.push(readText(absFile).trimEnd())
    lines.push('```')
  }

  return lines.join('\n')
}

function main() {
  const outDir = path.join(repoRoot, 'temp')
  const outFile = path.join(outDir, 'temp-cta.md')

  const ctaFiles = findCtaVueFiles()
  const md = buildMarkdown({ ctaFiles })

  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, md, 'utf8')

  console.log(`[gen:cta-innards] Wrote ${toRepoRelative(outFile)} (${ctaFiles.length} CTA.vue files)`)
}

main()
