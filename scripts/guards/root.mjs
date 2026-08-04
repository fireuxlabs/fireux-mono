// @fireux-script
// last_used: 2026-08-04
// usage_note: enforces the portable root and sole pnpm workspace authority.
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

const RETIRED_AGGREGATE_TSCONFIGS = [
  'packages/tsconfig.json',
  'packages/core/tsconfig.json',
  'packages/ecosystem/tsconfig.json',
  'packages/extensions/tsconfig.json',
  'projects/tsconfig.json',
]

function assertWorkspacePolicy(repoRoot) {
  const workspace = readFileSync(
    path.join(repoRoot, 'pnpm-workspace.yaml'),
    'utf8'
  )
  const allowBuilds = workspace.match(
    /(?:^|\n)allowBuilds:\n((?: {2}[^\n]+\n?)*)/
  )?.[1]

  if (!allowBuilds) {
    throw new Error('[guard] ❌ pnpm workspace must declare allowBuilds.')
  }

  const invalidApprovals = allowBuilds
    .trimEnd()
    .split('\n')
    .filter(Boolean)
    .filter((line) => !/: (?:true|false)$/.test(line))

  if (invalidApprovals.length) {
    throw new Error(
      [
        '[guard] ❌ pnpm allowBuilds values must be explicit booleans:',
        ...invalidApprovals.map((line) => `  - ${line.trim()}`),
      ].join('\n')
    )
  }

  const retired = RETIRED_AGGREGATE_TSCONFIGS.filter((file) =>
    existsSync(path.join(repoRoot, file))
  )
  if (retired.length) {
    throw new Error(
      [
        '[guard] ❌ Hand-maintained aggregate TypeScript configs are retired:',
        ...retired.map((file) => `  - ${file}`),
        '',
        'Use package leaf configs and projects/tsconfig.projects.json.',
      ].join('\n')
    )
  }
}

function assertWorkspaceTypeScriptPaths(repoRoot) {
  const tsconfig = JSON.parse(
    readFileSync(path.join(repoRoot, 'tsconfig.base.json'), 'utf8')
  )
  const paths = tsconfig.compilerOptions?.paths || {}
  const violations = []

  for (const family of ['core', 'ecosystem', 'extensions']) {
    const familyRoot = path.join(repoRoot, 'packages', family)
    for (const entry of readdirSync(familyRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const manifestPath = path.join(familyRoot, entry.name, 'package.json')
      if (!existsSync(manifestPath)) continue
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      const name = String(manifest.name || '').trim()
      if (!name) continue

      const sourceRoot = `./packages/${family}/${entry.name}/src`
      const expected = {
        [name]: [`${sourceRoot}/module.ts`],
        [`${name}/*`]: [`${sourceRoot}/*`],
        [`${name}/runtime/*`]: [`${sourceRoot}/runtime/*`],
      }

      for (const [alias, targets] of Object.entries(expected)) {
        if (JSON.stringify(paths[alias]) !== JSON.stringify(targets)) {
          violations.push(`${alias} -> ${targets.join(', ')}`)
        }
      }
    }
  }

  const legacyAliases = Object.keys(paths).filter(
    (alias) =>
      alias.startsWith('@fireux-') ||
      ['@/*', '~/*', '@@/*', '~~/*'].includes(alias)
  )

  if (violations.length || legacyAliases.length) {
    throw new Error(
      [
        '[guard] ❌ Workspace TypeScript path authority drift:',
        ...violations.map((entry) => `  Missing or incorrect: ${entry}`),
        ...legacyAliases.map((entry) => `  Retired root alias: ${entry}`),
        '',
        'Every package has name, wildcard, and runtime aliases; App-local aliases belong in the App tsconfig.',
      ].join('\n')
    )
  }
}

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
  assertWorkspacePolicy(repoRoot)
  assertWorkspaceTypeScriptPaths(repoRoot)
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

  const expectedScripts = {
    guard: 'node scripts/guard.mjs',
    'typecheck:packages': "pnpm -r --filter './packages/*/*' exec tsc --noEmit",
  }
  for (const [name, command] of Object.entries(expectedScripts)) {
    if (rootPackage.scripts?.[name] !== command) {
      throw new Error(
        `[guard] Root script ${name} must remain the canonical command: ${command}`
      )
    }
  }

  for (const alias of [
    'guard:shape',
    'guard:slug',
    'guard:slug:report',
    'guard:ts',
    'tsc:check',
  ]) {
    if (
      Object.prototype.hasOwnProperty.call(rootPackage.scripts || {}, alias)
    ) {
      throw new Error(
        `[guard] Root command alias ${alias} is forbidden; call the canonical command directly.`
      )
    }
  }

  console.log('[guard] ✅ Repo root is clean')
}
