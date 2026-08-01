// @fireux-script
// last_used: 2026-08-01
// usage_note: permanent product source complexity boundary; operational scripts have separate lifecycle guards.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const PERMANENT_SOURCE_FILE_LIMIT = 400
const PERMANENT_SOURCE_ROOTS = ['packages', 'projects', 'tools']
const AUTHORED_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.mjs',
  '.rules',
  '.scss',
  '.sh',
  '.ts',
  '.tsx',
  '.vue',
])
const IGNORED_DIRECTORIES = new Set([
  '.firebase',
  '.nuxt',
  '.output',
  'coverage',
  'dist',
  'node_modules',
])

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const oversized = PERMANENT_SOURCE_ROOTS.flatMap((root) => {
    const absolute = path.join(repoRoot, root)
    return existsSync(absolute) ? collectAuthoredFiles(absolute) : []
  })
    .map((file) => ({
      file,
      lines: countLines(readFileSync(file, 'utf8')),
    }))
    .filter((entry) => entry.lines > PERMANENT_SOURCE_FILE_LIMIT)
    .sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file))

  if (oversized.length) {
    throw new Error(
      [
        '[guard] ❌ permanent product source file is too large:',
        `  Limit: ${PERMANENT_SOURCE_FILE_LIMIT} lines`,
        `  Violations: ${oversized.length}`,
        '',
        ...oversized.map(
          (entry) =>
            `  - ${entry.lines} lines: ${path.relative(repoRoot, entry.file)}`
        ),
        '',
        '[guard] Fix:',
        '- Split distinct responsibilities into named family-owned modules, components, data, or style seams.',
        '- Extract reusable behavior instead of moving lines into an unowned dump file.',
        '- No scope switch, allowlist, oversized-file exception, or guard bypass exists.',
      ].join('\n')
    )
  }

  console.log(
    '[guard] ✅ permanent product source files are within the 400-line limit'
  )
}

function countLines(source) {
  if (!source) return 0
  const trailingLineBreak = /(?:\r\n|\r|\n)$/.test(source) ? 1 : 0
  return source.split(/\r\n|\r|\n/).length - trailingLineBreak
}

function collectAuthoredFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) return []
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectAuthoredFiles(absolute)
    if (!entry.isFile() || !AUTHORED_EXTENSIONS.has(path.extname(entry.name))) {
      return []
    }
    return [absolute]
  })
}
