// @fireux-script
// last_used: 2026-08-04
// usage_note: run through pnpm guard; delegates to the canonical slug and route-key contract check.

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

export async function run({ repoRoot = process.cwd() } = {}) {
  const result = spawnSync(
    process.execPath,
    [path.join(repoRoot, 'scripts/check-slug-canon.mjs')],
    { cwd: repoRoot, encoding: 'utf8', shell: false }
  )
  if (result.status !== 0) {
    throw new Error(
      [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    )
  }
  console.log('[guard] ✅ slug/id routing canon valid')
}
