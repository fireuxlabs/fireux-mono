#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// Opinionated app shape (level-one only)
const REQUIRED = new Set([
  '.env',
  '.gitignore',
  '.firebase',
  '.firebaserc',
  'firebase.json',
  '.nuxt', // generated; presence not required, but allowed
  'app',
  'public',
  'nuxt.config.ts',
  'package.json',
  'tsconfig.json',
])

const OPTIONAL_GENERATED = new Set(['.nuxt']) // allowed but not required
const FORBIDDEN = new Set([
  'server',
  'types',
  'scripts',
  'docs',
  '.data',
  'content.config.ts',
])

// Options
// README.md is allowed by default. Use --no-readme or DISALLOW_APP_README=1 to disallow.
const allowReadme =
  !process.argv.includes('--no-readme') &&
  process.env.DISALLOW_APP_README !== '1'

// Consider any directory under projects/*/* that has both package.json and nuxt.config.ts an "app"
function findApps() {
  const projectsDir = path.join(ROOT, 'projects')
  if (!fs.existsSync(projectsDir)) return []
  const ecosystems = fs
    .readdirSync(projectsDir)
    .map((n) => path.join(projectsDir, n))
    .filter((p) => fs.statSync(p).isDirectory())

  const apps = []
  for (const eco of ecosystems) {
    for (const entry of fs.readdirSync(eco)) {
      const appDir = path.join(eco, entry)
      if (!fs.statSync(appDir).isDirectory()) continue
      const hasPkg = fs.existsSync(path.join(appDir, 'package.json'))
      const hasNuxt = fs.existsSync(path.join(appDir, 'nuxt.config.ts'))
      if (hasPkg && hasNuxt) apps.push(appDir)
    }
  }
  return apps
}

function checkApp(appDir) {
  const entries = new Set(fs.readdirSync(appDir))
  const errors = []

  // Missing required (except .nuxt which is generated)
  for (const req of REQUIRED) {
    if (req === '.nuxt') continue // generated; don't require
    if (!entries.has(req)) errors.push(`Missing required: ${req}`)
  }

  // Forbidden entries
  for (const forb of FORBIDDEN) {
    if (entries.has(forb)) errors.push(`Forbidden present: ${forb}`)
  }

  // Unknown extras (not strictly forbidden but outside our shape)
  const allowed = new Set([...REQUIRED, ...OPTIONAL_GENERATED])
  const extras = [...entries].filter((name) => !allowed.has(name))
  for (const x of extras) {
    // allow node_modules and .nuxt obviously; already whitelisted .nuxt
    if (x === 'node_modules') continue
    // allow .gitkeep if someone left it
    if (x === '.gitkeep') continue
    // allow TS incremental build artifacts
    if (x.endsWith('.tsbuildinfo')) continue
    // optionally allow README.md per policy toggle
    if (allowReadme && x.toLowerCase() === 'readme.md') continue
    errors.push(`Unexpected top-level entry: ${x}`)
  }

  return errors
}

const apps = findApps()
if (apps.length === 0) {
  console.log(
    'No apps discovered under projects/*/* (need package.json + nuxt.config.ts).'
  )
  process.exit(0)
}

let totalErrors = 0
for (const appDir of apps) {
  const rel = path.relative(ROOT, appDir)
  const errs = checkApp(appDir)
  if (errs.length) {
    totalErrors += errs.length
    console.error(`\n✖ App shape violations in ${rel}`)
    for (const e of errs) console.error(`  • ${e}`)
    // Helpful suggestion
    console.error(
      `  → Expected only: ${[...REQUIRED].filter((x) => x !== '.nuxt').join(', ')} (+ .nuxt, node_modules allowed${allowReadme ? ', README.md allowed' : ''})`
    )
    console.error(
      `  → Fix:\n    - Create missing: touch the missing files/dirs (see messages above)\n    - Remove forbidden: delete listed entries (server, types, scripts, docs, .data, content.config.ts)\n    - Remove unexpected extras (or run with --allow-readme to permit README.md)`
    )
  } else {
    console.log(`✓ ${rel} — OK`)
  }
}

if (totalErrors > 0) {
  console.error(`\nFound ${totalErrors} app shape issue(s).`)
  process.exit(1)
} else {
  console.log('\nAll apps match the opinionated shape.')
}
