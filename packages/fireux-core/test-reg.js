import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import readline from 'readline'

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
      })
    } else if (type === 'modules') {
      const modulePath = join(__dirname, 'src/module.ts')
      if (!fs.existsSync(modulePath)) {
        throw new Error('Module file not found')
      }
      console.log('Module path:', modulePath)
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('What registration would you like to see today?')
console.log('1. components')
console.log('2. modules')
console.log('3. composables')

rl.question('Enter your choice (1, 2, or 3): ', (answer) => {
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
    default:
      console.error(
        'Invalid choice. Please run the script again and select 1, 2, or 3.'
      )
      rl.close()
      process.exit(1)
  }

  rl.close()
  testModuleExports(type)
})
