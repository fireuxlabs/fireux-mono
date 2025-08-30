#!/usr/bin/env node
/**
 * List layout keys and files across packages.
 * Looks for src/config/layouts-config.ts addLayout calls and runtime/layouts/*.vue files.
 */
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// No external deps: simple recursive scanner

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '../../')

function unique(arr) { return [...new Set(arr)] }

async function read(file) {
  try { return await fs.readFile(file, 'utf8') } catch { return '' }
}

function extractAddLayoutKeys(src) {
  const keys = []
  const re = /addLayout\s*\(\s*['"`]([^'"`]+)['"`]/g
  let m
  while ((m = re.exec(src))) keys.push(m[1])
  return keys
}

function shouldIgnore(rel) {
  return rel.includes('/node_modules/') || rel.includes('/.nuxt/') || rel.includes('/dist/')
}

async function scan(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    const rel = abs.replace(repoRoot + '/', '')
    if (shouldIgnore(rel)) continue
    if (e.isDirectory()) await scan(abs, acc)
    else acc.push(rel)
  }
  return acc
}

async function main() {
  const files = await scan(repoRoot)
  const configFiles = files.filter(f => f.endsWith('/src/config/layouts-config.ts'))
  const layoutVueFiles = files.filter(f => f.includes('/src/runtime/layouts/') && f.endsWith('.vue'))

  const byPackage = {}

  for (const rel of configFiles) {
    const pkgDir = rel.split('/src/')[0]
    const abs = path.join(repoRoot, rel)
    const content = await read(abs)
    const keys = extractAddLayoutKeys(content)
    byPackage[pkgDir] = byPackage[pkgDir] || { keys: [], files: [] }
    byPackage[pkgDir].keys.push(...keys)
  }

  for (const rel of layoutVueFiles) {
    const pkgDir = rel.split('/src/')[0]
    byPackage[pkgDir] = byPackage[pkgDir] || { keys: [], files: [] }
    byPackage[pkgDir].files.push(rel)
  }

  const lines = []
  lines.push('# Layout Keys Snapshot')
  lines.push('')
  for (const pkg of Object.keys(byPackage).sort()) {
    const { keys, files } = byPackage[pkg]
    lines.push(`- ${pkg}`)
    const k = unique(keys).sort()
    if (k.length) lines.push(`  - keys: ${k.join(', ')}`)
    const f = unique(files).sort()
    if (f.length) {
      lines.push('  - files:')
      for (const file of f) lines.push(`    - ${file}`)
    }
  }

  const out = path.join(repoRoot, 'archive/reports/layout-keys-snapshot.md')
  await fs.mkdir(path.dirname(out), { recursive: true })
  await fs.writeFile(out, lines.join('\n'), 'utf8')
  console.log(`Wrote ${out}`)
}

main().catch(err => { console.error(err); process.exit(1) })
