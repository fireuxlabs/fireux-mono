import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import readline from 'readline'
import { parse } from '@vue/compiler-sfc'
import http from 'http'

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

function listAssets(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir)
  let assetFiles = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      assetFiles = assetFiles.concat(listAssets(fullPath, baseDir))
    } else if (entry.endsWith('.css') || entry.endsWith('.scss')) {
      const relativePath = fullPath.replace(baseDir + '/', '')
      assetFiles.push({ path: relativePath, fullPath })
    }
  }
  return assetFiles
}

function listPages(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir)
  let pageFiles = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      pageFiles = pageFiles.concat(listPages(fullPath, baseDir))
    } else if (entry.endsWith('.vue')) {
      const relativePath = fullPath.replace(baseDir + '/', '')
      pageFiles.push({ path: relativePath, fullPath })
    }
  }
  return pageFiles
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
      for (const comp of components) {
        const content = fs.readFileSync(comp.fullPath, 'utf-8')
        const hasTemplate = content.includes('<template>')
        const hasScript = content.includes('<script')
        console.log(`\n${comp.path}:`)
        console.log(`  Template: ${hasTemplate ? '✓' : '✗'}`)
        console.log(`  Script: ${hasScript ? '✓' : '✗'}`)

        // Simulate consumption by checking if the component can be imported and used
        try {
          const importedComponent = await import(comp.fullPath)
          console.log(`  Import: ${importedComponent ? '✓' : '✗'}`)
        } catch (error) {
          console.error(`  Import: ✗ - ${error.message}`)
        }
      }
    } else if (type === 'composables') {
      const composablesDir = join(__dirname, 'src/runtime/composables')
      if (!fs.existsSync(composablesDir)) {
        throw new Error('Composable directory not found')
      }
      console.log('Examining composables directory:', composablesDir)

      const composables = listTSFiles(composablesDir)
      console.log('\nDiscovered Composables:')
      for (const comp of composables) {
        const content = fs.readFileSync(comp.fullPath, 'utf-8')
        const hasExport =
          /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|var)/.test(
            content
          )
        console.log(`\n${comp.path}: Export found: ${hasExport ? '✓' : '✗'}`)

        // Simulate consumption by checking if the composable can be imported and used
        try {
          const importedComposable = await import(comp.fullPath)
          console.log(`  Import: ${importedComposable ? '✓' : '✗'}`)
        } catch (error) {
          console.error(`  Import: ✗ - ${error.message}`)
        }
      }
    } else if (type === 'modules') {
      const modulePath = join(__dirname, 'src/module.ts')
      if (!fs.existsSync(modulePath)) {
        throw new Error('Module file not found')
      }
      console.log('Module path:', modulePath)

      // Simulate consumption by checking if the module can be imported and used
      try {
        const importedModule = await import(modulePath)
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

  process.exit(0) // Ensure the script exits automatically after testing
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

// New function to test pages provided by the module
async function testPages() {
  console.log(`Testing FireUX Core Pages Exports\n`)

  try {
    const pagesDir = join(__dirname, 'src/runtime/pages')
    if (!fs.existsSync(pagesDir)) {
      throw new Error('Pages directory not found')
    }
    console.log('Examining pages directory:', pagesDir)

    const pages = listPages(pagesDir)
    console.log('\nAvailable Pages:')
    for (const page of pages) {
      const content = fs.readFileSync(page.fullPath, 'utf-8')
      const hasTemplate = content.includes('<template>')
      const hasScript = content.includes('<script')
      const hasDefinePageMeta = content.includes('definePageMeta')
      console.log(`\n${page.path}:`)
      console.log(`  Template: ${hasTemplate ? '✓' : '✗'}`)
      console.log(`  Script: ${hasScript ? '✓' : '✗'}`)
      console.log(`  Page Meta: ${hasDefinePageMeta ? '✓' : '✗'}`)

      // Extract page route from filename
      const routeName = page.path.replace('.vue', '').replace(/\//g, '-')
      const routePath = `/${page.path.replace('.vue', '')}`
      console.log(`  Route: ${routePath}`)

      // Check if pages config exists
      const pagesConfigPath = join(__dirname, 'src/pages-config.ts')
      if (fs.existsSync(pagesConfigPath)) {
        const configContent = fs.readFileSync(pagesConfigPath, 'utf-8')
        const isConfigured = configContent.includes(page.path)
        console.log(`  Module Config: ${isConfigured ? '✓' : '✗'}`)
      } else {
        console.log(`  Module Config: ✗ - pages-config.ts not found`)
      }

      // Simulate consumption by parsing the page using @vue/compiler-sfc
      try {
        const parsedPage = parse(content)
        console.log(`  Parse: ${parsedPage ? '✓' : '✗'}`)

        // Check if page uses FireUX components
        const usesFireUXComponents = content.includes('Fire')
        console.log(
          `  Uses FireUX Components: ${usesFireUXComponents ? '✓' : '✗'}`
        )
      } catch (error) {
        console.error(`  Parse: ✗ - ${error.message}`)
      }
    }

    // Test pages-config.ts integration
    console.log('\n--- Pages Module Configuration ---')
    const pagesConfigPath = join(__dirname, 'src/pages-config.ts')
    if (fs.existsSync(pagesConfigPath)) {
      const configContent = fs.readFileSync(pagesConfigPath, 'utf-8')
      const hasExtendPages = configContent.includes('extendPages')
      const hasAddTemplate = configContent.includes('addTemplate')
      console.log(`\nPages Config File: ✓`)
      console.log(`  Uses extendPages: ${hasExtendPages ? '✓' : '✗'}`)
      console.log(`  Uses addTemplate: ${hasAddTemplate ? '✓' : '✗'}`)

      // Check if pages are properly configured in module.ts
      const moduleConfigPath = join(__dirname, 'src/module.ts')
      if (fs.existsSync(moduleConfigPath)) {
        const moduleContent = fs.readFileSync(moduleConfigPath, 'utf-8')
        const importsPages = moduleContent.includes('configurePages')
        const callsConfigurePages = moduleContent.includes('configurePages(')
        console.log(`\nModule Integration:`)
        console.log(`  Imports configurePages: ${importsPages ? '✓' : '✗'}`)
        console.log(
          `  Calls configurePages: ${callsConfigurePages ? '✓' : '✗'}`
        )
      }
    } else {
      console.log(`\nPages Config File: ✗ - Not found`)
    }
  } catch (error) {
    console.error('Error testing pages:', error)
    process.exit(1)
  }

  process.exit(0) // Ensure the script exits automatically after testing
}

// New function to test and list registered assets (CSS and SCSS files)
async function testAssetRegistration() {
  console.log(`Testing FireUX Core Asset Registration\n`)

  const assetsDir = join(__dirname, 'src/runtime/assets')
  if (!fs.existsSync(assetsDir)) {
    console.error('Assets directory not found')
    process.exit(1)
  }

  const assets = listAssets(assetsDir).map((asset) => {
    return `/fireux-core/assets/${asset.path}`
  })

  const assetTests = assets.map((asset) => {
    return new Promise((resolve) => {
      const url = `http://localhost:3004${asset}`
      http
        .get(url, (res) => {
          console.log(`Testing asset: ${asset}`)
          console.log(`Status Code: ${res.statusCode}`)
          console.log(`Content-Type: ${res.headers['content-type']}`)

          if (res.statusCode === 200) {
            console.log(`Asset ${asset} is accessible.`)
          } else {
            console.error(`Asset ${asset} is not accessible.`)
          }
          resolve()
        })
        .on('error', (err) => {
          console.error(`Error accessing asset ${asset}: ${err.message}`)
          resolve()
        })
    })
  })

  await Promise.all(assetTests)
  console.log('Asset registration tests completed.')
  process.exit(0) // Ensure the script exits automatically after testing
}

// Add a function to test the `/auth` page registration and accessibility
async function testAuthPage() {
  console.log('Testing `/auth` page registration and accessibility\n')

  try {
    const pagesDir = join(__dirname, 'src/runtime/pages')
    const authPagePath = join(pagesDir, 'auth.vue')

    if (!fs.existsSync(authPagePath)) {
      throw new Error('`/auth` page not found in runtime/pages')
    }

    console.log('`/auth` page exists at:', authPagePath)

    // Simulate route registration and accessibility
    const content = fs.readFileSync(authPagePath, 'utf-8')
    const hasTemplate = content.includes('<template>')
    const hasScript = content.includes('<script')

    console.log(`\n/auth.vue:`)
    console.log(`  Template: ${hasTemplate ? '✓' : '✗'}`)
    console.log(`  Script: ${hasScript ? '✓' : '✗'}`)

    // Check if the page can be resolved via `extendPages`
    const pagesConfigPath = join(__dirname, 'src/pages-config.ts')
    if (!fs.existsSync(pagesConfigPath)) {
      throw new Error('pages-config.ts file not found')
    }

    const pagesConfigContent = fs.readFileSync(pagesConfigPath, 'utf-8')
    const isAuthPageRegistered = pagesConfigContent.includes("path: '/auth'")

    console.log(
      `\n/auth route registration: ${isAuthPageRegistered ? '✓' : '✗'}`
    )

    if (!isAuthPageRegistered) {
      console.error(
        'Error: `/auth` route is not properly registered in pages-config.ts'
      )
      process.exit(1)
    }

    console.log('`/auth` page is properly registered and accessible.')
  } catch (error) {
    console.error('Error testing `/auth` page:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Add a function to test all module pages registration
async function testAllPages() {
  console.log('Testing all module pages registration and accessibility\n')

  try {
    const pagesDir = join(__dirname, 'src/runtime/pages')
    if (!fs.existsSync(pagesDir)) {
      throw new Error('Pages directory not found in runtime/pages')
    }

    console.log('Pages directory exists at:', pagesDir)

    // Define expected pages based on our configuration
    const expectedPages = [
      // Root pages (index page excluded - each app has its own)
      'auth.vue',
      'getting-started.vue',
      'skills.vue',
      'admin/index.vue',
      'admin/blog.vue',
      'admin/products.vue',
      'admin/settings.vue',
      'admin/users.vue',
      'blog/index.vue',
      'blog/[slug].vue',
      'dashboard/index.vue',
      'dashboard/account.vue',
      'dashboard/favorites.vue',
      'dashboard/orders.vue',
      'dashboard/profile.vue',
      'dashboard/subscriptions.vue',
      'design/index.vue',
      'design/atoms/colors.vue',
      'design/atoms/img.vue',
      'design/atoms/tokens.vue',
      'design/atoms/typography.vue',
      'developer/index.vue',
      'developer/skills.vue',
      'developer/technologies.vue',
      'products/index.vue',
      'products/[slug].vue',
    ]

    console.log('\nChecking expected pages:')
    let allPagesFound = true

    for (const pagePath of expectedPages) {
      const fullPath = join(pagesDir, pagePath)
      const exists = fs.existsSync(fullPath)
      console.log(`  ${pagePath}: ${exists ? '✓' : '✗'}`)

      if (!exists) {
        allPagesFound = false
      } else {
        // Check page content
        const content = fs.readFileSync(fullPath, 'utf-8')
        const hasTemplate = content.includes('<template>')
        const hasScript = content.includes('<script')
        console.log(`    Template: ${hasTemplate ? '✓' : '✗'}`)
        console.log(`    Script: ${hasScript ? '✓' : '✗'}`)
      }
    }

    // Check if pages-config.ts properly registers all pages
    const pagesConfigPath = join(__dirname, 'src/pages-config.ts')
    if (!fs.existsSync(pagesConfigPath)) {
      throw new Error('pages-config.ts file not found')
    }

    const pagesConfigContent = fs.readFileSync(pagesConfigPath, 'utf-8')
    const hasModulePages = pagesConfigContent.includes('modulePages')
    const hasExtendPages = pagesConfigContent.includes('extendPages')

    console.log(`\nPages configuration:`)
    console.log(`  Module pages array: ${hasModulePages ? '✓' : '✗'}`)
    console.log(`  ExtendPages usage: ${hasExtendPages ? '✓' : '✗'}`)

    if (!allPagesFound) {
      console.error('Error: Some expected pages are missing')
      process.exit(1)
    }

    console.log('\nAll module pages are properly registered and accessible.')
  } catch (error) {
    console.error('Error testing all pages:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Test endpoints registration and functionality
async function testEndpoints() {
  console.log('Testing FireUX Core API Endpoints\n')

  try {
    // Check if server-config.ts exists and has endpoint registrations
    const serverConfigPath = join(__dirname, 'src/server-config.ts')
    if (!fs.existsSync(serverConfigPath)) {
      throw new Error('server-config.ts file not found')
    }

    console.log('Examining server configuration:', serverConfigPath)

    const serverConfigContent = fs.readFileSync(serverConfigPath, 'utf-8')

    // Look for addServerHandler calls
    const handlerMatches = serverConfigContent.match(
      /addServerHandler\s*\(\s*{[^}]*}/g
    )

    if (!handlerMatches) {
      console.log('No server handlers found in configuration.')
      return
    }

    console.log(`\nFound ${handlerMatches.length} registered endpoints:\n`)

    // Parse each handler registration
    handlerMatches.forEach((handler, index) => {
      const routeMatch = handler.match(/route:\s*['"`]([^'"`]+)['"`]/)
      const handlerMatch = handler.match(/handler:\s*[^,}]+/)
      const methodMatch = handler.match(/method:\s*['"`]([^'"`]+)['"`]/)

      if (routeMatch) {
        const route = routeMatch[1]
        const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET'
        console.log(`${index + 1}. ${method} ${route}`)

        if (handlerMatch) {
          const handlerPath = handlerMatch[0]
            .replace(/handler:\s*/, '')
            .replace(/resolvePath\(['"`]/, '')
            .replace(/['"`]\)/, '')
          console.log(`   Handler: ${handlerPath}`)
        }
      }
    })

    // Check if actual endpoint files exist
    console.log('\nVerifying endpoint files exist:\n')

    const apiDir = join(__dirname, 'src/runtime/server/api')
    if (fs.existsSync(apiDir)) {
      const checkEndpointFile = (relativePath) => {
        const fullPath = join(apiDir, relativePath)
        const exists = fs.existsSync(fullPath)
        console.log(`   ${relativePath}: ${exists ? '✓' : '✗'}`)
        return exists
      }

      // Check common endpoints based on server-config.ts
      checkEndpointFile('env-check.ts')
      checkEndpointFile('app/theme.get.ts')
      checkEndpointFile('proxy/google-avatar.ts')
      checkEndpointFile('stripe/create-product.post.ts')

      // List all API files
      console.log('\nAll API files in directory:')
      const listApiFiles = (dir, prefix = '') => {
        const items = fs.readdirSync(dir)
        items.forEach((item) => {
          const itemPath = join(dir, item)
          const stat = fs.statSync(itemPath)
          if (stat.isDirectory()) {
            console.log(`   ${prefix}${item}/`)
            listApiFiles(itemPath, prefix + '  ')
          } else if (item.endsWith('.ts') || item.endsWith('.js')) {
            console.log(`   ${prefix}${item}`)
          }
        })
      }
      listApiFiles(apiDir)
    } else {
      console.log('   API directory not found')
    }

    console.log('\nEndpoint registration test completed.')
  } catch (error) {
    console.error('Error testing endpoints:', error)
    process.exit(1)
  }

  process.exit(0)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('What registration would you like to see today?')
console.log('1. pages')
console.log('2. components')
console.log('3. modules')
console.log('4. composables')
console.log('5. layouts')
console.log('6. asset registration')
console.log('7. endpoints')

rl.question('Enter your choice (1, 2, 3, 4, 5, 6, or 7): ', (answer) => {
  let type
  switch (answer) {
    case '1':
      testPages()
      return
    case '2':
      type = 'components'
      break
    case '3':
      type = 'modules'
      break
    case '4':
      type = 'composables'
      break
    case '5':
      testLayouts()
      return
    case '6':
      testAssetRegistration()
      return
    case '7':
      testEndpoints()
      return
    default:
      console.error(
        'Invalid choice. Please run the script again and select 1, 2, 3, 4, 5, 6, or 7.'
      )
      rl.close()
      process.exit(1)
  }

  rl.close()
  testModuleExports(type)
})

// Add the testAuthPage function to the script execution
const type = process.argv[2]
if (type === 'auth') {
  testAuthPage()
}

// Add the testAllPages function to the script execution
const testType = process.argv[2]
if (testType === 'all-pages') {
  testAllPages()
}

// Add the testEndpoints function to the script execution
const endpointTestType = process.argv[2]
if (endpointTestType === 'endpoints') {
  testEndpoints()
}
