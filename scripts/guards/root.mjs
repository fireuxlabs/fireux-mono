// @fireux-script
// last_used: 2026-07-20
// usage_note: enforces the portable root and sole pnpm workspace authority.
// Concurrent edit — 2026-07-20 11:50 CEST — Root Efficiency Passes 2 and 4 of 4: lock portable root and demo ownership.
// FILE: scripts/guards/root.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import {
  GENERATED_DIRECTORY_NAMES,
  LOCAL_ONLY_ROOT_PATHS,
} from './_lib/filesystem-policy.mjs'

const ALLOWED_ROOT_DIRS = new Set([
  // VCS / tooling
  '.git',
  '.github',
  '.vscode',

  // Documentation
  'docs',

  // Core repo structure
  'packages',
  'projects',
  'scripts', // guard / clean / gitsave live here
  'templates',
  'tools',
  'types',

  // Mirror (tracked README + list file; symlink outputs are gitignored)
  'mirror',

  // Local-only (ignored, but tolerated)
  ...GENERATED_DIRECTORY_NAMES,
  ...LOCAL_ONLY_ROOT_PATHS,
])

const ALLOWED_ROOT_FILES = new Set([
  // Governance
  'AGENTS.md',
  'README.md',

  // Build / deploy policy
  'fireux-deploy-ignore',

  // Package management
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',

  // TypeScript config
  'tsconfig.base.json',
  'tsconfig.json',
  'tsconfig.tsbuildinfo',

  // Linting
  'eslint.config.js',
])

const ALLOWED_ROOT_DOTFILES = new Set([
  '.copilotignore',
  '.editorconfig',
  '.gitignore',
  '.node-version',
  '.npmrc',
  '.nvmrc',
  '.prettierignore',
  '.prettierrc',
])

function isDirentDirectory(repoRoot, dirent) {
  if (dirent.isDirectory()) return true

  // Symlinks: resolve via statSync, so symlink-to-dir counts as a dir
  if (dirent.isSymbolicLink()) {
    try {
      return statSync(path.join(repoRoot, dirent.name)).isDirectory()
    } catch {
      return false
    }
  }

  return false
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const entries = readdirSync(repoRoot, { withFileTypes: true })

  const unexpected = []

  for (const e of entries) {
    const name = e.name
    if (name === '.DS_Store') continue
    const isAllowedDirectory =
      isDirentDirectory(repoRoot, e) ||
      (name === 'figma-export' && e.isSymbolicLink())

    // dotfiles (FILES only)
    if (!isAllowedDirectory && ALLOWED_ROOT_DOTFILES.has(name)) continue

    // directories (including the optional local Figma symlink)
    if (isAllowedDirectory && ALLOWED_ROOT_DIRS.has(name)) continue

    // files
    if (e.isFile() && ALLOWED_ROOT_FILES.has(name)) continue

    unexpected.push(name)
  }

  if (unexpected.length) {
    const lines = [
      '[guard] ❌ Repo root drift detected:',
      ...unexpected.sort((a, b) => a.localeCompare(b)).map((n) => `  - ${n}`),
      '',
      '[guard] Fix:',
      '- Move files into /scripts, /tools, /docs, /temp, or /projects/*',
      '- Or explicitly allow them in scripts/guards/root.mjs',
    ]
    throw new Error(lines.join('\n'))
  }

  const mirrorReadmePath = path.join(repoRoot, 'mirror', 'README.md')
  if (!existsSync(mirrorReadmePath)) {
    throw new Error(
      [
        '[guard] ❌ mirror/README.md is required',
        '',
        '[guard] Fix:',
        '- Restore mirror/README.md (tracked) and re-run.',
      ].join('\n')
    )
  }

  const rootPackagePath = path.join(repoRoot, 'package.json')
  const rootPackage = JSON.parse(readFileSync(rootPackagePath, 'utf8'))
  if (Object.prototype.hasOwnProperty.call(rootPackage, 'workspaces')) {
    throw new Error(
      [
        '[guard] ❌ Duplicate workspace authority detected in package.json',
        '',
        '[guard] Fix:',
        '- Keep workspace package globs only in pnpm-workspace.yaml.',
        '- Remove package.json#workspaces and re-run.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ Repo root is clean')
}
