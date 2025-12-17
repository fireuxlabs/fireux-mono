// FILE: scripts/guards/root.mjs
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ALLOWED_ROOT_DIRS = new Set([
  // VCS / tooling
  '.git',
  '.github',
  '.vscode',
  '.specify', // Specify is a DIRECTORY, not a dotfile

  // Documentation & external assets
  'docs',
  'figma-export', // external design-system export (explicitly allowed)

  // Core repo structure
  'packages',
  'projects',
  'scripts', // guard / clean / gitsave live here
  'templates',
  'tools',
  'types',
  'temp',

  // Local-only (ignored, but tolerated)
  'node_modules',
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
  '.npmrc',
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

    // dotfiles (FILES only)
    if (!isDirentDirectory(repoRoot, e) && ALLOWED_ROOT_DOTFILES.has(name)) continue

    // directories (including symlink-to-dir)
    if (isDirentDirectory(repoRoot, e) && ALLOWED_ROOT_DIRS.has(name)) continue

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

  console.log('[guard] ✅ Repo root is clean')
}