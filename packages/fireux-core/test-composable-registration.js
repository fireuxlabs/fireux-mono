import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

// Get the module directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function listTSFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir)
  let tsFiles = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      tsFiles = tsFiles.concat(listTSFiles(fullPath, baseDir))
    } else if (entry.endsWith('.ts')) {
      const relativePath = fullPath.replace(baseDir + '/', '')
      tsFiles.push({ path: relativePath, fullPath })
    }
  }
  return tsFiles
}

console.log('Testing FireUX Core Composable Registration Exports\n')

// Check composables directory
const composablesDir = join(__dirname, 'src/runtime/composables')
if (!fs.existsSync(composablesDir)) {
  console.error('Composable directory not found:', composablesDir)
  process.exit(1)
}
console.log('Examining composables directory:', composablesDir)

const composables = listTSFiles(composablesDir)
console.log('\nDiscovered Composables:')
composables.forEach((comp) => {
  const content = fs.readFileSync(comp.fullPath, 'utf-8')
  // Detect various export statements including async and default functions
  const hasExport =
    /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|var)/.test(
      content
    )
  console.log(`\n${comp.path}: Export found: ${hasExport ? '✓' : '✗'}`)
})

// Check package.json exports
const pkg = JSON.parse(
  fs.readFileSync(join(__dirname, 'package.json'), 'utf-8')
)
console.log('\nPackage.json Exports for composables:')
console.log(pkg.exports['./composables/*'])

// Summary
console.log('\nSummary:')
console.log(`Total Composables: ${composables.length}`)
const categories = new Set(composables.map((c) => c.path.split('/')[0]))
categories.forEach((cat) => {
  const count = composables.filter((c) => c.path.startsWith(cat + '/')).length
  console.log(`  ${cat}: ${count} items`)
})
