import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

// Get the module directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function testModuleExports() {
  console.log('Testing FireUX Core Module Exports\n')

  // Try to resolve the module itself
  try {
    const modulePath = join(__dirname, 'src/module.ts')
    console.log(`Module path: ${modulePath}`)

    if (!fs.existsSync(modulePath)) {
      throw new Error('Module file not found')
    }

    // Check what's actually exposed in the runtime/components directory
    const componentsDir = join(__dirname, 'src/runtime/components')
    console.log(`\nExamining components directory: ${componentsDir}`)

    // Recursively list all .vue files
    function listVueFiles(dir, baseDir = dir) {
      const files = fs.readdirSync(dir)
      let vueFiles = []

      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          vueFiles = vueFiles.concat(listVueFiles(fullPath, baseDir))
        } else if (file.endsWith('.vue')) {
          // Get relative path from components directory
          const relativePath = fullPath.replace(baseDir + '/', '')
          vueFiles.push({
            path: relativePath,
            fullPath: fullPath,
          })
        }
      }

      return vueFiles
    }

    const components = listVueFiles(componentsDir)
    console.log('\nAvailable Components:')
    components.forEach((comp) => {
      // Read the component file to check its structure
      const content = fs.readFileSync(comp.fullPath, 'utf-8')
      const hasTemplate = content.includes('<template>')
      const hasScript = content.includes('<script')
      const hasSetup = content.includes('setup>')
      const hasComposables = content.includes('composables')

      console.log(`\n${comp.path}:`)
      console.log(`  Template: ${hasTemplate ? '✓' : '✗'}`)
      console.log(`  Script: ${hasScript ? '✓' : '✗'}`)
      console.log(`  Setup: ${hasSetup ? '✓' : '✗'}`)
      console.log(`  Uses Composables: ${hasComposables ? '✓' : '✗'}`)
    })

    // Check package.json exports
    const pkgPath = join(__dirname, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

    console.log('\nPackage Exports:')
    console.log(JSON.stringify(pkg.exports, null, 2))

    // Summary
    console.log('\nSummary:')
    console.log(`Total Components: ${components.length}`)
    console.log('Component Categories:')
    const categories = new Set(components.map((c) => c.path.split('/')[0]))
    categories.forEach((category) => {
      const count = components.filter((c) =>
        c.path.startsWith(category + '/')
      ).length
      console.log(`  ${category}: ${count} components`)
    })
  } catch (error) {
    console.error('Error testing module:', error)
    process.exit(1)
  }
}

testModuleExports()
