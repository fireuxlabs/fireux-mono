// @fireux-script
// last_used: 2026-07-17
// usage_note: explicit domain complexity check, separate from extension folder shape.
// FILE: scripts/guards/kitchen-menu-size.mjs

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const KITCHEN_MENU_FILE_LIMIT = 400

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const runtimeRoot = path.join(
    repoRoot,
    'packages',
    'extensions',
    'fireux-kitchens',
    'src',
    'runtime'
  )

  if (!existsSync(runtimeRoot)) return

  const files = collectFiles(runtimeRoot)
    .filter((file) => /[Mm]enu/.test(file))
    .filter((file) => /\.(ts|vue)$/.test(file))
    .map((file) => ({
      file,
      lines: readFileSync(file, 'utf8').split(/\r?\n/).length,
    }))
    .filter((entry) => entry.lines > KITCHEN_MENU_FILE_LIMIT)

  if (files.length) {
    throw new Error(
      [
        '[guard] ❌ Kitchen/Menu runtime file is too large:',
        `  Limit: ${KITCHEN_MENU_FILE_LIMIT} lines`,
        '',
        ...files
          .sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file))
          .map((entry) => `  - ${entry.lines} lines: ${entry.file}`),
        '',
        '[guard] Fix:',
        '- Split Kitchen/Menu runtime files into small menu, section, item, QR, and public seams.',
        '- Do not reintroduce old public menu engines or wrapper surfaces.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ Kitchen/Menu runtime file sizes valid')
}

function collectFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? collectFiles(fullPath) : [fullPath]
  })
}
