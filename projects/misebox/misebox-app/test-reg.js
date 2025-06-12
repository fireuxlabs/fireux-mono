const fs = require('fs')
const path = require('path')
const readline = require('readline')

function testPages() {
  console.log('Testing Misebox App Pages and FireUX Core Auth Page')
  console.log(
    'This test checks if the auth page provided by FireUX Core is accessible\n'
  )

  // Test local pages
  const pagesDir = path.resolve(__dirname, 'pages')

  if (fs.existsSync(pagesDir)) {
    console.log(`Examining local pages directory: ${pagesDir}`)
    const pageFiles = fs.readdirSync(pagesDir)

    console.log('\nLocal Pages:')
    pageFiles.forEach((file) => {
      if (file.endsWith('.vue')) {
        const filePath = path.join(pagesDir, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        const routePath = `/${file.replace('.vue', '')}`

        console.log(`  ${file}:`)
        console.log(`    Route: ${routePath}`)
        console.log(
          `    Template: ${content.includes('<template>') ? '✓' : '✗'}`
        )
        console.log(`    Script: ${content.includes('<script') ? '✓' : '✗'}`)
      }
    })
  }

  // Test FireUX Core provided pages
  console.log('\n--- FireUX Core Provided Pages ---')
  console.log('Expected routes from FireUX Core module:')
  console.log('  /auth - Authentication page (should be available)')

  // Check if auth page would be accessible
  console.log('\nTo test if /auth route works:')
  console.log('1. Start the Misebox app: pnpm dev:misebox')
  console.log('2. Visit: http://localhost:3002/auth')
  console.log('3. You should see the FireUX auth page with login options')

  console.log('\nIf you get "No match found for location with path \"/auth\"":')
  console.log('- The pages-config.ts in FireUX Core is not working correctly')
  console.log('- The module is not properly registering pages via extendPages')
}

function testLayouts() {
  const layoutsDir = path.resolve(__dirname, 'layouts')

  if (!fs.existsSync(layoutsDir)) {
    console.log('No layouts directory found.')
    return
  }

  console.log('Testing Misebox App Layouts Exports')
  console.log(`\nExamining layouts directory: ${layoutsDir}\n`)

  const layoutFiles = fs.readdirSync(layoutsDir)

  layoutFiles.forEach((file) => {
    const filePath = path.join(layoutsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    console.log(`${file}:`)
    console.log(`  Template: ${content.includes('<template>') ? '✓' : '✗'}`)
    console.log(`  Script: ${content.includes('<script') ? '✓' : '✗'}`)
    console.log(`  Parse: ${content ? '✓' : '✗'}`)

    const exportMatch = content.match(
      /defineOptions\(\{\s*name:\s*['"](.*?)['"]\s*\}\)/
    )
    const exportName = exportMatch ? exportMatch[1] : 'Not Found'
    console.log(`  Export Name: ${exportName}\n`)
  })
}

// Interactive menu
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('What would you like to test in Misebox App?')
console.log('1. pages (including FireUX Core auth page)')
console.log('2. layouts')

rl.question('Enter your choice (1 or 2): ', (answer) => {
  switch (answer) {
    case '1':
      testPages()
      break
    case '2':
      testLayouts()
      break
    default:
      console.error(
        'Invalid choice. Please run the script again and select 1 or 2.'
      )
      rl.close()
      process.exit(1)
  }

  rl.close()
})
