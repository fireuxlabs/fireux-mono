#!/usr/bin/env node
/**
 * scan-deprecated-files.mjs
 *
 * Scans the repo for files containing a deprecation marker comment and reports them.
 *
 * Marker format (any language):
 *   // todoComment: deprecated
 *   // remove-by: YYYY-MM-DD
 *   // reason: <why>
 *   // replacement: <path-or-instructions>
 *
 * Options:
 *   --delete         Remove files whose remove-by is in the past
 *   --dry            Print what would be deleted without deleting (implied when not --delete)
 *   --json           Output machine-readable JSON report
 */
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { globSync } from 'glob'

const require = createRequire(import.meta.url)

const CWD = process.cwd()
const DELETE = process.argv.includes('--delete')
const JSON_OUT = process.argv.includes('--json')
const DRY = !DELETE || process.argv.includes('--dry')

const MARKER = /^\s*\/\/\s*todoComment:\s*deprecated\b/

function parseMeta(lines) {
  const meta = {}
  for (const line of lines) {
    const t = line.trim()
    if (t.includes('todoComment: deprecated')) meta.deprecated = true
    const m1 = t.match(/remove-by:\s*(\d{4}-\d{2}-\d{2})/)
    if (m1) meta.removeBy = m1[1]
    const m2 = t.match(/reason:\s*(.*)$/)
    if (m2) meta.reason = m2[1]
    const m3 = t.match(/replacement:\s*(.*)$/)
    if (m3) meta.replacement = m3[1]
  }
  return meta
}

function isPast(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T00:00:00Z')
  const today = new Date()
  // Compare by date only
  return (
    d.getTime() <
    new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  )
}

async function scan() {
  const patterns = [
    '**/*.*',
    '!**/node_modules/**',
    '!**/.nuxt/**',
    '!**/dist/**',
    '!**/.git/**',
    '!tools/scripts/scan-deprecated-files.mjs',
    '!copilot-documentation/**',
  ]
  const files = globSync(patterns, { cwd: CWD, dot: true, nodir: true })
  const results = []
  for (const f of files) {
    const full = join(CWD, f)
    try {
      const content = await fs.readFile(full, 'utf8')
      if (!MARKER.test(content)) continue
      const firstBlock = content.split('\n').slice(0, 100) // inspect top portion primarily
      const meta = parseMeta(firstBlock)
      if (!meta.deprecated) continue
      results.push({ file: f, ...meta, pastDue: isPast(meta.removeBy) })
    } catch {}
  }
  return results
}

function printResults(results) {
  console.log(`Found ${results.length} deprecated file(s).`)
  for (const r of results) {
    const status = r.pastDue ? 'PAST-DUE' : 'pending'
    console.log(`- ${r.file} [${status}] remove-by: ${r.removeBy || 'n/a'}`)
    if (r.reason) console.log(`  reason: ${r.reason}`)
    if (r.replacement) console.log(`  replacement: ${r.replacement}`)
  }
}

async function deletePastDue(results) {
  const pastDue = results.filter((r) => r.pastDue)
  if (pastDue.length === 0) return
  console.log(
    `\nDeleting ${pastDue.length} past-due deprecated file(s)...${
      DRY ? ' (dry-run)' : ''
    }`
  )
  for (const r of pastDue) {
    const path = join(CWD, r.file)
    if (DRY) {
      console.log(`[dry] rm ${r.file}`)
    } else {
      await fs.unlink(path).catch(() => {})
      console.log(`removed ${r.file}`)
    }
  }
}

async function main() {
  const results = await scan()
  if (JSON_OUT) {
    process.stdout.write(
      JSON.stringify({ count: results.length, items: results }, null, 2) + '\n'
    )
  } else {
    printResults(results)
  }

  if (DELETE) await deletePastDue(results)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
