#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function findCoreRoot() {
  // Start from packages/scripts and go up to find fireux-core
  const baseDir = resolve(__dirname, '..', 'core', 'fireux-core')
  return existsSync(baseDir) ? baseDir : null
}

function scanExports() {
  const coreRoot = findCoreRoot()
  if (!coreRoot) {
    console.error('Could not find fireux-core package')
    return { error: 'fireux-core not found' }
  }

  // Check module.ts and runtime/index.ts
  const moduleFile = resolve(coreRoot, 'src', 'module.ts')
  const runtimeFile = resolve(coreRoot, 'src', 'runtime', 'index.ts')

  const results = {
    packageRoot: coreRoot,
    moduleFile: existsSync(moduleFile) ? 'found' : 'missing',
    runtimeFile: existsSync(runtimeFile) ? 'found' : 'missing',
    configFunctions: [],
    runtimeExports: [],
  }

  // Parse module.ts for config functions
  if (existsSync(moduleFile)) {
    const moduleContent = readFileSync(moduleFile, 'utf8')

    // Find configure* function calls
    const configMatches = moduleContent.match(/configure\w+\([^)]+\)/g) || []
    results.configFunctions = configMatches

    // Find config imports
    const importMatches =
      moduleContent.match(
        /import\s+\{[^}]+\}\s+from\s+['"]\.[^'"]+config['"]/g
      ) || []
    results.configImports = importMatches
  }

  // Parse runtime/index.ts for exports
  if (existsSync(runtimeFile)) {
    const runtimeContent = readFileSync(runtimeFile, 'utf8')

    // Find export statements
    const exportMatches =
      runtimeContent.match(/export\s+\{[^}]+\}\s+from\s+[^'\n]+/g) || []
    results.runtimeExports = exportMatches
  }

  return results
}

// Main execution
const isJson = process.argv.includes('--json')
const results = scanExports()

if (isJson) {
  console.log(JSON.stringify(results, null, 2))
} else {
  console.log('🔥 FireUX Core Package Scanner')
  console.log('================================')
  console.log(`Package Root: ${results.packageRoot || 'NOT FOUND'}`)
  console.log(`Module File: ${results.moduleFile}`)
  console.log(`Runtime File: ${results.runtimeFile}`)

  if (results.configFunctions?.length) {
    console.log('\n📦 Config Functions Found:')
    results.configFunctions.forEach((func) => console.log(`  - ${func}`))
  }

  if (results.configImports?.length) {
    console.log('\n📥 Config Imports Found:')
    results.configImports.forEach((imp) => console.log(`  - ${imp}`))
  }

  if (results.runtimeExports?.length) {
    console.log('\n🚀 Runtime Exports Found:')
    results.runtimeExports.forEach((exp) => console.log(`  - ${exp}`))
  }

  if (results.error) {
    console.log(`\n❌ Error: ${results.error}`)
  }
}
