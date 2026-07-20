// @fireux-script
// last_used: 2026-07-20
// usage_note: guard entrypoint; checks the Git index, not disposable local output.
// Concurrent edit — 2026-07-20 11:51 CEST — Root Efficiency Pass 2 of 4: verify local-only root lanes remain untracked.
// FILE: scripts/guards/generated-artifacts.mjs

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { isGeneratedArtifactPath } from './_lib/filesystem-policy.mjs'

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const result = spawnSync('git', ['ls-files', '-z'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    throw new Error(
      `[guard] ❌ Unable to inspect tracked files:\n${String(result.stderr || result.stdout).trim()}`
    )
  }

  const trackedGenerated = result.stdout
    .split('\0')
    .filter(Boolean)
    .map((file) => file.split(path.sep).join('/'))
    .filter(isGeneratedArtifactPath)
    .sort((a, b) => a.localeCompare(b))

  if (trackedGenerated.length) {
    throw new Error(
      [
        '[guard] ❌ Generated artifacts are tracked by Git:',
        ...trackedGenerated.map((file) => `  - ${file}`),
        '',
        '[guard] Fix:',
        '- Remove each artifact from the Git index while keeping authored source intact.',
        '- Add or repair the matching ignore rule.',
        '- Re-run pnpm guard.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ generated artifacts are untracked')
}
