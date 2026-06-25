#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()
const includeAll = process.argv.includes('--all')
const scanRoots = ['packages', 'projects']
const ignoredDirs = new Set([
  '.git',
  '.nuxt',
  '.output',
  '.data',
  'dist',
  'node_modules',
  'public',
])

const suffixes = [
  'ProfileView',
  'Collection',
  'Interface',
  'Selection',
  'Validation',
  'Formatting',
  'Computed',
  'Console',
  'Ensure',
  'Create',
  'Update',
  'Delete',
  'BySlug',
  'Prices',
  'Record',
  'Fetch',
  'State',
  'Read',
  'List',
]

const coreSeams = ['Fetch', 'Collection', 'Interface']
const writeSeams = ['Create', 'Update', 'Delete', 'Ensure']
const adapterSeams = ['Console', 'Selection', 'ProfileView', 'Computed']
const localDeltaSeams = ['Record', 'List', 'Read', 'BySlug', 'Prices', 'State', 'Validation', 'Formatting']

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, acc)
      continue
    }

    if (!entry.isFile()) continue
    if (!entry.name.startsWith('use') || !entry.name.endsWith('.ts')) continue
    if (!fullPath.includes(`${path.sep}composables${path.sep}`)) continue

    acc.push(fullPath)
  }

  return acc
}

function parseUseFile(filePath) {
  const basename = path.basename(filePath, '.ts')
  const match = basename.match(/^use([A-Z].*)$/)
  if (!match) return null

  const body = match[1]
  for (const suffix of suffixes) {
    if (body.endsWith(suffix) && body.length > suffix.length) {
      return {
        entity: body.slice(0, -suffix.length),
        suffix,
        basename,
        path: path.relative(repoRoot, filePath),
      }
    }
  }

  return {
    entity: body,
    suffix: 'Facade',
    basename,
    path: path.relative(repoRoot, filePath),
  }
}

function addToMap(map, parsed) {
  if (!map.has(parsed.entity)) {
    map.set(parsed.entity, new Map())
  }

  const bySuffix = map.get(parsed.entity)
  if (!bySuffix.has(parsed.suffix)) {
    bySuffix.set(parsed.suffix, [])
  }

  bySuffix.get(parsed.suffix).push(parsed.path)
}

function hasAny(bySuffix, seams) {
  return seams.some((seam) => bySuffix.has(seam))
}

function seamLabel(bySuffix, seams) {
  return seams.filter((seam) => bySuffix.has(seam)).join(', ') || '-'
}

function pad(value, width) {
  const text = String(value)
  if (text.length >= width) return text
  return `${text}${' '.repeat(width - text.length)}`
}

function classifyNotes(entity, bySuffix) {
  const notes = []

  if (bySuffix.has('Facade')) notes.push('facade')
  if (hasAny(bySuffix, adapterSeams)) notes.push('adapter')
  if (hasAny(bySuffix, localDeltaSeams)) notes.push('local-delta')

  if (hasAny(bySuffix, ['Fetch', 'Collection']) && !bySuffix.has('Interface')) {
    notes.push('missing-interface')
  }

  if (bySuffix.has('Fetch') && !bySuffix.has('Collection')) {
    notes.push('single-only')
  }

  if (bySuffix.has('Collection') && !bySuffix.has('Fetch')) {
    notes.push('collection-only')
  }

  if (
    /s$/.test(entity) &&
    hasAny(bySuffix, ['Fetch', 'Collection', 'Interface']) &&
    !['Orders'].includes(entity)
  ) {
    notes.push('plural-like-name')
  }

  return notes
}

const files = scanRoots.flatMap((root) => walk(path.join(repoRoot, root)))
const parsedFiles = files.map(parseUseFile).filter(Boolean)
const entities = new Map()

for (const parsed of parsedFiles) {
  addToMap(entities, parsed)
}

const rows = [...entities.entries()]
  .filter(([, bySuffix]) =>
    includeAll
      ? hasAny(bySuffix, [...coreSeams, ...writeSeams, ...adapterSeams, ...localDeltaSeams, 'Facade'])
      : hasAny(bySuffix, [...coreSeams, ...writeSeams, ...adapterSeams])
  )
  .map(([entity, bySuffix]) => ({
    entity,
    core: seamLabel(bySuffix, coreSeams),
    writes: seamLabel(bySuffix, writeSeams),
    adapters: seamLabel(bySuffix, adapterSeams),
    deltas: seamLabel(bySuffix, localDeltaSeams),
    notes: classifyNotes(entity, bySuffix).join(', ') || '-',
    files: [...bySuffix.values()].flat().sort(),
  }))
  .sort((a, b) => a.entity.localeCompare(b.entity))

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ files: parsedFiles.length, entities: rows }, null, 2))
  process.exit(0)
}

console.log(`[usex] scanned ${parsedFiles.length} use*.ts composables`)
console.log(`[usex] found ${rows.length} entity-ish groups`)
if (!includeAll) {
  console.log('[usex] default view hides facade-only and local-delta-only helpers; pass --all for full inventory')
}
console.log('')
console.log(
  [
    pad('Entity', 30),
    pad('Core', 30),
    pad('Writes', 30),
    pad('Adapters', 34),
    'Notes',
  ].join('  ')
)
console.log('-'.repeat(132))

for (const row of rows) {
  console.log(
    [
      pad(row.entity, 30),
      pad(row.core, 30),
      pad(row.writes, 30),
      pad(row.adapters, 34),
      row.notes,
    ].join('  ')
  )
}

const notable = rows.filter((row) =>
  row.notes
    .split(', ')
    .some((note) =>
      ['missing-interface', 'plural-like-name', 'local-delta'].includes(note)
    )
)

if (notable.length) {
  console.log('')
  console.log('[usex] report-only alignment notes')
  for (const row of notable) {
    console.log(`- ${row.entity}: ${row.notes}`)
  }
}

console.log('')
console.log('[usex] Canon: Fetch reads one; Collection reads many; Interface shapes UI; Create/Update/Delete write; Ensure bootstraps; Console selects and operates.')
