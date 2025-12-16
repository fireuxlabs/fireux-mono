#!/usr/bin/env node
// guard/guard.mjs
// FireUX Guard System
// Purpose: enforce repo-wide invariants and prevent configuration drift.

import { readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()

/* ---------------------------------------------------------
 * ROOT GUARD
 * Nothing new is allowed in the monorepo root unless explicit.
 * --------------------------------------------------------- */

const ALLOWED_ROOT = new Set([
  // Hidden / dotfiles that are expected to exist
  '.copilotignore',
  '.editorconfig',
  '.git',
  '.gitignore',
  '.github',
  '.npmrc',
  '.prettierignore',
  '.prettierrc',
  '.specify',
  '.vscode',

  // Repo root files/folders
  'AGENTS.md',
  'README.md',
  'copilot-documentation',
  'docs',
  'documentation-markdown-inventory.csv',
  'eslint.config.js',
  'figma-export',
  'fireux-deploy-ignore',
  'gitsave.sh',
  'guard',
  'md-files.zip',
  'node_modules',
  'package.json',
  'packages',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'projects',
  'temp',
  'templates',
  'tools',
  'tsconfig.base.json',
  'tsconfig.json',
  'tsconfig.tsbuildinfo',
  'types',
])

function checkRoot() {
  const entries = readdirSync(repoRoot, { withFileTypes: true }).map((d) => d.name)

  const unexpected = entries.filter((name) => {
    if (ALLOWED_ROOT.has(name)) return false
    // be strict about everything else
    return true
  })

  if (unexpected.length) {
    console.error('\n[guard] ❌ Repo root drift detected:\n')
    for (const name of unexpected.sort((a, b) => a.localeCompare(b))) {
      console.error(`  - ${name}`)
    }

    console.error(`\n[guard] Fix:\n- Move files into /temp, /tools, /docs, or /projects/*\n- Or explicitly add them to the guard allowlist\n\n[guard] Root must remain boring.\n`)
    process.exit(1)
  }

  console.log('[guard] ✅ Repo root is clean')
}

/* ---------------------------------------------------------
 * EXECUTION
 * --------------------------------------------------------- */

checkRoot()

// Future additions live here:
// - checkEnvFiles()
// - checkEcosystemConfigs()
// - checkAppConfigs()
