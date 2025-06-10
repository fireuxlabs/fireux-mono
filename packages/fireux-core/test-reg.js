import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import readline from 'readline'
import { parse } from '@vue/compiler-sfc'

// Get the module directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function listVueFiles(dir, baseDir = dir) {
  const files = fs.readdirSync(dir)
  let vueFiles = []

  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      vueFiles = vueFiles.concat(listVueFiles(fullPath, baseDir))
    } else if (file.endsWith('.vue')) {
      const relativePath = fullPath.replace(baseDir + '/', '')
      vueFiles.push({ path: relativePath, fullPath })
    }
  }

  return vueFiles
}

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

function listLayouts(dir, baseDir = dir) {
  const files = fs.readdirSync(dir)
  let layoutFiles = []

  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      layoutFiles = layoutFiles.concat(listLayouts(fullPath, baseDir))
    } else if (file.endsWith('.vue')) {
      const relativePath = fullPath.replace(baseDir + '/', '')
      layoutFiles.push({ path: relativePath, fullPath })
    }
  }

  return layoutFiles
}

// The purpose of this script is to test the actual registration and consumption of components, composables, modules, and layouts as if they were being used in a Nuxt application.
// It should simulate real-world usage and verify that the exports are functional and accessible.

// Update the testModuleExports function to ensure it tests actual registration and consumption.
async function testModuleExports(type) {
  console.log(`Testing FireUX Core ${type} Exports\n`)

  try {
    if (type === 'components') {
      const componentsDir = join(__dirname, 'src/runtime/components')
      if (!fs.existsSync(componentsDir)) {
        throw new Error('Components directory not found')
      }
      console.log('Examining components directory:', componentsDir)

      const components = listVueFiles(componentsDir)
      console.log('\nAvailable Components:')
      components.forEach((comp) => {
        const content = fs.readFileSync(comp.fullPath, 'utf-8')
        const hasTemplate = content.includes('<template>')
        const hasScript = content.includes('<script')
        console.log(`\n${comp.path}:`)
        console.log(`  Template: ${hasTemplate ? '✓' : '✗'}`)
        console.log(`  Script: ${hasScript ? '✓' : '✗'}`)

        // Simulate consumption by checking if the component can be imported and used
        try {
          const importedComponent = require(comp.fullPath)
          console.log(`  Import: ${importedComponent ? '✓' : '✗'}`)
        } catch (error) {
          console.error(`  Import: ✗ - ${error.message}`)
        }
      })
    } else if (type === 'composables') {
      const composablesDir = join(__dirname, 'src/runtime/composables')
      if (!fs.existsSync(composablesDir)) {
        throw new Error('Composable directory not found')
      }
      console.log('Examining composables directory:', composablesDir)

      const composables = listTSFiles(composablesDir)
      console.log('\nDiscovered Composables:')
      composables.forEach((comp) => {
        const content = fs.readFileSync(comp.fullPath, 'utf-8')
        const hasExport =
          /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|var)/.test(
            content
          )
        console.log(`\n${comp.path}: Export found: ${hasExport ? '✓' : '✗'}`)

        // Simulate consumption by checking if the composable can be imported and used
        try {
          const importedComposable = require(comp.fullPath)
          console.log(`  Import: ${importedComposable ? '✓' : '✗'}`)
        } catch (error) {
          console.error(`  Import: ✗ - ${error.message}`)
        }
      })
    } else if (type === 'modules') {
      const modulePath = join(__dirname, 'src/module.ts')
      if (!fs.existsSync(modulePath)) {
        throw new Error('Module file not found')
      }
      console.log('Module path:', modulePath)

      // Simulate consumption by checking if the module can be imported and used
      try {
        const importedModule = require(modulePath)
        console.log(`  Import: ${importedModule ? '✓' : '✗'}`)
      } catch (error) {
        console.error(`  Import: ✗ - ${error.message}`)
      }
    } else if (type === 'nuxtui') {
      console.log('Checking @nuxt/ui integration...')

      // Check if @nuxt/ui is included in the build transpile
      const nuxtConfigPath = join(__dirname, 'src/module.ts')
      if (!fs.existsSync(nuxtConfigPath)) {
        throw new Error('module.ts file not found')
      }

      const moduleContent = fs.readFileSync(nuxtConfigPath, 'utf-8')
      const isNuxtUITranspiled = moduleContent.includes(
        "nuxt.options.build.transpile.push('@nuxt/ui')"
      )
      const isNuxtUICSSIncluded = moduleContent.includes(
        "nuxt.options.css.push('@nuxt/ui/styles')"
      )

      console.log(`@nuxt/ui transpile: ${isNuxtUITranspiled ? '✓' : '✗'}`)
      console.log(`@nuxt/ui styles: ${isNuxtUICSSIncluded ? '✓' : '✗'}`)

      if (!isNuxtUITranspiled || !isNuxtUICSSIncluded) {
        console.error('Error: @nuxt/ui is not properly integrated in module.ts')
        process.exit(1)
      }

      console.log('@nuxt/ui is properly integrated.')
    } else {
      throw new Error(
        'Invalid type specified. Use components, composables, or modules.'
      )
    }
  } catch (error) {
    console.error('Error testing module:', error)
    process.exit(1)
  }
}

// Update the testLayouts function to ensure it uses dynamic imports and exits automatically.
async function testLayouts() {
  console.log(`Testing FireUX Core Layouts Exports\n`)

  try {
    const layoutsDir = join(__dirname, 'src/runtime/layouts')
    if (!fs.existsSync(layoutsDir)) {
      throw new Error('Layouts directory not found')
    }
    console.log('Examining layouts directory:', layoutsDir)

    const layouts = listLayouts(layoutsDir)
    console.log('\nAvailable Layouts:')
    for (const layout of layouts) {
      const content = fs.readFileSync(layout.fullPath, 'utf-8')
      const hasTemplate = content.includes('<template>')
      const hasScript = content.includes('<script')
      console.log(`\n${layout.path}:`)
      console.log(`  Template: ${hasTemplate ? '✓' : '✗'}`)
      console.log(`  Script: ${hasScript ? '✓' : '✗'}`)

      // Simulate consumption by parsing the layout using @vue/compiler-sfc
      try {
        const parsedLayout = parse(content)
        const exportName =
          parsedLayout.descriptor.scriptSetup?.content.match(
            /name:\s+'(.*?)'/
          )?.[1] ||
          parsedLayout.descriptor.script?.content.match(/name:\s+'(.*?)'/)?.[1]
        console.log(`  Parse: ${parsedLayout ? '✓' : '✗'}`)
        console.log(`  Export Name: ${exportName || 'Not Found'}`)
      } catch (error) {
        console.error(`  Parse: ✗ - ${error.message}`)
      }
    }
  } catch (error) {
    console.error('Error testing layouts:', error)
    process.exit(1)
  }

  process.exit(0) // Ensure the script exits automatically after testing
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('What registration would you like to see today?')
console.log('1. components')
console.log('2. modules')
console.log('3. composables')
console.log('4. layouts')

rl.question('Enter your choice (1, 2, 3, or 4): ', (answer) => {
  let type
  switch (answer) {
    case '1':
      type = 'components'
      break
    case '2':
      type = 'modules'
      break
    case '3':
      type = 'composables'
      break
    case '4':
      testLayouts()
      return
    default:
      console.error(
        'Invalid choice. Please run the script again and select 1, 2, 3, or 4.'
      )
      rl.close()
      process.exit(1)
  }

  rl.close()
  testModuleExports(type)
})
