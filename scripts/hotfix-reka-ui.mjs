#!/usr/bin/env node
/**
 * Hotfix reka-ui 2.5.0 missing dist/date/index.js when imported as 'reka-ui/dist/date'
 * Creates a simple re-export file that forwards to the package export './date' (dist/date.js).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

try {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const root = join(__dirname, '..')
  const globBase = join(root, 'node_modules/.pnpm')
  const { readdirSync, statSync } = await import('node:fs')

  const entries = readdirSync(globBase).filter(n => n.startsWith('reka-ui@2.5.0'))
  if (!entries.length) {
    process.exit(0)
  }
  for (const entry of entries) {
    const pkgDir = join(globBase, entry, 'node_modules/reka-ui')
    if (!existsSync(pkgDir)) continue
    const dateDir = join(pkgDir, 'dist/date')
    const indexJs = join(dateDir, 'index.js')
    if (!existsSync(dateDir)) mkdirSync(dateDir, { recursive: true })
    if (!existsSync(indexJs) || statSync(indexJs).size === 0) {
      writeFileSync(indexJs, "export * from '../date.js'\n", 'utf8')
      // also CJS, just in case
      const indexCjs = join(dateDir, 'index.cjs')
      if (!existsSync(indexCjs)) writeFileSync(indexCjs, "module.exports = require('../date.cjs')\n", 'utf8')
      console.log(`[hotfix] Patched ${indexJs}`)
    }
  }
} catch (e) {
  console.warn('[hotfix] reka-ui patch failed:', e?.message || e)
}
