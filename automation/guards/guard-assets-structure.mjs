#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const APPS_GLOB_ROOT = path.join(ROOT, 'projects')
const CORE_DEFAULT = path.join(
  ROOT,
  'packages/core/fireux-core/src/runtime/public/img/core/defaults/default-image.png'
)

const args = process.argv.slice(2)
const FIX = args.includes('--fix')

function findApps() {
  if (!fs.existsSync(APPS_GLOB_ROOT)) return []
  const ecosystems = fs
    .readdirSync(APPS_GLOB_ROOT)
    .map((n) => path.join(APPS_GLOB_ROOT, n))
    .filter((p) => fs.statSync(p).isDirectory())

  const apps = []
  for (const eco of ecosystems) {
    for (const entry of fs.readdirSync(eco)) {
      const appDir = path.join(eco, entry)
      if (!fs.statSync(appDir).isDirectory()) continue
      const hasPkg = fs.existsSync(path.join(appDir, 'package.json'))
      const hasNuxt = fs.existsSync(path.join(appDir, 'nuxt.config.ts'))
      const hasPublic = fs.existsSync(path.join(appDir, 'public'))
      if (hasPkg && hasNuxt && hasPublic) apps.push(appDir)
    }
  }
  return apps
}

function rmIfExists(file) {
  if (fs.existsSync(file)) {
    if (FIX) {
      fs.rmSync(file)
      console.log(`🧹 removed ${path.relative(ROOT, file)}`)
      return true
    } else {
      console.warn(
        `⚠️  found deprecated asset: ${path.relative(
          ROOT,
          file
        )} (run with --fix to remove)`
      )
    }
  }
  return false
}

function main() {
  let errors = 0

  // Ensure core default exists
  if (!fs.existsSync(CORE_DEFAULT)) {
    console.error(
      `✖ core default image missing at ${path.relative(ROOT, CORE_DEFAULT)}`
    )
    errors++
  }

  const apps = findApps()
  for (const app of apps) {
    const imgDir = path.join(app, 'public/img')
    const relApp = path.relative(ROOT, app)
    if (!fs.existsSync(imgDir)) continue

    // Remove deprecated default-avatar.*
    for (const name of [
      'default-avatar.png',
      'default-avatar.jpg',
      'default-avatar.jpeg',
      'default-avatar.svg',
    ]) {
      const file = path.join(imgDir, name)
      if (fs.existsSync(file)) {
        const deleted = rmIfExists(file)
        if (!deleted && !FIX) errors++
      }
    }

    // Remove per-app default-image.png (we use core default now)
    const perAppDefault = path.join(imgDir, 'default-image.png')
    if (fs.existsSync(perAppDefault)) {
      const deleted = rmIfExists(perAppDefault)
      if (!deleted && !FIX) errors++
    }

    // Check favicon exists
    const favicon = path.join(app, 'public/favicon.ico')
    if (!fs.existsSync(favicon)) {
      console.warn(`⚠️  ${relApp} is missing public/favicon.ico`)
      // don't count as error for now
    }
  }

  if (errors > 0 && !FIX) {
    console.error(
      `\nFound ${errors} asset issue(s). Re-run with --fix to auto-remove deprecated files.`
    )
    process.exit(1)
  } else {
    console.log('\nAsset structure looks good.')
  }
}

main()
