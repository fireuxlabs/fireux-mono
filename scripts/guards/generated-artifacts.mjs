// @fireux-script
// last_used: 2026-07-10
// usage_note: guard entrypoint; checks the Git index, not disposable local output.
// FILE: scripts/guards/generated-artifacts.mjs

import { spawnSync } from 'node:child_process'
import path from 'node:path'

const GENERATED_DIR_SEGMENTS = new Set([
  '.cache',
  '.data',
  '.firebase',
  '.nitro',
  '.nuxt',
  '.nyc_output',
  '.output',
  '.pnpm-store',
  'build',
  'coverage',
  'dist',
  'node_modules',
])

const GENERATED_FILE_NAMES = new Set([
  '.DS_Store',
  'firebase-debug.log',
])

function isGeneratedArtifact(file) {
  const segments = file.split('/')
  const fileName = segments.at(-1) ?? ''

  return (
    segments.some((segment) => GENERATED_DIR_SEGMENTS.has(segment)) ||
    GENERATED_FILE_NAMES.has(fileName) ||
    fileName.endsWith('.tsbuildinfo')
  )
}

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
    .filter(isGeneratedArtifact)
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
