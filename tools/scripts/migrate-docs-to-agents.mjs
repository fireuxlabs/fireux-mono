#!/usr/bin/env node
/**
 * Migrate all Markdown files into copilot-documentation/imported with an agent header.
 *
 * Rules:
 * - Skip: root README.md, root AGENTS.md
 * - Skip: any path inside copilot-documentation/
 * - Skip: common junk dirs: node_modules, .nuxt, dist, .output, .git
 * - For every other .md file: write to copilot-documentation/imported/<relativePath>
 *   with a YAML frontmatter header describing source and imported date, then delete the original.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const importedRoot = path.join(root, 'copilot-documentation', 'imported')

const SKIP_DIRS = new Set([
  'node_modules',
  '.nuxt',
  'dist',
  '.output',
  '.git',
  '.next',
  'coverage',
  '.cache',
])

const now = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    const rel = path.relative(root, abs)

    // Skip unwanted directories
    if (entry.isDirectory()) {
      const base = entry.name
      if (SKIP_DIRS.has(base)) continue
      // Never traverse imported docs destination to avoid double-processing
      if (rel.startsWith(path.join('copilot-documentation', 'imported')))
        continue
      // Skip copilot-documentation entirely (we don't move those)
      if (rel.startsWith('copilot-documentation')) continue
      yield* walk(abs)
    } else if (entry.isFile()) {
      yield { abs, rel }
    }
  }
}

function shouldMigrate(relPath) {
  const lower = relPath.toLowerCase()
  if (!lower.endsWith('.md')) return false
  // Skip root README.md and AGENTS.md
  if (relPath === 'README.md') return false
  if (relPath === 'AGENTS.md') return false
  return true
}

async function migrateFile(relPath, absPath) {
  const src = absPath
  const dst = path.join(importedRoot, relPath)
  const dstDir = path.dirname(dst)

  const contentBuf = await fs.readFile(src).catch(() => Buffer.from(''))
  const content = contentBuf.toString('utf8')
  const header = `---\nagent-import:\n  source: ${relPath}\n  imported: ${now}\n  note: This file was imported for AI agent context. Treat below as legacy human docs.\n---\n\n`
  const body = content.trim().length ? content : '_Original file was empty._\n'

  await ensureDir(dstDir)
  await fs.writeFile(dst, header + body, 'utf8')
  await fs.unlink(src)
  return { src: relPath, dst: path.relative(root, dst) }
}

async function main() {
  const migrated = []
  for await (const { abs, rel } of walk(root)) {
    if (!shouldMigrate(rel)) continue
    const result = await migrateFile(rel, abs)
    migrated.push(result)
    console.log(`migrated: ${result.src} -> ${result.dst}`)
  }

  // Summary
  const summary = [
    `Imported ${migrated.length} Markdown file(s) into copilot-documentation/imported`,
  ]
  console.log(summary.join('\n'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
